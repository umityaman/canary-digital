import React, { useState } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface IntegrationConfigModalProps {
  integrationId: string;
  integrationName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
}

const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({
  integrationId,
  integrationName,
  isOpen,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [config, setConfig] = useState<any>({
    parasut: {
      clientId: '',
      clientSecret: '',
      username: '',
      password: '',
      companyId: '',
      accountId: '',
    },
    iyzico: {
      apiKey: '',
      secretKey: '',
      baseUrl: 'https://sandbox-api.iyzipay.com',
    },
    whatsapp: {
      phoneNumberId: '',
      accessToken: '',
      businessAccountId: '',
    },
    bank: {
      apiKey: '',
      secretKey: '',
      bankCode: '',
      accountNumber: '',
    },
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(config[integrationId]);
      toast.success('Ayarlar kaydedildi');
      onClose();
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderParasutConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client ID
        </label>
        <input
          type={showSecrets ? 'text' : 'password'}
          value={config.parasut.clientId}
          onChange={(e) =>
            setConfig({
              ...config,
              parasut: { ...config.parasut, clientId: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Paraşüt Client ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Secret
        </label>
        <input
          type={showSecrets ? 'text' : 'password'}
          value={config.parasut.clientSecret}
          onChange={(e) =>
            setConfig({
              ...config,
              parasut: { ...config.parasut, clientSecret: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Paraşüt Client Secret"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kullanıcı Adı (E-posta)
        </label>
        <input
          type="email"
          value={config.parasut.username}
          onChange={(e) =>
            setConfig({
              ...config,
              parasut: { ...config.parasut, username: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="ornek@firma.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Şifre
        </label>
        <input
          type={showSecrets ? 'text' : 'password'}
          value={config.parasut.password}
          onChange={(e) =>
            setConfig({
              ...config,
              parasut: { ...config.parasut, password: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Paraşüt Şifresi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company ID
        </label>
        <input
          type="text"
          value={config.parasut.companyId}
          onChange={(e) =>
            setConfig({
              ...config,
              parasut: { ...config.parasut, companyId: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="123456"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banka Hesabı ID
        </label>
        <input
          type="text"
          value={config.parasut.accountId}
          onChange={(e) =>
            setConfig({
              ...config,
              parasut: { ...config.parasut, accountId: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Varsayılan banka hesabı ID"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Not:</strong> Bu bilgileri Paraşüt web arayüzünden alabilirsiniz.
          Hesap Ayarları → Entegrasyonlar → API bölümünden erişebilirsiniz.
        </p>
      </div>
    </div>
  );

  const renderIyzicoConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <input
          type={showSecrets ? 'text' : 'password'}
          value={config.iyzico.apiKey}
          onChange={(e) =>
            setConfig({
              ...config,
              iyzico: { ...config.iyzico, apiKey: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="iyzico API Key"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secret Key
        </label>
        <input
          type={showSecrets ? 'text' : 'password'}
          value={config.iyzico.secretKey}
          onChange={(e) =>
            setConfig({
              ...config,
              iyzico: { ...config.iyzico, secretKey: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="iyzico Secret Key"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ortam
        </label>
        <select
          value={config.iyzico.baseUrl}
          onChange={(e) =>
            setConfig({
              ...config,
              iyzico: { ...config.iyzico, baseUrl: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="https://sandbox-api.iyzipay.com">Test (Sandbox)</option>
          <option value="https://api.iyzipay.com">Canlı (Production)</option>
        </select>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Uyarı:</strong> Test ortamında işlemler gerçek para kullanmaz.
          Canlı ortama geçmeden önce tüm testleri tamamlayın.
        </p>
      </div>
    </div>
  );

  const renderWhatsAppConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number ID
        </label>
        <input
          type="text"
          value={config.whatsapp.phoneNumberId}
          onChange={(e) =>
            setConfig({
              ...config,
              whatsapp: { ...config.whatsapp, phoneNumberId: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="123456789012345"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Access Token
        </label>
        <textarea
          value={config.whatsapp.accessToken}
          onChange={(e) =>
            setConfig({
              ...config,
              whatsapp: { ...config.whatsapp, accessToken: e.target.value },
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          placeholder="WhatsApp Business API Access Token"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Account ID
        </label>
        <input
          type="text"
          value={config.whatsapp.businessAccountId}
          onChange={(e) =>
            setConfig({
              ...config,
              whatsapp: { ...config.whatsapp, businessAccountId: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Business Account ID"
        />
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Not:</strong> WhatsApp Business API erişimi için Meta (Facebook)
          Business hesabı gereklidir. Detaylar için dokümantasyona bakın.
        </p>
      </div>
    </div>
  );

  const renderBankConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banka
        </label>
        <select
          value={config.bank.bankCode}
          onChange={(e) =>
            setConfig({
              ...config,
              bank: { ...config.bank, bankCode: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Banka Seçin</option>
          <option value="akbank">Akbank</option>
          <option value="garanti">Garanti BBVA</option>
          <option value="isbank">İş Bankası</option>
          <option value="yapi-kredi">Yapı Kredi</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <input
          type={showSecrets ? 'text' : 'password'}
          value={config.bank.apiKey}
          onChange={(e) =>
            setConfig({
              ...config,
              bank: { ...config.bank, apiKey: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Banka API Key"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secret Key
        </label>
        <input
          type={showSecrets ? 'text' : 'password'}
          value={config.bank.secretKey}
          onChange={(e) =>
            setConfig({
              ...config,
              bank: { ...config.bank, secretKey: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Banka Secret Key"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hesap Numarası
        </label>
        <input
          type="text"
          value={config.bank.accountNumber}
          onChange={(e) =>
            setConfig({
              ...config,
              bank: { ...config.bank, accountNumber: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="TR00 0000 0000 0000 0000 0000 00"
        />
      </div>

      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-red-800">
          <strong>Önemli:</strong> Banka API entegrasyonu kurumsal hesap gerektirir.
          Bankanızla iletişime geçerek API erişimi talep edin.
        </p>
      </div>
    </div>
  );

  const renderConfigForm = () => {
    switch (integrationId) {
      case 'parasut':
        return renderParasutConfig();
      case 'iyzico':
        return renderIyzicoConfig();
      case 'whatsapp':
        return renderWhatsAppConfig();
      case 'bank':
        return renderBankConfig();
      default:
        return <p>Yapılandırma formu bulunamadı</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {integrationName} Ayarları
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderConfigForm()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            {showSecrets ? (
              <>
                <EyeOff className="w-4 h-4" />
                Gizle
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Göster
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConfigModal;
