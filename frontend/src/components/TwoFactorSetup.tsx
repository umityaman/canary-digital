import { useState, useEffect } from 'react';
import { X, Shield, Mail, Smartphone, Key, Copy, Download, Printer, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TwoFactorMethod = 'EMAIL' | 'SMS' | 'TOTP';

interface SetupStep {
  step: number;
  title: string;
}

const TwoFactorSetup = ({ isOpen, onClose, onSuccess }: TwoFactorSetupProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const steps: SetupStep[] = [
    { step: 1, title: 'Yöntem Seçin' },
    { step: 2, title: 'Kurulum' },
    { step: 3, title: 'Doğrulama' },
    { step: 4, title: 'Yedek Kodlar' },
  ];

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setCurrentStep(1);
    setSelectedMethod(null);
    setPhoneNumber('');
    setVerificationCode('');
    setQrCode('');
    setSecret('');
    setBackupCodes([]);
    setError('');
    setCodeSent(false);
  };

  const handleMethodSelect = (method: TwoFactorMethod) => {
    setSelectedMethod(method);
    setError('');
  };

  const handleNext = async () => {
    setError('');

    if (currentStep === 1) {
      if (!selectedMethod) {
        setError('Lütfen bir yöntem seçin');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await handleSetup();
    } else if (currentStep === 3) {
      await handleVerify();
    }
  };

  const handleSetup = async () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'SMS' && !phoneNumber) {
      setError('Lütfen telefon numaranızı girin');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/2fa/enable', {
        method: selectedMethod,
        phoneNumber: selectedMethod === 'SMS' ? phoneNumber : undefined,
      });

      if (selectedMethod === 'TOTP') {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      }

      setBackupCodes(response.data.backupCodes || []);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kurulum başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/2fa/send-otp');
      setCodeSent(true);
      setTimeout(() => setCodeSent(false), 60000); // 60 saniye sonra tekrar gönderebilir
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Lütfen doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      await api.post('/2fa/verify', {
        code: verificationCode,
        isBackupCode: false,
      });

      setCurrentStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Geçersiz kod');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = `Canary - 2FA Yedek Kodları\n\n${backupCodes.join('\n')}\n\nBu kodları güvenli bir yerde saklayın.\nHer kod yalnızca bir kez kullanılabilir.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canary-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintBackupCodes = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Canary - 2FA Yedek Kodları</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #1e40af; }
              .codes { margin: 20px 0; }
              .code { font-size: 18px; font-family: monospace; padding: 10px; border: 1px solid #ddd; margin: 5px 0; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>🔐 Canary - 2FA Yedek Kodları</h1>
            <div class="codes">
              ${backupCodes.map(code => `<div class="code">${code}</div>`).join('')}
            </div>
            <div class="warning">
              <strong>⚠️ Önemli:</strong> Bu kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-neutral-900">İki Faktörlü Doğrulama Kurulumu</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-neutral-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      currentStep >= step.step
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-200 text-gray-400'
                    }`}
                  >
                    {step.step}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      currentStep >= step.step ? 'text-blue-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition ${
                      currentStep > step.step ? 'bg-blue-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Step 1: Method Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-neutral-600 mb-6">
                Hesabınızın güvenliğini artırmak için bir doğrulama yöntemi seçin:
              </p>

              <button
                onClick={() => handleMethodSelect('EMAIL')}
                className={`w-full p-4 border-2 rounded-lg text-left transition hover:border-blue-400 ${
                  selectedMethod === 'EMAIL' ? 'border-neutral-600 bg-blue-50' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">E-posta ile Doğrulama</h3>
                    <p className="text-sm text-neutral-600">
                      E-posta adresinize gönderilen 6 haneli kodu kullanarak giriş yapın.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('SMS')}
                className={`w-full p-4 border-2 rounded-lg text-left transition hover:border-blue-400 ${
                  selectedMethod === 'SMS' ? 'border-neutral-600 bg-blue-50' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">SMS ile Doğrulama</h3>
                    <p className="text-sm text-neutral-600">
                      Telefon numaranıza gönderilen 6 haneli kodu kullanarak giriş yapın.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('TOTP')}
                className={`w-full p-4 border-2 rounded-lg text-left transition hover:border-blue-400 ${
                  selectedMethod === 'TOTP' ? 'border-neutral-600 bg-blue-50' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Key className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">
                      Doğrulayıcı Uygulama (TOTP)
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Google Authenticator veya benzeri bir uygulama kullanarak giriş yapın.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {selectedMethod === 'SMS' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Doğrulama kodları bu numaraya SMS olarak gönderilecektir.
                  </p>
                </div>
              )}

              {selectedMethod === 'EMAIL' && (
                <div className="text-center py-8">
                  <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">E-posta Doğrulama</h3>
                  <p className="text-neutral-600">
                    Devam ettiğinizde, kayıtlı e-posta adresinize bir doğrulama kodu
                    gönderilecektir.
                  </p>
                </div>
              )}

              {selectedMethod === 'TOTP' && (
                <div className="text-center py-8">
                  <Key className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Doğrulayıcı Uygulama
                  </h3>
                  <p className="text-neutral-600">
                    Google Authenticator veya benzeri bir uygulama kullanarak QR kodunu
                    tarayacaksınız.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {selectedMethod === 'TOTP' && qrCode && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    QR Kodunu Tarayın
                  </h3>
                  <div className="bg-white p-4 rounded-lg border-2 border-neutral-200 inline-block">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                  <p className="text-sm text-neutral-600 mt-4">
                    Google Authenticator uygulamasıyla bu QR kodunu tarayın
                  </p>
                  {secret && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Elle girmek için:</p>
                      <code className="px-4 py-2 bg-neutral-100 rounded text-sm font-mono">
                        {secret}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {(selectedMethod === 'EMAIL' || selectedMethod === 'SMS') && (
                <div className="text-center">
                  <p className="text-neutral-600 mb-4">
                    {selectedMethod === 'EMAIL'
                      ? 'E-posta adresinize bir doğrulama kodu gönderilecektir.'
                      : 'Telefon numaranıza bir doğrulama kodu gönderilecektir.'}
                  </p>
                  {!codeSent ? (
                    <button
                      onClick={handleSendCode}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
                    </button>
                  ) : (
                    <p className="text-green-600 font-medium">✓ Kod gönderildi!</p>
                  )}
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Doğrulama Kodu
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent tracking-widest"
                />
                <p className="mt-2 text-sm text-gray-500 text-center">6 haneli kodu girin</p>
              </div>
            </div>
          )}

          {/* Step 4: Backup Codes */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  🎉 2FA Başarıyla Aktifleştirildi!
                </h3>
                <p className="text-neutral-600">
                  Aşağıdaki yedek kodları güvenli bir yerde saklayın. Telefonunuza erişiminizi
                  kaybederseniz bu kodları kullanabilirsiniz.
                </p>
              </div>

              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 bg-white border border-neutral-200 rounded font-mono text-center text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleCopyBackupCodes}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                  >
                    <Copy className="w-4 h-4" />
                    Kopyala
                  </button>
                  <button
                    onClick={handleDownloadBackupCodes}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                  >
                    <Download className="w-4 h-4" />
                    İndir
                  </button>
                  <button
                    onClick={handlePrintBackupCodes}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
                  >
                    <Printer className="w-4 h-4" />
                    Yazdır
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Önemli:</strong> Her yedek kod yalnızca bir kez kullanılabilir.
                    Kodları güvenli bir yerde saklayın ve kimseyle paylaşmayın.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-neutral-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-600 hover:text-gray-800 transition"
          >
            İptal
          </button>
          <div className="flex gap-2">
            {currentStep > 1 && currentStep < 4 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
              >
                Geri
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'İşleniyor...' : currentStep === 3 ? 'Doğrula' : 'Devam Et'}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Tamamla
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
