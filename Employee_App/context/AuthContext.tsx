import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

// Dummy authentication — no real backend or password checking.
// Any non-empty email + password combination "logs in" successfully.
// Swapping this for a real API later just means changing what
// happens inside `login()`, nothing else in the app needs to change.
type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  function login(email: string, password: string): boolean {
    if (!email.trim() || !password.trim()) return false;

    // Build a dummy user profile from the entered email.
    const namePart = email.split('@')[0];
    const displayName = namePart
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    setUser({
      name: displayName || 'Jane Doe',
      email,
      employeeId: 'EMP-2026-0417',
    });
    setIsLoggedIn(true);
    return true;
  }

  function logout() {
    setIsLoggedIn(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
