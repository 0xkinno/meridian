# MERIDIAN — UI INSTRUCTION MASTER SPEC
## Premium Editorial / Magazine-Grade Product Experience for Codex

> **READ THIS ENTIRE FILE BEFORE MODIFYING THE UI.**
>
> This document is the authoritative UI/UX direction for MERIDIAN.
> It exists because a merely functional dashboard, generic Tailwind interface, empty card grid,
> or "clean SaaS" treatment is NOT acceptable.
>
> The target is a **high-budget, flagship digital product experience**:
> editorial, cinematic, intelligent, precise, architectural, premium, restrained and memorable.
>
> The attached visual reference is not available inside the terminal. Therefore, this document
> deliberately translates the visual language into explicit implementation rules. Do not ask for
> the image. Do not invent a simpler interpretation. Use this specification as the visual source of truth.
>
> Existing MERIDIAN functionality, KeeperHub integration, routes, API contracts, safety rules,
> data models and execution logic are valuable. The UI upgrade must improve presentation without
> breaking working behavior.

---

# 1. NON-NEGOTIABLE QUALITY BAR

MERIDIAN must look like it was designed by a senior product-design team for a serious financial/AI company.

Think:

- Apple product storytelling
- Figma marketing pages
- Adobe editorial art direction
- Linear's precision
- Stripe's information hierarchy
- premium financial publications
- contemporary architecture magazines
- high-end enterprise AI products
- cinematic product films
- carefully art-directed WebGL/product renders
- Framer-quality motion and transitions

Do NOT make it look like:

- a Tailwind starter
- shadcn default components
- a generic Web3 dashboard
- a crypto trading terminal
- an admin template
- a collection of cards
- a "dark mode dashboard"
- a template marketplace theme
- a page with excessive gradients
- a page with giant empty whitespace and little information
- a page where every section is a rounded rectangle
- a page where every button is a pill
- a page where icons substitute for hierarchy
- a page that relies on decorative SVG illustrations

**The standard is: if a judge opens MERIDIAN for three seconds, the interface should immediately feel expensive.**

The UI must communicate:

**control + intelligence + reliability + financial precision + autonomous execution.**

---

# 2. THE CENTRAL ART-DIRECTION IDEA

## "STRATEGY BECOMES EXECUTION."

MERIDIAN is not merely software for monitoring transactions.

It translates a human strategy into an autonomous, observable execution system.

The interface should visually communicate that transformation:

HUMAN INTENT
→
POLICY
→
WORKFLOW
→
RISK
→
EXECUTION
→
PROOF

This sequence should influence the entire visual system.

The product should feel like an editorial story about an intelligent execution engine, not a database UI.

---

# 3. VISUAL REFERENCE — TRANSLATED INTO IMPLEMENTATION RULES

The supplied reference has a very specific visual character.

## 3.1 Composition

Use strong editorial compositions:

- large hero typography
- asymmetrical but controlled layouts
- large visual blocks
- dark cinematic feature surfaces
- light editorial sections
- thin rules
- deliberate spacing
- compact labels
- large numerical facts
- visual storytelling
- layered content
- image/product-artifact panels
- occasional overlapping compositions
- strong vertical rhythm

Do not stack ten identical cards vertically.

Use different visual scales.

A page should have:

1. a dominant statement
2. a supporting explanation
3. a visual artifact
4. structured evidence
5. a transition into the next story

That rhythm creates the magazine feeling.

---

# 4. MERIDIAN VISUAL IDENTITY

The existing MERIDIAN design system defines:

- warm off-white background
- restrained copper accent
- dark charcoal typography
- serif display typography
- clean sans body typography
- mono technical typography
- minimal borders
- subtle shadows
- editorial hierarchy

Keep that foundation, but elevate it dramatically.

The current instruction already specifies a warm off-white palette and copper accent. Preserve the
brand logic rather than replacing it with a random neon crypto palette.

Reference foundation:

- page: `#FAFAF8`
- surface: `#F2F1EF`
- elevated: `#FFFFFF`
- inset: `#ECEAE7`
- primary text: `#1A1A19`
- secondary text: `#5C5B58`
- tertiary text: `#8A8985`
- accent: `#B5722E`
- accent hover: `#9A6127`
- accent tint: `#F5EDE4`
- success: `#2D7A3A`
- error: `#C23B2E`

Do not introduce ten new accent colors.

Copper should remain the signature interactive accent.

For cinematic hero/feature areas, dark charcoal/near-black surfaces may be used intentionally.

Suggested dark editorial surface:

- `#0B0B0A`
- `#111110`
- `#171614`

Use dark sections as deliberate "chapters", not as the entire application.

---

# 5. LIGHT + DARK EDITORIAL CHAPTERS

The reference's strongest quality comes from contrast between editorial light sections and cinematic dark sections.

MERIDIAN should use the same principle.

Example landing sequence:

LIGHT:
- navigation
- hero introduction
- strategy statement

DARK:
- autonomous execution visualization
- workflow/risk feature story
- transaction proof

LIGHT:
- strategy types
- marketplace
- reliability metrics

DARK:
- execution timeline / audit story

LIGHT:
- final CTA / product entry

This is much stronger than forcing the entire site into one background.

Inside the dashboard, use the same principle more subtly:
light base application + dark feature panels for high-value information.

