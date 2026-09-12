const CACHE_NAME = 'colorcontrast-3f3e263bb161';
const CORE_ASSETS = [
	'/',
	'/js/app.bundle.js',
	'/manifest.webmanifest',
	'/img/brand/forlaens-circle-mark.svg',
	'/img/social-card.png',
	'/img/favicon/android-chrome-192x192.png',
	'/img/favicon/android-chrome-512x512.png'
];

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			return cache.addAll(CORE_ASSETS);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(names) {
			return Promise.all(names.map(function(name) {
				if (name !== CACHE_NAME) {
					return caches.delete(name);
				}
				return null;
			}));
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', function(event) {
	if (event.request.method !== 'GET') {
		return;
	}

	event.respondWith(
		fetch(event.request).then(function(response) {
			if (response.ok && new URL(event.request.url).origin === self.location.origin) {
				const responseCopy = response.clone();

				caches.open(CACHE_NAME).then(function(cache) {
					cache.put(event.request, responseCopy);
				});
			}

			return response;
		}).catch(function() {
			return caches.match(event.request);
		})
	);
});
