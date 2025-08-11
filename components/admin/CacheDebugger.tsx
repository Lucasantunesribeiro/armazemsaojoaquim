'use client'

import { useState, useEffect } from 'react'
import { adminDataCache } from '@/lib/cache-manager'

export function CacheDebugger() {
  const [cacheStats, setCacheStats] = useState<{
    size: number
    maxSize?: number
    keys: string[]
    timestamp: number
  } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateStats = () => {
      setCacheStats({
        ...adminDataCache.getStats(),
        keys: Array.from((adminDataCache as any).cache.keys()).slice(0, 10).map(String), // Show first 10 keys
        timestamp: Date.now()
      })
    }

    if (isVisible) {
      updateStats()
      const interval = setInterval(updateStats, 2000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  const handleClearCache = () => {
    adminDataCache.clear()
    console.log('🧹 [CacheDebugger] Cache manually cleared')
    setCacheStats(prev => prev ? { ...prev, size: 0, keys: [] } : { size: 0, keys: [], timestamp: Date.now(), maxSize: 0 })
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-1 rounded text-xs"
      >
        Cache Debug
      </button>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Cache Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      {cacheStats && (
        <div className="space-y-2">
          <div>
            <strong>Size:</strong> {cacheStats.size}/{cacheStats.maxSize}
          </div>
          
          <div>
            <strong>Keys:</strong>
            <ul className="ml-2 max-h-32 overflow-y-auto">
              {cacheStats.keys.map((key: string, idx: number) => (
                <li key={idx} className="truncate">
                  {key}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleClearCache}
              className="bg-red-600 text-white px-2 py-1 rounded text-xs"
            >
              Clear Cache
            </button>
            
            <button
              onClick={() => setCacheStats(prev => prev ? { ...prev, timestamp: Date.now() } : null)}
              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
            >
              Refresh
            </button>
          </div>
          
          <div className="text-gray-400">
            Updated: {new Date(cacheStats.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}