import React, { useState, useEffect } from 'react';
import { X, Tag, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

interface Category {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => Promise<void>;
  category?: Category | null;
}

// Icon options from lucide-react
const iconOptions = [
  { value: 'Camera', label: 'Kamera', icon: '📷' },
  { value: 'Aperture', label: 'Lens', icon: '🔍' },
  { value: 'Lightbulb', label: 'Aydınlatma', icon: '💡' },
  { value: 'Mic', label: 'Ses', icon: '🎤' },
  { value: 'Cable', label: 'Kablo', icon: '🔌' },
  { value: 'Tripod', label: 'Tripod', icon: '📐' },
  { value: 'Video', label: 'Video', icon: '🎥' },
  { value: 'Smartphone', label: 'Gimbal', icon: '📱' },
  { value: 'Plane', label: 'Drone', icon: '✈️' },
  { value: 'Box', label: 'Aksesuar', icon: '📦' },
  { value: 'Package', label: 'Diğer', icon: '📦' },
];

// Color presets
const colorPresets = [
  { value: '#3b82f6', label: 'Mavi' },
  { value: '#10b981', label: 'Yeşil' },
  { value: '#f59e0b', label: 'Turuncu' },
  { value: '#ef4444', label: 'Kırmızı' },
  { value: '#8b5cf6', label: 'Mor' },
  { value: '#ec4899', label: 'Pembe' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#6366f1', label: 'İndigo' },
  { value: '#f97316', label: 'Turuncu (Koyu)' },
  { value: '#14b8a6', label: 'Teal' },
];

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState<Category>({
    name: '',
    description: '',
    icon: '',
    color: '#3b82f6',
    isActive: true
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
        color: category.color || '#3b82f6',
        isActive: category.isActive ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'Camera',
        color: '#3b82f6',
        isActive: true
      });
    }
    setErrors({});
    setSubmitError('');
  }, [category, isOpen]);

  const handleChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSubmitError('');
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.response?.data?.error || 'Kategori kaydedilirken bir hata oluştu');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedIconOption = iconOptions.find(opt => opt.value === formData.icon);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            {category ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Kategori Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="Örn: Profesyonel Kameralar"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Açıklama
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent resize-none"
                placeholder="Kategori hakkında kısa açıklama..."
                rows={3}
              />
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              İkon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {iconOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('icon', option.value)}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:border-neutral-500 ${
                    formData.icon === option.value
                      ? 'border-neutral-500 bg-blue-50'
                      : 'border-neutral-200'
                  }`}
                  title={option.label}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-xs text-neutral-600">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Renk
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleChange('color', preset.value)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.color === preset.value
                      ? 'border-neutral-900 ring-2 ring-neutral-300'
                      : 'border-neutral-200'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.label}
                />
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="mt-3 flex items-center gap-3">
              <label className="text-sm text-neutral-600">Özel Renk:</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-12 h-12 rounded-lg border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Preview Badge */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Önizleme
            </label>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: formData.color }}
              >
                {selectedIconOption && <span>{selectedIconOption.icon}</span>}
                {formData.name || 'Kategori Adı'}
              </span>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3">
              {formData.isActive ? (
                <ToggleRight className="w-6 h-6 text-green-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-400" />
              )}
              <div>
                <p className="font-medium text-neutral-900">
                  {formData.isActive ? 'Aktif' : 'Pasif'}
                </p>
                <p className="text-sm text-neutral-600">
                  {formData.isActive 
                    ? 'Kategori aktif ve kullanılabilir' 
                    : 'Kategori pasif ve gizli'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChange('isActive', !formData.isActive)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-green-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {category ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
