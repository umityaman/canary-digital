import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { card, button, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens';
import JournalEntryFormModal from './JournalEntryFormModal';
import { exportJournalEntriesToExcel } from '../../utils/excelExport';

interface JournalEntryItem {
  id: number;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

interface JournalEntry {
  id: number;
  entryNumber: string;
  entryDate: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'POSTED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  items: JournalEntryItem[];
}

export default function JournalEntryList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    loadJournalEntries();
  }, [statusFilter, dateFrom, dateTo]);

  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/accounting/journal-entries?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load journal entries');

      const data = await response.json();
      setEntries(data.data || data);
    } catch (error: any) {
      console.error('Failed to load journal entries:', error);
      toast.error('Muhasebe fişleri yüklenemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Bu muhasebe fişini silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/accounting/journal-entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      toast.success('Muhasebe fişi silindi');
      loadJournalEntries();
    } catch (error: any) {
      toast.error('Muhasebe fişi silinemedi: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Taslak', color: 'bg-gray-100 text-gray-700' },
      POSTED: { label: 'Kesinleşmiş', color: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`${DESIGN_TOKENS?.typography?.heading.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            Muhasebe Fişleri
          </h2>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}>
            Tüm muhasebe kayıtlarını görüntüleyin ve yönetin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={button('secondary', 'md', 'md')}
            onClick={() => {
              try {
                exportJournalEntriesToExcel(entries);
                toast.success('Yevmiye fişleri Excel olarak indirildi');
              } catch (error) {
                toast.error('Excel export başarısız oldu');
              }
            }}
          >
            <Download className="w-4 h-4" />
            Excel İndir
          </button>
          <button
            className={button('primary', 'md', 'md')}
            onClick={() => {
              setEditingEntry(null);
              setShowFormModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Yeni Fiş
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Fiş no veya açıklama ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="DRAFT">Taslak</option>
            <option value="POSTED">Kesinleşmiş</option>
            <option value="CANCELLED">İptal</option>
          </select>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={loadJournalEntries}
            className={button('secondary', 'sm', 'md')}
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setDateFrom('');
              setDateTo('');
            }}
            className={button('secondary', 'sm', 'md')}
          >
            <Filter className="w-4 h-4" />
            Filtreleri Temizle
          </button>

          <button
            onClick={() => toast.success('Excel export özelliği yakında eklenecek')}
            className={button('secondary', 'sm', 'md')}
          >
            <Download className="w-4 h-4" />
            Excel İndir
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className={card('none', 'none', 'default', 'lg')}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className={`${DESIGN_TOKENS?.typography?.body.lg} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}>
              Muhasebe Fişi Bulunamadı
            </p>
            <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
              {searchQuery || statusFilter !== 'ALL' || dateFrom || dateTo
                ? 'Arama kriterlerinize uygun fiş bulunamadı'
                : 'Henüz muhasebe fişi oluşturulmamış'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borç
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alacak
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.primary} font-medium`}>
                          {entry.entryNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
                        {formatDate(entry.entryDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.primary} truncate`}>
                          {entry.description}
                        </p>
                        <p className={`${DESIGN_TOKENS?.typography?.body.xs} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
                          {entry.items.length} kayıt
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm} text-green-600 font-medium`}>
                        {formatCurrency(entry.totalDebit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`${DESIGN_TOKENS?.typography?.body.sm} text-red-600 font-medium`}>
                        {formatCurrency(entry.totalCredit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(entry)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detayları Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {entry.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingEntry(entry);
                                setShowFormModal(true);
                              }}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`${DESIGN_TOKENS?.typography?.heading.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    Muhasebe Fişi Detayı
                  </h3>
                  <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}>
                    {selectedEntry.entryNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Entry Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Tarih
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    {formatDate(selectedEntry.entryDate)}
                  </p>
                </div>
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Durum
                  </p>
                  {getStatusBadge(selectedEntry.status)}
                </div>
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Oluşturan
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    {selectedEntry.createdBy}
                  </p>
                </div>
                <div>
                  <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                    Oluşturma Tarihi
                  </p>
                  <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                    {formatDate(selectedEntry.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className={`${DESIGN_TOKENS?.typography?.label.sm} ${DESIGN_TOKENS?.colors?.text.tertiary} mb-1`}>
                  Açıklama
                </p>
                <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
                  {selectedEntry.description}
                </p>
              </div>

              {/* Entry Items */}
              <div>
                <h4 className={`${DESIGN_TOKENS?.typography?.heading.h4} ${DESIGN_TOKENS?.colors?.text.primary} mb-4`}>
                  Kayıt Detayları
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Hesap Kodu
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Hesap Adı
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedEntry.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {item.accountCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.accountName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium text-right">
                            {item.debitAmount > 0 ? formatCurrency(item.debitAmount) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600 font-medium text-right">
                            {item.creditAmount > 0 ? formatCurrency(item.creditAmount) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          TOPLAM:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">
                          {formatCurrency(selectedEntry.totalDebit)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-red-700 text-right">
                          {formatCurrency(selectedEntry.totalCredit)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center">
                          {selectedEntry.totalDebit === selectedEntry.totalCredit ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Borç ve Alacak Dengede
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-red-600">
                              <XCircle className="w-4 h-4" />
                              Borç ve Alacak Dengesiz!
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className={button('secondary', 'md', 'md')}
              >
                Kapat
              </button>
              <button
                onClick={() => toast.success('Yazdırma özelliği yakında eklenecek')}
                className={button('primary', 'md', 'md')}
              >
                <Download className="w-4 h-4" />
                Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <JournalEntryFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingEntry(null);
        }}
        onSaved={() => {
          loadJournalEntries();
          setShowFormModal(false);
          setEditingEntry(null);
        }}
        initialData={editingEntry}
      />
    </div>
  );
}
