# Harmeet Portfolio Redesign Plan

## Status

This is the source-of-truth plan for redesigning the portfolio over several days.
The portfolio should be implemented module by module, with each module working and verified before moving to the next one.

## Plan review: quality and performance verdict

This plan is strong enough to produce a distinctive and high-quality portfolio, provided it is implemented as a visual system and not as a collection of unrelated effects.

### What will make it good-looking

- A clear visual identity instead of a generic space/galaxy theme
- Strong hierarchy: one dominant idea per viewport
- Editorial project storytelling rather than equal-looking project cards
- A consistent Mission Control language across navigation, work, experience, skills, and contact
- Purposeful motion that explains relationships or reinforces the story
- A design that still looks complete when animations are disabled

### What will make it extraordinary

- The Reliability Core becomes a recognizable signature visual
- The portfolio tells a coherent story about building dependable systems
- Projects are presented as shipped products with context and engineering decisions
- Skills are connected to real work instead of displayed as decorative tags
- The design is inspired by the reference portfolio's confidence and narrative quality, but is not a copy

### What can and cannot be guaranteed

The implementation can be designed to be fast and graceful across normal devices, but no website can honestly promise zero lag on every browser, device, or network. The plan therefore uses measurable performance budgets and fallbacks instead of assuming every visitor has a powerful GPU.

The rule is simple: if an effect fails its performance budget, it gets simplified or replaced with CSS/SVG. The content and visual hierarchy must never depend on the heaviest effect.

## Core direction

### Theme: Mission Control for Reliable Software

The portfolio should feel like an interactive engineering control room for a developer who builds, automates, tests, and ships dependable software.

The central message is already strong:

> I build software that keeps working after I log off.

The experience should communicate this progression:

1. **Signal** — who Harmeet is and what he builds
2. **Systems** — projects and products shipped
3. **Telemetry** — experience and impact
4. **Toolkit** — skills and technologies
5. **Human layer** — background, education, and recognition
6. **Launch** — contact and collaboration

## Visual identity

- Graphite-black foundation rather than pure black
- Warm off-white content surfaces for important information
- Electric cyan and safety orange accents
- Large editorial display typography paired with technical monospace labels
- Orbital diagrams, telemetry lines, status indicators, modular panels
- One memorable 3D reliability core in the hero
- Minimal, intentional glass effects rather than glassmorphism everywhere
- Premium, precise, futuristic, and engineered rather than generic gamer-style space visuals

## Important technical direction

The current project already includes React, TanStack Start, Three.js/R3F, Drei, Framer Motion, Lenis, custom cursor effects, and reduced-motion support.

Do not add more visual effects blindly. The current `Universe.tsx` and `Galaxy.tsx` contain overlapping particle-universe implementations. For performance and maintainability, consolidate them into one optimized scene or replace both with a focused `SceneCanvas` implementation.

Use:

- One optimized 3D hero scene
- CSS, SVG, and Framer Motion for most section animations
- Small, purposeful 3D moments only where they add meaning
- WebGL fallback for unsupported devices
- Automatic quality reduction on mobile and low-powered devices
- Existing reduced-motion support, plus `prefers-reduced-motion`
- No autoplay sound

Avoid:

- A full-page particle canvas running continuously
- Animating every element simultaneously
- Heavy blur and backdrop-filter layers everywhere
- Scroll-jacking
- Making 3D necessary to understand the content
- Copying the reference site's exact layout, wording, or visual identity

## Non-negotiable quality gates

Every module should pass these gates before the next module begins:

### Visual quality gates

- The primary message is understandable within five seconds
- The page has one dominant visual focus per viewport
- No animation competes with the headline or project content
- Every animated element has a purpose: orientation, feedback, hierarchy, or storytelling
- The design still feels intentional with reduced motion enabled
- All accent colors, typography, spacing, and borders use the shared design tokens
- No section looks like an unrelated template or a copied reference site
- Desktop and mobile are designed as first-class experiences

### Performance gates

- One active 3D canvas maximum
- 3D rendering pauses when the scene is outside the viewport
- Device pixel ratio is capped at 1.5 on desktop and 1 on mobile
- The hero scene uses a measured object/particle budget rather than unlimited generation
- No continuous React state updates for pointer movement or animation frames
- Pointer and scroll work is throttled or handled through requestAnimationFrame
- Prefer `transform`, `opacity`, and CSS variables over layout-triggering properties
- A static CSS/SVG fallback is always available
- Reduced-motion mode disables non-essential animation and 3D interaction
- The first contentful experience does not wait for the 3D scene

### Verification gates

For each module, record:

