-- AlterTable
ALTER TABLE "Company" ADD COLUMN "city" TEXT;
ALTER TABLE "Company" ADD COLUMN "district" TEXT;
ALTER TABLE "Company" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Company" ADD COLUMN "taxNumber" TEXT;
ALTER TABLE "Company" ADD COLUMN "tradeRegister" TEXT;
ALTER TABLE "Company" ADD COLUMN "website" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "phone" TEXT,
    "title" TEXT,
    "avatar" TEXT,
    "emailOrders" BOOLEAN NOT NULL DEFAULT true,
    "emailCalendar" BOOLEAN NOT NULL DEFAULT true,
    "emailInventory" BOOLEAN NOT NULL DEFAULT false,
    "smsOrders" BOOLEAN NOT NULL DEFAULT true,
    "smsReminders" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notificationFrequency" TEXT NOT NULL DEFAULT 'instant',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'tr',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" DATETIME,
    "googleCalendarId" TEXT,
    "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("companyId", "createdAt", "email", "googleAccessToken", "googleCalendarEnabled", "googleCalendarId", "googleRefreshToken", "googleTokenExpiry", "id", "isActive", "name", "password", "role", "updatedAt") SELECT "companyId", "createdAt", "email", "googleAccessToken", "googleCalendarEnabled", "googleCalendarId", "googleRefreshToken", "googleTokenExpiry", "id", "isActive", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