---

# 6. TYPOGRAPHY — THIS IS CRITICAL

Typography is one of the primary reasons the reference looks premium.

Never use typography casually.

## Display

Use the existing approved serif family:

- DM Serif Display
- or Playfair Display

If the project already has a working local font, keep it.

Display headings should feel editorial and confident.

Examples:

"Set the strategy.
We handle the last mile."

"Execution, without the babysitting."

"Every strategy leaves a proof."

"Your policy.
Our execution layer."

Avoid generic SaaS headings such as:

"Manage your strategies"

"Dashboard"

"Welcome back"

unless required as secondary UI labels.

## Body

Use:

- Inter
- DM Sans
- or the existing approved body font.

Body copy must be highly legible, compact and calm.

Never use oversized body text.

## Technical / data

Use:

- JetBrains Mono
- IBM Plex Mono
- or existing mono font.

Use mono for:

- transaction hashes
- wallet addresses
- chain IDs
- timestamps where appropriate
- execution IDs
- risk scores
- technical labels
- audit events
- workflow node metadata

## Type hierarchy

The hierarchy must be obvious without excessive boldness.

Suggested:

Display:
clamp(3rem, 7vw, 7rem)

Hero supporting:
16–20px

Section heading:
clamp(2rem, 4vw, 4.5rem)

Page title:
clamp(2rem, 4vw, 3.5rem)

Body:
15–17px

Metadata:
11–13px

Mono:
11–14px

Do not blindly use these values. Tune them to the composition.

---

# 7. TYPOGRAPHIC BEHAVIOR

Headlines should NOT be centered everywhere.

Use editorial alignment:

- left aligned by default
- centered only for major hero moments
- right-aligned numerical facts where useful
- controlled line breaks

A large headline should occupy a deliberate shape.

Example:

MERIDIAN

Set your strategy.
The agent handles
the last mile.

Do not produce:

MERIDIAN
Set your strategy. The agent handles the last mile.

That looks like ordinary SaaS.

Use line breaks intentionally.

---

# 8. GRID SYSTEM

Create a consistent editorial grid.

Recommended desktop:

- max-width: 1440px
- horizontal padding: 48–72px
- 12-column grid
- column gap: 20–32px

Recommended laptop:

- max-width: 1280px
- horizontal padding: 40px

Recommended mobile:

- 20px horizontal padding
- 4-column conceptual grid
- no horizontal overflow
- no clipped content
- no text collisions

Use CSS Grid, Flexbox and intrinsic sizing.

Do NOT solve layouts by randomly adding margins until they "look okay".

Every section must have a clear grid relationship.

---

# 9. SPACING

Premium interfaces depend on disciplined spacing.

Use a consistent rhythm based around:

4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96 / 128

Do not use arbitrary 17px / 37px / 53px values unless a visual reason exists.

Large spacing is allowed.

But large spacing must separate meaningful chapters, not create empty screens.

**Premium ≠ empty.**

The interface must feel spacious while still feeling information-rich.

---

# 10. SHAPES AND CORNERS

Avoid the modern "everything is a rounded card" aesthetic.

Default radius should be restrained:

- 0px for editorial blocks where appropriate
- 4px
- 6px
- 8px
- 10px maximum for major surfaces

Use rounded corners selectively.

Do NOT make:

- every card 16px/20px rounded
- every button a pill
- every panel floating
- every section a container inside another container

Editorial design uses edges and alignment as much as boxes.

---

# 11. BORDERS AND DIVIDERS

Use borders sparingly.

Preferred:

- hairline rules
- subtle separators
- background contrast
- whitespace
- shadows used only when elevation is needed

Avoid:

- heavy 1px borders around everything
- visible grid boxes everywhere
- outlined cards everywhere
- multiple nested borders

A section can be separated by a single horizontal rule and typography.

---

# 12. SHADOWS

Shadows must be almost invisible.

Use soft, low-opacity elevation.

Never use:

- huge black shadows
- neon shadows
- default Tailwind shadow-xl everywhere
- floating card effects on every component

A premium interface should not look like cards are hovering above the page.

---

# 13. THE "MAGAZINE" PRINCIPLE

Every major section should resemble a designed editorial spread.

A section should contain some combination of:

- eyebrow
- large title
- short editorial paragraph
- visual artifact
- statistic
- caption
- metadata
- rule
- CTA

Example:

01 / POLICY

Translate intent into deterministic rules.

MERIDIAN turns a human-readable financial strategy into a structured,
guarded execution workflow.

[workflow artifact]

TESTNET ONLY
0.1 TOKEN CAP
RISK ASSESSMENT

This feels like a magazine spread.

---

# 14. LANDING PAGE — REQUIRED EXPERIENCE

The landing page is the judge's first impression.

It must be exceptional.

Do not start with a standard navbar + centered heading + three cards.

Build a cinematic product narrative.

## Section 01 — Editorial Navigation

Very clean.

Left:
MERIDIAN wordmark.

Center/right:
Strategies
Executions
Audit
Marketplace

Right:
Connect / Open App

Navigation should be thin and refined.

Use a translucent or solid background depending on the section.

No oversized navbar.

No giant icon menu.

No excessive navigation pills.

---

# 15. HERO — THE FIRST WOW MOMENT

The hero should feel like a premium product campaign.

