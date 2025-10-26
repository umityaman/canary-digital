import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, FileDown, Mail } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import EmailModal from './EmailModal';

interface InvoiceItem {
  id?: number;
  equipmentId?: number;
  equipmentName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  days: number;
  discountPercentage: number;
  subtotal: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  taxNumber?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customer: Customer;
  startDate: string;
  endDate: string;
  orderItems: Array<{
    equipment: {
      id: number;
      name: string;
      dailyPrice: number;
    };
    quantity: number;
  }>;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingInvoice?: any | null;
  orderId?: number;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingInvoice,
  orderId 
}) => {
  const [loading, setLoading] = useState(false);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const [formData, setFormData] = useState({
    orderId: orderId || 0,
    customerId: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    customerTaxNumber: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'rental' as 'rental' | 'sale' | 'service',
    vatRate: 20,
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      equipmentName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      days: 1,
      discountPercentage: 0,
      subtotal: 0,
    },
  ]);

  useEffect(() => {
    if (editingInvoice) {
      loadInvoiceData(editingInvoice);
    } else if (orderId) {
      loadOrderData(orderId);
    }
  }, [editingInvoice, orderId]);

  const loadInvoiceData = async (invoice: any) => {
    setFormData({
      orderId: invoice.orderId || 0,
      customerId: invoice.customer?.id || 0,
      customerName: invoice.customer?.name || '',
      customerEmail: invoice.customer?.email || '',
      customerPhone: invoice.customer?.phone || '',
      customerCompany: invoice.customer?.company || '',
      customerTaxNumber: invoice.customer?.taxNumber || '',
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceDate: invoice.invoiceDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      type: invoice.type || 'rental',
      vatRate: 20,
      notes: invoice.notes || '',
    });

    // Load invoice items if available
    if (invoice.order?.orderItems) {
      const invoiceItems = invoice.order.orderItems.map((item: any) => ({
        equipmentId: item.equipment?.id,
        equipmentName: item.equipment?.name || '',
        description: item.equipment?.name || '',
        quantity: item.quantity || 1,
        unitPrice: item.dailyRate || 0,
        days: 1,
        discountPercentage: 0,
        subtotal: (item.quantity || 1) * (item.dailyRate || 0),
      }));
      setItems(invoiceItems);
    }
  };

  const loadOrderData = async (id: number) => {
    try {
      setSearchingOrder(true);
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedOrder(data.data);
        fillFromOrder(data.data);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Sipariş yüklenemedi');
    } finally {
      setSearchingOrder(false);
    }
  };

  const fillFromOrder = (order: Order) => {
    setFormData({
      ...formData,
      orderId: order.id,
      customerId: order.customer.id,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      customerCompany: order.customer.company || '',
      customerTaxNumber: order.customer.taxNumber || '',
    });

    // Calculate days from order dates
    const start = new Date(order.startDate);
    const end = new Date(order.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    const orderItems = order.orderItems.map((item) => ({
      equipmentId: item.equipment.id,
      equipmentName: item.equipment.name,
      description: item.equipment.name,
      quantity: item.quantity,
      unitPrice: item.equipment.dailyPrice || 0,
      days,
      discountPercentage: 0,
      subtotal: item.quantity * (item.equipment.dailyPrice || 0) * days,
    }));

    setItems(orderItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        equipmentName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        days: 1,
        discountPercentage: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error('En az bir kalem olmalı');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate subtotal
    const item = updatedItems[index];
    const baseAmount = item.quantity * item.unitPrice * item.days;
    const discountAmount = baseAmount * (item.discountPercentage / 100);
    item.subtotal = baseAmount - discountAmount;
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const vatAmount = subtotal * (formData.vatRate / 100);
    const grandTotal = subtotal + vatAmount;
    
    return { subtotal, vatAmount, grandTotal };
  };

  const handleDownloadPDF = () => {
    // Validation
    if (!formData.customerName.trim()) {
      toast.error('Müşteri adı gerekli');
      return;
    }

    if (items.some((item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error('Tüm kalem bilgilerini eksiksiz doldurun');
      return;
    }

    try {
      const pdfData = {
        invoiceNumber: formData.invoiceNumber || 'DRAFT',
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerCompany: formData.customerCompany,
        customerTaxNumber: formData.customerTaxNumber,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          days: item.days,
          discount: item.discountPercentage,
          vatRate: formData.vatRate,
        })),
        notes: formData.notes,
        vatRate: formData.vatRate,
      };

      generateInvoicePDF(pdfData);
      toast.success('PDF indirildi');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('PDF oluşturulamadı');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName.trim()) {
      toast.error('Müşteri adı gerekli');
      return;
    }

    if (items.some((item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error('Tüm kalem bilgilerini eksiksiz doldurun');
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();

      const payload = {
        orderId: formData.orderId || null,
        customerId: formData.customerId || null,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerCompany: formData.customerCompany,
        customerTaxNumber: formData.customerTaxNumber,
        invoiceNumber: formData.invoiceNumber || undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        type: formData.type,
        items: items.map((item) => ({
          equipmentId: item.equipmentId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          days: item.days,
          discountPercentage: item.discountPercentage,
        })),
        totalAmount: totals.subtotal,
        vatAmount: totals.vatAmount,
        grandTotal: totals.grandTotal,
        notes: formData.notes,
      };

      if (editingInvoice) {
        await invoiceAPI.update(editingInvoice.id, payload);
        toast.success('Fatura güncellendi');
      } else {
        await invoiceAPI.create(payload);
        toast.success('Fatura oluşturuldu');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      toast.error(error.response?.data?.message || 'Fatura kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingInvoice ? 'Fatura Düzenle' : 'Yeni Fatura'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Order Search */}
          {!editingInvoice && !orderId && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Ara (Opsiyonel)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Sipariş numarası ile ara..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedOrder && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Sipariş #{selectedOrder.orderNumber} yüklendi
                </div>
              )}
            </div>
          )}

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket
                </label>
                <input
                  type="text"
                  value={formData.customerCompany}
                  onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vergi Numarası
                </label>
                <input
                  type="text"
                  value={formData.customerTaxNumber}
                  onChange={(e) => setFormData({ ...formData, customerTaxNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fatura Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fatura No (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Otomatik oluşturulacak"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fatura Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vade Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fatura Tipi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rental">Kiralama</option>
                  <option value="sale">Satış</option>
                  <option value="service">Hizmet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KDV Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.vatRate}
                  onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Kalemler</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Kalem Ekle
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Açıklama</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Miktar</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Birim Fiyat</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Gün</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">İndirim %</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Toplam</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Ekipman/Hizmet açıklaması"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.days}
                          onChange={(e) => updateItem(index, 'days', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercentage}
                          onChange={(e) => updateItem(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium">
                        ₺{item.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={items.length === 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mb-6 bg-gray-50 rounded-xl p-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam:</span>
                <span className="font-medium">₺{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">KDV ({formData.vatRate}%):</span>
                <span className="font-medium">₺{totals.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Genel Toplam:</span>
                <span className="text-blue-600">₺{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Fatura hakkında notlar..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              disabled={loading}
            >
              <FileDown size={18} />
              PDF İndir
            </button>
            
            {editingInvoice && (
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                disabled={loading}
              >
                <Mail size={18} />
                E-posta Gönder
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kaydediliyor...' : editingInvoice ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Email Modal */}
      {showEmailModal && editingInvoice && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => {
            setShowEmailModal(false);
            toast.success('E-posta başarıyla gönderildi');
          }}
          type="invoice"
          data={{
            id: editingInvoice.id,
            number: formData.invoiceNumber || editingInvoice.invoiceNumber,
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            customerCompany: formData.customerCompany,
            customerTaxNumber: formData.customerTaxNumber,
            date: formData.invoiceDate,
            dueDate: formData.dueDate,
            items: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              days: item.days,
              discount: item.discountPercentage,
            })),
            notes: formData.notes,
            vatRate: formData.vatRate,
          }}
        />
      )}
    </div>
  );
};

export default InvoiceModal;
