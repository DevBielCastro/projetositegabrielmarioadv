// Define nome e versão do cache para controle de armazenamento
const CACHE_NAME = 'gabriel-mario-v3';
// Lista de recursos essenciais para funcionamento offline
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

// Evento de instalação: pré-cache dos recursos listados
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.error('Falha na instalação do cache:', err))
  );
});

// Intercepta requisições de rede e implementa estratégia de cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se resposta estiver no cache, retorna imediatamente
        if (cachedResponse) return cachedResponse;

        // Caso contrário, busca na rede
        return fetch(event.request.clone())
          .then(response => {
            // Verifica validade da resposta antes de armazenar
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona resposta e atualiza o cache em segundo plano
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.error('Falha ao atualizar cache:', err));

            return response;
          })
          .catch(err => {
            console.error('Falha na requisição:', err);
            // Propaga erro para fallback de navegador (ex.: mostrar offline.html)
            throw err;
          });
      })
  );
});

// Evento de ativação: remove caches antigos para liberar espaço
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
});
