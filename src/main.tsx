import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root")!;

// Prerendered pages ship real content inside #root — hydrate it so the already-
// painted HTML stays visible (fast FCP/LCP) instead of being wiped and re-rendered.
// A fresh SPA shell (empty #root, e.g. dev or a non-prerendered route) falls back to
// a normal client render.
if (rootEl.firstElementChild) {
  hydrateRoot(rootEl, <App />);
} else {
  createRoot(rootEl).render(<App />);
}
