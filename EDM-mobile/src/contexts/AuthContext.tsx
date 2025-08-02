import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, LoginCredentials, RegisterCredentials, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const user = await authService.getCurrentUser();
      setState({ user, loading: false });
    } catch (error) {
      console.error('Error loading user:', error);
      setState({ user: null, loading: false });
    }
  }

  async function login(credentials: LoginCredentials) {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const user = await authService.login(credentials);
      if (!user) throw new Error('Login failed');
      setState({ user, loading: false });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }

  async function register(credentials: RegisterCredentials) {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const user = await authService.register(credentials);
      setState({ user, loading: false });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }

  async function logout() {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await authService.logout();
      setState({ user: null, loading: false });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 