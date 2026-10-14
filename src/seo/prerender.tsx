/**
 * @file src/seo/prerender.tsx
 * Static Site Generation (SSG) prerender entry point for Vite.
 *
 * Invoked by `vite-prerender-plugin` at build time to produce static HTML pages
 * with pre-rendered title, metadata, canonical URL, and Schema.org JSON-LD structured data.
 */

import type { PrerenderArguments, PrerenderResult } from 'vite-prerender-plugin';
import { COMPANY_CONFIG } from './config';
import { createCompositeGraph } from './schemas';

interface HeadElement {
  type: string;
  props: Record<string, string>;
  children?: string;
}

export async function prerender(_args?: PrerenderArguments): Promise<PrerenderResult> {
  const graph = createCompositeGraph();
  const graphJson = JSON.stringify(graph);

  const elements: HeadElement[] = [
    { type: 'meta', props: { name: 'description', content: COMPANY_CONFIG.description } },
    { type: 'meta', props: { name: 'keywords', content: COMPANY_CONFIG.keywords } },
    { type: 'link', props: { rel: 'canonical', href: COMPANY_CONFIG.canonicalUrl } },

    // Open Graph Tags
    { type: 'meta', props: { property: 'og:type', content: 'website' } },
    { type: 'meta', props: { property: 'og:site_name', content: COMPANY_CONFIG.name } },
    { type: 'meta', props: { property: 'og:title', content: COMPANY_CONFIG.title } },
    { type: 'meta', props: { property: 'og:description', content: COMPANY_CONFIG.description } },
    { type: 'meta', props: { property: 'og:url', content: COMPANY_CONFIG.canonicalUrl } },
    { type: 'meta', props: { property: 'og:image', content: COMPANY_CONFIG.ogImage } },
    { type: 'meta', props: { property: 'og:image:alt', content: COMPANY_CONFIG.name } },
    { type: 'meta', props: { property: 'og:locale', content: 'en_IN' } },

    // Twitter Card Tags
    { type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } },
    { type: 'meta', props: { name: 'twitter:title', content: COMPANY_CONFIG.title } },
    { type: 'meta', props: { name: 'twitter:description', content: COMPANY_CONFIG.description } },
    { type: 'meta', props: { name: 'twitter:image', content: COMPANY_CONFIG.ogImage } },

    // JSON-LD Structured Data Schema Graph
    {
      type: 'script',
      props: { type: 'application/ld+json' },
      children: graphJson,
    },
  ];

  return {
    html: '',
    head: {
      lang: 'en',
      title: COMPANY_CONFIG.title,
      elements: new Set(elements),
    },
  };
}

export default prerender;
