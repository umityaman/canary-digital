import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Eye, FileText, Truck, XCircle, 
  Download, CheckCircle, Clock, Filter, Search
} from 'lucide-react';
import { deliveryNoteService, DeliveryNote } from '../../services/deliveryNoteService';
import { useNavigate } from 'react-router-dom';
import { card, button, input, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens';
import toast from 'react-hot-toast';

const statusColors: { [key: string]: 'warning' | 'success' | 'info' | 'danger' | 'default' } = {
  pending: 'warning',
  delivered: 'success',
  invoiced: 'info',
  cancelled: 'danger'
};

const statusLabels: { [key: string]: string } = {
  pending: 'Beklemede',
  delivered: 'Teslim Edildi',
  invoiced: 'Faturalandı',
  cancelled: 'İptal'
};

export default function DeliveryNoteList() {
  const navigate = useNavigate();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchDeliveryNotes();
  }, [statusFilter]);

  const fetchDeliveryNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await deliveryNoteService.getAll({
        status: statusFilter || undefined
      });
      setDeliveryNotes(result.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İrsaliyeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: number) => {
    try {
      await deliveryNoteService.downloadPDF(id);
      toast.success('PDF indiriliyor...');
    } catch (err: any) {
      toast.error('PDF indirilemedi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConvertToInvoice = async () => {
    if (!selectedNote) return;

    try {
      setConverting(true);
      await deliveryNoteService.convertToInvoice(selectedNote.id);
      setConvertDialogOpen(false);
      setSelectedNote(null);
      await fetchDeliveryNotes();
      toast.success('İrsaliye başarıyla faturaya dönüştürüldü!');
    } catch (err: any) {
      toast.error('Faturaya dönüştürülürken hata: ' + (err.response?.data?.message || err.message));
    } finally {
      setConverting(false);
    }
  };

  const handleMarkAsDelivered = async (id: number) => {
    if (!confirm('Bu irsaliyeyi teslim edildi olarak işaretlemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deliveryNoteService.markAsDelivered(id);
      await fetchDeliveryNotes();
      toast.success('İrsaliye teslim edildi olarak işaretlendi');
    } catch (err: any) {
      toast.error('Hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bu irsaliyeyi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deliveryNoteService.cancel(id);
      await fetchDeliveryNotes();
      toast.success('İrsaliye iptal edildi');
    } catch (err: any) {
      toast.error('Hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const calculateTotal = (note: DeliveryNote) => {
    return note.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`${DESIGN_TOKENS?.typography?.h1} ${DESIGN_TOKENS?.colors?.text.primary} flex items-center gap-3`}>
            <Package className="w-8 h-8 text-blue-600" />
            İrsaliyeler
          </h1>
          <p className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}>
            Sevk ve tahsilat irsaliyelerini yönetin
          </p>
        </div>
        <button
          onClick={() => navigate('/delivery-notes/new')}
          className={cx(button('md', 'primary', 'md'), 'gap-2')}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni İrsaliye</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={card('md', 'lg', 'default', 'xl')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{deliveryNotes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className={card('md', 'lg', 'default', 'xl')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Beklemede</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {deliveryNotes.filter(n => n.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className={card('md', 'lg', 'default', 'xl')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teslim Edildi</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {deliveryNotes.filter(n => n.status === 'delivered').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className={card('md', 'lg', 'default', 'xl')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Faturalandı</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {deliveryNotes.filter(n => n.status === 'invoiced').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={card('md', 'lg', 'default', 'xl')}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={cx(DESIGN_TOKENS?.typography?.label.lg, DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
              Durum Filtrele
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={input('md', 'default', undefined, 'md')}
            >
              <option value="">Tümü</option>
              <option value="pending">Beklemede</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="invoiced">Faturalandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={card('none', 'none', 'default', 'xl')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">İrsaliye No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase hidden lg:table-cell">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Müşteri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase hidden md:table-cell">Tip</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Tutar</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Durum</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveryNotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-gray-600">İrsaliye bulunamadı</p>
                  </td>
                </tr>
              ) : (
                deliveryNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{note.deliveryNumber}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {formatDate(note.deliveryDate)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{note.customer.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={badge('sm', 'default')}>
                        {note.deliveryType === 'sevk' ? 'Sevk' : 'Tahsilat'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                      {formatCurrency(calculateTotal(note))}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={badge('sm', statusColors[note.status] || 'default')}>
                        {statusLabels[note.status] || note.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/delivery-notes/${note.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="text-gray-600" size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(note.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="PDF İndir"
                        >
                          <Download className="text-gray-600" size={16} />
                        </button>
                        {note.status === 'pending' && (
                          <button
                            onClick={() => handleMarkAsDelivered(note.id)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Teslim Edildi"
                          >
                            <Truck className="text-green-600" size={16} />
                          </button>
                        )}
                        {(note.status === 'pending' || note.status === 'delivered') && !note.invoice && (
                          <button
                            onClick={() => {
                              setSelectedNote(note);
                              setConvertDialogOpen(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Faturaya Dönüştür"
                          >
                            <FileText className="text-blue-600" size={16} />
                          </button>
                        )}
                        {note.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(note.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="İptal"
                          >
                            <XCircle className="text-red-600" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert to Invoice Dialog */}
      {convertDialogOpen && selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary} mb-4`}>
              Faturaya Dönüştür
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedNote.deliveryNumber}</strong> numaralı irsaliyeyi faturaya dönüştürmek istediğinizden emin misiniz?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Müşteri: {selectedNote.customer.name}</p>
              <p className="text-sm text-gray-600 mt-1">Tutar: {formatCurrency(calculateTotal(selectedNote))}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConvertDialogOpen(false)}
                className={button('md', 'outline', 'md')}
                disabled={converting}
              >
                İptal
              </button>
              <button
                onClick={handleConvertToInvoice}
                className={cx(button('md', 'primary', 'md'), 'flex-1')}
                disabled={converting}
              >
                {converting ? 'Dönüştürülüyor...' : 'Faturaya Dönüştür'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
