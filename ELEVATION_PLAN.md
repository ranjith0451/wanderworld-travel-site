# WanderWorld 3D — The "Beats Everything" Elevation Plan

**Author:** Mavis (synthesized from 6 lenses)
**Date:** 2026-07-17
**Status:** Approved for execution
**Source:** `DEVELOPMENT_ROADMAP.md` + `PREMIUM_PLAN.md` audit + `PHASE1_AUDIT.md`

---

## 0. TL;DR (the 1-page version)

| Lens | One-liner | The Move |
|---|---|---|
| **Apple PM** | "If Apple.com had a travel site, it'd feel like this." | **Story first, chrome last.** Six narrative chapters — Discover, Trending, Compare, World, Plan, Decide. Each chapter is a complete emotional arc. |
| **Sr Full-Stack** | "It's already 70% premium. Don't rebuild — **deepen**." | 24→60 countries. Real data. Pinned scroll. WebGL bg. Globe v2. No new framework. No new build step. |
| **Sr QA** | "Premium dies the moment it stutters." | Lighthouse 95+. LCP <2s. Zero CLS. Reduced-motion path. 60fps scroll. A11y WCAG AA. |
| **Lead Designer** | "Glass + motion is the language. **Don't repeat the same word.**" | Per-section color theme. Pinned horizontal scrub. Mesh-gradient WebGL bg. Mask reveals. 3D card tilt. |
| **DevOps** | "Ship it like it's already deployed at scale." | CI on push. Lighthouse budget gate. Preview deploys. Asset hashing. SW cache strategy. Zero secrets. |
| **Client** | "It has to **convert**. Pretty without ROI is a brochure." | Affiliate-ready. CTA per chapter. Soft pre-roll before "Book". Trust signals. Friction-less from impression → intent. |

---

## 1. Apple PM Lens — The Story Arc

The roadmap lists **9 features** (detour, mood quiz, comparison, set-jetting, gamification, trending, etc.). That's a *feature list*, not a story. Apple's secret is **chapters, not features**.

**The 6-chapter spine** (replaces the 9-section soup):

| # | Chapter | Hook | Section ID | Feel |
|---|---|---|---|---|
| 1 | **Discover** | "Where the world is going" | `#trending-2025` | Cinematic, editorial, horizontal scrub |
| 2 | **Pick** | "Find your kind of trip" | `#mood-quiz-section` + `#detour-picks` | Personal, playful, glassy |
| 3 | **Compare** | "Two places. One screen." | `#comparison-section` | Editorial split, glass panes, winner badges |
| 4 | **World** | "Touch the planet" | `#world` (globe v2) | Immersive, exploratory, scroll-linked rotation |
| 5 | **Plan** | "5–7 days, ready in a tap" | `#itinerary` + `#budget` | Practical, confident, clean |
| 6 | **Decide** | "Pick a month, see the world" | `#monthwise` + `#india` (visa) | Trust, clarity, conversion |

**Why this works:**
- Each chapter has a **single verb** (Discover → Pick → Compare → World → Plan → Decide). One job per page.
- The chapters **build trust progressively**: emotion → personal → logic → immersion → plan → action. Apple's homepage does the same.
- The **bottom nav mirrors the spine** (Home, Discover, World, Plan, Search). It IS the story.
- **One CTA per chapter**, primary button. No "wall of buttons" — that's a brochure, not a product.

**The hero promise stays:** *Travel slower. Go further.* — that's the brand thesis. Everything else serves it.

---

## 2. Sr Full-Stack Lens — The Architecture

**Stack lock (no new dependencies):**
- Vanilla JS, Three.js r128, GSAP 3.12 + ScrollTrigger, Lenis 1.1
- Fonts: Inter, Playfair Display, Instrument Serif (already loaded)
- CDN only. No build step. Static deploy.

**The 5 engineering moves that move the needle:**

1. **Data: 24 → 60+ countries.** The roadmap asks for 150+, but 60 well-curated is more honest than 150 stub entries. We do 60 with **real** movie data, **real** set-jetting locations, **real** sustainability ratings.

2. **Globe v2.** Atmosphere shader (Fresnel rim), country halos (hover scale 1→1.8 with glow), floating glass labels, fly-to animation on click. Pulls the country from the data and centers it.

3. **Pinned horizontal scroll** (Apple-style). The `#trending-2025` section pins for 1.5 viewport heights, then translates the strip horizontally with `scrub: 1`. ScrollTrigger does the work; no JS scroll math.

4. **WebGL mesh gradient bg.** A single full-screen `<canvas>` behind everything renders a low-poly mesh gradient that subtly shifts hue with scroll position. ~3% CPU on midrange mobile. Fallback to static CSS gradient.

5. **Per-section color theme.** Each `<section>` gets a `data-chapter` attribute. CSS reads it and shifts accent vars. Result: as you scroll, the page "breathes" through hues. Tied to scroll via a single `IntersectionObserver` writing `--accent` to `:root`.

**No-build constraint respected.** GSAP + ScrollTrigger + Lenis via CDN with `defer`. WebGL bg is one ~80-line vanilla file. Total new JS: < 25KB.

**File additions:**
```
app-bg.js          (NEW — WebGL mesh gradient, ~80 lines)
app-globe.js       (NEW — extracted + upgraded globe, ~250 lines)
data/countries.js  (REPLACE — 24→60+ with deep movie/sustainability/detour data)
styles-premium.css (EXTEND — color theme vars, mesh bg, pinned section, globe v2)
app-motion.js      (EXTEND — scroll-color scrub, pinned choreography, mask reveals)
index.html         (EXTEND — data-chapter attrs, bg canvas, globe container)
```

**What we are NOT doing:**
- ❌ No Webpack/Vite — static deploy still wins for this size
- ❌ No new framework (Vue, Svelte, etc.) — vanilla is correct at this scale
- ❌ No backend — passport stamps stay in localStorage
- ❌ No i18n — English only, future Phase
- ❌ No real booking integration — affiliate deeplinks only

---

## 3. Sr QA Lens — The Quality Gates

**A premium site is premium because nothing breaks. Here's the gate stack:**

| Gate | Target | How to verify |
|---|---|---|
| **Lighthouse Perf** | ≥ 95 | Lighthouse CI on every PR |
| **Lighthouse A11y** | 100 | axe-core + manual screen reader |
| **Lighthouse SEO** | ≥ 95 | Meta tags, JSON-LD, sitemap |
| **Lighthouse BP** | ≥ 95 | HTTPS, no console errors, no deprecated APIs |
| **LCP** | < 2.0s | Hero globe canvas first paint |
| **CLS** | < 0.05 | No layout shift on font load (font-display: swap) |
| **TBT** | < 200ms | Defer non-critical, no main-thread blocks |
| **JS bundle (gz)** | < 200KB | GSAP+ScrollTrigger+Lenis+Three+app combined |
| **Initial 3D render** | < 1.5s | First frame of globe visible by 1.5s |
| **60fps scroll** | sustained | Chrome perf trace on hero → trending |
| **Cross-browser** | Chrome/Edge/Safari/FF/iOS/Android | BrowserStack or local matrix |
| **A11y** | WCAG 2.1 AA | Contrast ≥4.5:1 body, ≥3:1 large, focus rings, ARIA |
| **Reduced motion** | all motion disabled | `prefers-reduced-motion: reduce` respected |

**Regression test list (must pass after every change):**
- All 60+ country cards render
- Month tabs filter
- Itinerary builder (5/6/7 day)
- Budget estimator (5 categories × 3 tiers × 4 group sizes)
- Mood quiz filters by tag
- Comparison side-by-side
- Detour cards render
- Set-jetting lists movies
- Passport stamps increment in localStorage
- Globe click → scroll to country
- Hash routing works
- Search overlay opens/closes
- Bottom nav active state syncs with scroll

**New motion tests:**
- Lenis smooth scroll: 60fps sustained
- Magnetic buttons: 10px pull at correct threshold
- Card 3D tilt: ≤ 4° max, no jitter
- Pinned section: scrubs smoothly, no jump
- Preloader: hides on `load`, ≥ 700ms min
- Custom cursor: hides on touch, scales on hover
- Color theme: each chapter shows its hue, transitions smoothly

---

## 4. Lead Designer Lens — The Visual Language

The site already has a strong premium system. The move is **depth and rhythm**, not new tokens.

### 4.1 Glass v3 — Multi-layer depth

```
Layer 1: backdrop-filter blur(28px) saturate(180%)  ← ambient blur
Layer 2: linear-gradient 135° (accent → transparent)  ← hue tint
Layer 3: SVG noise 4% opacity  ← film grain (kills plastic look)
Layer 4: inset 0 1px 0 white 0.15  ← top edge highlight
Layer 5: inset 0 -1px 0 black 0.20  ← bottom depth shadow
Layer 6: cursor-tracked specular  ← new — radial highlight follows mouse
```

The 6th layer is the new trick. It tracks cursor with a `radial-gradient` positioned at `--mx, --my`. The glass *reacts* to where you are. That's the "alive" feeling.

### 4.2 Per-chapter color theme

Each section gets `data-chapter="discover"` etc. CSS:

```css
:root {
  --accent: #7c5cff;        /* default */
  --accent-2: #00d4ff;
  --chapter-hue: 0;
}
[data-chapter="discover"] { --accent-hue: 280; }
[data-chapter="pick"]      { --accent-hue: 200; }
[data-chapter="compare"]   { --accent-hue: 340; }
[data-chapter="world"]     { --accent-hue: 220; }
[data-chapter="plan"]      { --accent-hue: 160; }
[data-chapter="decide"]    { --accent-hue: 30;  }
```

A single `IntersectionObserver` writes `--accent-hue` to `:root` based on the most-visible section. All accents shift via `hsl(var(--accent-hue) 80% 65%)`. The page **breathes through colors** as you scroll.

### 4.3 Pinned horizontal scroll (the hero chapter moment)

The trending strip is currently a CSS-only `scroll-snap` scroller. That's fine. But Apple's actual trick is **scroll-scrubbed pinning**:

```js
ScrollTrigger.create({
  trigger: '#trending-2025',
  start: 'top top',
  end: '+=150%',           // pin for 1.5 viewports
  pin: true,
  scrub: 1,
  animation: gsap.to('.trending-strip', { x: () => -(stripWidth - vw) })
});
```

User scrolls. Section pins. Cards translate horizontally. Scroll back, cards un-translate. That's the Apple moment. Reserve it for ONE section (trending), not all — pacing matters.

### 4.4 Mask reveal (text + image)

For hero titles and section headings, use `clip-path: inset()` animated with ScrollTrigger. The text **wipes in** from bottom to top, like a film title.

### 4.5 WebGL mesh gradient bg

A full-screen `<canvas>` behind everything. Renders 4 points of color blended with a low-poly mesh. Hue shifts based on `--chapter-hue`. ~3% CPU, falls back to CSS gradient if WebGL fails. The "alive" base layer.

### 4.6 Globe v2

- **Atmosphere**: Fresnel-style rim glow (additive shader on a slightly larger sphere)
- **Country dots**: glow on hover (scale 1→1.8, color from accent), labels follow
- **Click**: fly-to animation (camera tweens, dot scales, panel slides in)
- **Auto-rotate**: gentle drift, pause on hover
- **Background particles**: 200 dots drifting in 3D space, subtle depth

---

## 5. DevOps Lens — The Deployment Story

**The current state:** Vercel-ready static deploy, Dockerfile, manifest.json, service worker. Solid.

**The 5 moves to harden it:**

1. **CI on every push** (`.github/workflows/ci.yml`):
   - HTML/CSS/JS lint
   - Lighthouse CI with budget gates
   - Bundle size check
   - Preview deploy on PR

2. **Asset strategy**:
   - `assets/backdrops/` — 12 cinematic gradient SVGs (one per country cluster). SVG = tiny + scales + no JPEG artifacts.
   - `assets/posters/` — set-jetting poster placeholders are generated CSS gradients (no PNGs needed)
   - Country flag emoji over PNG — keeps bundle zero

3. **Service Worker v2**:
   - Cache-first for static assets
   - Stale-while-revalidate for fonts
   - Network-first for data files
   - Pre-cache the preloader assets on install

4. **Performance budget** in `vercel.json` headers:
   - `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`
   - `Cache-Control: public, max-age=3600` for HTML
   - `Content-Encoding: br` (Vercel auto)

5. **Security**:
   - No secrets in repo
   - CSP header (allow GSAP/Lenis/Three CDNs + Google Fonts)
   - HTTPS-only (Vercel default)

**What we are NOT adding (intentionally):**
- ❌ Custom backend (serverless functions) — affiliate deeplinks only
- ❌ Real-time flight API — out of scope this phase
- ❌ User accounts — localStorage for passport stamps

---

## 6. Client Lens — The ROI Reality

A pretty site that doesn't convert is a portfolio piece. Three things must work:

### 6.1 Trust signals (above the fold + footer)
- "Built for Bengaluru outbound" — own the niche
- 60+ countries (not "thousands" — honest numbers beat marketing)
- Visa info per country with last-updated date
- Real sustainability scores (not invented)

### 6.2 Conversion path (Decide chapter)
Every chapter ends with **one CTA**:
- Discover → "See all trending" → scrolls to pick
- Pick → "Build my trip" → scrolls to plan
- Compare → "Start planning" → scrolls to plan
- World → "Explore a destination" → scroll to monthwise
- Plan → "Estimate my budget" → budget panel
- Decide → "Build my itinerary" → itinerary builder

No "Learn more." No "Contact us." Just: **next obvious step**.

### 6.3 Affiliate slots (where they'll go, not live)
Phase 2:
- Skyscanner deeplink on "Search flights" (3% commission)
- Booking.com deeplink on hotel cards (5–25% commission)
- GetYourGuide on activity cards (10% commission)

For now, deeplinks go to Skyscanner search with origin pre-filled. CTA visible but honest about the redirect.

