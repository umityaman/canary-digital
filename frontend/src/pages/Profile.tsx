import { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Users,
  Shield,
  History,
  Save,
  Upload,
  X,
  Edit2,
  CreditCard,
  FileText,
  Image,
  Lock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '../services/api';
import TwoFactorSetup from '../components/TwoFactorSetup';
import BackupCodes from '../components/BackupCodes';

type TabType = 'company' | 'team' | 'permissions' | 'activity' | 'security';

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya'];
const TIMEZONES = ['Europe/Istanbul', 'UTC', 'Europe/London', 'America/New_York'];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  // 2FA States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string>('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [companyData, setCompanyData] = useState({
    logo: '',
    name: '',
    addressLine1: '',
    addressLine2: '',
    country: 'Türkiye',
    city: '',
    district: '',
    postalCode: '',
    mobilePhone: '',
    landlinePhone: '',
    email: '',
    website: '',
    taxNumber: '',
    taxOffice: '',
    tradeRegistryNo: '',
    mersisNo: '',
    iban: '',
    bankName: '',
    bankBranch: '',
    accountHolder: '',
    authorizedPerson: '',
    timezone: 'Europe/Istanbul',
  });

  // Load company data on mount
  useEffect(() => {
    loadCompanyData();
    load2FAStatus();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/company');
      setCompanyData(response.data);
      setOriginalData(response.data);
    } catch (error) {
      console.error('Error loading company data:', error);
      alert('Şirket bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const load2FAStatus = async () => {
    try {
      const response = await api.get('/2fa/status');
      setTwoFactorEnabled(response.data.enabled);
      setTwoFactorMethod(response.data.method || '');
    } catch (error) {
      console.error('Error loading 2FA status:', error);
    }
  };

  const tabs = [
    { id: 'company', label: 'Şirket Profili', icon: Building2 },
    { id: 'team', label: 'Ekip Yönetimi', icon: Users },
    { id: 'permissions', label: 'Yetkilendirme', icon: Shield },
    { id: 'security', label: 'Güvenlik', icon: Lock },
    { id: 'activity', label: 'Aktivite Geçmişi', icon: History },
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/profile/company', companyData);
      setOriginalData(companyData);
      alert('Şirket bilgileri başarıyla kaydedildi!');
      setEditMode(false);
    } catch (error) {
      console.error('Error saving company data:', error);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCompanyData(originalData || companyData);
    setEditMode(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/profile/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCompanyData({ ...companyData, logo: response.data.logoUrl });
      alert('Logo başarıyla yüklendi!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Logo yükleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // 2FA Handlers
  const handle2FASetupSuccess = () => {
    load2FAStatus();
    setShowSetupModal(false);
  };

  const handleDisable2FA = async () => {
    if (!confirm('2FA\'yı devre dışı bırakmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/2fa/disable');
      setTwoFactorEnabled(false);
      setTwoFactorMethod('');
      alert('2FA başarıyla devre dışı bırakıldı');
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      alert(error.response?.data?.error || '2FA devre dışı bırakılamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBackupCodes = async () => {
    try {
      setLoading(true);
      const response = await api.post('/2fa/regenerate-backup-codes');
      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
    } catch (error: any) {
      console.error('Error getting backup codes:', error);
      alert(error.response?.data?.error || 'Yedek kodlar alınamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex space-x-1 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setEditMode(false);
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'company' && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Şirket Profili</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Düzenle</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200"
                    >
                      <X className="w-4 h-4" />
                      <span>İptal</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>Kaydet</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Logo Section */}
              <div className="border-b pb-6">
                <label className="block text-sm font-semibold mb-3">Şirket Logosu</label>
                <div className="flex items-center space-x-4">
                  {companyData.logo ? (
                    <img
                      src={companyData.logo}
                      alt="Company Logo"
                      className="w-24 h-24 object-contain rounded-lg border"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Image className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  {editMode && (
                    <label className="cursor-pointer px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Logo Yükle
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Şirket Ünvanı *</label>
                  <input
                    type="text"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Yetkili Kişi</label>
                  <input
                    type="text"
                    value={companyData.authorizedPerson}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, authorizedPerson: e.target.value })
                    }
                    disabled={!editMode}
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-neutral-700" />
                  Adres Bilgileri
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Adres Satırı 1"
                    value={companyData.addressLine1}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, addressLine1: e.target.value })
                    }
                    disabled={!editMode}
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                  />
                  <input
                    type="text"
                    placeholder="Adres Satırı 2"
                    value={companyData.addressLine2}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, addressLine2: e.target.value })
                    }
                    disabled={!editMode}
                    className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                  />
                  <div className="grid grid-cols-4 gap-4">
                    <select
                      value={companyData.city}
                      onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                      disabled={!editMode}
                      className="px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    >
                      <option value="">Şehir Seçiniz</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="İlçe"
                      value={companyData.district}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, district: e.target.value })
                      }
                      disabled={!editMode}
                      className="px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Posta Kodu"
                      value={companyData.postalCode}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, postalCode: e.target.value })
                      }
                      disabled={!editMode}
                      className="px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                    <input
                      type="text"
                      value="Türkiye"
                      disabled
                      className="px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-neutral-700" />
                  İletişim Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Mobil Telefon</label>
                    <input
                      type="tel"
                      placeholder="+90 5XX XXX XX XX"
                      value={companyData.mobilePhone}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, mobilePhone: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Sabit Hat</label>
                    <input
                      type="tel"
                      placeholder="+90 2XX XXX XX XX"
                      value={companyData.landlinePhone}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, landlinePhone: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">E-mail</label>
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Web Sitesi</label>
                    <input
                      type="url"
                      placeholder="https://"
                      value={companyData.website}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, website: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-neutral-700" />
                  Vergi ve Yasal Bilgiler
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Vergi Numarası</label>
                    <input
                      type="text"
                      value={companyData.taxNumber}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, taxNumber: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Vergi Dairesi</label>
                    <input
                      type="text"
                      value={companyData.taxOffice}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, taxOffice: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ticaret Sicil No</label>
                    <input
                      type="text"
                      value={companyData.tradeRegistryNo}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, tradeRegistryNo: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">MERSİS No</label>
                    <input
                      type="text"
                      value={companyData.mersisNo}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, mersisNo: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-neutral-700" />
                  Banka Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">IBAN</label>
                    <input
                      type="text"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      value={companyData.iban}
                      onChange={(e) => setCompanyData({ ...companyData, iban: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Banka Adı</label>
                    <input
                      type="text"
                      value={companyData.bankName}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, bankName: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Şube</label>
                    <input
                      type="text"
                      value={companyData.bankBranch}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, bankBranch: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Hesap Sahibi</label>
                    <input
                      type="text"
                      value={companyData.accountHolder}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, accountHolder: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Zaman Dilimi</label>
                    <select
                      value={companyData.timezone}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, timezone: e.target.value })
                      }
                      disabled={!editMode}
                      className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Ekip Yönetimi</h2>
              <p className="text-gray-600">Backend API hazırlanıyor...</p>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Yetkilendirme</h2>
              <p className="text-gray-600">Backend API hazırlanıyor...</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* 2FA Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      İki Faktörlü Doğrulama (2FA)
                    </h2>
                    <p className="text-gray-600">
                      Hesabınızın güvenliğini artırmak için ek bir doğrulama katmanı ekleyin
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {twoFactorEnabled ? (
                      <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                        <XCircle className="w-5 h-5" />
                        Pasif
                      </span>
                    )}
                  </div>
                </div>

                {twoFactorEnabled ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-1">
                            2FA Etkin - {twoFactorMethod === 'EMAIL' && 'E-posta ile Doğrulama'}
                            {twoFactorMethod === 'SMS' && 'SMS ile Doğrulama'}
                            {twoFactorMethod === 'TOTP' && 'Doğrulayıcı Uygulama (TOTP)'}
                          </h3>
                          <p className="text-sm text-blue-800">
                            Hesabınız ek bir güvenlik katmanı ile korunuyor. Giriş yaparken
                            {twoFactorMethod === 'EMAIL' && ' e-posta adresinize'}
                            {twoFactorMethod === 'SMS' && ' telefon numaranıza'}
                            {twoFactorMethod === 'TOTP' && ' doğrulayıcı uygulamanızdan'} kod
                            girmeniz gerekecek.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleViewBackupCodes}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        Yedek Kodları Görüntüle
                      </button>
                      <button
                        onClick={handleDisable2FA}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        2FA'yı Devre Dışı Bırak
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-amber-900 mb-1">
                            2FA Etkin Değil
                          </h3>
                          <p className="text-sm text-amber-800">
                            Hesabınızın güvenliğini artırmak için iki faktörlü doğrulamayı
                            etkinleştirmenizi öneririz. Bu, hesabınıza yetkisiz erişimi
                            önlemeye yardımcı olur.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowSetupModal(true)}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      2FA'yı Etkinleştir
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                          <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">E-posta</h4>
                        <p className="text-sm text-gray-600">
                          E-postanıza gönderilen 6 haneli kodu kullanın
                        </p>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">SMS</h4>
                        <p className="text-sm text-gray-600">
                          Telefonunuza gönderilen kodu kullanın
                        </p>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Authenticator</h4>
                        <p className="text-sm text-gray-600">
                          Google Authenticator gibi uygulamalar
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Change Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Şifre Değiştir</h2>
                <p className="text-gray-600 mb-4">
                  Güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz.
                </p>
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
                  Şifreyi Değiştir
                </button>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Aktif Oturumlar</h2>
                <p className="text-gray-600 mb-4">
                  Hesabınıza erişimi olan cihazları görebilir ve yönetebilirsiniz.
                </p>
                <div className="text-sm text-gray-500">Yakında eklenecek...</div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Aktivite Geçmişi</h2>
              <p className="text-gray-600">Backend API hazırlanıyor...</p>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Modals */}
      <TwoFactorSetup
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSuccess={handle2FASetupSuccess}
      />

      <BackupCodes
        isOpen={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        codes={backupCodes}
        onRegenerate={(newCodes) => setBackupCodes(newCodes)}
      />
    </div>
  );
}
