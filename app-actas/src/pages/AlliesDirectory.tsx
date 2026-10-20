// src/pages/AlliesDirectory.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Mail, 
  User, 
  ArrowRight
} from 'lucide-react';
import { Commitment } from '../types';

export const AlliesDirectory: React.FC<{ onSelectCommitment?: (c: Commitment) => void }> = ({ onSelectCommitment }) => {
  const { allies, selectedAllyId, setSelectedAllyId, searchQuery } = useApp();
  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');

  const filteredAllies = allies.filter(ally => {
    const matchesAlly = selectedAllyId === 'all' || ally.id === selectedAllyId;
    const matchesSearch = !searchQuery || 
      ally.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ally.commitments.some(c => c.activity.toLowerCase().includes(searchQuery.toLowerCase()) || c.responsible.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAlly && matchesSearch;
  });

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
            Seguimiento institucional de alianzas activas y cumplimiento de acuerdos pactados
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {filteredAllies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No se encontraron aliados que coincidan con los filtros</p>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando "Todos los Aliados" o cambiando el término de búsqueda</p>
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
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Cabecera Tarjeta */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-slate-700 font-bold flex items-center justify-center text-sm transition">
                      {ally.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {ally.category || 'Aliado'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate" title={ally.name}>
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
                        <span className="hover:underline text-slate-600">{ally.contactEmail}</span>
                      </p>
                    )}
                  </div>

                  {/* Barra de progreso de compromisos */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-600">Cumplimiento Acuerdos</span>
                      <span className="text-indigo-600">{rate}%</span>
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
                    <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                      <p className="text-xs font-bold text-emerald-700">{completed}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Cumplidos</p>
                    </div>
                    <div className="p-2 bg-amber-50/70 border border-amber-100 rounded-lg">
                      <p className="text-xs font-bold text-amber-700">{inProgress}</p>
                      <p className="text-[10px] text-amber-600 font-medium">En Proceso</p>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs font-bold text-slate-700">{pending}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Pendientes</p>
                    </div>
                  </div>
                </div>

                {/* Footer de Tarjeta */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {total} {total === 1 ? 'compromiso registrado' : 'compromisos registrados'}
                  </span>
                  <button 
                    onClick={() => setSelectedAllyId(ally.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/btn"
                  >
                    <span>Ver detalles</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                  </button>
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
                    <tr key={ally.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{ally.name}</td>
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
                          onClick={() => setSelectedAllyId(ally.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          Filtrar
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
    </div>
  );
};
