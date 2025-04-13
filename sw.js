// Ім'я кешу
const CACHE_NAME = "pwa-cache-v1";

const ASSETS = [
  `./`,                      
  `./index.html`,
  `./messages.html`,
  `./students.html`,
  `./tasks.html`,
  
  // CSS файли
  `./css/main.css`,
  `./css/students.css`,

  // JavaScript файли
  `./js/students.js`,
  `./js/main.js`,
  
  // Зображення
  `./images/avatar_max.jpg`,
  `./images/bell.png`,
  `./images/cross.png`,
  `./images/pencil.png`,
  `./images/warning-sign.png`,

  // Іконки
  `./images/icon-128.png`,
  `./images/icon-192.png`,
  `./images/icon-256.png`,
  `./images/icon-512.png`,

  // Скріншоти
  `./images/screenshot1.png`,
  `./images/screenshot2.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Кешування ресурсів...");
      return cache.addAll(ASSETS).catch(console.error);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || networkFetch;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => {
      console.log("Новий Service Worker активовано.");
      return self.clients.claim();
    })
  );
});
