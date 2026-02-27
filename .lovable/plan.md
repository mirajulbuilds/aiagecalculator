

## Full User Auth & Personalized Profile Dashboard

### Overview
Revamp the signup form to collect Full Name and Date of Birth upfront, redesign the `/profile` page into a rich personalized dashboard with birthday data auto-calculated, and ensure proper post-verification redirects.

---

### Action 1: Update Sign-Up Form (Auth.tsx)

**Current state:** Sign-Up form has Display Name, Email, Password.

**Changes:**
- Split "Display Name" into a single "Full Name" field (keep saving as `display_name` in profiles)
- Add a **Date of Birth** field using the Shadcn DatePicker (Popover + Calendar) between Full Name and Email
- On signup, pass both `display_name` and `date_of_birth` in the `options.data` metadata
- Update the `handle_new_user` database trigger to read `raw_user_meta_data` and populate `display_name` and `date_of_birth` in the profiles table automatically

**Field order:** Full Name -> Date of Birth -> Email -> Password

**Database migration:** Update the `handle_new_user()` trigger function to extract and save `display_name` and `date_of_birth` from `raw_user_meta_data`.

---

### Action 2: Post-Verification Flow (Auth.tsx + AuthContext.tsx)

- Change `emailRedirectTo` to `${SITE_URL}/profile` so verified users land on the profile dashboard
- Update OAuth `redirect_uri` from `window.location.origin` to `SITE_URL`
- In `handleSignIn`: after successful login, fetch profile; if `date_of_birth` is missing, redirect to `/profile`; otherwise redirect to `/`
- Add `isProfileComplete` boolean to AuthContext (true when `date_of_birth` exists)

---

### Action 3: Redesign Profile Page into Dashboard (Profile.tsx)

Complete rewrite of `/profile` into a visually engaging dashboard:

**A. Profile Completion Banner**
- If `gender` or `country` is missing, show a collapsible "Complete Your Profile" card at the top with those fields

**B. Dynamic Greeting**
- "Good Morning/Afternoon/Evening, [Full Name]!" based on local time (before 12 = Morning, 12-17 = Afternoon, after 17 = Evening)

**C. Profile Card**
- Avatar placeholder with initials, email, member since date
- Three action buttons at the bottom: "Edit Profile" (opens edit modal/section), "Log Out", "Delete Account" (red, with confirmation dialog)

**D. Birthday Dashboard (auto-calculated from saved DOB)**
- **Age Stats Grid**: Years, Months, Days, Hours, Minutes, Seconds (live-updating like the Index page)
- **Birthday Countdown**: Visual countdown timer showing days until next birthday
- **Zodiac Sign Card**: Sign name + symbol
- **Shared Birthdays**: Query celebrities table for same month/day, display using existing `CelebrityCard` component
- **Total Days Lived**: Large number display (reusing `AgeDisplayFormats` pattern)

**E. Delete Account**
- Confirmation dialog warning about permanent deletion
- Calls `supabase.auth.admin` or a secure edge function to delete the user account
- Note: Will create a `delete-account` edge function that uses service role to delete the user from auth and their profile

---

### Action 4: Delete Account Edge Function

Create `supabase/functions/delete-account/index.ts`:
- Accepts authenticated requests only (verifies JWT)
- Deletes the user's profile row
- Deletes the user from `auth.users` using the service role key
- Returns success/error

---

### Technical Summary

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Add DOB DatePicker to signup, pass DOB in metadata, update redirects |
| `src/pages/Profile.tsx` | Full rewrite as dashboard with greeting, stats, countdown, celebrities, actions |
| `src/contexts/AuthContext.tsx` | Add `isProfileComplete` boolean |
| `supabase/functions/delete-account/index.ts` | New edge function for account deletion |
| DB migration | Update `handle_new_user()` trigger to extract DOB from user metadata |

### No new tables needed
The existing `profiles` table already has all required columns (`display_name`, `date_of_birth`, `gender`, `country`).

