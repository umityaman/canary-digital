import { useState, useEffect } from 'react'
import { Edit2, Trash2, Tag, TrendingUp, TrendingDown, Save, X } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color?: string
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      if (!token) {
        toast.error('Oturum bilgisi bulunamadı')
        return
      }

      const response = await axios.get(`${API_URL}/api/accounting/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setCategories(response.data.data || [])
    } catch (error: any) {
      console.error('Failed to load categories:', error)
      toast.error('Kategoriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleRename = async (category: Category) => {
    if (!editValue.trim()) {
      toast.error('Kategori adı boş olamaz')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      await axios.post(
        `${API_URL}/api/accounting/categories/rename`,
        {
          type: category.type,
          oldName: category.name,
          newName: editValue.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      toast.success('Kategori güncellendi')
      setEditingId(null)
      setEditValue('')
      loadCategories()
    } catch (error: any) {
      console.error('Failed to rename category:', error)
      toast.error('Kategori güncellenemedi')
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz? Bu kategorideki tüm kayıtlar "Diğer" kategorisine taşınacak.`)) {
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')

      await axios.delete(
        `${API_URL}/api/accounting/categories/${category.type}/${encodeURIComponent(category.name)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      toast.success('Kategori silindi')
      loadCategories()
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      toast.error('Kategori silinemedi')
    }
  }

  const filteredCategories = categories.filter(cat => {
    if (filter === 'all') return true
    return cat.type === filter
  })

  const incomeCount = categories.filter(c => c.type === 'income').length
  const expenseCount = categories.filter(c => c.type === 'expense').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Kategori Yönetimi</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Gelir ve gider kategorilerinizi düzenleyin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Gelir Kategorileri</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{incomeCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Gider Kategorileri</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{expenseCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Toplam Kategori</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Tag className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Tümü ({categories.length})
        </button>
        <button
          onClick={() => setFilter('income')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'income'
              ? 'bg-green-500 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Gelir ({incomeCount})
        </button>
        <button
          onClick={() => setFilter('expense')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'expense'
              ? 'bg-red-500 text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Gider ({expenseCount})
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-600">Kategoriler yükleniyor...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-neutral-600">
            <Tag className="mx-auto mb-4 text-neutral-400" size={48} />
            <p className="text-lg font-medium">Kategori bulunamadı</p>
            <p className="text-sm mt-2">Gelir veya gider ekleyerek kategoriler otomatik oluşturulacak</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.type === 'income' ? (
                        <TrendingUp size={20} style={{ color: category.color }} />
                      ) : (
                        <TrendingDown size={20} style={{ color: category.color }} />
                      )}
                    </div>
                    
                    {editingId === category.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleRename(category)
                            } else if (e.key === 'Escape') {
                              setEditingId(null)
                              setEditValue('')
                            }
                          }}
                        />
                        <button
                          onClick={() => handleRename(category)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Kaydet"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditValue('')
                          }}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="İptal"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900">{category.name}</h3>
                          <p className="text-xs text-neutral-500">
                            {category.type === 'income' ? 'Gelir' : 'Gider'} kategorisi
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {editingId !== category.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(category.id)
                          setEditValue(category.name)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Tag className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Kategori Bilgisi</h4>
            <p className="text-sm text-blue-700">
              • Kategoriler gelir ve gider kayıtlarından otomatik oluşturulur<br />
              • Bir kategoriyi yeniden adlandırdığınızda, o kategorideki tüm kayıtlar güncellenir<br />
              • Bir kategoriyi sildiğinizde, kayıtlar "Diğer" kategorisine taşınır<br />
              • Yeni kategori eklemek için gelir veya gider kaydı oluştururken kategori adı girin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
