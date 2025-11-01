import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Download, 
  FileText, BarChart3, PieChart, Building2, CreditCard,
  ArrowUpCircle, ArrowDownCircle, Minus, AlertCircle, CheckCircle
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type ReportType = 'cashflow' | 'profitloss' | 'balance' | 'vat'

interface CashflowData {
  period: string
  operatingInflow: number
  operatingOutflow: number
  investingInflow: number
  investingOutflow: number
  financingInflow: number
  financingOutflow: number
  netChange: number
}

interface ProfitLossData {
  category: string
  amount: number
  percentage: number
}

interface BalanceSheetData {
  category: string
  subcategories: Array<{
    name: string
    amount: number
  }>
  total: number
}

interface VATData {
  period: string
  sales: number
  outputVAT: number
  purchases: number
  inputVAT: number
  netVAT: number
}

export default function AdvancedReporting() {
  const [activeReport, setActiveReport] = useState<ReportType>('cashflow')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [cashflowData, setCashflowData] = useState<CashflowData[]>([])
  const [revenueData, setRevenueData] = useState<ProfitLossData[]>([])
  const [expenseData, setExpenseData] = useState<ProfitLossData[]>([])
  const [assets, setAssets] = useState<BalanceSheetData[]>([])
  const [liabilities, setLiabilities] = useState<BalanceSheetData[]>([])
  const [vatData, setVatData] = useState<VATData[]>([])

  // Load data when report type changes
  useEffect(() => {
    loadReportData()
  }, [activeReport, dateRange])

  const loadReportData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    try {
      if (activeReport === 'cashflow') {
        const response = await axios.get(`${API_URL}/api/accounting/reports/cashflow`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { months: 6 }
        })
        setCashflowData(response.data.data)
      } else if (activeReport === 'profitloss') {
        const response = await axios.get(`${API_URL}/api/accounting/reports/profit-loss`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            startDate: dateRange.start,
            endDate: dateRange.end
          }
        })
        setRevenueData(response.data.data.revenue || [])
        setExpenseData(response.data.data.expenses || [])
      } else if (activeReport === 'balance') {
        const response = await axios.get(`${API_URL}/api/accounting/reports/balance-sheet`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { asOfDate: dateRange.end }
        })
        
        // Transform API response to component format
        const apiData = response.data.data
        setAssets([
          {
            category: 'Dönen Varlıklar',
            subcategories: [
              { name: 'Nakit ve Benzerleri', amount: apiData.assets.currentAssets.cash },
              { name: 'Ticari Alacaklar', amount: apiData.assets.currentAssets.receivables },
              { name: 'Stoklar', amount: apiData.assets.currentAssets.inventory }
            ],
            total: apiData.assets.currentAssets.total
          },
          {
            category: 'Duran Varlıklar',
            subcategories: [
              { name: 'Maddi Duran Varlıklar', amount: apiData.assets.fixedAssets.equipment },
              { name: 'Birikmiş Amortisman', amount: -apiData.assets.fixedAssets.accumulated_depreciation }
            ],
            total: apiData.assets.fixedAssets.total
          }
        ])
        
        setLiabilities([
          {
            category: 'Kısa Vadeli Yükümlülükler',
            subcategories: [
              { name: 'Ticari Borçlar', amount: apiData.liabilities.currentLiabilities.payables },
              { name: 'Kısa Vadeli Krediler', amount: apiData.liabilities.currentLiabilities.shortTermLoans }
            ],
            total: apiData.liabilities.currentLiabilities.total
          },
          {
            category: 'Uzun Vadeli Yükümlülükler',
            subcategories: [
              { name: 'Uzun Vadeli Krediler', amount: apiData.liabilities.longTermLiabilities.longTermLoans }
            ],
            total: apiData.liabilities.longTermLiabilities.total
          },
          {
            category: 'Özkaynaklar',
            subcategories: [
              { name: 'Sermaye', amount: apiData.equity.capital },
              { name: 'Geçmiş Yıl Karları', amount: apiData.equity.retainedEarnings }
            ],
            total: apiData.equity.totalEquity
          }
        ])
      } else if (activeReport === 'vat') {
        const response = await axios.get(`${API_URL}/api/accounting/reports/vat-declaration`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { months: 6 }
        })
        setVatData(response.data.data)
      }
    } catch (error: any) {
      console.error('Failed to load report data:', error)
      toast.error(error.response?.data?.message || 'Rapor verileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data for development
  const mockCashflowData: CashflowData[] = [
    {
      period: 'Ocak 2024',
      operatingInflow: 150000,
      operatingOutflow: 80000,
      investingInflow: 0,
      investingOutflow: 25000,
      financingInflow: 50000,
      financingOutflow: 10000,
      netChange: 85000
    },
    {
      period: 'Şubat 2024',
      operatingInflow: 180000,
      operatingOutflow: 90000,
      investingInflow: 10000,
      investingOutflow: 0,
      financingInflow: 0,
      financingOutflow: 12000,
      netChange: 88000
    },
    {
      period: 'Mart 2024',
      operatingInflow: 200000,
      operatingOutflow: 95000,
      investingInflow: 0,
      investingOutflow: 30000,
      financingInflow: 0,
      financingOutflow: 15000,
      netChange: 60000
    },
    {
      period: 'Nisan 2024',
      operatingInflow: 175000,
      operatingOutflow: 88000,
      investingInflow: 5000,
      investingOutflow: 0,
      financingInflow: 20000,
      financingOutflow: 13000,
      netChange: 99000
    },
    {
      period: 'Mayıs 2024',
      operatingInflow: 220000,
      operatingOutflow: 100000,
      investingInflow: 0,
      investingOutflow: 40000,
      financingInflow: 0,
      financingOutflow: 14000,
      netChange: 66000
    },
    {
      period: 'Haziran 2024',
      operatingInflow: 250000,
      operatingOutflow: 110000,
      investingInflow: 15000,
      investingOutflow: 0,
      financingInflow: 0,
      financingOutflow: 16000,
      netChange: 139000
    }
  ]

  // Calculate totals from API data
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0)
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0)
  const netProfit = totalRevenue - totalExpense

  // Calculate Balance Sheet totals from API data
  const totalAssets = assets.reduce((sum, item) => sum + item.total, 0)
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.total, 0)

  // Mock data for VAT (fallback)
  const mockVatData: VATData[] = [
    {
      period: 'Ocak 2024',
      sales: 150000,
      outputVAT: 30000,
      purchases: 80000,
      inputVAT: 16000,
      netVAT: 14000
    },
    {
      period: 'Şubat 2024',
      sales: 180000,
      outputVAT: 36000,
      purchases: 90000,
      inputVAT: 18000,
      netVAT: 18000
    },
    {
      period: 'Mart 2024',
      sales: 200000,
      outputVAT: 40000,
      purchases: 95000,
      inputVAT: 19000,
      netVAT: 21000
    },
    {
      period: 'Nisan 2024',
      sales: 175000,
      outputVAT: 35000,
      purchases: 88000,
      inputVAT: 17600,
      netVAT: 17400
    },
    {
      period: 'Mayıs 2024',
      sales: 220000,
      outputVAT: 44000,
      purchases: 100000,
      inputVAT: 20000,
      netVAT: 24000
    },
    {
      period: 'Haziran 2024',
      sales: 250000,
      outputVAT: 50000,
      purchases: 110000,
      inputVAT: 22000,
      netVAT: 28000
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleExportPDF = () => {
    toast.info('PDF export özelliği yakında eklenecek')
  }

  const handleExportExcel = () => {
    toast.info('Excel export özelliği yakında eklenecek')
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-neutral-600">Rapor yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Gelişmiş Raporlama</h2>
          <p className="text-sm text-neutral-600 mt-1">Detaylı finansal analiz ve raporlar</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <FileText size={18} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveReport('cashflow')}
          className={`p-6 rounded-2xl border-2 transition-all ${
            activeReport === 'cashflow'
              ? 'border-blue-500 bg-blue-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <TrendingUp className={activeReport === 'cashflow' ? 'text-blue-600' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">Nakit Akış</h3>
          <p className="text-xs text-neutral-600 mt-1">Cashflow Raporu</p>
        </button>

        <button
          onClick={() => setActiveReport('profitloss')}
          className={`p-6 rounded-2xl border-2 transition-all ${
            activeReport === 'profitloss'
              ? 'border-green-500 bg-green-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <BarChart3 className={activeReport === 'profitloss' ? 'text-green-600' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">Kar-Zarar</h3>
          <p className="text-xs text-neutral-600 mt-1">Gelir Tablosu</p>
        </button>

        <button
          onClick={() => setActiveReport('balance')}
          className={`p-6 rounded-2xl border-2 transition-all ${
            activeReport === 'balance'
              ? 'border-purple-500 bg-purple-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <Building2 className={activeReport === 'balance' ? 'text-purple-600' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">Bilanço</h3>
          <p className="text-xs text-neutral-600 mt-1">Aktif/Pasif</p>
        </button>

        <button
          onClick={() => setActiveReport('vat')}
          className={`p-6 rounded-2xl border-2 transition-all ${
            activeReport === 'vat'
              ? 'border-orange-500 bg-orange-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <CreditCard className={activeReport === 'vat' ? 'text-orange-600' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">KDV Raporu</h3>
          <p className="text-xs text-neutral-600 mt-1">Beyanname Hazırlık</p>
        </button>
      </div>

      {/* Cashflow Report */}
      {activeReport === 'cashflow' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpCircle size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Toplam Giriş</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingInflow + d.investingInflow + d.financingInflow, 0))}
              </div>
              <div className="text-sm opacity-90">Tüm Dönem</div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownCircle size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Toplam Çıkış</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingOutflow + d.investingOutflow + d.financingOutflow, 0))}
              </div>
              <div className="text-sm opacity-90">Tüm Dönem</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Net Değişim</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(cashflowData.reduce((sum, d) => sum + d.netChange, 0))}
              </div>
              <div className="text-sm opacity-90">Tüm Dönem</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Aylık Nakit Akış Trendi</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="operatingInflow" name="Operasyonel Giriş" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="operatingOutflow" name="Operasyonel Çıkış" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="netChange" name="Net Değişim" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Detaylı Nakit Akış Tablosu</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Dönem</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">İşletme +</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">İşletme -</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Yatırım +</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Yatırım -</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Finansman +</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Finansman -</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {cashflowData.map((row, index) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">{row.period}</td>
                        <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">{formatCurrency(row.operatingInflow)}</td>
                        <td className="px-6 py-4 text-sm text-right text-red-600 font-semibold">{formatCurrency(row.operatingOutflow)}</td>
                        <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(row.investingInflow)}</td>
                        <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(row.investingOutflow)}</td>
                        <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(row.financingInflow)}</td>
                        <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(row.financingOutflow)}</td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${row.netChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(row.netChange)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit & Loss Report */}
      {activeReport === 'profitloss' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} />
                <CheckCircle size={20} />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm opacity-90">Toplam Gelir</div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown size={24} />
                <AlertCircle size={20} />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalExpense)}</div>
              <div className="text-sm opacity-90">Toplam Gider</div>
            </div>

            <div className={`bg-gradient-to-br rounded-2xl p-6 text-white ${
              netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {netProfit >= 0 ? 'KAR' : 'ZARAR'}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(Math.abs(netProfit))}</div>
              <div className="text-sm opacity-90">Net {netProfit >= 0 ? 'Kar' : 'Zarar'}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Pie */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Gelir Dağılımı</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.category}: ${entry.percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            {/* Expense Pie */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Gider Dağılımı</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed P&L */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Kar-Zarar Tablosu</h3>
            
            <div className="space-y-6">
              {/* Revenue Section */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-green-500">
                  <h4 className="font-semibold text-green-900">GELİRLER</h4>
                  <span className="font-bold text-green-900">{formatCurrency(totalRevenue)}</span>
                </div>
                {revenueData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">{item.category}</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              {/* Expense Section */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-red-500">
                  <h4 className="font-semibold text-red-900">GİDERLER</h4>
                  <span className="font-bold text-red-900">({formatCurrency(totalExpense)})</span>
                </div>
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">{item.category}</span>
                    <span className="font-semibold text-neutral-900">({formatCurrency(item.amount)})</span>
                  </div>
                ))}
              </div>

              {/* Net Profit */}
              <div className={`p-6 rounded-xl ${
                netProfit >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    NET {netProfit >= 0 ? 'KAR' : 'ZARAR'}
                  </h4>
                  <span className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    {formatCurrency(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet Report */}
      {activeReport === 'balance' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Building2 size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AKTİF</span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalAssets)}</div>
              <div className="text-sm opacity-90">Toplam Varlıklar</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <CreditCard size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">PASİF</span>
              </div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalLiabilities)}</div>
              <div className="text-sm opacity-90">Kaynak Toplam</div>
            </div>
          </div>

          {/* Balance Sheet Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="bg-white rounded-2xl border border-neutral-200">
              <div className="p-4 border-b border-neutral-200 bg-blue-50">
                <h3 className="font-semibold text-blue-900">AKTİFLER (Varlıklar)</h3>
              </div>
              <div className="p-6 space-y-6">
                {assets.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200">
                      <h4 className="font-semibold text-neutral-900">{section.category}</h4>
                      <span className="font-bold text-blue-600">{formatCurrency(section.total)}</span>
                    </div>
                    <div className="space-y-2">
                      {section.subcategories.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 px-3 hover:bg-neutral-50 rounded-lg">
                          <span className="text-sm text-neutral-700">{item.name}</span>
                          <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t-2 border-blue-500">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-blue-900">TOPLAM AKTİF</h4>
                    <span className="text-2xl font-bold text-blue-900">{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liabilities */}
            <div className="bg-white rounded-2xl border border-neutral-200">
              <div className="p-4 border-b border-neutral-200 bg-purple-50">
                <h3 className="font-semibold text-purple-900">PASİFLER (Kaynaklar)</h3>
              </div>
              <div className="p-6 space-y-6">
                {liabilities.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200">
                      <h4 className="font-semibold text-neutral-900">{section.category}</h4>
                      <span className="font-bold text-purple-600">{formatCurrency(section.total)}</span>
                    </div>
                    <div className="space-y-2">
                      {section.subcategories.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 px-3 hover:bg-neutral-50 rounded-lg">
                          <span className="text-sm text-neutral-700">{item.name}</span>
                          <span className="text-sm font-medium text-neutral-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t-2 border-purple-500">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-purple-900">TOPLAM PASİF</h4>
                    <span className="text-2xl font-bold text-purple-900">{formatCurrency(totalLiabilities)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`p-6 rounded-xl ${
            Math.abs(totalAssets - totalLiabilities) < 0.01
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Math.abs(totalAssets - totalLiabilities) < 0.01 ? (
                  <CheckCircle className="text-green-600" size={32} />
                ) : (
                  <AlertCircle className="text-red-600" size={32} />
                )}
                <div>
                  <h4 className={`text-lg font-bold ${
                    Math.abs(totalAssets - totalLiabilities) < 0.01 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {Math.abs(totalAssets - totalLiabilities) < 0.01 ? 'Bilanço Dengede ✓' : 'Bilanço Farkı Var!'}
                  </h4>
                  <p className={`text-sm ${
                    Math.abs(totalAssets - totalLiabilities) < 0.01 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {Math.abs(totalAssets - totalLiabilities) < 0.01
                      ? 'Aktif ve Pasif toplamları eşittir'
                      : `Fark: ${formatCurrency(Math.abs(totalAssets - totalLiabilities))}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VAT Report */}
      {activeReport === 'vat' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Hesaplanan</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(vatData.reduce((sum, d) => sum + d.outputVAT, 0))}
              </div>
              <div className="text-sm opacity-90">Çıkan KDV</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">İndirilecek</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(vatData.reduce((sum, d) => sum + d.inputVAT, 0))}
              </div>
              <div className="text-sm opacity-90">Giren KDV</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Ödenecek</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(vatData.reduce((sum, d) => sum + d.netVAT, 0))}
              </div>
              <div className="text-sm opacity-90">Net KDV</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">KDV Trendi</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={vatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="outputVAT" name="Hesaplanan KDV" fill="#10b981" />
                <Bar dataKey="inputVAT" name="İndirilecek KDV" fill="#3b82f6" />
                <Bar dataKey="netVAT" name="Ödenecek KDV" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* VAT Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">KDV Beyanname Detayı</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Dönem</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Satışlar</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Hesaplanan KDV</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Alışlar</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">İndirilecek KDV</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Ödenecek KDV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {vatData.map((row, index) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900">{row.period}</td>
                        <td className="px-6 py-4 text-sm text-right text-neutral-900">{formatCurrency(row.sales)}</td>
                        <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">{formatCurrency(row.outputVAT)}</td>
                        <td className="px-6 py-4 text-sm text-right text-neutral-900">{formatCurrency(row.purchases)}</td>
                        <td className="px-6 py-4 text-sm text-right text-blue-600 font-semibold">{formatCurrency(row.inputVAT)}</td>
                        <td className="px-6 py-4 text-sm text-right text-orange-600 font-bold">{formatCurrency(row.netVAT)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50 border-t-2 border-neutral-300">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-neutral-900">TOPLAM</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.sales, 0))}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.outputVAT, 0))}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.purchases, 0))}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-blue-600">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.inputVAT, 0))}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-orange-600">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.netVAT, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
