/**
 * @file src/seo/prerender.tsx
 * Static Site Generation (SSG) prerender entry point for Vite.
 *
 * Invoked by `vite-prerender-plugin` at build time to produce static HTML pages
 * for all supported languages (`/` for English, `/hi` for Hindi) with rich console feedback
 * and static Schema.org JSON-LD structured data baked directly into the output HTML.
 */

import type { PrerenderArguments, PrerenderResult } from 'vite-prerender-plugin';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from '../App';
import i18n from '../i18n';
import {
  COMPANY_CONFIG,
  LANG_METADATA,
  PAGE_SEO,
  getCanonicalUrl,
  getPagePath,
  resolvePageKey,
  type SupportedLang,
} from './config';
import { createCompositeGraph } from './schemas';

interface HeadElement {
  type: string;
  props: Record<string, string>;
  children?: string;
}

/**
 * Static Site Generation (SSG) prerender function.
 * Generates SEO meta tags, OpenGraph cards, hreflang alternates,
 * and Schema.org composite graph for each language route.
 */
export async function prerender(args?: PrerenderArguments): Promise<PrerenderResult> {
  const startTime = performance.now();
  const url = args?.url ?? '/';
  const isHindi = url === '/hi' || url.startsWith('/hi');
  const lang: SupportedLang = isHindi ? 'hi' : 'en';
  const langInfo = LANG_METADATA[lang];

  // ——— Rich Console Reporting ———
  const divider = '═'.repeat(68);
  const thinDivider = '─'.repeat(68);
  console.log(`\n\x1b[36m╔${divider}╗\x1b[0m`);
  console.log(
    `\x1b[36m║\x1b[0m  \x1b[1;32m⚡ [SSG Prerender]\x1b[0m Route: \x1b[1;33m${url.padEnd(16)}\x1b[0m Language: \x1b[1;35m${(langInfo.nativeName + ' (' + lang + ')').padEnd(21)}\x1b[0m\x1b[36m║\x1b[0m`,
  );
  console.log(`\x1b[36m╠${divider}╣\x1b[0m`);

  // Route-aware head: same resolver as the client SeoHost, so prerendered
  // HTML and the hydrated head are identical for every route.
  const page = resolvePageKey(url);
  const title = PAGE_SEO[page].titles[lang];
  const description = PAGE_SEO[page].descriptions[lang];
  const keywords = COMPANY_CONFIG.keywords[lang];
  const keywordCount = keywords.split(',').length;
  const canonicalUrl = getCanonicalUrl(url, lang);
  const enHref = `${COMPANY_CONFIG.siteOrigin}${getPagePath(page, 'en')}`;
  const hiHref = `${COMPANY_CONFIG.siteOrigin}${getPagePath(page, 'hi')}`;
  const graph = createCompositeGraph(lang, page);
  const graphJson = JSON.stringify(graph);
  const graphSizeKb = (Buffer.byteLength(graphJson, 'utf8') / 1024).toFixed(2);

  // Safe schema node type extraction from schema-dts graph
  const schemaTypes = graph['@graph']
    .map((node) => {
      if (typeof node === 'object' && node !== null && '@type' in node) {
        return String((node as { '@type': unknown })['@type']);
      }
      return 'Thing';
    })
    .join(', ');

  console.log(`  \x1b[1m📄 Page Metadata\x1b[0m`);
  console.log(`     ├─ Title       : "\x1b[37m${title}\x1b[0m" (${title.length} chars)`);
  console.log(`     ├─ Description : "\x1b[90m${description.slice(0, 75)}...\x1b[0m" (${description.length} chars)`);
  console.log(`     ├─ Keywords    : ${keywordCount} terms defined`);
  console.log(`     ├─ Robots      : \x1b[32m${COMPANY_CONFIG.robots}\x1b[0m`);
  console.log(`     ├─ Author      : ${COMPANY_CONFIG.author} | Publisher: ${COMPANY_CONFIG.publisher}`);
  console.log(`     └─ Canonical   : \x1b[34m${canonicalUrl}\x1b[0m`);

  console.log(`  \x1b[1m🌐 Multi-Language Hreflang Alternates\x1b[0m`);
  console.log(`     ├─ en        (English)   -> ${enHref}`);
  console.log(`     ├─ hi        (हिन्दी)     -> ${hiHref}`);
  console.log(`     └─ x-default (Fallback)   -> ${enHref}`);

  console.log(`  \x1b[1m🏷️  Schema.org Structured Data (@graph)\x1b[0m`);
  console.log(`     ├─ Types (${graph['@graph'].length}) : \x1b[35m${schemaTypes}\x1b[0m`);
  console.log(`     └─ Payload Size : \x1b[33m${graphSizeKb} KB\x1b[0m JSON-LD`);

  const elements: HeadElement[] = [
    { type: 'meta', props: { name: 'description', content: description } },
    { type: 'meta', props: { name: 'keywords', content: keywords } },
    { type: 'meta', props: { name: 'robots', content: COMPANY_CONFIG.robots } },
    { type: 'meta', props: { name: 'googlebot', content: 'index, follow' } },
    { type: 'meta', props: { name: 'author', content: COMPANY_CONFIG.author } },
    { type: 'meta', props: { name: 'publisher', content: COMPANY_CONFIG.publisher } },
    { type: 'link', props: { rel: 'author', href: COMPANY_CONFIG.siteOrigin } },
    { type: 'link', props: { rel: 'publisher', href: COMPANY_CONFIG.siteOrigin } },
    { type: 'link', props: { rel: 'canonical', href: canonicalUrl } },

    // Multi-language Hreflang alternates (same page, both languages)
    {
      type: 'link',
      props: { rel: 'alternate', hreflang: 'en', href: enHref },
    },
    {
      type: 'link',
      props: { rel: 'alternate', hreflang: 'hi', href: hiHref },
    },
    {
      type: 'link',
      props: { rel: 'alternate', hreflang: 'x-default', href: enHref },
    },

    // Open Graph Tags
    { type: 'meta', props: { property: 'og:type', content: 'website' } },
    { type: 'meta', props: { property: 'og:site_name', content: COMPANY_CONFIG.name } },
    { type: 'meta', props: { property: 'og:title', content: title } },
    { type: 'meta', props: { property: 'og:description', content: description } },
    { type: 'meta', props: { property: 'og:url', content: canonicalUrl } },
    { type: 'meta', props: { property: 'og:image', content: COMPANY_CONFIG.ogImage } },
    { type: 'meta', props: { property: 'og:image:alt', content: COMPANY_CONFIG.name } },
    { type: 'meta', props: { property: 'og:locale', content: langInfo.locale } },

    // Twitter Card Tags
    { type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } },
    { type: 'meta', props: { name: 'twitter:title', content: title } },
    { type: 'meta', props: { name: 'twitter:description', content: description } },
    { type: 'meta', props: { name: 'twitter:image', content: COMPANY_CONFIG.ogImage } },

    // JSON-LD Structured Data Schema Graph
    {
      type: 'script',
      props: { type: 'application/ld+json' },
      children: graphJson,
    },
  ];

  const durationMs = (performance.now() - startTime).toFixed(2);
  console.log(`\x1b[36m╠${thinDivider}╣\x1b[0m`);
  console.log(
    `\x1b[36m║\x1b[0m  \x1b[32m✔ SSG Complete:\x1b[0m Injected \x1b[33m${elements.length}\x1b[0m head tags into HTML in \x1b[32m${durationMs}ms\x1b[0m\x1b[36m║\x1b[0m`,
  );
  console.log(`\x1b[36m╚${divider}╝\x1b[0m\n`);

  // ——— Static body prerender (LCP fast path) ———
  // Header + hero + footer chrome render to HTML inside #root so first paint
  // never waits for the JS bundle. Below-fold sections stay deferred
  // (skeletons) and hydrate identically — same tree as the client, so no
  // hydration mismatch. Language-stamped for the hydrate gate in main.tsx.
  //
  // NOTE: renders <App/> WITHOUT <SeoHost/> on purpose. The plugin injects
  // the complete head set below; SeoHost stays client-only (runtime language
  // switching). Under React 19, renderToString does not hoist
  // title/meta/link — including SeoHost here would inline ~25 head tags into
  // <div id="root"> (W3C errors + duplicate description).
  //
  // NOTE: StaticRouter mirrors BrowserRouter's output for the same URL, so
  // client hydration matches exactly (no forced re-render).
  //
  // NOTE: react-dom/server must stay a static import (single React instance
  // for renderToString). vite.config isolates it into its own chunk so the
  // server renderer never ships to the client.
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
  const markup = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
  // React 19 hoists a preload hint for EVERY SSR image — those compete with
  // the LCP banner for bandwidth. Strip them; the banner keeps its dedicated
  // head preload (with responsive candidates), everything else loads in place.
  const bodyHtml = markup.replace(/<link rel="preload" as="image"[^>]*>/g, '');
  const html = `<!--ssg:${lang}-->${bodyHtml}`;
  console.log(
    `  \x1b[1m🖨️  Prerendered body\x1b[0m ${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(1)} KB HTML (${lang})`,
  );

  return {
    html,
    head: {
      lang,
      title,
      elements: new Set(elements),
    },
  };
}

export default prerender;
