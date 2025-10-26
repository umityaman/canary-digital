# 🔧 INCOME TABLOSU MANUEL OLUŞTURMA REHBERİ

## Yöntem: GCP Console ile SQL Çalıştırma (5 dakika)

### ADIM 1: GCP Console'a Git
1. Tarayıcıda aç: https://console.cloud.google.com/sql/instances
2. Proje seç: `canary-digital-475319`
3. Instance seç: `canary-postgres`

### ADIM 2: SQL Editor'ü Aç
1. Sol menüden **"SQL"** veya **"Query Insights"** tıkla
2. Veya üst menüden **"Open Cloud Shell"** → `gcloud sql connect canary-postgres --user=postgres`

### ADIM 3: SQL'i Çalıştır

Aşağıdaki SQL kodunu kopyala ve çalıştır:

```sql
-- INCOME TABLOSU OLUŞTURMA
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

-- INDEXLER
CREATE INDEX IF NOT EXISTS "Income_companyId_idx" ON "Income"("companyId");
CREATE INDEX IF NOT EXISTS "Income_category_idx" ON "Income"("category");
CREATE INDEX IF NOT EXISTS "Income_date_idx" ON "Income"("date");
CREATE INDEX IF NOT EXISTS "Income_invoiceId_idx" ON "Income"("invoiceId");

-- SEED DATA (5 kayıt)
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

-- DOĞRULAMA
SELECT COUNT(*) as income_count FROM "Income";
SELECT * FROM "Income" ORDER BY "date" DESC LIMIT 5;
```

### ADIM 4: Doğrula

Başarılı ise:
- ✅ "CREATE TABLE" mesajı
- ✅ "CREATE INDEX" x4 mesajı
- ✅ "INSERT 0 1" x5 mesajı (veya "INSERT 0 0" - zaten varsa)
- ✅ income_count: 5
- ✅ 5 kayıt listesi

---

## ⚡ ALTERNATIF: Cloud Shell ile Hızlı Kurulum

GCP Console'da üstteki **terminal ikonuna** tıkla ve şunu çalıştır:

```bash
# Password: gcp-postgres-password.txt dosyasındaki şifre
gcloud sql connect canary-postgres --user=postgres --database=canary_db

# Yukarıdaki SQL'i yapıştır
```

---

## ✅ Başarı Kontrolü

SQL çalıştıktan sonra şunu test et:

```bash
# Backend'den test
curl -X POST https://canary-backend-672344972017.europe-west1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@canary.com","password":"admin123"}'

# Token'i kopyala, sonra:
curl https://canary-backend-672344972017.europe-west1.run.app/api/accounting/incomes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Eğer route not found hatası alırsan, backend deploy gerekiyor
```

---

## 📝 NOTLAR

- **IF NOT EXISTS** kullanıldı - tekrar çalıştırılabilir
- **WHERE NOT EXISTS** ile seed data duplicate engellendi
- Foreign key constraints doğru (Company ve Invoice'a referans)
- Indexes performans için eklendi

---

## ⏭️ SONRASI

Income tablosu oluştuktan sonra:
1. ✅ Backend deploy (accounting endpoints'i aktif et)
2. ✅ API test
3. ✅ Frontend UI geliştir

SQL'i çalıştırdıktan sonra bana haber ver! 🚀
