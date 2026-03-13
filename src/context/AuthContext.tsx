import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginAdmin, verifyToken } from '@/lib/api';

interface Admin {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify the stored token
  useEffect(() => {
    const token = localStorage.getItem('sv_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    verifyToken()
      .then((data) => {
        if (data?.valid && data?.admin) {
          setAdmin(data.admin);
        } else {
          localStorage.removeItem('sv_token');
          localStorage.removeItem('sv_admin');
        }
      })
      .catch(() => {
        localStorage.removeItem('sv_token');
        localStorage.removeItem('sv_admin');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const data = await loginAdmin(username, password);
    localStorage.setItem('sv_token', data.token);
    localStorage.setItem('sv_admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
