import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, User, Calendar, FileText, DollarSign, Percent, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { invoiceAPI, equipmentAPI } from '../services/api'
import FormSkeleton from '../components/ui/FormSkeleton'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  equipmentId?: number
  total: number
  taxAmount: number
  grandTotal: number
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
}

interface Equipment {
  id: number
  name: string
  serialNumber: string
  price: number
}

const TAX_RATES = [
  { value: 0, label: '%0' },
  { value: 1, label: '%1' },
  { value: 8, label: '%8' },
  { value: 10, label: '%10' },
  { value: 20, label: '%20' }
]

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [invoiceType, setInvoiceType] = useState<'corporate' | 'individual'>('corporate')
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    discountPercentage: 0,
    withholding: 0,
    status: 'pending' as 'pending' | 'paid' | 'overdue' | 'cancelled'
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 20, total: 0, taxAmount: 0, grandTotal: 0 }
  ])

  useEffect(() => {
    loadCustomers()
    loadEquipments()
    if (isEdit) {
      loadInvoice()
    }
  }, [id])

  const loadCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
      setCustomers(response.data.data || response.data || [])
    } catch (error) {
      console.error('Failed to load customers:', error)
      toast.error('Müşteriler yüklenemedi')
    }
  }

  const loadEquipments = async () => {
    try {
      const response = await equipmentAPI.getAll()
      setEquipments(response.data.data || response.data || [])
    } catch (error) {
      console.error('Failed to load equipments:', error)
    }
  }

  // Customer search filter
  const handleCustomerSearch = (value: string) => {
    setCustomerSearch(value)
    if (value.trim().length > 0) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.email?.toLowerCase().includes(value.toLowerCase()) ||
        customer.phone?.includes(value) ||
        customer.taxNumber?.includes(value)
      )
      setFilteredCustomers(filtered)
      setShowCustomerDropdown(true)
    } else {
      setFilteredCustomers([])
      setShowCustomerDropdown(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setFormData({ ...formData, customerId: customer.id.toString() })
    setShowCustomerDropdown(false)
  }

  // Due date quick select
  const handleDueDateQuickSelect = (days: number) => {
    const issueDate = new Date(formData.issueDate)
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + days)
    setFormData({ ...formData, dueDate: dueDate.toISOString().split('T')[0] })
  }

  const loadInvoice = async () => {
    try {
      setLoading(true)
      const response = await invoiceAPI.getById(parseInt(id!))
      const invoice = response.data
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        issueDate: invoice.issueDate.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        notes: invoice.notes || '',
        discountPercentage: invoice.discountPercentage || 0,
        withholding: invoice.withholding || 0,
        status: invoice.status
      })
      setItems(invoice.items || [])
    } catch (error) {
      console.error('Failed to load invoice:', error)
      toast.error('Fatura yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 20,
      total: 0,
      taxAmount: 0,
      grandTotal: 0
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error('En az bir ürün olmalıdır')
      return
    }
    setItems(items.filter(item => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        updated.total = updated.quantity * updated.unitPrice
        updated.taxAmount = updated.total * (updated.taxRate / 100)
        updated.grandTotal = updated.total + updated.taxAmount
        return updated
      }
      return item
    }))
  }

  const handleEquipmentSelect = (id: string, equipmentId: number) => {
    const equipment = equipments.find(e => e.id === equipmentId)
    if (equipment) {
      handleItemChange(id, 'description', equipment.name)
      handleItemChange(id, 'unitPrice', equipment.price)
      handleItemChange(id, 'equipmentId', equipmentId)
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => sum + item.taxAmount, 0)
  }

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal()
    return subtotal * (formData.discountPercentage / 100)
  }

  const calculateWithholdingAmount = () => {
    const subtotal = calculateSubtotal()
    return subtotal * (formData.withholding / 100)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTotalTax()
    const discountAmount = calculateDiscountAmount()
    const withholdingAmount = calculateWithholdingAmount()
    return subtotal + taxAmount - discountAmount - withholdingAmount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      toast.error('Lütfen müşteri seçin')
      return
    }

    if (!formData.invoiceNumber) {
      toast.error('Lütfen fatura numarası girin')
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Lütfen tüm ürün bilgilerini doldurun')
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...formData,
        customerId: parseInt(formData.customerId as any),
        invoiceType,
        items,
        subtotal: calculateSubtotal(),
        taxAmount: calculateTotalTax(),
        discountAmount: calculateDiscountAmount(),
        withholdingAmount: calculateWithholdingAmount(),
        totalAmount: calculateTotal()
      }

      if (isEdit) {
        await axios.put(`${API_URL}/invoices/${id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        })
        toast.success('Fatura güncellendi')
      } else {
        await axios.post(`${API_URL}/invoices`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        })
        toast.success('Fatura oluşturuldu')
      }
      
      navigate('/accounting?tab=invoice')
    } catch (error: any) {
      console.error('Failed to save invoice:', error)
      toast.error(error.response?.data?.message || 'Fatura kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <FormSkeleton />
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/accounting?tab=invoice')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {isEdit ? 'Fatura Düzenle' : 'Yeni Fatura Oluştur'}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Fatura bilgilerini doldurun ve kaydedin
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Fatura Bilgileri
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Fatura Numarası *
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-2025-001"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                  <User size={16} />
                  Müşteri *
                </label>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onFocus={() => {
                    if (customerSearch.length > 0) setShowCustomerDropdown(true)
                  }}
                  placeholder="Müşteri ara (ad, email, telefon, vergi no)..."
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                      >
                        <div className="font-medium text-neutral-900">{customer.name}</div>
                        <div className="text-xs text-neutral-500 mt-1 flex gap-3">
                          {customer.email && <span>📧 {customer.email}</span>}
                          {customer.phone && <span>📱 {customer.phone}</span>}
                          {customer.taxNumber && <span>🏢 VN: {customer.taxNumber}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCustomer && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Seçili: {selectedCustomer.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Düzenlenme Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Fatura Türü
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="invoiceType"
                      value="corporate"
                      checked={invoiceType === 'corporate'}
                      onChange={() => setInvoiceType('corporate')}
                      className="w-4 h-4 text-neutral-900"
                    />
                    <span className="text-sm text-neutral-700">Kurumsal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="invoiceType"
                      value="individual"
                      checked={invoiceType === 'individual'}
                      onChange={() => setInvoiceType('individual')}
                      className="w-4 h-4 text-neutral-900"
                    />
                    <span className="text-sm text-neutral-700">Bireysel</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Vade Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="text-xs text-neutral-600">Hızlı seç:</span>
                  {[30, 45, 60, 90, 120].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleDueDateQuickSelect(days)}
                      className="text-xs px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors"
                    >
                      {days} gün
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="pending">Beklemede</option>
                  <option value="paid">Ödendi</option>
                  <option value="overdue">Gecikmiş</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                  <Percent size={16} />
                  Tevkifat Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.withholding}
                  onChange={(e) => setFormData({ ...formData, withholding: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="0"
                />
                {formData.withholding > 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Tevkifat Tutarı: {calculateWithholdingAmount().toFixed(2)} ₺
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <DollarSign size={20} />
                Ürün/Hizmetler
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Ürün Ekle
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="p-4 bg-neutral-50 rounded-xl space-y-3">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Equipment Select */}
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-xs text-neutral-600 mb-1">Ekipman (Opsiyonel)</label>
                      <select
                        value={item.equipmentId || ''}
                        onChange={(e) => handleEquipmentSelect(item.id, parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                      >
                        <option value="">Ekipman seçin veya manuel girin...</option>
                        {equipments.map(equipment => (
                          <option key={equipment.id} value={equipment.id}>
                            {equipment.name} - {equipment.serialNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-xs text-neutral-600 mb-1">Açıklama *</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Ürün/Hizmet açıklaması"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs text-neutral-600 mb-1">Miktar *</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs text-neutral-600 mb-1">Birim Fiyat *</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />
                    </div>

                    {/* Tax Rate */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs text-neutral-600 mb-1">KDV Oranı</label>
                      <select
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(item.id, 'taxRate', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                      >
                        {TAX_RATES.map(rate => (
                          <option key={rate.value} value={rate.value}>
                            {rate.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs text-neutral-600 mb-1">Tutar</label>
                      <div className="px-3 py-2 bg-neutral-100 rounded-lg text-sm font-medium text-neutral-900">
                        ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Tax Amount */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs text-neutral-600 mb-1">KDV</label>
                      <div className="px-3 py-2 bg-neutral-100 rounded-lg text-sm font-medium text-neutral-700">
                        ₺{item.taxAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Grand Total */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs text-neutral-600 mb-1">Toplam</label>
                      <div className="px-3 py-2 bg-neutral-900 text-white rounded-lg text-sm font-bold">
                        ₺{item.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="col-span-12 md:col-span-1 flex md:items-end md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-end"
                        disabled={items.length === 1}
                        title="Ürünü Kaldır"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Discount Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                    <Percent size={16} />
                    İndirim Oranı
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <div className="px-4 py-2 bg-neutral-100 rounded-xl font-medium">
                      %
                    </div>
                  </div>
                  {formData.discountPercentage > 0 && (
                    <p className="text-xs text-neutral-600 mt-1">
                      İndirim Tutarı: ₺{calculateDiscountAmount().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                {/* Totals Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Ara Toplam:</span>
                    <span className="font-medium">
                      ₺{calculateSubtotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Toplam KDV:</span>
                    <span className="font-medium">
                      ₺{calculateTotalTax().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {formData.discountPercentage > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>İndirim ({formData.discountPercentage}%):</span>
                      <span className="font-medium">
                        -₺{calculateDiscountAmount().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200">
                    <span>Genel Toplam:</span>
                    <span className="text-neutral-900">
                      ₺{calculateTotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notlar</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Fatura ile ilgili notlar (opsiyonel)"
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/accounting?tab=invoice')}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InvoiceForm
