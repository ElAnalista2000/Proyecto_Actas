// src/components/RestoreButton.tsx
import React from 'react';
import { useSeedData } from '../hooks/useSeedData';
import { RefreshCw } from 'lucide-react';

export const RestoreButton: React.FC = () => {
  const { restoreInitialData } = useSeedData();

  const handleClick = () => {
    if (window.confirm('¿Restaurar los datos semilla? Se perderán los cambios actuales.')) {
      restoreInitialData();
      // Recargar para que la UI refleje el estado inicial
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
    >
      <RefreshCw className="w-4 h-4" />
      Restaurar datos iniciales
    </button>
  );
};
