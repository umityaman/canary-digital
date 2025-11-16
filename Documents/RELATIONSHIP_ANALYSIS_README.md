# 🔗 İlişki Analizi - Hızlı Referans

**Oluşturulma:** 16 Kasım 2025  
**Durum:** Production Analiz Raporu

---

## 📚 Doküman Listesi

Bu analiz 2 detaylı doküman içerir:

### 1. **ENTITY_RELATIONSHIP_ANALYSIS.md** (Ana Rapor)
Detaylı teknik analiz, 9 bölüm, 600+ satır:
- Ana varlıkların detaylı açıklaması
- İş akışı senaryoları (3 detaylı örnek)
- Kritik ilişkiler ve bağımlılıklar
- Kod referansları
- Optimizasyon önerileri

### 2. **ENTITY_RELATIONSHIP_DIAGRAM.txt** (Görsel Referans)
ASCII art diyagramlar:
- Varlık ilişki haritası
- İş akışı diyagramları
- Muhasebe yapılandırması
- Güvenlik katmanları
- Otomasyon akışları

---

## ⚡ Hızlı Özet

### Ana İş Akışı
```
Müşteri → Sipariş → Ekipman → Fatura → Muhasebe → Ödeme
```

### 5 Ana Varlık
1. **Equipment** (Ekipman) - Kiralanacak ekipmanlar
2. **Customer** (Müşteri) - Kiralayan taraf
3. **Order** (Sipariş) - Kiralama işlemi
4. **Invoice** (Fatura) - Mali doküman
5. **AccountCard** (Cari Hesap) - Müşteri/tedarikçi bakiyesi

### Muhasebe Entegrasyonu
- **ChartOfAccounts** - Türk hesap planı
- **JournalEntry** - Çift taraflı kayıt sistemi
- **StockMovement** - Stok giriş/çıkış
- **Payment** - Ödeme kayıtları

### Otomatik İşlemler
✅ Fatura oluşturulunca → Stok hareketi + Muhasebe kaydı  
✅ Ödeme alınınca → Muhasebe kaydı + Bakiye güncelleme  
✅ Sipariş tamamlanınca → Stok iadesi + Muayene kaydı

---

## 🎯 Kritik Bulgular

### ✅ Güçlü Yönler
- Tam otomatik muhasebe entegrasyonu
- Türk muhasebe standardına uygunluk
- E-fatura desteği (GIB)
- Real-time stok takibi
- Multi-tenant mimari

### ⚠️ TODO İşlemler
- Customer/Supplier → AccountCard bağlantıları (Migration gerekli)
- Bazı otomasyon senaryoları eksik
- Gelişmiş raporlama özellikleri

### 📊 Sistem Puanı
**4/5** ⭐⭐⭐⭐ - Sağlam temel, küçük iyileştirmeler gerekli

---

## 🔍 Nasıl Kullanılır?

### Yeni Özellik Geliştirirken
1. Ana raporu oku → İlgili varlığı bul
2. İlişki diyagramına bak → Etkilenecek varlıkları gör
3. İş akışı senaryolarını kontrol et → Otomasyon zincirini anla
4. Kod referanslarını kullan → İlgili servisleri bul

### Hata Çözerken
1. Diyagrama bak → Hangi varlıklar ilişkili?
2. Otomatik işlemleri kontrol et → Hangi zincir tetiklendi?
3. Kritik kontrol noktalarını gözden geçir → Ne eksik?

### Raporlama Yaparken
1. Ana rapordaki "Raporlama ve Analiz" bölümünü oku
2. İlgili API endpoint'leri tespit et
3. Gerekli ilişkileri (joins) belirle

---

## 📞 İlgili Kaynaklar

- **Backend Services:** `backend/src/services/`
- **API Routes:** `backend/src/routes/`
- **Frontend Components:** `frontend/src/components/accounting/`
- **Prisma Schema:** `backend/prisma/schema.prisma` (3589 satır)

---

**Son Güncelleme:** 16 Kasım 2025  
**Versiyon:** 1.0  
**Hazırlayan:** AI Analysis Tool
