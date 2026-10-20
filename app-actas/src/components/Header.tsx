// src/components/Header.tsx
import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  AlertTriangle, 
  Upload, 
  RotateCcw, 
  Building2, 
  Search
} from 'lucide-react';
import mammoth from 'mammoth';
import { Acta, Commitment } from '../types';
import { extractActaMetadata, parseCommitmentsFromDocHtml } from '../utils/actaParser';

export const Header: React.FC<{ onUploadClick?: () => void }> = ({ onUploadClick }) => {
  const { 
    allies, 
    selectedAllyId, 
    setSelectedAllyId, 
    urgentCount, 
    filterUrgentDays, 
    setFilterUrgentDays,
    searchQuery,
    setSearchQuery,
    restoreInitialData,
    addActa
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let totalImportedTasks = 0;
    let lastAllyName = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.docx')) continue;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        // 1. Extraer metadatos institucionales del acta (fecha, número, asunto, aliado, categoría, contacto)
        const metadata = extractActaMetadata(html, file.name);

        // 2. Extraer todos los compromisos pactados de la tabla con el nuevo analizador inteligente
        const commitments = parseCommitmentsFromDocHtml(
          html,
          metadata.allyId,
          metadata.actaNumber,
          metadata.meetingDate
        );

        // Fallback únicamente si el documento no contenía ninguna tabla de compromisos
        if (commitments.length === 0) {
          commitments.push({
            id: `${metadata.allyId}-imp-${Date.now()}-1`,
            activity: `Revisión y seguimiento integral de acuerdos del Acta N° ${metadata.actaNumber}`,
            responsible: 'Dirección de Alianzas UAM',
            dueDate: metadata.meetingDate,
            status: 'PENDIENTE',
            completed: false,
            actaNumber: metadata.actaNumber,
            allyId: metadata.allyId
          });
        }

        const newActa: Acta = {
          id: `${metadata.allyId}-${metadata.actaNumber}`,
          number: metadata.actaNumber,
          date: metadata.meetingDate,
          allyId: metadata.allyId,
          subject: metadata.subject,
          sourceFileName: file.name,
          docxUrl: URL.createObjectURL(file),
          fingerprint: `${file.name}-${file.size}-${file.lastModified}`,
          commitments,
          rawHtml: html,
          allyName: metadata.allyName,
          category: metadata.category,
          contactName: metadata.contactName
        };

        addActa(newActa);
        totalImportedTasks += commitments.length;
        lastAllyName = metadata.allyName;

        // Seleccionar automáticamente al aliado en la aplicación
        setSelectedAllyId(metadata.allyId);
      } catch (err) {
        console.error('Error importando acta docx:', err);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    alert(`¡Acta procesada con éxito! Se cargaron ${totalImportedTasks} compromisos para "${lastAllyName}".`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Título (con truncate para evitar desbordes) */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 truncate tracking-tight">
                  Gestor de Actas y Alianzas
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  UAM
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                Dirección de Alianzas Estratégicas y Compromisos
              </p>
            </div>
          </div>

          {/* Barra de Búsqueda rápida */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative mx-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input 
              type="text"
              placeholder="Buscar compromiso o aliado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Controles Principales */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Selector de Aliado con ancho controlado */}
            <div className="relative flex items-center">
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedAllyId}
                onChange={(e) => setSelectedAllyId(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-xs font-medium bg-slate-100/80 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[150px] sm:max-w-[190px] truncate cursor-pointer transition"
                title="Filtrar por Aliado"
              >
                <option value="all">Todos los Aliados ({allies.length})</option>
                {allies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.commitments.length})
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de Alertas <= 3 Días */}
            <button
              onClick={() => setFilterUrgentDays(filterUrgentDays === 3 ? null : 3)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                filterUrgentDays === 3
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
              title="Filtrar compromisos con vencimiento menor o igual a 3 días o vencidos"
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-current" />
              <span className="hidden sm:inline">Alertas ≤3d</span>
              {urgentCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterUrgentDays === 3 ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
                }`}>
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Botón Cargar Actas .docx */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".docx" 
              multiple 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition"
              title="Importar actas en formato Word (.docx)"
            >
              <Upload className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden md:inline">Cargar Actas (.docx)</span>
              <span className="md:hidden">Subir</span>
            </button>

            {/* Botón Restaurar Datos Semilla */}
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restaurar los datos semilla oficiales (Asoandes Acta 3, Armetales Acta 1)?')) {
                  restoreInitialData();
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
              title="Restaurar datos iniciales oficiales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
