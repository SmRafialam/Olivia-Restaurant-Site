/* ============================================================
   OLIVA RESTAURANT — SITE CONFIG
   ------------------------------------------------------------
   This is the ONE file to edit for site-wide content & branding.
   Change a value, save, and (if deployed) commit + push — the
   whole site updates. You can also edit everything visually:
   open the site with  ?edit  at the end of the URL
   (e.g. https://your-site.vercel.app/?edit) to get the live
   Customize panel, then click "Export config" to download an
   updated version of THIS file.
   ============================================================ */
window.OLIVA_CONFIG = {
  // ── Brand ──
  brandName: "OLIVA",                       // the wordmark
  brandSub: "Restaurant",                   // small line under the wordmark
  tagline: "Good Food · Better Moments",    // browser tab / meta

  // ── Announcement banner (top green bar) ──
  bannerEnabled: true,
  openingDate: "14 November 2026",          // used in the banner + across the site

  // ── Contact ──
  phoneDisplay: "+880 1711 000 111",        // shown to visitors
  phoneTel: "+8801711000111",               // used by "call" links (digits + country code)
  whatsapp: "8801711000111",                // WhatsApp number for wa.me links
  email: "hello@olivadhaka.com",
  instagram: "https://instagram.com",
  addressLine: "House 42, Road 11",         // street line in the footer

  // ── Theme colours (brand palette) ──
  themePrimary: "#46551f",                  // main olive green
  themePrimaryDark: "#333f14"               // darker shade (hovers)
};
