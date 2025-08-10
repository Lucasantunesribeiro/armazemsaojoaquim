// Cache manager for admin data with TTL support

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheConfig {
  defaultTTL: number // in milliseconds
  maxSize: number
  enableLogging: boolean
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      enableLogging: false,
      ...config
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    }

    this.cache.set(key, entry)

    if (this.config.enableLogging) {
      console.log(`🗄️ [Cache] Set: ${key} (TTL: ${entry.ttl}ms)`)
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      if (this.config.enableLogging) {
        console.log(`🗄️ [Cache] Miss: ${key}`)
      }
      return null
    }

    // Check if entry has expired
    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      if (this.config.enableLogging) {
        console.log(`🗄️ [Cache] Expired: ${key} (age: ${Date.now() - entry.timestamp}ms)`)
      }
      return null
    }

    // Don't serve empty arrays from cache unless explicitly valid
    if (Array.isArray(entry.data) && entry.data.length === 0) {
      const age = Date.now() - entry.timestamp
      const shouldRefresh = age > (entry.ttl * 0.5) // Refresh if older than 50% of TTL
      
      if (shouldRefresh) {
        this.cache.delete(key)
        if (this.config.enableLogging) {
          console.log(`🗄️ [Cache] Empty array refresh: ${key} (age: ${age}ms)`)
        }
        return null
      }
    }

    if (this.config.enableLogging) {
      const dataInfo = Array.isArray(entry.data) ? `${entry.data.length} items` : typeof entry.data
      console.log(`🗄️ [Cache] Hit: ${key} (${dataInfo}, age: ${Date.now() - entry.timestamp}ms)`)
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted && this.config.enableLogging) {
      console.log(`🗄️ [Cache] Deleted: ${key}`)
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    if (this.config.enableLogging) {
      console.log('🗄️ [Cache] Cleared all entries')
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      entries: Array.from(this.cache.keys())
    }
  }

  // Clean expired entries
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0 && this.config.enableLogging) {
      console.log(`🗄️ [Cache] Cleaned ${cleaned} expired entries`)
    }

    return cleaned
  }
}

// Global cache instance for admin data
export const adminDataCache = new CacheManager({
  defaultTTL: 2 * 60 * 1000, // 2 minutes for admin data
  maxSize: 50,
  enableLogging: process.env.NODE_ENV === 'development'
})

// Clear cache on page load to ensure fresh data in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  adminDataCache.clear()
  console.log('🧹 [Cache] Development mode: cleared cache on init')
}

// Menu cache instance for menu data
export const menuCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for menu data
  maxSize: 20,
  enableLogging: process.env.NODE_ENV === 'development'
})

// Cache key generators
export const CacheKeys = {
  users: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams(filters).toString()
    return `admin:users:${params}`
  },
  
  blogPosts: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams(filters).toString()
    return `admin:blog:posts:${params}`
  },
  
  userStats: () => 'admin:users:stats',
  
  blogStats: () => 'admin:blog:stats'
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements = new Map<string, number>()

  static start(label: string): void {
    this.measurements.set(label, performance.now())
  }

  static end(label: string): number {
    const startTime = this.measurements.get(label)
    if (!startTime) {
      console.warn(`⚠️ [Performance] No start time found for: ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(label)

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ [Performance] ${label}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    const result = await fn()
    this.end(label)
    return result
  }
}

// Request deduplication to prevent duplicate API calls
export class RequestDeduplicator {
  private static pendingRequests = new Map<string, Promise<any>>()

  static async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 [Dedupe] Using existing request: ${key}`)
      return this.pendingRequests.get(key)!
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  static clear(): void {
    this.pendingRequests.clear()
  }
}