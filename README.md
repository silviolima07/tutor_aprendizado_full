
<img width="1545" height="688" alt="image" src="https://github.com/user-attachments/assets/a6175808-06f0-42ca-97ef-d510095adba1" />

# 🎓 Tutor de Aprendizado com IA Generativa

> Plataforma de aprendizado personalizado que usa IA Generativa para criar trilhas de estudo sob medida, curar conteúdos de múltiplas fontes e adaptar o ritmo ao perfil do aluno.

---

## 🔗 Links

| Recurso | URL |
|---------|-----|
| 🌐 **Endpoint público** | https://silviolima-tutor-de-aprendizado.hf.space |
| 💻 **Repositório GitHub** | https://github.com/silviolima07/tutor_aprendizado_full |

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

## 🏗️ 2. Escolhas de Design

### Stack Tecnológica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Backend | **FastAPI (Python)** | Geração de alta qualidade por agentes de IA; suporte nativo a async; integração com LiteLLM |
| Frontend | **React + Vite** | Componentes reutilizáveis; agentes geram JSX com consistência; Vite é mais rápido que CRA |
| Estilização | **TailwindCSS** | Permite estilo inline semântico que os agentes de IA dominam muito bem |
| LLM | **LiteLLM** | Abstrai provedores: Groq (padrão), Hugging Face, OpenAI |
| Dados | **SQLite + Faker** | Persistência real (usuários, token_usage) + dados mock para testes |
| Deploy | **Docker + Hugging Face Spaces** | Gratuito, persistente, sem configuração de servidor |

### Decisão: Tudo em um único container

O Vite foi configurado para gerar o build diretamente em `backend/static/`. O FastAPI serve esses arquivos como estáticos e responde com o `index.html` em qualquer rota (necessário para o React Router funcionar em produção). Essa abordagem elimina a necessidade de um servidor web separado (Nginx), simplificando o deploy.

### Decisão: Dados Mock no Frontend (fallback offline)

O Dashboard não trava se o backend estiver offline. Ele usa dados locais como fallback e exibe um aviso amarelo para o usuário. Isso foi uma decisão deliberada para garantir que a demo sempre funcione — mesmo que o backend demmore para iniciar no HF Spaces.

### Decisão: Dois Perfis de Usuário (RBAC simulado)

A aplicação simula dois papéis distintos:
- **Aluno:** Vê sua trilha pessoal, progresso, badges e chatbot com RAG.
- **Admin:** Vê o painel operacional (LLMOps & FinOps) com tokens consumidos, custos, e relatório mensal — invisível para alunos.

Esse design demonstra como uma plataforma real seria estruturada para um cliente empresarial (B2B), onde a empresa contrata o sistema e os administradores monitoram o uso e os custos de inferência.

### Alternativas Consideradas e Descartadas

- **Gradio / Streamlit:** Mais simples de subir, mas limitados para UX complexa com múltiplas telas e RBAC.
- **SQLite para persistência:** Implementado na versão atual. Usuários, token_usage e métricas são persistidos em SQLite via SQLAlchemy. O estado da trilha do aluno continua em `localStorage` para agilidade.
- **Next.js:** Considerado, mas React + Vite é mais simples de configurar com agentes de IA.

---

## ✅ 3. O que Funcionou — Experiência com o Agente de Codificação

O agente utilizado foi o **Antigravity (baseado no Google Gemini)**, acessado diretamente pelo IDE.

### O que o agente gerou com excelente qualidade

**Estrutura inicial do projeto** — O seguinte prompt gerou toda a base do projeto em uma única iteração:

> *"Crie uma aplicação web de tutor de aprendizado com IA. Use FastAPI no backend e React + Vite no frontend. O frontend deve ter as páginas: Landing, ConfigForm (formulário de configuração), Dashboard, Lesson (aula com vídeo), Quiz e Progress. O backend deve ter endpoints mock que retornam dados simulados. Use TailwindCSS."*

O agente criou corretamente: a estrutura de pastas, o `App.jsx` com rotas, os 6 componentes de página, o `main.py` com CORS e os primeiros endpoints.

**Wizard de onboarding multi-passo** — Prompt que funcionou muito bem:

