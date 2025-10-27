# 🧾 MUHASEBE ENTERPRISE - DETAYLI PLAN

**Başlangıç:** 28 Ekim 2025  
**Süre:** 80 saat (2 hafta)  
**Hedef:** Muhasebe modülünü %100 eksiksiz tamamla

---

## 📅 HAFTA 2 PLAN (40 saat)

### 🔴 GÜN 1-3: E-Fatura GİB Entegrasyonu (12 saat)

#### **Gün 1: GİB Setup & Araştırma (4 saat)**

**Sabah (2 saat):**
- [ ] GİB e-Fatura Portal dokümantasyonu inceleme
  - https://efatura.gib.gov.tr
  - Teknik Rehber PDF indir
  - XML Schema dokümanları (UBL-TR)
  
- [ ] Test ortamı hesabı oluştur
  - GİB test portal kaydı
  - Test firma bilgileri
  - Test sertifikaları

**Öğleden Sonra (2 saat):**
- [ ] E-Fatura XML formatı analizi
  - UBL-TR 1.2 standardı
  - Invoice schema (XSD)
  - Zorunlu alanlar listesi
  - Örnek XML dosyaları indir

---

#### **Gün 2: Backend E-Fatura Servisi (4 saat)**

**Database Modeli (1 saat):**
```prisma
// backend/prisma/schema.prisma

model EInvoice {
  id                Int       @id @default(autoincrement())
  invoiceId         Int       @unique
  invoice           Invoice   @relation(fields: [invoiceId], references: [id])
  
  // GİB Bilgileri
  uuid              String    @unique // E-Fatura UUID
  ettn              String?   // E-Fatura ETTN
  gibStatus         String    @default("draft") // draft, sent, accepted, rejected, cancelled
  gibResponse       Json?     // GİB yanıt
  
  // XML
  xmlContent        String    @db.Text
  xmlHash           String?
  
  // Tarihler
  sentDate          DateTime?
  responseDate      DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([gibStatus])
  @@index([uuid])
}

model EArchiveInvoice {
  id                Int       @id @default(autoincrement())
  invoiceId         Int       @unique
  invoice           Invoice   @relation(fields: [invoiceId], references: [id])
  
  // E-Arşiv Bilgileri
  archiveId         String    @unique
  portalStatus      String    @default("pending")
  pdfUrl            String?
  htmlContent       String?   @db.Text
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

**E-Fatura Service (3 saat):**
```typescript
// backend/src/services/eInvoiceService.ts

import { PrismaClient } from '@prisma/client';
import { XMLBuilder } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface EInvoiceData {
  invoiceId: number;
  invoice: any; // Full invoice with items, customer, etc.
}

export class EInvoiceService {
  
  /**
   * E-Fatura XML oluştur (UBL-TR 1.2)
   */
  async generateXML(invoiceId: number): Promise<string> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: {
          include: {
            equipment: true
          }
        }
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // UUID oluştur
    const uuid = uuidv4();
    const invoiceDate = new Date(invoice.invoiceDate);
    const dueDate = new Date(invoice.dueDate);

    // UBL-TR XML yapısı
    const ublInvoice = {
      Invoice: {
        '@_xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        '@_xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        '@_xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        
        // UBL Version
        'cbc:UBLVersionID': '2.1',
        'cbc:CustomizationID': 'TR1.2',
        
        // Fatura Bilgileri
        'cbc:ID': invoice.invoiceNumber,
        'cbc:UUID': uuid,
        'cbc:IssueDate': this.formatDate(invoiceDate),
        'cbc:IssueTime': this.formatTime(invoiceDate),
        'cbc:InvoiceTypeCode': 'SATIS', // SATIS, IADE, TEVKIFAT, vb.
        'cbc:DocumentCurrencyCode': 'TRY',
        
        // Not
        'cbc:Note': invoice.notes || '',
        
        // Satıcı (Şirket) Bilgileri
        'cac:AccountingSupplierParty': {
          'cac:Party': {
            'cac:PartyIdentification': {
              'cbc:ID': {
                '@_schemeID': 'VKN',
                '#text': process.env.COMPANY_TAX_NUMBER || '1234567890'
              }
            },
            'cac:PartyName': {
              'cbc:Name': process.env.COMPANY_NAME || 'Canary Digital'
            },
            'cac:PostalAddress': {
              'cbc:StreetName': process.env.COMPANY_ADDRESS || '',
              'cbc:CityName': process.env.COMPANY_CITY || 'İstanbul',
              'cbc:PostalZone': process.env.COMPANY_POSTAL_CODE || '34000',
              'cac:Country': {
                'cbc:Name': 'Türkiye'
              }
            },
            'cac:Contact': {
              'cbc:Telephone': process.env.COMPANY_PHONE || '',
              'cbc:ElectronicMail': process.env.COMPANY_EMAIL || ''
            }
          }
        },
        
        // Alıcı (Müşteri) Bilgileri
        'cac:AccountingCustomerParty': {
          'cac:Party': {
            'cac:PartyIdentification': {
              'cbc:ID': {
                '@_schemeID': invoice.customer.taxNumber ? 'VKN' : 'TCKN',
                '#text': invoice.customer.taxNumber || invoice.customer.identityNumber || ''
              }
            },
            'cac:PartyName': {
              'cbc:Name': invoice.customer.name
            },
            'cac:PostalAddress': {
              'cbc:StreetName': invoice.customer.address || '',
              'cbc:CityName': invoice.customer.city || '',
              'cac:Country': {
                'cbc:Name': 'Türkiye'
              }
            },
            'cac:Contact': {
              'cbc:Telephone': invoice.customer.phone || '',
              'cbc:ElectronicMail': invoice.customer.email || ''
            }
          }
        },
        
        // Ödeme Şartları
        'cac:PaymentMeans': {
          'cbc:PaymentMeansCode': this.getPaymentMeansCode(invoice.paymentMethod),
          'cbc:PaymentDueDate': this.formatDate(dueDate)
        },
        
        // KDV Toplam
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            '@_currencyID': 'TRY',
            '#text': invoice.vatAmount.toFixed(2)
          },
          'cac:TaxSubtotal': this.generateTaxSubtotals(invoice.items)
        },
        
