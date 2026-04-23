import { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from './lib/insforge';

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshSession: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const { data, error } = await insforge.auth.getCurrentUser();
      if (!error && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session fetch error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshSession: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
