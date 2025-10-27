import { PrismaClient } from '@prisma/client';
import { XMLBuilder } from 'fast-xml-parser';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

interface UBLInvoice {
  Invoice: {
    '@_xmlns': string;
    '@_xmlns:cac': string;
    '@_xmlns:cbc': string;
    'cbc:UBLVersionID': string;
    'cbc:CustomizationID': string;
    'cbc:ProfileID': string;
    'cbc:ID': string;
    'cbc:UUID': string;
    'cbc:IssueDate': string;
    'cbc:IssueTime': string;
    'cbc:InvoiceTypeCode': string;
    'cbc:DocumentCurrencyCode': string;
    'cac:AccountingSupplierParty': any;
    'cac:AccountingCustomerParty': any;
    'cac:TaxTotal': any;
    'cac:LegalMonetaryTotal': any;
    'cac:InvoiceLine': any[];
  };
}

export class EInvoiceService {
  /**
   * UBL-TR 1.2 formatında E-Fatura XML'i oluşturur
   */
  async generateXML(invoiceId: number): Promise<string> {
    // Fatura bilgilerini getir
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        order: {
          include: {
            orderItems: {
              include: {
                equipment: true
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      throw new Error('Fatura bulunamadı');
    }

    if (!invoice.order) {
      throw new Error('Fatura için sipariş bulunamadı');
    }

    // UUID oluştur
    const invoiceUUID = uuidv4();
    const invoiceDate = invoice.invoiceDate || new Date();

    // UBL-TR 1.2 XML yapısı
    const ublInvoice: UBLInvoice = {
      Invoice: {
        '@_xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        '@_xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        '@_xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'cbc:UBLVersionID': '2.1',
        'cbc:CustomizationID': 'TR1.2',
        'cbc:ProfileID': 'TICARIFATURA',
        'cbc:ID': invoice.invoiceNumber || `INV-${invoice.id}`,
        'cbc:UUID': invoiceUUID,
        'cbc:IssueDate': this.formatDate(invoiceDate),
        'cbc:IssueTime': this.formatTime(invoiceDate),
        'cbc:InvoiceTypeCode': 'SATIS',
        'cbc:DocumentCurrencyCode': 'TRY',
        
        // Satıcı Bilgileri (Canary Digital)
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
              'cbc:PostalZone': process.env.COMPANY_POSTAL_CODE || '',
              'cac:Country': {
                'cbc:Name': 'Türkiye'
              }
            },
            'cac:PartyTaxScheme': {
              'cac:TaxScheme': {
                'cbc:Name': process.env.COMPANY_TAX_OFFICE || 'Kadıköy'
              }
            }
          }
        },

        // Alıcı Bilgileri
        'cac:AccountingCustomerParty': {
          'cac:Party': {
            'cac:PartyIdentification': {
              'cbc:ID': {
                '@_schemeID': invoice.customer.taxNumber ? 'VKN' : 'TCKN',
                '#text': invoice.customer.taxNumber || '11111111111'
              }
            },
            'cac:PartyName': {
              'cbc:Name': invoice.customer.fullName || invoice.customer.name || 'Müşteri'
            },
            'cac:PostalAddress': {
              'cbc:StreetName': invoice.customer.address || '',
              'cbc:CityName': 'İstanbul',
              'cac:Country': {
                'cbc:Name': 'Türkiye'
              }
            },
            'cac:PartyTaxScheme': {
              'cac:TaxScheme': {
                'cbc:Name': invoice.customer.taxOffice || 'Bilinmiyor'
              }
            }
          }
        },

        // Vergi Toplamları
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            '@_currencyID': 'TRY',
            '#text': invoice.vatAmount.toFixed(2)
          },
          'cac:TaxSubtotal': this.generateTaxSubtotals(invoice.order.orderItems)
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
        'cac:InvoiceLine': invoice.order.orderItems.map((item, index) => ({
          'cbc:ID': index + 1,
          'cbc:InvoicedQuantity': {
            '@_unitCode': 'C62', // Adet
            '#text': item.quantity
          },
          'cbc:LineExtensionAmount': {
            '@_currencyID': 'TRY',
            '#text': item.totalAmount.toFixed(2)
          },
          'cac:Item': {
            'cbc:Name': item.equipment?.name || 'Ekipman'
          },
          'cac:Price': {
            'cbc:PriceAmount': {
              '@_currencyID': 'TRY',
              '#text': item.dailyRate.toFixed(2)
            }
          },
          'cac:TaxTotal': {
            'cbc:TaxAmount': {
              '@_currencyID': 'TRY',
              '#text': (item.totalAmount * 0.20).toFixed(2) // %20 KDV
            }
          }
        }))
      }
    };

