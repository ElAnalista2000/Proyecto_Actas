// src/pages/Kanban.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  Edit3,
  Layers,
  Sparkles
} from 'lucide-react';
import { Commitment, CommitmentStatus } from '../types';
import { EditDrawer } from '../components/EditDrawer';

export const Kanban: React.FC = () => {
  const { 
    allies, 
    selectedAllyId, 
    searchQuery, 
    filterUrgentDays, 
    updateCommitmentStatus,
    updateCommitment,
    deleteCommitment
  } = useApp();

  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  // Obtener compromisos aplicando filtros
  const allCommitments: Commitment[] = allies
    .filter(a => selectedAllyId === 'all' || a.id === selectedAllyId)
    .flatMap(a => a.commitments)
    .filter(c => {
      // Búsqueda
      const matchesSearch = !searchQuery || 
        c.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.responsible.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtro de urgencia (<= 3 días o vencido)
      if (filterUrgentDays !== null) {
        if (c.status === 'CUMPLIDO' || c.completed) return false;
        if (!c.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(c.dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff > filterUrgentDays) return false;
      }
      return matchesSearch;
    });

  const columns: { title: string; status: CommitmentStatus; icon: React.ReactNode; color: string; badge: string }[] = [
    {
      title: 'Pendientes',
      status: 'PENDIENTE',
      icon: <Clock className="w-4 h-4 text-slate-500" />,
      color: 'border-slate-300 bg-slate-50/50',
      badge: 'bg-slate-200 text-slate-800'
    },
    {
      title: 'En Proceso',
      status: 'EN_PROCESO',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      color: 'border-amber-300 bg-amber-50/30',
      badge: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'Cumplidos',
      status: 'CUMPLIDO',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      color: 'border-emerald-300 bg-emerald-50/30',
      badge: 'bg-emerald-100 text-emerald-800'
    }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: CommitmentStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      updateCommitmentStatus(id, status);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Tablero Kanban de Compromisos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Arrastra las tarjetas entre columnas o usa los botones de acción rápida para actualizar el estado
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{allCommitments.length} compromisos visibles</span>
        </div>
      </div>

      {/* Grid de 3 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colCommitments = allCommitments.filter(c => {
            if (col.status === 'CUMPLIDO') return c.status === 'CUMPLIDO' || c.completed;
            if (col.status === 'EN_PROCESO') return c.status === 'EN_PROCESO';
            return c.status === 'PENDIENTE' && !c.completed;
          });

          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex flex-col rounded-2xl border ${col.color} p-4 min-h-[500px] transition-all`}
            >
              {/* Header Columna */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className="text-sm font-bold text-slate-800">{col.title}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {colCommitments.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colCommitments.map(item => {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const due = new Date(item.dueDate);
                  due.setHours(0,0,0,0);
                  const isOverdue = due < today && !item.completed && item.status !== 'CUMPLIDO';
                  const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysDiff <= 3 && daysDiff >= 0 && !item.completed && item.status !== 'CUMPLIDO';

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      {/* Alerta de urgencia visual */}
                      {isOverdue && (
                        <div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>¡Vencido! ({item.dueDate})</span>
                        </div>
                      )}
                      {!isOverdue && isUrgent && (
                        <div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Vence en {daysDiff} días</span>
                        </div>
                      )}

                      {/* Asunto / Actividad */}
                      <p className="text-xs font-semibold text-slate-900 leading-relaxed mb-3">
                        {item.activity}
                      </p>

                      {/* Detalles: Responsable y Fecha */}
                      <div className="space-y-1.5 text-[11px] text-slate-500 mb-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.responsible}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>Límite: {item.dueDate}</span>
                        </div>
                      </div>

                      {/* Acciones de la Tarjeta */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setEditingCommitment(item)}
                          className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {col.status !== 'PENDIENTE' && (
                            <button
                              onClick={() => updateCommitmentStatus(item.id, 'PENDIENTE')}
                              title="Mover a Pendiente"
                              className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                            >
                              ←
                            </button>
                          )}
                          {col.status !== 'EN_PROCESO' && (
                            <button
                              onClick={() => updateCommitmentStatus(item.id, 'EN_PROCESO')}
                              title="Mover a En Proceso"
                              className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 hover:bg-amber-200 text-amber-700 rounded"
                            >
                              Proceso
                            </button>
                          )}
                          {col.status !== 'CUMPLIDO' && (
                            <button
                              onClick={() => updateCommitmentStatus(item.id, 'CUMPLIDO')}
                              title="Marcar Cumplido"
                              className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded"
                            >
                              ✓ Listo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colCommitments.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400">Sin compromisos en esta fase</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer de Edición */}
      {editingCommitment && (
        <EditDrawer
          commit={editingCommitment}
          onClose={() => setEditingCommitment(null)}
          onSave={(updated) => updateCommitment(updated)}
          onDelete={(id) => deleteCommitment(id)}
        />
      )}
    </div>
  );
};