Composition:

Left / central:

SMALL EYEBROW
AUTONOMOUS ONCHAIN EXECUTION

Large serif statement:

SET YOUR STRATEGY.
THE AGENT HANDLES
THE LAST MILE.

Supporting line:

MERIDIAN translates human-readable financial policies into guarded,
simulated and observable KeeperHub workflows.

Actions:

[Open MERIDIAN]
[See how it works ↗]

Do not create three or four primary CTA buttons.

One primary.
One secondary.

## Hero visual artifact

Instead of an SVG illustration, create a real UI artifact using HTML/CSS/React.

The artifact can show:

POLICY
→
CHECK BALANCE
→
ASSESS RISK
→
SIMULATE
→
EXECUTE
→
PROOF

Use:

- dark cinematic panel
- subtle copper signal line
- small status indicators
- workflow nodes
- transaction metadata
- restrained glow
- depth
- soft noise/grain if implemented via CSS

The artifact should feel like a physical product visualization.

Do not draw a generic flowchart.

---

# 16. HERO MOTION

Use Framer Motion / Motion for React if already installed or if adding the dependency is justified.

Motion must be restrained.

Recommended:

- hero text reveals upward by 12–20px
- opacity 0 → 1
- 500–800ms
- staggered by 50–100ms
- workflow signal moves slowly through the execution chain
- active node softly illuminates
- numbers count up once when entering viewport
- section visuals reveal with slight depth movement

No:

- bouncing
- spinning cards
- excessive parallax
- chaotic particles
- perpetual pulsing
- flashy crypto animation

The motion should communicate system intelligence.

---

# 17. HERO VISUAL GLOW

The reference has a subtle cinematic glow.

MERIDIAN may use:

- copper ambient bloom
- very dark radial gradients
- soft blurred light
- restrained grain
- subtle luminous edges

Never use:

- rainbow gradients
- electric purple/blue crypto gradients
- glowing everything
- neon borders
- excessive blur

Glow should be something the eye discovers, not something screaming at the viewer.

---

# 18. TRUST / PROOF STRIP

Immediately after the hero, introduce proof.

Use a compact editorial strip.

Example:

KEEPERHUB EXECUTION
REAL TESTNET TRANSACTIONS
SIMULATE → EXECUTE → POLL
HASH-CHAINED AUDIT
RISK ASSESSMENT

Use typography, not giant icons.

If live values exist, show real values.

Never fabricate metrics.

Never show fake transaction hashes.

Never label a transaction "successful" unless the backend confirms it.

---

# 19. "THE GAP" STORY SECTION

Create a strong editorial problem statement.

Dark section.

Large title:

THE LAST MILE
IS WHERE AGENTS
BREAK.

Then three numbered statements:

01 / DECISION
Agents can reason about what should happen.

02 / EXECUTION
Transactions still need safe infrastructure.

03 / PROOF
Without observability, automation becomes a black box.

Pair this with a cinematic execution artifact.

The reference uses a dark editorial feature section with numbered content and a large visual object.

Recreate the STRUCTURAL IDEA, not the exact artwork.

---

# 20. "ONE ENGINE, FOUR STRATEGIES"

Do not use four identical SaaS cards.

Use an editorial grid.

Large heading:

ONE ENGINE.
FOUR STRATEGIES.

Then:

01 DCA
Scheduled accumulation

02 PAYMENTS
Autonomous recurring transfers

03 YIELD
Monitor and harvest

04 REBALANCE
Maintain target allocations

Each strategy should have:

- number
- title
- short description
- relevant metadata
- subtle interaction
- visual execution preview

Selected/hovered strategy should transform the adjacent visual artifact.

---

# 21. STRATEGY BUILDER

The builder is a flagship product surface.

Do not make it a boring vertical form.

Desktop:

LEFT:
strategy configuration

CENTER:
workflow visualization

RIGHT:
execution safeguards / preview

Possible structure:

------------------------------------------------
STRATEGY
Dollar-Cost Averaging

Configuration
Token
Amount
Frequency
Slippage

                 WORKFLOW
          Trigger
             ↓
       Check Balance
             ↓
       Check Price
             ↓
        Risk Check
             ↓
          Execute

                    SAFETY
              TESTNET ONLY
              RISK: LOW
              SIMULATION: READY
------------------------------------------------

Use a strong grid.

The workflow preview must feel alive.

Selected nodes should use copper.

Inactive nodes remain muted.

The active execution path can use a subtle animated line.

---

# 22. STRATEGY BUILDER FORM RULES

Fields:

- labels above inputs
- compact but generous height
- excellent focus states
- keyboard accessible
- no floating labels
- no huge input boxes
- no excessive rounded corners

Inputs should feel like professional financial software.

Focus:

- copper hairline
- subtle copper glow
- no giant blue outline

Validation:

- immediate
- calm
- inline
- precise

Example:

Recipient address
`0x71...a92C` [copy]

Not:

"Recipient Address Input"

---

# 23. DASHBOARD

The dashboard should NOT be a standard analytics dashboard.

It is the control room of MERIDIAN.

Top:

small system status line

MERIDIAN / CONTROL

Large editorial statement:

YOUR STRATEGIES
ARE RUNNING.

Then concise live summary.

Example:

