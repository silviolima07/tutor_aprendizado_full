# backend/services/tracking_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import TokenUsage, User
from datetime import datetime, timedelta
from faker_mock import USUARIOS_MOCK

USER_NAME_LOOKUP = {u["id"]: u["name"] for u in USUARIOS_MOCK}
USER_NAME_LOOKUP.update({
    "1": "Administrador",
    "2": "João Silva",
    "3": "Maria Santos",
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
        
        # Log detalhado
        print(f"📊 Uso registrado:")
        print(f"  - Usuário: {user_id}")
        print(f"  - Modelo: {model}")
        print(f"  - Tokens: {total_tokens} (prompt: {prompt_tokens}, completion: {completion_tokens})")
        print(f"  - Custo: ${cost:.6f}")
        
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
        model_cost = {}
        for m in token_metrics:
            model_usage[m.model] = model_usage.get(m.model, 0) + m.total_tokens
            model_cost[m.model] = model_cost.get(m.model, 0) + m.cost
        
        model_summary = []
        for model in model_usage:
            model_summary.append({
                "model": model,
                "tokens": model_usage[model],
                "cost": model_cost.get(model, 0.0)
            })
        
        # Métricas por usuário (apenas alunos)
        users_query = db.query(
            TokenUsage.user_id,
            func.sum(TokenUsage.total_tokens).label("total_tokens"),
            func.sum(TokenUsage.cost).label("total_cost"),
            func.count(TokenUsage.id).label("request_count")
        ).group_by(TokenUsage.user_id).all()
        
        # Busca nomes dos usuários
        db_users = {u.id: u.name for u in db.query(User).all()}
        
        users_summary = []
        for u in users_query:
            user_id = str(u.user_id)
            user_name = db_users.get(u.user_id) or USER_NAME_LOOKUP.get(user_id) or f"Usuário {user_id[:8]}"
            
            # Verifica se é admin (não mostra em alunos)
            user_role = db.query(User).filter(User.id == u.user_id).first()
            if user_role and user_role.role == "student":
                users_summary.append({
                    "user_id": user_id,
                    "user_name": user_name,
                    "tokens": int(u.total_tokens or 0),
                    "cost": float(u.total_cost or 0.0),
                    "requests": int(u.request_count or 0)
                })
        
        # Últimas requisições (para mostrar histórico)
        recent_requests = []
        for m in token_metrics[:10]:  # Últimos 10 registros
            user_name = db_users.get(m.user_id) or USER_NAME_LOOKUP.get(str(m.user_id), "Desconhecido")
            recent_requests.append({
                "user": user_name,
                "model": m.model,
                "tokens": m.total_tokens,
                "cost": m.cost,
                "timestamp": m.timestamp.isoformat() if m.timestamp else None
            })
        
        # Usuários recentes (apenas alunos)
        recent_users = []
        for u in db.query(User).filter(User.role == "student").order_by(User.created_at.desc()).limit(5).all():
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
            "model_summary": model_summary,  # <-- NOVO: detalhes por modelo
            "users_summary": users_summary,  # <-- NOVO: detalhes por aluno
            "recent_requests": recent_requests,  # <-- NOVO: histórico de uso
            "recent_users": recent_users
        }