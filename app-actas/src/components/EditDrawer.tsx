// src/components/EditDrawer.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Commitment } from '../types';

interface EditDrawerProps {
  /** Commitment to edit; if null the drawer stays closed */
  commit: Commitment | null;
  /** Called when the drawer should be closed */
  onClose: () => void;
  /** Persist the updated commitment */
  onSave: (updated: Commitment) => void;
}

export const EditDrawer: React.FC<EditDrawerProps> = ({ commit, onClose, onSave }) => {
  // Keep local copy while editing
  const [local, setLocal] = useState<Commitment | null>(null);

  useEffect(() => {
    setLocal(commit);
  }, [commit]);

  if (!commit) {
    return null; // drawer hidden
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setLocal(prev =>
      prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : prev,
    );
  };

  const handleSave = () => {
    if (local) {
      onSave(local);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
      style={{ transform: commit ? 'translateX(0)' : 'translateX(100%)' }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Editar Compromiso</h2>
        <button onClick={onClose} aria-label="Cerrar" className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="activity">
            Actividad
          </label>
          <input
            id="activity"
            name="activity"
            type="text"
            value={local?.activity ?? ''}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="responsible">
            Responsable
          </label>
          <input
            id="responsible"
            name="responsible"
            type="text"
            value={local?.responsible ?? ''}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dueDate">
            Fecha límite
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={local?.dueDate ?? ''}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="completed"
            name="completed"
            type="checkbox"
            checked={local?.completed ?? false}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="completed" className="text-sm font-medium">
            Completado
          </label>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