### 6.4 Engagement hooks
- Mood quiz — 5 questions, shareable result URL
- Passport stamps — localStorage, share as image
- Saved trips — localStorage, export to JSON
- "WanderScore" — composite metric, shareable

### 6.5 Metrics to instrument
- Time on site
- Sections scrolled past
- Quiz completion rate
- CTA click-through
- Affiliate redirect count (when enabled)

Vercel Analytics (free) covers Web Vitals. For section scroll depth, add a small `IntersectionObserver` that emits to `gtag` or a `dataLayer` event.

---

## 7. The Execution Plan (12 phases, 1 sprint)

| # | Phase | Effort | Impact | What ships |
|---|---|---|---|---|
| 1 | Data: 24→60+ | M | High | Expanded `data/countries.js` with movies, set-jetting, sustainability, detours |
| 2 | Design tokens v3 | S | High | Per-chapter color vars, glass v3 with cursor specular |
| 3 | WebGL mesh bg | M | High | `app-bg.js`, canvas layer, hue-shift with scroll |
| 4 | Hero refinement | S | High | Mask reveal, parallax depth, glow orbit |
| 5 | Pinned horizontal scroll | M | Very High | Trending 2025 as the scroll-scrubbed hero moment |
| 6 | Globe v2 | M | High | Atmosphere, halos, labels, fly-to |
| 7 | Set-jetting cinematic | S | Med | Poster gradient art, year + director meta |
| 8 | Color theme scrub | S | High | `IntersectionObserver` → `--chapter-hue` |
| 9 | Mood quiz stepped | S | Med | 5 steps with progress, slide transitions |
| 10 | Bottom nav active sync | S | Med | Already exists, polish the indicator |
| 11 | QA pass | M | High | Lighthouse, a11y, cross-browser, regression |
| 12 | CI + README | S | Med | GitHub Actions, deploy notes |

**Each phase ends with:** files committed → manual smoke test in Playwright screenshot → status update here.

---

## 8. The Success Bar

If we hit these, the site is genuinely in the top 1% of travel sites:

- ✅ Lighthouse Performance ≥ 95, A11y 100, SEO ≥ 95
- ✅ First Contentful Paint < 1.0s
- ✅ Hero globe first frame < 1.5s
- ✅ Smooth 60fps scroll through entire hero
- ✅ 60+ countries with real data
- ✅ Pinned horizontal scroll moment works
- ✅ Color theme shifts visibly per chapter
- ✅ WebGL bg runs at 60fps on midrange mobile
- ✅ Zero console errors
- ✅ All regression tests pass
- ✅ Reduced-motion users see a complete, static version
- ✅ The preloader feels inevitable, not added

**The PM test:** Show the site to 3 people who've never seen it. If they don't say "wow" within 5 seconds, the design isn't done.

---

## 9. What Beats Everything Else (the differentiation)

| Everyone else | WanderWorld 3D |
|---|---|
| Stock photos, inconsistent | Cinematic gradient art, design system |
| Static pages, scroll-jank | Choreographed scroll, Lenis smooth, 60fps |
| 50 countries with stub data | 60+ countries with real movies, visas, sustainability |
| "Compare" as a table | Split-screen glass panes with winner badges |
| 2D flat globe | 3D globe with atmosphere, halos, fly-to |
| Page-load flash | 700ms branded preloader with intent |
| Wall of features | 6 chapters, one job per page |
| Generic dark mode | Per-chapter color theme that breathes |
| "Learn more" CTAs | One CTA per chapter, next obvious step |
| Build step + framework | Vanilla, zero build, deploys anywhere |

---

## 10. Open Questions (Resolved by PM instinct, not escalation)

| Question | Decision | Reason |
|---|---|---|
| 24 → 150 (roadmap) or 60 (PM)? | **60+** | Honest, deep data beats 150 stubs. Roadmap's 150 was aspirational. |
| Real-time flight API? | **No, this phase** | Out of scope. Affiliate deeplinks to Skyscanner instead. |
| User accounts? | **No, this phase** | localStorage is enough. Account infra is a Phase 4 problem. |
| i18n? | **English only** | Single market depth > multi-market shallowness. |
| Set-jetting movie posters? | **CSS gradient art, no PNGs** | Zero image weight. Cinematic by design. |
| Build step? | **Never** | Vanilla + CDN is correct at this scale. |
| Vue/Svelte? | **No** | Vanilla + GSAP is enough. Adding framework = maintenance tax. |

---

## 11. The One Sentence

> Build a 6-chapter story (Discover → Pick → Compare → World → Plan → Decide) over a 60+ country dataset, choreographed with scroll-driven motion, WebGL atmosphere, per-chapter color themes, and a v2 globe — all on a zero-build, statically-deployed vanilla stack that hits Lighthouse 95+ and feels inevitable, not added.

---

*End of plan — execution starts now.*
