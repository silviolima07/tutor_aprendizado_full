from litellm import completion, completion_cost
import json
import os
from dotenv import load_dotenv
from .tracking_service import TrackingService
from fastapi import HTTPException
from database import SessionLocal

load_dotenv()
PUTER_API_KEY = os.getenv("PUTTER_API_KEY")
PUTER_BASE_URL = "https://api.puter.com/v1"

class LLMService:
    @staticmethod
    def generate_quiz(topic: str, user_id: int):
        model_name = os.getenv("MODEL_NAME", "groq/llama-3.3-70b-versatile")
        
        prompt = f"""Crie 3 perguntas de quiz sobre o tema "{topic}". Cada pergunta deve ter 2 alternativas de resposta.
Retorne APENAS um JSON válido no seguinte formato, sem formatação extra:
{{"questions": [
  {{"question": "pergunta1", "options": ["alternativa A", "alternativa B"], "correct": 0}},
  {{"question": "pergunta2", "options": ["alternativa A", "alternativa B"], "correct": 1}},
  {{"question": "pergunta3", "options": ["alternativa A", "alternativa B"], "correct": 0}}
]}}

O campo "correct" deve ser 0 para a primeira alternativa ou 1 para a segunda.
Todas as perguntas devem ter relação direta com o tema "{topic}".
IMPORTANTE: Mantenha os termos técnicos em INGLÊS quando não houver tradução consagrada em português (ex: use "overfitting" em vez de "sobreajuste", "underfitting" em vez de "subajuste", "bias", "variance", "dropout", "batch normalization", etc). As perguntas e alternativas devem ser em português, mas os termos técnicos devem permanecer no original em inglês.
"""

        try:
            print(f"Calling Groq model for quiz: {model_name}")
            response = completion(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                api_key=os.getenv("GROQ_API_KEY"),
                timeout=30
            )
            
            content = response.choices[0].message.content.strip()
            
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            
            try:
                cost = completion_cost(completion_response=response)
            except Exception:
                cost = 0.0
            
            db = SessionLocal()
            try:
                TrackingService.log_usage(
                    db=db,
                    user_id=user_id,
                    model=model_name,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    cost=cost
                )
            finally:
                db.close()
            
            quiz = json.loads(content)
            
            return {
                "quiz": quiz,
                "usage": {
                    "model": model_name,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "cost": cost
                }
            }
        except Exception as e:
            print(f"Quiz LLM error detail: {e}")
            raise HTTPException(status_code=502, detail=f"Quiz generation failed: {e}")

    @staticmethod
    def generate_study_track(topic: str, level: str, search_results: list, user_id: int):
        model_name = os.getenv("MODEL_NAME", "groq/llama-3.3-70b-versatile")
        
        medium_articles = [r for r in search_results if r.get("source") == "Medium"]
        
        prompt = f"""Extraia APENAS os links dos artigos do Medium da lista abaixo.
Retorne APENAS uma lista de URLs, uma por linha, sem formatação, sem explicações, sem markdown.

Artigos do Medium:
{json.dumps(medium_articles, indent=2, ensure_ascii=False)}
"""

        try:
            print(f"Calling Groq model: {model_name}")
            response = completion(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                api_key=os.getenv("GROQ_API_KEY"),
                timeout=60
            )
            
            content = response.choices[0].message.content
            
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            
            try:
                cost = completion_cost(completion_response=response)
            except Exception:
                cost = 0.0
            
            db = SessionLocal()
            try:
                TrackingService.log_usage(
                    db=db,
                    user_id=user_id,
                    model=model_name,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    cost=cost
                )
            finally:
                db.close()
                
            urls = [line.strip() for line in content.strip().split('\n') if line.strip().startswith('http')]
            
            return {
                "track": "\n".join(urls),
                "usage": {
                    "model": model_name,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "cost": cost
                }
            }
        except Exception as e:
            print(f"LLM error detail: {e}")
            raise HTTPException(status_code=502, detail=f"LLM service failed: {e}")

    @staticmethod
    def generate_chat_response(topic: str, links: list, question: str, user_id: int, rag_result: dict = None):
        model_name = os.getenv("MODEL_NAME", "groq/llama-3.3-70b-versatile")

        rag_section = ""
        if rag_result and rag_result.get("best_url"):
            rag_section = f"""
Conteúdo do artigo mais relevante encontrado ({rag_result['best_url']}):
{rag_result['best_content'][:2000]}
"""

        prompt = f"""Você é um tutor de IA que ajuda alunos a aprender sobre "{topic}".
O aluno fez a seguinte pergunta: "{question}"

{rag_section}
REGRAS IMPORTANTES:
1. Responda APENAS sobre o tema "{topic}" com base exclusivamente no conteúdo dos artigos do Medium fornecidos.
2. Se a pergunta do aluno NÃO for relacionada a "{topic}" ou aos artigos, responda educadamente que você só pode responder dúvidas sobre "{topic}" com base nos artigos encontrados.
3. Sempre que possível, indique o link do artigo mais relevante para a dúvida.

Sua tarefa:
1. Responda à pergunta do aluno de forma clara e didática, baseando-se no conteúdo do artigo mais relevante fornecido acima.
2. Faça um RESUMO do que o artigo selecionado aborda e explique por que ele é útil para a dúvida do aluno.
3. Ao final, indique CLARAMENTE o link recomendado para o aluno se aprofundar.

Formato da resposta:
- Explique a resposta à dúvida
- "📖 **Artigo recomendado:** [título do artigo]({rag_result['best_url'] if rag_result and rag_result.get('best_url') else links[0]})"
- Breve explicação do por que este artigo é o melhor para essa dúvida

Seja amigável e incentive o aprendizado.
"""
        try:
            print(f"Calling Groq model for chat: {model_name}")
            response = completion(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                api_key=os.getenv("GROQ_API_KEY"),
                timeout=30
            )

            content = response.choices[0].message.content.strip()

            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens

            try:
                cost = completion_cost(completion_response=response)
            except Exception:
                cost = 0.0

            db = SessionLocal()
            try:
                TrackingService.log_usage(
                    db=db,
                    user_id=user_id,
                    model=model_name,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    cost=cost
                )
            finally:
                db.close()

            best_url = rag_result.get("best_url") if rag_result else (links[0] if links else None)

            return {
                "reply": content,
                "recommended_url": best_url,
                "usage": {
                    "model": model_name,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "cost": cost
                }
            }
        except Exception as e:
            print(f"Chat LLM error detail: {e}")
            raise HTTPException(status_code=502, detail=f"Chat response failed: {e}")

    @staticmethod
    def generate_summary(topic: str, links_content: dict, user_id: int):
        model_name = os.getenv("MODEL_NAME", "groq/llama-3.3-70b-versatile")

        articles_text = ""
        for url, content in links_content.items():
            articles_text += f"\n--- {url} ---\n{content[:1500]}\n"

        prompt = f"""Com base nos artigos abaixo sobre "{topic}", gere um resumo em português com:

1. **Visão geral** (2-3 frases sobre o tema)
2. **Pontos principais** (lista de bullets com os conceitos mais importantes extraídos dos artigos)
3. **Destaque de cada artigo** (liste cada URL e o que ele oferece de único)

Seja objetivo e didático. O resumo será usado por um aluno que concluiu o estudo para revisão.

Artigos:
{articles_text}
"""
        try:
            print(f"Calling Groq model for summary: {model_name}")
            response = completion(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                api_key=os.getenv("GROQ_API_KEY"),
                timeout=60
            )

            content = response.choices[0].message.content.strip()

            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens

            try:
                cost = completion_cost(completion_response=response)
            except Exception:
                cost = 0.0

            db = SessionLocal()
            try:
                TrackingService.log_usage(
                    db=db,
                    user_id=user_id,
                    model=model_name,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    cost=cost
                )
            finally:
                db.close()

            return {
                "summary": content,
                "usage": {
                    "model": model_name,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "cost": cost
                }
            }
        except Exception as e:
            print(f"Summary LLM error detail: {e}")
            raise HTTPException(status_code=502, detail=f"Summary generation failed: {e}")
