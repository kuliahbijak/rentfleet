/* ============================================================
 * core.js — fondasi bersama: ikon, format, API (fetch ke GAS)
 * dengan dedupe + batch + cache SWR, toast/modal, router, PWA
 * ============================================================ */
(function (W) {
  'use strict';
  const VERSI = '1.0.0';
  const CFG = W.APP_CONFIG || {};
  const GAS = String(CFG.GAS_URL || '');
  const SIAP = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(GAS) && !/GANTI|XXXX/.test(GAS);

  /* ---------- Ikon (SVG garis 24px) ---------- */
  const P = {
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l-3.5 11.5M5.5 17.5 9 10h7"/><path d="M9 10 7.5 7H5"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    starf: '<polygon fill="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkc: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    wallet: '<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    left: '<polyline points="15 18 9 12 15 6"/>', right: '<polyline points="9 18 15 12 9 6"/>', down: '<polyline points="6 9 12 15 18 9"/>',
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    phone2: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    fuel: '<line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
    gauge: '<path d="M12 14 16 10"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    seat: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1-1v-5a2 2 0 0 0-4 0v5a1 1 0 0 0 1 1z"/><path d="M19 21a1 1 0 0 0 1-1v-5a2 2 0 0 0-4 0v5a1 1 0 0 0 1 1z"/><path d="M5 18h14"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    clip: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
    hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
    ig: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18v3M21 14v1"/>',
    google: '<path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.7 4.1-5.35 4.1a5.92 5.92 0 0 1 0-11.84c1.82 0 3.04.78 3.74 1.45l2.55-2.46C16.76 3.9 14.6 3 12 3a9 9 0 1 0 0 18c5.2 0 8.64-3.65 8.64-8.8 0-.6-.07-1.05-.15-1.5z"/>'
  };
  function ic(n, cls) { return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || P.info) + '</svg>'; }
  function hidrasiIkon(root) { (root || document).querySelectorAll('i[data-ic]').forEach(function (el) { const s = document.createElement('span'); s.innerHTML = ic(el.getAttribute('data-ic'), el.className); const svg = s.firstChild; el.replaceWith(svg); }); }

  /* ---------- Format ---------- */
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const angka = function (n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  const rp = function (n) { n = Math.round(Number(n) || 0); return (n < 0 ? '-Rp ' : 'Rp ') + angka(Math.abs(n)); };
  const rpK = function (n) { n = Number(n) || 0; return n >= 1e6 ? 'Rp ' + (Math.round(n / 1e5) / 10).toString().replace('.', ',') + ' jt' : n >= 1e3 ? 'Rp ' + Math.round(n / 1e3) + 'rb' : rp(n); };
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  /** 'yyyy-MM-dd HH:mm' (WIB) → ms */
  function ms(s) { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], (+m[4] || 0) - 7, +m[5] || 0) : NaN; }
  /** ms → komponen WIB */
  function wib(t) { const d = new Date((t == null ? Date.now() : t) + 7 * 3600e3); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), i: d.getUTCMinutes(), w: d.getUTCDay() }; }
  const p2 = function (n) { return (n < 10 ? '0' : '') + n; };
  function isoTgl(t) { const x = wib(t); return x.y + '-' + p2(x.m + 1) + '-' + p2(x.d); }
  function isoWaktu(t) { const x = wib(t); return isoTgl(t) + ' ' + p2(x.h) + ':' + p2(x.i); }
  function tgl(s, jam) { const t = typeof s === 'number' ? s : ms(s); if (isNaN(t)) return s || '-'; const x = wib(t); return x.d + ' ' + BLN[x.m] + ' ' + x.y + (jam ? ', ' + p2(x.h) + ':' + p2(x.i) : ''); }
  function tglPendek(s) { const t = typeof s === 'number' ? s : ms(s); if (isNaN(t)) return s || '-'; const x = wib(t); return x.d + ' ' + BLN[x.m] + ' ' + p2(x.h) + ':' + p2(x.i); }
  function jam(s) { const t = typeof s === 'number' ? s : ms(s); if (isNaN(t)) return '-'; const x = wib(t); return p2(x.h) + ':' + p2(x.i); }
  function durasi(a, z) { const j = Math.ceil((ms(z) - ms(a)) / 3600e3); if (!(j > 0)) return '-'; const h = Math.floor(j / 24), s = j % 24; return (h ? h + ' hari ' : '') + (s ? s + ' jam' : '').trim(); }
  function relatif(s) { const t = ms(s), d = (t - Date.now()) / 60000; if (isNaN(t)) return ''; const a = Math.abs(d); const v = a < 60 ? Math.round(a) + ' menit' : a < 1440 ? Math.round(a / 60) + ' jam' : Math.round(a / 1440) + ' hari'; return d < 0 ? v + ' lalu' : v + ' lagi'; }
  function hp08(v) { let s = String(v || '').replace(/[^0-9+]/g, '').replace(/^\+/, ''); if (s.indexOf('62') === 0) s = '0' + s.slice(2); else if (s[0] === '8') s = '0' + s; return s; }
  function waLink(no, teks) { const n = hp08(no).replace(/^0/, '62'); return 'https://wa.me/' + n + (teks ? '?text=' + encodeURIComponent(teks) : ''); }
  function inisial(n) { return String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function debounce(fn, ms2) { let t; return function () { const a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms2 || 300); }; }
  function hash(o) { const s = typeof o === 'string' ? o : JSON.stringify(o); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  const STATUS_BADGE = { 'Tersedia': 'b-ok', 'Disewa': 'b-info', 'Perlu Cek/Bersih': 'b-warn', 'Maintenance': 'b-bad', 'Nonaktif': 'b-off',
    'Draft': 'b-off', 'Menunggu Konfirmasi': 'b-warn', 'Menunggu DP': 'b-warn', 'Terkonfirmasi': 'b-info', 'Sedang Berjalan': 'b-ok', 'Selesai': 'b-off', 'Dibatalkan': 'b-bad',
    'Telat': 'b-bad', 'Lunas': 'b-ok', 'Belum Lunas': 'b-warn', 'Antri': 'b-warn', 'Terkirim': 'b-ok', 'Gagal': 'b-bad', 'Batal': 'b-off', 'Proses': 'b-info', 'Berjalan': 'b-info', 'Dihentikan': 'b-off' };
  function badge(s, extra) { return '<span class="badge dot ' + (STATUS_BADGE[s] || 'b-off') + ' ' + (extra || '') + '">' + esc(s) + '</span>'; }

  /* ---------- Penyimpanan lokal ---------- */
  const LS = {
    get: function (k, d) { try { const v = localStorage.getItem('rf_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('rf_' + k, JSON.stringify(v)); } catch (e) { try { LS.bersihCache(); localStorage.setItem('rf_' + k, JSON.stringify(v)); } catch (e2) { } } },
    del: function (k) { try { localStorage.removeItem('rf_' + k); } catch (e) { } },
    bersihCache: function () { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('rf_c_') === 0) localStorage.removeItem(k); }); } catch (e) { } }
  };

  /* ---------- Sesi ---------- */
  const Sesi = {
    token: LS.get('token', ''), me: LS.get('me', null),
    set: function (token, me) { this.token = token; this.me = me; LS.set('token', token); LS.set('me', me); },
    hapus: function () { this.token = ''; this.me = null; LS.del('token'); LS.del('me'); LS.bersihCache(); Mem.clear(); }
  };

  /* ---------- Pengukur kinerja ---------- */
  const Perf = { log: [], catat: function (a, t, srv, cached) { this.log.push({ aksi: a, total: t, server: srv || 0, net: t - (srv || 0), cache: !!cached }); if (this.log.length > 200) this.log.shift(); },
    table: function () { console.table(this.log.slice(-30)); },
    summary: function () { const m = {}; this.log.forEach(function (x) { const k = m[x.aksi] = m[x.aksi] || { n: 0, total: 0, server: 0 }; k.n++; k.total += x.total; k.server += x.server; }); Object.keys(m).forEach(function (k) { m[k].rata = Math.round(m[k].total / m[k].n); m[k].server = Math.round(m[k].server / m[k].n); }); console.table(m); } };

  /* ---------- API ke Google Apps Script ---------- */
  const READ = /(^boot$|^ping$|\.(list|detail|get|ringkas|data|konteks|stats|queue|status|config|antrean|semua|boot|cari|estimasi|cek|verifikasi|audience)$|^dash\.|^tugas\.)/;
  const _inflight = {}; let _epoch = 0; let _sibuk = 0;
  function setSibuk(d) { _sibuk += d; const el = document.getElementById('syncDot'); if (el) el.className = 'sync-dot' + (_sibuk > 0 ? ' busy' : ''); }
  async function kirim(action, data, opt) {
    opt = opt || {};
    if (!SIAP) return { success: false, code: 'CONFIG', message: 'Konfigurasi belum lengkap: isi GAS_URL di js/config.js dengan URL Web App /exec.' };
    const t0 = performance.now();
    const body = JSON.stringify({ action: action, token: Sesi.token || '', data: data || {} });
    let percobaan = 0;
    while (true) {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const to = setTimeout(function () { if (ctrl) ctrl.abort(); }, opt.timeout || 45000);
      setSibuk(1);
      try {
        const res = await fetch(GAS, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, redirect: 'follow', signal: ctrl ? ctrl.signal : undefined });
        const txt = await res.text();
        let j; try { j = JSON.parse(txt); } catch (e) { throw new Error(/<html/i.test(txt) ? 'Server membalas halaman, bukan data. Pastikan deployment "Siapa saja" dan URL berakhiran /exec.' : 'Server membalas tidak valid.'); }
        Perf.catat(action, Math.round(performance.now() - t0), j.ms, j.cached);
        if (j.code === 'AUTH' && Sesi.token) { Sesi.hapus(); toast('Sesi berakhir, silakan masuk lagi.', 'err'); setTimeout(function () { location.hash = '#/masuk'; }, 300); }
        if (j.nq > 0) jadwalDrain();
        return j;
      } catch (e) {
        if (percobaan++ < (READ.test(action) ? 1 : 0) && navigator.onLine !== false) { await new Promise(function (r) { setTimeout(r, 800); }); continue; }
        const offline = navigator.onLine === false;
        return { success: false, code: 'NET', message: offline ? 'Tidak ada koneksi internet.' : (e.name === 'AbortError' ? 'Server terlalu lama merespons. Coba lagi.' : (e.message || 'Gagal terhubung ke server.')) };
      } finally { clearTimeout(to); setSibuk(-1); }
    }
  }
  /** api(): baca identik yang sedang berjalan digabung; tulis menaikkan epoch agar baca berikutnya segar. */
  function api(action, data, opt) {
    if (!READ.test(action)) { _epoch++; Mem.basi(); return kirim(action, data, opt); }
    const k = _epoch + '|' + action + '|' + JSON.stringify(data || {});
    if (_inflight[k]) return _inflight[k];
    const p = kirim(action, data, opt); _inflight[k] = p;
    p.then(function () { delete _inflight[k]; }, function () { delete _inflight[k]; });
    return p;
  }
  /** apiQ(): aksi baca pada tik yang sama digabung menjadi 1 panggilan 'batch'. */
  const Batcher = {
    q: null,
    add: function (action, data) { const self = this; return new Promise(function (res) { if (!self.q) { self.q = []; setTimeout(function () { self.flush(); }, 0); } self.q.push({ action: action, data: data || {}, res: res }); }); },
    flush: function () {
      const q = this.q || []; this.q = null;
      if (!q.length) return;
      const unik = []; const peta = {};
      q.forEach(function (x) { const k = x.action + '|' + JSON.stringify(x.data); if (!peta[k]) { peta[k] = []; unik.push(x); } peta[k].push(x); });
      const bagikan = function (x, r) { peta[x.action + '|' + JSON.stringify(x.data)].forEach(function (y) { y.res(r); }); };
      if (unik.length === 1 || !Sesi.token) { unik.forEach(function (x) { api(x.action, x.data).then(function (r) { bagikan(x, r); }); }); return; }
      for (let i = 0; i < unik.length; i += 10) {
        const pot = unik.slice(i, i + 10);
        api('batch', { calls: pot.map(function (x) { return { action: x.action, data: x.data }; }) }).then(function (r) {
          pot.forEach(function (x, j) { bagikan(x, r.success ? r.data.results[j] : r); });
        });
      }
    }
  };
  function apiQ(action, data) { return Batcher.add(action, data); }
  let _drainT = null, _drainN = 0;
  function jadwalDrain() { clearTimeout(_drainT); _drainT = setTimeout(function () { kirim('drain', {}).then(function (r) { if (r.success && r.data && r.data.left > 0 && _drainN++ < 3) jadwalDrain(); else _drainN = 0; }); }, 400); }
  function warmUp(scope) {
    if (!SIAP) return;
    try { const k = 'warm_' + scope, t = Number(sessionStorage.getItem(k) || 0); if (Date.now() - t < 240000) return; sessionStorage.setItem(k, String(Date.now())); } catch (e) { }
    fetch(GAS + '?w=' + scope, { mode: 'no-cors' }).catch(function () { });
  }

  /* ---------- Cache data (memori + localStorage) dengan stale-while-revalidate ---------- */
  const Mem = {
    m: {}, stale: {},
    get: function (k) { if (this.m[k]) return this.m[k]; const v = LS.get('c_' + k, null); if (v) this.m[k] = v; return v; },
    set: function (k, data) { const v = { t: Date.now(), h: hash(data), data: data }; this.m[k] = v; LS.set('c_' + k, v); delete this.stale[k]; return v; },
    basi: function () { Object.keys(this.m).forEach(function (k) { Mem.stale[k] = true; }); },
    clear: function () { this.m = {}; this.stale = {}; }
  };
  /**
   * muat(kunci, aksi, data, {umur, render, batch}) → render dari cache dulu (instan), lalu
   * ambil server bila cache lebih tua dari umur (detik). render(data, dariCache) dipanggil
   * ulang hanya bila data berubah.
   */
  function muat(kunci, aksi, data, opt) {
    opt = opt || {};
    const c = Mem.get(kunci), umur = (opt.umur == null ? 30 : opt.umur) * 1000;
    if (c && opt.render) opt.render(c.data, true);
    const segar = !c || Mem.stale[kunci] || Date.now() - c.t > umur || opt.paksa;
    if (!segar) return Promise.resolve(c.data);
    const f = opt.batch === false ? api : apiQ;
    return f(aksi, Object.assign({}, data || {}, opt.paksa ? { _fresh: true } : {})).then(function (r) {
      if (!r.success) { if (!c && opt.render) opt.render(null, false, r); if (!opt.diam) toast(r.message, 'err'); return c ? c.data : null; }
      const lama = c ? c.h : null, v = Mem.set(kunci, r.data);
      if (opt.render && v.h !== lama) opt.render(r.data, false);
      return r.data;
    });
  }

  /* ---------- Toast, modal, konfirmasi ---------- */
  function toast(msg, tipe, lama) {
    const box = document.getElementById('toasts'); if (!box || !msg) return;
    const el = document.createElement('div'); el.className = 'toast ' + (tipe || '');
    el.innerHTML = ic(tipe === 'err' ? 'alert' : tipe === 'ok' ? 'checkc' : 'info') + '<div>' + esc(msg) + '</div>';
    box.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(function () { el.remove(); }, 300); }, lama || (tipe === 'err' ? 5000 : 2800));
  }
  function modal(o) {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal ' + (o.lebar ? 'lebar' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(o.judul || '') + '">' +
      '<div class="modal-h"><h3>' + esc(o.judul || '') + '</h3><button class="btn btn-ghost btn-ico btn-sm" data-tutup aria-label="Tutup">' + ic('x') + '</button></div>' +
      '<div class="modal-b">' + (o.isi || '') + '</div>' + (o.kaki ? '<div class="modal-f">' + o.kaki + '</div>' : '') + '</div>';
    const fokusLama = document.activeElement;
    const tutup = function (hasil) { if (!bg.isConnected) return; bg.remove(); document.removeEventListener('keydown', esc2); if (fokusLama && fokusLama.focus) try { fokusLama.focus(); } catch (e) { } if (o.onTutup) o.onTutup(hasil); };
    const esc2 = function (e) { if (e.key === 'Escape') tutup(); };
    bg.addEventListener('click', function (e) { if (e.target === bg && !o.tetap) tutup(); if (e.target.closest('[data-tutup]')) tutup(); });
    document.addEventListener('keydown', esc2);
    document.body.appendChild(bg);
    const m = { el: bg.querySelector('.modal'), bg: bg, tutup: tutup, $: function (s) { return bg.querySelector(s); }, $$: function (s) { return bg.querySelectorAll(s); } };
    if (o.buka) o.buka(m);
    const f = bg.querySelector('[autofocus]') || bg.querySelector('input:not([type=hidden]),select,textarea,button.btn-primary');
    if (f && window.matchMedia('(pointer:fine)').matches) setTimeout(function () { try { f.focus(); } catch (e) { } }, 30);
    return m;
  }
  function konfirmasi(teks, opt) {
    opt = opt || {};
    return new Promise(function (res) {
      let jawab = false;
      const m = modal({ judul: opt.judul || 'Konfirmasi', isi: '<p>' + esc(teks).replace(/\n/g, '<br>') + '</p>' + (opt.isi || ''),
        kaki: '<button class="btn btn-sec" data-tutup>Batal</button><button class="btn ' + (opt.bahaya ? 'btn-danger' : 'btn-primary') + '" data-ya>' + esc(opt.ya || 'Ya, lanjutkan') + '</button>',
        onTutup: function () { res(jawab ? (opt.ambil ? opt.ambil(m) : true) : false); } });
      m.$('[data-ya]').onclick = function () { jawab = true; m.tutup(); };
    });
  }
  /** Tombol sibuk selama promise berjalan. */
  async function sibuk(btn, fn) { if (btn) { btn.classList.add('loading'); btn.disabled = true; } try { return await fn(); } finally { if (btn) { btn.classList.remove('loading'); btn.disabled = false; } } }
  /** Ambil nilai form → objek. */
  function nilaiForm(root) { const o = {}; root.querySelectorAll('[name]').forEach(function (el) { if (el.type === 'checkbox') o[el.name] = el.checked; else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; } else o[el.name] = el.value; }); return o; }
  function salin(teks) { if (navigator.clipboard) navigator.clipboard.writeText(teks).then(function () { toast('Tersalin ✓', 'ok'); }, function () { prompt('Salin manual:', teks); }); else prompt('Salin manual:', teks); }
  function unduh(nama, isi, mime) { const b = isi instanceof Blob ? isi : new Blob([isi], { type: mime || 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function csv(nama, rows, kolom) {
    if (!rows || !rows.length) { toast('Tidak ada data untuk diekspor.', 'err'); return; }
    kolom = kolom || Object.keys(rows[0]);
    const e = function (v) { v = v == null ? '' : String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const isi = '﻿' + kolom.map(function (k) { return e(k.label || k); }).join(',') + '\n' + rows.map(function (r) { return kolom.map(function (k) { return e(typeof k === 'object' ? (k.f ? k.f(r) : r[k.k]) : r[k]); }).join(','); }).join('\n');
    unduh(nama, isi, 'text/csv;charset=utf-8');
  }
  function bacaCsv(teks) {
    const baris = []; let cur = [], f = '', q = false;
    for (let i = 0; i < teks.length; i++) {
      const c = teks[i];
      if (q) { if (c === '"' && teks[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
      else if (c === '"') q = true; else if (c === ',' || c === ';') { cur.push(f); f = ''; } else if (c === '\n') { cur.push(f); baris.push(cur); cur = []; f = ''; } else if (c !== '\r') f += c;
    }
    if (f || cur.length) { cur.push(f); baris.push(cur); }
    const h = (baris.shift() || []).map(function (x) { return x.replace(/^﻿/, '').trim(); });
    return baris.filter(function (r) { return r.join('').trim(); }).map(function (r) { const o = {}; h.forEach(function (k, i) { o[k] = (r[i] || '').trim(); }); return o; });
  }

  /* ---------- Foto: kompres di perangkat (maks ±1 MB) ---------- */
  function kompresFoto(file, maks) {
    maks = maks || 1280;
    return new Promise(function (res, rej) {
      if (!file) return rej(new Error('Tidak ada berkas.'));
      if (file.type === 'application/pdf') { if (file.size > 1200000) return rej(new Error('PDF maksimal 1,2 MB.')); const r = new FileReader(); r.onload = function () { res({ b64: String(r.result).split(',')[1], mime: 'application/pdf', url: '' }); }; r.onerror = rej; r.readAsDataURL(file); return; }
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        let w = img.naturalWidth, h = img.naturalHeight; const s = Math.min(1, maks / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
        let q = .78, d = cv.toDataURL('image/jpeg', q);
        while (d.length > 1350000 && q > .35) { q -= .1; d = cv.toDataURL('image/jpeg', q); }
        URL.revokeObjectURL(url); res({ b64: d.split(',')[1], mime: 'image/jpeg', url: d });
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Berkas bukan gambar yang valid.')); };
      img.src = url;
    });
  }

  /* ---------- Pemuat skrip malas ---------- */
  const _skrip = {};
  function muatSkrip(src) { if (_skrip[src]) return _skrip[src]; _skrip[src] = new Promise(function (res, rej) { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { delete _skrip[src]; rej(new Error('Gagal memuat ' + src)); }; document.head.appendChild(s); }); return _skrip[src]; }
  const QR_CDN = './js/vendor/qrcode.js?v=2.0.4';   // qrcode-generator 2.0.4 (MIT), disimpan lokal agar jalan offline
  function muatQR() { return W.qrcode ? Promise.resolve() : muatSkrip(QR_CDN); }
  function qrDataUrl(teks, sel) { if (!W.qrcode) return ''; const q = W.qrcode(0, 'M'); q.addData(String(teks)); q.make(); return q.createDataURL(sel || 4, 2); }

  /* ---------- Router hash ---------- */
  const Router = {
    rute: [],
    on: function (pola, fn) { this.rute.push({ p: pola, fn: fn }); },
    jalan: function () {
      const h = location.hash || '#/';
      if (!/^#\//.test(h)) return;   // anchor biasa di landing
      for (let i = 0; i < this.rute.length; i++) { const m = h.match(this.rute[i].p); if (m) { this.rute[i].fn(m); return; } }
    }
  };
  W.addEventListener('hashchange', function () { Router.jalan(); });
  function tampil(id) { ['landing', 'solo', 'panel'].forEach(function (x) { const el = document.getElementById(x); if (el) el.hidden = x !== id; }); }

  /* ---------- PWA: service worker & tombol pasang ---------- */
  let _promptPasang = null;
  const Pasang = {
    standalone: function () { return W.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; },
    ios: function () { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); },
    bisa: function () { return !this.standalone() && (!!_promptPasang || this.ios()); },
    segarkanTombol: function () { document.querySelectorAll('[data-pasang]').forEach(function (b) { b.hidden = Pasang.standalone(); }); const lp = document.getElementById('btnPasangLp'); if (lp) lp.hidden = !Pasang.bisa(); },
    tampil: async function () {
      if (this.standalone()) { toast('Aplikasi sudah terpasang di perangkat ini ✓', 'ok'); return; }
      if (_promptPasang) { _promptPasang.prompt(); const r = await _promptPasang.userChoice; if (r.outcome === 'accepted') toast('Terpasang! Buka dari layar utama.', 'ok'); _promptPasang = null; this.segarkanTombol(); return; }
      modal({ judul: 'Pasang di HP / Desktop', isi: '<div class="install-card">' +
        (this.ios() ? '<p><b>iPhone / iPad (Safari)</b></p><ol><li>Buka situs ini di <b>Safari</b>.</li><li>Ketuk tombol <b>Bagikan</b> ' + ic('upload', 's') + ' di bawah.</li><li>Pilih <b>Tambahkan ke Layar Utama</b> → <b>Tambah</b>.</li></ol>'
          : '<p><b>Android (Chrome)</b></p><ol><li>Ketuk menu <b>⋮</b> di kanan atas.</li><li>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</li></ol><p><b>Laptop / PC (Chrome/Edge)</b></p><ol><li>Klik ikon <b>Instal</b> ' + ic('download', 's') + ' di ujung kanan kolom alamat.</li><li>Atau menu <b>⋮</b> → <b>Instal RentFleet</b>.</li></ol>') +
        '<p class="hint">Aplikasi terbuka layar penuh, lebih cepat, dan tetap bisa dibuka saat sinyal lemah.</p></div>', kaki: '<button class="btn btn-primary" data-tutup>Mengerti</button>' });
    }
  };
  W.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); _promptPasang = e; Pasang.segarkanTombol(); });
  W.addEventListener('appinstalled', function () { _promptPasang = null; Pasang.segarkanTombol(); });
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    W.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').then(function (reg) {
        reg.addEventListener('updatefound', function () { const nw = reg.installing; if (!nw) return; nw.addEventListener('statechange', function () { if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('Versi baru tersedia — muat ulang halaman untuk memakai.', '', 6000); }); });
      }).catch(function () { });
    });
  }
  W.addEventListener('online', function () { const el = document.getElementById('syncDot'); if (el) el.className = 'sync-dot'; toast('Kembali online ✓', 'ok'); });
  W.addEventListener('offline', function () { const el = document.getElementById('syncDot'); if (el) el.className = 'sync-dot off'; toast('Koneksi terputus. Data terakhir tetap ditampilkan.', 'err'); });

  /* ---------- Aktivitas pengguna (polling adaptif) ---------- */
  const Aktivitas = { at: Date.now(), last: {},
    init: function () { ['pointerdown', 'keydown', 'wheel', 'touchstart', 'focus'].forEach(function (ev) { W.addEventListener(ev, function () { Aktivitas.at = Date.now(); }, { passive: true }); }); },
    diam: function () { return Date.now() - this.at > 120000; },
    jatuh: function (k, aktif, diam) { if (document.visibilityState !== 'visible') return false; if (Date.now() - (this.last[k] || 0) < (this.diam() ? diam : aktif) - 500) return false; this.last[k] = Date.now(); return true; } };
  Aktivitas.init();

  /* ---------- Ilustrasi kendaraan (placeholder foto) ---------- */
  function ilustrasi(kat, warna) {
    const c = warna || '#1D4ED8';
    if (kat === 'Motor') return '<svg viewBox="0 0 200 120" aria-hidden="true"><ellipse cx="100" cy="104" rx="80" ry="6" fill="#0F172A" opacity=".08"/><circle cx="48" cy="84" r="20" fill="none" stroke="#0F172A" stroke-width="7"/><circle cx="150" cy="84" r="20" fill="none" stroke="#0F172A" stroke-width="7"/><path d="M48 84 L82 52 L118 52 L132 70 L150 84" fill="none" stroke="' + c + '" stroke-width="8" stroke-linejoin="round"/><path d="M76 48 h44 c10 0 14 8 10 16 l-6 6 h-56z" fill="' + c + '"/><path d="M126 40 l18 -6" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/><rect x="84" y="36" width="30" height="10" rx="5" fill="#0F172A"/></svg>';
    return '<svg viewBox="0 0 220 120" aria-hidden="true"><ellipse cx="110" cy="104" rx="96" ry="7" fill="#0F172A" opacity=".08"/><path d="M20 78 c0-12 6-20 18-22 l26-4 l22-20 c6-5 12-7 20-7 h44 c10 0 18 4 24 12 l14 18 c14 2 22 8 24 18 v10 c0 4-3 6-6 6 H24 c-3 0-4-2-4-5z" fill="' + c + '"/><path d="M92 34 h40 c6 0 10 2 14 6 l12 14 H74z" fill="#DBEAFE"/><line x1="116" y1="34" x2="116" y2="54" stroke="' + c + '" stroke-width="4"/><circle cx="60" cy="86" r="17" fill="#0F172A"/><circle cx="60" cy="86" r="7" fill="#CBD5E1"/><circle cx="166" cy="86" r="17" fill="#0F172A"/><circle cx="166" cy="86" r="7" fill="#CBD5E1"/><rect x="190" y="66" width="12" height="6" rx="3" fill="#FACC15"/></svg>';
  }

  W.RF = { VERSI: VERSI, SIAP: SIAP, GAS: GAS, ic: ic, hidrasiIkon: hidrasiIkon, esc: esc, rp: rp, rpK: rpK, angka: angka, ms: ms, wib: wib, isoTgl: isoTgl, isoWaktu: isoWaktu,
    tgl: tgl, tglPendek: tglPendek, jam: jam, durasi: durasi, relatif: relatif, BLN: BLN, HARI: HARI, p2: p2, hp08: hp08, waLink: waLink, inisial: inisial, debounce: debounce, hash: hash, badge: badge,
    LS: LS, Sesi: Sesi, Perf: Perf, api: api, apiQ: apiQ, kirim: kirim, warmUp: warmUp, Mem: Mem, muat: muat, toast: toast, modal: modal, konfirmasi: konfirmasi, sibuk: sibuk,
    nilaiForm: nilaiForm, salin: salin, unduh: unduh, csv: csv, bacaCsv: bacaCsv, kompresFoto: kompresFoto, muatSkrip: muatSkrip, muatQR: muatQR, qrDataUrl: qrDataUrl,
    Router: Router, tampil: tampil, Pasang: Pasang, Aktivitas: Aktivitas, ilustrasi: ilustrasi, STATUS_BADGE: STATUS_BADGE };
  W.Perf = Perf;
  document.addEventListener('DOMContentLoaded', function () { hidrasiIkon(document); Pasang.segarkanTombol(); });
})(window);
