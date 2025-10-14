-- CreateTable
CREATE TABLE "BooqableConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "apiKey" TEXT NOT NULL,
    "accountUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "lastSyncStatus" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BooqableConnection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BooqableSync" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "connectionId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "syncType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "triggeredBy" TEXT,
    CONSTRAINT "BooqableSync_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BooqableConnection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "company" TEXT,
    "taxNumber" TEXT,
    "booqableId" TEXT,
    "booqableUpdatedAt" DATETIME,
    "syncStatus" TEXT NOT NULL DEFAULT 'LOCAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("address", "company", "createdAt", "email", "id", "name", "phone", "taxNumber", "updatedAt") SELECT "address", "company", "createdAt", "email", "id", "name", "phone", "taxNumber", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_booqableId_key" ON "Customer"("booqableId");
CREATE TABLE "new_Equipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "category" TEXT,
    "serialNumber" TEXT,
    "qrCode" TEXT,
    "dailyPrice" REAL,
    "weeklyPrice" REAL,
    "monthlyPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT,
    "imageUrl" TEXT,
    "companyId" INTEGER NOT NULL,
    "booqableId" TEXT,
    "booqableUpdatedAt" DATETIME,
    "syncStatus" TEXT NOT NULL DEFAULT 'LOCAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Equipment" ("brand", "category", "companyId", "createdAt", "dailyPrice", "description", "id", "imageUrl", "model", "monthlyPrice", "name", "qrCode", "serialNumber", "status", "updatedAt", "weeklyPrice") SELECT "brand", "category", "companyId", "createdAt", "dailyPrice", "description", "id", "imageUrl", "model", "monthlyPrice", "name", "qrCode", "serialNumber", "status", "updatedAt", "weeklyPrice" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE UNIQUE INDEX "Equipment_qrCode_key" ON "Equipment"("qrCode");
CREATE UNIQUE INDEX "Equipment_booqableId_key" ON "Equipment"("booqableId");
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "customerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "googleEventId" TEXT,
    "googleEventLink" TEXT,
    "calendarSynced" BOOLEAN NOT NULL DEFAULT false,
    "calendarSyncedAt" DATETIME,
    "booqableId" TEXT,
    "booqableUpdatedAt" DATETIME,
    "syncStatus" TEXT NOT NULL DEFAULT 'LOCAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("calendarSynced", "calendarSyncedAt", "companyId", "createdAt", "customerId", "endDate", "googleEventId", "googleEventLink", "id", "notes", "orderNumber", "startDate", "status", "totalAmount", "updatedAt") SELECT "calendarSynced", "calendarSyncedAt", "companyId", "createdAt", "customerId", "endDate", "googleEventId", "googleEventLink", "id", "notes", "orderNumber", "startDate", "status", "totalAmount", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_booqableId_key" ON "Order"("booqableId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BooqableConnection_companyId_key" ON "BooqableConnection"("companyId");
