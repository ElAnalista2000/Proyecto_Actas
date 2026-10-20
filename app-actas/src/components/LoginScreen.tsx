// src/components/LoginScreen.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, LogIn, Loader2 } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loading, login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-amber-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
            <FileText className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Gestor de Actas UAM
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Dirección de Alianzas Estratégicas
          </p>

          {loading ? (
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Verificando sesión...</span>
            </div>
          ) : (
            <>
              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </button>
              <p className="text-xs text-slate-500 mt-4">
                Acceso restringido al equipo UAM
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} Universidad Autónoma de Manizales
        </p>
      </div>
    </div>
  );
};
