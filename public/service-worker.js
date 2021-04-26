
const CACHE_NAME = 'budget-tracker-v1';
const DATA_CACHE_NAME = 'data-cache-v1';
const FILE_TO_CACHE = [
    '/',
    '/css/styles.css',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/js/idb.js',
    '/js/index.js',
    '/index.html',
    '/manifest.json'
];

// install
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log(`insatlling cache: ${CACHE_NAME}`);
            return cache.addAll(FILE_TO_CACHE);
        })
    )
});

// activate
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            let cacheKeeplist = [];
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map((key, i) => {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log(`deleting cache: ${keyList[i]}`);
                        return caches.delete(keyList[i]);
                    }
                })
            )
        })
    )
});


// fetch
self.addEventListener('fetch', e => {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request).then(response => {
                    if (response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }
                    return response;
                })
                    .catch(err => {
                        console.log(err);
                        return cache.match(e.request)
                    })
            })
                .catch(err => console.log(err))
        )

        return;
    }

    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request).then(response => {
                if (response) {
                    return response;
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            })
        })
    )
})