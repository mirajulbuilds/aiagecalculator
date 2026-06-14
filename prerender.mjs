/**
 * prerender.mjs — search engine-দের জন্য প্রতিটা পেজের ready HTML বানায়।
 */
import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile, mkdir, stat } from "fs/promises";
import { readFileSync } from "fs";
import http from "http";
import path from "path";

const DIST = path.resolve("dist");
const PORT = 4173;

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

async function celebrityRoutes() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("⚠  Supabase keys not found – skipping celebrity pages.");
    return [];
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase
    .from("celebrities")
    .select("profile_slug")
    .limit(5000);
  if (error) {
    console.error("⚠  Supabase error:", error.message);
    return [];
  }
  return (data || [])
    .filter((r) => r.profile_slug)
    .map((r) => `/people/${r.profile_slug}`);
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
    } catch (e) {
      res.statusCode = 500;
      res.end("Server error");
    }
  });
}

const routes = [
  ...new Set([...staticRoutesFromSitemap(), ...(await celebrityRoutes())]),
];
console.log(`Prerendering ${routes.length} routes...`);

const server = makeServer();
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

let done = 0;
for (const route of routes) {
  const page = await browser.newPage();
  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle0", timeout: 30000,
    });
    await page.waitForFunction(
      () => {
        const root = document.getElementById("root");
        const txt = document.body.innerText || "";
        return root && root.children.length > 0 && !txt.includes("Loading profile...");
      },
      { timeout: 15000 }
    ).catch(() => {});
    const html = await page.content();
    const outDir = path.join(DIST, route === "/" ? "" : route);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html);
    done++;
    console.log(`✓ (${done}/${routes.length}) ${route}`);
  } catch (e) {
    console.error(`✗ ${route}: ${e.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
server.close();
console.log(`\nDone. Prerendered ${done}/${routes.length} pages into dist/.`);
