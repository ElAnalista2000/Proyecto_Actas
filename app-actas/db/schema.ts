import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const allies = pgTable("allies", {
  id: text().primaryKey(),
  name: text().notNull(),
  category: text(),
  contactEmail: text("contact_email"),
  contactName: text("contact_name"),
  lastContactDate: text("last_contact_date"),
  expectedResponseDate: text("expected_response_date"),
  responseStatus: text("response_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commitments = pgTable(
  "commitments",
  {
    id: text().primaryKey(),
    allyId: text("ally_id")
      .notNull()
      .references(() => allies.id, { onDelete: "cascade" }),
    activity: text().notNull(),
    responsible: text().notNull().default("Por asignar"),
    dueDate: text("due_date").notNull(),
    status: text().notNull().default("PENDIENTE"),
    completed: boolean().notNull().default(false),
    completedAt: text("completed_at"),
    actaNumber: text("acta_number"),
    comments: text(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("commitments_ally_idx").on(t.allyId)]
);

export const actas = pgTable("actas", {
  id: text().primaryKey(),
  number: text().notNull(),
  date: text().notNull(),
  allyId: text("ally_id")
    .notNull()
    .references(() => allies.id, { onDelete: "cascade" }),
  subject: text().notNull(),
  sourceFileName: text("source_file_name").notNull(),
  docxKey: text("docx_key"),
  fingerprint: text().notNull().unique(),
  rawHtml: text("raw_html"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const signedActas = pgTable("signed_actas", {
  id: text().primaryKey(),
  actaNumber: text("acta_number").notNull(),
  allyId: text("ally_id").notNull(),
  pdfFileName: text("pdf_file_name").notNull(),
  pdfKey: text("pdf_key"),
  fingerprint: text().notNull().unique(),
  uploadDate: text("upload_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appMeta = pgTable("app_meta", {
  key: text().primaryKey(),
  value: text().notNull(),
});
