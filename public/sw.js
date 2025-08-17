
const CACHE_NAME = 'ja-automoveis-v2';
const STATIC_CACHE = 'ja-automoveis-static-v2';
const DYNAMIC_CACHE = 'ja-automoveis-dynamic-v2';
const IMAGE_CACHE = 'ja-automoveis-images-v2';

// URLs para cache estático (CSS, JS, fontes)
const STATIC_URLS = [
  '/',
  '/assets/logo.png',
  '/assets/favicon-32x32.png',
  '/assets/homepageabout.webp'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'network-first',
  IMAGES: 'cache-first',
  API: 'network-first'
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_URLS)),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE)
    ])
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para navegação (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache da resposta de navegação
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
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
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(fetchResponse => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(IMAGE_CACHE).then(cache => {
                  cache.put(request, responseClone);
                });
              }
              return fetchResponse;
            });
        })
    );
    return;
  }

  // Estratégia para API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Estratégia para assets estáticos
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(fetchResponse => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE).then(cache => {
                  cache.put(request, responseClone);
                });
              }
              return fetchResponse;
            });
        })
    );
    return;
  }

  // Estratégia padrão: network-first
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background sync para funcionalidades offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronização em background
  console.log('Background sync executed');
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
  }
});

async function syncContent() {
  try {
    // Sincronizar dados em background
    const response = await fetch('/api/vehicles?limit=10');
    if (response.ok) {
      const data = await response.json();
      // Armazenar dados para uso offline
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put('/api/vehicles/recent', new Response(JSON.stringify(data)));
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}
