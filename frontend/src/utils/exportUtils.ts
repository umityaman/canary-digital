import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Income export interfaces
interface Income {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  paymentMethod: string;
  notes?: string;
}

// Expense export interfaces
interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  paymentMethod: string;
  notes?: string;
}

// Check export interfaces
interface Check {
  checkNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  type: string;
  status: string;
  drawerName: string;
  bankName?: string;
  location?: string;
}

// Promissory Note export interfaces
interface PromissoryNote {
  noteNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  type: string;
  status: string;
  drawerName: string;
  guarantorName?: string;
  location?: string;
}

// Format currency for Turkish Lira
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

// ===================
// EXCEL EXPORTS
// ===================

export const exportIncomeToExcel = (incomes: Income[]) => {
  // Prepare data
  const data = incomes.map((income) => ({
    Tarih: formatDate(income.date),
    Açıklama: income.description,
    Kategori: income.category,
    Tutar: income.amount,
    'Ödeme Yöntemi': income.paymentMethod,
    Durum: income.status,
    Notlar: income.notes || '-',
  }));

  // Calculate total
  const total = incomes.reduce((sum, income) => sum + income.amount, 0);
  data.push({
    Tarih: '',
    Açıklama: '',
    Kategori: '',
    Tutar: total,
    'Ödeme Yöntemi': 'TOPLAM',
    Durum: '',
    Notlar: '',
  });

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gelirler');

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Tarih
    { wch: 30 }, // Açıklama
    { wch: 15 }, // Kategori
    { wch: 15 }, // Tutar
    { wch: 15 }, // Ödeme Yöntemi
    { wch: 12 }, // Durum
    { wch: 25 }, // Notlar
  ];

  // Download
  const fileName = `Gelirler_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportExpenseToExcel = (expenses: Expense[]) => {
  // Prepare data
  const data = expenses.map((expense) => ({
    Tarih: formatDate(expense.date),
    Açıklama: expense.description,
    Kategori: expense.category,
    Tutar: expense.amount,
    'Ödeme Yöntemi': expense.paymentMethod,
    Durum: expense.status,
    Notlar: expense.notes || '-',
  }));

  // Calculate total
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  data.push({
    Tarih: '',
    Açıklama: '',
    Kategori: '',
    Tutar: total,
    'Ödeme Yöntemi': 'TOPLAM',
    Durum: '',
    Notlar: '',
  });

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Giderler');

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
  ];

  // Download
  const fileName = `Giderler_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportChecksToExcel = (checks: Check[]) => {
  // Prepare data
  const data = checks.map((check) => ({
    'Çek No': check.checkNumber,
    Tip: check.type === 'received' ? 'Alınan' : 'Verilen',
    Durum: check.status,
    Keşideci: check.drawerName,
    Banka: check.bankName || '-',
    Tutar: check.amount,
    'Para Birimi': check.currency,
    'Vade Tarihi': formatDate(check.dueDate),
    Konum: check.location || '-',
  }));

  // Calculate total
  const total = checks.reduce((sum, check) => sum + check.amount, 0);
  data.push({
    'Çek No': '',
    Tip: '',
    Durum: '',
    Keşideci: '',
    Banka: '',
    Tutar: total,
    'Para Birimi': 'TOPLAM',
    'Vade Tarihi': '',
    Konum: '',
  });

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Çekler');

  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
  ];

  // Download
  const fileName = `Cekler_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportPromissoryNotesToExcel = (notes: PromissoryNote[]) => {
  // Prepare data
  const data = notes.map((note) => ({
    'Senet No': note.noteNumber,
    Tip: note.type === 'receivable' ? 'Alacak' : 'Borç',
    Durum: note.status,
    Borçlu: note.drawerName,
    Kefil: note.guarantorName || '-',
    Tutar: note.amount,
    'Para Birimi': note.currency,
    'Vade Tarihi': formatDate(note.dueDate),
    Konum: note.location || '-',
  }));

  // Calculate total
  const total = notes.reduce((sum, note) => sum + note.amount, 0);
  data.push({
    'Senet No': '',
    Tip: '',
    Durum: '',
    Borçlu: '',
    Kefil: '',
    Tutar: total,
    'Para Birimi': 'TOPLAM',
    'Vade Tarihi': '',
    Konum: '',
  });

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Senetler');

  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
  ];

  // Download
  const fileName = `Senetler_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// ===================
// PDF EXPORTS
// ===================

