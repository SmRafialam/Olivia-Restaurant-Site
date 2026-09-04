# Oliva Restaurant — Website

A fast, framework-free restaurant website for **Oliva Restaurant** — *Good Food · Better Moments*.
Built as a single-page experience with hash-based routing, a photo gallery lightbox,
reservation / contact / newsletter forms, and scroll-reveal animations. No build step,
no runtime dependencies — just HTML, CSS, and a small vanilla-JS runtime.

## Live pages

Home · Menu · About · Gallery · Events · Testimonials · Journal · Contact · Reserve
(navigation is client-side via `#hash` routes, e.g. `#menu`, `#gallery`).

## Project structure

```
index.html          Markup for every section/page (single document)
css/
  fonts.css         Self-hosted Archivo @font-face (woff2)
  style.css         Design-system tokens, base styles, reveal + image-slot rules
js/
  app.js            Routing, lightbox, forms, hover styles, scroll-reveal
assets/
  fonts/            Archivo woff2 subsets
  img/              Logo + section photography
```

## Running locally

It's plain static files, so any static server works:

```bash
# Python
python -m http.server 8091
# or Node
npx serve .
```

Then open <http://localhost:8091>. Opening `index.html` directly over `file://`
also works, though a server is recommended so relative asset paths resolve cleanly.

## Deploying to GitHub Pages

1. Push to `main`.
2. Repository **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Choose branch `main` / folder `/ (root)` and save.

The gallery images are served from the Unsplash CDN; all other assets are local.

## Notes

- Content (opening date, phone, menu, copy) lives directly in `index.html` — edit it there.
- The **OLIVA** wordmark uses *Playfair Display* (loaded from Google Fonts); body text uses
  self-hosted *Archivo*.

---
Design & build for S.M. Rafi.
