/**
 * prerender.mjs — v2
 *
 * পরিবর্তন (v1 থেকে):
 *  1. Supabase থেকে পুরো celebrity row বিল্ড টাইমে আনা হয় (paginated)
 *  2. related / same-birthday / same-zodiac Node-এ deterministic ভাবে হিসাব হয়
 *  3. ডেটা window.__PRERENDER_DATA__ দিয়ে পেজে ইনজেক্ট করা হয় — ব্রাউজার কোনো
 *     নেটওয়ার্ক কল করে না, তাই timeout হয় না
 *  4. রেন্ডার খালি হলে ফাইল লেখা হয় না — একবার retry, তারপরও ফেল হলে গোনা হয়
 *  5. ৩%-এর বেশি রুট ফেল করলে বিল্ড ফেল করে (ভাঙা সাইট আর লাইভে যাবে না)
 *  6. সব sitemap থেকে রুট নেওয়া হয় (static + categories + blog), শুধু static নয়
 *  7. profession পেজ DB থেকে বের করা হয়
 *  8. sitemap-এ trailing slash — Netlify pretty URL-এর সাথে মিল রাখতে
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
const MIN_BODY_CHARS = 600;          // এর কম হলে রেন্ডার ব্যর্থ ধরা হয়
const MAX_FAIL_RATIO = 0.03;         // ৩%-এর বেশি ফেল হলে বিল্ড ফেল

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
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
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

/* ---------------- রুট সংগ্রহ ---------------- */

function routesFromSitemaps() {
  const files = [
    "public/sitemap-static.xml",
    "public/sitemap-categories.xml",
    "public/sitemap-blog.xml",
  ];
  const out = new Set();
  for (const f of files) {
    try {
      const xml = readFileSync(f, "utf8");
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        let p = m[1].replace(/^https?:\/\/[^/]+/, "").trim().replace(/\/+$/, "");
        out.add(p === "" ? "/" : p);
      }
    } catch (e) {
      console.warn(`WARN: ${f} পড়া গেল না — ${e.message}`);
    }
  }
  // robots.txt-এ Disallow করা পেজ prerender করার দরকার নেই
  for (const blocked of ["/compare", "/compare-life-expectancy", "/search"]) {
    out.delete(blocked);
  }
  // sitemap-এ নেই কিন্তু ইনডেক্স হওয়া উচিত
  out.add("/biological-age-calculator");
  out.add("/");
  return [...out];
}

function professionSlug(profession) {
  return String(profession || "").toLowerCase().trim().replace(/\s+/g, "-");
}

/* ---------------- Supabase ---------------- */

