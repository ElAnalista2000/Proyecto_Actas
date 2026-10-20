// src/components/AllyDetailModal.tsx
import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Calendar, 
  FileText, 
  Edit3, 
  Trash2, 
  Search,
  Download,
  Filter
} from 'lucide-react';
import { Ally, Commitment, CommitmentStatus, Acta } from '../types';
import { useApp } from '../context/AppContext';
import { EditDrawer } from './EditDrawer';
import html2pdf from 'html2pdf.js';

interface AllyDetailModalProps {
  ally: Ally | null;
  onClose: () => void;
  onNavigateToDocs?: () => void;
}

export const AllyDetailModal: React.FC<AllyDetailModalProps> = ({ 
  ally, 
  onClose,
  onNavigateToDocs
}) => {
  const { 
    updateCommitment, 
    updateCommitmentStatus, 
    updateCommitmentResponsible,
    deleteCommitment, 
    addCommitment,
    actas,
    signedActas,
    setSelectedAllyId
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | CommitmentStatus>('ALL');
  const [taskSearch, setTaskSearch] = useState('');
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // State for inline quick responsible edit
  const [editingResponsibleId, setEditingResponsibleId] = useState<string | null>(null);
  const [tempResponsible, setTempResponsible] = useState('');

  // State for quick new task form
  const [newTaskActivity, setNewTaskActivity] = useState('');
  const [newTaskResponsible, setNewTaskResponsible] = useState(ally?.contactName ? `${ally.contactName} (${ally.name})` : 'Dirección Alianzas UAM');
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [newTaskActa, setNewTaskActa] = useState('1');

  if (!ally) return null;

  // Filtrar compromisos del aliado
  const commitments = ally.commitments || [];
  const filteredCommitments = commitments.filter(c => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch = !taskSearch || 
      c.activity.toLowerCase().includes(taskSearch.toLowerCase()) ||
      c.responsible.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (c.actaNumber && c.actaNumber.includes(taskSearch));
    return matchesStatus && matchesSearch;
  });

  // Métricas
  const total = commitments.length;
  const completed = commitments.filter(c => c.status === 'CUMPLIDO' || c.completed).length;
  const inProgress = commitments.filter(c => c.status === 'EN_PROCESO').length;
  const pending = commitments.filter(c => c.status === 'PENDIENTE' && !c.completed).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Actas de este aliado
  const allyActas = actas.filter(a => a.allyId.toLowerCase() === ally.id.toLowerCase());
  const allySigned = signedActas.filter(s => s.allyId.toLowerCase() === ally.id.toLowerCase());

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskActivity.trim()) return;

    addCommitment(ally.id, {
      activity: newTaskActivity.trim(),
      responsible: newTaskResponsible.trim() || 'Dirección de Alianzas UAM',
      dueDate: newTaskDueDate,
      status: 'PENDIENTE',
      completed: false,
      actaNumber: newTaskActa || '1',
      allyId: ally.id
    });

    setNewTaskActivity('');
    setIsAddingNew(false);
  };

  const handleExportPdf = (acta: Acta) => {
    const container = document.createElement("div");
    container.style.padding = "30px";
    container.style.fontFamily = "sans-serif";
    container.innerHTML = `
      <div style="border-bottom: 2px solid #4F46E5; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #1E293B; margin: 0; font-size: 20px;">UNIVERSIDAD AUTÓNOMA DE MANIZALES (UAM)</h1>
        <h2 style="color: #4F46E5; margin: 5px 0 0 0; font-size: 16px;">DIRECCIÓN DE ALIANZAS - ACTA N° ${acta.number}</h2>
        <p style="color: #64748B; font-size: 12px; margin: 5px 0 0 0;">Fecha: ${acta.date} | Aliado: ${ally.name.toUpperCase()}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 14px; color: #334155; margin-bottom: 6px;">Asunto / Objeto del Acuerdo:</h3>
        <p style="font-size: 13px; color: #475569; background: #F8FAFC; padding: 10px; border-radius: 6px; border: 1px solid #E2E8F0;">
          ${acta.subject}
        </p>
      </div>

      <div>
        <h3 style="font-size: 14px; color: #334155; margin-bottom: 10px;">Compromisos y Tareas Pactadas:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1;">
              <th style="padding: 8px; border: 1px solid #CBD5E1;">#</th>
              <th style="padding: 8px; border: 1px solid #CBD5E1;">Actividad</th>
              <th style="padding: 8px; border: 1px solid #CBD5E1;">Responsable</th>
              <th style="padding: 8px; border: 1px solid #CBD5E1;">Fecha Límite</th>
              <th style="padding: 8px; border: 1px solid #CBD5E1;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${acta.commitments.map((c, i) => `
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px; border: 1px solid #E2E8F0;">${i + 1}</td>
                <td style="padding: 8px; border: 1px solid #E2E8F0;">${c.activity}</td>
                <td style="padding: 8px; border: 1px solid #E2E8F0;">${c.responsible}</td>
                <td style="padding: 8px; border: 1px solid #E2E8F0;">${c.dueDate || '-'}</td>
                <td style="padding: 8px; border: 1px solid #E2E8F0;">${c.status || (c.completed ? 'CUMPLIDO' : 'PENDIENTE')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #475569;">
        <div style="border-top: 1px solid #94A3B8; width: 40%; text-align: center; padding-top: 6px;">
          Firma Dirección de Alianzas UAM
        </div>
        <div style="border-top: 1px solid #94A3B8; width: 40%; text-align: center; padding-top: 6px;">
          Firma Representante ${ally.name}
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Acta_${acta.number}_${ally.id}_UAM.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    (html2pdf() as any).from(container).set(opt).save();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop con desenfoque suave */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
          
          {/* Header del Aliado */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-white font-extrabold flex items-center justify-center text-xl shadow-inner">
                  {ally.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {ally.name}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/15 text-indigo-200 border border-white/10">
                      {ally.category || 'Aliado Estratégico'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-300">
                    {ally.contactName && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        {ally.contactName}
                      </span>
                    )}
                    {ally.contactEmail && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <a href={`mailto:${ally.contactEmail}`} className="hover:underline text-indigo-200">
                          {ally.contactEmail}
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tasa y Filtro rápido */}
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-right min-w-[130px]">
                  <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Cumplimiento</p>
                  <p className="text-2xl font-black text-emerald-400">{rate}%</p>
                  <p className="text-[10px] text-slate-300">{completed} de {total} completadas</p>
                </div>
              </div>
            </div>

            {/* Métricas / Contadores rápidos */}
            <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
              <div 
                onClick={() => setFilterStatus('ALL')}
                className={`p-2 rounded-xl border transition cursor-pointer ${filterStatus === 'ALL' ? 'bg-white/20 border-white/30 font-bold' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <p className="text-base font-bold text-white">{total}</p>
                <p className="text-[10px] text-slate-300">Total Tareas</p>
              </div>
              <div 
                onClick={() => setFilterStatus('CUMPLIDO')}
                className={`p-2 rounded-xl border transition cursor-pointer ${filterStatus === 'CUMPLIDO' ? 'bg-emerald-500/30 border-emerald-400 font-bold' : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'}`}
              >
                <p className="text-base font-bold text-emerald-300">{completed}</p>
                <p className="text-[10px] text-emerald-200">Cumplidas</p>
              </div>
              <div 
                onClick={() => setFilterStatus('EN_PROCESO')}
                className={`p-2 rounded-xl border transition cursor-pointer ${filterStatus === 'EN_PROCESO' ? 'bg-amber-500/30 border-amber-400 font-bold' : 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'}`}
              >
                <p className="text-base font-bold text-amber-300">{inProgress}</p>
                <p className="text-[10px] text-amber-200">En Proceso</p>
              </div>
              <div 
                onClick={() => setFilterStatus('PENDIENTE')}
                className={`p-2 rounded-xl border transition cursor-pointer ${filterStatus === 'PENDIENTE' ? 'bg-slate-400/30 border-slate-300 font-bold' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <p className="text-base font-bold text-slate-200">{pending}</p>
                <p className="text-[10px] text-slate-300">Pendientes</p>
              </div>
            </div>
          </div>

          {/* Barra de Herramientas de Tareas */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar en tareas o responsable..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedAllyId(ally.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5"
                title="Filtrar todas las vistas de la aplicación por este aliado"
              >
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filtrar en App</span>
              </button>

              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingNew ? 'Cancelar' : 'Nueva Tarea / Compromiso'}</span>
              </button>
            </div>
          </div>

          {/* Formulario para añadir nueva tarea rápidamente */}
          {isAddingNew && (
            <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 animate-in fade-in duration-200">
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    Registrar Nuevo Compromiso para {ally.name}
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingNew(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cerrar
                  </button>
                </div>

                <div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Descripción clara de la tarea, actividad o acuerdo pactado..."
                    value={newTaskActivity}
                    onChange={(e) => setNewTaskActivity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Responsable
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre del responsable"
                      value={newTaskResponsible}
                      onChange={(e) => setNewTaskResponsible(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Fecha Límite
                    </label>
                    <input
                      type="date"
                      required
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Acta N°
                    </label>
                    <input
                      type="text"
                      value={newTaskActa}
                      onChange={(e) => setNewTaskActa(e.target.value)}
                      placeholder="1, 2, 3..."
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                  >
                    Guardar Tarea
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cuerpo: Lista de Tareas y Compromisos */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredCommitments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No hay compromisos con los filtros seleccionados</p>
                <p className="text-xs text-slate-400 mt-1">
                  {commitments.length === 0 
                    ? 'Comienza creando una tarea para este aliado con el botón superior.' 
                    : 'Prueba cambiando el filtro o término de búsqueda.'}
                </p>
                {commitments.length === 0 && (
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="mt-3 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Primera Tarea</span>
                  </button>
                )}
              </div>
            ) : (
              filteredCommitments.map((c) => {
                const isCompleted = c.status === 'CUMPLIDO' || c.completed;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const due = new Date(c.dueDate);
                due.setHours(0, 0, 0, 0);
                const isOverdue = !isCompleted && c.dueDate && due < today;
                const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = !isCompleted && diffDays <= 3 && diffDays >= 0;

                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-50/30 border-emerald-200/80 text-slate-600'
                        : isOverdue
                        ? 'bg-rose-50/40 border-rose-200'
                        : isUrgent
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Checkbox y Contenido Principal */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Botón Marcar Hecha */}
                      <button
                        onClick={() => updateCommitmentStatus(c.id, isCompleted ? 'PENDIENTE' : 'CUMPLIDO')}
                        className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition flex-shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
                            : 'border-slate-300 hover:border-indigo-600 bg-white text-transparent hover:text-slate-300'
                        }`}
                        title={isCompleted ? 'Desmarcar tarea (volver a pendiente)' : 'Marcar tarea como completada'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs sm:text-sm font-bold leading-snug ${
                            isCompleted ? 'line-through text-slate-400 font-medium' : 'text-slate-900'
                          }`}>
                            {c.activity}
                          </p>
                        </div>

                        {/* Metadatos y edición de Responsable */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                          
                          {/* Responsable (Con edición rápida o visualización) */}
                          {editingResponsibleId === c.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tempResponsible}
                                onChange={(e) => setTempResponsible(e.target.value)}
                                className="text-xs px-2 py-0.5 border border-indigo-400 rounded-lg focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  if (tempResponsible.trim()) {
                                    updateCommitmentResponsible(c.id, tempResponsible.trim());
                                  }
                                  setEditingResponsibleId(null);
                                }}
                                className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => setEditingResponsibleId(null)}
                                className="text-slate-400 text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingResponsibleId(c.id);
                                setTempResponsible(c.responsible);
                              }}
                              className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 px-1.5 py-0.5 rounded-md transition"
                              title="Clic para cambiar el responsable rápidamente"
                            >
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.responsible}</span>
                              <Edit3 className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                          )}

                          {/* Fecha Límite */}
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Vence: <strong className="text-slate-700">{c.dueDate || 'Sin fecha'}</strong></span>
                          </span>

                          {/* Alertas de vencimiento */}
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> ¡Vencido!
                            </span>
                          )}
                          {!isOverdue && isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Vence pronto ({diffDays}d)
                            </span>
                          )}
                          {isCompleted && c.completedAt && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              ✓ Cumplido {c.completedAt}
                            </span>
                          )}

                          {/* Acta N° */}
                          {c.actaNumber && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Acta #{c.actaNumber}
                            </span>
                          )}
                        </div>

                        {/* Observaciones si las hay */}
                        {c.comments && (
                          <p className="text-[11px] text-slate-500 italic mt-1.5 pl-2 border-l-2 border-indigo-200">
                            {c.comments}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones del compromiso */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Selector de Estado Directo */}
                      <select
                        value={c.status}
                        onChange={(e) => updateCommitmentStatus(c.id, e.target.value as CommitmentStatus)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1 border transition cursor-pointer ${
                          c.status === 'CUMPLIDO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : c.status === 'EN_PROCESO'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                        title="Cambiar estado del compromiso"
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="CUMPLIDO">Cumplido</option>
                      </select>

                      {/* Botón Editar Todo */}
                      <button
                        onClick={() => setEditingCommitment(c)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="Editar todos los campos del compromiso"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Botón Eliminar */}
                      <button
                        onClick={() => {
                          if (window.confirm('¿Deseas eliminar este compromiso?')) {
                            deleteCommitment(c.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar compromiso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Sección de Actas y Convenios vinculados */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Actas y Convenios Vinculados ({allyActas.length + allySigned.length})
                </h3>
              </div>

              {allyActas.length === 0 && allySigned.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>No hay actas digitalizadas vinculadas a este aliado todavía.</span>
                  <span className="text-[11px] text-slate-400">Puedes cargar actas .docx desde el botón superior "Cargar Actas"</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {allyActas.map(a => (
                    <div 
                      key={a.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">Acta N° {a.number} - {a.subject}</p>
                          <p className="text-[11px] text-slate-400">Fecha: {a.date} | {a.commitments.length} compromisos</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleExportPdf(a)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-1"
                          title="Descargar versión formal para firma"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {allySigned.map(s => (
                    <div 
                      key={s.id}
                      className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-bold text-slate-900">Acta N° {s.actaNumber} Firmada Oficial</p>
                          <p className="text-[11px] text-slate-500">{s.pdfFileName} ({s.uploadDate})</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Firmada
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer del Modal */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {filteredCommitments.length} tareas visibles de {total} totales
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition"
            >
              Cerrar Detalle
            </button>
          </div>

        </div>
      </div>

      {/* Drawer de Edición Completa */}
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
