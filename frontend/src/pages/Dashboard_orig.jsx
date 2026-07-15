import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Dados mock locais — usados como fallback se o backend estiver offline
const MOCK_FINOPS = {
  session_cost: 0.45,
  monthly_projection: 5.20,
  tokens_input: 45200,
  tokens_output: 12400,
  total_students: 142,
  global_performance: 78,
  top_sources: [
    { name: 'YouTube',              percentage: 45 },
    { name: 'Medium',               percentage: 30 },
    { name: 'Documentação Oficial', percentage: 15 },
    { name: 'GitHub',               percentage: 10 },
  ],
  trends: 'Ementa gerada através de cruzamento vetorial de 40 publicações do Reddit (r/MachineLearning) e 15 artigos do Perplexity nas últimas 24h.',
};

// Dados mock para o Histórico Mensal (Admin)
const MOCK_MONTHLY_REPORT = [
  { month: 'Março/2026', tokens: '1.2M', cost: '$12.50', activeStudents: 120 },
  { month: 'Abril/2026', tokens: '1.8M', cost: '$18.20', activeStudents: 135 },
  { month: 'Maio/2026', tokens: '2.4M', cost: '$25.10', activeStudents: 140 },
  { month: 'Junho/2026', tokens: '2.8M', cost: '$29.00', activeStudents: 142 },
];

// O MOCK_STUDENT_HISTORY antigo foi removido em favor do user.history dinâmico do Faker.

const API_URL = 'http://localhost:8000/api';

