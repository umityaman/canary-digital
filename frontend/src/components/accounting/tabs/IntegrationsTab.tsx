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
      <div>
        <h2 className={`${DESIGN_TOKENS.typography.h2} ${DESIGN_TOKENS.colors.text.primary}`}>
          Entegrasyonlar
        </h2>
        <p className={`${DESIGN_TOKENS.typography.body.md} ${DESIGN_TOKENS.colors.text.secondary} mt-1`}>
          Banka, e-ticaret ve GİB entegrasyonlarını yönetin
        </p>
      </div>

      {/* Integration Type Selector */}
      <div className={card('md', 'none', 'default', 'lg')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {/* Bank Integrations */}
          <button
            onClick={() => setActiveIntegration('bank')}
            className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all text-left ${
              activeIntegration === 'bank'
                ? 'border-blue-500 bg-blue-50'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              activeIntegration === 'bank' ? 'bg-blue-500' : 'bg-neutral-200'
            }`}>
              <Building2 className={activeIntegration === 'bank' ? 'text-white' : 'text-neutral-600'} size={24} />
            </div>
            <div>
              <h3 className={`font-semibold ${activeIntegration === 'bank' ? 'text-blue-900' : 'text-neutral-900'}`}>
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
            className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all text-left ${
              activeIntegration === 'ecommerce'
                ? 'border-green-500 bg-green-50'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              activeIntegration === 'ecommerce' ? 'bg-green-500' : 'bg-neutral-200'
            }`}>
              <Store className={activeIntegration === 'ecommerce' ? 'text-white' : 'text-neutral-600'} size={24} />
            </div>
            <div>
              <h3 className={`font-semibold ${activeIntegration === 'ecommerce' ? 'text-green-900' : 'text-neutral-900'}`}>
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
            className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all text-left ${
              activeIntegration === 'gib'
                ? 'border-purple-500 bg-purple-50'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              activeIntegration === 'gib' ? 'bg-purple-500' : 'bg-neutral-200'
            }`}>
              <Globe className={activeIntegration === 'gib' ? 'text-white' : 'text-neutral-600'} size={24} />
            </div>
            <div>
              <h3 className={`font-semibold ${activeIntegration === 'gib' ? 'text-purple-900' : 'text-neutral-900'}`}>
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
      <div>
        {activeIntegration === 'bank' && <BankIntegrations />}
        {activeIntegration === 'ecommerce' && <ECommerceIntegrations />}
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
