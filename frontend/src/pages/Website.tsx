import { BarChart, Edit } from 'lucide-react'

export default function Website(){
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4 flex items-center gap-2">
            <BarChart size={24} />
            Site İstatistikleri
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-neutral-900">
              <span>Bu Ay Ziyaretçi:</span>
              <span className="font-semibold">1,234</span>
            </div>
            <div className="flex justify-between text-neutral-900">
              <span>Sayfa Görüntüleme:</span>
              <span className="font-semibold">3,456</span>
            </div>
            <div className="flex justify-between text-neutral-900">
              <span>Ortalama Süre:</span>
              <span className="font-semibold">2:30</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4 flex items-center gap-2">
            <Edit size={24} />
            Site Yönetimi
          </h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">İçerik Düzenle</button>
            <button className="w-full px-4 py-2 bg-neutral-200 text-neutral-900 rounded-xl hover:bg-neutral-300 transition-colors">SEO Ayarları</button>
            <button className="w-full px-4 py-2 bg-neutral-200 text-neutral-900 rounded-xl hover:bg-neutral-300 transition-colors">Backup Al</button>
          </div>
        </div>
      </div>
    </div>
  )
}