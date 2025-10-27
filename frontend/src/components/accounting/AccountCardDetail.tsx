import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit2,
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  Receipt,
  CreditCard,
  Plus,
  Download,
  BarChart3,
} from 'lucide-react';
import api from '../../lib/api';
import AccountCardModal from './AccountCardModal';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AccountCardDetailProps {
  accountCardId: number;
  onBack: () => void;
}

export default function AccountCardDetail({ accountCardId, onBack }: AccountCardDetailProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices' | 'expenses' | 'aging'>('overview');
  const [accountCard, setAccountCard] = useState<any>(null);
  const [ageAnalysis, setAgeAnalysis] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    fetchAccountCard();
    fetchAgeAnalysis();
  }, [accountCardId]);

  const fetchAccountCard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/account-cards/${accountCardId}`);
      setAccountCard(response.data.data);
    } catch (error) {
      console.error('Fetch account card error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgeAnalysis = async () => {
    try {
      const response = await api.get(`/account-cards/${accountCardId}/age-analysis`);
      setAgeAnalysis(response.data.data);
    } catch (error) {
      console.error('Fetch age analysis error:', error);
    }
  };

  const handleRecalculateBalance = async () => {
    if (!confirm('Bakiyeyi yeniden hesaplamak istediğinizden emin misiniz?')) return;

    try {
      await api.post(`/account-cards/${accountCardId}/calculate-balance`);
      fetchAccountCard();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Bakiye hesaplanamadı');
    }
  };

  const typeLabels: any = {
    customer: 'Müşteri',
    supplier: 'Tedarikçi',
    both: 'Her İkisi',
  };

  const typeColors: any = {
    customer: 'bg-blue-100 text-blue-800',
    supplier: 'bg-orange-100 text-orange-800',
    both: 'bg-purple-100 text-purple-800',
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600';
    if (balance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getBalanceLabel = (balance: number) => {
    if (balance > 0) return 'Borç';
    if (balance < 0) return 'Alacak';
    return 'Bakiye';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accountCard) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cari hesap bulunamadı</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Geri Dön
        </button>
      </div>
    );
  }

  // Aging chart data
  const agingChartData = ageAnalysis
    ? {
        labels: ['Vadesi Gelmemiş', '0-30 Gün', '31-60 Gün', '61-90 Gün', '90+ Gün'],
        datasets: [
          {
            label: 'Tutar (TL)',
            data: [
              ageAnalysis.current || 0,
              ageAnalysis.days30 || 0,
              ageAnalysis.days60 || 0,
              ageAnalysis.days90 || 0,
              ageAnalysis.over90 || 0,
            ],
            backgroundColor: [
              'rgba(34, 197, 94, 0.5)',
              'rgba(251, 191, 36, 0.5)',
              'rgba(249, 115, 22, 0.5)',
              'rgba(239, 68, 68, 0.5)',
              'rgba(127, 29, 29, 0.5)',
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(251, 191, 36)',
              'rgb(249, 115, 22)',
              'rgb(239, 68, 68)',
              'rgb(127, 29, 29)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Düzenle
            </button>
            <button
              onClick={handleRecalculateBalance}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Bakiye Hesapla
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{accountCard.name}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[accountCard.type]}`}>
                {typeLabels[accountCard.type]}
              </span>
              {!accountCard.isActive && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  Pasif
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">Kod: {accountCard.code}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Bakiye</p>
            <p className={`text-3xl font-bold ${getBalanceColor(accountCard.balance)}`}>
              {Math.abs(accountCard.balance).toFixed(2)} TL
            </p>
            <p className="text-sm text-gray-500">{getBalanceLabel(accountCard.balance)}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">İşlemler</p>
              <p className="text-xl font-bold text-gray-900">
                {accountCard.transactions?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Faturalar</p>
              <p className="text-xl font-bold text-gray-900">
                {accountCard.invoices?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Giderler</p>
              <p className="text-xl font-bold text-gray-900">
                {accountCard.expenses?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vade</p>
              <p className="text-xl font-bold text-gray-900">
                {accountCard.paymentTerm || '-'} gün
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: TrendingUp },
            { id: 'transactions', label: 'İşlemler', icon: FileText },
            { id: 'invoices', label: 'Faturalar', icon: Receipt },
            { id: 'expenses', label: 'Giderler', icon: CreditCard },
            { id: 'aging', label: 'Yaşlandırma', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
                  <div className="space-y-2">
                    {accountCard.email && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">E-posta:</span>
                        <span className="font-medium">{accountCard.email}</span>
                      </div>
                    )}
                    {accountCard.phone && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Telefon:</span>
                        <span className="font-medium">{accountCard.phone}</span>
                      </div>
                    )}
                    {accountCard.mobile && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Cep:</span>
                        <span className="font-medium">{accountCard.mobile}</span>
                      </div>
                    )}
                    {accountCard.address && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Adres:</span>
                        <span className="font-medium text-right">{accountCard.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax & Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vergi & Ödeme</h3>
                  <div className="space-y-2">
                    {accountCard.taxNumber && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Vergi No:</span>
                        <span className="font-medium">{accountCard.taxNumber}</span>
                      </div>
                    )}
                    {accountCard.taxOffice && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Vergi Dairesi:</span>
                        <span className="font-medium">{accountCard.taxOffice}</span>
                      </div>
                    )}
                    {accountCard.creditLimit && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Kredi Limiti:</span>
                        <span className="font-medium">{accountCard.creditLimit.toFixed(2)} TL</span>
                      </div>
                    )}
                    {accountCard.paymentTerm && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Vade:</span>
                        <span className="font-medium">{accountCard.paymentTerm} gün</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {accountCard.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notlar</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{accountCard.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">İşlemler</h3>
                <button
                  onClick={() => setShowTransactionModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Manuel İşlem Ekle
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Borç</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Alacak</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accountCard.transactions?.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(tx.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              tx.type === 'debit'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {tx.type === 'debit' ? 'Borç' : 'Alacak'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{tx.description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                          {tx.type === 'debit' ? `${tx.amount.toFixed(2)} TL` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                          {tx.type === 'credit' ? `${tx.amount.toFixed(2)} TL` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">
                          {tx.dueDate ? new Date(tx.dueDate).toLocaleDateString('tr-TR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Faturalar</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">KDV</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accountCard.invoices?.map((invoice: any) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {invoice.subtotal?.toFixed(2)} TL
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {invoice.taxTotal?.toFixed(2)} TL
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {invoice.total?.toFixed(2)} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Giderler</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accountCard.expenses?.map((expense: any) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(expense.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{expense.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {expense.amount.toFixed(2)} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aging Tab */}
          {activeTab === 'aging' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Yaşlandırma Analizi</h3>

              {ageAnalysis && agingChartData && (
                <>
                  <div className="h-80">
                    <Bar
                      data={agingChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: 'Vade Yaşlandırma Dağılımı',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `${value} TL`,
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-700">Vadesi Gelmemiş</p>
                      <p className="text-2xl font-bold text-green-900">{ageAnalysis.current?.toFixed(2)} TL</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-700">0-30 Gün</p>
                      <p className="text-2xl font-bold text-yellow-900">{ageAnalysis.days30?.toFixed(2)} TL</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-700">31-60 Gün</p>
                      <p className="text-2xl font-bold text-orange-900">{ageAnalysis.days60?.toFixed(2)} TL</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700">61-90 Gün</p>
                      <p className="text-2xl font-bold text-red-900">{ageAnalysis.days90?.toFixed(2)} TL</p>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg">
                      <p className="text-sm text-red-800">90+ Gün</p>
                      <p className="text-2xl font-bold text-red-950">{ageAnalysis.over90?.toFixed(2)} TL</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">Toplam Gecikmiş</p>
                      <p className="text-2xl font-bold text-gray-900">{ageAnalysis.total?.toFixed(2)} TL</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AccountCardModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchAccountCard();
            setShowEditModal(false);
          }}
          accountCard={accountCard}
        />
      )}
    </div>
  );
}
