# backend/seed.py
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import hashlib
import os

# Configuração do banco
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Definição dos modelos
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    role = Column(String, default="student")
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Dados iniciais
INITIAL_USERS = [
    {
        "name": "Administrador",
        "email": "admin@tutor.com",
        "username": "admin",
        "password": hashlib.md5("admin123".encode()).hexdigest(),
        "role": "admin",
        "avatar": "https://ui-avatars.com/api/?name=Admin&background=6C63FF&color=fff&size=128"
    },
    {
        "name": "João Silva",
        "email": "joao@email.com",
        "username": "joao",
        "password": hashlib.md5("joao123".encode()).hexdigest(),
        "role": "student",
        "avatar": "https://ui-avatars.com/api/?name=João+Silva&background=4CAF50&color=fff&size=128"
    },
    {
        "name": "Maria Santos",
        "email": "maria@email.com",
        "username": "maria",
        "password": hashlib.md5("maria123".encode()).hexdigest(),
        "role": "student",
        "avatar": "https://ui-avatars.com/api/?name=Maria+Santos&background=FF6B6B&color=fff&size=128"
    },
]

def drop_all_tables():
    """Remove todas as tabelas existentes."""
    Base.metadata.drop_all(bind=engine)
    print("🗑️ Todas as tabelas removidas.")

def create_tables():
    """Cria todas as tabelas."""
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso.")

def recreate_database():
    """Recria o banco do zero."""
    print("🔄 Recriando banco de dados do zero...")
    
    # Verifica se a tabela users existe
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        print("⚠️ Tabela users encontrada. Removendo...")
        drop_all_tables()
    
    # Cria as tabelas novamente
    create_tables()
    print("✅ Banco recriado com sucesso!")

def seed_database(db):
    """Popula o banco com dados iniciais se estiver vazio."""
    
    # Verifica se já existem usuários
    user_count = db.query(User).count()
    if user_count > 0:
        print(f"✅ Banco já possui {user_count} usuários. Pulando seed.")
        return
    
    print("🌱 Populando banco com dados iniciais...")
    
    for user_data in INITIAL_USERS:
        existing_user = db.query(User).filter(
            (User.email == user_data["email"]) | 
            (User.username == user_data["username"])
        ).first()
        
        if not existing_user:
            user = User(**user_data)
            db.add(user)
    
    db.commit()
    print(f"✅ Seed concluído! {len(INITIAL_USERS)} usuários criados.")

def initialize_database():
    """Inicializa o banco de dados (recria e popula)."""
    print("🔄 Inicializando banco de dados...")
    
    # Recria o banco do zero
    recreate_database()
    
    # Popula com dados iniciais
    with SessionLocal() as db:
        seed_database(db)
    
    print("✅ Banco de dados pronto!")