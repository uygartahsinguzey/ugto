const CACHE = "berna-v7.1-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/room.png",
  "./assets/miki-card.png",
  "./assets/nav-home.png",
  "./assets/nav-focus.png",
  "./assets/nav-agenda.png",
  "./assets/nav-miki.png",
  "./assets/nav-progress.png",
  "./assets/wallpaper.png",
  "./assets/floor.png",
  "./assets/window.png",
  "./assets/bed.png",
  "./assets/rug.png",
  "./assets/plant.png",
  "./assets/shelf.png",
  "./assets/lamp.png",
  "./assets/toy.png",
  "./assets/coin.png",
  "./assets/sun.png",
  "./assets/tomato.png",
  "./assets/cat-head.png",
  "./assets/house.png",
  "./assets/basket.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
