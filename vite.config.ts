import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import * as compressionNs from 'vite-plugin-compression'
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
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
})
