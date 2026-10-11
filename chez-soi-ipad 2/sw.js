/* Chez Soi : tout est mis en cache pour marcher sans réseau. */
const CACHE = "chez-soi-v4";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./config.js", "./manifest.webmanifest",
  "./audio-alt/chime.mp3",
  "./audio-alt/rappel-matin.mp3",
  "./audio-alt/rappel-midi.mp3",
  "./audio-alt/rappel-soir.mp3",
  "./audio-alt/rappel2-matin.mp3",
  "./audio-alt/rappel2-midi.mp3",
  "./audio-alt/rappel2-soir.mp3",
  "./audio-alt/urgence.mp3",
  "./audio/chime.mp3",
  "./audio/rappel-matin.mp3",
  "./audio/rappel-midi.mp3",
  "./audio/rappel-soir.mp3",
  "./audio/rappel2-matin.mp3",
  "./audio/rappel2-midi.mp3",
  "./audio/rappel2-soir.mp3",
  "./audio/urgence.mp3",
  "./fonts/AtkinsonHyperlegible-400-latin-ext.woff2",
  "./fonts/AtkinsonHyperlegible-400-latin.woff2",
  "./fonts/AtkinsonHyperlegible-400i-latin-ext.woff2",
  "./fonts/AtkinsonHyperlegible-400i-latin.woff2",
  "./fonts/AtkinsonHyperlegible-700-latin-ext.woff2",
  "./fonts/AtkinsonHyperlegible-700-latin.woff2",
  "./fonts/BricolageGrotesque-700-latin-ext.woff2",
  "./fonts/BricolageGrotesque-700-latin.woff2",
  "./fonts/fonts.css",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/logo-inverse.svg",
  "./icons/logo.svg",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Fichiers de l'app : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
        .catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
    return;
  }
});
