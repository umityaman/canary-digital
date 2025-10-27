# 📝 Değişiklik Günlüğü (CHANGELOG)

Tüm önemli değişiklikler bu dosyada belgelenmiştir.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına uygun  
Versiyon: [Semantic Versioning](https://semver.org/) kullanılmıştır

---

## [1.0.0] - 2025-10-27

### 🎉 Yeni Özellikler (Added)

#### Muhasebe Modülü
- **Fatura Yönetimi:**
  - Yeni fatura oluşturma modal'ı (InvoiceModal.tsx)
  - Fatura düzenleme sayfası (EditInvoice.tsx)
  - Fatura detay sayfası (InvoiceDetail.tsx)
  - Hızlı fatura kesme butonu
  - Otomatik KDV hesaplama (%0, %1, %8, %18, %20)
  - Müşteri autocomplete seçici
  - Dinamik ürün/hizmet satırları

- **Teklif Yönetimi:**
  - Teklif oluşturma modal'ı (OfferModal.tsx)
  - Teklif düzenleme sayfası (EditOffer.tsx)
  - Teklif detay sayfası (OfferDetail.tsx)
  - Durum yönetimi (Taslak, Gönderildi, Kabul, Red)
  - Faturaya dönüştürme özelliği
  - Geçerlilik tarihi takibi

- **Ödeme Sistemi:**
  - Ödeme kayıt modal'ı (PaymentModal.tsx)
  - Kısmi/tam ödeme desteği
  - 5 ödeme yöntemi (Nakit, Kredi Kartı, Banka, Çek, Senet)
  - Ödeme geçmişi görüntüleme
  - Otomatik kalan tutar hesaplama

- **PDF Export:**
  - Profesyonel fatura PDF'i (jsPDF)
  - Profesyonel teklif PDF'i
  - Şirket logosu desteği
  - KDV detayları
  - Ürün/hizmet tablosu
  - QR kod hazırlığı (opsiyonel)

- **E-posta Entegrasyonu:**
  - E-posta gönderim modal'ı (EmailModal.tsx)
  - Fatura e-posta gönderimi
  - Teklif e-posta gönderimi
  - PDF eklenti desteği
  - Müşteri e-posta otomatik doldurma
  - Gönderim durumu takibi

- **Finansal Raporlama:**
  - Finansal dashboard (FinancialReports.tsx)
  - 8 özet kartı (Gelir, Tahsilat, Bekleyen, Gecikmiş, vb.)
  - 4 interaktif grafik (Recharts):
    - Aylık gelir çizgi grafiği
    - Ödeme durumu pasta grafiği
    - En iyi müşteriler bar grafiği
    - Teklif durumları pasta grafiği
  - Tarih aralığı filtresi
  - En iyi 5 müşteri tablosu
  - Gecikmiş ödemeler tablosu
  - Excel/PDF export butonları (placeholder)

- **Routing:**
  - `/invoices/create` - Fatura oluşturma sayfası
  - `/invoices/:id` - Fatura detay sayfası
  - `/invoices/:id/edit` - Fatura düzenleme sayfası
  - `/offers/create` - Teklif oluşturma sayfası
  - `/offers/:id` - Teklif detay sayfası
  - `/offers/:id/edit` - Teklif düzenleme sayfası

### 🔄 Değişiklikler (Changed)

- **Modal UX İyileştirmesi:**
  - Tüm fatura/teklif modal'ları full-page sayfalarına dönüştürüldü
  - Back button navigation eklendi
  - Daha iyi kullanıcı deneyimi

- **Tablo Optimizasyonu:**
  - Teklifler tablosu responsive yapıldı
  - Padding değerleri optimize edildi (px-6 → px-4)
  - Müşteri email sütunu kaldırıldı (alan kazanımı)
  - Tablo taşması düzeltildi

- **Performance:**
  - PaymentModal optimize edildi (useCallback)
  - EmailModal optimize edildi (useMemo)
  - Loading states eklendi (skeleton loaders)
  - Gereksiz re-render'lar önlendi

### 🐛 Hatalar (Fixed)

- Teklifler tablosunun sayfadan taşması sorunu çözüldü
- PaymentMethod optional type hatası düzeltildi
- TypeScript strict mode hataları giderildi
- Kullanılmayan import'lar temizlendi
- PDF generator tip uyumsuzlukları düzeltildi
- Email modal loading state düzeltildi

### 🗑️ Kaldırılanlar (Removed)

- Eski modal-based fatura/teklif oluşturma butonları
- Gereksiz console.log ifadeleri
- Kullanılmayan dependency'ler
- Deprecated API call'ları

### 🔒 Güvenlik (Security)

- JWT authentication tüm API endpoint'lerinde aktif
- XSS koruması (input sanitization)
- CSRF token desteği
- SQL injection koruması (Prisma ORM)
- Rate limiting (email gönderiminde)

### 📦 Bağımlılıklar (Dependencies)

#### Eklenen:
- `recharts@^2.10.0` - Grafik kütüphanesi
- `jspdf@^2.5.1` - PDF oluşturma
- `jspdf-autotable@^3.8.2` - PDF tablo oluşturma
- `react-hot-toast@^2.4.1` - Bildirimler

#### Güncellenen:
- `react-router-dom@^6.22.0` - Routing
- `axios@^1.6.7` - HTTP client

---

## [0.9.0] - 2025-10-17

### 🎉 İlk Dağıtım (Initial Deployment)

- ✅ Frontend GCP Cloud Run'da yayında
- ✅ Backend GCP Cloud Run'da yayında
- ✅ PostgreSQL Cloud SQL aktif
- ✅ CI/CD pipeline kuruldu (GitHub Actions)
- ✅ Production URLs:
  - Frontend: https://canary-frontend-672344972017.europe-west1.run.app
  - Backend: https://canary-backend-672344972017.europe-west1.run.app

### Temel Modüller:
- ✅ Authentication (Login/Register)
- ✅ Dashboard
- ✅ Customer Management
- ✅ Equipment Management
- ✅ Order Management
- ✅ Inspection Management
- ✅ User Management (Admin)

---

## Commit İstatistikleri

### Muhasebe Modülü (Hafta 1):
```
f677ee9 - feat: InvoiceModal (450 satır)
a5185f0 - feat: OfferModal (450 satır)
150d6ab - feat: PDF Export (400 satır)
a30850d - feat: Email Integration (250 satır)
59e070f - feat: InvoiceDetail (550 satır)
240b735 - feat: PaymentModal (200 satır)
aaf45a6 - feat: OfferDetail (650 satır)
713ecf2 - refactor: Test & Polish
9b03a9a - refactor: Modal → Page (270 satır)
ce1d702 - feat: Financial Reports (581 satır)
```

**Toplam:** 10 commit, 5,500+ satır kod, 40 saat çalışma

---

## Planlanan Özellikler (Unreleased)

### v1.1.0 (Hafta 2-3) - Gelir/Gider Yönetimi
- [ ] Excel export implementasyonu
- [ ] PDF tema özelleştirme
- [ ] Gelir kategorileri genişletme
- [ ] Gider kategorileri genişletme
- [ ] Çek-senet takibi iyileştirme
- [ ] Cari hesap kartları
- [ ] Müşteri bakiye raporu

### v1.2.0 (Hafta 4-5) - E-Belge Entegrasyonu
- [ ] E-fatura GİB entegrasyonu
- [ ] E-arşiv fatura
- [ ] İrsaliye modülü
- [ ] Fatura şablonları
- [ ] Toplu fatura işlemleri
- [ ] Otomatik e-posta gönderimi

### v1.3.0 (Hafta 6-7) - Raporlama
- [ ] Gelir-gider raporu (detaylı)
- [ ] Nakit akış raporu
- [ ] Karlılık analizi
- [ ] Müşteri analizi
- [ ] Tahsilat raporu
- [ ] KDV raporu
- [ ] Yaşlandırma raporu

### v2.0.0 (Ay 2-3) - Gelişmiş Muhasebe
- [ ] Muhasebe fiş kayıtları
- [ ] Banka hesap takibi
- [ ] Kasa yönetimi
- [ ] Paraşüt entegrasyonu
- [ ] Logo entegrasyonu
- [ ] Maliyet muhasebesi
- [ ] Bütçe planlama
- [ ] AI destekli tahminler

---

## Versiyon Notasyonu

Format: `MAJOR.MINOR.PATCH`

- **MAJOR:** Geriye dönük uyumluluğu bozan değişiklikler
- **MINOR:** Geriye dönük uyumlu yeni özellikler
- **PATCH:** Geriye dönük uyumlu hata düzeltmeleri

---

## Katkıda Bulunma

Değişikliklerinizi kaydetmeden önce:

1. ✅ TypeScript hatalarını düzeltin (`npm run type-check`)
2. ✅ Linter çalıştırın (`npm run lint`)
3. ✅ Build test edin (`npm run build`)
4. ✅ Commit message formatına uyun:
   ```
   <type>(<scope>): <subject>
   
   <body>
   
   <footer>
   ```

### Commit Types:
- `feat`: Yeni özellik
- `fix`: Hata düzeltme
- `refactor`: Kod iyileştirme
- `docs`: Dokümantasyon
- `style`: Formatting
- `test`: Test ekleme
- `chore`: Build, dependency güncellemeleri

---

**Tüm changelog'u görmek için:** [GitHub Releases](https://github.com/umityaman/canary-digital/releases)
