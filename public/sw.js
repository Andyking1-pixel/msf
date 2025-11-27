// Nombre del caché (si cambias cosas grandes, súbele la versión)
const CACHE_NAME = "msf-cache-v1";

// Archivos que vamos a cachear para que funcione offline
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// INSTALACIÓN: se guarda en caché la "shell" de la app
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ACTIVACIÓN: limpiar versiones viejas del caché
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// FETCH: primero buscamos en caché, si no hay, vamos a la red
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Para la API, mejor ir siempre a la red
  if (request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request);
    })
  );
});

