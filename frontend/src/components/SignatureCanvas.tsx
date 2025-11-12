import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, Check } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (signature: string) => void;
  label?: string;
  width?: number;
  height?: number;
  disabled?: boolean;
  initialSignature?: string;
}

const SignatureCanvasComponent: React.FC<SignatureCanvasProps> = ({
  onSave,
  label = 'İmza',
  width = 500,
  height = 200,
  disabled = false,
  initialSignature
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(!!initialSignature);
  const [signatureData, setSignatureData] = useState(initialSignature || '');

  const clear = () => {
    sigCanvas.current?.clear();
    setIsSigned(false);
    setSignatureData('');
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Lütfen önce imza atınız!');
      return;
    }

    const dataURL = sigCanvas.current?.toDataURL('image/png');
    if (dataURL) {
      setSignatureData(dataURL);
      setIsSigned(true);
      onSave(dataURL);
    }
  };

  const handleEnd = () => {
    // İmza atılmaya başlandığında otomatik save yap
    if (!sigCanvas.current?.isEmpty() && !disabled) {
      const dataURL = sigCanvas.current?.toDataURL('image/png');
      if (dataURL) {
        setSignatureData(dataURL);
        setIsSigned(true);
        onSave(dataURL);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>

      {signatureData && isSigned ? (
        // İmza kaydedildiyse göster
        <div className="relative">
          <div className="border-2 border-green-500 rounded-lg p-2 bg-green-50">
            <img 
              src={signatureData} 
              alt={label}
              className="w-full h-auto"
              style={{ maxHeight: height }}
            />
          </div>
          
          {!disabled && (
            <button
              type="button"
              onClick={() => {
                clear();
                setIsSigned(false);
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="mt-2 flex items-center text-sm text-green-600">
            <Check size={16} className="mr-1" />
            İmza kaydedildi
          </div>
        </div>
      ) : (
        // İmza çizme alanı
        <div className="relative">
          <div 
            className="border-2 border-neutral-300 rounded-lg overflow-hidden bg-white"
            style={{ width: '100%', maxWidth: width }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: width,
                height: height,
                className: 'signature-canvas w-full'
              }}
              backgroundColor="white"
              penColor="black"
              onEnd={handleEnd}
            />
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 size={16} />
              Temizle
            </button>
            
            <button
              type="button"
              onClick={save}
              disabled={disabled}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={16} />
              İmzayı Kaydet
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            * Parmağınız veya mouse ile imza atınız
          </p>
        </div>
      )}
    </div>
  );
};

export default SignatureCanvasComponent;
