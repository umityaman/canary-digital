import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Zap, Users, ShoppingCart, Package } from 'lucide-react';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  status: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface RealTimeDashboardProps {
  connected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ 
  connected = false, 
  onConnect, 
  onDisconnect 
}) => {
  const [isConnected, setIsConnected] = useState(connected);
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock real-time data generation
  useEffect(() => {
    const generateMockMetrics = (): RealTimeMetric[] => [
      {
        id: 'active_users',
        name: 'Aktif Kullanıcılar',
        value: Math.floor(Math.random() * 50) + 10,
        unit: 'kullanıcı',
        change: (Math.random() - 0.5) * 10,
        status: Math.random() > 0.5 ? 'up' : 'down',
        lastUpdated: new Date()
      },
      {
        id: 'orders_today',
        name: 'Bugünkü Siparişler',
        value: Math.floor(Math.random() * 20) + 5,
        unit: 'sipariş',
        change: (Math.random() - 0.3) * 8,
        status: Math.random() > 0.3 ? 'up' : 'down',
        lastUpdated: new Date()
      },
      {
        id: 'revenue_hour',
        name: 'Saatlik Gelir',
        value: Math.floor(Math.random() * 5000) + 1000,
        unit: '₺',
        change: (Math.random() - 0.4) * 15,
        status: Math.random() > 0.4 ? 'up' : 'down',
        lastUpdated: new Date()
      },
      {
        id: 'equipment_active',
        name: 'Aktif Ekipman',
        value: Math.floor(Math.random() * 100) + 50,
        unit: 'adet',
        change: (Math.random() - 0.5) * 5,
        status: Math.random() > 0.5 ? 'up' : 'stable',
        lastUpdated: new Date()
      }
    ];

    // Initialize metrics
    setMetrics(generateMockMetrics());

    // Simulate real-time updates
    let interval: NodeJS.Timeout | null = null;
    
    if (isConnected) {
      interval = setInterval(() => {
        setMetrics(generateMockMetrics());
        setLastUpdate(new Date());
      }, 3000); // Update every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const toggleConnection = () => {
    const newState = !isConnected;
    setIsConnected(newState);
    
    if (newState) {
      onConnect?.();
    } else {
      onDisconnect?.();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-neutral-900';
      case 'down': return 'text-neutral-700';
      case 'stable': return 'text-neutral-800';
      default: return 'text-neutral-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'up': return 'bg-neutral-50 border-neutral-200';
      case 'down': return 'bg-neutral-50 border-neutral-200';
      case 'stable': return 'bg-neutral-50 border-neutral-200';
      default: return 'bg-neutral-50 border-neutral-200';
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'active_users': return <Users size={20} />;
      case 'orders_today': return <ShoppingCart size={20} />;
      case 'revenue_hour': return <Zap size={20} />;
      case 'equipment_active': return <Package size={20} />;
      default: return <Activity size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-neutral-900 mb-1">Canlı İzleme</h3>
          <p className="text-neutral-600">Gerçek zamanlı iş metrikleri ve aktiviteler</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Activity size={16} />
            <span>Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}</span>
          </div>
          
          <button
            onClick={toggleConnection}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
              isConnected 
                ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isConnected ? 'Bağlı' : 'Bağlı Değil'}</span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-neutral-50 border border-neutral-300 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 text-neutral-900">
            <WifiOff size={16} />
            <span className="font-medium">Canlı izleme devre dışı</span>
          </div>
          <p className="text-neutral-600 text-sm mt-1">
            Canlı güncellemeleri almak için "Bağlan" butonuna tıklayın
          </p>
        </div>
      )}

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`border rounded-xl p-4 transition-all duration-200 ${
              isConnected ? getStatusBg(metric.status) : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${isConnected ? getStatusColor(metric.status) : 'text-neutral-400'}`}>
                {getMetricIcon(metric.id)}
              </div>
              {isConnected && (
                <div className={`text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-neutral-900">
                {metric.unit === '₺' ? metric.unit : ''}{metric.value.toLocaleString('tr-TR')}{metric.unit !== '₺' ? ` ${metric.unit}` : ''}
              </p>
              <p className="text-sm text-neutral-600">{metric.name}</p>
              {isConnected && (
                <p className="text-xs text-neutral-500">
                  Updated {Math.floor((Date.now() - metric.lastUpdated.getTime()) / 1000)}s ago
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Activity Feed */}
      {isConnected && (
        <div className="border-t border-neutral-200 pt-6">
          <h4 className="font-semibold text-neutral-900 mb-4">Canlı Aktivite Akışı</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {[
              { time: '2 saniye önce', event: 'Yeni sipariş #1234 alındı', type: 'order' },
              { time: '15 saniye önce', event: 'Ekipman EQ-045 durumu güncellendi', type: 'equipment' },
              { time: '32 saniye önce', event: 'Müşteri giriş yaptı: Ahmet Yılmaz', type: 'user' },
              { time: '1 dakika önce', event: 'Ödeme işlendi: ₺2,500', type: 'payment' },
              { time: '2 dakika önce', event: 'Kontrol tamamlandı: EQ-023', type: 'inspection' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900">{activity.event}</p>
                  <p className="text-xs text-neutral-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeDashboard;