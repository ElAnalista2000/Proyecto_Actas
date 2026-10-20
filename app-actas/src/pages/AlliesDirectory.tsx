// src/pages/AlliesDirectory.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Mail, 
  User, 
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  FilterX
} from 'lucide-react';
import { Commitment, Ally } from '../types';
import { AllyDetailModal } from '../components/AllyDetailModal';
import { NewAllyModal } from '../components/NewAllyModal';
import { getSemaforoInfo, getSemaforoBadgeClass } from '../utils/semaforo';

export const AlliesDirectory: React.FC<{ onSelectCommitment?: (c: Commitment) => void }> = () => {
  const { allies, selectedAllyId, setSelectedAllyId, searchQuery } = useApp();
  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');
  
  // Estado para el modal de detalle del aliado
  const [selectedAllyForModal, setSelectedAllyForModal] = useState<Ally | null>(null);
  
  // Estado para registrar nuevo aliado
  const [isNewAllyOpen, setIsNewAllyOpen] = useState(false);

  // Mantener actualizado el aliado seleccionado con el estado reactivo del contexto
  const currentModalAlly = selectedAllyForModal 
    ? allies.find(a => a.id === selectedAllyForModal.id) || null 
    : null;

  const filteredAllies = allies.filter(ally => {
    const matchesAlly = selectedAllyId === 'all' || ally.id === selectedAllyId;
    const matchesSearch = !searchQuery || 
      ally.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ally.category && ally.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ally.commitments.some(c => 
        c.activity.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.responsible.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesAlly && matchesSearch;
  });

  const selectedAllyObj = allies.find(a => a.id === selectedAllyId);

  return (
    <div className="space-y-6">
      {/* Barra de estado y título de vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Directorio y Perfil de Aliados
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Haz clic en cualquier aliado para ver sus compromisos, marcar tareas cumplidas, editar responsables y convenios
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Nuevo Aliado */}
          <button
            onClick={() => setIsNewAllyOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Aliado</span>
          </button>

          {/* Toggle Tarjetas / Tabla */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex text-xs font-medium">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1 rounded-md transition ${activeTab === 'cards' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1 rounded-md transition ${activeTab === 'table' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tabla Detallada
            </button>
          </div>
        </div>
      </div>

      {/* Banner si hay un filtro de aliado activo en el Header */}
      {selectedAllyId !== 'all' && selectedAllyObj && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {selectedAllyObj.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950">
                Filtrando actualmente por: <span className="text-indigo-600 underline font-black">{selectedAllyObj.name}</span>
              </p>
              <p className="text-[11px] text-indigo-700">
                {selectedAllyObj.commitments.length} compromisos registrados ({selectedAllyObj.commitments.filter(c => c.status === 'CUMPLIDO' || c.completed).length} cumplidos)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedAllyForModal(selectedAllyObj)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver Tareas y Acuerdos</span>
            </button>
            <button
              onClick={() => setSelectedAllyId('all')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Ver Todos</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {filteredAllies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No se encontraron aliados que coincidan con los filtros</p>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando "Todos los Aliados" o cambiando el término de búsqueda</p>
          <button
            onClick={() => {
              setSelectedAllyId('all');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
          >
            Restablecer filtro a "Todos los Aliados"
          </button>
        </div>
      ) : activeTab === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAllies.map((ally) => {
            const total = ally.commitments.length;
            const completed = ally.commitments.filter(c => c.status === 'CUMPLIDO' || c.completed).length;
            const inProgress = ally.commitments.filter(c => c.status === 'EN_PROCESO').length;
            const pending = ally.commitments.filter(c => c.status === 'PENDIENTE' && !c.completed).length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div 
                key={ally.id}
                onClick={() => setSelectedAllyForModal(ally)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer relative"
              >
                {/* Cabecera Tarjeta */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-800 font-extrabold flex items-center justify-center text-sm transition-colors duration-200 shadow-sm">
                      {ally.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {ally.category || 'Aliado'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate flex items-center gap-2" title={ally.name}>
                    {/* Badge semáforo */}
                    {(() => {
                      const sem = getSemaforoInfo(ally);
                      return (
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getSemaforoBadgeClass(sem.color)}`}
                          title={sem.label}
                        />
                      );
                    })()}
                    {ally.name}
                  </h3>

                  {/* Datos de contacto */}
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {ally.contactName && (
                      <p className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{ally.contactName}</span>
                      </p>
                    )}
                    {ally.contactEmail && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600">{ally.contactEmail}</span>
                      </p>
                    )}
                  </div>

                  {/* Barra de progreso de compromisos */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-600">Cumplimiento Acuerdos</span>
                      <span className="text-indigo-600 font-bold">{rate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${rate}%` }} 
                      />
                    </div>
                  </div>

                  {/* Badges de estado */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2 bg-emerald-50/80 border border-emerald-100 rounded-xl">
                      <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {completed}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium">Cumplidos</p>
                    </div>
                    <div className="p-2 bg-amber-50/80 border border-amber-100 rounded-xl">
                      <p className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {inProgress}
                      </p>
                      <p className="text-[10px] text-amber-600 font-medium">En Proceso</p>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-xs font-bold text-slate-700">{pending}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Pendientes</p>
                    </div>
                  </div>
                </div>

                {/* Footer de Tarjeta con botón interactivo */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between group-hover:bg-indigo-50/40 transition">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{total} {total === 1 ? 'compromiso' : 'compromisos'}</span>
                  </span>
                  
                  <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Ver detalles y tareas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista de Tabla */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Aliado</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Compromisos</th>
                  <th className="py-3 px-4">Progreso</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllies.map(ally => {
                  const total = ally.commitments.length;
                  const completed = ally.commitments.filter(c => c.status === 'CUMPLIDO' || c.completed).length;
                  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <tr 
                      key={ally.id} 
                      onClick={() => setSelectedAllyForModal(ally)}
                      className="hover:bg-indigo-50/30 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <span className="flex items-center gap-2">
                          {/* Badge semáforo en tabla */}
                          {(() => {
                            const sem = getSemaforoInfo(ally);
                            return (
                              <span
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getSemaforoBadgeClass(sem.color)}`}
                                title={sem.label}
                              />
                            );
                          })()}
                          {ally.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{ally.category || 'General'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{ally.contactName || 'No registrado'}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{total} compromisos</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="font-bold text-slate-700">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAllyForModal(ally);
                          }}
                          className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          Ver Tareas
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle del Aliado (Compromisos, Tareas, Convenios, Edición) */}
      {currentModalAlly && (
        <AllyDetailModal
          ally={currentModalAlly}
          onClose={() => setSelectedAllyForModal(null)}
        />
      )}

      {/* Modal para Crear Nuevo Aliado */}
      <NewAllyModal
        isOpen={isNewAllyOpen}
        onClose={() => setIsNewAllyOpen(false)}
        onCreated={(newAlly) => {
          setSelectedAllyForModal(newAlly);
        }}
      />
    </div>
  );
};
