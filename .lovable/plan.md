

## User Authentication & Personalization System

### Overview

Add Sign Up / Sign In functionality so logged-in users get a personalized experience across all calculators and tools. Their Date of Birth, name, and gender are saved once and automatically used everywhere -- no repeated input needed.

### Database Changes

**New `profiles` table:**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | References auth.users(id), ON DELETE CASCADE |
| display_name | text | Optional |
| date_of_birth | date | Core field for personalization |
| gender | text | Used by Life Expectancy, Health Score, etc. |
| country | text | Used by Life Expectancy, Retirement calculators |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

**RLS policies:**
- Users can SELECT/UPDATE only their own row (`auth.uid() = id`)
- INSERT restricted to own row
- Admins can view all (for admin dashboard)

**Trigger:** Auto-create a profile row on every new signup via a database trigger on `auth.users`.

### Auth Flow

**New files:**
- `src/pages/Auth.tsx` -- Combined Sign Up / Sign In page with tabs
- `src/hooks/useAuth.ts` -- Central hook providing `user`, `profile`, `isLoading`, `signOut`, and `updateProfile`
- `src/contexts/AuthContext.tsx` -- Context provider wrapping the app, using `onAuthStateChange` listener + profile fetch

**Sign Up flow:**
1. User signs up with email + password
2. Email verification required (no auto-confirm)
3. After verification and first login, user is prompted to complete their profile (DOB, gender, country) via a modal or onboarding step
4. Profile saved to `profiles` table

**Sign In flow:**
1. Email + password login
2. Profile fetched from `profiles` table and stored in context
3. All tools auto-populate from profile data

### Header Changes (`src/components/Header.tsx`)

- Add a user avatar/icon button in the header
- When logged out: shows "Sign In" link to `/auth`
- When logged in: shows avatar dropdown with "My Profile", "Sign Out"
- Keep it minimal -- no major redesign

### Personalization Integration (Dynamic UI Rendering)

The key pattern: each calculator checks `useAuth()` for a profile. If a DOB exists, pre-fill the fields and optionally auto-calculate on mount.

**Pages to update:**

| Page | What changes |
|------|-------------|
| `Index.tsx` (Age Calculator) | Auto-fill birth day/month/year from profile DOB; auto-calculate on load |
| `CelebrityProfile.tsx` | Auto-fill the "How old were you when X was born?" calculator and show result immediately |
| `LifeExpectancyCalculator.tsx` | Pre-fill DOB + gender + country from profile |
| `RetirementCalculator.tsx` | Pre-fill DOB + gender + country |
| `HealthScoreCalculator.tsx` | Pre-fill DOB + gender |
| `CompatibilityCalculator.tsx` | Pre-fill "Your" birth date fields |
| `DueDateCalculator.tsx` | Pre-fill date fields if applicable |
| `PetAgeCalculator.tsx` | No DOB needed (pet's age), but show personalized greeting |
| `PastLifeGenerator.tsx` | Pre-fill DOB |

**Pattern for each page (pseudocode):**
```text
const { profile } = useAuth();

useEffect(() => {
  if (profile?.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    setBirthDay(dob.getDate().toString());
    setBirthMonth((dob.getMonth() + 1).toString());
    setBirthYear(dob.getFullYear().toString());
    // Auto-trigger calculation
  }
}, [profile]);
```

### Profile Page (`src/pages/Profile.tsx`)

A simple page where users can:
- View/edit their display name, DOB, gender, country
- See a summary of their personalized stats (your age, your zodiac, your life path number)
- Delete their account

### Implementation Order

1. **Create `profiles` table** with RLS + auto-create trigger (database migration)
2. **Build AuthContext + useAuth hook** (session listener, profile fetch/cache)
3. **Build Auth page** (Sign Up / Sign In with tabs)
4. **Update Header** with user menu (Sign In / avatar dropdown)
5. **Build Profile page** (view/edit profile data)
6. **Integrate personalization into calculators** (auto-fill DOB from profile across all tools)
7. **Auto-calculate on CelebrityProfile** (instant result for logged-in users on the "How old were you" card)

### What This Does NOT Change

- Anonymous users can still use every tool exactly as before (no login wall)
- Admin auth flow remains completely separate (existing AuthGateway + 2FA)
- No changes to the existing admin panel or security architecture

### Engagement Benefits

- **Reduced friction**: DOB entered once, used everywhere
- **Instant results**: Celebrity profile pages show personalized age comparison automatically
- **Return visits**: Users come back to see age updates, new celebrity comparisons
- **Session depth**: Pre-filled calculators encourage trying multiple tools

