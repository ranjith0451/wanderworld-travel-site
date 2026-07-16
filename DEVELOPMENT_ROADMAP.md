# WanderWorld 3D Development Roadmap

**Last Updated:** July 16, 2026  
**Status:** Planning Phase  
**Target:** Expand global coverage, integrate trending features, enhance user engagement

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Comprehensive Data Integration Strategy](#1-comprehensive-data-integration-strategy)
3. [Market-Aligned Feature Roadmap](#2-market-aligned-feature-roadmap)
4. [Technical Implementation Roadmap](#3-technical-implementation-roadmap)
5. [Data Sources](#4-data-sources-for-global-coverage)
6. [Trending Features for 2025](#5-specific-feature-highlights-for-2025-trends)
7. [Monetization Ideas](#6-monetization-ideas)
8. [Quick Wins](#7-quick-win-immediate-actions-this-week)
9. [Priority Matrix](#summary)

---

## Executive Summary

WanderWorld 3D currently has a robust technical foundation (vanilla SPA, Three.js 3D globe, responsive design) but is limited to ~3 hardcoded countries. This roadmap outlines how to:

- **Expand to 150+ countries** with complete travel data
- **Implement 2025 trending features** (detour destinations, sustainability filters, set-jetting)
- **Add modern engagement tools** (mood quizzes, passport gamification, real-time pricing)
- **Enable monetization** (affiliate bookings, sponsored content)

All changes maintain the current codebase integrity—no core file modifications required.

---

## 1. Comprehensive Data Integration Strategy

### Current Gap
- Only 3 countries in `data/countries.js`
- Limited fields per country (name, region, budget, visa, itinerary)
- No real-time pricing, attraction details, or sustainability data

### Option A: Build Your Own Data Source

Create a structured database with comprehensive fields:

```json
{
  "id": "eg",
  "name": "Egypt",
  "region": "Middle East & North Africa",
  "flag": "🇪🇬",
  "coordinates": { "lat": 26.8206, "lng": 30.8025 },
  "timezone": "Africa/Cairo",
  "currency": "EGP",
  "language": ["Arabic", "English"],
  
  "overview": "Ancient monuments, Red Sea diving, desert safaris",
  "highlights": ["Pyramids of Giza", "Red Sea", "Luxor temples"],
  
  "climate": {
    "bestMonths": [10, 11, 12, 1, 2, 3],
    "avgTemp": { "summer": 35, "winter": 20 },
    "rainfall": "Minimal"
  },
  
  "visa": {
    "type": "eVisa",
    "processingDays": 3,
    "costUSD": 25,
    "durationDays": 30
  },
  
  "costs": {
    "flights": { "low": 18000, "mid": 35000, "luxury": 65000 },
    "accommodation": { "budget": 1500, "mid": 4000, "luxury": 12000 },
    "meals": { "budget": 500, "mid": 1500, "luxury": 5000 }
  },
  
  "trend": "Red Sea Resorts (2025 trending)",
  "crowdLevel": "high",
  "detourAlternatives": ["Hurghada", "Sharm El-Sheikh"],
  
  "activities": [
    { "name": "Pyramids Tour", "cost": 2000, "duration": "4h", "type": "culture" },
    { "name": "Red Sea Diving", "cost": 3500, "duration": "Full day", "type": "adventure" }
  ],
  
  "sustainability": {
    "eco_hotels": 15,
    "carbon_offset_available": true,
    "rating": 3.5
  },
  
  "movies": ["Death on the Nile", "Indiana Jones and the Raiders of the Lost Ark"]
}
```

### Option B: Use Open Data APIs

Recommended for scalability:

- **REST Countries API** – geographic, language, currency data
- **World Bank Climate Data API** – weather patterns
- **Google Places API** – attractions, photos, reviews
- **Overpass API** – POI data (restaurants, hotels, museums)
- **Wikipedia API** – rich destination descriptions

### Option C: Hybrid Approach ⭐ (Recommended)

**Best of both worlds:**
- Store static seasonal/budget data in **Airtable** or **Supabase**
- Fetch real-time data (flights, hotels) via **affiliate APIs** (Skyscanner, Booking.com, Kayak)
- Cache results to avoid API rate limits
- Minimal backend burden; fast iteration

**File Structure:**
```
data/
  ├── countries.js          (static seed data for 150+ countries)
  ├── activities.json       (attractions per country)
  ├── trending-2025.json    (trending destinations & detours)
  └── api-config.js         (affiliate endpoints)
```

---

## 2. Market-Aligned Feature Roadmap

### 2025 Travel Trends Context

**Global Trends:**
- 🏝️ **Detour Destinations:** Skip crowded tourist hubs; find hidden gems nearby (Girona vs Barcelona, Abu Dhabi vs Dubai)
- 🌍 **Set-Jetting:** Travel to locations featured in movies/TV shows
- 🛍️ **Goods Getaways:** Travel specifically for local food, crafts, markets
- 😌 **JOMO Travel:** "Joy of Missing Out"—digital detox, wellness, slow travel
- 🌱 **Sustainability:** Eco-conscious travelers prioritize carbon footprint

---

### Phase 1: Content & Discovery (High Impact, Low Effort)
**Timeline:** 1–2 weeks | **Effort:** Low | **Impact:** High visibility

| Feature | Why It Matters | Implementation |
|---------|---|---|
| **Expand to 150+ countries** | Global coverage; travel beyond Asia-centric view | Batch import via JSON/CSV; auto-populate UI components |
| **"Detour Destinations" Section** | 2025 trend: avoid crowds, find hidden gems | Add `nearbyAlternatives` field; new UI section comparing prices/crowds |
| **Season Trend Tags** | "Shoulder season = cheaper & fewer crowds" | Add `trend`, `crowdLevel`, `priceIndex` to country data |
| **Destination Dupes** | "I want Barcelona vibes but cheaper"—travelers want alternatives | New filter: "Similar to [destination]" with cost comparison matrix |

**New Section in `index.html`:**
```html
<section class="section" id="detour-destinations">
  <div class="section__header reveal">
    <h2 class="section__title">Skip the Crowds: Hidden Gems</h2>
    <p class="section__sub">Discover less-touristy alternatives near popular cities.</p>
  </div>
  <div class="detour-cards reveal" id="detour-cards"></div>
</section>
```

**New Function in `app.js`:**
```javascript
function renderDetourDestinations() {
  const root = q('#detour-cards');
  if (!root) return;
  
  const data = getData();
  const detourPairs = [
    { main: 'Barcelona', detour: 'Girona', savings: '€30/night' },
    { main: 'Dubai', detour: 'Abu Dhabi', benefit: 'More authentic' },
  ];
  
  root.innerHTML = detourPairs
    .map((pair) => `
      <article class="detour-card">
        <p class="detour-card__from">Instead of <strong>${pair.main}</strong></p>
        <p class="detour-card__to">Try <strong>${pair.detour}</strong></p>
        <p class="detour-card__benefit">${pair.savings || pair.benefit}</p>
      </article>
    `)
    .join('');
}
```

---

### Phase 2: Personalization & Engagement (Medium Effort, High Engagement)
**Timeline:** 2–3 weeks | **Effort:** Medium | **Impact:** High engagement, time-on-site increase

| Feature | Why It Matters | Implementation |
|---------|---|---|
| **AI Travel Mood Quiz** | "What kind of traveler are you?" → personalized recommendations | Form: beach/culture/adventure/budget/eco → filter results dynamically |
| **Gamification: "Passport Stamps"** | Reward users for exploring destinations; build loyalty | Track viewed countries in localStorage; unlock badges ("Continent Collector", "Budget Hacker") |
| **Trip Comparison Tool** | Let users compare 2–3 destinations side-by-side | Comparison modal: flights, stays, activities, cost breakdown, climate |
| **Set-Jetting Integration** | Movie/TV location database (trending in 2025) | Link destinations to "Seen in [Film/Show]" with IMDb/streaming links |

**New Section in `index.html`:**
```html
<section class="section" id="mood-quiz-section">
  <div class="section__header reveal">
    <h2 class="section__title">What's Your Travel Style?</h2>
  </div>
  <form id="mood-quiz-form" class="quiz-form reveal">
    <label class="quiz-option">
      <input type="radio" name="mood" value="beach" /> 🏝️ Beach & Relaxation
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="culture" /> 🏛️ Culture & History
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="adventure" /> ⛰️ Adventure & Hiking
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="budget" /> 💰 Budget Hacker
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="eco" /> 🌱 Eco-Conscious
    </label>
    <button type="submit" class="btn btn--primary">Show Me Destinations</button>
  </form>
  <div id="quiz-results" class="quiz-results"></div>
</section>
```

---

### Phase 3: Booking & Monetization (Higher Effort, Revenue Potential)
**Timeline:** 3–4 weeks | **Effort:** High | **Impact:** Revenue generation, conversion increase

| Feature | Why It Matters | Implementation |
|---------|---|---|
| **Real-Time Flight & Hotel Prices** | Users book directly from your site; affiliate commissions (3–8%) | Integrate Skyscanner/Kayak iFrame or API; live price tracking |
| **One-Click Booking Integration** | Seamless trip planning; higher conversion | Bundle flights, hotels, activities in one checkout flow |
| **Group Trip Planner** | Enable group bookings, split costs, higher order values | Add "Invite friends", shared itinerary editing, group budget calculator |
| **Sustainability Filters** | Growing demand for eco-conscious travel | Highlight carbon footprint, eco-hotels, green activities with 🌿 badges |

---

### Phase 4: Community & Engagement (Viral Growth)
**Timeline:** 4–6 weeks | **Effort:** Medium–High | **Impact:** Viral potential, social sharing

| Feature | Why It Matters | Implementation |
|---------|---|---|
| **User Reviews & Photos** | Social proof; UGC increases trust and time-on-site | Add review section per destination; photo gallery; upvote system |
| **"Goods Getaway" Guide** | Trending: travel for local food/crafts | Add "Local markets", "Street food", "Souvenirs" sections with photos |
| **Influencer Travel Stories** | Reach younger demographics; set-jetting | Embed Instagram/TikTok feeds per destination; partner hashtags |
| **Saved Trips & Wish Lists** | Let users save favorites, share with friends | Browser storage → shareable URL; add "📌 Save to List" button |
| **JOMO/Wellness Focus** | "Joy of Missing Out" trend | Filter: yoga retreats, digital detox spots, wellness resorts |

---

## 3. Technical Implementation Roadmap

### Immediate (Week 1–2): Data Expansion

#### Step 1: Refactor `data/countries.js`

Replace current hardcoded structure with expanded schema:

```javascript
window.TRAVEL_DATA = {
  months: ["January", "February", ..., "December"],
  countries: [
    {
      id: "eg",
      name: "Egypt",
      region: "Middle East & North Africa",
      flag: "🇪🇬",
      coordinates: { lat: 26.8206, lng: 30.8025 },
      timezone: "Africa/Cairo",
      currency: "EGP",
      iataCode: "CAI",
      
      overview: "Ancient monuments, Red Sea diving, desert safaris",
      highlights: ["Pyramids of Giza", "Red Sea", "Luxor temples"],
      
      climate: {
        bestMonths: [10, 11, 12, 1, 2, 3],
        avgTemp: { summer: 35, winter: 20 },
        rainfall: "Minimal",
      },
      
      visa: {
        type: "eVisa",
        processingDays: 3,
        costUSD: 25,
        durationDays: 30,
      },
      
      budget: {
        low: 35000,
        mid: 65000,
        luxury: 150000,
      },
      
      costBreakdown: {
        flights_blr: { low: 18000, mid: 35000, luxury: 65000 },
        accommodation_night: { budget: 1500, mid: 4000, luxury: 12000 },
        meals_day: { budget: 500, mid: 1500, luxury: 5000 },
      },
      
      detourAlternatives: ["Hurghada", "Sharm El-Sheikh"],
      trend: "Red Sea Resorts (2025 trending)",
      crowdLevel: "high",
      priceIndex: 1.2,
      
      activities: [
        {
          name: "Pyramids Tour",
          cost: 2000,
          duration: "4h",
          type: "culture",
          bestMonth: 1,
        },
        {
          name: "Red Sea Diving",
          cost: 3500,
          duration: "Full day",
          type: "adventure",
          bestMonth: 10,
        },
      ],
      
      sustainability: {
        eco_hotels: 15,
        carbon_offset_available: true,
        rating: 3.5,
      },
      
      movies: ["Death on the Nile", "Indiana Jones and the Raiders of the Lost Ark"],
      
      bestMonths: [10, 11, 12, 1, 2, 3],
      tags: ["History", "Beaches", "Adventure"],
    },
    // ... 150+ more countries
  ],
};
```

#### Step 2: Generate Country Data

**Option 1: Manual Batch Import**
- Use REST Countries API to seed base data
- Enhance with travel-specific fields via Airtable
- Export as JSON

**Option 2: Auto-Generation Script**
```bash
# Install dependencies
npm install axios

# Create scripts/generate-countries.js
node scripts/generate-countries.js > data/countries.js
```

---

### Short Term (Week 2–4): New UI Components

#### New Sections in `index.html`

```html
<!-- Detour Destinations Section -->
<section class="section" id="detour-picks">
  <div class="section__header reveal">
    <h2 class="section__title">Skip the Crowds: Hidden Gems</h2>
    <p class="section__sub">Less touristy alternatives near popular cities</p>
  </div>
  <div class="detour-cards reveal" id="detour-cards"></div>
</section>

<!-- Mood Quiz Section -->
<section class="section" id="mood-quiz-section">
  <div class="section__header reveal">
    <h2 class="section__title">What's Your Travel Style?</h2>
  </div>
  <form id="mood-quiz-form" class="quiz-form reveal">
    <label class="quiz-option">
      <input type="radio" name="mood" value="beach" /> 🏝️ Beach & Relaxation
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="culture" /> 🏛️ Culture & History
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="adventure" /> ⛰️ Adventure & Hiking
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="budget" /> 💰 Budget Hacker
    </label>
    <label class="quiz-option">
      <input type="radio" name="mood" value="eco" /> 🌱 Eco-Conscious
    </label>
    <button type="submit" class="btn btn--primary">Show Me Destinations</button>
  </form>
  <div id="quiz-results" class="quiz-results"></div>
</section>

<!-- Comparison Tool Section -->
<section class="section" id="comparison-section">
  <div class="section__header reveal">
    <h2 class="section__title">Compare Destinations</h2>
    <p class="section__sub">Side-by-side comparison of flights, stays, climate, and activities</p>
  </div>
  <div class="comparison-panel reveal">
    <select id="compare-country-1" class="input">
      <option>Select first destination</option>
    </select>
    <select id="compare-country-2" class="input">
      <option>Select second destination</option>
    </select>
    <button class="btn btn--primary" id="compare-btn">Compare</button>
  </div>
  <div id="comparison-result"></div>
</section>

<!-- Set-Jetting Section -->
<section class="section" id="setjetting-section">
  <div class="section__header reveal">
    <h2 class="section__title">Travel Like Your Favorite Movie</h2>
    <p class="section__sub">Visit locations featured in films and TV shows</p>
  </div>
  <div class="setjetting-cards reveal" id="setjetting-cards"></div>
</section>
```

#### New CSS in `styles.css`

```css
/* Mood Quiz Styling */
.quiz-form {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.quiz-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.quiz-option input[type="radio"] {
  cursor: pointer;
}

.quiz-results {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

/* Detour Cards */
.detour-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.detour-card {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(34, 211, 238, 0.1));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
}

.detour-card__from {
  color: #cbd5e1;
  margin-bottom: 8px;
}

.detour-card__to {
  font-size: 18px;
  font-weight: 700;
  margin: 8px 0;
  background: linear-gradient(90deg, var(--accent-2), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.detour-card__benefit {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

/* Comparison Modal */
.comparison-result {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  overflow-x: auto;
}

.comparison-result table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-result td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.comparison-result td:first-child {
  font-weight: 600;
  color: #cbd5e1;
}

/* Set-Jetting Cards */
.setjetting-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.setjetting-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  position: relative;
  overflow: hidden;
}

.setjetting-card::before {
  content: "🎬";
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 24px;
  opacity: 0.3;
}

.setjetting-card__title {
  font-weight: 700;
  margin-bottom: 6px;
}

.setjetting-card__movie {
  font-size: 12px;
  color: #94a3b8;
}

/* Sustainability Badge */
.eco-badge {
  display: inline-block;
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
}

.eco-badge::before {
  content: "🌱 ";
}
```

#### New Functions in `app.js`

```javascript
// Mood Quiz Functionality
function initMoodQuiz() {
  const form = q('#mood-quiz-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mood = new FormData(form).get('mood');
    filterDestinationsByMood(mood);
  });
}

function filterDestinationsByMood(mood) {
  const data = getData();
  let filtered = data.countries || [];
  
  const moodFilters = {
    beach: (c) => (c.tags || []).includes('Beaches'),
    culture: (c) => (c.tags || []).includes('Heritage') || (c.tags || []).includes('Culture'),
    adventure: (c) => (c.tags || []).includes('Adventure') || (c.tags || []).includes('Hiking'),
    budget: (c) => (c.budget?.low || 0) < 40000,
    eco: (c) => (c.sustainability?.rating || 0) >= 3.5,
  };
  
  filtered = filtered.filter(moodFilters[mood] || (() => true));
  
  const resultsContainer = q('#quiz-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <p style="text-align: center; color: #cbd5e1; margin-bottom: 14px;">
        Found ${filtered.length} destinations for you!
      </p>
    ` + filtered
      .slice(0, 6)
      .map((c) => `
        <article class="card" data-country="${c.id}">
          <div class="card__title">${c.flag || ''} ${c.name}</div>
          <div class="card__meta">${c.region || ''}</div>
          <div class="card__row">
            <span class="card__pill">Low ${fmt(c.budget?.low || 0)}</span>
            <span class="card__pill">Mid ${fmt(c.budget?.mid || 0)}</span>
          </div>
        </article>
      `)
      .join('');
  }
  
  toast(`Found ${filtered.length} destinations matching your style!`);
}

// Detour Destinations
function renderDetourDestinations() {
  const root = q('#detour-cards');
  if (!root) return;
  
  const detourPairs = [
    { main: 'Barcelona', detour: 'Girona', emoji: '🏰', savings: '€30/night cheaper' },
    { main: 'Dubai', detour: 'Abu Dhabi', emoji: '🏙️', benefit: 'More authentic culture' },
    { main: 'Tokyo', detour: 'Kyoto', emoji: '⛩️', benefit: 'Traditional temples & gardens' },
    { main: 'Phuket', detour: 'Krabi', emoji: '🏝️', savings: '50% fewer tourists' },
    { main: 'Milan', detour: 'Brescia', emoji: '🎨', benefit: 'Renaissance charm' },
    { main: 'New York', detour: 'Philadelphia', emoji: '🗽', savings: '₹15,000 cheaper stays' },
  ];
  
  root.innerHTML = detourPairs
    .map((pair) => `
      <article class="detour-card">
        <p class="detour-card__from">Instead of <strong>${pair.main}</strong></p>
        <p class="detour-card__to">${pair.emoji} ${pair.detour}</p>
        <p class="detour-card__benefit">${pair.savings || pair.benefit}</p>
      </article>
    `)
    .join('');
}

// Comparison Tool
function initComparisonTool() {
  const country1Sel = q('#compare-country-1');
  const country2Sel = q('#compare-country-2');
  const compareBtn = q('#compare-btn');
  const data = getData();
  
  if (!country1Sel || !country2Sel || !compareBtn) return;
  
  [country1Sel, country2Sel].forEach((sel) => {
    (data.countries || []).forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.flag || ''} ${c.name}`;
      sel.appendChild(opt);
    });
  });
  
  compareBtn.addEventListener('click', () => {
    const c1 = byId(country1Sel.value);
    const c2 = byId(country2Sel.value);
    if (!c1 || !c2) {
      toast('Select two destinations to compare');
      return;
    }
    
    const result = q('#comparison-result');
    if (result) {
      result.innerHTML = `
        <table>
          <tr>
            <td><strong>Metric</strong></td>
            <td><strong>${c1.flag} ${c1.name}</strong></td>
            <td><strong>${c2.flag} ${c2.name}</strong></td>
          </tr>
          <tr>
            <td>Flights (₹)</td>
            <td>${fmt(c1.budget?.low || 0)} – ${fmt(c1.budget?.luxury || 0)}</td>
            <td>${fmt(c2.budget?.low || 0)} – ${fmt(c2.budget?.luxury || 0)}</td>
          </tr>
          <tr>
            <td>Best Months</td>
            <td>${(c1.bestMonths || []).slice(0, 3).join(', ') || 'Year-round'}</td>
            <td>${(c2.bestMonths || []).slice(0, 3).join(', ') || 'Year-round'}</td>
          </tr>
          <tr>
            <td>Visa</td>
            <td>${c1.visa || 'Check requirements'}</td>
            <td>${c2.visa || 'Check requirements'}</td>
          </tr>
          <tr>
            <td>Region</td>
            <td>${c1.region}</td>
            <td>${c2.region}</td>
          </tr>
          <tr>
            <td>Sustainability</td>
            <td>${c1.sustainability?.rating || 'N/A'}/5 🌿</td>
            <td>${c2.sustainability?.rating || 'N/A'}/5 🌿</td>
          </tr>
        </table>
      `;
      toast(`Comparing ${c1.name} and ${c2.name}`);
    }
  });
}

// Passport Stamps Gamification
function initPassportStamps() {
  const key = 'wanderworld_passport_stamps';
  const stamps = JSON.parse(localStorage.getItem(key) || '[]');
  
  if (!stamps.length) return;
  
  const continents = new Set();
  const regions = {};
  
  stamps.forEach(countryId => {
    const country = byId(countryId);
    if (country) {
      continents.add(country.region);
      regions[country.region] = (regions[country.region] || 0) + 1;
    }
  });
  
  if (stamps.length >= 10) {
    toast('🏆 Globetrotter! You\'ve explored 10+ destinations!');
  }
  if (continents.size >= 6) {
    toast('🌍 Continent Collector! You\'ve explored 6+ regions!');
  }
  if (Object.values(regions).some(count => count >= 5)) {
    toast('🎯 Regional Expert! You\'ve explored 5+ destinations in one region!');
  }
}

// Set-Jetting: Movies & TV Shows
function renderSetJettingDestinations() {
  const root = q('#setjetting-cards');
  if (!root) return;
  
  const data = getData();
  const withMovies = (data.countries || []).filter(c => (c.movies || []).length > 0);
  
  root.innerHTML = withMovies
    .slice(0, 8)
    .map((c) => `
      <article class="setjetting-card">
        <p class="setjetting-card__title">${c.flag} ${c.name}</p>
        <p class="setjetting-card__movie">
          Featured in: ${(c.movies || []).slice(0, 2).join(', ')}
        </p>
      </article>
    `)
    .join('');
}

// Track country visit
function trackCountryVisit(countryId) {
  const key = 'wanderworld_passport_stamps';
  const stamps = JSON.parse(localStorage.getItem(key) || '[]');
  if (!stamps.includes(countryId)) {
    stamps.push(countryId);
    localStorage.setItem(key, JSON.stringify(stamps));
    initPassportStamps();
  }
}

// Init all new features
function initNewFeatures() {
  renderDetourDestinations();
  initMoodQuiz();
  initComparisonTool();
  renderSetJettingDestinations();
  initPassportStamps();
}
```

---

## 4. Data Sources for Global Coverage

| Data Type | Source | Free/Paid | Update Frequency | Notes |
|-----------|--------|-----------|------------------|-------|
| Countries, flags, languages | [REST Countries API](https://restcountries.com/) | Free | Monthly | ~250 countries |
| Visa requirements | [VisaHQ API](https://www.visahq.com/) or manual | Paid / Manual | Quarterly | Detailed visa types |
| Climate & weather | [World Bank Climate](https://www.worldbank.org/) or [OpenWeather](https://openweathermap.org/) | Free/Paid | Daily | Historical + forecast |
| Attractions & photos | [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview) | Paid ($0.04–$0.17/call) | Real-time | 2M places worldwide |
| Flight prices | [Skyscanner API](https://partners.skyscanner.com/) or [Kayak Affiliate](https://www.kayak.com/affiliate/) | Affiliate commission | Real-time | 3–8% commission |
| Hotel prices | [Booking.com Affiliate API](https://affiliate.booking.com/) | Commission-based | Real-time | 5–25% commission |
| Reviews & ratings | [TripAdvisor Affiliate API](https://www.tripadvisor.com/) or scrape | Free (with attribution) | Weekly | Destination reviews |
| Movies & TV | [IMDb API](https://www.imdb.com/) or [TMDb](https://www.themoviedb.org/) | Free (registration) | Daily | Set-jetting data |

---

## 5. Specific Feature Highlights for 2025 Trends

### ✅ Detour Destinations

Trending destinations are increasingly looking for alternatives to crowded cities:

**Example Data Structure:**
```javascript
{
  name: "Barcelona",
  trend: "Over 30M tourists/year",
  detourAlternative: {
    name: "Girona",
    distance: "100 km",
    savings: "€30/night on accommodation",
    reason: "Medieval architecture, Gothic Quarter, 90% fewer tourists",
    flights: "Same flight hub (BCN), 1h train ride",
  }
}
```

---

### ✅ Sustainability Filters

New travelers prioritize eco-consciousness:

```javascript
{
  name: "Bali",
  sustainability: {
    eco_hotels: 120,
    carbon_offset_available: true,
    local_community_programs: true,
    rating: 4.2,
    certifications: ["Green Key", "EarthCheck"],
  }
}
```

---

### ✅ Trend Tags

Show what's trending *right now*:

```javascript
{
  name: "Egypt",
  trend: "Red Sea Resorts (2025 trending)",
  trendDescription: "Diving, resort islands, and off-season affordability",
  crowdLevel: "high",
  seasonalTrend: "shoulder_season_now",
}
```

---

### ✅ Set-Jetting

Travel to movie/TV locations:

```javascript
{
  name: "New Zealand",
  movies: [
    { title: "Lord of the Rings", locations: ["Hobbiton", "Mount Doom"] },
    { title: "The Hobbit", locations: ["Hobbiton", "Rivendell"] },
  ],
}
```

---

### ✅ Gamification: Passport Stamps

Track and reward exploration:

```javascript
const stats = {
  countriesVisited: 8,
  continentsExplored: 3,
  badges: ["Globetrotter", "Beach Lover", "Culture Seeker"],
  nextMilestone: "Continent Collector (6 regions)",
}
```

---

## 6. Monetization Ideas

### 1. **Affiliate Commissions** (Highest ROI, Easiest)
- **Skyscanner flights:** 3% per booking
- **Booking.com hotels:** 5–25% per booking
- **GetYourGuide activities:** 10% commission
- **Travel insurance:** $5–15 per policy
- **Luggage/travel gear:** 5–10% Amazon affiliate

**Expected:** ₹500–5,000 per 100 bookings

### 2. **Sponsored Content** (Medium ROI)
- Tourism boards ($500–2,000 per destination feature)
- Travel brands (luggage, cameras, apps)
- Travel insurance companies
- Hotel chains (feature their properties)

**Expected:** ₹50,000–2,00,000/month with 10K+ monthly users

### 3. **Premium Features** (Recurring Revenue)
- **Tier 1 (Free):** Browse, basic itinerary
- **Tier 2 ($2.99/month):** Ad-free, advanced filters, saved trips
- **Tier 3 ($9.99/month):** Custom itinerary generation, real-time prices, travel insurance quotes

**Expected:** 2–5% conversion rate → ₹1,000–5,000/month at 1K users

### 4. **Travel Packages** (High AOV)
- Partner with travel agencies for group discounts
- Bundle flights + hotels + activities
- Earn 10–15% commission on package sales

---

## 7. Quick Win: Immediate Actions (This Week)

### Priority 1: Data Expansion ⭐

**Action:** Expand `data/countries.js` to 50+ countries by this weekend

1. Use REST Countries API to seed base data
2. Manually add travel-specific fields for top 20 destinations
3. Commit expanded countries data

### Priority 2: Add Trending Labels

**Action:** Mark trending destinations with 2025 tags

- Add `trend` field to country data
- Display trending labels in UI
- 2–3 lines of CSS and JavaScript

### Priority 3: Detour Destinations Section

**Action:** Create simple detour cards (no backend required)

1. Add hardcoded detour pairs to `app.js`
2. Render in new section
3. Add CSS styling

**Time:** 1–2 hours

### Priority 4: Sustainability Badges

**Action:** Add `sustainability` field to countries, display 🌿 badge

1. Update data structure
2. Add CSS for `.eco-badge`
3. Filter button to show eco-conscious destinations

**Time:** 30 mins

### Priority 5: Skyscanner Integration

**Action:** Add "Search Flights" button linking to Skyscanner

```html
<a href="https://www.skyscanner.com/..." class="btn btn--primary">
  ✈️ Search Flights
</a>
```

**Time:** 15 mins

---

## Summary

### Priority Matrix

| Priority | Feature | Effort | Impact | Timeline |
|----------|---------|--------|--------|----------|
| 🔴 **HIGH** | Expand to 150+ countries | Medium | Massive (global reach) | Week 1 |
| 🔴 **HIGH** | Detour Destinations section | Low | High (trending feature) | Week 1 |
| 🔴 **HIGH** | Real-time flight prices (Skyscanner) | High | Very High (conversion ↑ 20–30%) | Week 3–4 |
| 🟡 **MEDIUM** | Mood Quiz personalization | Low | Medium (engagement ↑) | Week 2 |
| 🟡 **MEDIUM** | Passport Stamp gamification | Medium | High (retention ↑ 15–25%) | Week 2–3 |
| 🟡 **MEDIUM** | Sustainability filters | Low | Medium (eco-conscious segment) | Week 1 |
| 🟡 **MEDIUM** | Comparison tool | Medium | High (decision-making ↑) | Week 2–3 |
| 🟢 **LOW** | Set-jetting integration | Medium | Medium (niche, viral potential) | Week 3–4 |
| 🟢 **LOW** | Backend migration | High | Very High (scalability) | Week 6+ |
| 🟢 **LOW** | Community reviews (UGC) | High | High (trust, engagement) | Week 5+ |

### Next Steps

1. **This week:** Expand data, add detour section, integrate Skyscanner
2. **Next week:** Mood quiz, comparison tool, gamification setup
3. **Week 3–4:** Real-time pricing, sustainability filters, set-jetting
4. **Week 5+:** Backend migration, community features, monetization optimization

---

## Files to Update (No Core Changes)

### New Files to Create:
- `DEVELOPMENT_ROADMAP.md` (this file)
- `data/countries-expanded.json` (expanded country data)
- `data/trending-2025.json` (trending destinations)
- `scripts/generate-countries.js` (auto-generation script)

### Files to Extend (Add, Don't Replace):
- `index.html` – Add new sections
- `app.js` – Add new functions at the end
- `styles.css` – Add new CSS classes at the end

### Core Files to NOT Touch:
- `index.html` (main structure) – ✅ Safe to extend
- `app.js` (initialization) – ✅ Safe to extend
- `styles.css` (existing styles) – ✅ Safe to extend
- `service-worker.js` – ✅ Leave as-is
- `Dockerfile` – ✅ Leave as-is
- `manifest.json` – ✅ Leave as-is

---

**Author:** GitHub Copilot  
**Last Updated:** July 16, 2026  
**Status:** Ready for implementation
