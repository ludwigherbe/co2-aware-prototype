import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa'

/**
 * Grundkonfiguration für das PWA-Plugin.
 * Diese wird nur im "CO2_AWARE"-Modus verwendet.
 */
const pwaOptions: Partial<VitePWAOptions> = {
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  injectManifest: {
    injectionPoint: undefined
  },
  manifest: {
    name: 'A ware Shop',
    short_name: 'ware Shop',
    description: 'Ein Prototyp zum zeitversetzten Caching im Client.',
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
};

// Hauptkonfiguration für Vite
export default defineConfig(() => { // 'mode' Parameter entfernt
  const appMode = process.env.VITE_APP_MODE;
  
  console.log(`- Building frontend in mode: ${appMode} -`);

  const plugins = [react()];

  if (appMode === 'CO2_AWARE') {
    console.log('  -> CO2_AWARE mode detected, enabling PWA plugin.');
    plugins.push(VitePWA(pwaOptions));
  }

  return {
    plugins: plugins
  }
});
