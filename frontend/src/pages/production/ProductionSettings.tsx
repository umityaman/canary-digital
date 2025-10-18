import React from 'react';
import { Settings as SettingsIcon, Save, Bell, Lock, Globe, DollarSign, Calendar } from 'lucide-react';

const ProductionSettings: React.FC = () => {
  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <SettingsIcon size={32} className="text-neutral-900" />
              Prodüksiyon Ayarları
            </h1>
            <p className="text-neutral-600 mt-1">Modül ayarları ve yapılandırma</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Save size={20} />
            Kaydet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <SettingsIcon size={20} />
            Genel Ayarlar
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Varsayılan Proje Tipi
              </label>
              <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                <option>Reklam Filmi</option>
                <option>Uzun Metraj</option>
                <option>Dizi</option>
                <option>Müzik Videosu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Çalışma Saati Başlangıcı
              </label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Günlük Çalışma Süresi
              </label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
              <span className="text-sm text-neutral-700">Otomatik çekim planı oluştur</span>
            </div>
          </div>
        </div>

        {/* Budget Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Bütçe Ayarları
          </h3>
          <div className="space-y-4">
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
                Varsayılan Bütçe Limiti
              </label>
              <input
                type="number"
                defaultValue="250000"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bütçe Aşım Uyarı Eşiği (%)
              </label>
              <input
                type="number"
                defaultValue="90"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
              <span className="text-sm text-neutral-700">Bütçe aşımında bildirim gönder</span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Bell size={20} />
            Bildirim Ayarları
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Yeni proje oluşturulduğunda</span>
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Çekim günü yaklaşınca</span>
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Görev tamamlandığında</span>
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Bütçe aşıldığında</span>
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Yeni mesaj geldiğinde</span>
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Ekip üyesi atandığında</span>
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Lock size={20} />
            Gelişmiş Ayarlar
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Zaman Dilimi
              </label>
              <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                <option>Europe/Istanbul (UTC+3)</option>
                <option>Europe/London (UTC+0)</option>
                <option>America/New_York (UTC-5)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tarih Formatı
              </label>
              <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

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

            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-neutral-300" />
              <span className="text-sm text-neutral-700">Otomatik yedekleme aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionSettings;
