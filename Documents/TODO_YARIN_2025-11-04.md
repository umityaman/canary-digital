# 📋 TODO - 4 Kasım 2025 (Pazartesi)

**Sprint:** Muhasebe Modülü Tamamlama - Son Rötuşlar  
**Hedef:** Eksik özellikleri tamamla, production test yap

---

## 🔴 KRİTİK ÖNCELİK (SABAH - 4-6 Saat)

### 1. Kasa Backend API Oluştur
**Süre:** 4-6 saat  
**Öncelik:** 🔴 Kritik  
**Etkilenen:** `CashBankManagement.tsx` (şu anda mock data kullanıyor)

**Gerekli Endpoint'ler:**
```typescript
POST   /api/cash-transactions          // Kasa giriş/çıkış kaydet
GET    /api/cash-transactions          // Kasa işlemleri listesi (pagination)
GET    /api/cash-transactions/:id      // Tekil işlem detayı
PUT    /api/cash-transactions/:id      // İşlem güncelle
DELETE /api/cash-transactions/:id      // İşlem sil
GET    /api/cash/balance                // Güncel kasa bakiyesi
GET    /api/cash/summary                // Özet istatistikler (bugün giren, çıkan)
GET    /api/cash/daily-report           // Günlük rapor
```

**Database Schema (Prisma):**
```prisma
model CashTransaction {
  id          Int      @id @default(autoincrement())
  companyId   Int
  company     Company  @relation(fields: [companyId], references: [id])
  
  type        String   // 'in' veya 'out'
  amount      Decimal  @db.Decimal(10, 2)
  description String?
  category    String?
  date        DateTime @default(now())
  
  reference   String?  // Referans no (isteğe bağlı)
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([companyId, date])
  @@index([type])
  @@map("cash_transactions")
}
```

**Backend Route (backend/src/routes/cash.ts):**
```typescript
import express from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Kasa işlemleri listesi
router.get('/transactions', authenticate, async (req, res) => {
  const companyId = req.user.companyId;
  const { page = 1, limit = 20, type, startDate, endDate } = req.query;

  const where = {
    companyId,
    ...(type && { type }),
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  };

  const [transactions, total] = await Promise.all([
    prisma.cashTransaction.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.cashTransaction.count({ where })
  ]);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Yeni kasa işlemi
router.post('/transactions', authenticate, async (req, res) => {
  const { type, amount, description, category, date } = req.body;
  
  const transaction = await prisma.cashTransaction.create({
    data: {
      type,
      amount,
      description,
      category,
      date: date ? new Date(date) : new Date(),
      companyId: req.user.companyId,
      userId: req.user.id
    }
  });

  res.status(201).json({ success: true, data: transaction });
});

// Kasa bakiyesi
router.get('/balance', authenticate, async (req, res) => {
  const companyId = req.user.companyId;

  const [inTotal, outTotal] = await Promise.all([
    prisma.cashTransaction.aggregate({
      where: { companyId, type: 'in' },
      _sum: { amount: true }
    }),
    prisma.cashTransaction.aggregate({
      where: { companyId, type: 'out' },
      _sum: { amount: true }
    })
  ]);

  const balance = (inTotal._sum.amount || 0) - (outTotal._sum.amount || 0);

  res.json({ success: true, data: { balance, inTotal: inTotal._sum.amount || 0, outTotal: outTotal._sum.amount || 0 } });
});

// Günlük özet
router.get('/summary', authenticate, async (req, res) => {
  const companyId = req.user.companyId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayIn, todayOut] = await Promise.all([
    prisma.cashTransaction.aggregate({
      where: { companyId, type: 'in', date: { gte: today } },
      _sum: { amount: true }
    }),
    prisma.cashTransaction.aggregate({
      where: { companyId, type: 'out', date: { gte: today } },
      _sum: { amount: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      todayIn: todayIn._sum.amount || 0,
      todayOut: todayOut._sum.amount || 0
    }
  });
});

export default router;
```

**App.ts'ye Ekle:**
```typescript
import cashRouter from './routes/cash';
app.use('/api/cash', cashRouter);
```

**Frontend Entegrasyonu (CashBankManagement.tsx):**
```typescript
// Mock data yerine gerçek API çağrıları:
useEffect(() => {
  const loadCashData = async () => {
    try {
      const [balanceRes, summaryRes, transactionsRes] = await Promise.all([
        apiClient.get('/api/cash/balance'),
        apiClient.get('/api/cash/summary'),
        apiClient.get('/api/cash/transactions?limit=10')
      ]);

      setCashBalance(balanceRes.data.data.balance);
      setCashInToday(summaryRes.data.data.todayIn);
      setCashOutToday(summaryRes.data.data.todayOut);
      setRecentTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error('Failed to load cash data:', error);
      toast.error('Kasa verileri yüklenemedi');
    }
  };

  loadCashData();
}, []);
```

