-- Add missing columns to Invoice table
ALTER TABLE "Invoice" 
  ADD COLUMN IF NOT EXISTS "companyId" INTEGER,
  ADD COLUMN IF NOT EXISTS "invoiceType" TEXT DEFAULT 'rental',
  ADD COLUMN IF NOT EXISTS "items" JSONB,
  ADD COLUMN IF NOT EXISTS "subtotal" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "vatRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "total" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add foreign key for companyId
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_companyId_fkey'
  ) THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" 
      FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for companyId
CREATE INDEX IF NOT EXISTS "Invoice_companyId_idx" ON "Invoice"("companyId");

-- Add missing columns to Payment table
ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS "notes" TEXT;