    // XML'e dönüştür
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true
    });
    
    const xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(ublInvoice);
    
    // Hash hesapla
    const xmlHash = this.calculateHash(xmlContent);

    // Veritabanına kaydet
    await prisma.eInvoice.upsert({
      where: { invoiceId },
      create: {
        invoiceId,
        uuid: invoiceUUID,
        xmlContent,
        xmlHash,
        gibStatus: 'draft'
      },
      update: {
        uuid: invoiceUUID,
        xmlContent,
        xmlHash,
        gibStatus: 'draft'
      }
    });

    return xmlContent;
  }

  /**
   * E-Faturayı GİB'e gönderir (MOCK - Gerçek entegrasyon için GİB SOAP servisi kullanılmalı)
   */
  async sendToGIB(invoiceId: number): Promise<any> {
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eInvoice) {
      throw new Error('E-Fatura bulunamadı. Önce XML oluşturulmalı.');
    }

    // MOCK: Gerçek uygulamada GİB SOAP servisine istek atılacak
    // const gibResponse = await this.callGIBService(eInvoice.xmlContent);
    
    // Şimdilik mock response
    const mockETTN = uuidv4();
    
    await prisma.eInvoice.update({
      where: { invoiceId },
      data: {
        ettn: mockETTN,
        gibStatus: 'sent',
        sentDate: new Date()
      }
    });

    return {
      success: true,
      ettn: mockETTN,
      status: 'sent',
      message: 'E-Fatura GİB\'e başarıyla gönderildi (MOCK)'
    };
  }

  /**
   * GİB'den fatura durumunu sorgular (MOCK)
   */
  async checkStatus(invoiceId: number): Promise<any> {
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eInvoice) {
      throw new Error('E-Fatura bulunamadı');
    }

    // MOCK: Gerçek uygulamada GİB'den durum sorgulanacak
    // const gibStatus = await this.queryGIBStatus(eInvoice.ettn);
    
    // Rastgele durum simülasyonu
    const mockStatuses = ['sent', 'accepted', 'rejected'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    if (randomStatus === 'accepted' || randomStatus === 'rejected') {
      await prisma.eInvoice.update({
        where: { invoiceId },
        data: {
          gibStatus: randomStatus,
          responseDate: new Date(),
          errorMessage: randomStatus === 'rejected' ? 'Mock red nedeni: Test amaçlı reddedildi' : null
        }
      });
    }

    return {
      ettn: eInvoice.ettn,
      status: randomStatus,
      sentDate: eInvoice.sentDate,
      responseDate: eInvoice.responseDate
    };
  }

  /**
   * E-Fatura XML'ini getirir
   */
  async getXML(invoiceId: number): Promise<string> {
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eInvoice) {
      throw new Error('E-Fatura bulunamadı');
    }

    return eInvoice.xmlContent;
  }

  /**
   * Tarih formatı: YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Saat formatı: HH:mm:ss
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Vergi alt toplamlarını oluşturur
   */
  private generateTaxSubtotals(orderItems: any[]): any[] {
    const taxRates = new Map<number, number>();
    
    orderItems.forEach(item => {
      const taxRate = 20; // %20 KDV (değiştirilebilir)
      const taxableAmount = item.totalAmount || 0;
      const taxAmount = taxableAmount * (taxRate / 100);
      
      const currentTax = taxRates.get(taxRate) || 0;
      taxRates.set(taxRate, currentTax + taxAmount);
    });

    return Array.from(taxRates.entries()).map(([rate, amount]) => ({
      'cbc:TaxableAmount': {
        '@_currencyID': 'TRY',
        '#text': (amount * 100 / rate).toFixed(2)
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
   * XML içeriğinin SHA-256 hash'ini hesaplar
   */
  private calculateHash(xml: string): string {
    return crypto
      .createHash('sha256')
      .update(xml)
      .digest('hex');
  }

  /**
   * Ödeme metodu kodunu döndürür
   */
  private getPaymentMeansCode(method?: string): string {
    const codes: { [key: string]: string } = {
      'cash': '10',
      'credit_card': '48',
      'bank_transfer': '42',
      'check': '20'
    };
    return codes[method || 'cash'] || '1';
  }
}

export const eInvoiceService = new EInvoiceService();
