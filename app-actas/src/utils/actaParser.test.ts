// src/utils/actaParser.test.ts
import { parseCommitmentsFromDocHtml, extractActaMetadata, parseDateToIso } from './actaParser';

describe('actaParser tests', () => {
  it('normalizes relative dates correctly', () => {
    expect(parseDateToIso('Hasta 27/10/2026', '2026-10-19')).toBe('2026-10-27');
    expect(parseDateToIso('Mismo día', '2026-10-19')).toBe('2026-10-19');
    expect(parseDateToIso('Corto plazo', '2026-10-19')).toBe('2026-10-26');
  });

  it('extracts metadata from file name and html', () => {
    const meta = extractActaMetadata(
      '<table><tr><td>Reunión de:</td><td>Coordinación Empleos Verdes FESCO</td></tr><tr><td>Fecha de reunión:</td><td>Lunes, 19/10/2026</td></tr></table>',
      'EmpleosVerdesActa01_2026.docx'
    );
    expect(meta.meetingDate).toBe('2026-10-19');
    expect(meta.actaNumber).toBe('1');
    expect(meta.allyName).toContain('Empleos Verdes');
  });

  it('parses all commitments from 4-column table with No. column', () => {
    const html = `
      <table>
        <tr><td><strong>4. Compromisos</strong></td></tr>
        <tr><td>No.</td><td>Actividades</td><td>Responsable (s)</td><td>Fecha</td></tr>
        <tr><td>1</td><td>Tarea 1 de prueba</td><td>Responsable 1</td><td>Corto plazo</td></tr>
        <tr><td>2</td><td>Tarea 2 de prueba</td><td>Responsable 2</td><td>Hasta 27/10/2026</td></tr>
      </table>
    `;
    const commitments = parseCommitmentsFromDocHtml(html, 'fesco', '1', '2026-10-19');
    expect(commitments.length).toBe(2);
    expect(commitments[0].activity).toBe('Tarea 1 de prueba');
    expect(commitments[0].responsible).toBe('Responsable 1');
    expect(commitments[0].dueDate).toBe('2026-10-26');
    expect(commitments[1].dueDate).toBe('2026-10-27');
  });
});
