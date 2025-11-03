import { useState, useCallback, useEffect } from 'react'
import { accountingAPI } from '../services/api'
import { toast } from 'react-hot-toast'

export interface AccountingStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalCollections: number
  totalOverdue: number
  invoiceCount: number
  period: {
    start: string
    end: string
  }
}

export interface UseAccountingStatsReturn {
  stats: AccountingStats | null
  loading: boolean
  error: Error | null
  fetchStats: (period?: { start: string; end: string }) => Promise<void>
  refreshStats: () => Promise<void>
}

export function useAccountingStats(): UseAccountingStatsReturn {
  const [stats, setStats] = useState<AccountingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState<{ start: string; end: string }>(() => {
    // Default to current month
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  })

  const fetchStats = useCallback(async (period?: { start: string; end: string }) => {
    setLoading(true)
    setError(null)
    
    const periodToUse = period || currentPeriod
    
    try {
      const response = await accountingAPI.getStats({
        startDate: periodToUse.start,
        endDate: periodToUse.end,
      })
      
      setStats(response.data)
      if (period) {
        setCurrentPeriod(period)
      }
    } catch (err: any) {
      console.error('Error fetching accounting stats:', err)
      const errorMessage = err.response?.data?.message || 'İstatistikler yüklenemedi'
      setError(new Error(errorMessage))
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [currentPeriod])

  const refreshStats = useCallback(async () => {
    await fetchStats(currentPeriod)
    toast.success('İstatistikler güncellendi')
  }, [fetchStats, currentPeriod])

  // Fetch on mount
  useEffect(() => {
    fetchStats()
  }, []) // Only on mount, not on fetchStats change

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
  }
}
