from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from pydantic import BaseModel

# Importar dados faker mock (gerados na inicialização)
from faker_mock import USUARIOS_MOCK, INTERACOES

router = APIRouter()

# ---- Models ----
class ConfigModel(BaseModel):
    topic: str
    knowledgeLevel: str
    dailyHours: int
    deadline: str
    sources: List[str]

class QuizAnswer(BaseModel):
    lesson_id: int
    answers: List[int]  # índices das opções escolhidas

# ---- Endpoints ----
@router.post("/config")
async def set_config(config: ConfigModel):
    """Recebe as preferências do usuário e devolve‑as como confirmação."""
    return {"status": "recebido", "config": config}

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
    }

@router.get("/mock/users")
async def get_users():
    """Retorna lista de alunos fictícios gerados via Faker."""
    return {"users": USUARIOS_MOCK}

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