        // Toplam Tutarlar
        'cac:LegalMonetaryTotal': {
          'cbc:LineExtensionAmount': {
            '@_currencyID': 'TRY',
            '#text': invoice.totalAmount.toFixed(2)
          },
          'cbc:TaxExclusiveAmount': {
            '@_currencyID': 'TRY',
            '#text': invoice.totalAmount.toFixed(2)
          },
          'cbc:TaxInclusiveAmount': {
            '@_currencyID': 'TRY',
            '#text': invoice.grandTotal.toFixed(2)
          },
          'cbc:PayableAmount': {
            '@_currencyID': 'TRY',
            '#text': invoice.grandTotal.toFixed(2)
          }
        },
        
        // Fatura Kalemleri
        'cac:InvoiceLine': invoice.items.map((item: any, index: number) => ({
          'cbc:ID': index + 1,
          'cbc:InvoicedQuantity': {
            '@_unitCode': 'C62', // Adet
            '#text': item.quantity
          },
          'cbc:LineExtensionAmount': {
            '@_currencyID': 'TRY',
            '#text': (item.quantity * item.unitPrice).toFixed(2)
          },
          'cac:Item': {
            'cbc:Name': item.equipment?.name || item.description,
            'cbc:Description': item.description
          },
          'cac:Price': {
            'cbc:PriceAmount': {
              '@_currencyID': 'TRY',
              '#text': item.unitPrice.toFixed(2)
            }
          },
          'cac:TaxTotal': {
            'cbc:TaxAmount': {
              '@_currencyID': 'TRY',
              '#text': (item.quantity * item.unitPrice * item.vatRate / 100).toFixed(2)
            },
            'cac:TaxSubtotal': {
              'cbc:TaxableAmount': {
                '@_currencyID': 'TRY',
                '#text': (item.quantity * item.unitPrice).toFixed(2)
              },
              'cbc:TaxAmount': {
                '@_currencyID': 'TRY',
                '#text': (item.quantity * item.unitPrice * item.vatRate / 100).toFixed(2)
              },
              'cac:TaxCategory': {
                'cbc:Percent': item.vatRate,
                'cac:TaxScheme': {
                  'cbc:Name': 'KDV',
                  'cbc:TaxTypeCode': '0015'
                }
              }
            }
          }
        }))
      }
    };

    // XML'e dönüştür
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true
    });
    
    const xml = builder.build(ublInvoice);
    
    // E-Invoice kaydını oluştur
    await prisma.eInvoice.create({
      data: {
        invoiceId: invoice.id,
        uuid: uuid,
        xmlContent: xml,
        xmlHash: this.calculateHash(xml),
        gibStatus: 'draft'
      }
    });

    return xml;
  }

  /**
   * GİB'e e-fatura gönder
   */
  async sendToGIB(invoiceId: number): Promise<any> {
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eInvoice) {
      throw new Error('E-Invoice not found. Generate XML first.');
    }

    // TODO: GİB Web Service çağrısı
    // Bu kısım GİB'in SOAP servisine istek atacak
    // Test ortamı için mock response dönelim
    
    const mockResponse = {
      status: 'sent',
      ettn: `ETTN-${Date.now()}`,
      message: 'E-Fatura GİB\'e gönderildi (TEST MODE)'
    };

    // Durumu güncelle
    await prisma.eInvoice.update({
      where: { id: eInvoice.id },
      data: {
        gibStatus: 'sent',
        ettn: mockResponse.ettn,
        sentDate: new Date(),
        gibResponse: mockResponse
      }
    });

    return mockResponse;
  }

  /**
   * E-Fatura durumu sorgula
   */
  async checkStatus(invoiceId: number): Promise<any> {
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId },
      include: { invoice: true }
    });

    if (!eInvoice) {
      throw new Error('E-Invoice not found');
    }

    // TODO: GİB'den durum sorgula
    // Mock response
    return {
      uuid: eInvoice.uuid,
      ettn: eInvoice.ettn,
      status: eInvoice.gibStatus,
      sentDate: eInvoice.sentDate,
      responseDate: eInvoice.responseDate
    };
  }

  /**
   * Helper: Tarih formatla (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Saat formatla (HH:MM:SS)
   */
  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }

  /**
   * Helper: Ödeme yöntemi kodu
   */
  private getPaymentMeansCode(method?: string): string {
    const codes: { [key: string]: string } = {
      'Nakit': '10',
      'Kredi Kartı': '48',
      'Banka Transferi': '42',
      'Çek': '20',
      'Senet': '21'
    };
    return codes[method || 'Nakit'] || '30';
  }

  /**
   * Helper: KDV alt toplamları
   */
  private generateTaxSubtotals(items: any[]): any[] {
    const taxGroups: { [key: number]: number } = {};
    
    items.forEach(item => {
      const vatRate = item.vatRate || 18;
      const taxAmount = item.quantity * item.unitPrice * vatRate / 100;
      
      if (!taxGroups[vatRate]) {
        taxGroups[vatRate] = 0;
      }
      taxGroups[vatRate] += taxAmount;
    });

    return Object.entries(taxGroups).map(([rate, amount]) => ({
      'cbc:TaxableAmount': {
        '@_currencyID': 'TRY',
        '#text': amount.toFixed(2)
      },
      'cbc:TaxAmount': {
        '@_currencyID': 'TRY',
        '#text': amount.toFixed(2)
      },
      'cac:TaxCategory': {
        'cbc:Percent': rate,
        'cac:TaxScheme': {
          'cbc:Name': 'KDV',
          'cbc:TaxTypeCode': '0015'
        }
      }
    }));
  }

  /**
   * Helper: XML hash hesapla
   */
  private calculateHash(xml: string): string {
    return crypto.createHash('sha256').update(xml).digest('hex');
  }
}

