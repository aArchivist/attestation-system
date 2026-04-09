import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    teacherId: localStorage.getItem('teacherId') || null,
  });

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('teacherId', data.teacherId ?? '');
    setAuth({ token: data.token, role: data.role, teacherId: data.teacherId ?? null });
    return data.role;
  };

  const logout = () => {
    if (!window.confirm('Ви дійсно хочете вийти з акаунту?')) {
      return false;
    }
    localStorage.clear();
    setAuth({ token: null, role: null, teacherId: null });
    return true;
  };

  return <AuthContext.Provider value={{ ...auth, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
