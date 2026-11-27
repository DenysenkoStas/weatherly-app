/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Installable app; the service worker precaches the built files, so the app also starts offline
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Weatherly',
        short_name: 'Weatherly',
        description: 'A weather app with city search, geolocation, and 7-day forecast.',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Weather: network first, so online the data is always fresh and the saved copy is only
        // for when the request fails. Workbox serializes these functions into the service worker, so each
        // must be self-contained (no outside variables or imports).
        runtimeCaching: [
          {
            // The main forecast only; the favorites' temperatures (no `daily`) stay uncached
            urlPattern: ({ url }) =>
              url.hostname === 'api.open-meteo.com' && url.searchParams.has('daily'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-forecast',
              expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
              plugins: [
                {
                  // Rounded like the page link (?lat=…&lon=…): a city opened from search and
                  // the same city reopened from the rounded link must find the same copy
                  cacheKeyWillBeUsed: async ({ request }) => {
                    const url = new URL(request.url)
                    for (const name of ['latitude', 'longitude']) {
                      const value = url.searchParams.get(name)
                      if (value) url.searchParams.set(name, Number(value).toFixed(2))
                    }
                    return url.href
                  },
                },
                {
                  // Marks the saved copy, so useWeather shows it as offline with its own time.
                  // Date is for the expiration check; the page can read only exposed headers.
                  cacheWillUpdate: async ({ response }) => {
                    if (response.status !== 200) return null
                    const now = new Date()
                    const headers = new Headers(response.headers)
                    headers.set('Date', now.toUTCString())
                    headers.set('X-Weatherly-Cached-At', now.toISOString())
                    headers.set('Access-Control-Expose-Headers', 'X-Weatherly-Cached-At')
                    return new Response(await response.blob(), {
                      status: response.status,
                      statusText: response.statusText,
                      headers,
                    })
                  },
                },
              ],
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'air-quality-api.open-meteo.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-air-quality',
              expiration: { maxEntries: 20, maxAgeSeconds: 6 * 60 * 60 },
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    const url = new URL(request.url)
                    for (const name of ['latitude', 'longitude']) {
                      const value = url.searchParams.get(name)
                      if (value) url.searchParams.set(name, Number(value).toFixed(2))
                    }
                    return url.href
                  },
                },
                {
                  // The expiration check reads Date, which a cross-origin response hides
                  cacheWillUpdate: async ({ response }) => {
                    if (response.status !== 200) return null
                    const headers = new Headers(response.headers)
                    headers.set('Date', new Date().toUTCString())
                    return new Response(await response.blob(), {
                      status: response.status,
                      statusText: response.statusText,
                      headers,
                    })
                  },
                },
              ],
            },
          },
          {
            // City names hardly change: the saved one is used even online, which also spares
            // Nominatim requests (its policy allows 1 per second)
            urlPattern: ({ url }) =>
              url.hostname === 'nominatim.openstreetmap.org' && url.pathname === '/reverse',
            handler: 'CacheFirst',
            options: {
              cacheName: 'nominatim-reverse',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    const url = new URL(request.url)
                    for (const name of ['lat', 'lon']) {
                      const value = url.searchParams.get(name)
                      if (value) url.searchParams.set(name, Number(value).toFixed(2))
                    }
                    return url.href
                  },
                },
                {
                  // The expiration check reads Date, which a cross-origin response hides
                  cacheWillUpdate: async ({ response }) => {
                    if (response.status !== 200) return null
                    const headers = new Headers(response.headers)
                    headers.set('Date', new Date().toUTCString())
                    return new Response(await response.blob(), {
                      status: response.status,
                      statusText: response.statusText,
                      headers,
                    })
                  },
                },
              ],
            },
          },
        ],
      },
    }),
  ],
  base: '/weatherly-app/',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
  },
})
