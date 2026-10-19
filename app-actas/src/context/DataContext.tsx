import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ally } from '../types';
import { seedData } from '../seedData';

type DataContextType = {
  allies: Ally[];
  setAllies: React.Dispatch<React.SetStateAction<Ally[]>>;
  resetSeedData: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [allies, setAllies] = useState<Ally[]>(seedData.allies);

  const resetSeedData = () => setAllies(seedData.alies);

  return (
    <DataContext.Provider value={{ allies, setAllies, resetSeedData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
};
