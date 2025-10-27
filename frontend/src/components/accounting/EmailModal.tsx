import React, { useState, useCallback, useMemo } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { invoiceAPI, offerAPI } from '../../services/api';
import { generateInvoicePDFBase64, generateOfferPDFBase64 } from '../../utils/pdfGenerator';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'invoice' | 'offer';
  data: {
    id: number;
    number: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerCompany?: string;
    customerTaxNumber?: string;
    date: string;
    dueDate?: string; // for invoices
    validityDate?: string; // for offers
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      days?: number;
      discount?: number;
    }>;
    notes?: string;
    vatRate: number;
  };
}

const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type,
  data,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: data.customerEmail || '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.recipientEmail.trim()) {
      toast.error('E-posta adresi gerekli');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.recipientEmail)) {
      toast.error('Geçerli bir e-posta adresi girin');
      return;
    }

    try {
      setLoading(true);

      // Generate PDF as base64
      let pdfBuffer: string;
      
      if (type === 'invoice') {
        const invoicePdfData = {
          invoiceNumber: data.number,
          invoiceDate: data.date,
          dueDate: data.dueDate || data.date,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerCompany: data.customerCompany,
          customerTaxNumber: data.customerTaxNumber,
          items: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            days: item.days,
            discount: item.discount,
            vatRate: data.vatRate,
          })),
          notes: data.notes,
          vatRate: data.vatRate,
        };
        pdfBuffer = generateInvoicePDFBase64(invoicePdfData);
      } else {
        const offerPdfData = {
          offerNumber: data.number,
          offerDate: data.date,
          validityDate: data.validityDate || data.date,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerCompany: data.customerCompany,
          customerTaxNumber: data.customerTaxNumber,
          items: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            days: item.days,
            discount: item.discount,
            vatRate: data.vatRate,
          })),
          notes: data.notes,
          vatRate: data.vatRate,
        };
        pdfBuffer = generateOfferPDFBase64(offerPdfData);
      }

      // Send email
      const emailData = {
        recipientEmail: formData.recipientEmail,
        message: formData.message,
        pdfBuffer,
      };

      if (type === 'invoice') {
        await invoiceAPI.sendEmail(data.id, emailData);
        toast.success('Fatura e-posta ile gönderildi');
      } else {
        await offerAPI.sendEmail(data.id, emailData);
        toast.success('Teklif e-posta ile gönderildi');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error(error.response?.data?.message || 'E-posta gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {type === 'invoice' ? 'Fatura' : 'Teklif'} E-posta Gönder
              </h2>
              <p className="text-sm text-gray-500">
                {type === 'invoice' ? `Fatura #${data.number}` : `Teklif #${data.number}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recipient Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Alıcı Bilgileri</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Müşteri:</span> {data.customerName}
            </p>
            {data.customerCompany && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Şirket:</span> {data.customerCompany}
              </p>
            )}
            {data.customerPhone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Telefon:</span> {data.customerPhone}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) =>
                setFormData({ ...formData, recipientEmail: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ornek@email.com"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesaj (İsteğe bağlı)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E-posta ile birlikte gönderilecek ek mesaj..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Mail className="text-blue-600 flex-shrink-0" size={18} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">E-posta İçeriği:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>{type === 'invoice' ? 'Fatura' : 'Teklif'} detayları otomatik eklenecek</li>
                  <li>PDF belgesi ek olarak gönderilecek</li>
                  <li>Profesyonel e-posta şablonu kullanılacak</li>
                  {formData.message && <li>Eklediğiniz mesaj da dahil edilecek</li>}
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {loading ? 'Gönderiliyor...' : 'E-posta Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
