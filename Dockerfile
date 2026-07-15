# ============================================================
# Estágio 1: Build do Frontend (React + Vite)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copia apenas os arquivos de dependência primeiro (cache eficiente)
COPY frontend/package*.json ./
RUN npm ci

# Copia o restante do código do frontend
COPY frontend/ ./

# Faz o build — vite.config.ts tem outDir: '../backend/static'
# Isso coloca o build em /app/backend/static (relativo ao workdir /app/frontend)
RUN npm run build

# ============================================================
# Estágio 2: Backend Python (FastAPI + arquivos estáticos)
# ============================================================
FROM python:3.11-slim

WORKDIR /app

# Instala dependências Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código do backend
COPY backend/ ./

# Copia os arquivos estáticos gerados no estágio 1
# O Vite colocou o build em /app/backend/static (dentro do container do estágio 1)
COPY --from=frontend-builder /app/backend/static ./static

# Hugging Face Spaces expõe a porta 7860 por padrão
EXPOSE 7860

# Inicia o servidor FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
