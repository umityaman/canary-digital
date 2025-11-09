import { useState } from 'react'
import { DollarSign, TrendingUp, Target } from 'lucide-react'
import CostCenterHierarchy from '../cost-accounting/CostCenterHierarchy'
import BudgetTracking from '../cost-accounting/BudgetTracking'
import ProfitLossReport from '../cost-accounting/ProfitLossReport'
import { card, button, DESIGN_TOKENS, cx } from '../../styles/design-tokens'

type SubTab = 'cost-centers' | 'budget' | 'profit-loss'

export default function CostAccountingTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('cost-centers')

  const subTabs = [
    { id: 'cost-centers' as const, label: 'Maliyet Merkezleri', icon: <DollarSign size={16} /> },
    { id: 'budget' as const, label: 'Bütçe Takibi', icon: <Target size={16} /> },
    { id: 'profit-loss' as const, label: 'Kâr/Zarar', icon: <TrendingUp size={16} /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`${DESIGN_TOKENS?.typography?.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>Maliyet Muhasebesi</h2>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={cx(
              'flex items-center gap-2',
              button('md', activeSubTab === tab.id ? 'dark' : 'outline', 'md')
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={card('md', 'sm', 'default', 'lg')}>
        {activeSubTab === 'cost-centers' && <CostCenterHierarchy />}
        {activeSubTab === 'budget' && <BudgetTracking />}
        {activeSubTab === 'profit-loss' && <ProfitLossReport />}
      </div>
    </div>
  )
}
