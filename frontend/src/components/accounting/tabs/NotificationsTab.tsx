import React from 'react'
import { Bell, Check, X, Settings, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { useNotifications } from '../../../hooks/useNotifications'
import StatCard from '../../ui/StatCard'
import EmptyState from '../../ui/EmptyState'
import { card, button, badge, DESIGN_TOKENS, cx } from '../../../styles/design-tokens'

const NotificationsTab: React.FC = () => {
  const {
    filteredNotifications,
    loading,
    stats,
    activeFilter,
    setActiveFilter,
    preferences,
    updatePreferences,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💰'
      case 'invoice': return '📄'
      case 'reminder': return '⏰'
      case 'statement': return '📊'
      case 'system': return '⚙️'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-neutral-50 border-green-200'
      case 'invoice': return 'bg-neutral-50 border-neutral-200'
      case 'reminder': return 'bg-orange-50 border-orange-200'
      case 'statement': return 'bg-neutral-50 border-purple-200'
      case 'system': return 'bg-neutral-50 border-neutral-200'
      default: return 'bg-white border-neutral-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dakika önce`
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
    
    return date.toLocaleDateString('tr-TR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Bildirim"
          value={stats.total}
          icon={Bell}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Okunmamış"
          value={stats.unread}
          icon={Mail}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Acil"
          value={stats.urgent}
          icon={Bell}
          gradient="from-red-500 to-red-600"
        />
        <StatCard
          title="Bu Hafta"
          value={stats.thisWeek}
          icon={Bell}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      {/* Filter Buttons */}
      <div className={card('md', 'xs')}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={button('sm', activeFilter === 'all' ? 'primary' : 'ghost')}
          >
            Tümü ({stats.total})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={cx(button('sm', activeFilter === 'unread' ? 'primary' : 'ghost'), activeFilter === 'unread' && 'bg-orange-600 hover:bg-orange-700')}
          >
            Okunmamış ({stats.unread})
          </button>
          <button
            onClick={() => setActiveFilter('payment')}
            className={cx(button('sm', activeFilter === 'payment' ? 'primary' : 'ghost'), activeFilter === 'payment' && 'bg-neutral-50 hover:bg-neutral-50')}
          >
            💰 Ödemeler
          </button>
          <button
            onClick={() => setActiveFilter('invoice')}
            className={button('sm', activeFilter === 'invoice' ? 'primary' : 'ghost')}
          >
            📄 Faturalar
          </button>
          <button
            onClick={() => setActiveFilter('reminder')}
            className={cx(button('sm', activeFilter === 'reminder' ? 'primary' : 'ghost'), activeFilter === 'reminder' && 'bg-orange-600 hover:bg-orange-700')}
          >
            ⏰ Hatırlatmalar
          </button>
          <button
            onClick={() => setActiveFilter('system')}
            className={cx(button('sm', activeFilter === 'system' ? 'primary' : 'ghost'), activeFilter === 'system' && 'bg-neutral-600 hover:bg-neutral-700')}
          >
            ⚙️ Sistem
          </button>
          
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className={cx(button('sm', 'success'), 'ml-auto')}
            >
              <Check size={18} className="inline mr-2" />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Bildirim Yok"
            description="Bu filtreye ait bildirim bulunmamaktadır."
          />
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`relative border rounded-lg p-4 transition-all hover:shadow-md ${
                getNotificationColor(notification.type)
              } ${notification.isRead ? 'opacity-75' : ''}`}
            >
              {/* Unread Indicator */}
              {!notification.isRead && (
                <div className="absolute top-4 left-4 w-2 h-2 bg-neutral-50 rounded-full"></div>
              )}

              <div className="flex items-start gap-4 ml-4">
                {/* Icon */}
                <div className="text-3xl">{getNotificationIcon(notification.type)}</div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                        {notification.title}
                        {notification.isUrgent && (
                          <span className={cx(badge('danger', 'sm'), 'font-bold')}>
                            ACİL
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                          title="Okundu işaretle"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500">{formatTimestamp(notification.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Preferences */}
      <div className={card('md', 'sm')}>
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-neutral-900" size={24} />
          <h3 className={`${DESIGN_TOKENS?.typography?.h3} ${DESIGN_TOKENS?.colors?.text.primary}`}>Bildirim Tercihleri</h3>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div>
            <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <Mail size={18} />
              E-posta Bildirimleri
            </h4>
            <div className="space-y-2 ml-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailPayments}
                  onChange={(e) => updatePreferences({ emailPayments: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 rounded focus:ring-neutral-500"
                />
                <span className="text-neutral-700">Ödeme bildirimleri</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailInvoices}
                  onChange={(e) => updatePreferences({ emailInvoices: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 rounded focus:ring-neutral-500"
                />
                <span className="text-neutral-700">Fatura bildirimleri</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailReminders}
                  onChange={(e) => updatePreferences({ emailReminders: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 rounded focus:ring-neutral-500"
                />
                <span className="text-neutral-700">Hatırlatmalar</span>
              </label>
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <MessageSquare size={18} />
              SMS Bildirimleri
            </h4>
            <div className="space-y-2 ml-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsPayments}
                  onChange={(e) => updatePreferences({ smsPayments: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 rounded focus:ring-neutral-500"
                />
                <span className="text-neutral-700">Ödeme bildirimleri</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.smsReminders}
                  onChange={(e) => updatePreferences({ smsReminders: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 rounded focus:ring-neutral-500"
                />
                <span className="text-neutral-700">Hatırlatmalar</span>
              </label>
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <h4 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
              <Smartphone size={18} />
              Push Bildirimleri
            </h4>
            <div className="ml-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => updatePreferences({ pushNotifications: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 rounded focus:ring-neutral-500"
                />
                <span className="text-neutral-700">Tüm push bildirimlerini etkinleştir</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsTab

