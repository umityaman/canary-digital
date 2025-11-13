import { useState, useEffect } from 'react'
import {
  ArrowLeft, Download, FileText, Calendar, TrendingUp, TrendingDown,
  Clock, CheckCircle, AlertCircle, Phone, Mail, MapPin, Building2,
  CreditCard, Package, User, BarChart3, Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

interface AccountCardDetailProps {
  customerId: number
  onBack: () => void
}

interface CustomerDetail {
  id: number
  fullName: string
  email: string
  phone: string | null
  address: string | null
  taxNumber: string | null
  taxOffice: string | null
}

interface Invoice {
  id: number
  invoiceNumber: string
  issueDate: string
  dueDate: string
  grandTotal: number
  paidAmount: number
  status: string
  description: string | null
}

interface Transaction {
  id: number
  date: string
  type: 'invoice' | 'payment' | 'credit_note'
  description: string
  debit: number
  credit: number
  balance: number
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AccountCardDetail({ customerId, onBack }: AccountCardDetailProps) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'overview' | 'invoices' | 'transactions' | 'aging'>('overview')
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('all')

  useEffect(() => {
    loadCustomerDetails()
  }, [customerId])

  const loadCustomerDetails = async () => {
    setLoading(true)
    try {
      // Load customer info and invoices
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to load customer')
      
      const data = await response.json()
      setCustomer(data.data)

      // Load invoices
      const invoicesResponse = await fetch(`/api/invoices?customerId=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.data || [])
        generateTransactions(invoicesData.data || [])
      }
    } catch (error: any) {
      console.error('Failed to load customer details:', error)
      toast.error('Müşteri bilgileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const generateTransactions = (invoiceList: Invoice[]) => {
    const txns: Transaction[] = []
    let runningBalance = 0

    // Sort invoices by date
    const sorted = [...invoiceList].sort((a, b) => 
      new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
    )

    sorted.forEach(invoice => {
      // Invoice transaction (debit)
      runningBalance += invoice.grandTotal
      txns.push({
        id: invoice.id * 2,
        date: invoice.issueDate,
        type: 'invoice',
        description: `Fatura #${invoice.invoiceNumber}`,
        debit: invoice.grandTotal,
        credit: 0,
        balance: runningBalance
      })

      // Payment transaction (credit) if paid
      if (invoice.paidAmount > 0) {
        runningBalance -= invoice.paidAmount
        txns.push({
          id: invoice.id * 2 + 1,
          date: invoice.issueDate, // Should be payment date if available
          type: 'payment',
          description: `Tahsilat - Fatura #${invoice.invoiceNumber}`,
          debit: 0,
          credit: invoice.paidAmount,
          balance: runningBalance
        })
      }
    })

    setTransactions(txns)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const calculateTotalDebt = () => {
    return invoices.reduce((sum, inv) => sum + (inv.grandTotal - inv.paidAmount), 0)
  }

  const calculateOverdueDebt = () => {
    return invoices
      .filter(inv => new Date(inv.dueDate) < new Date() && inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.grandTotal - inv.paidAmount), 0)
  }

  const calculateTotalPaid = () => {
    return invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  }

  const getAgingData = () => {
    const now = new Date()
    const aging = {
      current: 0,      // 0-30 days
      days30: 0,       // 31-60 days
      days60: 0,       // 61-90 days
      days90Plus: 0    // 90+ days
    }

    invoices.forEach(inv => {
      if (inv.status === 'paid') return

      const dueDate = new Date(inv.dueDate)
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const unpaid = inv.grandTotal - inv.paidAmount

      if (daysOverdue <= 0) {
        aging.current += unpaid
      } else if (daysOverdue <= 30) {
        aging.days30 += unpaid
      } else if (daysOverdue <= 60) {
        aging.days60 += unpaid
      } else {
        aging.days90Plus += unpaid
      }
    })

    return [
      { name: 'Vadesi Gelmemiş', value: aging.current, color: '#10b981' },
      { name: '1-30 Gün', value: aging.days30, color: '#f59e0b' },
      { name: '31-60 Gün', value: aging.days60, color: '#ef4444' },
      { name: '60+ Gün', value: aging.days90Plus, color: '#dc2626' },
    ].filter(item => item.value > 0)
  }

  const getMonthlyTrend = () => {
    const monthlyData = new Map<string, { invoiced: number; collected: number }>()

    invoices.forEach(inv => {
      const month = new Date(inv.issueDate).toLocaleDateString('tr-TR', { 
        year: '2-digit', 
        month: 'short' 
      })
      
      const current = monthlyData.get(month) || { invoiced: 0, collected: 0 }
      current.invoiced += inv.grandTotal
      current.collected += inv.paidAmount
      monthlyData.set(month, current)
    })

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        faturalanan: data.invoiced,
        tahsil: data.collected
      }))
      .slice(-6) // Last 6 months
  }

  const exportStatement = () => {
    toast.success('Ekstre PDF olarak indirilecek (yakÄ±nda)')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-neutral-600">Yükleniyor...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Müşteri bilgisi bulunamadı</p>
        <button onClick={onBack} className="mt-4 text-neutral-900 hover:underline">
          Geri Dön
        </button>
      </div>
    )
  }

  const totalDebt = calculateTotalDebt()
  const overdueDebt = calculateOverdueDebt()
  const totalPaid = calculateTotalPaid()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">{customer.fullName}</h2>
            <p className="text-sm text-neutral-600 mt-1">Cari Hesap Kartı</p>
          </div>
        </div>
        <button
          onClick={exportStatement}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Ekstre Ä°ndir</span>
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="text-neutral-900" size={20} />
            </div>
            <div>
              <p className="text-xs text-neutral-600 mb-1">Müşteri Adı</p>
              <p className="font-semibold text-neutral-900">{customer.fullName}</p>
            </div>
          </div>

          {customer.email && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="text-neutral-900" size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">E-posta</p>
                <p className="font-semibold text-neutral-900 text-sm break-all">{customer.email}</p>
              </div>
            </div>
          )}

          {customer.phone && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="text-neutral-900" size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Telefon</p>
                <p className="font-semibold text-neutral-900">{customer.phone}</p>
              </div>
            </div>
          )}

          {customer.taxNumber && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="text-neutral-900" size={20} />
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Vergi No</p>
                <p className="font-semibold text-neutral-900">{customer.taxNumber}</p>
                {customer.taxOffice && (
                  <p className="text-xs text-neutral-600">{customer.taxOffice}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{invoices.length}</h3>
          <p className="text-sm text-neutral-700">Toplam Fatura</p>
        </div>

        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{formatCurrency(totalDebt)}</h3>
          <p className="text-sm text-neutral-700">Toplam Borç§</p>
        </div>

        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{formatCurrency(overdueDebt)}</h3>
          <p className="text-sm text-neutral-700">Vadesi Geçmiş</p>
        </div>

        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{formatCurrency(totalPaid)}</h3>
          <p className="text-sm text-neutral-700">Tahsil Edilen</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Genel BakÄ±ÅŸ', icon: <BarChart3 size={16} /> },
            { id: 'invoices', label: 'Faturalar', icon: <FileText size={16} /> },
            { id: 'transactions', label: 'Hesap Hareketleri', icon: <CreditCard size={16} /> },
            { id: 'aging', label: 'YaÅŸlandÄ±rma', icon: <Clock size={16} /> },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeView === view.id
                  ? 'text-neutral-900 border-b-2 border-neutral-900 bg-neutral-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview View */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Monthly Trend Chart */}
              {getMonthlyTrend().length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">AylÄ±k Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getMonthlyTrend()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="faturalanan" fill="#3b82f6" name="Faturalanan" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="tahsil" fill="#10b981" name="Tahsil Edilen" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-600 mb-1">Tahsilat OranÄ±</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {invoices.length > 0 
                      ? `${Math.round((totalPaid / (totalDebt + totalPaid)) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-600 mb-1">Ortalama Fatura</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {invoices.length > 0 
                      ? formatCurrency((totalDebt + totalPaid) / invoices.length)
                      : formatCurrency(0)}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm text-neutral-600 mb-1">Ödenmemiş Fatura</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {invoices.filter(inv => inv.status !== 'paid').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invoices View */}
          {activeView === 'invoices' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Fatura No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Vade</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Tutar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Ödenen</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Kalan</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700 uppercase">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {invoices.map(invoice => {
                      const remaining = invoice.grandTotal - invoice.paidAmount
                      const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid'
                      
                      return (
                        <tr key={invoice.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 font-medium text-neutral-900">#{invoice.invoiceNumber}</td>
                          <td className="px-4 py-3 text-sm text-neutral-600">{formatDate(invoice.issueDate)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={isOverdue ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                              {formatDate(invoice.dueDate)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(invoice.grandTotal)}</td>
                          <td className="px-4 py-3 text-right text-neutral-900">{formatCurrency(invoice.paidAmount)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(remaining)}</td>
                          <td className="px-4 py-3 text-center">
                            {invoice.status === 'paid' ? (
                              <span className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium">
                                Ödendi
                              </span>
                            ) : isOverdue ? (
                              <span className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium">
                                Vadesi Geçti
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full text-xs font-medium">
                                Bekliyor
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions View */}
          {activeView === 'transactions' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Açıklama</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Borç</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Alacak</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Bakiye</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {transactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm text-neutral-600">{formatDate(txn.date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {txn.type === 'invoice' ? (
                              <FileText className="text-neutral-900" size={16} />
                            ) : txn.type === 'payment' ? (
                              <CheckCircle className="text-neutral-900" size={16} />
                            ) : (
                              <CreditCard className="text-neutral-900" size={16} />
                            )}
                            <span className="text-sm text-neutral-900">{txn.description}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                          {txn.debit > 0 ? formatCurrency(txn.debit) : 'â€”'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                          {txn.credit > 0 ? formatCurrency(txn.credit) : 'â€”'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-neutral-900">
                          {formatCurrency(txn.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aging View */}
          {activeView === 'aging' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Borç Yaşlandırma Analizi</h3>
                <p className="text-sm text-neutral-600">Vadesi geçen borçların dağılımı</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                {getAgingData().length > 0 && (
                  <div className="bg-neutral-50 rounded-xl p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getAgingData()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                        >
                          {getAgingData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Aging Breakdown */}
                <div className="space-y-3">
                  {getAgingData().map((item, index) => (
                    <div key={index} className="bg-neutral-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">{item.name}</span>
                        <span className="text-lg font-bold text-neutral-900">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(item.value / totalDebt) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Toplam borcun %{Math.round((item.value / totalDebt) * 100)}'si
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

