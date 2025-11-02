import { useState, useEffect } from 'react';
import { Edit2, Trash2, Tag, TrendingUp, TrendingDown, Save, X, Plus, Filter } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
}

interface AccountingTag {
  id: number;
  name: string;
  color: string;
  companyId: number;
  createdAt: string;
}

export default function CategoryTagManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<AccountingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  
  // Tag states
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [tagFormData, setTagFormData] = useState({ name: '', color: '#3B82F6' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, tagsRes] = await Promise.all([
        apiClient.get('/accounting/categories'),
        apiClient.get('/accounting/tags'),
      ]);

      setCategories(categoriesRes.data.data || []);
      setTags(tagsRes.data || []);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Category operations
  const handleRenameCategory = async (category: Category) => {
    if (!editCategoryValue.trim()) {
      toast.error('Kategori adı boş olamaz');
      return;
    }

    try {
      await apiClient.post('/accounting/categories/rename', {
        type: category.type,
        oldName: category.name,
        newName: editCategoryValue.trim(),
      });

      toast.success('Kategori güncellendi');
      setEditingCategoryId(null);
      setEditCategoryValue('');
      loadData();
    } catch (error: any) {
      console.error('Failed to rename category:', error);
      toast.error('Kategori güncellenemedi');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (
      !confirm(
        `"${category.name}" kategorisini silmek istediğinize emin misiniz? Bu kategorideki tüm kayıtlar "Diğer" kategorisine taşınacak.`
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/accounting/categories/${category.type}/${encodeURIComponent(category.name)}`);

      toast.success('Kategori silindi');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error('Kategori silinemedi');
    }
  };

  // Tag operations
  const handleSaveTag = async () => {
    if (!tagFormData.name.trim()) {
      toast.error('Etiket adı boş olamaz');
      return;
    }

    try {
      if (editingTagId) {
        await apiClient.put(`/accounting/tags/${editingTagId}`, tagFormData);
        toast.success('Etiket güncellendi');
      } else {
        await apiClient.post('/accounting/tags', tagFormData);
        toast.success('Etiket oluşturuldu');
      }

      setShowTagForm(false);
      setEditingTagId(null);
      setTagFormData({ name: '', color: '#3B82F6' });
      loadData();
    } catch (error: any) {
      console.error('Failed to save tag:', error);
      toast.error('Etiket kaydedilemedi');
    }
  };

  const handleEditTag = (tag: AccountingTag) => {
    setEditingTagId(tag.id);
    setTagFormData({ name: tag.name, color: tag.color });
    setShowTagForm(true);
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('Bu etiketi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await apiClient.delete(`/accounting/tags/${tagId}`);
      toast.success('Etiket silindi');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete tag:', error);
      toast.error('Etiket silinemedi');
    }
  };

  const filteredCategories = categories.filter(
    (cat) => categoryFilter === 'all' || cat.type === categoryFilter
  );

  const incomeCount = categories.filter((c) => c.type === 'income').length;
  const expenseCount = categories.filter((c) => c.type === 'expense').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kategori ve Etiket Yönetimi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gelir/gider kategorilerini ve etiketleri yönetin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-gray-600" />
                Kategoriler
              </h3>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{incomeCount}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Gelir Kategorisi</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{expenseCount}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Gider Kategorisi</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü ({categories.length})
              </button>
              <button
                onClick={() => setCategoryFilter('income')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Gelir ({incomeCount})
              </button>
              <button
                onClick={() => setCategoryFilter('expense')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Gider ({expenseCount})
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCategories.map((category) => (
                <div
                  key={`${category.type}-${category.name}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {editingCategoryId === `${category.type}-${category.name}` ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameCategory(category);
                          if (e.key === 'Escape') {
                            setEditingCategoryId(null);
                            setEditCategoryValue('');
                          }
                        }}
                      />
                      <button
                        onClick={() => handleRenameCategory(category)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategoryId(null);
                          setEditCategoryValue('');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        {category.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            category.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.type === 'income' ? 'Gelir' : 'Gider'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategoryId(`${category.type}-${category.name}`);
                            setEditCategoryValue(category.name);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Kategori bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-gray-600" />
                Etiketler
              </h3>
              <button
                onClick={() => {
                  setShowTagForm(true);
                  setEditingTagId(null);
                  setTagFormData({ name: '', color: '#3B82F6' });
                }}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Yeni Etiket
              </button>
            </div>

            {/* Tag Form */}
            {showTagForm && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  {editingTagId ? 'Etiket Düzenle' : 'Yeni Etiket'}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiket Adı
                    </label>
                    <input
                      type="text"
                      value={tagFormData.name}
                      onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Örn: Acil, Önemli, İncelenmeli"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tagFormData.color}
                        onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={tagFormData.color}
                        onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTag}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingTagId ? 'Güncelle' : 'Kaydet'}
                    </button>
                    <button
                      onClick={() => {
                        setShowTagForm(false);
                        setEditingTagId(null);
                        setTagFormData({ name: '', color: '#3B82F6' });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tags List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border-2"
                      style={{ backgroundColor: tag.color, borderColor: tag.color }}
                    />
                    <span className="font-medium text-gray-900">{tag.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Düzenle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {tags.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Henüz etiket yok</p>
                  <p className="text-sm mt-1">Yeni bir etiket oluşturun</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
