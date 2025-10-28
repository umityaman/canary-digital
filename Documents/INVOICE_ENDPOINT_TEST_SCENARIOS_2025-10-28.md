# Invoice Endpoint Test Scenarios (2025-10-28)

## 1. Manuel Fatura Ekleme
- Endpoint: POST /api/invoices
- Request Body:
```json
{
  "customerName": "Ahmet Yılmaz",
  "customerEmail": "ahmet@test.com",
  "customerPhone": "5551234567",
  "customerCompany": "Yılmaz Ltd.",
  "customerTaxNumber": "1234567890",
  "invoiceDate": "2025-10-28",
  "dueDate": "2025-11-28",
  "type": "rental",
  "items": [
    { "description": "Kamera Kiralama", "quantity": 2, "unitPrice": 500, "days": 3 }
  ],
  "totalAmount": 3000,
  "vatAmount": 600,
  "grandTotal": 3600,
  "notes": "Test fatura"
}
```
- Expected Response: 201, success: true, data: invoice
- Kontrol: Response'da updatedAt alanı olmalı.

## 2. Otomatik Fatura Ekleme (Seed veya Script)
- Script: backend/scripts/seed-invoices-v2.ts
- Komut: `npm run seed:invoices`
- Kontrol: Tüm invoice kayıtlarında updatedAt alanı dolu olmalı.

## 3. Eksik Alanlarla Fatura Ekleme
- Eksik customerName veya invoiceDate ile POST isteği gönder.
- Expected Response: 400, success: false, message: "Müşteri adı, fatura tarihi ve vade tarihi gerekli"

## 4. Fatura Listesi ve Detay Doğrulama
- Endpoint: GET /api/invoices
- Endpoint: GET /api/invoices/:id
- Kontrol: Oluşturulan fatura listede ve detayda doğru şekilde görünmeli.

## 5. Schema Uyumsuzluğu Testi
- Invoice.customerId → User, Order.customerId → Customer
- Kontrol: Her iki tabloya da ilgili kayıtlar ekleniyor mu?

## 6. updatedAt Alanı Testi
- Tüm yeni invoice, user ve customer kayıtlarında updatedAt alanı güncel mi?

---
Testler sonrası yeni hata oluşursa bir sonraki TODO'ya geçilecek.
