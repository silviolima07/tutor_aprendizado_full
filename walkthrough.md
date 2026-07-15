# 🔍 Revisão Backend & Frontend — Relatório (Atualizado)

## Novas Funcionalidades Adicionadas: Simulação Avançada de GenAI

Atendendo às solicitações, implementamos uma separação de perfis (Aluno vs. Admin) para simular com precisão o que será desenvolvido na versão final, mantendo a experiência limpa para o estudante, mas revelando métricas profundas (FinOps, RAG, LLMOps) para a gestão.

### 1. 👥 Controle de Acesso Baseado em Papéis (RBAC)
- O `Header.jsx` agora conta com um **seletor de perfil** ("Logado como: Aluno" ou "Admin").
- A aplicação utiliza um Contexto Global (`UserContext.jsx`) para que todas as telas saibam quem está acessando e alterem sua interface dinamicamente.

### 2. 📊 Painel Administrativo (LLMOps & FinOps)
- O `Dashboard.jsx` sofreu uma grande atualização.
- **Se você for Admin**, um painel exclusivo "LLMOps & FinOps" aparecerá no topo do Dashboard.
- Este painel busca dados do novo endpoint mock `/api/mock/finops` e exibe:
  - Total de tokens de entrada (Input) e saída (Output).
  - Custo rastreado (tracing) da sessão atual.
  - Projeção de custos mensais.
  - Ementa Dinâmica (Tracing multi-source), mostrando que a base de conhecimento veio de Reddit/Perplexity.
- **Se você for Aluno**, esse painel fica 100% invisível.

### 3. 🤖 Chatbot Transparente: RAG e Qualidade (Judge)
O Chatbot (`Chatbot.jsx`) também se adapta ao perfil logado:
- **Para o Aluno:** Abaixo da resposta da IA, aparece apenas um selo azul claro com a citação do banco vetorial: `🔗 Fonte: Vídeo aula (02:15)`. Isso tangibiliza o uso de **RAG** e previne alucinações.
- **Para o Admin:** Além da citação, aparece um painel de *Debug* completo debaixo da mensagem (LLM-as-a-Judge):
  - Métricas de Qualidade: Nível de **Embasamento (Groundedness)** e **Coerência (Relevance)**, úteis para detectar *drift* de modelo.
  - Métricas de Custo: Valor em dólares gasto especificamente nesta resposta e os tokens exatos (Prompt In / Completion Out).

---

## Como Testar as Novas Funcionalidades

### Terminal 1 — Backend
```powershell
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend (dev)
```powershell
cd frontend
npm run dev
```
Acesse: **http://localhost:5173**

1. **Visão do Aluno:** No cabeçalho (Header), garanta que o select esteja marcado como **Aluno**.
   - Visite o Dashboard. Ele se parecerá com uma plataforma de estudos normal.
   - Visite a Aula, abra o Chatbot, mande a mensagem "LLM" e repare na *Citação (Fonte)* do RAG que o bot anexa à resposta.
2. **Visão do Administrador (Ops):** Altere o select no cabeçalho para **Admin**.
   - Volte para o **Dashboard**. O painel cinza e roxo/verde de **FinOps e Tracing** agora estará visível, exibindo tokens e custos.
   - Abra o **Chatbot** novamente, envie uma mensagem e veja o rodapé super detalhado mostrando a avaliação de qualidade do modelo e os centavos gastos na requisição!
