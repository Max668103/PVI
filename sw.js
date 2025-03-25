// Ім'я кешу
const CACHE_NAME = "pwa-cache-v1";

// Отримуємо кореневий шлях (для підтримки GitHub Pages)
const BASE_URL = self.location.origin;

// Масив ресурсів для кешування
const ASSETS = [
  `${BASE_URL}/`,                      
  `${BASE_URL}/index.html`,
  `${BASE_URL}/messages.html`,
  `${BASE_URL}/students.html`,
  `${BASE_URL}/tasks.html`,
  
  // CSS файли
  `${BASE_URL}/css/main.css`,
  `${BASE_URL}/css/students.css`,

  // JavaScript файли
  `${BASE_URL}/js/main.js`,
  `${BASE_URL}/js/students.js`,

  // Зображення
  `${BASE_URL}/images/avatar_max.jpg`,
  `${BASE_URL}/images/bell.png`,
  `${BASE_URL}/images/cross.png`,
  `${BASE_URL}/images/pencil.png`,
  `${BASE_URL}/images/warning-sign.png`,

  // Іконки з manifest.json
  `${BASE_URL}/images/icon-128.png`,
  `${BASE_URL}/images/icon-192.png`,
  `${BASE_URL}/images/icon-256.png`,
  `${BASE_URL}/images/icon-512.png`,

  // Скріншоти з manifest.json
  `${BASE_URL}/images/screenshot1.png`,
  `${BASE_URL}/images/screenshot2.png`
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
