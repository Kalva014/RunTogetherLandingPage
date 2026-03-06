# RunTogether Landing Page — CLAUDE.MD

## Project Overview

Landing page for **RunTogether: Live Virtual Runs** — a free iOS multiplayer running app.
Deployed on **GitHub Pages** at the custom domain configured in `CNAME`.

**App Store:** https://apps.apple.com/us/app/runtogether-live-virtual-runs/id6756319601
**App Store ID:** `6756319601`
**Developer:** Kenneth Alvarez (kenprimeventures@gmail.com), California, USA

---

## Architecture

The main landing page (`index.html`) is a **self-contained static HTML file** — no Jekyll templating.
Legal pages (Privacy Policy, Terms of Service) remain Jekyll-powered.

```
index.html              ← Main landing page (pure HTML, no Jekyll front matter)
assets/
  css/style.css         ← All landing page styles (design system)
  js/main.js            ← Nav behavior, scroll reveal, Swiper, screenshot loading
  screenshot/           ← Drop app screenshots here (see Screenshot Workflow below)
  running_app_logo.png  ← App icon (used in nav, footer, favicon)
  headerimage.png       ← OG/social share image

_config.yml             ← Jekyll config (used by legal pages only — do not remove)
_layouts/               ← Jekyll layouts for legal pages (do not touch)
_includes/              ← Jekyll includes for legal pages (do not touch)
_pages/
  privacypolicy.md      ← Privacy Policy (Jekyll-powered)
  termsofservice.md     ← Terms of Service (Jekyll-powered)
```

---

## Design System

**Style:** Dark Athletic — Gradient & Vibrant (inspired by Strava/Nike Run Club web presence)

### Color Tokens (CSS custom properties in style.css :root)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#020B18` | Page background |
| `--surface` | `#080F1E` | Section alternates |
| `--card` | `#0D1829` | Cards |
| `--blue` | `#0066FF` | Primary accent |
| `--electric` | `#00B4FF` | Labels, badges |
| `--purple` | `#7C3AED` | Gradient midpoint |
| `--orange` | `#FF5C1A` | Gradient endpoint |
| `--gradient` | `135deg, #0066FF → #7C3AED → #FF5C1A` | Hero, CTA |
| `--text` | `#EFF6FF` | Primary text |
| `--muted` | `#7FA5C8` | Secondary text |

### Typography
- **Display/Headings:** `Barlow Condensed` (900 weight) — uppercase, athletic
- **Body:** `DM Sans` (400/500/600)
- **Labels/Code:** `DM Mono` (400/500)
- Loaded from Google Fonts in `<head>` of `index.html`

---

## Page Sections

| Section | ID | Notes |
|---------|-----|-------|
| Navigation | `#nav` | Sticky, glass blur on scroll |
| Hero | `#hero` | Full-viewport, animated blobs + runner dots |
| Social Proof | `#social-proof` | 3 stat cards |
| How It Works | `#how-it-works` | 3-step explainer |
| Features | `#features` | 3 alternating rows (screenshot + copy) |
| Screenshots | `#screenshots` | Swiper.js carousel |
| Final CTA | `#download` | Gradient CTA with App Store button |
| Footer | `footer` | Logo, links, copyright |

---

## Screenshot Workflow

1. Drop screenshot images into `assets/screenshot/`
2. Open `assets/js/main.js`
3. Update the `SCREENSHOTS` array at the top of the file:

```js
const SCREENSHOTS = [
  'assets/screenshot/SimulatorScreenshot.png',
  'assets/screenshot/screen2.png',
  // add more...
];
```

Screenshots are used in:
- **Hero:** `SCREENSHOTS[0]`
- **Feature Row 1 (Race):** `SCREENSHOTS[1]`
- **Feature Row 2 (Compete):** `SCREENSHOTS[2]`
- **Feature Row 3 (Track):** `SCREENSHOTS[3]`
- **Gallery carousel:** All screenshots

If a screenshot fails to load, a styled placeholder is shown automatically.

---

## SEO Configuration

All SEO is hardcoded in `index.html` `<head>`. To update:

| Tag | Location | Current value |
|-----|----------|---------------|
| Page title | `<title>` | "RunTogether: Live Virtual Running Races — Race with Friends Online" |
| Meta description | `<meta name="description">` | 155 chars |
| Canonical URL | `<link rel="canonical">` | `https://runtogetherlive.com/` |
| OG image | `<meta property="og:image">` | `assets/headerimage.png` |
| JSON-LD schema | `<script type="application/ld+json">` | SoftwareApplication type |
| App Store banner | `<meta name="apple-itunes-app">` | `app-id=6756319601` |

**Update the canonical URL** to match your actual GitHub Pages domain if different from `runtogetherlive.com`.

---

## Jekyll (Legal Pages Only)

The Jekyll config `_config.yml` powers only the legal pages. Do not remove it.
The main `index.html` has **no Jekyll front matter** and is served as a static file.

To add new Jekyll pages: add `.md` files in `_pages/` with front matter `layout: page`.

---

## Agent Workflow for Updates

When asking Claude to update this landing page, use this pattern:

### For copy changes:
> "Update the hero headline in index.html to: [new headline]"

### For screenshot updates:
> "Add these screenshots: [filenames]. Update the SCREENSHOTS array in main.js and update alt text."

### For design changes:
> "Change the primary gradient from blue-purple-orange to [new colors]. Update CSS custom properties in style.css."

### For new sections:
> Launch 3 agents in parallel:
> 1. **Implementation agent** — writes the new HTML section + CSS
> 2. **SEO checker agent** — verifies meta tags and heading hierarchy
> 3. **Code quality agent** — checks for broken links, missing alt text, accessibility issues

### Verification checklist after any change:
- [ ] Jekyll still builds legal pages: `bundle exec jekyll serve`
- [ ] No broken asset links (check browser console)
- [ ] Mobile layout at 375px viewport
- [ ] App Store link works: click the download button
- [ ] Run Lighthouse (target: Performance 90+, SEO 100, Accessibility 90+)

---

## External Dependencies (CDN)

| Library | Version | CDN |
|---------|---------|-----|
| Swiper.js | 11 | `cdn.jsdelivr.net/npm/swiper@11/` |
| Google Fonts | — | `fonts.googleapis.com` |

No npm packages. No build step required. GitHub Pages serves the static files directly.

---

## Deployment

Pushes to `master` branch auto-deploy via GitHub Pages.
Custom domain set in `CNAME` file — do not delete or rename it.
