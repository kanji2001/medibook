import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import useAuthStore, { Availability, AuthUser, RegisterPayload, UserRole } from '@/stores/authStore';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  logout: () => void;
  updateUserAvailability: (availability: Availability) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize, initialized, ...store } = useAuthStore(
    state => ({
      initialize: state.initialize,
      initialized: state.initialized,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      login: state.login,
      register: state.register,
      logout: state.logout,
      updateUserAvailability: state.updateUserAvailability,
    }),
    shallow,
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      loading: store.loading,
      login: store.login,
      register: store.register,
      logout: store.logout,
      updateUserAvailability: store.updateUserAvailability,
    }),
    [
      store.user,
      store.isAuthenticated,
      store.loading,
      store.login,
      store.register,
      store.logout,
      store.updateUserAvailability,
    ],
  );

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
