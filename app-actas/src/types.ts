// file:///c:/Users/diego/OneDrive/Documentos/repos/App_Actas/app-actas/src/types.ts
export interface Commitment {
  id: string;
  activity: string;
  responsible: string;
  dueDate: string; // ISO (YYYY‑MM‑DD)
  completed?: boolean;
  completedAt?: string; // ISO
}

export interface Ally {
  id: string;
  name: string; // nombre corto y normalizado
  commitments: Commitment[];
}

export interface SeedData {
  allies: Ally[];
}

// ------ Nuevas interfaces para la gestión documental ------
export interface Acta {
  id: string;                // "<aliado>-<numero>"
  number: string;            // número del acta (ej. "3")
  date: string;              // fecha de reunión (ISO)
  allyId: string;            // referencia al aliado
  subject: string;           // asunto del acta
  commitments: Commitment[]; // compromisos extraídos de la tabla "4. Compromisos"
  sourceFileName: string;    // nombre del archivo .docx original
  fingerprint: string;       // huella única para detección de duplicados
}

export interface SignedActa {
  id: string;               // mismo esquema que Acta
  actaNumber: string;
  allyId: string;
  pdfFileName: string;
  pdfUrl: string;           // URL (blob) para previsualizar
  fingerprint: string;      // huella para evitar duplicados
}
