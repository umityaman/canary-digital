import { useState } from 'react'
import { Clock, Calculator, DollarSign } from 'lucide-react'

export default function FloatingToolsWidget() {
  const [showClock, setShowClock] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showCurrency, setShowCurrency] = useState(false)
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [amount, setAmount] = useState('100')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('TRY')
  const [convertedAmount, setConvertedAmount] = useState('')

  // Exchange rates (örnek - gerçek API'den alınabilir)
  const exchangeRates: { [key: string]: number } = {
    'USD-TRY': 32.50,
    'EUR-TRY': 35.20,
    'GBP-TRY': 41.80,
    'TRY-USD': 0.031,
    'TRY-EUR': 0.028,
    'EUR-USD': 1.08,
    'USD-EUR': 0.92,
  }

  const handleCalcClick = (value: string) => {
    if (value === 'C') {
      setCalcDisplay('0')
    } else if (value === '=') {
      try {
        setCalcDisplay(eval(calcDisplay).toString())
      } catch {
        setCalcDisplay('Error')
      }
    } else {
      setCalcDisplay(calcDisplay === '0' ? value : calcDisplay + value)
    }
  }

  const convertCurrency = () => {
    const key = `${fromCurrency}-${toCurrency}`
    const rate = exchangeRates[key] || 1
    const result = (parseFloat(amount) * rate).toFixed(2)
    setConvertedAmount(result)
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const [currentTime, setCurrentTime] = useState(getCurrentTime())

  // Update clock every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)
    return () => clearInterval(interval)
  })

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
      {/* Clock Button & Panel */}
      <div className="relative">
        <button
          onClick={() => {
            setShowClock(!showClock)
            setShowCalculator(false)
            setShowCurrency(false)
          }}
          className="bg-neutral-900 text-white p-3 rounded-full shadow-lg hover:bg-neutral-800 transition-all duration-300 group"
          aria-label="Saat"
        >
          <Clock size={20} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Saat
          </span>
        </button>

        {showClock && (
          <div className="absolute right-full mr-4 top-0 bg-white rounded-lg shadow-2xl p-6 w-64 animate-slideIn">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Clock size={18} />
              Anlık Saat
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-neutral-900 mb-2">
                {currentTime.split(':').slice(0, 2).join(':')}
              </div>
              <div className="text-2xl text-neutral-600">
                {currentTime.split(':')[2]}
              </div>
              <div className="text-sm text-neutral-500 mt-4">
                {new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculator Button & Panel */}
      <div className="relative">
        <button
          onClick={() => {
            setShowCalculator(!showCalculator)
            setShowClock(false)
            setShowCurrency(false)
          }}
          className="bg-neutral-900 text-white p-3 rounded-full shadow-lg hover:bg-neutral-800 transition-all duration-300 group"
          aria-label="Hesap Makinesi"
        >
          <Calculator size={20} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Hesap Makinesi
          </span>
        </button>

        {showCalculator && (
          <div className="absolute right-full mr-4 top-0 bg-white rounded-lg shadow-2xl p-4 w-64 animate-slideIn">
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Calculator size={18} />
              Hesap Makinesi
            </h3>
            
            {/* Display */}
            <div className="bg-neutral-100 rounded-lg p-4 mb-3 text-right">
              <div className="text-2xl font-bold text-neutral-900 break-all">
                {calcDisplay}
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-semibold py-3 rounded-lg transition-colors"
                >
                  {btn}
                </button>
              ))}
              <button
                onClick={() => handleCalcClick('C')}
                className="col-span-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Currency Converter Button & Panel */}
      <div className="relative">
        <button
          onClick={() => {
            setShowCurrency(!showCurrency)
            setShowClock(false)
            setShowCalculator(false)
          }}
          className="bg-neutral-900 text-white p-3 rounded-full shadow-lg hover:bg-neutral-800 transition-all duration-300 group"
          aria-label="Döviz Çevirici"
        >
          <DollarSign size={20} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Döviz Çevirici
          </span>
        </button>

        {showCurrency && (
          <div className="absolute right-full mr-4 top-0 bg-white rounded-lg shadow-2xl p-4 w-72 animate-slideIn">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              Döviz Çevirici
            </h3>

            <div className="space-y-3">
              {/* Amount Input */}
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">Miktar</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* From Currency */}
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">Kaynak Para</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="USD">USD - Amerikan Doları</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - İngiliz Sterlini</option>
                  <option value="TRY">TRY - Türk Lirası</option>
                </select>
              </div>

              {/* To Currency */}
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">Hedef Para</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="TRY">TRY - Türk Lirası</option>
                  <option value="USD">USD - Amerikan Doları</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - İngiliz Sterlini</option>
                </select>
              </div>

              {/* Convert Button */}
              <button
                onClick={convertCurrency}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Çevir
              </button>

              {/* Result */}
              {convertedAmount && (
                <div className="bg-neutral-100 rounded-lg p-3 text-center">
                  <div className="text-sm text-neutral-600 mb-1">Sonuç</div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {convertedAmount} {toCurrency}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
