

## Keyword Integration Plan for AiAgeCalc.com

### Analysis Summary

After reviewing all existing pages, routes, SEO metadata, and navigation, here's how the researched keywords map to the site:

### Keyword Mapping

#### Already Covered (SEO optimization needed only)

These pages exist but need keyword-enriched titles, descriptions, and on-page content:

| Keyword Group | Existing Page | Current Route |
|---|---|---|
| chronological age calculator, age calculator by date of birth | Index (/) | `/` |
| dog age calculator, cat age calculator | PetAgeCalculator | `/pet-age-calculator` |
| age difference calculator, age gap calculator | AgeDifferenceCalculator component | `/` (tab) |
| find famous look alike, celebrities who look like me, doppelganger finder, star by face, what celebrity do i look like | LookAlikeFinder | `/look-alike-finder` |
| face check id, reverse face search | AiFaceAge | `/ai-face-age` |
| love calculator, compatibility test, astrology compatibility, zodiac compatibility test | CompatibilityCalculator | `/compatibility-calculator` |
| who was i in my past life, what was i in a past life, past life reading, past life calculator | PastLifeGenerator | `/past-life-generator` |
| when will i die test, longevity calculator, how long will i live calculator, life span calculator, realistic life expectancy calculator, date of death calculator | LifeExpectancyCalculator | `/life-expectancy-calculator` |
| due date calculator by ivf, calculate my due date from conception, conception to due date calculator, baby due date calculator | DueDateCalculator | `/due-date-calculator` |
| retirement income calculator, retirement plan calculator, early retirement calculator | RetirementCalculator | `/retirement-calculator` |
| heart age calculator, metabolic age calculator | HealthScoreCalculator | `/health-score-calculator` |

#### NOT Yet Covered (Need new pages or features)

| Keywords | Action Needed |
|---|---|
| biological age calculator, adjusted age calculator, mental age test | New pages or sections |
| find my doppelganger | Redirect alias to look-alike-finder |
| reincarnation photo match | New feature on past-life page |
| past life astrology chart, previous birth calculator | Enrich past-life-generator content |
| chinese love zodiac, chinese zodiac sign matches, synastry calculator, life path calculator, name number calculator | Enrich compatibility-calculator or add sub-tools |
| calculate how many days you've been alive | Already exists in Index but needs SEO keyword targeting |
| dog due date calculator, canine due date calculator, fet due date calculator | Add as calculation methods in DueDateCalculator |
| retirement withdrawal calculator, how long will retirement savings last calculator, retirement calculator with social security | Enrich RetirementCalculator page content |

---

### Implementation Plan

### Phase 1: SEO Metadata Updates (All Existing Pages)

Update `SEOHead` keywords, titles, and descriptions on every existing page to include the target keywords naturally:

**Pages to update:**
1. **Index.tsx** - Add keywords: "chronological age calculator", "age calculator by date of birth", "calculate how many days you've been alive", "age difference calculator", "age gap calculator"
2. **PetAgeCalculator.tsx** - Add keywords: "dog age calculator", "cat age calculator"
3. **LookAlikeFinder.tsx** - Add keywords: "find famous look alike", "celebrities who look like me", "doppelganger finder", "star by face", "find my doppelganger", "what celebrity do i look like"
4. **AiFaceAge.tsx** - Add keywords: "face check id", "reverse face search"
5. **CompatibilityCalculator.tsx** - Add keywords: "love calculator", "compatibility test", "astrology compatibility", "zodiac compatibility test", "chinese love zodiac", "synastry calculator", "life path calculator", "name number calculator"
6. **PastLifeGenerator.tsx** - Add keywords: "who was i in my past life", "what was i in a past life", "past life reading", "past life calculator", "reincarnation photo match", "past life astrology chart", "previous birth calculator"
7. **LifeExpectancyCalculator.tsx** - Add keywords: "when will i die test", "longevity calculator", "how long will i live calculator", "date of death calculator", "life span calculator", "realistic life expectancy calculator", "calculate how many days you've been alive"
8. **DueDateCalculator.tsx** - Add keywords: "due date calculator by ivf", "calculate my due date from conception", "conception to due date calculator", "baby due date calculator", "dog due date calculator", "canine due date calculator", "fet due date calculator"
9. **RetirementCalculator.tsx** - Add keywords: "retirement income calculator", "retirement withdrawal calculator", "how long will retirement savings last calculator", "retirement plan calculator", "retirement calculator with social security", "early retirement calculator"
10. **HealthScoreCalculator.tsx** - Add keywords: "heart age calculator", "metabolic age calculator", "biological age calculator"

### Phase 2: On-Page SEO Content Sections

Add keyword-rich FAQ or informational content sections at the bottom of each page (similar to the existing SEO article on the Index page). These serve dual purpose: help users and signal relevance to search engines.

Each page will get an SEO content block with:
- H2/H3 headings using target keywords naturally
- FAQ-style Q&A blocks (good for featured snippets)
- Internal links to related tools on the site
- Structured around 300-500 words per page

### Phase 3: Add Missing Calculation Methods

**DueDateCalculator** - Add new calculation method options:
- "IVF Transfer Date" (for IVF/FET keywords)
- Keep existing LMP and Conception methods
- Add "Dog/Canine Due Date" as a separate pet pregnancy option

**RetirementCalculator** - Add additional result fields:
- Retirement withdrawal projections
- "How long savings will last" estimate
- Social security consideration toggle

**CompatibilityCalculator** - Enrich results to prominently display:
- Chinese zodiac compatibility (already computed but needs keyword-targeted headings)
- Life path number details
- Name number calculator as an additional input

### Phase 4: Static Sitemap Update

Update `supabase/functions/generate-sitemap-static/index.ts` to ensure all tool pages are included in the sitemap with proper priority and change frequency values.

---

### Files to Modify

| File | Changes |
|---|---|
| `src/pages/Index.tsx` | Update SEOHead keywords + add FAQ section |
| `src/pages/PetAgeCalculator.tsx` | Update SEOHead keywords + add FAQ |
| `src/pages/LookAlikeFinder.tsx` | Update SEOHead keywords + add FAQ |
| `src/pages/AiFaceAge.tsx` | Update SEOHead keywords + add FAQ |
| `src/pages/CompatibilityCalculator.tsx` | Update SEOHead keywords + add FAQ + name number input |
| `src/pages/PastLifeGenerator.tsx` | Update SEOHead keywords + add FAQ |
| `src/pages/LifeExpectancyCalculator.tsx` | Update SEOHead keywords + add FAQ |
| `src/pages/DueDateCalculator.tsx` | Update SEOHead keywords + add IVF/FET/dog methods + FAQ |
| `src/pages/RetirementCalculator.tsx` | Update SEOHead keywords + add withdrawal/social security sections + FAQ |
| `src/pages/HealthScoreCalculator.tsx` | Update SEOHead keywords + add FAQ |

### No New Routes Needed

All keywords can be effectively targeted through the existing page structure with enriched SEO metadata and on-page content. This is the most SEO-efficient approach since established pages with existing authority will rank faster than brand new pages.

