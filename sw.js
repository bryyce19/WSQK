const CACHE = "stranger-things-radio-v1";

const FILES = [
  "index.html",
  "style.css",
  "offline.html",
  "manifest.json",
  "assets/icon.png",
  "assets/cover.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(FILES);
    })
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;

  // Never cache the live stream
  if (url.includes("WSQK")) {
    return e.respondWith(fetch(e.request));
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(res => {
      return res || caches.match("offline.html");
    }))
  );
});
