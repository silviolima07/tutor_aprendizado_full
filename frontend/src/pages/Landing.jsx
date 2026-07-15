import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

import cerebroIA from '../assets/cerebro_ia.png';

import { API_URL } from '../config';

function Landing() {
  const { user, role, setRole, setUser } = useUser();
  const [showUsers, setShowUsers] = useState(false);
  const [mockUsers, setMockUsers] = useState([]);
  const [userHasTrack, setUserHasTrack] = useState(false);


  useEffect(() => {
    if (user) {
      const storageKey = `studentConfig_${user.id}`;
      const raw = localStorage.getItem(storageKey);
      setUserHasTrack(!!raw);
    } else {
      setUserHasTrack(false);
    }
  }, [user]);

  useEffect(() => {
    if (showUsers) {
      fetch(`${API_URL}/students`)
        .then(r => r.json())
        .then(data => {
          if (data.users) setMockUsers(data.users);
        })
        .catch(() => {
          // fallback caso backend offline
          setMockUsers([]);
        });
    }
  }, [showUsers]);

  const handleStudentSelect = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <div className="page-enter flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="mb-8 w-full">
        <div className="flex justify-center mb-6 relative group">
          <img src={cerebroIA} alt="Tutor de Inteligência Artificial"
            className="w-full max-w-2xl max-h-64  object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          />
          <div className="absolute inset-0 w-full max-w-2xl max-h-64 bg-cyan-500/5 blur-2xl animate-pulse-fast -z-10" />        </div>


        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
          Bem-vindo ao Tutor de Aprendizado
        </h2>

        {!role && !showUsers && (
          <>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
              Para começarmos, por favor selecione o seu perfil de acesso abaixo:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowUsers(true)}
                className="btn-glow px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-3 text-lg"
              >
                <span className="text-2xl">🎓</span> Sou Aluno
              </button>
              <Link
                to="/register"
                className="px-8 py-4 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-3 text-lg hover:scale-105"
              >
                <span className="text-2xl">✨</span> Criar Conta
              </Link>
              <button
                onClick={() => setRole('admin')}
                className="px-8 py-4 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-3 text-lg hover:scale-105"
              >
                <span className="text-2xl">🖥️</span> Sou Administrador
              </button>
            </div>
          </>
        )}

        {!role && showUsers && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Quem está estudando?</h3>
            <div className="flex flex-wrap gap-6 justify-center max-w-3xl mx-auto">
              {mockUsers.length === 0 ? (
                <div className="animate-pulse flex gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  ))}
                </div>
              ) : (
                mockUsers.map(u => {
                  const avatarUrl = u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(u.name)}`;
                  return (
                    <div key={u.id} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => handleStudentSelect(u)}>
                      <div className="w-28 h-28 rounded-2xl bg-white dark:bg-gray-800 shadow-md border-4 border-transparent group-hover:border-blue-500 group-hover:scale-105 transition-all overflow-hidden flex items-center justify-center">
                        <img src={avatarUrl} alt={u.name} className="w-24 h-24" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{u.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">ID: {u.id}</span>
                    </div>
                  );
                })
              )}
            </div>
            <button onClick={() => setShowUsers(false)} className="mt-10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">← Voltar</button>
          </div>
        )}

        {role === 'student' && (
          <>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
              {userHasTrack ? 'Continue seus estudos de onde parou!' : 'Um assistente inteligente que personaliza seu aprendizado com IA Generativa. Configure suas preferências e comece a aprender agora!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!userHasTrack && (
                <Link
                  to="/config"
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors"
                  title="Configurar Aprendizado"
                >
                  Configurar Aprendizado
                </Link>
              )}
              <Link
                to="/dashboard"
                className={`px-8 py-3 font-semibold rounded-lg transition-colors ${!userHasTrack ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg'}`}
              >
                {userHasTrack ? '📚 Continuar Trilha Atual' : 'Ver Meu Dashboard'}
              </Link>
            </div>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-left max-w-md mx-auto">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Logado como:</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {user?.name} <span className="text-gray-400 font-normal">(ID {user?.id})</span>
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mx-auto">
              {[
                { icon: '🎯', title: 'Personalizado', desc: 'Trilha adaptada ao seu nível e ritmo.' },
                { icon: '📊', title: 'Acompanhamento', desc: 'Progresso em tempo real com métricas.' },
                { icon: '🏆', title: 'Gamificação', desc: 'Badges e conquistas para motivar.' },
              ].map((item, i) => (
                <div key={i} className="card-hover bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-left">
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {role === 'admin' && (
          <>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
              Visão administrativa da plataforma. Acompanhe métricas de FinOps, LLMOps e uso global.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="btn-glow px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Acessar Dashboard Operacional
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full mx-auto">
              {[
                { icon: '💰', title: 'Controle de Custos', desc: 'Monitoramento de tokens e projeção financeira mensal.' },
                { icon: '📈', title: 'Desempenho Global', desc: 'Métricas agregadas de sucesso dos alunos.' },
              ].map((item, i) => (
                <div key={i} className="card-hover bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-t-4 border-indigo-500 text-left">
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Landing;
