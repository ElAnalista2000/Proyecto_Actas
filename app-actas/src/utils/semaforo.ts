// src/utils/semaforo.ts
// Lógica del semáforo de actividad para aliados

import { Ally } from '../types';

export type SemaforoColor = 'green' | 'yellow' | 'red' | 'gray';

export interface SemaforoInfo {
  color: SemaforoColor;
  label: string;
  days: number | null;
}

/**
 * Calcula el estado del semáforo de un aliado basándose en:
 *  - responseStatus (si está marcado manualmente como ACTIVO/EN_GESTION/INACTIVO)
 *  - lastContactDate (días transcurridos desde el último contacto)
 *
 * Reglas:
 *  - Verde  (ACTIVO):     responseStatus = ACTIVO  o  ≤ 7 días desde último contacto
 *  - Amarillo (EN GESTIÓN): responseStatus = EN_GESTION  o  8-15 días
 *  - Rojo (INACTIVO):     responseStatus = INACTIVO o  > 15 días
 *  - Gris: sin información de fecha ni estado manual
 */
export function getSemaforoInfo(ally: Ally): SemaforoInfo {
  // Si tiene estado manual, usarlo directamente
  if (ally.responseStatus === 'ACTIVO') {
    return { color: 'green', label: 'Activo', days: null };
  }
  if (ally.responseStatus === 'INACTIVO') {
    return { color: 'red', label: 'Inactivo', days: null };
  }
  if (ally.responseStatus === 'EN_GESTION') {
    return { color: 'yellow', label: 'En Gestión', days: null };
  }

  // Calcular por fecha
  if (!ally.lastContactDate) {
    return { color: 'gray', label: 'Sin datos', days: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(ally.lastContactDate);
  last.setHours(0, 0, 0, 0);
  const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 7) return { color: 'green', label: `Activo (hace ${days}d)`, days };
  if (days <= 15) return { color: 'yellow', label: `En Gestión (hace ${days}d)`, days };
  return { color: 'red', label: `Inactivo (hace ${days}d)`, days };
}

/** Devuelve las clases Tailwind del círculo según el color del semáforo */
export function getSemaforoBadgeClass(color: SemaforoColor): string {
  switch (color) {
    case 'green':  return 'bg-emerald-500 ring-2 ring-emerald-200';
    case 'yellow': return 'bg-amber-400 ring-2 ring-amber-200';
    case 'red':    return 'bg-rose-500 ring-2 ring-rose-200';
    default:       return 'bg-slate-300 ring-2 ring-slate-100';
  }
}
