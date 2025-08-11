import { adminCache } from './cache'
import { logAuthEvent } from './logging'

/**
 * Performance optimization utilities for authentication system
 */

// Performance metrics tracking
interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: number
  success: boolean
  method?: string
  cacheHit?: boolean
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics

  track(operation: string, duration: number, success: boolean, metadata?: any) {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      success,
      ...metadata
    }

    this.metrics.push(metric)
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(operation?: string, timeWindow?: number): PerformanceMetric[] {
    let filtered = this.metrics

    if (operation) {
      filtered = filtered.filter(m => m.operation === operation)
    }

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow
      filtered = filtered.filter(m => m.timestamp > cutoff)
    }

    return filtered
  }

  getAverageTime(operation?: string, timeWindow?: number): number {
    const metrics = this.getMetrics(operation, timeWindow)
    if (metrics.length === 0) return 0

    const total = metrics.reduce((sum, m) => sum + m.duration, 0)
    return Math.round(total / metrics.length)
  }

  getSuccessRate(operation?: string, timeWindow?: number): number {
    const metrics = this.getMetrics(operation, timeWindow)
    if (metrics.length === 0) return 0

    const successful = metrics.filter(m => m.success).length
    return Math.round((successful / metrics.length) * 100)
  }

  getCacheHitRate(operation?: string, timeWindow?: number): number {
    const metrics = this.getMetrics(operation, timeWindow)
    const cacheMetrics = metrics.filter(m => m.cacheHit !== undefined)
    
    if (cacheMetrics.length === 0) return 0

    const hits = cacheMetrics.filter(m => m.cacheHit).length
    return Math.round((hits / cacheMetrics.length) * 100)
  }

  getStats(timeWindow: number = 5 * 60 * 1000) { // Default: last 5 minutes
    const metrics = this.getMetrics(undefined, timeWindow)
    
    const operations = [...new Set(metrics.map(m => m.operation))]
    const operationStats = operations.map(op => ({
      operation: op,
      count: metrics.filter(m => m.operation === op).length,
      averageTime: this.getAverageTime(op, timeWindow),
      successRate: this.getSuccessRate(op, timeWindow),
      cacheHitRate: this.getCacheHitRate(op, timeWindow)
    }))

    return {
      totalOperations: metrics.length,
      timeWindow,
      overallAverageTime: this.getAverageTime(undefined, timeWindow),
      overallSuccessRate: this.getSuccessRate(undefined, timeWindow),
      overallCacheHitRate: this.getCacheHitRate(undefined, timeWindow),
      operationStats
    }
  }
}

// Global performance tracker
export const performanceTracker = new PerformanceTracker()

/**
 * Performance monitoring decorator
 */
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now()
    let success = false
    let metadata: any = {}

    try {
      const result = await fn(...args)
      success = true
      
      // Extract metadata from result if available
      if (result && typeof result === 'object') {
        metadata.method = result.method
        metadata.cacheHit = result.method === 'cache'
      }

      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = Date.now() - startTime
      performanceTracker.track(operation, duration, success, metadata)
    }
  }) as T
}

/**
 * Database connection pooling optimization
 */
class ConnectionPool {
  private connections: Map<string, any> = new Map()
  private maxConnections = 10
  private connectionTimeout = 30000 // 30 seconds

  async getConnection(key: string, factory: () => Promise<any>): Promise<any> {
    const existing = this.connections.get(key)
    
    if (existing && this.isConnectionValid(existing)) {
      return existing
    }

    // Create new connection
    const connection = await factory()
    this.connections.set(key, {
      connection,
      created: Date.now(),
      lastUsed: Date.now()
    })

    // Cleanup old connections
    this.cleanup()

    return connection
  }

  private isConnectionValid(connectionData: any): boolean {
    const now = Date.now()
    const age = now - connectionData.created
    const idle = now - connectionData.lastUsed

    return age < this.connectionTimeout && idle < this.connectionTimeout
  }

  private cleanup(): void {
    if (this.connections.size <= this.maxConnections) return

    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, data] of this.connections.entries()) {
      if (!this.isConnectionValid(data)) {
        toDelete.push(key)
      }
    }

    toDelete.forEach(key => this.connections.delete(key))
  }
}

