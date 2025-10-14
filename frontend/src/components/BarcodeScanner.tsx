import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, ScanLine, Loader2 } from 'lucide-react';
import { scanAPI } from '../services/api';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerDivId = 'qr-reader';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Initialize scanner if not already initialized
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerDivId);
      }

      // Get cameras
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        throw new Error('Kamera bulunamadı');
      }

      // Start scanning with first camera (usually back camera on mobile)
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Success callback
          setIsProcessing(true);
          try {
            // Log the scan to backend
            await scanAPI.logScan({
              scannedCode: decodedText,
              scanAction: 'VIEW',
              deviceInfo: navigator.userAgent,
              location: window.location.pathname
            });
            
            onScan(decodedText);
            stopScanner();
            onClose();
          } catch (err) {
            console.error('Failed to log scan:', err);
            // Still call onScan even if logging fails
            onScan(decodedText);
            stopScanner();
            onClose();
          } finally {
            setIsProcessing(false);
          }
        },
        (errorMessage) => {
          // Error callback (usually just "not found", don't need to show these)
          console.log('Scan error:', errorMessage);
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Kamera başlatılamadı. Lütfen kamera izinlerini kontrol edin.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      setIsProcessing(true);
      try {
        // Log the manual scan to backend
        await scanAPI.logScan({
          scannedCode: manualInput.trim(),
          scanAction: 'VIEW',
          deviceInfo: navigator.userAgent,
          location: window.location.pathname,
          notes: 'Manual entry'
        });
        
        onScan(manualInput.trim());
        setManualInput('');
        onClose();
      } catch (err) {
        console.error('Failed to log manual scan:', err);
        // Still call onScan even if logging fails
        onScan(manualInput.trim());
        setManualInput('');
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800">QR/Barcode Tarama</h2>
              <p className="text-sm text-neutral-600">Ekipman kodunu okutun veya manuel girin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-6 space-y-4">
          {/* Camera Scanner */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <div id={readerDivId} className="rounded-lg overflow-hidden" />
            
            {!isScanning && (
              <button
                onClick={startScanner}
                className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Kamerayı Başlat
              </button>
            )}

            {isScanning && (
              <button
                onClick={stopScanner}
                className="mt-4 w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Taramayı Durdur
              </button>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-600">veya</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Manuel Kod Girişi
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ekipman ID veya barcode numarası"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                autoFocus={!isScanning}
              />
            </div>
            <button
              type="submit"
              disabled={!manualInput.trim() || isProcessing}
              className="w-full py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Kodu Onayla'
              )}
            </button>
          </form>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="mt-2 text-center text-sm text-neutral-600">
              Ekipman bilgisi alınıyor...
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-neutral-700">
            <h4 className="font-semibold mb-2 text-blue-800">💡 Kullanım İpuçları:</h4>
            <ul className="space-y-1 text-neutral-600">
              <li>• QR kodu veya barkodu kamera görüş alanının ortasına getirin</li>
              <li>• Kodun tamamının görünür olduğundan emin olun</li>
              <li>• İyi aydınlatılmış bir ortamda tarama yapın</li>
              <li>• Manuel giriş için ekipman ID'sini yazabilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
