import React from 'react'

interface QuickActionButtonProps {
  title: string
  icon: React.ReactNode
  onClick: () => void
  color?: 'primary' | 'secondary' | 'success' | 'warning'
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  title, 
  icon, 
  onClick, 
  color = 'primary' 
}) => {
  const colorClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-neutral-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-accent-orange hover:bg-orange-600 text-white'
  }

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} p-4 rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 hover:scale-105 shadow-sm`}
    >
      <div className="text-2xl">{icon}</div>
      <span className="text-sm font-medium text-center">{title}</span>
    </button>
  )
}

export default QuickActionButton