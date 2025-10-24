import { useState } from 'react';
import { Wrench, QrCode, Tag, Calculator, FileText, DollarSign, Settings, Zap, Database, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Tab = 'productivity' | 'automation' | 'integrations' | 'settings';

export default function Tools(){
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('productivity');

  const tabs = [
    { id: 'productivity' as const, label: 'Verimlilik Araçları', icon: <Wrench size={18} />, description: 'Günlük işler için araçlar' },
    { id: 'automation' as const, label: 'Otomasyon', icon: <Zap size={18} />, description: 'İş süreçlerini otomatikleştir' },
    { id: 'integrations' as const, label: 'Entegrasyonlar', icon: <Globe size={18} />, description: 'Harici servisler' },
    { id: 'settings' as const, label: 'Sistem Ayarları', icon: <Settings size={18} />, description: 'Genel ayarlar' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Wrench className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Aktif</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">12</h3>
          <p className="text-sm text-neutral-600">Araç</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Zap className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Otomasyon</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">8</h3>
          <p className="text-sm text-neutral-600">İş Akışı</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Globe className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Bağlı</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">5</h3>
          <p className="text-sm text-neutral-600">Entegrasyon</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Database className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Son Yedek</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">1s</h3>
          <p className="text-sm text-neutral-600">Önce</p>
        </div>
      </div>

      {/* Tab Navigation + Content */}
      <div className="flex gap-6">
        {/* Vertical Sidebar */}
        <nav className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p
                  className={`text-xs ml-7 ${
                    activeTab === tab.id ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {tab.description}
                </p>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'productivity' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Verimlilik Araçları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => navigate('/pricing')}
                  className="border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-all cursor-pointer"
                >
                  <DollarSign size={32} className="mx-auto text-neutral-700 mb-3" />
                  <h3 className="font-semibold text-neutral-900 mb-2">Akıllı Fiyatlandırma</h3>
                  <p className="text-sm text-neutral-600 mb-4">Dinamik fiyat önerileri ve analiz</p>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Aç</button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
                  <QrCode size={32} className="mx-auto text-neutral-700 mb-3" />
                  <h3 className="font-semibold text-neutral-900 mb-2">QR Kod Oluşturucu</h3>
                  <p className="text-sm text-neutral-600 mb-4">Ekipmanlar için QR kod oluşturun</p>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Oluştur</button>
                </div>
                
                <div className="border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
                  <Tag size={32} className="mx-auto text-neutral-700 mb-3" />
                  <h3 className="font-semibold text-neutral-900 mb-2">Etiket Yazıcı</h3>
                  <p className="text-sm text-neutral-600 mb-4">Ekipman etiketleri yazdırın</p>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Yazdır</button>
                </div>
                
                <div className="border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
                  <FileText size={32} className="mx-auto text-neutral-700 mb-3" />
                  <h3 className="font-semibold text-neutral-900 mb-2">Rapor Oluşturucu</h3>
                  <p className="text-sm text-neutral-600 mb-4">Özel raporlar oluşturun</p>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Oluştur</button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
                  <Calculator size={32} className="mx-auto text-neutral-700 mb-3" />
                  <h3 className="font-semibold text-neutral-900 mb-2">Hesap Makinesi</h3>
                  <p className="text-sm text-neutral-600 mb-4">Gelir-gider hesaplamaları</p>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Hesapla</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Otomasyon Araçları</h2>
              <div className="space-y-4">
                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="text-green-700" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">Otomatik Fatura Oluşturma</h3>
                        <p className="text-sm text-neutral-600">Siparişler için otomatik fatura</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Zap className="text-blue-700" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">Stok Uyarıları</h3>
                        <p className="text-sm text-neutral-600">Düşük stok bildirimleri</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="text-purple-700" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">Bakım Hatırlatıcıları</h3>
                        <p className="text-sm text-neutral-600">Periyodik bakım bildirimleri</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Zap className="text-orange-700" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">Otomatik Yedekleme</h3>
                        <p className="text-sm text-neutral-600">Günlük veri yedekleme</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Entegrasyonlar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Google Workspace</h3>
                      <p className="text-sm text-green-600">Bağlı</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors">
                    Ayarları Düzenle
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Slack</h3>
                      <p className="text-sm text-green-600">Bağlı</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors">
                    Ayarları Düzenle
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                      W
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">WhatsApp Business</h3>
                      <p className="text-sm text-neutral-600">Bağlı Değil</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                    Bağlan
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
                      Z
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Zoom</h3>
                      <p className="text-sm text-neutral-600">Bağlı Değil</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                    Bağlan
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Sistem Ayarları</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Yedekleme</h3>
                  <div className="border border-neutral-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-neutral-900">Otomatik Yedekleme</p>
                        <p className="text-sm text-neutral-600">Günlük otomatik veri yedekleme</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                      </label>
                    </div>
                    <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                      Şimdi Yedekle
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Güvenlik</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                      <div>
                        <span className="font-medium text-neutral-900">İki Faktörlü Kimlik Doğrulama</span>
                        <p className="text-sm text-neutral-600">Ek güvenlik katmanı</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50">
                      <div>
                        <span className="font-medium text-neutral-900">Oturum Zaman Aşımı</span>
                        <p className="text-sm text-neutral-600">15 dakika sonra otomatik çıkış</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}