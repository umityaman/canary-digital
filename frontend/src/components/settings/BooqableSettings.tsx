import { useState, useEffect } from 'react';
import { Link2, RefreshCw, CheckCircle, XCircle, Loader, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface BooqableConnection {
  connected: boolean;
  accountUrl?: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  errorMessage?: string;
  recentSyncs?: BooqableSync[];
}

interface BooqableSync {
  id: number;
  syncType: string;
  direction: string;
  status: string;
  recordsProcessed: number;
  recordsFailed: number;
  recordsCreated: number;
  recordsUpdated: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  errorMessage?: string;
}

export default function BooqableSettings() {
  const [connection, setConnection] = useState<BooqableConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [accountUrl, setAccountUrl] = useState('https://api.booqable.com');
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/booqable/status');
      setConnection(response.data);
    } catch (err) {
      console.error('Failed to fetch Booqable status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('API Key gereklidir');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      await api.post('/booqable/connect', {
        apiKey: apiKey.trim(),
        accountUrl: accountUrl.trim()
      });

      await fetchConnectionStatus();
      setApiKey('');
      alert('Booqable bağlantısı başarılı! ✅');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bağlantı başarısız');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Booqable bağlantısını kesmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await api.delete('/booqable/disconnect');
      await fetchConnectionStatus();
      alert('Booqable bağlantısı kesildi');
    } catch (err) {
      alert('Bağlantı kesilemedi');
    }
  };

  const handleSync = async (type: 'products' | 'customers' | 'orders' | 'all') => {
    setSyncing(true);
    setError(null);

    try {
      await api.post(`/booqable/sync/${type}`);
      alert(`${type} senkronizasyonu başlatıldı! ⏳`);
      
      // Refresh status after 2 seconds
      setTimeout(() => {
        fetchConnectionStatus();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Senkronizasyon başlatılamadı');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
          <CheckCircle size={12} /> Başarılı
        </span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
          <XCircle size={12} /> Başarısız
        </span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
          <Loader size={12} className="animate-spin" /> Devam Ediyor
        </span>;
      default:
        return <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">{status}</span>;
    }
  };

  const getSyncTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PRODUCT': 'Ürünler',
      'CUSTOMER': 'Müşteriler',
      'ORDER': 'Siparişler',
      'FULL': 'Tümü'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Az önce';
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} saat önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-neutral-900" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Link2 size={28} />
          Booqable Entegrasyonu
        </h2>
        <p className="text-neutral-600 mt-1">
          Booqable ile ekipman, müşteri ve sipariş verilerinizi senkronize edin
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Connection Status */}
      {connection?.connected ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-neutral-900">Bağlı</h3>
                <p className="text-sm text-neutral-600">{connection.accountUrl}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            >
              Bağlantıyı Kes
            </button>
          </div>

          {connection.lastSyncAt && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 pt-2 border-t">
              <Clock size={16} />
              <span>Son senkronizasyon: {formatDate(connection.lastSyncAt)}</span>
              {connection.lastSyncStatus && getStatusBadge(connection.lastSyncStatus)}
            </div>
          )}
        </div>
      ) : (
        /* Connection Form */
        <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-neutral-900">Bağlan</h3>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Booqable API Key *
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              API anahtarınızı Booqable → Settings → API'den alabilirsiniz
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Account URL (opsiyonel)
            </label>
            <input
              type="text"
              value={accountUrl}
              onChange={(e) => setAccountUrl(e.target.value)}
              placeholder="https://api.booqable.com"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Bağlanıyor...
              </>
            ) : (
              'Bağlan'
            )}
          </button>
        </div>
      )}

      {/* Manual Sync Buttons */}
      {connection?.connected && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Manuel Senkronizasyon</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleSync('products')}
              disabled={syncing}
              className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex flex-col items-center gap-1"
            >
              <RefreshCw size={20} />
              <span className="text-sm font-medium">Ürünler</span>
            </button>
            
            <button
              onClick={() => handleSync('customers')}
              disabled={syncing}
              className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex flex-col items-center gap-1"
            >
              <RefreshCw size={20} />
              <span className="text-sm font-medium">Müşteriler</span>
            </button>
            
            <button
              onClick={() => handleSync('orders')}
              disabled={syncing}
              className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 flex flex-col items-center gap-1"
            >
              <RefreshCw size={20} />
              <span className="text-sm font-medium">Siparişler</span>
            </button>
            
            <button
              onClick={() => handleSync('all')}
              disabled={syncing}
              className="px-4 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 flex flex-col items-center gap-1"
            >
              <RefreshCw size={20} />
              <span className="text-sm font-medium">Tümü</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            💡 İpucu: Otomatik senkronizasyon webhook'lar ile gerçek zamanlı çalışır
          </p>
        </div>
      )}

      {/* Recent Syncs */}
      {connection?.connected && connection.recentSyncs && connection.recentSyncs.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Son Senkronizasyonlar</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-neutral-600 border-b">
                  <th className="pb-3">Tip</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3">İşlenen</th>
                  <th className="pb-3">Oluşturulan</th>
                  <th className="pb-3">Güncellenen</th>
                  <th className="pb-3">Başarısız</th>
                  <th className="pb-3">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {connection.recentSyncs.map((sync) => (
                  <tr key={sync.id} className="border-b last:border-0 text-sm">
                    <td className="py-3">
                      <span className="font-medium text-neutral-900">
                        {getSyncTypeLabel(sync.syncType)}
                      </span>
                    </td>
                    <td className="py-3">{getStatusBadge(sync.status)}</td>
                    <td className="py-3 text-neutral-700">{sync.recordsProcessed}</td>
                    <td className="py-3 text-green-600">{sync.recordsCreated}</td>
                    <td className="py-3 text-blue-600">{sync.recordsUpdated}</td>
                    <td className="py-3 text-red-600">{sync.recordsFailed}</td>
                    <td className="py-3 text-neutral-600">{formatDate(sync.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="bg-blue-50 border border-neutral-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">📖 Dokümantasyon</h3>
        <p className="text-sm text-blue-800 mb-3">
          Booqable entegrasyonu hakkında daha fazla bilgi için:
        </p>
        <a
          href="https://docs.booqable.com/api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Booqable API Dokümantasyonu →
        </a>
      </div>
    </div>
  );
}
