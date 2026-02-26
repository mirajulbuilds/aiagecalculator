

## Fix AdSense "Low Value Content" Rejection

Google AdSense rejected the site for "Low value content." This requires both content improvements and technical fixes to pass review.

---

### 1. Remove Test Mode from AdSense

**File:** `src/components/AdSenseBanner.tsx`

Remove `data-adtest="on"` from the `<ins>` tag. This flag tells Google your ads are in test mode and signals that the site isn't production-ready.

---

### 2. Expand the About Page

**File:** `src/pages/About.tsx`

The current About page has only ~50 words of content. AdSense requires substantial, original content on every page. Expand it to include:
- A detailed description of what AiAgeCalc offers (each tool explained)
- The mission/purpose of the site
- Information about the team or creator
- Links to all major tools on the site
- At least 300-500 words of unique content

---

### 3. Add a Terms of Service Page

**New file:** `src/pages/TermsOfService.tsx`

Create a proper Terms of Service page covering:
- Usage terms for the site and tools
- Intellectual property rights
- Disclaimers (AI-generated content, health calculators, etc.)
- Limitation of liability
- User conduct rules

Add a route for `/terms-of-service` in `App.tsx`.

---

### 4. Add a Contact Page

**New file:** `src/pages/Contact.tsx`

Create a Contact page with:
- A contact form (name, email, message)
- Contact email address
- Purpose/categories for inquiries

Add a route for `/contact` in `App.tsx`.

---

### 5. Update Footer with Required Links

**File:** `src/components/Footer.tsx`

Ensure the footer includes visible links to:
- About
- Privacy Policy
- Terms of Service
- Contact
- Blog

These are standard pages AdSense reviewers look for.

---

### 6. Enable Ad Placements on Key Pages

**File:** `src/pages/Index.tsx`

Uncomment at least 1-2 AdSense banner placements on the homepage so Google can verify ads are properly integrated. Currently ALL ad placements on the homepage are commented out.

Also uncomment sidebar ads on `CelebrityProfile.tsx` pages since those have substantial content.

---

### 7. Update Sitemaps

**File:** `public/sitemap-static.xml`

Add the new pages (`/terms-of-service`, `/contact`) to the static sitemap so Google discovers and indexes them.

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/AdSenseBanner.tsx` | Remove `data-adtest="on"` |
| `src/pages/About.tsx` | Expand content to 300-500 words |
| `src/pages/TermsOfService.tsx` | New page with full terms |
| `src/pages/Contact.tsx` | New page with contact form |
| `src/App.tsx` | Add routes for new pages |
| `src/components/Footer.tsx` | Add links to Terms, Contact |
| `src/pages/Index.tsx` | Uncomment 1-2 ad placements |
| `public/sitemap-static.xml` | Add new page URLs |

### After Deployment

Once these changes are live:
1. Wait 2-3 days for Google to re-crawl
2. Go to AdSense dashboard
3. Check "I confirm I have fixed the issues"
4. Click "Request review"
5. Google typically responds within 1-2 weeks

