import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import "./index.css";
import Root from "./Root.tsx";
import { getInitialAppLanguage } from "./i18n";

const container = document.getElementById("root")!;
const lang = getInitialAppLanguage();

// Build-time prerendering stamps language + route as the first child:
// <!--ssg:en--> (legacy) or <!--ssg:en:/register--> (current). Hydrate only
// on an exact match of BOTH the language and the served route:
// - a stored language differing from the prerendered route, or
// - a host serving the home-page fallback for an unprerendered path
//   (that HTML was rendered for another route tree)
// must fall back to a fresh client render instead of a hydration mismatch.
//
// The marker lives outside React's VDOM, so remove it before hydrating:
// a foreign leading comment inside the container trips hydration (#418)
// and logs a console error (Best Practices penalty).
const firstChild = container.firstChild;
const marker =
  firstChild && firstChild.nodeType === Node.COMMENT_NODE
    ? (firstChild.textContent ?? "")
    : "";
if (firstChild && firstChild.nodeType === Node.COMMENT_NODE) {
  container.removeChild(firstChild);
}

let markerLang: string | null = null;
let markerRoute: string | null = null;
if (marker.startsWith("ssg:")) {
  const [, langPart, routePart = ""] = marker.split(":");
  markerLang = langPart || null;
  // Legacy markers carry no route segment — keep the language-only gate for them.
  markerRoute = routePart || null;
}

/**
 * Boot placeholder (see index.html) — covers the gap between the first paint
 * and the React mount on routes the build did not prerender.
 *
 * On a prerendered route the real content is already in the document and
 * paints over the placeholder, so it is dropped immediately. Everywhere else
 * it stays until the app mounts (Root removes it), which keeps the visitor
 * from seeing an empty page.
 */
const bootPlaceholder = document.getElementById("app-boot");
const removeBootPlaceholder = () => bootPlaceholder?.remove();

/** Trailing slashes collapsed ('/hi/' → '/hi', '/register/' → '/register'). */
const normalizePath = (p: string) => {
  const clean = p.split(/[?#]/)[0];
  return clean.length > 1 ? clean.replace(/\/+$/, "") || "/" : clean || "/";
};

// Route chunk loaders for code-split pages. Preloading the matching chunk
// before mounting createRoot ensures the static SSG HTML remains visible
// without white-flash / FOUC, while avoiding React error #418 hydration mismatch
// caused by hydrating uninitialized React.lazy components.
const PAGE_LOADERS: Record<string, () => Promise<unknown>> = {
  "/registration": () => import("./module/registration/pages/RegistrationPage"),
  "/hi/registration": () => import("./module/registration/pages/RegistrationPage"),
  "/register": () => import("./module/registration/pages/RegistrationPage"),
  "/hi/register": () => import("./module/registration/pages/RegistrationPage"),
  "/admin-register": () => import("./module/registration/pages/AdminRegisterPage"),
  "/hi/admin-register": () => import("./module/registration/pages/AdminRegisterPage"),
  "/about": () => import("./module/about/pages/AboutPage"),
  "/hi/about": () => import("./module/about/pages/AboutPage"),
  "/stories": () => import("./module/stories/pages/StoriesPage"),
  "/hi/stories": () => import("./module/stories/pages/StoriesPage"),
  "/success-stories": () => import("./module/stories/pages/StoriesPage"),
  "/hi/success-stories": () => import("./module/stories/pages/StoriesPage"),
  "/membership": () => import("./module/membership/pages/MembershipPage"),
  "/hi/membership": () => import("./module/membership/pages/MembershipPage"),
  "/blogs": () => import("./module/blog/pages/BlogsPage"),
  "/hi/blogs": () => import("./module/blog/pages/BlogsPage"),
  "/contact": () => import("./module/contact/pages/ContactPage"),
  "/hi/contact": () => import("./module/contact/pages/ContactPage"),
  "/privacy": () => import("./module/legal/pages/PrivacyPage"),
  "/hi/privacy": () => import("./module/legal/pages/PrivacyPage"),
  "/terms": () => import("./module/legal/pages/TermsPage"),
  "/hi/terms": () => import("./module/legal/pages/TermsPage"),
  "/guidelines": () => import("./module/legal/pages/GuidelinesPage"),
  "/hi/guidelines": () => import("./module/legal/pages/GuidelinesPage"),
  "/help-center": () => import("./module/legal/pages/HelpCenterPage"),
  "/hi/help-center": () => import("./module/legal/pages/HelpCenterPage"),
  "/download": () => import("./module/download/pages/DownloadPage"),
  "/hi/download": () => import("./module/download/pages/DownloadPage"),
};

// Client-side routing: StaticRouter output from the prerender is
// markup-identical for the home page, so hydration is safe.
const tree = (
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);

const currentPath = normalizePath(window.location.pathname);
const isHomeRoute = currentPath === "/" || currentPath === "/hi";
const langMatches = markerLang === lang;
const routeMatches =
  markerRoute === null || markerRoute === currentPath;

if (langMatches && routeMatches && isHomeRoute) {
  // Prerendered markup is on screen — the placeholder is behind it already.
  removeBootPlaceholder();
  hydrateRoot(container, tree);
} else {
  const loader = PAGE_LOADERS[currentPath];
  if (loader) {
    loader()
      .catch(() => {})
      .finally(() => {
        container.innerHTML = "";
        createRoot(container).render(tree);
      });
  } else {
    container.innerHTML = "";
    createRoot(container).render(tree);
  }
}

