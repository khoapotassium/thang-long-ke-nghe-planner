// Service worker: cho web mở được khi sóng yếu. Chỉ lưu tệp của chính web, không lưu dữ liệu người dùng.
const VERSION = "tlkn-v5";
const SHELL = ["./", "index.html", "styles.css", "app.js", "config.js", "privacy.html", "manifest.webmanifest",
  "favicon.svg", "icons/icon-192.png", "icons/icon-512.png", "data/events.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;   // bản đồ, đo lường, góp ý: không đụng tới
  if (url.pathname.endsWith("/google-maps-key.js")) return;
  if (url.pathname.endsWith("/data/events.json")) {
    // dữ liệu: ưu tiên bản mới nhất từ mạng, mất mạng thì dùng bản đã lưu
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put("data/events.json", copy)); return r; })
      .catch(() => caches.match("data/events.json")));
    return;
  }
  // tệp giao diện: trả bản đã lưu ngay cho nhanh, đồng thời tải bản mới về để lần mở sau dùng (sửa lỗi tự đến tay người dùng)
  e.respondWith(caches.open(VERSION).then((c) => c.match(e.request, { ignoreSearch: true }).then((hit) => {
    const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  })));
});
