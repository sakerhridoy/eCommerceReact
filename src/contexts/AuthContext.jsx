import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, name) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    setUser(data.data.user);
    return data.data.user;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        let response;
        try {
          response = await api.get('/auth/profile');
        } catch (error) {
          if (error.response?.status !== 401) throw error;
          await api.post('/auth/refresh');
          response = await api.get('/auth/profile');
        }
        if (active) setUser(response.data.data);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error('Failed to restore the authentication session:', error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const value = {
    user,
    setUser,
    signup,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;