import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/api';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface Availability {
  status: 'available' | 'unavailable' | 'limited';
  workingHours: {
    day: string;
    isWorking: boolean;
    timeSlots: string[];
  }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  availability?: Availability;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, role: string) => Promise<any>;
  logout: () => void;
  updateUserAvailability: (availability: Availability) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Decode token to get basic user info
          const decoded: any = jwtDecode(token);
          
          if (decoded.exp * 1000 > Date.now()) {
            // Token is valid, fetch full user profile
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token expired, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.token) {
        const decoded: any = jwtDecode(response.token);
        setUser({
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          avatar: decoded.avatar
        });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await authService.register({ name, email, password, role });
      
      if (response.success && response.token) {
        const decoded: any = jwtDecode(response.token);
        setUser({
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          avatar: decoded.avatar
        });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserAvailability = (availability: Availability) => {
    if (user) {
      // Update the user object with new availability
      const updatedUser = { ...user, availability };
      setUser(updatedUser);
      
      // Also update in localStorage for persistence (this would be an API call in production)
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        storedUsers[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(storedUsers));
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserAvailability,
  };

  if (loading) {
    // Loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
