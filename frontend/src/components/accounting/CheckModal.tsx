import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { checkAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

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
  notes?: string;
}

interface CheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCheck: Check | null;
}

const CheckModal: React.FC<CheckModalProps> = ({ isOpen, onClose, onSuccess, editingCheck }) => {
  const [formData, setFormData] = useState({
    checkNumber: '',
    serialNumber: '',
    amount: '',
    currency: 'TRY',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    type: 'received' as 'received' | 'issued',
    status: 'portfolio' as 'portfolio' | 'deposited' | 'bounced' | 'cashed' | 'endorsed',
    drawerName: '',
    drawerTaxNumber: '',
    payeeName: '',
    bankName: '',
    bankBranch: '',
    bankAccount: '',
    location: 'Portföy',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCheck) {
      setFormData({
        checkNumber: editingCheck.checkNumber,
        serialNumber: editingCheck.serialNumber || '',
        amount: editingCheck.amount.toString(),
        currency: editingCheck.currency,
        issueDate: editingCheck.issueDate.split('T')[0],
        dueDate: editingCheck.dueDate.split('T')[0],
        type: editingCheck.type,
        status: editingCheck.status,
        drawerName: editingCheck.drawerName,
        drawerTaxNumber: editingCheck.drawerTaxNumber || '',
        payeeName: editingCheck.payeeName || '',
        bankName: editingCheck.bankName || '',
        bankBranch: editingCheck.bankBranch || '',
        bankAccount: editingCheck.bankAccount || '',
        location: editingCheck.location || 'Portföy',
        notes: editingCheck.notes || '',
      });
    } else {
      // Reset form for new check
      setFormData({
        checkNumber: '',
        serialNumber: '',
        amount: '',
        currency: 'TRY',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        type: 'received',
        status: 'portfolio',
        drawerName: '',
        drawerTaxNumber: '',
        payeeName: '',
        bankName: '',
        bankBranch: '',
        bankAccount: '',
        location: 'Portföy',
        notes: '',
      });
    }
  }, [editingCheck]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.checkNumber.trim()) {
      toast.error('Çek numarası zorunludur');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Geçerli bir tutar giriniz');
      return;
    }
    if (!formData.drawerName.trim()) {
      toast.error('Keşideci adı zorunludur');
      return;
    }
    if (new Date(formData.dueDate) < new Date(formData.issueDate)) {
      toast.error('Vade tarihi düzenleme tarihinden önce olamaz');
      return;
    }

    try {
      setLoading(true);

      const data = {
        checkNumber: formData.checkNumber,
        serialNumber: formData.serialNumber || undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        type: formData.type,
        status: formData.status,
        drawerName: formData.drawerName,
        drawerTaxNumber: formData.drawerTaxNumber || undefined,
        payeeName: formData.payeeName || undefined,
        bankName: formData.bankName || undefined,
        bankBranch: formData.bankBranch || undefined,
        bankAccount: formData.bankAccount || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      };

      if (editingCheck) {
        await checkAPI.update(editingCheck.id, data);
        toast.success('Çek güncellendi');
      } else {
        await checkAPI.create(data);
        toast.success('Çek oluşturuldu');
      }

      onSuccess();
    } catch (error: any) {
      toast.error('Hata: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingCheck ? 'Çek Düzenle' : 'Yeni Çek'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Check Number and Serial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çek Numarası <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.checkNumber}
                onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seri Numarası
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tutar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para Birimi
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="received">Alınan Çek</option>
                <option value="issued">Verilen Çek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="portfolio">Portföy</option>
                <option value="deposited">Bankada</option>
                <option value="bounced">Karşılıksız</option>
                <option value="cashed">Tahsil Edildi</option>
                <option value="endorsed">Ciroda</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Düzenleme Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vade Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Drawer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keşideci <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.drawerName}
                onChange={(e) => setFormData({ ...formData, drawerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keşideci Vergi No
              </label>
              <input
                type="text"
                value={formData.drawerTaxNumber}
                onChange={(e) => setFormData({ ...formData, drawerTaxNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lehtar
            </label>
            <input
              type="text"
              value={formData.payeeName}
              onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bank Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banka
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şube
              </label>
              <input
                type="text"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hesap No
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konum
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Portföy">Portföy</option>
              <option value="Bankada">Bankada</option>
              <option value="Ciroda">Ciroda</option>
              <option value="Tahsil Edildi">Tahsil Edildi</option>
              <option value="İade">İade</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Kaydediliyor...' : editingCheck ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckModal;
