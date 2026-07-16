
<img width="1545" height="688" alt="image" src="https://github.com/user-attachments/assets/a6175808-06f0-42ca-97ef-d510095adba1" />

# 🎓 Tutor de Aprendizado com IA Generativa

> Plataforma de aprendizado personalizado que usa IA Generativa para criar trilhas de estudo sob medida, curar conteúdos de múltiplas fontes e adaptar o ritmo ao perfil do aluno.

---

## 🔗 Links

| Recurso | URL |
|---------|-----|
| 🌐 **Endpoint público** | https://silviolima-tutor-de-aprendizado.hf.space |
| 💻 **Repositório GitHub versão 2** | https://github.com/silviolima07/tutor_aprendizado_full |

---

## 📌 1. Descrição do Problema e da Solução Proposta

### O Problema

Aprender um assunto novo de forma eficiente é um desafio genuíno: não falta conteúdo na internet — falta **curadoria, sequência lógica e adaptação ao nível de quem aprende**. Um estudante que quer aprender "Machine Learning" encontra desde vídeos para iniciantes até papers técnicos, sem saber por onde começar, quanto tempo vai levar, nem se está no caminho certo.

### A Solução

O **Tutor de Aprendizado** é uma plataforma web que resolve esse problema em três camadas:

1. **Onboarding inteligente (Wizard):** O aluno informa o tema que quer aprender, seu nível atual e as fontes que prefere (YouTube, Medium, GitHub, Documentação, Artigos Acadêmicos). A IA pesquisa essas fontes e monta uma **ementa personalizada com módulos e aulas** — como um professor que preparou a aula especificamente para você.

2. **Trilha de aprendizado estruturada:** Dashboard com progresso, aulas com vídeo + resumo + materiais complementares, quiz de fixação com correção automática e sistema de badges para gamificação.

3. **Agendamento de Atividade:** Aluno pode agendar dia e hora dedicados aos estudos e receber lembretes.

4. **Chatbot com RAG real:** Dentro de cada trilha, o aluno tira dúvidas com um chatbot que busca artigos reais do Medium por similaridade vetorial (RAG) e responde com auxílio de um LLM (Groq/Llama).

### Fluxo de Atividades
<div align="center">
  <img src="frontend/src/assets/fluxo.png" alt="Fluxo de Login" width="700"/>
</div>
<p>
  <br>
  <b>Login</b><br>
  O fluxo inicia pelo login através do email do usuário.<br> 
  <b>Admin</b><br>Se for como Administrador, terá a disposição o dashboard para controle de custos, desempenho e fontes mais procuradas.<br>
  <b>Aluno</b><br>
  Se for como aluno e nao tiver conta, deve cadastrar um email do gmail para acesso. <br>Se tiver conta, irá ter a disposição a opção de iniciar um novo estudo ou ver o dashboard com o histórico do que já estudou.<br>
<b>Recursos</b><br>
  Se tiver atividades no histórico pode visualizar o que já estudou.<br>
  Ao iniciar um novo estudo, pode agendar dia e hora dedicadas ao estudo.<br>
  Pode consultar um chatbot para tirar dúvidas do que já foi visto.
  </p>

### Evolução: De Mocks para LLMs Reais
💻 **Repositório GitHub versão 1** https://github.com/silviolima07/tutor_aprendizado

A primeira versão foi implementada com dados **simulados (mock)** para validar o fluxo da plataforma. A versão atual já conta com integração real a **modelos de linguagem (LLMs)** via provedores como **Groq** e **Hugging Face**, permitindo que o Tutor de Aprendizado execute tarefas reais de IA generativa.

| Componente | Mock (v1) | Atual (v2 — LLMs reais) |
|------------|-----------|--------------------------|
| Geração de ementa | Lista estática de módulos | LLM via Groq (ex: `groq/llama-3.3-70b-versatile`) busca e estrutura o conteúdo |
| Chatbot | Regras por palavras-chave | RAG com embeddings usando artigos reais do Medium + LLM para resposta contextual |
| Quiz | Perguntas fixas | LLM gera questões dinâmicas a partir do tópico estudado |
| Resumo de artigos | — | LLM sumariza o conteúdo dos artigos da trilha em português |
| Painel FinOps | Dados fixos | Métricas reais de custo e tokens coletadas a cada chamada ao LLM |
| Agendamento | Texto fixo | API do Google Calendar (mantido como mock por enquanto) |

### Provedores de IA

A plataforma utiliza a biblioteca **LiteLLM** para abstrair diferentes provedores, permitindo alternar entre modelos sem alterar o código:

- **Groq** — Inferência ultrarrápida com modelos como `llama-3.3-70b-versatile` (padrão atual)
- **Hugging Face** — Disponível via `huggingface/meta-llama/Meta-Llama-3.1-8B-Instruct` ou outros modelos
- **OpenAI** — Pronto para uso via LiteLLM (basta configurar a chave `OPENAI_API_KEY`)

