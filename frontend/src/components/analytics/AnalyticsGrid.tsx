import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    period: string;
    isPositive: boolean;
  };
  percentage?: number;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  percentage,
  color = 'blue',
  loading = false
}) => {
  const colorClasses = {
    blue: 'bg-neutral-100 text-neutral-900',
    green: 'bg-neutral-100 text-neutral-900',
    orange: 'bg-neutral-100 text-neutral-900',
    red: 'bg-neutral-100 text-neutral-900',
    purple: 'bg-neutral-100 text-neutral-900'
  };

  const trendColors = {
    positive: 'text-neutral-900 bg-neutral-100',
    negative: 'text-neutral-700 bg-neutral-100',
    neutral: 'text-neutral-600 bg-neutral-50'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.isPositive) return <TrendingUp size={14} />;
    if (trend.value < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendStatus = () => {
    if (!trend) return 'neutral';
    if (trend.isPositive) return 'positive';
    if (trend.value < 0) return 'negative';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
          <div className="w-8 h-4 bg-neutral-200 rounded"></div>
        </div>
        <div className="h-8 bg-neutral-200 rounded mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        {percentage !== undefined && (
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              percentage > 0 ? trendColors.positive : percentage < 0 ? trendColors.negative : trendColors.neutral
            }`}>
              {percentage > 0 ? '+' : ''}{percentage}%
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-3xl font-bold text-neutral-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </h3>
      <p className="text-sm text-neutral-600 mb-4">{subtitle}</p>
      
      {trend && (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendColors[getTrendStatus()]}`}>
          {getTrendIcon()}
          <span className="ml-1">
            {Math.abs(trend.value)}% {trend.period}
          </span>
        </div>
      )}
      
      {title && (
        <div className="mt-2 text-xs text-neutral-500 font-medium">
          {title}
        </div>
      )}
    </div>
  );
};

interface AnalyticsGridProps {
  stats: any;
  loading?: boolean;
  onRefresh?: () => void;
}

const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({ stats, loading = false, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Analitik Özeti</h2>
          <p className="text-neutral-600">Gerçek zamanlı iş metrikleri ve içgörüler</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Gelir Performansı"
          value={`₺${(stats.revenue?.total || 0).toLocaleString('tr-TR')}`}
          subtitle="Toplam Gelir"
          icon={<TrendingUp size={24} />}
          trend={{
            value: stats.revenue?.monthly > 0 ? Math.round(((stats.revenue.monthly / stats.revenue.total) * 100)) : 0,
            period: "bu ay",
            isPositive: true
          }}
          color="green"
          loading={loading}
        />

        <MetricCard
          title="Sipariş Analizi"
          value={stats.orders?.active || 0}
          subtitle="Aktif Siparişler"
          icon={<RefreshCw size={24} />}
          trend={{
            value: stats.orders?.total > 0 ? Math.round(((stats.orders.active / stats.orders.total) * 100)) : 0,
            period: "toplam",
            isPositive: true
          }}
          color="blue"
          loading={loading}
        />

        <MetricCard
          title="Ekipman Verimliliği"
          value={`${stats.equipment?.utilization || 0}%`}
          subtitle="Kullanım Oranı"
          icon={<TrendingUp size={24} />}
          trend={{
            value: 2.1,
            period: "bu ay",
            isPositive: true
          }}
          percentage={-1.3}
          color="orange"
          loading={loading}
        />

        <MetricCard
          title="Müşteri Büyümesi"
          value={stats.customers?.total || 0}
          subtitle="Toplam Müşteri"
          icon={<TrendingUp size={24} />}
          trend={{
            value: 15.8,
            period: "bu çeyrek",
            isPositive: true
          }}
          percentage={15.8}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ortalama Sipariş Değeri"
          value={`₺${(stats.orders?.avgValue || 0).toLocaleString('tr-TR')}`}
          subtitle="Sipariş Başına"
          icon={<TrendingUp size={24} />}
          trend={{
            value: 8.7,
            period: "bu ay",
            isPositive: true
          }}
          color="green"
          loading={loading}
        />

        <MetricCard
          title="Bekleyen Ödemeler"
          value={`₺${(stats.payments?.pending || 0).toLocaleString('tr-TR')}`}
          subtitle="Tahsil Edilecek"
          icon={<TrendingUp size={24} />}
          color="orange"
          loading={loading}
        />

        <MetricCard
          title="Müsait Ekipman"
          value={stats.equipment?.available || 0}
          subtitle="Kullanıma Hazır"
          icon={<RefreshCw size={24} />}
          color="blue"
          loading={loading}
        />

        <MetricCard
          title="Bekleyen Kontroller"
          value={stats.alerts?.pendingInspections || 0}
          subtitle="Dikkat Gerekiyor"
          icon={<RefreshCw size={24} />}
          color="red"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AnalyticsGrid;