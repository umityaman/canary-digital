import React, { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { button, DESIGN_TOKENS } from '../../styles/design-tokens';

interface AccountFormData {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId: number | null;
  isActive: boolean;
  description?: string;
}

interface ChartOfAccount {
  id: number;
  code: string;
  name: string;
  type: string;
  parentId: number | null;
}

interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: any;
}

export default function AccountFormModal({
  open,
  onClose,
  onSaved,
  initialData,
}: AccountFormModalProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    code: '',
    name: '',
    type: 'ASSET',
    parentId: null,
    isActive: true,
    description: '',
  });

  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const [showParentPicker, setShowParentPicker] = useState(false);

  useEffect(() => {
    if (open) {
      loadAccounts();
      if (initialData) {
        setFormData({
          code: initialData.code,
          name: initialData.name,
          type: initialData.type,
          parentId: initialData.parentId,
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          description: initialData.description || '',
        });
      } else {
        // Reset form for new account
        setFormData({
          code: '',
          name: '',
          type: 'ASSET',
          parentId: null,
          isActive: true,
          description: '',
        });
      }
    }
  }, [open, initialData]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/accounting/chart-of-accounts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load accounts');

      const data = await response.json();
      // Filter out current account (if editing) to prevent circular parent reference
      const filteredAccounts = initialData
        ? (data.data || data).filter((acc: ChartOfAccount) => acc.id !== initialData.id)
        : data.data || data;
      setAccounts(filteredAccounts);
    } catch (error: any) {
      console.error('Failed to load accounts:', error);
      toast.error('Hesaplar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast.error('Hesap kodu gereklidir');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Hesap adı gereklidir');
      return;
    }

    // Validate code format (optional - Turkish accounting standard: XXX.XX.XX)
    if (!/^\d{3}(\.\d{2}(\.\d{2})?)?$/.test(formData.code)) {
      toast.error('Hesap kodu formatı: 100 veya 100.01 veya 100.01.01');
      return;
    }

    try {
      setSaving(true);

      const url = initialData
        ? `/api/accounting/chart-of-accounts/${initialData.id}`
        : '/api/accounting/chart-of-accounts';

      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save account');
      }

      toast.success(initialData ? 'Hesap güncellendi' : 'Hesap oluşturuldu');
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectParent = (account: ChartOfAccount) => {
    setFormData({ ...formData, parentId: account.id });
    setShowParentPicker(false);
    setParentSearch('');
  };

  const getParentAccountDisplay = () => {
    if (!formData.parentId) return 'Ana Hesap (Üst hesap yok)';
    const parent = accounts.find((a) => a.id === formData.parentId);
    return parent ? `${parent.code} - ${parent.name}` : 'Seçilmedi';
  };

  const getFilteredParentAccounts = () => {
    const query = parentSearch.toLowerCase();
    if (!query) return accounts.slice(0, 10);

    return accounts.filter(
      (acc) =>
        acc.code.toLowerCase().includes(query) ||
        acc.name.toLowerCase().includes(query)
    );
  };

  const getAccountTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      ASSET: 'Varlık (Aktif)',
      LIABILITY: 'Borç (Pasif)',
      EQUITY: 'Özkaynak (Sermaye)',
      REVENUE: 'Gelir',
      EXPENSE: 'Gider',
    };
    return typeMap[type] || type;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3
                className={`${DESIGN_TOKENS?.typography?.heading.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}
              >
                {initialData ? 'Hesap Düzenle' : 'Yeni Hesap Ekle'}
              </h3>
              <p
                className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}
              >
                Muhasebe hesap planına hesap ekleyin veya düzenleyin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}
              >
                Hesap Kodu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Örn: 100 veya 100.01 veya 100.01.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 3 basamak (100) veya 100.01 veya 100.01.01
              </p>
            </div>

            <div>
              <label
                className={`block ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}
              >
                Hesap Tipi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as AccountFormData['type'],
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="ASSET">{getAccountTypeLabel('ASSET')}</option>
                <option value="LIABILITY">{getAccountTypeLabel('LIABILITY')}</option>
                <option value="EQUITY">{getAccountTypeLabel('EQUITY')}</option>
                <option value="REVENUE">{getAccountTypeLabel('REVENUE')}</option>
                <option value="EXPENSE">{getAccountTypeLabel('EXPENSE')}</option>
              </select>
            </div>
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}
            >
              Hesap Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Kasa, Banka, Müşteriler"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Parent Account Picker */}
          <div className="relative">
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}
            >
              Üst Hesap (Parent Account)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.parentId ? getParentAccountDisplay() : parentSearch}
                onChange={(e) => {
                  setParentSearch(e.target.value);
                  if (formData.parentId) setFormData({ ...formData, parentId: null });
                  setShowParentPicker(true);
                }}
                onFocus={() => setShowParentPicker(true)}
                placeholder="Üst hesap ara veya boş bırak (ana hesap)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {formData.parentId && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, parentId: null })}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                Üst hesabı kaldır (ana hesap yap)
              </button>
            )}

            {/* Parent Account Dropdown */}
            {showParentPicker && !formData.parentId && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, parentId: null });
                    setShowParentPicker(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors border-b"
                >
                  <div className="font-medium text-gray-700">Ana Hesap (Üst hesap yok)</div>
                  <div className="text-sm text-gray-500">En üst seviyede hesap oluştur</div>
                </button>

                {loading ? (
                  <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
                ) : getFilteredParentAccounts().length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Hesap bulunamadı</div>
                ) : (
                  getFilteredParentAccounts().map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleSelectParent(account)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-mono text-sm text-gray-700">{account.code}</div>
                      <div className="text-sm text-gray-600">{account.name}</div>
                    </button>
                  ))
                )}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Alt hesap oluşturmak için bir üst hesap seçin. Boş bırakırsanız ana hesap
              olur.
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              className={`block ${DESIGN_TOKENS?.typography?.label.md} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}
            >
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Hesap hakkında ek bilgi..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className={`${DESIGN_TOKENS?.typography?.body.md} ${DESIGN_TOKENS?.colors?.text.primary} cursor-pointer`}
            >
              Hesap Aktif
            </label>
            <span className="text-sm text-gray-500">
              (Pasif hesaplar yeni işlemlerde kullanılamaz)
            </span>
          </div>

          {/* Helpful Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Hesap Planı Hiyerarşisi</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>1xx:</strong> Varlık Hesapları (Dönen/Duran Varlıklar)</li>
              <li>• <strong>2xx:</strong> Borç Hesapları (Kısa/Uzun Vadeli Yükümlülükler)</li>
              <li>• <strong>3xx:</strong> Özkaynak Hesapları (Sermaye, Yedekler)</li>
              <li>• <strong>6xx:</strong> Gelir Hesapları (Satış, Faiz Gelirleri)</li>
              <li>• <strong>7xx:</strong> Gider Hesapları (Maliyet, İşletme Giderleri)</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className={button('secondary', 'md', 'md')}
              disabled={saving}
            >
              İptal
            </button>
            <button
              type="submit"
              className={button('primary', 'md', 'md')}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
