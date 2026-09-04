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

## Customizing the site (no code needed)

Everything an owner changes often — brand name, tagline, opening date, phone,
WhatsApp, email, Instagram, address, the announcement banner, and the brand
colours — is customizable two ways:

**1. Edit one file.** Open [`site-config.js`](site-config.js), change the values,
save, then commit + push. The whole site updates on the next deploy.

**2. Visual editor (recommended).** Add `?edit` to the site URL
(e.g. `https://your-site.vercel.app/?edit`). A **Customize** panel slides in:

- Type new text / pick colours → the site updates **live** as you type.
- Changes are saved in *your browser* only (visitors never see the editor and
  aren't affected), so you can experiment freely.
- Click **⬇ Export config** to download an updated `site-config.js`. Replace the
  file in the repo, commit + push, and the changes go live for everyone.
- **Reset** clears your local changes; **Exit editor** hides the panel.

> Deep content (individual menu dishes, gallery photos, long copy) lives in
> `index.html` and is edited there — ask and it can be moved into the config too.

## Deploying to Vercel

The repo is a zero-build static site, so Vercel serves it as-is.

- **Dashboard:** [vercel.com/new](https://vercel.com/new) → Import
  `SmRafialam/Olivia-Restaurant-Site` → Framework preset **Other** → Deploy.
- **CLI:** `npm i -g vercel && vercel --prod` from the repo root.

`vercel.json` sets clean URLs and long-cache headers for `/assets`.

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
