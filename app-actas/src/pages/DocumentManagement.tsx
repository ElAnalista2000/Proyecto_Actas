// file:///c:/Users/diego/OneDrive/Documentos/repos/App_Actas/app-actas/src/pages/DocumentManagement.tsx
import React, { useState } from "react";
import { Upload, FileCheck, Loader2 } from "lucide-react";
import { useDocument } from "../context/DocumentContext";
import { generateFingerprint, parseActaFileName } from "../utils/fileUtils";
import mammoth from "mammoth";
import html2pdf from "html2pdf.js";
import { Acta, SignedActa } from "../types";

/** Simple modal for upload report */
const UploadReportModal: React.FC<{
  success: Acta[];
  duplicates: Acta[];
  onClose: () => void;
}> = ({ success, duplicates, onClose }) => (
  <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
    <div className="w-96 rounded bg-white p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-semibold">Resumen de carga masiva</h3>
      {success.length > 0 && (
        <div className="mb-2 rounded bg-green-100 p-2">
          <p className="font-medium text-green-800">Actas cargadas correctamente:</p>
          <ul className="list-disc list-inside text-sm text-green-700">
            {success.map((a) => (
              <li key={a.id}>{a.sourceFileName}</li>
            ))}
          </ul>
        </div>
      )}
      {duplicates.length > 0 && (
        <div className="rounded bg-yellow-100 p-2">
          <p className="font-medium text-yellow-800">Actas duplicadas omitidas:</p>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {duplicates.map((a) => (
              <li key={a.id}>{a.sourceFileName}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-3 w-full rounded bg-primary py-1 text-white hover:bg-primary/80"
      >
        Cerrar
      </button>
    </div>
  </div>
);

/** Card para acta sin firmar */
const UnsignedActaCard: React.FC<{ acta: Acta }> = ({ acta }) => {
  const downloadPdf = async () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <h1>Acta Nº ${acta.number}</h1>
      <p>Fecha: ${acta.date}</p>
      <p>Aliado: ${acta.allyId}</p>
      <p>Asunto: ${acta.subject}</p>
      <h2>Compromisos</h2>
      <ul>${acta.commitments
        .map((c) => `<li>${c.activity} – ${c.responsible} – ${c.dueDate}</li>`)
        .join("")}</ul>
    `;
    await html2pdf().from(element).set({ margin: 10, filename: `${acta.sourceFileName}.pdf` }).save();
  };

  return (
    <div className="mb-4 rounded border p-3 shadow">
      <h4 className="font-medium">{acta.sourceFileName}</h4>
      <p className="text-sm">Número: {acta.number} | Fecha: {acta.date}</p>
      <p className="text-sm">Aliado: {acta.allyId}</p>
      <button
        onClick={downloadPdf}
        className="mt-2 rounded bg-primary px-3 py-1 text-sm text-white hover:bg-primary/80"
      >
        Descargar PDF
      </button>
    </div>
  );
};

/** Card para acta firmada */
const SignedActaCard: React.FC<{ signed: SignedActa }> = ({ signed }) => {
  return (
    <div className="mb-4 rounded border p-3 shadow">
      <h4 className="font-medium">{signed.pdfFileName}</h4>
      <p className="text-sm">Acta Nº {signed.actaNumber} | Aliado: {signed.allyId}</p>
      <a
        href={signed.pdfUrl}
        download={signed.pdfFileName}
        className="mt-2 inline-block rounded bg-primary px-3 py-1 text-sm text-white hover:bg-primary/80"
      >
        Descargar
      </a>
    </div>
  );
};

export const DocumentManagement: React.FC = () => {
  const { unsignedActs, signedActs, addUnsignedActa, addSignedActa, resetDocuments } =
    useDocument();
  const [activeTab, setActiveTab] = useState<"unsigned" | "signed">("unsigned");
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<Acta[]>([]);
  const [reportDuplicates, setReportDuplicates] = useState<Acta[]>([]);

  /** Handler for .docx upload */
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    const successes: Acta[] = [];
    const dups: Acta[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fingerprint = generateFingerprint(file);
      // check duplicate already in context
      if (unsignedActs.some((a) => a.fingerprint === fingerprint)) {
        dups.push({
          id: "dup",
          number: "",
          date: "",
          allyId: "",
          subject: "",
          commitments: [],
          sourceFileName: file.name,
          fingerprint,
        } as Acta);
        continue;
      }
      // read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
      // simple parser – extract number, date, ally, subject with regexes
      const txt = html.replace(/<[^>]+>/g, " "); // strip tags
      const numberMatch = txt.match(/Acta\s*#?\s*(\d+)/i);
      const dateMatch = txt.match(/Fecha[:\s]+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
      const allyMatch = txt.match(/Aliado[:\s]+([A-Za-z\s\/&]+)\b/i);
      const subjectMatch = txt.match(/Asunto[:\s]+([^\n]+)/i);

      // extract commitments table – look for rows inside <table> after "4. Compromisos"
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const table = doc.querySelector("table");
      const commitments: Acta["commitments"] = [];
      if (table) {
        const rows = table.querySelectorAll("tr");
        rows.forEach((row, idx) => {
          if (idx === 0) return; // skip header
          const cells = row.querySelectorAll("td");
          if (cells.length >= 4) {
            const activity = cells[1].textContent?.trim() ?? "";
            const responsible = cells[2].textContent?.trim() ?? "";
            const due = cells[3].textContent?.trim() ?? "";
            commitments.push({
              id: `${file.name}-${idx}`,
              activity,
              responsible,
              dueDate: due,
            });
          }
        });
      }

      const acta: Acta = {
        id: `${file.name}-${Date.now()}`,
        number: numberMatch ? numberMatch[1] : "",
        date: dateMatch ? dateMatch[1] : "",
        allyId: allyMatch ? allyMatch[1].trim() : "",
        subject: subjectMatch ? subjectMatch[1].trim() : "",
        commitments,
        sourceFileName: file.name,
        fingerprint,
      };
      addUnsignedActa(acta);
      successes.push(acta);
    }
    setReportSuccess(successes);
    setReportDuplicates(dups);
    setShowReport(true);
    setLoading(false);
    // reset file input
    e.target.value = "";
  };

  /** Handler for signed PDF upload */
  const handleSignedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    const fingerprint = generateFingerprint(file);
    if (signedActs.some((s) => s.fingerprint === fingerprint)) {
      alert("PDF ya cargado previamente");
      return;
    }
    const url = URL.createObjectURL(file);
    // parse filename for ally & acta number (simple split)
    const { allyName, actaNumber } = parseActaFileName(file.name);
    const signed: SignedActa = {
      id: `${file.name}-${Date.now()}`,
      actaNumber,
      allyId: allyName,
      pdfFileName: file.name,
      pdfUrl: url,
      fingerprint,
    };
    addSignedActa(signed);
    e.target.value = "";
  };

  return (
    <div className="pt-16">
      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <button
          className={`px-4 py-2 ${activeTab === "unsigned" ? "border-b-2 border-primary font-medium" : ""}`}
          onClick={() => setActiveTab("unsigned")}
        >
          Actas Sin Firmar (Word .docx → PDF)
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "signed" ? "border-b-2 border-primary font-medium" : ""}`}
          onClick={() => setActiveTab("signed")}
        >
          Actas Firmadas (PDF)
        </button>
        <button
          onClick={resetDocuments}
          className="ml-auto mr-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
        >
          Resetear datos
        </button>
      </div>

      <div className="p-4">
        {activeTab === "unsigned" && (
          <div>
            <label className="flex cursor-pointer items-center rounded bg-primary px-4 py-2 text-white hover:bg-primary/80">
              <Upload className="mr-2 h-5 w-5" />
              Cargar archivos .docx (masivo)
              <input type="file" multiple accept=".docx" className="hidden" onChange={handleDocxUpload} disabled={loading} />
            </label>
            {loading && <Loader2 className="ml-2 inline animate-spin" />}
            <hr className="my-4" />
            <h3 className="mb-2 text-lg font-semibold">Actas cargadas</h3>
            {unsignedActs.map((a) => (
              <UnsignedActaCard key={a.id} acta={a} />
            ))}
          </div>
        )}

        {activeTab === "signed" && (
          <div>
            <label className="flex cursor-pointer items-center rounded bg-primary px-4 py-2 text-white hover:bg-primary/80">
              <FileCheck className="mr-2 h-5 w-5" />
              Subir PDF firmado
              <input type="file" accept=".pdf" className="hidden" onChange={handleSignedUpload} />
            </label>
            <hr className="my-4" />
            <h3 className="mb-2 text-lg font-semibold">Actas firmadas</h3>
            {signedActs.map((s) => (
              <SignedActaCard key={s.id} signed={s} />
            ))}
          </div>
        )}
      </div>

      {showReport && (
        <UploadReportModal
          success={reportSuccess}
          duplicates={reportDuplicates}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};
