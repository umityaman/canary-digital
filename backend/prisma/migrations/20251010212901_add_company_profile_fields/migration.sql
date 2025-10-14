-- AlterTable
ALTER TABLE "Company" ADD COLUMN "accountHolder" TEXT;
ALTER TABLE "Company" ADD COLUMN "address2" TEXT;
ALTER TABLE "Company" ADD COLUMN "authorizedPerson" TEXT;
ALTER TABLE "Company" ADD COLUMN "bankBranch" TEXT;
ALTER TABLE "Company" ADD COLUMN "bankName" TEXT;
ALTER TABLE "Company" ADD COLUMN "iban" TEXT;
ALTER TABLE "Company" ADD COLUMN "logo" TEXT;
ALTER TABLE "Company" ADD COLUMN "mersisNo" TEXT;
ALTER TABLE "Company" ADD COLUMN "mobilePhone" TEXT;
ALTER TABLE "Company" ADD COLUMN "taxOffice" TEXT;
ALTER TABLE "Company" ADD COLUMN "timezone" TEXT DEFAULT 'Europe/Istanbul';