> *"Transforme o ConfigForm em um wizard com 3 etapas: (1) tema e fontes de pesquisa, (2) tela de loading simulando IA buscando com mensagens rotativas em estilo terminal, (3) ementa gerada com módulos e aulas, (4) definição do prazo com slider de horas/dia. Use animações de transição entre etapas."*

O agente entregou exatamente o comportamento descrito, incluindo o `setTimeout` de 4 segundos para simular o tempo de busca da IA e o terminal verde com `animate-pulse`.

**Separação Admin vs Aluno (RBAC)** — Este foi o pedido mais complexo e funcionou bem:

> *"Crie um contexto React global (UserContext) que controla o papel do usuário (aluno ou admin). O Header deve ter um select para trocar de perfil. O Dashboard deve mostrar componentes completamente diferentes dependendo do papel: o Admin vê métricas globais da plataforma (FinOps, tokens, custos, fontes de dados), o Aluno vê seu progresso pessoal."*

**Chatbot com metadados de RAG e Judge** — Prompt preciso gerou o resultado correto:

> *"No Chatbot, após cada resposta, mostre uma citação da fonte (RAG) para todos os usuários. Para admins, mostre adicionalmente um painel de debug com métricas de qualidade (Groundedness, Relevance) e custo em tokens."*

---

## 🧠 4. Aprendizados com a Migração de Mocks para LLMs Reais

A transição de endpoints mockados para chamadas reais a modelos de linguagem (v1 → v2) trouxe aprendizados importantes que não estavam previstos no design inicial:

### 1. Latência e UX

O mock respondia em milissegundos. O LLM real leva **5 a 15 segundos** por chamada (especialmente via Groq). Isso exigiu repensar a experiência do usuário:

- **Solução:** Adicionar estados de carregamento com feedback visual em todos os fluxos (spinner, skeleton loading, desabilitação de botões). Onde o mock escondia a complexidade, o LLM real expôs a necessidade de tratamento de `loading`, `error` e `timeout` em cada componente.

### 2. Tratamento de Erros e Respostas Imprevisíveis

O mock sempre retornava JSON perfeito. O LLM pode:
- Retornar texto extra ao redor do JSON (quebrando `json.loads()`)
- Alucinar campos ou formatos
- Simplesmente falhar (timeout, rate limit, API key expirada)

**Solução:** Adicionar `try/except` em todas as chamadas, validação rigorosa da resposta com fallbacks, e logging detalhado para debug.

### 3. Controle de Custos (FinOps)

No mock não havia custo. Com LLMs reais, **cada chamada tem um custo** que precisa ser rastreado:

- **Solução:** Implementar o `TrackingService` que loga no SQLite cada requisição (modelo, tokens, custo) e expõe métricas agregadas no dashboard admin. Isso permitiu visibilidade de FinOps em tempo real.

### 4. Dependência de API Keys e Provedores

O mock funcionava sem configuração. A versão com LLM exige chaves de API (Groq, Hugging Face, OpenAI) e o backend falha graciosamente se não estiverem configuradas.

**Solução:** Uso de variáveis de ambiente com fallbacks. O sistema foi projetado para funcionar em modo "degradado" se a LLM estiver indisponível.

### 5. RAG: do Simulado ao Real

O mock "RAG" era apenas uma resposta fixa baseada em palavra-chave. O RAG real exigiu:
- Scraping de artigos reais do Medium
- Geração de embeddings e busca por similaridade
- Tratamento de conteúdo extenso (limite de tokens do contexto)

**Solução:** Implementar `SearchService` para busca nas fontes e `RAGService` para similaridade. O conteúdo é truncado para caber no contexto do modelo.

### 6. Vazamento de Abstração

Endpoints que antes eram simples (`/mock/lesson`) agora fazem chamadas reais a APIs externas. Isso quebrou a expectativa de que o backend seria puramente "local".

**Solução:** Separar claramente os serviços em `backend/services/` (LLM, RAG, Search, Tracking), mantendo os routers como camada fina de controller.

### Principal Aprendizado

> Mock esconde a complexidade real do sistema. A transição para LLMs reais não é só trocar a fonte dos dados — é repensar resiliência, UX, custos e arquitetura. Um bom design deve antecipar essa diferença desde o início.

---

## ⚠️ 5. O que Não Funcionou — Limitações Encontradas

### Problema 1: URL hardcoded do backend

