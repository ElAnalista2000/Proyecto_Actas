// src/context/AppContext.tsx
// Estado global conectado al backend Netlify (/api/*)
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Ally, Acta, SignedActa, Commitment, CommitmentStatus } from '../types';
import { api } from '../hooks/useApi';

interface AppContextType {
  allies: Ally[];
  selectedAllyId: string;
  setSelectedAllyId: (id: string) => void;
  actas: Acta[];
  signedActas: SignedActa[];
  selectedActa: Acta | null;
  setSelectedActa: (acta: Acta | null) => void;
  // Filters & State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterUrgentDays: number | null;
  setFilterUrgentDays: (days: number | null) => void;
  filterSemaforo: 'all' | 'red' | 'yellow' | 'green';
  setFilterSemaforo: (f: 'all' | 'red' | 'yellow' | 'green') => void;
  // Loading & errors
  loading: boolean;
  error: string | null;
  // CRUD Actions
  addActa: (acta: Acta, file?: File | null) => Promise<void>;
  addSignedActa: (signed: SignedActa, file?: File | null) => Promise<void>;
  addCommitment: (allyId: string, item: Omit<Commitment, 'id'> | Commitment) => Promise<void>;
  updateCommitment: (updated: Commitment) => Promise<void>;
  updateCommitmentStatus: (id: string, status: CommitmentStatus) => Promise<void>;
  updateCommitmentResponsible: (id: string, responsible: string) => Promise<void>;
  deleteCommitment: (id: string) => Promise<void>;
  addAlly: (ally: Ally) => Promise<void>;
  updateAlly: (ally: Ally) => Promise<void>;
  deleteAlly: (allyId: string) => Promise<void>;
  restoreInitialData: () => Promise<void>;
  reloadState: () => Promise<void>;
  // Computed
  urgentCount: number;
  // Theme
  theme: string;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [allies, setAllies] = useState<Ally[]>([]);
  const [actas, setActas] = useState<Acta[]>([]);
  const [signedActas, setSignedActas] = useState<SignedActa[]>([]);
  const [selectedAllyId, setSelectedAllyId] = useState<string>('all');
  const [selectedActa, setSelectedActa] = useState<Acta | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterUrgentDays, setFilterUrgentDays] = useState<number | null>(null);
  const [filterSemaforo, setFilterSemaforo] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dark mode
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('uam_actas_theme') || 'light');

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('uam_actas_theme', next);
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  // Aplica el tema guardado al iniciar
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Carga el estado completo desde la API */
  const reloadState = useCallback(async () => {
    try {
      setError(null);
      const state = await api.getState();
      setAllies(state.allies);
      setActas(state.actas);
      setSignedActas(state.signedActas);
    } catch (e: any) {
      setError(e.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reloadState(); }, [reloadState]);

  // ── Helpers ──────────────────────────────────────────────
  const applyState = (state: { allies: Ally[]; actas: Acta[]; signedActas: SignedActa[] }) => {
    setAllies(state.allies);
    setActas(state.actas);
    setSignedActas(state.signedActas);
  };

  // ── Actas ─────────────────────────────────────────────────
  const addActa = async (acta: Acta, file: File | null = null) => {
    const state = await api.addActa(acta, file);
    applyState(state);
    setSelectedAllyId(acta.allyId);
  };

  const addSignedActa = async (signed: SignedActa, file: File | null = null) => {
    const state = await api.addSignedActa(signed, file);
    applyState(state);
  };

  // ── Compromisos ───────────────────────────────────────────
  const addCommitment = async (allyId: string, item: Omit<Commitment, 'id'> | Commitment) => {
    const newC = await api.addCommitment(allyId, item);
    setAllies(prev => prev.map(a =>
      a.id.toLowerCase() === allyId.toLowerCase()
        ? { ...a, commitments: [newC, ...a.commitments] }
        : a
    ));
  };

  const updateCommitment = async (updated: Commitment) => {
    const c = await api.updateCommitment(updated);
    const updater = (prev: Commitment[]) => prev.map(x => x.id === c.id ? c : x);
    setAllies(prev => prev.map(a => ({ ...a, commitments: updater(a.commitments) })));
    setActas(prev => prev.map(a => ({ ...a, commitments: updater(a.commitments) })));
  };

  const updateCommitmentStatus = async (id: string, status: CommitmentStatus) => {
    const target = allies.flatMap(a => a.commitments).find(c => c.id === id);
    if (!target) return;
    await updateCommitment({ ...target, status, completed: status === 'CUMPLIDO' });
  };

  const updateCommitmentResponsible = async (id: string, responsible: string) => {
    const target = allies.flatMap(a => a.commitments).find(c => c.id === id);
    if (!target) return;
    await updateCommitment({ ...target, responsible });
  };

  const deleteCommitment = async (id: string) => {
    await api.deleteCommitment(id);
    setAllies(prev => prev.map(a => ({ ...a, commitments: a.commitments.filter(c => c.id !== id) })));
    setActas(prev => prev.map(a => ({ ...a, commitments: a.commitments.filter(c => c.id !== id) })));
  };

  // ── Aliados ───────────────────────────────────────────────
  const addAlly = async (ally: Ally) => {
    const state = await api.addAlly(ally);
    applyState(state);
  };

  const updateAlly = async (ally: Ally) => {
    const state = await api.updateAlly(ally);
    applyState(state);
  };

  const deleteAlly = async (allyId: string) => {
    await api.deleteAlly(allyId);
    setAllies(prev => prev.filter(a => a.id !== allyId));
    setActas(prev => prev.filter(a => a.allyId !== allyId));
    setSignedActas(prev => prev.filter(s => s.allyId !== allyId));
    if (selectedAllyId === allyId) setSelectedAllyId('all');
  };

  const restoreInitialData = async () => {
    setLoading(true);
    const state = await api.restore();
    applyState(state);
    setSelectedAllyId('all');
    setSelectedActa(null);
    setSearchQuery('');
    setFilterUrgentDays(null);
    setFilterSemaforo('all');
    setLoading(false);
  };

  // ── Computed ──────────────────────────────────────────────
  const urgentCount = allies.flatMap(a => a.commitments).filter(c => {
    if (c.status === 'CUMPLIDO' || c.completed) return false;
    if (!c.dueDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(c.dueDate); due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / 86400000) <= 3;
  }).length;

  return (
    <AppContext.Provider value={{
      allies, selectedAllyId, setSelectedAllyId,
      actas, signedActas, selectedActa, setSelectedActa,
      searchQuery, setSearchQuery,
      filterUrgentDays, setFilterUrgentDays,
      filterSemaforo, setFilterSemaforo,
      loading, error,
      addActa, addSignedActa,
      addCommitment, updateCommitment, updateCommitmentStatus, updateCommitmentResponsible, deleteCommitment,
      addAlly, updateAlly, deleteAlly,
      restoreInitialData, reloadState,
      urgentCount,
      theme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
