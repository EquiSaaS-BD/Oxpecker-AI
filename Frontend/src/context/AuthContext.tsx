"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'patient' | 'doctor' | 'hospital' | 'admin' | 'assistant' | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  image?: string;
  assistantId?: string;
  doctorId?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, check if there's a user in localStorage and sync with users DB
  useEffect(() => {
    const storedUser = localStorage.getItem('shustota_user');
    if (storedUser) {
      try {
        let parsedUser = JSON.parse(storedUser);
        
        // Sync with users database to ensure latest fields (assistantId, doctorId) are present
        const usersStr = localStorage.getItem('shustota_users');
        if (usersStr) {
          const users = JSON.parse(usersStr);
          const dbUser = users.find((u: any) => u.id === parsedUser.id);
          if (dbUser) {
            parsedUser = { 
              ...parsedUser, 
              assistantId: dbUser.assistantId || parsedUser.assistantId, 
              doctorId: dbUser.doctorId || parsedUser.doctorId 
            };
            // Persist the synced user back
            localStorage.setItem('shustota_user', JSON.stringify(parsedUser));
          }
        }
        
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('shustota_user', JSON.stringify(userData));
    
    // Route based on role
    if (userData.role === 'patient') {
      router.push('/chat'); // Patient Dashboard is the AI Chat Interface
    } else if (userData.role === 'doctor') {
      router.push('/doctor/dashboard'); // Doctor dashboard
    } else if (userData.role === 'hospital') {
      router.push('/hospital/dashboard');
    } else if (userData.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (userData.role === 'assistant') {
      router.push('/assistant');
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shustota_user');
    router.push('/login');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('shustota_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        isLoading
      }}
    >
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
