# Plano de Implementação: Separação de Fluxos Aluno vs Admin

Para atender aos novos requisitos, o fluxo da aplicação passará por uma reestruturação. Teremos duas jornadas completamente distintas dependendo de quem está logado: o **Aluno** (focado no aprendizado e metas) e o **Admin** (focado na infraestrutura e métricas globais).

## User Review Required
> [!IMPORTANT]
> A jornada do aluno mudará para um modelo passo-a-passo interativo (Wizard). Ele não preencherá tudo de uma vez. Primeiro diz o que quer aprender, depois vê o que a IA gerou, define o prazo e começa. Concorda com esse fluxo?

## Proposed Changes

### 1. Refatoração do Dashboard (Admin vs Aluno)
Vamos dividir a lógica do `Dashboard.jsx` para que a tela mude radicalmente com base no papel (role):
#### Visão do Admin (Sistema)
- **Remover:** Saudação pessoal ("Olá Aluno") e métricas individuais (Aulas concluídas do aluno X).
- **Adicionar/Manter:** 
  - Métricas Globais: Total de Alunos cadastrados, Aproveitamento global médio da plataforma.
  - FinOps: Tokens consumidos totais, Custo total acumulado.
  - Analytics: Fontes de dados mais acessadas (ex: 45% YouTube, 30% Medium).

#### Visão do Aluno (Aprendizado)
- O Aluno que já configurou seu curso verá o progresso dele (barras de progresso) e o acesso à "Próxima Aula" e "Meu Progresso (com a contagem regressiva)".
- Se o aluno não configurou o curso ainda, ele será redirecionado para a página de Onboarding (`/config`).

### 2. Reformulação do Onboarding do Aluno (`ConfigForm.jsx`)
O formulário será transformado em um fluxo passo-a-passo (Wizard) para simular a criação inteligente do curso:
- **Passo 1:** Pergunta "O que você deseja aprender?" e "Onde devemos pesquisar?" (Checkboxes de Medium, YouTube, GitHub, Docs).
- **Interlúdio (Loading):** Uma tela de carregamento simulando o agente da IA buscando nas fontes (ex: *"Pesquisando em 43 repositórios do Github e 12 artigos do Medium..."*).
- **Passo 2:** A IA apresenta o que foi encontrado (A Ementa gerada / Aula descoberta).
- **Passo 3:** O aluno define a sua **data final de estudo (deadline)** baseado no tamanho do conteúdo.
- **Conclusão:** O aluno é enviado para o seu painel de estudos (Dashboard do Aluno).

### 3. Atualização de Dados Simulados (`backend/routers.py`)
#### [MODIFY] `backend/routers.py`
- Atualizar o endpoint `/mock/finops` para incluir dados como `total_students`, `global_performance` e `top_sources`.
- Modificar o fluxo para que o endpoint `/config` simule esse processo em etapas.

## Verification Plan

### Testes Manuais
1. Acessar a aplicação e escolher o perfil "Admin" no cabeçalho.
2. Ir para o Dashboard e confirmar que **nenhum** dado pessoal de aluno aparece, apenas o status de operação do sistema, FinOps e uso das fontes de dados.
3. Mudar o perfil para "Aluno". 
4. Acessar "Configurar", preencher a intenção de aprendizado, simular o tempo de busca da IA, receber a proposta de conteúdo, e definir a data final.
5. Ir para o "Progresso" e verificar a contagem de dias restantes funcionando.
