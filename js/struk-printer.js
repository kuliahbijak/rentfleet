/* ============================================================
 * struk-printer.js — pengaturan berlapis & jalur cetak:
 * Web Bluetooth ESC/POS · RawBT (Android) · dialog cetak browser,
 * plus PNG & WhatsApp. Selalu ada jalan cetak (fallback browser).
 * ============================================================ */
(function (W) {
  'use strict';
  const E = W.StrukEngine;
  const BAWAAN = { lebar: 58, serah58: 'SERAH_58', serah80: 'SERAH_80', struk58: 'STRUK_58', struk80: 'STRUK_80', metode: 'browser', qr: true, logo: false, hemat: false, salinan: 1, kepekatan: 'normal', potong: true, beep: false, otomatis: true };
  const S = { templates: [], server: {}, logoUrl: '', appUrl: '', onPutus: null };
  const KUNCI_LOKAL = 'rf_printer';
  const CADANGAN = {
    SERAH: '[C][B]{{TOKO_NAMA}}\n[C]{{TIPE}}\n[-]\n[LR]Kode||{{KODE}}\n[LR]Unit||{{UNIT}} {{PLAT}}\n[LR]Penyewa||{{PENYEWA}}\n[LR]BBM||{{BBM}}%\n[LR]Odometer||{{ODO|angka}} km\n[-]\n[QR]\n[CUT]',
    STRUK: '[C][B]{{TOKO_NAMA}}\n[C]BUKTI PEMBAYARAN\n[-]\n[LR]No||{{NOTA}}\n[LR]Booking||{{KODE}}\n[LR]{{JENIS_BAYAR}}||{{NOMINAL|rp}}\n[LR]Sisa||{{SISA|rp}}\n[-]\n[QR]\n[CUT]'
  };

  function pasang(o) { o = o || {}; if (o.templates) S.templates = o.templates; if (o.server) S.server = o.server; if (o.logoUrl !== undefined) S.logoUrl = o.logoUrl; if (o.appUrl) S.appUrl = o.appUrl; if (o.onPutus) S.onPutus = o.onPutus; }
  function lokal() { try { return JSON.parse(localStorage.getItem(KUNCI_LOKAL) || '{}') || {}; } catch (e) { return {}; } }
  function simpanLokal(st) { try { localStorage.setItem(KUNCI_LOKAL, JSON.stringify(st || {})); } catch (e) { } }
  /** bawaan modul ← default Owner (server) ← pilihan perangkat ← opsi sesaat */
  function pengaturan(sesaat) { return Object.assign({}, BAWAAN, S.server || {}, lokal(), sesaat || {}); }
  function daftar(jenis) { return S.templates.filter(function (t) { return !jenis || t.jenis === jenis; }); }
  function template(kode, jenis) {
    const t = S.templates.filter(function (x) { return x.kode === kode; })[0];
    if (t) return t;
    const alt = daftar(jenis)[0];
    return alt || { kode: 'CADANGAN', nama: 'Cadangan', jenis: jenis, lebar: 32, isi: CADANGAN[jenis] || CADANGAN.STRUK };
  }
  function pilihKode(st, jenis) {
    const k = st[String(jenis).toLowerCase() + st.lebar];
    if (k && S.templates.some(function (t) { return t.kode === k; })) return k;
    const cocok = daftar(jenis).filter(function (t) { return E.kolomUntuk(st.lebar) === E.kolomUntuk(st.lebar, t.lebar); })[0];
    return cocok ? cocok.kode : (daftar(jenis)[0] || {}).kode;
  }
  /** Render data → hasil siap cetak. */
  function siapkan(data, o) {
    o = o || {};
    const st = pengaturan(o);
    const tpl = template(o.kode || pilihKode(st, o.jenis || 'STRUK'), o.jenis || 'STRUK');
    const kolom = E.kolomUntuk(st.lebar, tpl.lebar);
    const h = E.render(tpl.isi, data, kolom, { qr: st.qr, logo: st.logo, logoUrl: S.logoUrl, hemat: st.hemat });
    h.tpl = tpl; h.st = st; h.data = data;
    return h;
  }

  /* ---------- Web Bluetooth ---------- */
  const SERVIS = ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2', '49535343-fe7d-4ae5-8fa9-9fafd205e455', '0000ff00-0000-1000-8000-00805f9b34fb', '0000ffe0-0000-1000-8000-00805f9b34fb', '0000fee7-0000-1000-8000-00805f9b34fb'];
  const BT = {
    dev: null, ch: null,
    didukung: function () { return !!(navigator.bluetooth && W.isSecureContext); },
    terhubung: function () { return !!(this.dev && this.dev.gatt && this.dev.gatt.connected && this.ch); },
    nama: function () { return this.dev ? this.dev.name || 'Printer' : ''; },
    hubungkan: async function () {
      if (!this.didukung()) throw new Error('Browser ini tidak mendukung Web Bluetooth (pakai Chrome Android/desktop, atau RawBT).');
      const dev = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: SERVIS });
      const gatt = await dev.gatt.connect();
      let ch = null;
      const servs = await gatt.getPrimaryServices();
      for (let i = 0; i < servs.length && !ch; i++) {
        const cs = await servs[i].getCharacteristics();
        for (let j = 0; j < cs.length; j++) if (cs[j].properties.write || cs[j].properties.writeWithoutResponse) { ch = cs[j]; break; }
      }
      if (!ch) throw new Error('Printer tidak punya karakteristik tulis. Coba RawBT.');
      this.dev = dev; this.ch = ch;
      dev.addEventListener('gattserverdisconnected', function () { BT.ch = null; if (S.onPutus) S.onPutus(); });
      return dev.name || 'Printer';
    },
    kirim: async function (bytes) {
      if (!this.terhubung()) await this.hubungkan();
      for (let i = 0; i < bytes.length; i += 180) {
        const pot = bytes.slice(i, i + 180);
        if (this.ch.properties.writeWithoutResponse && this.ch.writeValueWithoutResponse) await this.ch.writeValueWithoutResponse(pot); else await this.ch.writeValue(pot);
        await new Promise(function (r) { setTimeout(r, 18); });
      }
    }
  };
  /* ---------- RawBT (intent Android) ---------- */
  function rawbt(bytes) {
    let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const url = 'intent:base64,' + btoa(bin) + '#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;';
    W.location.href = url;
  }
  /* ---------- Dialog cetak browser ---------- */
  function cetakBrowser(h, salinan) {
    const mm = h.kolom >= 48 ? 80 : 58;
    const css = '@page{size:' + mm + 'mm auto;margin:0}html,body{margin:0;padding:0;background:#fff}body{width:' + mm + 'mm}.paper{font-family:"Courier New",ui-monospace,monospace;font-size:' + (mm === 80 ? '11.2px' : '11.4px') + ';line-height:1.25;color:#000;width:' + (mm - 6) + 'mm;margin:0 auto;padding:3mm 0;word-break:break-all}' +
      '.pl{white-space:pre;overflow:hidden}.b{font-weight:700}.s2{font-size:2em;font-weight:700;line-height:1.1}.sh{transform:scaleY(2);transform-origin:top;margin-bottom:1.25em;font-weight:700}.inv{background:#000;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.pimg{text-align:center;margin:4px 0}.pimg img{display:inline-block}.pcut{text-align:center;color:#999;page-break-after:always;break-after:page;font-size:9px}';
    const isi = new Array(Math.max(1, Math.min(3, salinan || 1))).fill(E.html(h)).join('<div style="page-break-after:always"></div>');
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(f);
    const d = f.contentWindow.document;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><title>Cetak</title><style>' + css + '</style></head><body>' + isi + '</body></html>'); d.close();
    return new Promise(function (res) {
      const go = function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { } setTimeout(function () { f.remove(); res(); }, 1500); };
      const imgs = d.images, n = imgs.length; if (!n) return setTimeout(go, 100);
      let k = 0; for (let i = 0; i < n; i++) { if (imgs[i].complete) { if (++k === n) setTimeout(go, 60); } else imgs[i].onload = imgs[i].onerror = function () { if (++k === n) setTimeout(go, 60); }; }
    });
  }

  /** Cetak sesuai metode; bila gagal → otomatis dialog cetak browser. */
  async function cetak(h, st) {
    st = st || h.st || pengaturan();
    const opsi = { autoCut: st.potong, beep: st.beep, density: st.kepekatan };
    if (st.metode === 'bt' || st.metode === 'rawbt') {
      try {
        const bytes = await E.escpos(h, opsi);
        if (st.metode === 'bt') { for (let i = 0; i < (st.salinan || 1); i++) await BT.kirim(bytes); return { cara: 'bt' }; }
        const all = new Uint8Array(bytes.length * (st.salinan || 1)); for (let i = 0; i < (st.salinan || 1); i++) all.set(bytes, i * bytes.length);
        rawbt(all); return { cara: 'rawbt' };
      } catch (e) {
        await cetakBrowser(h, st.salinan);
        return { cara: 'browser', cadangan: (st.metode === 'bt' ? 'Bluetooth' : 'RawBT') + ' gagal: ' + (e && e.message ? e.message : e) };
      }
    }
    await cetakBrowser(h, st.salinan);
    return { cara: 'browser' };
  }
  function tes(st) {
    const data = { TOKO_NAMA: 'TES PRINTER', TOKO_ALAMAT: 'RentFleet', TOKO_WA: '-', KODE: 'TES-001', TIPE: 'TES CETAK ' + (st && st.lebar || 58) + ' MM', PENYEWA: 'Contoh', UNIT: 'Abcdefghijklmnopqrstuvwxyz 0123456789', PLAT: 'B 1234 XYZ', BBM: 100, ODO: 12345, URL_VERIFIKASI: 'https://contoh.github.io/#/v/TES' };
    const h = siapkan(data, Object.assign({ jenis: 'SERAH', kode: 'CADANGAN' }, st || {}));
    h.lines.unshift({ t: 'txt', s: '1234567890'.repeat(5).slice(0, h.kolom), al: 'L', sz: 1 });
    return cetak(h, h.st);
  }
  function waMonospace(h, judul, link) { return (judul ? '*' + judul + '*\n' : '') + '```\n' + E.teks(h) + '\n```' + (link ? '\n' + link : ''); }
  function bukaWa(no, teks) { const n = String(no || '').replace(/[^0-9]/g, '').replace(/^0/, '62'); W.open('https://wa.me/' + n + '?text=' + encodeURIComponent(teks), '_blank'); }
  function urlVerifikasi(id, kode) { return (S.appUrl || location.origin + location.pathname).replace(/\/+$/, '').replace(/\/index\.html$/, '') + '/#/v/' + id + '-' + kode; }

  W.StrukPrinter = { BAWAAN: BAWAAN, pasang: pasang, pengaturan: pengaturan, simpanLokal: simpanLokal, daftar: daftar, template: template, pilihKode: pilihKode, siapkan: siapkan,
    cetak: cetak, cetakBrowser: cetakBrowser, BT: BT, rawbt: rawbt, tes: tes, waMonospace: waMonospace, bukaWa: bukaWa, urlVerifikasi: urlVerifikasi };
})(window);
