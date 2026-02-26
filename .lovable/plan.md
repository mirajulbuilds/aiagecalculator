

## Add User Engagement Features to Celebrity Profile Pages

### Current State
The celebrity profile page already has:
- Share button (single icon in sidebar)
- "Fans Also Viewed" section (same profession)
- Same birthday celebrities section
- Same zodiac celebrities section
- Live age counter
- Popularity rankings

### What's Missing (High-Value Additions)

#### 1. Social Share Bar with Platform-Specific Buttons
Replace the single generic share icon with a dedicated share card featuring buttons for Twitter/X, Facebook, WhatsApp, and copy link. This increases shareability and shows Google the page is designed for social engagement.

**File:** `src/pages/CelebrityProfile.tsx`
- Add a new "Share This Profile" card in the sidebar (below the fact sheet)
- Include buttons for: Twitter/X, Facebook, WhatsApp, Copy Link
- Each button opens a pre-filled share URL with the celebrity's name and page URL

#### 2. "Did You Know?" Fun Facts Card
Add a dynamic fun facts section in the sidebar that calculates interesting stats from the celebrity's birth date -- things like "has been alive for X heartbeats", "born on a [day of week]", "shares a birthday with X other celebrities". This adds unique, programmatic content that Google values.

**File:** `src/pages/CelebrityProfile.tsx`
- New card in the sidebar using existing `ageData`
- Show: day of week born, estimated heartbeats, generation name (Gen Z, Millennial, etc.), Chinese zodiac year

#### 3. Quick Age Comparison CTA
Add a call-to-action card encouraging users to compare their own age with the celebrity, linking to the main age calculator with the celebrity's birthdate pre-referenced.

**File:** `src/pages/CelebrityProfile.tsx`
- New card in sidebar: "How old were you when [Celebrity] was born?"
- Links to the homepage calculator, boosting internal linking

#### 4. Breadcrumb Navigation
Add breadcrumb navigation at the top (Home > Famous Birthdays > [Celebrity Name]) which improves SEO structure and user navigation.

**File:** `src/pages/CelebrityProfile.tsx`
- Replace the simple "Back to Directory" link with a proper breadcrumb trail
- Add BreadcrumbList JSON-LD schema for this page

### Summary of Changes

| File | Change |
|------|--------|
| `src/pages/CelebrityProfile.tsx` | Add social share bar, "Did You Know?" facts card, age comparison CTA, breadcrumb navigation with JSON-LD |

### Technical Notes
- All new features use existing data (no new database queries needed)
- Social share buttons use direct URL schemes (no third-party SDKs)
- Fun facts are calculated client-side from `date_of_birth` and `ageData`
- Breadcrumb JSON-LD merges with existing Person schema in the Helmet
- No new dependencies required -- uses existing lucide-react icons and UI components

