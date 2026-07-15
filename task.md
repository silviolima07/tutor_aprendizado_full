# Tarefas: Refatoração Admin vs Aluno

- `[x]` **Dashboard Admin**
  - `[x]` Atualizar `/mock/finops` no backend (`routers.py`) para incluir métricas do sistema (Total de Alunos, Aproveitamento Global, Ranking de Fontes). *(já estava feito)*
  - `[x]` Reescrever `Dashboard.jsx` com componente `AdminDashboard` separado — exibe apenas métricas do sistema (sem dados de estudante).
- `[x]` **Dashboard Aluno**
  - `[x]` FinOps 100% oculto para o Aluno.
  - `[x]` Saudação pessoal com nome, tema de estudo e nível.
  - `[x]` Contagem de dias restantes até o prazo (deadline).
  - `[x]` Redirecionamento automático para `/config` caso o aluno não tenha configurado.
- `[x]` **Wizard do Aluno (Onboarding)**
  - `[x]` Refatorar `ConfigForm.jsx` para um modelo de passos (Etapas).
  - `[x]` Etapa 1: Definir o que aprender, nível e fontes.
  - `[x]` Interlúdio: Tela de loading animada simulando o agente de IA buscando nas fontes.
  - `[x]` Etapa 2: Ementa gerada pela IA (4 módulos, 12 aulas).
  - `[x]` Etapa 3: Definir horas/dia e Data Final com slider e contagem regressiva.
  - `[x]` Salvar preferências no localStorage para uso no Dashboard e Progress.
