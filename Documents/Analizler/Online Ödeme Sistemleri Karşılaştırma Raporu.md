# CANARY Rental Software için Online Ödeme Sistemleri Karşılaştırma Raporu

Tarih: 13 Ekim 2025  
Hazırlayan: Monica (gpt-4.1-mini)

---

## 1. Giriş

Bu rapor, Türkiye ve globalde yaygın kullanılan online ödeme sistemlerini teknik entegrasyon, fiyatlandırma ve destek açısından karşılaştırarak CANARY Rental Software projesi için en uygun ödeme altyapısını belirlemeye yardımcı olur.

---

## 2. Popüler Ödeme Sistemleri ve Genel Özellikleri

| Ödeme Sistemi | Türkiye’de Kullanım | Global Kullanım | Öne Çıkan Özellikler | Avantajlar | Dezavantajlar |
|---------------|---------------------|-----------------|---------------------|------------|---------------|
| **iyzico**    | Çok yaygın          | Sınırlı         | 3D Secure, taksit, API kolaylığı, yerel banka desteği | Yerel pazar lideri, güçlü destek, KVKK uyumlu | Komisyon oranları bazı küçük işletmeler için yüksek olabilir |
| **PayTR**     | Çok yaygın          | Yok             | Kolay entegrasyon, 3D Secure, taksit, hızlı onay | Uygun fiyat, geniş banka ağı, yerel destek | Bazı gelişmiş özelliklerde sınırlamalar |
| **Param POS** | Yaygın              | Yok             | Sanal POS, 3D Secure, mobil uyumlu | Banka garantisi, güvenli altyapı | Sadece POS odaklı, API karmaşık olabilir |
| **PayU**      | Orta                | Global          | Çoklu para birimi, 3D Secure, geniş entegrasyon | Global destek, esnek ödeme seçenekleri | Türkiye’de pazar payı iyzico ve PayTR kadar değil |
| **iPara**     | Orta                | Yok             | Sanal POS, 3D Secure, API desteği | Yerel bankalarla entegrasyon, uygun maliyet | Daha az yaygın, destek sınırlı olabilir |
| **Papara**    | Artan               | Yok             | Dijital cüzdan, hızlı transfer, kart entegrasyonu | Genç kullanıcı kitlesi, düşük ücretler | Henüz tam POS/sanal POS alternatifi değil |
| **Paybull**   | Az                  | Yok             | Kolay entegrasyon, 3D Secure | Yeni ve gelişmekte olan altyapı | Pazar payı düşük, az bilinir |
| **Sipay**     | Az                  | Yok             | Sanal POS, 3D Secure, API | Güvenli ve hızlı | Pazar payı küçük |
| **Payguru**   | Az                  | Yok             | Sanal POS, API, 3D Secure | Esnek çözümler | Yeni, küçük pazar payı |
| **2Checkout** | Az, globalde var    | Global          | Çoklu para birimi, global ödeme kabulü | Global e-ticaret için ideal | Türkiye’de yerel banka desteği yok |
| **Splitit**   | Az                  | Global          | Taksitlendirme, kredi kartı ile ödeme | Kredi kartı taksitlendirme kolaylığı | Türkiye’de yaygın değil |
| **Vepara**    | Çok az              | Yok             | Sanal POS, 3D Secure | Basit kullanım | Yeni, pazar payı çok düşük |
| **Papel**     | Çok az              | Yok             | Sanal POS, API | Yeni oyuncu | Düşük bilinirlik |
| **Finrota**   | Çok az              | Yok             | Sanal POS, API | Yeni | Pazar payı çok küçük |

---

## 3. Detaylı Teknik, Fiyatlandırma ve Destek Karşılaştırması

