import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function Header() {
  const { role, setRole, user } = useUser();
  const [isDark, setIsDark] = useState(() => {
    // Check initial preference from localStorage or system
    if (localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });
  const hasActiveTrack = user ? !!localStorage.getItem(`studentConfig_${user.id}`) : false;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🎓</span>
          <h1 className="text-xl font-bold tracking-tight group-hover:text-blue-200 transition-colors">
            Tutor de Aprendizado
          </h1>
        </Link>
        <div className="flex items-center gap-6">
          {role && (
            <nav className="flex gap-4 text-sm font-medium">
              <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
              {role === 'student' && (
                <>
                  <Link to="/progress" className="hover:text-blue-200 transition-colors">Progresso</Link>
                  {!hasActiveTrack && <Link to="/config" className="hover:text-blue-200 transition-colors">Nova Trilha</Link>}
                </>
              )}
            </nav>
          )}

          {role && (
            <div className="flex items-center gap-3 border-l border-blue-400 pl-6 ml-2">
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-white" />
                ) : (
                  <span className="text-xl">{role === 'student' ? '🧑‍🎓' : '🧑‍💻'}</span>
                )}
                <span className="text-sm font-semibold truncate max-w-[100px]">
                  {user?.name ? user.name.split(' ')[0] : (role === 'student' ? 'Aluno' : 'Admin')}
                </span>
              </div>
              <button
                onClick={() => { localStorage.removeItem('user'); localStorage.removeItem('role'); setRole(null) }}
                className="text-xs bg-blue-800/50 hover:bg-blue-800 px-2 py-1 rounded transition-colors"
                title="Trocar Perfil"
              >
                Sair
              </button>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/20 transition-colors ml-2"
            title="Alternar Tema"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
