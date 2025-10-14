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
} from 'lucide-react';
import api from '../services/api';

type TabType = 'company' | 'team' | 'permissions' | 'activity';

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya'];
const TIMEZONES = ['Europe/Istanbul', 'UTC', 'Europe/London', 'America/New_York'];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

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

  const tabs = [
    { id: 'company', label: 'Şirket Profili', icon: Building2 },
    { id: 'team', label: 'Ekip Yönetimi', icon: Users },
    { id: 'permissions', label: 'Yetkilendirme', icon: Shield },
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

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Aktivite Geçmişi</h2>
              <p className="text-gray-600">Backend API hazırlanıyor...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
