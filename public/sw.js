const version = 'v6.8';
const STATIC_CACHE = `static-${version}`;
const DYNAMIC_CACHE = `dynamic-${version}`;
const STATIC_FILES = [
  '/',
  '/offline.html',
  '/index.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/material.min.js',
  '/src/css/feed.css',
  '/src/css/app.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then((res) => {
//             return caches.open(DYNAMIC_CACHE).then((cache) => {
//               cache.put(event.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch((err) => {
//             return caches.open(STATIC_CACHE).then((cache) => {
//               return cache.match('/offline.html');
//             });
//           });
//       }
//     })
//   );
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((res) => {
//         return caches.open(DYNAMIC_CACHE).then((cache) => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch((err) => {
//         return caches.match(event.request);
//       })
//   );
// });
const httpGetBin = 'https://httpbin.org/get';
function isAStaticResource(val) {
  let cachePath = '';
  if (val.indexOf(self.origin) === 0) {
    cachePath = val.substring(self.origin.length);
  } else {
    cachePath = val;
  }
  return STATIC_FILES.indexOf(cachePath) > -1;
}
self.addEventListener('fetch', (event) => {
  if (event.request.url.indexOf(httpGetBin) > -1) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(function (cache) {
        return fetch(event.request).then((res) => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
    );
  } else if (isAStaticResource(event.request.url)) {
    console.log('i am here');
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then((res) => {
              return caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch((err) => {
              return caches.open(STATIC_CACHE).then((cache) => {
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline.html');
                }
              });
            });
        }
      })
    );
  }
});
