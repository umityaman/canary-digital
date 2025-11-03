import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection (previously cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on component mount if data is fresh
      retry: 1, // Retry failed requests once
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 0, // Don't retry mutations
      networkMode: 'online',
    },
  },
})
