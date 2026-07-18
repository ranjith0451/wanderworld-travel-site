# WanderWorld 3D — Premium Elevation Plan

**Author:** Mavis (Product/Eng/QA/DevOps review)
**Date:** 2026-07-17
**Status:** Ready for execution
**Goal:** Take WanderWorld from "functional dark SPA" to "Apple-tier premium travel brand" using motion, glass morphism, and scroll choreography — **without breaking the static, deploy-ready foundation**.

---

## 1. Executive Summary (PM Lens)

The current site is technically sound (24 countries, 3D globe, PWA, deploy-ready) but feels like a **prototype**, not a **product**. The gap to "premium" is not feature count — it's **craft**:

| Pillar | Today | Target |
|---|---|---|
| **First impression** | 0.6s blank flash, plain hero | Branded preloader + 1.5s choreographed reveal |
| **Material** | 1-layer `backdrop-filter: blur(10px)` | Multi-layer glass with noise, edge-light, depth, refraction |
| **Motion** | `opacity 0→1` on viewport | Scroll-driven parallax, scrub, magnetic, cursor, ambient |
| **Typography** | Inter + Playfair (good, not great) | Editorial type system: display/serif/UI/caption with weight ramp |
| **Storytelling** | 9 stacked sections | 6 narrative chapters with scroll-linked transitions |
| **Trust** | 24 countries as dots | Cinematic destination cards with backdrop, mood, meta |
| **Performance** | Lighthouse ~75 | Lighthouse 95+ (FCP <1s, LCP <2s, CLS <0.05) |
| **DevOps** | Manual Vercel deploy | CI on push, Lighthouse budget gate, preview deploys |

**Apple's principle applied:** *Design is not just what it looks like. Design is how it works.* — Every micro-interaction should feel inevitable, not added.

---

## 2. Architecture Decisions (Dev Lens)

**Keep:** vanilla JS, Three.js, PWA, static deploy (Vercel/Netlify/Docker). No build step.

