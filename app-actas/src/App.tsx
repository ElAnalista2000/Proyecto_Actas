// src/App.tsx
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { AlliesDirectory } from './pages/AlliesDirectory';
import { DocumentManagement } from './pages/DocumentManagement';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { Kanban } from './pages/Kanban';
import { DailyTasks } from './pages/DailyTasks';
import { 
  Building2, 
  FileText, 
  BarChart3, 
  Layers, 
  CalendarCheck,
  ExternalLink
} from 'lucide-react';

type ViewMode = 'allies' | 'docs' | 'dashboard' | 'kanban' | 'daily';

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewMode>('allies');

  const navItems = [
    { id: 'allies' as ViewMode, label: 'Directorio de Aliados', icon: Building2 },
    { id: 'docs' as ViewMode, label: 'Gestión Documental', icon: FileText },
    { id: 'dashboard' as ViewMode, label: 'Dashboard Ejecutivo', icon: BarChart3 },
    { id: 'kanban' as ViewMode, label: 'Tablero Kanban', icon: Layers },
    { id: 'daily' as ViewMode, label: 'Tareas del Día / Semana', icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header Fijo con Selector de Aliados, Alertas y Mammoth Import */}
      <Header />

      {/* Navegación por pestañas moderna */}
      <nav className="bg-white border-b border-slate-200/80 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenedor Principal de Vistas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'allies' && <AlliesDirectory />}
        {currentView === 'docs' && <DocumentManagement />}
        {currentView === 'dashboard' && <ExecutiveDashboard />}
        {currentView === 'kanban' && <Kanban />}
        {currentView === 'daily' && <DailyTasks />}
      </main>

      {/* Footer Institucional */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Dirección de Alianzas Estratégicas - Universidad Autónoma de Manizales (UAM)</p>
          <p className="flex items-center gap-1 font-medium text-slate-600">
            <span>Sistema Autónomo de Gestión de Actas y Compromisos</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