**Kontrol Listesi:**
- [ ] Prisma schema'ya `CashTransaction` model ekle
- [ ] `npx prisma migrate dev --name add_cash_transactions` çalıştır
- [ ] `backend/src/routes/cash.ts` oluştur (yukarıdaki kod)
- [ ] `backend/src/app.ts`'ye route ekle
- [ ] Postman/Thunder Client ile API test et
- [ ] `CashBankManagement.tsx`'i güncelle (mock data kaldır)
- [ ] Frontend test et
- [ ] Build, commit, push

---

## 🟡 YÜKSEK ÖNCELİK (ÖĞLEN - 1-2 Saat)

### 2. CheckFormModal'ı Aktif Et
**Süre:** 30 dakika  
**Öncelik:** 🟡 Yüksek

**Problem:** Modal component var ama kullanılmıyor (yorum satırında)

**Çözüm:**
```typescript
// frontend/src/pages/Accounting.tsx

// 1. Import'u aktif et (satır 10):
import CheckFormModal from '../components/accounting/CheckFormModal'

// 2. Modal'ı render et (en altta, return dışında - satır ~1250):
{checkModalOpen && (
  <CheckFormModal
    open={checkModalOpen}
    onClose={() => setCheckModalOpen(false)}
    onSaved={() => loadChecks()}
    initial={editingCheck || undefined}
  />
)}
```

**Kontrol Listesi:**
- [ ] `CheckFormModal` import'unu aktif et
- [ ] Modal render kodunu ekle
- [ ] "Yeni Çek" butonunu test et
- [ ] Modal açılıyor mu kontrol et
- [ ] Form submit test et
- [ ] Çek listesi yenileniyor mu kontrol et

---

### 3. Yaşlandırma Raporu Tablo Formatı
**Süre:** 3-4 saat  
**Öncelik:** 🟡 Yüksek

**Problem:** Şu anda JSON görünümünde, kullanıcı dostu değil

**Çözüm: AgingReportTable Component**

```typescript
// frontend/src/components/accounting/AgingReportTable.tsx
import { useState, useEffect } from 'react';
import { Download, Printer } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { toast } from 'react-hot-toast';

interface AgingData {
  customerId: number;
  customerName: string;
  totalDebt: number;
  current: number;        // 0-30 gün
  days30_60: number;      // 31-60 gün
  days61_90: number;      // 61-90 gün
  over90: number;         // 90+ gün
}

export default function AgingReportTable() {
  const [data, setData] = useState<AgingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/aging/combined');
      setData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load aging data:', error);
      toast.error('Yaşlandırma verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totals = data.reduce((acc, row) => ({
    totalDebt: acc.totalDebt + row.totalDebt,
    current: acc.current + row.current,
    days30_60: acc.days30_60 + row.days30_60,
    days61_90: acc.days61_90 + row.days61_90,
    over90: acc.over90 + row.over90
  }), { totalDebt: 0, current: 0, days30_60: 0, days61_90: 0, over90: 0 });

  const handleExport = () => {
    // Excel export (sonra eklenebilir)
    toast.info('Excel export yakında eklenecek');
  };

  if (loading) {
    return <div className="p-12 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Alacak Yaşlandırma Raporu</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Müşteri bazlı vade analizi ({data.length} müşteri)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={18} />
            Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-neutral-700 text-white rounded-xl hover:bg-neutral-800 flex items-center gap-2"
          >
            <Printer size={18} />
            Yazdır
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                  Toplam Borç
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                  0-30 Gün
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                  31-60 Gün
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                  61-90 Gün
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">
                  90+ Gün
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {data.map((row) => (
                <tr key={row.customerId} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {row.customerName}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">
                    {formatCurrency(row.totalDebt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600">
                    {formatCurrency(row.current)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-yellow-600">
                    {formatCurrency(row.days30_60)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-orange-600">
                    {formatCurrency(row.days61_90)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-red-600 font-medium">
                    {formatCurrency(row.over90)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-100 border-t-2 border-neutral-300">
              <tr>
                <td className="px-6 py-4 text-sm font-bold text-neutral-900">
                  TOPLAM
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-neutral-900">
                  {formatCurrency(totals.totalDebt)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                  {formatCurrency(totals.current)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-yellow-600">
                  {formatCurrency(totals.days30_60)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-orange-600">
                  {formatCurrency(totals.days61_90)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                  {formatCurrency(totals.over90)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="text-xs text-green-700 font-medium">0-30 GÜN</div>
          <div className="text-lg font-bold text-green-900 mt-1">
            {formatCurrency(totals.current)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {((totals.current / totals.totalDebt) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="text-xs text-yellow-700 font-medium">31-60 GÜN</div>
          <div className="text-lg font-bold text-yellow-900 mt-1">
            {formatCurrency(totals.days30_60)}
          </div>
          <div className="text-xs text-yellow-600 mt-1">
            {((totals.days30_60 / totals.totalDebt) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="text-xs text-orange-700 font-medium">61-90 GÜN</div>
          <div className="text-lg font-bold text-orange-900 mt-1">
            {formatCurrency(totals.days61_90)}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {((totals.days61_90 / totals.totalDebt) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="text-xs text-red-700 font-medium">90+ GÜN</div>
          <div className="text-lg font-bold text-red-900 mt-1">
            {formatCurrency(totals.over90)}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {((totals.over90 / totals.totalDebt) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Accounting.tsx'e Entegre Et:**
```typescript
// Import ekle
import AgingReportTable from '../components/accounting/AgingReportTable'

