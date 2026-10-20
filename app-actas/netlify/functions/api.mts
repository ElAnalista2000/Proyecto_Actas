// netlify/functions/api.mts
// Backend único de la app: aliados, compromisos, actas, actas firmadas y archivos.
// Todas las rutas requieren un usuario autenticado con Netlify Identity; los datos son compartidos.
import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
import { and, eq, ilike, inArray, notInArray, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { allies, commitments, actas, signedActas, appMeta } from "../../db/schema.js";
import { seedData, seedActas, seedSignedActas } from "../../src/data/seedData.js";
import type { Ally, Acta, Commitment, SignedActa } from "../../src/types.js";

const files = () => getStore("actas-files");
const today = () => new Date().toISOString().split("T")[0];
const FALLBACK_TEXT = "revisión y seguimiento integral de acuerdos";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const fileUrl = (key?: string | null) => (key ? `/api/files/${encodeURIComponent(key)}` : undefined);

type CommitmentRow = typeof commitments.$inferSelect;

const toCommitment = (c: CommitmentRow): Commitment => ({
  id: c.id,
  activity: c.activity,
  responsible: c.responsible,
  dueDate: c.dueDate,
  status: c.status as Commitment["status"],
  completed: c.completed,
  completedAt: c.completedAt ?? undefined,
  actaNumber: c.actaNumber ?? undefined,
  allyId: c.allyId,
  comments: c.comments ?? "",
});

// Normaliza un compromiso igual que lo hacía el frontend (estado, completado y fechas por defecto)
const normalizeCommitment = (allyId: string, item: Partial<Commitment>) => {
  const isCompleted = item.status === "CUMPLIDO" || !!item.completed;
  return {
    id: item.id || `${allyId}-c-${Date.now()}`,
    allyId,
    activity: item.activity || "",
    responsible: item.responsible || "Por asignar",
    dueDate: item.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: isCompleted ? "CUMPLIDO" : item.status || "PENDIENTE",
    completed: isCompleted,
    completedAt: isCompleted ? item.completedAt || today() : null,
    actaNumber: item.actaNumber || "1",
    comments: item.comments || "",
  };
};

const allyValues = (a: Ally) => ({
  id: a.id,
  name: a.name,
  category: a.category ?? null,
  contactEmail: a.contactEmail ?? null,
  contactName: a.contactName ?? null,
  lastContactDate: a.lastContactDate ?? null,
  expectedResponseDate: a.expectedResponseDate ?? null,
  responseStatus: a.responseStatus ?? null,
});

const findAlly = async (id: string) => {
  const [ally] = await db.select().from(allies).where(ilike(allies.id, id.replace(/[%_\\]/g, "\\$&")));
  return ally;
};

async function loadSeed() {
  await db.delete(signedActas);
  await db.delete(actas);
  await db.delete(commitments);
  await db.delete(allies);
  for (const ally of seedData.allies) {
    await db.insert(allies).values(allyValues(ally));
    if (ally.commitments.length) {
      await db.insert(commitments).values(ally.commitments.map((c) => normalizeCommitment(ally.id, c))).onConflictDoNothing();
    }
  }
  for (const a of seedActas) {
    await db.insert(actas).values({
      id: a.id, number: a.number, date: a.date, allyId: a.allyId, subject: a.subject,
      sourceFileName: a.sourceFileName, fingerprint: a.fingerprint, rawHtml: a.rawHtml ?? null,
    });
  }
  for (const s of seedSignedActas) {
    await db.insert(signedActas).values({
      id: s.id, actaNumber: s.actaNumber, allyId: s.allyId, pdfFileName: s.pdfFileName,
      fingerprint: s.fingerprint, uploadDate: s.uploadDate,
    });
  }
  await db.insert(appMeta).values({ key: "seeded", value: today() }).onConflictDoNothing();
}

async function loadState() {
  const [seeded] = await db.select().from(appMeta).where(eq(appMeta.key, "seeded"));
  if (!seeded) await loadSeed();

  const [allyRows, commitmentRows, actaRows, signedRows] = await Promise.all([
    db.select().from(allies).orderBy(sql`${allies.createdAt} desc`),
    db.select().from(commitments).orderBy(sql`${commitments.createdAt} desc`),
    db.select().from(actas).orderBy(sql`${actas.createdAt} desc`),
    db.select().from(signedActas).orderBy(sql`${signedActas.createdAt} desc`),
  ]);
  const list = commitmentRows.map(toCommitment);

  const allyList: Ally[] = allyRows.map((a) => ({
    id: a.id,
    name: a.name,
    category: (a.category ?? undefined) as Ally["category"],
    contactEmail: a.contactEmail ?? undefined,
    contactName: a.contactName ?? undefined,
    lastContactDate: a.lastContactDate ?? undefined,
    expectedResponseDate: a.expectedResponseDate ?? undefined,
    responseStatus: (a.responseStatus ?? undefined) as Ally["responseStatus"],
    commitments: list.filter((c) => c.allyId === a.id),
  }));
  const allyById = new Map(allyList.map((a) => [a.id, a]));

  const actaList: Acta[] = actaRows.map((a) => {
    const ally = allyById.get(a.allyId);
    return {
      id: a.id,
      number: a.number,
      date: a.date,
      allyId: a.allyId,
      subject: a.subject,
      sourceFileName: a.sourceFileName,
      docxUrl: fileUrl(a.docxKey),
      fingerprint: a.fingerprint,
      rawHtml: a.rawHtml ?? undefined,
      allyName: ally?.name,
      category: ally?.category,
      contactName: ally?.contactName,
      commitments: list.filter((c) => c.allyId === a.allyId && c.actaNumber === a.number),
    };
  });

  const signedList: SignedActa[] = signedRows.map((s) => ({
    id: s.id,
    actaNumber: s.actaNumber,
    allyId: s.allyId,
    pdfFileName: s.pdfFileName,
    pdfUrl: fileUrl(s.pdfKey) ?? "#",
    fingerprint: s.fingerprint,
    uploadDate: s.uploadDate,
  }));

  return { allies: allyList, actas: actaList, signedActas: signedList };
}

// Importa un acta: la registra (reemplazando duplicados) y fusiona sus compromisos con el aliado
async function addActa(acta: Acta, docxKey: string | null) {
  let ally = await findAlly(acta.allyId);
  if (ally) {
    await db
      .update(allies)
      .set({
        name: acta.allyName || ally.name,
        category: acta.category || ally.category,
        contactName: acta.contactName || ally.contactName,
      })
      .where(eq(allies.id, ally.id));
    await db.delete(commitments).where(and(eq(commitments.allyId, ally.id), ilike(commitments.activity, `%${FALLBACK_TEXT}%`)));
  } else {
    [ally] = await db
      .insert(allies)
      .values({
        id: acta.allyId,
        name: acta.allyName || acta.allyId.charAt(0).toUpperCase() + acta.allyId.slice(1),
        category: acta.category || "Empresa",
        contactName: acta.contactName ?? null,
      })
      .returning();
  }
  const allyId = ally.id;

  const existing = await db.select().from(commitments).where(eq(commitments.allyId, allyId));
  const fresh = acta.commitments.filter(
    (nc) => !existing.some((ec) => ec.id === nc.id || ec.activity.trim().toLowerCase() === nc.activity.trim().toLowerCase())
  );
  if (fresh.length) {
    await db.insert(commitments).values(fresh.map((c) => normalizeCommitment(allyId, { ...c, actaNumber: c.actaNumber || acta.number }))).onConflictDoNothing();
  }

  const previous = await db
    .select()
    .from(actas)
    .where(or(eq(actas.fingerprint, acta.fingerprint), eq(actas.id, acta.id)));
  for (const p of previous) {
    if (p.docxKey && p.docxKey !== docxKey) await files().delete(p.docxKey);
  }
  if (previous.length) await db.delete(actas).where(inArray(actas.id, previous.map((p) => p.id)));

  await db.insert(actas).values({
    id: acta.id,
    number: acta.number,
    date: acta.date,
    allyId,
    subject: acta.subject,
    sourceFileName: acta.sourceFileName,
    docxKey,
    fingerprint: acta.fingerprint,
    rawHtml: acta.rawHtml ?? null,
  });
}

async function storeFile(file: File | null) {
  if (!file) return null;
  const key = `${Date.now()}-${crypto.randomUUID()}`;
  await files().set(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type || "application/octet-stream", fileName: file.name },
  });
  return key;
}

