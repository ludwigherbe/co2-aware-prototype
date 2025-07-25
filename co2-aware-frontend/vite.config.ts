import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // STRATEGIEWECHSEL: von generateSW zu injectManifest
      strategies: 'injectManifest', 
      
      // PFAD ZU IHREM SERVICE WORKER
      // Diese Datei werden wir in Schritt 2 erstellen.
      srcDir: 'src',
      filename: 'sw.ts',

      // REGISTER-TYP ÄNDERN
      // 'prompt' fragt den User, ob er die neue Version laden will.
      // 'autoUpdate' ist für manuelle Kontrolle weniger geeignet.
      registerType: 'prompt',

      // MANIFEST-KONFIGURATION BLEIBT GLEICH
      // Diese Informationen werden weiterhin für die PWA benötigt.
      manifest: {
        name: 'CO2 Aware Prototype',
        short_name: 'CO2 App',
        description: 'Ein Prototyp zur Visualisierung des CO2-Fußabdrucks von Produkten.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})