// aging tab'ını güncelle (satır ~1100):
{activeTab === 'aging' && <AgingReportTable />}
```

**Kontrol Listesi:**
- [ ] `AgingReportTable.tsx` component oluştur
- [ ] `Accounting.tsx`'e import ve render ekle
- [ ] API'den gelen veriyi test et
- [ ] Tablo formatını kontrol et
- [ ] Özet kartları test et
- [ ] Export butonları (placeholder - sonra eklenebilir)

---

## 🟢 ORTA ÖNCELİK (ÖĞLEDEN SONRA - 2-3 Saat)

### 4. Senet Formu Component Oluştur
**Süre:** 2-3 saat  
**Öncelik:** 🟢 Orta

**Eksik:** Promissory note ekleme/düzenleme UI

**Çözüm: PromissoryNoteFormModal.tsx** (CheckFormModal'a benzer)

```typescript
// frontend/src/components/accounting/PromissoryNoteFormModal.tsx
// CheckFormModal'ın kopyasını al ve senet için özelleştir

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: any;
}

export default function PromissoryNoteFormModal({ open, onClose, onSaved, initial }: Props) {
  // Form fields:
  // - documentNumber (Senet No)
  // - customerId (Müşteri)
  // - amount (Tutar)
  // - issueDate (Düzenleme Tarihi)
  // - dueDate (Vade Tarihi)
  // - type ('receivable' | 'payable')
  // - status ('pending' | 'paid' | 'cancelled')
  // - notes (Notlar)

  // API: POST/PUT /api/promissory-notes
}
```

**Accounting.tsx'e Ekle:**
```typescript
import PromissoryNoteFormModal from '../components/accounting/PromissoryNoteFormModal'

// State ekle
const [promissoryModalOpen, setPromissoryModalOpen] = useState(false)
const [editingPromissory, setEditingPromissory] = useState<any | null>(null)

