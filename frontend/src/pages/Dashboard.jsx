import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

import { API_URL } from '../config';

// Dados mock locais — usados como fallback se o backend estiver offline
const MOCK_FINOPS = {
  session_cost: 0.45,
  monthly_projection: 5.20,
  tokens_input: 45200,
  tokens_output: 12400,
  total_students: 142,
  global_performance: 78,
  top_sources: [
    { name: 'YouTube', percentage: 45 },
    { name: 'Medium', percentage: 30 },
    { name: 'Documentação Oficial', percentage: 15 },
    { name: 'GitHub', percentage: 10 },
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
function AdminDashboard({ metrics, backendOffline }) {
  const totalCost = metrics?.total_cost || 0;
  const totalTokens = metrics?.total_tokens || 0;
  const users = metrics?.users_summary || [];
  const models = metrics?.model_summary || [];

  const totalUsers = users.length;

  return (
    <div className="page-enter mt-6 space-y-8 pb-20 max-w-5xl mx-auto">
      {backendOffline && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
          ⚠️ <span>Backend offline — exibindo dados de demonstração. Inicie o servidor para dados reais.</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30">
          🖥️
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">Dashboard Operacional</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral do sistema · LLMOps & FinOps</p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Métricas da Plataforma</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total de Alunos" value={totalUsers} color="border-indigo-500" icon="👥" />
          <MetricCard label="Custo Total" value={`$${Number(totalCost).toFixed(4)}`} color="border-blue-500" icon="💰" />
          <MetricCard label="Tokens Totais" value={totalTokens.toLocaleString()} color="border-purple-500" icon="🔢" />
          <MetricCard label="Modelos Usados" value={models.length} color="border-amber-500" icon="🤖" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Consumo de Tokens por Modelo</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          {models.length > 0 ? (
            models.map((model, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{model.model}</p>
                    <p className="text-sm text-gray-500">{model.tokens?.toLocaleString()} tokens • ${Number(model.cost || 0).toFixed(4)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{Number(model.tokens || 0).toLocaleString()}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">${Number(model.cost || 0).toFixed(4)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum uso de modelo registrado ainda.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Consumo por Aluno</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 space-y-4 max-h-96 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{user.user_name || `Aluno ${String(user.user_id).slice(0, 8)}`}</p>
                    <p className="text-sm text-gray-500">{user.tokens?.toLocaleString()} tokens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{user.tokens?.toLocaleString()}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">${Number(user.cost || 0).toFixed(4)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum aluno com uso registrado ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Modal de Quiz de Conclusão ────────────────────────────────────────────────
function CompletionQuizModal({ topic, userId, onClose, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/completion-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, user_id: userId })
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success' && data.quiz?.questions) {
          setQuiz(data.quiz);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topic, userId]);

  const handleAnswer = (idx) => {
    const newAnswers = { ...answers, [currentQ]: idx };
    setAnswers(newAnswers);

    if (currentQ < 2) {
      setCurrentQ(currentQ + 1);
    } else {
      const totalCorrect = quiz.questions.reduce((acc, q, i) => acc + (newAnswers[i] === q.correct ? 1 : 0), 0);
      const pct = Math.round((totalCorrect / 3) * 100);
      setScore(pct);
      setResult(totalCorrect >= 2 ? 'aprovado' : 'reprovado');
    }
  };

  const handleComplete = () => {
    onComplete(score);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Preparando quiz de conclusão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full">
        {!result ? (
          <>
            <div className="text-center mb-6">
              <span className="text-4xl">📝</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-3">Quiz de Conclusão</h3>
              <p className="text-sm text-gray-500 mt-1">Questão {currentQ + 1} de 3</p>
            </div>
            {quiz && quiz.questions && (
              <div className="space-y-4">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-center">{quiz.questions[currentQ].question}</p>
                <div className="space-y-2">
                  {quiz.questions[currentQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium text-gray-700 dark:text-gray-300"
                    >
                      <span className="inline-block w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-center text-sm font-bold mr-3 leading-7">{String.fromCharCode(65 + idx)}</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : result === 'aprovado' ? (
          <div className="text-center">
            <span className="text-6xl">🎉</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-4">Parabéns!</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Você acertou {score}% das questões e concluiu sua trilha de estudos!</p>
            <button
              onClick={handleComplete}
              className="mt-6 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all"
            >
              ✓ Finalizar Trilha
            </button>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-6xl">😅</span>
            <h3 className="text-2xl font-bold text-red-500 mt-4">Você acertou apenas {score}%</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              São necessários ao menos 67% (2 de 3) para aprovação.
            </p>
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300 text-left">
              📖 <strong>Recomendação:</strong> Revise os artigos da sua trilha de estudos com mais atenção. Volte ao Dashboard, releia os links disponíveis e tente novamente o quiz quando se sentir preparado.
            </div>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
            >
              Voltar aos Estudos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── VISÃO DO ALUNO ────────────────────────────────────────────────────────────
function StudentDashboard({ user, progress, lesson }) {
  const navigate = useNavigate();
  const { role } = useUser();
  const [showQuiz, setShowQuiz] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [summaryModal, setSummaryModal] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen]);

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: question }]);
    setChatInput('');
    setChatTyping(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: config?.topic || '',
          links: config?.links || [],
          question,
          user_id: parseInt(user?.id || 1)
        })
      });
      const data = await res.json();
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'tutor',
          content: data.reply,
          recommendedUrl: data.recommended_url
        }]);
        setChatTyping(false);
      }, 800);
    } catch {
      setChatTyping(false);
      setChatMessages(prev => [...prev, { role: 'tutor', content: 'Desculpe, estou com problemas de conexão. Tente novamente mais tarde.' }]);
    }
  };

  let config = null;
  let history = [];
  try {
    const storageKey = `studentConfig_${user?.id || 1}`;
    const raw = localStorage.getItem(storageKey);
    if (raw) config = JSON.parse(raw);

    const historyKey = `history_${user?.id || 1}`;
    const rawHistory = localStorage.getItem(historyKey);
    if (rawHistory) history = JSON.parse(rawHistory);
  } catch (e) {
    console.error('Erro ao ler configuração do aluno', e);
  }

  const hasHistory = history.filter(h => h.summary).length > 0;

  if (!config && !hasHistory) {
    return (
      <div className="page-enter mt-6 space-y-6 pb-20 max-w-4xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-md border border-gray-100 dark:border-gray-700">
          <span className="text-6xl">🎓</span>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">Bem-vindo, {user?.name || 'Estudante'}!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Você ainda não configurou sua trilha de estudos. Clique abaixo para começar.
          </p>
          <Link
            to="/config"
            className="mt-6 inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            Configurar Meu Aprendizado
          </Link>
        </div>
      </div>
    );
  }

  const deadline = (config && config.deadline) ? new Date(config.deadline) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const completedTracks = history.filter(h => h.summary).length;
  const avgScore = completedTracks > 0
    ? Math.round(history.filter(h => h.summary).reduce((sum, h) => sum + (h.quizScore || 0), 0) / completedTracks)
    : 0;

  const totalLinks = config?.links?.length || 0;
  const readCount = config?.readStatus ? config.readStatus.filter(Boolean).length : 0;
  const progressPct = totalLinks > 0 ? Math.round((readCount / totalLinks) * 100) : 0;
  const allLinksRead = totalLinks > 0 && readCount === totalLinks;

  const toggleRead = (idx) => {
    const storageKey = `studentConfig_${user?.id || 1}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const cfg = JSON.parse(raw);
    const status = cfg.readStatus ? [...cfg.readStatus] : new Array(cfg.links.length).fill(false);
    status[idx] = !status[idx];
    cfg.readStatus = status;
    localStorage.setItem(storageKey, JSON.stringify(cfg));
    window.location.reload();
  };

  // Função auxiliar para converter strings ISO em datas legíveis no padrão BR
  const formatarData = (isoString) => {
    try {
      const data = new Date(isoString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' h';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="page-enter mt-6 space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Saudação personalizada */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl shadow-blue-500/20">
        <h2 className="text-2xl font-extrabold">👋 Olá, {user?.name || 'Estudante'}!</h2>
        <p className="text-blue-100 mt-1 text-sm">
          {config ? (
            <>Estudando: <strong>{config.topic}</strong> · Nível: {config.knowledgeLevel}</>
          ) : (
            <>Bem-vindo de volta! Nenhuma trilha de estudo em andamento no momento.</>
          )}
        </p>
      </div>

      {/* Cards de métricas do aluno */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center border border-gray-100 dark:border-gray-700">
          <p className="text-3xl font-extrabold text-blue-600">{completedTracks}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Trilhas concluídas</p>
          <p className="text-xs text-gray-400 mt-0.5">{completedTracks > 0 ? `${completedTracks} no total` : 'nenhuma ainda'}</p>
        </div>
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center border border-gray-100 dark:border-gray-700">
          <p className="text-3xl font-extrabold text-emerald-500">{avgScore}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aproveitamento</p>
          <p className="text-xs text-gray-400 mt-0.5">média dos quizzes</p>
        </div>
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center border border-gray-100 dark:border-gray-700">
          <p className="text-3xl font-extrabold text-amber-500">{daysLeft !== null ? daysLeft : '—'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dias restantes</p>
          <p className="text-xs text-gray-400 mt-0.5">até o prazo final</p>
        </div>
      </div>

      {/* Barra de progresso */}
      {config && (
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
          <p className="text-xs text-gray-400 mt-2">{readCount}/{totalLinks} {totalLinks === 1 ? 'artigo lido' : 'artigos lidos'}</p>
        </div>
      )}

      {/* Conquistas */}
      {history.filter(s => s.summary).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">🏆 Conquistas</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { level: 1, title: 'Aprendiz', icon: '🌱' },
              { level: 2, title: 'Pleno', icon: '🌿' },
              { level: 3, title: 'Sênior', icon: '🌳' },
              { level: 4, title: 'Especialista', icon: '🏅' },
              { level: 5, title: 'Ninja', icon: '🥷' },
            ].map((badge) => {
              const earned = completedTracks >= badge.level;
              return (
                <span
                  key={badge.level}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${earned ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 opacity-50'}`}
                >
                  {badge.icon} {badge.title} {earned ? '✓' : `(${badge.level})`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Trail Status */}
      {config && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Trilha Atual</h3>
            <span className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Em andamento</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/30 space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">{config.topic}</h4>
                  <p className="text-sm text-gray-500">{config.knowledgeLevel} • {Array.isArray(config.sources) ? config.sources.join(', ') : 'Fontes selecionadas'}</p>
                </div>
                <div className="text-right">
                  {daysLeft !== null && (
                    <p className={`text-2xl font-extrabold ${daysLeft <= 3 ? 'text-red-500' : 'text-amber-500'}`}>
                      {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">Prazo: <span className="font-semibold text-gray-700 dark:text-gray-300">{config.deadline ? new Date(config.deadline + 'T23:59:59').toLocaleDateString('pt-BR') : 'Não definido'}</span></p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                ⏰ Complete seus estudos até o prazo definido. Marque todos os artigos como <strong>"Visto"</strong> para liberar o botão "Concluir Trilha". ({readCount}/{totalLinks} lidos)
              </div>
            </div>
            {config.links && config.links.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📖 Artigos do Medium para estudo:</p>
                <div className="space-y-2">
                  {config.links.map((url, idx) => {
                    const read = config.readStatus ? config.readStatus[idx] : false;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all group ${read ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                        >
                          <span className="text-green-500 font-bold text-lg">📄</span>
                          <span className={`flex-1 text-sm break-all ${read ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-blue-600 dark:text-blue-400 group-hover:underline'}`}>{url}</span>
                          <span className="text-gray-400 text-xs">Abrir →</span>
                        </a>
                        <button
                          onClick={() => toggleRead(idx)}
                          className={`shrink-0 px-3 py-3 rounded-lg text-sm font-semibold border-2 transition-all ${read ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600 hover:border-emerald-300'}`}
                          title={read ? 'Marcar como não lido' : 'Marcar como lido'}
                        >
                          {read ? '✓ Visto' : 'Já vi'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setChatOpen(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all text-sm flex items-center gap-2"
              >
                🤖 Tirar Dúvidas
              </button>
              <button
                onClick={() => setShowQuiz(true)}
                disabled={!allLinksRead}
                className={`px-4 py-2 font-semibold rounded-lg transition-all text-sm ${allLinksRead ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
              >
                {allLinksRead ? '✓ Concluir Trilha' : `🔒 ${readCount}/${totalLinks} lidos`}
              </button>
            </div>
          </div>
          {showQuiz && (
            <CompletionQuizModal
              topic={config.topic}
              userId={user?.id || 1}
              onClose={() => setShowQuiz(false)}
              onComplete={async (quizScore) => {
                const storageKey = `studentConfig_${user?.id || 1}`;
                const historyKey = `history_${user?.id || 1}`;
                const oldConfig = JSON.parse(localStorage.getItem(storageKey) || '{}');
                let summary = '';
                try {
                  const res = await fetch(`${API_URL}/summarize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      topic: oldConfig.topic,
                      links: oldConfig.links || [],
                      user_id: parseInt(user?.id || 1)
                    })
                  });
                  const data = await res.json();
                  if (data.status === 'success') summary = data.summary;
                } catch { /* summary stays empty */ }
                const completed = { ...oldConfig, completedAt: new Date().toISOString(), quizScore: quizScore || 100, summary };
                const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
                existingHistory.push(completed);
                localStorage.setItem(historyKey, JSON.stringify(existingHistory));
                localStorage.removeItem(storageKey);
                window.location.reload();
              }}
            />
          )}
        </section>
      )}

      {/* Chat Modal */}
      {config && chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setChatOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden" style={{ height: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl shrink-0">🤖</span>
                <div className="min-w-0">
                  <h3 className="font-bold truncate">Tutor IA</h3>
                  <p className="text-xs text-blue-200 truncate">{config.topic}</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-300 shrink-0 ml-2">✖</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  Pergunte algo sobre <strong>{config.topic}</strong> e o Tutor IA vai analisar os artigos para te ajudar!
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-600 shadow-sm'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.recommendedUrl && (
                      <a href={msg.recommendedUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all">
                        <span>📖</span>
                        <span className="flex-1 truncate">Artigo recomendado</span>
                        <span className="text-emerald-500 font-bold">Abrir →</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {chatTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Digite sua dúvida sobre o tema..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={!chatInput.trim() || chatTyping}
                className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors">➤</button>
            </form>
          </div>
        </div>
      )}

      {!config && !hasHistory && (
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <span className="text-5xl">🎯</span>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-4">Nenhuma trilha ativa</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              Você ainda não iniciou nenhum plano de estudos. Clique abaixo para começar!
            </p>
            <Link
              to="/config"
              className="mt-6 inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              Criar Novo Plano de Estudos
            </Link>
          </div>
        </section>
      )}

      {!config && hasHistory && (
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma trilha em andamento no momento.</p>
            <Link
              to="/config"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              Iniciar Nova Trilha
            </Link>
          </div>
        </section>
      )}

      {/* Histórico de Estudos Concluídos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">📜 Histórico de Estudos</h3>
        </div>
        <div className="space-y-4">
          {!hasHistory ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">Nenhuma trilha concluída ainda.</p>
            </div>
          ) : (
            history.filter(s => s.summary).map((study, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-blue-300 transition-colors">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{study.topic}</p>
                  <p className="text-xs text-gray-500 mt-1">Concluído em {new Date(study.completedAt || study.configuredAt).toLocaleDateString('pt-BR')} • Nota: {study.quizScore || 100}%</p>
                  {study.sources && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">Fontes consultadas: {Array.isArray(study.sources) ? study.sources.join(', ') : 'Múltiplas fontes'}</p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-3">
                  {study.summary && (
                    <button
                      onClick={() => setSummaryModal(study)}
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                    >
                      📄 Ver Resumo
                    </button>
                  )}
                  <span className="text-2xl opacity-80" title="Certificado gerado">📜</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Summary Modal */}
      {summaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSummaryModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl shrink-0">📄</span>
                <div className="min-w-0">
                  <h3 className="font-bold truncate">Resumo da Trilha</h3>
                  <p className="text-xs text-blue-200 truncate">{summaryModal.topic}</p>
                </div>
              </div>
              <button onClick={() => setSummaryModal(null)} className="text-white hover:text-gray-300 shrink-0 ml-2">✖</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {summaryModal.summary}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button onClick={() => setSummaryModal(null)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
function Dashboard() {
  const { role, user: contextUser } = useUser();
  const [progress, setProgress] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (role === 'student') {
          setProgress({
            completed_lessons: 5,
            total_lessons: 12,
            percentual_acertos_global: 85,
            badges: ['Iniciante Rápido', '5 Dias Seguidos']
          });
        }

        if (role === 'admin') {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const finopsRes = await fetch(`${API_URL}/admin/metrics`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (finopsRes.ok) {
              setMetrics(await finopsRes.json());
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
    return <AdminDashboard metrics={metrics} backendOffline={!metrics} />;
  }

  return <StudentDashboard user={contextUser} progress={progress} lesson={lesson} />;
}

export default Dashboard;