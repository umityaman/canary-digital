import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, X } from 'lucide-react';
import PhotoUpload from '../PhotoUpload';
import type { CreateInspectionDto } from '../../types/inspection';

interface Step3Props {
  data: Partial<CreateInspectionDto>;
  onChange: (data: Partial<CreateInspectionDto>) => void;
}

interface DamageReport {
  id: string;
  damageType: string;
  severity: string;
  description: string;
  location: string;
  estimatedCost: number;
  responsibleParty: string;
}

export default function Step3PhotosDamage({ data, onChange }: Step3Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [damages, setDamages] = useState<DamageReport[]>([]);
  const [currentDamage, setCurrentDamage] = useState<DamageReport>({
    id: '',
    damageType: 'SCRATCH',
    severity: 'MINOR',
    description: '',
    location: '',
    estimatedCost: 0,
    responsibleParty: 'CUSTOMER'
  });

  // Sync photos and damages to parent component
  useEffect(() => {
    onChange({
      ...data,
      photos,
      damages: damages as any
    } as any);
  }, [photos, damages]);

  const handlePhotoUpload = (files: File[]) => {
    // Dosyaları base64'e çevir
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newPhotos => {
      setPhotos([...photos, ...newPhotos]);
    });
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAddDamage = () => {
    if (!currentDamage.description) {
      alert('Lütfen hasar açıklaması girin');
      return;
    }

    const newDamage = {
      ...currentDamage,
      id: Date.now().toString()
    };

    setDamages([...damages, newDamage]);
    setCurrentDamage({
      id: '',
      damageType: 'SCRATCH',
      severity: 'MINOR',
      description: '',
      location: '',
      estimatedCost: 0,
      responsibleParty: 'CUSTOMER'
    });
    setShowDamageForm(false);
  };

  const handleRemoveDamage = (id: string) => {
    setDamages(damages.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Fotoğraflar & Hasar Raporu</h2>
        <p className="text-sm text-neutral-600">
          Ekipmanın fotoğraflarını ekleyin ve varsa hasar durumlarını kaydedin
        </p>
      </div>

      {/* Photo Upload - New Component */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          <Camera className="inline mr-1" size={16} />
          Ekipman Fotoğrafları
        </label>
        
        <PhotoUpload
          photos={photos}
          onUpload={handlePhotoUpload}
          onRemove={handlePhotoRemove}
          maxFiles={10}
          maxSizeMB={5}
        />
      </div>

      {/* Damage Report Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">Hasar Durumu</h3>
            <p className="text-sm text-yellow-800">
              Ekipmanda herhangi bir hasar var mı?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowDamageForm(false)}
            className={`p-3 border-2 rounded-lg transition-all ${
              !showDamageForm
                ? 'border-green-600 bg-green-50 text-green-900'
                : 'border-neutral-200 bg-white text-neutral-700'
            }`}
          >
            <p className="font-semibold">✓ Hasarsız</p>
          </button>
          <button
            type="button"
            onClick={() => setShowDamageForm(true)}
            className={`p-3 border-2 rounded-lg transition-all ${
              showDamageForm
                ? 'border-red-600 bg-red-50 text-red-900'
                : 'border-neutral-200 bg-white text-neutral-700'
            }`}
          >
            <p className="font-semibold">✗ Hasar Var</p>
          </button>
        </div>
      </div>

      {/* Damage Form */}
      {showDamageForm && (
        <div className="bg-white border border-red-200 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-red-900">Hasar Detayları</h3>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Hasar Tipi
            </label>
            <select 
              value={currentDamage.damageType}
              onChange={(e) => setCurrentDamage({...currentDamage, damageType: e.target.value})}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="SCRATCH">Çizik</option>
              <option value="DENT">Ezik/Çökük</option>
              <option value="BROKEN">Kırık</option>
              <option value="MISSING_PART">Eksik Parça</option>
              <option value="MALFUNCTION">Arıza</option>
              <option value="COSMETIC">Kozmetik</option>
              <option value="FUNCTIONAL">Fonksiyonel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Şiddet Derecesi
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'].map((severity) => (
                <button
                  key={severity}
                  type="button"
                  onClick={() => setCurrentDamage({...currentDamage, severity})}
                  className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    currentDamage.severity === severity
                      ? severity === 'MINOR' ? 'border-yellow-500 bg-yellow-50 text-yellow-900'
                      : severity === 'MODERATE' ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : severity === 'MAJOR' ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-red-700 bg-red-100 text-red-900'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {severity === 'MINOR' ? 'Hafif' 
                    : severity === 'MODERATE' ? 'Orta'
                    : severity === 'MAJOR' ? 'Ciddi'
                    : 'Kritik'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Konum/Bölge
            </label>
            <input
              type="text"
              value={currentDamage.location}
              onChange={(e) => setCurrentDamage({...currentDamage, location: e.target.value})}
              placeholder="Ör: Ön lens, gövde sağ üst köşe"
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={currentDamage.description}
              onChange={(e) => setCurrentDamage({...currentDamage, description: e.target.value})}
              placeholder="Hasarın detaylı açıklaması..."
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tahmini Maliyet (₺)
              </label>
              <input
                type="number"
                value={currentDamage.estimatedCost}
                onChange={(e) => setCurrentDamage({...currentDamage, estimatedCost: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Sorumlu Taraf
              </label>
              <select 
                value={currentDamage.responsibleParty}
                onChange={(e) => setCurrentDamage({...currentDamage, responsibleParty: e.target.value})}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="CUSTOMER">Müşteri</option>
                <option value="COMPANY">Firma</option>
                <option value="THIRD_PARTY">3. Taraf</option>
                <option value="UNKNOWN">Bilinmiyor</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddDamage}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Hasar Ekle
            </button>
            <button
              type="button"
              onClick={() => setShowDamageForm(false)}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Damage List */}
      {damages.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-neutral-900">Kayıtlı Hasarlar ({damages.length})</h3>
          {damages.map((damage) => (
            <div key={damage.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      damage.severity === 'MINOR' ? 'bg-yellow-200 text-yellow-900'
                      : damage.severity === 'MODERATE' ? 'bg-orange-200 text-orange-900'
                      : damage.severity === 'MAJOR' ? 'bg-red-200 text-red-900'
                      : 'bg-red-300 text-red-950'
                    }`}>
                      {damage.severity === 'MINOR' ? 'Hafif'
                        : damage.severity === 'MODERATE' ? 'Orta'
                        : damage.severity === 'MAJOR' ? 'Ciddi'
                        : 'Kritik'}
                    </span>
                    <span className="text-sm font-medium text-red-900">
                      {damage.damageType === 'SCRATCH' ? 'Çizik'
                        : damage.damageType === 'DENT' ? 'Ezik'
                        : damage.damageType === 'BROKEN' ? 'Kırık'
                        : damage.damageType === 'MISSING_PART' ? 'Eksik Parça'
                        : damage.damageType === 'MALFUNCTION' ? 'Arıza'
                        : damage.damageType === 'COSMETIC' ? 'Kozmetik'
                        : 'Fonksiyonel'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 mb-1">{damage.description}</p>
                  {damage.location && (
                    <p className="text-xs text-neutral-600">📍 {damage.location}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                    {damage.estimatedCost > 0 && (
                      <span>💰 ₺{damage.estimatedCost.toLocaleString()}</span>
                    )}
                    <span>
                      👤 {damage.responsibleParty === 'CUSTOMER' ? 'Müşteri'
                        : damage.responsibleParty === 'COMPANY' ? 'Firma'
                        : damage.responsibleParty === 'THIRD_PARTY' ? '3. Taraf'
                        : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDamage(damage.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Hasarı Sil"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-neutral-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 İpucu:</strong> Fotoğraflar PDF raporuna eklenecektir. Hasarlı bölgelerin net fotoğraflarını çekin.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-900">{photos.length}</p>
            <p className="text-sm text-neutral-600">Fotoğraf</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-900">{damages.length}</p>
            <p className="text-sm text-neutral-600">Hasar</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900">
              ₺{damages.reduce((sum, d) => sum + d.estimatedCost, 0).toLocaleString()}
            </p>
            <p className="text-sm text-neutral-600">Tahmini Maliyet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