// Promissory tab'ına "Yeni Senet" butonu ekle
// Modal render et
```

**Kontrol Listesi:**
- [ ] `PromissoryNoteFormModal.tsx` oluştur
- [ ] Form validation ekle
- [ ] API entegrasyonu
- [ ] `Accounting.tsx`'e entegre et
- [ ] Test et (oluştur, düzenle, sil)

---

### 5. Nakit Akışı Backend Entegrasyonu
**Süre:** 2 saat  
**Öncelik:** 🟢 Orta

**Problem:** Cashflow tab'ı mock data kullanıyor

**Çözüm:**

**Backend Endpoint:**
```typescript
// backend/src/routes/cash.ts
router.get('/cash-flow', authenticate, async (req, res) => {
  const companyId = req.user.companyId;
  const { period = 'monthly', year = new Date().getFullYear() } = req.query;

  // Aylık gelir/gider hesapla
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const cashFlow = await Promise.all(
    months.map(async (month) => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const [income, expense] = await Promise.all([
        prisma.income.aggregate({
          where: {
            companyId,
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        prisma.expense.aggregate({
          where: {
            companyId,
            date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        })
      ]);

      return {
        month,
        monthName: new Date(year, month - 1).toLocaleString('tr-TR', { month: 'long' }),
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
        net: (income._sum.amount || 0) - (expense._sum.amount || 0)
      };
    })
  );

  res.json({ success: true, data: cashFlow });
});
```

**Frontend (CashBankManagement.tsx):**
```typescript
// Cashflow tab'ında gerçek veri çek
useEffect(() => {
  if (activeSubTab === 'cashflow') {
    loadCashFlow();
  }
}, [activeSubTab]);

const loadCashFlow = async () => {
  try {
    const res = await apiClient.get('/api/cash/cash-flow');
    setCashFlowData(res.data.data);
  } catch (error) {
    console.error('Failed to load cash flow:', error);
  }
};
```

**Kontrol Listesi:**
- [ ] Backend endpoint ekle
- [ ] Frontend entegrasyonu
- [ ] Chart'ı güncelle (gerçek veri ile)
- [ ] Test et

---

## 🔵 DÜŞÜK ÖNCELİK (BONUS - Zaman Kalırsa)

### 6. Production Test ve Bug Check
**Süre:** 1 saat

**Test Edilecekler:**
- [ ] Login/logout
- [ ] Dashboard yükleniyor mu
- [ ] Muhasebe sayfası tüm tab'ları
- [ ] Gelir/gider ekleme
- [ ] Fatura oluşturma
- [ ] Teklif oluşturma
- [ ] Cari hesap detayı
- [ ] Kategori yönetimi
- [ ] Şirket bilgileri
- [ ] Kasa & banka
- [ ] Responsive design (mobile)

---

### 7. Code Splitting (Başlangıç)
**Süre:** 1-2 saat

**Amaç:** İlk yükleme süresini azalt

```typescript
// frontend/src/pages/Accounting.tsx
import { lazy, Suspense } from 'react';

// Lazy load components
const IncomeTab = lazy(() => import('../components/accounting/IncomeTab'));
const ExpenseTab = lazy(() => import('../components/accounting/ExpenseTab'));
const CategoryTagManagement = lazy(() => import('../components/accounting/CategoryTagManagement'));
// ... diğer componentler

// Render'da Suspense ile sarmal
<Suspense fallback={<div className="p-12 text-center">Yükleniyor...</div>}>
  {activeTab === 'income' && <IncomeTab />}
  {activeTab === 'expense' && <ExpenseTab />}
  {activeTab === 'categories' && <CategoryTagManagement />}
</Suspense>
```

**Kontrol Listesi:**
- [ ] React.lazy import'ları
- [ ] Suspense wrapper
- [ ] Loading fallback tasarımı
- [ ] Bundle size analizi (öncesi/sonrası)
- [ ] Performance test

---

### 8. Documentation Güncelleme
**Süre:** 30 dakika

**Güncellenecek Dosyalar:**
- [ ] `backend/README.md` - Yeni cash API'sini dokümante et
- [ ] `MUHASEBE_SAYFA_RAPORU.md` - Eksikleri güncelle
- [ ] `API_ENDPOINTS.md` - Tüm endpoint'leri listele

---

## 📊 GÜN SONU HEDEFLERİ

### Başarı Kriterleri ✅

**Minimum (Olmazsa Olmaz):**
- [ ] Kasa backend API tamamlandı
- [ ] CheckFormModal aktif
- [ ] Yaşlandırma tablo formatı eklendi
- [ ] Frontend build başarılı
- [ ] Tüm özellikler local'de test edildi

**İdeal (Hedeflenen):**
- [ ] Senet formu tamamlandı
- [ ] Nakit akışı backend entegrasyonu
- [ ] Production'a deploy edildi
- [ ] Production'da test edildi
- [ ] Herhangi bir kritik bug yok

**Bonus (Zaman Kalırsa):**
- [ ] Code splitting uygulandı
- [ ] Documentation güncellendi
- [ ] Performance iyileştirmesi yapıldı

---

## 📈 İLERLEME TAKİBİ

### Sabah (09:00 - 12:00)
- [ ] Kasa API: %0 → %100

### Öğle (12:00 - 14:00)
- [ ] CheckFormModal: Tamamlandı
- [ ] Yaşlandırma: %0 → %50

### Öğleden Sonra (14:00 - 18:00)
- [ ] Yaşlandırma: %50 → %100
- [ ] Senet formu: %0 → %100
- [ ] Nakit akışı: %0 → %100

### Akşam (18:00 - 19:00)
- [ ] Build & Deploy
- [ ] Production test
- [ ] Gün sonu raporu

---

## ⚠️ HATIRLATMALAR

1. **HER ÖZELLIK İÇİN:**
   - Backend API → Postman test → Frontend → UI test → Commit

2. **COMMIT MESSAGES:**
   - feat: Kasa backend API ve frontend entegrasyonu
   - feat: CheckFormModal aktif edildi
   - feat: Yaşlandırma raporu tablo formatı
   - feat: Senet formu component eklendi

3. **TEST ÖNCE:**
   - Local test → Build → Deploy → Production test

4. **ZAMAN KUTUSU:**
   - Her görev için max süre belirle
   - Takılırsan devam et, sonra dön

---

**Hazırlayan:** GitHub Copilot AI  
**Tarih:** 3 Kasım 2025, Gece  
**Yarın:** 4 Kasım 2025, Pazartesi  
**Tahmini Süre:** 8-10 saat  
**Sprint Hedefi:** Muhasebe modülü %85 → %95 ✅

---

## 🚀 BAŞARILAR!

Yarın 4 büyük özelliği tamamlayıp muhasebe modülünü %95'e çıkaracağız! 💪
