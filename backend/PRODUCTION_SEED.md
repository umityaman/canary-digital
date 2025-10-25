# Production Seed Script

Bu script production database'ini seed data ile doldurmak için kullanılır.

## Kullanım

1. **Cloud Shell'den** (Google Cloud Console):

```bash
# Cloud Run instance'a bağlan
gcloud run services proxy canary-backend --project=canary-427721 --region=europe-west1

# Yeni terminal aç ve:
cd backend
npm install
npx tsx prisma/seed.ts
```

2. **Veya Railway CLI** (eğer Railway kullanıyorsanız):

```bash
railway run npx tsx prisma/seed.ts
```

3. **Veya direkt DATABASE_URL ile**:

```bash
cd backend
DATABASE_URL="postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway" npx tsx prisma/seed.ts
```

## Temizlik (İsteğe Bağlı)

Önce mevcut accounting verilerini temizlemek için:

```bash
DATABASE_URL="postgresql://postgres:Zl63FpSnaO7q9u0e2f1KyoHxXkgthvz5@35.205.55.157:5432/railway" npx tsx clean-accounting-data.ts
```

## Beklenen Sonuç

✅ 5 Invoices (2 paid, 3 pending)
✅ 5 Offers (sent, draft, accepted, rejected, expired)
✅ 5 Expenses (Rent, Utilities, Maintenance, Insurance, Marketing)
✅ 2 Payments (bank_transfer, credit_card)
✅ 5 Orders (CONFIRMED, IN_PROGRESS, COMPLETED statuses)
