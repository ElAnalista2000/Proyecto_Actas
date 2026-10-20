// src/pages/DailyTasks.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Calendar
} from 'lucide-react';
import { Commitment } from '../types';
import { EditDrawer } from '../components/EditDrawer';

export const DailyTasks: React.FC = () => {
  const { 
    allies, 
    selectedAllyId, 
    searchQuery, 
    updateCommitmentStatus,
    updateCommitment
  } = useApp();

  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Rango para esta semana (7 días a partir de hoy)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // Aplanar compromisos
  const commitments: Commitment[] = allies
    .filter(a => selectedAllyId === 'all' || a.id === selectedAllyId)
    .flatMap(a => a.commitments)
    .filter(c => {
      return !searchQuery || 
        c.activity.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.responsible.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Clasificación cronológica
  const overdueTasks = commitments.filter(c => {
    return (c.status !== 'CUMPLIDO' && !c.completed) && c.dueDate && c.dueDate < todayStr;
  });

  const todayTasks = commitments.filter(c => {
    return c.dueDate === todayStr;
  });

  const weekTasks = commitments.filter(c => {
    return c.dueDate > todayStr && c.dueDate <= nextWeekStr;
  });

  const laterTasks = commitments.filter(c => {
    return c.dueDate > nextWeekStr || !c.dueDate;
  });

  const renderTaskCard = (c: Commitment, isUrgent = false) => {
    const isCompleted = c.status === 'CUMPLIDO' || c.completed;

    return (
      <div 
        key={c.id}
        className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isCompleted 
            ? 'border-emerald-200 bg-emerald-50/20 opacity-80' 
            : isUrgent 
            ? 'border-rose-200 bg-rose-50/30' 
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => updateCommitmentStatus(c.id, isCompleted ? 'PENDIENTE' : 'CUMPLIDO')}
            className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center transition flex-shrink-0 ${
              isCompleted 
                ? 'bg-emerald-600 border-emerald-600 text-white' 
                : 'border-slate-300 hover:border-indigo-600 bg-white'
            }`}
            title={isCompleted ? 'Desmarcar' : 'Marcar como completado'}
          >
            {isCompleted && <CheckCircle2 className="w-4 h-4" />}
          </button>

          <div className="min-w-0 flex-1">
            <p className={`text-xs sm:text-sm font-semibold text-slate-900 leading-snug ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {c.activity}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {c.responsible}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Vence: <strong className={isUrgent && !isCompleted ? 'text-rose-600 font-bold' : 'text-slate-700'}>{c.dueDate || 'Sin fecha'}</strong>
              </span>
              {c.status && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === 'CUMPLIDO' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : c.status === 'EN_PROCESO' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {c.status}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setEditingCommitment(c)}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
          >
            Editar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Título de la vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            Agenda Operativa: Tareas del Día y la Semana
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Priorización temporal de actividades y control de cumplimiento a corto plazo
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {overdueTasks.length} Vencidas
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold">
            {todayTasks.length} Hoy
          </span>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold">
            {weekTasks.length} Esta Semana
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tareas Vencidas */}
        {overdueTasks.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Compromisos Vencidos ({overdueTasks.length})
            </h3>
            <div className="space-y-2">
              {overdueTasks.map(t => renderTaskCard(t, true))}
            </div>
          </section>
        )}

        {/* Tareas de Hoy */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Compromisos Para Hoy ({todayTasks.length})
          </h3>
          {todayTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-dashed border-slate-200">
              No hay compromisos con fecha límite programada para hoy.
            </p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(t => renderTaskCard(t, false))}
            </div>
          )}
        </section>

        {/* Tareas de la Semana */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Próximos 7 Días ({weekTasks.length})
          </h3>
          {weekTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-dashed border-slate-200">
              No hay compromisos pendientes para los próximos 7 días.
            </p>
          ) : (
            <div className="space-y-2">
              {weekTasks.map(t => renderTaskCard(t, false))}
            </div>
          )}
        </section>

        {/* Tareas Posteriores */}
        {laterTasks.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>Compromisos en el Horizonte ({laterTasks.length})</span>
            </h3>
            <div className="space-y-2">
              {laterTasks.map(t => renderTaskCard(t, false))}
            </div>
          </section>
        )}
      </div>

      {editingCommitment && (
        <EditDrawer
          commit={editingCommitment}
          onClose={() => setEditingCommitment(null)}
          onSave={(updated) => updateCommitment(updated)}
        />
      )}
    </div>
  );
};
