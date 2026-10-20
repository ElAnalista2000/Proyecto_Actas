// src/components/EditDrawer.tsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, CheckCircle2, Clock, Trash2, MessageSquare } from 'lucide-react';
import { Commitment } from '../types';

interface EditDrawerProps {
  /** Commitment to edit; if null the drawer stays closed */
  commit: Commitment | null;
  /** Called when the drawer should be closed */
  onClose: () => void;
  /** Persist the updated commitment */
  onSave: (updated: Commitment) => void;
  /** Optional delete action */
  onDelete?: (id: string) => void;
}

export const EditDrawer: React.FC<EditDrawerProps> = ({ commit, onClose, onSave, onDelete }) => {
  const [local, setLocal] = useState<Commitment | null>(null);

  useEffect(() => {
    setLocal(commit);
  }, [commit]);

  if (!commit || !local) {
    return null; // drawer hidden
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const value = target.type === 'checkbox' && 'checked' in target 
      ? (target as HTMLInputElement).checked 
      : target.value;

    setLocal(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [target.name]: value };

      // Si cambia el checkbox completado, sincronizar status
      if (target.name === 'completed') {
        const isDone = Boolean(value);
        updated.status = isDone ? 'CUMPLIDO' : (prev.status === 'CUMPLIDO' ? 'PENDIENTE' : prev.status);
        updated.completedAt = isDone ? (prev.completedAt || new Date().toISOString().split('T')[0]) : undefined;
      }

      // Si cambia el status, sincronizar completed
      if (target.name === 'status') {
        const isDone = value === 'CUMPLIDO';
        updated.completed = isDone;
        updated.completedAt = isDone ? (prev.completedAt || new Date().toISOString().split('T')[0]) : undefined;
      }

      return updated;
    });
  };

  const handleQuickDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    setLocal(prev => prev ? { ...prev, dueDate: dateStr } : prev);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (local && local.activity.trim()) {
      onSave(local);
      onClose();
    }
  };

  const handleDelete = () => {
    if (local && onDelete && window.confirm('¿Seguro que deseas eliminar este compromiso?')) {
      onDelete(local.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro traslúcido con blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Editar Compromiso
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {local.actaNumber ? `Vinculado al Acta N° ${local.actaNumber}` : 'Modificación de acuerdos y plazos'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              aria-label="Cerrar" 
              className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Actividad / Tarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="activity">
                Descripción de la Actividad / Tarea *
              </label>
              <textarea
                id="activity"
                name="activity"
                rows={3}
                required
                value={local.activity ?? ''}
                onChange={handleChange}
                placeholder="Escribe la descripción clara del compromiso..."
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5" htmlFor="responsible">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Responsable Asignado *
              </label>
              <input
                id="responsible"
                name="responsible"
                type="text"
                required
                value={local.responsible ?? ''}
                onChange={handleChange}
                placeholder="Ej. Ana García (UAM) o Representante Aliado"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              {/* Sugerencias rápidas */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Dirección Alianzas UAM', 'Asesoría Jurídica UAM', 'Docente UAM'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setLocal(prev => prev ? { ...prev, responsible: sug } : prev)}
                    className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5" htmlFor="status">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Estado del Compromiso
              </label>
              <select
                id="status"
                name="status"
                value={local.status}
                onChange={handleChange}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="PENDIENTE">⏳ Pendiente</option>
                <option value="EN_PROCESO">⚙️ En Proceso</option>
                <option value="CUMPLIDO">✅ Cumplido</option>
              </select>
            </div>

            {/* Fecha Límite */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5" htmlFor="dueDate">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Fecha Límite
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={local.dueDate ?? ''}
                onChange={handleChange}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              {/* Botones de ajuste rápido */}
              <div className="flex gap-1.5 mt-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(0)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(7)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                >
                  +7 días
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(15)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                >
                  +15 días
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(30)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                >
                  +30 días
                </button>
              </div>
            </div>

            {/* Acta N° */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="actaNumber">
                Número de Acta / Acuerdo
              </label>
              <input
                id="actaNumber"
                name="actaNumber"
                type="text"
                value={local.actaNumber ?? ''}
                onChange={handleChange}
                placeholder="Ej. 1, 2, 3..."
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Observaciones / Notas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5" htmlFor="comments">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Observaciones y Avances
              </label>
              <textarea
                id="comments"
                name="comments"
                rows={2}
                value={local.comments ?? ''}
                onChange={handleChange}
                placeholder="Notas de avance, links o detalles del acuerdo..."
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Checkbox de finalización rápida */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  id="completed"
                  name="completed"
                  type="checkbox"
                  checked={local.completed ?? false}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">Marcar como tarea cumplida</span>
                  <span className="text-slate-400 text-[11px]">
                    {local.completed && local.completedAt ? `Finalizada el ${local.completedAt}` : 'Actualiza las estadísticas del aliado'}
                  </span>
                </div>
              </label>
            </div>
          </form>

          {/* Footer de Acciones */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Eliminar compromiso"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
