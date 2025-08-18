
const CACHE_NAME = 'ja-automoveis-v3';
const STATIC_CACHE = 'ja-automoveis-static-v3';
const DYNAMIC_CACHE = 'ja-automoveis-dynamic-v3';
const IMAGE_CACHE = 'ja-automoveis-images-v3';
const API_CACHE = 'ja-automoveis-api-v3';

// URLs para cache estático (CSS, JS, fontes)
const STATIC_URLS = [
  '/',
  '/assets/logo.png',
  '/assets/favicon-32x32.png',
  '/assets/homepageabout.webp'
];

// Estratégias de cache avançadas
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'stale-while-revalidate',
  IMAGES: 'cache-first',
  API: 'network-first',
  CRITICAL: 'cache-first'
};

// Configurações de cache por tipo de recurso
const CACHE_CONFIG = {
  STATIC: { ttl: 86400 * 30 }, // 30 dias
  IMAGES: { ttl: 86400 * 7 },  // 7 dias
  API: { ttl: 300 },           // 5 minutos
  DYNAMIC: { ttl: 3600 }       // 1 hora
};

// Lista de APIs críticas para cache
const CRITICAL_APIS = [
  '/api/vehicles',
  '/api/vehicles/stats',
  '/api/categories'
];

// Lista de imagens para pré-cache
const PRELOAD_IMAGES = [
  '/assets/logo.png',
  '/assets/favicon-32x32.png',
  '/assets/homepageabout.webp'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_URLS);
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Função para verificar se o cache expirou
function isCacheExpired(cacheTime, ttl) {
  return Date.now() - cacheTime > ttl * 1000;
}

// Função para obter timestamp do cache
async function getCacheTimestamp(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const response = await cache.match(request);
  if (response) {
    const timestamp = response.headers.get('x-cache-timestamp');
    return timestamp ? parseInt(timestamp) : 0;
  }
  return 0;
}

// Estratégia stale-while-revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Retorna cache imediatamente se disponível
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      const responseClone = response.clone();
      // Adiciona timestamp ao cache
      const headers = new Headers(response.headers);
      headers.set('x-cache-timestamp', Date.now().toString());
      const cachedResponse = new Response(responseClone.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      cache.put(request, cachedResponse);
    }
    return response;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Estratégia network-first com fallback
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const responseClone = response.clone();
      const headers = new Headers(response.headers);
      headers.set('x-cache-timestamp', Date.now().toString());
      const cachedResponse = new Response(responseClone.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Estratégia cache-first
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const responseClone = response.clone();
      const headers = new Headers(response.headers);
      headers.set('x-cache-timestamp', Date.now().toString());
      const cachedResponse = new Response(responseClone.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    throw error;
  }
}

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Estratégia para navegação (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache da resposta de navegação
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            const headers = new Headers(responseClone.headers);
            headers.set('x-cache-timestamp', Date.now().toString());
            const cachedResponse = new Response(responseClone.body, {
              status: responseClone.status,
              statusText: responseClone.statusText,
              headers
            });
            cache.put(request, cachedResponse);
          });
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Estratégia para imagens
  if (request.destination === 'image') {
    event.respondWith(
      cacheFirst(request, IMAGE_CACHE)
        .catch(() => {
          // Fallback para placeholder ou ícone padrão
          return caches.match('/assets/placeholder.png');
        })
    );
    return;
  }

  // Estratégia para APIs
  if (url.pathname.startsWith('/api/')) {
    // APIs críticas usam stale-while-revalidate
    if (CRITICAL_APIS.some(api => url.pathname.startsWith(api))) {
      event.respondWith(staleWhileRevalidate(request, API_CACHE));
    } else {
      // Outras APIs usam network-first
      event.respondWith(networkFirst(request, API_CACHE));
    }
    return;
  }

  // Estratégia para assets estáticos
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Estratégia para fontes
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Estratégia padrão: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// Background sync para funcionalidades offline
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  } else if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar dados críticos
    const responses = await Promise.allSettled([
      fetch('/api/vehicles?limit=20'),
      fetch('/api/categories'),
      fetch('/api/vehicles/stats')
    ]);

    const cache = await caches.open(API_CACHE);
    
    responses.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.status === 200) {
        const response = result.value;
        const responseClone = response.clone();
        const headers = new Headers(response.headers);
        headers.set('x-cache-timestamp', Date.now().toString());
        const cachedResponse = new Response(responseClone.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
        
        const urls = ['/api/vehicles/recent', '/api/categories', '/api/vehicles/stats'];
        cache.put(urls[index], cachedResponse);
      }
    });

    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncContent() {
  try {
    // Sincronizar conteúdo dinâmico
    const response = await fetch('/api/vehicles?limit=50');
    if (response.ok) {
      const data = await response.json();
      const cache = await caches.open(DYNAMIC_CACHE);
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set('x-cache-timestamp', Date.now().toString());
      
      const cachedResponse = new Response(JSON.stringify(data), {
        status: 200,
        headers
      });
      
      await cache.put('/api/vehicles/content', cachedResponse);
    }
  } catch (error) {
    console.log('Content sync failed:', error);
  }
}

async function syncAnalytics() {
  try {
    // Sincronizar analytics offline
    const analyticsData = await getOfflineAnalytics();
    if (analyticsData.length > 0) {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData)
      });
      await clearOfflineAnalytics();
    }
  } catch (error) {
    console.log('Analytics sync failed:', error);
  }
}

// Funções para analytics offline
async function getOfflineAnalytics() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const response = await cache.match('/offline-analytics');
  if (response) {
    return response.json();
  }
  return [];
}

async function clearOfflineAnalytics() {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.delete('/offline-analytics');
}

// Push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'JA Automóveis',
    body: 'Nova atualização disponível!',
    icon: '/assets/logo.png',
    badge: '/assets/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver mais',
        icon: '/assets/favicon-32x32.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/assets/favicon-32x32.png'
      }
    ]
  };

  // Se há dados específicos na notificação
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Interceptar cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
    return;
  } else {
    // Clique na notificação principal
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Se já há uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url.includes(event.notification.data.url || '/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não há janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
    );
  }
});

// Interceptar fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Periodic background sync (para atualizações automáticas)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Limpeza periódica de cache
async function cleanupCache() {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const timestamp = response.headers.get('x-cache-timestamp');
        if (timestamp) {
          const cacheTime = parseInt(timestamp);
          const ttl = getTTLForCache(cacheName);
          
          if (isCacheExpired(cacheTime, ttl)) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}

function getTTLForCache(cacheName) {
  switch (cacheName) {
    case STATIC_CACHE:
      return CACHE_CONFIG.STATIC.ttl;
    case IMAGE_CACHE:
      return CACHE_CONFIG.IMAGES.ttl;
    case API_CACHE:
      return CACHE_CONFIG.API.ttl;
    case DYNAMIC_CACHE:
      return CACHE_CONFIG.DYNAMIC.ttl;
    default:
      return 3600;
  }
}

// Executar limpeza de cache a cada 24 horas
setInterval(cleanupCache, 24 * 60 * 60 * 1000);
