// context/UserContext.tsx
'use client';

import axios from 'axios';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          // Verify session with backend
          const response = await axios.get('/api/auth/session', { withCredentials: true });
          if (response.data.user) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call logout API to clear server session
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true // Important for cookies
      });
      
      // Clear client-side state
      setUser(null);
      localStorage.removeItem('user');
      
      // Force refresh if needed (optional)
      // window.location.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback cleanup
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};