export const connectionPool = new ConnectionPool()

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>()
  private defaultTTL = 60000 // 1 minute

  async executeWithCache<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Check cache first
    const cached = this.queryCache.get(queryKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.result
    }

    // Execute query
    const result = await queryFn()
    
    // Cache result
    this.queryCache.set(queryKey, {
      result,
      timestamp: Date.now(),
      ttl
    })

    return result
  }

  clearCache(pattern?: string): void {
    if (!pattern) {
      this.queryCache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const key of this.queryCache.keys()) {
      if (regex.test(key)) {
        this.queryCache.delete(key)
      }
    }
  }

  getCacheStats(): {
    size: number
    hitRate: number
    entries: Array<{ key: string; age: number; ttl: number }>
  } {
    const now = Date.now()
    const entries = Array.from(this.queryCache.entries()).map(([key, data]) => ({
      key,
      age: now - data.timestamp,
      ttl: data.ttl
    }))

    return {
      size: this.queryCache.size,
      hitRate: 0, // Would need to track hits/misses
      entries
    }
  }
}

export const queryOptimizer = new QueryOptimizer()

/**
 * Batch processing utilities
 */
export class BatchProcessor {
  private batches = new Map<string, { items: any[]; timer: NodeJS.Timeout }>()
  private defaultBatchSize = 10
  private defaultDelay = 100 // 100ms

  addToBatch<T>(
    batchKey: string,
    item: T,
    processor: (items: T[]) => Promise<void>,
    options: { batchSize?: number; delay?: number } = {}
  ): void {
    const batchSize = options.batchSize || this.defaultBatchSize
    const delay = options.delay || this.defaultDelay

    let batch = this.batches.get(batchKey)
    
    if (!batch) {
      batch = { items: [], timer: null as any }
      this.batches.set(batchKey, batch)
    }

    batch.items.push(item)

    // Clear existing timer
    if (batch.timer) {
      clearTimeout(batch.timer)
    }

    // Process immediately if batch is full
    if (batch.items.length >= batchSize) {
      this.processBatch(batchKey, processor)
      return
    }

    // Set timer for delayed processing
    batch.timer = setTimeout(() => {
      this.processBatch(batchKey, processor)
    }, delay)
  }

  private async processBatch<T>(
    batchKey: string,
    processor: (items: T[]) => Promise<void>
  ): Promise<void> {
    const batch = this.batches.get(batchKey)
    if (!batch || batch.items.length === 0) return

    const items = [...batch.items]
    batch.items = []
    
    if (batch.timer) {
      clearTimeout(batch.timer)
      batch.timer = null as any
    }

    try {
      await processor(items)
    } catch (error) {
      console.error(`Batch processing error for ${batchKey}:`, error)
    }
  }

  async flushBatch<T>(
    batchKey: string,
    processor: (items: T[]) => Promise<void>
  ): Promise<void> {
    await this.processBatch(batchKey, processor)
  }

  flushAll(): void {
    this.batches.clear()
  }
}

export const batchProcessor = new BatchProcessor()

/**
 * Memory optimization utilities
 */
export function optimizeMemoryUsage(): void {
  // Clean expired cache entries
  adminCache.cleanup()
  
  // Clean query cache
  queryOptimizer.clearCache()
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
}

/**
 * Edge Runtime compatible memory info
 */
function getMemoryInfo() {
  // Edge Runtime compatible version
  if (typeof process === 'undefined') {
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
      arrayBuffers: 0
    }
  }
  
  try {
    return process.memoryUsage()
  } catch {
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
      arrayBuffers: 0
    }
  }
}

/**
 * Performance monitoring middleware
 */
export function createPerformanceMiddleware() {
  return async (operation: string, fn: () => Promise<any>) => {
    const startTime = Date.now()
    const startMemory = getMemoryInfo()
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      const endMemory = getMemoryInfo()
      
      // Log performance metrics
      console.log(`Performance: ${operation} completed in ${duration}ms`, {
        memoryDelta: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        }
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Performance: ${operation} failed after ${duration}ms`, error)
      throw error
    }
  }
}

/**
 * Get comprehensive performance report
 */
export function getPerformanceReport(): {
  tracker: ReturnType<typeof performanceTracker.getStats>
  cache: {
    admin: { size: number }
    query: ReturnType<typeof queryOptimizer.getCacheStats>
  }
  memory: ReturnType<typeof getMemoryInfo>
} {
  return {
    tracker: performanceTracker.getStats(),
    cache: {
      admin: { size: adminCache.size() },
      query: queryOptimizer.getCacheStats()
    },
    memory: getMemoryInfo()
  }
}