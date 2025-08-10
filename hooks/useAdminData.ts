'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { 
  adminDataCache, 
  CacheKeys, 
  PerformanceMonitor, 
  RequestDeduplicator,
  debounce
} from '@/lib/cache-manager'

export interface DataLoadingState<T> {
  data: T[]
  loading: boolean
  error: string | null
  isEmpty: boolean
  retry: () => void
  refresh: () => void
}

interface ErrorRecoveryConfig {
  maxRetries: number
  retryDelay: number
  fallbackData?: any[]
  showFallback: boolean
}

interface CacheConfig {
  enabled: boolean
  ttl: number // in milliseconds
  key?: string
}

const DEFAULT_ERROR_CONFIG: ErrorRecoveryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  fallbackData: [],
  showFallback: false
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 2 * 60 * 1000 // 2 minutes
}

export function useAdminData<T>(
  endpoint: string,
  options: {
    errorConfig?: Partial<ErrorRecoveryConfig>
    cacheConfig?: Partial<CacheConfig>
    transform?: (data: any) => T[]
    dependencies?: any[]
    autoLoad?: boolean
    debounceMs?: number
  } = {}
): DataLoadingState<T> {
  const { makeRequest, isAuthorized, isLoading: adminLoading } = useAdminApi()
  
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const errorConfig = { ...DEFAULT_ERROR_CONFIG, ...options.errorConfig }
  const cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...options.cacheConfig }
  const { transform, dependencies = [], autoLoad = true, debounceMs = 300 } = options
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  const loadData = useCallback(async (isRetry = false, skipCache = false) => {
    console.log(`🔄 [useAdminData] LoadData called: endpoint=${endpoint}, isRetry=${isRetry}, skipCache=${skipCache}`)
    console.log(`🔒 [useAdminData] Auth state: isAuthorized=${isAuthorized}, adminLoading=${adminLoading}`)
    
    if (!isAuthorized && !adminLoading) {
      console.log(`❌ [useAdminData] Admin access required - setting error state`)
      setError(() => 'Admin access required')
      setLoading(() => false)
      return
    }

    if (adminLoading) {
      console.log(`⏳ [useAdminData] Admin loading - waiting...`)
      return // Wait for admin status to be determined
    }

    // Generate cache key
    const cacheKey = cacheConfig.key || `admin-data:${endpoint}`
    
    // Try to get from cache first (unless skipping cache or retrying)
    if (cacheConfig.enabled && !skipCache && !isRetry) {
      const cachedData = adminDataCache.get<T[]>(cacheKey)
      if (cachedData !== null) {
        console.log(`🗄️ [useAdminData] Using cached data for ${endpoint}:`, cachedData.length, 'items')
        setData(() => cachedData)
        setLoading(() => false)
        setError(() => null)
        return
      } else {
        console.log(`🔄 [useAdminData] Cache miss for ${endpoint}, making fresh request`)
      }
    }

    try {
      // Create new AbortController for this request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      
      if (!isRetry) {
        console.log(`🚀 [useAdminData] Starting fresh request for ${endpoint}`)
        setLoading(() => true)
        setError(() => null)
      }

      console.log(`🔄 [useAdminData] Loading data from ${endpoint}...`)
      console.log(`🌐 [useAdminData] About to call makeRequest for: ${endpoint}`)
      
      // Use request deduplication to prevent duplicate calls
      const response = await RequestDeduplicator.dedupe(
        `admin-data:${endpoint}`,
        () => PerformanceMonitor.measureAsync(
          `API Request: ${endpoint}`,
          () => {
            console.log(`📡 [useAdminData] Executing makeRequest for: ${endpoint}`)
            return makeRequest(endpoint, { signal: abortControllerRef.current?.signal })
          }
        )
      )
      
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log(`🚫 [useAdminData] Component unmounted - aborting data update`)
        return
      }
      
      console.log(`📡 [useAdminData] API response received for ${endpoint}:`, typeof response, response)
      
      // Transform data if transformer provided
      let transformedData: T[] = []
      if (transform) {
        console.log(`🔄 [useAdminData] Using custom transformer for ${endpoint}`)
        try {
          transformedData = PerformanceMonitor.measure(
            `Data Transform: ${endpoint}`,
            () => transform(response)
          )
          console.log(`✅ [useAdminData] Transform completed:`, transformedData?.length, 'items')
          console.log(`📊 [useAdminData] Transform result type:`, typeof transformedData, Array.isArray(transformedData))
          
          // Critical check: Ensure transformer didn't return a Promise
          if (transformedData instanceof Promise) {
            console.error(`❌ [useAdminData] CRITICAL: Transformer returned Promise instead of data!`)
            transformedData = []
          }
        } catch (transformError) {
          console.error(`❌ [useAdminData] Transform error:`, transformError)
          transformedData = []
        }
      } else {
        console.log(`🔄 [useAdminData] Using default response handling for ${endpoint}`)
        // Handle different response formats
        if (Array.isArray(response)) {
          transformedData = response
        } else if (response.success && response.data) {
          // Handle API response with success flag and data object
          if (Array.isArray(response.data)) {
            transformedData = response.data
          } else if (response.data.users && Array.isArray(response.data.users)) {
            transformedData = response.data.users
          } else if (response.data.posts && Array.isArray(response.data.posts)) {
            transformedData = response.data.posts
          } else {
            transformedData = []
          }
        } else if (response.data && Array.isArray(response.data)) {
          transformedData = response.data
        } else if (response.users && Array.isArray(response.users)) {
          transformedData = response.users
        } else if (response.posts && Array.isArray(response.posts)) {
          transformedData = response.posts
        } else {
          console.warn('⚠️ [useAdminData] Unexpected response format:', response)
          console.warn('⚠️ [useAdminData] Response keys:', Object.keys(response || {}))
          transformedData = []
        }
        console.log(`✅ [useAdminData] Default handling result:`, transformedData?.length, 'items')
      }

      // Cache the transformed data (but be cautious with empty arrays)
      if (cacheConfig.enabled) {
        if (transformedData.length > 0 || endpoint.includes('blog')) {
          // Cache non-empty data or blog endpoints (which might legitimately be empty)
          console.log(`💾 [useAdminData] Caching data for ${endpoint}:`, transformedData.length, 'items')
          adminDataCache.set(cacheKey, transformedData, cacheConfig.ttl)
        } else {
          // For empty arrays, cache with shorter TTL to allow fresh attempts
          const shortTtl = Math.min(cacheConfig.ttl, 30000) // Max 30 seconds for empty arrays
          console.log(`💾 [useAdminData] Caching empty data for ${endpoint} with short TTL:`, shortTtl, 'ms')
          adminDataCache.set(cacheKey, transformedData, shortTtl)
        }
      }

      console.log(`🎯 [useAdminData] About to update component state with:`, transformedData.length, 'items')
      console.log(`📋 [useAdminData] Component still mounted:`, isMountedRef.current)
      
      // Use functional updates to avoid stale closure issues
      if (isMountedRef.current) {
        setData(() => {
          console.log(`✅ [useAdminData] setData functional update executed with:`, transformedData.length, 'items')
          return transformedData
        })
        setError(() => {
          console.log(`✅ [useAdminData] setError functional update executed: null`)
          return null
        })
        setRetryCount(() => {
          console.log(`✅ [useAdminData] setRetryCount functional update executed: 0`)
          return 0
        })
      }
      
      console.log(`🎉 [useAdminData] All state setters called for ${endpoint}`)
      
    } catch (err) {
      // Don't handle errors from aborted requests
      if (!isMountedRef.current || (err instanceof Error && err.name === 'AbortError')) {
        console.log(`🚫 [useAdminData] Request aborted or component unmounted`)
        return
      }
      
      console.error(`❌ [useAdminData] Error loading data:`, err)
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      
      // Implement retry logic with exponential backoff and jitter
      if (retryCount < errorConfig.maxRetries) {
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 + 0.85 // 85-115% of base delay
        const delay = Math.min(
          errorConfig.retryDelay * Math.pow(2, retryCount) * jitter,
          30000 // Max 30 seconds
        )
        
        console.log(`🔄 [useAdminData] Retrying in ${Math.round(delay)}ms... (attempt ${retryCount + 1}/${errorConfig.maxRetries})`)
        
        setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount(prev => prev + 1)
            loadData(true)
          }
        }, delay)
        
        return
      }
      
      // Max retries reached
      if (isMountedRef.current) {
        console.log(`💥 [useAdminData] Max retries reached, setting error state: ${errorMessage}`)
        setError(() => errorMessage)
        
        // Use fallback data if available
        if (errorConfig.showFallback && errorConfig.fallbackData) {
          console.log('🔄 [useAdminData] Using fallback data:', errorConfig.fallbackData.length, 'items')
          setData(() => errorConfig.fallbackData || [])
        } else {
          console.log('❌ [useAdminData] Setting empty data array')
          setData(() => [])
        }
      }
    } finally {
      if (isMountedRef.current) {
        console.log(`🏁 [useAdminData] Finally block - setting loading to false for ${endpoint}`)
        setLoading(() => false)
      } else {
        console.log(`🚫 [useAdminData] Finally block - component unmounted, skipping loading update`)
      }
    }
  }, [endpoint, makeRequest, isAuthorized, adminLoading, transform, retryCount, errorConfig, cacheConfig])

  const retry = useCallback(() => {
    if (isMountedRef.current) {
      setRetryCount(0)
      loadData(false, true) // Skip cache on retry
    }
  }, [loadData])

  const refresh = useCallback(() => {
    if (isMountedRef.current) {
      setRetryCount(0)
      // Clear cache for this endpoint
      const cacheKey = cacheConfig.key || `admin-data:${endpoint}`
      adminDataCache.delete(cacheKey)
      // Also clear any related cache entries
      adminDataCache.clear() // Clear all cache to ensure fresh data
      loadData(false, true) // Skip cache on refresh
    }
  }, [loadData, cacheConfig.key, endpoint])

  // Debounced load function for search inputs
  const debouncedLoadData = useCallback(
    debounce(() => {
      if (autoLoad) {
        loadData()
      }
    }, debounceMs),
    [loadData, autoLoad, debounceMs]
  )

  // Auto-load data when dependencies change
  useEffect(() => {
    console.log(`🔄 [useAdminData] Effect triggered for ${endpoint}:`)
    console.log(`   - autoLoad: ${autoLoad}`)
    console.log(`   - debounceMs: ${debounceMs}`)
    console.log(`   - dependencies:`, dependencies)
    console.log(`   - current data length: ${data.length}`)
    console.log(`   - current loading: ${loading}`)
    console.log(`   - current error: ${error}`)
    
    if (autoLoad) {
      // Clear cache on first load to ensure fresh data after fixes
      const cacheKey = cacheConfig.key || `admin-data:${endpoint}`
      const cachedData = adminDataCache.get<T[]>(cacheKey)
      if (cachedData && cachedData.length === 0) {
        console.log(`🗑️ [useAdminData] Clearing empty cache for ${endpoint}`)
        adminDataCache.delete(cacheKey)
      }
      
      // Use debounced loading for better performance with frequent changes
      if (debounceMs > 0) {
        console.log(`⏱️ [useAdminData] Using debounced loading for ${endpoint}`)
        debouncedLoadData()
      } else {
        console.log(`🚀 [useAdminData] Using direct loading for ${endpoint}`)
        loadData()
      }
    } else {
      console.log(`⏸️ [useAdminData] AutoLoad disabled for ${endpoint}`)
    }
  }, [loadData, debouncedLoadData, autoLoad, debounceMs, ...dependencies])

  // Debug effect to track state changes
  useEffect(() => {
    console.log(`📊 [useAdminData] State update for ${endpoint}:`, {
      dataLength: data.length,
      loading,
      error,
      isEmpty: !loading && data.length === 0
    })
  }, [data, loading, error, endpoint])

  return {
    data,
    loading,
    error,
    isEmpty: !loading && data.length === 0,
    retry,
    refresh
  }
}