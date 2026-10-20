// src/pages/ExecutiveDashboard.tsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2,
  PieChart as PieIcon,
  Download,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export const ExecutiveDashboard: React.FC = () => {
  const { allies, selectedAllyId, urgentCount } = useApp();

  const filteredAllies = allies.filter(a => selectedAllyId === 'all' || a.id === selectedAllyId);
  const allCommitments = filteredAllies.flatMap(a => a.commitments);

  const total = allCommitments.length;
  const completed = allCommitments.filter(c => c.status === 'CUMPLIDO' || c.completed).length;
  const inProgress = allCommitments.filter(c => c.status === 'EN_PROCESO').length;
  const pending = allCommitments.filter(c => c.status === 'PENDIENTE' && !c.completed).length;

  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Datos para Recharts: Distribución por Estado
  const pieData = [
    { name: 'Cumplidos', value: completed, color: '#10B981' },
    { name: 'En Proceso', value: inProgress, color: '#F59E0B' },
    { name: 'Pendientes', value: pending, color: '#64748B' }
  ].filter(d => d.value > 0);

  // Datos para Recharts: Compromisos por Aliado
  const barData = filteredAllies.map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 10) + '...' : a.name,
    cumplidos: a.commitments.filter(c => c.status === 'CUMPLIDO' || c.completed).length,
    pendientes: a.commitments.filter(c => c.status !== 'CUMPLIDO' && !c.completed).length
  }));

  return (
    <div className="space-y-6">
      {/* Título de la vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Dashboard Ejecutivo de Gestión y Rendición
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas estratégicas para la Dirección de Alianzas y Rectoría UAM
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Periodo Académico Actual</span>
        </div>
      </div>

      {/* 4 KPIs Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aliados Vinculados</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{filteredAllies.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Relacionamiento Activo
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasa de Cumplimiento</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{rate}%</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {completed} de {total} acuerdos listos
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Ejecución Activa</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{inProgress}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              Compromisos en trámite
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertas Críticas</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{urgentCount}</p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              Vencidos o vencen ≤ 3 días
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Gráficas Interactivas con Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Barras comparativas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Compromisos por Aliado (Cumplidos vs Pendientes)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="cumplidos" name="Cumplidos" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendientes" name="Pendientes / En Proceso" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Pastel de distribución */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            Distribución General del Estado de Compromisos
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
