// Nombre del caché y lista de archivos a precachear
const CACHE_NAME = 'stealth-pwa-cache-v1';
const urlsToCache = [
    './', // Ruta principal
    'index.html', // Archivo HTML principal
    'stealth_manifest.json', // Archivo Manifest
    'https://cdn.tailwindcss.com' // Librería Tailwind CSS
];

// Evento 'install': se ejecuta la primera vez que se carga la PWA
self.addEventListener('install', (event) => {
    // Espera hasta que el caché se abra y todos los archivos estén precacheados
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Pre-caching de recursos esenciales.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento 'fetch': intercepta todas las peticiones de red
self.addEventListener('fetch', (event) => {
    // Si la petición es a la API local (la IP del ESP32), NO la cacheamos.
    // Simplemente la dejamos pasar, ya que debe ir a la red.
    if (event.request.url.startsWith('http://192.168.4.1')) {
        return;
    }
    
    // Para el resto de peticiones (HTML, JS, CSS, etc.):
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 1. Si el recurso está en caché, lo servimos desde ahí.
                if (response) {
                    return response;
                }

                // 2. Si no está en caché, lo buscamos en la red.
                return fetch(event.request);
            })
    );
});

// Evento 'activate': Limpia cachés antiguos para que la nueva versión se active
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
