const CACHE_NAME = 'worm-day-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Risorse opzionali (non bloccanti)
const optionalResources = [
  './assets/images/worm_head.png',
  './assets/images/worm_body.png',
  './assets/images/star_food.png',
  './assets/images/asteroids_static.png',
  './assets/images/meteor_mobile.png',
  './assets/images/powerup_shield.png',
  './assets/images/powerup_speed.png',
  './assets/images/powerup_slow.png',
  './assets/audio/sfx_eat.mp3',
  './assets/audio/sfx_game_over.mp3',
  './assets/audio/bgm_loop.mp3',
  './images/icon-192x192.png',
  './images/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching essential files');
        // Cache solo i file essenziali durante l'installazione
        return cache.addAll(urlsToCache)
          .then(() => {
            // Prova a cachare le risorse opzionali senza bloccare
            return Promise.allSettled(
              optionalResources.map(url => 
                cache.add(url).catch(err => {
                  console.warn(`[SW] Risorsa opzionale non disponibile: ${url}`);
                })
              )
            );
          });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Restituisce dalla cache
          return response;
        }
        
        // Altrimenti cerca in rete
        return fetch(event.request)
          .then(response => {
            // Controlla se la risposta è valida
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clona la risposta
            const responseToCache = response.clone();

            // Salva nella cache per le richieste future
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.warn('[SW] Fetch failed:', error);
            // Restituisce una risposta di fallback se necessario
            return new Response('Offline - Risorsa non disponibile', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
