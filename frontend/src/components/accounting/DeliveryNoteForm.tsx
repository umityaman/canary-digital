import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Truck, User, MapPin, Package, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DeliveryNoteFormProps {
  onClose: () => void
  onSuccess: () => void
  editNote?: any
}

interface DeliveryItem {
  id: string
  description: string
  quantity: number
  unit: string
}

interface Customer {
  id: number
  fullName: string
  address: string | null
}

interface Order {
  id: number
  orderNumber: string
  customerId: number
  items: Array<{
    equipment: {
      name: string
      model: string
    }
    quantity: number
  }>
}

export default function DeliveryNoteForm({ onClose, onSuccess, editNote }: DeliveryNoteFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerId: editNote?.customerId || '',
    orderId: editNote?.orderId || '',
    deliveryDate: editNote?.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    deliveryAddress: editNote?.deliveryAddress || '',
    notes: editNote?.notes || ''
  })
  const [items, setItems] = useState<DeliveryItem[]>(
    editNote?.items || [
      {
        id: '1',
        description: '',
        quantity: 1,
        unit: 'Adet'
      }
    ]
  )

  useEffect(() => {
    loadCustomers()
    loadOrders()
  }, [])

  useEffect(() => {
    // When customer changes, update address
    const selectedCustomer = customers.find(c => c.id === Number(formData.customerId))
    if (selectedCustomer && selectedCustomer.address && !formData.deliveryAddress) {
      setFormData(prev => ({ ...prev, deliveryAddress: selectedCustomer.address || '' }))
    }
  }, [formData.customerId, customers])

  useEffect(() => {
    // When order is selected, populate items
    if (formData.orderId) {
      const selectedOrder = orders.find(o => o.id === Number(formData.orderId))
      if (selectedOrder) {
        const orderItems: DeliveryItem[] = selectedOrder.items.map((item, index) => ({
          id: (index + 1).toString(),
          description: `${item.equipment.name} ${item.equipment.model}`,
          quantity: item.quantity,
          unit: 'Adet'
        }))
        setItems(orderItems)
        
        // Set customer if order has one
        if (selectedOrder.customerId && !formData.customerId) {
          setFormData(prev => ({ ...prev, customerId: selectedOrder.customerId.toString() }))
        }
      }
    }
  }, [formData.orderId, orders])

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to load customers')

      const data = await response.json()
      setCustomers(data.data || [])
    } catch (error: any) {
      console.error('Failed to load customers:', error)
      toast.error('Müşteriler yüklenemedi')
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to load orders')

      const data = await response.json()
      // Filter only confirmed/active orders
      const activeOrders = (data.data || []).filter(
        (order: any) => ['confirmed', 'ongoing'].includes(order.status)
      )
      setOrders(activeOrders)
    } catch (error: any) {
      console.error('Failed to load orders:', error)
      toast.error('Siparişler yüklenemedi')
    }
  }

  const handleAddItem = () => {
    const newItem: DeliveryItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit: 'Adet'
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error('En az bir kalem olmalı')
      return
    }
    setItems(items.filter(item => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof DeliveryItem, value: any) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.customerId) {
      toast.error('Lütfen müşteri seçin')
      return
    }

    if (!formData.deliveryAddress) {
      toast.error('Lütfen teslimat adresi girin')
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0)) {
      toast.error('Lütfen tüm kalem bilgilerini doldurun')
      return
    }

    setLoading(true)
    try {
      const deliveryData = {
        customerId: Number(formData.customerId),
        orderId: formData.orderId ? Number(formData.orderId) : null,
        deliveryDate: formData.deliveryDate,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit
        })),
        status: 'prepared'
      }

      // Mock - gerçek API ile değiştirilecek
      console.log('Delivery note data:', deliveryData)
      toast.success(editNote ? 'İrsaliye güncellendi' : 'İrsaliye oluşturuldu')
      onSuccess()
    } catch (error: any) {
      console.error('Failed to save delivery note:', error)
      toast.error('İrsaliye kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  const selectedCustomer = customers.find(c => c.id === Number(formData.customerId))
  const selectedOrder = orders.find(o => o.id === Number(formData.orderId))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {editNote ? 'İrsaliye Düzenle' : 'Yeni İrsaliye Oluştur'}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">Sevkiyat belgesi hazırlama</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          <span className="hidden sm:inline">{editNote ? 'Güncelle' : 'Kaydet'}</span>
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Order */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Selection */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Sipariş (Opsiyonel)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sipariş Seç
                </label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Siparişsiz İrsaliye</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                  <div>
                    <span className="text-neutral-900">Sipariş:</span>
                    <span className="ml-2 font-medium text-neutral-900">{selectedOrder.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-900">Kalem Sayısı:</span>
                    <span className="ml-2 font-medium text-neutral-900">{selectedOrder.items.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Selection */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Müşteri Bilgileri
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Müşteri *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                  disabled={!!selectedOrder}
                >
                  <option value="">Müşteri seçin</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                  <div>
                    <span className="text-neutral-600">Ad:</span>
                    <span className="ml-2 font-medium text-neutral-900">{selectedCustomer.fullName}</span>
                  </div>
                  {selectedCustomer.address && (
                    <div>
                      <span className="text-neutral-600">Kayıtlı Adres:</span>
                      <div className="font-medium text-neutral-900 mt-1">{selectedCustomer.address}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Truck size={20} />
              Teslimat Bilgileri
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Teslimat Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  Teslimat Adresi *
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  placeholder="Teslimat yapılacak adres..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  placeholder="Teslimat notları..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Package size={20} />
                Sevk Edilen Malzemeler
              </h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white text-sm rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <Plus size={16} />
                Kalem Ekle
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="bg-neutral-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Kalem {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 hover:bg-neutral-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-neutral-800" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Malzeme açıklaması *"
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        placeholder="Miktar"
                        min="1"
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />

                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                      >
                        <option value="Adet">Adet</option>
                        <option value="Set">Set</option>
                        <option value="Kutu">Kutu</option>
                        <option value="Paket">Paket</option>
                        <option value="Kg">Kg</option>
                        <option value="Lt">Lt</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">İrsaliye Özeti</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-neutral-700">
                <span>Toplam Kalem Çeşidi:</span>
                <span className="text-2xl font-bold text-neutral-900">{items.length}</span>
              </div>

              <div className="flex items-center justify-between text-neutral-700">
                <span>Toplam Miktar:</span>
                <span className="text-2xl font-bold text-neutral-900">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Teslimat Tarihi:</span>
                  <span className="font-semibold text-neutral-900">
                    {new Date(formData.deliveryDate).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

