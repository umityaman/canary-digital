// Advanced Reporting Component - Updated 2025-11-05 10:20
import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Download, 
  FileText, BarChart3, PieChart, Building2, CreditCard,
  ArrowUpCircle, ArrowDownCircle, Minus, AlertCircle, CheckCircle
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { card, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_BASE = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`

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

  const safeNumber = (value: unknown, fallback = 0) => {
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback
  }

  // Load data when report type changes
  useEffect(() => {
    loadReportData()
  }, [activeReport, dateRange])

  const loadReportData = async () => {
    const reportType = activeReport
    setLoading(true)
    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.')
      applyFallbackData(reportType)
      setLoading(false)
      return
    }

    try {
      if (reportType === 'cashflow') {
        const response = await axios.get(`${API_BASE}/accounting/reports/cashflow`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { months: 6 }
        })
        const apiData = Array.isArray(response.data?.data) ? response.data.data : []
        setCashflowData(apiData.length ? apiData : mockCashflowData)
      } else if (reportType === 'profitloss') {
        const response = await axios.get(`${API_BASE}/accounting/reports/profit-loss`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end
          }
        })

        const revenue = Array.isArray(response.data?.data?.revenue) ? response.data.data.revenue : []
        const expenses = Array.isArray(response.data?.data?.expenses) ? response.data.data.expenses : []

        setRevenueData(revenue.length ? revenue : mockRevenueData)
        setExpenseData(expenses.length ? expenses : mockExpenseData)
      } else if (reportType === 'balance') {
        const response = await axios.get(`${API_BASE}/accounting/reports/balance-sheet`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { asOfDate: dateRange.end }
        })

        const apiData = response.data?.data
        const assetsData = apiData?.assets
        const liabilitiesData = apiData?.liabilities
        const equityData = apiData?.equity

        if (assetsData && liabilitiesData && equityData) {
          const transformedAssets: BalanceSheetData[] = [
            {
              category: 'Dönen Varlıklar',
              subcategories: [
                { name: 'Nakit ve Benzerleri', amount: safeNumber(assetsData.currentAssets?.cash) },
                { name: 'Ticari Alacaklar', amount: safeNumber(assetsData.currentAssets?.receivables) },
                { name: 'Stoklar', amount: safeNumber(assetsData.currentAssets?.inventory) }
              ],
              total: safeNumber(assetsData.currentAssets?.total)
            },
            {
              category: 'Duran Varlıklar',
              subcategories: [
                { name: 'Maddi Duran Varlıklar', amount: safeNumber(assetsData.fixedAssets?.equipment) },
                { name: 'Birikmiş Amortisman', amount: -safeNumber(assetsData.fixedAssets?.accumulated_depreciation) }
              ],
              total: safeNumber(assetsData.fixedAssets?.total)
            }
          ]

          const transformedLiabilities: BalanceSheetData[] = [
            {
              category: 'Kısa Vadeli Yükümlülükler',
              subcategories: [
                { name: 'Ticari Borçlar', amount: safeNumber(liabilitiesData.currentLiabilities?.payables) },
                { name: 'Kısa Vadeli Krediler', amount: safeNumber(liabilitiesData.currentLiabilities?.shortTermLoans) }
              ],
              total: safeNumber(liabilitiesData.currentLiabilities?.total)
            },
            {
              category: 'Uzun Vadeli Yükümlülükler',
              subcategories: [
                { name: 'Uzun Vadeli Krediler', amount: safeNumber(liabilitiesData.longTermLiabilities?.longTermLoans) }
              ],
              total: safeNumber(liabilitiesData.longTermLiabilities?.total)
            },
            {
              category: 'Özkaynaklar',
              subcategories: [
                { name: 'Sermaye', amount: safeNumber(equityData.capital) },
                { name: 'Geçmiş Yıl Karları', amount: safeNumber(equityData.retainedEarnings) }
              ],
              total: safeNumber(equityData.totalEquity)
            }
          ]

          const hasMeaningfulData = transformedAssets.some(section => section.total !== 0) ||
            transformedLiabilities.some(section => section.total !== 0)

          if (hasMeaningfulData) {
            setAssets(transformedAssets)
            setLiabilities(transformedLiabilities)
          } else {
            applyFallbackData(reportType)
          }
        } else {
          applyFallbackData(reportType)
        }
      } else if (reportType === 'vat') {
        const response = await axios.get(`${API_BASE}/accounting/reports/vat-declaration`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { months: 6 }
        })
        const apiData = Array.isArray(response.data?.data) ? response.data.data : []
        setVatData(apiData.length ? apiData : mockVatData)
      }
    } catch (error: any) {
      console.error('Failed to load report data:', error)
      toast.error(error.response?.data?.message || 'Rapor verileri yüklenemedi')
      applyFallbackData(reportType)
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

  const mockRevenueData: ProfitLossData[] = [
    { category: 'Ürün Satışları', amount: 320000, percentage: 55 },
    { category: 'Hizmet Gelirleri', amount: 150000, percentage: 26 },
    { category: 'Abonelik Gelirleri', amount: 80000, percentage: 14 },
    { category: 'Diğer Gelirler', amount: 30000, percentage: 5 }
  ]

  const mockExpenseData: ProfitLossData[] = [
    { category: 'Personel Giderleri', amount: 180000, percentage: 40 },
    { category: 'Genel Giderler', amount: 90000, percentage: 20 },
    { category: 'Pazarlama', amount: 70000, percentage: 16 },
    { category: 'Ar-Ge', amount: 50000, percentage: 11 },
    { category: 'Diğer Giderler', amount: 40000, percentage: 13 }
  ]

  const mockAssetsData: BalanceSheetData[] = [
    {
      category: 'Dönen Varlıklar',
      subcategories: [
        { name: 'Nakit ve Benzerleri', amount: 250000 },
        { name: 'Ticari Alacaklar', amount: 180000 },
        { name: 'Stoklar', amount: 120000 }
      ],
      total: 550000
    },
    {
      category: 'Duran Varlıklar',
      subcategories: [
        { name: 'Maddi Duran Varlıklar', amount: 420000 },
        { name: 'Birikmiş Amortisman', amount: -80000 }
      ],
      total: 340000
    }
  ]

  const mockLiabilitiesData: BalanceSheetData[] = [
    {
      category: 'Kısa Vadeli Yükümlülükler',
      subcategories: [
        { name: 'Ticari Borçlar', amount: 160000 },
        { name: 'Kısa Vadeli Krediler', amount: 90000 }
      ],
      total: 250000
    },
    {
      category: 'Uzun Vadeli Yükümlülükler',
      subcategories: [
        { name: 'Uzun Vadeli Krediler', amount: 220000 }
      ],
      total: 220000
    },
    {
      category: 'Özkaynaklar',
      subcategories: [
        { name: 'Sermaye', amount: 300000 },
        { name: 'Geçmiş Yıl Karları', amount: 120000 }
      ],
      total: 420000
    }
  ]

  const applyFallbackData = (report: ReportType) => {
    if (report === 'cashflow') {
      setCashflowData(mockCashflowData)
    } else if (report === 'profitloss') {
      setRevenueData(mockRevenueData)
      setExpenseData(mockExpenseData)
    } else if (report === 'balance') {
      setAssets(mockAssetsData)
      setLiabilities(mockLiabilitiesData)
    } else if (report === 'vat') {
      setVatData(mockVatData)
    }
  }

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
          <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>Gelişmiş Raporlama</h2>
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
          className={`p-6 rounded-2xl border-2 transition-all min-w-0 ${
            activeReport === 'cashflow'
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <TrendingUp className={activeReport === 'cashflow' ? 'text-neutral-900' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">Nakit Akış</h3>
          <p className="text-xs text-neutral-600 mt-1">Cashflow Raporu</p>
        </button>

        <button
          onClick={() => setActiveReport('profitloss')}
          className={`p-6 rounded-2xl border-2 transition-all min-w-0 ${
            activeReport === 'profitloss'
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <BarChart3 className={activeReport === 'profitloss' ? 'text-neutral-900' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">Kar-Zarar</h3>
          <p className="text-xs text-neutral-600 mt-1">Gelir Tablosu</p>
        </button>

        <button
          onClick={() => setActiveReport('balance')}
          className={`p-6 rounded-2xl border-2 transition-all min-w-0 ${
            activeReport === 'balance'
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <Building2 className={activeReport === 'balance' ? 'text-neutral-900' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">Bilanço</h3>
          <p className="text-xs text-neutral-600 mt-1">Aktif/Pasif</p>
        </button>

        <button
          onClick={() => setActiveReport('vat')}
          className={`p-6 rounded-2xl border-2 transition-all min-w-0 col-span-2 lg:col-span-1 ${
            activeReport === 'vat'
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          }`}
        >
          <CreditCard className={activeReport === 'vat' ? 'text-neutral-900' : 'text-neutral-600'} size={32} />
          <h3 className="font-semibold text-neutral-900 mt-3">KDV Raporu</h3>
          <p className="text-xs text-neutral-600 mt-1">Beyanname Hazırlık</p>
        </button>
      </div>

      {/* Cashflow Report */}
      {activeReport === 'cashflow' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-neutral-900 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpCircle size={20} />
                <CheckCircle size={18} />
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">
                {formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingInflow + d.investingInflow + d.financingInflow, 0))}
              </div>
              <div className="text-xs opacity-90">Toplam Nakit Girişi</div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownCircle size={20} />
                <AlertCircle size={18} />
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">
                {formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingOutflow + d.investingOutflow + d.financingOutflow, 0))}
              </div>
              <div className="text-xs opacity-90">Toplam Nakit Çıkışı</div>
            </div>

            <div className={`rounded-xl p-4 text-white ${
              cashflowData.reduce((sum, d) => sum + d.netChange, 0) >= 0 ? 'bg-neutral-900' : 'bg-neutral-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {cashflowData.reduce((sum, d) => sum + d.netChange, 0) >= 0 ? 'POZİTİF' : 'NEGATİF'}
                </span>
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">
                {formatCurrency(Math.abs(cashflowData.reduce((sum, d) => sum + d.netChange, 0)))}
              </div>
              <div className="text-xs opacity-90">Net Nakit Değişimi</div>
            </div>
          </div>

          {/* Detailed Cashflow Statement */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Nakit Akış Tablosu</h3>
            
            <div className="space-y-6">
              {/* Operating Activities */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-neutral-900">
                  <h4 className="font-semibold text-neutral-900">İŞLETME FAALİYETLERİNDEN NAKİT AKIŞLARI</h4>
                  <span className="font-bold text-neutral-900">
                    {formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingInflow - d.operatingOutflow, 0))}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Nakit Girişleri</span>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingInflow, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Nakit Çıkışları</span>
                    <span className="font-semibold text-neutral-900">
                      ({formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingOutflow, 0))})
                    </span>
                  </div>
                </div>
              </div>

              {/* Investing Activities */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-neutral-900">
                  <h4 className="font-semibold text-neutral-900">YATIRIM FAALİYETLERİNDEN NAKİT AKIŞLARI</h4>
                  <span className="font-bold text-neutral-900">
                    {formatCurrency(cashflowData.reduce((sum, d) => sum + d.investingInflow - d.investingOutflow, 0))}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Yatırım Girişleri</span>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(cashflowData.reduce((sum, d) => sum + d.investingInflow, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Yatırım Çıkışları</span>
                    <span className="font-semibold text-neutral-900">
                      ({formatCurrency(cashflowData.reduce((sum, d) => sum + d.investingOutflow, 0))})
                    </span>
                  </div>
                </div>
              </div>

              {/* Financing Activities */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-neutral-900">
                  <h4 className="font-semibold text-neutral-900">FİNANSMAN FAALİYETLERİNDEN NAKİT AKIŞLARI</h4>
                  <span className="font-bold text-neutral-900">
                    {formatCurrency(cashflowData.reduce((sum, d) => sum + d.financingInflow - d.financingOutflow, 0))}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Finansman Girişleri</span>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(cashflowData.reduce((sum, d) => sum + d.financingInflow, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Finansman Çıkışları</span>
                    <span className="font-semibold text-neutral-900">
                      ({formatCurrency(cashflowData.reduce((sum, d) => sum + d.financingOutflow, 0))})
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Cash Flow */}
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-neutral-900">
                    DÖNEM SONU NAKİT VE NAKİT BENZERLERİNDEKİ NET ARTIŞ (AZALIŞ)
                  </h4>
                  <span className="text-2xl font-bold truncate text-neutral-900">
                    {formatCurrency(Math.abs(cashflowData.reduce((sum, d) => sum + d.netChange, 0)))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Period Details Table */}
          <div className={cx(card('md', 'sm', 'default', 'lg'), 'overflow-hidden')}>
            <div className="p-3 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">Dönemsel Nakit Akış Detayı</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 uppercase">Dönem</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">İşletme</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">Yatırım</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">Finansman</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">Net Değişim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {cashflowData.map((row, index) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">{row.period}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-neutral-900">
                          {formatCurrency(row.operatingInflow - row.operatingOutflow)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-neutral-900">
                          {formatCurrency(row.investingInflow - row.investingOutflow)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-neutral-900">
                          {formatCurrency(row.financingInflow - row.financingOutflow)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900">
                          {formatCurrency(row.netChange)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50 border-t-2 border-neutral-300">
                    <tr>
                      <td className="px-4 py-3 text-sm font-bold text-neutral-900">TOPLAM</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(cashflowData.reduce((sum, d) => sum + d.operatingInflow - d.operatingOutflow, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(cashflowData.reduce((sum, d) => sum + d.investingInflow - d.investingOutflow, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(cashflowData.reduce((sum, d) => sum + d.financingInflow - d.financingOutflow, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(cashflowData.reduce((sum, d) => sum + d.netChange, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
            </div>
          </div>
        </div>
      )}

      {/* Profit & Loss Report */}
      {activeReport === 'profitloss' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-neutral-900 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} />
                <CheckCircle size={18} />
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs opacity-90">Toplam Gelir</div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown size={20} />
                <AlertCircle size={18} />
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">{formatCurrency(totalExpense)}</div>
              <div className="text-xs opacity-90">Toplam Gider</div>
            </div>

            <div className={`rounded-xl p-4 text-white ${
              netProfit >= 0 ? 'bg-neutral-900' : 'bg-neutral-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={20} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {netProfit >= 0 ? 'KAR' : 'ZARAR'}
                </span>
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">{formatCurrency(Math.abs(netProfit))}</div>
              <div className="text-xs opacity-90">Net {netProfit >= 0 ? 'Kar' : 'Zarar'}</div>
            </div>
          </div>

          {/* Charts - Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Revenue Pie */}
            <div className={card('md', 'sm', 'default', 'lg')}>
              <h3 className="text-base font-semibold text-neutral-900 mb-3">Gelir Dağılımı</h3>
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPie>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.percentage}%`}
                      outerRadius={60}
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
            </div>

            {/* Expense Pie */}
            <div className={card('md', 'sm', 'default', 'lg')}>
              <h3 className="text-base font-semibold text-neutral-900 mb-3">Gider Dağılımı</h3>
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPie>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.percentage}%`}
                      outerRadius={60}
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
          </div>

          {/* Detailed P&L */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Kar-Zarar Tablosu</h3>
            
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
              <div className={`p-4 rounded-lg ${
                netProfit >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-lg font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                    NET {netProfit >= 0 ? 'KAR' : 'ZARAR'}
                  </h4>
                  <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'} truncate`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-neutral-900 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Building2 size={20} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AKTİF</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">{formatCurrency(totalAssets)}</div>
              <div className="text-xs opacity-90">Toplam Varlıklar</div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <CreditCard size={20} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">PASİF</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">{formatCurrency(totalLiabilities)}</div>
              <div className="text-xs opacity-90">Kaynak Toplam</div>
            </div>
          </div>

          {/* Balance Sheet Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Assets */}
            <div className={card('md', 'none', 'default', 'lg')}>
              <div className="p-3 border-b border-neutral-200 bg-neutral-50">
                <h3 className="text-sm font-semibold text-neutral-900">AKTİFLER (Varlıklar)</h3>
              </div>
              <div className="p-4 space-y-4">
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
                
                <div className="pt-4 border-t-2 border-neutral-900">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-neutral-900">TOPLAM AKTİF</h4>
                    <span className={cx(DESIGN_TOKENS?.typography?.stat.md, 'text-neutral-900')}>{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liabilities */}
            <div className={card('md', 'none', 'default', 'lg')}>
              <div className="p-3 border-b border-neutral-200 bg-neutral-50">
                <h3 className="text-sm font-semibold text-neutral-900">PASİFLER (Kaynaklar)</h3>
              </div>
              <div className="p-4 space-y-4">
                {liabilities.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200">
                      <h4 className="font-semibold text-neutral-900">{section.category}</h4>
                      <span className="font-bold text-neutral-900">{formatCurrency(section.total)}</span>
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
                
                <div className="pt-4 border-t-2 border-neutral-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-neutral-900">TOPLAM PASİF</h4>
                    <span className={cx(DESIGN_TOKENS?.typography?.stat.md, 'text-neutral-900')}>{formatCurrency(totalLiabilities)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`p-6 rounded-xl ${
            Math.abs(totalAssets - totalLiabilities) < 0.01
              ? 'bg-neutral-50 border border-neutral-300'
              : 'bg-neutral-100 border border-neutral-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Math.abs(totalAssets - totalLiabilities) < 0.01 ? (
                  <CheckCircle className="text-neutral-900" size={32} />
                ) : (
                  <AlertCircle className="text-neutral-700" size={32} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-neutral-900 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} />
                <CheckCircle size={18} />
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">
                {formatCurrency(vatData.reduce((sum, d) => sum + d.outputVAT, 0))}
              </div>
              <div className="text-xs opacity-90">Hesaplanan KDV (Çıkan)</div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown size={20} />
                <Minus size={18} />
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">
                {formatCurrency(vatData.reduce((sum, d) => sum + d.inputVAT, 0))}
              </div>
              <div className="text-xs opacity-90">İndirilecek KDV (Giren)</div>
            </div>

            <div className={`rounded-xl p-4 text-white ${
              vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 ? 'bg-neutral-900' : 'bg-neutral-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={20} />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 ? 'ÖDENECEK' : 'İADE'}
                </span>
              </div>
              <div className="text-xl lg:text-2xl font-bold mb-1 truncate">
                {formatCurrency(Math.abs(vatData.reduce((sum, d) => sum + d.netVAT, 0)))}
              </div>
              <div className="text-xs opacity-90">Net KDV</div>
            </div>
          </div>

          {/* Detailed VAT Declaration */}
          <div className={card('md', 'sm', 'default', 'lg')}>
            <h3 className="text-base font-semibold text-neutral-900 mb-4">KDV Beyannamesi</h3>
            
            <div className="space-y-6">
              {/* Taxable Sales Section */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-green-500">
                  <h4 className="font-semibold text-green-900">VERGİYE TABİ İŞLEMLER (Satışlar)</h4>
                  <span className="font-bold text-green-900">{formatCurrency(vatData.reduce((sum, d) => sum + d.sales, 0))}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Toplam Satış Tutarı (Matrah)</span>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(vatData.reduce((sum, d) => sum + d.sales, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 bg-green-50 rounded-lg">
                    <span className="text-neutral-700 font-medium">Hesaplanan KDV (% 20)</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(vatData.reduce((sum, d) => sum + d.outputVAT, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductible Purchases Section */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-blue-500">
                  <h4 className="font-semibold text-blue-900">İNDİRİLECEK KDV (Alışlar)</h4>
                  <span className="font-bold text-blue-900">{formatCurrency(vatData.reduce((sum, d) => sum + d.purchases, 0))}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-4 hover:bg-neutral-50 rounded-lg">
                    <span className="text-neutral-700">Toplam Alış Tutarı</span>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(vatData.reduce((sum, d) => sum + d.purchases, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 bg-blue-50 rounded-lg">
                    <span className="text-neutral-700 font-medium">İndirilecek KDV</span>
                    <span className="font-bold text-blue-600">
                      ({formatCurrency(vatData.reduce((sum, d) => sum + d.inputVAT, 0))})
                    </span>
                  </div>
                </div>
              </div>

              {/* Net VAT Payable/Refundable */}
              <div className={`p-4 rounded-lg ${
                vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 
                  ? 'bg-orange-50 border border-orange-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-lg font-bold ${
                    vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 ? 'text-orange-900' : 'text-green-900'
                  }`}>
                    {vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 ? 'ÖDENECEK KDV' : 'İADE ALINACAK KDV'}
                  </h4>
                  <span className={`text-2xl font-bold truncate ${
                    vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 ? 'text-orange-900' : 'text-green-900'
                  }`}>
                    {formatCurrency(Math.abs(vatData.reduce((sum, d) => sum + d.netVAT, 0)))}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p className={vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 ? 'text-orange-700' : 'text-green-700'}>
                    {vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 
                      ? 'Hesaplanan KDV > İndirilecek KDV - Hazine\'ye ödenecek'
                      : 'İndirilecek KDV > Hesaplanan KDV - Hazine\'den iade alınacak'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Period Details Table */}
          <div className={cx(card('md', 'sm', 'default', 'lg'), 'overflow-hidden')}>
            <div className="p-3 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">Dönemsel KDV Detayı</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutral-700 uppercase">Dönem</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">Satış Matrahı</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">Hesaplanan KDV</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">Alış Tutarı</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">İndirilecek KDV</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-neutral-700 uppercase">Ödenecek/İade KDV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {vatData.map((row, index) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm font-medium text-neutral-900">{row.period}</td>
                        <td className="px-4 py-3 text-sm text-right text-neutral-900">{formatCurrency(row.sales)}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">{formatCurrency(row.outputVAT)}</td>
                        <td className="px-4 py-3 text-sm text-right text-neutral-900">{formatCurrency(row.purchases)}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">{formatCurrency(row.inputVAT)}</td>
                        <td className={`px-4 py-3 text-sm text-right font-bold ${
                          row.netVAT >= 0 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(Math.abs(row.netVAT))} {row.netVAT >= 0 ? '(Ö)' : '(İ)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50 border-t-2 border-neutral-300">
                    <tr>
                      <td className="px-4 py-3 text-sm font-bold text-neutral-900">TOPLAM</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.sales, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.outputVAT, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-neutral-900">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.purchases, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">
                        {formatCurrency(vatData.reduce((sum, d) => sum + d.inputVAT, 0))}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold ${
                        vatData.reduce((sum, d) => sum + d.netVAT, 0) >= 0 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(Math.abs(vatData.reduce((sum, d) => sum + d.netVAT, 0)))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
