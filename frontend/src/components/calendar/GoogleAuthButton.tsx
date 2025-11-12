import { useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useCalendarStore } from '../../stores/calendarStore';

export default function GoogleAuthButton() {
  const {
    googleConnected,
    needsReconnect,
    loading,
    error,
    checkGoogleStatus,
    connectGoogle,
    disconnectGoogle,
  } = useCalendarStore();

  useEffect(() => {
    checkGoogleStatus();
  }, [checkGoogleStatus]);

  const handleConnect = () => {
    connectGoogle();
  };

  const handleDisconnect = () => {
    if (window.confirm('Google Calendar bağlantısını kesmek istediğinizden emin misiniz?')) {
      disconnectGoogle();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-neutral-900">Google Calendar Entegrasyonu</h3>
            <p className="text-sm text-gray-500 mt-1">
              Siparişleriniz otomatik olarak Google Calendar'a senkronize edilir
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {googleConnected && !needsReconnect ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Bağlı</span>
            </div>
          ) : needsReconnect ? (
            <div className="flex items-center text-yellow-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Yeniden Bağlan</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-400">
              <XCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Bağlı Değil</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-6">
        {!googleConnected || needsReconnect ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Bağlanıyor...
              </>
            ) : (
              <>
                <CalendarIcon className="h-5 w-5 mr-2" />
                {needsReconnect ? 'Yeniden Bağlan' : 'Google Calendar\'a Bağlan'}
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">Aktif Bağlantı</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Yeni siparişleriniz otomatik olarak Google Calendar'a ekleniyor.
                    Müşterilerinize email ile takvim daveti gönderiliyor.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:opacity-50"
            >
              Bağlantıyı Kes
            </button>
          </div>
        )}
      </div>

      {googleConnected && !needsReconnect && (
        <div className="mt-6 border-t border-neutral-200 pt-6">
          <h4 className="text-sm font-medium text-neutral-900 mb-3">Özellikler:</h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Yeni sipariş → Otomatik calendar event</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Sipariş güncelleme → Event güncelleme</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Sipariş iptali → Event silme</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Email bildirimleri (1 gün ve 1 saat önce)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Renk kodlu event'ler (duruma göre)</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
