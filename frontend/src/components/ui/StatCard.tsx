import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  gradient?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  subtitle?: string
  onClick?: () => void
}

const StatCard = React.memo<StatCardProps>(({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-white',
  gradient = 'from-blue-500 to-blue-600',
  trend,
  subtitle,
  onClick
}) => {
  return (
    <div 
      className={`bg-gradient-to-br ${gradient} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white/20 ${iconColor}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-100' : 'text-red-100'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            {trend.label && <span className="text-xs text-white/80">{trend.label}</span>}
          </div>
        )}
      </div>
      
      <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
      
      <div className="flex items-end justify-between">
        <p className="text-white text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-white/70 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  )
})

StatCard.displayName = 'StatCard'

export default StatCard
