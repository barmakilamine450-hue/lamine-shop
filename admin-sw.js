// Lamine Pro — يتحدّث وحدو كي تكون الأنترنت، ويخدم من الذاكرة كي ما تكونش
const C = "lamine-pro-v3";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(["admin.html", "admin.webmanifest", "pro-192.png"].map(u => new Request(u, {cache: "no-cache"})))).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil((async () => {
  const ks = await caches.keys(); await Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)));
  await self.clients.claim();
  // النسخة القديمة اللي راهي محلولة: نعاودو نحلّوها بالجديدة
  const cs = await self.clients.matchAll({type: "window"});
  cs.forEach(c => { try { c.navigate(c.url); } catch (err) {} });
})()));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (u.hostname === "www.gstatic.com" && u.pathname.includes("/firebasejs/") || /zxing/.test(u.pathname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
    return;
  }
  if (u.origin !== location.origin || u.search.includes("nocache")) return;
  // الأنترنت أولا (آخر نسخة)، وإذا طوّلت ولا ما كانتش: من الذاكرة
  e.respondWith((async () => {
    const net = fetch(r.url, {cache: "no-cache", credentials: "same-origin"}).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r.url.split("?")[0], cp)); } return res; });
    const cached = await caches.match(r.url.split("?")[0]) || await caches.match(r, {ignoreSearch: true});
    if (!cached) return net;
    return Promise.race([net.catch(() => cached), new Promise(ok => setTimeout(() => ok(cached), 4000))]);
  })());
});
