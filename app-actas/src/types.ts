// src/types.ts

export type CommitmentStatus = 'PENDIENTE' | 'EN_PROCESO' | 'CUMPLIDO';

export interface Commitment {
  id: string;
  activity: string;
  responsible: string;
  dueDate: string; // ISO (YYYY-MM-DD)
  status: CommitmentStatus;
  completed?: boolean;
  completedAt?: string; // ISO
  actaNumber?: string;
  allyId?: string;
  comments?: string;
}

export interface Ally {
  id: string;
  name: string; // nombre corto y normalizado
  category?: 'Empresa' | 'Universidad' | 'Gobierno' | 'Gremio' | 'ONG';
  contactEmail?: string;
  contactName?: string;
  commitments: Commitment[];
}

export interface SeedData {
  allies: Ally[];
}

export interface Acta {
  id: string;                // "<aliado>-<numero>"
  number: string;            // número del acta (ej. "3")
  date: string;              // fecha de reunión (ISO)
  allyId: string;            // referencia al aliado
  subject: string;           // asunto del acta
  commitments: Commitment[]; // compromisos extraídos de la tabla "4. Compromisos"
  sourceFileName: string;    // nombre del archivo .docx original
  docxUrl?: string;          // URL to download original Word file
  fingerprint: string;       // huella única para detección de duplicados
  rawHtml?: string;
  allyName?: string;
  category?: 'Empresa' | 'Universidad' | 'Gobierno' | 'Gremio' | 'ONG';
  contactName?: string;
}

export interface SignedActa {
  id: string;               // mismo esquema que Acta
  actaNumber: string;
  allyId: string;
  pdfFileName: string;
  pdfUrl: string;           // URL (blob) para previsualizar
  fingerprint: string;      // huella para evitar duplicados
  uploadDate: string;
}
