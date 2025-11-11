import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight,
  PieChart as PieChartIcon, BarChart3, FileText, Plus, RefreshCw, Download, 
  LineChart as LineChartIcon, AreaChart as AreaChartIcon, Eye, EyeOff,
  Target, Activity, Zap, BarChart2
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { toast } from 'react-hot-toast'
import { card, button, input, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

interface DashboardStats {
  currentMonth: {
    income: number
    expense: number
    profit: number
  }
  previousMonth: {
    income: number
    expense: number
    profit: number
  }
  trends: {
    incomeChange: number
    expenseChange: number
    profitChange: number
  }
  monthlyData: Array<{
    month: string
    income: number
    expense: number
  }>
  categoryBreakdown: {
    income: Array<{ category: string; amount: number }>
    expense: Array<{ category: string; amount: number }>
  }
}

const COLORS = ['#171717', '#404040', '#525252', '#737373', '#a3a3a3', '#d4d4d4']

export default function AccountingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'halfyear' | 'year'>('month')
  const [refreshing, setRefreshing] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')
  const [showComparison, setShowComparison] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0)

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      // API endpoint and auth header setup
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      // Get token from localStorage
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      if (!token) {
        console.warn('⚠️ No auth token found, showing empty dashboard')
        // Don't show error, just set empty data
        setStats({
          currentMonth: { income: 0, expense: 0, profit: 0 },
          previousMonth: { income: 0, expense: 0, profit: 0 },
          trends: { incomeChange: 0, expenseChange: 0, profitChange: 0 },
          monthlyData: [],
          categoryBreakdown: { income: [], expense: [] }
        })
        setLoading(false)
        setRefreshing(false)
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      console.log('📊 Loading dashboard data...', { API_URL })

      // Fetch dashboard trends and categories in parallel
      const [trendsRes, incomeCatRes, expenseCatRes] = await Promise.all([
        axios.get(`${API_URL}/api/accounting/dashboard/trends?months=6`, { headers }).catch(err => {
          console.error('❌ Trends API error:', err.response?.data || err.message)
          return { data: { data: [] } }
        }),
        axios.get(`${API_URL}/api/accounting/dashboard/categories?type=income`, { headers }).catch(err => {
          console.error('❌ Income categories API error:', err.response?.data || err.message)
          return { data: { data: [] } }
        }),
        axios.get(`${API_URL}/api/accounting/dashboard/categories?type=expense`, { headers }).catch(err => {
          console.error('❌ Expense categories API error:', err.response?.data || err.message)
          return { data: { data: [] } }
        })
      ])

      console.log('✅ Dashboard data loaded:', { trendsRes: trendsRes.data, incomeCatRes: incomeCatRes.data, expenseCatRes: expenseCatRes.data })

      const trendsData = trendsRes.data.data || []
      const incomeCategories = incomeCatRes.data.data || []
      const expenseCategories = expenseCatRes.data.data || []

      // Format monthly data from trends
      const monthlyData = Array.isArray(trendsData) ? trendsData.map((trend: any) => ({
        month: new Date(trend.month).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
        income: trend.income || 0,
        expense: trend.expense || 0
      })) : []

      // Get current and previous month stats
      const currentMonthTrend = trendsData[trendsData.length - 1] || { income: 0, expense: 0 }
      const previousMonthTrend = trendsData[trendsData.length - 2] || { income: 0, expense: 0 }

      const currentProfit = currentMonthTrend.income - currentMonthTrend.expense
      const previousProfit = previousMonthTrend.income - previousMonthTrend.expense

      // Calculate percentage changes
      const incomeChange = previousMonthTrend.income > 0 
        ? ((currentMonthTrend.income - previousMonthTrend.income) / previousMonthTrend.income) * 100 
        : 0
      const expenseChange = previousMonthTrend.expense > 0 
        ? ((currentMonthTrend.expense - previousMonthTrend.expense) / previousMonthTrend.expense) * 100 
        : 0
      const profitChange = previousProfit !== 0 
        ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 
        : 0

      // Format category data
      const formattedIncomeCategories = (incomeCategories || []).map((cat: any) => ({
        category: cat.category || 'Diğer',
        amount: cat.total || cat.amount || 0
      }))

      const formattedExpenseCategories = (expenseCategories || []).map((cat: any) => ({
        category: cat.category || 'Diğer',
        amount: cat.total || cat.amount || 0
      }))

      setStats({
        currentMonth: {
          income: currentMonthTrend.income || 0,
          expense: currentMonthTrend.expense || 0,
          profit: currentProfit
        },
        previousMonth: {
          income: previousMonthTrend.income || 0,
          expense: previousMonthTrend.expense || 0,
          profit: previousProfit
        },
        trends: {
          incomeChange,
          expenseChange,
          profitChange
        },
        monthlyData,
        categoryBreakdown: {
          income: formattedIncomeCategories,
          expense: formattedExpenseCategories
        }
      })
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Dashboard verileri yüklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  // Advanced statistics calculations
  const calculateAdvancedStats = () => {
    if (!stats || !stats.monthlyData || stats.monthlyData.length === 0) {
      return null
    }

    const incomes = stats.monthlyData.map(d => d.income)
    const expenses = stats.monthlyData.map(d => d.expense)
    const profits = stats.monthlyData.map(d => d.income - d.expense)

    // Average calculations
    const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length
    const avgExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length
    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length

    // Max/Min values
    const maxIncome = Math.max(...incomes)
    const minIncome = Math.min(...incomes)
    const maxExpense = Math.max(...expenses)
    const minExpense = Math.min(...expenses)

    // Profitability ratio
    const profitabilityRatio = avgIncome > 0 ? (avgProfit / avgIncome) * 100 : 0

    // Growth rate (last month vs first month)
    const firstMonthIncome = incomes[0] || 0
    const lastMonthIncome = incomes[incomes.length - 1] || 0
    const growthRate = firstMonthIncome > 0 
      ? ((lastMonthIncome - firstMonthIncome) / firstMonthIncome) * 100 
      : 0

    // Forecast next month (simple linear regression)
    const forecastIncome = lastMonthIncome * (1 + (growthRate / 100))
    const forecastExpense = expenses[expenses.length - 1] * (1 + (growthRate / 100))
    const forecastProfit = forecastIncome - forecastExpense

    // Target achievement
    const targetAchievement = monthlyTarget > 0 
      ? (stats.currentMonth.income / monthlyTarget) * 100 
      : 0

    return {
      avgIncome,
      avgExpense,
      avgProfit,
      maxIncome,
      minIncome,
      maxExpense,
      minExpense,
      profitabilityRatio,
      growthRate,
      forecastIncome,
      forecastExpense,
      forecastProfit,
      targetAchievement
    }
  }

  const advancedStats = calculateAdvancedStats()

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      // Dynamically import jsPDF
      const { default: JsPDF } = await import('jspdf')
      const doc = new JsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('Muhasebe Dashboard Raporu', 20, 20)
      
      // Add date
      doc.setFontSize(10)
      doc.text(`Oluşturulma: ${new Date().toLocaleString('tr-TR')}`, 20, 30)
      
      // Add stats
      doc.setFontSize(12)
      let yPos = 45
      
      if (stats) {
        doc.text(`Gelir: ${formatCurrency(stats.currentMonth.income)}`, 20, yPos)
        yPos += 10
        doc.text(`Gider: ${formatCurrency(stats.currentMonth.expense)}`, 20, yPos)
        yPos += 10
        doc.text(`Kar/Zarar: ${formatCurrency(stats.currentMonth.profit)}`, 20, yPos)
        yPos += 10
        doc.text(`Nakit Akışı: ${formatCurrency(stats.currentMonth.income - stats.currentMonth.expense)}`, 20, yPos)
      }
      
      doc.save(`muhasebe-dashboard-${new Date().getTime()}.pdf`)
      toast.success('PDF indirildi')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('PDF oluşturulamadı')
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = () => {
    if (!stats) return
    
    try {
      // Create CSV content
      const csvContent = [
        ['Muhasebe Dashboard Raporu'],
        ['Oluşturulma', new Date().toLocaleString('tr-TR')],
        [''],
        ['Metrik', 'Bu Ay', 'Geçen Ay', 'Değişim'],
        ['Gelir', stats.currentMonth.income, stats.previousMonth.income, `${formatPercentage(stats.trends.incomeChange)}`],
        ['Gider', stats.currentMonth.expense, stats.previousMonth.expense, `${formatPercentage(stats.trends.expenseChange)}`],
        ['Kar/Zarar', stats.currentMonth.profit, stats.previousMonth.profit, `${formatPercentage(stats.trends.profitChange)}`],
        [''],
        ['Aylık Veriler'],
        ['Ay', 'Gelir', 'Gider'],
        ...stats.monthlyData.map(d => [d.month, d.income, d.expense])
      ]
      
      const csv = csvContent.map(row => row.join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `muhasebe-dashboard-${new Date().getTime()}.csv`
      link.click()
      
      toast.success('Excel dosyası indirildi')
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Excel dosyası oluşturulamadı')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-600">Dashboard yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-600">Dashboard verisi yüklenemedi</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className={cx(button('sm', 'outline', 'md'), 'gap-2')}
            title="Yenile"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Yenileniyor...' : 'Yenile'}</span>
          </button>
          
          <div className="h-8 w-px bg-neutral-300 hidden sm:block" />
          
          {/* Period Filter Buttons */}
          <button
            onClick={() => setSelectedPeriod('day')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'day'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Bugün
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Bu Hafta
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Bu Ay
          </button>
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'quarter'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Son 3 Ay
          </button>
          <button
            onClick={() => setSelectedPeriod('halfyear')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'halfyear'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Son 6 Ay
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'year'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Yıllık
          </button>
        </div>
      </div>

      {/* KPI Cards - Minimal B&W Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Income Card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={16} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${
              stats.trends.incomeChange >= 0 ? 'text-neutral-900' : 'text-neutral-500'
            }`}>
              {stats.trends.incomeChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatPercentage(stats.trends.incomeChange)}
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
            {formatCurrency(stats.currentMonth.income)}
          </h3>
          <p className="text-xs font-medium text-neutral-600">Bu Ay Gelir</p>
        </div>

        {/* Expense Card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-white" size={16} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${
              stats.trends.expenseChange >= 0 ? 'text-neutral-500' : 'text-neutral-900'
            }`}>
              {stats.trends.expenseChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatPercentage(stats.trends.expenseChange)}
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
            {formatCurrency(stats.currentMonth.expense)}
          </h3>
          <p className="text-xs font-medium text-neutral-600">Bu Ay Gider</p>
        </div>

        {/* Profit Card */}
        <div className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
          stats.currentMonth.profit >= 0 ? 'border-neutral-900' : 'border-neutral-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stats.currentMonth.profit >= 0 ? 'bg-neutral-900' : 'bg-neutral-400'
            }`}>
              <DollarSign className="text-white" size={16} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${
              stats.trends.profitChange >= 0 ? 'text-neutral-900' : 'text-neutral-500'
            }`}>
              {stats.trends.profitChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatPercentage(stats.trends.profitChange)}
            </div>
          </div>
          <h3 className={`text-lg font-bold mb-0.5 ${
            stats.currentMonth.profit >= 0 ? 'text-neutral-900' : 'text-neutral-600'
          }`}>
            {formatCurrency(Math.abs(stats.currentMonth.profit))}
          </h3>
          <p className={`text-xs font-medium ${
            stats.currentMonth.profit >= 0 ? 'text-neutral-900' : 'text-neutral-600'
          }`}>
            {stats.currentMonth.profit >= 0 ? 'Net Kâr' : 'Net Zarar'}
          </p>
        </div>

        {/* Cash Flow Card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={16} />
            </div>
            <span className="text-xs font-medium text-neutral-600">Bu Ay</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
            {formatCurrency(stats.currentMonth.income - stats.currentMonth.expense)}
          </h3>
          <p className="text-xs font-medium text-neutral-600">Nakit Akışı</p>
        </div>
      </div>

      {/* Advanced Statistics and Target Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Analytics */}
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold text-neutral-900')}>Hızlı Analizler</h3>
          </div>
          {advancedStats && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-700">Kârlılık Oranı</span>
                <span className={`text-lg font-bold ${
                  advancedStats.profitabilityRatio >= 0 ? 'text-neutral-900' : 'text-neutral-700'
                }`}>
                  {advancedStats.profitabilityRatio.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-700">Büyüme Hızı</span>
                <span className={`text-lg font-bold ${
                  advancedStats.growthRate >= 0 ? 'text-neutral-900' : 'text-neutral-800'
                }`}>
                  {formatPercentage(advancedStats.growthRate)}
                </span>
              </div>
              <div className="h-px bg-indigo-300 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-700">Ort. Gelir</span>
                <span className="text-sm font-semibold text-indigo-900">{formatCurrency(advancedStats.avgIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-700">Ort. Gider</span>
                <span className="text-sm font-semibold text-indigo-900">{formatCurrency(advancedStats.avgExpense)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Forecast */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <BarChart2 className="text-white" size={20} />
            </div>
            <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold text-amber-900')}>Gelecek Ay Tahmini</h3>
          </div>
          {advancedStats && (
            <div className="space-y-3">
              <div className="bg-white/60 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-700">Tahmini Gelir</span>
                  <span className="text-neutral-900 text-xs">↑</span>
                </div>
                <span className={cx(DESIGN_TOKENS?.typography?.stat.md, 'text-amber-900')}>{formatCurrency(advancedStats.forecastIncome)}</span>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-700">Tahmini Gider</span>
                  <span className="text-neutral-800 text-xs">↓</span>
                </div>
                <span className={cx(DESIGN_TOKENS?.typography?.stat.md, 'text-amber-900')}>{formatCurrency(advancedStats.forecastExpense)}</span>
              </div>
              <div className={cx(card('md', 'xs', 'default', 'md'))}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-700">Tahmini Kâr</span>
                  <span className={`text-xs ${advancedStats.forecastProfit >= 0 ? 'text-neutral-900' : 'text-neutral-800'}`}>
                    {advancedStats.forecastProfit >= 0 ? '↑' : '↓'}
                  </span>
                </div>
                <span className={`text-xl font-bold ${
                  advancedStats.forecastProfit >= 0 ? 'text-neutral-900' : 'text-neutral-800'
                }`}>
                  {formatCurrency(Math.abs(advancedStats.forecastProfit))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Target Tracking */}
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold text-neutral-900')}>Hedef Takibi</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-neutral-700 mb-2 block">Aylık Gelir Hedefi</label>
              <input
                type="number"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                placeholder="Hedef tutarı girin"
                className="w-full px-4 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-white"
              />
            </div>
            {monthlyTarget > 0 && advancedStats && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-700">Gerçekleşme</span>
                  <span className={`text-xl font-bold ${
                    advancedStats.targetAchievement >= 100 ? 'text-neutral-900' : 'text-neutral-700'
                  }`}>
                    {advancedStats.targetAchievement.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-white rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      advancedStats.targetAchievement >= 100 ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(advancedStats.targetAchievement, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-900">Hedef: {formatCurrency(monthlyTarget)}</span>
                  <span className="text-neutral-900">Kalan: {formatCurrency(Math.max(0, monthlyTarget - stats.currentMonth.income))}</span>
                </div>
                {advancedStats.targetAchievement >= 100 && (
                  <div className="bg-green-100 text-green-800 text-xs px-3 py-2 rounded-lg text-center font-medium">
                    🎉 Hedef aşıldı!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Statistics Toggle */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
            <Activity className="text-neutral-600" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Detaylı İstatistikler</h3>
            <p className="text-xs text-neutral-600">Ortalama, maksimum ve minimum değerleri göster</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvancedStats(!showAdvancedStats)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          {showAdvancedStats ? 'Gizle' : 'Göster'}
        </button>
      </div>

      {/* Detailed Statistics Section */}
      {showAdvancedStats && advancedStats && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold text-slate-900 mb-6')}>Detaylı İstatistikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Income Stats */}
            <div className={cx(card('md', 'md', 'default', 'md'))}>
              <h4 className="text-sm font-semibold text-neutral-800 mb-4">Gelir İstatistikleri</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Ortalama</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(advancedStats.avgIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">En Yüksek</span>
                  <span className="text-sm font-bold text-neutral-900">{formatCurrency(advancedStats.maxIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">En Düşük</span>
                  <span className="text-sm font-bold text-slate-600">{formatCurrency(advancedStats.minIncome)}</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Değişkenlik</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(advancedStats.maxIncome - advancedStats.minIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Stats */}
            <div className={cx(card('md', 'md', 'default', 'md'))}>
              <h4 className="text-sm font-semibold text-neutral-800 mb-4">Gider İstatistikleri</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Ortalama</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(advancedStats.avgExpense)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">En Yüksek</span>
                  <span className="text-sm font-bold text-neutral-800">{formatCurrency(advancedStats.maxExpense)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">En Düşük</span>
                  <span className="text-sm font-bold text-slate-600">{formatCurrency(advancedStats.minExpense)}</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Değişkenlik</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(advancedStats.maxExpense - advancedStats.minExpense)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profit Stats */}
            <div className={cx(card('md', 'md', 'default', 'md'))}>
              <h4 className="text-sm font-semibold text-neutral-800 mb-4">Kâr/Zarar İstatistikleri</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Ortalama Kâr</span>
                  <span className={`text-sm font-bold ${
                    advancedStats.avgProfit >= 0 ? 'text-neutral-900' : 'text-neutral-800'
                  }`}>
                    {formatCurrency(Math.abs(advancedStats.avgProfit))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Kârlılık</span>
                  <span className={`text-sm font-bold ${
                    advancedStats.profitabilityRatio >= 0 ? 'text-neutral-900' : 'text-neutral-800'
                  }`}>
                    {advancedStats.profitabilityRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Büyüme Hızı</span>
                  <span className={`text-sm font-bold ${
                    advancedStats.growthRate >= 0 ? 'text-neutral-900' : 'text-neutral-800'
                  }`}>
                    {formatPercentage(advancedStats.growthRate)}
                  </span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Performans</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    advancedStats.profitabilityRatio >= 20 
                      ? 'bg-green-100 text-neutral-800'
                      : advancedStats.profitabilityRatio >= 10
                      ? 'bg-amber-100 text-neutral-700'
                      : 'bg-red-100 text-neutral-800'
                  }`}>
                    {advancedStats.profitabilityRatio >= 20 ? 'Mükemmel' : advancedStats.profitabilityRatio >= 10 ? 'İyi' : 'Geliştirilmeli'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Section */}
      {showComparison && (
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 border border-neutral-200">
          <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold text-neutral-900 mb-4')}>Dönem Karşılaştırması</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cx(card('md', 'sm', 'default', 'md'))}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">Gelir Artışı</span>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stats.trends.incomeChange >= 0 ? 'text-neutral-900' : 'text-neutral-800'
                }`}>
                  {stats.trends.incomeChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {formatPercentage(stats.trends.incomeChange)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Bu ay:</span>
                  <span className="font-medium">{formatCurrency(stats.currentMonth.income)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Geçen ay:</span>
                  <span className="font-medium">{formatCurrency(stats.previousMonth.income)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Fark:</span>
                  <span className="font-medium">{formatCurrency(stats.currentMonth.income - stats.previousMonth.income)}</span>
                </div>
              </div>
            </div>

            <div className={cx(card('md', 'sm', 'default', 'md'))}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">Gider Değişimi</span>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stats.trends.expenseChange >= 0 ? 'text-neutral-800' : 'text-neutral-900'
                }`}>
                  {stats.trends.expenseChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {formatPercentage(stats.trends.expenseChange)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Bu ay:</span>
                  <span className="font-medium">{formatCurrency(stats.currentMonth.expense)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Geçen ay:</span>
                  <span className="font-medium">{formatCurrency(stats.previousMonth.expense)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Fark:</span>
                  <span className="font-medium">{formatCurrency(stats.currentMonth.expense - stats.previousMonth.expense)}</span>
                </div>
              </div>
            </div>

            <div className={cx(card('md', 'sm', 'default', 'md'))}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">Kar/Zarar Değişimi</span>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stats.trends.profitChange >= 0 ? 'text-neutral-900' : 'text-neutral-800'
                }`}>
                  {stats.trends.profitChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {formatPercentage(stats.trends.profitChange)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Bu ay:</span>
                  <span className="font-medium">{formatCurrency(stats.currentMonth.profit)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Geçen ay:</span>
                  <span className="font-medium">{formatCurrency(stats.previousMonth.profit)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Fark:</span>
                  <span className="font-medium">{formatCurrency(stats.currentMonth.profit - stats.previousMonth.profit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className={card('md', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>Aylık Trend</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'line' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-100'
                }`}
                title="Çizgi Grafik"
              >
                <LineChartIcon size={16} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'bar' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-100'
                }`}
                title="Çubuk Grafik"
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded-lg transition-colors ${
                  chartType === 'area' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-100'
                }`}
                title="Alan Grafik"
              >
                <AreaChartIcon size={16} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {chartType === 'line' ? (
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#171717"
                  strokeWidth={2}
                  name="Gelir"
                  dot={{ fill: '#171717', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#737373"
                  strokeWidth={2}
                  name="Gider"
                  dot={{ fill: '#737373', r: 4 }}
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#171717" name="Gelir" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#737373" name="Gider" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#171717"
                  fill="#171717"
                  fillOpacity={0.3}
                  name="Gelir"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#737373"
                  fill="#737373"
                  fillOpacity={0.3}
                  name="Gider"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className={card('md', 'sm', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>Gelir vs Gider</h3>
            <BarChart3 className="text-neutral-400" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#171717" name="Gelir" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#737373" name="Gider" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income Category Breakdown */}
        {stats.categoryBreakdown.income.length > 0 && (
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>Gelir Kategorileri</h3>
              <PieChartIcon className="text-neutral-400" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown.income}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: any) => `${entry.category}: ${formatCurrency(entry.amount)}`}
                  labelLine={false}
                >
                  {stats.categoryBreakdown.income.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expense Category Breakdown */}
        {stats.categoryBreakdown.expense.length > 0 && (
          <div className={card('md', 'sm', 'default', 'lg')}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>Gider Kategorileri</h3>
              <PieChartIcon className="text-neutral-400" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown.expense}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: any) => `${entry.category}: ${formatCurrency(entry.amount)}`}
                  labelLine={false}
                >
                  {stats.categoryBreakdown.expense.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={card('md', 'lg', 'default', 'lg')}>
        <h3 className={cx(DESIGN_TOKENS?.typography?.body.lg, 'font-semibold text-neutral-900 mb-4')}>Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.hash = '#income'}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Plus className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 text-sm">Gelir Ekle</h4>
              <p className="text-xs text-neutral-800">Yeni gelir kaydı</p>
            </div>
          </button>

          <button
            onClick={() => window.location.hash = '#expense'}
            className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Plus className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-red-900 text-sm">Gider Ekle</h4>
              <p className="text-xs text-neutral-800">Yeni gider kaydı</p>
            </div>
          </button>

          <button
            onClick={() => window.location.hash = '#invoice'}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">Fatura Kes</h4>
              <p className="text-xs text-neutral-800">Yeni fatura oluştur</p>
            </div>
          </button>

          <button
            onClick={() => window.location.hash = '#reports'}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-purple-900 text-sm">Raporlar</h4>
              <p className="text-xs text-purple-700">Detaylı raporlar</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
