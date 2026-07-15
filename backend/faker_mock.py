from faker import Faker
from datetime import datetime, timedelta
import random

fake = Faker()

def gerar_historico():
    historico = []
    num_cursos = random.randint(0, 3)
    topicos = ['Lógica de Programação', 'Introdução ao Python', 'Data Science com Pandas', 'Machine Learning Básico', 'React para Iniciantes']
    for i in range(num_cursos):
        historico.append({
            "topic": random.choice(topicos),
            "completedAt": (datetime.now() - timedelta(days=random.randint(10, 200))).strftime("%d/%m/%Y"),
            "grade": f"{random.randint(75, 100)}%",
            "hours": random.randint(10, 60)
        })
    return historico

# Usuários fixos para consistência com o frontend (Landing.jsx)
USUARIOS_MOCK = [
    {
        "id": "1",
        "name": "Ana Silva",
        "email": "ana.silva@example.com",
        "role": "student",
        "avatar": "https://api.dicebear.com/7.x/notionists/svg?seed=Ana",
        "knowledge_level": "Iniciante",
        "history": gerar_historico()
    },
    {
        "id": "2",
        "name": "Carlos D.",
        "email": "carlos.d@example.com",
        "role": "student",
        "avatar": "https://api.dicebear.com/7.x/notionists/svg?seed=Carlos",
        "knowledge_level": "Avançado",
        "history": gerar_historico()
    },
    {
        "id": "3",
        "name": "Bento",
        "email": "bento@example.com",
        "role": "student",
        "avatar": "https://api.dicebear.com/7.x/notionists/svg?seed=Bento",
        "knowledge_level": "Intermediário",
        "history": gerar_historico()
    }
]

def gerar_interacoes(usuario_id):
    interactions = []
    now = datetime.now()
    for i in range(3):
        lesson_id = random.choice([101, 102])
        interactions.append({
            "user_id": usuario_id,
            "lesson_id": lesson_id,
            "type": random.choice(["view_lesson", "quiz_attempt"]),
            "timestamp": (now - timedelta(days=i)).isoformat(),
            "duration_minutes": random.randint(5, 30),
            "quiz_score": random.randint(0, 100) if random.random() > 0.3 else None,
            "badges_earned": random.sample(["first-quiz", "weekly-streak"], k=random.randint(0, 1))
        })
    return interactions

# Interações mock baseadas no primeiro aluno por padrão (retrocompatibilidade)
INTERACOES = gerar_interacoes(USUARIOS_MOCK[0]["id"])
