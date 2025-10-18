import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Database,
  Globe,
  Bell,
  Save,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Calendar,
  Clock,
} from 'lucide-react';

interface SecurityLog {
  id: number;
  event: string;
  user: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'danger';
  timestamp: string;
}

interface RolePermission {
  role: string;
  dashboard: boolean;
  products: boolean;
  orders: boolean;
  customers: boolean;
  reports: boolean;
  settings: boolean;
}

const SecuritySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ssl' | 'backup' | 'roles' | 'api' | 'logs'>(
    'ssl'
  );

  const securityLogs: SecurityLog[] = [
    {
      id: 1,
      event: 'Başarılı Giriş',
      user: 'admin@canary.com',
      ipAddress: '192.168.1.45',
      status: 'success',
      timestamp: '15 Eki 2024 14:23',
    },
    {
      id: 2,
      event: 'Başarısız Giriş Denemesi',
      user: 'unknown@test.com',
      ipAddress: '203.45.12.89',
      status: 'danger',
      timestamp: '15 Eki 2024 13:15',
    },
    {
      id: 3,
      event: 'Şifre Değişikliği',
      user: 'test@canary.com',
      ipAddress: '192.168.1.50',
      status: 'warning',
      timestamp: '15 Eki 2024 10:45',
    },
  ];

  const rolePermissions: RolePermission[] = [
    {
      role: 'Yönetici',
      dashboard: true,
      products: true,
      orders: true,
      customers: true,
      reports: true,
      settings: true,
    },
    {
      role: 'Satıcı',
      dashboard: true,
      products: true,
      orders: true,
      customers: true,
      reports: true,
      settings: false,
    },
    {
      role: 'Müşteri',
      dashboard: false,
      products: false,
      orders: true,
      customers: false,
      reports: false,
      settings: false,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-neutral-900" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-neutral-700" />;
      case 'danger':
        return <XCircle size={16} className="text-neutral-500" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-neutral-900 text-white';
      case 'warning':
        return 'bg-neutral-200 text-neutral-700';
      case 'danger':
        return 'bg-neutral-500 text-white';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Shield size={32} className="text-neutral-900" />
              Güvenlik & Sistem Ayarları
            </h1>
            <p className="text-neutral-600 mt-1">
              SSL, yedekleme, erişim kontrolleri ve sistem konfigürasyonu
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Save size={20} />
            Değişiklikleri Kaydet
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">SSL Durumu</span>
              <Lock size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 size={24} className="text-neutral-900" />
              Aktif
            </div>
            <div className="text-xs text-neutral-600 mt-1">Son yenileme: 1 gün önce</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Son Yedek</span>
              <Database size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">2 saat önce</div>
            <div className="text-xs text-neutral-600 mt-1">Otomatik yedekleme aktif</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Aktif Oturumlar</span>
              <Key size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">24</div>
            <div className="text-xs text-neutral-600 mt-1">12 yönetici, 12 müşteri</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">API Çağrıları</span>
              <Globe size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">1.2K</div>
            <div className="text-xs text-neutral-600 mt-1">Son 24 saat</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ssl')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
            activeTab === 'ssl'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          SSL Sertifikası
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Yedekleme
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
            activeTab === 'roles'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Rol İzinleri
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          API Ayarları
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Güvenlik Logları
        </button>
      </div>

      {/* SSL Tab */}
      {activeTab === 'ssl' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Lock size={20} />
              SSL Sertifika Bilgileri
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-neutral-900">Durum</div>
                  <div className="flex items-center gap-2 text-xs text-neutral-700 mt-1">
                    <CheckCircle2 size={14} className="text-neutral-900" />
                    Aktif ve Geçerli
                  </div>
                </div>
                <span className="px-3 py-1 bg-neutral-900 text-white text-xs rounded-full">
                  Aktif
                </span>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="text-sm font-medium text-neutral-900 mb-2">
                  Sertifika Detayları
                </div>
                <div className="space-y-2 text-xs text-neutral-700">
                  <div className="flex justify-between">
                    <span>Alan Adı:</span>
                    <span className="font-medium">canary-rental.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yayıncı:</span>
                    <span className="font-medium">Let's Encrypt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Veriliş Tarihi:</span>
                    <span className="font-medium">14 Eki 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Son Geçerlilik:</span>
                    <span className="font-medium">14 Oca 2025</span>
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium">
                <RefreshCw size={18} />
                Sertifikayı Yenile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Settings size={20} />
              Sistem Ayarları
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dil
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                  <option>Türkçe</option>
                  <option>English</option>
                  <option>Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Para Birimi
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                  <option>TRY (₺)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Saat Dilimi
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                  <option>Europe/Istanbul (UTC+3)</option>
                  <option>Europe/London (UTC+0)</option>
                  <option>America/New_York (UTC-5)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
                  <span className="text-sm text-neutral-700">Otomatik SSL Yenileme</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Database size={20} />
              Yedekleme İşlemleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex flex-col items-center gap-3 p-6 border-2 border-neutral-200 rounded-xl hover:border-neutral-900 hover:bg-neutral-50 transition-all">
                <Download size={32} className="text-neutral-700" />
                <div className="text-center">
                  <div className="font-medium text-neutral-900">Manuel Yedek Al</div>
                  <div className="text-xs text-neutral-600 mt-1">Tüm veritabanını yedekle</div>
                </div>
              </button>

              <button className="flex flex-col items-center gap-3 p-6 border-2 border-neutral-200 rounded-xl hover:border-neutral-900 hover:bg-neutral-50 transition-all">
                <Upload size={32} className="text-neutral-700" />
                <div className="text-center">
                  <div className="font-medium text-neutral-900">Yedekten Geri Yükle</div>
                  <div className="text-xs text-neutral-600 mt-1">Önceki yedeği geri al</div>
                </div>
              </button>

              <button className="flex flex-col items-center gap-3 p-6 border-2 border-neutral-200 rounded-xl hover:border-neutral-900 hover:bg-neutral-50 transition-all">
                <Clock size={32} className="text-neutral-700" />
                <div className="text-center">
                  <div className="font-medium text-neutral-900">Otomatik Yedekleme</div>
                  <div className="text-xs text-neutral-600 mt-1">Programı yapılandır</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Yedekleme Geçmişi</h3>
            <div className="space-y-3">
              {[
                {
                  name: 'backup-2024-10-15-14-30.sql',
                  size: '125 MB',
                  date: '15 Eki 2024 14:30',
                  type: 'Otomatik',
                },
                {
                  name: 'backup-2024-10-15-02-00.sql',
                  size: '124 MB',
                  date: '15 Eki 2024 02:00',
                  type: 'Otomatik',
                },
                {
                  name: 'backup-2024-10-14-18-45.sql',
                  size: '122 MB',
                  date: '14 Eki 2024 18:45',
                  type: 'Manuel',
                },
              ].map((backup, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database size={20} className="text-neutral-700" />
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{backup.name}</div>
                      <div className="text-xs text-neutral-600">
                        {backup.size} • {backup.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-neutral-200 text-neutral-700 text-xs rounded-full">
                      {backup.type}
                    </span>
                    <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                      <Download size={16} className="text-neutral-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">Rol Bazlı Erişim Kontrolü</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Dashboard
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Ürünler
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Siparişler
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Müşteriler
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Raporlar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Ayarlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rolePermissions.map((permission, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{permission.role}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {permission.dashboard ? (
                        <CheckCircle2 size={20} className="inline text-neutral-900" />
                      ) : (
                        <XCircle size={20} className="inline text-neutral-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {permission.products ? (
                        <CheckCircle2 size={20} className="inline text-neutral-900" />
                      ) : (
                        <XCircle size={20} className="inline text-neutral-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {permission.orders ? (
                        <CheckCircle2 size={20} className="inline text-neutral-900" />
                      ) : (
                        <XCircle size={20} className="inline text-neutral-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {permission.customers ? (
                        <CheckCircle2 size={20} className="inline text-neutral-900" />
                      ) : (
                        <XCircle size={20} className="inline text-neutral-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {permission.reports ? (
                        <CheckCircle2 size={20} className="inline text-neutral-900" />
                      ) : (
                        <XCircle size={20} className="inline text-neutral-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {permission.settings ? (
                        <CheckCircle2 size={20} className="inline text-neutral-900" />
                      ) : (
                        <XCircle size={20} className="inline text-neutral-300" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Key size={20} />
              API Anahtarları
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Production API Key', key: 'pk_live_51HXxxx...', created: '01 Oca 2024' },
                { name: 'Test API Key', key: 'pk_test_51HXxxx...', created: '01 Oca 2024' },
              ].map((api, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{api.name}</div>
                    <code className="text-xs text-neutral-600 font-mono">{api.key}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600">Oluşturulma: {api.created}</span>
                    <button className="px-3 py-1 bg-neutral-900 text-white text-xs rounded-lg hover:bg-neutral-800 transition-colors">
                      Yenile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">API Konfigürasyonu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rate Limit (Dakika başı istek)
                </label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  İzin Verilen Domainler (CORS)
                </label>
                <textarea
                  rows={3}
                  defaultValue="https://canary-rental.com&#10;https://app.canary-rental.com"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
                <span className="text-sm text-neutral-700">Webhook Bildirimleri Aktif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">Güvenlik Logları</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Olay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    IP Adresi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                    Zaman
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {log.event}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs font-mono text-neutral-700">{log.ipAddress}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${getStatusBg(
                          log.status
                        )}`}
                      >
                        {getStatusIcon(log.status)}
                        {log.status === 'success' && 'Başarılı'}
                        {log.status === 'warning' && 'Uyarı'}
                        {log.status === 'danger' && 'Tehlike'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-neutral-700">
                        <Calendar size={14} />
                        {log.timestamp}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
