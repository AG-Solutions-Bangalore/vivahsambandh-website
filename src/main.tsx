import { createRoot, hydrateRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import Root from "./Root.tsx";
import { getInitialAppLanguage } from "./i18n";

const container = document.getElementById("root")!;
const lang = getInitialAppLanguage();

// Build-time prerendering stamps its language as the first child:
// <!--ssg:en--> or <!--ssg:hi-->. Hydrate only on an exact match — a
// stored language differing from the prerendered route falls back to a
// fresh client render instead of a hydration mismatch.
const firstChild = container.firstChild;
const prerenderedLang =
  firstChild && firstChild.nodeType === Node.COMMENT_NODE
    ? (firstChild.textContent ?? "")
    : "";

if (prerenderedLang === `ssg:${lang}`) {
  hydrateRoot(container, <Root />);
} else {
  container.innerHTML = "";
  createRoot(container).render(<Root />);
}
