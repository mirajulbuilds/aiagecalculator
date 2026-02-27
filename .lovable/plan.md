

## Fix Celebrity Profile: Birthday Links + Age Comparison Calculator

### Change 1: Add Internal Links to "Shares a birthday with" Section (Lines 658-666)

Currently the "Did You Know?" card shows plain text like "Shares a birthday with Laura Marano and 2 others". This needs to link each celebrity name to their profile page.

**File:** `src/pages/CelebrityProfile.tsx` (lines 658-666)

Replace the plain text with `<Link>` components:
- First celebrity name becomes a clickable link to `/people/{profile_slug}`
- "and X others" text links to the same-birthday section or shows remaining names as links too
- Uses existing `sameBirthdayCelebrities` array which already has `profile_slug` data

### Change 2: Make "How Old Were You When X Was Born?" Functional (Lines 671-688)

Currently this card is just a static CTA linking to the homepage. Instead, make it an interactive mini-calculator:

- Add a date input (day/month/year selects or a single date input) for the user's birthdate
- On submit, calculate the age difference between the user's birthdate and the celebrity's birthdate
- Show a result like "You were 5 years old when [Celebrity] was born" or "You were born 3 years after [Celebrity]"
- All calculation is done client-side using `date-fns` (already imported)
- Keep the card compact -- input + button + result in the same card
- No backend call needed

### Technical Details

**File modified:** `src/pages/CelebrityProfile.tsx`

**For birthday links:**
- Use the existing `sameBirthdayCelebrities` state which contains `profile_slug` and `name`
- Render up to 2-3 names as individual `<Link>` elements separated by commas

**For age comparison calculator:**
- Add local state: `userBirthDate`, `comparisonResult`
- Add 3 `<Select>` dropdowns (day, month, year) inside the existing card
- Calculate on button click:
  - If user is older: "You were X years old when {name} was born"
  - If user is younger: "You were born X years after {name}"
  - If same date: "You share a birthday!"
- Result appears below the button in the same card
- No new components or files needed

