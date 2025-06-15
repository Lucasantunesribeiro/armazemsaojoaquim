// Service Worker para Armazém São Joaquim
// Versão: 2.0.0

const CACHE_NAME = 'armazem-sao-joaquim-v2'
const STATIC_CACHE = 'static-v2'
const DYNAMIC_CACHE = 'dynamic-v2'
const IMAGE_CACHE = 'images-v2'

// Recursos para cache imediato
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/_next/static/css/',
  '/_next/static/chunks/',
]

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First - para recursos estáticos
  CACHE_FIRST: 'cache-first',
  // Network First - para dados dinâmicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - para imagens e recursos
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
}

// Configurações de cache por tipo de recurso
const CACHE_CONFIG = {
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 ano
    maxEntries: 100,
  },
  api: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000, // 5 minutos
    maxEntries: 50,
  },
  images: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    maxEntries: 200,
  },
  pages: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 24 * 60 * 60 * 1000, // 1 dia
    maxEntries: 50,
  },
}

// Utilitários
const isStaticAsset = (url) => {
  return url.includes('/_next/static/') || 
         url.includes('/favicon') ||
         url.includes('/manifest.json')
}

const isImage = (url) => {
  return url.includes('/images/') || 
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url)
}

const isApiRequest = (url) => {
  return url.includes('/api/')
}

const isNavigationRequest = (request) => {
  return request.mode === 'navigate'
}

// Limpar caches antigos
const cleanupCaches = async () => {
  const cacheNames = await caches.keys()
  const oldCaches = cacheNames.filter(name => 
    !name.includes('v2') && 
    (name.includes('armazem') || name.includes('static') || name.includes('dynamic') || name.includes('images'))
  )
  
  return Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  )
}

// Gerenciar tamanho do cache
const manageCacheSize = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(
      keysToDelete.map(key => cache.delete(key))
    )
  }
}

// Estratégia Cache First
const cacheFirst = async (request, cacheName, maxAge) => {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('date'))
    const now = new Date()
    
    if (now - cachedDate < maxAge) {
      return cachedResponse
    }
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Estratégia Network First
const networkFirst = async (request, cacheName, maxAge) => {
  const cache = await caches.open(cacheName)
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await cache.match(request)
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Estratégia Stale While Revalidate
const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => null)
  
  return cachedResponse || await fetchPromise || new Response('Offline', { status: 503 })
}

// Event Listeners
self.addEventListener('install', (event) => {
  console.log('SW: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  console.log('SW: Activating...')
  
  event.waitUntil(
    Promise.all([
      cleanupCaches(),
      self.clients.claim()
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requests não-GET
  if (request.method !== 'GET') return
  
  // Ignorar requests de extensões do browser
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return
  
  event.respondWith(
    (async () => {
      try {
        // Recursos estáticos
        if (isStaticAsset(url.href)) {
          await manageCacheSize(STATIC_CACHE, CACHE_CONFIG.static.maxEntries)
          return cacheFirst(request, STATIC_CACHE, CACHE_CONFIG.static.maxAge)
        }
        
        // Imagens
        if (isImage(url.href)) {
          await manageCacheSize(IMAGE_CACHE, CACHE_CONFIG.images.maxEntries)
          return staleWhileRevalidate(request, IMAGE_CACHE)
        }
        
        // API requests
        if (isApiRequest(url.href)) {
          await manageCacheSize(DYNAMIC_CACHE, CACHE_CONFIG.api.maxEntries)
          return networkFirst(request, DYNAMIC_CACHE, CACHE_CONFIG.api.maxAge)
        }
        
        // Navegação (páginas)
        if (isNavigationRequest(request)) {
          await manageCacheSize(DYNAMIC_CACHE, CACHE_CONFIG.pages.maxEntries)
          try {
            return await staleWhileRevalidate(request, DYNAMIC_CACHE)
          } catch (error) {
            return caches.match('/offline.html')
          }
        }
        
        // Outros recursos
        return staleWhileRevalidate(request, DYNAMIC_CACHE)
        
      } catch (error) {
        console.error('SW: Fetch error:', error)
        
        // Fallback para navegação
        if (isNavigationRequest(request)) {
          return caches.match('/offline.html')
        }
        
        return new Response('Service Worker Error', { status: 500 })
      }
    })()
  )
})

// Background Sync para formulários offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implementar sincronização de dados offline
      console.log('SW: Background sync triggered')
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'armazem-notification',
        requireInteraction: false,
        actions: [
          {
            action: 'view',
            title: 'Ver detalhes'
          },
          {
            action: 'dismiss',
            title: 'Dispensar'
          }
        ]
      })
    )
  }
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    // Verificar se ports existe antes de usar
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: CACHE_NAME })
    } else if (event.source) {
      // Fallback para usar event.source se ports não estiver disponível
      event.source.postMessage({ version: CACHE_NAME })
    }
    return
  }
})

console.log('SW: Service Worker loaded successfully') 