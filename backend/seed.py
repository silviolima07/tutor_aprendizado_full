# backend/seed.py
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import User, Base  # <-- Importa do models.py
from datetime import datetime
import hashlib
import os

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
        "name": "Maria Santos",
        "email": "maria@email.com",
        "username": "maria",
        "password": hashlib.md5("maria123".encode()).hexdigest(),
        "role": "student",
        "avatar": "https://ui-avatars.com/api/?name=Maria+Santos&background=4CAF50&color=fff&size=128"

    },
    {
        "name": "João Silva",
        "email": "joao@email.com",
        "username": "joao",
        "password": hashlib.md5("joao123".encode()).hexdigest(),
        "role": "student",
        "avatar": "https://ui-avatars.com/api/?name=Joao+Silva&background=FF6B6B&color=fff&size=128"
    },
]

def seed_database(db: Session):
    """Popula o banco com dados iniciais se estiver vazio."""
    
    # Verifica se já existem usuários
    user_count = db.query(User).count()
    if user_count > 0:
        print(f"✅ Banco já possui {user_count} usuários. Pulando seed.")
        # Lista os usuários para debug
        users = db.query(User).all()
        for u in users:
            print(f"  - {u.name} ({u.email}) - role: {u.role}")
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
            print(f"  ✅ Usuário criado: {user_data['name']} ({user_data['role']})")
    
    db.commit()
    
    # Lista os usuários criados
    users = db.query(User).all()
    print(f"✅ Seed concluído! {len(users)} usuários criados:")
    for u in users:
        print(f"  - {u.name} ({u.email}) - role: {u.role}")

def initialize_database():
    """Inicializa o banco de dados (recria e popula)."""
    print("🔄 Inicializando banco de dados...")
    
    # Recria o banco do zero
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso")
    
    # Popula com dados iniciais
    with SessionLocal() as db:
        seed_database(db)
    
    print("✅ Banco de dados pronto!")