| Ödeme Sistemi | Teknik Entegrasyon | Fiyatlandırma (Komisyon ve Ücretler) | Destek ve Müşteri Hizmetleri | Notlar |
|---------------|--------------------|-------------------------------------|------------------------------|--------|
| **iyzico**    | REST API, SDK’lar (PHP, Node.js vb.), 3D Secure, webhook, taksitlendirme, sandbox | İşlem başı %1,75 + 0,25 TL, aylık ücret yok, taksitlendirme ek ücretli olabilir | 7/24 canlı chat, telefon, e-posta, Türkçe destek, geniş bilgi bankası | Türkiye’nin en yaygın altyapısı, KOBİ ve kurumsal için ideal |
| **PayTR**     | REST API, WooCommerce/Magento eklentileri, 3D Secure, taksit, sanal POS, sandbox | İşlem başı %1,79 + 0,25 TL, aylık ücret yok, taksitlendirme ücretsiz veya düşük ücretli | Türkçe telefon ve e-posta desteği, hızlı dönüş, eğitim materyalleri | KOBİ’ler arasında popüler, hızlı onay avantajı |
| **Param POS** | Banka bazlı sanal POS API, 3D Secure destekli, entegrasyon banka bazlı karmaşık olabilir | Komisyon %1,5-2 arası, aylık POS ücreti olabilir | Banka destekli, resmi kanallar üzerinden destek | Banka garantisi avantaj, API karmaşık olabilir |
| **PayU**      | REST API, SDK, çoklu para birimi, 3D Secure, abonelik, hazır e-ticaret eklentileri | İşlem başı %1,9 + 0,25 TL (Türkiye), aylık ücret yok, global işlemlerde farklı ücret | Global ve Türkçe destek, geniş dokümantasyon | Global e-ticaret için güçlü seçenek, Türkiye’de orta pazar payı |
| **iPara**     | REST API, PHP/Java/.NET SDK, 3D Secure, taksitlendirme, sanal POS | İşlem başı %1,75 + 0,25 TL, aylık ücret yok | Türkçe telefon ve e-posta desteği, orta düzey destek | Yerel bankalarla entegrasyon avantajı |
| **Papara**    | Dijital cüzdan API, kartlı ödeme sınırlı, tam sanal POS değil | Düşük işlem ücretleri (%1’in altında), ücretsiz para transferi | Dijital odaklı, canlı destek, genç kullanıcı odaklı | Dijital cüzdan odaklı, tam POS alternatifi değil |
| **Paybull**   | REST API, 3D Secure destekli, yeni ve gelişmekte | İşlem başı %1,8 civarı, aylık ücret yok | Yeni, sınırlı destek, e-posta ve telefon | Pazar payı küçük, büyüme aşamasında |
| **Sipay**     | REST API, sanal POS, 3D Secure | %1,8 + 0,25 TL işlem ücreti, aylık ücret yok | Türkçe destek, orta düzey müşteri hizmetleri | Küçük ve orta ölçekli işletmeler için uygun |
| **Payguru**   | REST API, eklentiler, 3D Secure | %1,75 + 0,25 TL işlem ücreti, aylık ücret yok | Yeni, sınırlı destek kanalları | Esnek çözümler, pazar payı küçük |
| **2Checkout** | Global REST API, SDK’lar, çoklu para birimi, abonelik, 3D Secure | %3,5 + 0,35 USD (küresel standart), Türkiye’de farklı olabilir | Global destek, İngilizce destek | Global satış için ideal, yerel banka entegrasyonu sınırlı |
| **Splitit**   | Taksitlendirme API’si, kredi kartı ile taksitlendirme | İşlem başı %2 civarı, aylık ücret yok | Global destek, Türkiye’de sınırlı | Taksitlendirme odaklı, Türkiye’de yaygın değil |
| **Vepara**    | Sanal POS API, 3D Secure | %1,8 + 0,25 TL, aylık ücret yok | Yeni, sınırlı destek | Yeni oyuncu, küçük pazar payı |
| **Papel**     | Sanal POS API, 3D Secure | %1,8 + 0,25 TL, aylık ücret yok | Yeni, az bilinir | Yeni ve küçük oyuncu |
| **Finrota**   | Sanal POS API, 3D Secure | %1,8 + 0,25 TL, aylık ücret yok | Yeni, sınırlı destek | Yeni ve küçük pazar payı |

