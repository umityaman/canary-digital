# Arşivlenmiş Sayfalar

Bu klasör, gelecekte kullanılabilecek ancak şu anda aktif olmayan sayfa ve component'leri içerir.

## Arşivlenmiş Dosyalar

### Reports.tsx.archived
**Arşivlenme Tarihi:** 14 Ekim 2025  
**Sebep:** Raporlar sayfası şu anda kullanılmıyor, ancak gelecekte Analytics/BI dashboard için kullanılabilir.  
**Özellikler:**
- Rapor kartları (Gelir/Gider, Ekipman Kullanımı, Müşteri Analizi)
- Tarih filtresi
- Neutral tasarım
- Layout wrapper kaldırılmış durumda

**Geri Yükleme:**
```bash
# Dosya adını değiştir
Move-Item archive/Reports.tsx.archived pages/Reports.tsx

# App.tsx'e import ekle
import Reports from './pages/Reports'

# Route ekle
<Route path='/reports' element={<Reports/>} />

# Sidebar'a link ekle (gerekirse)
```

**Not:** Gelecekte Advanced Analytics sayfası yapılırken bu sayfa temel alınabilir.
