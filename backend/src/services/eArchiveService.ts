import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class EArchiveService {
  /**
   * E-Arşiv Fatura HTML'i oluşturur
   */
  async generateHTML(invoiceId: number): Promise<string> {
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

    const archiveId = uuidv4();
    const invoiceDate = invoice.invoiceDate || new Date();

    // E-Arşiv Fatura HTML Template
    const htmlContent = this.generateHTMLTemplate(invoice, invoiceDate);

    // Veritabanına kaydet
    await prisma.eArchiveInvoice.upsert({
      where: { invoiceId },
      create: {
        invoiceId,
        archiveId,
        htmlContent,
        portalStatus: 'pending'
      },
      update: {
        archiveId,
        htmlContent,
        portalStatus: 'pending'
      }
    });

    return htmlContent;
  }

  /**
   * E-Arşiv Faturayı portala gönderir (MOCK)
   */
  async sendToPortal(invoiceId: number): Promise<any> {
    const eArchive = await prisma.eArchiveInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eArchive) {
      throw new Error('E-Arşiv Fatura bulunamadı. Önce HTML oluşturulmalı.');
    }

    // MOCK: Gerçek uygulamada E-Arşiv Portal API'sine istek atılacak
    const mockPdfUrl = `https://earchive.example.com/${eArchive.archiveId}.pdf`;
    
    await prisma.eArchiveInvoice.update({
      where: { invoiceId },
      data: {
        portalStatus: 'sent',
        pdfUrl: mockPdfUrl,
        sentDate: new Date()
      }
    });

    return {
      success: true,
      archiveId: eArchive.archiveId,
      pdfUrl: mockPdfUrl,
      status: 'sent',
      message: 'E-Arşiv Fatura portala başarıyla gönderildi (MOCK)'
    };
  }

  /**
   * E-Arşiv Fatura durumunu sorgular (MOCK)
   */
  async checkStatus(invoiceId: number): Promise<any> {
    const eArchive = await prisma.eArchiveInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eArchive) {
      throw new Error('E-Arşiv Fatura bulunamadı');
    }

    // MOCK: Gerçek uygulamada portal'dan durum sorgulanacak
    const mockStatuses = ['sent', 'archived', 'failed'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    if (randomStatus === 'archived' || randomStatus === 'failed') {
      await prisma.eArchiveInvoice.update({
        where: { invoiceId },
        data: {
          portalStatus: randomStatus,
          archivedDate: randomStatus === 'archived' ? new Date() : null,
          errorMessage: randomStatus === 'failed' ? 'Mock hata: Test amaçlı başarısız' : null
        }
      });
    }

    return {
      archiveId: eArchive.archiveId,
      status: randomStatus,
      pdfUrl: eArchive.pdfUrl,
      sentDate: eArchive.sentDate,
      archivedDate: eArchive.archivedDate
    };
  }

  /**
   * E-Arşiv Fatura HTML'ini getirir
   */
  async getHTML(invoiceId: number): Promise<string> {
    const eArchive = await prisma.eArchiveInvoice.findUnique({
      where: { invoiceId }
    });

    if (!eArchive) {
      throw new Error('E-Arşiv Fatura bulunamadı');
    }

    return eArchive.htmlContent;
  }

  /**
   * E-Arşiv Fatura HTML Template
   */
  private generateHTMLTemplate(invoice: any, invoiceDate: Date): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Arşiv Fatura - ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #fff;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #d32f2f;
    }
    
    .header p {
      font-size: 14px;
      font-weight: bold;
    }
    
    .company-info, .customer-info {
      margin-bottom: 20px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .info-box {
      border: 1px solid #000;
      padding: 15px;
    }
    
    .info-box h3 {
      font-size: 14px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ccc;
    }
    
    .info-box p {
      margin: 5px 0;
    }
    
    .info-box strong {
      display: inline-block;
      width: 150px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    table th {
      background: #f5f5f5;
      border: 1px solid #000;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    
    table td {
      border: 1px solid #000;
      padding: 10px;
    }
    
    table tfoot td {
      font-weight: bold;
      background: #f5f5f5;
    }
    
    .totals {
      float: right;
      width: 300px;
      margin-top: 20px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #ccc;
    }
    
    .total-row.grand-total {
      font-size: 16px;
      font-weight: bold;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 10px 0;
      margin-top: 10px;
    }
    
    .footer {
      clear: both;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #000;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      color: rgba(211, 47, 47, 0.1);
      font-weight: bold;
      z-index: -1;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="watermark">E-ARŞİV FATURA</div>
  
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <h1>E-ARŞİV FATURA</h1>
      <p>FATURA NO: ${invoice.invoiceNumber}</p>
      <p>TARİH: ${formatDate(invoiceDate)}</p>
    </div>
    
    <!-- Company & Customer Info -->
    <div class="info-grid">
      <!-- Company Info -->
      <div class="info-box">
        <h3>SATICI BİLGİLERİ</h3>
        <p><strong>Ünvan:</strong> ${process.env.COMPANY_NAME || 'Canary Digital'}</p>
        <p><strong>Adres:</strong> ${process.env.COMPANY_ADDRESS || 'İstanbul, Türkiye'}</p>
        <p><strong>VKN:</strong> ${process.env.COMPANY_TAX_NUMBER || '1234567890'}</p>
        <p><strong>Vergi Dairesi:</strong> ${process.env.COMPANY_TAX_OFFICE || 'Kadıköy'}</p>
      </div>
      
      <!-- Customer Info -->
      <div class="info-box">
        <h3>ALICI BİLGİLERİ</h3>
        <p><strong>Ad Soyad:</strong> ${invoice.customer.fullName || invoice.customer.name || 'Müşteri'}</p>
        <p><strong>Adres:</strong> ${invoice.customer.address || 'Belirtilmemiş'}</p>
        <p><strong>${invoice.customer.taxNumber ? 'VKN' : 'TCKN'}:</strong> ${invoice.customer.taxNumber || '11111111111'}</p>
        ${invoice.customer.email ? `<p><strong>E-posta:</strong> ${invoice.customer.email}</p>` : ''}
        ${invoice.customer.phone ? `<p><strong>Telefon:</strong> ${invoice.customer.phone}</p>` : ''}
      </div>
    </div>
    
    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Sıra</th>
          <th>Mal / Hizmet Açıklaması</th>
          <th style="width: 80px;">Miktar</th>
          <th style="width: 100px;">Birim Fiyat</th>
          <th style="width: 100px;">Tutar</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.order.orderItems.map((item: any, index: number) => `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${item.equipment?.name || 'Ekipman'}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.dailyRate)}</td>
          <td style="text-align: right;">${formatCurrency(item.totalAmount)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <span>Ara Toplam:</span>
        <span>${formatCurrency(invoice.totalAmount)}</span>
      </div>
      <div class="total-row">
        <span>KDV (%20):</span>
        <span>${formatCurrency(invoice.vatAmount)}</span>
      </div>
      <div class="total-row grand-total">
        <span>GENEL TOPLAM:</span>
        <span>${formatCurrency(invoice.grandTotal)}</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Bu belge elektronik imza ile imzalanmış olup, güvenli elektronik imza ile imzalanmış kağıt belge ile aynı ispat gücündedir.</p>
      <p>E-Arşiv Fatura sistemi üzerinden oluşturulmuştur.</p>
      <p style="margin-top: 10px; font-size: 9px;">
        ${process.env.COMPANY_NAME || 'Canary Digital'} - ${formatDate(new Date())}
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}

export const eArchiveService = new EArchiveService();
