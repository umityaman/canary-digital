import React, { useState } from 'react';
import Layout from '../components/Layout';
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
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">💰 Akıllı Fiyatlandırma</h1>
            <p className="text-blue-100">
              Dinamik fiyat kuralları, indirim kodları ve ekipman paketleri oluşturun
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b shadow-sm sticky top-16 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
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
        <div className="max-w-7xl mx-auto">
          {activeTab === 'rules' && <PricingRuleManager />}
          {activeTab === 'discounts' && <DiscountCodeManager />}
          {activeTab === 'bundles' && <BundleBuilder />}
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
