/// <reference lib="webworker" />
const PRECACHE = 'precache-v1';
let warmupDone = false;
const counters = { hits: 0, misses: 0, requests: 0 };
let pending = { hits: 0, misses: 0, requests: 0 };

const nowUs = () => Math.round((performance.timeOrigin + performance.now()) * 1000);

const keyFrom = (u) => {
  const { pathname, search } = new URL(u, self.location.origin);
  return pathname + (search || '');
};

const sendNote = (msg) => {
  const ts = nowUs();
  fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ts, msg }),
    keepalive: true,
    cache: 'no-store',
  }).catch(() => {});
};

self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (e) =>
  e.waitUntil(self.clients.claim())
);

// Schedule via Message
self.addEventListener('message', (e) => {
  const d = e.data || {};
  const reply = (x) => e.ports?.[0]?.postMessage(x);

  if (d.type === 'TRIGGER_WARMUP') {
    const delay = Number(d.delayMs) || 5000;
    setTimeout(() => { doWarmup(); }, delay);
    return reply({ ok: true });
  }

  if (d.type === 'GET_COUNTERS') {
    return reply({ ...counters });
  }
});

async function doWarmup() {
  if (warmupDone) return;
  const res = await fetch('/api/predicting-user/cache-plan', { cache: 'no-store' });
  if (!res.ok) return;
  /** @type {string[]} */
  const items = await res.json();

  const cache = await caches.open(PRECACHE);
  for (const u of items) {
    const abs = new URL(u, self.location.origin).toString();
    const resp = await fetch(abs, { cache: 'no-store', headers: { 'x-sw-warmup': '1' } });
    if (resp.ok) await cache.put(new Request(keyFrom(u)), resp.clone());
  }
  warmupDone = true;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    counters.requests++;

    const key = keyFrom(req.url);
    const cache = await caches.open(PRECACHE);

    const cached = await cache.match(new Request(key), { ignoreVary: true });
    if (cached) {
      counters.hits++;
      return cached;
    }

    counters.misses++;
    return fetch(req);
  })());
});