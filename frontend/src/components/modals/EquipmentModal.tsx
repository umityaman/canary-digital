import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { useEquipmentStore } from '../../stores/equipmentStore'

interface Equipment {
  id?: string
  name: string
  brand: string
  model: string
  category: string
  serialNumber?: string
  description?: string
  dailyPrice?: number
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'
}

interface EquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  equipment?: Equipment
  mode: 'create' | 'edit'
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipment,
  mode
}) => {
  const { createEquipment, updateEquipment, loading, error } = useEquipmentStore()
  
  const [formData, setFormData] = useState<Equipment>({
    name: '',
    brand: '',
    model: '',
    category: '',
    serialNumber: '',
    description: '',
    dailyPrice: 0,
    status: 'AVAILABLE'
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (equipment && mode === 'edit') {
      setFormData({
        id: equipment.id,
        name: equipment.name,
        brand: equipment.brand,
        model: equipment.model,
        category: equipment.category,
        serialNumber: equipment.serialNumber || '',
        description: equipment.description || '',
        dailyPrice: equipment.dailyPrice || 0,
        status: equipment.status
      })
    } else {
      setFormData({
        name: '',
        brand: '',
        model: '',
        category: '',
        serialNumber: '',
        description: '',
        dailyPrice: 0,
        status: 'AVAILABLE'
      })
    }
    setFormErrors({})
  }, [equipment, mode, isOpen])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Ekipman adı zorunludur'
    }
    if (!formData.brand.trim()) {
      errors.brand = 'Marka zorunludur'
    }
    if (!formData.model.trim()) {
      errors.model = 'Model zorunludur'
    }
    if (!formData.category.trim()) {
      errors.category = 'Kategori zorunludur'
    }
    if (formData.dailyPrice !== undefined && formData.dailyPrice < 0) {
      errors.dailyPrice = 'Günlük fiyat negatif olamaz'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (mode === 'create') {
        await createEquipment(formData)
      } else {
        await updateEquipment(formData.id!, formData)
      }
      
      onClose()
    } catch (err) {
      console.error('Form submission error:', err)
    }
  }

  const handleInputChange = (field: keyof Equipment, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Yeni Ekipman Ekle' : 'Ekipman Düzenle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ekipman Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ekipman Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Örn: Canon EOS R5"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Marka */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.brand ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Örn: Canon"
              />
              {formErrors.brand && (
                <p className="mt-1 text-sm text-red-600">{formErrors.brand}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.model ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Örn: EOS R5"
              />
              {formErrors.model && (
                <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Kategori Seçin</option>
                <option value="Kamera">Kamera</option>
                <option value="Objektif">Objektif</option>
                <option value="Tripod">Tripod</option>
                <option value="Işık">Işık</option>
                <option value="Ses">Ses</option>
                <option value="Aksesuar">Aksesuar</option>
                <option value="Drone">Drone</option>
                <option value="Gimbal">Gimbal</option>
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
              )}
            </div>

            {/* Seri Numarası */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seri Numarası
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Örn: 123456789"
              />
            </div>

            {/* Günlük Fiyat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Günlük Fiyat (₺)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.dailyPrice}
                onChange={(e) => {
                  // Remove leading zeros and convert to number
                  const value = e.target.value.replace(/^0+(?=\d)/, '');
                  handleInputChange('dailyPrice', parseFloat(value) || 0);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.dailyPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {formErrors.dailyPrice && (
                <p className="mt-1 text-sm text-red-600">{formErrors.dailyPrice}</p>
              )}
            </div>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="AVAILABLE"
                  checked={formData.status === 'AVAILABLE'}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">Müsait</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="RENTED"
                  checked={formData.status === 'RENTED'}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">Kiralık</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="MAINTENANCE"
                  checked={formData.status === 'MAINTENANCE'}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-sm">Bakımda</span>
              </label>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ekipman hakkında ek bilgiler..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{mode === 'create' ? 'Ekle' : 'Güncelle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EquipmentModal