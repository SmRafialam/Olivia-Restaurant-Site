/* ============================================================
   OLIVA — owner customization engine + live editor panel
   ------------------------------------------------------------
   • Reads defaults from the shipped HTML, layers site-config.js
     (committed changes, seen by everyone) and localStorage
     (this browser's live preview) on top.
   • Applies brand text, contact details, links, banner and
     theme colours across the whole page.
   • Add  ?edit  to the URL to reveal the Customize panel. Edits
     preview live and save to this browser; "Export config"
     downloads an updated site-config.js to commit for everyone.
   ============================================================ */
(function () {
  'use strict';

  // Baseline values exactly as they ship in index.html.
  var DEFAULTS = {
    brandName: 'OLIVA',
    brandSub: 'Restaurant',
    tagline: 'Good Food · Better Moments',
    bannerEnabled: true,
    openingDate: '14 November 2026',
    phoneDisplay: '+880 1711 000 111',
    phoneTel: '+8801711000111',
    whatsapp: '8801711000111',
    email: 'hello@olivadhaka.com',
    instagram: 'https://instagram.com',
    addressLine: 'House 42, Road 11',
    themePrimary: '#46551f',
    themePrimaryDark: '#333f14'
  };

  var LS_KEY = 'oliva_custom';
  var LS_ADMIN = 'oliva_admin';

  function readLS(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
  function writeLS(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  // Effective config = defaults < committed (site-config.js) < local preview
  var committed = (window.OLIVA_CONFIG || {});
  var preview = readLS(LS_KEY) || {};
  var cfg = Object.assign({}, DEFAULTS, committed, preview);

  // "applied" tracks what is currently in the DOM (starts as DEFAULTS).
  var applied = Object.assign({}, DEFAULTS);

  // ── helpers ───────────────────────────────────────────────
  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
  }
  function inEditor(node) {
    var el = node.nodeType === 1 ? node : node.parentNode;
    while (el) { if (el.id === 'oliva-editor') return true; el = el.parentNode; }
    return false;
  }
  function walkText(fn) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var t = p.nodeName;
        if (t === 'SCRIPT' || t === 'STYLE' || t === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        if (inEditor(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) fn(n);
  }
  function replaceText(oldStr, newStr) {
    if (oldStr === newStr || !oldStr) return;
    walkText(function (n) { if (n.nodeValue.indexOf(oldStr) >= 0) n.nodeValue = n.nodeValue.split(oldStr).join(newStr); });
  }
  function replaceColor(oldHex, newHex) {
    if (!oldHex || oldHex === newHex) return;
    var o = hexToRgb(oldHex), n = hexToRgb(newHex);
    if (!o || !n) return;
    var hexRe = new RegExp(oldHex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
    // r,g,b triplet inside rgb()/rgba(), tolerating browser-normalized spaces
    var tripRe = new RegExp('\\b' + o[0] + '\\s*,\\s*' + o[1] + '\\s*,\\s*' + o[2] + '\\b', 'g');
    var repl = n[0] + ', ' + n[1] + ', ' + n[2];
    var els = document.querySelectorAll('[style]');
    for (var i = 0; i < els.length; i++) {
      if (inEditor(els[i])) continue;
      var s = els[i].getAttribute('style');
      if (!s) continue;
      var ns = s.replace(hexRe, newHex).replace(tripRe, repl);
      if (ns !== s) els[i].setAttribute('style', ns);
    }
  }
  function replaceHref(oldSub, newSub) {
    if (!oldSub || oldSub === newSub) return;
    var as = document.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute('href');
      if (h && h.indexOf(oldSub) >= 0) as[i].setAttribute('href', h.split(oldSub).join(newSub));
    }
  }

  // ── brand wordmark (targeted, so prose "Restaurant"/"Oliva" is untouched) ──
  function setBrandName(oldV, newV) {
    if (oldV === newV) return;
    var sp = document.querySelectorAll('span');
    for (var i = 0; i < sp.length; i++) {
      if (!inEditor(sp[i]) && sp[i].textContent.trim() === oldV) sp[i].textContent = newV;
    }
  }
  function setBrandSub(oldV, newV) {
    if (oldV === newV) return;
    var sp = document.querySelectorAll('span[style*=".34em"]');
    for (var i = 0; i < sp.length; i++) {
      if (!inEditor(sp[i]) && sp[i].textContent.trim() === oldV) sp[i].textContent = newV;
    }
  }

  // ── theme override stylesheet (covers colours set in CSS files) ──
  function ensureThemeStyle() {
    var s = document.getElementById('oliva-theme-override');
    if (!s) { s = document.createElement('style'); s.id = 'oliva-theme-override'; document.head.appendChild(s); }
    return s;
  }
  function applyThemeStyle(primary, dark) {
    var rgb = hexToRgb(primary) || [70, 85, 31];
    ensureThemeStyle().textContent =
      'a{color:' + primary + '}a:hover{color:' + dark + '}' +
      ':focus-visible{outline-color:' + primary + '!important}' +
      '::selection{background:rgba(' + rgb.join(',') + ',.25)}';
  }

  // ── apply a full config against the currently-applied state ──
  function applyAll(next) {
    // text
    setBrandName(applied.brandName, next.brandName);
    setBrandSub(applied.brandSub, next.brandSub);
    replaceText(applied.openingDate, next.openingDate);
    replaceText(applied.phoneDisplay, next.phoneDisplay);
    replaceText(applied.email, next.email);
    replaceText(applied.addressLine, next.addressLine);
    if (applied.tagline !== next.tagline) replaceText(applied.tagline, next.tagline);
    // meta / title
    document.title = next.brandName.charAt(0) + next.brandName.slice(1).toLowerCase() +
      ' ' + next.brandSub + ' — ' + next.tagline;
    // links
    replaceHref('tel:' + applied.phoneTel, 'tel:' + next.phoneTel);
    replaceHref('wa.me/' + applied.whatsapp, 'wa.me/' + next.whatsapp);
    replaceHref('mailto:' + applied.email, 'mailto:' + next.email);
    replaceHref(applied.instagram, next.instagram);
    // colours (inline hex + rgb/rgba triplet, incl. browser-normalized forms)
    replaceColor(applied.themePrimary, next.themePrimary);
    replaceColor(applied.themePrimaryDark, next.themePrimaryDark);
    applyThemeStyle(next.themePrimary, next.themePrimaryDark);
    // banner
    var banner = document.getElementById('site-banner');
    if (banner) banner.style.display = next.bannerEnabled ? '' : 'none';

    applied = Object.assign({}, next);
  }

  // Apply the effective config on load.
  applyAll(cfg);

  // ── editor gating ─────────────────────────────────────────
  var wantEdit = /(?:^|[?&#])edit\b/i.test(location.search) || /(?:^|#)edit\b/i.test(location.hash);
  if (wantEdit) writeLS(LS_ADMIN, 1);
  var adminOn = readLS(LS_ADMIN) === 1;
  if (!adminOn) return; // visitors never see the editor; their localStorage is untouched

  // ── editor panel ──────────────────────────────────────────
  var FIELDS = [
    { group: 'Brand' },
    { k: 'brandName', label: 'Restaurant name (wordmark)' },
    { k: 'brandSub', label: 'Sub-title under name' },
    { k: 'tagline', label: 'Tagline' },
    { group: 'Announcement banner' },
    { k: 'bannerEnabled', label: 'Show banner', type: 'toggle' },
    { k: 'openingDate', label: 'Opening date' },
    { group: 'Contact' },
    { k: 'phoneDisplay', label: 'Phone (shown)' },
    { k: 'phoneTel', label: 'Phone for call links (+digits)' },
    { k: 'whatsapp', label: 'WhatsApp number (digits)' },
    { k: 'email', label: 'Email' },
    { k: 'instagram', label: 'Instagram URL' },
    { k: 'addressLine', label: 'Address line (footer)' },
    { group: 'Theme colours' },
    { k: 'themePrimary', label: 'Primary colour', type: 'color' },
    { k: 'themePrimaryDark', label: 'Primary (dark/hover)', type: 'color' }
  ];

  var work = Object.assign({}, cfg); // editor working copy

  function persist() {
    // store only what differs from defaults, to keep the file clean
    var diff = {};
    Object.keys(DEFAULTS).forEach(function (k) { if (work[k] !== DEFAULTS[k]) diff[k] = work[k]; });
    writeLS(LS_KEY, diff);
  }
  function onChange(k, v) {
    work[k] = v;
    applyAll(Object.assign({}, work));
    persist();
  }

  function exportConfig() {
    var order = ['brandName', 'brandSub', 'tagline', 'bannerEnabled', 'openingDate',
      'phoneDisplay', 'phoneTel', 'whatsapp', 'email', 'instagram', 'addressLine',
      'themePrimary', 'themePrimaryDark'];
    var lines = order.map(function (k) {
      var v = work[k];
      return '  ' + k + ': ' + (typeof v === 'boolean' ? v : JSON.stringify(v));
    });
    var out = '/* OLIVA RESTAURANT — SITE CONFIG (edit values, commit, push) */\n' +
      'window.OLIVA_CONFIG = {\n' + lines.join(',\n') + '\n};\n';
    var blob = new Blob([out], { type: 'text/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site-config.js';
    document.body.appendChild(a); a.click(); a.remove();
  }

  var css = document.createElement('style');
  css.textContent =
    '#oliva-editor{position:fixed;top:0;right:0;height:100vh;width:340px;max-width:88vw;z-index:120;' +
    'background:#f8f7f4;color:#201e1d;box-shadow:-8px 0 40px rgba(0,0,0,.22);transform:translateX(100%);' +
    'transition:transform .3s ease;display:flex;flex-direction:column;font:400 13px/1.5 Archivo,system-ui,sans-serif}' +
    '#oliva-editor.open{transform:none}' +
    '#oliva-editor header{padding:16px 18px;background:#201e1d;color:#f3f2f2;display:flex;align-items:center;justify-content:space-between}' +
    '#oliva-editor header b{font:800 13px/1 Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase}' +
    '#oliva-editor .body{overflow-y:auto;padding:8px 18px 18px;flex:1}' +
    '#oliva-editor .grp{font:800 10px/1 Archivo,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a8a80;margin:20px 0 8px}' +
    '#oliva-editor label{display:block;margin:0 0 12px}' +
    '#oliva-editor label span{display:block;font-size:11px;color:#5a5a52;margin-bottom:5px}' +
    '#oliva-editor input[type=text]{width:100%;border:1.5px solid #cfcdc4;background:#fff;padding:9px 10px;font:inherit;color:inherit}' +
    '#oliva-editor input[type=text]:focus{outline:2px solid #46551f;border-color:#46551f}' +
    '#oliva-editor input[type=color]{width:46px;height:32px;border:1.5px solid #cfcdc4;background:#fff;padding:2px;vertical-align:middle;cursor:pointer}' +
    '#oliva-editor .row{display:flex;align-items:center;gap:10px}' +
    '#oliva-editor .row input[type=text]{flex:1}' +
    '#oliva-editor .sw{position:relative;width:42px;height:24px;border-radius:24px;background:#cfcdc4;cursor:pointer;transition:background .2s}' +
    '#oliva-editor .sw.on{background:#46551f}' +
    '#oliva-editor .sw i{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s}' +
    '#oliva-editor .sw.on i{left:21px}' +
    '#oliva-editor footer{padding:14px 18px;border-top:1px solid #e2e0d8;display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f1efe9}' +
    '#oliva-editor footer button{padding:10px;border:0;cursor:pointer;font:800 11px/1 Archivo,sans-serif;letter-spacing:.1em;text-transform:uppercase}' +
    '#oliva-editor .primary{background:#46551f;color:#f3f2f2;grid-column:1/3}' +
    '#oliva-editor .ghost{background:transparent;border:1.5px solid #201e1d!important;color:#201e1d}' +
    '#oliva-editor .x{background:none;border:0;color:#f3f2f2;font-size:22px;cursor:pointer;line-height:1}' +
    '#oliva-fab{position:fixed;left:22px;bottom:22px;z-index:119;background:#201e1d;color:#f3f2f2;border:0;cursor:pointer;' +
    'padding:12px 16px;font:800 11px/1 Archivo,sans-serif;letter-spacing:.12em;text-transform:uppercase;box-shadow:0 4px 16px rgba(0,0,0,.25)}';
  document.head.appendChild(css);

  var panel = document.createElement('aside');
  panel.id = 'oliva-editor';
  var bodyHtml = '';
  FIELDS.forEach(function (f) {
    if (f.group) { bodyHtml += '<div class="grp">' + f.group + '</div>'; return; }
    if (f.type === 'toggle') {
      bodyHtml += '<label><span>' + f.label + '</span><div class="sw' + (work[f.k] ? ' on' : '') +
        '" data-toggle="' + f.k + '"><i></i></div></label>';
    } else if (f.type === 'color') {
      bodyHtml += '<label><span>' + f.label + '</span><div class="row">' +
        '<input type="color" data-k="' + f.k + '" value="' + work[f.k] + '">' +
        '<input type="text" data-k="' + f.k + '" value="' + work[f.k] + '"></div></label>';
    } else {
      bodyHtml += '<label><span>' + f.label + '</span>' +
        '<input type="text" data-k="' + f.k + '" value="' + String(work[f.k]).replace(/"/g, '&quot;') + '"></label>';
    }
  });
  panel.innerHTML =
    '<header><b>Customize</b><button class="x" title="Close">&times;</button></header>' +
    '<div class="body">' + bodyHtml + '</div>' +
    '<footer>' +
    '<button class="primary" data-act="export">⬇ Export config</button>' +
    '<button class="ghost" data-act="reset">Reset</button>' +
    '<button class="ghost" data-act="exit">Exit editor</button>' +
    '</footer>';
  document.body.appendChild(panel);

  var fab = document.createElement('button');
  fab.id = 'oliva-fab';
  fab.textContent = '✎ Customize';
  document.body.appendChild(fab);

  function openPanel(o) { panel.classList.toggle('open', o); fab.style.display = o ? 'none' : ''; }
  fab.addEventListener('click', function () { openPanel(true); });
  panel.querySelector('.x').addEventListener('click', function () { openPanel(false); });

  // text + color inputs
  panel.addEventListener('input', function (e) {
    var el = e.target, k = el.getAttribute('data-k');
    if (!k) return;
    onChange(k, el.value);
    if (el.type === 'color') { // sync the paired text field
      var tw = panel.querySelector('input[type=text][data-k="' + k + '"]');
      if (tw) tw.value = el.value;
    } else if (el.type === 'text' && /^#/.test(el.value)) {
      var cw = panel.querySelector('input[type=color][data-k="' + k + '"]');
      if (cw && /^#[0-9a-f]{6}$/i.test(el.value)) cw.value = el.value;
    }
  });
  // toggles
  panel.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toggle]');
    if (t) {
      var k = t.getAttribute('data-toggle');
      var v = !work[k];
      t.classList.toggle('on', v);
      onChange(k, v);
      return;
    }
    var act = e.target.getAttribute('data-act');
    if (act === 'export') exportConfig();
    else if (act === 'reset') { if (confirm('Reset all customizations on this browser?')) { writeLS(LS_KEY, {}); location.reload(); } }
    else if (act === 'exit') { writeLS(LS_ADMIN, 0); location.href = location.pathname; }
  });

  openPanel(true);
})();