// ── Subcomponente: Card de Métrica ────────────────────────────────────────────
function MetricCard({ label, value, color, icon }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border-t-4 ${color} rounded-xl p-5 shadow-sm card-hover`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-extrabold text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}

// ── VISÃO DO ADMIN ────────────────────────────────────────────────────────────
function AdminDashboard({ finops, backendOffline }) {
  // Sempre usa os dados vindos do backend APENAS se estiverem completos; caso contrário, mock local
  const data = (finops && finops.total_students) ? finops : MOCK_FINOPS;

  return (
    <div className="page-enter mt-6 space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Aviso de modo offline */}
      {backendOffline && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
          ⚠️ <span>Backend offline — exibindo dados de demonstração. Inicie o servidor para dados reais.</span>
        </div>
      )}

      {/* Cabeçalho Admin */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30">
          🖥️
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">Dashboard Operacional</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral do sistema · LLMOps &amp; FinOps</p>
        </div>
      </div>

      {/* Métricas Globais */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Métricas da Plataforma</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total de Alunos"      value={data.total_students || 0}               color="border-indigo-500"  icon="👥" />
          <MetricCard label="Aproveitamento Global" value={`${data.global_performance || 0}%`}     color="border-emerald-500" icon="📈" />
          <MetricCard label="Custo Acumulado"       value={`$${Number(data.session_cost || 0).toFixed(2)}`} color="border-blue-500"    icon="💰" />
          <MetricCard label="Projeção Mensal"        value={`$${Number(data.monthly_projection || 0).toFixed(2)}`} color="border-amber-500" icon="📊" />
        </div>
      </section>

      {/* Tokens */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Consumo de Tokens (LLMOps)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Tokens de Entrada (Input)</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Number(data.tokens_input || 0).toLocaleString()}</p>
            <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full" style={{ width: `${((data.tokens_input || 0) / ((data.tokens_input || 0) + (data.tokens_output || 1))) * 100}%` }} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Tokens de Saída (Output)</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Number(data.tokens_output || 0).toLocaleString()}</p>
            <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full" style={{ width: `${((data.tokens_output || 0) / ((data.tokens_input || 0) + (data.tokens_output || 1))) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Fontes mais acessadas */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Fontes de Dados Mais Acessadas</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          {(data.top_sources || []).map((src, idx) => {
            const colors = ['from-red-400 to-rose-500', 'from-green-400 to-emerald-500', 'from-blue-400 to-indigo-500', 'from-gray-400 to-gray-600'];
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{src.name}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-700`}
                    style={{ width: `${src.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 w-10 text-right">{src.percentage}%</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Histórico Mensal - Relatório Admin */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Relatório Mensal de Operação</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-semibold">Mês</th>
                  <th className="p-4 font-semibold">Alunos Ativos</th>
                  <th className="p-4 font-semibold">Tokens Processados</th>
                  <th className="p-4 font-semibold">Custo em Cloud</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {MOCK_MONTHLY_REPORT.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{row.month}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{row.activeStudents}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-bold">{row.tokens}</span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 font-mono">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trends */}
      {data.trends && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300">
          🔬 <strong>Curadoria ativa:</strong> {data.trends}
        </div>
      )}
    </div>
  );
}

// ── VISÃO DO ALUNO ────────────────────────────────────────────────────────────
function StudentDashboard({ user, progress, lesson }) {
  const navigate = useNavigate();
  
  let config = null;
  try {
    const raw = localStorage.getItem('studentConfig');
    if (raw) config = JSON.parse(raw);
  } catch(e) {
    console.error('Erro ao ler studentConfig', e);
  }

  // Se o aluno não configurou uma trilha atual E não tem histórico, sugere fortemente ir pro config.
  // Caso tenha histórico, mostramos o histórico e um botão para nova trilha.
  const hasHistory = user?.history && user.history.length > 0;
  
  useEffect(() => {
    if (!config && !hasHistory) {
      navigate('/config');
    }
  }, [config, hasHistory, navigate]);

  if (!config && !hasHistory) return null;

  const deadline = (config && config.deadline) ? new Date(config.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const progressPct = progress
    ? Math.round((progress.completed_lessons / progress.total_lessons) * 100)
    : 0;

  return (
    <div className="page-enter mt-6 space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Saudação personalizada */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl shadow-blue-500/20">
        <h2 className="text-2xl font-extrabold">👋 Olá, {user?.name || 'Estudante'}!</h2>
        <p className="text-blue-100 mt-1 text-sm">
          {config ? (
            <>Estudando: <strong>{config.topic}</strong> · Nível: {config.knowledgeLevel} · {config.dailyHours}h/dia</>
          ) : (
            <>Bem-vindo de volta! Nenhuma trilha de estudo em andamento no momento.</>
          )}
        </p>
      </div>

      {/* Cards de métricas do aluno */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center border border-gray-100 dark:border-gray-700">
          <p className="text-3xl font-extrabold text-blue-600">{progress?.completed_lessons || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aulas concluídas</p>
          <p className="text-xs text-gray-400 mt-0.5">de {progress?.total_lessons || 12} no total</p>
        </div>
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center border border-gray-100 dark:border-gray-700">
          <p className="text-3xl font-extrabold text-emerald-500">{progress?.percentual_acertos_global || 0}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aproveitamento</p>
          <p className="text-xs text-gray-400 mt-0.5">nas atividades</p>
        </div>
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center border border-gray-100 dark:border-gray-700">
          <p className="text-3xl font-extrabold text-amber-500">{daysLeft !== null ? daysLeft : '—'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dias restantes</p>
          <p className="text-xs text-gray-400 mt-0.5">até o prazo final</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Progresso Geral</span>
          <span className="text-sm font-bold text-blue-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="progress-fill h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 relative"
            style={{ width: `${progressPct}%` }}
          >
            {progressPct > 10 && (
              <span className="absolute right-2 top-0 bottom-0 flex items-center text-white text-[10px] font-bold">{progressPct}%</span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{progress?.completed_lessons}/{progress?.total_lessons} aulas completadas</p>
      </div>

      {/* Seção Próxima Aula removida (ficará para a Etapa 2) */}

      {/* Badges */}
      {progress?.badges && Array.isArray(progress.badges) && progress.badges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">🏆 Conquistas</h3>
          <div className="flex flex-wrap gap-2">
            {progress.badges.map((badge, i) => (
              <span key={i} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                🥇 {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Trail Status - Somente se houver config atual */}
      {config && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Trilha Atual</h3>
            {progressPct > 10 && <span className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Em andamento</span>}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
              <div className="h-full bg-blue-500" style={{ width: `${progressPct}%` }}></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
              <div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">{config.topic}</h4>
                <p className="text-sm text-gray-500">{config.knowledgeLevel} • {config.dailyHours}h/dia • {Array.isArray(config.sources) ? config.sources.join(', ') : 'Fontes selecionadas'}</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg font-medium text-sm text-center border border-gray-200 dark:border-gray-600 cursor-not-allowed" title="A integração com LLMs ocorrerá na Etapa 2">
                  🔒 Iniciar (Etapa 2)
                </span>
                <p className="text-xs text-gray-400 mt-1 max-w-[150px]">O conteúdo das aulas interativas será implementado futuramente.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Histórico Anterior */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Histórico de Estudos</h3>
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed flex items-center gap-1" title="Disponível na Etapa 2">
            + Nova Trilha (Etapa 2)
          </span>
        </div>
        <div className="space-y-4">
          {!hasHistory ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">Nenhuma trilha concluída ainda.</p>
            </div>
          ) : (
            user.history.map((study, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-colors">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{study.topic}</p>
                  <p className="text-xs text-gray-500 mt-1">Concluído em {study.completedAt} · {study.hours} horas de dedicação</p>
                  {study.sources && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">Fontes consultadas: {Array.isArray(study.sources) ? study.sources.join(', ') : 'Múltiplas fontes'}</p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Aproveitamento</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{study.grade}</p>
                  </div>
                  <span className="text-2xl opacity-80" title="Certificado gerado">📜</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
function Dashboard() {
  const { role, user: contextUser } = useUser();
  const [progress, setProgress] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [finops, setFinops] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Dados de mock em memória para evitar travamento em fetch caso backend esteja indisponível
        if (role === 'student') {
          setProgress({
            completed_lessons: 5,
            total_lessons: 12,
            percentual_acertos_global: 85,
            badges: ['Iniciante Rápido', '5 Dias Seguidos']
          });
        }

        // Busca finops para admin
        if (role === 'admin') {
          try {
            // timeout rápido para não prender a tela
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const finopsRes = await fetch(`${API_URL}/mock/finops`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (finopsRes.ok) {
              setFinops(await finopsRes.json());
            }
          } catch {
            // backend offline — AdminDashboard usa fallback local
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [role]);

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg text-gray-600 dark:text-gray-300">Por favor, selecione seu perfil de acesso primeiro.</p>
        <Link to="/" className="btn-glow px-6 py-2 bg-blue-600 text-white rounded-lg">Voltar ao Início</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminDashboard finops={finops} backendOffline={!finops} />;
  }

  return <StudentDashboard user={contextUser} progress={progress} lesson={lesson} />;
}

export default Dashboard;
