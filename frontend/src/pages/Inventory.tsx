import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit, Trash2, Package, Upload, Download, ChevronDown, Plug, Settings, QrCode, ScanLine } from 'lucide-react'
import { useEquipmentStore } from '../stores/equipmentStore'
import EquipmentModal from '../components/modals/EquipmentModal'
import CategoryModal from '../components/modals/CategoryModal'
import { QRCodeGenerator } from '../components/QRCodeGenerator'
import BarcodeScanner from '../components/BarcodeScanner'
import PDFDownloadButton from '../components/pdf/PDFDownloadButton'
import api from '../services/api'

interface Equipment {
  id: string
  name: string
  brand: string
  model: string
  category: string
  serialNumber?: string
  description?: string
  dailyPrice?: number
  status: 'AVAILABLE' | 'RENTED' | 'RESERVED' | 'MAINTENANCE' | 'LOST' | 'BROKEN'
  equipmentType?: 'RENTAL' | 'SALE' | 'SERVICE'
  inventoryId?: string
  booqableId?: string
}

interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
}

const Inventory: React.FC = () => {
  const navigate = useNavigate()
  const { equipment, loading, error, fetchEquipment, deleteEquipment } = useEquipmentStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterEquipmentType, setFilterEquipmentType] = useState<string>('all')
  
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [statusOpen, setStatusOpen] = useState(true)
  const [equipmentTypeOpen, setEquipmentTypeOpen] = useState(true)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedEquipment, setSelectedEquipment] = useState<any>()
  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [, setLoadingCategories] = useState(false)

  // QR/Barcode states
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [selectedEquipmentForQR, setSelectedEquipmentForQR] = useState<any>(null)

  useEffect(() => {
    fetchEquipment()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }
  
  const statusOptions = [
    { value: 'AVAILABLE', label: 'Müsait' },
    { value: 'RENTED', label: 'Kirada' },
    { value: 'RESERVED', label: 'Rezerve' },
    { value: 'MAINTENANCE', label: 'Bakımda' },
    { value: 'LOST', label: 'Kayıp' },
    { value: 'BROKEN', label: 'Bozuk' }
  ]
  
  const equipmentTypeOptions = [
    { value: 'RENTAL', label: 'Kiralık' },
    { value: 'SALE', label: 'Satılık' },
    { value: 'SERVICE', label: 'Servis' }
  ]

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.inventoryId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesEquipmentType = filterEquipmentType === 'all' || item.equipmentType === filterEquipmentType
    
    return matchesSearch && matchesStatus && matchesCategory && matchesEquipmentType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Müsait</span>
      case 'RENTED':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Kirada</span>
      case 'RESERVED':
        return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-full">Rezerve</span>
      case 'MAINTENANCE':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Bakımda</span>
      case 'LOST':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Kayıp</span>
      case 'BROKEN':
        return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-full">Bozuk</span>
      default:
        return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-full">Bilinmiyor</span>
    }
  }

  const _getEquipmentTypeBadge = (type?: string) => {
    if (!type) return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full">-</span>
    
    switch (type) {
      case 'RENTAL':
        return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-full">Kiralık</span>
      case 'SALE':
        return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-full">Satılık</span>
      case 'SERVICE':
        return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-800 rounded-full">Servis</span>
      default:
        return <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full">-</span>
    }
  }

  const handleAdd = () => {
    navigate('/inventory/new')
  }

  const handleEdit = (equipment: Equipment) => {
    navigate(`/inventory/${equipment.id}`)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ekipmanı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteEquipment(id)
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedEquipment(undefined)
  }

  const handleCategorySave = async (category: Category) => {
    try {
      if (category.id) {
        // Update existing category
        await api.put(`/categories/${category.id}`, category)
      } else {
        // Create new category
        await api.post('/categories', category)
      }
      await fetchCategories()
      setCategoryModalOpen(false)
      setSelectedCategory(null)
    } catch (error: any) {
      console.error('Error saving category:', error)
      throw error
    }
  }

  const handleShowQRCode = (equipment: any) => {
    setSelectedEquipmentForQR(equipment)
    setQrModalOpen(true)
  }

  const handleScanComplete = async (code: string) => {
    // Code tarama tamamlandığında
    console.log('Scanned code:', code)
    
    try {
      // Backend'den equipment bilgisini al
      const response = await fetch(`http://localhost:4000/api/scan/${encodeURIComponent(code)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const eq = equipment.find(e => e.id === String(result.data.id))
          if (eq) {
            setSelectedEquipment(eq)
            setModalMode('edit')
            setModalOpen(true)
          }
        }
      } else {
        console.error('Equipment not found')
      }
    } catch (error) {
      console.error('Scan error:', error)
      
      // Fallback: Manuel parsing
      try {
        const parsed = JSON.parse(code)
        if (parsed.type === 'equipment' && parsed.id) {
          const eq = equipment.find(e => e.id === String(parsed.id))
          if (eq) {
            setSelectedEquipment(eq)
            setModalMode('edit')
            setModalOpen(true)
          }
        }
      } catch {
        const idMatch = code.match(/EQ(\d+)/)
        if (idMatch) {
          const id = String(parseInt(idMatch[1]))
          const eq = equipment.find(e => e.id === id)
          if (eq) {
            setSelectedEquipment(eq)
            setModalMode('edit')
            setModalOpen(true)
          }
        }
      }
    }
  }

  if (loading && equipment.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ekipmanlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Hata: {error}</p>
        <button 
          onClick={fetchEquipment}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Tekrar dene
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      <div className="w-52 flex-shrink-0 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <button 
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span>Kategori</span>
            <ChevronDown 
              size={20} 
              className={`text-gray-500 transition-transform duration-200 ${categoryOpen ? 'rotate-0' : '-rotate-90'}`} 
            />
          </button>
          {categoryOpen && (
            <div className="px-4 pb-4 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked={filterCategory === 'all'}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-4 h-4 text-neutral-900 border-gray-300 focus:ring-neutral-900"
                />
                <span className="text-sm text-gray-700">Tümü</span>
              </label>
              {categories.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">Henüz kategori eklenmemiş</p>
              ) : (
                categories.map(cat => (
                  <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat.name}
                      checked={filterCategory === cat.name}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-4 h-4 text-neutral-900 border-gray-300 focus:ring-neutral-900"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </span>
                  </label>
                ))
              )}
              
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setCategoryModalOpen(true)
                }}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Kategori Yönet</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <button 
            onClick={() => setStatusOpen(!statusOpen)}
            className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span>Durum</span>
            <ChevronDown 
              size={20} 
              className={`text-gray-500 transition-transform duration-200 ${statusOpen ? 'rotate-0' : '-rotate-90'}`} 
            />
          </button>
          {statusOpen && (
            <div className="px-4 pb-4 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="all"
                  checked={filterStatus === 'all'}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-4 h-4 text-neutral-900 border-gray-300 focus:ring-neutral-900"
                />
                <span className="text-sm text-gray-700">Tümü</span>
              </label>
              {statusOptions.map(status => (
                <label key={status.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={filterStatus === status.value}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-4 h-4 text-neutral-900 border-gray-300 focus:ring-neutral-900"
                  />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <button 
            onClick={() => setEquipmentTypeOpen(!equipmentTypeOpen)}
            className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span>Ekipman Tipi</span>
            <ChevronDown 
              size={20} 
              className={`text-gray-500 transition-transform duration-200 ${equipmentTypeOpen ? 'rotate-0' : '-rotate-90'}`} 
            />
          </button>
          {equipmentTypeOpen && (
            <div className="px-4 pb-4 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="equipmentType"
                  value="all"
                  checked={filterEquipmentType === 'all'}
                  onChange={(e) => setFilterEquipmentType(e.target.value)}
                  className="w-4 h-4 text-neutral-900 border-gray-300 focus:ring-neutral-900"
                />
                <span className="text-sm text-gray-700">Tümü</span>
              </label>
              {equipmentTypeOptions.map(type => (
                <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="equipmentType"
                    value={type.value}
                    checked={filterEquipmentType === type.value}
                    onChange={(e) => setFilterEquipmentType(e.target.value)}
                    className="w-4 h-4 text-neutral-900 border-gray-300 focus:ring-neutral-900"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setScannerOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ScanLine size={16} />
            <span className="text-sm font-medium">Tara</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload size={16} />
            <span className="text-sm font-medium">Yükle</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={16} />
            <span className="text-sm font-medium">Çıkar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Ekipman ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <PDFDownloadButton 
            type="equipment"
            filters={{ 
              status: filterStatus === 'all' ? '' : filterStatus,
              category: filterCategory === 'all' ? '' : filterCategory,
              equipmentType: filterEquipmentType === 'all' ? '' : filterEquipmentType
            }}
            variant="secondary"
            size="md"
            label="Ekipman Listesi PDF"
          />
          
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-neutral-900 text-white px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors font-medium"
          >
            <Plus size={20} />
            <span>Ekipman Ekle</span>
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button className="pb-3 border-b-2 border-neutral-900 font-medium text-sm">
              Ekipmanlar
            </button>
            <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium text-sm">
              Koleksiyonlar
            </button>
            <button className="pb-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium text-sm">
              Paketler
            </button>
          </div>
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center">
              <Package size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterEquipmentType !== 'all'
                  ? 'Ekipman bulunamadı'
                  : 'İlk ekipmanınızı ekleyin'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterEquipmentType !== 'all'
                  ? 'Arama kriterlerinize uygun ekipman bulunamadı.'
                  : 'Kiralama işine hazırlanın, ilk ürününüzü ekleyin.'}
              </p>
              {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && filterEquipmentType === 'all' && (
                <button
                  onClick={handleAdd}
                  className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors font-medium"
                >
                  Ekipman Ekle
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-xs text-gray-700 uppercase tracking-wider">
                    Ekipman
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-gray-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-gray-700 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-gray-700 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-xs text-gray-700 uppercase tracking-wider">
                    Seri No
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-xs text-gray-700 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEquipment.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/inventory/${item.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.brand} {item.model}</div>
                        </div>
                        {item.booqableId && (
                          <div 
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                            title={`Booqable ID: ${item.booqableId}`}
                          >
                            <Plug size={12} />
                            <span>Booqable</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Stokta
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{item.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{item.serialNumber || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowQRCode(item);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="QR Kod & Barcode"
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Düzenle"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EquipmentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        equipment={selectedEquipment}
        mode={modalMode}
      />

            <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false)
          setSelectedCategory(null)
        }}
        onSave={handleCategorySave as any}
        category={selectedCategory}
      />

      {/* QR Code & Barcode Modal */}
      {qrModalOpen && selectedEquipmentForQR && (
        <QRCodeGenerator
          equipmentId={parseInt(selectedEquipmentForQR.id)}
          equipmentName={selectedEquipmentForQR.name}
          serialNumber={selectedEquipmentForQR.serialNumber || 'N/A'}
          type="both"
          onClose={() => {
            setQrModalOpen(false)
            setSelectedEquipmentForQR(null)
          }}
        />
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanComplete}
      />
    </div>
  )
}

export default Inventory