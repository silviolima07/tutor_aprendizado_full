import React, { useEffect, useState } from 'react';

import { API_URL } from '../config';

function Progress() {
  const [progress, setProgress] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [progRes, intRes, userRes] = await Promise.all([
          fetch(`${API_URL}/mock/progress`),
          fetch(`${API_URL}/mock/interactions`),
          fetch(`${API_URL}/mock/user`),
        ]);
        setProgress(await progRes.json());
        setInteractions(await intRes.json());
        const userData = await userRes.json();
        setUser(userData);

        // Calculate countdown
        if (userData.deadline) {
          const deadlineDate = new Date(userData.deadline);
          const today = new Date();
          const diffTime = deadlineDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(diffDays > 0 ? diffDays : 0);
        }

      } catch (err) {
        console.error('Erro ao carregar progresso:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-3xl mx-auto mt-6 space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📊 Meu Progresso</h2>

        {/* Contador de dias */}
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tempo restante</p>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-3xl font-extrabold text-blue-600">{daysRemaining}</span>
            <span className="text-gray-600 dark:text-gray-300 font-medium">dias</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Até {new Date(user?.deadline).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center">
          <p className="text-3xl font-bold text-blue-600">{progress?.completed_lessons || 0}/{progress?.total_lessons || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aulas</p>
        </div>
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center">
          <p className="text-3xl font-bold text-green-500">{progress?.percentual_acertos_global || 0}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aproveitamento</p>
        </div>
        <div className="card-hover bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md text-center">
          <div className="flex justify-center gap-1 text-2xl">
            {(progress?.badges || []).map((b, i) => (
              <span key={i} title={b}>🏆</span>
            ))}
            {(!progress?.badges || progress.badges.length === 0) && <span className="text-gray-400">—</span>}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Badges</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">Progresso Geral</span>
          <span className="text-gray-500">{Math.round(((progress?.completed_lessons || 0) / (progress?.total_lessons || 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="progress-fill bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full"
            style={{ width: `${((progress?.completed_lessons || 0) / (progress?.total_lessons || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Histórico de interações */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white p-5 pb-3">🕐 Histórico de Interações</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {interactions.map((item, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.type === 'view_lesson' ? '📖 Aula' : '📝 Quiz'} #{item.lesson_id}
                </span>
                <span className="text-gray-400 ml-2">· {item.duration_minutes} min</span>
              </div>
              <div className="text-right">
                {item.quiz_score !== null && (
                  <span className={`font-bold ${item.quiz_score >= 70 ? 'text-green-500' : 'text-red-400'}`}>
                    {item.quiz_score}%
                  </span>
                )}
                <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Progress;
