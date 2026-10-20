// src/pages/DocumentManagement.tsx
import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileCheck, 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  Building2,
  Sparkles
} from "lucide-react";
import { useApp } from "../context/AppContext";
import html2pdf from "html2pdf.js";
import { Acta, SignedActa } from "../types";

export const DocumentManagement: React.FC = () => {
  const { 
    actas, 
    signedActas, 
    addSignedActa, 
    selectedAllyId, 
    searchQuery,
    setSelectedActa
  } = useApp();

  const [activeTab, setActiveTab] = useState<'actas' | 'signed'>('actas');
  const [previewActa, setPreviewActa] = useState<Acta | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const filteredActas = actas.filter(a => {
    const matchesAlly = selectedAllyId === 'all' || a.allyId.toLowerCase() === selectedAllyId.toLowerCase();
    const matchesSearch = !searchQuery || 
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.number.includes(searchQuery) ||
      a.allyId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAlly && matchesSearch;
  });

  const filteredSigned = signedActas.filter(s => {
    const matchesAlly = selectedAllyId === 'all' || s.allyId.toLowerCase() === selectedAllyId.toLowerCase();
    const matchesSearch = !searchQuery || 
      s.pdfFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.actaNumber.includes(searchQuery);
    return matchesAlly && matchesSearch;
  });

  const exportPdf = (acta: Acta) => {
    const container = document.createElement("div");
    container.style.padding = "30px";
    container.style.fontFamily = "sans-serif";
    container.innerHTML = `
      <div style="border-bottom: 2px solid #4F46E5; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #1E293B; margin: 0; font-size: 20px;">UNIVERSIDAD AUTÓNOMA DE MANIZALES (UAM)</h1>
        <h2 style="color: #4F46E5; margin: 5px 0 0 0; font-size: 16px;">DIRECCIÓN DE ALIANZAS - ACTA N° ${acta.number}</h2>
        <p style="color: #64748B; font-size: 12px; margin: 5px 0 0 0;">Fecha: ${acta.date} | Aliado: ${acta.allyId.toUpperCase()}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 14px; color: #334155; margin-bottom: 6px;">Asunto / Objeto de la Reunión:</h3>
        <p style="font-size: 13px; color: #475569; background: #F8FAFC; padding: 10px; border-radius: 6px; border: 1px solid #E2E8F0;">
          ${acta.subject}
        </p>
      </div>

      <div>
        <h3 style="font-size: 14px; color: #334155; margin-bottom: 10px;">Compromisos y Acuerdos Establecidos:</h3>
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
                <td style="padding: 8px; border: 1px solid #E2E8F0;">${c.dueDate}</td>
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
          Firma Representante Aliado
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Acta_${acta.number}_${acta.allyId}_UAM.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    (html2pdf() as any).from(container).set(opt).save();
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.pdf')) continue;

      const numMatch = file.name.match(/\d+/);
      const actaNum = numMatch ? numMatch[0] : '1';
      
      const newSigned: SignedActa = {
        id: `signed-${Date.now()}-${i}`,
        actaNumber: actaNum,
        allyId: selectedAllyId === 'all' ? 'general' : selectedAllyId,
        pdfFileName: file.name,
        pdfUrl: URL.createObjectURL(file),
        fingerprint: `${file.name}-${file.size}-${file.lastModified}`,
        uploadDate: new Date().toISOString().split('T')[0]
      };

      addSignedActa(newSigned);
    }

    if (pdfInputRef.current) pdfInputRef.current.value = '';
    alert('¡Acta firmada cargada exitosamente en el repositorio!');
  };

  return (
    <div className="space-y-6">
      {/* Header de la vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Gestión Documental de Actas y Firmas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generación oficial de PDFs con html2pdf.js y repositorio de actas firmadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de pestañas */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex text-xs font-medium">
            <button
              onClick={() => setActiveTab('actas')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'actas' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Actas Generadas ({filteredActas.length})
            </button>
            <button
              onClick={() => setActiveTab('signed')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'signed' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Actas Firmadas ({filteredSigned.length})
            </button>
          </div>

          {/* Botón Subir PDF Firmado */}
          <input 
            type="file" 
            ref={pdfInputRef} 
            onChange={handlePdfUpload} 
            accept=".pdf" 
            className="hidden" 
          />
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            title="Subir documento PDF firmado escaneado"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Subir PDF Firmado</span>
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'actas' ? (
        filteredActas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No hay actas registradas para este filtro</p>
            <p className="text-xs text-slate-400 mt-1">Usa el botón "Cargar Actas (.docx)" en la barra superior para importar actas Word</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredActas.map(acta => (
              <div 
                key={acta.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Acta N° {acta.number}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {acta.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2" title={acta.subject}>
                    {acta.subject}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Aliado: <strong className="text-slate-700 font-semibold">{acta.allyId.toUpperCase()}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Archivo: {acta.sourceFileName}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">
                      {acta.commitments.length} Compromisos acordados
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewActa(acta)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>

                  <button
                    onClick={() => exportPdf(acta)}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition"
                    title="Exportar acta institucional en PDF con html2pdf.js"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Pestaña Actas Firmadas */
        filteredSigned.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No hay actas firmadas registradas</p>
            <p className="text-xs text-slate-400 mt-1">Usa el botón "Subir PDF Firmado" para subir un escaneado con firmas de Rectoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSigned.map(signed => (
              <div 
                key={signed.id}
                className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      Firmada - Acta N° {signed.actaNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {signed.uploadDate}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 truncate mb-1" title={signed.pdfFileName}>
                    {signed.pdfFileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Aliado: <strong className="text-slate-700">{signed.allyId.toUpperCase()}</strong>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  {signed.pdfUrl && signed.pdfUrl !== '#' ? (
                    <a
                      href={signed.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visualizar PDF
                    </a>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Custodia Digital Completa
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal de Previsualización de Acta */}
      {previewActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Detalle del Acta N° {previewActa.number} - {previewActa.allyId.toUpperCase()}
              </h3>
              <button 
                onClick={() => setPreviewActa(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <p className="font-semibold text-slate-500">Asunto Institucional:</p>
                <p className="text-slate-800 text-sm mt-1">{previewActa.subject}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500 mb-2">Compromisos Vinculados ({previewActa.commitments.length}):</p>
                <div className="space-y-2">
                  {previewActa.commitments.map((c, idx) => (
                    <div key={c.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="font-semibold text-slate-900">{c.activity}</p>
                      <p className="text-slate-500 mt-1">Responsable: {c.responsible} | Fecha límite: {c.dueDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setPreviewActa(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  exportPdf(previewActa);
                  setPreviewActa(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
