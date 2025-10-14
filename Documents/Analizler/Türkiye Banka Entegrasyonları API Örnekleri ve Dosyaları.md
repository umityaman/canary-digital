# Türkiye Banka Entegrasyonları API Örnekleri ve Entegrasyon Dosyaları

Tarih: 13 Ekim 2025  
Hazırlayan: Monica (gpt-4.1-mini)

---

## 1. Türkiye’deki Başlıca Bankalar ve API Genel Bilgileri

| Banka                  | API Türü          | Hizmetler Örnekleri                                | Dokümantasyon Linki                                  |
|------------------------|-------------------|----------------------------------------------------|------------------------------------------------------|
| Türkiye İş Bankası      | REST API          | Hesap hareketleri, EFT, havale, bakiye sorgulama  | [İş Bankası API](https://developer.isbank.com.tr)    |
| Garanti BBVA            | REST API          | Ödeme talimatları, hesap bilgileri, sanal POS     | [Garanti API](https://developer.garantibbva.com.tr)  |
| Yapı Kredi              | REST API          | Hesap yönetimi, ödeme, kredi başvurusu             | [Yapı Kredi API](https://developer.yapikredi.com.tr) |
| Akbank                  | REST API          | EFT, havale, hesap hareketleri, kredi              | [Akbank API](https://developer.akbank.com)            |
| Ziraat Bankası          | REST API          | Hesap sorgulama, ödeme, para transferi             | [Ziraat API](https://ziraatbank.com.tr/api)           |
| Halkbank                | REST API          | Hesap işlemleri, EFT, havale, kredi başvuruları   | [Halkbank API](https://developer.halkbank.com)        |
| VakıfBank               | REST API          | Ödeme, hesap hareketleri, kredi, havale            | [VakıfBank API](https://developer.vakifbank.com.tr)   |
| QNB Finansbank          | REST API          | Hesap sorgulama, ödeme, havale, kredi              | [QNB Finansbank API](https://developer.qnbfinansbank.com) |
| DenizBank               | REST API          | Hesap hareketleri, ödeme, kredi, POS               | [DenizBank API](https://developer.denizbank.com.tr)   |
| ING Bank Türkiye        | REST API          | Hesap yönetimi, ödeme, kredi, para transferleri   | [ING API](https://developer.ing.com.tr)                |
| TEB (Türk Ekonomi Bankası) | REST API       | Hesap işlemleri, ödeme, kredi, POS                  | [TEB API](https://developer.teb.com.tr)                |
| Şekerbank               | REST API          | Hesap sorgulama, ödeme, kredi, havale              | [Şekerbank API](https://developer.sekerbank.com.tr)   |
| Fibabanka               | REST API          | Hesap hareketleri, ödeme, kredi, EFT               | [Fibabanka API](https://developer.fibabanka.com.tr)   |

---

## 2. Ortak API Yetkilendirme ve Güvenlik

- **OAuth 2.0:** Çoğu banka API erişiminde OAuth 2.0 protokolü kullanır.  
- **Bearer Token:** API çağrılarında Authorization header ile token gönderilir.  
- **TLS/SSL:** Veri iletimi şifrelenir.  
- **Rate Limiting:** API çağrıları belirli limitlerle sınırlandırılır.  
- **IP Whitelisting:** Bazı bankalar sadece belirlenen IP’lerden erişime izin verir.

---

## 3. API Örnekleri

### 3.1 Türkiye İş Bankası - Hesap Hareketleri Sorgulama

```http
GET /api/v1/accounts/{accountId}/transactions?startDate=2025-09-01&endDate=2025-09-30 HTTP/1.1
Host: api.isbank.com.tr
Authorization: Bearer {access_token}
Content-Type: application/json
```

- **Başarılı Yanıt Örneği:**

```json
{
  "accountId": "1234567890",
  "transactions": [
    {
      "transactionId": "trx001",
      "date": "2025-09-05",
      "amount": 1500.00,
      "type": "credit",
      "description": "Müşteri Ödemesi"
    },
    {
      "transactionId": "trx002",
      "date": "2025-09-10",
      "amount": -500.00,
      "type": "debit",
      "description": "Fatura Ödemesi"
    }
  ]
}
```

---

### 3.2 Garanti BBVA - Ödeme Talimatı Oluşturma

```http
POST /api/v1/payments HTTP/1.1
Host: api.garantibbva.com.tr
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "accountId": "1234567890",
  "amount": 1000.00,
  "currency": "TRY",
  "beneficiary": {
    "name": "Ahmet Yılmaz",
    "iban": "TR330006100519786457841326"
  },
  "description": "Fatura Ödemesi"
}
```

- **Başarılı Yanıt:**

```json
{
  "paymentId": "pay123456",
  "status": "SUCCESS",
  "message": "Ödeme başarılı."
}
```

---

### 3.3 Yapı Kredi - Bakiye Sorgulama

```http
GET /api/v1/accounts/{accountId}/balance HTTP/1.1
Host: api.yapikredi.com.tr
Authorization: Bearer {access_token}
Content-Type: application/json
```

- **Yanıt:**

```json
{
  "accountId": "1234567890",
  "balance": 5000.00,
  "currency": "TRY"
}
```

---

## 4. Entegrasyon Dosyaları ve Kaynaklar

Aşağıda her banka için örnek API çağrıları, yetkilendirme kodları ve hata yönetimi için temel şablonlar yer almaktadır. Bunları kendi projende kullanabilir, ihtiyaçlarına göre özelleştirebilirsin.

### 4.1 Örnek Python İstek Kodu (Requests Kütüphanesi)

```python
import requests

BASE_URL = "https://api.isbank.com.tr"
ACCESS_TOKEN = "your_access_token_here"
ACCOUNT_ID = "1234567890"

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

def get_transactions(start_date, end_date):
    url = f"{BASE_URL}/api/v1/accounts/{ACCOUNT_ID}/transactions"
    params = {
        "startDate": start_date,
        "endDate": end_date
    }
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

# Kullanım
transactions = get_transactions("2025-09-01", "2025-09-30")
print(transactions)
```

---

### 4.2 Örnek Node.js İstek Kodu (Axios)

```javascript
const axios = require('axios');

const BASE_URL = "https://api.garantibbva.com.tr";
const ACCESS_TOKEN = "your_access_token_here";

const headers = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

const paymentData = {
  accountId: "1234567890",
  amount: 1000.00,
  currency: "TRY",
  beneficiary: {
    name: "Ahmet Yılmaz",
    iban: "TR330006100519786457841326"
  },
  description: "Fatura Ödemesi"
};

axios.post(`${BASE_URL}/api/v1/payments`, paymentData, { headers })
  .then(response => {
    console.log("Ödeme başarılı:", response.data);
  })
  .catch(error => {
    console.error("Hata oluştu:", error.response.data);
  });
```

---

## 5. Özet ve Tavsiyeler

- Bankaların geliştirici portallarından API anahtarlarını ve dokümantasyonları mutlaka takip et.  
- Test ortamlarında (sandbox) kapsamlı testler yapmadan canlıya geçme.  
- Güvenlik standartlarına (OAuth, SSL, IP kısıtlamaları) kesinlikle uy.  
- API versiyon değişikliklerini düzenli kontrol et.  
- Hata yönetimi ve loglama sistemlerini mutlaka entegre et.

---

İstersen, bu dosyaları projene uygun şekilde daha da detaylandırabilir veya farklı dillerde örnekler hazırlayabilirim.  
Başarılar dilerim!  
Monica (gpt-4.1-mini)