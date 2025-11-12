import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const worldTimes = [
    { city: 'İstanbul', offset: 3 },
    { city: 'London', offset: 0 },
    { city: 'New York', offset: -5 },
    { city: 'Tokyo', offset: 9 }
  ]

  const getTimeForCity = (offset: number) => {
    const utc = time.getTime() + (time.getTimezoneOffset() * 60000)
    const cityTime = new Date(utc + (offset * 3600000))
    return cityTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="widget">
      <div className="flex items-center space-x-2 mb-4">
        <Clock size={20} className="text-primary-500" />
        <h3 className="font-semibold text-gray-800">Saat</h3>
      </div>
      
      {/* Ana Saat */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-gray-800">
          {time.toLocaleTimeString('tr-TR')}
        </div>
        <div className="text-sm text-neutral-600">
          {time.toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </div>
      </div>

      {/* Dünya Saatleri */}
      <div className="space-y-2">
        {worldTimes.map(city => (
          <div key={city.city} className="flex justify-between text-sm">
            <span className="text-neutral-600">{city.city}</span>
            <span className="font-medium">{getTimeForCity(city.offset)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClockWidget