from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./tutor.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class TokenUsage(Base):
    __tablename__ = "token_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    model = Column(String, index=True)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def seed_mock_users():
    db = SessionLocal()
    try:
        mock_data = [
            {"name": "Ana Silva", "email": "ana.silva@example.com", "password": "123456"},
            {"name": "Carlos D.", "email": "carlos.d@example.com", "password": "123456"},
            {"name": "Bento", "email": "bento@example.com", "password": "123456"},
        ]
        for m in mock_data:
            exists = db.query(User).filter(User.email == m["email"]).first()
            if not exists:
                db.add(User(**m))
        db.commit()
    finally:
        db.close()

seed_mock_users()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
