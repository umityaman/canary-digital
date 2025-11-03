import { useState, useCallback } from 'react'

export interface FilterState {
  search: string
  statusFilter: string
  dateRange: 'all' | '7days' | '30days' | 'custom'
  customDateFrom: string
  customDateTo: string
  minAmount: string
  maxAmount: string
  showAdvanced: boolean
}

export interface UseFiltersReturn {
  filters: FilterState
  setSearch: (value: string) => void
  setStatusFilter: (value: string) => void
  setDateRange: (value: 'all' | '7days' | '30days' | 'custom') => void
  setCustomDateFrom: (value: string) => void
  setCustomDateTo: (value: string) => void
  setMinAmount: (value: string) => void
  setMaxAmount: (value: string) => void
  toggleAdvanced: () => void
  resetFilters: () => void
  applyDateRangeFilter: <T extends { date?: string; invoiceDate?: string; createdAt?: string }>(
    items: T[]
  ) => T[]
  applyAmountFilter: <T extends { amount?: number; totalAmount?: number; grandTotal?: number }>(
    items: T[]
  ) => T[]
  applySearchFilter: <T extends Record<string, any>>(
    items: T[],
    searchFields: (keyof T)[]
  ) => T[]
  applyStatusFilter: <T extends { status: string }>(items: T[]) => T[]
  applyAllFilters: <T extends Record<string, any>>(
    items: T[],
    searchFields: (keyof T)[]
  ) => T[]
}

const initialFilters: FilterState = {
  search: '',
  statusFilter: '',
  dateRange: 'all',
  customDateFrom: '',
  customDateTo: '',
  minAmount: '',
  maxAmount: '',
  showAdvanced: false,
}

export function useFilters(initialState?: Partial<FilterState>): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    ...initialFilters,
    ...initialState,
  })

  // Individual setters
  const setSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, [])

  const setStatusFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, statusFilter: value }))
  }, [])

  const setDateRange = useCallback((value: 'all' | '7days' | '30days' | 'custom') => {
    setFilters(prev => ({ ...prev, dateRange: value }))
  }, [])

  const setCustomDateFrom = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, customDateFrom: value }))
  }, [])

  const setCustomDateTo = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, customDateTo: value }))
  }, [])

  const setMinAmount = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, minAmount: value }))
  }, [])

  const setMaxAmount = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, maxAmount: value }))
  }, [])

  const toggleAdvanced = useCallback(() => {
    setFilters(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...initialFilters, ...initialState })
  }, [initialState])

  // Filter application functions
  const applyDateRangeFilter = useCallback(<T extends { date?: string; invoiceDate?: string; createdAt?: string }>(
    items: T[]
  ): T[] => {
    if (filters.dateRange === 'all') return items

    const now = new Date()
    let fromDate: Date | null = null

    if (filters.dateRange === '7days') {
      fromDate = new Date()
      fromDate.setDate(now.getDate() - 7)
    } else if (filters.dateRange === '30days') {
      fromDate = new Date()
      fromDate.setDate(now.getDate() - 30)
    } else if (filters.dateRange === 'custom' && filters.customDateFrom) {
      fromDate = new Date(filters.customDateFrom)
    }

    const toDate = filters.dateRange === 'custom' && filters.customDateTo 
      ? new Date(filters.customDateTo)
      : null

    return items.filter(item => {
      const itemDate = new Date(item.date || item.invoiceDate || item.createdAt || '')
      
      if (fromDate && itemDate < fromDate) return false
      if (toDate && itemDate > toDate) return false
      
      return true
    })
  }, [filters.dateRange, filters.customDateFrom, filters.customDateTo])

  const applyAmountFilter = useCallback(<T extends { amount?: number; totalAmount?: number; grandTotal?: number }>(
    items: T[]
  ): T[] => {
    const min = filters.minAmount ? parseFloat(filters.minAmount) : null
    const max = filters.maxAmount ? parseFloat(filters.maxAmount) : null

    if (min === null && max === null) return items

    return items.filter(item => {
      const amount = item.amount || item.totalAmount || item.grandTotal || 0
      
      if (min !== null && amount < min) return false
      if (max !== null && amount > max) return false
      
      return true
    })
  }, [filters.minAmount, filters.maxAmount])

  const applySearchFilter = useCallback(<T extends Record<string, any>>(
    items: T[],
    searchFields: (keyof T)[]
  ): T[] => {
    if (!filters.search) return items

    const searchLower = filters.search.toLowerCase()

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        
        if (value === null || value === undefined) return false
        
        // Handle nested objects (e.g., customer.name)
        if (typeof field === 'string' && field.includes('.')) {
          const keys = field.split('.')
          let nestedValue: any = item
          
          for (const key of keys) {
            nestedValue = nestedValue?.[key]
            if (nestedValue === null || nestedValue === undefined) return false
          }
          
          return String(nestedValue).toLowerCase().includes(searchLower)
        }
        
        return String(value).toLowerCase().includes(searchLower)
      })
    })
  }, [filters.search])

  const applyStatusFilter = useCallback(<T extends { status: string }>(
    items: T[]
  ): T[] => {
    if (!filters.statusFilter) return items
    return items.filter(item => item.status === filters.statusFilter)
  }, [filters.statusFilter])

  const applyAllFilters = useCallback(<T extends Record<string, any>>(
    items: T[],
    searchFields: (keyof T)[]
  ): T[] => {
    let filtered = items

    // Apply search filter
    if (filters.search) {
      filtered = applySearchFilter(filtered, searchFields)
    }

    // Apply status filter
    if (filters.statusFilter && 'status' in (filtered[0] || {})) {
      filtered = applyStatusFilter(filtered as any)
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      filtered = applyDateRangeFilter(filtered as any)
    }

    // Apply amount filter
    if (filters.minAmount || filters.maxAmount) {
      filtered = applyAmountFilter(filtered as any)
    }

    return filtered
  }, [filters, applySearchFilter, applyStatusFilter, applyDateRangeFilter, applyAmountFilter])

  return {
    filters,
    setSearch,
    setStatusFilter,
    setDateRange,
    setCustomDateFrom,
    setCustomDateTo,
    setMinAmount,
    setMaxAmount,
    toggleAdvanced,
    resetFilters,
    applyDateRangeFilter,
    applyAmountFilter,
    applySearchFilter,
    applyStatusFilter,
    applyAllFilters,
  }
}
