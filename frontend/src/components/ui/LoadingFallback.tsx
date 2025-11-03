import React from 'react'

const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Yükleniyor...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        
        {/* Inner circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-ping rounded-full h-4 w-4 bg-blue-400"></div>
        </div>
      </div>
      
      <p className="mt-6 text-gray-600 font-medium animate-pulse">{message}</p>
      
      {/* Progress bar */}
      <div className="mt-4 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-progress"></div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default LoadingFallback
