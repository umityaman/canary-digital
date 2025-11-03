import { useState, useCallback, useEffect } from 'react'
import { useDebounce } from './useDebounce'
import { offerAPI } from '../services/api'
import { toast } from 'react-hot-toast'

export interface Offer {
  id: number
  offerNumber: string
  offerDate: string
  validUntil: string
  totalAmount: number
  vatAmount: number
  grandTotal: number
  status: string
  notes?: string
  customer: {
    id: number
    name: string
    email: string
    phone: string
  }
  offerItems: Array<{
    id: number
    description: string
    quantity: number
    unitPrice: number
    vatRate: number
    totalPrice: number
  }>
}

export interface OfferFilters {
  search: string
  statusFilter: string
  dateRange: 'all' | '7days' | '30days' | 'custom'
  customDateFrom: string
  customDateTo: string
  minAmount: string
  maxAmount: string
  showAdvanced: boolean
}

export interface UseOffersReturn {
  // Data
  offers: Offer[]
  loading: boolean
  currentPage: number
  totalPages: number
  selectedOffers: number[]
  
  // Filters
  filters: OfferFilters
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
  toggleOfferSelection: (id: number) => void
  toggleAllOffers: () => void
  clearSelection: () => void
  
  // CRUD Operations
  fetchOffers: () => Promise<void>
  createOffer: (data: any) => Promise<void>
  updateOffer: (id: number, data: any) => Promise<void>
  deleteOffer: (id: number) => Promise<void>
  convertToInvoice: (id: number) => Promise<void>
  
  // Bulk Operations
  bulkDelete: (ids: number[]) => Promise<void>
  bulkUpdateStatus: (ids: number[], status: string) => Promise<void>
  bulkSendEmail: (ids: number[]) => Promise<void>
  
  // Export
  exportToExcel: () => Promise<void>
  exportToPDF: () => Promise<void>
}

const initialFilters: OfferFilters = {
  search: '',
  statusFilter: '',
  dateRange: 'all',
  customDateFrom: '',
  customDateTo: '',
  minAmount: '',
  maxAmount: '',
  showAdvanced: false,
}

export function useOffers(): UseOffersReturn {
  // State
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOffers, setSelectedOffers] = useState<number[]>([])
  
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

  // Fetch offers
  const fetchOffers = useCallback(async () => {
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

      const response = await offerAPI.getAll(params)
      setOffers(response.data.data || [])
      setTotalPages(response.data.totalPages || 1)
    } catch (error: any) {
      console.error('Error fetching offers:', error)
      toast.error(error.response?.data?.message || 'Teklifler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch, statusFilter, dateRange, customDateFrom, customDateTo, minAmount, maxAmount])

  // Create offer
  const createOffer = useCallback(async (data: any) => {
    try {
      await offerAPI.create(data)
      toast.success('Teklif oluşturuldu')
      await fetchOffers()
    } catch (error: any) {
      console.error('Error creating offer:', error)
      toast.error(error.response?.data?.message || 'Teklif oluşturulamadı')
      throw error
    }
  }, [fetchOffers])

  // Update offer
  const updateOffer = useCallback(async (id: number, data: any) => {
    try {
      await offerAPI.update(id, data)
      toast.success('Teklif güncellendi')
      await fetchOffers()
    } catch (error: any) {
      console.error('Error updating offer:', error)
      toast.error(error.response?.data?.message || 'Teklif güncellenemedi')
      throw error
    }
  }, [fetchOffers])

  // Delete offer
  const deleteOffer = useCallback(async (id: number) => {
    try {
      await offerAPI.delete(id)
      toast.success('Teklif silindi')
      await fetchOffers()
    } catch (error: any) {
      console.error('Error deleting offer:', error)
      toast.error(error.response?.data?.message || 'Teklif silinemedi')
      throw error
    }
  }, [fetchOffers])

  // Convert to invoice
  const convertToInvoice = useCallback(async (id: number) => {
    try {
      await offerAPI.convertToInvoice(id)
      toast.success('Teklif faturaya dönüştürüldü')
      await fetchOffers()
    } catch (error: any) {
      console.error('Error converting offer:', error)
      toast.error(error.response?.data?.message || 'Teklif dönüştürülemedi')
      throw error
    }
  }, [fetchOffers])

  // Bulk operations
  const bulkDelete = useCallback(async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => offerAPI.delete(id)))
      toast.success(`${ids.length} teklif silindi`)
      setSelectedOffers([])
      await fetchOffers()
    } catch (error: any) {
      console.error('Error bulk deleting:', error)
      toast.error('Teklifler silinemedi')
      throw error
    }
  }, [fetchOffers])

  const bulkUpdateStatus = useCallback(async (ids: number[], status: string) => {
    try {
      await Promise.all(ids.map(id => offerAPI.update(id, { status })))
      toast.success(`${ids.length} teklif durumu güncellendi`)
      setSelectedOffers([])
      await fetchOffers()
    } catch (error: any) {
      console.error('Error bulk updating status:', error)
      toast.error('Durum güncellenemedi')
      throw error
    }
  }, [fetchOffers])

  const bulkSendEmail = useCallback(async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => offerAPI.sendEmail(id)))
      toast.success(`${ids.length} teklif e-posta ile gönderildi`)
      setSelectedOffers([])
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
      const response = await offerAPI.exportExcel({
        search: debouncedSearch,
        status: statusFilter,
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `teklifler-${new Date().toISOString().split('T')[0]}.xlsx`)
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
      const response = await offerAPI.exportPDF({
        search: debouncedSearch,
        status: statusFilter,
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `teklifler-${new Date().toISOString().split('T')[0]}.pdf`)
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
  const toggleOfferSelection = useCallback((id: number) => {
    setSelectedOffers(prev => 
      prev.includes(id) 
        ? prev.filter(offerId => offerId !== id)
        : [...prev, id]
    )
  }, [])

  const toggleAllOffers = useCallback(() => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([])
    } else {
      setSelectedOffers(offers.map(offer => offer.id))
    }
  }, [offers, selectedOffers.length])

  const clearSelection = useCallback(() => {
    setSelectedOffers([])
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
    fetchOffers()
  }, [fetchOffers])

  return {
    // Data
    offers,
    loading,
    currentPage,
    totalPages,
    selectedOffers,
    
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
    toggleOfferSelection,
    toggleAllOffers,
    clearSelection,
    
    // CRUD
    fetchOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    convertToInvoice,
    
    // Bulk operations
    bulkDelete,
    bulkUpdateStatus,
    bulkSendEmail,
    
    // Export
    exportToExcel,
    exportToPDF,
  }
}
