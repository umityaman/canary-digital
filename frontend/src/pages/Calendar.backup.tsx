import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useOrderStore } from '../stores/orderStore'
import { RippleButton } from '../components/RippleEffect'
import { useToast } from '../components/Toast'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  orders: any[]
}

export default function Calendar() {
  const { orders, fetchOrders } = useOrderStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    generateCalendar()
  }, [currentDate, orders])

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // İlk gün (ayın 1'i)
    const firstDay = new Date(year, month, 1)
    // Son gün
    const lastDay = new Date(year, month + 1, 0)
    
    // Haftanın ilk gününe kadar geri git
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Takvim günlerini oluştur (6 hafta = 42 gün)
    const days: CalendarDay[] = []
    const currentDateObj = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDateObj.getMonth() === month
      
      // Bu güne ait siparişleri bul
      const dayOrders = orders.filter(order => {
        const orderStart = new Date(order.startDate)
        const orderEnd = new Date(order.endDate)
        const checkDate = new Date(currentDateObj)
        
        // Tarihleri karşılaştır (sadece gün, ay, yıl)
        orderStart.setHours(0, 0, 0, 0)
        orderEnd.setHours(0, 0, 0, 0)
        checkDate.setHours(0, 0, 0, 0)
        
        return checkDate >= orderStart && checkDate <= orderEnd
      })
      
      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth,
        orders: dayOrders
      })
      
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }
    
    setCalendarDays(days)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-400'
      case 'CONFIRMED': return 'bg-blue-400'
      case 'ACTIVE': return 'bg-green-400'
      case 'COMPLETED': return 'bg-gray-400'
      case 'CANCELLED': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Bugün butonu */}
      <div className="flex justify-end">
        <button
          onClick={goToToday}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Bugün</span>
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Names */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-neutral-700 py-2 text-sm"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] border rounded-xl p-2 transition-all ${
                !day.isCurrentMonth
                  ? 'bg-neutral-50 text-neutral-400'
                  : isToday(day.date)
                  ? 'bg-neutral-50 border-neutral-900 border-2'
                  : 'bg-white hover:bg-neutral-50'
              }`}
            >
              {/* Date Number */}
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday(day.date)
                    ? 'bg-neutral-900 text-white w-6 h-6 rounded-full flex items-center justify-center'
                    : ''
                }`}
              >
                {day.date.getDate()}
              </div>

              {/* Orders */}
              <div className="space-y-1">
                {day.orders.slice(0, 3).map((order, i) => (
                  <div
                    key={i}
                    className={`text-xs px-2 py-1 rounded ${getOrderStatusColor(
                      order.status
                    )} text-white truncate cursor-pointer hover:opacity-80 transition-opacity`}
                    title={`${order.customer?.name} - ${order.orderNumber}`}
                  >
                    {order.customer?.name || 'Müşteri'}
                  </div>
                ))}
                {day.orders.length > 3 && (
                  <div className="text-xs text-neutral-600 px-2">
                    +{day.orders.length - 3} daha
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight mb-4">Durum Göstergeleri</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-sm text-neutral-700">Bekliyor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span className="text-sm text-neutral-700">Onaylandı</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-sm text-neutral-700">Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-neutral-700">Tamamlandı</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-sm text-neutral-700">İptal</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="text-yellow-800">
            <div className="text-sm font-medium">Bekleyen</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="text-blue-800">
            <div className="text-sm font-medium">Onaylanan</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'CONFIRMED').length}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="text-green-800">
            <div className="text-sm font-medium">Aktif</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => o.status === 'ACTIVE').length}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="text-neutral-800">
            <div className="text-sm font-medium">Bu Ay</div>
            <div className="text-2xl font-bold mt-1">
              {orders.filter(o => {
                const orderDate = new Date(o.startDate)
                return orderDate.getMonth() === currentDate.getMonth() &&
                       orderDate.getFullYear() === currentDate.getFullYear()
              }).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}