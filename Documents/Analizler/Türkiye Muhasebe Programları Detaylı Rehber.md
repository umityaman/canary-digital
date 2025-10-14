# Türkiye Muhasebe Programları Detaylı Rehber

Türkiye’de yaygın kullanılan muhasebe programlarının kullanım senaryoları, fiyatlandırma yapıları, API entegrasyonları ve teknik detayları bu rehberde toplandı. İşletme büyüklüğüne ve ihtiyaçlarına göre en uygun çözümü seçmek için kapsamlı bir kaynak.

---

## 1. Genel Muhasebe Programları

| Program       | Hedef Kitle                 | Kurulum           | Fiyat Aralığı (TL)           | API Desteği                         |
|---------------|----------------------------|-------------------|------------------------------|------------------------------------|
| Logo Yazılım  | KOBİ’den büyük ölçek ERP    | Bulut / Yerel     | 10.000 - 100.000+ (yıllık)   | REST API, banka, ERP entegrasyonu  |
| Nebim V3      | Perakende ve ticaret       | Yerel / Bulut     | 20.000+ (lisans)             | REST/SOAP API, POS, CRM             |
| Mikro Yazılım | Küçük işletmeler           | Yerel             | 3.000 - 7.000 (lisans)       | Sınırlı API, dosya bazlı            |
| Paraşüt       | Freelancer, KOBİ, bulut     | Bulut             | 150-300 TL/ay                | REST API, e-ticaret, banka entegrasyonu |
| Netsis        | Orta ve büyük ölçekli firmalar | Yerel / Bulut  | 20.000+ (lisans)             | REST/SOAP API, ERP, banka entegrasyonu |
| Logo Go       | Mobil, küçük işletmeler    | Bulut             | 100-200 TL/ay                | REST API (sınırlı)                  |
| TicariSoft    | KOBİ                       | Yerel             | 5.000 - 10.000 (lisans)      | Sınırlı API, dosya bazlı            |

---

## 2. Paraşüt Detayları

### Kullanım Senaryoları
- Küçük işletmeler, freelancerlar için hızlı gelir-gider takibi  
- E-Fatura, E-Arşiv ve E-Defter uyumu  
- Banka entegrasyonu ile otomatik mutabakat  
- Mobil ve web üzerinden her yerden erişim  

### Temel Özellikler
- Gelir-gider ve cari hesap takibi  
- E-Fatura, E-Arşiv, E-Defter desteği  
- Banka hareketlerinin otomatik çekilmesi  
- Çoklu kullanıcı ve yetkilendirme  
- Mobil uygulama (iOS, Android)  

### API Entegrasyonları
- RESTful API, JSON formatı  
- OAuth 2.0 ile güvenlik  
- Webhook desteği  
- Fatura, cari hesap, banka hareketleri yönetimi  
- Popüler e-ticaret platformları ve ödeme sistemleri entegrasyonu  

### Örnek API Kullanımı: Yeni Fatura Oluşturma

```http
POST https://api.parasut.com/v4/invoices
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "data": {
    "type": "invoices",
    "attributes": {
      "invoice_date": "2025-10-13",
      "due_date": "2025-10-27",
      "description": "Danışmanlık hizmeti faturası",
      "currency": "TRY"
    },
    "relationships": {
      "contact": {
        "data": { "id": "123456", "type": "contacts" }
      },
      "invoice_items": {
        "data": [
          {
            "type": "invoice_items",
            "attributes": {
              "name": "Hizmet bedeli",
              "quantity": 1,
              "unit_price": 2000
            }
          }
        ]
      }
    }
  }
}
```

### Fiyatlandırma
- Aylık abonelik: 150-300 TL arası  
- Kullanıcı sayısı ve modüllere göre değişir  
- Ücretsiz deneme süresi mevcut  

---

## 3. Logo Yazılım Detayları

### Kullanım Senaryoları
- KOBİ’den büyük ölçekli şirketlere ERP ve muhasebe çözümleri  
- Çoklu şirket ve şube yönetimi  
- Üretim, bordro, satış ve finans süreçlerinin entegrasyonu  

### Temel Özellikler
- Muhasebe, bordro, stok, satış ve ERP modülleri  
- E-Fatura, E-Defter, E-Arşiv uyumu  
- Çoklu kullanıcı ve yetkilendirme  
- Mobil uygulamalar ve bulut çözümleri  

### API Entegrasyonları
- RESTful API ve SOAP servisleri  
- JSON ve XML veri formatları  
- OAuth 2.0 ve API anahtarı ile güvenlik  
- Finansal veriler, stok, satış, bordro modülleri  
- Banka, e-ticaret, CRM entegrasyonları  

### Örnek API Kullanımı: Cari Hesap Bilgisi Getirme (REST)

```http
GET https://api.logo.com/v1/customers/{customerId}
Authorization: Bearer {access_token}
Accept: application/json
```

### Örnek API Kullanımı: Yeni Stok Girişi Ekleme (SOAP)

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:log="http://logo.com/stock">
   <soapenv:Header/>
   <soapenv:Body>
      <log:AddStockEntry>
         <log:StockCode>STK001</log:StockCode>
         <log:Quantity>100</log:Quantity>
         <log:WarehouseCode>DEP01</log:WarehouseCode>
      </log:AddStockEntry>
   </soapenv:Body>
</soapenv:Envelope>
```

### Fiyatlandırma
- Lisans bazlı veya abonelik modeli  
- Küçük işletmeler için yıllık lisans 10.000-20.000 TL arası  
- Büyük ölçekli firmalar için modül ve kullanıcı sayısına göre artar  
- Destek ve bakım ücretleri ayrıca hesaplanır  

---

## 4. Özet Karşılaştırma

| Kriter               | Paraşüt                      | Logo Yazılım               |
|----------------------|-----------------------------|---------------------------|
| Hedef Kitle          | Freelancer, küçük ve orta ölçekli KOBİ | KOBİ’den büyük ölçek ERP       |
| Kurulum              | Bulut tabanlı               | Bulut ve yerel kurulum seçenekleri |
| API Desteği          | Geniş REST API, webhook     | RESTful + SOAP servisleri  |
| Güvenlik             | OAuth 2.0                   | OAuth 2.0, API Key        |
| Fiyatlandırma        | Aylık abonelik, uygun KOBİ  | Lisans + bakım, büyük firmalar için uygun |
| Kullanım Alanları    | Basit muhasebe ve finans    | ERP modülleri ve kapsamlı muhasebe |
| Mobil Uygulama       | Var                         | Var                       |
| E-Fatura Uyumu       | Var                         | Var                       |

---

## 5. Tavsiyeler

- **Paraşüt:** Küçük işletmeler, freelancerlar ve hızlı dijitalleşme isteyen KOBİ’ler için ideal.  
- **Logo Yazılım:** Orta ve büyük ölçekli şirketlerde kapsamlı ERP ve muhasebe entegrasyonları için tercih edilir.  
- API entegrasyonunda teknik destek almak ve güncel dokümanları takip etmek önemli.  
- Fiyat teklifi için firmalarla doğrudan iletişim önerilir, çünkü paketler ve kampanyalar sık değişebilir.

---

Herhangi bir programın API entegrasyonu için örnek kod, teknik doküman ya da fiyat teklifi konusunda daha fazla destek istersen, memnuniyetle yardımcı olurum!