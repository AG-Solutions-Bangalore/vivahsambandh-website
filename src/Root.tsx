import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { SeoHost } from './seo/seo.tsx'

/**
 * Shared client/server root tree.
 *
 * Rendered to static HTML at build time (see `src/seo/prerender.tsx`) and
 * hydrated in the browser (see `src/main.tsx`). Both paths MUST render the
 * exact same tree or hydration mismatches will force a client re-render.
 */
export default function Root() {
  return (
    <HelmetProvider>
      <App />
      <SeoHost />
    </HelmetProvider>
  )
}
