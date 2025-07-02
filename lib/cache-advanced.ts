'use client'

import { ENV } from './config'

// Tipos para o sistema de cache
interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  version: string
  tags: string[]
  size: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  totalSize: number
  itemCount: number
}

interface CacheConfig {
  maxSize: number // em bytes
  maxItems: number
  defaultTTL: number // em ms
  cleanupInterval: number // em ms
  compressionThreshold: number // em bytes
  enableCompression: boolean
  enablePersistence: boolean
  persistenceKey: string
}

// Configuração padrão
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  maxItems: 1000,
  defaultTTL: 30 * 60 * 1000, // 30 minutos
  cleanupInterval: 5 * 60 * 1000, // 5 minutos
  compressionThreshold: 1024, // 1KB
  enableCompression: true,
  enablePersistence: true,
  persistenceKey: 'armazem_cache'
}

// Utilitários de compressão (simulado)
class CompressionUtils {
  static compress(data: string): string {
    // Em produção, usar uma biblioteca real de compressão
    try {
      return btoa(data)
    } catch {
      return data
    }
  }

  static decompress(data: string): string {
    try {
      return atob(data)
    } catch {
      return data
    }
  }

  static getSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size
  }
}

// Sistema de cache multi-camada
class AdvancedCacheManager {
  private memoryCache = new Map<string, CacheItem>()
  private config: CacheConfig
  private stats: CacheStats
  private cleanupTimer?: NodeJS.Timeout
  private version: string

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      itemCount: 0
    }
    this.version = ENV.APP_VERSION || '1.0.0'
    
    this.initialize()
  }

  private initialize() {
    // Carregar cache persistido
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadFromPersistence()
    }

    // Iniciar limpeza automática
    this.startCleanupTimer()

    // Salvar cache antes de sair da página
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveToPersistence()
      })
    }
  }

  // Operações básicas de cache
  public set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number
      tags?: string[]
      compress?: boolean
    } = {}
  ): boolean {
    try {
      const ttl = options.ttl || this.config.defaultTTL
      const tags = options.tags || []
      const shouldCompress = options.compress ?? 
        (this.config.enableCompression && CompressionUtils.getSize(data) > this.config.compressionThreshold)

      let processedData = data
      let size = CompressionUtils.getSize(data)

      // Comprimir se necessário
      if (shouldCompress && typeof data === 'string') {
        processedData = CompressionUtils.compress(data as string) as T
        size = CompressionUtils.getSize(processedData)
      }

      const item: CacheItem<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        version: this.version,
        tags,
        size
      }

      // Verificar limites antes de adicionar
      if (!this.canAddItem(size)) {
        this.evictItems(size)
      }

      // Remover item existente se houver
      if (this.memoryCache.has(key)) {
        this.delete(key)
      }

      // Adicionar novo item
      this.memoryCache.set(key, item)
      this.updateStats('set', size)

      if (ENV.IS_DEVELOPMENT) {
        console.log(`🗄️ Cache SET: ${key} (${this.formatSize(size)})`)
      }

      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  public get<T>(key: string, options: { decompress?: boolean } = {}): T | null {
    try {
      const item = this.memoryCache.get(key) as CacheItem<T> | undefined

      if (!item) {
        this.updateStats('miss')
        return null
      }

      // Verificar expiração
      if (this.isExpired(item)) {
        this.delete(key)
        this.updateStats('miss')
        return null
      }

      // Verificar versão
      if (item.version !== this.version) {
        this.delete(key)
        this.updateStats('miss')
        return null
      }

      let data = item.data

      // Descomprimir se necessário
      if (options.decompress && typeof data === 'string') {
        data = CompressionUtils.decompress(data as string) as T
      }

      this.updateStats('hit')

      if (ENV.IS_DEVELOPMENT) {
        console.log(`🎯 Cache HIT: ${key}`)
      }

      return data
    } catch (error) {
      console.error('Cache get error:', error)
      this.updateStats('miss')
      return null
    }
  }

  public delete(key: string): boolean {
    const item = this.memoryCache.get(key)
    if (item) {
      this.memoryCache.delete(key)
      this.updateStats('delete', -item.size)
      
      if (ENV.IS_DEVELOPMENT) {
        console.log(`🗑️ Cache DELETE: ${key}`)
      }
      
      return true
    }
    return false
  }

  public clear(): void {
    this.memoryCache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      itemCount: 0
    }

    if (ENV.IS_DEVELOPMENT) {
      console.log('🧹 Cache CLEARED')
    }
  }

  // Operações avançadas
  public has(key: string): boolean {
    const item = this.memoryCache.get(key)
    return item ? !this.isExpired(item) : false
  }

  public keys(): string[] {
    return Array.from(this.memoryCache.keys())
  }

  public invalidateByTag(tag: string): number {
    let count = 0
    const entries = Array.from(this.memoryCache.entries())
    for (let i = 0; i < entries.length; i++) {
      const [key, item] = entries[i]
      if (item.tags.includes(tag)) {
        this.delete(key)
        count++
      }
    }

    if (ENV.IS_DEVELOPMENT) {
      console.log(`🏷️ Cache invalidated ${count} items with tag: ${tag}`)
    }

    return count
  }

  public invalidateByPattern(pattern: RegExp): number {
    let count = 0
    const keys = Array.from(this.memoryCache.keys())
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (pattern.test(key)) {
        this.delete(key)
        count++
      }
    }

    if (ENV.IS_DEVELOPMENT) {
      console.log(`🔍 Cache invalidated ${count} items matching pattern: ${pattern}`)
    }

    return count
  }

  public touch(key: string, newTTL?: number): boolean {
    const item = this.memoryCache.get(key)
    if (item && !this.isExpired(item)) {
      item.timestamp = Date.now()
      if (newTTL) {
        item.ttl = newTTL
      }
      return true
    }
    return false
  }

  // Métodos de manutenção
  private canAddItem(size: number): boolean {
    return (
      this.stats.itemCount < this.config.maxItems &&
      this.stats.totalSize + size <= this.config.maxSize
    )
  }

  private evictItems(requiredSize: number): void {
    // Estratégia LRU (Least Recently Used)
    const items = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)

    let freedSize = 0
    let evicted = 0

    for (const [key, item] of items) {
      if (freedSize >= requiredSize && this.canAddItem(requiredSize)) {
        break
      }

      this.memoryCache.delete(key)
      freedSize += item.size
      evicted++
    }

    this.stats.evictions += evicted
    this.stats.totalSize -= freedSize
    this.stats.itemCount -= evicted

    if (ENV.IS_DEVELOPMENT) {
      console.log(`♻️ Cache evicted ${evicted} items (${this.formatSize(freedSize)})`)
    }
  }

  private cleanup(): void {
    let cleaned = 0
    const now = Date.now()

    const entries = Array.from(this.memoryCache.entries())
    for (let i = 0; i < entries.length; i++) {
      const [key, item] = entries[i]
      if (this.isExpired(item) || item.version !== this.version) {
        this.delete(key)
        cleaned++
      }
    }

    if (ENV.IS_DEVELOPMENT && cleaned > 0) {
      console.log(`🧽 Cache cleanup removed ${cleaned} expired items`)
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private updateStats(operation: 'hit' | 'miss' | 'set' | 'delete', sizeChange = 0): void {
    this.stats[operation === 'hit' ? 'hits' : 
                operation === 'miss' ? 'misses' :
                operation === 'set' ? 'sets' : 'deletes']++

    if (operation === 'set') {
      this.stats.totalSize += sizeChange
      this.stats.itemCount++
    } else if (operation === 'delete') {
      this.stats.totalSize += sizeChange // sizeChange é negativo
      this.stats.itemCount--
    }
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)}${units[unitIndex]}`
  }

  // Persistência
  private saveToPersistence(): void {
    if (!this.config.enablePersistence || typeof window === 'undefined') return

    try {
      const cacheData = {
        version: this.version,
        timestamp: Date.now(),
        items: Array.from(this.memoryCache.entries())
      }

      localStorage.setItem(this.config.persistenceKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save cache to persistence:', error)
    }
  }

  private loadFromPersistence(): void {
    if (!this.config.enablePersistence || typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.config.persistenceKey)
      if (!stored) return

      const cacheData = JSON.parse(stored)
      
      // Verificar versão
      if (cacheData.version !== this.version) {
        localStorage.removeItem(this.config.persistenceKey)
        return
      }

      // Carregar itens válidos
      for (let i = 0; i < cacheData.items.length; i++) {
        const [key, item] = cacheData.items[i]
        if (!this.isExpired(item)) {
          this.memoryCache.set(key, item)
          this.updateStats('set', item.size)
        }
      }

      if (ENV.IS_DEVELOPMENT) {
        console.log(`💾 Cache loaded ${this.stats.itemCount} items from persistence`)
      }
    } catch (error) {
      console.warn('Failed to load cache from persistence:', error)
      localStorage.removeItem(this.config.persistenceKey)
    }
  }

  // Métodos públicos para estatísticas e debug
  public getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  public getInfo(): {
    size: string
    items: number
    hitRate: string
    oldestItem: string | null
    newestItem: string | null
  } {
    const stats = this.getStats()
    let oldestTimestamp = Infinity
    let newestTimestamp = 0
    let oldestKey = null
    let newestKey = null

    const entries = Array.from(this.memoryCache.entries())
    for (let i = 0; i < entries.length; i++) {
      const [key, item] = entries[i]
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp
        oldestKey = key
      }
      if (item.timestamp > newestTimestamp) {
        newestTimestamp = item.timestamp
        newestKey = key
      }
    }

    return {
      size: this.formatSize(stats.totalSize),
      items: stats.itemCount,
      hitRate: `${stats.hitRate}%`,
      oldestItem: oldestKey,
      newestItem: newestKey
    }
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.saveToPersistence()
    this.clear()
  }
}

// Cache específicos para diferentes tipos de dados
class ReservationCache extends AdvancedCacheManager {
  constructor() {
    super({
      maxItems: 500,
      defaultTTL: 15 * 60 * 1000, // 15 minutos
      persistenceKey: 'armazem_reservations_cache'
    })
  }

  setAvailability(date: string, timeSlots: any[]) {
    return this.set(`availability_${date}`, timeSlots, {
      tags: ['availability', 'reservations'],
      ttl: 10 * 60 * 1000 // 10 minutos
    })
  }

  getAvailability(date: string) {
    return this.get(`availability_${date}`)
  }

  invalidateAvailability(date?: string) {
    if (date) {
      return this.delete(`availability_${date}`)
    } else {
      return this.invalidateByTag('availability')
    }
  }
}

class MenuCache extends AdvancedCacheManager {
  constructor() {
    super({
      maxItems: 200,
      defaultTTL: 60 * 60 * 1000, // 1 hora
      persistenceKey: 'armazem_menu_cache'
    })
  }

  setMenu(category: string, items: any[]) {
    return this.set(`menu_${category}`, items, {
      tags: ['menu', category],
      ttl: 2 * 60 * 60 * 1000 // 2 horas
    })
  }

  getMenu(category: string) {
    return this.get(`menu_${category}`)
  }

  invalidateMenu(category?: string) {
    if (category) {
      return this.delete(`menu_${category}`)
    } else {
      return this.invalidateByTag('menu')
    }
  }
}

class APICache extends AdvancedCacheManager {
  private defaultTTL: number

  constructor() {
    super({
      maxItems: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      persistenceKey: 'armazem_api_cache'
    })
    this.defaultTTL = 5 * 60 * 1000 // 5 minutos
  }

  setAPIResponse(endpoint: string, params: any, response: any, ttl?: number) {
    const key = this.generateAPIKey(endpoint, params)
    return this.set(key, response, {
      tags: ['api', endpoint],
      ttl: ttl || this.defaultTTL
    })
  }

  getAPIResponse(endpoint: string, params: any) {
    const key = this.generateAPIKey(endpoint, params)
    return this.get(key)
  }

  private generateAPIKey(endpoint: string, params: any): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort())
    return `api_${endpoint}_${btoa(paramString).slice(0, 16)}`
  }

  invalidateAPI(endpoint?: string) {
    if (endpoint) {
      return this.invalidateByTag(endpoint)
    } else {
      return this.invalidateByTag('api')
    }
  }
}

// Instâncias singleton
let reservationCache: ReservationCache | null = null
let menuCache: MenuCache | null = null
let apiCache: APICache | null = null
let generalCache: AdvancedCacheManager | null = null

export function getReservationCache(): ReservationCache {
  if (!reservationCache) {
    reservationCache = new ReservationCache()
  }
  return reservationCache
}

export function getMenuCache(): MenuCache {
  if (!menuCache) {
    menuCache = new MenuCache()
  }
  return menuCache
}

export function getAPICache(): APICache {
  if (!apiCache) {
    apiCache = new APICache()
  }
  return apiCache
}

export function getGeneralCache(): AdvancedCacheManager {
  if (!generalCache) {
    generalCache = new AdvancedCacheManager()
  }
  return generalCache
}

// Hook para uso em componentes React
export function useCache(type: 'reservation' | 'menu' | 'api' | 'general' = 'general') {
  const cache = type === 'reservation' ? getReservationCache() :
                type === 'menu' ? getMenuCache() :
                type === 'api' ? getAPICache() :
                getGeneralCache()

  return {
    set: cache.set.bind(cache),
    get: cache.get.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    has: cache.has.bind(cache),
    invalidateByTag: cache.invalidateByTag.bind(cache),
    getStats: cache.getStats.bind(cache),
    getInfo: cache.getInfo.bind(cache)
  }
}

// Utilitários para cache de funções
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
    cache?: AdvancedCacheManager
  } = {}
): T {
  const cache = options.cache || getGeneralCache()
  const keyGenerator = options.keyGenerator || ((...args) => JSON.stringify(args))

  return ((...args: Parameters<T>) => {
    const key = `memoized_${fn.name}_${keyGenerator(...args)}`
    
    let result = cache.get(key)
    if (result === null) {
      result = fn(...args)
      cache.set(key, result, { ttl: options.ttl })
    }
    
    return result
  }) as T
}

export { AdvancedCacheManager, CompressionUtils }
export default getGeneralCache 