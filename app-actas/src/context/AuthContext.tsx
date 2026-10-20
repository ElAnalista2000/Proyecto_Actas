// src/context/AuthContext.tsx
// Gestiona la sesión del usuario con Netlify Identity (GoTrue)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

export interface NetlifyUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string; avatar_url?: string };
}

interface AuthContextType {
  user: NetlifyUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<NetlifyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carga el script de Netlify Identity Widget si no está ya cargado
    const loadIdentity = () => {
      if (window.netlifyIdentity) {
        init();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
      script.onload = init;
      document.head.appendChild(script);
    };

    const init = () => {
      const ni = window.netlifyIdentity;
      if (!ni) return;

      ni.on('init', (u: NetlifyUser | null) => {
        setUser(u);
        setLoading(false);
        if (u) ni.close();
      });

      ni.on('login', (u: NetlifyUser) => {
        setUser(u);
        ni.close();
      });

      ni.on('logout', () => {
        setUser(null);
      });

      ni.on('error', (err: Error) => {
        console.error('Netlify Identity error:', err);
        setLoading(false);
      });

      ni.init();
    };

    loadIdentity();
  }, []);

  const login = () => window.netlifyIdentity?.open('login');
  const logout = () => window.netlifyIdentity?.logout();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
