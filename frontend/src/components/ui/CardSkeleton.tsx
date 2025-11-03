import React from 'react'

interface CardSkeletonProps {
  count?: number
  height?: string
}

/**
 * CardSkeleton Component
 * Displays a loading skeleton for stat cards with shimmer animation
 */
const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 4, height = 'h-32' }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`bg-white rounded-2xl border border-neutral-200 p-6 ${height}`}
        >
          {/* Icon skeleton */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-200 rounded-xl animate-pulse"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="h-4 bg-neutral-200 rounded w-24 mb-3 animate-pulse"></div>
          
          {/* Value skeleton */}
          <div className="h-8 bg-neutral-200 rounded w-32 animate-pulse"></div>
        </div>
      ))}
    </div>
  )
}

export default CardSkeleton
