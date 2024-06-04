importScripts('/src/js/idb.js');
importScripts('/src/js/util.js');
const version = 'v7.12.6';
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
  '/src/js/idb.js',
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
function trimCache(cacheName, maxItems) {
  // it is good to trim the cache and have only limited items in it
  // dynamic cache can go up and up
  // having a LRU cache algo to handle cache size is best
}

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

const httpGetBin = 'http://localhost:3000/posts';
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
      fetch(event.request).then((res) => {
        var clonedResp = res.clone();
        clearStorage('posts')
          .then(() => {
            return clonedResp.json();
          })
          .then((data) => {
            for (const key in data) {
              deleteItemFromData('posts', key).then(() => {
                writeData('posts', data[key]);
              });
            }
          });
        return res;
      })
    );
  } else if (isAStaticResource(event.request.url)) {
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
                trimCache(DYNAMIC_CACHE, 3);
                cache.put(event.request.url, res.clone()).catch(() => {});
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

self.addEventListener('sync', function (event) {
  console.log('BG syncing....');
  if (event.tag === 'sync-new-posts') {
    console.log('[Service worker] Syncing new posts....');
    const r = readAllData('sync-posts').then((data) => {
      for (const dt of data) {
        fetch(httpGetBin, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            id: dt.id,
            title: dt.title,
            location: dt.location,
            image:
              'https://fastly.picsum.photos/id/952/200/300.jpg?hmac=TxmAKrqJEDerU9Oz17usv5fHJ4ibYOWOvLK4Q3Z0ytc',
          }),
        })
          .then((res) => {
            console.log('Send data', res);
            if (res.ok) {
              deleteItemFromData('sync-posts', dt.id);
            }
          })
          .catch(function (err) {
            console.log('Error while sending data', err);
          });
      }
    });
    event.waitUntil(r);
  }
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  console.log({ notification, action });
  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed', event);
});

self.addEventListener('push', function (event) {
  console.log('push notification rec...', event);
  let data = { title: 'Some dummy', content: 'Dummy' };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  const options = {
    body: data.content,
    id: data.content,
    icon: '/src/images/icons/app-icon-96x96.png',
    image: '/src/images/icons/app-icon-96x96.png',
    dir: 'ltr',
    lang: 'en-US',
    vibrate: [100, 50, 200],
    badge: '/src/images/icons/app-icon-96x96.png',
    tag: 'confirm-notification',
    renotify: true,
    actions: [
      {
        action: 'confirm',
        title: 'Okay',
        icon: '/src/images/icons/app-icon-96x96.png',
      },
      {
        action: 'cancel',
        title: 'Cancel',
        icon: '/src/images/icons/app-icon-96x96.png',
      },
    ],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
