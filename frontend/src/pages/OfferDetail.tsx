import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Mail,
  Download,
  Calendar,
  User,
  Phone,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { offerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { generateOfferPDF } from '../utils/pdfGenerator';
import EmailModal from '../components/accounting/EmailModal';

interface OfferDetail {
  id: number;
  offerNumber: string;
  offerDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
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
    total: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const OfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  useEffect(() => {
    loadOfferDetails();
  }, [id]);

  const loadOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getById(Number(id));
      setOffer(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Teklif detayları yüklenemedi');
      navigate('/accounting');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await offerAPI.updateStatus(Number(id), newStatus);
      toast.success('Teklif durumu güncellendi');
      loadOfferDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    }
  };

  const handleDownloadPDF = () => {
    if (!offer) return;
    generateOfferPDF(offer);
    toast.success('PDF indiriliyor...');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      draft: {
        label: 'Taslak',
        color: 'bg-gray-100 text-gray-800 border border-gray-300',
        icon: <FileText className="w-4 h-4" />,
      },
      sent: {
        label: 'Gönderildi',
        color: 'bg-blue-100 text-blue-800 border border-blue-300',
        icon: <Mail className="w-4 h-4" />,
      },
      accepted: {
        label: 'Kabul Edildi',
        color: 'bg-green-100 text-green-800 border border-green-300',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        label: 'Reddedildi',
        color: 'bg-red-100 text-red-800 border border-red-300',
        icon: <XCircle className="w-4 h-4" />,
      },
      expired: {
        label: 'Süresi Doldu',
        color: 'bg-orange-100 text-orange-800 border border-orange-300',
        icon: <AlertCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isValidityExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getDaysUntilExpiry = (validUntil: string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Teklif bulunamadı</h2>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(offer.validUntil);
  const isExpired = isValidityExpired(offer.validUntil);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/accounting')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {offer.offerNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatDate(offer.offerDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PDF İndir</span>
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>E-posta Gönder</span>
              </button>
              {offer.status === 'accepted' && (
                <button
                  onClick={() => setShowConvertModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Faturaya Dönüştür</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Teklif Bilgileri</h2>
                {getStatusBadge(offer.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teklif Numarası</p>
                  <p className="text-base font-medium text-gray-900">{offer.offerNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teklif Tarihi</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(offer.offerDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Geçerlilik Tarihi</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-base font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(offer.validUntil)}
                    </p>
                    {!isExpired && daysUntilExpiry <= 7 && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                        {daysUntilExpiry} gün kaldı
                      </span>
                    )}
                    {isExpired && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        Süresi doldu
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Durum</p>
                  {offer.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange('sent')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Gönderildi olarak işaretle →
                    </button>
                  )}
                  {offer.status === 'sent' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange('accepted')}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Kabul Et
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => handleStatusChange('rejected')}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                  {(offer.status === 'accepted' || offer.status === 'rejected' || offer.status === 'expired') && (
                    <p className="text-base font-medium text-gray-900">
                      {offer.status === 'accepted' && 'Kabul Edildi'}
                      {offer.status === 'rejected' && 'Reddedildi'}
                      {offer.status === 'expired' && 'Süresi Doldu'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Müşteri Adı</p>
                    <p className="text-base font-medium text-gray-900">{offer.customer.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="text-base font-medium text-gray-900">{offer.customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="text-base font-medium text-gray-900">{offer.customer.phone}</p>
                  </div>
                </div>

                {offer.customer.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Şirket</p>
                      <p className="text-base font-medium text-gray-900">{offer.customer.company}</p>
                    </div>
                  </div>
                )}

                {offer.customer.taxNumber && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Vergi Numarası</p>
                      <p className="text-base font-medium text-gray-900">{offer.customer.taxNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Teklif Kalemleri</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gün
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birim Fiyat
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İndirim
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toplam
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {offer.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-gray-900">{item.quantity}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-gray-900">{item.days}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-gray-900">{formatCurrency(item.unitPrice)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-gray-900">
                            {item.discountPercentage > 0 ? `%${item.discountPercentage}` : '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(item.total)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ara Toplam:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(offer.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">KDV (%20):</span>
                      <span className="font-medium text-gray-900">{formatCurrency(offer.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                      <span className="text-gray-900">Genel Toplam:</span>
                      <span className="text-blue-600">{formatCurrency(offer.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {offer.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Notlar</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{offer.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Status Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teklif Özeti</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Toplam Tutar</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(offer.grandTotal)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Durum:</span>
                    <span className="font-medium text-gray-900">
                      {offer.status === 'draft' && 'Taslak'}
                      {offer.status === 'sent' && 'Gönderildi'}
                      {offer.status === 'accepted' && 'Kabul Edildi'}
                      {offer.status === 'rejected' && 'Reddedildi'}
                      {offer.status === 'expired' && 'Süresi Doldu'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Oluşturulma:</span>
                    <span className="font-medium text-gray-900">{formatDate(offer.createdAt)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Son Güncelleme:</span>
                    <span className="font-medium text-gray-900">{formatDate(offer.updatedAt)}</span>
                  </div>
                </div>

                {/* Validity Warning */}
                {!isExpired && daysUntilExpiry <= 7 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex gap-2">
                      <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Geçerlilik Uyarısı</p>
                        <p className="text-xs text-orange-700 mt-1">
                          Bu teklifin süresi {daysUntilExpiry} gün içinde dolacak
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isExpired && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Süre Doldu</p>
                        <p className="text-xs text-red-700 mt-1">
                          Bu teklifin geçerlilik süresi dolmuş
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {offer.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange('sent')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Gönderildi Olarak İşaretle
                    </button>
                  )}

                  {offer.status === 'sent' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('accepted')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Kabul Edildi
                      </button>
                      <button
                        onClick={() => handleStatusChange('rejected')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reddedildi
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          type="offer"
          data={offer}
        />
      )}

      {/* Convert to Invoice Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Faturaya Dönüştür</h3>
                <p className="text-sm text-gray-500">Teklif No: {offer.offerNumber}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Bu teklifi faturaya dönüştürmek için önce bir sipariş oluşturmalısınız. 
                Sipariş modülünden yeni sipariş oluşturun ve ardından bu teklifi faturaya dönüştürebilirsiniz.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConvertModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  navigate('/orders?action=create');
                  setShowConvertModal(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sipariş Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetail;
