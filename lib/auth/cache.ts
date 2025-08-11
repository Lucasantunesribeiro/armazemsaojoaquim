// Admin verification caching system
interface AdminCacheEntry {
  isAdmin: boolean
  timestamp: number
  ttl: number
  profile?: any
}

class AdminCache {
  private cache = new Map<string, AdminCacheEntry>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  get(userId: string): AdminCacheEntry | null {
    const cached = this.cache.get(userId)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached
    }
    
    // Remove expired entry
    if (cached) {
      this.cache.delete(userId)
    }
    
    return null
  }

  set(userId: string, isAdmin: boolean, profile?: any, ttl?: number): void {
    this.cache.set(userId, {
      isAdmin,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      profile
    })
  }

  clear(userId?: string): void {
    if (userId) {
      this.cache.delete(userId)
    } else {
      this.cache.clear()
    }
  }

  size(): number {
    return this.cache.size
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [userId, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(userId)
      }
    }
  }
}

// Global cache instance
export const adminCache = new AdminCache()

// Auto-cleanup every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    adminCache.cleanup()
  }, 10 * 60 * 1000)
}

export default adminCache