const CACHE_NAME = 'colorcontrast-v2';
const CORE_ASSETS = [
	'/',
	'/css/style.css',
	'/js/app.js',
	'/js/canvas.js',
	'/js/color.js',
	'/js/contrast.js',
	'/js/image.js',
	'/js/pwa.js',
	'/js/script.js',
	'/js/toolbar.js',
	'/js/util.js',
	'/manifest.webmanifest',
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
