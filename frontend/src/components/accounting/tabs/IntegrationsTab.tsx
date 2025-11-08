import { useState } from 'react'
import { Building2, Store, Globe, Link2 } from 'lucide-react'
import BankIntegrations from '../../banking/BankIntegrations'
import ECommerceIntegrations from '../../ecommerce/ECommerceIntegrations'
import { card, DESIGN_TOKENS } from '../../../styles/design-tokens'

export default function IntegrationsTab() {
  const [activeIntegration, setActiveIntegration] = useState<'bank' | 'ecommerce' | 'gib'>('bank')

  console.log('IntegrationsTab rendered, activeIntegration:', activeIntegration)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary} mb-2`}>
          Entegrasyonlar
        </h2>
        <p className={`${DESIGN_TOKENS.typography.body.lg} ${DESIGN_TOKENS.colors.text.secondary}`}>
          Banka, e-ticaret ve GİB entegrasyonlarını yönetin
        </p>
      </div>

      {/* Integration Type Selector - More Prominent */}
      <div className={card('lg', 'lg', 'default', 'lg')}>
        <div className="mb-4">
          <h3 className={`${DESIGN_TOKENS.typography.h3} ${DESIGN_TOKENS.colors.text.primary}`}>
            Entegrasyon Tipi Seçin
          </h3>
          <p className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.secondary} mt-1`}>
            Yönetmek istediğiniz entegrasyon tipini seçin
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bank Integrations */}
          <button
            onClick={() => setActiveIntegration('bank')}
            className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
              activeIntegration === 'bank'
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-neutral-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
              activeIntegration === 'bank' ? 'bg-blue-500 shadow-xl' : 'bg-neutral-200'
            }`}>
              <Building2 className={activeIntegration === 'bank' ? 'text-white' : 'text-neutral-600'} size={32} />
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-lg mb-1 ${activeIntegration === 'bank' ? 'text-blue-900' : 'text-neutral-900'}`}>
                Banka Entegrasyonları
              </h3>
              <p className="text-sm text-neutral-600">
                Hesap hareketleri & mutabakat
              </p>
            </div>
          </button>

          {/* E-Commerce Integrations */}
          <button
            onClick={() => setActiveIntegration('ecommerce')}
            className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
              activeIntegration === 'ecommerce'
                ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                : 'border-neutral-200 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
              activeIntegration === 'ecommerce' ? 'bg-green-500 shadow-xl' : 'bg-neutral-200'
            }`}>
              <Store className={activeIntegration === 'ecommerce' ? 'text-white' : 'text-neutral-600'} size={32} />
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-lg mb-1 ${activeIntegration === 'ecommerce' ? 'text-green-900' : 'text-neutral-900'}`}>
                E-Ticaret Entegrasyonları
              </h3>
              <p className="text-sm text-neutral-600">
                Pazaryeri & mağaza yönetimi
              </p>
            </div>
          </button>

          {/* GIB Integration */}
          <button
            onClick={() => setActiveIntegration('gib')}
            className={`flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all hover:shadow-lg ${
              activeIntegration === 'gib'
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                : 'border-neutral-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
              activeIntegration === 'gib' ? 'bg-purple-500 shadow-xl' : 'bg-neutral-200'
            }`}>
              <Globe className={activeIntegration === 'gib' ? 'text-white' : 'text-neutral-600'} size={32} />
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-lg mb-1 ${activeIntegration === 'gib' ? 'text-purple-900' : 'text-neutral-900'}`}>
                GİB Entegrasyonu
              </h3>
              <p className="text-sm text-neutral-600">
                e-Fatura & e-Arşiv sistemi
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Integration Content */}
      <div className="mt-8">
        <div className="bg-white p-8 rounded-xl border border-neutral-200">
          <p className="text-lg font-semibold text-neutral-900 mb-4">
            Seçili Entegrasyon: {activeIntegration === 'bank' ? 'Banka' : activeIntegration === 'ecommerce' ? 'E-Ticaret' : 'GİB'}
          </p>
          
          {activeIntegration === 'bank' && (
            <div className="[&>div>div:first-child]:hidden">
              <BankIntegrations />
            </div>
          )}
          {activeIntegration === 'ecommerce' && (
            <div className="[&>div>div:first-child]:hidden">
              <ECommerceIntegrations />
            </div>
          )}
          {activeIntegration === 'gib' && (
            <div className="space-y-6">
              {/* Header */}
              <div className={card('lg', 'lg', 'default', 'xl')}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="text-purple-600" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`${DESIGN_TOKENS.typography.h3} ${DESIGN_TOKENS.colors.text.primary} mb-2`}>
                      Gelir İdaresi Başkanlığı (GİB) Entegrasyonu
                    </h3>
                    <p className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.secondary}`}>
                      e-Fatura, e-Arşiv Fatura ve e-İrsaliye sistemlerine otomatik entegrasyon sağlayarak,
                      yasal belgelerinizi kolayca oluşturun ve GİB'e iletin.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* e-Fatura */}
                <div className={card('md', 'lg', 'default', 'xl')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Link2 className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">e-Fatura</h4>
                      <span className="text-xs text-orange-600 font-medium">Yakında</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Otomatik fatura oluşturma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>GİB'e anlık iletim</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Fatura sorgulama ve takip</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>e-İmza entegrasyonu</span>
                    </li>
                  </ul>
                </div>

                {/* e-Arşiv */}
                <div className={card('md', 'lg', 'default', 'xl')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Link2 className="text-green-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">e-Arşiv Fatura</h4>
                      <span className="text-xs text-orange-600 font-medium">Yakında</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Bireysel müşteri faturaları</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>PDF ve HTML oluşturma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>SMS ve e-posta gönderimi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>İptal ve düzeltme</span>
                    </li>
                  </ul>
                </div>

                {/* e-İrsaliye */}
                <div className={card('md', 'lg', 'default', 'xl')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Link2 className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">e-İrsaliye</h4>
                      <span className="text-xs text-orange-600 font-medium">Yakında</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Sevkiyat irsaliyesi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>GİB onayı ve izleme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Stok entegrasyonu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Fatura dönüşümü</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Benefits */}
              <div className={card('md', 'lg', 'default', 'xl')}>
                <h4 className="font-semibold text-gray-900 mb-4">Avantajlar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">⚡</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">Hız ve Verimlilik</h5>
                      <p className="text-xs text-gray-600">Fatura oluşturma sürenizi %90 azaltın</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">Yasal Uyumluluk</h5>
                      <p className="text-xs text-gray-600">GİB standartlarına %100 uygun</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">🔒</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">Güvenli İmzalama</h5>
                      <p className="text-xs text-gray-600">e-İmza entegrasyonu ile güvenli</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold">💰</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">Maliyet Tasarrufu</h5>
                      <p className="text-xs text-gray-600">Kağıt ve posta giderlerinden kurtulun</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Notice */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-2xl">🚀</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Geliştirme Aşamasında</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      GİB entegrasyonu şu anda geliştirme aşamasındadır. Yakında kullanıma sunulacaktır.
                      Bilgilendirilmek için e-posta adresinizi bırakabilirsiniz.
                    </p>
                    <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                      Beni Bilgilendir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
