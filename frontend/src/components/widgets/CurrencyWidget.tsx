import React, { useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'

const CurrencyWidget: React.FC = () => {
  const [amount, setAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('TRY')

  // Mock döviz kurları - gerçek projede API'den gelecek
  const rates: Record<string, Record<string, number>> = {
    USD: { TRY: 28.50, EUR: 0.92, GBP: 0.79 },
    EUR: { TRY: 31.20, USD: 1.09, GBP: 0.86 },
    TRY: { USD: 0.035, EUR: 0.032, GBP: 0.027 },
    GBP: { TRY: 36.50, USD: 1.27, EUR: 1.16 }
  }

  const convert = () => {
    const rate = (rates as any)[fromCurrency]?.[toCurrency] || 1
    return (parseFloat(amount) * rate).toFixed(2)
  }

  // Mock piyasa verileri
  const marketData = [
    { name: 'USD/TRY', value: '28.50', change: '+0.15' },
    { name: 'EUR/TRY', value: '31.20', change: '-0.08' },
    { name: 'GBP/TRY', value: '36.50', change: '+0.25' }
  ]

  return (
    <div className="widget">
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign size={20} className="text-primary-500" />
        <h3 className="font-semibold text-gray-800">Döviz Çevirici</h3>
      </div>

      {/* Çevirici */}
      <div className="space-y-3 mb-4">
        <div className="flex space-x-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm"
            placeholder="Miktar"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div className="text-center text-gray-500 text-sm">↓</div>

        <div className="flex space-x-2">
          <div className="flex-1 px-3 py-2 bg-neutral-100 rounded text-sm font-medium">
            {convert()}
          </div>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Piyasa Verileri */}
      <div className="border-t pt-3">
        <div className="flex items-center space-x-1 mb-2">
          <TrendingUp size={16} className="text-green-500" />
          <span className="text-sm font-medium text-neutral-700">Piyasa</span>
        </div>
        <div className="space-y-1">
          {marketData.map(item => (
            <div key={item.name} className="flex justify-between text-xs">
              <span className="text-neutral-600">{item.name}</span>
              <div className="flex space-x-1">
                <span className="font-medium">{item.value}</span>
                <span className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CurrencyWidget