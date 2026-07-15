from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from database import get_db, User
from services.search_service import SearchService
from services.llm_service import LLMService
from services.tracking_service import TrackingService
from services.rag_service import RAGService

# Importar dados faker mock (gerados na inicialização)
from faker_mock import USUARIOS_MOCK, INTERACOES

# Create a lookup dict for user names
USER_NAME_LOOKUP = {u["id"]: u["name"] for u in USUARIOS_MOCK}

# Lista em memória para simular o banco de dados de agendamentos
AGENDAMENTOS_MOCK = [
    {
        "topic": "Conceitos Básicos de RAG e Embeddings",
        "dateTime": "2026-07-15T14:00",
        "durationHours": 2,
        "status": "Confirmado"
    }
]


router = APIRouter()

# ---- Models ----
class ConfigModel(BaseModel):
    topic: str
    knowledgeLevel: str
    dailyHours: int = 2
    deadline: str
    sources: List[str]
    user_id: int = 1

class QuizAnswer(BaseModel):
    lesson_id: int
    answers: List[int]  # índices das opções escolhidas

class CompletionQuiz(BaseModel):
    topic: str
    user_id: int = 1

class CompletionAnswer(BaseModel):
    topic: str
    user_id: int = 1
    selected: int  # índice da alternativa escolhida

class ChatRequest(BaseModel):
    topic: str
    links: List[str]
    question: str
    user_id: int = 1

class SummaryRequest(BaseModel):
    topic: str
    links: List[str]
    user_id: int = 1

# Novo modelo para o agendamento de estudos
class ScheduleModel(BaseModel):
    topic: str
    dateTime: str  # Formato esperado: "YYYY-MM-DDTHH:MM"
    durationHours: int = 2

class RegisterModel(BaseModel):
    name: str
    email: str
    password: str

class LoginModel(BaseModel):
    email: str
    password: str

# ---- Endpoints ----
@router.post("/register")
async def register(payload: RegisterModel, db: Session = Depends(get_db)):
    """Cadastra um novo aluno."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado.")
    username = payload.email.split("@")[0]
    base_username = username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1
    user = User(name=payload.name, email=payload.email, username=username, password=payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"status": "success", "user": {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role}}

@router.post("/login")
async def login(payload: LoginModel, db: Session = Depends(get_db)):
    """Autentica um aluno por email e senha."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.password != payload.password:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos.")
    return {"status": "success", "user": {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role}}

@router.post("/config")
async def set_config(config: ConfigModel):
    """Recebe as preferências do usuário e devolve‑as como confirmação."""
    return {"status": "recebido", "config": config}

@router.post("/study-track")
async def generate_study_track(config: ConfigModel, db: Session = Depends(get_db)):
    """Gera uma trilha de estudos real buscando nas fontes selecionadas e orquestrando com a LLM."""
    user_id = config.user_id
    
    # 1. Busca os materiais
    search_results = SearchService.search_sources(
        topic=config.topic,
        sources=["Medium"], # Força o uso do Medium independente do frontend
        max_results_per_source=3 # Retornar apenas 3 artigos
    )
    
    # 2. Gera a trilha via LLM e loga o uso
    llm_response = LLMService.generate_study_track(
        topic=config.topic,
        level=config.knowledgeLevel,
        search_results=search_results,
        user_id=user_id
    )
    
    if "track" not in llm_response:
        raise HTTPException(status_code=500, detail=llm_response.get("error", "Erro inesperado"))
        # Continue with successful response
    
    medium_urls = [line.strip() for line in llm_response["track"].split('\n') if line.strip().startswith('http')]
    
    return {
        "status": "success",
        "topic": config.topic,
        "links": medium_urls,
        "usage": llm_response["usage"],
        "search_results": search_results
    }

@router.post("/completion-quiz")
async def generate_completion_quiz(payload: CompletionQuiz):
    """Gera um quiz de 1 pergunta com 2 alternativas para conclusão da trilha."""
    llm_response = LLMService.generate_quiz(
        topic=payload.topic,
        user_id=payload.user_id
    )
    
    if "quiz" not in llm_response:
        raise HTTPException(status_code=500, detail="Erro ao gerar quiz")
    
    return {
        "status": "success",
        "quiz": llm_response["quiz"],
        "usage": llm_response["usage"]
    }

@router.post("/chat")
async def chat_with_tutor(payload: ChatRequest, db: Session = Depends(get_db)):
    """Responde dúvidas do aluno usando RAG: busca por similaridade nos artigos e indica o melhor link."""
    rag_result = RAGService.query(
        topic=payload.topic,
        links=payload.links,
        question=payload.question,
        user_id=payload.user_id
    )

    llm_response = LLMService.generate_chat_response(
        topic=payload.topic,
        links=payload.links,
        question=payload.question,
        user_id=payload.user_id,
        rag_result=rag_result
    )

    return {
        "status": "success",
        "reply": llm_response["reply"],
        "recommended_url": llm_response.get("recommended_url"),
        "usage": llm_response["usage"]
    }

@router.post("/summarize")
async def generate_summary(payload: SummaryRequest):
    """Gera um resumo em português de todos os artigos da trilha."""
    links_content = {}
    for url in payload.links:
        content = RAGService._scrape_article(url)
        links_content[url] = content if not content.startswith("[Erro") else "Conteúdo não disponível."

    llm_response = LLMService.generate_summary(
        topic=payload.topic,
        links_content=links_content,
        user_id=payload.user_id
    )

    return {
        "status": "success",
        "summary": llm_response["summary"],
        "usage": llm_response["usage"]
    }

# backend/routers.py
@router.get("/admin/metrics")
async def get_admin_metrics(db: Session = Depends(get_db)):
    """Retorna métricas reais de FinOps extraídas do SQLite."""
    try:
        metrics = TrackingService.get_metrics(db)
        print(f"📊 Métricas retornadas: {metrics}")  # Log para debug
        return metrics
    except Exception as e:
        print(f"❌ Erro ao buscar métricas: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")

@router.get("/mock/lesson")
async def get_mock_lesson():
    """Retorna aula simulada – exemplo fixo para demonstração."""
    return {
        "id": 101,
        "title": "Inteligência Artificial Generativa",
        "content": "Nesta aula, exploraremos os fundamentos da IA Generativa, como modelos de linguagem ampla (LLMs) e modelos de difusão funcionam, e como essas tecnologias estão transformando o mundo.",
        "videoUrl": "https://www.youtube.com/embed/bZiR8y7oU7Q",
        "videoSummary": "Este vídeo apresenta uma visão geral fantástica sobre Inteligência Artificial Generativa, explicando de forma simples como redes neurais aprendem a gerar textos coerentes e imagens impressionantes a partir de enormes padrões de dados. É um ótimo ponto de partida para entender o que está por trás de ferramentas como o ChatGPT.",
        "materials": [
            { "type": "Medium", "title": "IA Generativa", "url": "https://medium.com/@c-taurion/moldando-o-futuro-empresarial-com-ia-generativa-do-take-ao-shape-1562b96d8371" },
            { "type": "YouTube", "title": "Como funciona a IA Generativa?", "url": "https://youtube.com/" },
            { "type": "GitHub", "title": "Repositório: Exemplos práticos de GenAI", "url": "https://github.com/" },
            { "type": "Documentação Oficial", "title": "Documentação da API da OpenAI", "url": "https://platform.openai.com/docs/" }
        ],
        "questions": [
            {
                "q": "O que caracteriza principalmente a IA Generativa?",
                "options": ["Sua capacidade de apenas classificar dados", "Sua capacidade de criar conteúdos novos", "Incapacidade de gerar textos coerentes"],
                "answer": 1,
            },
            {
                "q": "O que significa a sigla LLM?",
                "options": ["Large Language Model", "Low-Level Machine", "Linear Learning Mechanism"],
                "answer": 0,
            },
        ],
    }

@router.get("/mock/quiz")
async def get_mock_quiz(lesson_id: int = 101):
    """Retorna as questões do quiz para a lição solicitada (mock)."""
    lesson = await get_mock_lesson()
    if lesson["id"] != lesson_id:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"lesson_id": lesson_id, "questions": lesson["questions"]}

@router.post("/mock/quiz-result")
async def submit_quiz_result(payload: QuizAnswer):
    """Calcula percentual de acertos (mock) e devolve badge placeholder."""
    lesson = await get_mock_lesson()
    if payload.lesson_id != lesson["id"]:
        raise HTTPException(status_code=404, detail="Lesson not found")
    correct_answers = [q["answer"] for q in lesson["questions"]]
    total = len(correct_answers)
    acertou = sum(1 for a, c in zip(payload.answers, correct_answers) if a == c)
    percentual = round(acertou / total * 100, 2) if total else 0
    return {
        "lesson_id": payload.lesson_id,
        "percentual_acertos": percentual,
        "badge": "first-quiz" if percentual == 100 else None,
    }

@router.get("/mock/progress")
async def get_progress():
    """Retorna dados de progresso (mock) – será substituído por SQLite na etapa 2."""
    return {
        "completed_lessons": 1,
        "total_lessons": 5,
        "percentual_acertos_global": 80,
        "badges": ["first-quiz"],
        "upcoming_schedules": [
            {
                "event": "📚 Estudo: IA Generativa",
                "schedule": "15/07/2026 às 14:00",
                "duration_hours": 2
            }
        ]
    }

@router.get("/mock/users")
async def get_users():
    """Retorna lista de alunos fictícios gerados via Faker."""
    return {"users": USUARIOS_MOCK}

