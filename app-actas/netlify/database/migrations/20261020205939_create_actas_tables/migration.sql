CREATE TABLE "actas" (
	"id" text PRIMARY KEY,
	"number" text NOT NULL,
	"date" text NOT NULL,
	"ally_id" text NOT NULL,
	"subject" text NOT NULL,
	"source_file_name" text NOT NULL,
	"docx_key" text,
	"fingerprint" text NOT NULL UNIQUE,
	"raw_html" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allies" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"category" text,
	"contact_email" text,
	"contact_name" text,
	"last_contact_date" text,
	"expected_response_date" text,
	"response_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_meta" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commitments" (
	"id" text PRIMARY KEY,
	"ally_id" text NOT NULL,
	"activity" text NOT NULL,
	"responsible" text DEFAULT 'Por asignar' NOT NULL,
	"due_date" text NOT NULL,
	"status" text DEFAULT 'PENDIENTE' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" text,
	"acta_number" text,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signed_actas" (
	"id" text PRIMARY KEY,
	"acta_number" text NOT NULL,
	"ally_id" text NOT NULL,
	"pdf_file_name" text NOT NULL,
	"pdf_key" text,
	"fingerprint" text NOT NULL UNIQUE,
	"upload_date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "commitments_ally_idx" ON "commitments" ("ally_id");--> statement-breakpoint
ALTER TABLE "actas" ADD CONSTRAINT "actas_ally_id_allies_id_fkey" FOREIGN KEY ("ally_id") REFERENCES "allies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_ally_id_allies_id_fkey" FOREIGN KEY ("ally_id") REFERENCES "allies"("id") ON DELETE CASCADE;