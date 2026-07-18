/* ==========================================================================
   WanderWorld 3D — Premium Motion Layer
   Preloader · Lenis smooth scroll · GSAP reveals · magnetic · cursor · parallax
   Phases 4, 5, 8, 10 Integrated.
   Loaded after app.js. Self-contained, no build step.
   ========================================================================== */
(() => {
  'use strict';

  const q = (sel, ctx = document) => ctx.querySelector(sel);
  const qa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ---------------------------------------------------------------------------
  // 1. Preloader
  // ---------------------------------------------------------------------------
  function initPreloader() {
    const el = q('.preloader');
    if (!el) return;
    const minDuration = 700;
    const start = performance.now();

    const done = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        el.classList.add('is-done');
        setTimeout(() => el.remove(), 700);
        document.body.classList.add('is-ready');
        window.dispatchEvent(new CustomEvent('ww:ready'));
      }, wait);
    };

    if (document.readyState === 'complete') done();
    else window.addEventListener('load', done, { once: true });
  }

  // ---------------------------------------------------------------------------
  // 2. Lenis smooth scroll (lazy-load if available, else fallback)
  // ---------------------------------------------------------------------------
  let lenisInstance = null;
  function initLenis() {
    if (prefersReduced()) return;
    if (typeof window.Lenis !== 'function') {
      // Lenis not loaded — fall back to native smooth scroll
      document.documentElement.style.scrollBehavior = 'smooth';
      return;
    }
    lenisInstance = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.4,
      wheelMultiplier: 1.0,
    });

    // RAF loop
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Anchor links via Lenis
    qa('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = q(href);
        if (target) {
          e.preventDefault();
          lenisInstance.scrollTo(target, { offset: -20, duration: 1.4 });
        }
      });
    });

    // Expose
    window.__lenis = lenisInstance;
  }

  // ---------------------------------------------------------------------------
  // 3. Scroll reveal (GSAP if available, else vanilla)
  // ---------------------------------------------------------------------------
  function initReveals() {
    const targets = qa('.reveal');
    if (!targets.length) return;

    if (prefersReduced()) {
      targets.forEach((el) => el.classList.add('visible'));
      return;
    }

    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);

      // Set initial state (CSS already does opacity 0; GSAP just staggers)
      window.gsap.utils.toArray('.reveal').forEach((el, i) => {
        window.gsap.fromTo(
          el,
          { autoAlpha: 0, y: 32, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'expo.out',
            delay: (el.dataset.revealDelay || 0) * 1,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Stagger child reveals
      qa('[data-stagger]').forEach((parent) => {
        const kids = parent.children;
        window.gsap.fromTo(
          kids,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'expo.out',
            stagger: 0.08,
            scrollTrigger: { trigger: parent, start: 'top 85%' },
          }
        );
      });
    } else {
      // Fallback: IntersectionObserver
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
      targets.forEach((el) => io.observe(el));
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Magnetic buttons
  // ---------------------------------------------------------------------------
  function initMagnetic() {
    if (isTouch() || prefersReduced()) return;
    const items = qa('.btn, .icon-btn, .brand');
    items.forEach((el) => {
      const strength = el.classList.contains('brand') ? 4 : 10;
      let raf = null;
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x / (40 / strength)}px, ${y / (40 / strength)}px)`;
        });
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = '';
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      el.addEventListener('pointerdown', onLeave);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Custom cursor (desktop only)
  // ---------------------------------------------------------------------------
  function initCursor() {
    if (isTouch() || prefersReduced()) return;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('has-custom-cursor');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; });

    (function loop() {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();

    // Hover state
    const hoverable = 'a, button, .btn, .icon-btn, .card, .quiz-option, .month-chip, .trending-card, .nav-item, [role="button"], input, select, label, .detour-card, .setjetting-card';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest && e.target.closest(hoverable)) ring.classList.add('is-hover');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest && e.target.closest(hoverable)) ring.classList.remove('is-hover');
    });
    document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
  }

  // ---------------------------------------------------------------------------
  // 6. Card 3D tilt + cursor-tracked shine
  // ---------------------------------------------------------------------------
  function initCardTilt() {
    if (isTouch() || prefersReduced()) return;
    const cards = qa('.card, .trending-card, .detour-card, .setjetting-card, .policy-card, .result-card');
    cards.forEach((card) => {
      let raf = null;
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x / rect.width - 0.5) * 2;
        const py = (y / rect.height - 0.5) * 2;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateX(${-py * 4}deg) rotateY(${px * 4}deg) translateY(-3px)`;
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
        });
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      };
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Header scroll state
  // ---------------------------------------------------------------------------
  function initHeaderScroll() {
    const header = q('.app-shell__header');
    if (!header) return;
    const update = () => {
      if (window.scrollY > 20) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // 8. Number counters (hero meta)
  // ---------------------------------------------------------------------------
  function initCounters() {
    const counters = qa('[data-counter]');
    if (!counters.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      const decimals = (el.dataset.counter.split('.')[1] || '').length;
      const dur = 1600;
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = (target * eased).toFixed(decimals);
        el.textContent = val + (el.dataset.suffix || '');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------------------------
  // 9. Hero parallax (mouse-tracked)
  // ---------------------------------------------------------------------------
  function initHeroParallax() {
    if (isTouch() || prefersReduced()) return;
    const hero = q('.hero');
    if (!hero) return;
    const target = q('.hero__inner');
    if (!target) return;

    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      target.style.transform = `translate3d(${x * 12}px, ${y * 8}px, 0)`;
    });
    hero.addEventListener('pointerleave', () => { target.style.transform = ''; });
  }

  // ---------------------------------------------------------------------------
  // 10. Hero title split-in (if GSAP)
  // ---------------------------------------------------------------------------
  function initHeroTitle() {
    if (prefersReduced()) {
      qa('.hero__title .line span').forEach((s) => (s.style.transform = 'none'));
      return;
    }
    if (typeof window.gsap === 'undefined') {
      // CSS keyframe fallback
      qa('.hero__title .line span').forEach((s, i) => {
        s.style.transition = 'transform 900ms cubic-bezier(0.16, 1, 0.3, 1)';
        s.style.transitionDelay = `${200 + i * 80}ms`;
        s.style.transform = 'none';
      });
      return;
    }
    // Use ScrollTrigger for hero (so it doesn't fire before Lenis is ready)
    const tl = window.gsap.timeline({ delay: 0.3 });
    tl.to('.hero__title .line span', {
      yPercent: 0,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.08,
    })
      .from('.hero__eyebrow', { y: 16, autoAlpha: 0, duration: 0.6, ease: 'expo.out' }, 0.1)
      .from('.hero__sub', { y: 16, autoAlpha: 0, duration: 0.6, ease: 'expo.out' }, 0.4)
      .from('.hero__actions .btn', { y: 16, autoAlpha: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08 }, 0.55)
      .from('.hero__meta-item', { y: 16, autoAlpha: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08 }, 0.7)
      .from('.hero__floaty', { scale: 0.6, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.4)', stagger: 0.1 }, 0.9);
  }

  // ---------------------------------------------------------------------------
  // 11. Nav active indicator (auto-update from scroll position)
  // ---------------------------------------------------------------------------
  function initNavSpy() {
    // Support both legacy IDs and Phase 8/10 data-chapter attributes
    const sections = qa('section[id], [data-chapter]');
    const navItems = qa('.nav-item, .bottom-nav a');
    if (!navItems.length || !sections.length) return;

    const onScroll = () => {
      const y = window.scrollY + 120;
      let activeId = sections[0].id;
      sections.forEach((sec) => {
        if (sec.offsetTop <= y) activeId = sec.id;
      });
      
      navItems.forEach((n) => {
        const href = n.getAttribute('href');
        const target = n.dataset.target;
        const isActive = (href === `#${activeId}`) || (target === activeId) || (target === activeId.replace('-hero', ''));
        n.classList.toggle('active', isActive);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------------------------------------------------------------------------
  // 12. Trending strip — manual drag for non-Lenis/non-GSAP fallback
  // ---------------------------------------------------------------------------
  function initDragScroll() {
    // Let GSAP Phase 5 handle the pinned scroll if it exists
    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') return;
    if (typeof window.__lenis !== 'undefined') return; // Lenis handles it
    
    qa('.trending-strip').forEach((strip) => {
      let isDown = false, startX = 0, scrollLeft = 0;
      strip.addEventListener('pointerdown', (e) => {
        isDown = true; startX = e.pageX - strip.offsetLeft; scrollLeft = strip.scrollLeft;
        strip.style.cursor = 'grabbing';
      });
      strip.addEventListener('pointerleave', () => { isDown = false; strip.style.cursor = ''; });
      strip.addEventListener('pointerup', () => { isDown = false; strip.style.cursor = ''; });
      strip.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - strip.offsetLeft;
        strip.scrollLeft = scrollLeft - (x - startX) * 1.2;
      });
    });
  }

  // ===========================================================================
  // PREMIUM PHASES (4, 5, 8, 10) - ELEVATION PLAN IMPLEMENTATION
  // ===========================================================================

  function initPremiumPhases() {
    const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    
    // -----------------------------------------------------------------------
    // Phase 4: Hero Mask Reveal & Parallax
    // -----------------------------------------------------------------------
    if (hasGsap && !prefersReduced()) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      const heroTitle = q('.hero-title, .section__title');
      if (heroTitle) {
        window.gsap.fromTo(heroTitle, 
          { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 20 },
          { 
            clipPath: 'inset(0% 0% 0% 0%)', 
            yPercent: 0, 
            duration: 1.2, 
            ease: 'power4.out', 
            delay: 0.5,
            scrollTrigger: {
              trigger: heroTitle,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
      
      const heroOrbit = q('.hero-orbit');
      if (heroOrbit) {
        window.gsap.to(heroOrbit, {
          yPercent: -30, 
          ease: 'none',
          scrollTrigger: { 
            trigger: '#hero', 
            start: 'top top', 
            end: 'bottom top', 
            scrub: true 
          }
        });
      }

      // -----------------------------------------------------------------------
      // Phase 5: Pinned Horizontal Scroll (Trending 2025)
      // -----------------------------------------------------------------------
      const strip = q('#trending-2025 .trending-strip');
      const trendingSection = q('#trending-2025');
      if (strip && trendingSection) {
        const getScrollAmount = () => {
          let stripWidth = strip.scrollWidth;
          return -(stripWidth - window.innerWidth);
        };
        
        const tween = window.gsap.to(strip, { 
          x: getScrollAmount, 
          duration: 2, 
          ease: 'none' 
        });
        
        window.ScrollTrigger.create({
          trigger: trendingSection,
          start: 'top top',
          end: () => `+=${getScrollAmount() * -1}`,
          pin: true,
          animation: tween,
          scrub: 1,
          invalidateOnRefresh: true
        });
      }
    }

    // -----------------------------------------------------------------------
    // Phase 8: Color Theme Scrub & Phase 10: Bottom Nav Sync
    // -----------------------------------------------------------------------
    const themeSections = qa('[data-chapter]');
    if (themeSections.length) {
      const root = document.documentElement;
      
      // Phase 8: Color Theme
      const themeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const hue = entry.target.getAttribute('data-chapter-hue');
            if (hue) root.style.setProperty('--chapter-hue', hue);
          }
        });
      }, { threshold: 0.5 });
      themeSections.forEach(sec => themeObserver.observe(sec));

      // Phase 10: Bottom Nav Active Sync
      const navLinks = qa('.bottom-nav a');
      if (navLinks.length) {
        const navObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
              });
            }
          });
        }, { threshold: 0.5 });
        themeSections.forEach(sec => navObserver.observe(sec));
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 13. Init all
  // ---------------------------------------------------------------------------
  function initAll() {
    initPreloader();
    initLenis();
    initReveals();
    initMagnetic();
    initCursor();
    initCardTilt();
    initHeaderScroll();
    initCounters();
    initHeroParallax();
    initNavSpy(); // Existing nav spy
    initDragScroll();
    initPremiumPhases(); // Executes Phases 4, 5, 8, and 10 cleanly
    
    // Hero title waits for preloader to fade
    window.addEventListener('ww:ready', initHeroTitle, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();