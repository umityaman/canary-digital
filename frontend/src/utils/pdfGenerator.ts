import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  days?: number;
  discount?: number;
  vatRate?: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  customerTaxNumber?: string;
  items: InvoiceItem[];
  notes?: string;
  vatRate: number;
}

interface OfferData {
  offerNumber: string;
  offerDate: string;
  validityDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  customerTaxNumber?: string;
  items: InvoiceItem[];
  notes?: string;
  vatRate: number;
}

// Türkçe karakterleri desteklemek için
const turkishToLatin = (text: string): string => {
  const map: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => map[match] || match);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateFormat('tr-TR').format(date);
};

const calculateItemTotal = (item: InvoiceItem): number => {
  const basePrice = item.unitPrice * item.quantity;
  const withDays = item.days ? basePrice * item.days : basePrice;
  const withDiscount = item.discount ? withDays * (1 - item.discount / 100) : withDays;
  return withDiscount;
};

export const generateInvoicePDF = (data: InvoiceData): void => {
  const doc = new jsPDF();
  
  // Başlık
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURA', 105, 20, { align: 'center' });
  
  // Şirket bilgileri (sol)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Canary Digital', 20, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Adres: Istanbul, Turkiye', 20, 42);
  doc.text('Tel: +90 XXX XXX XX XX', 20, 47);
  doc.text('Email: info@canary.com', 20, 52);
  
  // Fatura bilgileri (sağ)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Fatura No: ${data.invoiceNumber}`, 140, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fatura Tarihi: ${formatDate(data.invoiceDate)}`, 140, 42);
  doc.text(`Vade Tarihi: ${formatDate(data.dueDate)}`, 140, 47);
  
  // Müşteri bilgileri
  doc.setFont('helvetica', 'bold');
  doc.text('Musteri Bilgileri:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(turkishToLatin(data.customerName), 20, 72);
  if (data.customerCompany) {
    doc.text(turkishToLatin(data.customerCompany), 20, 77);
  }
  if (data.customerTaxNumber) {
    doc.text(`Vergi No: ${data.customerTaxNumber}`, 20, data.customerCompany ? 82 : 77);
  }
  const customerInfoEnd = data.customerCompany ? 82 : 77;
  if (data.customerEmail) {
    doc.text(data.customerEmail, 20, customerInfoEnd + 5);
  }
  if (data.customerPhone) {
    doc.text(data.customerPhone, 20, customerInfoEnd + (data.customerEmail ? 10 : 5));
  }
  
  // Ürün/Hizmet tablosu
  const tableStartY = customerInfoEnd + (data.customerEmail || data.customerPhone ? 20 : 15);
  
  const tableData = data.items.map((item) => {
    const subtotal = calculateItemTotal(item);
    return [
      turkishToLatin(item.description),
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      item.days || '-',
      item.discount ? `${item.discount}%` : '-',
      formatCurrency(subtotal)
    ];
  });
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Aciklama', 'Miktar', 'Birim Fiyat', 'Gun', 'Indirim', 'Toplam']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 35, halign: 'right' }
    }
  });
  
  // Toplam hesaplamalar
  const subtotal = data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const vatAmount = subtotal * (data.vatRate / 100);
  const grandTotal = subtotal + vatAmount;
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Toplam kutusu
  doc.setFillColor(245, 245, 245);
  doc.rect(130, finalY, 60, 25, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ara Toplam:', 135, finalY + 6);
  doc.text(formatCurrency(subtotal), 185, finalY + 6, { align: 'right' });
  
  doc.text(`KDV (%${data.vatRate}):`, 135, finalY + 12);
  doc.text(formatCurrency(vatAmount), 185, finalY + 12, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Genel Toplam:', 135, finalY + 20);
  doc.text(formatCurrency(grandTotal), 185, finalY + 20, { align: 'right' });
  
  // Notlar
  if (data.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Notlar:', 20, finalY + 35);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(turkishToLatin(data.notes), 170);
    doc.text(splitNotes, 20, finalY + 42);
  }
  
  // Alt bilgi
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Bu belge elektronik ortamda olusturulmustur.', 105, 280, { align: 'center' });
  
  // PDF'i indir
  doc.save(`Fatura-${data.invoiceNumber}.pdf`);
};

export const generateOfferPDF = (data: OfferData): void => {
  const doc = new jsPDF();
  
  // Başlık
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TEKLIF', 105, 20, { align: 'center' });
  
  // Şirket bilgileri (sol)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Canary Digital', 20, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Adres: Istanbul, Turkiye', 20, 42);
  doc.text('Tel: +90 XXX XXX XX XX', 20, 47);
  doc.text('Email: info@canary.com', 20, 52);
  
  // Teklif bilgileri (sağ)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Teklif No: ${data.offerNumber}`, 140, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`Teklif Tarihi: ${formatDate(data.offerDate)}`, 140, 42);
  doc.text(`Gecerlilik: ${formatDate(data.validityDate)}`, 140, 47);
  
  // Müşteri bilgileri
  doc.setFont('helvetica', 'bold');
  doc.text('Musteri Bilgileri:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(turkishToLatin(data.customerName), 20, 72);
  if (data.customerCompany) {
    doc.text(turkishToLatin(data.customerCompany), 20, 77);
  }
  if (data.customerTaxNumber) {
    doc.text(`Vergi No: ${data.customerTaxNumber}`, 20, data.customerCompany ? 82 : 77);
  }
  const customerInfoEnd = data.customerCompany ? 82 : 77;
  if (data.customerEmail) {
    doc.text(data.customerEmail, 20, customerInfoEnd + 5);
  }
  if (data.customerPhone) {
    doc.text(data.customerPhone, 20, customerInfoEnd + (data.customerEmail ? 10 : 5));
  }
  
  // Ürün/Hizmet tablosu
  const tableStartY = customerInfoEnd + (data.customerEmail || data.customerPhone ? 20 : 15);
  
  const tableData = data.items.map((item) => {
    const subtotal = calculateItemTotal(item);
    return [
      turkishToLatin(item.description),
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      item.days || '-',
      item.discount ? `${item.discount}%` : '-',
      formatCurrency(subtotal)
    ];
  });
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Aciklama', 'Miktar', 'Birim Fiyat', 'Gun', 'Indirim', 'Toplam']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 35, halign: 'right' }
    }
  });
  
  // Toplam hesaplamalar
  const subtotal = data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const vatAmount = subtotal * (data.vatRate / 100);
  const grandTotal = subtotal + vatAmount;
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Toplam kutusu
  doc.setFillColor(245, 245, 245);
  doc.rect(130, finalY, 60, 25, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ara Toplam:', 135, finalY + 6);
  doc.text(formatCurrency(subtotal), 185, finalY + 6, { align: 'right' });
  
  doc.text(`KDV (%${data.vatRate}):`, 135, finalY + 12);
  doc.text(formatCurrency(vatAmount), 185, finalY + 12, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Genel Toplam:', 135, finalY + 20);
  doc.text(formatCurrency(grandTotal), 185, finalY + 20, { align: 'right' });
  
  // Notlar
  if (data.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Notlar:', 20, finalY + 35);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(turkishToLatin(data.notes), 170);
    doc.text(splitNotes, 20, finalY + 42);
  }
  
  // Geçerlilik uyarısı
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(192, 57, 43);
  doc.text(`Bu teklif ${formatDate(data.validityDate)} tarihine kadar gecerlidir.`, 105, finalY + (data.notes ? 60 : 45), { align: 'center' });
  
  // Alt bilgi
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Bu belge elektronik ortamda olusturulmustur.', 105, 280, { align: 'center' });
  
  // PDF'i indir
  doc.save(`Teklif-${data.offerNumber}.pdf`);
};
