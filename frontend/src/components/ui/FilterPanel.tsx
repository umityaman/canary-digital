import React, { useState } from 'react'
import { Filter, X, Calendar, DollarSign } from 'lucide-react'

export interface FilterPanelProps {
  // Date range filter
  dateRange?: 'all' | '7days' | '30days' | 'custom'
  onDateRangeChange?: (value: 'all' | '7days' | '30days' | 'custom') => void
  customDateFrom?: string
  customDateTo?: string
  onCustomDateChange?: (from: string, to: string) => void
  
  // Amount filter
  minAmount?: string
  maxAmount?: string
  onAmountChange?: (min: string, max: string) => void
  
  // Status filter
  statusFilter?: string
  statusOptions?: Array<{ value: string; label: string }>
  onStatusChange?: (status: string) => void
  
  // Advanced filters toggle
  showAdvanced?: boolean
  onToggleAdvanced?: () => void
  
  // Reset
  onReset?: () => void
  
  // Additional filters
  children?: React.ReactNode
  
  className?: string
}

const FilterPanel = React.memo<FilterPanelProps>(({
  dateRange = 'all',
  onDateRangeChange,
  customDateFrom = '',
  customDateTo = '',
  onCustomDateChange,
  minAmount = '',
  maxAmount = '',
  onAmountChange,
  statusFilter = '',
  statusOptions = [],
  onStatusChange,
  showAdvanced = false,
  onToggleAdvanced,
  onReset,
  children,
  className = ''
}) => {
  const [localMinAmount, setLocalMinAmount] = useState(minAmount)
  const [localMaxAmount, setLocalMaxAmount] = useState(maxAmount)
  const [localDateFrom, setLocalDateFrom] = useState(customDateFrom)
  const [localDateTo, setLocalDateTo] = useState(customDateTo)

  const handleApplyAmountFilter = () => {
    onAmountChange?.(localMinAmount, localMaxAmount)
  }

  const handleApplyDateFilter = () => {
    onCustomDateChange?.(localDateFrom, localDateTo)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-6 ${className}`}>
      {/* Basic Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Date Range Filter */}
        {onDateRangeChange && (
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="7days">Son 7 Gün</option>
              <option value="30days">Son 30 Gün</option>
              <option value="custom">Özel Tarih</option>
            </select>
          </div>
        )}

        {/* Status Filter */}
        {statusOptions.length > 0 && onStatusChange && (
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            >
              <option value="">Tüm Durumlar</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Advanced Toggle */}
        {onToggleAdvanced && (
          <button
            onClick={onToggleAdvanced}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Filter size={18} />
            <span className="font-medium">
              {showAdvanced ? 'Gelişmiş Filtreleri Gizle' : 'Gelişmiş Filtreler'}
            </span>
          </button>
        )}

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors ml-auto"
          >
            <X size={18} />
            <span className="font-medium">Sıfırla</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
          {/* Custom Date Range */}
          {dateRange === 'custom' && onCustomDateChange && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-neutral-700 min-w-[100px]">
                Tarih Aralığı:
              </label>
              <input
                type="date"
                value={localDateFrom}
                onChange={(e) => setLocalDateFrom(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={localDateTo}
                onChange={(e) => setLocalDateTo(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              />
              <button
                onClick={handleApplyDateFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Uygula
              </button>
            </div>
          )}

          {/* Amount Range */}
          {onAmountChange && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-neutral-700 min-w-[100px]">
                <DollarSign size={16} className="inline mr-1" />
                Tutar Aralığı:
              </label>
              <input
                type="number"
                placeholder="Min"
                value={localMinAmount}
                onChange={(e) => setLocalMinAmount(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent w-32"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localMaxAmount}
                onChange={(e) => setLocalMaxAmount(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent w-32"
              />
              <button
                onClick={handleApplyAmountFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Uygula
              </button>
            </div>
          )}

          {/* Additional Custom Filters */}
          {children}
        </div>
      )}
    </div>
  )
})

FilterPanel.displayName = 'FilterPanel'

export default FilterPanel