- Files changed
- `npm run lint` result
- `npm run test` result when relevant
- `npm run build` result at the end of a stable milestone
- Manual desktop/mobile check
- Any known limitation or follow-up

## Performance targets

These are targets, not promises for every device:

- Hero animation should feel close to 60 FPS on a typical modern laptop
- Mobile should remain smooth at approximately 45–60 FPS, or use the simplified fallback
- Largest Contentful Paint target: under 2.5 seconds on a normal production connection
- Cumulative Layout Shift target: under 0.1
- Total Blocking Time target: under 200 ms in a production build where practical
- No visible layout shift while fonts, portrait assets, or the 3D fallback load

## Module plan

### Module 0 — Audit, backup, and visual reset

**Goal:** Prepare the codebase without creating a tangled rewrite.

**Work:**

- Preserve existing data in `src/content.ts`
- Create a visual redesign checkpoint or branch
- Audit `src/routes/index.tsx`, `Universe.tsx`, `Galaxy.tsx`, `HeroUI.tsx`, `Polish.tsx`, and `styles.css`
- Decide which existing components are reusable
- Consolidate duplicate 3D logic
- Establish design tokens for colors, spacing, radii, shadows, animation durations, and z-index layers
- Capture a current screenshot for comparison

**Acceptance criteria:** The current site still runs normally and the redesign has a clear component map.

### Module 1 — Visual shell and navigation

**Goal:** Replace the generic dark-glass shell with the Mission Control identity.

**Design:**

- Compact system-style brand label such as `HARMEET / SYSTEM ONLINE`
- Navigation groups: Signal, Systems, Telemetry, Toolkit, About, Launch
- Status indicator and résumé action
- Full-screen mobile command panel
- Active section indicator

**Animations:**

- Transparent navigation becomes solid on scroll
- A subtle telemetry line moves across the navigation
- Mobile menu opens with a clean vertical wipe
- Use opacity and transforms instead of layout animation

**Likely files:** `src/routes/index.tsx`, `src/styles.css`, and possibly `src/components/Navigation.tsx`.

**Acceptance criteria:** All navigation anchors work on desktop and mobile.

### Module 2 — Hero: Reliability Core

**Goal:** Create an extraordinary first impression.

**Composition:**

- Left side: status label, headline, subline, primary CTA, résumé CTA
- Right side: floating 3D wireframe reliability core or layered data engine
- Orbiting nodes represent AI, cloud, full-stack, and testing
- Thin connections and restrained data pulses

**Interaction:**

- Gentle mouse camera parallax
- Hovering a node reveals a label
- Clicking a node can highlight related skills or projects
- Scroll moves the camera slightly deeper into the scene
- The scene should not spin aggressively or constantly distract from the message

**Performance rules:**

- Use instanced geometry where possible
- Limit device pixel ratio to approximately 1–1.5
- Pause rendering when the hero is not visible
- Use a static SVG/CSS fallback when WebGL is unavailable
- Reduce object count on mobile
- Avoid expensive post-processing until there is a measured need

**Acceptance criteria:** The hero is memorable, responsive, accessible, and usable without WebGL.

### Module 3 — Work: Systems shipped

**Goal:** Present projects as products and engineering stories rather than equal-sized cards.

**Layout:**

- One large featured project, likely Resonance
- Two supporting projects
- Remaining projects in a compact archive or expandable list

**Featured project content:**

- Product statement
- Role and category
- Technology stack
- Key engineering decisions
- Architecture summary
- Live and code links
- Animated visual preview

**Project interactions:**

- Category-specific accent color
- Subtle image or abstract-scene movement
- Telemetry line sweeps across the card
- Tags enter with a small stagger
- Cursor label changes to `Inspect`
- Optional project detail route or modal

**Data evolution:** Extend the `Project` type with optional fields such as:

```ts
{
  featured?: boolean;
  role?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  highlights?: string[];
  visual?: string;
}
```

Existing projects without extended details should continue to render in compact form.

**Acceptance criteria:** A visitor understands the strongest work without reading every project card.

### Module 4 — Experience: Telemetry timeline

**Goal:** Show increasing responsibility and engineering maturity.

**Design:**

- Vertical telemetry spine
- Date and location labels
- Company and role
- Short impact summary
- Three concise bullets per role
- Optional tools row
- Expandable details for deeper reading

**Animations:**

- Timeline line draws as it enters the viewport
- Role nodes power on sequentially
- Bullets appear after the corresponding role
- Hovering a role highlights related skills

**Content treatment:** Keep the technical substance from `src/content.ts`, but convert dense paragraphs into concise summaries plus impact-focused bullets.

