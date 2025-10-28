
# YARIN TODO LİSTESİ (28 Ekim 2025)

1. Invoice endpoint testleri (farklı senaryolar, hata yönetimi)
2. Yeni hata çıkarsa hızlıca düzelt ve tekrar deploy et
3. Analytics endpoint 500 hatasını incele, logları kontrol et
4. Notification endpoint'i mockla veya geçici olarak devre dışı bırak
5. AccountCard otomasyonu için gereksinimleri ve tetikleyicileri planla
6. E-fatura / E-arşiv entegrasyon yol haritasını gözden geçir
## YARIN YAPILACAKLAR (29 Ekim 2025)

1. Invoice endpoint testleri (production ve local)
	- Manuel ve otomatik fatura ekleme senaryoları test edilecek.
	- Schema uyumsuzluğu ve updatedAt alanı kontrolü yapılacak.

2. Yeni hata varsa düzeltme
	- Testler sonrası oluşan yeni buglar hızlıca analiz edilip düzeltilecek.

3. Analytics endpoint 500 hatası incelemesi
	- Backend analytics endpointlerinde hata logları ve veri akışı incelenecek.
	- Gerekirse schema ve kod düzeltmeleri yapılacak.

4. Notification endpoint mock veya disable
	- Frontend notification API fonksiyonları mocklandı, productionda test edilecek.
	- Gerekirse backendde disable veya hata yönetimi eklenecek.

5. AccountCard otomasyon planı
	- Muhasebe sayfası için AccountCard bileşeninde otomasyon ve test planı hazırlanacak.

---
Ek Notlar:
- Tüm testler ve düzeltmeler sonrası deploy ve production testleri yapılacak.
- Kritik hatalar için hızlı geri bildirim ve log analizi önceliklendirilecek.