O agente fixou `http://localhost:8000/api` como URL do backend em **todos os arquivos** (`ConfigForm.jsx`, `Dashboard.jsx`, `Lesson.jsx`). Em produção no HF Spaces, tudo roda no mesmo container, então as chamadas de API devem ser relativas (ex: `/api/mock/finops`). Foi necessário intervir manualmente para corrigir isso.

**Solução adotada:** O Dashboard foi refatorado para usar URLs relativas e incluir fallback com dados locais caso o fetch falhe.

### Problema 2: React Router e deploy em produção

O agente não configurou automaticamente o `main.py` para servir o `index.html` em todas as rotas. Ao acessar diretamente `/dashboard` em produção, o FastAPI retornava 404 porque não conhecia essa rota. Foi necessário adicionar manualmente a rota catch-all no backend:

```python
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    return FileResponse(os.path.join(static_dir, "index.html"))
```

### Problema 3: `.gitignore` incompleto

O agente criou um `.gitignore` básico que ignorava `.venv` e `__pycache__`, mas esqueceu de `node_modules/`, `dist/`, `backend/static/` (build do Vite) e os arquivos de metadados gerados pelo IDE. Precisou de correção manual.

### Problema 4: Componentes muito acoplados

Nos primeiros rascunhos, o `Dashboard.jsx` misturava lógica de admin e aluno no mesmo componente, tornando o código confuso. O agente não propôs espontaneamente a separação em `AdminDashboard` e `StudentDashboard` — isso foi solicitado explicitamente em um prompt de refinamento.

### Problema 5: Tailwind não instalado por padrão

O agente gerou código usando classes do Tailwind sem verificar se as dependências (`tailwindcss`, `postcss`, `autoprefixer`) estavam corretamente instaladas e configuradas. O `postcss.config.cjs` e `tailwind.config.js` precisaram ser revisados manualmente.

### O que faria diferente

- Separaria o prompt inicial em partes menores: primeiro a estrutura, depois a estilização, depois a lógica de cada tela.
- Pediria explicitamente URLs relativas desde o início.
- Pediria ao agente para criar um arquivo `.env` ou `config.js` centralizado para a URL da API.

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
│   ├── main.py           # FastAPI app + serve estáticos
│   ├── routers.py        # Endpoints da API (autenticação, LLM, métricas)
│   ├── models.py         # Modelos SQLAlchemy (User, TokenUsage, etc.)
│   ├── database.py       # Conexão SQLite + SessionLocal
│   ├── seed.py           # Popula banco com dados iniciais
│   ├── faker_mock.py     # Geração de dados falsos realistas
│   ├── services/
│   │   ├── llm_service.py        # Chamadas aos LLMs via LiteLLM
│   │   ├── tracking_service.py   # Métricas de tokens e custos (FinOps)
│   │   ├── rag_service.py        # RAG com embeddings e busca vetorial
│   │   └── search_service.py     # Busca em fontes (Medium, etc.)
│   ├── requirements.txt
│   └── static/           # Build do React (gerado pelo Vite)
├── frontend/
│   ├── src/
│   │   ├── pages/        # Landing, ConfigForm, Dashboard, Lesson, Quiz, Progress
│   │   ├── components/   # Header (com RBAC), Footer, Chatbot
│   │   └── context/      # UserContext (controle de perfil)
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```
---
## 🤖 Agente de Codificação Utilizado
<p align="center">
  <img width="215" height="148" alt="Logo Antigravity" src="https://github.com/user-attachments/assets/84b305cb-62de-4664-8224-e2388a44dfcd" />
</p>

**Antigravity IDE Version 2.1.1**

O desenvolvimento foi feito inteiramente através de prompts em linguagem natural no IDE. Todas as telas, componentes, endpoints e o Dockerfile foram gerados pelo agente com supervisão e ajustes manuais pontuais documentados na seção "O que não funcionou".

A estratégia de codificação alternou entre o Claude 4.6 Opus (Thinking), para arquitetura e lógicas de maior complexidade, e o Claude 4.6 Sonnet (Thinking), para refatoração e implementação de componentes. A alternância foi gerenciada dinamicamente conforme a disponibilidade de cota de cada modelo, garantindo a continuidade do desenvolvimento sem interrupções.
