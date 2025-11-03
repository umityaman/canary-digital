import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
    
    // Log to external service if needed
    // logErrorToService(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const { fallbackTitle, fallbackMessage } = this.props
      const isDevelopment = process.env.NODE_ENV === 'development'

      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={40} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-neutral-900 text-center mb-4">
              {fallbackTitle || 'Bir Hata Oluştu'}
            </h1>

            {/* Message */}
            <p className="text-neutral-600 text-center mb-8">
              {fallbackMessage || 
                'Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenileyin veya ana sayfaya dönün.'}
            </p>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <div className="mb-8 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                  Hata Detayları (Sadece Geliştirme):
                </h3>
                <div className="text-xs text-red-600 font-mono bg-red-50 p-3 rounded-lg overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Hata:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <RefreshCw size={18} />
                Sayfayı Yenile
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-white text-neutral-900 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Home size={18} />
                Ana Sayfaya Dön
              </button>

              {isDevelopment && (
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  Tekrar Dene
                </button>
              )}
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-500">
                Sorun devam ederse, lütfen destek ekibiyle iletişime geçin.
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Hata ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
