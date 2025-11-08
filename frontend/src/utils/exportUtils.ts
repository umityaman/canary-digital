import toast from 'react-hot-toast';

/**
 * Export Utilities for Accounting Reports
 * Supports Excel and PDF export functionality
 */

interface ExportData {
  headers: string[];
  rows: any[][];
  title?: string;
  fileName?: string;
}

/**
 * Export data to Excel format (CSV)
 */
export const exportToExcel = (data: ExportData): void => {
  try {
    const { headers, rows, fileName = 'report' } = data;

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape commas and quotes
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    // Add BOM for Turkish characters
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${getTimestamp()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Excel dosyası indirildi');
  } catch (error) {
    console.error('Excel export error:', error);
    toast.error('Excel dosyası oluşturulamadı');
  }
};

/**
 * Export data to PDF format
 * Note: This is a basic implementation. For production, use a library like jsPDF or pdfmake
 */
export const exportToPDF = (data: ExportData): void => {
  try {
    const { headers, rows, title = 'Rapor', fileName = 'report' } = data;

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #1e40af;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tr:hover {
            background-color: #f3f4f6;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p><strong>Oluşturulma Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                ${row.map((cell) => `<td>${cell}</td>`).join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Bu rapor Canary Dijital İnşaat Platformu tarafından oluşturulmuştur.</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${getTimestamp()}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show print dialog
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      });
    }

    toast.success('PDF oluşturuldu (yazdırma penceresi açıldı)');
  } catch (error) {
    console.error('PDF export error:', error);
    toast.error('PDF dosyası oluşturulamadı');
  }
};

/**
 * Export journal entries to Excel
 */
export const exportJournalEntriesToExcel = (entries: any[]): void => {
  const headers = [
    'Fiş No',
    'Tarih',
    'Açıklama',
    'Borç',
    'Alacak',
    'Durum',
    'Oluşturan',
  ];

  const rows = entries.map((entry) => [
    entry.entryNumber,
    new Date(entry.entryDate).toLocaleDateString('tr-TR'),
    entry.description,
    formatCurrency(entry.totalDebit),
    formatCurrency(entry.totalCredit),
    getStatusLabel(entry.status),
    entry.createdBy,
  ]);

  exportToExcel({
    headers,
    rows,
    title: 'Muhasebe Fişleri',
    fileName: 'muhasebe_fisleri',
  });
};

/**
 * Export chart of accounts to Excel
 */
export const exportChartOfAccountsToExcel = (accounts: any[]): void => {
  const headers = ['Hesap Kodu', 'Hesap Adı', 'Tip', 'Bakiye', 'Durum'];

  const rows = accounts.map((account) => [
    account.code,
    account.name,
    getAccountTypeLabel(account.type),
    formatCurrency(account.balance),
    account.isActive ? 'Aktif' : 'Pasif',
  ]);

  exportToExcel({
    headers,
    rows,
    title: 'Hesap Planı',
    fileName: 'hesap_plani',
  });
};

/**
 * Export current accounts to Excel
 */
export const exportCurrentAccountsToExcel = (accounts: any[]): void => {
  const headers = [
    'Cari Kodu',
    'Cari Adı',
    'Tip',
    'Vergi No',
    'Borç',
    'Alacak',
    'Bakiye',
  ];

  const rows = accounts.map((account) => [
    account.code,
    account.name,
    account.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi',
    account.taxNumber || '-',
    formatCurrency(account.totalDebit),
    formatCurrency(account.totalCredit),
    formatCurrency(account.balance),
  ]);

  exportToExcel({
    headers,
    rows,
    title: 'Cari Hesaplar',
    fileName: 'cari_hesaplar',
  });
};

/**
 * Export financial report to Excel
 */
