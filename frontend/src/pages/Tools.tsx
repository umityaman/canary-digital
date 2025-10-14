import React from 'react'
import { Wrench, QrCode, Tag, Calculator, FileText, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Tools(){
  const navigate = useNavigate()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Araçlar</h1>
        <p className="text-neutral-600 mt-1">Yardımcı araçlar ve modüller</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/pricing')}
          className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-md transition-all cursor-pointer"
        >
          <DollarSign size={32} className="mx-auto text-neutral-700 mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-2">Akıllı Fiyatlandırma</h3>
          <p className="text-sm text-neutral-600 mb-4">Dinamik fiyat önerileri ve analiz</p>
          <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Aç</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-sm transition-shadow">
          <QrCode size={32} className="mx-auto text-neutral-700 mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-2">QR Kod Oluşturucu</h3>
          <p className="text-sm text-neutral-600 mb-4">Ekipmanlar için QR kod oluşturun</p>
          <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Oluştur</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-sm transition-shadow">
          <Tag size={32} className="mx-auto text-neutral-700 mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-2">Etiket Yazıcı</h3>
          <p className="text-sm text-neutral-600 mb-4">Ekipman etiketleri yazdırın</p>
          <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Yazdır</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-sm transition-shadow">
          <FileText size={32} className="mx-auto text-neutral-700 mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-2">Rapor Oluşturucu</h3>
          <p className="text-sm text-neutral-600 mb-4">Özel raporlar oluşturun</p>
          <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">Oluştur</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-sm transition-shadow">
          <Calculator size={32} className="mx-auto text-neutral-700 mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-2">Backup Yöneticisi</h3>
          <p className="text-sm text-neutral-600 mb-4">Veri yedekleme işlemleri</p>
          <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-xl hover:bg-neutral-300 transition-colors">Yönet</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-sm transition-shadow">
          <Wrench size={32} className="mx-auto text-neutral-700 mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-2">Sistem Ayarları</h3>
          <p className="text-sm text-neutral-600 mb-4">Genel sistem ayarları</p>
          <button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-xl hover:bg-neutral-300 transition-colors">Ayarla</button>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center hover:shadow-sm transition-shadow">
          <QrCode size={32} className="mx-auto text-neutral-700 mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-2">Entegrasyonlar</h3>
          <p className="text-sm text-neutral-600 mb-4">Harici servis entegrasyonları</p>
          <button className="btn-secondary">Görüntüle</button>
        </div>
      </div>
    </div>
  )
}