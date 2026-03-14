/* ═══════════════════════════════════════════
   WEDDING WEBSITE · Alberto & Almudena · main.js
═══════════════════════════════════════════ */

'use strict';

/* ── COUNTDOWN ──────────────────────────── */
(function initCountdown() {
  const weddingDate = new Date('2026-07-25T20:00:00');

  const els = {
    days:    document.getElementById('cd-days'),
    hours:   document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    if (els.days)    els.days.textContent    = days;
    if (els.hours)   els.hours.textContent   = pad(hours);
    if (els.minutes) els.minutes.textContent = pad(minutes);
    if (els.seconds) els.seconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();


/* ── NAVBAR ─────────────────────────────── */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = navbar && navbar.querySelector('.nav-toggle');
  const navList = navbar && navbar.querySelector('.nav-links');

  if (!navbar) return;

  // Scroll behaviour
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close on link click
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id], div[id="inicio"]');
  const navLinks  = navbar.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ── SCROLL ANIMATIONS (Intersection Observer) ── */
(function initScrollAnimations() {
  const targets = document.querySelectorAll('[data-aos], .timeline-item, .event-card, .travel-card, .faq-item, .cortejo-group, .gallery-item, .map-container, .lista-content');

  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger children of the same parent
  const grids = document.querySelectorAll('.faq-grid, .timeline, .event-cards, .travel-grid, .gallery-grid, .cortejo-members');
  grids.forEach(grid => {
    const children = grid.querySelectorAll('[data-aos], .timeline-item, .event-card, .travel-card, .faq-item, .gallery-item, .cortejo-card');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  targets.forEach(el => observer.observe(el));
})();


/* ── FAQ ACCORDION ──────────────────────── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach(i => {
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-answer').classList.remove('open');
      });

      // Open clicked (unless it was already open)
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
})();


/* ── RSVP FORM ──────────────────────────── */
(function initRSVP() {
  // ── Pega aquí la URL de tu Google Apps Script desplegado ──
  const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1_KdIyscQqmZ1qVmkHbTTbuRi5F1af1eOfRac3vfAHP4/edit?gid=0#gid=0';

  const form    = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');

  if (!form) return;

  // Show/hide extra fields based on attendance
  const asistencia    = form.querySelector('#asistencia');
  const extraFields   = form.querySelector('#extra-fields');
  const acompGroup    = form.querySelector('#acompanante-group');

  const busFields = form.querySelector('#bus-fields');

  function toggleFields() {
    const attending = asistencia.value === 'si';
    if (extraFields) extraFields.style.display = attending ? '' : 'none';
    if (acompGroup)  acompGroup.style.display  = attending ? '' : 'none';
    if (busFields)   busFields.style.display   = attending ? '' : 'none';
  }

  if (asistencia) {
    // Initially hide if no value
    toggleFields();
    asistencia.addEventListener('change', toggleFields);
  }

  // Validation helpers
  function showError(input, msg) {
    input.classList.add('error');
    const errEl = input.closest('.form-group').querySelector('.form-error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(input) {
    input.classList.remove('error');
    const errEl = input.closest('.form-group').querySelector('.form-error');
    if (errEl) errEl.textContent = '';
  }

  // Live validation
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  function validateForm() {
    let valid = true;

    const nombre = form.querySelector('#nombre');
    if (nombre && nombre.value.trim().length < 2) {
      showError(nombre, 'Por favor escribe tu nombre completo.');
      valid = false;
    }

    const email = form.querySelector('#email');
    if (email) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value.trim())) {
        showError(email, 'Introduce un email válido.');
        valid = false;
      }
    }

    const asist = form.querySelector('#asistencia');
    if (asist && !asist.value) {
      showError(asist, 'Por favor selecciona una opción.');
      valid = false;
    }

    return valid;
  }

  // Submit
  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Enviando…
    `;

    // Recoger datos del formulario
    const data = {
      timestamp:   new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
      nombre:      form.querySelector('#nombre')?.value.trim()      || '',
      email:       form.querySelector('#email')?.value.trim()       || '',
      asistencia:  form.querySelector('#asistencia')?.value         || '',
      acompanante: form.querySelector('#acompanante')?.value        || '',
      dieta:       form.querySelector('#dieta')?.value              || '',
      alergias:    form.querySelector('#alergias')?.value.trim()    || '',
      bus:         (form.querySelector('input[name="bus"]:checked'))?.value || 'no',
      mensaje:     form.querySelector('#mensaje')?.value.trim()     || '',
    };

    // Enviar a Google Sheets
    if (SHEETS_URL && SHEETS_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
      try {
        await fetch(SHEETS_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'text/plain' },
          body:    JSON.stringify(data),
        });
      } catch (err) {
        console.warn('[RSVP] Google Sheets error:', err);
      }
    }

    // Show success state
    form.querySelectorAll('.form-row, .form-group, .form-submit').forEach(el => {
      el.style.display = 'none';
    });
    success.classList.remove('hidden');

    // Scroll to success message
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();


/* ── BACK TO TOP ────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── SMOOTH SCROLL for anchor links ─────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── GALLERY LIGHTBOX (simple) ──────────── */
(function initGallery() {
  const items = document.querySelectorAll('.gallery-placeholder');
  if (!items.length) return;

  // Create lightbox overlay
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="lb-backdrop"></div>
    <div class="lb-content">
      <button class="lb-close" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="lb-media"></div>
      <p class="lb-caption"></p>
    </div>
  `;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #lightbox {
      position: fixed; inset: 0; z-index: 2000;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity .3s ease;
    }
    #lightbox.open { opacity: 1; pointer-events: auto; }
    .lb-backdrop {
      position: absolute; inset: 0;
      background: rgba(20,14,12,.92);
      backdrop-filter: blur(8px);
    }
    .lb-content {
      position: relative; z-index: 1;
      max-width: 90vw; max-height: 90vh;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
    }
    .lb-close {
      position: absolute; top: -2.5rem; right: 0;
      width: 36px; height: 36px;
      color: rgba(255,255,255,.7);
      cursor: pointer;
      transition: color .2s;
    }
    .lb-close:hover { color: #C9A96E; }
    .lb-close svg { width: 100%; height: 100%; }
    .lb-media {
      width: 600px; max-width: 90vw;
      height: 420px; max-height: 70vh;
      border-radius: 8px;
      background: #3D2E28;
      display: flex; align-items: center; justify-content: center;
      color: #C9A96E; font-size: 1.1rem;
      font-family: 'Cormorant Garamond', serif;
    }
    .lb-caption { color: rgba(255,255,255,.5); font-size: .85rem; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const close = overlay.querySelector('.lb-close');
  const backdrop = overlay.querySelector('.lb-backdrop');
  const media  = overlay.querySelector('.lb-media');
  const caption = overlay.querySelector('.lb-caption');

  function openLightbox(label) {
    media.textContent = label || 'Foto de Alberto & Almudena';
    caption.textContent = '#AlbertoyAlmudena2026';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const label = item.querySelector('span')?.textContent;
      openLightbox(label);
    });
  });

  close.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
})();


/* ── PARALLAX (subtle hero) ─────────────── */
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      hero.style.backgroundPositionY = `${y * 0.4}px`;
    }
  }, { passive: true });
})();
