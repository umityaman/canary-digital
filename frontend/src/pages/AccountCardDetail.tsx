import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Phone, Mail, MapPin, FileText, DollarSign, 
  TrendingUp, TrendingDown, Plus, Calendar, User, CreditCard 
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://canary-backend-672344972017.europe-west1.run.app/api'

interface Transaction {
  id: number
  type: string
  amount: number
  date: string
  dueDate?: string
  description: string
  referenceType?: string
  referenceId?: number
  user: {
    name: string
  }
}

interface AccountCard {
  id: number
  code: string
  name: string
  type: string
  balance: number
  taxNumber?: string
  taxOffice?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  district?: string
  contactPerson?: string
  contactPhone?: string
  website?: string
  notes?: string
  creditLimit?: number
  paymentTerm?: number
  discountRate?: number
  isActive: boolean
  transactions: Transaction[]
  _count: {
    transactions: number
    invoices: number
    expenses: number
  }
}

interface Summary {
  balance: number
  debitTotal: number
  creditTotal: number
  overdueCount: number
  invoiceCount: number
  expenseCount: number
  creditLimit?: number
  availableCredit?: number
}

const AccountCardDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [accountCard, setAccountCard] = useState<AccountCard | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  useEffect(() => {
    if (id) {
      loadAccountCard()
      loadSummary()
    }
  }, [id])

  const loadAccountCard = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/account-cards/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setAccountCard(response.data)
    } catch (error: any) {
      console.error('Load account card error:', error)
      toast.error('Cari hesap yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/account-cards/${id}/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSummary(response.data)
    } catch (error: any) {
      console.error('Load summary error:', error)
    }
  }

  const formatBalance = (balance: number) => {
    const absBalance = Math.abs(balance)
    const formatted = absBalance.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
    
    if (balance > 0) {
      return { text: `₺${formatted}`, label: 'Borç', color: 'text-red-600' }
    } else if (balance < 0) {
      return { text: `₺${formatted}`, label: 'Alacak', color: 'text-green-600' }
    }
    return { text: '₺0,00', label: 'Bakiye', color: 'text-neutral-600' }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      customer: 'Müşteri',
      supplier: 'Tedarikçi',
      both: 'Her İkisi'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!accountCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Cari hesap bulunamadı</p>
          <button
            onClick={() => navigate('/account-cards')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Listeye dön
          </button>
        </div>
      </div>
    )
  }

  const balance = formatBalance(accountCard.balance)

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/account-cards')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{accountCard.name}</h1>
              <p className="text-sm text-neutral-600 mt-1">
                Kod: {accountCard.code} • {getTypeLabel(accountCard.type)}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/account-cards/${id}/edit`)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Düzenle
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-neutral-300 text-sm mb-2">Güncel Bakiye</p>
              <p className={`text-4xl font-bold ${balance.color === 'text-red-600' ? 'text-red-400' : balance.color === 'text-green-600' ? 'text-green-400' : 'text-white'}`}>
                {balance.text}
              </p>
              <p className="text-neutral-300 text-sm mt-1">{balance.label}</p>
            </div>
            <div>
              <p className="text-neutral-300 text-sm mb-2">Kredi Limiti</p>
              <p className="text-2xl font-bold">
                {accountCard.creditLimit 
                  ? `₺${accountCard.creditLimit.toLocaleString('tr-TR')}`
                  : 'Belirtilmemiş'}
              </p>
              {summary?.availableCredit !== null && summary?.availableCredit !== undefined && (
                <p className="text-neutral-300 text-sm mt-1">
                  Kullanılabilir: ₺{summary.availableCredit.toLocaleString('tr-TR')}
                </p>
              )}
            </div>
            <div>
              <p className="text-neutral-300 text-sm mb-2">Vade</p>
              <p className="text-2xl font-bold">
                {accountCard.paymentTerm ? `${accountCard.paymentTerm} gün` : 'Peşin'}
              </p>
              {accountCard.discountRate && (
                <p className="text-neutral-300 text-sm mt-1">
                  İskonto: %{accountCard.discountRate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Toplam Borç</p>
                  <p className="text-lg font-bold text-red-600">
                    ₺{summary.debitTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Toplam Alacak</p>
                  <p className="text-lg font-bold text-green-600">
                    ₺{summary.creditTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Fatura</p>
                  <p className="text-lg font-bold text-neutral-900">{summary.invoiceCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Gecikmiş</p>
                  <p className="text-lg font-bold text-orange-600">{summary.overdueCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">İletişim Bilgileri</h2>
              
              <div className="space-y-4">
                {accountCard.phone && (
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-neutral-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{accountCard.phone}</p>
                      <p className="text-xs text-neutral-500">Telefon</p>
                    </div>
                  </div>
                )}

                {accountCard.email && (
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-neutral-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{accountCard.email}</p>
                      <p className="text-xs text-neutral-500">E-posta</p>
                    </div>
                  </div>
                )}

                {accountCard.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-neutral-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{accountCard.address}</p>
                      {accountCard.district && accountCard.city && (
                        <p className="text-xs text-neutral-500">{accountCard.district}, {accountCard.city}</p>
                      )}
                    </div>
                  </div>
                )}

                {accountCard.contactPerson && (
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-neutral-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{accountCard.contactPerson}</p>
                      <p className="text-xs text-neutral-500">Yetkili Kişi</p>
                      {accountCard.contactPhone && (
                        <p className="text-xs text-neutral-500 mt-1">{accountCard.contactPhone}</p>
                      )}
                    </div>
                  </div>
                )}

                {accountCard.taxNumber && (
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-neutral-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{accountCard.taxNumber}</p>
                      <p className="text-xs text-neutral-500">
                        {accountCard.taxOffice || 'Vergi Numarası'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {accountCard.notes && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Notlar</h3>
                  <p className="text-sm text-neutral-600">{accountCard.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Hesap Hareketleri</h2>
                <button
                  onClick={() => setShowTransactionModal(true)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Yeni Hareket
                </button>
              </div>

              <div className="p-6">
                {accountCard.transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="mx-auto text-neutral-400 mb-4" size={48} />
                    <p className="text-neutral-600">Henüz hareket yok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accountCard.transactions.map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'debit' 
                              ? 'bg-red-100' 
                              : 'bg-green-100'
                          }`}>
                            {transaction.type === 'debit' ? (
                              <TrendingUp className="text-red-600" size={20} />
                            ) : (
                              <TrendingDown className="text-green-600" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              {transaction.description}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(transaction.date).toLocaleDateString('tr-TR')}
                              </p>
                              {transaction.dueDate && (
                                <p className="text-xs text-neutral-500">
                                  Vade: {new Date(transaction.dueDate).toLocaleDateString('tr-TR')}
                                </p>
                              )}
                              <p className="text-xs text-neutral-500">{transaction.user.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'debit' ? '+' : '-'}₺{transaction.amount.toLocaleString('tr-TR', { 
                              minimumFractionDigits: 2 
                            })}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {transaction.type === 'debit' ? 'Borç' : 'Alacak'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal - TODO: Create separate component */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Yeni Hareket Ekle</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Bu özellik yakında eklenecek...
            </p>
            <button
              onClick={() => setShowTransactionModal(false)}
              className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountCardDetail
