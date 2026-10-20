// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ally, Acta, SignedActa, Commitment, CommitmentStatus } from '../types';
import { seedData, seedActas, seedSignedActas } from '../data/seedData';

interface AppContextType {
  allies: Ally[];
  selectedAllyId: string; // 'all' or ally.id
  setSelectedAllyId: (id: string) => void;
  actas: Acta[];
  signedActas: SignedActa[];
  selectedActa: Acta | null;
  setSelectedActa: (acta: Acta | null) => void;
  // Filters & State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterUrgentDays: number | null; // e.g. 3 for <= 3 days alert
  setFilterUrgentDays: (days: number | null) => void;
  // CRUD Actions
  addActa: (acta: Acta) => void;
  addSignedActa: (signed: SignedActa) => void;
  updateCommitment: (updated: Commitment) => void;
  updateCommitmentStatus: (id: string, status: CommitmentStatus) => void;
  restoreInitialData: () => void;
  // Computed
  urgentCount: number;
}

const STORAGE_ALLIES = 'uam_actas_allies';
const STORAGE_ACTAS = 'uam_actas_documents';
const STORAGE_SIGNED = 'uam_actas_signed';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [allies, setAllies] = useState<Ally[]>(() => {
    const saved = localStorage.getItem(STORAGE_ALLIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return seedData.allies;
  });

  const [actas, setActas] = useState<Acta[]>(() => {
    const saved = localStorage.getItem(STORAGE_ACTAS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return seedActas;
  });

  const [signedActas, setSignedActas] = useState<SignedActa[]>(() => {
    const saved = localStorage.getItem(STORAGE_SIGNED);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return seedSignedActas;
  });

  const [selectedAllyId, setSelectedAllyId] = useState<string>('all');
  const [selectedActa, setSelectedActa] = useState<Acta | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterUrgentDays, setFilterUrgentDays] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_ALLIES, JSON.stringify(allies));
  }, [allies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTAS, JSON.stringify(actas));
  }, [actas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SIGNED, JSON.stringify(signedActas));
  }, [signedActas]);

  const restoreInitialData = () => {
    localStorage.removeItem(STORAGE_ALLIES);
    localStorage.removeItem(STORAGE_ACTAS);
    localStorage.removeItem(STORAGE_SIGNED);
    setAllies(seedData.allies);
    setActas(seedActas);
    setSignedActas(seedSignedActas);
    setSelectedAllyId('all');
    setSelectedActa(null);
    setSearchQuery('');
    setFilterUrgentDays(null);
  };

  const addActa = (newActa: Acta) => {
    setActas(prev => {
      if (prev.some(a => a.fingerprint === newActa.fingerprint)) return prev;
      return [newActa, ...prev];
    });

    // Also link commitments to the ally or create ally if not exists
    setAllies(prev => {
      const allyIndex = prev.findIndex(a => a.id.toLowerCase() === newActa.allyId.toLowerCase());
      if (allyIndex >= 0) {
        const existingAlly = prev[allyIndex];
        const newCommitments = newActa.commitments.filter(
          nc => !existingAlly.commitments.some(ec => ec.id === nc.id || ec.activity === nc.activity)
        );
        const updated = [...prev];
        updated[allyIndex] = {
          ...existingAlly,
          commitments: [...existingAlly.commitments, ...newCommitments]
        };
        return updated;
      } else {
        const newAlly: Ally = {
          id: newActa.allyId,
          name: newActa.allyId.charAt(0).toUpperCase() + newActa.allyId.slice(1),
          category: 'Empresa',
          commitments: newActa.commitments
        };
        return [...prev, newAlly];
      }
    });
  };

  const addSignedActa = (newSigned: SignedActa) => {
    setSignedActas(prev => {
      if (prev.some(s => s.fingerprint === newSigned.fingerprint)) return prev;
      return [newSigned, ...prev];
    });
  };

  const updateCommitment = (updated: Commitment) => {
    setAllies(prev =>
      prev.map(ally => ({
        ...ally,
        commitments: ally.commitments.map(c => (c.id === updated.id ? updated : c))
      }))
    );
  };

  const updateCommitmentStatus = (id: string, status: CommitmentStatus) => {
    const isCompleted = status === 'CUMPLIDO';
    setAllies(prev =>
      prev.map(ally => ({
        ...ally,
        commitments: ally.commitments.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status,
              completed: isCompleted,
              completedAt: isCompleted ? (c.completedAt || new Date().toISOString()) : undefined
            };
          }
          return c;
        })
      }))
    );
  };

  // Urgent commitments calculation (<= 3 days or overdue and not completed)
  const urgentCount = allies.flatMap(a => a.commitments).filter(c => {
    if (c.status === 'CUMPLIDO' || c.completed) return false;
    if (!c.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(c.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  return (
    <AppContext.Provider
      value={{
        allies,
        selectedAllyId,
        setSelectedAllyId,
        actas,
        signedActas,
        selectedActa,
        setSelectedActa,
        searchQuery,
        setSearchQuery,
        filterUrgentDays,
        setFilterUrgentDays,
        addActa,
        addSignedActa,
        updateCommitment,
        updateCommitmentStatus,
        restoreInitialData,
        urgentCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
