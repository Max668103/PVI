// Ім'я кешу
const CACHE_NAME = "pwa-cache-v1";

// Масив ресурсів для кешування
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
  `./js/main.js`,
  `./js/students.js`,

  // Зображення
  `./images/avatar_max.jpg`,
  `./images/bell.png`,
  `./images/cross.png`,
  `./images/pencil.png`,
  `./images/warning-sign.png`,

  // Іконки з manifest.json
  `./images/icon-128.png`,
  `./images/icon-192.png`,
  `./images/icon-256.png`,
  `./images/icon-512.png`,

  // Скріншоти з manifest.json
  `./images/screenshot1.png`,
  `./images/screenshot2.png`
];

// Подія встановлення Service Worker
// Відбувається при першому запуску або коли SW оновлюється
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Кешування ресурсів...");// логування не обовязкове
      // Додаємо файли до кешу, якщо якийсь файл не вдасться завантажити, обробляємо помилку
      return cache.addAll(ASSETS).catch(console.error);
    })
  );
});

// Подія обробки запитів від клієнта (браузера)
// Якщо файл є в кеші – повертаємо його, інакше робимо запит до мережі
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Запит до мережі, якщо ресурсу немає в кеші
        const networkFetch = fetch(event.request).then((networkResponse) => {
          // Зберігаємо отриманий файл у кеш для майбутніх запитів
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Повертаємо кешовану версію, якщо вона є, інакше робимо запит до мережі
        return cachedResponse || networkFetch;
      });
    })
  );
});

// Подія активації Service Worker
// Видаляє старі кеші, які більше не використовуються
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // Знаходимо старі кеші
          .map((key) => caches.delete(key))   // Видаляємо їх
      );
    }).then(() => {
      console.log("Новий Service Worker активовано.");
      return self.clients.claim(); // Переключаємо новий SW для всіх вкладок
    })
  );
});
