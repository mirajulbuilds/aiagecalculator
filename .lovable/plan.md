# Fix admin login loop

## What's broken

Two separate problems, both confirmed by inspection:

1. **2FA data is unreadable by the app.** The `admin_2fa` table currently has only one policy — "Deny anonymous access". There is no policy for signed-in users, so with row-level security on, every read/write from a logged-in admin returns nothing. The 2FA edge functions (`check-2fa-status`, `verify-2fa`, `enroll-2fa`) all query that table using the *user's* identity, so:
   - status check reports "not enrolled" even though the admin record exists and is enrolled,
   - the admin panel bounces to `/2fa-enrollment`, enrollment can't write, verification always says the code is invalid → the continuous redirect/reload loop.

2. **The live domain is not on the admin allowlist.** `DomainGuard`, `ProtectedAdminRoute`, `BasicAdminRoute`, `AuthGateway`, and the 2FA pages only allow `*.lovable.app` / `*.lovableproject.com`. On `aiagecalc.com` (the published site) admin routes show "Access denied" and redirect to `/`, so admin login can't be used on the real domain at all.

## The fix

**Backend (keeps secrets safe)**
- Switch the three 2FA edge functions to read/write `admin_2fa` with the server-side service key *after* validating the caller's token and admin role in code. The TOTP secret and recovery codes stay unreadable from the browser — no new client-facing read policy on `admin_2fa`.
- Add an owner-scoped policy set only if needed for the admin 2FA management screen; otherwise leave the table client-locked and keep using the existing `get_admin_2fa_overview` function.

**Frontend**
- Centralize the domain allowlist in one shared helper and include `aiagecalc.com` and `www.aiagecalc.com` alongside the Lovable preview domains. Update `DomainGuard`, `ProtectedAdminRoute`, `BasicAdminRoute`, `AuthGateway`, `TwoFactorEnrollment`, `TwoFactorVerification`, and the `check-2fa-status` origin check to use it.
- Make the guards fail without self-redirecting to the same origin, so a blocked check can never produce a reload loop.

## Verification

- Sign in at the admin gateway, confirm the status check reports enrolled, enter a 2FA code, and land on the admin panel with no redirect loop.
- Confirm the TOTP secret still cannot be read from the browser.
