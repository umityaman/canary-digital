import { useState, useEffect } from 'react'
import { 
  Package, TrendingUp, TrendingDown, DollarSign, AlertCircle, 
  CheckCircle, ArrowRight, Settings, Filter, Calendar, FileText,
  BarChart3, RefreshCw, Link2, Eye, Edit2, XCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { card, button, input, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

interface InventoryTransaction {
  id: string
  date: string
  type: 'purchase' | 'sale' | 'rental_out' | 'rental_return' | 'adjustment' | 'transfer'
  equipmentId: string
  equipmentName: string
  quantity: number
  unitCost: number
  totalCost: number
  orderId?: string
  orderNumber?: string
  customerId?: string
  customerName?: string
  accountingStatus: 'pending' | 'recorded' | 'error'
  accountingEntryId?: string
  notes?: string
}

interface AccountingEntry {
  id: string
  date: string
  inventoryTransactionId: string
  debitAccount: string
  creditAccount: string
  amount: number
  description: string
  status: 'posted' | 'draft'
}

interface Stats {
  totalTransactions: number
  pendingRecords: number
  recordedCount: number
  errorCount: number
  totalValue: number
}

export default function InventoryAccounting() {
  const [activeView, setActiveView] = useState<'overview' | 'pending' | 'recorded' | 'settings'>('overview')
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([])
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // Chart of accounts mapping
  const accountMappings = {
    purchase: {
      debit: '153 - Ticari Mallar',
      credit: '320 - Satıcılar'
    },
    sale: {
      debit: '100 - Kasa',
      credit: '600 - Satış Geliri'
    },
    rental_out: {
      debit: '121 - Alıcılar',
      credit: '602 - Kiralama Geliri'
    },
    rental_return: {
      debit: '153 - Ticari Mallar',
      credit: '153 - Ticari Mallar (Çıkış)'
    },
    adjustment: {
      debit: '622 - Stok Değer Düşüklüğü',
      credit: '153 - Ticari Mallar'
    },
    transfer: {
      debit: '153 - Ticari Mallar (Şube A)',
      credit: '153 - Ticari Mallar (Şube B)'
    }
  }

  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    // Mock inventory transactions
    const mockTransactions: InventoryTransaction[] = [
      {
        id: 'IT001',
        date: '2024-10-30',
        type: 'purchase',
        equipmentId: 'EQ001',
        equipmentName: 'HILTI TE 6-A36 Kırıcı Delici',
        quantity: 2,
        unitCost: 15000,
        totalCost: 30000,
        accountingStatus: 'pending',
        notes: 'Yeni alım - fatura bekliyor'
      },
      {
        id: 'IT002',
        date: '2024-10-29',
        type: 'rental_out',
        equipmentId: 'EQ002',
        equipmentName: 'Makita HR2470 Kırıcı Delici',
        quantity: 3,
        unitCost: 8000,
        totalCost: 24000,
        orderId: 'ORD-2024-123',
        orderNumber: 'KIR-2024-123',
        customerId: 'C001',
        customerName: 'ACME İnşaat Ltd.',
        accountingStatus: 'recorded',
        accountingEntryId: 'AE001'
      },
      {
        id: 'IT003',
        date: '2024-10-28',
        type: 'sale',
        equipmentId: 'EQ003',
        equipmentName: 'Bosch GBH 2-28 F Kırıcı',
        quantity: 1,
        unitCost: 6000,
        totalCost: 7500,
        customerId: 'C002',
        customerName: 'Tech Solutions A.Ş.',
        accountingStatus: 'recorded',
        accountingEntryId: 'AE002',
        notes: 'Eski ekipman satışı'
      },
      {
        id: 'IT004',
        date: '2024-10-27',
        type: 'rental_return',
        equipmentId: 'EQ004',
        equipmentName: 'DeWalt D25263K Kırıcı',
        quantity: 2,
        unitCost: 7500,
        totalCost: 15000,
        orderId: 'ORD-2024-110',
        orderNumber: 'KIR-2024-110',
        customerId: 'C003',
        customerName: 'XYZ Müteahhitlik',
        accountingStatus: 'recorded',
        accountingEntryId: 'AE003'
      },
      {
        id: 'IT005',
        date: '2024-10-26',
        type: 'adjustment',
        equipmentId: 'EQ005',
        equipmentName: 'Metabo KHE 2860 Quick',
        quantity: 1,
        unitCost: 9000,
        totalCost: 9000,
        accountingStatus: 'pending',
        notes: 'Hasar nedeniyle değer düşüşü'
      },
      {
        id: 'IT006',
        date: '2024-10-25',
        type: 'rental_out',
        equipmentId: 'EQ006',
        equipmentName: 'Milwaukee M18 CHPX-0',
        quantity: 4,
        unitCost: 5500,
        totalCost: 22000,
        orderId: 'ORD-2024-125',
        orderNumber: 'KIR-2024-125',
        customerId: 'C004',
        customerName: 'ABC Yapı Ltd.',
        accountingStatus: 'error',
        notes: 'Muhasebe hesabı bulunamadı'
      }
    ]

    const mockEntries: AccountingEntry[] = [
      {
        id: 'AE001',
        date: '2024-10-29',
        inventoryTransactionId: 'IT002',
        debitAccount: '121 - Alıcılar',
        creditAccount: '602 - Kiralama Geliri',
        amount: 24000,
        description: 'Makita HR2470 kiralama - ACME İnşaat',
        status: 'posted'
      },
      {
        id: 'AE002',
        date: '2024-10-28',
        inventoryTransactionId: 'IT003',
        debitAccount: '100 - Kasa',
        creditAccount: '600 - Satış Geliri',
        amount: 7500,
        description: 'Bosch GBH 2-28 F satışı - Tech Solutions',
        status: 'posted'
      },
      {
        id: 'AE003',
        date: '2024-10-27',
        inventoryTransactionId: 'IT004',
        debitAccount: '153 - Ticari Mallar',
        creditAccount: '153 - Ticari Mallar (Çıkış)',
        amount: 15000,
        description: 'DeWalt D25263K iade - XYZ Müteahhitlik',
        status: 'posted'
      }
    ]

    setInventoryTransactions(mockTransactions)
    setAccountingEntries(mockEntries)
  }

  const calculateStats = (): Stats => {
    return {
      totalTransactions: inventoryTransactions.length,
      pendingRecords: inventoryTransactions.filter(t => t.accountingStatus === 'pending').length,
      recordedCount: inventoryTransactions.filter(t => t.accountingStatus === 'recorded').length,
      errorCount: inventoryTransactions.filter(t => t.accountingStatus === 'error').length,
      totalValue: inventoryTransactions.reduce((sum, t) => sum + t.totalCost, 0)
    }
  }

  const handleAutoRecord = async (transactionId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const transaction = inventoryTransactions.find(t => t.id === transactionId)
      if (!transaction) return

      // Create accounting entry
      const newEntry: AccountingEntry = {
        id: `AE${Date.now()}`,
        date: transaction.date,
        inventoryTransactionId: transactionId,
        debitAccount: accountMappings[transaction.type].debit,
        creditAccount: accountMappings[transaction.type].credit,
        amount: transaction.totalCost,
        description: `${transaction.equipmentName} - ${getTransactionTypeLabel(transaction.type)}`,
        status: 'posted'
      }

      setAccountingEntries([...accountingEntries, newEntry])
      
      // Update transaction status
      setInventoryTransactions(inventoryTransactions.map(t =>
        t.id === transactionId 
          ? { ...t, accountingStatus: 'recorded', accountingEntryId: newEntry.id }
          : t
      ))

      toast.success('Muhasebe kaydı oluşturuldu')
    } catch (error: any) {
      console.error('Failed to create accounting record:', error)
      toast.error('Kayıt oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkRecord = async () => {
    const pendingTransactions = inventoryTransactions.filter(t => t.accountingStatus === 'pending')
    
    if (pendingTransactions.length === 0) {
      toast.info('Bekleyen kayıt yok')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let successCount = 0
      const newEntries: AccountingEntry[] = []
      const updatedTransactions = [...inventoryTransactions]

      for (const transaction of pendingTransactions) {
        const newEntry: AccountingEntry = {
          id: `AE${Date.now()}-${successCount}`,
          date: transaction.date,
          inventoryTransactionId: transaction.id,
          debitAccount: accountMappings[transaction.type].debit,
          creditAccount: accountMappings[transaction.type].credit,
          amount: transaction.totalCost,
          description: `${transaction.equipmentName} - ${getTransactionTypeLabel(transaction.type)}`,
          status: 'posted'
        }

        newEntries.push(newEntry)
        
        const index = updatedTransactions.findIndex(t => t.id === transaction.id)
        if (index !== -1) {
          updatedTransactions[index] = {
            ...updatedTransactions[index],
            accountingStatus: 'recorded',
            accountingEntryId: newEntry.id
          }
        }

        successCount++
      }

      setAccountingEntries([...accountingEntries, ...newEntries])
      setInventoryTransactions(updatedTransactions)
      
      toast.success(`${successCount} işlem kaydedildi`)
    } catch (error: any) {
      console.error('Bulk record failed:', error)
      toast.error('Toplu kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = (transactionId: string) => {
    const transaction = inventoryTransactions.find(t => t.id === transactionId)
    if (!transaction || !transaction.accountingEntryId) return

    if (!confirm('Bu muhasebe kaydını silmek istediğinizden emin misiniz?')) return

    // Remove entry
    setAccountingEntries(accountingEntries.filter(e => e.id !== transaction.accountingEntryId))
    
    // Update transaction status
    setInventoryTransactions(inventoryTransactions.map(t =>
      t.id === transactionId
        ? { ...t, accountingStatus: 'pending', accountingEntryId: undefined }
        : t
    ))

    toast.success('Muhasebe kaydı silindi')
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Satın Alma',
      sale: 'Satış',
      rental_out: 'Kiralama',
      rental_return: 'İade',
      adjustment: 'Düzeltme',
      transfer: 'Transfer'
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <AlertCircle size={12} />
            Bekliyor
          </span>
        )
      case 'recorded':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle size={12} />
            Kaydedildi
          </span>
        )
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <XCircle size={12} />
            Hata
          </span>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingDown className="text-blue-600" size={16} />
      case 'sale':
        return <TrendingUp className="text-green-600" size={16} />
      case 'rental_out':
        return <ArrowRight className="text-purple-600" size={16} />
      case 'rental_return':
        return <ArrowRight className="text-orange-600 transform rotate-180" size={16} />
      case 'adjustment':
        return <Settings className="text-yellow-600" size={16} />
      case 'transfer':
        return <Link2 className="text-indigo-600" size={16} />
      default:
        return <Package className="text-neutral-600" size={16} />
    }
  }

  const stats = calculateStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const filteredTransactions = inventoryTransactions.filter(t => {
    const typeMatch = selectedType === 'all' || t.type === selectedType
    const statusMatch = selectedStatus === 'all' || t.accountingStatus === selectedStatus
    return typeMatch && statusMatch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkRecord}
            disabled={loading || stats.pendingRecords === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            <span className="hidden sm:inline">Toplu Kaydet ({stats.pendingRecords})</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Transactions */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package size={20} />
            <span className="text-xl lg:text-2xl font-bold">{stats.totalTransactions}</span>
          </div>
          <div className="text-xs lg:text-sm opacity-90">Toplam İşlem</div>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={20} />
            <span className="text-xl lg:text-2xl font-bold">{stats.pendingRecords}</span>
          </div>
          <div className="text-xs lg:text-sm opacity-90">Bekliyor</div>
        </div>

        {/* Recorded */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} />
            <span className="text-xl lg:text-2xl font-bold">{stats.recordedCount}</span>
          </div>
          <div className="text-xs lg:text-sm opacity-90">Kaydedildi</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={cx(card('md', 'xs', 'default', 'lg'), 'flex gap-2')}>
        <button
          onClick={() => setActiveView('overview')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'overview'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setActiveView('pending')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'pending'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Bekleyenler ({stats.pendingRecords})
        </button>
        <button
          onClick={() => setActiveView('recorded')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'recorded'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Kayıtlar ({stats.recordedCount})
        </button>
        <button
          onClick={() => setActiveView('settings')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'settings'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <Settings size={18} className="inline mr-2" />
          Ayarlar
        </button>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={input('md', 'default', undefined, 'md')}
              >
                <option value="all">Tüm İşlem Tipleri</option>
                <option value="purchase">Satın Alma</option>
                <option value="sale">Satış</option>
                <option value="rental_out">Kiralama</option>
                <option value="rental_return">İade</option>
                <option value="adjustment">Düzeltme</option>
                <option value="transfer">Transfer</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={input('md', 'default', undefined, 'md')}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="recorded">Kaydedildi</option>
                <option value="error">Hata</option>
              </select>

              <button
                onClick={loadMockData}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <RefreshCw size={18} />
                <span>Yenile</span>
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className={cx(card('md', 'none', 'default', 'lg'), 'overflow-hidden')}>
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Stok Hareketleri ({filteredTransactions.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase hidden lg:table-cell">Tip</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Ekipman</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700 uppercase hidden md:table-cell">Miktar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase hidden xl:table-cell">Birim Fiyat</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Toplam</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase hidden lg:table-cell">Müşteri</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700 uppercase">Durum</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-700 uppercase">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-neutral-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span className="text-sm text-neutral-900">
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-neutral-900">{transaction.equipmentName}</div>
                          {transaction.orderNumber && (
                            <div className="text-xs text-neutral-500">{transaction.orderNumber}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-900 hidden md:table-cell">
                          {transaction.quantity}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-neutral-900 hidden xl:table-cell">
                          {formatCurrency(transaction.unitCost)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-neutral-900">
                          {formatCurrency(transaction.totalCost)}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-900 hidden lg:table-cell">
                          {transaction.customerName || '-'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getStatusBadge(transaction.accountingStatus)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {transaction.accountingStatus === 'pending' && (
                            <button
                              onClick={() => handleAutoRecord(transaction.id)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50"
                            >
                              Kaydet
                            </button>
                          )}
                          {transaction.accountingStatus === 'recorded' && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {/* View entry */}}
                                className="text-blue-600 hover:text-blue-700"
                                title="Görüntüle"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(transaction.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Sil"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                          {transaction.accountingStatus === 'error' && (
                            <button
                              onClick={() => handleAutoRecord(transaction.id)}
                              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                              Tekrar Dene
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="p-12 text-center text-neutral-600">
                <Package className="mx-auto mb-4 text-neutral-400" size={48} />
                <p>Stok hareketi bulunamadı</p>
              </div>
            )}
        </div>
      )}

      {/* Pending View */}
      {activeView === 'pending' && (
        <div className="space-y-4">
          {filteredTransactions.filter(t => t.accountingStatus === 'pending').map((transaction) => (
            <div key={transaction.id} className={card('md', 'lg', 'default', 'lg')}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(transaction.type)}
                    <h3 className="text-lg font-semibold text-neutral-900">{transaction.equipmentName}</h3>
                    {getStatusBadge(transaction.accountingStatus)}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {formatDate(transaction.date)} • {getTransactionTypeLabel(transaction.type)} • {transaction.quantity} adet
                  </div>
                  {transaction.notes && (
                    <div className="mt-2 text-sm text-neutral-500 italic">{transaction.notes}</div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary}`}>{formatCurrency(transaction.totalCost)}</div>
                  <div className="text-sm text-neutral-600">{formatCurrency(transaction.unitCost)} / adet</div>
                </div>
              </div>

              {/* Accounting Preview */}
              <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                <div className="text-sm font-medium text-neutral-700 mb-3">Muhasebe Kaydı Önizlemesi:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-neutral-600">Borç</div>
                      <div className="text-sm font-medium text-neutral-900">
                        {accountMappings[transaction.type].debit}
                      </div>
                    </div>
                    <div className="font-bold text-green-600">{formatCurrency(transaction.totalCost)}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="text-red-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-neutral-600">Alacak</div>
                      <div className="text-sm font-medium text-neutral-900">
                        {accountMappings[transaction.type].credit}
                      </div>
                    </div>
                    <div className="font-bold text-red-600">{formatCurrency(transaction.totalCost)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => handleAutoRecord(transaction.id)}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          ))}

          {filteredTransactions.filter(t => t.accountingStatus === 'pending').length === 0 && (
            <div className={cx(card('md', 'xl', 'default', 'lg'), 'text-center')}>
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
              <p className="text-lg font-medium text-neutral-900">Tüm işlemler kaydedildi!</p>
              <p className="text-sm text-neutral-600 mt-2">Bekleyen stok hareketi yok</p>
            </div>
          )}
        </div>
      )}

      {/* Recorded View */}
      {activeView === 'recorded' && (
        <div className={card('md', 'none', 'default', 'lg')}>
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-900">Muhasebe Kayıtları ({accountingEntries.length})</h3>
          </div>

          <div className="divide-y divide-neutral-100">
            {accountingEntries.map((entry) => {
              const transaction = inventoryTransactions.find(t => t.id === entry.inventoryTransactionId)
              return (
                <div key={entry.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 mb-1">{entry.description}</div>
                      <div className="text-sm text-neutral-600">{formatDate(entry.date)}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-neutral-900">{formatCurrency(entry.amount)}</div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {entry.status === 'posted' ? 'Aktarıldı' : 'Taslak'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="text-green-600" size={16} />
                      <span className="text-neutral-600">Borç:</span>
                      <span className="font-medium text-neutral-900">{entry.debitAccount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown className="text-red-600" size={16} />
                      <span className="text-neutral-600">Alacak:</span>
                      <span className="font-medium text-neutral-900">{entry.creditAccount}</span>
                    </div>
                  </div>

                  {transaction && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                      İşlem Ref: {transaction.id} • {transaction.equipmentName}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {accountingEntries.length === 0 && (
            <div className="p-12 text-center text-neutral-600">
              <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
              <p>Henüz muhasebe kaydı yok</p>
            </div>
          )}
        </div>
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <div className="space-y-6">
          <div className={card('md', 'lg', 'default', 'lg')}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Otomatik Kayıt Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div>
                  <div className="font-medium text-neutral-900">Otomatik Kayıt</div>
                  <div className="text-sm text-neutral-600">Stok hareketleri otomatik olarak muhasebe kayıtlarına dönüştürülsün</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRecordEnabled}
                    onChange={(e) => setAutoRecordEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neutral-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className={card('md', 'lg', 'default', 'lg')}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Hesap Eşleştirmeleri</h3>
            
            <div className="space-y-4">
              {Object.entries(accountMappings).map(([type, mapping]) => (
                <div key={type} className="border border-neutral-200 rounded-xl p-4">
                  <div className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    {getTypeIcon(type)}
                    {getTransactionTypeLabel(type)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-2">Borç Hesabı</label>
                      <input
                        type="text"
                        value={mapping.debit}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-2">Alacak Hesabı</label>
                      <input
                        type="text"
                        value={mapping.credit}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
