

## Fix Ads.txt "Not Found" and AdSense Re-review

### Problem
1. **Ads.txt Not Found**: Google cannot find `ads.txt` because SPA routing may intercept the request
2. **Low Value Content**: Still showing the old Dec 2025 rejection -- needs re-review after our recent content improvements

### Fix: Update `_redirects` for SPA Fallback

**File:** `public/_redirects`

Add a SPA catch-all redirect at the bottom that sends unknown routes to `index.html`, but configure it so static files (like `ads.txt`, `robots.txt`, `sitemap.xml`) are served directly. Hosting platforms like Netlify/Lovable use `_redirects` rules -- we need to ensure the fallback does NOT intercept static files.

Add this line at the end of `_redirects`:
```
/*  /index.html  200
```

This is a "rewrite" (200 status) that only applies when no matching file exists. Static files in `public/` (like `ads.txt`, `robots.txt`, sitemaps) are served first because they exist as real files. The catch-all only fires for client-side routes that don't match a file.

### Verify After Publishing

After publishing, confirm these URLs return correct content:
- `https://aiagecalc.com/ads.txt` -- should show plain text with the publisher ID
- `https://aiagecalc.com/robots.txt` -- should show robots file
- `https://aiagecalc.com/sitemap.xml` -- should show sitemap XML

### Re-request AdSense Review

The "Low value content" status is from Dec 2025 -- before all the content improvements we made (expanded About page, Terms of Service, Contact page). After publishing:

1. Go to your AdSense dashboard
2. Click on the site `aiagecalc.com`
3. Check "I have fixed the issues"
4. Click **Request review**
5. Google typically responds within 1-2 weeks

### Summary

| File | Change |
|------|--------|
| `public/_redirects` | Add SPA fallback `/* /index.html 200` |