export const exportFinancialReportToExcel = (
  reportData: any[],
  reportTitle: string = 'Mali Rapor'
): void => {
  // Generic financial report export
  // Headers will be determined dynamically from the first data item
  if (reportData.length === 0) {
    toast.error('Export edilecek veri bulunamadı');
    return;
  }

  const firstItem = reportData[0];
  const headers = Object.keys(firstItem);

  const rows = reportData.map((item) =>
    headers.map((key) => {
      const value = item[key];
      // Format currency values
      if (typeof value === 'number' && key.toLowerCase().includes('amount')) {
        return formatCurrency(value);
      }
      // Format dates
      if (value instanceof Date) {
        return value.toLocaleDateString('tr-TR');
      }
      return value;
    })
  );

  exportToExcel({
    headers: headers.map((h) => formatHeader(h)),
    rows,
    title: reportTitle,
    fileName: reportTitle.toLowerCase().replace(/\s+/g, '_'),
  });
};

/**
 * Export to PDF wrapper for different report types
 */
export const exportReportToPDF = (
  data: any[],
  reportType: string,
  reportTitle: string
): void => {
  let headers: string[] = [];
  let rows: any[][] = [];

  switch (reportType) {
    case 'journal-entries':
      headers = ['Fiş No', 'Tarih', 'Açıklama', 'Borç', 'Alacak', 'Durum'];
      rows = data.map((e) => [
        e.entryNumber,
        new Date(e.entryDate).toLocaleDateString('tr-TR'),
        e.description,
        formatCurrency(e.totalDebit),
        formatCurrency(e.totalCredit),
        getStatusLabel(e.status),
      ]);
      break;

    case 'chart-of-accounts':
      headers = ['Hesap Kodu', 'Hesap Adı', 'Tip', 'Bakiye'];
      rows = data.map((a) => [
        a.code,
        a.name,
        getAccountTypeLabel(a.type),
        formatCurrency(a.balance),
      ]);
      break;

    case 'current-accounts':
      headers = ['Cari Kodu', 'Cari Adı', 'Tip', 'Borç', 'Alacak', 'Bakiye'];
      rows = data.map((a) => [
        a.code,
        a.name,
        a.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi',
        formatCurrency(a.totalDebit),
        formatCurrency(a.totalCredit),
        formatCurrency(a.balance),
      ]);
      break;

    default:
      toast.error('Bilinmeyen rapor tipi');
      return;
  }

  exportToPDF({
    headers,
    rows,
    title: reportTitle,
    fileName: reportTitle.toLowerCase().replace(/\s+/g, '_'),
  });
};

// Helper functions

const getTimestamp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    DRAFT: 'Taslak',
    POSTED: 'Kesinleşmiş',
    CANCELLED: 'İptal',
    APPROVED: 'Onaylandı',
    PAID: 'Ödendi',
  };
  return statusMap[status] || status;
};

const getAccountTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    ASSET: 'Varlık',
    LIABILITY: 'Borç',
    EQUITY: 'Özkaynak',
    REVENUE: 'Gelir',
    EXPENSE: 'Gider',
  };
  return typeMap[type] || type;
};

const formatHeader = (key: string): string => {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Email report functionality (placeholder)
 */
export const emailReport = async (
  reportData: any,
  reportType: string,
  recipientEmail: string
): Promise<void> => {
  try {
    // This would be implemented with a backend API call
    toast.loading('Email gönderiliyor...');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.dismiss();
    toast.success(`Rapor ${recipientEmail} adresine gönderildi`);
  } catch (error) {
    toast.dismiss();
    toast.error('Email gönderilemedi');
  }
};

/**
 * Schedule report generation (placeholder)
 */
export const scheduleReport = async (
  reportConfig: any,
  schedule: 'daily' | 'weekly' | 'monthly'
): Promise<void> => {
  try {
    toast.loading('Rapor zamanlaması ayarlanıyor...');

    // This would be implemented with a backend API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.dismiss();
    toast.success(`Rapor ${schedule} olarak zamanlandı`);
  } catch (error) {
    toast.dismiss();
    toast.error('Zamanlama ayarlanamadı');
  }
};