@router.get("/students")
async def get_students(db: Session = Depends(get_db)):
    """Retorna todos os alunos (mock + cadastrados) com IDs únicos."""
    registered = db.query(User).filter(User.role == "student").all()
    base_url = "https://api.dicebear.com/7.x/notionists/svg?seed="
    male_seeds = ["Oliver", "Max", "Leo", "Jack", "Liam", "Noah"]
    female_seeds = ["Mia", "Emma", "Sophie", "Ava", "Olivia", "Isabella"]
    male_names = {"silvio", "joao", "bento", "carlos"}
    male_idx = 0
    female_idx = 0
    all_users = []
    for u in registered:
        name_key = u.name.lower().split()[0]
        if name_key in male_names:
            avatar = base_url + male_seeds[male_idx % len(male_seeds)]
            male_idx += 1
        else:
            avatar = base_url + female_seeds[female_idx % len(female_seeds)]
            female_idx += 1
        all_users.append({"id": str(u.id), "name": u.name, "email": u.email, "role": "student", "avatar": avatar})
    return {"users": all_users}

@router.get("/mock/user")
async def get_user():
    """Retrocompatibilidade: retorna o primeiro usuário fictício."""
    return USUARIOS_MOCK[0]

@router.get("/mock/interactions")
async def get_interactions():
    """Histórico de três interações gerado via Faker."""
    return INTERACOES

class ChatMessage(BaseModel):
    message: str
    lesson_id: int

@router.post("/mock/chat")
async def mock_chat(payload: ChatMessage):
    """Simula a resposta de uma IA Generativa baseada na mensagem do usuário."""
    user_msg = payload.message.lower()
    
    # Simple keyword-based mock responses
    if "llm" in user_msg or "modelo de linguagem" in user_msg:
        reply = "LLM (Large Language Model) é um tipo de inteligência artificial treinada em enormes quantidades de texto. Ele aprende padrões de linguagem para conseguir prever e gerar a próxima palavra em uma frase, sendo a base do ChatGPT e outras ferramentas."
        timestamp = "02:15"
    elif "difusão" in user_msg or "imagem" in user_msg:
        reply = "Modelos de difusão funcionam adicionando 'ruído' (estática) a uma imagem e depois treinando uma rede neural para remover esse ruído passo a passo, gerando imagens completamente novas a partir de descrições em texto."
        timestamp = "05:40"
    elif "exemplo" in user_msg:
        reply = "Um bom exemplo prático de IA Generativa é pedir para a IA escrever um resumo de um livro longo, ou usar o Midjourney para criar uma ilustração apenas descrevendo a cena."
        timestamp = "08:10"
    else:
        reply = "Excelente pergunta! Na IA Generativa, conceitos podem parecer complexos no início. Pense que a IA funciona identificando padrões em dados de treinamento. Qual parte específica dessa aula você gostaria que eu explicasse de outra forma?"
        timestamp = "00:00"
        
    return {
        "reply": reply,
        "metadata": {
            "rag_source": f"Vídeo aula ({timestamp})",
            "judge_metrics": {
                "groundedness": 0.98,
                "relevance": 0.99
            },
            "tokens": {
                "prompt": 145,
                "completion": len(reply) // 4,
                "cost": 0.0012
            }
        }
    }

@router.get("/mock/finops")
async def get_finops():
    """Retorna dados simulados de custos, LLMOps e uso da plataforma (Admin)."""
    return {
        "session_cost": 0.45,
        "monthly_projection": 5.20,
        "tokens_input": 45200,
        "tokens_output": 12400,
        "total_students": 142,
        "global_performance": 78, # 78%
        "top_sources": [
            {"name": "YouTube", "percentage": 45},
            {"name": "Medium", "percentage": 30},
            {"name": "Documentação Oficial", "percentage": 15},
            {"name": "GitHub", "percentage": 10}
        ],
        "trends": "Ementa gerada através de cruzamento vetorial de 40 publicações do Reddit (r/MachineLearning) e 15 artigos do Perplexity nas últimas 24h."
    }

@router.post("/mock/schedule")
async def create_schedule(payload: ScheduleModel):
    """Simula o agendamento de uma sessão de estudos e salva na memória."""
    try:
        data_validada = datetime.fromisoformat(payload.dateTime)
        
        if data_validada < datetime.now():
            raise HTTPException(status_code=400, detail="A data de agendamento não pode ser no passado.")
        
        # Estrutura o dado que será salvo
        novo_agendamento = {
            "topic": payload.topic,
            "dateTime": payload.dateTime,
            "durationHours": payload.durationHours,
            "status": "Confirmado"
        }
        
        # Salva na lista em memória
        AGENDAMENTOS_MOCK.append(novo_agendamento)
        
        return {
            "status": "success",
            "message": "Sessão de estudos agendada com sucesso no Google Calendar!",
            "details": novo_agendamento
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data e hora inválido. Use o padrão ISO (YYYY-MM-DDTHH:MM).")

@router.get("/mock/schedules")
async def get_schedules():
    """Retorna a lista de todas as aulas agendadas pelo aluno."""
    return {"schedules": AGENDAMENTOS_MOCK}        