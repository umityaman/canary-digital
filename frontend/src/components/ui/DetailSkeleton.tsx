import React from 'react'

/**
 * DetailSkeleton Component
 * Displays a loading skeleton for detail pages with shimmer animation
 */
const DetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-200 rounded-xl animate-pulse"></div>
            <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-10 bg-neutral-200 rounded-xl animate-pulse"></div>
            <div className="w-24 h-10 bg-neutral-200 rounded-xl animate-pulse"></div>
            <div className="w-24 h-10 bg-neutral-200 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info card skeleton */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="h-6 bg-neutral-200 rounded w-40 mb-6 animate-pulse"></div>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-neutral-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-neutral-200 rounded w-48 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="h-6 bg-neutral-200 rounded w-32 mb-6 animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Status card skeleton */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="h-6 bg-neutral-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="h-10 bg-neutral-200 rounded-xl mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Activity card skeleton */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="h-6 bg-neutral-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-neutral-200 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-neutral-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailSkeleton
