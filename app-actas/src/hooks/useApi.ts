// src/hooks/useApi.ts
// Centraliza todas las llamadas fetch al backend Netlify (/api/*)

import { Ally, Acta, SignedActa, Commitment } from '../types';

export interface AppState {
  allies: Ally[];
  actas: Acta[];
  signedActas: SignedActa[];
}

const BASE = '/api';

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res;
}

export const api = {
  /** Carga el estado completo (aliados, actas, actas firmadas) */
  getState: (): Promise<AppState> =>
    apiFetch('/state').then((r) => r.json()),

  /** Restaura los datos semilla */
  restore: (): Promise<AppState> =>
    apiFetch('/restore', { method: 'POST' }).then((r) => r.json()),

  // ── Aliados ──────────────────────────────────────────────
  addAlly: (ally: Ally): Promise<AppState> =>
    apiFetch('/allies', { method: 'POST', body: JSON.stringify(ally) }).then((r) => r.json()),

  updateAlly: (ally: Ally): Promise<AppState> =>
    apiFetch(`/allies/${ally.id}`, { method: 'PUT', body: JSON.stringify(ally) }).then((r) => r.json()),

  deleteAlly: (allyId: string): Promise<void> =>
    apiFetch(`/allies/${allyId}`, { method: 'DELETE' }).then(() => undefined),

  // ── Compromisos ───────────────────────────────────────────
  addCommitment: (allyId: string, item: Omit<Commitment, 'id'> | Commitment): Promise<Commitment> =>
    apiFetch('/commitments', { method: 'POST', body: JSON.stringify({ allyId, item }) }).then((r) => r.json()),

  updateCommitment: (c: Commitment): Promise<Commitment> =>
    apiFetch(`/commitments/${c.id}`, { method: 'PATCH', body: JSON.stringify(c) }).then((r) => r.json()),

  deleteCommitment: (id: string): Promise<void> =>
    apiFetch(`/commitments/${id}`, { method: 'DELETE' }).then(() => undefined),

  // ── Actas ─────────────────────────────────────────────────
  /** Sube un acta con su archivo .docx adjunto */
  addActa: async (acta: Acta, file: File | null): Promise<AppState> => {
    const form = new FormData();
    form.append('acta', JSON.stringify(acta));
    if (file) form.append('file', file);
    const res = await fetch(`${BASE}/actas`, { method: 'POST', body: form });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
    return res.json();
  },

  // ── Actas Firmadas ────────────────────────────────────────
  addSignedActa: async (signed: SignedActa, file: File | null): Promise<AppState> => {
    const form = new FormData();
    form.append('signed', JSON.stringify(signed));
    if (file) form.append('file', file);
    const res = await fetch(`${BASE}/signed-actas`, { method: 'POST', body: form });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
    return res.json();
  },
};
