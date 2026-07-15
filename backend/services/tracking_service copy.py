from sqlalchemy.orm import Session
from sqlalchemy import func
from database import TokenUsage, User
from datetime import datetime
from faker_mock import USUARIOS_MOCK

# Mapeamento de IDs para nomes (inclui IDs antigos do banco para compatibilidade)
USER_NAME_LOOKUP = {u["id"]: u["name"] for u in USUARIOS_MOCK}
# IDs legados que podem estar no banco de dados
USER_NAME_LOOKUP.update({
    "1": "Ana Silva",
    "2": "Carlos D.", 
    "3": "Bento",
    "5": "Carlos D.",  # ID antigo
    "7": "Bento",      # ID antigo
})

class TrackingService:
    @staticmethod
    def log_usage(db: Session, user_id: int, model: str, prompt_tokens: int, completion_tokens: int, cost: float):
        total_tokens = prompt_tokens + completion_tokens
        usage = TokenUsage(
            user_id=user_id,
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            cost=cost,
            timestamp=datetime.utcnow()
        )
        db.add(usage)
        db.commit()
        db.refresh(usage)
        return usage

    @staticmethod
    def get_metrics(db: Session):
        total_cost = db.query(func.sum(TokenUsage.cost)).scalar() or 0.0
        total_tokens = db.query(func.sum(TokenUsage.total_tokens)).scalar() or 0
        
        # Uso por modelo
        models_query = db.query(TokenUsage.model, func.sum(TokenUsage.cost), func.sum(TokenUsage.total_tokens)).group_by(TokenUsage.model).all()
        models_data = [{"model": m, "cost": c, "tokens": t} for m, c, t in models_query]
        
        # Uso por usuário
        users_query = db.query(TokenUsage.user_id, func.sum(TokenUsage.cost), func.sum(TokenUsage.total_tokens)).group_by(TokenUsage.user_id).all()
        db_users = {u.id: u.name for u in db.query(User).all()}
        users_data = []
        for u, c, t in users_query:
            user_id = str(u)
            user_name = db_users.get(u) or USER_NAME_LOOKUP.get(user_id) or f"Usuário {user_id[:8]}"
            users_data.append({"user_id": user_id, "user_name": user_name, "cost": c, "tokens": t})
        
        return {
            "total_cost": total_cost,
            "total_tokens": total_tokens,
            "models": models_data,
            "users": users_data
        }
