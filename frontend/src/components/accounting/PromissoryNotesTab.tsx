import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, FileCheck, AlertCircle, ChevronDown } from 'lucide-react';
import { promissoryNoteAPI } from '../../services/api';
import PromissoryNoteModal from './PromissoryNoteModal';
import { toast } from 'react-hot-toast';

interface PromissoryNote {
  id: number;
  noteNumber: string;
  serialNumber?: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  type: 'receivable' | 'payable';
  status: 'portfolio' | 'collected' | 'defaulted' | 'endorsed';
  drawerName: string;
  drawerTaxNumber?: string;
  payeeName?: string;
  guarantorName?: string;
  guarantorTaxNo?: string;
  location?: string;
  endorsedTo?: string;
  endorsedDate?: string;
  collectedDate?: string;
  defaultedDate?: string;
  defaultReason?: string;
  notes?: string;
  customer?: { id: number; name: string };
  supplier?: { id: number; name: string };
  invoice?: { id: number; invoiceNumber: string };
}

interface PromissoryNoteStats {
  receivableNotes: { amount: number; count: number };
  payableNotes: { amount: number; count: number };
  portfolioCount: number;
  dueSoonCount: number;
  overdueCount: number;
}

const PromissoryNotesTab: React.FC = () => {
  const [notes, setNotes] = useState<PromissoryNote[]>([]);
  const [stats, setStats] = useState<PromissoryNoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PromissoryNote | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'receivable' | 'payable'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'portfolio' | 'collected' | 'defaulted' | 'endorsed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
    loadStats();
  }, [typeFilter, statusFilter, searchQuery]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await promissoryNoteAPI.getAll(params);
      setNotes(response.data.notes || []);
    } catch (error: any) {
      toast.error('Senetler yüklenirken hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await promissoryNoteAPI.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('Stats yükleme hatası:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu senedi silmek istediğinize emin misiniz?')) return;

    try {
      await promissoryNoteAPI.delete(id);
      toast.success('Senet silindi');
      loadNotes();
      loadStats();
    } catch (error: any) {
      toast.error('Silme hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEndorse = async (note: PromissoryNote) => {
    const endorsedTo = window.prompt('Senet kime ciro edilecek?');
    if (!endorsedTo) return;

    try {
      await promissoryNoteAPI.endorse(note.id, endorsedTo);
      toast.success('Senet ciro edildi');
      loadNotes();
      loadStats();
    } catch (error: any) {
      toast.error('Ciro hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCollect = async (note: PromissoryNote) => {
    if (!window.confirm('Senet tahsil edildi olarak işaretlenecek. Onaylıyor musunuz?')) return;

    try {
      await promissoryNoteAPI.collect(note.id);
      toast.success('Senet tahsil edildi');
      loadNotes();
      loadStats();
    } catch (error: any) {
      toast.error('Tahsil hatası: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDefault = async (note: PromissoryNote) => {
    const defaultReason = window.prompt('Protestolu çıkma nedeni (opsiyonel):');
    if (defaultReason === null) return; // Cancel clicked

    try {
      await promissoryNoteAPI.default(note.id, defaultReason || undefined);
      toast.success('Senet protestolu olarak işaretlendi');
      loadNotes();
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
      collected: { label: 'Tahsil Edildi', color: 'bg-green-100 text-green-800' },
      defaulted: { label: 'Protestolu', color: 'bg-red-100 text-red-800' },
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
    return type === 'receivable' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Alacak
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Borç
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
                <p className="text-sm text-gray-600">Alacak Senetleri</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.receivableNotes.amount)}
                </p>
                <p className="text-xs text-gray-500">{stats.receivableNotes.count} adet</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Borç Senetleri</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.payableNotes.amount)}
                </p>
                <p className="text-xs text-gray-500">{stats.payableNotes.count} adet</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portföyde</p>
                <p className="text-2xl font-bold text-blue-600">{stats.portfolioCount}</p>
                <p className="text-xs text-gray-500">adet senet</p>
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
                <p className="text-xs text-gray-500">adet senet</p>
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
                <option value="receivable">Alacak Senetleri</option>
                <option value="payable">Borç Senetleri</option>
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
                <option value="collected">Tahsil Edildi</option>
                <option value="defaulted">Protestolu</option>
                <option value="endorsed">Ciroda</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Senet no, borçlu veya kefil ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Senet
          </button>
        </div>
      </div>

      {/* Notes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Senet bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Senet No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borçlu/Alacaklı</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kefil</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {note.noteNumber}
                      {note.serialNumber && (
                        <div className="text-xs text-gray-500">Seri: {note.serialNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{getTypeBadge(note.type)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(note.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{note.drawerName}</div>
                      {note.payeeName && (
                        <div className="text-xs text-gray-500">Alacaklı: {note.payeeName}</div>
                      )}
                      {note.customer && (
                        <div className="text-xs text-blue-600">Müşteri: {note.customer.name}</div>
                      )}
                      {note.supplier && (
                        <div className="text-xs text-purple-600">Tedarikçi: {note.supplier.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {formatCurrency(note.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className={getDueDateColor(note.dueDate)}>
                        {formatDate(note.dueDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {note.guarantorName && (
                        <div>
                          <div>{note.guarantorName}</div>
                          {note.guarantorTaxNo && (
                            <div className="text-xs text-gray-500">VKN: {note.guarantorTaxNo}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{note.location || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingNote(note);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* Business Operations */}
                        {note.status === 'portfolio' && (
                          <>
                            <button
                              onClick={() => handleEndorse(note)}
                              className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 border border-purple-300 rounded"
                              title="Ciro Et"
                            >
                              Ciro
                            </button>
                            {note.type === 'receivable' && (
                              <>
                                <button
                                  onClick={() => handleCollect(note)}
                                  className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded"
                                  title="Tahsil Et"
                                >
                                  Tahsil
                                </button>
                                <button
                                  onClick={() => handleDefault(note)}
                                  className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded"
                                  title="Protestolu"
                                >
                                  Protestolu
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

      {/* Promissory Note Modal */}
      {isModalOpen && (
        <PromissoryNoteModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNote(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingNote(null);
            loadNotes();
            loadStats();
          }}
          editingNote={editingNote}
        />
      )}
    </div>
  );
};

export default PromissoryNotesTab;