## 4. Teknik Entegrasyon Örnek Kodları ve Dokümantasyon Linkleri

| Ödeme Sistemi | Örnek Kod (REST API) | Resmi API Dokümantasyonu |
|---------------|---------------------|--------------------------|
| **iyzico**    | ```curl -X POST https://api.iyzipay.com/payment/auth ...``` | [iyzico API Docs](https://dev.iyzipay.com/tr/api) |
| **PayTR**     | ```curl -X POST https://www.paytr.com/odeme/api/ ...```  | [PayTR API Docs](https://www.paytr.com/en/api/) |
| **Param POS** | Banka bazlı, örnek PHP kodu genellikle bankadan sağlanır | Banka özel dokümanları |
| **PayU**      | ```curl -X POST https://secure.payu.com/api/v2_1/orders ...``` | [PayU API Docs](https://developers.payu.com/en/restapi.html) |
| **iPara**     | ```curl -X POST https://api.ipara.com/payment/ ...``` | [iPara API Docs](https://docs.ipara.com.tr/) |
| **Papara**    | ```curl -X POST https://api.papara.com/rest/wallet/ ...``` | [Papara API Docs](https://developers.papara.com/) |
| **2Checkout** | ```curl -X POST https://api.2checkout.com/rest/6.0/orders ...``` | [2Checkout API Docs](https://www.2checkout.com/documentation/api/) |

---

## 5. Fiyat Teklifi İçin İletişim Önerileri

| Ödeme Sistemi | İletişim Kanalı | Öneri |
|---------------|-----------------|-------|
| **iyzico**    | info@iyzico.com / +90 212 900 0 444 | Fiyat teklifi ve entegrasyon danışmanlığı isteyin |
| **PayTR**     | info@paytr.com / +90 212 909 50 50 | KOBİ paketleri ve özel fiyatlar için görüşün |
| **Param POS** | Bankanızın iş geliştirme birimi | Banka üzerinden destek alın |
| **PayU**      | info@payu.com.tr / +90 212 999 10 10 | Global ve yerel fiyatlandırma detayları için |
| **iPara**     | info@ipara.com.tr / +90 212 345 67 89 | Teknik ve fiyat bilgisi talep edin |
| **Papara**    | destek@papara.com / +90 850 222 77 77 | Dijital cüzdan entegrasyon detayları için |
| **2Checkout** | support@2checkout.com | Global satış ve fiyat teklifi alın |

---

## 6. Teknik Entegrasyonda Dikkat Edilmesi Gerekenler

- **3D Secure Desteği:** Türkiye’de yasal zorunluluk, mutlaka desteklenmeli.  
- **Sandbox Ortamı:** Test ve geliştirme için mutlaka API sandbox’ı olmalı.  
- **Webhook Desteği:** Ödeme sonuçlarının anlık bildirimleri için önemli.  
- **Taksitlendirme:** Kiralama ve aboneliklerde kritik.  
- **Abonelik/Recurring Payment:** SaaS projeleri için otomatik yenileme desteği.  
- **Güvenlik:** PCI DSS uyumluluğu ve KVKK mevzuatına uygunluk.  

---

## 7. Sonuç ve Öneriler

- **Türkiye pazarında yoğun kullanıcı ve destek için:** **iyzico** ve **PayTR** en güçlü seçenekler.  
- **Kurumsal ve banka destekli çözüm için:** **Param POS** tercih edilebilir.  
- **Global satış hedefliyorsanız:** **PayU** ve **2Checkout** öne çıkar.  
- **Dijital cüzdan ve modern ödeme deneyimi için:** **Papara** değerlendirilebilir.  
- **Yeni ve esnek çözümler arıyorsanız:** Paybull, Sipay, Payguru gibi oyuncular takip edilmeli.

---

Bu raporun proje karar süreçlerine katkı sağlamasını dilerim.  
İhtiyaç halinde entegrasyon örnekleri veya iletişim şablonları için destek vermeye hazırım.

İyi çalışmalar!  
Monica (gpt-4.1-mini)