async function fetchCelebrities() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("FATAL: Supabase env নেই। VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY সেট করো।");
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("celebrities")
      .select("*")
      .order("profile_slug", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("FATAL: Supabase error —", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows.filter((r) => r.profile_slug && r.name);
}

/* ছোট করে পাঠানোর জন্য — related কার্ডে main_content লাগে না */
function slim(c) {
  return {
    id: c.id,
    name: c.name,
    date_of_birth: c.date_of_birth,
    profession: c.profession,
    place_of_birth: c.place_of_birth,
    zodiac_sign: c.zodiac_sign,
    profile_slug: c.profile_slug,
    profile_image_url: c.profile_image_url,
    meta_title: c.meta_title,
    meta_description: c.meta_description,
    popularity_ranks: c.popularity_ranks,
    main_content: "",
  };
}

/* deterministic র‍্যাংকিং — Math.random() নয় */
function rankScore(c) {
  const r = c.popularity_ranks;
  const v = typeof r === "object" && r ? Number(r.most_popular) : NaN;
  return Number.isFinite(v) ? v : 999999;
}

function buildIndexes(all) {
  const byProfession = new Map();
  const byZodiac = new Map();
  const byMonthDay = new Map();

  for (const c of all) {
    const p = c.profession || "";
    if (!byProfession.has(p)) byProfession.set(p, []);
    byProfession.get(p).push(c);

    const z = c.zodiac_sign || "";
    if (z) {
      if (!byZodiac.has(z)) byZodiac.set(z, []);
      byZodiac.get(z).push(c);
    }

    const d = new Date(c.date_of_birth);
    if (!isNaN(d)) {
      const key = `${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
      if (!byMonthDay.has(key)) byMonthDay.set(key, []);
      byMonthDay.get(key).push(c);
    }
  }

  const sortAll = (m) => {
    for (const arr of m.values()) {
      arr.sort((a, b) => rankScore(a) - rankScore(b) || a.name.localeCompare(b.name));
    }
  };
  sortAll(byProfession); sortAll(byZodiac); sortAll(byMonthDay);

  return { byProfession, byZodiac, byMonthDay };
}

function payloadFor(c, idx) {
  const notSelf = (x) => x.profile_slug !== c.profile_slug;
  const d = new Date(c.date_of_birth);
  const mdKey = isNaN(d) ? null : `${d.getUTCMonth() + 1}-${d.getUTCDate()}`;

  return {
    celebrity: c,
    related: (idx.byProfession.get(c.profession || "") || []).filter(notSelf).slice(0, 10).map(slim),
    sameBirthday: (mdKey ? idx.byMonthDay.get(mdKey) || [] : []).filter(notSelf).slice(0, 6).map(slim),
    sameZodiac: (idx.byZodiac.get(c.zodiac_sign || "") || []).filter(notSelf).slice(0, 6).map(slim),
  };
}

/* ---------------- sitemap ---------------- */

async function writeCelebritySitemap(rows) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = rows.map((r) =>
    `  <url>\n    <loc>${SITE}/people/${r.profile_slug}/</loc>\n    <lastmod>${(r.updated_at || today).slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(path.join(DIST, "sitemap-celebrities.xml"), xml);
  console.log(`Sitemap লেখা হলো — ${rows.length} celebrity.`);
}

async function writeSitemapIndex() {
  const today = new Date().toISOString().slice(0, 10);
  const parts = ["sitemap-static.xml", "sitemap-celebrities.xml", "sitemap-categories.xml", "sitemap-blog.xml"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + parts.map((p) => `  <sitemap>\n    <loc>${SITE}/${p}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`).join("\n")
    + `\n</sitemapindex>\n`;
  await writeFile(path.join(DIST, "sitemap-index.xml"), xml);
}

/* ---------------- head injection ---------------- */

function injectHead(html, { title, description, canonical }) {
  let out = html;
  const full = title ? (title.includes("AiAgeCalc") ? title : `${title} | AiAgeCalc`) : "";

  if (full) {
    out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${esc(full)}</title>`);
  }
  if (description) {
    // helmet একটা বসিয়ে থাকতে পারে — সবগুলো সরিয়ে একটাই রাখো
    out = out.replace(/<meta\s+name="description"[^>]*>/gi, "");
  }
  // canonical ডুপ্লিকেট হওয়া ঠেকাও
  out = out.replace(/<link\s+rel="canonical"[^>]*>/gi, "");
  out = out.replace(/<meta\s+property="og:(title|description|url)"[^>]*>/gi, "");
  out = out.replace(/<meta\s+name="twitter:(title|description)"[^>]*>/gi, "");

  const extra = [];
  if (description) extra.push(`<meta name="description" content="${esc(description)}" />`);
  if (full) {
    extra.push(`<meta property="og:title" content="${esc(full)}" />`);
    extra.push(`<meta name="twitter:title" content="${esc(full)}" />`);
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

/* ---------------- static server ---------------- */

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

/* ---------------- render ---------------- */

async function renderOnce(browser, route, meta, payload) {
  const page = await browser.newPage();
  try {
    if (payload) {
      await page.evaluateOnNewDocument((d) => {
        window.__PRERENDER_DATA__ = d;
      }, payload);
    }

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      const url = req.url();
      if (["image", "media", "font"].includes(type) || BLOCK_DOMAINS.some((d) => url.includes(d))) {
        req.abort().catch(() => {});
      } else {
        req.continue().catch(() => {});
      }
    });

    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "domcontentloaded", timeout: 30000,
    });

    // ডেটা ইনজেক্ট করা আছে বলে এটা প্রায় সাথে সাথেই সত্যি হবে
    await page.waitForFunction(() => {
      const root = document.getElementById("root");
      const txt = document.body.innerText || "";
      return root && root.children.length > 0
        && !txt.includes("Loading profile...")
        && txt.trim().length > 400;
    }, { timeout: 20000 });

    await new Promise((r) => setTimeout(r, 100));

    const bodyText = await page.evaluate(() => document.body.innerText || "");
    if (bodyText.includes("Loading profile...")) {
      throw new Error("এখনো 'Loading profile...' আছে");
    }
    if (bodyText.trim().length < MIN_BODY_CHARS) {
      throw new Error(`কনটেন্ট খুব কম (${bodyText.trim().length} chars)`);
    }
    if (/Celebrity Not Found|Page Not Found|404/i.test(bodyText.slice(0, 400))) {
      throw new Error("Not-found পেজ রেন্ডার হয়েছে");
    }

    let html = await page.content();
    const canonical = SITE + (route === "/" ? "/" : route + "/");

    if (meta && meta.meta_title) {
      html = injectHead(html, {
        title: meta.meta_title, description: meta.meta_description, canonical,
      });
    } else {
      const live = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || "",
      }));
      if (live.title && live.title.trim() !== DEFAULT_TITLE) {
        html = injectHead(html, { title: live.title, description: live.description, canonical });
      } else {
        throw new Error("per-page title পাওয়া যায়নি (generic fallback)");
      }
    }

    return html;
  } finally {
    await page.close().catch(() => {});
  }
}

async function renderRoute(browser, item, total, counter, failures) {
  const { route, meta, payload } = item;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const html = await renderOnce(browser, route, meta, payload);
      const outDir = path.join(DIST, route === "/" ? "" : route);
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, "index.html"), html);
      counter.done++;
      if (counter.done % 50 === 0 || counter.done === total) {
        console.log(`OK ${counter.done}/${total}`);
      }
      return;
    } catch (e) {
      if (attempt === 2) {
        failures.push({ route, reason: e.message });
        console.error(`FAIL ${route} — ${e.message}`);
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
}

/* ---------------- main ---------------- */

console.log("Supabase থেকে celebrity ডেটা আনা হচ্ছে...");
const celebrities = await fetchCelebrities();
console.log(`${celebrities.length} জন পাওয়া গেল।`);

const idx = buildIndexes(celebrities);

const routeList = [];
for (const r of routesFromSitemaps()) routeList.push({ route: r, meta: null, payload: null });

const professions = [...new Set(celebrities.map((c) => professionSlug(c.profession)).filter(Boolean))];
for (const p of professions) routeList.push({ route: `/profession/${p}`, meta: null, payload: null });
console.log(`${professions.length} টা profession পেজ রুটে যোগ হলো।`);

for (const c of celebrities) {
  routeList.push({
    route: `/people/${c.profile_slug}`,
    meta: { meta_title: c.meta_title, meta_description: c.meta_description },
    payload: payloadFor(c, idx),
  });
}

const seen = new Set();
const routes = routeList.filter((x) => (seen.has(x.route) ? false : seen.add(x.route)));

console.log(`মোট ${routes.length} রুট prerender হবে (concurrency ${CONCURRENCY})...\n`);

const server = makeServer();
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const counter = { done: 0 };
const failures = [];
let i = 0;
async function worker() {
  while (i < routes.length) {
    await renderRoute(browser, routes[i++], routes.length, counter, failures);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

await browser.close();
server.close();

await writeCelebritySitemap(celebrities);
await writeSitemapIndex();

console.log(`\n=== ফলাফল ===`);
console.log(`সফল : ${counter.done}/${routes.length}`);
console.log(`ব্যর্থ: ${failures.length}`);

if (failures.length) {
  console.log(`\nপ্রথম ২০টা ব্যর্থ রুট:`);
  for (const f of failures.slice(0, 20)) console.log(`  ${f.route} — ${f.reason}`);
}

const ratio = failures.length / routes.length;
if (ratio > MAX_FAIL_RATIO) {
  console.error(`\nFATAL: ${(ratio * 100).toFixed(1)}% রুট ফেল করেছে (সীমা ${MAX_FAIL_RATIO * 100}%). বিল্ড বাতিল।`);
  process.exit(1);
}

console.log(`\nসব ঠিক আছে — ${counter.done} পেজ dist/ এ লেখা হয়েছে।`);
