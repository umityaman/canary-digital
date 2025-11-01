-- Create DeliveryNote table
CREATE TABLE IF NOT EXISTS "DeliveryNote" (
    "id" SERIAL PRIMARY KEY,
    "deliveryNumber" TEXT NOT NULL UNIQUE,
    "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryType" TEXT NOT NULL DEFAULT 'sevk',
    "orderId" INTEGER,
    "customerId" INTEGER NOT NULL,
    "companyId" INTEGER,
    "invoiceId" INTEGER UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "driverName" TEXT,
    "driverPhone" TEXT,
    "vehiclePlate" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "notes" TEXT,
    "attachments" JSONB,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "DeliveryNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeliveryNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeliveryNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeliveryNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeliveryNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create DeliveryNoteItem table
CREATE TABLE IF NOT EXISTS "DeliveryNoteItem" (
    "id" SERIAL PRIMARY KEY,
    "deliveryNoteId" INTEGER NOT NULL,
    "equipmentId" INTEGER,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "unit" TEXT NOT NULL DEFAULT 'Adet',
    "orderItemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "DeliveryNoteItem_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "DeliveryNote"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeliveryNoteItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for DeliveryNote
CREATE INDEX IF NOT EXISTS "DeliveryNote_customerId_idx" ON "DeliveryNote"("customerId");
CREATE INDEX IF NOT EXISTS "DeliveryNote_orderId_idx" ON "DeliveryNote"("orderId");
CREATE INDEX IF NOT EXISTS "DeliveryNote_status_idx" ON "DeliveryNote"("status");
CREATE INDEX IF NOT EXISTS "DeliveryNote_deliveryDate_idx" ON "DeliveryNote"("deliveryDate");
CREATE INDEX IF NOT EXISTS "DeliveryNote_deliveryNumber_idx" ON "DeliveryNote"("deliveryNumber");

-- Create indexes for DeliveryNoteItem
CREATE INDEX IF NOT EXISTS "DeliveryNoteItem_deliveryNoteId_idx" ON "DeliveryNoteItem"("deliveryNoteId");
CREATE INDEX IF NOT EXISTS "DeliveryNoteItem_equipmentId_idx" ON "DeliveryNoteItem"("equipmentId");