---

## 🏗️ 2. Visão Geral da Arquitetura

### Stack Tecnológica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Backend | **FastAPI (Python)** | Suporte nativo a async; fácil integração com LiteLLM e SQLAlchemy |
| Frontend | **React + Vite** | Componentes reutilizáveis; build rápido; integração simples com FastAPI |
| Estilização | **TailwindCSS** | Utilitário CSS que acelera o desenvolvimento de UI responsiva |
| LLM | **LiteLLM** | Abstrai provedores (Groq padrão, Hugging Face, OpenAI) com mesma interface |
| Dados | **SQLite + SQLAlchemy** | Persistência de usuários, métricas de tokens e custos (FinOps) |
| Deploy | **Docker + Hugging Face Spaces** | Container único, gratuito, sem configuração de servidor |

### Backend — Serviços

O backend é organizado em camadas de serviço no diretório `backend/services/`:

| Serviço | Arquivo | Responsabilidade |
|---------|---------|-----------------|
| **LLM Service** | `llm_service.py` | Chamadas aos modelos de linguagem via LiteLLM (gerar trilha, quiz, chat, resumo) |
| **RAG Service** | `rag_service.py` | Busca vetorial por similaridade em artigos do Medium |
| **Search Service** | `search_service.py` | Scraping e busca de conteúdo em fontes externas (Medium) |
| **Tracking Service** | `tracking_service.py` | Registro de tokens/custos por requisição e métricas agregadas para FinOps |

O backend é organizado em camadas de serviço no diretório `backend/services/`. A integração com modelos de linguagem reais (v2) foi o que motivou a criação desses serviços — cada um resolvendo um aspecto que os mocks da v1 não precisavam tratar:

**LLMService** (`llm_service.py`) — orquestra as chamadas aos modelos de linguagem via LiteLLM:
- Geração de trilha de estudos (`generate_study_track`)
- Geração de quiz dinâmico (`generate_quiz`)
- Resposta contextual do chatbot (`generate_chat_response`)
- Sumarização de artigos em português (`generate_summary`)
- Todas as chamadas registram tokens e custo via TrackingService

**RAGService** (`rag_service.py`) — responsável pelo Retrieval-Augmented Generation no chatbot:
- **BeautifulSoup** (`bs4`) faz scraping do conteúdo real de cada artigo encontrado
- **SentenceTransformers** (`all-MiniLM-L6-v2`) gera embeddings do conteúdo
- **ChromaDB** (banco vetorial local) armazena os embeddings e busca por similaridade com a pergunta do aluno
- Retorna o trecho mais relevante para o LLM responder com contexto

**SearchService** (`search_service.py`) — responsável por encontrar artigos reais sobre o tema do aluno:
- Usa **DuckDuckGo Search** (`duckduckgo_search`) para buscar nas fontes selecionadas (Medium, YouTube, GitHub, documentação)
- Fallback via **RSS Feed** do Medium (`feedparser` + `requests`) em `https://medium.com/feed/tag/{tema}`
- Último fallback com **artigos mock** quando as buscas externas falham

**TrackingService** (`tracking_service.py`) — registra e agrega métricas de uso (FinOps):
- Loga no SQLite a cada chamada: modelo, tokens (prompt/completion), custo, usuário, timestamp
- Expõe métricas agregadas para o dashboard admin: total de tokens, custo acumulado, requisições, consumo por modelo e por aluno

### Fluxo de uma Trilha de Estudos

```
Aluno → ConfigForm (tema, nível, fontes)
         → POST /api/study-track
              → SearchService busca artigos no Medium
              → LLMService gera trilha via Groq/Llama
              → TrackingService registra tokens e custo no SQLite
         → Dashboard exibe links da trilha

Aluno → Chatbot (dúvida sobre o tema)
         → POST /api/chat
              → RAGService busca artigo mais relevante por similaridade
              → LLMService gera resposta contextual + link recomendado
              → TrackingService registra tokens e custo

Aluno → "Concluir Trilha"
         → POST /api/completion-quiz
              → LLMService gera 3 perguntas dinâmicas sobre o tópico
         → POST /api/summarize
              → LLMService resume todos os artigos da trilha em português
```

### Autenticação e Perfis (RBAC)

Dois perfis de acesso, controlados pelo `UserContext` no frontend e validados pelo backend:

| Perfil | Acesso | Funcionalidades |
|--------|--------|-----------------|
| **Aluno** | Cadastro/login por email e senha (MD5) | Trilha personalizada, quiz, chatbot com RAG, histórico, badges |
| **Admin** | Login `admin@tutor.com` / `admin123` | Dashboard FinOps com métricas de tokens, custos, requisições por modelo e por aluno |

