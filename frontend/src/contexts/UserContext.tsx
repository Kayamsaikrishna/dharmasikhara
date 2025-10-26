import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'client';
  firstName?: string;
  lastName?: string;
  institution?: string;
  year?: string;
  specialization?: string;
  createdAt?: string;
  subscription?: any;
  documents?: any[];
}

interface UserContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  token: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing user data in localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Check if token is still valid
        if (isTokenValid(savedToken)) {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          // Token expired, clear data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        // If parsing fails, clear the invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Function to check if token is still valid
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  };

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, token }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};