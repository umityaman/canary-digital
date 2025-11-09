import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  User,
  CreditCard,
  Building,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../utils/api';
import toast from 'react-hot-toast';
import { card, button, input, DESIGN_TOKENS, cx } from '../../styles/design-tokens';

interface CompanyData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  mobilePhone: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  tradeRegister: string | null;
  mersisNo: string | null;
  website: string | null;
  logo: string | null;
  authorizedPerson: string | null;
  iban: string | null;
  bankName: string | null;
  bankBranch: string | null;
  accountHolder: string | null;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountType: string;
  iban: string;
  branch: string | null;
  branchCode: string | null;
  balance: number;
  availableBalance: number;
  blockedBalance: number;
  currency: string;
  isActive: boolean;
  lastReconciled: string | null;
  lastStatementDate: string | null;
  autoReconcile: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BankAccountSummary {
  accounts: BankAccount[];
  totals: {
    totalBalance: number;
    totalAvailable: number;
    totalBlocked: number;
    activeAccounts: number;
    totalAccounts: number;
  };
}

const CompanyInfo: React.FC = () => {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyResponse, bankResponse] = await Promise.all([
        apiClient.get('/company').catch(() => ({ data: null })),
        apiClient.get('/company/bank-accounts').catch(() => ({ data: null })),
      ]);
      
      // Set company data or default
      if (companyResponse.data) {
        setCompanyData(companyResponse.data);
      } else {
        console.warn('⚠️ No company data found, showing empty form');
        setCompanyData({
          id: 0,
          name: '',
          email: null,
          phone: null,
          mobilePhone: null,
          address: null,
          address2: null,
          city: null,
          district: null,
          postalCode: null,
          taxNumber: null,
          taxOffice: null,
          tradeRegister: null,
          mersisNo: null,
          website: null,
          logo: null,
          authorizedPerson: null,
          iban: null,
          bankName: null,
          bankBranch: null,
          accountHolder: null,
          timezone: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      // Set bank accounts or default
      if (bankResponse.data) {
        setBankAccounts(bankResponse.data);
      } else {
        setBankAccounts({
          accounts: [],
          totals: {
            totalBalance: 0,
            totalAvailable: 0,
            totalBlocked: 0,
            activeAccounts: 0,
            totalAccounts: 0,
          },
        });
      }
    } catch (error: any) {
      console.error('Error loading company data:', error);
      toast.error('Şirket bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyData) return;

    try {
      setSaving(true);
      const response = await apiClient.put('/company', companyData);
      setCompanyData(response.data);
      setIsEditing(false);
      toast.success('Şirket bilgileri güncellendi');
    } catch (error: any) {
      console.error('Error saving company data:', error);
      toast.error('Şirket bilgileri kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    if (!companyData) return;
    setCompanyData({ ...companyData, [field]: value });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (date: string | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Yükleniyor...</span>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Şirket Bilgileri Yüklenemedi</h3>
        <p className="text-gray-600 mb-4">Veriler yüklenirken bir hata oluştu</p>
        <button
          onClick={loadData}
          className={cx(button('md', 'primary', 'md'), 'gap-2')}
        >
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>Şirket Bilgileri</h2>
            <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>Şirket ve banka hesap bilgilerinizi yönetin</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className={button('md', 'outline', 'md')}
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={cx(button('md', 'primary', 'md'), 'disabled:opacity-50')}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={button('md', 'outline', 'md')}
            >
              Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className={card('md', 'md', 'default', 'md')}>
        <div className="p-6 space-y-6">
          <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold', DESIGN_TOKENS?.colors?.text.primary, 'flex items-center')}>
            <Building2 className="w-5 h-5 mr-2 text-gray-600" />
            Genel Bilgiler
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Şirket Adı *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2 flex items-center')}>
                <Mail className="w-4 h-4 mr-1" />
                E-posta
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={companyData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.email || '-'}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2 flex items-center')}>
                <Phone className="w-4 h-4 mr-1" />
                Telefon
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={companyData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.phone || '-'}</p>
              )}
            </div>

            {/* Mobile Phone */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2 flex items-center')}>
                <Phone className="w-4 h-4 mr-1" />
                Mobil Telefon
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={companyData.mobilePhone || ''}
                  onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.mobilePhone || '-'}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2 flex items-center')}>
                <Globe className="w-4 h-4 mr-1" />
                Web Sitesi
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={companyData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.website || '-'}</p>
              )}
            </div>

            {/* Authorized Person */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2 flex items-center')}>
                <User className="w-4 h-4 mr-1" />
                Yetkili Kişi
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.authorizedPerson || ''}
                  onChange={(e) => handleInputChange('authorizedPerson', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.authorizedPerson || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className={card('md', 'md', 'default', 'md')}>
        <div className="p-6 space-y-6">
          <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold', DESIGN_TOKENS?.colors?.text.primary, 'flex items-center')}>
            <MapPin className="w-5 h-5 mr-2 text-gray-600" />
            Adres Bilgileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="md:col-span-2">
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Adres
              </label>
              {isEditing ? (
                <textarea
                  value={companyData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.address || '-'}</p>
              )}
            </div>

            {/* Address 2 */}
            <div className="md:col-span-2">
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Adres 2
              </label>
              {isEditing ? (
                <textarea
                  value={companyData.address2 || ''}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                  rows={2}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.address2 || '-'}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                İl
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.city || '-'}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                İlçe
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.district || '-'}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Posta Kodu
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.postalCode || ''}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.postalCode || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className={card('md', 'md', 'default', 'md')}>
        <div className="p-6 space-y-6">
          <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold', DESIGN_TOKENS?.colors?.text.primary, 'flex items-center')}>
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Vergi ve Ticari Bilgiler
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Number */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Vergi Numarası
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.taxNumber || ''}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.taxNumber || '-'}</p>
              )}
            </div>

            {/* Tax Office */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Vergi Dairesi
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.taxOffice || ''}
                  onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.taxOffice || '-'}</p>
              )}
            </div>

            {/* Trade Register */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Ticaret Sicil No
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.tradeRegister || ''}
                  onChange={(e) => handleInputChange('tradeRegister', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.tradeRegister || '-'}</p>
              )}
            </div>

            {/* Mersis No */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Mersis No
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.mersisNo || ''}
                  onChange={(e) => handleInputChange('mersisNo', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.mersisNo || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Default Bank Information */}
      <div className={card('md', 'md', 'default', 'md')}>
        <div className="p-6 space-y-6">
          <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold', DESIGN_TOKENS?.colors?.text.primary, 'flex items-center')}>
            <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
            Varsayılan Banka Bilgileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Name */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Banka Adı
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.bankName || ''}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.bankName || '-'}</p>
              )}
            </div>

            {/* Bank Branch */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Şube
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.bankBranch || ''}
                  onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.bankBranch || '-'}</p>
              )}
            </div>

            {/* IBAN */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                IBAN
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.iban || ''}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900 font-mono">{companyData.iban || '-'}</p>
              )}
            </div>

            {/* Account Holder */}
            <div>
              <label className={cx(DESIGN_TOKENS?.typography?.body.sm, 'font-medium', DESIGN_TOKENS?.colors?.text.secondary, 'block mb-2')}>
                Hesap Sahibi
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.accountHolder || ''}
                  onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                  className={input('md', 'default', 'full', 'md')}
                />
              ) : (
                <p className="text-gray-900">{companyData.accountHolder || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Accounts Summary */}
      {bankAccounts && (
        <div className={card('md', 'md', 'default', 'md')}>
          <div className="p-6 space-y-6">
            <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold', DESIGN_TOKENS?.colors?.text.primary, 'flex items-center')}>
              <Building className="w-5 h-5 mr-2 text-gray-600" />
              Banka Hesapları
            </h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Toplam Bakiye</p>
                <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-blue-600`}>
                  {formatCurrency(bankAccounts?.totals?.totalBalance || 0)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Kullanılabilir</p>
                <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-green-600`}>
                  {formatCurrency(bankAccounts?.totals?.totalAvailable || 0)}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Bloke</p>
                <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-orange-600`}>
                  {formatCurrency(bankAccounts.totals.totalBlocked)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Aktif Hesap</p>
                <p className={`${DESIGN_TOKENS?.typography?.stat.md} text-purple-600`}>
                  {bankAccounts.totals.activeAccounts} / {bankAccounts.totals.totalAccounts}
                </p>
              </div>
            </div>

            {/* Bank Accounts Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Banka
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hesap No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      IBAN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bakiye
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bankAccounts.accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{account.bankName}</p>
                          {account.branch && (
                            <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>{account.branch}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{account.accountNumber}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">
                        {account.iban}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(account.balance)}
                          </p>
                          <p className="text-xs text-gray-500">{account.currency}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            account.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {account.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInfo;
