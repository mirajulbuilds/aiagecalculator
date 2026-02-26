

## Fix "Crawled - Currently Not Indexed" Issues

### Problem Summary

Google is crawling 59 pages but choosing not to index them. The root cause is that `index.html` contains hardcoded SEO signals that tell Google every page is a duplicate of the homepage.

### Issues Found

1. **Hardcoded canonical URL (Critical):** Line 8 of `index.html` has `<link rel="canonical" href="https://aiagecalc.com/" />`. This tells Google that every single page on the site is a copy of the homepage, so it ignores them all.

2. **Homepage-specific meta tags on every page:** The `<title>`, `<meta name="description">`, and all Open Graph / Twitter tags in `index.html` describe only the homepage. When Googlebot crawls `/blog/some-post`, it initially sees homepage metadata before React hydrates and `react-helmet-async` overrides them -- but Googlebot may not wait.

3. **Thin Suspense fallback:** The loading state is just `"Loading..."` text (line 203 of `App.tsx`). If Googlebot renders the page before JS finishes, it sees near-empty content.

4. **Client-side redirects:** Old `/celebrity/:slug` and `/famous-birthdays/:slug` URLs use React `<Navigate>` (client-side), which Googlebot may not follow reliably. The `_redirects` file only works on specific hosts (Netlify/Cloudflare).

### Fix Plan

**1. Remove hardcoded canonical from `index.html`** (highest impact)
- Delete line 8: `<link rel="canonical" href="https://aiagecalc.com/" />`
- Each page already sets its own canonical via the `SEOHead` component, so this duplicate is unnecessary and harmful.

**2. Make `index.html` meta tags generic**
- Change the `<title>` to a short generic fallback: `"AiAgeCalc.com"`
- Change `<meta name="description">` to a brief generic description
- Remove or genericize OG/Twitter tags that are homepage-specific (the `SEOHead` component on each page provides proper per-page values)

**3. Improve Suspense fallback for SEO**
- Replace the bare `"Loading..."` text in `App.tsx` with a skeleton layout that includes the site name and a proper structure so Googlebot sees meaningful content even before hydration.

**4. Add server-side redirect meta tags**
- For the `CelebrityRedirect` and `FamousBirthdaysRedirect` components, add a `<meta http-equiv="refresh" content="0;url=/people/...">` via Helmet so that even non-JS crawlers follow the redirect, and set a `<link rel="canonical">` pointing to the new URL.

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Remove hardcoded canonical; genericize title, description, and OG/Twitter meta tags |
| `src/App.tsx` | Improve Suspense fallback; enhance redirect components with meta refresh + canonical |

### Expected Outcome

After these changes, Google will:
- No longer see every page as a duplicate of the homepage
- See unique, page-specific metadata on each route
- Follow old URL redirects reliably
- Find meaningful content even during the brief loading state

Re-indexing typically takes 1-4 weeks after the fix is deployed. You can speed it up by requesting re-indexing of key pages in Google Search Console.

