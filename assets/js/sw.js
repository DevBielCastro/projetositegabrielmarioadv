const CACHE_NAME = 'gabriel-mario-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/blog/post.html',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/blog/posts.json',
  '/assets/img/logo-dourada-transparente.webp',
  '/assets/img/logo-cinza-transparente.webp',
  '/assets/img/logo-dourada-maior-semfundo.webp',
  '/assets/img/Foto Gabriel Mario adv.png',
  '/assets/img/contratual.jpg',
  '/assets/img/medico.jpg',
  '/assets/img/tributario.jpg',
  '/assets/img/imobiliario.jpg',
  '/assets/img/administrativo.jpg',
  '/assets/img/civil.jpg',
  '/assets/img/trabalho.jpg',
  '/assets/img/previdenciario.jpg',
  '/assets/img/deficiencia.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.error('Falha na instalação do cache:', err))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorna resposta em cache se existir
        if (cachedResponse) return cachedResponse;

        // Se não estiver em cache, faz a requisição
        return fetch(event.request.clone())
          .then(response => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para armazenar no cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.error('Falha ao atualizar cache:', err));

            return response;
          })
          .catch(err => {
            console.error('Falha na requisição:', err);
            throw err; // Propaga o erro para o navegador
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});