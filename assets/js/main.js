'use strict';

const SCREENSHOTS = [
  {
    key: 'hero',
    src: 'assets/screenshot/live_running_view_screenshot.png',
    alt: 'RunTogether live race screen with two runners, live stats, and chat controls'
  },
  {
    key: 'live-race',
    src: 'assets/screenshot/live_racing_view.PNG',
    alt: 'RunTogether live racing screen showing runner positions and race progress'
  },
  {
    key: 'ranked',
    src: 'assets/screenshot/ranked_leaderboard_breakdown.PNG',
    alt: 'RunTogether ranked leaderboard breakdown from Bronze to Champion'
  },
  {
    key: 'club',
    src: 'assets/screenshot/run_club_details_view.PNG',
    alt: 'RunTogether run club page with live and upcoming club events'
  },
  {
    key: 'stairmaster',
    src: 'assets/screenshot/stairmaster_results_view.PNG',
    alt: 'RunTogether StairMaster climb results screen with final standings'
  },
  {
    key: 'share',
    src: 'assets/screenshot/share_run_screenshot.png',
    alt: 'RunTogether share activity card with pace, distance, and placing'
  }
];

const SCREENSHOT_MAP = new Map(SCREENSHOTS.map((shot) => [shot.key, shot]));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  loadScreenshots();
  initGallery();
  initSmoothScroll();
});

function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const mobileLinks = document.querySelectorAll('#nav-mobile-menu a');

  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -48px 0px'
    }
  );

  elements.forEach((element) => observer.observe(element));
}

function loadScreenshots() {
  const nodes = document.querySelectorAll('[data-shot]');
  if (!nodes.length) return;

  nodes.forEach((node) => {
    const shot = SCREENSHOT_MAP.get(node.dataset.shot);
    if (!shot) return;

    node.alt = shot.alt;
    loadImage(node, findPlaceholder(node), shot.src);
  });
}

function findPlaceholder(node) {
  if (!node || !node.parentElement) return null;
  return node.parentElement.querySelector('[data-placeholder]');
}

function loadImage(imgEl, placeholderEl, src) {
  if (!imgEl || !src) return;

  const tester = new Image();
  tester.decoding = 'async';
  tester.onload = () => {
    imgEl.src = src;
    imgEl.style.display = 'block';
    if (placeholderEl) placeholderEl.hidden = true;
  };
  tester.onerror = () => {
    imgEl.style.display = 'none';
    if (placeholderEl) {
      placeholderEl.hidden = false;
      placeholderEl.textContent = 'Screenshot unavailable';
    }
  };
  tester.src = src;
}

function initGallery() {
  const wrapper = document.getElementById('gallery-wrapper');
  const fallback = document.getElementById('gallery-fallback');

  if (!wrapper) return;

  if (!SCREENSHOTS.length) {
    if (fallback) fallback.hidden = false;
    return;
  }

  const fragment = document.createDocumentFragment();
  const galleryImages = [];

  SCREENSHOTS.forEach((shot, index) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    const frame = document.createElement('div');
    frame.className = 'phone-frame';

    const notch = document.createElement('div');
    notch.className = 'phone-notch';
    notch.setAttribute('aria-hidden', 'true');

    const image = document.createElement('img');
    image.className = 'phone-screen';
    image.alt = shot.alt;
    image.loading = index === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.style.display = 'none';
    image.dataset.src = shot.src;

    const placeholder = document.createElement('div');
    placeholder.className = 'phone-screen-placeholder';
    placeholder.textContent = 'Loading screenshot...';

    frame.appendChild(notch);
    frame.appendChild(image);
    frame.appendChild(placeholder);
    slide.appendChild(frame);
    fragment.appendChild(slide);
    galleryImages.push({ image, placeholder });
  });

  wrapper.appendChild(fragment);

  if (typeof Swiper === 'undefined') {
    galleryImages.slice(0, 2).forEach(loadGalleryEntry);
    return;
  }

  const swiper = new Swiper('.gallery-swiper', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 24,
    loop: SCREENSHOTS.length > 1,
    speed: prefersReducedMotion.matches ? 0 : 650,
    autoplay: SCREENSHOTS.length > 1 && !prefersReducedMotion.matches
      ? { delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }
      : false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    keyboard: {
      enabled: true
    },
    a11y: {
      prevSlideMessage: 'Previous screenshot',
      nextSlideMessage: 'Next screenshot'
    }
  });

  const primeVisibleSlides = () => {
    const activeIndex = swiper.realIndex;
    const indices = [
      activeIndex,
      (activeIndex + 1) % galleryImages.length,
      (activeIndex - 1 + galleryImages.length) % galleryImages.length
    ];

    indices.forEach((index) => loadGalleryEntry(galleryImages[index]));
  };

  primeVisibleSlides();
  swiper.on('slideChangeTransitionStart', primeVisibleSlides);

  function loadGalleryEntry(entry) {
    if (!entry || entry.image.dataset.loaded === 'true') return;

    const { image, placeholder } = entry;
    const src = image.dataset.src;
    if (!src) return;

    image.onload = () => {
      image.style.display = 'block';
      placeholder.hidden = true;
      image.dataset.loaded = 'true';
    };

    image.onerror = () => {
      placeholder.hidden = false;
      placeholder.textContent = 'Screenshot unavailable';
      image.dataset.loaded = 'error';
    };

    image.src = src;
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });
}
