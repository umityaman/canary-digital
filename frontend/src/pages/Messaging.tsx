import React from 'react'
import { MessageSquare, Users } from 'lucide-react'

export default function Messaging(){
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight mb-4">Sohbet Grupları</h2>
          <div className="space-y-2">
            <div className="p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors">
              <h3 className="font-medium text-neutral-900">Genel</h3>
              <p className="text-sm text-neutral-600">5 üye</p>
            </div>
            <div className="p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors">
              <h3 className="font-medium text-neutral-900">Operasyon</h3>
              <p className="text-sm text-gray-600">3 üye</p>
            </div>
            <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium">Müşteri Hizmetleri</h3>
              <p className="text-sm text-gray-600">2 üye</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4">Mesaj Alanı</h2>
          <div className="h-64 border rounded p-4 bg-gray-50">
            <p className="text-gray-600 text-center">Mesajlaşma arayüzü yakında...</p>
          </div>
          <div className="mt-4 flex space-x-2">
            <input 
              type="text" 
              placeholder="Mesajınızı yazın..." 
              className="flex-1 px-3 py-2 border rounded"
            />
            <button className="btn-primary">Gönder</button>
          </div>
        </div>
      </div>
    </div>
  )
}