ACTIVE STRATEGIES      04
EXECUTIONS TODAY       12
SUCCESS RATE           99.2%
KEEPERHUB              CONNECTED

These are editorial statistics, not four identical metric cards.

Use large numbers and thin rules.

---

# 24. DASHBOARD EXECUTION TIMELINE

Use a horizontal or vertical editorial timeline.

Example:

14:32:08
DCA / ETH → USDC
SIMULATED
RISK 08
↓
14:32:12
DCA / ETH → USDC
EXECUTED
0x8c...d91
↓
14:32:17
AUDIT
HASH VERIFIED

Status dots should be small.

Do not use huge green "SUCCESS" badges.

Use typography + dot + evidence.

---

# 25. EXECUTION DETAIL

When opened, an execution should feel like an investigation/proof page.

Header:

EXECUTION / 8A7C

DCA — ETH accumulation

SUCCESS

Then:

SIMULATION
PASSED

RISK
08 / LOW

NETWORK
BASE SEPOLIA

EXECUTION ID
`...`

TRANSACTION
`0x...` ↗

Then node timeline:

01 Trigger
02 Balance Check
03 Risk Assessment
04 Simulation
05 Execution
06 Audit Record

Every step must reveal actual data where available.

---

# 26. TRANSACTION PROOF

This is one of MERIDIAN's strongest judge-facing features.

Make transaction proof visually impressive.

A dark evidence panel can contain:

TRANSACTION PROOF

BASE SEPOLIA

FROM
0x....

TO
0x....

VALUE
0.05 USDC

GAS
...

STATUS
CONFIRMED

TX HASH
0x....

[View on explorer ↗]

The hash must be real.

The explorer link must use the actual transaction.

Do not generate fake values.

---

# 27. AUDIT TRAIL

The audit page should feel like a forensic log, not a table.

Use:

AUDIT / INTEGRITY

Hash-chained execution record.

Then:

VALID
CHAIN INTEGRITY

Use mono typography.

Each event:

000184
2026-08-11 14:32:12
EXECUTION_SUBMITTED

strategy=dca_eth
execution=...
prev=...
hash=...

Allow expansion.

Provide:

[VERIFY CHAIN]
[EXPORT LOG]

Verification should visibly change state when the actual `verifyChain()` runs.

---

# 28. MARKETPLACE

Marketplace should feel like a premium strategy library.

Not an ecommerce grid.

Header:

THE STRATEGY LIBRARY

"Proven workflows, packaged for autonomous execution."

Listings can use editorial cards/spreads.

Each listing:

strategy name
creator
execution count
success rate
price
network
risk
verification

Use subtle image/artifact backgrounds only when useful.

Do not fill the page with icons.

---

# 29. NAVIGATION / APP SHELL

The existing instruction says navigation should be a thin sidebar or top bar rather than a giant icon-heavy sidebar.

Keep that philosophy.

Desktop:

thin left rail OR elegant top navigation.

Preferred:

compact left rail with:

MERIDIAN

CONTROL
STRATEGIES
EXECUTIONS
AUDIT
MARKETPLACE

At bottom:

KEEPERHUB
CONNECTED

The rail must not consume excessive width.

Mobile:

use a compact header and menu drawer.

Never break the application on mobile.

---

# 30. MOBILE IS NOT AN AFTERTHOUGHT

The reference has strong mobile editorial compositions.

MERIDIAN must feel intentionally designed at:

- 320px
- 360px
- 390px
- 430px
- tablet
- laptop
- desktop
- large desktop

Do not simply shrink desktop.

Recompose.

Mobile rules:

- preserve hierarchy
- keep large typography but reduce intelligently
- stack grid relationships
- keep artifacts visible
- never clip headlines
- never cause horizontal scrolling
- keep buttons reachable
- keep data readable
- workflow graph can become vertical
- dashboard navigation becomes drawer
- tables become structured rows or horizontal scroll only where unavoidable

Every breakpoint must be tested.

---

# 31. BUTTONS

Buttons must feel designed.

Primary:

- dark charcoal or copper depending on context
- compact
- 6px-ish radius
- strong typography
- subtle hover
- subtle press state

Secondary:

- transparent / quiet surface
- hairline divider if needed

Avoid:

- giant pills
- rainbow buttons
- excessive shadows
- "glass" buttons everywhere

Interaction:

hover:
slight translation 0 to -1px or subtle background shift

active:
translateY(1px)

focus:
accessible copper focus ring

disabled:
clearly muted

---

# 32. BUTTON GLOW

The user specifically wants buttons to glow when clicked.

Implement this intelligently.

On click/press:

- brief copper ambient glow
- tiny scale response
- optional 200–350ms radial bloom
- then settle

Do NOT make buttons permanently neon.

The glow is feedback, not decoration.

---

# 33. ICONOGRAPHY

Do not create decorative SVG artwork.

Use SVG only where an actual icon is necessary.

Icons should be:

- simple
- geometric
- 16–20px
- consistent stroke weight
- visually quiet

Prefer an established icon package already in the project or a lightweight library.

Do not use emojis as UI icons.

Do not use random icon styles from multiple libraries.

---

# 34. ARTIFACTS INSTEAD OF SVG ILLUSTRATIONS

The supplied reference relies heavily on designed product artifacts.

For MERIDIAN, create artifacts using:

