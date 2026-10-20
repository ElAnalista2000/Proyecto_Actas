// src/components/NewAllyModal.tsx
import React, { useState } from 'react';
import { X, Building2, User, Mail, Tag, Plus } from 'lucide-react';
import { Ally } from '../types';
import { useApp } from '../context/AppContext';

interface NewAllyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (ally: Ally) => void;
}

export const NewAllyModal: React.FC<NewAllyModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { addAlly } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Empresa' | 'Universidad' | 'Gobierno' | 'Gremio' | 'ONG'>('Empresa');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newAlly: Ally = {
      id,
      name: name.trim(),
      category,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      commitments: []
    };

    addAlly(newAlly);
    if (onCreated) onCreated(newAlly);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
          
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Aliado</h3>
                <p className="text-xs text-slate-500">Agrega una institución o empresa aliada</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="ally-name">
                Nombre de la Entidad o Aliado *
              </label>
              <input
                id="ally-name"
                type="text"
                required
                placeholder="Ej. Chec Grupo EPM, Cámara de Comercio..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Categoría Institucional
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Empresa">Empresa</option>
                <option value="Gremio">Gremio</option>
                <option value="Gobierno">Gobierno / Sector Público</option>
                <option value="Universidad">Universidad / Academia</option>
                <option value="ONG">ONG / Fundación</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5" htmlFor="contact-name">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Persona de Contacto o Enlace
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Nombre del enlace o directivo"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5" htmlFor="contact-email">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Correo Electrónico de Contacto
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="contacto@entidad.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm shadow-indigo-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Registrar Aliado
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
