import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'solar-detector-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage immediately
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    }
    return null;
  });

  const login = () => {
    const userData: User = { isLoggedIn: true };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const register = (location?: { latitude: number; longitude: number }) => {
    const userData: User = {
      isLoggedIn: true,
      location,
    };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAuthenticated = user?.isLoggedIn ?? false;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