- real React components
- CSS
- CSS gradients
- HTML
- real data
- real UI states
- subtle image textures only if genuinely useful

Examples:

- workflow visualization
- execution proof card
- transaction evidence
- policy sheet
- audit log
- strategy blueprint
- risk assessment panel

This is superior to decorative SVG artwork because the visual itself demonstrates the product.

---

# 35. IMAGE USAGE

Do not use stock images of:

- coins
- rockets
- computers
- anonymous business people
- crypto coins
- generic AI brains

If a visual asset is necessary, it should be abstract/editorial and brand-consistent.

Prefer product-generated artifacts over stock photography.

The interface itself should be the visual content.

---

# 36. DATA VISUALIZATION

Charts should be sparse.

No chart junk.

Avoid:

- rainbow lines
- heavy gridlines
- giant legends
- excessive tooltips
- gradients everywhere

Use:

- one primary line
- subtle axis
- meaningful labels
- editorial annotations

A chart should communicate one idea.

---

# 37. REAL DATA ONLY

This rule is absolute.

The visual polish must NEVER become a reason to fabricate information.

Never invent:

- transaction hashes
- execution IDs
- wallet addresses
- success rates
- execution counts
- KeeperHub states
- marketplace listings
- chain confirmations

If data is unavailable:

show an honest state.

Example:

AWAITING FIRST EXECUTION

instead of:

98 successful executions

unless 98 is actually available.

---

# 38. LOADING STATES

No generic spinner everywhere.

Use skeleton composition.

Examples:

- text line skeleton
- number skeleton
- timeline skeleton
- artifact skeleton

Motion:

soft opacity shimmer, extremely restrained.

Never show a page-level loading wall unless technically unavoidable.

---

# 39. EMPTY STATES

Empty states should feel intentional.

Bad:

"No data."

Better:

NO EXECUTIONS YET

Your first strategy execution will appear here with its simulation,
risk assessment, transaction proof and audit record.

[Create strategy]

---

# 40. ERROR STATES

Errors must feel professional.

Never dump raw stack traces into the UI.

Show:

WHAT HAPPENED
WHY IT HAPPENED
WHAT MERIDIAN DID
WHAT YOU CAN DO NEXT

Example:

EXECUTION BLOCKED

Simulation detected that this transaction would revert.

No transaction was broadcast.

[Review strategy]

This is especially important for a financial execution product.

---

# 41. MOTION SYSTEM

Motion should communicate:

- arrival
- hierarchy
- state
- execution
- confirmation

Use:

- opacity
- translateY
- scale 0.98 → 1
- subtle line drawing
- status transitions
- number transitions
- workflow path animation

Recommended timing:

micro: 120–180ms
standard: 200–350ms
editorial reveal: 500–900ms
hero cinematic: 700–1200ms

Use spring physics selectively.

Avoid animation fatigue.

Respect `prefers-reduced-motion`.

---

# 42. WORKFLOW ANIMATION

This is a signature interaction.

When a strategy is running:

Trigger
↓
Balance
↓
Risk
↓
Simulation
↓
Execute
↓
Proof

The active stage should:

1. brighten
2. receive a small copper halo
3. animate a signal toward the next node
4. transition to confirmed state

The sequence should feel like a real autonomous system operating.

Do not make it look like a PowerPoint flowchart.

---

# 43. SCROLL STORYTELLING

On the landing page, use scroll progression deliberately.

Suggested:

Hero
↓
The gap
↓
One engine / four strategies
↓
How execution works
↓
Proof
↓
Marketplace
↓
Final CTA

Use intersection observers / Motion for scroll-triggered reveals.

Do not make every element animate.

The user should notice the storytelling, not the animation library.

---

# 44. RESPONSIVE EDITORIAL RULE

Every desktop composition must have a mobile equivalent.

For example:

Desktop:

[large title] [large workflow artifact]

Mobile:

large title

workflow artifact

Then:

proof

Do not squeeze two columns into a tiny viewport.

Do not allow text to wrap into absurd shapes.

Never let:

"Autonomous"
"financial"
"execution"

become an accidental four-line mess.

Control line breaks intentionally.

---

# 45. ACCESSIBILITY

Premium means accessible.

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- reduced motion
- aria labels for icon-only controls
- buttons must be buttons
- links must be links
- form errors must be associated with fields
- no text embedded into images

---

# 46. PERFORMANCE

Do not create premium UI at the cost of terrible performance.

Avoid:

- huge image files
- unnecessary canvas
- excessive blur filters
- dozens of simultaneous animations
- unnecessary client components
- giant dependency additions

Prefer:

- CSS
- lightweight React
- Motion only where useful
- optimized fonts
- lazy-loaded heavy visuals
- server components where appropriate

---

# 47. COMPONENT ARCHITECTURE

Build reusable primitives.

Suggested:

`EditorialSection`
`Eyebrow`
`DisplayHeading`
`Metric`
`Rule`
`StatusDot`
`PrimaryButton`
`SecondaryButton`
`WorkflowArtifact`
`WorkflowNode`
`ExecutionTimeline`
`ProofPanel`
`AuditEntry`
`StrategyCard`
`SectionLabel`
`DataValue`
`CopyButton`

Do not duplicate styles across 30 components.

Create a coherent design system.

---

# 48. CSS ARCHITECTURE

