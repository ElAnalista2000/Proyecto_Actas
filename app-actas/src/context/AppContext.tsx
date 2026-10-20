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
  addCommitment: (allyId: string, item: Omit<Commitment, 'id'> | Commitment) => void;
  updateCommitment: (updated: Commitment) => void;
  updateCommitmentStatus: (id: string, status: CommitmentStatus) => void;
  updateCommitmentResponsible: (id: string, responsible: string) => void;
  deleteCommitment: (id: string) => void;
  addAlly: (ally: Ally) => void;
  updateAlly: (ally: Ally) => void;
  deleteAlly: (allyId: string) => void;
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
      const filtered = prev.filter(a => a.fingerprint !== newActa.fingerprint && a.id !== newActa.id);
      return [newActa, ...filtered];
    });

    // Also link commitments to the ally or create ally if not exists
    setAllies(prev => {
      const allyIndex = prev.findIndex(a => a.id.toLowerCase() === newActa.allyId.toLowerCase());
      if (allyIndex >= 0) {
        const existingAlly = prev[allyIndex];
        // Filtrar compromisos genéricos antiguos de fallback
        const existingCleanCommitments = existingAlly.commitments.filter(
          c => !c.activity.toLowerCase().includes('revisión y seguimiento integral de acuerdos')
        );

        const newCommitments = newActa.commitments.filter(
          nc => !existingCleanCommitments.some(
            ec => ec.id === nc.id || ec.activity.trim().toLowerCase() === nc.activity.trim().toLowerCase()
          )
        );

        const updated = [...prev];
        updated[allyIndex] = {
          ...existingAlly,
          name: newActa.allyName || existingAlly.name,
          category: newActa.category || existingAlly.category,
          contactName: newActa.contactName || existingAlly.contactName,
          commitments: [...newCommitments, ...existingCleanCommitments]
        };
        return updated;
      } else {
        const newAlly: Ally = {
          id: newActa.allyId,
          name: newActa.allyName || (newActa.allyId.charAt(0).toUpperCase() + newActa.allyId.slice(1)),
          category: newActa.category || 'Empresa',
          contactName: newActa.contactName,
          commitments: newActa.commitments
        };
        return [newAlly, ...prev];
      }
    });
  };

  const addSignedActa = (newSigned: SignedActa) => {
    setSignedActas(prev => {
      if (prev.some(s => s.fingerprint === newSigned.fingerprint)) return prev;
      return [newSigned, ...prev];
    });
  };

  const addCommitment = (allyId: string, item: Omit<Commitment, 'id'> | Commitment) => {
    const isCompleted = item.status === 'CUMPLIDO' || !!item.completed;
    const newCommitment: Commitment = {
      id: 'id' in item && item.id ? item.id : `${allyId}-c-${Date.now()}`,
      activity: item.activity,
      responsible: item.responsible || 'Por asignar',
      dueDate: item.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: item.status || (isCompleted ? 'CUMPLIDO' : 'PENDIENTE'),
      completed: isCompleted,
      completedAt: isCompleted ? (item.completedAt || new Date().toISOString().split('T')[0]) : undefined,
      actaNumber: item.actaNumber || '1',
      allyId: allyId,
      comments: item.comments || ''
    };

    setAllies(prev =>
      prev.map(ally => {
        if (ally.id.toLowerCase() === allyId.toLowerCase()) {
          return {
            ...ally,
            commitments: [newCommitment, ...ally.commitments]
          };
        }
        return ally;
      })
    );

    // Sync in actas if matches actaNumber
    if (newCommitment.actaNumber) {
      setActas(prev =>
        prev.map(acta => {
          if (acta.allyId.toLowerCase() === allyId.toLowerCase() && acta.number === newCommitment.actaNumber) {
            return {
              ...acta,
              commitments: [newCommitment, ...acta.commitments]
            };
          }
          return acta;
        })
      );
    }
  };

  const updateCommitment = (updated: Commitment) => {
    const isCompleted = updated.status === 'CUMPLIDO' || !!updated.completed;
    const normalized: Commitment = {
      ...updated,
      status: isCompleted ? 'CUMPLIDO' : (updated.status || 'PENDIENTE'),
      completed: isCompleted,
      completedAt: isCompleted ? (updated.completedAt || new Date().toISOString().split('T')[0]) : undefined
    };

    setAllies(prev =>
      prev.map(ally => ({
        ...ally,
        commitments: ally.commitments.map(c => (c.id === normalized.id ? normalized : c))
      }))
    );

    setActas(prev =>
      prev.map(acta => ({
        ...acta,
        commitments: acta.commitments.map(c => (c.id === normalized.id ? normalized : c))
      }))
    );
  };

  const updateCommitmentStatus = (id: string, status: CommitmentStatus) => {
    const isCompleted = status === 'CUMPLIDO';
    const updater = (c: Commitment): Commitment => {
      if (c.id === id) {
        return {
          ...c,
          status,
          completed: isCompleted,
          completedAt: isCompleted ? (c.completedAt || new Date().toISOString().split('T')[0]) : undefined
        };
      }
      return c;
    };

    setAllies(prev =>
      prev.map(ally => ({
        ...ally,
        commitments: ally.commitments.map(updater)
      }))
    );

    setActas(prev =>
      prev.map(acta => ({
        ...acta,
        commitments: acta.commitments.map(updater)
      }))
    );
  };

  const updateCommitmentResponsible = (id: string, responsible: string) => {
    const updater = (c: Commitment): Commitment => (c.id === id ? { ...c, responsible } : c);
    setAllies(prev =>
      prev.map(ally => ({
        ...ally,
        commitments: ally.commitments.map(updater)
      }))
    );
    setActas(prev =>
      prev.map(acta => ({
        ...acta,
        commitments: acta.commitments.map(updater)
      }))
    );
  };

  const deleteCommitment = (id: string) => {
    setAllies(prev =>
      prev.map(ally => ({
        ...ally,
        commitments: ally.commitments.filter(c => c.id !== id)
      }))
    );
    setActas(prev =>
      prev.map(acta => ({
        ...acta,
        commitments: acta.commitments.filter(c => c.id !== id)
      }))
    );
  };

  const addAlly = (newAlly: Ally) => {
    setAllies(prev => {
      if (prev.some(a => a.id.toLowerCase() === newAlly.id.toLowerCase())) {
        return prev;
      }
      return [newAlly, ...prev];
    });
  };

  const updateAlly = (updatedAlly: Ally) => {
    setAllies(prev => prev.map(a => (a.id === updatedAlly.id ? updatedAlly : a)));
  };

  const deleteAlly = (allyId: string) => {
    setAllies(prev => prev.filter(a => a.id !== allyId));
    setActas(prev => prev.filter(a => a.allyId !== allyId));
    setSignedActas(prev => prev.filter(s => s.allyId !== allyId));
    if (selectedAllyId === allyId) {
      setSelectedAllyId('all');
    }
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
        addCommitment,
        updateCommitment,
        updateCommitmentStatus,
        updateCommitmentResponsible,
        deleteCommitment,
        addAlly,
        updateAlly,
        deleteAlly,
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
