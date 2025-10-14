import React, { useState } from 'react';
import PricingRuleManager from '../components/pricing/PricingRuleManager';
import DiscountCodeManager from '../components/pricing/DiscountCodeManager';
import BundleBuilder from '../components/pricing/BundleBuilder';

type TabType = 'rules' | 'discounts' | 'bundles';

const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('rules');

  const tabs = [
    { id: 'rules' as TabType, name: 'Fiyatlandırma Kuralları', icon: '📊' },
    { id: 'discounts' as TabType, name: 'İndirim Kodları', icon: '🎟️' },
    { id: 'bundles' as TabType, name: 'Ekipman Paketleri', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900">Akıllı Fiyatlandırma</h1>
          <p className="text-neutral-600 mt-1">
            Dinamik fiyat kuralları, indirim kodları ve ekipman paketleri oluşturun
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'rules' && <PricingRuleManager />}
        {activeTab === 'discounts' && <DiscountCodeManager />}
        {activeTab === 'bundles' && <BundleBuilder />}
      </div>
    </div>
  );
};

export default Pricing;
