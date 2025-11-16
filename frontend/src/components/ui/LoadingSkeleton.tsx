import React from 'react'

interface LoadingSkeletonProps {
  type: 'stats' | 'table' | 'chart' | 'list'
  count?: number
  columns?: number
  rows?: number
  height?: number
}

export default function LoadingSkeleton({ 
  type, 
  count = 4, 
  columns = 6, 
  rows = 5,
  height = 320 
}: LoadingSkeletonProps) {
  
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
              <div className="h-4 w-12 bg-neutral-200 rounded" />
            </div>
            <div className="h-8 w-24 bg-neutral-200 rounded mb-2" />
            <div className="h-4 w-16 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-pulse">
        {/* Table Header */}
        <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-neutral-200 rounded flex-1" />
            ))}
          </div>
        </div>
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-neutral-100 px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-neutral-200 rounded flex-1"
                  style={{ width: colIndex === 0 ? '120px' : 'auto' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 rounded-xl" />
            <div className="h-6 w-40 bg-neutral-200 rounded" />
          </div>
          <div className="h-4 w-24 bg-neutral-200 rounded" />
        </div>
        {/* Chart Body */}
        <div className="relative" style={{ height: `${height}px` }}>
          <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
            {Array.from({ length: 12 }).map((_, i) => {
              const randomHeight = Math.floor(Math.random() * 60) + 40
              return (
                <div 
                  key={i} 
                  className="bg-neutral-200 rounded-t flex-1"
                  style={{ height: `${randomHeight}%` }}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-neutral-200 rounded" />
                <div className="h-4 w-64 bg-neutral-200 rounded" />
              </div>
              <div className="h-8 w-20 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
