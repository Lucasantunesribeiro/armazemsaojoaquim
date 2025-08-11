import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Connection pool configuration for admin operations
interface PoolConfig {
  maxConnections: number
  idleTimeout: number
  connectionTimeout: number
  retryAttempts: number
  retryDelay: number
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxConnections: 10, // Limit concurrent connections
  idleTimeout: 30000, // 30 seconds
  connectionTimeout: 8000, // 8 seconds
  retryAttempts: 3,
  retryDelay: 1000
}

// Connection pool manager
class SupabaseAdminPool {
  private connections: Map<string, { client: any; lastUsed: number; inUse: boolean }> = new Map()
  private config: PoolConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config }
    this.startCleanupTimer()
  }

  private startCleanupTimer() {
    // Clean up idle connections every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections()
    }, 30000)
  }

  private cleanupIdleConnections() {
    const now = Date.now()
    const toRemove: string[] = []

    for (const [key, connection] of this.connections.entries()) {
      if (!connection.inUse && (now - connection.lastUsed) > this.config.idleTimeout) {
        toRemove.push(key)
      }
    }

    toRemove.forEach(key => {
      console.log(`🧹 [AdminPool] Cleaning up idle connection: ${key}`)
      this.connections.delete(key)
    })
  }

  private createConnectionKey(operation: string): string {
    return `admin-${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async getConnection(operation: string = 'default'): Promise<any> {
    // Check if we have available connections
    for (const [key, connection] of this.connections.entries()) {
      if (!connection.inUse) {
        connection.inUse = true
        connection.lastUsed = Date.now()
        console.log(`♻️ [AdminPool] Reusing connection for ${operation}: ${key}`)
        return { client: connection.client, key }
      }
    }

    // Check connection limit
    if (this.connections.size >= this.config.maxConnections) {
      console.warn(`⚠️ [AdminPool] Connection limit reached (${this.config.maxConnections}), waiting...`)
      
      // Wait for an available connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection pool timeout'))
        }, this.config.connectionTimeout)

        const checkForConnection = () => {
          for (const [key, connection] of this.connections.entries()) {
            if (!connection.inUse) {
              clearTimeout(timeout)
              connection.inUse = true
              connection.lastUsed = Date.now()
              console.log(`⏳ [AdminPool] Got available connection for ${operation}: ${key}`)
              resolve({ client: connection.client, key })
              return
            }
          }
          // Check again in 100ms
          setTimeout(checkForConnection, 100)
        }

        checkForConnection()
      })
    }

    // Create new connection
    const key = this.createConnectionKey(operation)
    console.log(`🆕 [AdminPool] Creating new connection for ${operation}: ${key}`)

    try {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          global: {
            headers: {
              'X-Client-Info': `armazem-admin-pool-${operation}`,
              'Connection': 'keep-alive'
            }
          },
          db: {
            schema: 'public'
          }
        }
      )

      this.connections.set(key, {
        client,
        lastUsed: Date.now(),
        inUse: true
      })

      return { client, key }
    } catch (error) {
      console.error(`❌ [AdminPool] Failed to create connection for ${operation}:`, error)
      throw error
    }
  }

  releaseConnection(key: string) {
    const connection = this.connections.get(key)
    if (connection) {
      connection.inUse = false
      connection.lastUsed = Date.now()
      console.log(`🔓 [AdminPool] Released connection: ${key}`)
    }
  }

  async executeWithConnection<T>(
    operation: string,
    queryFn: (client: any) => Promise<T>
  ): Promise<T> {
    let connectionInfo: { client: any; key: string } | null = null

    try {
      connectionInfo = await this.getConnection(operation)
      if (!connectionInfo) {
        throw new Error('Failed to get database connection')
      }
      const result = await queryFn(connectionInfo.client)
      return result
    } catch (error) {
      console.error(`❌ [AdminPool] Error in ${operation}:`, error)
      throw error
    } finally {
      if (connectionInfo) {
        this.releaseConnection(connectionInfo.key)
      }
    }
  }

  getStats() {
    const totalConnections = this.connections.size
    const activeConnections = Array.from(this.connections.values()).filter(c => c.inUse).length
    const idleConnections = totalConnections - activeConnections

    return {
      total: totalConnections,
      active: activeConnections,
      idle: idleConnections,
      maxConnections: this.config.maxConnections,
      utilizationPercent: Math.round((activeConnections / this.config.maxConnections) * 100)
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.connections.clear()
    console.log('🔥 [AdminPool] Connection pool destroyed')
  }
}

// Global pool instance
let adminPool: SupabaseAdminPool | null = null

export function getAdminPool(): SupabaseAdminPool {
  if (!adminPool) {
    adminPool = new SupabaseAdminPool()
    console.log('🏊 [AdminPool] Connection pool initialized')
  }
  return adminPool
}

// Convenience function for admin operations
export async function executeAdminQuery<T>(
  operation: string,
  queryFn: (client: any) => Promise<T>
): Promise<T> {
  const pool = getAdminPool()
  return pool.executeWithConnection(operation, queryFn)
}

// Health check function
export async function checkPoolHealth() {
  const pool = getAdminPool()
  const stats = pool.getStats()
  
  try {
    // Test a simple query
    await executeAdminQuery('health-check', async (client) => {
      const { data, error } = await client
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (error) throw error
      return data
    })

    return {
      healthy: true,
      stats,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      healthy: false,
      stats,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Cleanup function for graceful shutdown
export function destroyAdminPool() {
  if (adminPool) {
    adminPool.destroy()
    adminPool = null
  }
}

// Export types
export type { PoolConfig }