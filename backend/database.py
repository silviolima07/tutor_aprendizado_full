# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Função para obter a sessão (dependência do FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Importa os modelos para que o Base.metadata os conheça
from models import User, TokenUsage  # <-- Importante para o SQLAlchemy

# Opcional: re-exporta para facilitar imports em outros arquivos
__all__ = ["Base", "engine", "SessionLocal", "get_db", "User", "TokenUsage"]