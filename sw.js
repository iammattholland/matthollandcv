const CACHE_NAME = 'cv-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/Matt.webp',
    '/Car.webp',
    '/CarHeadlights.webp',
    '/CityofCambridgeLogo.webp',
    '/CRHlogo.webp',
    '/Hatch.webp',
    '/LinkedInIcon.webp',
    '/Favicon.webp'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 