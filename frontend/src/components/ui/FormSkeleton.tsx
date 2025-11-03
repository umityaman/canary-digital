import React from 'react'

interface FormSkeletonProps {
  fields?: number
  columns?: 1 | 2
}

/**
 * FormSkeleton Component
 * Displays a loading skeleton for forms with shimmer animation
 */
const FormSkeleton: React.FC<FormSkeletonProps> = ({ fields = 6, columns = 1 }) => {
  const gridCols = columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
  
  return (
    <div className={`grid ${gridCols} gap-6`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Label skeleton */}
          <div className="h-4 bg-neutral-200 rounded w-32 animate-pulse"></div>
          
          {/* Input skeleton */}
          <div className="h-12 bg-neutral-200 rounded-xl animate-pulse"></div>
        </div>
      ))}
      
      {/* Button skeleton */}
      <div className="col-span-full flex gap-3 justify-end mt-6">
        <div className="h-12 bg-neutral-200 rounded-xl w-24 animate-pulse"></div>
        <div className="h-12 bg-neutral-900 rounded-xl w-32 animate-pulse opacity-80"></div>
      </div>
    </div>
  )
}

export default FormSkeleton
