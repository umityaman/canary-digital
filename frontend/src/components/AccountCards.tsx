import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, DollarSign, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AccountCardSummary {
  id: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
  type: 'customer' | 'supplier';
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
  status?: string;
}

interface AccountCardDetail {
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    taxNumber?: string;
  };
  supplier?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    taxNumber?: string;
  };
  transactions: Transaction[];
  summary: {
    totalDebit: number;
    totalCredit: number;
    currentBalance: number;
    transactionCount: number;
  };
}

const AccountCards: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    customers: AccountCardSummary[];
    suppliers: AccountCardSummary[];
    summary: {
      totalReceivables: number;
      totalPayables: number;
      netPosition: number;
      customerCount: number;
      supplierCount: number;
    };
  } | null>(null);

  const [selectedAccount, setSelectedAccount] = useState<AccountCardSummary | null>(null);
  const [accountDetail, setAccountDetail] = useState<AccountCardDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/account-cards/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch summary');

      const result = await response.json();
      setSummaryData(result.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetail = async (account: AccountCardSummary) => {
    setDetailLoading(true);
    setSelectedAccount(account);
    setAccountDetail(null);

    try {
      const token = localStorage.getItem('token');
      const endpoint =
        account.type === 'customer'
          ? `/api/account-cards/customer/${account.id}`
          : `/api/account-cards/supplier/${account.id}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch account detail');

      const result = await response.json();
      setAccountDetail(result.data);
    } catch (error) {
      console.error('Error fetching account detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const exportToExcel = () => {
    if (!accountDetail || !selectedAccount) return;

    const entity = accountDetail.customer || accountDetail.supplier;
    const ws_data = [
      ['Cari Hesap Kartı'],
      ['İsim:', entity?.name],
      ['Email:', entity?.email || ''],
      ['Telefon:', entity?.phone || ''],
      ['Vergi No:', entity?.taxNumber || ''],
      [],
      ['Tarih', 'İşlem Tipi', 'Açıklama', 'Borç', 'Alacak', 'Bakiye', 'Referans'],
      ...accountDetail.transactions.map((t) => [
        new Date(t.date).toLocaleDateString('tr-TR'),
        getTransactionTypeLabel(t.type),
        t.description,
        t.debit.toFixed(2),
        t.credit.toFixed(2),
        t.balance.toFixed(2),
        t.reference || '',
      ]),
      [],
      ['Toplam Borç:', accountDetail.summary.totalDebit.toFixed(2)],
      ['Toplam Alacak:', accountDetail.summary.totalCredit.toFixed(2)],
      ['Bakiye:', accountDetail.summary.currentBalance.toFixed(2)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cari Hesap');
    XLSX.writeFile(wb, `cari-hesap-${entity?.name}-${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    if (!accountDetail || !selectedAccount) return;

    const entity = accountDetail.customer || accountDetail.supplier;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Cari Hesap Kartı', 14, 20);

    // Entity info
    doc.setFontSize(12);
    doc.text(`İsim: ${entity?.name}`, 14, 30);
    doc.text(`Email: ${entity?.email || ''}`, 14, 37);
    doc.text(`Telefon: ${entity?.phone || ''}`, 14, 44);
    if (entity?.taxNumber) {
      doc.text(`Vergi No: ${entity.taxNumber}`, 14, 51);
    }

    // Transactions table
    const tableData = accountDetail.transactions.map((t) => [
      new Date(t.date).toLocaleDateString('tr-TR'),
      getTransactionTypeLabel(t.type),
      t.description,
      formatCurrency(t.debit),
      formatCurrency(t.credit),
      formatCurrency(t.balance),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Tarih', 'Tip', 'Açıklama', 'Borç', 'Alacak', 'Bakiye']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Toplam Borç: ${formatCurrency(accountDetail.summary.totalDebit)}`, 14, finalY);
    doc.text(`Toplam Alacak: ${formatCurrency(accountDetail.summary.totalCredit)}`, 14, finalY + 7);
    doc.text(`Bakiye: ${formatCurrency(accountDetail.summary.currentBalance)}`, 14, finalY + 14);

    doc.save(`cari-hesap-${entity?.name}-${Date.now()}.pdf`);
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      income: 'Gelir',
      expense: 'Gider',
      check_received: 'Alınan Çek',
      check_issued: 'Verilen Çek',
      note_received: 'Alınan Senet',
      note_issued: 'Verilen Senet',
      check_cashed: 'Çek Tahsil/Ödeme',
      note_collected: 'Senet Tahsil/Ödeme',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Cari Hesap Kartları</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Müşteri ve tedarikçi hesap hareketleri
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Toplam Alacaklar</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summaryData.summary.totalReceivables)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryData.summary.customerCount} Müşteri
                </p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Toplam Borçlar</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(summaryData.summary.totalPayables)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryData.summary.supplierCount} Tedarikçi
                </p>
              </div>
              <TrendingDown className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Pozisyon</p>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-1 ${
                    summaryData.summary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(summaryData.summary.netPosition)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summaryData.summary.netPosition >= 0 ? 'Lehimize' : 'Aleyhimize'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Müşteriler ({summaryData?.customers.length || 0})
            </h3>
          </div>
          <div className="overflow-y-auto max-h-96">
            {summaryData?.customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => fetchAccountDetail(customer)}
                className="px-4 sm:px-6 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors touch-manipulation min-h-[60px]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{customer.email}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-green-600 text-sm sm:text-base">
                      {formatCurrency(customer.balance)}
                    </p>
                    <p className="text-xs text-gray-500">Alacak</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Tedarikçiler ({summaryData?.suppliers.length || 0})
            </h3>
          </div>
          <div className="overflow-y-auto max-h-96">
            {summaryData?.suppliers.map((supplier) => (
              <div
                key={supplier.id}
                onClick={() => fetchAccountDetail(supplier)}
                className="px-4 sm:px-6 py-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors touch-manipulation min-h-[60px]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{supplier.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{supplier.email}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-red-600 text-sm sm:text-base">
                      {formatCurrency(supplier.balance)}
                    </p>
                    <p className="text-xs text-gray-500">Borç</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Detail Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-6xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{selectedAccount.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">Cari Hesap Kartı</p>
              </div>
              <div className="flex gap-2">
                {accountDetail && (
                  <>
                    <button
                      onClick={exportToExcel}
                      className="p-2 sm:p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                      title="Excel'e Aktar"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="p-2 sm:p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                      title="PDF'e Aktar"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="p-2 sm:p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[calc(90vh-120px)]">
              {detailLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : accountDetail ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Toplam Borç</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatCurrency(accountDetail.summary.totalDebit)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Toplam Alacak</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatCurrency(accountDetail.summary.totalCredit)}
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-indigo-600">Bakiye</p>
                      <p
                        className={`text-lg sm:text-xl font-bold ${
                          accountDetail.summary.currentBalance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(accountDetail.summary.currentBalance)}
                      </p>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tarih
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tip
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Açıklama
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Borç
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Alacak
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Bakiye
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accountDetail.transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                              {new Date(transaction.date).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {getTransactionTypeLabel(transaction.type)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 whitespace-nowrap">
                              {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 whitespace-nowrap">
                              {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm text-right font-semibold whitespace-nowrap ${
                                transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatCurrency(transaction.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountCards;
