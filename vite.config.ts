import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import * as compressionNs from 'vite-plugin-compression'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const compression =
  (compressionNs as unknown as { default: typeof import('vite-plugin-compression').default }).default ??
  (compressionNs as unknown as typeof import('vite-plugin-compression').default)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    // SSG: prerender `/` to static HTML (head tags + JSON-LD for crawlers).
    // Client hydrates over it; data-rh tags let Helmet adopt them cleanly.
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: fileURLToPath(
        new URL('./src/seo/prerender.tsx', import.meta.url),
      ),
      additionalPrerenderRoutes: ['/'],
    }),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
})
