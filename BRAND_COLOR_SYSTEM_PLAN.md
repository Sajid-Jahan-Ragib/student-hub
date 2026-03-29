# Brand Color System Plan

## Objective

Apply a professional, restrained color system across the app using your specified palette.

## Fixed Palette (Do Not Change)

- Primary blue: #2F3E8F
- Secondary red: #E53935
- Accent green: #2E7D32
- White background: #FFFFFF
- Dark gray text: #333333
- Light gray section background: #F5F5F5

## Usage Ratios (Critical)

- Neutral colors: 80%
- Brand colors: 20%

## Role Mapping

- Background: #FFFFFF and #F5F5F5
- Main text: #333333
- Header, navbar, footer: #2F3E8F
- Primary buttons: #2F3E8F
- Call to action / important: #E53935
- Success, tiny accents, positive badges/icons: #2E7D32
- Links: #2F3E8F

## Prohibited Choices

- No random extra hues (no purple/orange/etc.)
- No overuse of red
- No overly colorful surfaces
- No pure black (#000000) body text

## Optional Premium Touch (Choose One)

- Subtle gradient: #2F3E8F -> #E53935
- or very light glass cards
- or clean minimalist section framing

Selected option for this project:

- Subtle gradient in hero/header only, with strict low contrast intensity.

## Existing Codebase Audit Summary

Current global tokens in src/index.css are different from required brand colors:

- --bg currently #f6f7fb (close but not exact neutral)
- --text currently #0f1623 (too dark vs requested #333333)
- --primary currently #1d92ff (must become #2F3E8F)
- --accent currently #f7a600 (must be removed/replaced)

High-impact UI zones to align:

- Hero/header gradient and header text
- Side menu background/hover states
- Global card/tile/button colors and hover states
- Section backgrounds and borders
- Status badges (success/warning/critical)
- Link colors and focus states

## Step-by-Step Execution Plan

### Step 1: Establish Global Design Tokens

Files:

- src/index.css

Tasks:

- Replace existing root color tokens with required palette.
- Add explicit semantic tokens to prevent random color usage:
  - --color-bg
  - --color-surface
  - --color-text
  - --color-text-muted
  - --color-primary
  - --color-primary-hover
  - --color-danger
  - --color-danger-hover
  - --color-success
  - --color-success-hover
  - --color-link
- Keep existing spacing/radius/typography tokens intact.

Acceptance:

- All future component styling references semantic tokens only.

### Step 2: Map Structural Surfaces

Files:

- src/index.css

Tasks:

- Ensure page background and section backgrounds use white/light gray.
- Ensure body and standard text use #333333 equivalent token.
- Ensure cards remain neutral, with brand colors only where intentional.

Acceptance:

- UI appears mostly neutral at a glance.

### Step 3: Header, Navigation, Footer Styling

Files:

- src/index.css
- relevant header/navigation components if needed

Tasks:

- Set header/navbar/footer dominant background to primary blue.
- Preserve readability of white text/icons on blue.
- Keep any gradient subtle and only in top hero/header area.

Acceptance:

- Structural chrome clearly branded in blue without overwhelming content.

### Step 4: Buttons and Interactive Elements

Files:

- src/index.css
- src/components/Common/index.jsx (if utility classes need updates)

Tasks:

- Primary actions: blue
- Important CTA actions: red (limited use)
- Success actions/states: green
- Define hover colors as darker variants.
- Standardize focus ring color for accessibility.

Acceptance:

- Button system is consistent and predictable.

### Step 5: Tiles, Cards, and Section Components

Files:

- src/index.css
- component styles that define cards/tiles

Tasks:

- Keep tiles and cards mostly neutral.
- Use color accents for icons/labels only where meaningful.
- Remove any non-approved accent color leftovers.

Acceptance:

- No random visual noise, cleaner professional presentation.

### Step 6: Feedback and Status Semantics

Files:

- src/index.css
- components using success/error/info badges/messages

Tasks:

- Success: green
- Important/urgent: red
- Default info/link emphasis: blue
- Ensure adequate contrast and consistent badge/text behavior.

Acceptance:

- Meaningful colors are semantically consistent across screens.

### Step 7: 80/20 Compliance Pass

Files:

- src/index.css
- whole src/components/\*\*

Tasks:

- Review all hard-coded color values.
- Replace non-compliant values with tokens.
- Keep color density restrained.

Acceptance:

- Neutral dominates; brand colors feel intentional.

### Step 8: Accessibility and Interaction QA

Tasks:

- Verify contrast for text on colored backgrounds.
- Verify hover/focus visibility for keyboard users.
- Verify color consistency on desktop and mobile.

Acceptance:

- No unreadable text or hidden controls due to color changes.

### Step 9: Regression Check and Build

Tasks:

- Run build and ensure no breakage.
- Quick manual walkthrough of major screens:
  - Home
  - Profile
  - Routines
  - Fees
  - Calendar
  - Courses
  - Admin

Acceptance:

- Build passes and no functional regressions from styling updates.

## Detailed Implementation Checklist

- [x] Step 1 complete: global semantic color tokens created.
- [x] Step 2 complete: neutral surface mapping done.
- [x] Step 3 complete: header/nav/footer aligned to blue.
- [x] Step 4 complete: button and hover system aligned.
- [x] Step 5 complete: cards/tiles cleaned and standardized.
- [x] Step 6 complete: status semantics aligned (red/green/blue).
- [x] Step 7 complete: non-approved colors removed.
- [ ] Step 8 complete: accessibility and interaction checks.
- [ ] Step 9 complete: build + manual QA pass.

Current validation notes:

- Build passed after implementation changes.
- Keyboard focus ring style is implemented for key interactive controls.
- Hard-coded component hex colors were removed from JSX render paths and replaced with semantic classes.
- Remaining for completion: manual visual walkthrough across major screens on desktop and mobile.

## Change Control Rules For This Work

- Do not alter app behavior or data logic.
- Styling changes only, unless a component requires minimal class wiring.
- Use token-based colors, avoid hard-coded values in components.
- Keep modifications incremental and verifiable step by step.

## How This File Will Be Used

- This is the active implementation context.
- Before each styling batch, reference the corresponding step in this plan.
- Mark checklist items as done only after validation.