The existing project specifies CSS Modules and no Tailwind.

Respect that.

Do not introduce Tailwind.

Do not introduce utility-class soup.

Use:

- CSS Modules
- CSS custom properties
- semantic class names
- layout tokens
- typography tokens
- motion tokens

Keep globals.css responsible for:

- reset
- fonts
- variables
- base typography
- selection
- focus
- body
- shared utility primitives only where genuinely global

Component-specific styling belongs in component CSS Modules.

---

# 49. DESIGN TOKENS TO ADD

Add tokens for:

```css
--surface-hero-dark: #0B0B0A;
--surface-dark: #111110;
--surface-dark-soft: #171614;

--text-on-dark: #F5F3EF;
--text-on-dark-muted: #AAA7A0;

--accent-glow: rgba(181, 114, 46, 0.20);
--accent-glow-strong: rgba(181, 114, 46, 0.32);

--hairline: rgba(26, 26, 25, 0.10);
--hairline-dark: rgba(255, 255, 255, 0.12);

--ease-editorial: cubic-bezier(0.22, 1, 0.36, 1);
```

Do not add dozens of unnecessary variables.

---

# 50. LANDING PAGE VISUAL LANGUAGE

The landing page should look like a premium campaign site.

Important:

The app is still a working application.

Therefore, marketing/editorial sections should transition naturally into actual product UI.

Do not create a beautiful fake landing page and then abruptly switch to an ugly dashboard.

The dashboard must belong to the same design system.

---

# 51. DASHBOARD VISUAL LANGUAGE

The dashboard should feel like the "inside" of the same magazine.

Think:

editorial control room.

Not:

admin portal.

Use:

- larger typography
- thin separators
- structured data
- occasional dark evidence surfaces
- intentional composition
- restrained density

The user should feel that the application is a designed instrument.

---

# 52. "HIGH-BUDGET" CHECKLIST

Before considering the UI finished, inspect every page and ask:

### Typography
- Is the font hierarchy unmistakable?
- Do headings feel editorial?
- Are numbers beautiful?
- Are mono values aligned?

### Composition
- Does every page have a focal point?
- Are sections visually varied?
- Is there a clear rhythm?
- Does the page feel designed rather than assembled?

### Spacing
- Is spacing consistent?
- Are there accidental gaps?
- Are important elements too cramped?
- Are sections too empty?

### Controls
- Are buttons refined?
- Are focus states premium?
- Do interactions have feedback?
- Are controls consistent?

### Surfaces
- Are there too many cards?
- Are there too many borders?
- Are corners over-rounded?
- Are shadows too obvious?

### Motion
- Does motion communicate state?
- Is it restrained?
- Is reduced-motion respected?
- Does the workflow feel alive?

### Mobile
- Is every screen intentionally composed?
- Any overflow?
- Any clipping?
- Any broken line wrapping?
- Any tiny text?
- Any unusable controls?

---

# 53. ANTI-PATTERNS — NEVER DO THESE

NEVER:

1. install Tailwind to make the UI faster
2. replace the design with shadcn defaults
3. use a generic dashboard template
4. put every feature in a card
5. use 20px+ rounded cards everywhere
6. use rainbow gradients
7. use neon crypto colors
8. use giant icons
9. use emoji icons
10. use stock crypto imagery
11. generate fake data for visual polish
12. create fake transaction hashes
13. claim a transaction is confirmed without backend proof
14. remove existing functionality because visual work is easier
15. replace working KeeperHub logic with mocks
16. build only a hero and call the project finished
17. leave the dashboard ordinary
18. make mobile a scaled-down desktop
19. hide broken elements with overflow
20. use arbitrary spacing patches
21. create giant empty sections with no story
22. overuse glassmorphism
23. overuse blur
24. overuse animation
25. create decorative SVG art instead of product artifacts
26. make every button a pill
27. make every section centered
28. use excessive bold text
29. use excessive uppercase text
30. use fake "98%" / "99%" / "10K users" metrics
31. ship without inspecting the actual rendered UI
32. stop after the first acceptable-looking implementation

---

# 54. REQUIRED CODING PROCESS

Codex must work in phases.

## PHASE A — AUDIT BEFORE EDITING

First inspect the repository.

Read:

- package.json
- current app routes
- globals.css
- layout
- existing components
- existing CSS Modules
- current API routes
- KeeperHub integration
- strategy data model
- execution pipeline

Determine what is already functional.

Do NOT destroy functioning backend logic.

Then identify the UI currently responsible for:

- landing
- dashboard
- strategies
- strategy builder
- executions
- audit
- marketplace
- navigation
- shared components

---

## PHASE B — DESIGN SYSTEM

Before rebuilding individual pages:

1. establish typography
2. establish color tokens
3. establish spacing
4. establish surfaces
5. establish button system
6. establish form system
7. establish status system
8. establish editorial section system
9. establish motion system
10. establish responsive grid

Only then build pages.

This prevents every page from becoming visually inconsistent.

---

## PHASE C — LANDING PAGE

Build the landing page to flagship quality.

Do not move on until:

- hero is exceptional
- visual artifact is convincing
- typography is excellent
- section rhythm is strong
- dark/light transitions feel intentional
- mobile composition is correct
- motion is polished

---

## PHASE D — APPLICATION SHELL

Build:

