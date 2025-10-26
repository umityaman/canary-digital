-- Income tablosunu oluştur
CREATE TABLE IF NOT EXISTS "Income" (
  "id" SERIAL PRIMARY KEY,
  "companyId" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'received',
  "paymentMethod" TEXT,
  "notes" TEXT,
  "invoiceId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Income_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Income_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexler
CREATE INDEX IF NOT EXISTS "Income_companyId_idx" ON "Income"("companyId");
CREATE INDEX IF NOT EXISTS "Income_category_idx" ON "Income"("category");
CREATE INDEX IF NOT EXISTS "Income_date_idx" ON "Income"("date");
CREATE INDEX IF NOT EXISTS "Income_invoiceId_idx" ON "Income"("invoiceId");

-- Seed data (5 adet income kaydı)
INSERT INTO "Income" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes")
SELECT 1, 'Equipment Rental', 25000, 'Equipment Rental', '2025-10-10', 'received', 'bank_transfer', 'Equipment Rental - October 2025'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE "description" = 'Equipment Rental' AND "date" = '2025-10-10');

INSERT INTO "Income" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes")
SELECT 1, 'Service Fee', 12000, 'Service Fee', '2025-10-11', 'received', 'credit_card', 'Service Fee - October 2025'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE "description" = 'Service Fee' AND "date" = '2025-10-11');

INSERT INTO "Income" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes")
SELECT 1, 'Product Sale', 18000, 'Product Sale', '2025-10-12', 'received', 'bank_transfer', 'Product Sale - October 2025'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE "description" = 'Product Sale' AND "date" = '2025-10-12');

INSERT INTO "Income" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes")
SELECT 1, 'Consulting', 8000, 'Consulting', '2025-10-13', 'received', 'credit_card', 'Consulting - October 2025'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE "description" = 'Consulting' AND "date" = '2025-10-13');

INSERT INTO "Income" ("companyId", "description", "amount", "category", "date", "status", "paymentMethod", "notes")
SELECT 1, 'Training', 6000, 'Training', '2025-10-14', 'received', 'bank_transfer', 'Training - October 2025'
WHERE NOT EXISTS (SELECT 1 FROM "Income" WHERE "description" = 'Training' AND "date" = '2025-10-14');
