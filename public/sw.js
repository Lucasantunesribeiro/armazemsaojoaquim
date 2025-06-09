const CACHE_NAME = 'armazem-sao-joaquim-v3'
const STATIC_CACHE_NAME = 'armazem-static-v3'
const DYNAMIC_CACHE_NAME = 'armazem-dynamic-v3'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/images/hero-1.jpg',
  '/images/armazem-logo.webp',
  // Add your critical CSS and JS files here
]

// Dynamic assets patterns
const CACHE_PATTERNS = {
  images: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  fonts: /\.(woff|woff2|ttf|eot)$/i,
  api: /\/api\//,
  pages: /\/(menu|blog|reservas|auth)/
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
      }),
      self.skipWaiting() // Activate immediately
    ])
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim() // Take control immediately
    ])
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip cross-origin requests and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return
  }
  
  // Route different types of requests
  if (CACHE_PATTERNS.api.test(url.pathname)) {
    event.respondWith(handleApiRequest(request))
  } else if (CACHE_PATTERNS.images.test(url.pathname)) {
    event.respondWith(handleImageRequest(request))
  } else if (CACHE_PATTERNS.fonts.test(url.pathname)) {
    event.respondWith(handleFontRequest(request))
  } else if (url.pathname.includes('/_next/static/')) {
    event.respondWith(handleStaticAssetRequest(request))
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
  } else {
    event.respondWith(handleOtherRequest(request))
  }
})

// API requests - Network first, cache fallback
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('API network failed, trying cache:', error)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'No network connection' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Image requests - Cache first, network fallback
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Image fetch failed:', error)
    // Return placeholder image
    return caches.match('/images/placeholder.jpg') || 
           new Response('', { status: 404 })
  }
}

// Font requests - Cache first with long-term storage
async function handleFontRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Font fetch failed:', error)
    return new Response('', { status: 404 })
  }
}

// Static assets (JS, CSS) - Cache first with network update
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request)
  
  // Return cached version immediately
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(STATIC_CACHE_NAME).then(cache => {
          cache.put(request, response)
        })
      }
    }).catch(() => {}) // Ignore errors
    
    return cachedResponse
  }
  
  // If not cached, fetch from network
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Static asset fetch failed:', error)
    return new Response('', { status: 404 })
  }
}

// Navigation requests - Network first with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Navigation request failed, serving offline page:', error)
    
    // Try to serve cached version first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Serve offline page as fallback
    return caches.match('/offline.html') || 
           new Response('Offline', { status: 503 })
  }
}

// Other requests - Network first
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Other request failed:', error)
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('', { status: 404 })
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  switch (event.tag) {
    case 'sync-reservas':
      event.waitUntil(syncReservas())
      break
    case 'sync-newsletter':
      event.waitUntil(syncNewsletter())
      break
  }
})

async function syncReservas() {
  try {
    const pendingReservas = await getPendingReservas()
    
    for (const reserva of pendingReservas) {
      try {
        const response = await fetch('/api/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reserva.data)
        })
        
        if (response.ok) {
          await removePendingReserva(reserva.id)
        }
      } catch (error) {
        console.log('Failed to sync reserva:', error)
      }
    }
  } catch (error) {
    console.log('Sync reservas failed:', error)
  }
}

async function syncNewsletter() {
  try {
    const pendingSubscriptions = await getPendingNewsletterSubscriptions()
    
    for (const subscription of pendingSubscriptions) {
      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.data)
        })
        
        if (response.ok) {
          await removePendingNewsletterSubscription(subscription.id)
        }
      } catch (error) {
        console.log('Failed to sync newsletter subscription:', error)
      }
    }
  } catch (error) {
    console.log('Sync newsletter failed:', error)
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  const options = {
    body: 'Nova mensagem do Armazém São Joaquim',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icon-72.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.data.url = data.url || options.data.url
  }
  
  event.waitUntil(
    self.registration.showNotification('Armazém São Joaquim', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'close') {
    return
  }
  
  const url = event.notification.data.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if window is already open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanupOldCaches())
  }
})

// Helper functions for IndexedDB operations
async function getPendingReservas() {
  // Implementation would use IndexedDB
  return []
}

async function removePendingReserva(id) {
  // Implementation would use IndexedDB
}

async function getPendingNewsletterSubscriptions() {
  // Implementation would use IndexedDB
  return []
}

async function removePendingNewsletterSubscription(id) {
  // Implementation would use IndexedDB
}

// Cache cleanup
async function cleanupOldCaches() {
  const cacheNames = await caches.keys()
  const oldCaches = cacheNames.filter(name => 
    !name.includes('v3') && name.startsWith('armazem-')
  )
  
  return Promise.all(oldCaches.map(name => caches.delete(name)))
}

// Error handler
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason)
})

console.log('[SW] Service Worker v3 loaded successfully') 