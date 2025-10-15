import { Plus } from 'lucide-react'

export default function Meetings(){
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-2xl hover:bg-neutral-800 transition-colors">
          <Plus size={20} />
          Toplantı Ekle
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4">Yaklaşan Toplantılar</h2>
          <div className="space-y-3">
            <div className="border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
              <h3 className="font-medium text-neutral-900">Haftalık Değerlendirme</h3>
              <p className="text-sm text-neutral-600">Yarın 14:00 - Zoom</p>
              <div className="mt-2">
                <button className="btn-secondary text-xs">Katıl</button>
              </div>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-medium">Müşteri Toplantısı</h3>
              <p className="text-sm text-gray-600">Perşembe 10:00 - Skype</p>
              <div className="mt-2">
                <button className="btn-secondary text-xs">Katıl</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Toplantı Geçmişi</h2>
          <div className="space-y-3">
            <div className="border rounded p-4">
              <h3 className="font-medium">Aylık Planlama</h3>
              <p className="text-sm text-gray-600">Geçen hafta - 1 saat 30 dk</p>
              <span className="text-xs text-green-600">Tamamlandı</span>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-medium">Ekipman Eğitimi</h3>
              <p className="text-sm text-gray-600">2 hafta önce - 45 dk</p>
              <span className="text-xs text-green-600">Tamamlandı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}