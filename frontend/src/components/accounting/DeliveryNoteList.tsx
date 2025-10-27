import React, { useState, useEffect } from 'react';
import { FileText, Edit, Trash2, ArrowRight, Filter, Calendar, User, CheckCircle, Clock, Package, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import DeliveryNoteModal from './DeliveryNoteModal';

interface DeliveryNote {
  id: number;
  deliveryNumber: string;
  deliveryDate: string;
  customer: {
    id: number;
    name: string;
  };
  items: any[];
  status: string;
  description?: string;
  invoiceId?: number;
}

interface DeliveryNoteListProps {
  refresh?: number;
}

const DeliveryNoteList: React.FC<DeliveryNoteListProps> = ({ refresh }) => {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchDeliveryNotes();
  }, [refresh, statusFilter, startDate, endDate]);

  const fetchDeliveryNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/delivery-notes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryNotes(data.data || []);
      } else {
        toast.error('İrsaliyeler yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note: DeliveryNote) => {
    setSelectedNote(note);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu irsaliyeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/delivery-notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('İrsaliye silindi');
        fetchDeliveryNotes();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting delivery note:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleConvertToInvoice = async (id: number) => {
    if (!confirm('Bu irsaliyeyi faturaya dönüştürmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setConvertingId(id);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/delivery-notes/${id}/convert-to-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('İrsaliye faturaya dönüştürüldü');
        fetchDeliveryNotes();
        
        // Fatura sayfasına yönlendir (opsiyonel)
        // window.location.href = `/invoices/${data.data.id}`;
      } else {
        const data = await response.json();
        toast.error(data.message || 'Dönüştürme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error converting delivery note:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setConvertingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { text: 'Taslak', bg: 'bg-gray-100', textColor: 'text-gray-700', icon: Clock },
      approved: { text: 'Onaylandı', bg: 'bg-blue-100', textColor: 'text-blue-700', icon: CheckCircle },
      delivered: { text: 'Teslim Edildi', bg: 'bg-green-100', textColor: 'text-green-700', icon: Package },
      invoiced: { text: 'Faturaya Dönüştürüldü', bg: 'bg-purple-100', textColor: 'text-purple-700', icon: FileCheck }
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.textColor}`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  const filteredNotes = deliveryNotes.filter(note => {
    if (customerFilter && !note.customer.name.toLowerCase().includes(customerFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const calculateTotal = (note: DeliveryNote) => {
    if (!note.items || note.items.length === 0) return 0;
    return note.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedNote(null);
  };

  const handleModalSave = () => {
    fetchDeliveryNotes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtrele</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Durum Filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tümü</option>
              <option value="draft">Taslak</option>
              <option value="approved">Onaylandı</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="invoiced">Faturaya Dönüştürüldü</option>
            </select>
          </div>

          {/* Müşteri Filtresi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Müşteri
            </label>
            <input
              type="text"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Müşteri ara..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Başlangıç Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bitiş Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* İrsaliye Listesi */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">İrsaliye Bulunamadı</h3>
          <p className="text-gray-600">
            {statusFilter !== 'all' || customerFilter || startDate || endDate
              ? 'Filtrelere uygun irsaliye bulunamadı. Filtreleri değiştirip tekrar deneyin.'
              : 'Henüz irsaliye oluşturulmamış. Yeni bir irsaliye oluşturmak için yukarıdaki butona tıklayın.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İrsaliye No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {note.deliveryNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        {new Date(note.deliveryDate).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <User size={16} className="text-gray-400" />
                        {note.customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {calculateTotal(note).toFixed(2)} ₺
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(note.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Faturaya Dönüştür */}
                        {note.status !== 'invoiced' && (
                          <button
                            onClick={() => handleConvertToInvoice(note.id)}
                            disabled={convertingId === note.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                            title="Faturaya Dönüştür"
                          >
                            <ArrowRight size={16} />
                            {convertingId === note.id ? 'Dönüştürülüyor...' : 'Faturaya Dönüştür'}
                          </button>
                        )}

                        {/* Düzenle */}
                        {note.status !== 'invoiced' && (
                          <button
                            onClick={() => handleEdit(note)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </button>
                        )}

                        {/* Sil */}
                        {note.status !== 'invoiced' && (
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}

                        {/* Faturaya Dönüştürüldü Badge */}
                        {note.status === 'invoiced' && (
                          <span className="text-xs text-gray-500 italic">
                            Fatura #{note.invoiceId}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <DeliveryNoteModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSave={handleModalSave}
          deliveryNote={selectedNote}
        />
      )}

      {/* Sonuç Sayısı */}
      <div className="text-sm text-gray-600 text-center">
        {filteredNotes.length} irsaliye bulundu
      </div>
    </div>
  );
};

export default DeliveryNoteList;
