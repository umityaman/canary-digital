import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { button, DESIGN_TOKENS } from '../../styles/design-tokens';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface JournalEntryItemForm {
  id?: string;
  accountId: number | null;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

interface JournalEntryFormData {
  entryNumber?: string;
  entryDate: string;
  description: string;
  status: 'DRAFT' | 'POSTED';
  items: JournalEntryItemForm[];
}

interface JournalEntryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: any;
}

export default function JournalEntryFormModal({
  open,
  onClose,
  onSaved,
  initialData,
}: JournalEntryFormModalProps) {
  const [formData, setFormData] = useState<JournalEntryFormData>({
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'DRAFT',
    items: [
      {
        id: crypto.randomUUID(),
        accountId: null,
        accountCode: '',
        accountName: '',
        description: '',
        debitAmount: 0,
        creditAmount: 0,
      },
    ],
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accountSearch, setAccountSearch] = useState<{ [key: string]: string }>({});
  const [showAccountPicker, setShowAccountPicker] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (open) {
      loadAccounts();
      if (initialData) {
        setFormData({
          entryNumber: initialData.entryNumber,
          entryDate: initialData.entryDate.split('T')[0],
          description: initialData.description,
          status: initialData.status,
          items: initialData.items.map((item: any) => ({
            id: crypto.randomUUID(),
            accountId: item.accountId,
            accountCode: item.accountCode,
            accountName: item.accountName,
            description: item.description,
            debitAmount: item.debitAmount,
            creditAmount: item.creditAmount,
          })),
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
      setAccounts(data.data || data);
    } catch (error: any) {
      console.error('Failed to load accounts:', error);
      toast.error('Hesap planı yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: crypto.randomUUID(),
          accountId: null,
          accountCode: '',
          accountName: '',
          description: '',
          debitAmount: 0,
          creditAmount: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (formData.items.length === 1) {
      toast.error('En az bir kayıt olmalıdır');
      return;
    }

    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    });
  };

  const handleItemChange = (
    itemId: string,
    field: keyof JournalEntryItemForm,
    value: any
  ) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleSelectAccount = (itemId: string, account: Account) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              accountId: account.id,
              accountCode: account.code,
              accountName: account.name,
            }
          : item
      ),
    });
    setShowAccountPicker({ ...showAccountPicker, [itemId]: false });
    setAccountSearch({ ...accountSearch, [itemId]: '' });
  };

  const getTotalDebit = () => {
    return formData.items.reduce((sum, item) => sum + (item.debitAmount || 0), 0);
  };

  const getTotalCredit = () => {
    return formData.items.reduce((sum, item) => sum + (item.creditAmount || 0), 0);
  };

  const isBalanced = () => {
    return getTotalDebit() === getTotalCredit() && getTotalDebit() > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.entryDate) {
      toast.error('Tarih gereklidir');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Açıklama gereklidir');
      return;
    }

    if (formData.items.some((item) => !item.accountId)) {
      toast.error('Tüm satırlarda hesap seçilmelidir');
      return;
    }

    if (!isBalanced()) {
      toast.error('Borç ve alacak toplamları eşit olmalıdır');
      return;
    }

    try {
      setSaving(true);

      const url = initialData
        ? `/api/accounting/journal-entries/${initialData.id}`
        : '/api/accounting/journal-entries';

      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          items: formData.items.map((item) => ({
            accountId: item.accountId,
            description: item.description,
            debitAmount: item.debitAmount || 0,
            creditAmount: item.creditAmount || 0,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save journal entry');
      }

      toast.success(
        initialData ? 'Muhasebe fişi güncellendi' : 'Muhasebe fişi oluşturuldu'
      );
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getFilteredAccounts = (itemId: string) => {
    const query = accountSearch[itemId]?.toLowerCase() || '';
    if (!query) return accounts.slice(0, 10); // Show first 10 if no search

    return accounts.filter(
      (acc) =>
        acc.code.toLowerCase().includes(query) ||
        acc.name.toLowerCase().includes(query)
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3
                className={`${DESIGN_TOKENS.typography.heading.h3} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                {initialData ? 'Muhasebe Fişini Düzenle' : 'Yeni Muhasebe Fişi'}
              </h3>
              <p
                className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary} mt-1`}
              >
                Muhasebe kaydı oluşturun (Borç ve Alacak denk olmalı)
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className={`block ${DESIGN_TOKENS.typography.label.md} ${DESIGN_TOKENS.colors.text.primary} mb-2`}
              >
                Tarih <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.entryDate}
                onChange={(e) =>
                  setFormData({ ...formData, entryDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                className={`block ${DESIGN_TOKENS.typography.label.md} ${DESIGN_TOKENS.colors.text.primary} mb-2`}
              >
                Durum
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'DRAFT' | 'POSTED',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DRAFT">Taslak</option>
                <option value="POSTED">Kesinleştir</option>
              </select>
            </div>

            {initialData && (
              <div>
                <label
                  className={`block ${DESIGN_TOKENS.typography.label.md} ${DESIGN_TOKENS.colors.text.primary} mb-2`}
                >
                  Fiş No
                </label>
                <input
                  type="text"
                  value={formData.entryNumber}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            )}
          </div>

          <div>
            <label
              className={`block ${DESIGN_TOKENS.typography.label.md} ${DESIGN_TOKENS.colors.text.primary} mb-2`}
            >
              Genel Açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Muhasebe fişi açıklaması..."
              required
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4
                className={`${DESIGN_TOKENS.typography.heading.h4} ${DESIGN_TOKENS.colors.text.primary}`}
              >
                Kayıt Satırları
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className={button('secondary', 'sm', 'md')}
              >
                <Plus className="w-4 h-4" />
                Satır Ekle
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary}`}
                    >
                      Satır {index + 1}
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    {/* Account Picker */}
                    <div className="md:col-span-2 relative">
                      <label
                        className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
                      >
                        Hesap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={
                            item.accountCode
                              ? `${item.accountCode} - ${item.accountName}`
                              : accountSearch[item.id!] || ''
                          }
                          onChange={(e) => {
                            setAccountSearch({
                              ...accountSearch,
                              [item.id!]: e.target.value,
                            });
                            setShowAccountPicker({
                              ...showAccountPicker,
                              [item.id!]: true,
                            });
                          }}
                          onFocus={() =>
                            setShowAccountPicker({
                              ...showAccountPicker,
                              [item.id!]: true,
                            })
                          }
                          placeholder="Hesap ara..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>

                      {/* Account Dropdown */}
                      {showAccountPicker[item.id!] && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {loading ? (
                            <div className="p-4 text-center text-gray-500">
                              Yükleniyor...
                            </div>
                          ) : getFilteredAccounts(item.id!).length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              Hesap bulunamadı
                            </div>
                          ) : (
                            getFilteredAccounts(item.id!).map((account) => (
                              <button
                                key={account.id}
                                type="button"
                                onClick={() => handleSelectAccount(item.id!, account)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                              >
                                <div className="font-mono text-sm text-gray-700">
                                  {account.code}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {account.name}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label
                        className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
                      >
                        Açıklama
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(item.id!, 'description', e.target.value)
                        }
                        placeholder="Satır açıklaması..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Debit */}
                    <div>
                      <label
                        className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
                      >
                        Borç (₺)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.debitAmount || ''}
                        onChange={(e) => {
                          handleItemChange(
                            item.id!,
                            'debitAmount',
                            parseFloat(e.target.value) || 0
                          );
                          if (parseFloat(e.target.value) > 0) {
                            handleItemChange(item.id!, 'creditAmount', 0);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Credit */}
                    <div>
                      <label
                        className={`block ${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.primary} mb-1`}
                      >
                        Alacak (₺)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.creditAmount || ''}
                        onChange={(e) => {
                          handleItemChange(
                            item.id!,
                            'creditAmount',
                            parseFloat(e.target.value) || 0
                          );
                          if (parseFloat(e.target.value) > 0) {
                            handleItemChange(item.id!, 'debitAmount', 0);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p
                    className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary} mb-1`}
                  >
                    Toplam Borç
                  </p>
                  <p
                    className={`${DESIGN_TOKENS.typography.heading.h4} text-green-600`}
                  >
                    {formatCurrency(getTotalDebit())}
                  </p>
                </div>
                <div>
                  <p
                    className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary} mb-1`}
                  >
                    Toplam Alacak
                  </p>
                  <p className={`${DESIGN_TOKENS.typography.heading.h4} text-red-600`}>
                    {formatCurrency(getTotalCredit())}
                  </p>
                </div>
                <div>
                  <p
                    className={`${DESIGN_TOKENS.typography.label.sm} ${DESIGN_TOKENS.colors.text.tertiary} mb-1`}
                  >
                    Durum
                  </p>
                  {isBalanced() ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Dengede</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Dengesiz</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              disabled={saving || !isBalanced()}
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
