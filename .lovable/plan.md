

## Text Color Fix Plan

### Problem Identified

The site's **light mode** has a critical text visibility issue: the primary color (`--primary: 250 75% 77%`) is a very light lavender purple (HSL 250, 75%, 77% = approx #b8a0f5). When used in gradient text (`bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent`), headings become extremely faint and hard to read against the light background.

**Affected areas:**
1. **Logo** in the Header ("Ai Age Calculator") - barely visible
2. **H1 headings** across 15+ pages/components using gradient text
3. **Result values** (age numbers, scores, dates) using the same gradient pattern

### Root Cause

The light mode `--primary` at 77% lightness is too light for use as text color. In dark mode it works fine because the background is dark. The fix should darken the light mode primary color so gradient text is readable, without changing the dark mode appearance.

### Fix Strategy

**Single CSS change in `src/index.css`**: Darken the light mode `--primary` value from `250 75% 77%` to `250 75% 55%` (a more saturated, darker purple). This single change will fix all gradient text across the entire site because every heading uses the CSS variable.

Also update `--ring` to match, and slightly darken `--secondary` for consistent contrast.

### Files to Modify

**`src/index.css`** (lines 146-150 in `:root`):
- `--primary`: `250 75% 77%` -> `250 75% 55%` (darker, more readable purple)
- `--secondary`: `250 75% 67%` -> `250 75% 50%` (slightly darker for consistency)
- `--ring`: `250 75% 77%` -> `250 75% 55%` (match primary)

This single change fixes all 20+ instances of gradient text headings, logo text, and result values across every page without touching any component files.

### Technical Details

The gradient pattern `from-primary to-primary/60` means:
- Light mode current: from ~#b8a0f5 to ~#b8a0f5/60% opacity = nearly invisible
- Light mode fixed: from ~#6b3ce6 to ~#6b3ce6/60% opacity = strong, readable purple

All pages using `text-primary`, `bg-primary`, or gradient text will benefit from this change. The dark mode colors remain untouched.

