// src/hooks/useSeedData.ts
import { useState, useEffect } from 'react';
import { SeedData } from '../types';
import { seedData as initial } from '../data/seedData';

const STORAGE_KEY = 'gestor-actas-seed';

export const useSeedData = () => {
  const [data, setData] = useState<SeedData>(initial);

  // Load from localStorage if present
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  const save = (newData: SeedData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
  };

  const restoreInitialData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initial);
  };

  return { data, save, restoreInitialData };
};
