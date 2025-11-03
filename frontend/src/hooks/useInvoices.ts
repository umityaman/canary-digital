import { useState, useCallback, useEffect } from 'react'
import { useDebounce } from './useDebounce'
import { invoiceAPI } from '../services/api'
import { toast } from 'react-hot-toast'

export interface Invoice {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  vatAmount: number
  grandTotal: number
  paidAmount: number
  status: string
  type: string
  customer: {
    id: number
    name: string
    email: string
    phone: string
    taxNumber?: string
  }
  order?: {
    id: number
    orderNumber?: string
    orderItems?: Array<{
      equipment: {
        name: string
      }
    }>
  }
  payments: Array<{
    id: number
    amount: number
    paymentDate: string
    paymentMethod: string
  }>
}

export interface InvoiceFilters {
  search: string
  statusFilter: string
  dateRange: 'all' | '7days' | '30days' | 'custom'
  customDateFrom: string
  customDateTo: string
  minAmount: string
  maxAmount: string
  showAdvanced: boolean
}

export interface UseInvoicesReturn {
  // Data
  invoices: Invoice[]
  loading: boolean
  currentPage: number
  totalPages: number
  selectedInvoices: number[]
  
  // Filters
  filters: InvoiceFilters
  setSearch: (value: string) => void
  setStatusFilter: (value: string) => void
  setDateRange: (value: 'all' | '7days' | '30days' | 'custom') => void
  setCustomDateFrom: (value: string) => void
  setCustomDateTo: (value: string) => void
  setMinAmount: (value: string) => void
  setMaxAmount: (value: string) => void
  toggleAdvancedFilters: () => void
  resetFilters: () => void
  
  // Pagination
  setCurrentPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  
  // Selection
  toggleInvoiceSelection: (id: number) => void
  toggleAllInvoices: () => void
  clearSelection: () => void
  
  // CRUD Operations
  fetchInvoices: () => Promise<void>
  createInvoice: (data: any) => Promise<void>
  updateInvoice: (id: number, data: any) => Promise<void>
  deleteInvoice: (id: number) => Promise<void>
  
  // Bulk Operations
  bulkDelete: (ids: number[]) => Promise<void>
  bulkUpdateStatus: (ids: number[], status: string) => Promise<void>
  bulkSendEmail: (ids: number[]) => Promise<void>
  
  // Export Operations
  exportToExcel: () => Promise<void>
  exportToPDF: () => Promise<void>
}

const initialFilters: InvoiceFilters = {
  search: '',
  statusFilter: '',
  dateRange: 'all',
  customDateFrom: '',
  customDateTo: '',
  minAmount: '',
  maxAmount: '',
  showAdvanced: false,
}

