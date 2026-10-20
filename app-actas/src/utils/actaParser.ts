// src/utils/actaParser.ts
import { Commitment } from '../types';

/**
 * Normaliza fechas relativas en texto o formatos DD/MM/YYYY a ISO YYYY-MM-DD
 */
export function parseDateToIso(dateRaw: string, baseDateIso: string): string {
  if (!dateRaw || !dateRaw.trim()) return baseDateIso;

  const trimmed = dateRaw.trim();

  // 1. Formato DD/MM/YYYY o DD-MM-YYYY (ej. 27/10/2026 o Hasta 27/10/2026)
  const dmyMatch = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 2. Formato YYYY-MM-DD
  const ymdMatch = trimmed.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Lenguaje natural relativo a la fecha de reunión
  const lower = trimmed.toLowerCase();
  const base = new Date(baseDateIso.includes('T') ? baseDateIso : `${baseDateIso}T12:00:00`);
  if (isNaN(base.getTime())) {
    base.setTime(Date.now());
  }

  if (lower.includes('mismo d') || lower.includes('hoy')) {
    return base.toISOString().split('T')[0];
  } else if (lower.includes('esta semana')) {
    base.setDate(base.getDate() + 5);
    return base.toISOString().split('T')[0];
  } else if (lower.includes('próxima semana') || lower.includes('proxima semana') || lower.includes('corto plazo')) {
    base.setDate(base.getDate() + 7);
    return base.toISOString().split('T')[0];
  } else if (lower.includes('mediano plazo')) {
    base.setDate(base.getDate() + 30);
    return base.toISOString().split('T')[0];
  }

  // Por defecto: 14 días a partir de la reunión
  base.setDate(base.getDate() + 14);
  return base.toISOString().split('T')[0];
}

export interface ExtractedActaMetadata {
  meetingDate: string;
  actaNumber: string;
  subject: string;
  allyName: string;
  allyId: string;
  category: 'Empresa' | 'Universidad' | 'Gobierno' | 'Gremio' | 'ONG';
  contactName?: string;
}

/**
 * Extrae metadatos del documento Word analizando el HTML generado por Mammoth
 */
