# Icon concepts for Pause Réflexe

## Constraints

Browser extension icons must stay readable at small sizes, especially 16×16 and 32×32. The icon should avoid detailed text and should work in a toolbar next to many other icons.

Current product vocabulary:

- pause, reflex, habit, regain control
- calm, supportive, non-punitive
- blue/white product palette with small success/warning accents

Palette from the extension:

- Primary blue: `#2563eb`
- Strong blue: `#1d4ed8`
- Soft blue: `#eff6ff`
- Text: `#17202a`
- Success green: `#027a48`
- Warning amber: `#b54708`

## Concepts

### A — Pause button inside a soft shield

Shape: rounded shield or squircle with a pause symbol.

Meaning:

- pause is immediate and readable
- shield suggests protection without punishment
- very legible at 16×16

Risk:

- can look like a generic security extension if too shield-like

Score: 8/10

### B — Cursor/arrow interrupted by a pause mark

Shape: small cursor arrow heading toward a pause symbol.

Meaning:

- directly maps to “I was about to click/open by reflex”
- strongest link to browsing behavior

Risk:

- more detail, weaker at 16×16 unless simplified aggressively

Score: 7/10

### C — Loop/reflex arrow broken by pause

Shape: circular loop arrow with a pause mark in the break.

Meaning:

- best conceptual fit for “réflexe” and “changer une habitude”
- says “break the loop” without guilt

Risk:

- circular arrows are common; must be stylized simply

Score: 9/10

### D — Hand raised / stop-pause hybrid

Shape: soft hand silhouette with a pause mark.

Meaning:

- “reprendre la main” is very literal
- supportive and human

Risk:

- hand details collapse at small sizes
- may read as “stop” rather than “pause volontaire”

Score: 6/10

### E — Tiny step / progress mark with pause

Shape: step/chevron upward next to pause mark.

Meaning:

- matches recent congratulation frame: “une étape de plus”
- positive reinforcement

Risk:

- less obvious as a blocking/pause extension

Score: 7/10

## Decision

Use **C — loop/reflex arrow broken by pause** as the main icon.

Why:

- it is unique to the product promise: breaking an automatic loop
- it avoids punitive “blocked” imagery
- it still reads as pause/control at toolbar size
- it can be rendered as a simple blue circular mark with white pause bars

Fallback if we want the safest toolbar readability: **A — pause inside a soft shield**.

## Proposed final direction

A blue rounded square/squircle background, with a white circular arrow forming an incomplete loop, interrupted by two vertical pause bars.

At 16×16:

- keep only blue background + white pause bars + partial loop
- no text
- no fine shadows

At 48×48 and 128×128:

- add subtle soft-blue highlight
- add a small green progress check to reinforce positive progress

## Implementation

Committed assets live in `src/icons/`:

- `icon.svg`: full-size source with the green progress check
- `icon-small.svg`: simplified small-size source without the green check for 16×16/32×32 readability
- `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`: manifest-ready PNG files

`src/manifest.json` uses these files for both the extension icon and toolbar action icon.
