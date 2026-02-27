
## Fix: Email Verification Redirects to "Access Denied" Page

### Root Cause

In `src/pages/Auth.tsx` (line 102), the signup call uses `window.location.origin` as the email redirect URL:

```typescript
emailRedirectTo: window.location.origin
```

When a user signs up from the **preview iframe** (e.g., `https://id-preview--b74e7838-...lovable.app`), that origin gets baked into the verification email link. Clicking "Verify Email" then redirects to the preview URL, which shows Lovable's "Access denied" page because the user isn't a project collaborator.

The same issue also affects the **password reset** flow (line 88), which uses `window.location.origin` for `redirectTo`.

### Fix

**File:** `src/pages/Auth.tsx`

1. **Define the canonical app URL** at the top of the component (or as a constant):
   ```typescript
   const SITE_URL = 'https://aiagecalculator.lovable.app';
   ```

2. **Line 102** -- Change signup redirect:
   - Before: `emailRedirectTo: window.location.origin`
   - After: `emailRedirectTo: SITE_URL`

3. **Line 88** -- Change password reset redirect:
   - Before: `redirectTo: \`${window.location.origin}/reset-password\``
   - After: `redirectTo: \`${SITE_URL}/reset-password\``

### Result

After this change, clicking "Verify Email" in the confirmation email will redirect users to `https://aiagecalculator.lovable.app` (the published app) instead of the Lovable editor preview, eliminating the "Access denied" error.

### Note

If you later connect a custom domain (e.g., `https://aiagecalc.com`), update `SITE_URL` to match. Alternatively, we could use an environment variable for this, but a hardcoded constant is simpler for now.