export function extractActaMetadata(html: string, fileName: string): ExtractedActaMetadata {
  let meetingDate = new Date().toISOString().split('T')[0];

  // 1. Extraer Fecha de Reunión del texto del acta
  const dateMatch = html.match(/Fecha(?:\s+de\s+reuni[oó]n)?[:\s<>\/a-zA-Z0-9="'-]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i)
    || html.match(/([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/);
  if (dateMatch) {
    const parts = dateMatch[1].split(/[\/\-]/);
    if (parts[2].length === 4) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      meetingDate = `${year}-${month}-${day}`;
    }
  }

  // 2. Extraer Número de Acta
  let actaNumber = '1';
  const numMatch = html.match(/Acta\s*N[°º\.]?\s*[:\s<>\/a-zA-Z0-9="'-]*(\d+)/i) 
    || fileName.match(/Acta[_\s-]*(\d+)/i);
  if (numMatch) {
    actaNumber = numMatch[1].replace(/^0+/, '') || '1';
  }

  // 3. Extraer Asunto / Objeto
  let subject = '';
  const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
  if (parser) {
    const doc = parser.parseFromString(html, 'text/html');
    const allCells = Array.from(doc.querySelectorAll('td, th'));
    
    for (let i = 0; i < allCells.length; i++) {
      const cellText = allCells[i].textContent?.trim() || '';
      if (/asunto\s+o\s+tema\s+general/i.test(cellText) || /asunto/i.test(cellText)) {
        if (allCells[i + 1]) {
          subject = allCells[i + 1].textContent?.replace(/\s+/g, ' ').trim() || '';
          break;
        }
      }
      if (!subject && /reuni[oó]n\s+de:?/i.test(cellText)) {
        if (allCells[i + 1]) {
          subject = allCells[i + 1].textContent?.replace(/\s+/g, ' ').trim() || '';
        }
      }
    }
  }

  if (!subject) {
    subject = `Acta N° ${actaNumber} de articulación y seguimiento estratégico`;
  }

  // 4. Nombre del Aliado y Categoría
  let allyName = '';
  let category: 'Empresa' | 'Universidad' | 'Gobierno' | 'Gremio' | 'ONG' = 'Empresa';
  let contactName: string | undefined = undefined;

  // Limpieza inicial de nombre de archivo
  let cleanName = fileName
    .replace(/\.docx$/i, '')
    .replace(/^\[\d{4}-\d{2}-\d{2}\]_?/i, '')
    .replace(/Acta[_\s-]*\d+/i, '')
    .replace(/[_\s-]*\d{4}/g, '')
    .trim();

  // Separar camelCase ej. EmpleosVerdes -> Empleos Verdes
  cleanName = cleanName.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();

  if (/fesco/i.test(html) || /fesco/i.test(cleanName) || /empleos\s*verdes/i.test(cleanName)) {
    allyName = 'FESCO - Empleos Verdes';
    category = 'ONG';
    contactName = 'Dr. Germán Gallego';
  } else if (/asoandes/i.test(cleanName) || /asoandes/i.test(html)) {
    allyName = 'Asoandes';
    category = 'Gremio';
    contactName = 'Carlos Mario Gómez';
  } else if (/armetales/i.test(cleanName) || /armetales/i.test(html)) {
    allyName = 'Armetales';
    category = 'Empresa';
    contactName = 'Ing. Roberto Duplat';
  } else if (/alcald[ií]a/i.test(cleanName) || /alcald[ií]a/i.test(html)) {
    allyName = 'Alcaldía de Manizales';
    category = 'Gobierno';
  } else if (cleanName) {
    allyName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    if (/fundaci[oó]n|ong|corporaci[oó]n/i.test(cleanName)) category = 'ONG';
    else if (/universidad|instituto|colegio/i.test(cleanName)) category = 'Universidad';
    else if (/gobernaci[oó]n|ministerio|alcald[ií]a/i.test(cleanName)) category = 'Gobierno';
    else if (/asociaci[oó]n|gremio|comit[eé]/i.test(cleanName)) category = 'Gremio';
  } else {
    allyName = 'Aliado Institucional';
  }

  const allyId = allyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return { meetingDate, actaNumber, subject, allyName, allyId, category, contactName };
}

/**
 * Analiza el HTML de las tablas de Word para extraer todos los compromisos pactados
 */
export function parseCommitmentsFromDocHtml(
  html: string,
  allyId: string,
  actaNumber: string,
  baseDateIso: string
): Commitment[] {
  const commitments: Commitment[] = [];
  const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;

  if (!parser) return commitments;

  const doc = parser.parseFromString(html, 'text/html');
  const tables = Array.from(doc.querySelectorAll('table'));

  for (const table of tables) {
    const tableText = table.textContent?.toLowerCase() || '';

    // Debe ser una tabla de compromisos o acuerdos
    const isCandidate = tableText.includes('compromiso') || 
                        tableText.includes('actividad') || 
                        tableText.includes('acuerdos');
    if (!isCandidate) continue;

    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) continue;

    let colActivity = -1;
    let colResponsible = -1;
    let colDate = -1;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      const cells = Array.from(row.querySelectorAll('td, th'));
      const cellTexts = cells.map(c => c.textContent?.replace(/\s+/g, ' ').trim() || '');

      // 1. Detectar fila de encabezados (solo una vez por tabla y con palabras clave cortas)
      const hasActivityHeader = cellTexts.some(t => 
        t.length < 35 && /actividad|compromiso|tarea|descripci/i.test(t)
      );
      const hasResponsibleHeader = cellTexts.some(t => 
        t.length < 35 && /responsable|encargad/i.test(t)
      );

      if (colActivity === -1 && hasActivityHeader && hasResponsibleHeader) {
        cellTexts.forEach((t, i) => {
          const clean = t.toLowerCase().replace(/[\(\)\:\.]/g, '').trim();
          if (/actividad|compromiso|tarea|descripci/.test(clean)) colActivity = i;
          else if (/responsable|encargad/.test(clean)) colResponsible = i;
          else if (/fecha|plazo|l[ií]mite|entrega/.test(clean)) colDate = i;
        });
        continue; // pasar al siguiente tr
      }

      // 2. Extraer datos de la fila
      let activity = '';
      let responsible = '';
      let dateRaw = '';

      if (colActivity !== -1 && cellTexts[colActivity]) {
        activity = cellTexts[colActivity];
        responsible = colResponsible !== -1 ? (cellTexts[colResponsible] || '') : '';
        dateRaw = colDate !== -1 ? (cellTexts[colDate] || '') : '';
      } else if (cellTexts.length >= 4 && /^\d+$/.test(cellTexts[0])) {
        // Estructura: [No. (ej. 1), Actividad, Responsable, Fecha]
        activity = cellTexts[1];
        responsible = cellTexts[2];
        dateRaw = cellTexts[3];
      } else if (cellTexts.length >= 3) {
        if (/^\d+$/.test(cellTexts[0])) {
          activity = cellTexts[1];
          responsible = cellTexts[2];
        } else if (cellTexts[0].length > 10 && !/reuni[oó]n|asistente|agenda|desarrollo/i.test(cellTexts[0])) {
          activity = cellTexts[0];
          responsible = cellTexts[1];
          dateRaw = cellTexts[2];
        }
      }

      // Limpieza y filtrado de títulos de sección (ej. "4. Compromisos")
      if (
        activity && 
        activity.length > 5 && 
        !/^4?\s*\.?\s*compromisos?$/i.test(activity) &&
        !/actividades\s+a\s+desarrollar/i.test(activity)
      ) {
        const dueDateIso = parseDateToIso(dateRaw, baseDateIso);

        commitments.push({
          id: `${allyId}-imp-${Date.now()}-${commitments.length + 1}`,
          activity: activity.trim(),
          responsible: responsible.trim() || 'Dirección de Alianzas UAM',
          dueDate: dueDateIso,
          status: 'PENDIENTE',
          completed: false,
          actaNumber,
          allyId,
          comments: dateRaw ? `Plazo original: ${dateRaw}` : undefined
        });
      }
    }

    // Si encontramos compromisos en esta tabla, no necesitamos buscar en tablas de firmas o asistentes
    if (commitments.length > 0) {
      break;
    }
  }

  return commitments;
}
