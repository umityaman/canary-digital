# CANARY Rental Software için e-Belge Çözümleri Analizi ve Çözüm Sağlayıcı Başvuru Rehberi

Tarih: 13 Ekim 2025  
Hazırlayan: Monica (gpt-4.1-mini)

---

## 1. e-Belge Çözümleri Nedir?

e-Belge çözümleri; elektronik ortamda fatura, irsaliye, defter gibi belgelerin oluşturulması, iletilmesi, saklanması ve yönetilmesini sağlayan sistemlerdir.  
Türkiye’de Gelir İdaresi Başkanlığı (GİB) standartları çerçevesinde yasal olarak kabul edilen formatlarda hizmet verir.

---

## 2. Temel e-Belge Türleri

| Belge Türü       | Açıklama                                    | Zorunluluk / Kullanım Alanı           |
|------------------|---------------------------------------------|-------------------------------------|
| **e-Fatura**     | Elektronik fatura, GİB onaylı               | Zorunlu veya tercih edilen fatura tipi |
| **e-Arşiv Fatura**| e-Fatura sistemine kayıtlı olmayan müşterilere kesilen elektronik fatura | Zorunlu değil, alternatif fatura tipi |
| **e-İrsaliye**   | Elektronik sevk irsaliyesi                   | Sevkiyatlarda zorunlu                |
| **e-Defter**     | Elektronik yevmiye ve büyük defter           | Muhasebe kayıtlarında zorunlu        |
| **e-Müstahsil Makbuzu** | Tarım sektöründe kullanılan makbuz       | Tarım sektörü için zorunlu           |
| **e-SMM**        | Serbest meslek makbuzu elektronik versiyonu | Serbest meslek erbapları için        |

---

## 3. Popüler e-Belge Çözüm Sağlayıcıları ve Teknik Özellikleri

| Sağlayıcı       | Desteklenen Belgeler       | Teknik Entegrasyon Türleri          | API/Dokümantasyon Linkleri                          |
|-----------------|----------------------------|-----------------------------------|----------------------------------------------------|
| **Logo e-Fatura**| e-Fatura, e-İrsaliye, e-Defter | SOAP ve REST API, SDK’lar          | [Logo API](https://www.logo.com.tr/api-dokumanlari) |
| **Netsis**      | e-Fatura, e-Arşiv, e-Defter | REST API, SOAP, entegrasyon modülleri | [Netsis API](https://netsis.com.tr/dokumanlar)       |
| **Paraşüt**     | e-Fatura, e-Arşiv           | REST API, Bulut tabanlı            | [Paraşüt API](https://api.parasut.com.tr/)           |
| **Tebim**       | e-Fatura, e-İrsaliye, e-Arşiv| REST API, XML tabanlı entegrasyon  | [Tebim API](https://www.tebim.com.tr/api-dokuman)   |
| **Mikro Yazılım**| e-Fatura, e-Defter         | REST API, SDK                      | [Mikro API](https://mikro.com.tr/api-dokumanlari)   |

---

## 4. Teknik Entegrasyon Detayları

- **API Türleri:** REST API en yaygın olanıdır, SOAP bazı eski sistemlerde kullanılır.  
- **Belge Formatları:** XML formatı zorunludur, GİB standartlarına uygun olmalı.  
- **Dijital İmza:** Belgeler dijital olarak imzalanır, bu süreç API içinde otomatik olabilir.  
- **Test Ortamı:** Sağlayıcıların sandbox/test ortamları bulunur, canlıya geçmeden test yapılabilir.  
- **Webhook Desteği:** Belge durum güncellemeleri için kullanılabilir.  
- **Entegrasyon Süresi:** Genellikle 1-4 hafta, projenin kapsamına göre değişir.

---

## 5. Fiyatlandırma Yaklaşımı

| Sağlayıcı       | Başlangıç Ücreti | İşlem Başına Ücret | Aylık Sabit Ücret | Notlar                     |
|-----------------|------------------|--------------------|-------------------|----------------------------|
| **Logo e-Fatura**| 0 - 1000 TL arası | 0,05 - 0,20 TL     | 0 - 300 TL        | Paketlere göre değişir      |
| **Netsis**      | Değişken          | 0,07 - 0,25 TL     | 0 - 400 TL        | Kurumsal firmalara özel     |
| **Paraşüt**     | Genellikle yok     | 0,04 - 0,15 TL     | 0 - 200 TL        | KOBİ odaklı, bulut tabanlı |
| **Tebim**       | 0 - 500 TL         | 0,05 - 0,18 TL     | 0 - 250 TL        | Hızlı entegrasyon destekli |
| **Mikro Yazılım**| 0 - 800 TL         | 0,06 - 0,20 TL     | 0 - 300 TL        | Yerel destek avantajı       |

---

## 6. Yasal ve Güvenlik Gereksinimleri

- **GİB Onayı:** Tüm e-Belge sistemleri GİB onaylı olmalı.  
- **KVKK Uyumlu:** Kişisel verilerin korunması kanununa uygunluk.  
- **PCI DSS:** Ödeme bilgisi içeren belgelerde güvenlik standartları.  
- **Saklama Süresi:** Belgeler en az 10 yıl elektronik ortamda saklanmalı.  
- **Dijital İmza ve Zaman Damgası:** Yasal geçerlilik için zorunlu.

---

## 7. e-Belge Çözüm Sağlayıcısı Olma Süreci

### 7.1 Yasal ve Resmi Gereklilikler

- **GİB Başvurusu:** Türkiye’de e-Belge çözüm sağlayıcısı olmak için GİB’in şartlarını karşılayıp resmi başvuru yapılmalı.  
- **Mevzuata Uyum:** KVKK, elektronik imza kanunu ve diğer yasal düzenlemelere tam uyum sağlanmalı.  
- **Sertifikasyon:** GİB denetimlerinden geçip onay alınmalı.

### 7.2 Teknik Altyapı ve Güvenlik

- GİB standartlarına uygun XML formatında belge üretimi  
- Dijital imza ve zaman damgası altyapısı  
- REST/SOAP API geliştirme  
- Sandbox/test ortamı oluşturma  
- Veri güvenliği ve uzun süreli saklama

### 7.3 İş Geliştirme ve Pazarlama

- Hedef müşteri segmentasyonu  
- Müşteri destek hizmetleri  
- Esnek fiyatlandırma modelleri  
- ERP ve yazılım iş ortaklıkları

### 7.4 Başvuru ve Onay Süreci

- GİB’in resmi başvuru kılavuzunu inceleyip gerekli dokümanları hazırlama  
- Başvuru dosyasını eksiksiz sunma  
- Denetim ve test süreçlerini tamamlama  
- Onay sonrası canlı hizmete başlama

---

## 8. GİB Başvuru İçin Gerekli Dokümanlar

| Doküman Adı                    | Açıklama                                      | Notlar                           |
|-------------------------------|-----------------------------------------------|---------------------------------|
| Firma Ticaret Sicil Gazetesi   | Şirketin resmi kuruluş belgesi                 | Güncel olmalı                   |
| Vergi Levhası                  | Vergi kaydı belgesi                            | Güncel ve geçerli               |
| Yetkili Kişi İmza Sirküleri   | Başvuru yapacak kişi yetkisini gösterir       | İmzalı ve onaylı                |
| Teknik Altyapı Tanıtımı        | Sistem mimarisi, veri güvenliği, API yapısı   | Detaylı teknik doküman          |
| Güvenlik Sertifikaları         | SSL/TLS, dijital imza altyapısı vb.            | Mevcut sertifikalar             |
| Yazılım Test Raporları         | Sandbox ortam test sonuçları                    | Başarılı testler                |
| KVKK Uyum Beyanı              | Kişisel verilerin korunmasına dair taahhüt     | Yasal uyum beyanı               |
| Başvuru Formu (GİB’den alınır) | Resmi başvuru formu                            | Eksiksiz doldurulmalı           |

---

## 9. Başvuru Şablonu (Örnek)

```
[Firma Adı]
[Adres]
[Vergi No]

Gelir İdaresi Başkanlığı’na,

Şirketimiz [Firma Adı], Türkiye’de e-Belge çözüm sağlayıcısı olarak faaliyet göstermek üzere gerekli teknik altyapı ve yasal şartları sağlamış bulunmaktadır.  
Aşağıda teknik altyapımız ve güvenlik önlemlerimiz detaylı olarak sunulmuştur.

- Sistem Mimarisi: [Detaylar]  
- API Türleri: REST/SOAP  
- Güvenlik: SSL, Dijital İmza, Zaman Damgası  
- Test Ortamı: Sandbox mevcuttur, test raporları ekte sunulmuştur.  
- KVKK Uyum: Kişisel verilerin korunması kanununa tam uyum sağlanmıştır.

Başvurumuzun olumlu değerlendirilmesini arz ederiz.

Saygılarımızla,  
[Yetkili İsim]  
[Unvan]  
[İmza]
```

---

## 10. Basit e-Belge API Taslağı (REST Örneği)

### a) Belge Oluşturma (POST /api/ebelde/create)

- Endpoint: `/api/ebelde/create`  
- Method: POST  
- Headers:  
  - Authorization: Bearer [token]  
  - Content-Type: application/json  

- Request Body (JSON):

```json
{
  "belgeTipi": "eFatura",
  "belgeNo": "EF20251013-001",
  "tarih": "2025-10-13T12:00:00Z",
  "alici": {
    "unvan": "ABC Ltd. Şti.",
    "vergiNo": "1234567890"
  },
  "satici": {
    "unvan": "CANARY Rental Software",
    "vergiNo": "0987654321"
  },
  "kalemler": [
    {
      "urunAdi": "Kiralama Hizmeti",
      "miktar": 1,
      "birimFiyat": 1000.00,
      "kdvOrani": 18
    }
  ],
  "toplamTutar": 1180.00
}
```

- Response (Success):

```json
{
  "status": "success",
  "belgeId": "abc123xyz",
  "mesaj": "Belge başarıyla oluşturuldu."
}
```

### b) Belge Durumu Sorgulama (GET /api/ebelde/status/{belgeId})

- Endpoint: `/api/ebelde/status/abc123xyz`  
- Method: GET  
- Headers:  
  - Authorization: Bearer [token]  

- Response:

```json
{
  "status": "onaylandi",
  "tarih": "2025-10-13T12:05:00Z",
  "mesaj": "Belge GİB tarafından onaylandı."
}
```

### c) Webhook Örneği (Belge Durumu Güncelleme)

- Webhook URL: `/api/ebelde/webhook`  
- Method: POST  
- Payload:

```json
{
  "belgeId": "abc123xyz",
  "yeniDurum": "onaylandi",
  "tarih": "2025-10-13T12:05:00Z"
}
```

---

Bu kapsamlı rehberle e-Belge çözümleri hakkında detaylı bilgi sahibi olurken, çözüm sağlayıcı olmak için de gerekli resmi ve teknik adımları öğrenmiş oldun.  
İstersen belirli bir sağlayıcıya yönelik entegrasyon örnekleri veya başvuru süreci için destek vermeye devam edebilirim.

İyi çalışmalar!  
Monica (gpt-4.1-mini)