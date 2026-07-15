# backend/services/tracking_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import TokenUsage, User
from datetime import datetime, timedelta
from faker_mock import USUARIOS_MOCK

# Mapeamento de IDs para nomes (inclui IDs antigos do banco para compatibilidade)
USER_NAME_LOOKUP = {u["id"]: u["name"] for u in USUARIOS_MOCK}
# IDs legados que podem estar no banco de dados
USER_NAME_LOOKUP.update({
    "1": "Ana Silva",
    "2": "Carlos D.", 
    "3": "Bento",
    "4": "Silvio Lima"
})

class TrackingService:
    @staticmethod
    def log_usage(db: Session, user_id: int, model: str, prompt_tokens: int, completion_tokens: int, cost: float):
        """Registra o uso de tokens e custos."""
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
        print(f"📊 Uso registrado: {model} | {total_tokens} tokens | ${cost:.6f}")
        return usage

    @staticmethod
    def get_metrics(db: Session, days: int = 30):
        """Retorna métricas agregadas para o dashboard do admin."""
        thirty_days_ago = datetime.utcnow() - timedelta(days=days)
        
        # Métricas de usuários
        total_users = db.query(User).count()
        admins = db.query(User).filter(User.role == "admin").count()
        students = db.query(User).filter(User.role == "student").count()
        
        # Métricas de tokens (últimos 30 dias)
        token_metrics = db.query(TokenUsage).filter(
            TokenUsage.timestamp >= thirty_days_ago
        ).all()
        
        total_tokens = sum(m.total_tokens for m in token_metrics) if token_metrics else 0
        total_cost = sum(m.cost for m in token_metrics) if token_metrics else 0.0
        total_requests = len(token_metrics)
        
        # Métricas por modelo
        model_usage = {}
        for m in token_metrics:
            model_usage[m.model] = model_usage.get(m.model, 0) + m.total_tokens
        
        # Métricas por usuário
        users_query = db.query(TokenUsage.user_id, func.sum(TokenUsage.cost), func.sum(TokenUsage.total_tokens)).group_by(TokenUsage.user_id).all()
        db_users = {u.id: u.name for u in db.query(User).all()}
        users_data = []
        for u, c, t in users_query:
            user_id = str(u)
            user_name = db_users.get(u) or USER_NAME_LOOKUP.get(user_id) or f"Usuário {user_id[:8]}"
            users_data.append({"user_id": user_id, "user_name": user_name, "cost": c, "tokens": t})
        
        # Usuários recentes
        recent_users = []
        for u in db.query(User).order_by(User.created_at.desc()).limit(5).all():
            recent_users.append({
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at.isoformat() if u.created_at else None
            })
        
        return {
            "total_users": total_users,
            "admins": admins,
            "students": students,
            "total_tokens": total_tokens,
            "total_cost": total_cost,
            "total_requests": total_requests,
            "model_usage": model_usage,
            "users_data": users_data,
            "recent_users": recent_users
        }