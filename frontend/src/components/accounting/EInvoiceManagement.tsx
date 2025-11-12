import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface EInvoice {
  id: number;
  invoiceId: number;
  uuid: string;
  status: 'PENDING' | 'SENT' | 'RECEIVED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  gibStatus: string;
  sentAt?: string;
  receivedAt?: string;
  errorMessage?: string;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
  invoice: {
    id: number;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    customer: {
      id: number;
      name: string;
      email: string;
    };
  };
}

const EInvoiceManagement: React.FC = () => {
  const [eInvoices, setEInvoices] = useState<EInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEInvoice, setSelectedEInvoice] = useState<EInvoice | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [responseStatus, setResponseStatus] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const [responseReason, setResponseReason] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchEInvoices();
  }, [selectedStatus, currentPage]);

  const fetchEInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/gib/invoices?${params}`);
      if (!response.ok) throw new Error('Failed to fetch e-Invoices');

      const data = await response.json();
      setEInvoices(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching e-Invoices:', error);
      toast.error('e-Faturalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: number) => {
    try {
      const response = await fetch(`/api/gib/invoices/${invoiceId}/send`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('e-Fatura GIB\'e gönderildi');
        fetchEInvoices();
      } else {
        toast.error(data.message || 'e-Fatura gönderilemedi');
      }
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error('e-Fatura gönderirken hata oluştu');
    }
  };

  const handleCheckStatus = async (invoiceId: number) => {
    try {
      const response = await fetch(`/api/gib/invoices/${invoiceId}/status`);
      const data = await response.json();

      if (data.success) {
        toast.success('Durum güncellendi');
        fetchEInvoices();
      } else {
        toast.error('Durum kontrol edilemedi');
      }
    } catch (error: any) {
      console.error('Error checking status:', error);
      toast.error('Durum kontrol edilirken hata oluştu');
    }
  };

  const handleCancelInvoice = async (invoiceId: number) => {
    if (!cancelReason.trim()) {
      toast.error('İptal nedeni gereklidir');
      return;
    }

    try {
      const response = await fetch(`/api/gib/invoices/${invoiceId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('e-Fatura iptal edildi');
        setCancelReason('');
        setShowDetailModal(false);
        fetchEInvoices();
      } else {
        toast.error('e-Fatura iptal edilemedi');
      }
    } catch (error: any) {
      console.error('Error cancelling invoice:', error);
      toast.error('e-Fatura iptal edilirken hata oluştu');
    }
  };

  const handleDownloadReport = async (invoiceId: number, format: 'PDF' | 'HTML') => {
    try {
      const response = await fetch(`/api/gib/invoices/${invoiceId}/report?format=${format}`);
      
      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${format} raporu indirildi`);
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast.error('Rapor indirilemedi');
    }
  };

  const handleSendResponse = async (uuid: string) => {
    if (responseStatus === 'REJECTED' && !responseReason.trim()) {
      toast.error('Red nedeni gereklidir');
      return;
    }

    try {
      const response = await fetch(`/api/gib/invoices/${uuid}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: responseStatus,
          reason: responseReason || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`e-Fatura ${responseStatus === 'ACCEPTED' ? 'kabul edildi' : 'reddedildi'}`);
        setResponseReason('');
        setShowDetailModal(false);
        fetchEInvoices();
      } else {
        toast.error('Yanıt gönderilemedi');
      }
    } catch (error: any) {
      console.error('Error sending response:', error);
      toast.error('Yanıt gönderilirken hata oluştu');
    }
  };

  const handleBatchSend = async () => {
    if (selectedInvoices.length === 0) {
      toast.error('Lütfen fatura seçin');
      return;
    }

    try {
      const response = await fetch('/api/gib/invoices/batch-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceIds: selectedInvoices }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setSelectedInvoices([]);
        fetchEInvoices();
      } else {
        toast.error('Toplu gönderim başarısız');
      }
    } catch (error: any) {
      console.error('Error batch sending:', error);
      toast.error('Toplu gönderim sırasında hata oluştu');
    }
  };

  const handleRetryFailed = async () => {
    try {
      const response = await fetch('/api/gib/invoices/retry-failed', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchEInvoices();
      } else {
        toast.error('Yeniden deneme başarısız');
      }
    } catch (error: any) {
      console.error('Error retrying failed:', error);
      toast.error('Yeniden deneme sırasında hata oluştu');
    }
  };

  const handleFetchIncoming = async () => {
    try {
      const response = await fetch('/api/gib/invoices/incoming');
      const data = await response.json();

      if (data.success) {
        toast.success(`${data.count} adet gelen fatura alındı`);
        fetchEInvoices();
      } else {
        toast.error('Gelen faturalar alınamadı');
      }
    } catch (error: any) {
      console.error('Error fetching incoming:', error);
      toast.error('Gelen faturalar alınırken hata oluştu');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-neutral-100 text-neutral-800', text: 'Beklemede' },
      SENT: { color: 'bg-neutral-100 text-neutral-800', text: 'Gönderildi' },
      RECEIVED: { color: 'bg-neutral-100 text-neutral-800', text: 'Alındı' },
      APPROVED: { color: 'bg-neutral-100 text-neutral-800', text: 'Onaylandı' },
      REJECTED: { color: 'bg-neutral-100 text-neutral-800', text: 'Reddedildi' },
      CANCELLED: { color: 'bg-neutral-100 text-gray-800', text: 'İptal Edildi' },
    };

    const badge = badges[status] || { color: 'bg-neutral-100 text-gray-800', text: status };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const filteredInvoices = eInvoices.filter(ei => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ei.invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
      ei.invoice.customer.name.toLowerCase().includes(searchLower) ||
      ei.uuid.toLowerCase().includes(searchLower)
    );
  });

  const failedCount = eInvoices.filter(ei => ei.status === 'REJECTED' || ei.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">GIB e-Fatura Yönetimi</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Toplam {totalCount} e-Fatura • {failedCount} Başarısız
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFetchIncoming}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
          >
            📥 Gelen Faturalar
          </button>
          <button
            onClick={handleRetryFailed}
            disabled={failedCount === 0}
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 disabled:bg-gray-300"
          >
            🔄 Başarısız Olanları Yeniden Gönder ({failedCount})
          </button>
          <button
            onClick={handleBatchSend}
            disabled={selectedInvoices.length === 0}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:bg-gray-300"
          >
            📤 Toplu Gönder ({selectedInvoices.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Fatura No, Müşteri veya UUID ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="SENT">Gönderildi</option>
            <option value="RECEIVED">Alındı</option>
            <option value="APPROVED">Onaylandı</option>
            <option value="REJECTED">Reddedildi</option>
            <option value="CANCELLED">İptal Edildi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Yükleniyor...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            e-Fatura bulunamadı
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredInvoices.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(filteredInvoices.map(ei => ei.invoice.id));
                        } else {
                          setSelectedInvoices([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UUID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((eInvoice) => (
                  <tr key={eInvoice.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(eInvoice.invoice.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices([...selectedInvoices, eInvoice.invoice.id]);
                          } else {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== eInvoice.invoice.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {eInvoice.invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {eInvoice.invoice.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {eInvoice.uuid.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(eInvoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(eInvoice.invoice.invoiceDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {eInvoice.invoice.totalAmount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedEInvoice(eInvoice);
                          setShowDetailModal(true);
                        }}
                        className="text-neutral-900 hover:text-neutral-700 mr-3"
                      >
                        Detay
                      </button>
                      {eInvoice.status === 'PENDING' && (
                        <button
                          onClick={() => handleSendInvoice(eInvoice.invoice.id)}
                          className="text-neutral-900 hover:text-neutral-700 mr-3"
                        >
                          Gönder
                        </button>
                      )}
                      {(eInvoice.status === 'SENT' || eInvoice.status === 'RECEIVED') && (
                        <button
                          onClick={() => handleCheckStatus(eInvoice.invoice.id)}
                          className="text-neutral-900 hover:text-neutral-700 mr-3"
                        >
                          Durum
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              Sayfa {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-neutral-50 disabled:opacity-50"
              >
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-neutral-50 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">e-Fatura Detayları</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setCancelReason('');
                  setResponseReason('');
                }}
                className="text-gray-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Fatura No</p>
                  <p className="font-semibold">{selectedEInvoice.invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Müşteri</p>
                  <p className="font-semibold">{selectedEInvoice.invoice.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">UUID</p>
                  <p className="font-mono text-sm">{selectedEInvoice.uuid}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Durum</p>
                  {getStatusBadge(selectedEInvoice.status)}
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Gönderilme Tarihi</p>
                  <p>{selectedEInvoice.sentAt ? new Date(selectedEInvoice.sentAt).toLocaleString('tr-TR') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Alınma Tarihi</p>
                  <p>{selectedEInvoice.receivedAt ? new Date(selectedEInvoice.receivedAt).toLocaleString('tr-TR') : '-'}</p>
                </div>
              </div>

              {selectedEInvoice.errorMessage && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900">Hata</p>
                  <p className="text-sm text-neutral-800">{selectedEInvoice.errorMessage}</p>
                  {selectedEInvoice.errorCode && (
                    <p className="text-xs text-neutral-700 mt-1">Kod: {selectedEInvoice.errorCode}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">İşlemler</h4>

                {/* Download Reports */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReport(selectedEInvoice.invoice.id, 'PDF')}
                    className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                  >
                    📄 PDF İndir
                  </button>
                  <button
                    onClick={() => handleDownloadReport(selectedEInvoice.invoice.id, 'HTML')}
                    className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                  >
                    🌐 HTML İndir
                  </button>
                </div>

                {/* Send Response (for incoming invoices) */}
                {selectedEInvoice.status === 'RECEIVED' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Faturaya Yanıt Ver
                    </label>
                    <select
                      value={responseStatus}
                      onChange={(e) => setResponseStatus(e.target.value as 'ACCEPTED' | 'REJECTED')}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    >
                      <option value="ACCEPTED">Kabul Et</option>
                      <option value="REJECTED">Reddet</option>
                    </select>
                    {responseStatus === 'REJECTED' && (
                      <textarea
                        value={responseReason}
                        onChange={(e) => setResponseReason(e.target.value)}
                        placeholder="Red nedeni (zorunlu)"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                        rows={2}
                      />
                    )}
                    <button
                      onClick={() => handleSendResponse(selectedEInvoice.uuid)}
                      className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                    >
                      Yanıt Gönder
                    </button>
                  </div>
                )}

                {/* Cancel Invoice */}
                {(selectedEInvoice.status === 'SENT' || selectedEInvoice.status === 'APPROVED') && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Faturayı İptal Et
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="İptal nedeni (zorunlu)"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={2}
                    />
                    <button
                      onClick={() => handleCancelInvoice(selectedEInvoice.invoice.id)}
                      className="w-full px-4 py-2 border-2 border-neutral-900 text-neutral-900 rounded-lg hover:bg-neutral-50"
                    >
                      İptal Et
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EInvoiceManagement;
