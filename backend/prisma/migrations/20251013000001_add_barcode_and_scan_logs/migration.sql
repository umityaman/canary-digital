-- CreateTable
CREATE TABLE "ScanLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipmentId" INTEGER NOT NULL,
    "scannedCode" TEXT NOT NULL,
    "scanType" TEXT NOT NULL,
    "scanAction" TEXT,
    "scannedBy" TEXT,
    "location" TEXT,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    "companyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScanLog_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable Equipment - Add barcode column
ALTER TABLE "Equipment" ADD COLUMN "barcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_barcode_key" ON "Equipment"("barcode");

-- CreateIndex
CREATE INDEX "ScanLog_equipmentId_idx" ON "ScanLog"("equipmentId");

-- CreateIndex
CREATE INDEX "ScanLog_scannedCode_idx" ON "ScanLog"("scannedCode");

-- CreateIndex
CREATE INDEX "ScanLog_createdAt_idx" ON "ScanLog"("createdAt");