export default new EInvoiceService();
```

**Dependencies Ekle:**
```bash
cd backend
npm install fast-xml-parser uuid
npm install -D @types/uuid
```

---

#### **Gün 3: E-Fatura API Endpoints (4 saat)**

```typescript
// backend/src/routes/einvoice.ts

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import eInvoiceService from '../services/eInvoiceService';

const router = express.Router();

/**
 * E-Fatura XML oluştur
 * POST /api/einvoice/generate/:invoiceId
 */
router.post('/generate/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const xml = await eInvoiceService.generateXML(parseInt(invoiceId));
    
    res.json({
      success: true,
      message: 'E-Fatura XML oluşturuldu',
      data: {
        xml,
        preview: xml.substring(0, 500) + '...'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'E-Fatura XML oluşturulamadı',
      error: error.message
    });
  }
});

/**
 * E-Fatura GİB'e gönder
 * POST /api/einvoice/send/:invoiceId
 */
router.post('/send/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const result = await eInvoiceService.sendToGIB(parseInt(invoiceId));
    
    res.json({
      success: true,
      message: 'E-Fatura GİB\'e gönderildi',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'E-Fatura gönderilemedi',
      error: error.message
    });
  }
});

/**
 * E-Fatura durumu sorgula
 * GET /api/einvoice/status/:invoiceId
 */
router.get('/status/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const status = await eInvoiceService.checkStatus(parseInt(invoiceId));
    
    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Durum sorgulanamadı',
      error: error.message
    });
  }
});

/**
 * XML görüntüle
 * GET /api/einvoice/xml/:invoiceId
 */
router.get('/xml/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId: parseInt(invoiceId) }
    });

    if (!eInvoice) {
      return res.status(404).json({
        success: false,
        message: 'E-Fatura bulunamadı'
      });
    }

    res.set('Content-Type', 'application/xml');
    res.send(eInvoice.xmlContent);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

**app.ts'e ekle:**
```typescript
import einvoiceRoutes from './routes/einvoice';
app.use('/api/einvoice', einvoiceRoutes);
```

---

### 🟡 GÜN 4-5: E-Arşiv Fatura (8 saat)

