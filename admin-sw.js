// Lamine Pro — يخلّي البرنامج يتحل حتى بلا أنترنت
const C = "lamine-pro-v1";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(["admin.html", "admin.webmanifest", "pro-192.png"])).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (u.hostname === "www.gstatic.com" && u.pathname.includes("/firebasejs/") || /zxing/.test(u.pathname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
});
