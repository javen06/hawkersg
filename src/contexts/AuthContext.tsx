import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  type: 'consumer' | 'business';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'consumer' | 'business') => Promise<void>;
  signup: (email: string, password: string, name: string, userType: 'consumer' | 'business') => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('hawker_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'consumer' | 'business') => {
    setLoading(true);
    try {
      // Mock authentication - replace with real auth
      const mockUser: User = {
        id: `${userType}_${Date.now()}`,
        email,
        name: email.split('@')[0],
        type: userType,
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      localStorage.setItem('hawker_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, userType: 'consumer' | 'business') => {
    setLoading(true);
    try {
      // Mock signup - replace with real auth
      const mockUser: User = {
        id: `${userType}_${Date.now()}`,
        email,
        name,
        type: userType,
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      localStorage.setItem('hawker_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hawker_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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