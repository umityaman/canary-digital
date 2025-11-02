import React, { useState } from 'react';
import { X, Download, Mail, Printer, Eye, FileText } from 'lucide-react';
import type jsPDF from 'jspdf';
import { InvoiceData, InvoiceConfig, InvoiceTemplate } from './InvoiceTypes';
import { ModernInvoiceTemplate } from './ModernInvoiceTemplate';
import { ClassicInvoiceTemplate } from './ClassicInvoiceTemplate';
import { MinimalInvoiceTemplate } from './MinimalInvoiceTemplate';

interface InvoiceGeneratorProps {
  invoiceData: InvoiceData;
  onClose: () => void;
  onEmailSent?: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  invoiceData,
  onClose,
  onEmailSent,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>('modern');
  const [config, setConfig] = useState<InvoiceConfig>({
    template: 'modern',
    primaryColor: '#3b82f6',
    showLogo: false,
    showTax: true,
    currency: 'TRY',
    locale: 'tr-TR',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const templateInfo = {
    modern: {
      name: 'Modern',
      description: 'Renkli ve çağdaş tasarım',
      color: '#3b82f6',
      preview: '🎨',
    },
    classic: {
      name: 'Klasik',
      description: 'Geleneksel iş faturası',
      color: '#000000',
      preview: '📜',
    },
    minimal: {
      name: 'Minimal',
      description: 'Sade ve temiz görünüm',
      color: '#6b7280',
      preview: '✨',
    },
  };

  const generatePDF = async (): Promise<jsPDF | null> => {
    try {
      const { default: JsPDF } = await import('jspdf');
      const doc: jsPDF = new JsPDF('p', 'mm', 'a4');

      let template:
        | ModernInvoiceTemplate
        | ClassicInvoiceTemplate
        | MinimalInvoiceTemplate;

      switch (selectedTemplate) {
        case 'modern':
          template = new ModernInvoiceTemplate(doc, invoiceData, config);
          break;
        case 'classic':
          template = new ClassicInvoiceTemplate(doc, invoiceData, config);
          break;
        case 'minimal':
          template = new MinimalInvoiceTemplate(doc, invoiceData, config);
          break;
        default:
          template = new ModernInvoiceTemplate(doc, invoiceData, config);
      }

      return template.generate();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF oluşturulurken hata oluştu');
      return null;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save(`Fatura_${invoiceData.invoiceNumber}.pdf`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) {
        return;
      }
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const previewWindow = window.open(pdfUrl, '_blank');
      if (previewWindow) {
        previewWindow.addEventListener('beforeunload', () => {
          URL.revokeObjectURL(pdfUrl);
        });
      } else {
        URL.revokeObjectURL(pdfUrl);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) {
        return;
      }
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
        printWindow.addEventListener('beforeunload', () => {
          URL.revokeObjectURL(pdfUrl);
        });
      } else {
        URL.revokeObjectURL(pdfUrl);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmail = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) {
        return;
      }

      // Convert PDF to base64 for email attachment when API endpoint gets ready
      // const pdfBase64 = pdf.output('dataurlstring');

      // TODO: Send email via API endpoint
      // await api.post('/invoices/send-email', {
      //   to: invoiceData.customer.email,
      //   invoiceNumber: invoiceData.invoiceNumber,
      //   pdfData: pdfBase64,
      // });

      alert(`Fatura ${invoiceData.customer.email} adresine gönderilecek! (API endpoint hazırlanıyor)`);
      onEmailSent?.();
    } catch (error) {
      console.error('Email sending error:', error);
      alert('Email gönderilirken hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateChange = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setConfig({
      ...config,
      template,
      primaryColor: templateInfo[template].color,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-white" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Fatura Oluştur</h2>
              <p className="text-blue-100 text-sm">
                Fatura No: {invoiceData.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Template Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Fatura Şablonu Seçin
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(templateInfo) as InvoiceTemplate[]).map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateChange(template)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTemplate === template
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2 text-center">
                    {templateInfo[template].preview}
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">
                      {templateInfo[template].name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {templateInfo[template].description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Options */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Fatura Ayarları
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTax}
                  onChange={(e) => setConfig({ ...config, showTax: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">KDV Göster</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showLogo}
                  onChange={(e) => setConfig({ ...config, showLogo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Logo Göster</span>
              </label>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Fatura Özeti
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Müşteri:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {invoiceData.customer.name}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Toplam:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(invoiceData.total)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Kalem Sayısı:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {invoiceData.items.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Tarih:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {new Date(invoiceData.invoiceDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            İptal
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              disabled={isGenerating}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye size={18} />
              <span>Önizle</span>
            </button>
            
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={18} />
              <span>Yazdır</span>
            </button>
            
            <button
              onClick={handleEmail}
              disabled={isGenerating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={18} />
              <span>Email</span>
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              <span>İndir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
