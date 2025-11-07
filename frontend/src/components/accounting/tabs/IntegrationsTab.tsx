import { useState } from 'react'
import { Building2, Store, Globe, Link2 } from 'lucide-react'
import BankIntegrations from '../../banking/BankIntegrations'
import ECommerceIntegrations from '../../ecommerce/ECommerceIntegrations'
import { card, DESIGN_TOKENS } from '../../../styles/design-tokens'

export default function IntegrationsTab() {
  const [activeIntegration, setActiveIntegration] = useState<'bank' | 'ecommerce' | 'gib'>('bank')

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
          <div className={card('lg', 'lg', 'default', 'lg')}>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-purple-600" size={32} />
              </div>
              <h3 className={`${DESIGN_TOKENS.typography.h3} ${DESIGN_TOKENS.colors.text.primary} mb-2`}>
                GİB Entegrasyonu
              </h3>
              <p className={`${DESIGN_TOKENS.typography.body.lg} ${DESIGN_TOKENS.colors.text.secondary} mb-6`}>
                e-Fatura ve e-Arşiv fatura entegrasyonu yakında eklenecek
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Link2 size={16} />
                  <span>e-Fatura Entegrasyonu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 size={16} />
                  <span>e-Arşiv Fatura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 size={16} />
                  <span>e-İrsaliye</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
