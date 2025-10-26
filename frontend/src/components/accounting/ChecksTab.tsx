import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, FileCheck, AlertCircle, ChevronDown, Download, FileText } from 'lucide-react';
import { checkAPI } from '../../services/api';
import CheckModal from './CheckModal';
import { toast } from 'react-hot-toast';
import { exportChecksToExcel, exportChecksToPDF } from '../../utils/exportUtils';

interface Check {
  id: number;
  checkNumber: string;
  serialNumber?: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  type: 'received' | 'issued';
  status: 'portfolio' | 'deposited' | 'bounced' | 'cashed' | 'endorsed';
  drawerName: string;
  drawerTaxNumber?: string;
  payeeName?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
  location?: string;
  endorsedTo?: string;
  endorsedDate?: string;
  depositedDate?: string;
  cashedDate?: string;
  bouncedDate?: string;
  bouncedReason?: string;
  notes?: string;
  customer?: { id: number; name: string };
  supplier?: { id: number; name: string };
  invoice?: { id: number; invoiceNumber: string };
}

interface CheckStats {
  receivedChecks: { amount: number; count: number };
  issuedChecks: { amount: number; count: number };
  portfolioCount: number;
  dueSoonCount: number;
  overdueCount: number;
}

const ChecksTab: React.FC = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [stats, setStats] = useState<CheckStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<Check | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'received' | 'issued'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'portfolio' | 'deposited' | 'bounced' | 'cashed' | 'endorsed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadChecks();
    loadStats();
  }, [typeFilter, statusFilter, searchQuery]);

  const loadChecks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await checkAPI.getAll(params);
      setChecks(response.data.checks || []);
    } catch (error: any) {
      toast.error('Çekler yüklenirken hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await checkAPI.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('Stats yükleme hatası:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu çeki silmek istediğinize emin misiniz?')) return;

    try {
      await checkAPI.delete(id);
      toast.success('Çek silindi');
      loadChecks();
      loadStats();
    } catch (error: any) {
      toast.error('Silme hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEndorse = async (check: Check) => {
    const endorsedTo = window.prompt('Çek kime ciro edilecek?');
    if (!endorsedTo) return;

    try {
      await checkAPI.endorse(check.id, endorsedTo);
      toast.success('Çek ciro edildi');
      loadChecks();
      loadStats();
    } catch (error: any) {
      toast.error('Ciro hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeposit = async (check: Check) => {
    if (!window.confirm('Çek bankaya yatırılacak. Onaylıyor musunuz?')) return;

    try {
      await checkAPI.deposit(check.id);
      toast.success('Çek bankaya yatırıldı');
      loadChecks();
      loadStats();
    } catch (error: any) {
      toast.error('Yatırma hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCash = async (check: Check) => {
    if (!window.confirm('Çek tahsil edildi olarak işaretlenecek. Onaylıyor musunuz?')) return;

    try {
      await checkAPI.cash(check.id);
      toast.success('Çek tahsil edildi');
      loadChecks();
      loadStats();
    } catch (error: any) {
      toast.error('Tahsil hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBounce = async (check: Check) => {
    const bouncedReason = window.prompt('Karşılıksız çıkma nedeni (opsiyonel):');
    if (bouncedReason === null) return; // Cancel clicked

    try {
      await checkAPI.bounce(check.id, bouncedReason || undefined);
      toast.success('Çek karşılıksız olarak işaretlendi');
      loadChecks();
      loadStats();
    } catch (error: any) {
      toast.error('İşlem hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      portfolio: { label: 'Portföy', color: 'bg-blue-100 text-blue-800' },
      deposited: { label: 'Bankada', color: 'bg-purple-100 text-purple-800' },
      bounced: { label: 'Karşılıksız', color: 'bg-red-100 text-red-800' },
      cashed: { label: 'Tahsil Edildi', color: 'bg-green-100 text-green-800' },
      endorsed: { label: 'Ciroda', color: 'bg-yellow-100 text-yellow-800' },
    };

    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'received' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Alınan
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Verilen
      </span>
    );
  };

  const getDueDateColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 font-bold'; // Overdue
    if (diffDays <= 7) return 'text-yellow-600 font-semibold'; // Due soon
    return 'text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alınan Çekler</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.receivedChecks.amount)}
                </p>
                <p className="text-xs text-gray-500">{stats.receivedChecks.count} adet</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verilen Çekler</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.issuedChecks.amount)}
                </p>
                <p className="text-xs text-gray-500">{stats.issuedChecks.count} adet</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portföyde</p>
                <p className="text-2xl font-bold text-blue-600">{stats.portfolioCount}</p>
                <p className="text-xs text-gray-500">adet çek</p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yakın Vadeli</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.dueSoonCount}</p>
                <p className="text-xs text-gray-500">30 gün içinde</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vadesi Geçmiş</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
                <p className="text-xs text-gray-500">adet çek</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Tipler</option>
                <option value="received">Alınan Çekler</option>
                <option value="issued">Verilen Çekler</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="portfolio">Portföy</option>
                <option value="deposited">Bankada</option>
                <option value="bounced">Karşılıksız</option>
                <option value="cashed">Tahsil Edildi</option>
                <option value="endorsed">Ciroda</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Çek no, keşideci veya banka ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {/* Export Buttons */}
            {checks.length > 0 && (
              <>
                <button
                  onClick={() => exportChecksToExcel(checks)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  title="Excel'e Aktar"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => exportChecksToPDF(checks)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  title="PDF'e Aktar"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
              </>
            )}
            <button
              onClick={() => {
                setEditingCheck(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Çek
            </button>
          </div>
        </div>
      </div>

      {/* Checks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : checks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Çek bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Çek No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keşideci/Lehtar</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banka</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {checks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {check.checkNumber}
                      {check.serialNumber && (
                        <div className="text-xs text-gray-500">Seri: {check.serialNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{getTypeBadge(check.type)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(check.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{check.drawerName}</div>
                      {check.payeeName && (
                        <div className="text-xs text-gray-500">Lehtar: {check.payeeName}</div>
                      )}
                      {check.customer && (
                        <div className="text-xs text-blue-600">Müşteri: {check.customer.name}</div>
                      )}
                      {check.supplier && (
                        <div className="text-xs text-purple-600">Tedarikçi: {check.supplier.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {formatCurrency(check.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className={getDueDateColor(check.dueDate)}>
                        {formatDate(check.dueDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {check.bankName && (
                        <div>
                          <div>{check.bankName}</div>
                          {check.bankBranch && (
                            <div className="text-xs text-gray-500">{check.bankBranch}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{check.location || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCheck(check);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(check.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* Business Operations */}
                        {check.status === 'portfolio' && (
                          <>
                            <button
                              onClick={() => handleEndorse(check)}
                              className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 border border-purple-300 rounded"
                              title="Ciro Et"
                            >
                              Ciro
                            </button>
                            {check.type === 'received' && (
                              <>
                                <button
                                  onClick={() => handleDeposit(check)}
                                  className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded"
                                  title="Bankaya Yatır"
                                >
                                  Yatır
                                </button>
                                <button
                                  onClick={() => handleCash(check)}
                                  className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded"
                                  title="Tahsil Et"
                                >
                                  Tahsil
                                </button>
                                <button
                                  onClick={() => handleBounce(check)}
                                  className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded"
                                  title="Karşılıksız"
                                >
                                  Karşılıksız
                                </button>
                              </>
                            )}
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

      {/* Check Modal */}
      {isModalOpen && (
        <CheckModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCheck(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingCheck(null);
            loadChecks();
            loadStats();
          }}
          editingCheck={editingCheck}
        />
      )}
    </div>
  );
};

export default ChecksTab;