async function deleteAllyCascade(allyId: string) {
  const actaRows = await db.select({ key: actas.docxKey }).from(actas).where(eq(actas.allyId, allyId));
  const signedRows = await db.select({ key: signedActas.pdfKey }).from(signedActas).where(eq(signedActas.allyId, allyId));
  for (const { key } of [...actaRows, ...signedRows]) if (key) await files().delete(key);
  await db.delete(signedActas).where(eq(signedActas.allyId, allyId));
  await db.delete(allies).where(eq(allies.id, allyId)); // compromisos y actas caen por cascada
}

export default async (req: Request) => {
  const user = await getUser();
  if (!user) return json({ error: "No autorizado" }, 401);

  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [resource, id] = parts;
  const method = req.method;

  try {
    if (resource === "state" && method === "GET") return json(await loadState());

    if (resource === "restore" && method === "POST") {
      await loadSeed();
      return json(await loadState());
    }

    if (resource === "files" && id && method === "GET") {
      const entry = await files().getWithMetadata(id, { type: "arrayBuffer" });
      if (!entry) return new Response("No encontrado", { status: 404 });
      const meta = entry.metadata as { contentType?: string; fileName?: string };
      return new Response(entry.data, {
        headers: {
          "Content-Type": meta.contentType || "application/octet-stream",
          "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(meta.fileName || id)}`,
        },
      });
    }

    if (resource === "actas" && method === "POST") {
      const form = await req.formData();
      const acta = JSON.parse(String(form.get("acta"))) as Acta;
      const docxKey = await storeFile(form.get("file") as File | null);
      await addActa(acta, docxKey);
      return json(await loadState());
    }

    if (resource === "signed-actas" && method === "POST") {
      const form = await req.formData();
      const signed = JSON.parse(String(form.get("signed"))) as SignedActa;
      const [dup] = await db.select().from(signedActas).where(eq(signedActas.fingerprint, signed.fingerprint));
      if (!dup) {
        const pdfKey = await storeFile(form.get("file") as File | null);
        await db.insert(signedActas).values({
          id: signed.id,
          actaNumber: signed.actaNumber,
          allyId: signed.allyId,
          pdfFileName: signed.pdfFileName,
          pdfKey,
          fingerprint: signed.fingerprint,
          uploadDate: signed.uploadDate || today(),
        });
      }
      return json(await loadState());
    }

    if (resource === "commitments") {
      if (method === "POST") {
        const { allyId, item } = (await req.json()) as { allyId: string; item: Partial<Commitment> };
        const ally = await findAlly(allyId);
        if (!ally) return json({ error: "Aliado no encontrado" }, 404);
        const [row] = await db.insert(commitments).values(normalizeCommitment(ally.id, item)).returning();
        return json(toCommitment(row), 201);
      }
      if (id && method === "PATCH") {
        const patch = (await req.json()) as Partial<Commitment>;
        const [current] = await db.select().from(commitments).where(eq(commitments.id, id));
        if (!current) return json({ error: "Compromiso no encontrado" }, 404);
        const merged = normalizeCommitment(current.allyId, {
          ...toCommitment(current),
          ...patch,
          // Al cambiar el estado se recalcula la fecha de cumplimiento
          completedAt: patch.completedAt ?? current.completedAt ?? undefined,
          completed: patch.status ? patch.status === "CUMPLIDO" : patch.completed ?? current.completed,
        });
        const { id: _id, allyId: _allyId, ...values } = merged;
        const [row] = await db.update(commitments).set(values).where(eq(commitments.id, id)).returning();
        return json(toCommitment(row));
      }
      if (id && method === "DELETE") {
        await db.delete(commitments).where(eq(commitments.id, id));
        return new Response(null, { status: 204 });
      }
    }

    if (resource === "allies") {
      if (method === "POST") {
        const ally = (await req.json()) as Ally;
        if (await findAlly(ally.id)) return json({ error: "El aliado ya existe" }, 409);
        await db.insert(allies).values(allyValues(ally));
        if (ally.commitments?.length) {
          await db.insert(commitments).values(ally.commitments.map((c) => normalizeCommitment(ally.id, c))).onConflictDoNothing();
        }
        return json(await loadState(), 201);
      }
      if (id && method === "PUT") {
        const ally = (await req.json()) as Ally;
        const { id: _id, ...values } = allyValues({ ...ally, id });
        await db.update(allies).set(values).where(eq(allies.id, id));
        // Sincroniza la lista de compromisos enviada por el cliente
        const incoming = (ally.commitments || []).map((c) => normalizeCommitment(id, c));
        const keep = incoming.map((c) => c.id);
        await db
          .delete(commitments)
          .where(keep.length ? and(eq(commitments.allyId, id), notInArray(commitments.id, keep)) : eq(commitments.allyId, id));
        for (const { id: commitmentId, ...rest } of incoming) {
          await db.insert(commitments).values({ id: commitmentId, ...rest }).onConflictDoUpdate({ target: commitments.id, set: rest });
        }
        return json(await loadState());
      }
      if (id && method === "DELETE") {
        await deleteAllyCascade(id);
        return new Response(null, { status: 204 });
      }
    }

    return json({ error: "Ruta no encontrada" }, 404);
  } catch (err) {
    console.error("API error", method, url.pathname, err);
    return json({ error: "Error interno del servidor" }, 500);
  }
};

export const config: Config = {
  path: "/api/*",
};
