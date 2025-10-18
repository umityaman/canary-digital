import React from 'react';
import { Globe, CheckCircle2, XCircle, Settings as SettingsIcon, Link as LinkIcon } from 'lucide-react';

const Integrations: React.FC = () => {
  const integrations = [
    { id: 1, name: 'Google Drive', description: 'Dosya depolama ve paylaşım', status: 'connected', icon: '📁' },
    { id: 2, name: 'Slack', description: 'Ekip iletişim platformu', status: 'connected', icon: '💬' },
    { id: 3, name: 'Google Calendar', description: 'Takvim senkronizasyonu', status: 'connected', icon: '📅' },
    { id: 4, name: 'Frame.io', description: 'Video review platformu', status: 'disconnected', icon: '🎬' },
    { id: 5, name: 'Trello', description: 'Proje yönetim aracı', status: 'disconnected', icon: '📋' },
    { id: 6, name: 'Dropbox', description: 'Bulut depolama hizmeti', status: 'disconnected', icon: '📦' },
  ];

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Globe size={32} className="text-neutral-900" />
              Entegrasyonlar
            </h1>
            <p className="text-neutral-600 mt-1">Google Drive, Slack, Calendar ve diğer servislere bağlan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Mevcut Entegrasyon</span>
              <Globe size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">12</div>
            <div className="text-xs text-neutral-600 mt-1">Destekleniyor</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Bağlı</span>
              <CheckCircle2 size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">3</div>
            <div className="text-xs text-neutral-600 mt-1">Aktif bağlantı</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Kullanılabilir</span>
              <LinkIcon size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">9</div>
            <div className="text-xs text-neutral-600 mt-1">Bağlanabilir</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">API Çağrıları</span>
              <Globe size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">1.2K</div>
            <div className="text-xs text-neutral-600 mt-1">Bu ay</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{integration.icon}</div>
              {integration.status === 'connected' ? (
                <CheckCircle2 size={24} className="text-neutral-900" />
              ) : (
                <XCircle size={24} className="text-neutral-300" />
              )}
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{integration.name}</h3>
            <p className="text-sm text-neutral-600 mb-4">{integration.description}</p>
            <div className="flex gap-2">
              {integration.status === 'connected' ? (
                <>
                  <button className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium">
                    Ayarlar
                  </button>
                  <button className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                    Bağlantıyı Kes
                  </button>
                </>
              ) : (
                <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium">
                  Bağlan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
