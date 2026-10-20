const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('mammoth_output.html', 'utf8');

const dom = new JSDOM(html);
global.DOMParser = dom.window.DOMParser;

// Include compiled or transpiled code logic
function parseDateToIso(dateRaw, baseDateIso) {
  if (!dateRaw || !dateRaw.trim()) return baseDateIso;
  const trimmed = dateRaw.trim();
  const dmyMatch = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const ymdMatch = trimmed.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const lower = trimmed.toLowerCase();
  const base = new Date(baseDateIso.includes('T') ? baseDateIso : `${baseDateIso}T12:00:00`);
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
  base.setDate(base.getDate() + 14);
  return base.toISOString().split('T')[0];
}

function parseCommitmentsFromDocHtml(html, allyId, actaNumber, baseDateIso) {
  const commitments = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tables = Array.from(doc.querySelectorAll('table'));

  for (const table of tables) {
    const tableText = table.textContent?.toLowerCase() || '';
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

      const hasActivityHeader = cellTexts.some(t => /actividad|compromiso|tarea|descripci/i.test(t));
      const hasResponsibleHeader = cellTexts.some(t => /responsable|encargad/i.test(t));

      if (hasActivityHeader && hasResponsibleHeader) {
        cellTexts.forEach((t, i) => {
          if (/actividad|compromiso|tarea|descripci/i.test(t)) colActivity = i;
          else if (/responsable|encargad/i.test(t)) colResponsible = i;
          else if (/fecha|plazo|l[ií]mite|entrega/i.test(t)) colDate = i;
        });
        continue;
      }

      let activity = '';
      let responsible = '';
      let dateRaw = '';

      if (colActivity !== -1 && cellTexts[colActivity]) {
        activity = cellTexts[colActivity];
        responsible = colResponsible !== -1 ? (cellTexts[colResponsible] || '') : '';
        dateRaw = colDate !== -1 ? (cellTexts[colDate] || '') : '';
      } else if (cellTexts.length >= 4 && /^\d+$/.test(cellTexts[0])) {
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

    if (commitments.length > 0) {
      break;
    }
  }

  return commitments;
}

const res = parseCommitmentsFromDocHtml(html, 'fesco-empleos-verdes', '1', '2026-10-19');
console.log('Result count:', res.length);
res.forEach((c, i) => {
  console.log(`${i+1}. [${c.dueDate}] (${c.responsible}): ${c.activity.substring(0, 70)}...`);
});
