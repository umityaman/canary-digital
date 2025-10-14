import { useState } from 'react';
import { CheckCircle, Plus, Trash2 } from 'lucide-react';
import type { CreateInspectionDto, ChecklistItem } from '../../types/inspection';

interface Step2Props {
  data: Partial<CreateInspectionDto>;
  onChange: (data: Partial<CreateInspectionDto>) => void;
}

const defaultChecklist: ChecklistItem[] = [
  { id: '1', category: 'Fiziksel Durum', label: 'Gövde ve kasa hasarı var mı?', checked: false, required: true, notes: '' },
  { id: '2', category: 'Fiziksel Durum', label: 'Objektif ve lens temiz mi?', checked: false, required: true, notes: '' },
  { id: '3', category: 'Fiziksel Durum', label: 'LCD ekran çalışıyor mu?', checked: false, required: true, notes: '' },
  { id: '4', category: 'Fiziksel Durum', label: 'Tüm düğmeler çalışıyor mu?', checked: false, required: true, notes: '' },
  { id: '5', category: 'Aksesuar Kontrolü', label: 'Batarya mevcut mu?', checked: false, required: true, notes: '' },
  { id: '6', category: 'Aksesuar Kontrolü', label: 'Şarj cihazı mevcut mu?', checked: false, required: true, notes: '' },
  { id: '7', category: 'Aksesuar Kontrolü', label: 'Hafıza kartı mevcut mu?', checked: false, required: false, notes: '' },
  { id: '8', category: 'Aksesuar Kontrolü', label: 'Taşıma çantası temiz mi?', checked: false, required: false, notes: '' },
  { id: '9', category: 'Fonksiyonel Test', label: 'Kamera açılıyor mu?', checked: false, required: true, notes: '' },
  { id: '10', category: 'Fonksiyonel Test', label: 'Video kaydı çalışıyor mu?', checked: false, required: true, notes: '' },
  { id: '11', category: 'Fonksiyonel Test', label: 'Fotoğraf çekimi çalışıyor mu?', checked: false, required: true, notes: '' },
  { id: '12', category: 'Fonksiyonel Test', label: 'Zoom ve focus çalışıyor mu?', checked: false, required: true, notes: '' },
];

export default function Step2Checklist({ data, onChange }: Step2Props) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (data.checklistData && Array.isArray(data.checklistData)) {
      return data.checklistData;
    }
    return defaultChecklist;
  });

  const [newItem, setNewItem] = useState({ category: '', label: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCheckChange = (id: string, checked: boolean) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, checked } : item
    );
    setChecklist(updated);
    onChange({ checklistData: updated });
  };

  const handleNotesChange = (id: string, notes: string) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, notes } : item
    );
    setChecklist(updated);
    onChange({ checklistData: updated });
  };

  const handleAddItem = () => {
    if (!newItem.category || !newItem.label) {
      alert('Lütfen kategori ve madde bilgilerini girin');
      return;
    }

    const newChecklistItem: ChecklistItem = {
      id: Date.now().toString(),
      category: newItem.category,
      label: newItem.label,
      checked: false,
      required: false,
      notes: '',
    };

    const updated = [...checklist, newChecklistItem];
    setChecklist(updated);
    onChange({ checklistData: updated });
    
    setNewItem({ category: '', label: '' });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Bu kontrol maddesini silmek istediğinizden emin misiniz?')) {
      const updated = checklist.filter(item => item.id !== id);
      setChecklist(updated);
      onChange({ checklistData: updated });
    }
  };

  const handleConditionChange = (condition: string) => {
    onChange({ overallCondition: condition });
  };

  const categories = Array.from(new Set(checklist.map(item => item.category)));

  const getChecklistStats = () => {
    const total = checklist.length;
    const checked = checklist.filter(item => item.checked).length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { total, checked, percentage };
  };

  const stats = getChecklistStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Kontrol Listesi</h2>
        <p className="text-sm text-neutral-600">
          Ekipmanın durumunu kontrol edin ve notlar ekleyin
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">İlerleme</span>
          <span className="text-sm font-semibold text-blue-600">
            {stats.checked} / {stats.total} ({stats.percentage}%)
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Overall Condition */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Genel Durum Değerlendirmesi
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'EXCELLENT', label: 'Mükemmel', color: 'green' },
            { value: 'GOOD', label: 'İyi', color: 'blue' },
            { value: 'FAIR', label: 'Orta', color: 'yellow' },
            { value: 'POOR', label: 'Kötü', color: 'red' },
          ].map((condition) => (
            <button
              key={condition.value}
              type="button"
              onClick={() => handleConditionChange(condition.value)}
              className={`p-3 border-2 rounded-xl transition-all ${
                data.overallCondition === condition.value
                  ? `border-${condition.color}-600 bg-${condition.color}-50`
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <p className="font-semibold text-neutral-900">{condition.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Items by Category */}
      {categories.map((category) => (
        <div key={category} className="bg-neutral-50 rounded-xl p-4">
          <h3 className="font-semibold text-neutral-900 mb-3">{category}</h3>
          <div className="space-y-3">
            {checklist
              .filter(item => item.category === category)
              .map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleCheckChange(item.id, !item.checked)}
                      className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-green-600 border-green-600'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {item.checked && <CheckCircle size={16} className="text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        item.checked ? 'text-neutral-600 line-through' : 'text-neutral-900'
                      }`}>
                        {item.label}
                      </p>
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        placeholder="Not ekle..."
                        rows={2}
                        className="mt-2 w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Add New Item */}
      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <Plus size={20} />
            Yeni Kontrol Maddesi Ekle
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="Kategori (ör: Fiziksel Durum)"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="Kontrol maddesi"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ category: '', label: '' });
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 İpucu:</strong> Her maddeyi kontrol ettikten sonra işaretleyin. Özel durumlar varsa not alanına yazın.
        </p>
      </div>
    </div>
  );
}
