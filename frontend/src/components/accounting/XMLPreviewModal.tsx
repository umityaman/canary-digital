import React, { useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface XMLPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  xmlContent: string;
  invoiceNumber: string;
}

const XMLPreviewModal: React.FC<XMLPreviewModalProps> = ({
  isOpen,
  onClose,
  xmlContent,
  invoiceNumber,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-fatura-${invoiceNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('XML dosyası indirildi');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      toast.success('XML panoya kopyalandı');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Kopyalama başarısız');
    }
  };

  // Syntax highlighting için basit formatter
  const formatXML = (xml: string) => {
    return xml
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?[\w:]+)/g, '<span class="text-blue-600 font-semibold">$1</span>')
      .replace(/(&gt;)/g, '<span class="text-blue-600 font-semibold">$1</span>')
      .replace(/="([^"]*)"/g, '=<span class="text-green-600">"$1"</span>')
      .replace(/(&lt;\?xml[^?]*\?&gt;)/g, '<span class="text-purple-600">$1</span>');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">E-Fatura XML</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fatura #{invoiceNumber} - UBL-TR 1.2 Format
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-green-600">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span className="text-sm font-medium">Kopyala</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download size={18} />
              <span className="text-sm font-medium">İndir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
            <pre
              className="whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: formatXML(xmlContent) }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Format:</span> UBL-TR 1.2 (Türkiye GİB Standardı)
            </div>
            <div>
              <span className="font-medium">Boyut:</span>{' '}
              {(new Blob([xmlContent]).size / 1024).toFixed(2)} KB
            </div>
            <div>
              <span className="font-medium">Satır:</span>{' '}
              {xmlContent.split('\n').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XMLPreviewModal;
