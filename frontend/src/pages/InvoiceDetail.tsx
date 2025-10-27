import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Mail,
  Download,
  CreditCard,
  Calendar,
  User,
  Phone,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  FileCheck,
} from 'lucide-react';
import { invoiceAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import EmailModal from '../components/accounting/EmailModal';
import PaymentModal from '../components/accounting/PaymentModal';

interface InvoiceDetail {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  type: 'rental' | 'sale' | 'service';
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxNumber?: string;
  };
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    days: number;
    discountPercentage: number;
    subtotal: number;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
  }>;
  order?: {
    id: number;
    orderNumber: string;
  };
}

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [eInvoiceLoading, setEInvoiceLoading] = useState(false);
  const [eInvoiceStatus, setEInvoiceStatus] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoiceDetails();
    }
  }, [id]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getById(parseInt(id!));
      setInvoice(response.data);
    } catch (error: any) {
      console.error('Failed to load invoice:', error);
      toast.error('Fatura yüklenemedi');
      navigate('/accounting');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;

    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      customerName: invoice.customer.name,
      customerEmail: invoice.customer.email,
      customerPhone: invoice.customer.phone,
      customerCompany: invoice.customer.company,
      customerTaxNumber: invoice.customer.taxNumber,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        days: item.days,
        discount: item.discountPercentage,
        vatRate: 20,
      })),
      notes: invoice.notes,
      vatRate: 20,
    };

    generateInvoicePDF(pdfData);
    toast.success('PDF indirildi');
  };

  const handleGenerateEInvoice = async () => {
    if (!invoice) return;

    try {
      setEInvoiceLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/einvoice/generate/${invoice.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('E-Fatura oluşturulamadı');

      const data = await response.json();
      toast.success('E-Fatura XML başarıyla oluşturuldu');
      setEInvoiceStatus('draft');
    } catch (error: any) {
      console.error('E-Fatura oluşturma hatası:', error);
      toast.error(error.message || 'E-Fatura oluşturulurken hata oluştu');
    } finally {
      setEInvoiceLoading(false);
    }
  };

  const handleSendToGIB = async () => {
    if (!invoice) return;

    try {
      setEInvoiceLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/einvoice/send/${invoice.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('E-Fatura gönderilemedi');

      const data = await response.json();
      toast.success('E-Fatura GİB\'e gönderildi (MOCK)');
      setEInvoiceStatus('sent');
    } catch (error: any) {
      console.error('E-Fatura gönderme hatası:', error);
      toast.error(error.message || 'E-Fatura gönderilirken hata oluştu');
    } finally {
      setEInvoiceLoading(false);
    }
  };

  const handleCheckEInvoiceStatus = async () => {
    if (!invoice) return;

    try {
      setEInvoiceLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/einvoice/status/${invoice.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('E-Fatura durumu sorgulanamadı');

      const data = await response.json();
      setEInvoiceStatus(data.data.status);
      toast.success(`E-Fatura Durumu: ${data.data.status}`);
    } catch (error: any) {
      console.error('E-Fatura durum sorgulama hatası:', error);
      toast.error(error.message || 'Durum sorgulanırken hata oluştu');
    } finally {
      setEInvoiceLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          icon: CheckCircle,
          text: 'Ödendi',
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Beklemede',
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
        };
      case 'overdue':
        return {
          icon: AlertCircle,
          text: 'Gecikmiş',
          color: 'text-red-600',
          bg: 'bg-red-100',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          text: 'İptal',
          color: 'text-gray-600',
          bg: 'bg-gray-100',
        };
      default:
        return {
          icon: Clock,
          text: 'Bilinmiyor',
          color: 'text-gray-600',
          bg: 'bg-gray-100',
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Card Skeleton 1 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Card Skeleton 2 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Fatura Bulunamadı
          </h2>
          <button
            onClick={() => navigate('/accounting')}
            className="text-blue-600 hover:underline"
          >
            Muhasebe sayfasına dön
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(invoice.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/accounting')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Fatura #{invoice.invoiceNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* E-Invoice Butonları */}
              {!eInvoiceStatus && (
                <button
                  onClick={handleGenerateEInvoice}
                  disabled={eInvoiceLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <FileCheck size={18} />
                  {eInvoiceLoading ? 'Oluşturuluyor...' : 'E-Fatura Oluştur'}
                </button>
              )}
              {eInvoiceStatus === 'draft' && (
                <button
                  onClick={handleSendToGIB}
                  disabled={eInvoiceLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                  {eInvoiceLoading ? 'Gönderiliyor...' : 'GİB\'e Gönder'}
                </button>
              )}
              {eInvoiceStatus && eInvoiceStatus !== 'draft' && (
                <button
                  onClick={handleCheckEInvoiceStatus}
                  disabled={eInvoiceLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <FileCheck size={18} />
                  {eInvoiceLoading ? 'Sorgulanıyor...' : 'Durum Sorgula'}
                </button>
              )}

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                PDF İndir
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Mail size={18} />
                E-posta Gönder
              </button>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CreditCard size={18} />
                  Ödeme Kaydet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Fatura Bilgileri
                </h2>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                  <statusInfo.icon size={16} className={statusInfo.color} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fatura Numarası</p>
                  <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fatura Tarihi</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(invoice.invoiceDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vade Tarihi</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fatura Tipi</p>
                  <p className="font-medium text-gray-900">
                    {invoice.type === 'rental'
                      ? 'Kiralama'
                      : invoice.type === 'sale'
                      ? 'Satış'
                      : 'Hizmet'}
                  </p>
                </div>
                {invoice.order && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sipariş No</p>
                    <p className="font-medium text-blue-600">
                      #{invoice.order.orderNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Müşteri Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Müşteri Adı</p>
                    <p className="font-medium text-gray-900">{invoice.customer.name}</p>
                  </div>
                </div>
                {invoice.customer.company && (
                  <div className="flex items-start gap-3">
                    <Building2 className="text-gray-400 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Şirket</p>
                      <p className="font-medium text-gray-900">
                        {invoice.customer.company}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Mail className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium text-gray-900">{invoice.customer.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-gray-400 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium text-gray-900">{invoice.customer.phone}</p>
                  </div>
                </div>
                {invoice.customer.taxNumber && (
                  <div className="flex items-start gap-3">
                    <FileText className="text-gray-400 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Vergi Numarası</p>
                      <p className="font-medium text-gray-900">
                        {invoice.customer.taxNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Fatura Kalemleri</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gün
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birim Fiyat
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İndirim
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toplam
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                          {item.days || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                          {item.discountPercentage > 0
                            ? `${item.discountPercentage}%`
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="max-w-md ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">KDV (%20)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoice.vatAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span className="text-gray-900">Genel Toplam</span>
                    <span className="text-blue-600">
                      {formatCurrency(invoice.grandTotal)}
                    </span>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Ödenen</span>
                        <span className="font-medium">
                          {formatCurrency(invoice.paidAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Kalan</span>
                        <span className="font-medium">
                          {formatCurrency(invoice.remainingAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Notlar</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ödeme Özeti
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Toplam Tutar</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ödenen</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(invoice.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Kalan</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(invoice.remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Ödeme İlerlemesi</span>
                  <span>
                    {Math.round((invoice.paidAmount / invoice.grandTotal) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (invoice.paidAmount / invoice.grandTotal) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {invoice.payments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ödeme Geçmişi
                </h3>
                <div className="space-y-4">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="text-green-600" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(payment.paymentDate)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-500 mt-1">
                            İşlem: {payment.transactionId}
                          </p>
                        )}
                        {payment.notes && (
                          <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => {
            setShowEmailModal(false);
            toast.success('E-posta gönderildi');
          }}
          type="invoice"
          data={{
            id: invoice.id,
            number: invoice.invoiceNumber,
            customerName: invoice.customer.name,
            customerEmail: invoice.customer.email,
            customerPhone: invoice.customer.phone,
            customerCompany: invoice.customer.company,
            customerTaxNumber: invoice.customer.taxNumber,
            date: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            items: invoice.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              days: item.days,
              discount: item.discountPercentage,
            })),
            notes: invoice.notes,
            vatRate: 20,
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadInvoiceDetails(); // Reload to get updated payment info
          }}
          invoice={{
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            grandTotal: invoice.grandTotal,
            paidAmount: invoice.paidAmount,
            remainingAmount: invoice.remainingAmount,
          }}
        />
      )}
    </div>
  );
};

export default InvoiceDetail;
