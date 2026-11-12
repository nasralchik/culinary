const CACHE_NAME = 'culinary-library-v1'

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const root = new URL('./', self.registration.scope).href
    await cache.addAll([
      root,
      new URL('manifest.webmanifest', root).href,
      new URL('icon.svg', root).href,
      new URL('icon-192.png', root).href,
      new URL('icon-512.png', root).href,
    ])
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames
      .filter((name) => name.startsWith('culinary-library-') && name !== CACHE_NAME)
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const requestUrl = new URL(request.url)
  if (requestUrl.origin !== self.location.origin) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    try {
      const networkResponse = await fetch(request)
      if (networkResponse.ok) await cache.put(request, networkResponse.clone())
      return networkResponse
    } catch {
      if (cachedResponse) return cachedResponse
      if (request.mode === 'navigate') {
        return (await cache.match(new URL('./', self.registration.scope).href)) ?? Response.error()
      }
      return Response.error()
    }
  })())
})
