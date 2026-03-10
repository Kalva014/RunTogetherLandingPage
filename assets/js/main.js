/**
 * RunTogether Landing Page — main.js
 *
 * To add your app screenshots:
 * 1. Drop images into assets/screenshot/
 * 2. Update the SCREENSHOTS array below with your actual filenames
 * 3. The gallery, hero, and feature rows will automatically update
 */

'use strict';

/* =====================================================
   CONFIGURATION — update these with your screenshot filenames
   ===================================================== */
const SCREENSHOTS = [
  'assets/screenshot/live_running_view_screenshot.png', // [0] Hero
  'assets/screenshot/share_run_screenshot.png',         // [1] Feature 1 — live running
  'assets/screenshot/ranked_leaderboard_breakdown.PNG', // [2] Feature 2 — ranked leagues
  'assets/screenshot/run_club_details_view.PNG',        // [3] Feature 3 — run clubs
  'assets/screenshot/stairmaster_results_view.PNG',     // [4] Gallery only
];

const APP_STORE_URL = 'https://apps.apple.com/us/app/runtogether-live-virtual-runs/id6756319601';

/* =====================================================
   INIT — run after DOM is ready
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  loadScreenshots();
  initGallery();
  initSmoothScroll();
});

/* =====================================================
   NAV — glass blur on scroll + mobile toggle
   ===================================================== */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const mobileLinks = document.querySelectorAll('#nav-mobile-menu a');

  if (!nav) return;

  // Scroll: transparent → glass blur
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile menu toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Close mobile menu on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
      toggle && toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      toggle && toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* =====================================================
   SCROLL REVEAL — Intersection Observer fade-in
   ===================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
}

/* =====================================================
   SCREENSHOT LOADER — hero + feature row images
   ===================================================== */
function loadScreenshots() {
  if (!SCREENSHOTS.length) return;

  // Hero: use first screenshot
  loadImage(
    document.getElementById('hero-screenshot'),
    document.getElementById('hero-placeholder'),
    SCREENSHOTS[0]
  );

  // Feature rows: use screenshots 1, 2, 3 (index offsets)
  const featureImgs = document.querySelectorAll('.feature-screenshot');
  featureImgs.forEach(img => {
    const idx = parseInt(img.dataset.index || '1', 10);
    const src = SCREENSHOTS[idx] || SCREENSHOTS[0];
    const placeholder = img.nextElementSibling;
    if (src) loadImage(img, placeholder, src);
  });
}

/**
 * Attempt to load an image. Show it on success, keep placeholder on error.
 */
function loadImage(imgEl, placeholderEl, src) {
  if (!imgEl || !src) return;

  const tester = new Image();
  tester.onload = () => {
    imgEl.src = src;
    imgEl.style.display = 'block';
    if (placeholderEl) placeholderEl.style.display = 'none';
  };
  tester.onerror = () => {
    // Keep placeholder visible, img stays hidden
    imgEl.style.display = 'none';
    if (placeholderEl) placeholderEl.style.display = 'flex';
  };
  tester.src = src;
}

/* =====================================================
   SCREENSHOT GALLERY — Swiper carousel
   ===================================================== */
function initGallery() {
  const wrapper = document.getElementById('gallery-wrapper');
  const fallback = document.getElementById('gallery-fallback');

  if (!wrapper) return;

  if (!SCREENSHOTS.length) {
    if (fallback) fallback.style.display = 'block';
    return;
  }

  // Build slides
  const fragment = document.createDocumentFragment();
  let loaded = 0;

  SCREENSHOTS.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    const frame = document.createElement('div');
    frame.className = 'phone-frame';

    const notch = document.createElement('div');
    notch.className = 'phone-notch';
    notch.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.className = 'phone-screen';
    img.alt = `RunTogether app screenshot ${i + 1}`;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.style.display = 'none';

    const ph = document.createElement('div');
    ph.className = 'phone-screen-placeholder';
    ph.style.display = 'flex';
    ph.textContent = 'Loading...';

    img.onload = () => {
      img.style.display = 'block';
      ph.style.display = 'none';
      loaded++;
    };
    img.onerror = () => {
      ph.textContent = 'Screenshot unavailable';
    };
    img.src = src;

    frame.appendChild(notch);
    frame.appendChild(img);
    frame.appendChild(ph);
    slide.appendChild(frame);
    fragment.appendChild(slide);
  });

  wrapper.appendChild(fragment);

  // Init Swiper after slides are added
  if (typeof Swiper !== 'undefined') {
    new Swiper('.gallery-swiper', {
      slidesPerView: 'auto',
      centeredSlides: true,
      spaceBetween: 24,
      loop: SCREENSHOTS.length > 1,
      autoplay: SCREENSHOTS.length > 1
        ? { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
        : false,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      keyboard: { enabled: true },
      a11y: {
        prevSlideMessage: 'Previous screenshot',
        nextSlideMessage: 'Next screenshot',
      },
    });
  }
}

/* =====================================================
   SMOOTH SCROLL — anchor links
   ===================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
