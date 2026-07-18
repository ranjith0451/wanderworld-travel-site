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

  // Phase 10: Removed manual active class toggling here. 
  // The IntersectionObserver in app-motion.js now handles the .active state.
  function activateSection(key) {
    const target = routes[key];
    if (target && 'scrollIntoView' in target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        const backdrop = renderBackdrop(c, { w: 600, h: 380 });
        return `
        <article class="card" data-country="${c.id}">
          <div class="card__backdrop" style="background-image:url('${backdrop}');"></div>
          <div class="card__shine"></div>
          <div class="card__body">
            <div class="card__title">${c.flag || ''} ${c.name || ''}</div>
            <div class="card__meta">${c.region || ''} · ${activeMonth}: ${season}</div>
            <div class="card__row">
              <span class="card__pill">Low ${fmt((c.budget && c.budget.low))}</span>
              <span class="card__pill">Mid ${fmt((c.budget && c.budget.mid))}</span>
              <span class="card__pill">Lux ${fmt((c.budget && c.budget.luxury))}</span>
            </div>
            <div class="card__row" style="margin-top:10px">${(c.tags || []).map((t) => `<span class="card__pill">${t}</span>`).join('')}</div>
            <p style="margin-top:10px;color:#cbd5e1;font-size:12px">${(typeof c.visa === 'string' ? c.visa : (c.visa && c.visa.type) || '')}</p>
          </div>
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

    // Phase 6: Globe v2 Atmosphere (Fresnel Rim Glow)
    const atmosphereGeometry = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize( normalMatrix * normal );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow( 0.65 - dot( vNormal, vec3(0.0, 0.0, 1.0) ), 2.0 );
                gl_FragColor = vec4( 0.3, 0.6, 1.0, 1.0 ) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

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

  // Generative SVG backdrop
  function renderBackdrop(country, opts) {
    const o = opts || {};
    const [c1, c2, c3] = (country && country.palette) || ['#7c5cff', '#00d4ff', '#0a0e2a'];
    const w = o.w || 480;
    const h = o.h || 600;
    const seed = ((country && country.id) || 'x').replace(/[^a-z0-9]/gi, '');
    const id = `bd-${seed}-${w}x${h}`;
    const r = (n) => Math.round(n * 100) / 100;
    const cx1 = r(w * 0.78);
    const cy1 = r(h * 0.22);
    const cx2 = r(w * 0.12);
    const cy2 = r(h * 0.78);
    const moonR = r(Math.min(w, h) * 0.22);
    const blobR = r(Math.min(w, h) * 0.18);
    const ringOffset = ((country && country.id && country.id.charCodeAt(0)) || 7) % 5;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='xMidYMid slice'>
      <defs>
        <linearGradient id='bg-${id}' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='${c1}'/>
          <stop offset='0.55' stop-color='${c2}' stop-opacity='0.9'/>
          <stop offset='1' stop-color='${c3}'/>
        </linearGradient>
        <radialGradient id='glow-${id}' cx='${cx1 / w}' cy='${cy1 / h}' r='0.65'>
          <stop offset='0' stop-color='${c1}' stop-opacity='0.55'/>
          <stop offset='1' stop-color='${c1}' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='moon-${id}' cx='0.5' cy='0.5' r='0.5'>
          <stop offset='0' stop-color='${c2}' stop-opacity='0.4'/>
          <stop offset='1' stop-color='${c2}' stop-opacity='0'/>
        </radialGradient>
        <filter id='noise-${id}' x='0' y='0'>
          <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
          <feColorMatrix values='0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.06 0'/>
        </filter>
      </defs>
      <rect width='${w}' height='${h}' fill='url(#bg-${id})'/>
      <rect width='${w}' height='${h}' fill='url(#glow-${id})'/>
      <circle cx='${cx1}' cy='${cy1}' r='${moonR}' fill='url(#moon-${id})'/>
      <circle cx='${cx2}' cy='${cy2}' r='${blobR}' fill='${c3}' opacity='0.5'/>
      <path d='M0 ${r(h * 0.68)} Q ${r(w * 0.5)} ${r(h * 0.58)} ${w} ${r(h * 0.72)} L ${w} ${h} L 0 ${h} Z' fill='${c3}' opacity='0.45'/>
      <path d='M0 ${r(h * 0.82)} Q ${r(w * 0.6)} ${r(h * 0.74)} ${w} ${r(h * 0.86)} L ${w} ${h} L 0 ${h} Z' fill='${c3}' opacity='0.6'/>
      <g opacity='0.18' fill='none' stroke='white' stroke-width='0.6' stroke-linecap='round'>
        <path d='M0 ${r(h * (0.36 + ringOffset * 0.01))} Q ${r(w * 0.5)} ${r(h * (0.3 + ringOffset * 0.01))} ${w} ${r(h * (0.38 + ringOffset * 0.01))}'/>
        <path d='M0 ${r(h * (0.46 + ringOffset * 0.012))} Q ${r(w * 0.5)} ${r(h * (0.4 + ringOffset * 0.012))} ${w} ${r(h * (0.48 + ringOffset * 0.012))}'/>
      </g>
      <circle cx='${r(w * 0.5)}' cy='${r(h * 0.18)}' r='1.2' fill='white' opacity='0.5'/>
      <circle cx='${r(w * 0.62)}' cy='${r(h * 0.32)}' r='0.8' fill='white' opacity='0.4'/>
      <circle cx='${r(w * 0.34)}' cy='${r(h * 0.42)}' r='1' fill='white' opacity='0.35'/>
      <rect width='${w}' height='${h}' filter='url(#noise-${id})'/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function renderDetourDestinations() {
    const root = q('#detour-cards'); if (!root) return;
    const pairs = [
      { main: 'Barcelona', detour: 'Girona', emoji: '🏰', benefit: 'Medieval charm · ~90% fewer crowds', savings: '€30/night' },
      { main: 'Dubai', detour: 'Abu Dhabi', emoji: '🏙️', benefit: 'More authentic local culture', savings: '₹4K/night' },
      { main: 'Tokyo', detour: 'Kanazawa', emoji: '⛩️', benefit: 'Traditional temples · shorter waits', savings: '₹6K/night' },
      { main: 'Phuket', detour: 'Krabi', emoji: '🏝️', benefit: 'Same coastline · 50% fewer tourists', savings: '₹3K/night' },
      { main: 'Milan', detour: 'Brescia', emoji: '🎨', benefit: 'Renaissance charm · lower nightly cost', savings: '₹5K/night' },
      { main: 'New York', detour: 'Philadelphia', emoji: '🗽', benefit: 'Comparable museums · cheaper stays', savings: '₹15K total' },
    ];
    root.innerHTML = pairs.map((p) => `
      <article class="detour-card" role="button" tabindex="0" aria-label="Detour alternative: ${p.detour} instead of ${p.main}">
        <p class="detour-card__from">Instead of <strong>${p.main}</strong></p>
        <span class="detour-card__arrow">↓</span>
        <p class="detour-card__to">${p.emoji} ${p.detour}</p>
        <p class="detour-card__benefit">${p.benefit}</p>
        <span class="detour-card__savings">Save ${p.savings}</span>
      </article>
    `).join('');
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
      <p style="grid-column: 1/-1; text-align: center; color: var(--text-2); margin: 8px 0 14px; font-size: 14px;">
        Found <strong style="color:var(--text-0)">${filtered.length}</strong> destinations matching your style · top picks below
      </p>
      ${filtered.slice(0, 8).map((c, i) => `
        <article class="result-card" data-country="${c.id}" style="--reveal-delay:${i * 0.06}">
          <span class="result-card__match">${95 - i * 4}% match</span>
          <div class="card__title">${c.flag || ''} ${c.name || ''}</div>
          <div class="card__meta">${c.region || ''}</div>
          <div class="result-card__bar"><div class="result-card__bar-fill" style="width: ${95 - i * 4}%"></div></div>
          <div class="card__row">
            <span class="card__pill">From ${fmt(c.costs?.flights?.low || 0)}</span>
            <span class="card__pill card__pill--success">${(c.tags || [])[0] || 'Trip'}</span>
          </div>
        </article>
      `).join('')}
    `;
    requestAnimationFrame(() => {
      qa('.result-card__bar-fill', results).forEach((b) => {
        const w = b.style.width;
        b.style.width = '0';
        requestAnimationFrame(() => { b.style.width = w; });
      });
    });
    toast(`${filtered.length} destinations match your style`);
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

      const monthsName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const aBest = (a.bestMonths || []).slice(0, 3).map((m) => monthsName[m - 1]).join(', ') || 'Year-round';
      const bBest = (b.bestMonths || []).slice(0, 3).map((m) => monthsName[m - 1]).join(', ') || 'Year-round';
      const aSus = a.sustainability?.rating ?? 0;
      const bSus = b.sustainability?.rating ?? 0;
      const aFlight = a.costs?.flights?.low || 0;
      const bFlight = b.costs?.flights?.low || 0;

      const winner = (av, bv, lower = true) => {
        if (!av || !bv) return '';
        if (lower ? av < bv : av > bv) return 'winner';
        if (lower ? av > bv : av < bv) return 'winner alt';
        return '';
      };

      const pane = (cls, c, side) => `
        <div class="comparison-pane ${cls}">
          <div class="comparison-pane__head">
            <div class="comparison-pane__flag">${c.flag || ''}</div>
            <div>
              <p class="comparison-pane__name">${c.name || ''}</p>
              <p class="comparison-pane__region">${c.region || ''}</p>
            </div>
          </div>
          <div class="comparison-pane__row">
            <span>Flight (low)</span>
            <strong>${fmt(c.costs?.flights?.low || 0)} ${side === 'a' && winner(aFlight, bFlight) ? '<span class="winner">CHEAPER</span>' : ''}${side === 'b' && winner(bFlight, aFlight) ? '<span class="winner">CHEAPER</span>' : ''}</strong>
          </div>
          <div class="comparison-pane__row">
            <span>Stay / night</span>
            <strong>${fmt(c.costs?.accommodation?.budget || 0)}</strong>
          </div>
          <div class="comparison-pane__row">
            <span>Meals / day</span>
            <strong>${fmt(c.costs?.meals?.budget || 0)}</strong>
          </div>
          <div class="comparison-pane__row">
            <span>Best months</span>
            <strong>${aBest && side === 'a' ? aBest : bBest}</strong>
          </div>
          <div class="comparison-pane__row">
            <span>Currency</span>
            <strong>${c.currency || '—'}</strong>
          </div>
          <div class="comparison-pane__row">
            <span>Visa</span>
            <strong>${(typeof c.visa === 'string' ? c.visa : c.visa?.type) || 'Check'}</strong>
          </div>
          <div class="comparison-pane__row">
            <span>Eco rating</span>
            <strong>${c.sustainability?.rating ?? '—'}/5 🌿${side === 'a' && aSus > bSus ? '<span class="winner">GREENER</span>' : ''}${side === 'b' && bSus > aSus ? '<span class="winner">GREENER</span>' : ''}</strong>
          </div>
        </div>
      `;

      out.innerHTML = pane('comparison-pane--a', a, 'a') + pane('comparison-pane--b', b, 'b');
      toast(`Comparing ${a.name} and ${b.name}`);
    });
  }

  // Phase 7: Set-Jetting Cinematic Structure
  function renderSetJettingDestinations() {
    const root = q('#setjetting-cards'); if (!root) return;
    const data = getData();
    const countries = (data.countries || []).filter((c) => (c.movies || []).length > 0);
    root.innerHTML = countries.slice(0, 6).map((c) => {
      const movie = (c.movies || [])[0] || 'Unknown Title';
      // Matches the exact CSS gradient layout from Phase 7
      return `
        <article class="setjetting-card" role="button" tabindex="0" aria-label="${c.name || ''} featured in ${movie}" data-country="${c.id}">
          <p class="setjetting-card__title">${c.flag || ''} ${c.name || ''}</p>
          <p class="setjetting-card__movie">Featured in: ${movie}</p>
        </article>
      `;
    }).join('');
  }

  // Trending 2025 — horizontal scroller of curated destinations
  function renderTrendingStrip() {
    const root = q('#trending-strip'); if (!root) return;
    const data = getData();
    const countries = (data.countries || []).filter((c) => c.trending);
    if (!countries.length) { root.innerHTML = ''; return; }

    root.innerHTML = countries.map((c) => {
      const t = c.trending;
      const backdrop = renderBackdrop(c, { w: 480, h: 600 });
      const visaText = typeof c.visa === 'string' ? c.visa : (c.visa && c.visa.type) || '';
      return `
        <article class="trending-card" data-country="${c.id}" role="button" tabindex="0" aria-label="Explore ${c.name || ''}">
          <div class="trending-card__backdrop" style="background-image:url('${backdrop}');"></div>
          <div class="trending-card__scrim"></div>
          <span class="trending-card__badge">${t.badge || 'Trending'}</span>
          <div class="trending-card__body">
            <h3 class="trending-card__name">${c.flag || ''} ${c.name || ''}</h3>
            <p class="trending-card__why">${t.why || ''}</p>
            <span class="trending-card__savings">↓ ${t.savings || 'See latest fare'}</span>
            <p class="trending-card__visa">${visaText}</p>
          </div>
        </article>
      `;
    }).join('');

    qa('.trending-card', root).forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.country;
        recordCountryVisit(id);
        navigateTo('monthwise');
        toast(`Exploring ${byId(id)?.name || ''}`);
      });
    });
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
    renderTrendingStrip();
    initPassportStamps();
    wirePassportStamps();
  }

  // Keyboard accessibility for custom clickable articles (role="button")
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target;
      if (target.matches('.trending-card, .setjetting-card, .detour-card')) {
        e.preventDefault();
        target.click();
      }
    }
  });

  // Init
  renderMonthTabs();
  renderMonthCards();
  renderPolicyGrid();
  buildItinerary();
  buildBudget();
  initSearch();
  initSafeAreas();
  initPhase1();
  if (document.readyState === 'complete' || document.readyState === 'interactive') initGlobe();
  else window.addEventListener('DOMContentLoaded', initGlobe);
})();