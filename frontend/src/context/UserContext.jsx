import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  // `user` armazena o objeto completo: { id, name, role, avatar, history, ... }
  // Quando null, ninguém está logado
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Atalho para manter compatibilidade com o resto do app que lia apenas 'role'
  const role = user ? user.role : null;

  // setRole para Admin: Apenas injeta um mock simples de admin
  const setRole = (r) => {
    if (r === 'admin') {
      setUser({ id: 'admin-1', name: 'Administrador', role: 'admin' });
    } else if (r === null) {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, role, setRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
