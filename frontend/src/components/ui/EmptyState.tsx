import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

const EmptyState = React.memo<EmptyStateProps>(({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="p-6 rounded-full bg-neutral-100 mb-4">
        <Icon size={48} className="text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
      
      <p className="text-gray-500 text-center mb-6 max-w-md">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          {action.icon && <action.icon size={20} />}
          {action.label}
        </button>
      )}
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState
