import { create } from 'zustand'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'


type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: number) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    // Error messages stay longer (5s) for readability, others 3s
    const duration = type === 'error' ? 5000 : 3000
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }))
    }, duration)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast)
  return {
    showToast: (message: string, type: ToastType = 'info') => addToast(message, type),
  }
}

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-neutral-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slideIn ${getBackgroundColor(
            toast.type
          )}`}
        >
          {getIcon(toast.type)}
          <span className="text-sm font-medium text-neutral-900">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
