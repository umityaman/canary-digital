-- E-Invoice Support Migration
-- Adds EInvoice and EArchiveInvoice tables to backfill Prisma schema changes

CREATE TABLE IF NOT EXISTS "EInvoice" (
    "id" SERIAL PRIMARY KEY,
    "invoiceId" INTEGER NOT NULL UNIQUE,
    "uuid" VARCHAR(100) NOT NULL UNIQUE,
    "ettn" VARCHAR(100),
    "gibStatus" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "gibResponse" JSONB,
    "xmlContent" TEXT NOT NULL,
    "xmlHash" VARCHAR(128),
    "sentDate" TIMESTAMP,
    "responseDate" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EInvoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "EInvoice_gibStatus_idx" ON "EInvoice"("gibStatus");
CREATE INDEX IF NOT EXISTS "EInvoice_uuid_idx" ON "EInvoice"("uuid");

CREATE TABLE IF NOT EXISTS "EArchiveInvoice" (
    "id" SERIAL PRIMARY KEY,
    "invoiceId" INTEGER NOT NULL UNIQUE,
    "archiveId" VARCHAR(100) NOT NULL UNIQUE,
    "portalStatus" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "pdfUrl" VARCHAR(500),
    "htmlContent" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EArchiveInvoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "EArchiveInvoice_portalStatus_idx" ON "EArchiveInvoice"("portalStatus");
