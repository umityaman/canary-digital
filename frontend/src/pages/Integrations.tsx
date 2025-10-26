import React, { useState } from 'react';
import { Plug, Filter } from 'lucide-react';
import IntegrationCard, { Integration } from '../components/integrations/IntegrationCard';
import IntegrationConfigModal from '../components/integrations/IntegrationConfigModal';
import { toast } from 'react-hot-toast';

const Integrations: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(
    null
  );

  const integrations: Integration[] = [
    {
      id: 'parasut',
      name: 'Paraşüt',
      description: 'E-Fatura ve Muhasebe Entegrasyonu',
      logo: '📊',
      status: 'disconnected',
      category: 'accounting',
      features: [
        'Otomatik e-fatura oluşturma',
        'Gelir/gider senkronizasyonu',
        'Müşteri ve tedarikçi yönetimi',
        'KDV ve vergi hesaplamaları',
        'Ödeme takibi',
      ],
      documentationUrl: '/docs/parasut',
    },
    {
      id: 'iyzico',
      name: 'iyzico',
      description: 'Ödeme Sistemi Entegrasyonu',
      logo: '💳',
      status: 'disconnected',
      category: 'payment',
      features: [
        '3D Secure ödeme',
        'Sanal POS entegrasyonu',
        'Taksitli ödeme desteği',
        'Otomatik iade yönetimi',
        'Ödeme linki oluşturma',
      ],
      documentationUrl: '/docs/iyzico',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Müşteri İletişim Entegrasyonu',
      logo: '💬',
      status: 'disconnected',
      category: 'communication',
      features: [
        'Ödeme hatırlatmaları',
        'Fatura bildirimleri',
        'Cari hesap ekstresi gönderimi',
        'Toplu mesaj gönderimi',
        'Template mesaj desteği',
      ],
      documentationUrl: '/docs/whatsapp',
    },
    {
      id: 'bank',
      name: 'Banka API',
      description: 'Banka Hesap Entegrasyonu',
      logo: '🏦',
      status: 'disconnected',
      category: 'banking',
      features: [
        'Hesap bakiyesi senkronizasyonu',
        'İşlem geçmişi otomasyonu',
        'Otomatik mutabakat',
        'Ödeme talimatı',
        'Ekstre indirme',
      ],
      documentationUrl: '/docs/bank',
    },
  ];

  const categories = [
    { id: 'all', label: 'Tümü', icon: '🔌' },
    { id: 'payment', label: 'Ödeme', icon: '💳' },
    { id: 'accounting', label: 'Muhasebe', icon: '📊' },
    { id: 'communication', label: 'İletişim', icon: '💬' },
    { id: 'banking', label: 'Bankacılık', icon: '🏦' },
  ];

  const filteredIntegrations =
    selectedCategory === 'all'
      ? integrations
      : integrations.filter((int) => int.category === selectedCategory);

  const handleConnect = async (id: string) => {
    const integration = integrations.find((int) => int.id === id);
    if (integration) {
      setSelectedIntegration(integration);
      setConfigModalOpen(true);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      // API call to disconnect integration
      toast.success('Entegrasyon bağlantısı kesildi');
    } catch (error) {
      toast.error('Bağlantı kesilemedi');
    }
  };

  const handleConfigure = (id: string) => {
    const integration = integrations.find((int) => int.id === id);
    if (integration) {
      setSelectedIntegration(integration);
      setConfigModalOpen(true);
    }
  };

  const handleSaveConfig = async (config: any) => {
    try {
      // API call to save configuration
      console.log('Saving config:', config);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Ayarlar kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Plug className="w-8 h-8 text-indigo-600" />
            Entegrasyonlar
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Harici hizmetlerle entegrasyonlarınızı yönetin
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {integrations.filter((i) => i.status === 'connected').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Aktif</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {integrations.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Toplam</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {integrations.filter((i) => i.status === 'error').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Hata</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {categories.length - 1}
          </div>
          <div className="text-sm text-gray-600 mt-1">Kategori</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtrele</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConfigure={handleConfigure}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <Plug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Entegrasyon Bulunamadı
          </h3>
          <p className="text-gray-600">
            Bu kategoride henüz entegrasyon bulunmuyor.
          </p>
        </div>
      )}

      {/* Config Modal */}
      {selectedIntegration && (
        <IntegrationConfigModal
          integrationId={selectedIntegration.id}
          integrationName={selectedIntegration.name}
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false);
            setSelectedIntegration(null);
          }}
          onSave={handleSaveConfig}
        />
      )}

      {/* Info Section */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Entegrasyonlar Hakkında
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Entegrasyonlar sayesinde iş süreçlerinizi otomatikleştirebilirsiniz</li>
          <li>• Her entegrasyon için gerekli API anahtarlarını temin etmeniz gerekir</li>
          <li>• Test ortamında denemelerinizi yaptıktan sonra canlı ortama geçin</li>
          <li>• Sorun yaşamanız durumunda destek ekibimizle iletişime geçin</li>
        </ul>
      </div>
    </div>
  );
};

export default Integrations;
