from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers import router as api_router
import os
from dotenv import load_dotenv

from seed import initialize_database

load_dotenv()

app = FastAPI(title="Tutor de Aprendizado")

# CORS (necessário para frontend em desenvolvimento)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rotas da API
app.include_router(api_router, prefix="/api")

# Diretório onde o Vite gera o build (frontend/vite.config.ts → outDir: ../backend/static)
static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(static_dir):
    # Serve assets estáticos (JS, CSS, imagens) em /assets
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    # Catch-all: qualquer rota que não seja /api ou /assets retorna o index.html
    # Isso é essencial para o React Router funcionar em produção
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend não encontrado. Execute 'npm run build' no frontend."}
else:
    # Modo desenvolvimento: endpoint de boas-vindas
    @app.get("/")
    async def root():
        return {"message": "Tutor de Aprendizado API rodando. Frontend não builded ainda."}

@app.on_event("startup")
async def startup_event():
    """Executa tarefas ao iniciar a aplicação."""
    print("🚀 Inicializando Tutor de Aprendizado...")
    
    # Remove o banco antigo se existir (APENAS EM DESENVOLVIMENTO)
    db_path = "./app.db"  # ou o caminho do seu banco
    if os.path.exists(db_path):
        print(f"🗑️ Removendo banco antigo: {db_path}")
        os.remove(db_path)
    
    # Inicializa o banco com a nova estrutura
    initialize_database()
    
    print("✅ Tutor de Aprendizado pronto!")