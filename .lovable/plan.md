

## Fix Personalization Popup: Overlay, Background, and Text Readability

### Problem

The popup's overlay is too dark (`bg-black/80`), and the modal card uses a near-transparent background (`bg-white/10`) making text unreadable. The headline uses `bg-clip-text text-transparent` which disappears on certain backgrounds.

### Change 1: Lighten the Dialog Overlay

**File:** `src/components/ui/dialog.tsx` (line 22)

Change the default overlay from `bg-black/80` to `bg-black/40 backdrop-blur-sm` so the site remains visible behind the popup without feeling oppressively dark.

**Note:** This changes the global Dialog overlay. Since other dialogs on the site (alert-dialog, etc.) use their own primitives, this only affects components using `DialogContent`.

### Change 2: Fix the Popup Modal Card

**File:** `src/components/PersonalizationPopup.tsx` (line 69)

Replace the nearly invisible card background:
- **Before:** `bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/20`
- **After:** `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-2xl`

This gives the card a solid, readable background with proper border contrast in both themes.

### Change 3: Fix Headline Text

**File:** `src/components/PersonalizationPopup.tsx` (line 83)

Replace the invisible gradient-clip text:
- **Before:** `bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent`
- **After:** `text-gray-900 dark:text-white`

### Change 4: Fix Description Text

**File:** `src/components/PersonalizationPopup.tsx` (line 86)

Change from `text-muted-foreground` to explicit `text-gray-600 dark:text-gray-300` for guaranteed contrast.

### Change 5: Fix Button Contrast

**File:** `src/components/PersonalizationPopup.tsx` (lines 92-109)

- **Google button:** Replace `bg-background/50` with `bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white` for solid, high-contrast appearance.
- **Email button:** Replace `variant="secondary"` with `variant="default"` and add `bg-primary text-white hover:bg-primary/90` to make it a clear primary CTA.

### Change 6: Fix "Maybe Later" Text

**File:** `src/components/PersonalizationPopup.tsx` (line 114)

Change from `text-muted-foreground` to `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200`.

### Summary

| File | What Changes |
|------|-------------|
| `src/components/ui/dialog.tsx` | Overlay: `bg-black/80` to `bg-black/40 backdrop-blur-sm` |
| `src/components/PersonalizationPopup.tsx` | Card background, headline, description, buttons, dismiss link -- all get solid, high-contrast colors |

