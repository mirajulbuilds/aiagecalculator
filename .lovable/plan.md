
Goal: fix the dark-mode readability bug (not light mode) shown in your screenshot, where several headings and FAQ rows are too dim/near-invisible.

What I found from inspection
- The unreadable areas are concentrated in text elements that do not have explicit color classes:
  - Card titles (e.g., “Upload Your Photo”, “AI Age Estimation”)
  - “How It Works” section title and step headings
  - FAQ accordion question rows
- Text with explicit semantic classes (like `text-muted-foreground` or gradient headings) remains readable, which indicates this is a component-level inheritance/contrast issue rather than a full theme failure.
- The previous change edited light-mode tokens only (`--primary`, `--secondary`, `--ring`, `--gradient-primary`) and did not address this dark-mode bug.

Implementation plan
1) Revert the unintended light-mode token edits
- File: `src/index.css`
- Revert these variables to their pre-change values so brand/light palette is not altered while fixing dark mode:
  - `--primary` back to `250 75% 77%`
  - `--secondary` back to `250 75% 67%`
  - `--ring` back to `250 75% 77%`
  - `--gradient-primary` back to `linear-gradient(135deg, hsl(250 75% 77%), hsl(250 75% 67%))`

2) Make shared heading primitives dark-safe by default
- File: `src/components/ui/card.tsx`
  - Update `CardTitle` base class to include explicit semantic text color:
  - add `text-card-foreground`
  - This ensures card titles are always readable on card backgrounds in both themes, independent of inheritance issues.
- File: `src/components/ui/accordion.tsx`
  - Update `AccordionTrigger` base class to include:
  - `text-foreground`
  - This fixes FAQ row question text contrast in dark mode globally.

3) Patch local heading classes in Ai Face Age page for guaranteed contrast
- File: `src/pages/AiFaceAge.tsx`
- Add explicit semantic color where headings currently rely on implicit inheritance:
  - “How It Works” card title: add `text-card-foreground`
  - Step labels (“Upload Photo”, “AI Analysis”, “Get Results”): add `text-foreground`
- Keep existing muted and primary styling as-is so visual hierarchy remains intact.

4) Optional hardening for FAQ wrapper (small safeguard)
- File: `src/components/SEOFaqSection.tsx`
- Add `text-foreground` on the section container wrapper so any unstyled descendants remain readable in dark mode.
- Keep `text-muted-foreground` where intentionally used for secondary copy.

Why this approach
- It targets the actual failing text nodes from your screenshot.
- It avoids broad dark palette shifts that can cause regressions.
- It fixes the problem at shared component level (`CardTitle`, `AccordionTrigger`) so other pages benefit too.
- It restores the earlier unintended light-mode token changes.

Validation checklist (end-to-end)
- Test `/ai-face-age` in dark mode:
  - “Upload Your Photo” and “AI Age Estimation” headings readable
  - “How It Works” title + step headings readable
  - FAQ accordion question text readable in collapsed and expanded states
- Test `/ai-face-age` in light mode to confirm no regression.
- Spot-check other pages using card titles/accordion:
  - `/about` (card titles)
  - any page with `SEOFaqSection` (FAQ triggers)
- Verify contrast hierarchy is preserved:
  - primary accents remain primary
  - muted helper text remains secondary, not too bright

Files to update
- `src/index.css`
- `src/components/ui/card.tsx`
- `src/components/ui/accordion.tsx`
- `src/pages/AiFaceAge.tsx`
- `src/components/SEOFaqSection.tsx`
