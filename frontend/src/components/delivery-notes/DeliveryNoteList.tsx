import { useState, useEffect } from 'react';
import {
  Package, Plus, Eye, FileText, Truck, XCircle, 
  Download, CheckCircle, Clock, Search, Calendar
} from 'lucide-react';
import { deliveryNoteService, DeliveryNote } from '../../services/deliveryNoteService';
import { useNavigate } from 'react-router-dom';
import { card, button, input, badge, DESIGN_TOKENS, cx, statCardIcon } from '../../styles/design-tokens';
import toast from 'react-hot-toast';

// Hardcoded table cell classes
const TABLE_HEADER_CELL = 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50'
const TABLE_BODY_CELL = 'px-6 py-4 text-sm text-neutral-900'

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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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

  const renderStatusBadge = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      invoiced: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-neutral-100 text-neutral-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  // Filter and search
  const filteredNotes = deliveryNotes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || 
      note.deliveryType === categoryFilter;
    
    const matchesStatus = statusFilter === '' || 
      note.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ boxSizing: 'border-box' }}>
        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('primary')}>
              <Package className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Toplam</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{deliveryNotes.length}</h3>
          <p className="text-xs font-medium text-neutral-600">İrsaliye</p>
        </div>

        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('warning')}>
              <Clock className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Beklemede</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
            {deliveryNotes.filter(n => n.status === 'pending').length}
          </h3>
          <p className="text-xs font-medium text-neutral-600">İrsaliye</p>
        </div>

        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('success')}>
              <CheckCircle className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Teslim Edildi</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
            {deliveryNotes.filter(n => n.status === 'delivered').length}
          </h3>
          <p className="text-xs font-medium text-neutral-600">İrsaliye</p>
        </div>

        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('info')}>
              <FileText className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Faturalandı</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
            {deliveryNotes.filter(n => n.status === 'invoiced').length}
          </h3>
          <p className="text-xs font-medium text-neutral-600">İrsaliye</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className={card('sm', 'sm', 'default', 'lg')}>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${DESIGN_TOKENS?.colors?.text.muted}`} size={18} />
              <input
                type="text"
                placeholder="İrsaliye ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[150px] max-w-[200px]')}
              style={{ boxSizing: 'border-box' }}
            >
              <option value="">Tüm Kategoriler</option>
              <option value="sevk">Sevk</option>
              <option value="tahsilat">Tahsilat</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[130px]')}
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="invoiced">Faturalandı</option>
              <option value="cancelled">İptal</option>
            </select>

            <button
              onClick={() => navigate('/delivery-notes/new')}
              className={cx(button('md', 'primary', 'md'), 'gap-2 whitespace-nowrap')}
            >
              <Plus size={18} />
              <span>Yeni İrsaliye</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={card('sm', 'sm', 'default', 'lg')} style={{ overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">
            <Package className="mx-auto mb-4 text-neutral-400" size={48} />
            <p className="text-lg font-medium">İrsaliye bulunamadı</p>
            <p className="text-sm mt-2">
              {searchTerm || categoryFilter || statusFilter 
                ? 'Arama kriterlerinize uygun irsaliye bulunamadı' 
                : 'Yeni irsaliye ekleyerek başlayın'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto" style={{ maxWidth: '100%', width: '100%' }}>
              <table className="w-full" style={{ tableLayout: 'fixed', width: '100%', maxWidth: '100%' }}>
                <thead>
                  <tr>
                    <th className={TABLE_HEADER_CELL}>İrsaliye No</th>
                    <th className={`${TABLE_HEADER_CELL} hidden lg:table-cell`}>Tarih</th>
                    <th className={TABLE_HEADER_CELL}>Müşteri</th>
                    <th className={`${TABLE_HEADER_CELL} hidden md:table-cell`}>Tip</th>
                    <th className={TABLE_HEADER_CELL}>Tutar</th>
                    <th className={TABLE_HEADER_CELL}>Durum</th>
                    <th className={TABLE_HEADER_CELL}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-neutral-50 transition-colors">
                      <td className={TABLE_BODY_CELL}>
                        <div className="font-medium text-neutral-900">{note.deliveryNumber}</div>
                      </td>
                      <td className={`${TABLE_BODY_CELL} hidden lg:table-cell`}>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-neutral-400" />
                          <span className="text-sm text-neutral-900">{formatDate(note.deliveryDate)}</span>
                        </div>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <div className="font-medium text-neutral-900">{note.customer.name}</div>
                      </td>
                      <td className={`${TABLE_BODY_CELL} hidden md:table-cell`}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          {note.deliveryType === 'sevk' ? 'Sevk' : 'Tahsilat'}
                        </span>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <span className="font-medium text-neutral-900">{formatCurrency(calculateTotal(note))}</span>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        {renderStatusBadge(note.status)}
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/delivery-notes/${note.id}`)}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="text-neutral-600" size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(note.id)}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="PDF İndir"
                        >
                          <Download className="text-neutral-600" size={16} />
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Convert to Invoice Dialog */}
      {convertDialogOpen && selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary} mb-4`}>
              Faturaya Dönüştür
            </h3>
            <p className="text-neutral-600 mb-4">
              <strong>{selectedNote.deliveryNumber}</strong> numaralı irsaliyeyi faturaya dönüştürmek istediğinizden emin misiniz?
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-600">Müşteri: {selectedNote.customer.name}</p>
              <p className="text-sm text-neutral-600 mt-1">Tutar: {formatCurrency(calculateTotal(selectedNote))}</p>
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
