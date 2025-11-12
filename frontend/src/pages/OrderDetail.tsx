import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { useNotification } from '../contexts/NotificationContext';
import { 
  ArrowLeft, Calendar, User, Package, CreditCard, FileText, 
  Tag, Clock, Edit, Trash2, Send, Download, CheckCircle, XCircle,
  Check
} from 'lucide-react';

// Use normalized API_BASE_URL (always ends with /api)
const API_URL = API_BASE_URL;

interface OrderItem {
  id: number;
  equipmentId: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
  equipment?: {
    id: number;
    name: string;
    code: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  notes: string;
  tags: string;
  documents: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  orderItems: OrderItem[];
}

const statusColors: Record<string, string> = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'CONFIRMED': 'bg-blue-100 text-blue-800',
  'IN_PROGRESS': 'bg-purple-100 text-purple-800',
  'COMPLETED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  'payment_due': 'bg-orange-100 text-orange-800',
  'partially_paid': 'bg-yellow-100 text-yellow-800',
  'paid': 'bg-green-100 text-green-800',
  'refunded': 'bg-neutral-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  'PENDING': 'Beklemede',
  'CONFIRMED': 'Onaylandı',
  'IN_PROGRESS': 'Devam Ediyor',
  'COMPLETED': 'Tamamlandı',
  'CANCELLED': 'İptal Edildi',
};

