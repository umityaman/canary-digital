import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface ActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  iconColor?: string
  gradient?: string
  onClick: () => void
  disabled?: boolean
  badge?: string | number
}

const ActionCard = React.memo<ActionCardProps>(({ 
  title, 
  description, 
  icon: Icon,
  iconColor = 'text-white',
  gradient = 'from-purple-500 to-purple-600',
  onClick,
  disabled = false,
  badge
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative bg-gradient-to-br ${gradient} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-left w-full group ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
    >
      {badge !== undefined && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          {badge}
        </div>
      )}
      
      <div className={`p-3 rounded-lg bg-white/20 ${iconColor} inline-flex mb-4 group-hover:scale-110 transition-transform duration-200`}>
        <Icon size={24} />
      </div>
      
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      
      <p className="text-white/80 text-sm">{description}</p>
    </button>
  )
})

ActionCard.displayName = 'ActionCard'

export default ActionCard
