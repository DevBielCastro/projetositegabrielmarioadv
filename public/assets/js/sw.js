const CACHE_VERSION = 'v4';
const CACHE_NAME = `gabriel-mario-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// Core Assets (critical para funcionamento offline)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/img/logo-dourada-transparente.webp',
  '/assets/img/logo-dourada-maior-semfundo.webp'
];

// Estratégia de Cache: Stale-While-Revalidate
const updateCache = async (request, response) => {
  const cache = await caches.open(CACHE_NAME);
  if (response && response.status === 200) {
    await cache.put(request, response.clone());
  }
  return response;
};

// Install Phase - Cache de instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache instalado:', CACHE_NAME);
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch Phase - Estratégia de rede com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignora solicitações não GET e de terceiros
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Tenta rede primeiro para HTML
        if (request.mode === 'navigate') {
          const networkResponse = await fetch(request);
          return updateCache(request, networkResponse);
        }

        // Para outros recursos: cache primeiro
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          // Atualiza cache em segundo plano
          event.waitUntil(updateCache(request, fetch(request)));
          return cachedResponse;
        }

        // Fallback para rede
        const networkResponse = await fetch(request);
        return updateCache(request, networkResponse);
      } catch (error) {
        // Fallback para página offline
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
        return new Response('', { status: 503 });
      }
    })()
  );
});

// Activate Phase - Limpeza de cache antigo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('gabriel-mario-')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Comunicação com o client (atualizações)
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});