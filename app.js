(() => {
  'use strict';

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  const toastEl = () => q('#toast');
  let toastTimer = null;
  window.toast = (msg) => {
    const el = toastEl();
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  };

  // Robust dataset access
  const getData = () => {
    try {
      return window.TRAVEL_DATA || {};
    } catch (e) {
      return {};
    }
  };

  // Scroll-based reveal animations
  function initScrollReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = qa('.reveal');
    if (!targets.length) return;

    if (prefersReduced) {
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -28px 0px' }
    );
    targets.forEach((el) => observer.observe(el));
  }

  // Hash router
  const routes = {
    home: () => q('#home-hero'),
    monthwise: () => q('#monthwise'),
    india: () => q('#india'),
    itinerary: () => q('#itinerary'),
    budget: () => q('#budget'),
    world: () => q('#world'),
    search: () => q('#search-section'),
  };

  function currentHash() {
    const h = location.hash.replace('#', '');
    return h || 'home';
  }

  function navigateTo(hash) {
    if (!routes[hash]) hash = 'home';
    location.hash = hash;
  }

  function activateSection(key) {
    Object.values(routes).forEach((el) => el && el.classList.remove('section--active'));
    const target = routes[key];
    if (target) target.classList.add('section--active');
    qa('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.target === key));
    const section = target;
    if (section && 'scrollIntoView' in section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.addEventListener('hashchange', () => activateSection(currentHash()));
  window.addEventListener('DOMContentLoaded', () => activateSection(currentHash()));

  qa('.nav-item').forEach((n) =>
    n.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(n.dataset.target);
    })
  );

  function fmt(n) {
    const value = typeof n === 'number' ? n : 0;
    return '₹' + Number(value).toLocaleString('en-IN');
  }

  // Month tabs + cards
  let activeMonth = null;

  function renderMonthTabs() {
    const root = q('#month-tabs');
    if (!root) return;
    const data = getData();
    const months = data.months || ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (!activeMonth) activeMonth = months[new Date().getMonth()] || months[0];

    root.innerHTML = months
      .map((m) => `<button class="month-chip${m === activeMonth ? ' active' : ''}" data-month="${m}">${m}</button>`)
      .join('');
    qa('.month-chip', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        activeMonth = btn.dataset.month;
        renderMonthTabs();
        renderMonthCards();
      });
    });
  }

  function renderMonthCards() {
    const root = q('#month-cards');
    if (!root) return;
    const data = getData();
    const list = data.countries || [];
    root.innerHTML = list
      .slice(0, 10)
      .map((c) => {
        const season = includeMonth(activeMonth, c.bestMonths) ? 'Best time' : 'Good time';
        return `
        <article class="card" data-country="${c.id}">
          <div class="card__title">${c.flag || ''} ${c.name || ''}</div>
          <div class="card__meta">${c.region || ''} · ${activeMonth}: ${season}</div>
          <div class="card__row">
            <span class="card__pill">Low ${fmt((c.budget && c.budget.low))}</span>
            <span class="card__pill">Mid ${fmt((c.budget && c.budget.mid))}</span>
            <span class="card__pill">Lux ${fmt((c.budget && c.budget.luxury))}</span>
          </div>
          <div class="card__row" style="margin-top:10px">${(c.tags || []).map((t) => `<span class="card__pill">${t}</span>`).join('')}</div>
          <p style="margin-top:10px;color:#cbd5e1;font-size:12px">${(typeof c.visa === 'string' ? c.visa : (c.visa && c.visa.type) || '')}</p>
        </article>
      `;
      })
      .join('');
  }

  function includeMonth(monthName, bestMonths) {
    if (!Array.isArray(bestMonths) || !bestMonths.length) return true;
    const months = getData().months || ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const idx = months.indexOf(monthName) + 1;
    return bestMonths.includes(idx);
  }

  // Policy grid
  function renderPolicyGrid() {
    const root = q('#policy-grid');
    if (!root) return;
    const data = getData();
    const list = data.countries || [];
    root.innerHTML = list
      .map((c) => {
        const visaText = typeof c.visa === 'string' ? c.visa : ((c.visa && c.visa.type) || '');
        const req = visaText;
        const items = [req, `Currency: ${c.currency || ''}`];
        return `
        <article class="policy-card" data-country="${c.id}">
          <div class="policy-card__name">${c.flag || ''} ${c.name || ''}</div>
          <div class="policy-card__status">${c.region || ''} · Best ${(c.bestMonths || []).slice(0, 3).join(', ')}</div>
          <ul class="policy-card__list">
            ${items.map((i) => `<li>${i}</li>`).join('')}
            ${(c.tags || []).map((t) => `<li>Best for: ${t}</li>`).join('')}
          </ul>
        </article>
      `;
      })
      .join('');
  }

  // Itinerary
  function buildItinerary() {
    const destSel = q('#itinerary-destination');
    const daysSel = q('#itinerary-days');
    const out = q('#itinerary-output');
    const btn = q('#generate-itinerary');
    if (!destSel || !daysSel || !out) return;
    const data = getData();

    if (!destSel.children.length) {
      (data.countries || []).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.flag || ''} ${c.name || ''}`;
        destSel.appendChild(opt);
      });
    }

    btn.addEventListener('click', () => {
      const c = byId(destSel.value);
      const days = parseInt(daysSel.value, 10);
      if (!c) return toast('Pick a destination first');
      const plan = (c.itinerary && c.itinerary[String(days)]) || (c.itinerary && c.itinerary[Object.keys(c.itinerary)[0]]);
      if (!plan) return toast('No itinerary for selected days');
      out.innerHTML = `<div class="timeline">${plan.map((st) => `
        <div class="timeline__item">
          <div class="timeline__dot"></div>
          <div class="timeline__content">
            <p class="timeline__title">Day ${st.day} · ${st.title}</p>
            <p class="timeline__desc">${(st.items || []).join(' · ')}</p>
          </div>
        </div>
      `).join('')}</div>`;
      toast(`${c.name || ''} ${days}-day itinerary ready`);
    });
  }

  // Budget
  function buildBudget() {
    const destSel = q('#budget-destination');
    const out = q('#budget-output');
    const btn = q('#estimate-budget');
    if (!destSel || !out) return;
    const data = getData();

    if (!destSel.children.length) {
      (data.countries || []).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.flag || ''} ${c.name || ''}`;
        destSel.appendChild(opt);
      });
    }

    btn.addEventListener('click', () => {
      const c = byId(destSel.value);
      const tier = q('#budget-tier')?.value || 'mid';
      const travelers = parseInt((q('#budget-travelers')?.value) || '1', 10);
      if (!c) return toast('Pick a destination first');
      const band = (c.budget && c.budget[tier]) || (c.budget && c.budget.mid) || 0;
      const flight = Math.round(band * 0.45);
      const stay = Math.round(band * 0.28);
      const food = Math.round(band * 0.15);
      const local = Math.round(band * 0.08);
      const misc = Math.round(band * 0.04);
      const total = band * travelers;

      const card = (label, value) =>
        `<div class="budget-card"><p class="budget-card__label">${label}</p><p class="budget-card__value">${fmt(value)}</p></div>`;

      out.innerHTML = `${['Flight approx', 'Hotel/stay', 'Food', 'Local commute', 'Misc / buffer']
        .map((label, i) => card(label, travelers * [flight, stay, food, local, misc][i]))
        .join('')}<div class="budget-cards">${card(`${travelers} traveller${travelers > 1 ? 's' : ''} · Total`, total)}</div>`;
      toast(`Estimated trip budget for ${c.name || ''}`);
    });
  }

  // Search
  function doSearch(query) {
    const qLower = (query || '').toLowerCase();
    const nodes = qa('[data-country]');
    const data = getData();
    const results = nodes.filter((node) => {
      const c = byId(node.dataset.country);
      if (!c) return false;
      const visaText = typeof c.visa === 'string' ? c.visa : ((c.visa && c.visa.type) || '');
      return [c.name, c.region, visaText, c.currency, ...(c.tags || [])].join(' ').toLowerCase().includes(qLower);
    });
    const list = q('#search-results');
    const overlayList = q('#overlay-results');
    const render = (container) => {
      if (!container) return;
      if (!qLower) { container.innerHTML = ''; return; }
      container.innerHTML = results
        .map((node) => {
          const c = byId(node.dataset.country);
          return `<div class="search-item" data-country="${c.id}"><p class="search-item__title">${c.flag || ''} ${c.name || ''}</p><p class="search-item__desc">${c.region || ''} · ${(typeof c.visa === 'string' ? c.visa : (c.visa && c.visa.type) || '')}</p></div>`;
        })
        .join('');
    };
    render(list);
    render(overlayList);

    const listen = (root) => {
      if (!root) return;
      qa('.search-item', root).forEach((item) => {
        item.onclick = () => {
          const c = byId(item.dataset.country);
          navigateTo('monthwise');
          toast(`Opened ${c.name || ''}`);
        };
      });
    };
    listen(list);
    listen(overlayList);
  }

  function initSearch() {
    const input = q('#search-input');
    const overlayInput = q('#overlay-search-input');
    const overlay = q('#search-overlay');
    const openBtn = q('#search-trigger');
    const closeBtn = q('#close-search');

    input?.addEventListener('input', (e) => doSearch(e.target.value));
    input?.addEventListener('focus', () => { if (input.value.trim()) doSearch(input.value); });
    overlayInput?.addEventListener('input', (e) => doSearch(e.target.value));
    openBtn?.addEventListener('click', () => overlay?.classList.add('open'));
    closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  }

  // Globe
  function initGlobe() {
    const container = q('#hero-globe');
    const canvas = q('#world-canvas');
    const tooltip = q('#world-tooltip');
    const target = container || canvas;
    if (!target || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    let cam;
    if (target === canvas) {
      const { clientWidth: w = target.clientWidth, clientHeight: h = target.clientHeight } = target.getBoundingClientRect();
      renderer.setSize(w, h, false);
      cam = new THREE.PerspectiveCamera(48, (w || 800) / Math.max(h || 500, 1), 0.2, 60);
      cam.position.set(0, 0.6, 3.2);
    } else {
      const rect = target.getBoundingClientRect();
      const w = rect.width || 320;
      const h = rect.height || 180;
      renderer.setSize(w, h, false);
      cam = new THREE.PerspectiveCamera(50, w / Math.max(h, 1), 0.2, 40);
      cam.position.set(0, 0.15, 1.8);
    }
    scene.add(cam);
    scene.add(new THREE.DirectionalLight('#ffffff', 1.0));
    scene.add(new THREE.AmbientLight('#b1c6ff', 0.6));
    scene.children[0].position.set(5, 3, 5);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ color: '#12395a', emissive: '#02101d', transparent: true, opacity: 0.92 })
    );
    scene.add(globe);
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.005, 36, 24),
      new THREE.MeshBasicMaterial({ color: '#7ef7ff', wireframe: true, transparent: true, opacity: 0.14 })
    ));

    const dotMat = new THREE.MeshBasicMaterial({ color: '#ffcf7f' });
    (getData().countries || []).forEach((c) => {
      if (!c.coordinates) return;
      const { lat, lng } = c.coordinates;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = 1.012;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), dotMat);
      dot.position.set(x, y, z);
      dot.userData = { countryId: c.id };
      globe.add(dot);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    function setPointer(event) {
      const rect = (target === canvas ? canvas : container).getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    target.addEventListener('pointermove', (event) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, cam);
      const hits = raycaster.intersectObjects(globe.children, true);
      const dotHit = hits.find((h) => !!h.object.userData?.countryId);
      if (dotHit) {
        const c = byId(dotHit.object.userData.countryId);
        if (tooltip && c) { tooltip.textContent = `${c.flag || ''} ${c.name || ''}\n${c.region || ''}`; tooltip.classList.add('visible'); }
      } else if (tooltip) tooltip.classList.remove('visible');
    });

    target.addEventListener('click', (event) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, cam);
      const hits = raycaster.intersectObjects(globe.children, true);
      const dotHit = hits.find((h) => !!h.object.userData?.countryId);
      if (dotHit) {
        const c = byId(dotHit.object.userData.countryId);
        const title = document.querySelector(`[data-country="${c.id}"] .card__title`);
        if (title && 'scrollIntoView' in title) title.scrollIntoView({ behavior: 'smooth' });
        navigateTo('monthwise');
        toast(`Scrolled to ${c.name || ''}`);
      }
    });

    function resize() {
      const rect = (target === canvas ? canvas : container).getBoundingClientRect();
      const w = rect.width || 320;
      const h = rect.height || 180;
      renderer.setSize(w, h, false);
      if (cam.isPerspectiveCamera) cam.aspect = w / Math.max(h, 1);
      cam.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const delta = clock.getDelta();
      globe.rotation.y += 0.18 * delta;
      const t = performance.now() / 1000;
      globe.rotation.x = Math.sin(t * 0.22) * 0.12;
      renderer.render(scene, cam);
    })();
    resize();
  }

  // Safe areas
  function initSafeAreas() {
    if (!q('#toast')) return;
    const update = () => {
      const inset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom') || '16', 10);
      toastEl().style.bottom = `calc(84px + ${inset}px)`;
    };
    update();
    window.addEventListener('resize', update);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', update);
  }

  function byId(id) {
    const list = (getData().countries) || [];
    return list.find((c) => c.id === id);
  }

  function renderDetourDestinations() {
    const root = q('#detour-cards'); if (!root) return;
    root.innerHTML = `
      <article class="detour-card"><p class="detour-card__from">Instead of <strong>Barcelona</strong></p><p class="detour-card__to">🏰 Girona</p><p class="detour-card__benefit">Medieval charm, ~90% fewer crowds</p></article>
      <article class="detour-card"><p class="detour-card__from">Instead of <strong>Dubai</strong></p><p class="detour-card__to">🏙️ Abu Dhabi</p><p class="detour-card__benefit">More authentic local culture</p></article>
      <article class="detour-card"><p class="detour-card__from">Instead of <strong>Tokyo</strong></p><p class="detour-card__to">⛩️ Kanazawa</p><p class="detour-card__benefit">Traditional temples with shorter waits</p></article>
      <article class="detour-card"><p class="detour-card__from">Instead of <strong>Phuket</strong></p><p class="detour-card__to">🏝️ Krabi</p><p class="detour-card__benefit">Similar coastline · 50% fewer tourists</p></article>
      <article class="detour-card"><p class="detour-card__from">Instead of <strong>Milan</strong></p><p class="detour-card__to">🎨 Brescia</p><p class="detour-card__benefit">Renaissance charm · lower nightly cost</p></article>
      <article class="detour-card"><p class="detour-card__from">Instead of <strong>New York</strong></p><p class="detour-card__to">🗽 Philadelphia</p><p class="detour-card__benefit">Comparable museums · cheaper stays</p></article>
    `;
  }

  function initMoodQuiz() {
    const form = q('#mood-quiz-form'); if (!form) return;
    form.addEventListener('submit', (e) => { e.preventDefault(); const mood = new FormData(form).get('mood'); applyMoodFilter(mood); });
  }

  function applyMoodFilter(mood) {
    const data = getData();
    const filters = {
      beach: c => (c.tags || []).some(t => /beach/i.test(t)),
      culture: c => (c.tags || []).some(t => /heritage|culture|history/i.test(t)),
      adventure: c => (c.tags || []).some(t => /adventure|hiking|safari/i.test(t)),
      budget: c => (c.costs?.flights?.low || 99999) < 40000,
      eco: c => (c.sustainability?.rating || 0) >= 3.5
    };
    const filtered = (data.countries || []).filter(filters[mood] || (() => true));
    const results = q('#quiz-results'); if (!results) return;
    results.innerHTML = `
      <p style="text-align: center; color: #cbd5e1; margin-bottom: 14px;">Found ${filtered.length} destinations for you!</p>
      ${filtered.slice(0, 8).map((c) => `
        <article class="card" data-country="${c.id}">
          <div class="card__title">${c.flag || ''} ${c.name || ''}</div>
          <div class="card__meta">${c.region || ''}</div>
          <div class="card__row"><span class="card__pill">Low ${fmt(c.costs?.flights?.low || 0)}</span><span class="card__pill">Mid ${fmt(c.costs?.flights?.mid || 0)}</span></div>
        </article>
      `).join('')}
    `;
    toast(`Found ${filtered.length} destinations matching your style`);
  }

  function initComparisonTool() {
    const c1Sel = q('#compare-country-1');
    const c2Sel = q('#compare-country-2');
    const btn = q('#compare-btn');
    const data = getData();
    if (!c1Sel || !c2Sel || !btn) return;
    [c1Sel, c2Sel].forEach((sel) => {
      (data.countries || []).forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.flag || ''} ${c.name || ''}`;
        sel.appendChild(opt);
      });
    });
    btn.addEventListener('click', () => {
      const a = byId(c1Sel.value);
      const b = byId(c2Sel.value);
      if (!a || !b) return toast('Select two destinations to compare');
      const out = q('#comparison-result'); if (!out) return;
      out.innerHTML = `
        <table style="width:100%;border-collapse:collapse;border:1px solid var(--border);color:var(--text);">
          <tr><td><strong>Metric</strong></td><td><strong>${a.flag} ${a.name}</strong></td><td><strong>${b.flag} ${b.name}</strong></td></tr>
          <tr><td>Low flight</td><td>${fmt(a.costs?.flights?.low || 0)}</td><td>${fmt(b.costs?.flights?.low || 0)}</td></tr>
          <tr><td>Best months</td><td>${(a.bestMonths || []).slice(0, 3).join(', ') || 'Year-round'}</td><td>${(b.bestMonths || []).slice(0, 3).join(', ') || 'Year-round'}</td></tr>
          <tr><td>Visa</td><td>${a.visa?.type || 'Confirm requirements'}</td><td>${b.visa?.type || 'Confirm requirements'}</td></tr>
          <tr><td>Region</td><td>${a.region}</td><td>${b.region}</td></tr>
          <tr><td>Sustainability</td><td>${a.sustainability?.rating ?? 'N/A'}/5 🌿</td><td>${b.sustainability?.rating ?? 'N/A'}/5 🌿</td></tr>
        </table>
      `;
      toast(`Comparing ${a.name} and ${b.name}`);
    });
  }

  function renderSetJettingDestinations() {
    const root = q('#setjetting-cards'); if (!root) return;
    root.innerHTML = (getData().countries || [])
      .filter((c) => (c.movies || []).length > 0)
      .slice(0, 10)
      .map((c) => `<article class="setjetting-card"><p class="setjetting-card__title">${c.flag || ''} ${c.name || ''}</p><p class="setjetting-card__movie">Featured in: ${(c.movies || []).slice(0, 2).join(', ')}</p></article>`)
      .join('');
  }

  function recordCountryVisit(countryId) {
    if (!countryId) return;
    const key = 'wanderworld_passport_stamps';
    const stamps = JSON.parse(localStorage.getItem(key) || '[]');
    if (!stamps.includes(countryId)) { stamps.push(countryId); localStorage.setItem(key, JSON.stringify(stamps)); }
  }

  function initPassportStamps() {
    const key = 'wanderworld_passport_stamps';
    const stamps = JSON.parse(localStorage.getItem(key) || '[]');
    if (!stamps.length) return;
    if (stamps.length >= 10) toast('🏆 Globetrotter! You have explored 10+ destinations.');
  }

  function wirePassportStamps() {
    qa('.card[data-country]').forEach((card) => {
      card.addEventListener('click', () => recordCountryVisit(card.dataset.country));
    });
  }

  function initPhase1() {
    renderDetourDestinations();
    initMoodQuiz();
    initComparisonTool();
    renderSetJettingDestinations();
    initPassportStamps();
    wirePassportStamps();
  }

  // Init
  renderMonthTabs();
  renderMonthCards();
  renderPolicyGrid();
  buildItinerary();
  buildBudget();
  initSearch();
  initSafeAreas();
  initScrollReveal();
  initPhase1();
  if (document.readyState === 'complete' || document.readyState === 'interactive') initGlobe();
  else window.addEventListener('DOMContentLoaded', initGlobe);
})();