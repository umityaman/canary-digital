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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-neutral-200">
        <div className="flex border-b border-neutral-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-neutral-50 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'rules' && <PricingRuleManager />}
          {activeTab === 'discounts' && <DiscountCodeManager />}
          {activeTab === 'bundles' && <BundleBuilder />}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
