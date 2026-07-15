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
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  };

  const months = (window.TRAVEL_DATA && window.TRAVEL_DATA.months) || ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const country = (id) => {
    const list = (window.TRAVEL_DATA && window.TRAVEL_DATA.countries) || [];
    return list.find((c) => c.id === id);
  };

  // Hash router ---------------------------------------------------------------
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

  // Helpers -------------------------------------------------------------------
  function fmt(n) {
    return '₹' + Number(n || 0).toLocaleString('en-IN');
  }

  function seasonLabel(monthName, bestMonths) {
    if (!bestMonths || !bestMonths.length) return 'Good time';
    const idx = months.indexOf(monthName) + 1;
    return bestMonths.includes(idx) ? 'Best time' : 'Good time';
  }

  // Month tabs + cards --------------------------------------------------------
  let activeMonth = months[new Date().getMonth()] || months[0];

  function renderMonthTabs() {
    const root = q('#month-tabs');
    if (!root) return;
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
    const list = (window.TRAVEL_DATA && window.TRAVEL_DATA.countries) || [];
    const blr = (window.TRAVEL_DATA && window.TRAVEL_DATA.blr_monthwise) || [];

    const wanted = list
      .map((c) => ({ ...c, season: seasonLabel(activeMonth, c.bestMonths) }))
      .filter((c) => c.season !== 'Low season' || c.season === 'Good time')
      .slice(0, 8);

    root.innerHTML = wanted
      .map(
        (c) => `
      <article class="card" data-country="${c.id}">
        <div class="card__title">${c.flag || ''} ${c.name}</div>
        <div class="card__meta">${c.region || ''} · ${activeMonth}: ${seasonLabel(activeMonth, c.bestMonths)}</div>
        <div class="card__row">
          <span class="card__pill">Low ${fmt(c.budget && c.budget.low)}</span>
          <span class="card__pill">Mid ${fmt(c.budget && c.budget.mid)}</span>
          <span class="card__pill">Lux ${fmt(c.budget && c.budget.luxury)}</span>
        </div>
        <div class="card__row" style="margin-top:10px">
          ${(c.tags || []).map((t) => `<span class="card__pill">${t}</span>`).join('')}
        </div>
        <p style="margin-top:10px;color:#cbd5e1;font-size:12px">${c.visa || ''}</p>
      </article>
    `
      )
      .join('');
  }

  // India + immigration policies -----------------------------------------------
  function renderPolicyGrid() {
    const root = q('#policy-grid');
    if (!root) return;
    const list = (window.TRAVEL_DATA && window.TRAVEL_DATA.countries) || [];
    root.innerHTML = list
      .map((c) => {
        const req = c.id === 'in_goa' ? 'Domestic; no visa required.' : (c.visa || '');
        const items = [req, `Currency: ${(c.currency || '')}`];
        return `
        <article class="policy-card" data-country="${c.id}">
          <div class="policy-card__name">${c.flag || ''} ${c.name}</div>
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

  // Itinerary ------------------------------------------------------------------
  function buildItinerary() {
    const destSel = q('#itinerary-destination');
    const daysSel = q('#itinerary-days');
    const out = q('#itinerary-output');
    const btn = q('#generate-itinerary');
    if (!destSel || !daysSel || !out) return;

    if (!destSel.children.length) {
      const list = (window.TRAVEL_DATA && window.TRAVEL_DATA.countries) || [];
      list.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.flag || ''} ${c.name}`;
        destSel.appendChild(opt);
      });
    }

    btn.addEventListener('click', () => {
      const c = country(destSel.value);
      const days = parseInt(daysSel.value, 10);
      if (!c || !c.itinerary) return toast('Pick a destination first');
      const plan = c.itinerary[String(days)] || c.itinerary[Object.keys(c.itinerary)[0]];
      if (!plan) return toast('No itinerary for selected days');
      out.innerHTML = `<div class="timeline">${plan
        .map(
          (st) => `
        <div class="timeline__item">
          <div class="timeline__dot"></div>
          <div class="timeline__content">
            <p class="timeline__title">Day ${st.day} · ${st.title}</p>
            <p class="timeline__desc">${(st.items || []).join(' · ')}</p>
          </div>
        </div>
      `
        )
        .join('')}</div>`;
      toast(`${c.name} ${days}-day itinerary ready`);
    });
  }

  // Budget estimator ----------------------------------------------------------
  function buildBudget() {
    const destSel = q('#budget-destination');
    const out = q('#budget-output');
    const btn = q('#estimate-budget');
    if (!destSel || !out) return;

    if (!destSel.children.length) {
      const list = (window.TRAVEL_DATA && window.TRAVEL_DATA.countries) || [];
      list.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.flag || ''} ${c.name}`;
        destSel.appendChild(opt);
      });
    }

    btn.addEventListener('click', () => {
      const c = country(destSel.value);
      const tier = q('#budget-tier')?.value || 'mid';
      const travelers = parseInt((q('#budget-travelers')?.value) || '1', 10);
      if (!c || !c.budget) return toast('Pick a destination first');
      const band = c.budget[tier] || c.budget.mid || 0;
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
      toast(`Estimated trip budget for ${c.name}`);
    });
  }

  // Search overlay / in-page search -------------------------------------------
  function doSearch(query) {
    const qLower = (query || '').toLowerCase();
    const nodes = qa('[data-country]');
    const results = nodes.filter((node) => {
      const c = country(node.dataset.country);
      if (!c) return false;
      return [c.name, c.region, c.visa, c.currency, ...(c.tags || [])].join(' ').toLowerCase().includes(qLower);
    });
    const list = q('#search-results');
    const overlayList = q('#overlay-results');
    const render = (container) => {
      if (!container) return;
      if (!qLower) { container.innerHTML = ''; return; }
      container.innerHTML = results
        .map((node) => {
          const c = country(node.dataset.country);
          return `<div class="search-item" data-country="${c.id}"><p class="search-item__title">${c.flag || ''} ${c.name}</p><p class="search-item__desc">${c.region || ''} · ${c.visa || ''}</p></div>`;
        })
        .join('');
    };
    render(list);
    render(overlayList);

    const listen = (root) => {
      if (!root) return;
      qa('.search-item', root).forEach((item) => {
        item.onclick = () => {
          const c = country(item.dataset.country);
          navigateTo('monthwise');
          toast(`Opened ${c.name}`);
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
    input?.addEventListener('focus', () => {
      if (input.value.trim()) doSearch(input.value);
    });

    overlayInput?.addEventListener('input', (e) => doSearch(e.target.value));
    openBtn?.addEventListener('click', () => overlay?.classList.add('open'));
    closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  }

  // World explorer + 3D globe -------------------------------------------------
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
      cam = new THREE.PerspectiveCamera(48, (w || 800) / (h || 500), 0.2, 60);
      cam.position.set(0, 0.6, 3.2);
    } else {
      const rect = target.getBoundingClientRect();
      const w = rect.width || 320;
      const h = rect.height || 180;
      renderer.setSize(w, h, false);
      cam = new THREE.PerspectiveCamera(50, w / h, 0.2, 40);
      cam.position.set(0, 0.15, 1.8);
    }
    scene.add(cam);
    const light = new THREE.DirectionalLight('#ffffff', 1.0);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight('#b1c6ff', 0.6));

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: '#12395a',
      emissive: '#02101d',
      flatShading: false,
      transparent: true,
      opacity: 0.92,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const wireGeo = new THREE.SphereGeometry(1.005, 36, 24);
    const wireMat = new THREE.MeshBasicMaterial({ color: '#7ef7ff', wireframe: true, transparent: true, opacity: 0.15 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globe.add(wireMesh);

    const dotMat = new THREE.MeshBasicMaterial({ color: '#ffcf7f' });
    const list = (window.TRAVEL_DATA && window.TRAVEL_DATA.countries) || [];
    list.forEach((c) => {
      if (!c.coordinates) return;
      const phi = (90 - c.coordinates.lat) * (Math.PI / 180);
      const theta = (c.coordinates.lng + 180) * (Math.PI / 180);
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
      if (target === canvas || target === container) {
        raycaster.setFromCamera(pointer, cam);
        const hits = raycaster.intersectObjects(globe.children, true);
        const dotHit = hits.find((h) => !!h.object.userData?.countryId);
        if (dotHit) {
          const c = country(dotHit.object.userData.countryId);
          if (tooltip && c) {
            tooltip.textContent = `${c.flag || ''} ${c.name}\n${c.region || ''}`;
            tooltip.classList.add('visible');
          }
        } else if (tooltip) tooltip.classList.remove('visible');
      }
    });

    target.addEventListener('click', (event) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, cam);
      const hits = raycaster.intersectObjects(globe.children, true);
      const dotHit = hits.find((h) => !!h.object.userData?.countryId);
      if (dotHit) {
        const c = country(dotHit.object.userData.countryId);
        const cardTitle = document.querySelector(`[data-country="${c.id}"] .card__title`);
        if (cardTitle && 'scrollIntoView' in cardTitle) cardTitle.scrollIntoView({ behavior: 'smooth' });
        navigateTo('monthwise');
        toast(`Scrolled to ${c.name}`);
      }
    });

    const clock = new THREE.Clock();
    function resize() {
      const rect = (target === canvas ? canvas : container).getBoundingClientRect();
      const w = rect.width || 320;
      const h = rect.height || 180;
      renderer.setSize(w, h, false);
      if (cam.isPerspectiveCamera) cam.aspect = w / Math.max(h, 1);
      cam.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    function loop() {
      requestAnimationFrame(loop);
      const delta = clock.getDelta();
      globe.rotation.y += 0.15 * delta;
      const t = performance.now() / 1000;
      globe.rotation.x = Math.sin(t * 0.25) * 0.12;
      renderer.render(scene, cam);
    }
    resize();
    loop();
  }

  // Mobile nav collision with toast -------------------------------------------
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

  // Init ----------------------------------------------------------------------
  renderMonthTabs();
  renderMonthCards();
  renderPolicyGrid();
  buildItinerary();
  buildBudget();
  initSearch();
  initSafeAreas();
  if (document.readyState === 'complete' || document.readyState === 'interactive') initGlobe();
  else window.addEventListener('DOMContentLoaded', initGlobe);

  window.addEventListener('resize', () => {});
})();