**Add (CDN, no build):**
- **GSAP 3.12 + ScrollTrigger 3.12** — motion choreography
- **Lenis 1.1** — buttery smooth scroll (the secret to Apple's feel)
- *(fonts)*: keep Inter + Playfair Display, add `Instrument Serif` for editorial display

**File layout (additive, no breaking changes):**
```
/
├── index.html              (extended with new sections)
├── app.js                  (kept as core init; new motion via app-motion.js)
├── app-motion.js           (NEW: motion system, preloader, magnetic, cursor)
├── app-globe.js            (NEW: upgraded globe extracted from app.js)
├── styles.css              (kept as base; new premium layer below)
├── styles-premium.css      (NEW: design tokens, glass v2, motion, premium sections)
├── data/countries.js       (extended to 60+ countries w/ new fields)
├── data/trending-2025.json (NEW: trending destinations dataset)
└── assets/
    ├── icons/              (kept)
    ├── noise.svg           (NEW: tiled noise for glass grain)
    ├── backdrops/          (NEW: 12 destination hero backdrops, gradient)
    └── movies/             (NEW: set-jetting poster placeholders)
```

**No-build constraint:** All modules loaded via `<script type="module">` (browsers handle it natively, Vercel/Netlify serve it). GSAP/Lenis via CDN with `defer` + integrity-free.

**Backward compat:** `app.js` keeps working standalone. `app-motion.js` enhances.

---

## 3. Design System (Tokens)

### 3.1 Color (Apple-inspired premium dark)

```
--bg-0:        #050714   (deepest space)
--bg-1:        #0a0e2a   (base canvas)
--bg-2:        #11163d   (raised)
--surface:     #161c4a   (card base)
--surface-hi:  #1d2460   (card hover)
--border:      rgba(255,255,255,0.08)
--border-hi:   rgba(255,255,255,0.18)
--text-0:      #ffffff
--text-1:      #e6e9f5
--text-2:      #9aa3c7   (muted)
--text-3:      #5b6494   (subtle)
--accent:      #7c5cff   (electric violet, primary)
--accent-2:    #00d4ff   (cyan, secondary)
--accent-3:    #ff5da2   (pink, tertiary)
--success:     #34d399
--warning:     #fbbf24
```

### 3.2 Typography

```
--font-ui:      "Inter", system-ui, sans-serif
--font-display: "Playfair Display", Georgia, serif     (editorial headings)
--font-serif:   "Instrument Serif", serif              (NEW: cover lines)

--fs-display:    clamp(48px, 7vw, 88px)   (hero)
--fs-h1:         clamp(36px, 4.4vw, 56px)
--fs-h2:         clamp(28px, 3.2vw, 40px)
--fs-h3:         clamp(20px, 2.2vw, 28px)
--fs-body:       16px
--fs-caption:    13px
--fs-eyebrow:    11px (uppercase, letter-spacing 0.18em)
```

### 3.3 Spacing (4-pt scale)
```
--sp-1: 4px · --sp-2: 8px · --sp-3: 12px · --sp-4: 16px ·
--sp-5: 24px · --sp-6: 32px · --sp-7: 48px · --sp-8: 64px · --sp-9: 96px
```

### 3.4 Motion
```
--ease-out-quint:  cubic-bezier(0.22, 1, 0.36, 1)   (default ease-out)
--ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1) (page transitions)
--ease-emphasis:   cubic-bezier(0.16, 1, 0.3, 1)     (Apple signature)
--dur-instant: 120ms · --dur-fast: 240ms ·
--dur-base: 420ms · --dur-slow: 720ms · --dur-cinematic: 1200ms
```

### 3.5 Glass (v2)
```
--glass-bg:     rgba(255,255,255,0.04)
--glass-bg-hi:  rgba(255,255,255,0.08)
--glass-blur:   blur(28px) saturate(180%)
--glass-border: 1px solid rgba(255,255,255,0.10)
--glass-shadow: 0 30px 60px -20px rgba(0,0,0,0.6),
                inset 0 1px 0 rgba(255,255,255,0.10)
```

---

## 4. Premium Pillars (What makes it Apple-tier)

### 4.1 Preloader & Entry
- Branded loader: `W✦` mark draws with stroke-dashoffset
- Progress bar with shimmer (linear-gradient slide)
- Curtain reveal: hero content fades up with 30px Y, 800ms ease-emphasis
- Stays ≥600ms minimum (avoid jarring flash) but exits on `load`

### 4.2 Smooth Scroll (Lenis)
- Replaces native scroll with RAF-driven interpolation
- ScrollTrigger integrated (`scrollerProxy`)
- Wheel/touch/anchor all routed through Lenis
- Respects `prefers-reduced-motion` (disables itself)

### 4.3 Glass Morphism v2
- Layered: outer container, mid blur, inner highlight
- SVG noise (4% opacity) for film grain — eliminates the "cheap plastic" look
- Edge highlight: `inset 0 1px 0 rgba(255,255,255,0.15)` at top
- Inner shadow at bottom for depth
- Specular highlight on hover (radial gradient that follows cursor)
- Backdrop: not just blur — `backdrop-filter: blur(28px) saturate(180%)`

### 4.4 Motion Choreography
- **Hero parallax**: globe tilts with mouse, title fades opposite, glow follows
- **Scroll-scrubbed reveals**: `y: 80 → 0`, `opacity: 0 → 1`, scale 0.95→1, scrub: false, stagger: 0.08
- **Split text** for hero: each word animates independently
- **Magnetic buttons**: 8px pull toward cursor, snap-back on leave
- **Custom cursor**: 8px dot + 32px ring, magnetic over interactive elements, scales on hover
- **Card 3D tilt**: 12° max, parallax on inner content (image moves 6px, title moves 2px)
- **Number counters**: animate from 0 to value on scroll-into-view

### 4.5 Premium Hero
- Full-viewport (100svh) with backdrop gradient (per-month hue: warm in Jan, cool in Dec)
- 3D globe as centerpiece, mouse-tracked
- Display title in Instrument Serif: "Travel slower. / Go further." (sweep)
- Subtitle in Inter, body 16px
- Two CTAs: primary (filled) + ghost (glass)
- Scroll indicator: animated chevron with `motion: gentle bob`

### 4.6 Premium Cards
- 3D tilt on hover (max 10°)
- Inner parallax (image moves 6px opposite to tilt)
- Glass surface with noise + edge highlight
- Hover: glow shadow (`0 0 0 1px rgba(124,92,255,0.4) + 0 30px 80px -20px rgba(124,92,255,0.4)`)
- Tag pills: glass with colored dot prefix
- Stagger reveal on scroll

### 4.7 Globe v2
- Atmosphere: Fresnel-style rim glow (additive shader)
- Country halos: when hovered, target dot scales 1→1.8 with glow
- Country labels: floating HTML labels with glass background, follow dot
- Rotation easing: ease-out on user interaction
- Background: ambient particles (200 dots) drifting in 3D space
- Auto-rotate pause on hover; resume on leave

### 4.8 New Section: Trending 2025
- Horizontal scroll carousel (CSS scroll-snap + GSAP scrub)
- Each card: backdrop image, country flag, "Why trending" tag, savings %
- Width: 80vw on desktop, 92vw on mobile
- "Skip the crowds" eyebrow

### 4.9 New Section: Set-Jetting
- Editorial layout: large "Now showing" eyebrow, 3-up cards
- Each card: movie poster (placeholder gradient + film title), destination, year
- Hover: card lifts, gradient shifts

### 4.10 Mood Quiz Stepped
- 5 questions, one at a time, slide transition
- Progress bar (segmented)
- Result: 3 destinations with score bars

### 4.11 Comparison Split-Screen
- Two-pane glass: 50/50 split
- Animated row reveal: each metric row slides in from alternating sides
- "Winner" badge on the better value per row

### 4.12 Bottom Nav (Apple dock style)
- Glass pill, floats above content
- Active indicator: morphs from circle to pill, with `layoutId` GSAP magic
- Magnetic on hover
- Safe-area aware

---

## 5. QA Strategy (Sr Regression Lens)

### 5.1 Functional Regression
- All 24 country cards still render
- Month tabs filter still works
- Itinerary builder still produces 5/6/7 day plans
- Budget estimator still calculates 5 categories
- Search overlay opens/closes
- Mood quiz still filters by tag
- Comparison still side-by-side renders
- Detour cards still hardcoded
- Set-jetting still lists movies
- Passport stamps still increment in localStorage
- Globe still clickable → scroll to country
- Hash routing still works (home/monthwise/world/budget/etc.)

### 5.2 New Tests (manual + automated)
- Lenis smooth scroll: 60fps on scroll
- Magnetic buttons: 8px pull at correct threshold
- Card tilt: ≤10° max, no jitter
- Preloader: hides on `window.load`, ≥600ms minimum
- Cursor: hides on touch devices
- Reduced motion: all motion disabled, instant reveal
- Keyboard: tab through CTAs, focus rings visible
- Screen reader: ARIA labels on interactive elements

### 5.3 Performance Budget
- LCP <2.0s (hero globe canvas)
- FCP <1.0s
- CLS <0.05
- TBT <200ms
- JS bundle <200KB gzipped (GSAP+Lenis+Three+app)
- Initial 3D render <1.5s

### 5.4 Cross-Browser
- Chrome/Edge: full
- Safari: full (test `backdrop-filter` saturation, smooth scroll)
- Firefox: full
- iOS Safari: 60fps scroll, touch magnetic
- Android Chrome: 60fps

### 5.5 Accessibility (WCAG 2.1 AA)
- Color contrast ≥4.5:1 for body, ≥3:1 for large
- Focus rings visible (custom: 2px solid accent with 4px offset)
- Skip-to-content link
- Reduced motion respected
- ARIA: landmarks, labels, live regions for toast
- Form labels (mood quiz, comparison)

---

## 6. DevOps Strategy (CI/CD Lens)

### 6.1 GitHub Actions
- `ci.yml` on push/PR:
  - HTML/CSS/JS lint (htmlhint, stylelint, eslint)
  - Lighthouse CI with budget (LCP, CLS, perf, a11y, SEO)
  - Bundle size check
  - Deploy preview on PR (Vercel)
- `release.yml` on tag: production deploy

### 6.2 Monitoring
- Vercel Analytics (Web Vitals)
- Custom error boundary in `app.js` (window.onerror → console + log to `/api/log` if exists)

### 6.3 Branching
- `main` = production
- `feat/*` = features
- `fix/*` = fixes
- PR preview per branch

---

## 7. Execution Phases (Tracking)

| # | Phase | Effort | Impact | Risk |
|---|---|---|---|---|
| 1 | Tokens + preloader + Lenis | M | High | Low |
| 2 | Glass v2 + premium CSS layer | M | High | Low |
| 3 | Motion system (GSAP + magnetic + cursor) | M | High | Med |
| 4 | Premium hero | M | Very High | Low |
| 5 | Card 3D tilt + hover | S | High | Low |
| 6 | Globe v2 (atmosphere, halos, labels) | M | High | Med |
| 7 | Trending 2025 + Set-Jetting sections | M | High | Low |
| 8 | Mood quiz stepped + Comparison split | S | Med | Low |
| 9 | Bottom nav dock | S | Med | Low |
| 10 | QA pass + a11y | M | High | Low |
| 11 | DevOps CI | M | Med | Low |
| 12 | Visual regression + polish | M | High | Low |

Each phase ends with: (a) files committed, (b) manual smoke test in Playwright screenshot, (c) status update here.

---

## 8. What We're NOT Doing (Scope Discipline)

- ❌ Build step (Webpack/Vite) — keep static deploy
- ❌ Real booking integration — out of scope (affiliate later)
- ❌ Backend / DB — out of scope
- ❌ User accounts / login — passport stamps stay in localStorage
- ❌ Real-time flight prices — affiliate later
- ❌ i18n — English only for now
- ❌ Service worker overhaul — keep existing

---

## 9. Success Criteria

- **PM**: "If Apple.com/a/iphone had a travel site, it'd feel like this."
- **Dev**: <200KB JS, <50ms TTI on midrange mobile, all regression tests pass
- **QA**: Lighthouse Performance 95+, A11y 100, Best Practices 95, SEO 95
- **DevOps**: CI green on every PR, auto-deploy to Vercel preview

---

*End of plan — ready to execute.*
