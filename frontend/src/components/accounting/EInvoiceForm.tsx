import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Send, User, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EInvoiceFormProps {
  onClose: () => void
  onSuccess: () => void
  editInvoice?: any
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discountPercentage: number
  taxRate: number
  total: number
}

interface Customer {
  id: number
  fullName: string
  email: string
  taxNumber: string | null
  taxOffice: string | null
}

export default function EInvoiceForm({ onClose, onSuccess, editInvoice }: EInvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerId: editInvoice?.customerId || '',
    issueDate: editInvoice?.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: editInvoice?.dueDate?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: editInvoice?.description || '',
    notes: editInvoice?.notes || ''
  })
  const [items, setItems] = useState<InvoiceItem[]>(
    editInvoice?.items || [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPercentage: 0,
        taxRate: 20,
        total: 0
      }
    ]
  )

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    calculateItemTotals()
  }, [items])

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

  const calculateItemTotals = () => {
    setItems(prevItems =>
      prevItems.map(item => {
        const subtotal = item.quantity * item.unitPrice
        const discountAmount = subtotal * (item.discountPercentage / 100)
        const taxableAmount = subtotal - discountAmount
        const taxAmount = taxableAmount * (item.taxRate / 100)
        const total = taxableAmount + taxAmount

        return { ...item, total }
      })
    )
  }

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
      taxRate: 20,
      total: 0
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

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      return sum + itemSubtotal
    }, 0)

    const discountTotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const discount = itemSubtotal * (item.discountPercentage / 100)
      return sum + discount
    }, 0)

    const taxTotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const discount = itemSubtotal * (item.discountPercentage / 100)
      const taxableAmount = itemSubtotal - discount
      const tax = taxableAmount * (item.taxRate / 100)
      return sum + tax
    }, 0)

    const grandTotal = subtotal - discountTotal + taxTotal

    return { subtotal, discountTotal, taxTotal, grandTotal }
  }

  const handleSubmit = async (sendImmediately: boolean = false) => {
    // Validation
    if (!formData.customerId) {
      toast.error('Lütfen müşteri seçin')
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Lütfen tüm kalem bilgilerini doldurun')
      return
    }

    setLoading(true)
    try {
      const totals = calculateTotals()
      const selectedCustomer = customers.find(c => c.id === Number(formData.customerId))
      
      const invoiceData = {
        customerId: Number(formData.customerId),
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        description: formData.description,
        notes: formData.notes,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage,
          taxRate: item.taxRate
        })),
        subtotal: totals.subtotal,
        discountAmount: totals.discountTotal,
        taxAmount: totals.taxTotal,
        grandTotal: totals.grandTotal,
        status: sendImmediately ? 'sent' : 'draft',
        invoiceType: selectedCustomer?.taxNumber ? 'e-fatura' : 'e-arsiv'
      }

      const url = editInvoice ? `/api/invoices/${editInvoice.id}` : '/api/invoices'
      const method = editInvoice ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      })

      if (!response.ok) throw new Error('Failed to save invoice')

      const result = await response.json()

      // If sending immediately, also send e-document
      if (sendImmediately && result.data?.id) {
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            throw new Error('Oturum bilgisi bulunamadı')
          }

          const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
          }

          if (invoiceData.invoiceType === 'e-fatura') {
            const generateResponse = await fetch(`/api/einvoice/generate/${result.data.id}`, {
              method: 'POST',
              headers,
            })
            const generatePayload = await generateResponse.json().catch(() => ({}))
            if (!generateResponse.ok) {
              throw new Error(generatePayload?.message || 'E-Fatura XML oluşturulamadı')
            }

            const sendResponse = await fetch(`/api/einvoice/send/${result.data.id}`, {
              method: 'POST',
              headers,
            })
            const sendPayload = await sendResponse.json().catch(() => ({}))
            if (!sendResponse.ok) {
              throw new Error(sendPayload?.message || 'E-Fatura gönderilemedi')
            }
          } else {
            const archiveHeaders = {
              ...headers,
              'Content-Type': 'application/json',
            }
            const archiveResponse = await fetch(`/api/invoices/${result.data.id}/send-edocument`, {
              method: 'POST',
              headers: archiveHeaders,
            })
            if (!archiveResponse.ok) {
              const payload = await archiveResponse.json().catch(() => ({}))
              throw new Error(payload?.message || 'E-Arşiv gönderilemedi')
            }
          }

          toast.success('Fatura oluşturuldu ve e-belge gönderildi')
        } catch (sendError: any) {
          console.error('Failed to auto-send invoice:', sendError)
          toast.warning(sendError.message || 'Fatura oluşturuldu ancak e-belge gönderilemedi')
        }
      } else {
        toast.success(editInvoice ? 'Fatura güncellendi' : 'Fatura oluşturuldu')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Failed to save invoice:', error)
      toast.error('Fatura kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()
  const selectedCustomer = customers.find(c => c.id === Number(formData.customerId))
  const invoiceType = selectedCustomer?.taxNumber ? 'E-Fatura' : 'E-Arşiv'

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
              {editInvoice ? 'Fatura Düzenle' : 'Yeni Fatura Oluştur'}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {selectedCustomer && (
                <span className={`font-medium ${selectedCustomer.taxNumber ? 'text-neutral-900' : 'text-neutral-900'}`}>
                  {invoiceType}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            <span className="hidden sm:inline">Taslak Kaydet</span>
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Kaydet & Gönder</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Dates */}
        <div className="lg:col-span-1 space-y-6">
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
                >
                  <option value="">Müşteri seçin</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} {customer.taxNumber ? `(VN: ${customer.taxNumber})` : ''}
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
                  <div>
                    <span className="text-neutral-600">E-posta:</span>
                    <span className="ml-2 font-medium text-neutral-900">{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.taxNumber && (
                    <>
                      <div>
                        <span className="text-neutral-600">Vergi No:</span>
                        <span className="ml-2 font-medium text-neutral-900">{selectedCustomer.taxNumber}</span>
                      </div>
                      {selectedCustomer.taxOffice && (
                        <div>
                          <span className="text-neutral-600">Vergi Dairesi:</span>
                          <span className="ml-2 font-medium text-neutral-900">{selectedCustomer.taxOffice}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedCustomer.taxNumber
                        ? 'bg-neutral-100 text-neutral-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {invoiceType}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Tarihler</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Fatura Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vade Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notlar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  placeholder="Fatura açıklaması..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dahili Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  placeholder="Dahili notlar (faturada görünmez)..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Items & Totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <FileText size={20} />
                Fatura Kalemleri
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Ürün/Hizmet açıklaması *"
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        placeholder="Miktar"
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        placeholder="Birim Fiyat (₺)"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        value={item.discountPercentage}
                        onChange={(e) => handleItemChange(item.id, 'discountPercentage', Number(e.target.value))}
                        placeholder="İskonto (%)"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                      />
                    </div>

                    <div>
                      <select
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(item.id, 'taxRate', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                      >
                        <option value="0">KDV %0</option>
                        <option value="1">KDV %1</option>
                        <option value="10">KDV %10</option>
                        <option value="20">KDV %20</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                    <span className="text-sm text-neutral-600">Toplam:</span>
                    <span className="text-lg font-bold text-neutral-900">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Fatura Özeti</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-neutral-700">
                <span>Ara Toplam:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(totals.subtotal)}
                </span>
              </div>

              {totals.discountTotal > 0 && (
                <div className="flex items-center justify-between text-neutral-700">
                  <span>İskonto:</span>
                  <span className="font-semibold text-neutral-800">
                    -{new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(totals.discountTotal)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-neutral-700">
                <span>KDV:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(totals.taxTotal)}
                </span>
              </div>

              <div className="pt-3 border-t-2 border-neutral-300">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-900">Genel Toplam:</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY'
                    }).format(totals.grandTotal)}
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

