'use strict';

/* =====================================================
   RunTogether Fake-Door Funnel — tracking + form logic
   PostHog project: 366001
   ===================================================== */

// ---------- Helpers ----------

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getAllUTMs() {
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'hook_variant', 'fbclid'];
  const out = {};
  utmKeys.forEach(k => {
    const v = getQueryParam(k);
    if (v) out[k] = v;
  });
  // Persist UTMs across funnel pages via sessionStorage
  if (Object.keys(out).length) {
    sessionStorage.setItem('rt_utms', JSON.stringify(out));
    return out;
  }
  try { return JSON.parse(sessionStorage.getItem('rt_utms') || '{}'); }
  catch (e) { return {}; }
}

function capture(event, props) {
  const merged = Object.assign({}, getAllUTMs(), props || {});
  if (window.posthog) window.posthog.capture(event, merged);
}

// Meta Pixel helper — fires fbq() if Pixel loaded. Safe no-op if not.
function fbqTrack(event, params) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, params || {});
  }
}

function buildLinkWithParams(href) {
  // Append current UTMs to internal links so signal carries across pages
  const utms = getAllUTMs();
  if (!Object.keys(utms).length) return href;
  const url = new URL(href, window.location.origin);
  Object.entries(utms).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

// ---------- Cross-page wiring ----------

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // Capture UTMs on every page load
  getAllUTMs();

  // Append UTMs to all internal nav links
  document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
    a.setAttribute('href', buildLinkWithParams(href));
  });

  // PAGE 1
  if (path === '/' || path.endsWith('/index.html')) {
    capture('funnel_page1_view', { device: detectDevice() });

    document.querySelectorAll('[data-event="funnel_page1_cta_clicked"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        capture('funnel_page1_cta_clicked', {
          position: btn.dataset.position || 'top',
          time_on_page_sec: timeOnPage()
        });
        // Meta: signal intent — InitiateCheckout standard event
        fbqTrack('InitiateCheckout', { value: 9.99, currency: 'USD' });
      });
    });

    // Scroll depth — fires once per threshold per page load
    initScrollDepth(['25', '50', '75', '100']);
  }

  // PAGE 2
  if (path.endsWith('/pricing.html')) {
    capture('funnel_page2_view', { from_page1_cta: document.referrer.includes(window.location.host) });

    document.querySelectorAll('[data-event="funnel_page2_plan_clicked"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const plan = btn.dataset.plan;
        capture('funnel_page2_plan_clicked', {
          plan,
          time_on_page_sec: timeOnPage()
        });
        sessionStorage.setItem('rt_plan', plan);
        // Meta: high-intent — AddToCart w/ plan value
        fbqTrack('AddToCart', {
          value: plan === 'annual' ? 49.99 : 9.99,
          currency: 'USD',
          content_name: plan,
          content_category: 'subscription'
        });
      });
    });

    document.querySelectorAll('[data-event="funnel_page2_faq_opened"]').forEach(el => {
      el.addEventListener('click', () => {
        capture('funnel_page2_faq_opened', { faq_question: el.dataset.faq });
      });
    });
  }

  // PAGE 3
  if (path.endsWith('/reserve.html')) {
    const planFromUrl = getQueryParam('plan') || sessionStorage.getItem('rt_plan') || 'annual';
    const planChip = document.getElementById('plan-label');
    if (planChip) {
      planChip.textContent = planFromUrl === 'monthly'
        ? 'Monthly · $9.99/mo · 30-day trial'
        : 'Annual · $49.99/yr · 30-day trial';
    }
    capture('funnel_page3_view', { plan_selected: planFromUrl });
    // Meta: ViewContent for retargeting + funnel attribution
    fbqTrack('ViewContent', {
      content_name: 'reserve_page',
      content_category: planFromUrl
    });

    // Modal removed — reframed Page 3 as direct waitlist join.

    // ---- Google Form embed setup ----
    // After creating the form (see GOOGLE_FORMS_SETUP.md), paste:
    //   1) The embed URL (ends in /viewform?embedded=true)
    //   2) The entry IDs for hidden prefill fields (entry.XXXXXXXX)
    const GOOGLE_FORM = {
      embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd86URSyP26dTe_o0qSN-bRcJZM1JjfpWM7rRUCvXo4iF5PzQ/viewform?embedded=true',
      entryIds: {
        plan_selected: 'entry.1242839846',
        utm_source:    'entry.1541680585',
        utm_medium:    'entry.71462177',
        utm_campaign:  'entry.1389456233',
        utm_content:   'entry.1675711035',
        hook_variant:  'entry.2020774516'
      }
    };

    function buildPrefilledFormUrl() {
      const url = new URL(GOOGLE_FORM.embedUrl);
      const utms = getAllUTMs();
      const fields = {
        plan_selected: planFromUrl,
        utm_source: utms.utm_source || '',
        utm_medium: utms.utm_medium || '',
        utm_campaign: utms.utm_campaign || '',
        utm_content: utms.utm_content || '',
        hook_variant: utms.hook_variant || ''
      };
      Object.entries(fields).forEach(([key, value]) => {
        const entry = GOOGLE_FORM.entryIds[key];
        if (entry && value) url.searchParams.set(entry, value);
      });
      return url.toString();
    }

    const iframe = document.getElementById('reserve-form-iframe');
    if (iframe) {
      iframe.src = buildPrefilledFormUrl();
      iframe.addEventListener('load', () => {
        // Fires when Google Form iframe finishes loading. Proxy for "form became visible."
        // Only fires once per page since iframe URL set once.
        capture('funnel_page3_form_viewed', { plan_selected: planFromUrl });
      }, { once: true });
    }
  }

  // Global: track exits
  window.addEventListener('pagehide', () => {
    capture('funnel_exit', { last_page: window.location.pathname, time_in_funnel_sec: timeOnPage() });
  });
});

// ---------- Utilities ----------

const pageLoadAt = Date.now();
function timeOnPage() { return Math.round((Date.now() - pageLoadAt) / 1000); }

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function detectDevice() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

// Fires `funnel_scroll_depth` once per threshold (25/50/75/100) per page load.
// Throttled to ~10fps via rAF — negligible perf cost.
function initScrollDepth(thresholds) {
  const fired = new Set();
  let ticking = false;

  function check() {
    ticking = false;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    if (scrollable <= 0) return;
    const pct = Math.round((window.scrollY / scrollable) * 100);

    thresholds.forEach(t => {
      const n = Number(t);
      if (pct >= n && !fired.has(t)) {
        fired.add(t);
        capture('funnel_scroll_depth', {
          depth_pct: n,
          time_to_depth_sec: timeOnPage()
        });
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(check);
      ticking = true;
    }
  }, { passive: true });
}
