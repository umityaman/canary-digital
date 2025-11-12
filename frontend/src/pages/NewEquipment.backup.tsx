import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Upload, Image as ImageIcon, QrCode } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import QRCodeGenerator from '../components/QRCodeGenerator';
import api from '../services/api';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

const NewEquipment: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: '',
    serialNumber: '',
    description: '',
    dailyPrice: '',
    purchasePrice: '',
    purchaseDate: '',
    supplier: '',
    warranty: '',
    status: 'AVAILABLE',
    equipmentType: 'RENTAL',
    location: '',
    notes: '',
    images: [] as string[]
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [savedEquipmentId, setSavedEquipmentId] = useState<number | null>(null);
  const [nextEquipmentCode, setNextEquipmentCode] = useState<string>('Yükleniyor...');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchNextEquipmentCode();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchNextEquipmentCode = async () => {
    try {
      // Son ekipmanı al
      const response = await api.get('/equipment');
      const equipment = response.data;
      
      if (equipment && equipment.length > 0) {
        // En yüksek ID'yi bul
        const maxId = Math.max(...equipment.map((e: any) => e.id || 0));
        const nextNumber = maxId + 1;
        setNextEquipmentCode(`EQP-${String(nextNumber).padStart(4, '0')}`);
      } else {
        setNextEquipmentCode('EQP-0001');
      }
    } catch (error) {
      console.error('Error fetching next equipment code:', error);
      setNextEquipmentCode('EQP-0001');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate upload - replace with actual upload logic
        const url = URL.createObjectURL(file);
        uploadedUrls.push(url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      showNotification('success', `${files.length} resim yüklendi`);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', 'Resim yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showNotification('error', 'Lütfen kategori adı girin');
      return;
    }

    try {
      const response = await api.post('/categories', {
        name: newCategoryName.trim(),
        isActive: true
      });
      
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category: newCategory.name }));
      setNewCategoryName('');
      setShowNewCategoryModal(false);
      showNotification('success', 'Kategori başarıyla eklendi');
    } catch (error: any) {
      console.error('Add category error:', error);
      showNotification('error', error.response?.data?.error || 'Kategori eklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.model || !formData.category) {
      showNotification('error', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const equipmentData = {
        ...formData,
        dailyPrice: formData.dailyPrice ? parseFloat(formData.dailyPrice) : undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      };

      const response = await api.post('/equipment', equipmentData);
      const savedEquipment = response.data;
      
      setSavedEquipmentId(savedEquipment.id);
      showNotification('success', 'Ekipman başarıyla eklendi');
      
      // Show QR modal option
      if (window.confirm('Ekipman kaydedildi! QR kod oluşturmak ister misiniz?')) {
        setShowQRModal(true);
      } else {
        navigate('/inventory');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      showNotification('error', error.response?.data?.message || 'Ekipman kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/inventory')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-neutral-700" />
              <h1 className="text-2xl font-semibold text-neutral-900">Yeni Ekipman Ekle</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Temel Bilgiler</h2>
            
            {/* Otomatik Ekipman Kodu Gösterimi */}
            <div className="mb-6 p-4 bg-blue-50 border border-neutral-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Otomatik Ekipman Kodu</p>
                  <p className="text-xs text-blue-700 mt-1">Sistem tarafından otomatik atanacak</p>
                </div>
                <div className="text-2xl font-bold text-blue-600 font-mono">
                  {nextEquipmentCode}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ekipman Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Örn: Canon EOS R5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Marka <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Örn: Canon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Örn: R5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    + Yeni
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Seri Numarası
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Örn: SN123456789"
                />
              </div>

              <div className="col-span-2">
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                  <p className="text-xs text-neutral-600">
                    <span className="font-semibold">💡 Not:</span> Envanter ID otomatik olarak <span className="font-mono font-semibold text-blue-600">{nextEquipmentCode}</span> şeklinde atanacaktır.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
                placeholder="Ekipman hakkında detaylı bilgi..."
              />
            </div>
          </div>

          {/* Fiyatlandırma */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Fiyatlandırma</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Günlük Kiralama Ücreti
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                  <input
                    type="number"
                    name="dailyPrice"
                    value={formData.dailyPrice}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Satın Alma Fiyatı
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Satın Alma Tarihi
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tedarikçi
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Tedarikçi adı"
                />
              </div>
            </div>
          </div>

          {/* Durum ve Tip */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Durum ve Tür</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  <option value="AVAILABLE">Müsait</option>
                  <option value="RENTED">Kirada</option>
                  <option value="RESERVED">Rezerve</option>
                  <option value="MAINTENANCE">Bakımda</option>
                  <option value="LOST">Kayıp</option>
                  <option value="BROKEN">Bozuk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ekipman Türü
                </label>
                <select
                  name="equipmentType"
                  value={formData.equipmentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  <option value="RENTAL">Kiralık</option>
                  <option value="SALE">Satılık</option>
                  <option value="SERVICE">Servis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Konum
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Depo, Raf numarası"
                />
              </div>
            </div>
          </div>

          {/* Garanti ve Notlar */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Garanti ve Notlar</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Garanti Bitiş Tarihi
                </label>
                <input
                  type="date"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notlar
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
                  placeholder="Bakım geçmişi, özel notlar vb."
                />
              </div>
            </div>
          </div>

          {/* Resimler */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Resimler</h2>
            
            <div className="space-y-4">
              {/* Image Upload Button */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer text-sm font-medium text-neutral-700">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <span className="text-sm text-gray-500">
                  Birden fazla resim seçebilirsiniz
                </span>
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Equipment ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Henüz resim yüklenmedi</p>
                </div>
              )}
            </div>
          </div>

        </form>
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Yeni Kategori Ekle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Örn: Ses Sistemleri, Aydınlatma, Kamera..."
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
              >
                İptal
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && savedEquipmentId && (
        <QRCodeGenerator
          equipmentId={savedEquipmentId}
          equipmentName={formData.name}
          serialNumber={formData.serialNumber || 'N/A'}
          onClose={() => {
            setShowQRModal(false);
            navigate('/inventory');
          }}
        />
      )}
    </div>
  );
};

export default NewEquipment;
