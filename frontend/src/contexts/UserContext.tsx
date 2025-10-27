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

// Define the message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  legalCategory?: string;
  relatedConcepts?: string[];
  confidence?: number;
  sources?: string[];
}

// Define the chat history interface
interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  token: string | null;
  isTokenExpired: () => boolean;
  chatHistory: ChatHistory[];
  addChatHistory: (chat: ChatHistory) => void;
  updateChatHistory: (chatId: string, messages: Message[]) => void;
  deleteChatHistory: (chatId: string) => void;
  clearChatHistory: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Check for existing user data in localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedChatHistory = localStorage.getItem('chatHistory');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Check if token is still valid
        if (isTokenValid(savedToken)) {
          setToken(savedToken);
          setUser(parsedUser);
          
          // Load chat history if available
          if (savedChatHistory) {
            try {
              const parsedChatHistory = JSON.parse(savedChatHistory);
              // Convert timestamp strings to Date objects
              const convertedChatHistory = parsedChatHistory.map((chat: any) => ({
                ...chat,
                createdAt: new Date(chat.createdAt),
                updatedAt: new Date(chat.updatedAt),
                messages: chat.messages.map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp)
                }))
              }));
              setChatHistory(convertedChatHistory);
            } catch (e) {
              console.error('Failed to parse chat history:', e);
            }
          }
        } else {
          // Token expired, clear data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('chatHistory');
        }
      } catch (e) {
        // If parsing fails, clear the invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('chatHistory');
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory, user]);

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

  // Function to check if token is expired
  const isTokenExpired = (): boolean => {
    if (!token) return true;
    return !isTokenValid(token);
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
    setChatHistory([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('chatHistory');
  };

  // Chat history management functions
  const addChatHistory = (chat: ChatHistory) => {
    setChatHistory(prev => [...prev, chat]);
  };

  const updateChatHistory = (chatId: string, messages: Message[]) => {
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages, updatedAt: new Date() } 
          : chat
      )
    );
  };

  const deleteChatHistory = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      token, 
      isTokenExpired,
      chatHistory,
      addChatHistory,
      updateChatHistory,
      deleteChatHistory,
      clearChatHistory
    }}>
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