import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceAPI } from '../../services/api'
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
}

interface InvoiceFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
}

// Query Keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: number) => [...invoiceKeys.details(), id] as const,
}

// Fetch invoices with filters
export function useInvoicesQuery(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: async () => {
      const response = await invoiceAPI.getAll(filters)
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => ({
      invoices: data.data || [],
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
      total: data.total || 0,
    }),
  })
}

// Fetch single invoice
export function useInvoiceQuery(id: number | null) {
  return useQuery({
    queryKey: invoiceKeys.detail(id!),
    queryFn: async () => {
      const response = await invoiceAPI.getById(id!)
      return response.data
    },
    enabled: id !== null, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create invoice mutation
export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await invoiceAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch all invoice lists
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success('Fatura oluşturuldu')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Fatura oluşturulamadı'
      toast.error(message)
    },
  })
}

// Update invoice mutation
export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await invoiceAPI.update(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate specific invoice and all lists
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success('Fatura güncellendi')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Fatura güncellenemedi'
      toast.error(message)
    },
  })
}

// Delete invoice mutation
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await invoiceAPI.delete(id)
      return id
    },
    onSuccess: (id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success('Fatura silindi')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Fatura silinemedi'
      toast.error(message)
    },
  })
}

// Send invoice email mutation
export function useSendInvoiceEmail() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await invoiceAPI.sendEmail(id)
      return response.data
    },
    onSuccess: () => {
      toast.success('Fatura e-posta ile gönderildi')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'E-posta gönderilemedi'
      toast.error(message)
    },
  })
}

// Bulk delete invoices mutation
export function useBulkDeleteInvoices() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => invoiceAPI.delete(id)))
      return ids
    },
    onSuccess: (ids) => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success(`${ids.length} fatura silindi`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Faturalar silinemedi'
      toast.error(message)
    },
  })
}

// Export invoices mutation
export function useExportInvoices() {
  return useMutation({
    mutationFn: async ({ format, filters }: { format: 'excel' | 'pdf'; filters: InvoiceFilters }) => {
      const response = format === 'excel' 
        ? await invoiceAPI.exportExcel(filters)
        : await invoiceAPI.exportPDF(filters)
      
      return { data: response.data, format }
    },
    onSuccess: ({ data, format }) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      const extension = format === 'excel' ? 'xlsx' : 'pdf'
      link.setAttribute('download', `faturalar-${new Date().toISOString().split('T')[0]}.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success(`${format.toUpperCase()} dosyası indirildi`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Dışa aktarma başarısız oldu'
      toast.error(message)
    },
  })
}