export const exportIncomeToPDF = (incomes: Income[], companyName: string = 'Canary Digital') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(companyName, 14, 15);
  doc.setFontSize(12);
  doc.text('Gelir Raporu', 14, 25);
  doc.setFontSize(10);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);

  // Prepare table data
  const tableData = incomes.map((income) => [
    formatDate(income.date),
    income.description,
    income.category,
    formatCurrency(income.amount),
    income.paymentMethod,
    income.status,
  ]);

  // Calculate total
  const total = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['Tarih', 'Açıklama', 'Kategori', 'Tutar', 'Ödeme', 'Durum']],
    body: tableData,
    foot: [['', '', '', formatCurrency(total), 'TOPLAM', '']],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [52, 73, 94], fontStyle: 'bold' },
  });

  // Download
  const fileName = `Gelir_Raporu_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportExpenseToPDF = (expenses: Expense[], companyName: string = 'Canary Digital') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(companyName, 14, 15);
  doc.setFontSize(12);
  doc.text('Gider Raporu', 14, 25);
  doc.setFontSize(10);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);

  // Prepare table data
  const tableData = expenses.map((expense) => [
    formatDate(expense.date),
    expense.description,
    expense.category,
    formatCurrency(expense.amount),
    expense.paymentMethod,
    expense.status,
  ]);

  // Calculate total
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['Tarih', 'Açıklama', 'Kategori', 'Tutar', 'Ödeme', 'Durum']],
    body: tableData,
    foot: [['', '', '', formatCurrency(total), 'TOPLAM', '']],
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60] },
    footStyles: { fillColor: [52, 73, 94], fontStyle: 'bold' },
  });

  // Download
  const fileName = `Gider_Raporu_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportChecksToPDF = (checks: Check[], companyName: string = 'Canary Digital') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(companyName, 14, 15);
  doc.setFontSize(12);
  doc.text('Çek Listesi', 14, 25);
  doc.setFontSize(10);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);

  // Prepare table data
  const tableData = checks.map((check) => [
    check.checkNumber,
    check.type === 'received' ? 'Alınan' : 'Verilen',
    check.drawerName,
    formatCurrency(check.amount),
    formatDate(check.dueDate),
    check.status,
  ]);

  // Calculate total
  const total = checks.reduce((sum, check) => sum + check.amount, 0);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['Çek No', 'Tip', 'Keşideci', 'Tutar', 'Vade', 'Durum']],
    body: tableData,
    foot: [['', '', '', formatCurrency(total), 'TOPLAM', '']],
    theme: 'grid',
    headStyles: { fillColor: [52, 152, 219] },
    footStyles: { fillColor: [52, 73, 94], fontStyle: 'bold' },
  });

  // Download
  const fileName = `Cek_Listesi_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportPromissoryNotesToPDF = (notes: PromissoryNote[], companyName: string = 'Canary Digital') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(companyName, 14, 15);
  doc.setFontSize(12);
  doc.text('Senet Listesi', 14, 25);
  doc.setFontSize(10);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);

  // Prepare table data
  const tableData = notes.map((note) => [
    note.noteNumber,
    note.type === 'receivable' ? 'Alacak' : 'Borç',
    note.drawerName,
    formatCurrency(note.amount),
    formatDate(note.dueDate),
    note.status,
  ]);

  // Calculate total
  const total = notes.reduce((sum, note) => sum + note.amount, 0);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['Senet No', 'Tip', 'Borçlu', 'Tutar', 'Vade', 'Durum']],
    body: tableData,
    foot: [['', '', '', formatCurrency(total), 'TOPLAM', '']],
    theme: 'grid',
    headStyles: { fillColor: [155, 89, 182] },
    footStyles: { fillColor: [52, 73, 94], fontStyle: 'bold' },
  });

  // Download
  const fileName = `Senet_Listesi_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Summary report combining income and expenses
export const exportFinancialSummaryToPDF = (
  incomes: Income[],
  expenses: Expense[],
  companyName: string = 'Canary Digital'
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(companyName, 14, 15);
  doc.setFontSize(12);
  doc.text('Mali Özet Raporu', 14, 25);
  doc.setFontSize(10);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 32);

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Summary table
  const summaryData = [
    ['Toplam Gelir', formatCurrency(totalIncome)],
    ['Toplam Gider', formatCurrency(totalExpense)],
    ['Net Kar/Zarar', formatCurrency(netProfit)],
  ];

  autoTable(doc, {
    startY: 40,
    head: [['Kategori', 'Tutar']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94] },
  });

  // Income by category
  const incomeByCategory: Record<string, number> = {};
  incomes.forEach((income) => {
    incomeByCategory[income.category] = (incomeByCategory[income.category] || 0) + income.amount;
  });

  const incomeCategoryData = Object.entries(incomeByCategory).map(([category, amount]) => [
    category,
    formatCurrency(amount),
  ]);

  if (incomeCategoryData.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Gelir Kategorileri', 'Tutar']],
      body: incomeCategoryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
  }

  // Expense by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((expense) => {
    expenseByCategory[expense.category] = (expenseByCategory[expense.category] || 0) + expense.amount;
  });

  const expenseCategoryData = Object.entries(expenseByCategory).map(([category, amount]) => [
    category,
    formatCurrency(amount),
  ]);

  if (expenseCategoryData.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Gider Kategorileri', 'Tutar']],
      body: expenseCategoryData,
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60] },
    });
  }

  // Download
  const fileName = `Mali_Ozet_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
