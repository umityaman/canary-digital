import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Download, Copy, CheckCircle, Printer } from 'lucide-react';

interface QRCodeGeneratorProps {
  equipmentId: number;
  equipmentName: string;
  serialNumber: string;
  onClose?: () => void;
  type?: 'qr' | 'barcode' | 'both';
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  equipmentId,
  equipmentName,
  serialNumber,
  onClose,
  type = 'both'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [barcodeUrl, setBarcodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
    generateBarcode();
  }, [equipmentId]);

  const generateQRCode = async () => {
    try {
      // QR kod için equipment detail URL'i oluştur
      const equipmentUrl = `${window.location.origin}/equipment/${equipmentId}`;
      
      // QR kod data objesi
      const qrData = {
        type: 'equipment',
        id: equipmentId,
        name: equipmentName,
        serialNumber: serialNumber,
        url: equipmentUrl,
        timestamp: new Date().toISOString()
      };

      // QR kod oluştur
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('QR kod oluşturulamadı:', error);
    }
  };

  const generateBarcode = () => {
    try {
      if (barcodeCanvasRef.current) {
        // Equipment ID'yi barcode formatına uygun hale getir (sayısal)
        const barcodeValue = `EQ${String(equipmentId).padStart(8, '0')}`;
        
        JsBarcode(barcodeCanvasRef.current, barcodeValue, {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000'
        });

        // Canvas'ı data URL'e çevir
        setBarcodeUrl(barcodeCanvasRef.current.toDataURL('image/png'));
      }
    } catch (error) {
      console.error('Barcode oluşturulamadı:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `equipment-${equipmentId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadBarcode = () => {
    if (barcodeUrl) {
      const link = document.createElement('a');
      link.href = barcodeUrl;
      link.download = `equipment-${equipmentId}-barcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Codes - ${equipmentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              border: 2px dashed #ccc;
              padding: 30px;
            }
            h2 { margin: 10px 0 20px 0; }
            .code-section {
              margin: 30px 0;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 10px;
            }
            img { max-width: 100%; height: auto; }
            .info { margin-top: 10px; font-size: 14px; color: #666; }
            @media print {
              body { background: white; }
              .container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${equipmentName}</h2>
            ${(type === 'qr' || type === 'both') && qrCodeUrl ? `
              <div class="code-section">
                <h3>QR Kod</h3>
                <img src="${qrCodeUrl}" alt="QR Code" />
              </div>
            ` : ''}
            ${(type === 'barcode' || type === 'both') && barcodeUrl ? `
              <div class="code-section">
                <h3>Barcode</h3>
                <img src="${barcodeUrl}" alt="Barcode" />
              </div>
            ` : ''}
            <div class="info">
              <p><strong>Ekipman ID:</strong> ${equipmentId}</p>
              <p><strong>Seri No:</strong> ${serialNumber}</p>
              <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const copyToClipboard = async () => {
    try {
      const equipmentUrl = `${window.location.origin}/equipment/${equipmentId}`;
      await navigator.clipboard.writeText(equipmentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Kopyalama başarısız:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 text-neutral-800">
          {type === 'qr' ? 'QR Kod' : type === 'barcode' ? 'Barcode' : 'QR Kod & Barcode'} - {equipmentName}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* QR Code Section */}
          {(type === 'qr' || type === 'both') && (
            <div className="text-center bg-neutral-50 rounded-xl p-6">
              <h4 className="font-semibold mb-4 text-neutral-700">QR Kod</h4>
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Equipment QR Code" 
                  className="mx-auto border-2 border-neutral-200 rounded-lg shadow-sm bg-white p-2"
                />
              ) : (
                <div className="w-[300px] h-[300px] bg-neutral-100 flex items-center justify-center mx-auto rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          )}

          {/* Barcode Section */}
          {(type === 'barcode' || type === 'both') && (
            <div className="text-center bg-neutral-50 rounded-xl p-6">
              <h4 className="font-semibold mb-4 text-neutral-700">Barcode</h4>
              <div className="bg-white p-4 rounded-lg border-2 border-neutral-200 inline-block">
                <canvas ref={barcodeCanvasRef} className="mx-auto" />
              </div>
              <p className="text-xs text-neutral-500 mt-3">
                Format: CODE128 - EQ{String(equipmentId).padStart(8, '0')}
              </p>
            </div>
          )}
        </div>

        {/* Equipment Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2">
          <div className="text-sm flex justify-between">
            <span className="text-neutral-600">Ekipman:</span>
            <span className="font-semibold text-neutral-800">{equipmentName}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-neutral-600">Ekipman ID:</span>
            <span className="font-mono font-medium text-neutral-800">#{equipmentId}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="text-neutral-600">Seri No:</span>
            <span className="font-mono font-medium text-neutral-800">{serialNumber}</span>
          </div>
          <div className="text-sm">
            <span className="text-neutral-600">URL:</span>
            <span className="ml-2 text-blue-600 break-all text-xs">
              {window.location.origin}/equipment/{equipmentId}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">URL</span>
              </>
            )}
          </button>
          
          {(type === 'qr' || type === 'both') && (
            <button
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">QR</span>
            </button>
          )}

          {(type === 'barcode' || type === 'both') && (
            <button
              onClick={downloadBarcode}
              disabled={!barcodeUrl}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Barcode</span>
            </button>
          )}

          <button
            onClick={printCodes}
            disabled={!qrCodeUrl && !barcodeUrl}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm font-medium">Yazdır</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>💡 İpucu:</strong> QR kodu veya barkodu ekipman üzerine yapıştırarak 
            hızlı check-in/check-out işlemleri yapabilirsiniz.
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors font-medium"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;