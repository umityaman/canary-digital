-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "issue" TEXT NOT NULL,
    "equipmentId" INTEGER,
    "equipmentName" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "customerId" INTEGER,
    "customerName" TEXT NOT NULL,
    "customerContact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" INTEGER,
    "assignedToName" TEXT,
    "technicianId" INTEGER,
    "receivedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" DATETIME,
    "estimatedCompletion" DATETIME NOT NULL,
    "completedDate" DATETIME,
    "returnedDate" DATETIME,
    "laborCost" REAL NOT NULL DEFAULT 0,
    "partsCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "diagnosis" TEXT,
    "workPerformed" TEXT,
    "testResults" TEXT,
    "photos" TEXT,
    "documents" TEXT,
    "slaDeadline" DATETIME,
    "slaCritical" BOOLEAN NOT NULL DEFAULT false,
    "internalNotes" TEXT,
    "customerNotes" TEXT,
    "warrantyStatus" TEXT,
    "warrantyExpiry" DATETIME,
    "companyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkOrder_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkOrderPart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workOrderId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitCost" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkOrderPart_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkOrderPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ServicePart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceAsset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "equipmentId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "condition" TEXT,
    "purchaseDate" DATETIME,
    "purchasePrice" REAL,
    "supplier" TEXT,
    "invoiceNumber" TEXT,
    "warrantyExpiry" DATETIME,
    "lastMaintenance" DATETIME,
    "nextMaintenance" DATETIME,
    "maintenanceInterval" INTEGER,
    "location" TEXT,
    "assignedTo" TEXT,
    "currentValue" REAL,
    "depreciationRate" REAL,
    "notes" TEXT,
    "photos" TEXT,
    "documents" TEXT,
    "qrCode" TEXT,
    "companyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceAsset_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServiceAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServicePart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "reorderPoint" INTEGER,
    "unitCost" REAL NOT NULL,
    "sellingPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "supplier" TEXT,
    "supplierPartNumber" TEXT,
    "supplierContact" TEXT,
    "location" TEXT,
    "bin" TEXT,
    "compatibleModels" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isObsolete" BOOLEAN NOT NULL DEFAULT false,
    "photo" TEXT,
    "notes" TEXT,
    "companyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicePart_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "employeeId" TEXT,
    "userId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "skills" TEXT,
    "certifications" TEXT,
    "specialization" TEXT,
    "totalWorkOrders" INTEGER NOT NULL DEFAULT 0,
    "completedWorkOrders" INTEGER NOT NULL DEFAULT 0,
    "avgRepairTime" REAL,
    "rating" REAL,
    "workingHours" TEXT,
    "emergencyContact" TEXT,
    "address" TEXT,
    "hireDate" DATETIME,
    "department" TEXT,
    "photo" TEXT,
    "notes" TEXT,
    "companyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Technician_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Technician_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_ticketNumber_key" ON "WorkOrder"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAsset_serialNumber_key" ON "ServiceAsset"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAsset_assetCode_key" ON "ServiceAsset"("assetCode");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePart_code_key" ON "ServicePart"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_email_key" ON "Technician"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_employeeId_key" ON "Technician"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_userId_key" ON "Technician"("userId");
