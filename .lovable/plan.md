

## Fix Auth Modal UI Overlapping Issues

### Problem
From the screenshots, three issues are visible:
1. Input field icons overlap the typed text (icons use fixed `top-3` instead of vertical centering)
2. Social buttons, divider, and form fields crash together (`space-y-0` removes all gaps)
3. Card background is too transparent and headline uses invisible gradient-clip text

### Changes (single file: `src/pages/Auth.tsx`)

**1. Fix icon vertical centering (6 locations)**

All icon elements use `absolute left-3 top-3`. Change to `absolute left-3 top-1/2 -translate-y-1/2` so icons stay centered in the input. Affected lines: 195, 224, 231, 257, 264, 271.

**2. Fix container spacing**

- Line 214: `space-y-0` to `space-y-4` (sign-in tab)
- Line 247: `space-y-0` to `space-y-4` (sign-up tab)

**3. Reduce divider margin**

Line 160: `my-6` to `my-2` (since parent now provides `space-y-4`, this prevents double spacing).

**4. Fix card background**

Line 178: Replace `bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/20` with `bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700` for a solid, readable card.

**5. Fix headline text**

Line 180: Replace `bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent` with `text-gray-900 dark:text-white` so the title is always visible.

### Summary

| What | Fix |
|------|-----|
| Icon overlap on text | `top-3` to `top-1/2 -translate-y-1/2` on all 6 icons |
| Elements crashing together | `space-y-0` to `space-y-4` on both tab wrappers |
| Divider double-spacing | `my-6` to `my-2` |
| Card too transparent | Solid `bg-white/95` background with visible border |
| Headline invisible | Solid text color instead of gradient-clip |