const paymentStatusLabels: Record<string, string> = {
  'payment_due': 'Ödeme Bekliyor',
  'partially_paid': 'Kısmi Ödendi',
  'paid': 'Ödendi',
  'refunded': 'İade Edildi',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Payment form states
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expireMonth, setExpireMonth] = useState('');
  const [expireYear, setExpireYear] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Sipariş bulunamadı');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Durum güncellenemedi');
      }
      
      showNotification('success', 'Sipariş durumu başarıyla güncellendi');
      await fetchOrder();
      setShowStatusModal(false);
      setNewStatus('');
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Sipariş silinemedi');
      }
      
      showNotification('success', 'Sipariş başarıyla silindi');
      navigate('/orders');
    } catch (err: any) {
      showNotification('error', err.message);
      setActionLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!order) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/orders/${order.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient: order.customer.email,
          subject: `Sipariş Onayı - ${order.orderNumber}`,
          body: `Merhaba ${order.customer.name},\n\nSipariş numaranız: ${order.orderNumber}\nToplam tutar: £${order.totalAmount.toFixed(2)}\n\nTeşekkür ederiz.`
        })
      });
      
      if (!response.ok) {
        throw new Error('E-posta gönderilemedi');
      }
      
      showNotification('success', 'E-posta başarıyla gönderildi');
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    // Validation
    if (!cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvc) {
      showNotification('error', 'Lütfen tüm kart bilgilerini doldurun');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/orders/${order.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardHolderName,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expireMonth,
          expireYear,
          cvc,
          amount: order.totalAmount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ödeme işlemi başarısız oldu');
      }

      await response.json();
      showNotification('success', 'Ödeme başarıyla tamamlandı!');
      setShowPaymentModal(false);
      
      // Reset form
      setCardHolderName('');
      setCardNumber('');
      setExpireMonth('');
      setExpireYear('');
      setCvc('');
      
      // Refresh order
      await fetchOrder();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Sipariş Bulunamadı</h2>
        <p className="text-neutral-600 mb-4">{error || 'Sipariş mevcut değil'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Siparişlere Dön
        </button>
      </div>
    );
  }

  const tags = order.tags ? JSON.parse(order.tags) : [];
  const documents = order.documents ? JSON.parse(order.documents) : [];

  // Status timeline steps
  const statusSteps = [
    { key: 'PENDING', label: 'Oluşturuldu', icon: FileText },
    { key: 'CONFIRMED', label: 'Onaylandı', icon: CheckCircle },
    { key: 'IN_PROGRESS', label: 'Teslim Edildi', icon: Package },
    { key: 'COMPLETED', label: 'Tamamlandı', icon: Check }
  ];

  const getStatusIndex = (status: string) => {
    const index = statusSteps.findIndex(s => s.key === status);
    return index === -1 ? 0 : index;
  };

  const currentStatusIndex = getStatusIndex(order.status);

  // Payment calculation
  const totalAmount = order.totalAmount;
  const paidAmount = order.paymentStatus === 'paid' ? totalAmount : 
                     order.paymentStatus === 'partially_paid' ? totalAmount * 0.5 : 0;
  const remainingAmount = totalAmount - paidAmount;
  const paymentPercentage = (paidAmount / totalAmount) * 100;

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/orders')}
            className="mr-4 p-2 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">Oluşturma: {new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.paymentStatus !== 'paid' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Ödeme Al
            </button>
          )}
          <button
            onClick={handleSendEmail}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            E-posta Gönder
          </button>
          <button
            onClick={() => {
              const token = localStorage.getItem('auth_token');
              window.open(`${API_URL}/orders/${order.id}/invoice?token=${token}`, '_blank');
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Fatura İndir
          </button>
          <button
            onClick={() => navigate(`/orders/edit/${order.id}`)}
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Düzenle
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Durum</h2>
              <button
                onClick={() => {
                  setNewStatus(order.status);
                  setShowStatusModal(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Durumu Güncelle
              </button>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Sipariş Durumu</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-neutral-100 text-gray-800'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Ödeme Durumu</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[order.paymentStatus] || 'bg-neutral-100 text-gray-800'}`}>
                  {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-4">Sipariş Süreci</h3>
              <div className="relative">
                {statusSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <div key={step.key} className="flex items-start mb-4 last:mb-0">
                      {/* Line connector */}
                      {index < statusSteps.length - 1 && (
                        <div 
                          className={`absolute left-6 top-12 w-0.5 h-16 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ marginTop: `${index * 80}px` }}
                        />
                      )}
                      
                      {/* Icon */}
                      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-neutral-300 text-gray-400'
                      }`}>
                        <StepIcon size={20} />
                      </div>
                      
                      {/* Content */}
                      <div className="ml-4 flex-1">
                        <p className={`font-medium ${isCurrent ? 'text-green-600' : isCompleted ? 'text-neutral-900' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-gray-500 mt-1">Şu anki durum</p>
                        )}
                        {isCompleted && !isCurrent && (
                          <p className="text-xs text-gray-400 mt-1">Tamamlandı</p>
                        )}
                      </div>
                      
                      {/* Date */}
                      {isCompleted && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(order.updatedAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Progress Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Ödeme Takibi</h2>
            </div>
            
            {/* Payment Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600">Ödenen Tutar</span>
                <span className="font-semibold text-green-600">£{paidAmount.toFixed(2)} / £{totalAmount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{paymentPercentage.toFixed(0)}% Tamamlandı</span>
                {remainingAmount > 0 && <span>Kalan: £{remainingAmount.toFixed(2)}</span>}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-green-500' : 
                    order.paymentStatus === 'partially_paid' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-neutral-600">Toplam Tutar</span>
                </div>
                <span className="font-bold text-neutral-900">£{totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600 ml-5">Ödenen</span>
                <span className="font-medium text-green-600">£{paidAmount.toFixed(2)}</span>
              </div>
              
              {remainingAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 ml-5">Kalan Bakiye</span>
                  <span className="font-medium text-orange-600">£{remainingAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Payment Action Button */}
            {order.paymentStatus !== 'paid' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full mt-4 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Ödeme Al (£{remainingAmount.toFixed(2)})
              </button>
            )}
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Müşteri Bilgileri</h2>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">İsim</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              {order.customer.company && (
                <div>
                  <p className="text-sm text-gray-500">Şirket</p>
                  <p className="font-medium">{order.customer.company}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">E-posta</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Sipariş Kalemleri</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Ürün</th>
                    <th className="pb-3 font-medium text-center">Miktar</th>
                    <th className="pb-3 font-medium text-right">Birim Fiyat</th>
                    <th className="pb-3 font-medium text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium">{item.description}</p>
                        {item.equipment && (
                          <p className="text-sm text-gray-500">{item.equipment.code}</p>
                        )}
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">£{item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-medium">£{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pricing Summary */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Alt Toplam</span>
                <span>£{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>İndirim</span>
                  <span>-£{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">KDV</span>
                  <span>£{order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Toplam</span>
                <span>£{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Notlar</h2>
              </div>
              <p className="text-neutral-700 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Tarihler</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Başlangıç</p>
                <p className="font-medium">{new Date(order.startDate).toLocaleDateString('tr-TR', { 
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bitiş</p>
                <p className="font-medium">{new Date(order.endDate).toLocaleDateString('tr-TR', { 
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Süre</p>
                <p className="font-medium">
                  {Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24))} gün
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Etiketler</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Dökümanlar</h2>
              </div>
              <div className="space-y-2">
                {documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Aktivite</h2>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Sipariş Oluşturuldu</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Güncellendi</p>
                    <p className="text-xs text-gray-500">{new Date(order.updatedAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Durumu Güncelle</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-4"
            >
              <option value="PENDING">Beklemede</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="IN_PROGRESS">Devam Ediyor</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Siparişi Sil</h3>
            <p className="text-neutral-600 mb-4">Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Ödeme Al</h3>
            </div>
            
            <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-600">Sipariş No:</span>
                <span className="font-medium">{order?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Toplam Tutar:</span>
                <span className="font-bold text-lg text-green-600">£{order?.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Kart Üzerindeki İsim
                </label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Kart Numarası
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (value.length <= 16) {
                      setCardNumber(value.replace(/(.{4})/g, '$1 ').trim());
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Ay
                  </label>
                  <input
                    type="text"
                    value={expireMonth}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 2 && parseInt(value) <= 12) {
                        setExpireMonth(value);
                      }
                    }}
                    placeholder="MM"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Yıl
                  </label>
                  <input
                    type="text"
                    value={expireYear}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setExpireYear(value);
                      }
                    }}
                    placeholder="YYYY"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCvc(value);
                      }
                    }}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setCardHolderName('');
                  setCardNumber('');
                  setExpireMonth('');
                  setExpireYear('');
                  setCvc('');
                }}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handlePayment}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
