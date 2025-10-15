import { useState } from 'react';
import { X, Copy, Download, Printer, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface BackupCodesProps {
  isOpen: boolean;
  onClose: () => void;
  codes?: string[];
  onRegenerate?: (newCodes: string[]) => void;
}

const BackupCodes = ({ isOpen, onClose, codes: initialCodes, onRegenerate }: BackupCodesProps) => {
  const [codes, setCodes] = useState<string[]>(initialCodes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `Canary - 2FA Yedek Kodları
Tarih: ${new Date().toLocaleString('tr-TR')}

${codes.join('\n')}

⚠️ UYARI:
- Bu kodları güvenli bir yerde saklayın
- Her kod yalnızca bir kez kullanılabilir
- Kimseyle paylaşmayın
- Yeni kodlar oluşturduğunuzda eski kodlar geçersiz olacaktır`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canary-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Canary - 2FA Yedek Kodları</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
              }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                padding: 40px; 
                max-width: 800px;
                margin: 0 auto;
              }
              .header { 
                border-bottom: 3px solid #1e40af; 
                padding-bottom: 20px; 
                margin-bottom: 30px;
              }
              h1 { 
                color: #1e40af; 
                margin: 0 0 10px 0;
                font-size: 28px;
              }
              .date {
                color: #6b7280;
                font-size: 14px;
              }
              .codes-grid { 
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 30px 0;
              }
              .code { 
                font-size: 18px; 
                font-family: 'Courier New', monospace; 
                padding: 15px; 
                border: 2px solid #e5e7eb; 
                border-radius: 8px;
                text-align: center;
                background: #f9fafb;
                font-weight: 600;
              }
              .warning { 
                background: #fef3c7; 
                border-left: 4px solid #f59e0b; 
                padding: 20px; 
                margin-top: 30px;
                border-radius: 4px;
              }
              .warning-title {
                font-weight: bold;
                color: #92400e;
                margin-bottom: 10px;
                font-size: 16px;
              }
              .warning-list {
                margin: 10px 0 0 20px;
                color: #78350f;
              }
              .warning-list li {
                margin-bottom: 5px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔐 Canary - 2FA Yedek Kodları</h1>
              <div class="date">Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}</div>
            </div>
            
            <div class="codes-grid">
              ${codes.map(code => `<div class="code">${code}</div>`).join('')}
            </div>
            
            <div class="warning">
              <div class="warning-title">⚠️ ÖNEMLİ UYARILAR</div>
              <ul class="warning-list">
                <li>Bu kodları güvenli bir yerde saklayın (kasa, şifreli belge vb.)</li>
                <li>Her yedek kod yalnızca bir kez kullanılabilir</li>
                <li>Kullanılan kodlar otomatik olarak geçersiz hale gelir</li>
                <li>Yeni yedek kodlar oluşturduğunuzda tüm eski kodlar geçersiz olur</li>
                <li>Bu kodları kimseyle paylaşmayın</li>
              </ul>
            </div>

            <div class="footer">
              Canary Kiralama Yönetim Sistemi | www.canary.com
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/2fa/regenerate-backup-codes');
      const newCodes = response.data.backupCodes;
      setCodes(newCodes);
      setShowRegenerateConfirm(false);
      
      if (onRegenerate) {
        onRegenerate(newCodes);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Yedek kodlar yenilenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Yedek Kodlar</h2>
            <p className="text-sm text-gray-500 mt-1">
              2FA erişim sorunlarında kullanılacak yedek kodlar
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Warning */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Önemli:</strong> Bu kodları güvenli bir yerde saklayın. Her kod yalnızca bir
                kez kullanılabilir. Yeni kodlar oluşturduğunuzda, eski kodlar geçersiz hale gelir.
              </div>
            </div>
          </div>

          {/* Codes Grid */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              {codes.map((code, index) => (
                <div
                  key={index}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-center text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleCopy}
              disabled={loading}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopyala
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Download className="w-4 h-4" />
              İndir
            </button>

            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Printer className="w-4 h-4" />
              Yazdır
            </button>
          </div>

          {/* Regenerate Section */}
          {!showRegenerateConfirm ? (
            <button
              onClick={() => setShowRegenerateConfirm(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <RefreshCw className="w-4 h-4" />
              Yeni Yedek Kodlar Oluştur
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Dikkat!</strong> Yeni kodlar oluşturduğunuzda, mevcut tüm yedek kodlar
                  geçersiz hale gelecektir. Devam etmek istediğinizden emin misiniz?
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRegenerateConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Oluşturuluyor...' : 'Evet, Yenile'}
                </button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Yedek Kodlar Nasıl Kullanılır?</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Telefonunuza erişiminizi kaybederseniz bu kodları kullanın</li>
              <li>Giriş yaparken "Yedek kod kullan" seçeneğini seçin</li>
              <li>Kodlardan birini girin (her kod tek kullanımlıktır)</li>
              <li>Başarılı girişten sonra 2FA yöntemini yeniden yapılandırabilirsiniz</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupCodes;