export function useInvoices(): UseInvoicesReturn {
  // State
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([])
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | 'custom'>('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const debouncedSearch = useDebounce(search, 500)

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      }

      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.status = statusFilter
      
      // Date range filters
      if (dateRange === '7days') {
        const date = new Date()
        date.setDate(date.getDate() - 7)
        params.dateFrom = date.toISOString().split('T')[0]
      } else if (dateRange === '30days') {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        params.dateFrom = date.toISOString().split('T')[0]
      } else if (dateRange === 'custom') {
        if (customDateFrom) params.dateFrom = customDateFrom
        if (customDateTo) params.dateTo = customDateTo
      }
      
      // Amount filters
      if (minAmount) params.minAmount = parseFloat(minAmount)
      if (maxAmount) params.maxAmount = parseFloat(maxAmount)

      const response = await invoiceAPI.getAll(params)
      setInvoices(response.data.data || [])
      setTotalPages(response.data.totalPages || 1)
    } catch (error: any) {
      console.error('Error fetching invoices:', error)
      toast.error(error.response?.data?.message || 'Faturalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch, statusFilter, dateRange, customDateFrom, customDateTo, minAmount, maxAmount])

  // Create invoice
  const createInvoice = useCallback(async (data: any) => {
    try {
      await invoiceAPI.create(data)
      toast.success('Fatura oluşturuldu')
      await fetchInvoices()
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      toast.error(error.response?.data?.message || 'Fatura oluşturulamadı')
      throw error
    }
  }, [fetchInvoices])

  // Update invoice
  const updateInvoice = useCallback(async (id: number, data: any) => {
    try {
      await invoiceAPI.update(id, data)
      toast.success('Fatura güncellendi')
      await fetchInvoices()
    } catch (error: any) {
      console.error('Error updating invoice:', error)
      toast.error(error.response?.data?.message || 'Fatura güncellenemedi')
      throw error
    }
  }, [fetchInvoices])

  // Delete invoice
  const deleteInvoice = useCallback(async (id: number) => {
    try {
      await invoiceAPI.delete(id)
      toast.success('Fatura silindi')
      await fetchInvoices()
    } catch (error: any) {
      console.error('Error deleting invoice:', error)
      toast.error(error.response?.data?.message || 'Fatura silinemedi')
      throw error
    }
  }, [fetchInvoices])

  // Bulk operations
  const bulkDelete = useCallback(async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => invoiceAPI.delete(id)))
      toast.success(`${ids.length} fatura silindi`)
      setSelectedInvoices([])
      await fetchInvoices()
    } catch (error: any) {
      console.error('Error bulk deleting:', error)
      toast.error('Faturalar silinemedi')
      throw error
    }
  }, [fetchInvoices])

  const bulkUpdateStatus = useCallback(async (ids: number[], status: string) => {
    try {
      await Promise.all(ids.map(id => invoiceAPI.update(id, { status })))
      toast.success(`${ids.length} fatura durumu güncellendi`)
      setSelectedInvoices([])
      await fetchInvoices()
    } catch (error: any) {
      console.error('Error bulk updating status:', error)
      toast.error('Durum güncellenemedi')
      throw error
    }
  }, [fetchInvoices])

  const bulkSendEmail = useCallback(async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => invoiceAPI.sendEmail(id)))
      toast.success(`${ids.length} fatura e-posta ile gönderildi`)
      setSelectedInvoices([])
    } catch (error: any) {
      console.error('Error bulk sending email:', error)
      toast.error('E-postalar gönderilemedi')
      throw error
    }
  }, [])

  // Export operations
  const exportToExcel = useCallback(async () => {
    try {
      toast.loading('Excel dosyası hazırlanıyor...')
      const response = await invoiceAPI.exportExcel({
        search: debouncedSearch,
        status: statusFilter,
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `faturalar-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.dismiss()
      toast.success('Excel dosyası indirildi')
    } catch (error: any) {
      toast.dismiss()
      console.error('Error exporting to Excel:', error)
      toast.error('Excel dosyası oluşturulamadı')
    }
  }, [debouncedSearch, statusFilter])

  const exportToPDF = useCallback(async () => {
    try {
      toast.loading('PDF dosyası hazırlanıyor...')
      const response = await invoiceAPI.exportPDF({
        search: debouncedSearch,
        status: statusFilter,
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `faturalar-${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.dismiss()
      toast.success('PDF dosyası indirildi')
    } catch (error: any) {
      toast.dismiss()
      console.error('Error exporting to PDF:', error)
      toast.error('PDF dosyası oluşturulamadı')
    }
  }, [debouncedSearch, statusFilter])

  // Selection operations
  const toggleInvoiceSelection = useCallback((id: number) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(invoiceId => invoiceId !== id)
        : [...prev, id]
    )
  }, [])

  const toggleAllInvoices = useCallback(() => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id))
    }
  }, [invoices, selectedInvoices.length])

  const clearSelection = useCallback(() => {
    setSelectedInvoices([])
  }, [])

  // Pagination
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  // Filter operations
  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvanced(prev => !prev)
  }, [])

  const resetFilters = useCallback(() => {
    setSearch('')
    setStatusFilter('')
    setDateRange('all')
    setCustomDateFrom('')
    setCustomDateTo('')
    setMinAmount('')
    setMaxAmount('')
    setShowAdvanced(false)
    setCurrentPage(1)
  }, [])

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return {
    // Data
    invoices,
    loading,
    currentPage,
    totalPages,
    selectedInvoices,
    
    // Filters
    filters: {
      search,
      statusFilter,
      dateRange,
      customDateFrom,
      customDateTo,
      minAmount,
      maxAmount,
      showAdvanced,
    },
    setSearch,
    setStatusFilter,
    setDateRange,
    setCustomDateFrom,
    setCustomDateTo,
    setMinAmount,
    setMaxAmount,
    toggleAdvancedFilters,
    resetFilters,
    
    // Pagination
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    
    // Selection
    toggleInvoiceSelection,
    toggleAllInvoices,
    clearSelection,
    
    // CRUD
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    
    // Bulk operations
    bulkDelete,
    bulkUpdateStatus,
    bulkSendEmail,
    
    // Export
    exportToExcel,
    exportToPDF,
  }
}
