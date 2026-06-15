## Goal
Restore `supabase/functions/past-life-generator/index.ts` to its state before the recent system-message / prompt / temperature / max_tokens changes. Leave all UI (PastLifeGenerator.tsx SEO content) untouched.

## Changes

**File: `supabase/functions/past-life-generator/index.ts`**

1. System message → revert to previous:
   `"You are a mystical storyteller who creates engaging, imaginative past life narratives based on astrology and numerology. Your stories are vivid, positive, and shareable."`

2. User prompt → revert to previous generic version:
   `"Create a captivating 'past life' story for someone whose Zodiac Sign is ${zodiacSign} and Life Path Number is ${lifePathNumber}. Write a vivid, engaging 2-3 paragraph narrative (150-200 words) about who they were in a past life — their era, profession, personality, and a memorable moment. Make it mystical yet believable, positive, and shareable. Write in second person ('You were...')."`

3. AI request body → remove `max_tokens: 500`, set `temperature` back to `0.9`.

All other code (rate limiting, validation, zodiac calc, life-path calc, CORS, error handling) stays identical.

## Deploy
Redeploy the `past-life-generator` edge function after the edit.

## Not touched
- `src/pages/PastLifeGenerator.tsx` (SEO content stays)
- Any other files
