import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  try {
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel export failed');
  }
}

/**
 * Export Trial Balance to Excel
 */
export function exportTrialBalanceToExcel(
  items: any[],
  summary: any,
  dateRange: { from: string; to: string }
) {
  const data = items.map((item) => ({
    'Hesap Kodu': item.accountCode,
    'Hesap Adı': item.accountName,
    'Tip': item.accountType,
    'Borç': item.debit,
    'Alacak': item.credit,
    'Bakiye': item.debit - item.credit,
  }));

  // Add summary row
  data.push({
    'Hesap Kodu': '',
    'Hesap Adı': 'TOPLAM',
    'Tip': '',
    'Borç': summary.totalDebit,
    'Alacak': summary.totalCredit,
    'Bakiye': summary.difference,
  });

  const filename = `Mizan_${dateRange.from || 'Baslangic'}_${dateRange.to}`;
  exportToExcel(data, filename, 'Mizan');
}

/**
 * Export Income Statement to Excel
 */
export function exportIncomeStatementToExcel(
  revenues: any[],
  expenses: any[],
  summary: any,
  dateRange: { from: string; to: string }
) {
  // Revenues sheet
  const revenueData = revenues.map((item) => ({
    'Hesap Kodu': item.accountCode,
    'Hesap Adı': item.accountName,
    'Tutar': item.amount,
    'Yüzde': `${item.percentage.toFixed(2)}%`,
  }));
  revenueData.push({
    'Hesap Kodu': '',
    'Hesap Adı': 'TOPLAM GELİR',
    'Tutar': summary.totalRevenue,
    'Yüzde': '100.00%',
  });

  // Expenses sheet
  const expenseData = expenses.map((item) => ({
    'Hesap Kodu': item.accountCode,
    'Hesap Adı': item.accountName,
    'Tutar': item.amount,
    'Yüzde': `${item.percentage.toFixed(2)}%`,
  }));
  expenseData.push({
    'Hesap Kodu': '',
    'Hesap Adı': 'TOPLAM GİDER',
    'Tutar': summary.totalExpense,
    'Yüzde': '100.00%',
  });

  // Summary sheet
  const summaryData = [
    { 'Açıklama': 'Toplam Gelir', 'Tutar': summary.totalRevenue },
    { 'Açıklama': 'Toplam Gider', 'Tutar': summary.totalExpense },
    { 'Açıklama': 'Brüt Kar/Zarar', 'Tutar': summary.grossProfit },
    { 'Açıklama': 'Net Kar/Zarar', 'Tutar': summary.netProfit },
    { 'Açıklama': 'Kar Marjı (%)', 'Tutar': summary.profitMargin },
  ];

  // Create workbook with multiple sheets
  const wb = XLSX.utils.book_new();

  const wsRevenue = XLSX.utils.json_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(wb, wsRevenue, 'Gelirler');

  const wsExpense = XLSX.utils.json_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(wb, wsExpense, 'Giderler');

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');

  const filename = `Gelir_Gider_Tablosu_${dateRange.from}_${dateRange.to}`;
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export Balance Sheet to Excel
 */
export function exportBalanceSheetToExcel(
  assets: any[],
  liabilities: any[],
  equity: any[],
  summary: any,
  date: string
) {
  const flattenTree = (items: any[], prefix: string = '') => {
    const result: any[] = [];
    items.forEach((item) => {
      result.push({
        'Hesap Kodu': item.accountCode,
        'Hesap Adı': prefix + item.accountName,
        'Tutar': item.amount,
        'Yüzde': `${item.percentage.toFixed(2)}%`,
      });
      if (item.children && item.children.length > 0) {
        result.push(...flattenTree(item.children, prefix + '  '));
      }
    });
    return result;
  };

  // Assets sheet
  const assetData = flattenTree(assets);
  assetData.push({
    'Hesap Kodu': '',
    'Hesap Adı': 'TOPLAM VARLIKLAR',
    'Tutar': summary.totalAssets,
    'Yüzde': '100.00%',
  });

  // Liabilities sheet
  const liabilityData = flattenTree(liabilities);
  liabilityData.push({
    'Hesap Kodu': '',
    'Hesap Adı': 'TOPLAM BORÇLAR',
    'Tutar': summary.totalLiabilities,
    'Yüzde': `${((summary.totalLiabilities / summary.totalLiabilitiesAndEquity) * 100).toFixed(2)}%`,
  });

  // Equity sheet
  const equityData = flattenTree(equity);
  equityData.push({
    'Hesap Kodu': '',
    'Hesap Adı': 'TOPLAM ÖZKAYNAK',
    'Tutar': summary.totalEquity,
    'Yüzde': `${((summary.totalEquity / summary.totalLiabilitiesAndEquity) * 100).toFixed(2)}%`,
  });

  // Summary sheet
  const summaryData = [
    { 'Açıklama': 'Toplam Varlıklar', 'Tutar': summary.totalAssets },
    { 'Açıklama': 'Toplam Borçlar', 'Tutar': summary.totalLiabilities },
    { 'Açıklama': 'Toplam Özkaynak', 'Tutar': summary.totalEquity },
    {
      'Açıklama': 'Borç + Özkaynak',
      'Tutar': summary.totalLiabilitiesAndEquity,
    },
    { 'Açıklama': 'Fark', 'Tutar': summary.difference },
    { 'Açıklama': 'Dengede', 'Tutar': summary.isBalanced ? 'EVET' : 'HAYIR' },
  ];

  // Create workbook with multiple sheets
  const wb = XLSX.utils.book_new();

  const wsAssets = XLSX.utils.json_to_sheet(assetData);
  XLSX.utils.book_append_sheet(wb, wsAssets, 'Varlıklar');

  const wsLiabilities = XLSX.utils.json_to_sheet(liabilityData);
  XLSX.utils.book_append_sheet(wb, wsLiabilities, 'Borçlar');

  const wsEquity = XLSX.utils.json_to_sheet(equityData);
  XLSX.utils.book_append_sheet(wb, wsEquity, 'Özkaynak');

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');

  const filename = `Bilanco_${date}`;
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export Journal Entries to Excel
 */
export function exportJournalEntriesToExcel(entries: any[]) {
  const data: any[] = [];

  entries.forEach((entry) => {
    // Add header row for each entry
    data.push({
      'Fiş No': entry.entryNumber,
      'Tarih': new Date(entry.date).toLocaleDateString('tr-TR'),
      'Açıklama': entry.description,
      'Durum': entry.status,
      'Borç': '',
      'Alacak': '',
    });

    // Add items
    entry.items?.forEach((item: any) => {
      data.push({
        'Fiş No': '',
        'Tarih': '',
        'Açıklama': `  ${item.account?.code} - ${item.account?.name}`,
        'Durum': '',
        'Borç': item.debit || '',
        'Alacak': item.credit || '',
      });
    });

    // Add totals
    const totalDebit = entry.items?.reduce((sum: number, i: any) => sum + (i.debit || 0), 0) || 0;
    const totalCredit = entry.items?.reduce((sum: number, i: any) => sum + (i.credit || 0), 0) || 0;
    data.push({
      'Fiş No': '',
      'Tarih': '',
      'Açıklama': 'TOPLAM',
      'Durum': '',
      'Borç': totalDebit,
      'Alacak': totalCredit,
    });

    // Add empty row
    data.push({
      'Fiş No': '',
      'Tarih': '',
      'Açıklama': '',
      'Durum': '',
      'Borç': '',
      'Alacak': '',
    });
  });

  const filename = `Yevmiye_Fisleri_${new Date().toISOString().split('T')[0]}`;
  exportToExcel(data, filename, 'Yevmiye Fişleri');
}

/**
 * Export Chart of Accounts to Excel
 */
export function exportChartOfAccountsToExcel(accounts: any[]) {
  const flattenTree = (accounts: any[], level: number = 0): any[] => {
    const result: any[] = [];
    accounts.forEach((account) => {
      result.push({
        'Hesap Kodu': account.code,
        'Hesap Adı': '  '.repeat(level) + account.name,
        'Tip': account.type,
        'Bakiye': account.balance || 0,
        'Durum': account.isActive ? 'Aktif' : 'Pasif',
      });
      if (account.children && account.children.length > 0) {
        result.push(...flattenTree(account.children, level + 1));
      }
    });
    return result;
  };

  const data = flattenTree(accounts);

  const filename = `Hesap_Plani_${new Date().toISOString().split('T')[0]}`;
  exportToExcel(data, filename, 'Hesap Planı');
}

/**
 * Export Current Accounts to Excel
 */
export function exportCurrentAccountsToExcel(accounts: any[]) {
  const data = accounts.map((account) => ({
    'Cari Kodu': account.code,
    'Cari Adı': account.name,
    'Tip': account.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi',
    'Vergi No': account.taxNumber || '',
    'Telefon': account.phone || '',
    'Email': account.email || '',
    'Borç': account.totalDebit,
    'Alacak': account.totalCredit,
    'Bakiye': account.balance,
    'Durum': account.isActive ? 'Aktif' : 'Pasif',
  }));

  const filename = `Cari_Hesaplar_${new Date().toISOString().split('T')[0]}`;
  exportToExcel(data, filename, 'Cari Hesaplar');
}

/**
 * Export Current Account Transactions to Excel
 */
export function exportCurrentAccountTransactionsToExcel(
  account: any,
  transactions: any[]
) {
  const data = transactions.map((txn) => ({
    'Tarih': new Date(txn.date).toLocaleDateString('tr-TR'),
    'Açıklama': txn.description,
    'Fatura No': txn.invoiceNumber || '',
    'Ödeme Yöntemi': txn.paymentMethod || '',
    'Borç': txn.type === 'DEBIT' ? txn.amount : '',
    'Alacak': txn.type === 'CREDIT' ? txn.amount : '',
    'Bakiye': txn.balance,
  }));

  const filename = `Cari_Ekstre_${account.code}_${new Date().toISOString().split('T')[0]}`;
  exportToExcel(data, filename, `${account.name} Ekstresi`);
}

/**
 * Format currency for Excel
 */
export function formatCurrencyForExcel(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
