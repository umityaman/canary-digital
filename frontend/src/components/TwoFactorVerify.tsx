import { useState } from 'react';
import { Shield, AlertCircle, RefreshCw, Key } from 'lucide-react';
import api from '../services/api';

interface TwoFactorVerifyProps {
  onVerified: () => void;
  onCancel: () => void;
  method?: 'EMAIL' | 'SMS' | 'TOTP';
}

const TwoFactorVerify = ({ onVerified, onCancel, method = 'EMAIL' }: TwoFactorVerifyProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async () => {
    if (!code) {
      setError('Lütfen doğrulama kodunu girin');
      return;
    }

    if (!useBackupCode && code.length !== 6) {
      setError('Doğrulama kodu 6 haneli olmalıdır');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/2fa/verify', {
        code,
        isBackupCode: useBackupCode,
      });

      onVerified();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Geçersiz kod');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/2fa/send-otp');
      setCodeSent(true);
      setResendCooldown(60);

      // Countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const getMethodText = () => {
    switch (method) {
      case 'EMAIL':
        return 'E-posta adresinize gönderilen';
      case 'SMS':
        return 'Telefon numaranıza gönderilen';
      case 'TOTP':
        return 'Doğrulayıcı uygulamanızdaki';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">İki Faktörlü Doğrulama</h2>
          <p className="text-neutral-600">
            {useBackupCode
              ? 'Yedek kodunuzu girin'
              : `${getMethodText()} 6 haneli kodu girin`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {codeSent && !error && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-800 text-sm">✓ Kod başarıyla gönderildi!</span>
          </div>
        )}

        {/* Code Input */}
        <div className="mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = useBackupCode
                ? e.target.value.toUpperCase()
                : e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder={useBackupCode ? 'XXXX-XXXX' : '123456'}
            maxLength={useBackupCode ? 9 : 6}
            disabled={loading}
            className="w-full px-4 py-4 text-center text-2xl font-mono border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 tracking-widest"
            autoFocus
          />
          <p className="mt-2 text-sm text-gray-500 text-center">
            {useBackupCode ? 'Yedek kod formatı: XXXX-XXXX' : '6 haneli doğrulama kodu'}
          </p>
        </div>

        {/* Resend Code (only for EMAIL/SMS) */}
        {!useBackupCode && (method === 'EMAIL' || method === 'SMS') && (
          <div className="mb-6 text-center">
            <button
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {resendCooldown > 0
                ? `Tekrar gönder (${resendCooldown}s)`
                : 'Kodu Tekrar Gönder'}
            </button>
          </div>
        )}

        {/* Backup Code Toggle */}
        <div className="mb-6">
          <button
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
              setError('');
            }}
            className="w-full inline-flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-gray-800 transition"
          >
            <Key className="w-4 h-4" />
            {useBackupCode ? 'Normal kodu kullan' : 'Yedek kod kullan'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            İptal
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || !code}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Doğrulanıyor...' : 'Doğrula'}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-xs text-neutral-600 text-center">
            💡 <strong>İpucu:</strong> Doğrulama kodunuza erişemiyorsanız, yedek
            kodlarınızdan birini kullanabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
