import { useState, useEffect } from 'react';
import {
  FileText, Plus, Eye, Download, Mail, Search, Calendar,
  TrendingUp, DollarSign, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { card, button, input, DESIGN_TOKENS, cx, statCardIcon } from '../../styles/design-tokens';
import { invoiceAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Hardcoded table cell classes
const TABLE_HEADER_CELL = 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50'
const TABLE_BODY_CELL = 'px-6 py-4 text-sm text-neutral-900'

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customer: {
    id: number;
    name: string;
  };
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  status: string;
  type: string;
}

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll();
      if (response.data.success) {
        setInvoices(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Faturalar yüklenirken hata:', err);
      toast.error('Faturalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const renderStatusBadge = (status: string) => {
    const colorMap: { [key: string]: string } = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DRAFT: 'bg-neutral-100 text-neutral-800'
    };

    const labelMap: { [key: string]: string } = {
      PAID: 'Ödendi',
      PENDING: 'Beklemede',
      CANCELLED: 'İptal',
      DRAFT: 'Taslak'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-neutral-100 text-neutral-800'}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || 
      invoice.status === statusFilter;
    
    const matchesType = typeFilter === '' || 
      invoice.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const paidRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingRevenue = filteredInvoices
    .filter(inv => inv.status === 'PENDING')
    .reduce((sum, inv) => sum + (inv.grandTotal - inv.paidAmount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ boxSizing: 'border-box' }}>
        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('primary')}>
              <TrendingUp className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Toplam</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{formatCurrency(totalRevenue)}</h3>
          <p className="text-xs font-medium text-neutral-600">Ciro</p>
        </div>

        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('success')}>
              <DollarSign className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Ödenen</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{formatCurrency(paidRevenue)}</h3>
          <p className="text-xs font-medium text-neutral-600">Tahsilat</p>
        </div>

        <div className={card('sm', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <div className={statCardIcon('warning')}>
              <Clock className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Bekleyen</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">{formatCurrency(pendingRevenue)}</h3>
          <p className="text-xs font-medium text-neutral-600">Alacak</p>
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
                placeholder="Fatura ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cx(input('md', 'default', undefined, 'md'), 'pl-10')}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[150px] max-w-[200px]')}
              style={{ boxSizing: 'border-box' }}
            >
              <option value="">Tüm Tipler</option>
              <option value="SALES">Satış Faturası</option>
              <option value="RENTAL">Kiralama Faturası</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cx(input('md', 'default', undefined, 'md'), 'flex-1 min-w-[130px]')}
            >
              <option value="">Tüm Durumlar</option>
              <option value="PAID">Ödendi</option>
              <option value="PENDING">Beklemede</option>
              <option value="CANCELLED">İptal</option>
              <option value="DRAFT">Taslak</option>
            </select>

            <button
              onClick={() => navigate('/accounting/invoice/new')}
              className={cx(button('md', 'primary', 'md'), 'gap-2 whitespace-nowrap')}
            >
              <Plus size={18} />
              <span>Yeni Fatura</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={card('sm', 'sm', 'default', 'lg')} style={{ overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Yükleniyor...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">
            <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
            <p className="text-lg font-medium">Fatura bulunamadı</p>
            <p className="text-sm mt-2">
              {searchTerm || statusFilter || typeFilter
                ? 'Arama kriterlerinize uygun fatura bulunamadı'
                : 'Yeni fatura ekleyerek başlayın'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto" style={{ maxWidth: '100%', width: '100%' }}>
              <table className="w-full" style={{ tableLayout: 'fixed', width: '100%', maxWidth: '100%' }}>
                <thead>
                  <tr>
                    <th className={TABLE_HEADER_CELL}>Fatura No</th>
                    <th className={`${TABLE_HEADER_CELL} hidden lg:table-cell`}>Tarih</th>
                    <th className={TABLE_HEADER_CELL}>Müşteri</th>
                    <th className={`${TABLE_HEADER_CELL} hidden md:table-cell`}>Vade</th>
                    <th className={TABLE_HEADER_CELL}>Tutar</th>
                    <th className={TABLE_HEADER_CELL}>Durum</th>
                    <th className={TABLE_HEADER_CELL}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                      <td className={TABLE_BODY_CELL}>
                        <div className="font-medium text-neutral-900">{invoice.invoiceNumber}</div>
                      </td>
                      <td className={`${TABLE_BODY_CELL} hidden lg:table-cell`}>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-neutral-400" />
                          <span className="text-sm text-neutral-900">{formatDate(invoice.invoiceDate)}</span>
                        </div>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <div className="font-medium text-neutral-900">{invoice.customer.name}</div>
                      </td>
                      <td className={`${TABLE_BODY_CELL} hidden md:table-cell`}>
                        <span className="text-sm text-neutral-600">{formatDate(invoice.dueDate)}</span>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <span className="font-medium text-neutral-900">{formatCurrency(invoice.grandTotal)}</span>
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        {renderStatusBadge(invoice.status)}
                      </td>
                      <td className={TABLE_BODY_CELL}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <Eye className="text-neutral-600" size={16} />
                          </button>
                          <button
                            onClick={() => toast.info('PDF indirme özelliği yakında...')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="PDF İndir"
                          >
                            <Download className="text-neutral-600" size={16} />
                          </button>
                          <button
                            onClick={() => toast.info('E-posta gönderme özelliği yakında...')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="E-posta Gönder"
                          >
                            <Mail className="text-neutral-600" size={16} />
                          </button>
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
    </div>
  );
}
