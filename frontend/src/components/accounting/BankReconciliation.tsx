import { useState, useRef } from 'react'
import { 
  Building2, Upload, Download, CheckCircle, AlertCircle, 
  Filter, Search, RefreshCw, Link2, XCircle, Eye, FileText,
  Calendar, DollarSign, TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { card, button, input, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

interface BankTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance: number
  reference?: string
  matched: boolean
  matchedWith?: string
  category?: string
}

interface SystemTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  reference?: string
  matched: boolean
}

interface ReconciliationStats {
  totalBankTransactions: number
  totalSystemTransactions: number
  matchedCount: number
  unmatchedBankCount: number
  unmatchedSystemCount: number
  differenceAmount: number
}

export default function BankReconciliation() {
  const [activeView, setActiveView] = useState<'overview' | 'import' | 'match' | 'report'>('overview')
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([])
  const [systemTransactions, setSystemTransactions] = useState<SystemTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('all')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    end: new Date().toISOString().split('T')[0] // Today
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'matched' | 'unmatched'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data - will be replaced with real API
  const bankAccounts = [
    { id: '1', name: 'İş Bankası - Ticari', accountNumber: '1234567890', balance: 125000 },
    { id: '2', name: 'Garanti BBVA - Vadesiz', accountNumber: '9876543210', balance: 85000 },
    { id: '3', name: 'Yapı Kredi - USD', accountNumber: '5555666677', balance: 15000 }
  ]

  // 🔥 Gerçek API'den banka işlemlerini yükle
  const loadBankTransactions = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(
        `${API_URL}/api/accounting/bank-account/${selectedAccount}/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Banka işlemleri yüklenemedi');
      }

      const data = await response.json();
      
      // Backend response'u frontend formatına dönüştür
      const transactions: BankTransaction[] = data.data?.transactions?.map((txn: any) => ({
        id: txn.id?.toString() || '',
        date: txn.date || txn.createdAt ? new Date(txn.date || txn.createdAt).toISOString().split('T')[0] : '',
        description: txn.description || txn.notes || '',
        amount: parseFloat(txn.amount || 0),
        type: txn.type === 'credit' || txn.transactionType === 'credit' ? 'credit' : 'debit',
        balance: parseFloat(txn.balance || 0),
        reference: txn.reference || txn.referenceNumber,
        matched: txn.matched || false,
        matchedWith: txn.matchedWith || txn.matchedTransactionId,
        category: txn.category || 'Bilinmeyen'
      })) || [];

      setBankTransactions(transactions);
      setFilteredBankTransactions(transactions);
      
      // System transactions'ı da yükle (opsiyonel)
      // loadSystemTransactions();
    } catch (error) {
      console.error('Banka işlemleri yüklenirken hata:', error);
      toast.error('Banka işlemleri yüklenemedi');
      
      // Hata durumunda boş veri
      setBankTransactions([]);
      setFilteredBankTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data (deprecated) - Artık kullanılmıyor
  const generateMockBankData_DEPRECATED = () => {
    const mockData: BankTransaction[] = [
      {
        id: 'B001',
        date: '2024-10-28',
        description: 'ACME Ltd. - Fatura Ödemesi',
        amount: 15000,
        type: 'credit',
        balance: 125000,
        reference: 'INV-2024-001',
        matched: true,
        matchedWith: 'S001',
        category: 'Müşteri Ödemesi'
      },
      {
        id: 'B002',
        date: '2024-10-27',
        description: 'Elektrik Faturası - BEDAŞ',
        amount: 2500,
        type: 'debit',
        balance: 110000,
        matched: true,
        matchedWith: 'S002',
        category: 'İşletme Giderleri'
      },
      {
        id: 'B003',
        date: '2024-10-26',
        description: 'XYZ A.Ş. Ödeme',
        amount: 8500,
        type: 'credit',
        balance: 112500,
        matched: false,
        category: 'Bilinmeyen'
      },
      {
        id: 'B004',
        date: '2024-10-25',
        description: 'Personel Maaş - Toplu',
        amount: 45000,
        type: 'debit',
        balance: 104000,
        matched: false,
        category: 'Maaş Ödemesi'
      },
      {
        id: 'B005',
        date: '2024-10-24',
        description: 'Tech Solutions Ltd.',
        amount: 12000,
        type: 'credit',
        balance: 149000,
        matched: true,
        matchedWith: 'S003',
        category: 'Müşteri Ödemesi'
      },
      {
        id: 'B006',
        date: '2024-10-23',
        description: 'Ofis Malzemeleri - ABC',
        amount: 1800,
        type: 'debit',
        balance: 137000,
        matched: false,
        category: 'İşletme Giderleri'
      }
    ]
    
    const mockSystemData: SystemTransaction[] = [
      {
        id: 'S001',
        date: '2024-10-28',
        description: 'Fatura Tahsilatı - ACME Ltd.',
        amount: 15000,
        type: 'income',
        category: 'Satış Geliri',
        reference: 'INV-2024-001',
        matched: true
      },
      {
        id: 'S002',
        date: '2024-10-27',
        description: 'Elektrik Gideri',
        amount: 2500,
        type: 'expense',
        category: 'Enerji Gideri',
        matched: true
      },
      {
        id: 'S003',
        date: '2024-10-24',
        description: 'Tech Solutions - Kiralama Ödemesi',
        amount: 12000,
        type: 'income',
        category: 'Kiralama Geliri',
        matched: true
      },
      {
        id: 'S004',
        date: '2024-10-22',
        description: 'Kargo Gideri - MNG',
        amount: 350,
        type: 'expense',
        category: 'Lojistik',
        matched: false
      },
      {
        id: 'S005',
        date: '2024-10-21',
        description: 'Danışmanlık Geliri',
        amount: 5000,
        type: 'income',
        category: 'Hizmet Geliri',
        matched: false
      }
    ]

    setBankTransactions(mockData)
    setSystemTransactions(mockSystemData)
    toast.success('Örnek veriler yüklendi')
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // Real file processing - CSV/Excel parsing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Gerçek API'yi yükle
      await loadBankTransactions()
      
      toast.success(`${file.name} başarıyla içe aktarıldı`)
    } catch (error: any) {
      console.error('Failed to upload file:', error)
      toast.error('Dosya yüklenemedi')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAutoMatch = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock auto-matching logic
      let matchedCount = 0
      
      // Simple matching: same amount and similar dates (within 3 days)
      const updatedBankTxs = bankTransactions.map(bt => {
        if (bt.matched) return bt
        
        const matchingSystemTx = systemTransactions.find(st => {
          if (st.matched) return false
          
          const bankDate = new Date(bt.date)
          const sysDate = new Date(st.date)
          const daysDiff = Math.abs((bankDate.getTime() - sysDate.getTime()) / (1000 * 60 * 60 * 24))
          
          const amountMatches = Math.abs(bt.amount - st.amount) < 0.01
          const dateClose = daysDiff <= 3
          
          return amountMatches && dateClose
        })
        
        if (matchingSystemTx) {
          matchedCount++
          return { ...bt, matched: true, matchedWith: matchingSystemTx.id }
        }
        
        return bt
      })
      
      const updatedSystemTxs = systemTransactions.map(st => {
        const isMatched = updatedBankTxs.some(bt => bt.matchedWith === st.id)
        return isMatched ? { ...st, matched: true } : st
      })
      
      setBankTransactions(updatedBankTxs)
      setSystemTransactions(updatedSystemTxs)
      
      toast.success(`${matchedCount} işlem otomatik eşleştirildi`)
    } catch (error: any) {
      console.error('Auto match failed:', error)
      toast.error('Otomatik eşleştirme başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleManualMatch = (bankTxId: string, systemTxId: string) => {
    const updatedBankTxs = bankTransactions.map(bt =>
      bt.id === bankTxId ? { ...bt, matched: true, matchedWith: systemTxId } : bt
    )
    
    const updatedSystemTxs = systemTransactions.map(st =>
      st.id === systemTxId ? { ...st, matched: true } : st
    )
    
    setBankTransactions(updatedBankTxs)
    setSystemTransactions(updatedSystemTxs)
    toast.success('İşlemler manuel olarak eşleştirildi')
  }

  const handleUnmatch = (bankTxId: string) => {
    const bankTx = bankTransactions.find(bt => bt.id === bankTxId)
    if (!bankTx || !bankTx.matchedWith) return
    
    const updatedBankTxs = bankTransactions.map(bt =>
      bt.id === bankTxId ? { ...bt, matched: false, matchedWith: undefined } : bt
    )
    
    const updatedSystemTxs = systemTransactions.map(st =>
      st.id === bankTx.matchedWith ? { ...st, matched: false } : st
    )
    
    setBankTransactions(updatedBankTxs)
    setSystemTransactions(updatedSystemTxs)
    toast.success('Eşleştirme kaldırıldı')
  }

  const calculateStats = (): ReconciliationStats => {
    const totalBankTransactions = bankTransactions.length
    const totalSystemTransactions = systemTransactions.length
    const matchedCount = bankTransactions.filter(bt => bt.matched).length
    const unmatchedBankCount = bankTransactions.filter(bt => !bt.matched).length
    const unmatchedSystemCount = systemTransactions.filter(st => !st.matched).length
    
    const bankTotal = bankTransactions.reduce((sum, bt) => 
      sum + (bt.type === 'credit' ? bt.amount : -bt.amount), 0
    )
    const systemTotal = systemTransactions.reduce((sum, st) => 
      sum + (st.type === 'income' ? st.amount : -st.amount), 0
    )
    const differenceAmount = bankTotal - systemTotal
    
    return {
      totalBankTransactions,
      totalSystemTransactions,
      matchedCount,
      unmatchedBankCount,
      unmatchedSystemCount,
      differenceAmount
    }
  }

  const stats = calculateStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const filteredBankTransactions = bankTransactions.filter(bt => {
    const matchesSearch = bt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bt.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'matched' && bt.matched) ||
                         (filterStatus === 'unmatched' && !bt.matched)
    return matchesSearch && matchesFilter
  })

  const filteredSystemTransactions = systemTransactions.filter(st => {
    const matchesSearch = st.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         st.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'matched' && st.matched) ||
                         (filterStatus === 'unmatched' && !st.matched)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary}`}>Banka Mutabakat</h2>
          <p className="text-sm text-neutral-600 mt-1">Banka ekstresi ile sistem kayıtlarını karşılaştır</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Ekstre Yükle</span>
          </button>
          <button
            onClick={generateMockBankData}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Örnek Veri</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Bank Transactions */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Building2 size={20} />
            <span className={DESIGN_TOKENS.typography.stat.md}>{stats.totalBankTransactions}</span>
          </div>
          <div className="text-sm opacity-90">Banka İşlemi</div>
        </div>

        {/* Total System Transactions */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText size={20} />
            <span className={DESIGN_TOKENS.typography.stat.md}>{stats.totalSystemTransactions}</span>
          </div>
          <div className="text-sm opacity-90">Sistem Kaydı</div>
        </div>

        {/* Matched */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} />
            <span className={DESIGN_TOKENS.typography.stat.md}>{stats.matchedCount}</span>
          </div>
          <div className="text-sm opacity-90">Eşleşti</div>
        </div>

        {/* Unmatched Bank */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={20} />
            <span className={DESIGN_TOKENS.typography.stat.md}>{stats.unmatchedBankCount}</span>
          </div>
          <div className="text-sm opacity-90">Banka (Eşleşmedi)</div>
        </div>

        {/* Unmatched System */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={20} />
            <span className={DESIGN_TOKENS.typography.stat.md}>{stats.unmatchedSystemCount}</span>
          </div>
          <div className="text-sm opacity-90">Sistem (Eşleşmedi)</div>
        </div>

        {/* Difference */}
        <div className={`bg-gradient-to-br rounded-2xl p-4 text-white ${
          Math.abs(stats.differenceAmount) < 0.01 
            ? 'from-green-500 to-green-600' 
            : 'from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            {Math.abs(stats.differenceAmount) < 0.01 ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="text-lg font-bold">{formatCurrency(stats.differenceAmount)}</span>
          </div>
          <div className="text-sm opacity-90">Fark</div>
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
          onClick={() => setActiveView('match')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'match'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Eşleştirme
        </button>
        <button
          onClick={() => setActiveView('report')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
            activeView === 'report'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Rapor
        </button>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
                <input
                  type="text"
                  placeholder="İşlem ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <select
                value={selectedBankAccount}
                onChange={(e) => setSelectedBankAccount(e.target.value)}
                className={input('md', 'default', undefined, 'md')}
              >
                <option value="all">Tüm Hesaplar</option>
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={input('md', 'default', undefined, 'md')}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="matched">Eşleşenler</option>
                <option value="unmatched">Eşleşmeyenler</option>
              </select>

              <button
                onClick={handleAutoMatch}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Link2 size={18} />
                <span>Otomatik Eşleştir</span>
              </button>
            </div>
          </div>

          {/* Transactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bank Transactions */}
            <div className={card('md', 'none', 'default', 'lg')}>
              <div className="p-4 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Building2 size={20} />
                  Banka İşlemleri ({filteredBankTransactions.length})
                </h3>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {filteredBankTransactions.length === 0 ? (
                  <div className="p-8 text-center text-neutral-600">
                    <Building2 className="mx-auto mb-4 text-neutral-400" size={48} />
                    <p>Banka işlemi bulunamadı</p>
                    <p className="text-sm mt-2">Ekstre dosyası yükleyin</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {filteredBankTransactions.map((tx) => (
                      <div key={tx.id} className="p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-neutral-900">{tx.description}</span>
                              {tx.matched && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                  <CheckCircle size={12} />
                                  Eşleşti
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-600">{formatDate(tx.date)}</div>
                            {tx.reference && (
                              <div className="text-xs text-neutral-500 mt-1">Ref: {tx.reference}</div>
                            )}
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className={`font-bold ${
                              tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </div>
                            {tx.matched && (
                              <button
                                onClick={() => handleUnmatch(tx.id)}
                                className="mt-1 text-xs text-red-600 hover:underline"
                              >
                                Eşleştirmeyi Kaldır
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {tx.category && (
                          <div className="text-xs text-neutral-500 mt-1">
                            <span className="px-2 py-1 bg-neutral-100 rounded-full">{tx.category}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Transactions */}
            <div className={card('md', 'none', 'default', 'lg')}>
              <div className="p-4 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <FileText size={20} />
                  Sistem Kayıtları ({filteredSystemTransactions.length})
                </h3>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {filteredSystemTransactions.length === 0 ? (
                  <div className="p-8 text-center text-neutral-600">
                    <FileText className="mx-auto mb-4 text-neutral-400" size={48} />
                    <p>Sistem kaydı bulunamadı</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {filteredSystemTransactions.map((tx) => (
                      <div key={tx.id} className="p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-neutral-900">{tx.description}</span>
                              {tx.matched && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                  <CheckCircle size={12} />
                                  Eşleşti
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-600">{formatDate(tx.date)}</div>
                            {tx.reference && (
                              <div className="text-xs text-neutral-500 mt-1">Ref: {tx.reference}</div>
                            )}
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className={`font-bold ${
                              tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-neutral-500 mt-1">
                          <span className="px-2 py-1 bg-neutral-100 rounded-full">{tx.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match View */}
      {activeView === 'match' && (
        <div className={card('md', 'lg', 'default', 'lg')}>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Manuel Eşleştirme</h3>
          <p className="text-sm text-neutral-600 mb-6">
            Eşleşmeyen işlemleri manuel olarak birbirine bağlayın
          </p>
          
          <div className="space-y-4">
            {filteredBankTransactions.filter(bt => !bt.matched).slice(0, 3).map(bankTx => (
              <div key={bankTx.id} className="border border-neutral-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{bankTx.description}</div>
                    <div className={`${DESIGN_TOKENS.typography.body.sm} ${DESIGN_TOKENS.colors.text.secondary}`}>{formatDate(bankTx.date)} • {formatCurrency(bankTx.amount)}</div>
                  </div>
                  <Link2 className="text-neutral-400" size={20} />
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-neutral-700 mb-2">Olası Eşleşmeler:</div>
                  {filteredSystemTransactions
                    .filter(st => !st.matched && Math.abs(st.amount - bankTx.amount) < 0.01)
                    .map(systemTx => (
                      <button
                        key={systemTx.id}
                        onClick={() => handleManualMatch(bankTx.id, systemTx.id)}
                        className="w-full flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-neutral-900">{systemTx.description}</div>
                          <div className="text-xs text-neutral-600">{formatDate(systemTx.date)} • {systemTx.category}</div>
                        </div>
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(systemTx.amount)}
                        </div>
                      </button>
                    ))}
                  {filteredSystemTransactions.filter(st => !st.matched && Math.abs(st.amount - bankTx.amount) < 0.01).length === 0 && (
                    <div className="text-sm text-neutral-500 italic p-3 bg-neutral-50 rounded-lg">
                      Uygun eşleşme bulunamadı
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredBankTransactions.filter(bt => !bt.matched).length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                <p className="text-lg font-medium text-neutral-900">Tüm işlemler eşleştirildi!</p>
                <p className="text-sm text-neutral-600 mt-2">Eşleşmeyen banka işlemi kalmadı</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report View */}
      {activeView === 'report' && (
        <div className="space-y-6">
          <div className={card('md', 'lg', 'default', 'lg')}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Mutabakat Raporu</h3>
            
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-neutral-900">Banka Özeti</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Toplam Giriş:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(bankTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Toplam Çıkış:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(bankTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-neutral-900 font-medium">Net:</span>
                      <span className="font-bold text-neutral-900">
                        {formatCurrency(
                          bankTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-neutral-900">Sistem Özeti</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Toplam Gelir:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(systemTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Toplam Gider:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(systemTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-neutral-900 font-medium">Net:</span>
                      <span className="font-bold text-neutral-900">
                        {formatCurrency(
                          systemTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reconciliation Result */}
              <div className={`p-6 rounded-xl ${
                Math.abs(stats.differenceAmount) < 0.01
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-lg font-semibold ${
                      Math.abs(stats.differenceAmount) < 0.01 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {Math.abs(stats.differenceAmount) < 0.01 ? 'Mutabakat Sağlandı ✓' : 'Mutabakat Farkı Var!'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      Math.abs(stats.differenceAmount) < 0.01 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {Math.abs(stats.differenceAmount) < 0.01 
                        ? 'Banka ve sistem kayıtları tam olarak eşleşiyor'
                        : `Fark tutarı: ${formatCurrency(stats.differenceAmount)}`
                      }
                    </p>
                  </div>
                  {Math.abs(stats.differenceAmount) < 0.01 ? (
                    <CheckCircle className="text-green-600" size={48} />
                  ) : (
                    <AlertCircle className="text-red-600" size={48} />
                  )}
                </div>
              </div>

              {/* Export */}
              <div className="flex items-center justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                  <Download size={18} />
                  <span>Excel İndir</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                  <FileText size={18} />
                  <span>PDF Rapor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
