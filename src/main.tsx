import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./i18n";
import "./index.css";
import { SeoHost } from "./seo/seo.tsx";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
    <SeoHost />
  </HelmetProvider>,
);