Os dados ficam em `localStorage` para o estado da trilha (links lidos, histórico de conclusão) e em **SQLite** para usuários cadastrados e métricas de uso da API.

### Painel FinOps (Admin)

Cada chamada a um LLM real tem custo. O `TrackingService` registra no SQLite:

- Modelo utilizado
- Tokens de prompt e completion
- Custo estimado (via `completion_cost` do LiteLLM)
- Timestamp e ID do usuário

O dashboard admin expõe essas métricas em tempo real:
- Total de usuários, alunos e administradores
- Total de tokens consumidos (últimos 30 dias)
- Custo total acumulado
- Número de requisições
- Consumo por modelo (tabela detalhada)
- Consumo por aluno (tabela detalhada)
- Atividades recentes
- Últimos alunos cadastrados

---

## 🧠 3. Aprendizados com a Migração de Mocks para LLMs Reais

> ℹ️ A versão inicial (v1) usava dados mock e endpoints simulados. Detalhes da implementação intermediária estão no [repositório GitHub](https://github.com/silviolima07/tutor_aprendizado).

A transição de endpoints mockados para chamadas reais a modelos de linguagem (v1 → v2) trouxe aprendizados importantes:

### 1. Latência e UX

O mock respondia em milissegundos. O LLM real leva **5 a 15 segundos** por chamada. Exigiu adicionar estados de carregamento com feedback visual (spinner, skeleton loading, desabilitação de botões) em todos os fluxos.

### 2. Tratamento de Erros e Respostas Imprevisíveis

O LLM pode retornar texto extra ao redor do JSON, alucinar campos ou falhar (timeout, rate limit). Solução: `try/except` em todas as chamadas, validação rigorosa da resposta com fallbacks e logging detalhado.

### 3. Controle de Custos (FinOps)

Cada chamada ao LLM tem custo real. Solução: `TrackingService` que loga no SQLite cada requisição (modelo, tokens, custo) e expõe métricas agregadas no dashboard admin.

### 4. Dependência de API Keys

O mock funcionava sem configuração. A versão com LLM exige chaves de API (Groq, Hugging Face, OpenAI). Solução: variáveis de ambiente com fallbacks e modo degradado se a LLM estiver indisponível.

### 5. RAG: do Simulado ao Real

O mock "RAG" era resposta fixa por palavra-chave. O RAG real exigiu scraping de artigos do Medium, geração de embeddings e busca por similaridade, com truncamento de conteúdo para caber no contexto do modelo.

### 6. Vazamento de Abstração

Endpoints mock eram simples e locais. Com LLMs reais, o backend passou a depender de APIs externas. Solução: separar serviços em `backend/services/` (LLM, RAG, Search, Tracking), mantendo os routers como camada fina de controller.

### Principal Aprendizado

> Mock esconde a complexidade real do sistema. A transição para LLMs reais não é só trocar a fonte dos dados — é repensar resiliência, UX, custos e arquitetura.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Python 3.11+
- Node.js 20+

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (desenvolvimento)

```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

### Build para produção (opcional)

```bash
cd frontend
npm run build
# O build vai para backend/static/
# Depois acesse: http://localhost:8000
```

---

## 🐳 Deploy no Hugging Face Spaces

O projeto usa um `Dockerfile` multi-stage:
1. **Stage 1 (Node):** Instala dependências e faz o build do React → `backend/static/`
2. **Stage 2 (Python):** Instala o FastAPI e serve o build estático + API na porta 7860

```bash
# Adicionar o Space como remote
git remote add space https://huggingface.co/spaces/SEU_USUARIO/tutor-aprendizado

# Push para o Space
git push space main
```

---

## 📁 Estrutura do Projeto

```
tutor_aprendizado/
├── backend/
│   ├── main.py                 # FastAPI app + serve estáticos
│   ├── routers.py              # Endpoints da API (autenticação, LLM, métricas)
│   ├── models.py               # Modelos SQLAlchemy (User, TokenUsage)
│   ├── database.py             # Conexão SQLite + SessionLocal
│   ├── seed.py                 # Popula banco com dados iniciais
│   ├── faker_mock.py           # Dados mock para testes
│   ├── services/
│   │   ├── llm_service.py      # Chamadas LLMs via LiteLLM (Groq/HuggingFace)
│   │   ├── tracking_service.py # Métricas FinOps (tokens, custos)
│   │   ├── rag_service.py      # RAG — busca vetorial em artigos
│   │   └── search_service.py   # Scraping em fontes (Medium)
│   ├── requirements.txt
│   └── static/                 # Build React (gerado pelo Vite)
├── frontend/
│   ├── src/
│   │   ├── pages/              # Landing, ConfigForm, Dashboard, AdminDashboard
│   │   ├── components/         # Header (RBAC), Footer, Chatbot
│   │   ├── context/            # UserContext (controle de perfil)
│   │   └── config.js           # URL da API centralizada
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile
└── README.md
```