- navigation
- app header
- responsive menu
- page frame
- route transitions if appropriate
- global interaction states

The shell must feel like the same product as the landing page.

---

## PHASE E — DASHBOARD

Build the dashboard around:

- strategy overview
- execution timeline
- live KeeperHub state
- system health
- proof/evidence
- strategy entry points

Do not build four generic metric cards.

---

## PHASE F — STRATEGY BUILDER

Build the editorial strategy builder.

The workflow artifact is mandatory.

The preview must be connected to actual strategy configuration.

---

## PHASE G — EXECUTION / AUDIT / MARKETPLACE

Upgrade every product surface to the same quality bar.

Do not spend 90% of effort on the landing page and leave internal screens ordinary.

---

## PHASE H — RESPONSIVE PASS

Test:

- 320
- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1920

Fix every layout problem.

---

## PHASE I — INTERACTION PASS

Test:

- hover
- focus
- active
- disabled
- loading
- success
- error
- empty
- connected
- disconnected
- execution pending
- execution completed
- execution failed

Every state needs designed feedback.

---

# 55. VISUAL QA — MANDATORY

Do NOT assume the implementation looks good because the code is clean.

Render the application.

Inspect every important route.

If browser tooling or screenshots are available in the environment, use them.

Review at desktop and mobile dimensions.

Ask:

> Would this screenshot win a design competition?

If the answer is "probably not", keep iterating.

Do not rationalize mediocre output.

---

# 56. JUDGE-FIRST IMPRESSION TEST

Open the landing page as if you are a hackathon judge who knows nothing about MERIDIAN.

Within 3 seconds you should understand:

1. this is premium
2. this is an autonomous execution product
3. this is Web3/onchain
4. this is safety-conscious
5. this is not a generic dashboard

Within 10 seconds:

6. you understand the value proposition
7. you see evidence of execution
8. you want to click into the product

Within 30 seconds:

9. you understand strategy → workflow → execution → proof
10. you can see why MERIDIAN is technically serious

---

# 57. PRODUCT STORY

Use these ideas as editorial copy where appropriate.

Primary:

**SET YOUR STRATEGY.
THE AGENT HANDLES THE LAST MILE.**

Supporting:

**Human-readable financial policies become guarded, scheduled
onchain operations — simulated, risk-checked, executed and proven.**

Secondary:

**FROM INTENT TO PROOF.**

**POLICY → WORKFLOW → RISK → EXECUTION → AUDIT**

**AUTONOMOUS DOESN'T MEAN UNCONTROLLED.**

**EVERY EXECUTION LEAVES EVIDENCE.**

**THE EXECUTION LAYER FOR AGENTIC FINANCE.**

Do not overfill the page with slogans.

Use copy sparingly.

---

# 58. KEEP THE TECHNICAL TRUTH VISIBLE

The premium design must not hide the actual engineering.

Surface the real system:

- KeeperHub
- simulation
- risk assessment
- workflow nodes
- transaction hashes
- chain
- execution ID
- audit chain
- marketplace
- MCP
- real testnet execution

This is important for hackathon judges.

The visual design should make technical capability easier to understand.

---

# 59. MERIDIAN + KEEPERHUB VISUAL RELATIONSHIP

MERIDIAN is the intelligent strategy layer.

KeeperHub is the execution infrastructure.

The UI should communicate:

MERIDIAN
"what should happen and under what rules"

KEEPERHUB
"how it safely happens onchain"

ONCHAIN
"what actually happened"

AUDIT
"the evidence"

This is a powerful narrative.

---

# 60. DO NOT BREAK THE EXISTING FUNCTIONAL CONTRACT

The source project instruction establishes critical technical requirements:

- KeeperHub is the onchain execution layer
- real transactions are required
- no direct RPC signing
- simulate → execute → poll
- workflows require nodes and edges
- audit chain is hash-linked
- policy engine is deterministic
- testnet allowlist must remain
- marketplace sequence must remain correct

UI work must not violate any of these.

If a UI component needs data, connect it to the real existing data layer.

Do not make a fake UI API just because it is visually easier.

---

# 61. IMPORTANT: NO "DESIGN ONLY" SHORTCUT

Do not build screenshots disguised as UI.

Everything interactive must be functional where functionality already exists.

Examples:

"Create Strategy" → actual strategy creation flow

"Execute" → actual execution route

"View Transaction" → actual transaction link

"Verify Chain" → actual `verifyChain()`

"Publish" → actual marketplace flow

"Connect" → actual application connection behavior

"Pause" → actual strategy state if supported

A premium UI with broken buttons is worse than an ordinary functional UI.

---

# 62. IMPORTANT: NO "MOCK FIRST, CONNECT LATER"

Do not replace real application data with fake static values.

If the application has no data yet, build excellent empty/loading states.

If an endpoint is temporarily unavailable, show the real connection state.

Do not make the judge believe that mocked activity is real.

---

# 63. PREMIUM VISUAL DETAIL

Small details matter.

Implement where appropriate:

- optical alignment
- baseline alignment
- tabular numbers
- subtle text tracking
- careful line lengths
- hairline dividers
- consistent icon sizes
- consistent status dot sizes
- carefully controlled shadows
- precise button heights
- intelligent truncation
- copy feedback
- explorer link affordance
- hover transitions
- active navigation marker
- scroll reveal
- subtle background grain if performance permits

