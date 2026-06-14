/**
 * prerender.mjs — final (DB-injected SEO tags + auto sitemap)
 */
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile, mkdir, stat } from "fs/promises";
import { readFileSync } from "fs";
import http from "http";
import path from "path";

const DIST = path.resolve("dist");
const PORT = 4173;
const CONCURRENCY = 4;
const SITE = "https://aiagecalc.com";
const DEFAULT_TITLE = "AiAgeCalc.com";
const BLOCK_DOMAINS = [
  "googlesyndication", "doubleclick", "google-analytics",
  "googletagmanager", "adsbygoogle", "pagead2", "adtrafficquality",
];

function loadEnv() {
  const env = { ...process.env };
  try {
    const txt = readFileSync(".env", "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
  return env;
}
const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function staticRoutesFromSitemap() {
  try {
    const xml = readFileSync("public/sitemap-static.xml", "utf8");
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1].replace(/^https?:\/\/[^/]+/, "").trim())
      .map((p) => (p === "" ? "/" : p));
  } catch {
    return ["/"];
  }
}

async function fetchCelebrities() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("WARN: Supabase keys not found - skipping celebrity pages.");
    return [];
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase
    .from("celebrities")
    .select("profile_slug, meta_title, meta_description")
    .limit(20000);
  if (error) {
    console.error("WARN: Supabase error:", error.message);
    return [];
  }
  return (data || []).filter((r) => r.profile_slug);
}

async function writeCelebritySitemap(rows) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = rows.map((r) =>
    `  <url>\n    <loc>${SITE}/people/${r.profile_slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(path.join(DIST, "sitemap-celebrities.xml"), xml);
  console.log(`Sitemap rebuilt with ${rows.length} celebrities.`);
}

function injectHead(html, { title, description, canonical }) {
  let out = html;
  if (title) {
    const fullTitle = title.includes("AiAgeCalc") ? title : `${title} | AiAgeCalc`;
    out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${esc(fullTitle)}</title>`);
  }
  if (description) {
    out = out.replace(/<meta\s+name="description"[^>]*>/i,
      `<meta name="description" content="${esc(description)}" />`);
  }
  const t = title ? (title.includes("AiAgeCalc") ? title : `${title} | AiAgeCalc`) : "";
  const extra = [];
  if (t) {
    extra.push(`<meta property="og:title" content="${esc(t)}" />`);
    extra.push(`<meta name="twitter:title" content="${esc(t)}" />`);
  }
  if (description) {
    extra.push(`<meta property="og:description" content="${esc(description)}" />`);
    extra.push(`<meta name="twitter:description" content="${esc(description)}" />`);
  }
  if (canonical) {
    extra.push(`<link rel="canonical" href="${esc(canonical)}" />`);
    extra.push(`<meta property="og:url" content="${esc(canonical)}" />`);
  }
  if (extra.length) {
    out = out.replace(/<\/head>/i, `    ${extra.join("\n    ")}\n  </head>`);
  }
  return out;
}

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
  ".txt": "text/plain", ".xml": "application/xml",
};
function makeServer() {
  return http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const filePath = path.join(DIST, urlPath);
      let isFile = false;
      try { isFile = (await stat(filePath)).isFile(); } catch {}
      if (isFile) {
        res.setHeader("Content-Type", MIME[path.extname(filePath)] || "application/octet-stream");
        res.end(await readFile(filePath));
      } else {
        res.setHeader("Content-Type", "text/html");
        res.end(await readFile(path.join(DIST, "index.html")));
      }
    } catch {
      res.statusCode = 500; res.end("Server error");
    }
  });
}

async function renderRoute(browser, route, meta, total, counter) {
  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      const url = req.url();
      if (["image", "media", "font"].includes(type) ||
          BLOCK_DOMAINS.some((d) => url.includes(d))) {
        req.abort().catch(() => {});
      } else {
        req.continue().catch(() => {});
      }
    });
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "domcontentloaded", timeout: 20000,
    });
    await page.waitForFunction(() => {
      const root = document.getElementById("root");
      const txt = document.body.innerText || "";
      return root && root.children.length > 0 && !txt.includes("Loading profile...");
    }, { timeout: 12000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 150));

    let html = await page.content();
    const canonical = SITE + (route === "/" ? "/" : route);

    if (meta) {
      html = injectHead(html, {
        title: meta.meta_title,
        description: meta.meta_description,
        canonical,
      });
    } else {
      const live = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || "",
      }));
      if (live.title && live.title.trim() !== DEFAULT_TITLE) {
        html = injectHead(html, { title: live.title, description: live.description, canonical });
      }
    }

    const outDir = path.join(DIST, route === "/" ? "" : route);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html);
    counter.done++;
    console.log(`OK (${counter.done}/${total}) ${route}`);
  } catch (e) {
    console.error(`FAIL ${route}: ${e.message}`);
  } finally {
    await page.close();
  }
}

const celebrities = await fetchCelebrities();
const routeList = [];
for (const r of staticRoutesFromSitemap()) routeList.push({ route: r, meta: null });
for (const c of celebrities) routeList.push({ route: `/people/${c.profile_slug}`, meta: c });
const seen = new Set();
const routes = routeList.filter((x) => (seen.has(x.route) ? false : seen.add(x.route)));

console.log(`Prerendering ${routes.length} routes (concurrency ${CONCURRENCY})...`);

const server = makeServer();
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const counter = { done: 0 };
let idx = 0;
async function worker() {
  while (idx < routes.length) {
    const { route, meta } = routes[idx++];
    await renderRoute(browser, route, meta, routes.length, counter);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

await browser.close();
server.close();

if (celebrities.length) await writeCelebritySitemap(celebrities);

console.log(`\nDone. Prerendered ${counter.done}/${routes.length} pages into dist/.`);
