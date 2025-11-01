import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight,
  PieChart as PieChartIcon, BarChart3, FileText, Plus
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { toast } from 'react-hot-toast'

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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AccountingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const { accountingAPI } = await import('../../services/api')
      
      // Get incomes and expenses for current and previous month
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Fetch current month data
      const [currentIncomes, currentExpenses] = await Promise.all([
        accountingAPI.getIncomes({
          startDate: currentMonthStart.toISOString().split('T')[0],
          endDate: currentMonthEnd.toISOString().split('T')[0],
          limit: 1000
        }),
        accountingAPI.getExpenses({
          startDate: currentMonthStart.toISOString().split('T')[0],
          endDate: currentMonthEnd.toISOString().split('T')[0],
          limit: 1000
        })
      ])

      // Fetch previous month data
      const [previousIncomes, previousExpenses] = await Promise.all([
        accountingAPI.getIncomes({
          startDate: previousMonthStart.toISOString().split('T')[0],
          endDate: previousMonthEnd.toISOString().split('T')[0],
          limit: 1000
        }),
        accountingAPI.getExpenses({
          startDate: previousMonthStart.toISOString().split('T')[0],
          endDate: previousMonthEnd.toISOString().split('T')[0],
          limit: 1000
        })
      ])

      // Calculate totals
      const currentIncomeTotal = currentIncomes.data.data.reduce((sum: number, item: any) => sum + item.amount, 0)
      const currentExpenseTotal = currentExpenses.data.data.reduce((sum: number, item: any) => sum + item.amount, 0)
      const previousIncomeTotal = previousIncomes.data.data.reduce((sum: number, item: any) => sum + item.amount, 0)
      const previousExpenseTotal = previousExpenses.data.data.reduce((sum: number, item: any) => sum + item.amount, 0)

      // Calculate trends
      const incomeChange = previousIncomeTotal > 0 
        ? ((currentIncomeTotal - previousIncomeTotal) / previousIncomeTotal) * 100 
        : 0
      const expenseChange = previousExpenseTotal > 0 
        ? ((currentExpenseTotal - previousExpenseTotal) / previousExpenseTotal) * 100 
        : 0
      const currentProfit = currentIncomeTotal - currentExpenseTotal
      const previousProfit = previousIncomeTotal - previousExpenseTotal
      const profitChange = previousProfit !== 0 
        ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 
        : 0

      // Get last 6 months data
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
        
        const [monthIncomes, monthExpenses] = await Promise.all([
          accountingAPI.getIncomes({
            startDate: monthStart.toISOString().split('T')[0],
            endDate: monthEnd.toISOString().split('T')[0],
            limit: 1000
          }),
          accountingAPI.getExpenses({
            startDate: monthStart.toISOString().split('T')[0],
            endDate: monthEnd.toISOString().split('T')[0],
            limit: 1000
          })
        ])

        monthlyData.push({
          month: monthDate.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
          income: monthIncomes.data.data.reduce((sum: number, item: any) => sum + item.amount, 0),
          expense: monthExpenses.data.data.reduce((sum: number, item: any) => sum + item.amount, 0)
        })
      }

      // Category breakdown
      const incomeCategoryMap = new Map<string, number>()
      currentIncomes.data.data.forEach((item: any) => {
        const current = incomeCategoryMap.get(item.category) || 0
        incomeCategoryMap.set(item.category, current + item.amount)
      })

      const expenseCategoryMap = new Map<string, number>()
      currentExpenses.data.data.forEach((item: any) => {
        const current = expenseCategoryMap.get(item.category) || 0
        expenseCategoryMap.set(item.category, current + item.amount)
      })

      setStats({
        currentMonth: {
          income: currentIncomeTotal,
          expense: currentExpenseTotal,
          profit: currentProfit
        },
        previousMonth: {
          income: previousIncomeTotal,
          expense: previousExpenseTotal,
          profit: previousProfit
        },
        trends: {
          incomeChange,
          expenseChange,
          profitChange
        },
        monthlyData,
        categoryBreakdown: {
          income: Array.from(incomeCategoryMap.entries()).map(([category, amount]) => ({
            category,
            amount
          })),
          expense: Array.from(expenseCategoryMap.entries()).map(([category, amount]) => ({
            category,
            amount
          }))
        }
      })
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Dashboard verileri yüklenemedi')
    } finally {
      setLoading(false)
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
        <h2 className="text-2xl font-bold text-neutral-900">Muhasebe Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Bu Ay
          </button>
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedPeriod === 'quarter'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Çeyrek
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedPeriod === 'year'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Yıllık
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              stats.trends.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.trends.incomeChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {formatPercentage(stats.trends.incomeChange)}
            </div>
          </div>
          <h3 className="text-3xl font-bold text-green-900 mb-1">
            {formatCurrency(stats.currentMonth.income)}
          </h3>
          <p className="text-sm text-green-700">Bu Ay Gelir</p>
          <p className="text-xs text-green-600 mt-2">
            Geçen ay: {formatCurrency(stats.previousMonth.income)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-white" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              stats.trends.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {stats.trends.expenseChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {formatPercentage(stats.trends.expenseChange)}
            </div>
          </div>
          <h3 className="text-3xl font-bold text-red-900 mb-1">
            {formatCurrency(stats.currentMonth.expense)}
          </h3>
          <p className="text-sm text-red-700">Bu Ay Gider</p>
          <p className="text-xs text-red-600 mt-2">
            Geçen ay: {formatCurrency(stats.previousMonth.expense)}
          </p>
        </div>

        {/* Profit Card */}
        <div className={`bg-gradient-to-br rounded-2xl p-6 border ${
          stats.currentMonth.profit >= 0
            ? 'from-blue-50 to-blue-100 border-blue-200'
            : 'from-orange-50 to-orange-100 border-orange-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stats.currentMonth.profit >= 0 ? 'bg-blue-500' : 'bg-orange-500'
            }`}>
              <DollarSign className="text-white" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              stats.trends.profitChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.trends.profitChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {formatPercentage(stats.trends.profitChange)}
            </div>
          </div>
          <h3 className={`text-3xl font-bold mb-1 ${
            stats.currentMonth.profit >= 0 ? 'text-blue-900' : 'text-orange-900'
          }`}>
            {formatCurrency(Math.abs(stats.currentMonth.profit))}
          </h3>
          <p className={`text-sm ${
            stats.currentMonth.profit >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>
            {stats.currentMonth.profit >= 0 ? 'Net Kâr' : 'Net Zarar'}
          </p>
          <p className={`text-xs mt-2 ${
            stats.currentMonth.profit >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            Geçen ay: {formatCurrency(Math.abs(stats.previousMonth.profit))}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Aylık Trend</h3>
            <BarChart3 className="text-neutral-400" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
                stroke="#10b981"
                strokeWidth={2}
                name="Gelir"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                name="Gider"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Gelir vs Gider</h3>
            <BarChart3 className="text-neutral-400" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
              <Bar dataKey="income" fill="#10b981" name="Gelir" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Gider" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income Category Breakdown */}
        {stats.categoryBreakdown.income.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Gelir Kategorileri</h3>
              <PieChartIcon className="text-neutral-400" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown.income}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${formatCurrency(entry.amount)}`}
                  labelLine={false}
                >
                  {stats.categoryBreakdown.income.map((entry, index) => (
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
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Gider Kategorileri</h3>
              <PieChartIcon className="text-neutral-400" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown.expense}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${formatCurrency(entry.amount)}`}
                  labelLine={false}
                >
                  {stats.categoryBreakdown.expense.map((entry, index) => (
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
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Hızlı İşlemler</h3>
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
              <p className="text-xs text-green-700">Yeni gelir kaydı</p>
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
              <p className="text-xs text-red-700">Yeni gider kaydı</p>
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
              <p className="text-xs text-blue-700">Yeni fatura oluştur</p>
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
