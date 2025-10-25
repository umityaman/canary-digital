-- First, check if column already exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Invoice' AND column_name = 'companyId';

-- Add companyId column if it doesn't exist
ALTER TABLE "Invoice" 
  ADD COLUMN IF NOT EXISTS "companyId" INTEGER;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Invoice' 
ORDER BY ordinal_position;