**Acceptance criteria:** Experience is scannable in under 30 seconds but still rewarding to explore.

### Module 5 — Toolkit: Interactive skills system

**Goal:** Replace static skill chips with a meaningful interactive map.

**Categories:**

- AI & Automation
- Full-stack
- Cloud & Testing
- Web3
- Data & Analytics
- Hardware & Mobile

**Interaction:**

- Select a category from a central system diagram
- Expand the category into a structured tool grid
- Highlight related projects and experience entries
- Show a short description beside the active category
- Use SVG connection lines and Framer Motion rather than a second heavy WebGL scene

**Optional 3D:** A small low-poly toolkit prism may be added as decoration, but it must not be required for comprehension.

**Acceptance criteria:** Skills communicate breadth, relationships, and practical usage rather than appearing as a random list.

### Module 6 — About: Human layer

**Goal:** Make the portfolio personal and memorable.

**Content themes already available:**

- Jamshedpur background
- Hardware and Arduino beginnings
- Transition into frontend, cloud, and AI
- Aerospace and space exploration interest
- Education
- Hackathon recognition

**Design:**

- Editorial biography on the left
- Portrait in an identity module on the right
- Small markers for origin, education, recognition, and current focus
- Visual progression from hardware to reliable AI/cloud systems

**Animations:**

- Gentle portrait depth/parallax
- Recognition items appear as achievement signals
- Progression line draws as the section is revealed
- No constant image distortion or excessive zoom

**Acceptance criteria:** The visitor remembers Harmeet as a person, not only as a list of technologies.

### Module 7 — Contact: Launch sequence

**Goal:** End with a confident, direct CTA.

**Possible headline:**

> Have a system worth building?

**Actions:**

- Email me
- Copy email
- GitHub
- LinkedIn
- Résumé

**Animations:**

- Small launch-sequence progress indicator
- Email CTA becomes a bright transmission control on hover
- Copy action confirms with a clean system message
- Footer retains location, availability, current year, and reduce-motion control

**Acceptance criteria:** Contacting Harmeet is obvious and frictionless.

### Module 8 — Performance, accessibility, and mobile refinement

**Performance:**

- Consolidate duplicate 3D implementations
- Lazy-load the hero scene
- Pause Three.js outside the viewport
- Reduce object and particle counts on mobile
- Animate only `transform`, `opacity`, and selected CSS variables
- Avoid unnecessary React state updates in pointer and scroll handlers
- Compress portrait and project assets
- Preload only critical assets

**Accessibility:**

- Preserve keyboard navigation and visible focus states
- Keep the skip link
- Label all interactive 3D elements
- Make 3D decorative rather than essential
- Honor OS reduced-motion preference
- Preserve the manual reduce-motion toggle
- Check color contrast for cyan and orange accents
- Test mobile navigation and dialogs with keyboard

**Mobile:**

- Replace complex 3D with a simplified static object when needed
- Remove the custom cursor
- Reduce parallax
- Use stacked editorial project cards
- Keep text readable and avoid large scroll-jacking effects

**Acceptance criteria:** The portfolio remains fast, accessible, and understandable without WebGL.

### Module 9 — Final polish and launch QA

Run:

```bash
npm run lint
npm run test
npm run build
```

Manually test:

- Desktop browser
- Mobile viewport
- Slow CPU simulation
- WebGL disabled
- Reduced-motion enabled
- Keyboard-only navigation
- Direct section links
- Résumé link
- GitHub and LinkedIn links
- Copy email action
- Live project links

## Suggested schedule

### Day 1

Module 0: audit, design tokens, and visual direction.

### Day 2

Module 1: navigation and layout shell.

### Day 3

Module 2: hero and reliability-core 3D scene.

### Day 4

Module 3: featured work and project archive.

### Day 5

Module 4: telemetry experience timeline.

### Day 6

Module 5: interactive toolkit.

### Day 7

Modules 6 and 7: About and Contact.

### Day 8

Module 8: performance, accessibility, and responsive behavior.

### Day 9

Module 9: QA, build, mobile testing, and final polish.

## Implementation order

1. Visual system
2. Page composition
3. Hero 3D scene
4. Work storytelling
5. Experience and skills interactions
6. Microinteractions
7. Performance optimization
8. Final polish

Do not start by adding more animations. The structure and visual identity should be strong first; animation should amplify the story rather than hide a weak layout.

## Definition of done

The finished portfolio should feel like:

> A cinematic engineering dashboard that tells the story of how Harmeet turns ideas into reliable, shipped software.

It should match the confidence and narrative quality of the reference portfolio while remaining visually distinct and unmistakably personal to Harmeet.
