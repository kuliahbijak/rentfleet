/* ============================================================
 * struk-engine.js — mesin template struk/resi thermal 58/80 mm
 * Template teks (direktif [C] [LR] [QR] …, penanda {{KUNCI|ubah}})
 * → baris → HTML pratinjau · teks/WA · PNG · byte ESC/POS.
 * Dibangun ulang mengikuti spesifikasi skill gas-struk-resi-printer.
 * ============================================================ */
(function (W) {
  'use strict';
  const CFG = {
    rp: function (n) { n = Math.round(Number(n) || 0); return (n < 0 ? '-Rp ' : 'Rp ') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    angka: function (n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    tgl: function (s) { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return String(s || ''); return Number(m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][Number(m[2]) - 1] + ' ' + m[1]; }
  };
  function atur(o) { Object.keys(o || {}).forEach(function (k) { CFG[k] = o[k]; }); }

  /* ---------- Teks ---------- */
  function ascii(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[•·]/g, '-').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/×/g, 'x').replace(/→/g, '->').replace(/←/g, '<-').replace(/✓/g, 'v')
      .replace(/[^\x20-\x7E]/g, '');
  }
  const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  function terbilang(n) {
    n = Math.floor(Math.abs(Number(n) || 0));
    if (n < 12) return SATUAN[n];
    if (n < 20) return terbilang(n - 10) + ' belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '');
    if (n < 200) return 'seratus' + (n - 100 ? ' ' + terbilang(n - 100) : '');
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '');
    if (n < 2000) return 'seribu' + (n - 1000 ? ' ' + terbilang(n - 1000) : '');
    if (n < 1e6) return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '');
    if (n < 1e9) return terbilang(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + terbilang(n % 1e6) : '');
    if (n < 1e12) return terbilang(Math.floor(n / 1e9)) + ' miliar' + (n % 1e9 ? ' ' + terbilang(n % 1e9) : '');
    return terbilang(Math.floor(n / 1e12)) + ' triliun' + (n % 1e12 ? ' ' + terbilang(n % 1e12) : '');
  }
  function kosong(v) { return v === undefined || v === null || v === '' || v === 0 || v === '0' || (Array.isArray(v) && !v.length); }
  /** Terapkan rantai pengubah: rp, angka, kapital, kecil, judul, tgl, terbilang[:rupiah], potong:N, bawaan:x, kosong0, awal:x, akhir:x */
  function ubah(nilai, daftar) {
    let v = nilai;
    (daftar || []).forEach(function (m) {
      const i = m.indexOf(':'), nm = (i < 0 ? m : m.slice(0, i)).trim().toLowerCase(), arg = i < 0 ? '' : m.slice(i + 1);
      const ada = !(v === undefined || v === null || v === '');
      if (nm === 'kosong0') { if (Number(v) === 0 && ada && !isNaN(Number(v))) v = ''; }
      else if (nm === 'rp') { if (ada) v = CFG.rp(v); }
      else if (nm === 'angka') { if (ada) v = CFG.angka(v); }
      else if (nm === 'kapital') v = String(v == null ? '' : v).toUpperCase();
      else if (nm === 'kecil') v = String(v == null ? '' : v).toLowerCase();
      else if (nm === 'judul') v = String(v == null ? '' : v).toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      else if (nm === 'tgl') { if (ada) v = CFG.tgl(v); }
      else if (nm === 'terbilang') { if (ada) { const t = terbilang(v); v = (t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Nol') + (arg === 'rupiah' ? ' rupiah' : ''); } }
      else if (nm === 'potong') { const n = Number(arg) || 20; v = String(v == null ? '' : v); if (v.length > n) v = v.slice(0, n - 1) + '.'; }
      else if (nm === 'bawaan') { if (!ada) v = arg; }
      else if (nm === 'awal') { if (ada) v = arg + v; }
      else if (nm === 'akhir') { if (ada) v = v + arg; }
    });
    return v === undefined || v === null ? '' : String(v);
  }

  /* ---------- Template → baris ---------- */
  function cari(ctx, key) {
    const parts = String(key).split('.');
    for (let c = ctx; c; c = c.p) {
      const k = Object.keys(c.v).filter(function (x) { return x.toUpperCase() === parts[0].toUpperCase(); })[0];
      if (k !== undefined) {
        let v = c.v[k];
        for (let i = 1; i < parts.length; i++) { if (v == null) return ''; const kk = Object.keys(v).filter(function (x) { return x.toUpperCase() === parts[i].toUpperCase(); })[0]; v = kk === undefined ? '' : v[kk]; }
        return v;
      }
    }
    return undefined;
  }
  /** Bentangkan blok {{#X}}…{{/X}} dan {{?X}}…{{/X}} yang berdiri di baris sendiri. */
  function bentang(lines, ctx) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i], t = L.trim();
      const m = t.match(/^\{\{([#?])([\w.]+)\}\}$/);
      if (!m) { out.push({ s: L, c: ctx }); continue; }
      // cari penutup yang seimbang
      let dalam = 1, j = i + 1;
      for (; j < lines.length; j++) {
        const tt = lines[j].trim();
        if (/^\{\{[#?][\w.]+\}\}$/.test(tt)) dalam++;
        else if (/^\{\{\/[\w.]+\}\}$/.test(tt)) { dalam--; if (dalam === 0) break; }
      }
      const isi = lines.slice(i + 1, j), v = cari(ctx, m[2]);
      if (m[1] === '#') {
        const arr = Array.isArray(v) ? v : (kosong(v) ? [] : [v]);
        arr.forEach(function (it, idx) { const vv = {}; vv[m[2].split('.').pop()] = typeof it === 'object' ? Object.assign({ NO: idx + 1 }, it) : it; Array.prototype.push.apply(out, bentang(isi, { v: vv, p: ctx })); });
      } else if (!kosong(v)) Array.prototype.push.apply(out, bentang(isi, ctx));
      i = j;
    }
    return out;
  }
  /** Ganti penanda di satu baris. → { s, adaPenanda, semuaKosong } */
  function isiBaris(s, ctx) {
    let ada = 0, terisi = 0;
    // kondisi sebaris {{?K}}…{{/K}}
    s = s.replace(/\{\{\?([\w.]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, function (_, k, isi) { ada++; if (kosong(cari(ctx, k))) return ''; terisi++; return isi; });
    s = s.replace(/\{\{([\w.]+)((?:\|[^}|]*)*)\}\}/g, function (_, k, mods) {
      ada++;
      const v = ubah(cari(ctx, k), mods ? mods.slice(1).split('|') : []);
      if (v !== '') terisi++;
      return v;
    });
    return { s: s, ada: ada, kosong: ada > 0 && terisi === 0 };
  }
  function bungkus(t, w) {
    t = String(t); w = Math.max(4, w);
    if (t.length <= w) return [t];
    const kata = t.split(/(\s+)/), out = []; let cur = '';
    kata.forEach(function (k) {
      if (/^\s+$/.test(k)) { if (cur) cur += ' '; return; }
      while (k.length > w) { if (cur.trim()) { out.push(cur.trim()); cur = ''; } out.push(k.slice(0, w)); k = k.slice(w); }
      if ((cur + k).length > w) { out.push(cur.trim()); cur = k; } else cur += k;
    });
    if (cur.trim()) out.push(cur.trim());
    return out.length ? out : [''];
  }
  function rata(t, w, al) { t = String(t); const sisa = Math.max(0, w - t.length); if (al === 'C') { const a = Math.floor(sisa / 2); return ' '.repeat(a) + t + ' '.repeat(sisa - a); } if (al === 'R') return ' '.repeat(sisa) + t; return t + ' '.repeat(sisa); }
  function kolomUntuk(mm, lebarModel) { const k = Number(mm) === 80 ? 48 : 32; return lebarModel && Math.abs(lebarModel - k) <= 6 ? lebarModel : k; }

  /**
   * render(isi, data, kolom, opsi) → { lines, kolom, logo }
   * line: {t:'txt', s, al, b, sz:1|2|'h', inv} | {t:'qr', d} | {t:'bar', d} | {t:'logo'} | {t:'feed'} | {t:'cut'}
   */
  function render(isi, data, kolom, opsi) {
    opsi = opsi || {}; kolom = kolom || 32;
    const d = Object.assign({}, data || {});
    d.HEADER_LENGKAP = opsi.hemat ? '' : 'YA'; d.HEADER_RINGKAS = opsi.hemat ? 'YA' : '';
    const ctx = { v: d, p: null };
    const mentah = String(isi || '').replace(/\r/g, '').split('\n').filter(function (l) { return !/^\s*\/\//.test(l); });
    const lines = [];
    bentang(mentah, ctx).forEach(function (row) {
      let s = row.s, al = 'L', b = false, sz = 1, lr = false, dir, ganti = true;
      while (ganti) {
        ganti = false;
        const m = s.match(/^\[(LR|BOX|QR|BAR|LOGO|FEED|CUT|C|R|L|B|2|H|-|=)\]/);
        if (!m) break;
        dir = m[1]; s = s.slice(m[0].length); ganti = true;
        if (dir === 'C' || dir === 'R' || dir === 'L') al = dir; else if (dir === 'B') b = true; else if (dir === '2') sz = 2; else if (dir === 'H') sz = 'h'; else if (dir === 'LR') lr = true;
        else break;
      }
      if (dir === 'FEED') { lines.push({ t: 'feed' }); return; }
      if (dir === 'CUT') { lines.push({ t: 'cut' }); return; }
      if (dir === 'LOGO') { if (opsi.logo && opsi.logoUrl && !opsi.hemat) lines.push({ t: 'logo' }); return; }
      if (dir === '-' || dir === '=') { lines.push({ t: 'txt', s: (dir === '-' ? '-' : '=').repeat(kolom), al: 'L', b: false, sz: 1 }); return; }
      const x = isiBaris(s, row.c);
      if (x.kosong) return;
      const teks = ascii(x.s);
      if (dir === 'QR') { const q = teks.trim() || ascii(isiBaris('{{URL_VERIFIKASI}}', row.c).s); if (opsi.qr !== false && q) lines.push({ t: 'qr', d: q }); return; }
      if (dir === 'BAR') { if (opsi.barcode !== false && teks.trim()) lines.push({ t: 'bar', d: teks.trim() }); return; }
      if (dir === 'BOX') { bungkus(teks.trim(), kolom - 2).forEach(function (l) { lines.push({ t: 'txt', s: rata(l, kolom, 'C'), al: 'L', b: true, sz: 1, inv: true }); }); return; }
      const w = sz === 2 ? Math.floor(kolom / 2) : kolom;
      if (lr) {
        const p = teks.split('||'), kiri = (p[0] || '').replace(/\s+$/, ''), kanan = (p.slice(1).join('||') || '').trim();
        if (kanan.length > w - 4) { bungkus(kiri, w).forEach(function (l) { lines.push({ t: 'txt', s: rata(l, w, 'L'), al: 'L', b: b, sz: sz }); }); bungkus(kanan, w).forEach(function (l) { lines.push({ t: 'txt', s: rata(l, w, 'R'), al: 'L', b: b, sz: sz }); }); return; }
        const wk = w - kanan.length - 1, bk = bungkus(kiri, Math.max(4, wk));
        bk.forEach(function (l, i) { const akhir = i === bk.length - 1; lines.push({ t: 'txt', s: akhir ? rata(l, w - kanan.length, 'L') + kanan : rata(l, w, 'L'), al: 'L', b: b, sz: sz }); });
        return;
      }
      if (!teks.trim()) { if (!x.ada) lines.push({ t: 'txt', s: '', al: 'L', sz: 1 }); return; }
      bungkus(teks.trim(), w).forEach(function (l) { lines.push({ t: 'txt', s: rata(l, w, al), al: al, b: b, sz: sz }); });
    });
    if (opsi.hemat) { for (let i = lines.length - 1; i > 0; i--) if (lines[i].t === 'feed' && lines[i - 1].t === 'feed') lines.splice(i, 1); }
    return { lines: lines, kolom: kolom, logo: opsi.logo && opsi.logoUrl ? opsi.logoUrl : '' };
  }

  /* ---------- Code128 (set B / C) ---------- */
  const C128 = [11011001100, 11001101100, 11001100110, 10010011000, 10010001100, 10001001100, 10011001000, 10011000100, 10001100100, 11001001000, 11001000100, 11000100100, 10110011100, 10011011100, 10011001110, 10111001100, 10011101100, 10011100110, 11001110010, 11001011100, 11001001110, 11011100100, 11001110100, 11101101110, 11101001100, 11100101100, 11100100110, 11101100100, 11100110100, 11100110010, 11011011000, 11011000110, 11000110110, 10100011000, 10001011000, 10001000110, 10110001000, 10001101000, 10001100010, 11010001000, 11000101000, 11000100010, 10110111000, 10110001110, 10001101110, 10111011000, 10111000110, 10001110110, 11101110110, 11010001110, 11000101110, 11011101000, 11011100010, 11011101110, 11101011000, 11101000110, 11100010110, 11101101000, 11101100010, 11100011010, 11101111010, 11001000010, 11110001010, 10100110000, 10100001100, 10010110000, 10010000110, 10000101100, 10000100110, 10110010000, 10110000100, 10011010000, 10011000010, 10000110100, 10000110010, 11000010010, 11001010000, 11110111010, 11000010100, 10001111010, 10100111100, 10010111100, 10010011110, 10111100100, 10011110100, 10011110010, 11110100100, 11110010100, 11110010010, 11011011110, 11011110110, 11110110110, 10101111000, 10100011110, 10001011110, 10111101000, 10111100010, 11110101000, 11110100010, 10111011110, 10111101110, 11101011110, 11110101110, 11010000100, 11010010000, 11010011100, 1100011101011];
  /** → string modul '1'/'0' (termasuk start, checksum, stop). Angka genap ≥4 digit memakai set C. */
  function code128(teks) {
    teks = ascii(teks);
    let kode = [];
    if (/^\d{4,}$/.test(teks) && teks.length % 2 === 0) { kode.push(105); for (let i = 0; i < teks.length; i += 2) kode.push(Number(teks.substr(i, 2))); }
    else { kode.push(104); for (let i = 0; i < teks.length; i++) { const c = teks.charCodeAt(i) - 32; if (c >= 0 && c < 95) kode.push(c); } }
    let sum = kode[0]; for (let i = 1; i < kode.length; i++) sum += kode[i] * i;
    kode.push(sum % 103); kode.push(106);
    return kode.map(function (k) { return String(C128[k]); }).join('');
  }
  function qrMatrix(teks) {
    if (!W.qrcode) return null;
    const q = W.qrcode(0, 'M'); q.addData(String(teks)); q.make();
    const n = q.getModuleCount(), m = [];
    for (let r = 0; r < n; r++) { const row = []; for (let c = 0; c < n; c++) row.push(q.isDark(r, c) ? 1 : 0); m.push(row); }
    return m;
  }
  function qrDataUrl(teks, sel) { if (!W.qrcode) return ''; const q = W.qrcode(0, 'M'); q.addData(String(teks)); q.make(); return q.createDataURL(sel || 4, 2); }
  function barcodeDataUrl(teks, tinggi) {
    const mod = code128(teks), sel = 2, c = document.createElement('canvas');
    c.width = (mod.length + 20) * sel; c.height = tinggi || 60;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000';
    for (let i = 0; i < mod.length; i++) if (mod[i] === '1') g.fillRect((i + 10) * sel, 0, sel, c.height);
    return c.toDataURL('image/png');
  }

  /* ---------- Keluaran: HTML, teks ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function html(h) {
    const out = h.lines.map(function (l) {
      if (l.t === 'feed') return '<div class="pl">&nbsp;</div>';
      if (l.t === 'cut') return '<div class="pcut" title="potong">✂ - - - - - - - - - - - - - -</div>';
      if (l.t === 'logo') return '<div class="pimg"><img src="' + esc(h.logo) + '" alt="" style="max-width:60%;max-height:80px;filter:grayscale(1) contrast(1.4)"></div>';
      if (l.t === 'qr') { const u = qrDataUrl(l.d, 3); return '<div class="pimg">' + (u ? '<img src="' + u + '" alt="QR" style="width:' + (h.kolom >= 48 ? 44 : 60) + '%;image-rendering:pixelated">' : '[QR]') + '</div>'; }
      if (l.t === 'bar') return '<div class="pimg"><img src="' + barcodeDataUrl(l.d) + '" alt="barcode" style="width:92%;height:46px;image-rendering:pixelated"><div class="pl" style="text-align:center">' + esc(l.d) + '</div></div>';
      return '<div class="pl' + (l.b ? ' b' : '') + (l.sz === 2 ? ' s2' : l.sz === 'h' ? ' sh' : '') + (l.inv ? ' inv' : '') + '">' + (esc(l.s).replace(/ /g, '&nbsp;') || '&nbsp;') + '</div>';
    }).join('');
    return '<div class="paper" style="--kol:' + h.kolom + '">' + out + '</div>';
  }
  function teks(h) {
    return h.lines.map(function (l) {
      if (l.t === 'feed') return '';
      if (l.t === 'cut') return '-'.repeat(h.kolom);
      if (l.t === 'qr') return '[QR] ' + l.d;
      if (l.t === 'bar') return '|||| ' + l.d + ' ||||';
      if (l.t === 'logo') return '';
      return l.sz === 2 ? rata(l.s.trim(), h.kolom, l.al === 'L' ? 'L' : l.al) : l.s.replace(/\s+$/, '');
    }).join('\n').replace(/\n{3,}/g, '\n\n');
  }
  function panjangCm(h) { let n = 0; h.lines.forEach(function (l) { n += l.t === 'qr' ? 30 : l.t === 'bar' ? 10 : l.t === 'logo' ? 12 : l.t === 'cut' ? 4 : (l.sz === 2 || l.sz === 'h' ? 7 : 3.75); }); return Math.round(n / 10 * 10) / 10; }

  /* ---------- Gambar (logo/QR/barcode) → bitmap ---------- */
  function muatGambar(src) { return new Promise(function (res) { if (!src) return res(null); const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; }); }
  function bitmapDariCanvas(c) {
    const g = c.getContext('2d'); let data;
    try { data = g.getImageData(0, 0, c.width, c.height).data; } catch (e) { return null; }   // gambar tanpa CORS
    const wb = Math.ceil(c.width / 8), out = new Uint8Array(wb * c.height);
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4, lum = data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114;
      if (data[i + 3] > 128 && lum < 140) out[y * wb + (x >> 3)] |= 0x80 >> (x & 7);
    }
    return { w: c.width, h: c.height, wb: wb, bits: out };
  }
  function bitmapQR(teks, lebar) {
    const m = qrMatrix(teks); if (!m) return null;
    const n = m.length, sel = Math.max(2, Math.floor(Math.min(240, lebar * .62) / n)), ukuran = n * sel, pad = Math.floor((lebar - ukuran) / 2);
    const wb = Math.ceil(lebar / 8), bits = new Uint8Array(wb * ukuran);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (m[r][c]) for (let dy = 0; dy < sel; dy++) for (let dx = 0; dx < sel; dx++) { const x = pad + c * sel + dx, y = r * sel + dy; bits[y * wb + (x >> 3)] |= 0x80 >> (x & 7); }
    return { w: lebar, h: ukuran, wb: wb, bits: bits };
  }
  function bitmapBar(teks, lebar) {
    const mod = code128(teks), quiet = 20, total = mod.length + quiet;
    const sel = Math.max(1, Math.min(3, Math.floor(lebar / total))), lw = mod.length * sel, pad = Math.floor((lebar - lw) / 2), tinggi = 64;
    const wb = Math.ceil(lebar / 8), bits = new Uint8Array(wb * tinggi);
    for (let i = 0; i < mod.length; i++) if (mod[i] === '1') for (let dx = 0; dx < sel; dx++) { const x = pad + i * sel + dx; for (let y = 0; y < tinggi; y++) bits[y * wb + (x >> 3)] |= 0x80 >> (x & 7); }
    return { w: lebar, h: tinggi, wb: wb, bits: bits };
  }

  /* ---------- PNG ---------- */
  function png(h, opsi) {
    opsi = opsi || {};
    const lebar = h.kolom >= 48 ? 576 : 384, pad = 12, cw = (lebar - pad * 2) / h.kolom, fs = cw / .6, lh = Math.round(fs * 1.28);
    return muatGambar(h.logo).then(function (logo) {
      let tinggi = pad * 2;
      const tinggiL = function (l) { return l.t === 'qr' ? Math.min(240, lebar * .62) + 10 : l.t === 'bar' ? 64 + lh + 8 : l.t === 'logo' ? (logo ? 90 : 0) : l.t === 'cut' ? lh : (l.sz === 2 || l.sz === 'h' ? lh * 2 : lh); };
      h.lines.forEach(function (l) { tinggi += tinggiL(l); });
      const c = document.createElement('canvas'); c.width = lebar; c.height = Math.ceil(tinggi); const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000'; g.textBaseline = 'top';
      let y = pad;
      h.lines.forEach(function (l) {
        const t = tinggiL(l);
        if (l.t === 'txt') {
          const sx = l.sz === 2 ? 2 : 1, sy = l.sz === 2 || l.sz === 'h' ? 2 : 1;
          g.save(); g.translate(pad, y); g.scale(sx, sy);
          if (l.inv) { g.fillRect(0, 0, (lebar - pad * 2) / sx, lh); g.fillStyle = '#fff'; }
          g.font = (l.b ? '700 ' : '400 ') + fs + 'px "Courier New", ui-monospace, monospace';
          for (let i = 0; i < l.s.length; i++) g.fillText(l.s[i], i * cw, (lh - fs) / 2);
          g.restore(); g.fillStyle = '#000';
        } else if (l.t === 'qr' || l.t === 'bar') {
          const bm = l.t === 'qr' ? bitmapQR(l.d, lebar) : bitmapBar(l.d, lebar);
          if (bm) for (let yy = 0; yy < bm.h; yy++) for (let xx = 0; xx < bm.w; xx++) if (bm.bits[yy * bm.wb + (xx >> 3)] & (0x80 >> (xx & 7))) g.fillRect(xx, y + yy, 1, 1);
          if (l.t === 'bar') { g.font = '400 ' + fs + 'px "Courier New", monospace'; g.textAlign = 'center'; g.fillText(l.d, lebar / 2, y + 68); g.textAlign = 'left'; }
        } else if (l.t === 'logo' && logo) {
          const s = Math.min(lebar * .6 / logo.width, 80 / logo.height); g.drawImage(logo, (lebar - logo.width * s) / 2, y, logo.width * s, logo.height * s);
        } else if (l.t === 'cut') { g.setLineDash([6, 6]); g.beginPath(); g.moveTo(0, y + lh / 2); g.lineTo(lebar, y + lh / 2); g.stroke(); g.setLineDash([]); }
        y += t;
      });
      return c.toDataURL('image/png');
    });
  }

  /* ---------- ESC/POS ---------- */
  function escpos(h, opsi) {
    opsi = opsi || {};
    const lebar = h.kolom >= 48 ? 576 : 384, B = [];
    const push = function () { for (let i = 0; i < arguments.length; i++) { const a = arguments[i]; if (typeof a === 'number') B.push(a); else for (let j = 0; j < a.length; j++) B.push(a[j]); } };
    const str = function (s) { s = ascii(s); const o = []; for (let i = 0; i < s.length; i++) o.push(s.charCodeAt(i)); return o; };
    const raster = function (bm) { if (!bm) return; push([0x1B, 0x61, 0], [0x1D, 0x76, 0x30, 0, bm.wb & 0xff, bm.wb >> 8, bm.h & 0xff, bm.h >> 8]); for (let i = 0; i < bm.bits.length; i++) B.push(bm.bits[i]); push(0x0A); };
    return muatGambar(h.logo).then(function (logo) {
      push([0x1B, 0x40]);                                        // ESC @ reset
      push([0x1B, 0x47, opsi.density === 'tebal' ? 1 : 0]);      // ESC G cetak ganda (lebih pekat)
      h.lines.forEach(function (l) {
        if (l.t === 'feed') { push([0x1B, 0x64, 1]); return; }
        if (l.t === 'cut') { push([0x1B, 0x64, 3]); if (opsi.autoCut !== false) push([0x1D, 0x56, 66, 0]); return; }
        if (l.t === 'qr') { raster(bitmapQR(l.d, lebar)); return; }
        if (l.t === 'bar') { raster(bitmapBar(l.d, lebar)); push([0x1B, 0x61, 1], str(l.d), 0x0A); return; }
        if (l.t === 'logo') {
          if (!logo) return;
          const c = document.createElement('canvas'), s = Math.min(lebar * .7 / logo.width, 120 / logo.height);
          c.width = Math.round(logo.width * s); c.height = Math.round(logo.height * s);
          const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(logo, 0, 0, c.width, c.height);
          const bm = bitmapDariCanvas(c); if (bm) { push([0x1B, 0x61, 1]); raster(bm); }
          return;
        }
        push([0x1B, 0x61, 0], [0x1B, 0x45, l.b ? 1 : 0], [0x1D, 0x21, l.sz === 2 ? 0x11 : l.sz === 'h' ? 0x01 : 0], [0x1D, 0x42, l.inv ? 1 : 0]);
        push(str(l.sz === 2 ? l.s.replace(/\s+$/, '') : l.s.replace(/\s+$/, '')), 0x0A);
        push([0x1D, 0x42, 0], [0x1D, 0x21, 0], [0x1B, 0x45, 0]);
      });
      if (!h.lines.length || h.lines[h.lines.length - 1].t !== 'cut') { push([0x1B, 0x64, 3]); if (opsi.autoCut) push([0x1D, 0x56, 66, 0]); }
      if (opsi.beep) push([0x1B, 0x42, 2, 2]);
      return new Uint8Array(B);
    });
  }

  W.StrukEngine = { atur: atur, render: render, html: html, teks: teks, png: png, escpos: escpos, panjangCm: panjangCm, ubah: ubah, terbilang: terbilang,
    code128: code128, qrMatrix: qrMatrix, qrDataUrl: qrDataUrl, barcodeDataUrl: barcodeDataUrl, ascii: ascii, esc: esc, kolomUntuk: kolomUntuk, bungkus: bungkus, VERSI: '1.0-rentfleet' };
})(window);
