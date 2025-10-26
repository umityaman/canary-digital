-- Create Offer table
CREATE TABLE IF NOT EXISTS "Offer" (
  "id" SERIAL PRIMARY KEY,
  "customerId" INTEGER NOT NULL,
  "offerNumber" TEXT UNIQUE NOT NULL,
  "offerDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "items" JSONB NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "vatAmount" DOUBLE PRECISION NOT NULL,
  "grandTotal" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Offer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Offer_customerId_idx" ON "Offer"("customerId");
CREATE INDEX IF NOT EXISTS "Offer_status_idx" ON "Offer"("status");
CREATE INDEX IF NOT EXISTS "Offer_offerDate_idx" ON "Offer"("offerDate");

-- Create Expense table
CREATE TABLE IF NOT EXISTS "Expense" (
  "id" SERIAL PRIMARY KEY,
  "companyId" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paymentMethod" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Expense_companyId_idx" ON "Expense"("companyId");
CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category");
CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date");
