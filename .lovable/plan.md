

## Fix: Search Bar Icon Overlap & Compare Button Positioning

### Issue 1: Search Bar Icon/Text Overlap (FamousBirthdays.tsx, line 165)

The Input component's base styles use `pl-3` which may not be reliably overridden by the `pl-12` class passed via className. The memory notes confirm this is a known pattern issue.

**Fix:** Change `pl-12` to `!pl-12` (Tailwind important modifier) on line 165 to force the left padding override.

### Issue 2: Compare Button Misalignment (CelebrityCard.tsx, line 65-77)

The compare button is placed outside the `<Link>` element (line 62 closes it) but is still inside the card's relative container. With `absolute top-2 right-2`, it should overlay the top-right of the image. However, because it's after the Link in the DOM and the card layout uses flex-column flow, the button renders at the bottom instead.

**Fix:** Move the compare Button inside the image container div (before the closing `</div>` of the aspect-square div, around line 55), keeping its absolute positioning. This ensures it overlays correctly on the top-right corner of the image, similar to the age badge on the bottom-left.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/FamousBirthdays.tsx` | Line 165: `pl-12` to `!pl-12` |
| `src/components/CelebrityCard.tsx` | Move compare button from lines 65-77 into the image container (after line 54), keeping same styling |