These details separate premium from generic.

---

# 64. EDITORIAL CAPTIONS

Use small captions under visual artifacts.

Example:

FIG. 01
EXECUTION PATH

Simulation precedes every write operation.

Or:

FIG. 02
AUDIT PROOF

Every execution is recorded in a hash-linked chain.

This is a subtle but powerful magazine technique.

---

# 65. NUMBERS AS DESIGN

Important system numbers should become visual anchors.

Example:

04
STRATEGY TYPES

10+
KEEPERHUB SURFACES

REAL
TESTNET EXECUTION

SHA-256
AUDIT CHAIN

Only use values supported by the actual project.

Numbers should be large, clean and editorial.

---

# 66. DARK FEATURE PANELS

Dark feature panels should feel almost like printed black editorial pages.

Use:

- near-black background
- warm white type
- muted gray secondary text
- copper micro-accent
- soft ambient glow
- subtle grain
- large typography
- carefully composed product artifact

Do not use pure black everywhere.

Do not use bright neon text.

---

# 67. LIGHT EDITORIAL PANELS

Light sections should feel like high-quality paper.

Use:

- warm off-white
- subtle gray
- charcoal type
- restrained copper

Avoid sterile pure-white SaaS pages.

---

# 68. NO VISUAL NOISE

If an element does not improve:

- hierarchy
- comprehension
- interaction
- proof
- storytelling
- navigation

remove it.

Premium design is not about adding more.

It is about making every element intentional.

---

# 69. "EXTRA FEATURE" RULE

Any extra feature or visual enhancement must be an UPGRADE.

An enhancement must:

- preserve existing functionality
- improve comprehension
- improve interaction
- improve visual quality
- remain consistent with the system
- not create visual clutter

If an extra feature makes the page busier, cheaper or less focused, do not add it.

**An extra feature must never become a downgrade.**

---

# 70. FINAL ACCEPTANCE CRITERIA

The UI is NOT complete until all are true:

[ ] No Tailwind
[ ] No generic SaaS appearance
[ ] No generic dashboard cards everywhere
[ ] No visual clipping
[ ] No accidental horizontal overflow
[ ] No broken mobile layout
[ ] Typography feels premium
[ ] Serif display hierarchy is strong
[ ] Technical mono data is consistent
[ ] Light/dark editorial chapters feel intentional
[ ] Hero creates immediate visual impact
[ ] Workflow artifact is excellent
[ ] Dashboard feels like the same brand
[ ] Strategy builder feels like a flagship tool
[ ] Execution proof is visually compelling
[ ] Audit trail feels authoritative
[ ] Marketplace feels premium
[ ] Buttons have polished states
[ ] Click feedback includes restrained glow
[ ] Motion is subtle and purposeful
[ ] Reduced motion works
[ ] Empty/loading/error states are designed
[ ] Real data is used
[ ] No fake transactions or fake proof
[ ] Existing KeeperHub functionality remains intact
[ ] All major routes were visually inspected
[ ] Desktop was inspected
[ ] Mobile was inspected
[ ] No page looks unfinished
[ ] No page looks like a template

---

# 71. FINAL DIRECTIVE TO CODEX

You are not being asked to "make the dashboard prettier."

You are being asked to **art-direct and implement the complete MERIDIAN product experience at flagship level.**

Treat the UI as if it will be photographed for the front page of a premium technology publication.

Be exact.

Be restrained.

Be architectural.

Be editorial.

Be technically honest.

Do not simplify the brief.

Do not substitute generic components.

Do not stop at "good enough."

Do not hallucinate data.

Do not create fake transactions.

Do not break KeeperHub.

Do not replace the real product with a visual mock.

Do not make everything a card.

Do not make everything rounded.

Do not make everything dark.

Do not make everything glow.

Do not make everything animated.

Instead, build a coherent visual system in which typography, spacing, contrast, artifacts, motion and real product data work together.

The final result should feel like:

**a premium editorial technology product that happens to be an autonomous onchain execution engine.**

The judge should experience:

**"This looks expensive."**

Then:

**"This is clearly engineered."**

Then:

**"I understand what it does."**

Then:

**"Show me the execution."**

That is the target.

---

# 72. IMPLEMENTATION ORDER — SHORT VERSION

If you need a concise execution sequence, follow this exact order:

1. Audit existing repository.
2. Preserve all working backend/KeeperHub logic.
3. Establish typography and design tokens.
4. Establish editorial grid.
5. Establish shared primitives.
6. Build premium landing hero.
7. Build workflow visual artifact.
8. Build dark/light editorial sections.
9. Build application shell.
10. Build dashboard.
11. Build strategy builder.
12. Build execution monitor.
13. Build transaction proof.
14. Build audit viewer.
15. Build marketplace.
16. Add motion.
17. Add responsive compositions.
18. Test all states.
19. Render every important route.
20. Iterate until the visual quality is unquestionably premium.

**Do not declare success before visual QA.**

---

# 73. LAST WORD

MERIDIAN should not look like something generated from a component library.

It should look authored.

Every page should have a point of view.

Every section should have hierarchy.

Every interaction should have intent.

Every technical capability should have a visual representation.

Every real execution should leave evidence.

The interface is part of the product.

**Build the interface like the product deserves to win.**