#### **E-Arşiv Service (4 saat):**
```typescript
// backend/src/services/eArchiveService.ts

export class EArchiveService {
  /**
   * E-Arşiv fatura HTML oluştur
   */
  async generateHTML(invoiceId: number): Promise<string> {
    // E-Arşiv için özel HTML şablonu
    // GİB standartlarına uygun
  }

  /**
   * E-Arşiv portal'a gönder
   */
  async sendToPortal(invoiceId: number): Promise<any> {
    // Portal entegrasyonu
  }

  /**
   * PDF/A formatında kaydet
   */
  async generatePDFA(invoiceId: number): Promise<Buffer> {
    // PDF/A-3 standardı
  }
}
```

#### **E-Arşiv API (2 saat)**
#### **Frontend UI (2 saat)**

---

### 🟢 GÜN 6-7: İrsaliye Modülü (10 saat)

#### **Database Model:**
```prisma
model DeliveryNote {
  id                Int       @id @default(autoincrement())
  deliveryNumber    String    @unique
  deliveryDate      DateTime
  deliveryType      String    // sevk, tahsilat
  
  orderId           Int?
  order             Order?    @relation(fields: [orderId], references: [id])
  
  customerId        Int
  customer          Customer  @relation(fields: [customerId], references: [id])
  
  items             DeliveryNoteItem[]
  
  invoiceId         Int?      // Faturaya dönüştürüldüyse
  invoice           Invoice?  @relation(fields: [invoiceId], references: [id])
  
  status            String    @default("pending") // pending, delivered, invoiced
  
  driverName        String?
  vehiclePlate      String?
  notes             String?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model DeliveryNoteItem {
  id                Int            @id @default(autoincrement())
  deliveryNoteId    Int
  deliveryNote      DeliveryNote   @relation(fields: [deliveryNoteId], references: [id], onDelete: Cascade)
  
  equipmentId       Int?
  equipment         Equipment?     @relation(fields: [equipmentId], references: [id])
  
  description       String
  quantity          Int
  unitPrice         Float
  
  createdAt         DateTime       @default(now())
}
```

#### **İrsaliye CRUD (6 saat)**
#### **İrsaliye → Fatura Dönüşümü (2 saat)**
#### **İrsaliye PDF (2 saat)**

---

### 🔵 GÜN 8-10: Cari Hesap Kartları (10 saat)

#### **Cari Hesap Dashboard:**
- Müşteri bazlı bakiye
- Alacak/Borç takibi
- Ödeme geçmişi
- Yaşlandırma raporu (30, 60, 90 gün)
- Hesap özeti

#### **Features:**
- [ ] Cari hesap listesi
- [ ] Müşteri detay sayfası
- [ ] Bakiye kartları
- [ ] İşlem geçmişi
- [ ] Ekstre raporu
- [ ] Yaşlandırma analizi

---

## 📅 HAFTA 3 PLAN (40 saat)

### Gün 11-13: Stok Entegrasyonu (15 saat)
- Stok hareketleri (fatura → stok azalış)
- İade işlemleri (stok artış)
- Stok uyarıları
- Transfer kayıtları

### Gün 14-16: Maliyet Muhasebesi (12 saat)
- Gider kategorileri genişletme
- Maliyet merkezleri
- Kar-zarar hesaplama
- Bütçe vs gerçekleşen

### Gün 17-18: Banka Hesap Takibi (8 saat)
- Banka hesapları
- Virman işlemleri
- Banka mutabakatı
- Nakit akış raporu

### Gün 19-20: ERP Entegrasyonları (5 saat)
- Paraşüt API entegrasyonu
- Logo API entegrasyonu (opsiyonel)
- Excel import/export

---

## 📊 İLERLEME TAKİBİ

```
Gün 1-3:   E-Fatura GİB          ░░░░░░░░░░ 0%
Gün 4-5:   E-Arşiv               ░░░░░░░░░░ 0%
Gün 6-7:   İrsaliye              ░░░░░░░░░░ 0%
Gün 8-10:  Cari Hesap            ░░░░░░░░░░ 0%
Gün 11-13: Stok Entegrasyonu     ░░░░░░░░░░ 0%
Gün 14-16: Maliyet Muhasebesi    ░░░░░░░░░░ 0%
Gün 17-18: Banka Takibi          ░░░░░░░░░░ 0%
Gün 19-20: ERP Entegrasyonları   ░░░░░░░░░░ 0%
```

---

## 🎯 İLK ADIM (YARIN SABAH)

### Gün 1 Görevleri:
1. **09:00 - 11:00:** GİB e-Fatura dokümantasyon
2. **11:00 - 13:00:** Test ortamı kurulumu
3. **14:00 - 16:00:** XML şema analizi
4. **16:00 - 17:00:** Database migration

### Hazırlık:
```bash
# Dependencies
cd backend
npm install fast-xml-parser uuid
npm install -D @types/uuid

# Prisma migration
npx prisma migrate dev --name add_einvoice_models
```

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 27 Ekim 2025  
**Durum:** Hazır - Yarın Başla! 🚀
