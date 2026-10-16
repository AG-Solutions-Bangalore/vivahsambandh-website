/**
 * @file vite.config.ts
 * Vite configuration for VivahSambandh website.
 *
 * Configures:
 * - React 19 + React Compiler presets via `@vitejs/plugin-react` and `@rolldown/plugin-babel`
 * - Tailwind CSS v4 via `@tailwindcss/vite`
 * - Static Site Generation (SSG) via `vite-prerender-plugin` (invoking `src/prerender.tsx`)
 * - Dual pre-compression: Gzip via `vite-plugin-compression` + Brotli via custom `brotliStatic`
 * - Event loop unblocking & socket cleanup via `eventLoopCleanup`
 * - Granular vendor chunk splitting via `rollupOptions.output.manualChunks`
 */

import path from 'node:path';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, constants } from 'node:zlib';
import http from 'node:http';
import https from 'node:https';
import { MessagePort } from 'node:worker_threads';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import * as compressionNs from 'vite-plugin-compression';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

const compression =
  (compressionNs as unknown as { default: typeof import('vite-plugin-compression').default }).default ??
  (compressionNs as unknown as typeof import('vite-plugin-compression').default);

// CRITICAL EVENT-LOOP UNBLOCK FIX:
// React 18/19 scheduler keeps a Node MessagePort open, causing Vite SSG
// builds to hang indefinitely after prerendering finishes.
if (MessagePort && MessagePort.prototype) {
  const origOn = Object.getOwnPropertyDescriptor(MessagePort.prototype, 'onmessage');
  if (origOn && origOn.set) {
    Object.defineProperty(MessagePort.prototype, 'onmessage', {
      set(fn) {
        origOn.set!.call(this, fn);
        const port = this as MessagePort & { unref?: () => void };
        if (fn && typeof port.unref === 'function') {
          port.unref();
        }
      },
      get() {
        return origOn.get?.call(this);
      },
      configurable: true,
      enumerable: true,
    });
  }
}

/**
 * Vite plugin that releases active event-loop handles to prevent build hangs.
 */
function eventLoopCleanup(): Plugin {
  return {
    name: 'event-loop-cleanup',
    apply: 'build',
    closeBundle() {
      // 1. Terminate all pooled HTTP/HTTPS keep-alive connections
      http.globalAgent.destroy();
      https.globalAgent.destroy();

      // 2. Unref or destroy any remaining active handles
      // @ts-expect-error internal node handle inspector
      const handles = process._getActiveHandles?.() ?? [];
      for (const h of handles) {
        if (typeof h?.destroy === 'function') {
          h.destroy();
        } else if (typeof h?.unref === 'function') {
          h.unref();
        }
      }

      // 3. Gracefully exit the build process
      setTimeout(() => {
        process.exit(0);
      }, 100);
    },
  };
}

/**
 * Demotes Vite's `<link rel="modulepreload">` hints to `<link rel="prefetch">`
 * in every emitted HTML page to keep LCP critical path lean.
 * (Deliberately NOT deprioritizing the entry module script — measured TTI
 * regression outweighs the LCP bandwidth gain.)
 */
function deferNonCriticalPreloads(): Plugin {
  const rewriteFile = (full: string): void => {
    const html = readFileSync(full, 'utf8');
    if (!html.includes('rel="modulepreload"')) return;
    writeFileSync(full, html.replaceAll('rel="modulepreload"', 'rel="prefetch"'));
  };
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (full.endsWith('.html')) rewriteFile(full);
    }
  };
  return {
    name: 'defer-non-critical-preloads',
    apply: 'build',
    closeBundle() {
      try {
        walk('dist');
      } catch {
        /* dist directory might not exist */
      }
    },
  };
}

/**
 * Pre-compresses emitted static text assets with Brotli at level 11.
 */
function brotliStatic(threshold = 1024): Plugin {
  const filter = /\.(js|mjs|css|html|svg|json)$/i;
  return {
    name: 'brotli-static',
    apply: 'build',
    closeBundle() {
      const walk = (dir: string): void => {
        for (const entry of readdirSync(dir)) {
          const full = join(dir, entry);
          if (statSync(full).isDirectory()) {
            walk(full);
            continue;
          }
          if (!filter.test(full) || full.endsWith('.br')) continue;
          const size = statSync(full).size;
          if (size < threshold) continue;
          try {
            if (statSync(`${full}.br`).isFile()) continue;
          } catch {
            /* missing — compress */
          }
          const compressed = brotliCompressSync(readFileSync(full), {
            params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
          });
          writeFileSync(`${full}.br`, compressed);
        }
      };
      try {
        walk('dist');
      } catch {
        /* dist directory might not exist */
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    // Static Site Generation (SSG) with typed Schema.org JSON-LD
    vitePrerenderPlugin({
      prerenderScript: path.resolve(import.meta.dirname ?? '.', 'src/prerender.tsx'),
      renderTarget: '#root',
      additionalPrerenderRoutes: [
        '/hi',
        '/about',
        '/hi/about',
        '/stories',
        '/hi/stories',
        '/membership',
        '/hi/membership',
        '/contact',
        '/hi/contact',
        '/blogs',
        '/hi/blogs',
        '/privacy',
        '/hi/privacy',
        '/terms',
        '/hi/terms',
        '/guidelines',
        '/hi/guidelines',
        '/help-center',
        '/hi/help-center',
      ],
    }),
    compression({ algorithm: 'gzip', threshold: 1024 }),
    deferNonCriticalPreloads(),
    brotliStatic(),
    eventLoopCleanup(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname ?? '.', './src'),
    },
  },
  build: {
    minify: true,
    cssMinify: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
    modulePreload: {
      resolveDependencies(_url, deps) {
        return deps.filter(
          (dep) =>
            !dep.includes('gsap') &&
            !dep.includes('lenis') &&
            !dep.includes('prerender'),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          const p = id.replace(/\\/g, '/');
          // Server renderer (prerender script only) — never shipped to clients.
          // Covers the package entry shims (server.*.js) and the compiled
          // implementation (cjs/react-dom-server.*).
          if (
            /\/node_modules\/react-dom\/(server[^/]*\.js|cjs\/react-dom-server[^/]*)/.test(
              p,
            )
          )
            return 'ssr-renderer';
          if (/gsap/.test(p)) return 'gsap';
          if (/\/lenis\//.test(p)) return 'lenis';
          if (/swiper/.test(p)) return 'swiper';
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(p)) return 'react';
          return undefined;
        },
      },
    },
  },
});
