import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: ''
  })
  const [error, setError] = useState('')

  const { login, register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isRegister) {
        await register(formData)
      } else {
        await login({ email: formData.email, password: formData.password })
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleQuickLogin = async () => {
    setError('')
    try {
      await login({ email: 'admin@canary.com', password: 'admin123' })
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="text-center mb-8">
            {/* Canary Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/canary-logo.png" 
                alt="Canary Rental Software" 
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
              {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
            </h2>
            <p className="mt-2 text-neutral-600">
              Kamera Kiralama Yönetim Sistemi
            </p>
          </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isRegister}
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-neutral-700 mb-1">
                    Şirket Adı
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required={isRegister}
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    placeholder="Şirket adınız"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'İşlem yapılıyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
            </button>
            
            {!isRegister && (
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-yellow-400 rounded-xl text-sm font-medium text-neutral-900 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                🚀 Demo Admin Girişi (Hızlı)
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors"
            >
              {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
            </button>
          </div>
        </form>

        {/* Demo bilgileri */}
        <div className="bg-neutral-100 border border-neutral-200 p-4 rounded-xl">
          <h3 className="text-sm font-medium text-neutral-900 mb-2">Demo Hesapları:</h3>
          <div className="text-xs text-neutral-600 space-y-1">
            <div>Admin: admin@canary.com / admin123</div>
            <div>Test: test@canary.com / test123</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Login