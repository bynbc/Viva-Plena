import React, { createContext, useContext, ReactNode } from 'react';
import { useBrain } from './BrainContext';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  permissions: any;
  clinicId: string | null;
  login: (username: string, passwordHash: string) => Promise<{ success: boolean, errorCode?: string }>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { brain, login: brainLogin, logout } = useBrain();

  const hasPermission = (module: string) => {
    if (brain.session.user?.role === 'ADMIN') return true;
    return (brain.session.permissions as any)?.[module] || false;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: brain.session.isAuthenticated, 
      user: brain.session.user, 
      permissions: brain.session.permissions,
      clinicId: brain.session.clinicId,
      login: brainLogin, 
      logout,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};