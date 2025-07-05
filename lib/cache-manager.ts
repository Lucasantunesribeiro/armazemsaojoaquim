interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milliseconds
  key: string
  hits: number
  lastAccessed: number
}

interface CacheStats {
  totalItems: number
  totalHits: number
  totalMisses: number
  hitRate: number
  memoryUsage: number
  oldestItem: number
  newestItem: number
}

class CacheManager {
  private static instance: CacheManager
  private cache = new Map<string, CacheItem<any>>()
  private maxSize: number
  private defaultTTL: number
  private stats = {
    hits: 0,
    misses: 0
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  private constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutos padrão
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    
    // Limpeza automática a cada minuto
    setInterval(() => this.cleanup(), 60000)
  }

  // Armazenar item no cache
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const timeToLive = ttl || this.defaultTTL

    // Se o cache está cheio, remover o item menos usado
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: timeToLive,
      key,
      hits: 0,
      lastAccessed: now
    }

    this.cache.set(key, item)
  }

  // Recuperar item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    
    // Verificar se o item expirou
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Atualizar estatísticas de acesso
    item.hits++
    item.lastAccessed = now
    this.stats.hits++

    return item.data as T
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    const now = Date.now()
    
    // Verificar se expirou
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Remover item específico
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Limpar cache por padrão
  deletePattern(pattern: string): number {
    let deleted = 0
    const regex = new RegExp(pattern)
    
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }
    
    return deleted
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
  }

  // Limpeza automática de itens expirados
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Remover item menos usado quando cache está cheio
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let leastHits = Infinity
    let oldestAccess = Infinity

    for (const [key, item] of Array.from(this.cache.entries())) {
      // Priorizar por menor número de hits, depois por acesso mais antigo
      if (item.hits < leastHits || (item.hits === leastHits && item.lastAccessed < oldestAccess)) {
        leastUsedKey = key
        leastHits = item.hits
        oldestAccess = item.lastAccessed
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }

  // Obter estatísticas do cache
  getStats(): CacheStats {
    const now = Date.now()
    let totalHits = 0
    let oldestItem = now
    let newestItem = 0
    let memoryUsage = 0

    for (const item of Array.from(this.cache.values())) {
      totalHits += item.hits
      oldestItem = Math.min(oldestItem, item.timestamp)
      newestItem = Math.max(newestItem, item.timestamp)
      
      // Estimativa aproximada do uso de memória
      memoryUsage += JSON.stringify(item.data).length
    }

    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0

    return {
      totalItems: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate,
      memoryUsage,
      oldestItem: oldestItem === now ? 0 : oldestItem,
      newestItem
    }
  }

  // Obter todos os itens (para debug)
  getAllItems(): Array<{ key: string; item: CacheItem<any> }> {
    return Array.from(this.cache.entries()).map(([key, item]) => ({ key, item }))
  }

  // Configurar tamanho máximo
  setMaxSize(size: number): void {
    this.maxSize = size
    
    // Se o cache atual é maior que o novo limite, fazer limpeza
    while (this.cache.size > this.maxSize) {
      this.evictLeastUsed()
    }
  }

  // Configurar TTL padrão
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl
  }
}

// Instância singleton
export const cacheManager = CacheManager.getInstance()

// Funções de conveniência para diferentes tipos de cache
export const menuCache = {
  get: () => cacheManager.get<any[]>('menu_items'),
  set: (data: any[]) => cacheManager.set('menu_items', data, 10 * 60 * 1000), // 10 minutos
  clear: () => cacheManager.delete('menu_items')
}

export const blogCache = {
  getPost: (slug: string) => cacheManager.get<any>(`blog_post_${slug}`),
  setPost: (slug: string, data: any) => cacheManager.set(`blog_post_${slug}`, data, 15 * 60 * 1000), // 15 minutos
  getPosts: () => cacheManager.get<any[]>('blog_posts'),
  setPosts: (data: any[]) => cacheManager.set('blog_posts', data, 10 * 60 * 1000), // 10 minutos
  clear: () => cacheManager.deletePattern('^blog_')
}

export const userCache = {
  getReservations: (userId: string) => cacheManager.get<any[]>(`user_reservations_${userId}`),
  setReservations: (userId: string, data: any[]) => cacheManager.set(`user_reservations_${userId}`, data, 5 * 60 * 1000), // 5 minutos
  clearUser: (userId: string) => cacheManager.deletePattern(`^user_.*_${userId}$`)
}

export const apiCache = {
  get: (endpoint: string) => cacheManager.get<any>(`api_${endpoint}`),
  set: (endpoint: string, data: any, ttl?: number) => cacheManager.set(`api_${endpoint}`, data, ttl),
  clear: () => cacheManager.deletePattern('^api_')
}

// Hook para usar cache em componentes React
export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number) {
  const getCachedData = (): T | null => {
    return cacheManager.get<T>(key)
  }

  const setCachedData = (data: T): void => {
    cacheManager.set(key, data, ttl)
  }

  const invalidateCache = (): void => {
    cacheManager.delete(key)
  }

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    fetcher
  }
}

export default cacheManager 