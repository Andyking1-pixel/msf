// Versión del caché (puedes subirla cuando hagas cambios grandes)
const CACHE_NAME = "msf-cache-v3";

// Archivos base que queremos tener cacheados para offline
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// INSTALACIÓN: precache de assets base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Saltar la fase de "espera" y activar el SW nuevo lo antes posible
  self.skipWaiting();
});

// ACTIVACIÓN: limpiar versiones viejas de caché y tomar control de las páginas abiertas
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

  // Hacer que el SW nuevo controle inmediatamente todas las pestañas
  return self.clients.claim();
});

// Estrategia NETWORK FIRST para HTML/CSS/JS importantes
// y CACHE FIRST para el resto (imágenes, etc.)
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // No interceptar llamadas a la API: que vayan directo a la red
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Peticiones de navegación (HTML) -> network first
  if (
    request.mode === "navigate" ||
    url.pathname === "/" ||
    url.pathname === "/index.html"
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CSS y JS principales -> network first también, para que se actualicen solos
  if (url.pathname === "/styles.css" || url.pathname === "/app.js") {
    event.respondWith(networkFirst(request));
    return;
  }

  // El resto (iconos, imágenes, etc.) -> cache first
  event.respondWith(cacheFirst(request));
});

// =============== Estrategias de caché ===============

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // Si la respuesta es válida, actualizamos caché
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Si falla la red, intentamos sacar del caché
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Si ni red ni caché, devolvemos una respuesta vacía controlada
    return new Response("Sin conexión y sin caché disponible.", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  // Si no está en caché, lo bajamos de la red y lo guardamos
  const networkResponse = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}

