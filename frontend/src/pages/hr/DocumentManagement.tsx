import { useState } from 'react'
import { FileText, FolderOpen, Download, Upload, Eye, AlertCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react'

type DocumentCategory = 'contract' | 'job-description' | 'form' | 'certificate' | 'other'
type DocumentStatus = 'active' | 'expired' | 'pending-signature' | 'archived'

interface Document {
  id: number
  name: string
  category: DocumentCategory
  status: DocumentStatus
  employee: string
  uploadDate: string
  expiryDate?: string
  size: string
}

export default function DocumentManagement() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const documents: Document[] = [
    {
      id: 1,
      name: 'İş Sözleşmesi - Ahmet Yılmaz',
      category: 'contract',
      status: 'active',
      employee: 'Ahmet Yılmaz',
      uploadDate: '15.01.2024',
      expiryDate: '15.01.2026',
      size: '245 KB'
    },
    {
      id: 2,
      name: 'İş Tanımı - Yazılım Geliştirici',
      category: 'job-description',
      status: 'active',
      employee: 'Mehmet Demir',
      uploadDate: '20.02.2024',
      size: '128 KB'
    },
    {
      id: 3,
      name: 'Gizlilik Sözleşmesi - Ayşe Kaya',
      category: 'contract',
      status: 'pending-signature',
      employee: 'Ayşe Kaya',
      uploadDate: '10.10.2024',
      expiryDate: '10.10.2025',
      size: '198 KB'
    },
    {
      id: 4,
      name: 'Yıllık İzin Formu',
      category: 'form',
      status: 'archived',
      employee: 'Fatma Şahin',
      uploadDate: '05.06.2024',
      size: '89 KB'
    },
    {
      id: 5,
      name: 'İş Sözleşmesi - Zeynep Öztürk',
      category: 'contract',
      status: 'expired',
      employee: 'Zeynep Öztürk',
      uploadDate: '01.01.2023',
      expiryDate: '01.01.2024',
      size: '256 KB'
    },
  ]

  const categories = [
    { id: 'all', label: 'Tümü', icon: <FolderOpen size={16} /> },
    { id: 'contract', label: 'Sözleşmeler', icon: <FileText size={16} /> },
    { id: 'job-description', label: 'İş Tanımları', icon: <FileText size={16} /> },
    { id: 'form', label: 'Formlar', icon: <FileText size={16} /> },
    { id: 'certificate', label: 'Sertifikalar', icon: <FileText size={16} /> },
    { id: 'other', label: 'Diğer', icon: <FileText size={16} /> },
  ]

  const getStatusBadge = (status: DocumentStatus) => {
    const badges = {
      'active': { label: 'Aktif', class: 'bg-green-100 text-green-800' },
      'expired': { label: 'Süresi Doldu', class: 'bg-red-100 text-red-800' },
      'pending-signature': { label: 'İmza Bekliyor', class: 'bg-yellow-100 text-yellow-800' },
      'archived': { label: 'Arşivlendi', class: 'bg-neutral-100 text-neutral-600' },
    }
    const badge = badges[status]
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>{badge.label}</span>
  }

  const getCategoryLabel = (category: DocumentCategory) => {
    const labels = {
      'contract': 'Sözleşme',
      'job-description': 'İş Tanımı',
      'form': 'Form',
      'certificate': 'Sertifika',
      'other': 'Diğer',
    }
    return labels[category]
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate.split('.').reverse().join('-'))
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const expiringDocuments = documents.filter(doc => {
    if (!doc.expiryDate) return false
    const daysLeft = getDaysUntilExpiry(doc.expiryDate)
    return daysLeft > 0 && daysLeft <= 30
  })

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.employee.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Özlük İşleri & Doküman Yönetimi</h2>
        <p className="text-neutral-600">
          Sözleşmeler, iş tanımları, formlar ve diğer dokümanları yönetin.
        </p>
      </div>

      {/* Expiring Documents Alert */}
      {expiringDocuments.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">Süresi Yaklaşan Dokümanlar</h3>
              <div className="space-y-2">
                {expiringDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between text-sm">
                    <span className="text-orange-800">{doc.name}</span>
                    <span className="text-orange-600 font-medium">
                      {getDaysUntilExpiry(doc.expiryDate!)} gün kaldı
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-neutral-600" size={20} />
            <CheckCircle className="text-green-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {documents.filter(d => d.status === 'active').length}
          </h3>
          <p className="text-sm text-neutral-600">Aktif Doküman</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-neutral-600" size={20} />
            <AlertCircle className="text-yellow-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {documents.filter(d => d.status === 'pending-signature').length}
          </h3>
          <p className="text-sm text-neutral-600">İmza Bekliyor</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="text-neutral-600" size={20} />
            <AlertCircle className="text-red-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {documents.filter(d => d.status === 'expired').length}
          </h3>
          <p className="text-sm text-neutral-600">Süresi Dolmuş</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <FolderOpen className="text-neutral-600" size={20} />
            <FileText className="text-neutral-600" size={16} />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">
            {documents.filter(d => d.status === 'archived').length}
          </h3>
          <p className="text-sm text-neutral-600">Arşivlendi</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Doküman veya çalışan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
          <Upload size={20} />
          <span>Doküman Yükle</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as DocumentCategory | 'all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Doküman Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Çalışan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Yüklenme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Son Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-neutral-400" size={20} />
                      <div>
                        <div className="font-medium text-neutral-900">{doc.name}</div>
                        <div className="text-xs text-neutral-500">{doc.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {getCategoryLabel(doc.category)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                    {doc.employee}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {doc.uploadDate}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {doc.expiryDate ? (
                      <span className={getDaysUntilExpiry(doc.expiryDate) <= 30 && getDaysUntilExpiry(doc.expiryDate) > 0 ? 'text-orange-600 font-medium' : 'text-neutral-600'}>
                        {doc.expiryDate}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
