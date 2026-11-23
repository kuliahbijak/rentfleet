/* ============================================================
 * hal-admin.js — Konten Situs & Testimoni, WhatsApp & Notifikasi
 * (blast · antrean · konfigurasi), CRM Kontak, Struk & Printer,
 * Pengguna · Keamanan · Log · Sistem · Migrasi database
 * ============================================================ */
(function (W) {
  'use strict';
  const R = W.RF, RP = W.RFPanel, UI = W.RFUI, esc = R.esc, ic = R.ic;
  const $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function tabs(id, daftar, aktif) { return '<div class="tabs" id="' + id + '">' + daftar.map(function (t) { return '<button type="button" data-t="' + t[0] + '" class="' + (aktif === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>'; }

  /* ================= KONTEN SITUS ================= */
  const GRUP = [
    ['Identitas & Hero', ['NAMA_USAHA', 'TAGLINE', 'LOGO_URL', 'HERO_LABEL', 'HERO_JUDUL', 'HERO_SUB', 'HERO_FOTO', 'META_JUDUL', 'META_DESKRIPSI']],
    ['Kontak & Lokasi', ['NO_WA', 'NO_TELP', 'EMAIL_KONTAK', 'ALAMAT', 'JAM_OPERASIONAL', 'LOKASI_AMBIL', 'MAPS_URL', 'SOSMED_IG', 'SOSMED_FB', 'SOSMED_TIKTOK']],
    ['Promo & Tentang', ['PROMO_JUDUL', 'PROMO_TEKS', 'PROMO_BANNER', 'TENTANG']],
    ['Kebijakan & FAQ', ['SYARAT_KETENTUAN', 'KEBIJAKAN_PEMBATALAN', 'KEBIJAKAN_PRIVASI', 'FAQ']],
    ['Aturan Operasional', ['HOLD_JAM', 'JEDA_ANTAR_SEWA_MENIT', 'BATAS_PERMINTAAN_PER_JAM', 'DEPOSIT_MOBIL', 'DEPOSIT_MOTOR', 'AUTO_KONFIRMASI_DP', 'KELENGKAPAN_MOBIL', 'KELENGKAPAN_MOTOR', 'FOTO_MIN', 'ODO_MAKS_KM_HARI', 'BIAYA_BBM_PER_10_PERSEN_MOBIL', 'BIAYA_BBM_PER_10_PERSEN_MOTOR', 'JAM_PENGINGAT', 'SERVIS_HARI_PERINGATAN', 'SERVIS_KM_PERINGATAN', 'EMAIL_ADMIN', 'WA_ADMIN']]
  ];
  const PANJANG = /JUDUL$|SUB$|TEKS|TENTANG|SYARAT|KEBIJAKAN|FAQ|KELENGKAPAN|DESKRIPSI/;
  let KT = { tab: null };
  function renderKonten(el) {
    const owner = RP.role() === 'OWNER';
    KT.tab = KT.tab || (owner ? 'Identitas & Hero' : 'Testimoni');
    const daftar = (owner ? GRUP.map(function (g) { return [g[0], g[0]]; }) : []).concat([['Testimoni', 'Testimoni']]);
    el.innerHTML = UI.kepala('Konten Situs', 'Ubah isi landing page tanpa menyentuh kode: hero, kontak, promo, kebijakan, FAQ, testimoni, dan aturan operasional.', '<a class="btn btn-sec" href="#/" target="_blank" rel="noopener">' + ic('external') + 'Lihat landing page</a>') +
      tabs('ktTab', daftar, KT.tab) + '<div id="ktIsi"><div class="skel" style="height:320px"></div></div>';
    let data = null;
    const gambar = function () {
      if (!data) return; const box = $('#ktIsi', el);
      if (KT.tab === 'Testimoni') {
        box.innerHTML = '<div class="row" style="margin:12px 0"><button class="btn btn-accent" id="tsBaru" type="button">' + ic('plus') + 'Tambah testimoni</button><span class="small muted">Hanya yang "Tampil" muncul di landing page.</span></div>' +
          UI.tabel([{ l: 'Nama', full: true, f: function (t) { return '<div class="t1">' + esc(t.nama) + ' <span class="t2">' + esc(t.kota || '') + '</span></div><div class="t2">' + '★'.repeat(Number(t.rating) || 0) + ' · ' + R.tgl(t.tanggal) + '</div>'; } },
            { l: 'Isi', f: function (t) { return '<span class="small">' + esc(String(t.isi).slice(0, 120)) + (String(t.isi).length > 120 ? '…' : '') + '</span>'; } },
            { l: 'Tampil', c: true, f: function (t) { return '<label class="switch"><input type="checkbox" data-tampil="' + esc(t.id) + '"' + (t.tampil === 'Y' ? ' checked' : '') + ' aria-label="Tampilkan"><span></span></label>'; } },
            { l: '', r: true, f: function (t) { return '<button class="btn btn-soft btn-sm" data-ts="' + esc(t.id) + '" type="button">Ubah</button>'; } }], data.testimoni, { per: 25, kosong: 'Belum ada testimoni.' });
        $('#tsBaru', box).onclick = function () { formTesti(null); };
      } else {
        const g = GRUP.filter(function (x) { return x[0] === KT.tab; })[0], peta = {};
        data.rows.forEach(function (r) { peta[r.kunci] = r; });
        box.innerHTML = '<form id="ktForm" class="sec-card" style="margin-top:14px"><div class="grid-2">' + g[1].map(function (k) {
          const r = peta[k] || { nilai: '', keterangan: '' };
          const pj = PANJANG.test(k);
          return '<div class="field"' + (pj ? ' style="grid-column:1/-1"' : '') + '><label>' + esc(k.replace(/_/g, ' ')) + (r.publik ? ' ' + ic('globe', 's') : '') + '</label>' + (pj ? '<textarea class="input" name="' + k + '" rows="' + (k === 'FAQ' || k === 'SYARAT_KETENTUAN' ? 5 : 2) + '">' + esc(r.nilai) + '</textarea>' : '<input class="input" name="' + k + '" value="' + esc(r.nilai) + '">') + '<span class="hint">' + esc(r.keterangan) + '</span></div>';
        }).join('') + '</div><div class="row" style="justify-content:flex-end"><span class="small muted">' + ic('globe', 's') + ' = tampil di landing page</span><button class="btn btn-primary" type="submit">' + ic('check') + 'Simpan ' + esc(KT.tab) + '</button></div></form>';
        $('#ktForm', box).onsubmit = function (e) {
          e.preventDefault(); const v = R.nilaiForm(this), ubah = {};
          Object.keys(v).forEach(function (k) { if (String((peta[k] || {}).nilai || '') !== String(v[k])) ubah[k] = v[k]; });
          if (!Object.keys(ubah).length) { R.toast('Tidak ada perubahan.'); return; }
          R.sibuk(this.querySelector('[type=submit]'), async function () { const r = await R.api('situs.simpan', { nilai: ubah }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { R.LS.del('c_pubboot'); R.Mem.basi(); ambil(true); RP.boot(true); } });
        };
      }
      R.hidrasiIkon(box);
    };
    const ambil = function (paksa) { R.muat('situs', 'situs.get', {}, { umur: 60, paksa: paksa, render: function (d) { if (d) { data = d; gambar(); } } }); };
    ambil();
    $('#ktTab', el).onclick = function (e) { const b = e.target.closest('button'); if (!b) return; KT.tab = b.dataset.t; $$('#ktTab button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); gambar(); };
    $('#ktIsi', el).addEventListener('change', async function (e) {
      const t = e.target.closest('[data-tampil]'); if (!t) return;
      const ts = data.testimoni.filter(function (x) { return x.id === t.dataset.tampil; })[0]; const lama = ts.tampil; ts.tampil = t.checked ? 'Y' : 'N';
      const r = await R.api('testi.simpan', ts); if (!r.success) { ts.tampil = lama; t.checked = lama === 'Y'; R.toast(r.message, 'err'); } else { R.LS.del('c_pubboot'); R.toast(t.checked ? 'Ditampilkan.' : 'Disembunyikan.', 'ok'); }
    });
    $('#ktIsi', el).addEventListener('click', function (e) { const b = e.target.closest('[data-ts]'); if (b) formTesti(data.testimoni.filter(function (x) { return x.id === b.dataset.ts; })[0]); });
    function formTesti(t) {
      UI.formModal({ judul: t ? 'Ubah testimoni' : 'Testimoni baru', nilai: t || { rating: 5, tampil: 'Y', tanggal: R.isoTgl() },
        fields: [{ n: 'nama', l: 'Nama', req: true }, { n: 'kota', l: 'Kota / keterangan' }, { n: 'rating', l: 'Rating', t: 'select', o: [5, 4, 3, 2, 1] }, { n: 'tampil', l: 'Tampil', t: 'select', o: [['Y', 'Tampil'], ['N', 'Sembunyikan']] }, { n: 'tanggal', l: 'Tanggal', t: 'date' }, { n: 'isi', l: 'Isi testimoni', t: 'textarea', full: true, req: true, rows: 3 }],
        kakiKiri: t ? '<button class="btn btn-danger" id="tsHapus" type="button" style="margin-right:auto">' + ic('trash') + 'Hapus</button>' : '',
        buka: function (m) { const h = m.$('#tsHapus'); if (h) h.onclick = async function () { if (!(await R.konfirmasi('Hapus testimoni ini?', { bahaya: true }))) return; const r = await R.api('testi.hapus', { id: t.id }); if (r.success) { m.tutup(); ambil(true); } R.toast(r.message, r.success ? 'ok' : 'err'); }; },
        simpan: function (v) { if (t) v.id = t.id; return R.api('testi.simpan', v); }, setelah: function () { R.LS.del('c_pubboot'); ambil(true); } });
    }
  }
  RP.daftar('konten', { render: renderKonten });

  /* ================= WHATSAPP & NOTIFIKASI ================= */
  const NT = { tab: 'blast', pen: [], hanyaWA: false, batch: 20, blastAktif: '', otomatis: false, timer: null };
  function renderNotif(el) {
    const owner = RP.role() === 'OWNER';
    el.innerHTML = UI.kepala('WhatsApp &amp; Notifikasi', 'Notifikasi otomatis lewat antrean (WhatsApp Fonnte & Email), blast per batch anti-banned, dan pemantauan pengiriman.', '') +
      tabs('ntTab', [['blast', '📣 Blast WhatsApp'], ['antrean', '📬 Antrean & Riwayat']].concat(owner ? [['config', '⚙️ Konfigurasi']] : []), NT.tab) + '<div id="ntIsi" class="stack" style="margin-top:14px"></div>';
    const isi = $('#ntIsi', el);
    const pilih = function (t) { NT.tab = t; clearInterval(NT.timer); $$('#ntTab button', el).forEach(function (x) { x.classList.toggle('on', x.dataset.t === t); }); if (t === 'blast') tabBlast(isi); else if (t === 'antrean') tabAntrean(isi); else tabConfig(isi); R.hidrasiIkon(isi); };
    $('#ntTab', el).onclick = function (e) { const b = e.target.closest('button'); if (b) pilih(b.dataset.t); };
    pilih(NT.tab);
  }
  function badgeWA(s) { return s === 'Terdaftar' ? '<span class="wa-badge ya">✓ WA</span>' : s === 'Tidak Terdaftar' ? '<span class="wa-badge tidak">✕ bukan WA</span>' : '<span class="wa-badge belum">? belum dicek</span>'; }
  function tabBlast(box) {
    const segs = ['', 'Penyewa', 'Staf', 'Calon Penyewa'];
    box.innerHTML = '<div class="grid-2" style="align-items:start"><section class="sec-card"><div class="hd"><h3>1. Pilih Sasaran</h3></div>' +
      '<div class="grid-2"><div class="field"><label>Sumber</label><select class="input" id="blSum"><option value="crm">CRM Kontak</option><option value="manual">Tempel manual</option></select></div><div class="field" id="blSegF"><label>Segmen</label><select class="input" id="blSeg">' + segs.map(function (s) { return '<option value="' + s + '">' + (s || 'Semua segmen') + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="field" id="blTagF"><label>Tag (opsional)</label><input class="input" id="blTag" placeholder="mis. pelanggan-setia"></div>' +
      '<div class="field" id="blManF" hidden><label>Nomor (satu per baris: 0812…|Nama)</label><textarea class="input" id="blMan" rows="4"></textarea></div>' +
      '<div class="row"><button class="btn btn-primary btn-sm" id="blMuat" type="button">' + ic('users', 's') + 'Muat Penerima</button><button class="btn btn-sec btn-sm" id="blCek" type="button">' + ic('phone2', 's') + 'Deteksi Nomor WA</button></div>' +
      '<div id="blRing" class="pill-tabs"></div><label class="chk"><input type="checkbox" id="blHanya"' + (NT.hanyaWA ? ' checked' : '') + '> Kirim hanya ke nomor terdeteksi WhatsApp</label><div id="blList" style="max-height:340px;overflow:auto"></div></section>' +
      '<section class="sec-card"><div class="hd"><h3>2. Tulis Pesan</h3></div><div class="field"><label>Judul internal</label><input class="input" id="blJudul" placeholder="Promo akhir pekan"></div>' +
      '<div class="row">' + ['{nama}', '{usaha}'].map(function (v) { return '<button class="chip" type="button" data-var="' + v + '">' + v + '</button>'; }).join('') + '</div>' +
      '<textarea class="input" id="blPesan" rows="6" placeholder="Halo {nama}, …">Halo {nama} 👋\nAda promo sewa spesial minggu ini dari {usaha}. Balas pesan ini untuk info lengkap.\n\nBalas STOP untuk berhenti.</textarea>' +
      '<div class="lbl">Pratinjau</div><div class="wa-preview" id="blPrev"></div>' +
      '<div class="hd"><h3>3. Ukuran Batch &amp; Jeda</h3></div><div class="row"><div class="seg" id="blBatch">' + [10, 20, 50].map(function (n) { return '<button type="button" data-b="' + n + '" class="' + (NT.batch === n ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div><div class="field" style="flex:1"><input class="input" id="blJeda" value="5" placeholder="5 atau 3-8" aria-label="Jeda detik"></div></div>' +
      '<p class="small muted" id="blInfo"></p><button class="btn btn-accent btn-lg" id="blMulai" type="button" disabled>' + ic('send') + 'Mulai Blast</button>' +
      '<p class="hint">Tips anti-banned: mulai batch 10, jeda acak ≥ 5 detik (mis. 5-12), hindari tautan yang sama ke ratusan orang dalam 1 jam.</p></section></div>' +
      '<section class="sec-card" id="blProg" hidden></section><section class="sec-card"><div class="hd"><h3>Riwayat blast</h3><div class="act"><button class="btn btn-sec btn-sm" id="blSegar" type="button">' + ic('refresh', 's') + '</button></div></div><div id="blRiwayat"></div></section>';
    const v = function (id) { return $('#' + id, box); };
    const terpilih = function () { return NT.pen.filter(function (p) { return p.valid && !p.ganda && !p.optOut && p.pilih !== false && (!NT.hanyaWA || p.statusWA === 'Terdaftar'); }); };
    const prev = function () {
      const p0 = terpilih()[0] || { nama: 'Budi' };
      v('blPrev').textContent = v('blPesan').value.replace(/\{nama\}/g, p0.nama || 'Bapak/Ibu').replace(/\{usaha\}/g, RP.situs('NAMA_USAHA', ''));
      const n = terpilih().length, jd = String(v('blJeda').value).split('-').map(Number), rata = jd.length > 1 ? (jd[0] + jd[1]) / 2 : jd[0] || 5;
      v('blInfo').textContent = n + ' penerima → ' + Math.ceil(n / NT.batch) + ' batch · perkiraan ±' + Math.ceil(n * rata / 60) + ' menit';
      v('blMulai').disabled = !n; v('blMulai').innerHTML = ic('send') + 'Mulai Blast (' + n + ' nomor)';
    };
    const daftar = function () {
      const r = { total: NT.pen.length, valid: 0, ganda: 0, tidak: 0, wa: 0, opt: 0 };
      NT.pen.forEach(function (p) { if (p.valid && !p.ganda) r.valid++; if (p.ganda) r.ganda++; if (!p.valid) r.tidak++; if (p.statusWA === 'Terdaftar') r.wa++; if (p.optOut) r.opt++; });
      v('blRing').innerHTML = NT.pen.length ? ['Total ' + r.total, 'Valid ' + r.valid, 'Tidak valid ' + r.tidak, 'Ganda ' + r.ganda, 'Terdaftar WA ' + r.wa, 'Opt-out ' + r.opt].map(function (x) { return '<span class="chip">' + x + '</span>'; }).join('') : '';
      v('blList').innerHTML = NT.pen.length ? '<table class="tbl"><tbody>' + NT.pen.map(function (p, i) { const redup = !p.valid || p.ganda || p.optOut; return '<tr style="' + (redup ? 'opacity:.45' : '') + '"><td><input type="checkbox" data-i="' + i + '"' + (p.pilih !== false && !redup ? ' checked' : '') + (redup ? ' disabled' : '') + '></td><td>' + esc(p.nama || '-') + '</td><td class="tnum">' + esc(p.hp) + '</td><td>' + badgeWA(p.statusWA) + (p.optOut ? ' <span class="badge b-off">opt-out</span>' : '') + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="small muted">Tekan "Muat Penerima".</p>';
      prev();
    };
    v('blSum').onchange = function () { const m = this.value === 'manual'; v('blManF').hidden = !m; v('blSegF').hidden = m; v('blTagF').hidden = m; };
    v('blMuat').onclick = function () { R.sibuk(this, async function () { const r = await R.api('wa.audience', { sumber: v('blSum').value, segmen: v('blSeg').value, tag: v('blTag').value.trim(), teks: v('blMan').value, ids: NT.idsCRM || null }); NT.idsCRM = null; if (!r.success) { R.toast(r.message, 'err'); return; } NT.pen = r.data.rows; daftar(); }); };
    v('blCek').onclick = function () {
      const nomor = NT.pen.filter(function (p) { return p.valid && !p.ganda; }).map(function (p) { return p.hp; });
      if (!nomor.length) { R.toast('Muat penerima dulu.', 'err'); return; }
      const btn = this; R.sibuk(btn, async function () {
        for (let i = 0; i < nomor.length; i += 50) {
          btn.lastChild && (btn.childNodes[btn.childNodes.length - 1].textContent = 'Mengecek ' + Math.min(nomor.length, i + 50) + '/' + nomor.length);
          const r = await R.api('wa.validate', { nomor: nomor.slice(i, i + 50) }); if (!r.success) { R.toast(r.message, 'err'); break; }
          NT.pen.forEach(function (p) { if (r.data.peta[p.hp]) p.statusWA = r.data.peta[p.hp]; });
        }
        btn.innerHTML = ic('phone2', 's') + 'Deteksi Nomor WA'; daftar();
      });
    };
    v('blHanya').onchange = function () { NT.hanyaWA = this.checked; prev(); };
    v('blList').onchange = function (e) { const c = e.target.closest('[data-i]'); if (c) { NT.pen[c.dataset.i].pilih = c.checked; prev(); } };
    box.querySelectorAll('[data-var]').forEach(function (b) { b.onclick = function () { const t = v('blPesan'), p = t.selectionStart || t.value.length; t.value = t.value.slice(0, p) + b.dataset.var + t.value.slice(p); prev(); }; });
    v('blPesan').oninput = prev; v('blJeda').oninput = prev;
    v('blBatch').onclick = function (e) { const b = e.target.closest('button'); if (!b) return; NT.batch = Number(b.dataset.b); $$('#blBatch button', box).forEach(function (x) { x.classList.toggle('on', x === b); }); prev(); };
    v('blMulai').onclick = async function () {
      const pen = terpilih(); if (!(await R.konfirmasi('Kirim blast ke ' + pen.length + ' nomor dalam ' + Math.ceil(pen.length / NT.batch) + ' batch?', { ya: 'Mulai blast' }))) return;
      R.sibuk(this, async function () { const r = await R.api('wa.blastCreate', { judul: v('blJudul').value, pesan: v('blPesan').value, ukuranBatch: NT.batch, jeda: v('blJeda').value, sasaran: v('blSeg').value || v('blSum').value, penerima: pen.map(function (p) { return { hp: p.hp, nama: p.nama }; }) }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { NT.blastAktif = r.data.blastId; riwayat(); } });
    };
    const progres = function (b) {
      const pb = v('blProg'); if (!b || ['Berjalan'].indexOf(b.Status) === -1) { pb.hidden = true; clearInterval(NT.timer); return; }
      pb.hidden = false; const ps = b.Total ? Math.round((b.Terkirim + b.Gagal) / b.Total * 100) : 0;
      pb.innerHTML = '<div class="hd"><h3>' + ic('send', 'blue') + 'Blast berjalan: ' + esc(b.Judul) + '</h3><span class="act badge b-info">' + ps + '%</span></div><div class="progress"><i style="width:' + ps + '%"></i></div><div class="row small"><span>Terkirim <b>' + b.Terkirim + '</b></span><span>Gagal <b>' + b.Gagal + '</b></span><span>Sisa <b>' + Math.max(0, b.Total - b.Terkirim - b.Gagal) + '</b></span><span class="muted">batch ' + b.UkuranBatch + ' · jeda ' + esc(b.JedaDetik) + ' dtk</span></div>' +
        '<div class="row"><button class="btn btn-primary btn-sm" id="blNext" type="button">▶ Kirim Batch Berikutnya Sekarang</button><label class="chk"><span class="switch"><input type="checkbox" id="blAuto"' + (NT.otomatis ? ' checked' : '') + '><span></span></span> Otomatis</label><button class="btn btn-danger btn-sm" id="blStop" type="button">⏹ Hentikan</button></div><p class="hint">Server tetap mengirim 1 batch per menit walau halaman ini ditutup.</p>';
      $('#blNext', pb).onclick = function () { R.sibuk(this, async function () { const r = await R.api('wa.blastProcess', { blastId: b.BlastID }); if (r.success) progres(r.data); riwayat(); }); };
      $('#blStop', pb).onclick = async function () { if (!(await R.konfirmasi('Hentikan blast ini? Pesan yang belum terkirim dibatalkan.', { bahaya: true }))) return; const r = await R.api('wa.blastStop', { blastId: b.BlastID }); R.toast(r.message, r.success ? 'ok' : 'err'); riwayat(); };
      $('#blAuto', pb).onchange = function () { NT.otomatis = this.checked; clearInterval(NT.timer); if (NT.otomatis) { const jd = String(b.JedaDetik).split('-').map(Number), rata = jd.length > 1 ? (jd[0] + jd[1]) / 2 : jd[0] || 5; NT.timer = setInterval(function () { if (document.visibilityState === 'visible' && NT.tab === 'blast') R.api('wa.blastProcess', { blastId: b.BlastID }).then(function (r) { if (r.success) progres(r.data); }); }, Math.max(30, b.UkuranBatch * rata) * 1000); } };
    };
    const riwayat = function () { R.api('wa.blastList', {}).then(function (r) {
      if (!r.success) { v('blRiwayat').innerHTML = '<p class="err small">' + esc(r.message) + '</p>'; return; }
      const aktif = r.data.rows.filter(function (b) { return b.Status === 'Berjalan'; })[0]; progres(aktif);
      v('blRiwayat').innerHTML = UI.tabel([{ l: 'Judul', full: true, f: function (b) { return '<div class="t1">' + esc(b.Judul) + '</div><div class="t2">' + R.tgl(b.Tanggal, true) + ' · ' + esc(b.Sasaran || '') + '</div>'; } }, { l: 'Batch · jeda', f: function (b) { return b.UkuranBatch + ' · ' + esc(b.JedaDetik) + ' dtk'; } },
        { l: 'Progres', f: function (b) { return '<div class="progress" style="width:120px"><i style="width:' + b.persen + '%"></i></div><span class="t2">' + b.Terkirim + '/' + b.Total + (b.Gagal ? ' · ' + b.Gagal + ' gagal' : '') + '</span>'; } }, { l: 'Status', f: function (b) { return R.badge(b.Status); } }], r.data.rows, { per: 10, kosong: 'Belum ada blast.' });
      R.hidrasiIkon(box);
    }); };
    v('blSegar').onclick = riwayat;
    if (NT.idsCRM) v('blMuat').click(); else daftar();
    riwayat();
  }
  function tabAntrean(box) {
    box.innerHTML = '<div class="kpis" id="aqKpi"></div><div class="toolbar"><select class="input" id="aqSt"><option value="">Semua status</option><option>Antri</option><option>Terkirim</option><option>Gagal</option><option>Batal</option></select><select class="input" id="aqK"><option value="">Semua kanal</option><option>WA</option><option>EMAIL</option></select><span class="grow"></span><button class="btn btn-sec btn-sm" id="aqProses" type="button">' + ic('send', 's') + 'Proses Sekarang</button>' + (RP.role() === 'OWNER' ? '<button class="btn btn-sec btn-sm" id="aqUlang" type="button">' + ic('refresh', 's') + 'Ulangi yang Gagal</button>' : '') + '</div><div id="aqList"><div class="skel" style="height:200px"></div></div>';
    const muat = function () { R.api('notif.queue', { status: $('#aqSt', box).value, kanal: $('#aqK', box).value }).then(function (r) {
      if (!r.success) { $('#aqList', box).innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
      const g = r.data.ringkas;
      $('#aqKpi', box).innerHTML = UI.kpi('Menunggu', g.Antri + (g.Proses || 0), '', 'warn', 'hourglass') + UI.kpi('Terkirim', g.Terkirim, '', 'ok', 'checkc') + UI.kpi('Gagal', g.Gagal, '', g.Gagal ? 'bad' : '', 'alert') + UI.kpi('Dibatalkan', g.Batal, '', '', 'x');
      $('#aqList', box).innerHTML = UI.tabel([{ l: 'Waktu', f: function (a) { return R.tglPendek(a.DibuatPada); } }, { l: 'Kanal', f: function (a) { return '<span class="badge ' + (a.Kanal === 'WA' ? 'b-ok' : 'b-info') + '">' + esc(a.Kanal) + '</span>'; } }, { l: 'Tujuan', f: function (a) { return '<div class="t1">' + esc(a.NamaPenerima) + '</div><div class="t2">' + esc(a.Tujuan) + '</div>'; } },
        { l: 'Event', f: function (a) { return '<span class="t2">' + esc(a.Event) + '</span>'; } }, { l: 'Pesan', f: function (a) { return '<span class="small">' + esc(String(a.Pesan).slice(0, 70)) + '…</span>'; } }, { l: 'Status', f: function (a) { return R.badge(a.Status) + (a.Respon && a.Status !== 'Terkirim' ? '<div class="t2">' + esc(a.Respon) + '</div>' : ''); } }], r.data.rows, { per: 25, kosong: 'Antrean kosong.' });
      R.hidrasiIkon(box);
    }); };
    $('#aqSt', box).onchange = muat; $('#aqK', box).onchange = muat;
    $('#aqProses', box).onclick = function () { R.sibuk(this, async function () { const r = await R.api('notif.processNow', {}); R.toast(r.message, r.success ? 'ok' : 'err'); muat(); }); };
    if ($('#aqUlang', box)) $('#aqUlang', box).onclick = function () { R.sibuk(this, async function () { const r = await R.api('notif.retry', {}); R.toast(r.message, r.success ? 'ok' : 'err'); muat(); }); };
    muat();
  }
  function tabConfig(box) {
    box.innerHTML = '<div class="skel" style="height:300px"></div>';
    R.api('notif.config', {}).then(function (r) {
      if (!r.success) { box.innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
      const c = r.data, M = c.matriks;
      box.innerHTML = '<div class="grid-2" style="align-items:start"><section class="sec-card"><div class="hd"><h3>' + ic('chat', 'blue') + 'WhatsApp (Fonnte)</h3></div>' +
        '<label class="row"><span class="switch"><input type="checkbox" id="cfWa"' + (c.waAktif ? ' checked' : '') + '><span></span></span><b>Notifikasi WhatsApp ' + (c.waAktif ? 'AKTIF' : 'NONAKTIF') + '</b></label>' +
        '<div class="field"><label>Token Fonnte</label><input class="input" type="password" autocomplete="off" id="cfTok" placeholder="' + esc(c.tokenAda ? c.token + ' (kosongkan = tidak diubah)' : 'Tempel token dari fonnte.com → Device') + '"><span class="hint">Disimpan di Script Properties, tidak pernah dikirim ke browser.' + (c.tokenAda ? ' <a href="#" id="cfHapusTok">Hapus token</a>' : '') + '</span></div>' +
        '<div class="row"><button class="btn btn-sec btn-sm" id="cfDev" type="button">' + ic('phone2', 's') + 'Cek Perangkat</button><input class="input" id="cfTesNo" placeholder="08… untuk tes" style="flex:1;min-width:140px"><button class="btn btn-sec btn-sm" id="cfTesWa" type="button">Kirim Tes WA</button></div><div id="cfDevInfo" class="small"></div>' +
        '<div class="grid-2"><div class="field"><label>Batch default</label><select class="input" id="cfBatch">' + [10, 20, 50].map(function (n) { return '<option' + (c.batchDefault === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div><div class="field"><label>Jeda antarpesan (detik)</label><input class="input" id="cfJeda" value="' + esc(c.jeda) + '"></div></div>' +
        '<label class="chk"><input type="checkbox" id="cfDet"' + (c.deteksiOtomatis ? ' checked' : '') + '> Cek otomatis nomor kontak baru terdaftar WhatsApp</label>' +
        '<div class="field"><label>Nomor WA admin (notifikasi booking baru)</label><input class="input" id="cfWaAdm" value="' + esc(c.waAdmin) + '" placeholder="0812…"></div></section>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('mail', 'blue') + 'Email (Gmail akun pemilik)</h3></div><label class="row"><span class="switch"><input type="checkbox" id="cfEm"' + (c.emailAktif ? ' checked' : '') + '><span></span></span><b>Notifikasi Email ' + (c.emailAktif ? 'AKTIF' : 'NONAKTIF') + '</b></label>' +
        '<p class="small muted">Sisa kuota email hari ini: <b>' + c.kuotaEmail + '</b> · Trigger pekerja: ' + (c.trigger ? '<span class="badge b-ok">aktif</span>' : '<span class="badge b-bad">belum</span>') + '</p>' +
        '<div class="field"><label>Nama pengirim</label><input class="input" id="cfNama" value="' + esc(c.namaPengirim) + '"></div><div class="field"><label>Email admin (pisahkan koma; kosong = semua Owner/Admin)</label><input class="input" id="cfEmAdm" value="' + esc(c.emailAdmin) + '"></div>' +
        '<div class="field"><label>URL aplikasi (untuk tautan di pesan)</label><input class="input" id="cfUrl" value="' + esc(c.appUrl) + '"></div><div class="row"><input class="input" id="cfTesEm" placeholder="email untuk tes" style="flex:1"><button class="btn btn-sec btn-sm" id="cfTesEmail" type="button">Kirim Tes Email</button></div></section></div>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('list', 'blue') + 'Matriks Notifikasi Otomatis</h3></div><div class="tbl-scroll"><table class="tbl"><thead><tr><th>Kejadian</th><th class="c">WhatsApp</th><th class="c">Email</th><th></th></tr></thead><tbody>' +
        Object.keys(M).map(function (k) { const m = M[k]; return '<tr><td><b>' + esc(m.label) + '</b><div class="t2">' + esc(k) + (m.admin ? ' · ke admin' : '') + '</div></td><td class="c"><label class="switch"><input type="checkbox" data-mx="' + k + '|wa"' + (m.wa ? ' checked' : '') + '><span></span></label></td><td class="c"><label class="switch"><input type="checkbox" data-mx="' + k + '|email"' + (m.email ? ' checked' : '') + '><span></span></label></td><td class="r"><button class="btn btn-soft btn-sm" data-ubah="' + k + '" type="button">✎ Ubah</button></td></tr>' +
          '<tr data-lipat="' + k + '" hidden><td colspan="4"><div class="grid-2"><div class="field"><label>Subjek email</label><input class="input" data-sub="' + k + '" value="' + esc(m.subjek) + '"></div><div class="field"><label>Variabel</label><span class="hint">' + esc((m.pesanDefault.match(/\{\w+\}/g) || []).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(' ')) + '</span></div><div class="field" style="grid-column:1/-1"><label>Isi pesan</label><textarea class="input" rows="5" data-psn="' + k + '">' + esc(m.pesan) + '</textarea></div></div><button class="btn btn-ghost btn-sm" data-reset="' + k + '" type="button">↺ Kembalikan bawaan</button></td></tr>'; }).join('') +
        '</tbody></table></div><div class="row" style="justify-content:flex-end"><button class="btn btn-primary" id="cfSimpan" type="button">' + ic('check') + 'Simpan Konfigurasi</button></div></section>';
      R.hidrasiIkon(box);
      box.onclick = function (e) {
        const u = e.target.closest('[data-ubah]'); if (u) { const tr = $('[data-lipat="' + u.dataset.ubah + '"]', box); tr.hidden = !tr.hidden; }
        const rs = e.target.closest('[data-reset]'); if (rs) { const k = rs.dataset.reset; $('[data-psn="' + k + '"]', box).value = M[k].pesanDefault; $('[data-sub="' + k + '"]', box).value = M[k].subjekDefault; }
      };
      const hapus = $('#cfHapusTok', box); if (hapus) hapus.onclick = function (e) { e.preventDefault(); $('#cfTok', box).value = '__HAPUS__'; R.toast('Token akan dihapus saat Simpan.'); };
      $('#cfDev', box).onclick = function () { R.sibuk(this, async function () { const r = await R.api('wa.device', {}); $('#cfDevInfo', box).innerHTML = r.success ? 'Perangkat <b>' + esc(r.data.device || '') + '</b> · status <b>' + esc(r.data.device_status || '') + '</b> · paket ' + esc(r.data.package || '-') + ' · kuota ' + esc(r.data.quota || '-') : '<span class="err">' + esc(r.message) + '</span>'; }); };
      $('#cfTesWa', box).onclick = function () { R.sibuk(this, async function () { const r = await R.api('wa.test', { nomor: $('#cfTesNo', box).value }); R.toast(r.message, r.success ? 'ok' : 'err'); }); };
      $('#cfTesEmail', box).onclick = function () { R.sibuk(this, async function () { const r = await R.api('email.test', { email: $('#cfTesEm', box).value }); R.toast(r.message, r.success ? 'ok' : 'err'); }); };
      $('#cfSimpan', box).onclick = function () {
        const mtx = {}; Object.keys(M).forEach(function (k) { mtx[k] = { wa: $('[data-mx="' + k + '|wa"]', box).checked, email: $('[data-mx="' + k + '|email"]', box).checked, pesan: $('[data-psn="' + k + '"]', box).value, subjek: $('[data-sub="' + k + '"]', box).value }; });
        R.sibuk(this, async function () {
          const r = await R.api('notif.configSave', { waAktif: $('#cfWa', box).checked, emailAktif: $('#cfEm', box).checked, token: $('#cfTok', box).value, batchDefault: Number($('#cfBatch', box).value), jeda: $('#cfJeda', box).value,
            deteksiOtomatis: $('#cfDet', box).checked, namaPengirim: $('#cfNama', box).value, appUrl: $('#cfUrl', box).value, emailAdmin: $('#cfEmAdm', box).value, waAdmin: $('#cfWaAdm', box).value, matriks: mtx });
          R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) tabConfig(box);
        });
      };
    });
  }
  RP.daftar('notifikasi', { render: renderNotif });

  /* ================= CRM KONTAK ================= */
  const CR = { f: {}, hal: 1, pilih: {} };
  function renderCrm(el) {
    const owner = RP.role() === 'OWNER';
    el.innerHTML = UI.kepala('CRM Kontak', 'Satu daftar Nama · Email · WhatsApp dari penyewa dan staf. Pantau kualitas data, status WA, riwayat dihubungi, lalu langsung blast.',
      '<span class="small muted" id="crSync"></span><button class="btn btn-sec" id="crSinkron" type="button">' + ic('refresh') + 'Sinkron Sekarang</button><button class="btn btn-sec" id="crImpor" type="button">' + ic('upload') + 'Impor CSV</button><button class="btn btn-sec" id="crDup" type="button">' + ic('copy') + 'Periksa Duplikat</button>' + (owner ? '<button class="btn btn-sec" id="crEks" type="button">' + ic('download') + 'Ekspor</button>' : '')) +
      '<div class="kpis" id="crKpi"></div><div class="toolbar"><div class="pill-tabs" id="crSeg"></div><div class="search">' + ic('search') + '<input class="input" id="crQ" placeholder="Nama, email, nomor, tag" value="' + esc(CR.f.cari || '') + '"></div>' +
      '<select class="input" id="crWa"><option value="">Status WA</option><option value="Terdaftar">Terdaftar</option><option value="Tidak Terdaftar">Tidak terdaftar</option><option value="belum">Belum dicek</option></select></div><div id="crSel"></div><div id="crList"><div class="skel" style="height:300px"></div></div>';
    const kpi = function () { R.api('crm.stats', {}).then(function (r) { if (!r.success) return; const s = r.data;
      $('#crKpi', el).innerHTML = [['Total kontak', s.total, '', 'users', {}], ['WA terverifikasi', s.terdaftarWA, s.waValid + ' nomor valid', 'checkc', { statusWA: 'Terdaftar' }], ['Email valid', s.emailValid, '', 'mail', { emailValid: 'YA' }], ['Belum dicek WA', s.belumCek, '', 'phone2', { statusWA: 'belum' }], ['Opt-out', s.optOut, '', 'x', { optOut: 'YA' }], ['Duplikat', s.duplikat, s.tidakBisa + ' tak bisa dihubungi', 'copy', { duplikat: true }]]
        .map(function (x) { return '<div class="kpi" data-f=\'' + JSON.stringify(x[4]) + '\' style="cursor:pointer"><div class="t"><span>' + x[0] + '</span><span class="ic">' + ic(x[3], 's') + '</span></div><div class="v tnum">' + x[1] + '</div><div class="s">' + x[2] + '</div></div>'; }).join('');
      R.hidrasiIkon($('#crKpi', el));
    }); };
    const muat = function () { R.api('crm.list', Object.assign({ halaman: CR.hal, per: 50 }, CR.f)).then(function (r) {
      if (!r.success) { $('#crList', el).innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
      const d = r.data;
      $('#crSync', el).textContent = d.sinkron ? 'Sinkron ' + R.relatif(R.isoWaktu(d.sinkron)) : '';
      $('#crSeg', el).innerHTML = '<button class="chip ' + (!CR.f.segmen ? 'on' : '') + '" data-seg="" type="button">Semua</button>' + Object.keys(d.facet.segmen).map(function (s) { return '<button class="chip ' + (CR.f.segmen === s ? 'on' : '') + '" data-seg="' + esc(s) + '" type="button">' + esc(s) + ' <b>' + d.facet.segmen[s] + '</b></button>'; }).join('');
      const rows = d.rows;
      $('#crList', el).innerHTML = rows.length ? '<div class="tbl-wrap"><div class="tbl-scroll"><table class="tbl kartu"><thead><tr><th><input type="checkbox" id="crAll" aria-label="Pilih semua"></th><th>Kontak</th><th>Email</th><th>WhatsApp</th><th>Tag</th><th>Terakhir dihubungi</th><th class="r">Pesan</th><th></th></tr></thead><tbody>' +
        rows.map(function (k) { return '<tr style="' + (k.bermasalah || k.duplikat ? 'background:color-mix(in srgb,var(--warn-bg) 40%,transparent)' : '') + '"><td data-l="Pilih"><input type="checkbox" data-pk="' + esc(k.KontakID) + '"' + (CR.pilih[k.KontakID] ? ' checked' : '') + '></td>' +
          '<td data-l="Kontak" class="full"><div class="row" style="flex-wrap:nowrap"><span class="avatar">' + esc(R.inisial(k.Nama)) + '</span><div><div class="t1">' + esc(k.Nama) + (k.OptOut === 'YA' ? ' <span class="badge b-off">opt-out</span>' : '') + (k.duplikat ? ' <span class="badge b-warn">duplikat</span>' : '') + '</div><span class="badge b-info">' + esc(k.Segmen) + '</span></div></div></td>' +
          '<td data-l="Email">' + (k.Email ? esc(k.Email) + (k.EmailValid === 'YA' ? ' ✓' : ' ⚠') : '<span class="t2">-</span>') + '</td><td data-l="WhatsApp"><span class="tnum">' + esc(k.NoWA || '-') + '</span> ' + (k.NoWA ? badgeWA(k.StatusWA) + ' <a href="' + R.waLink(k.NoWA) + '" target="_blank" rel="noopener">wa.me</a>' : '') + '</td>' +
          '<td data-l="Tag"><span class="small">' + esc(k.Tag || '') + '</span></td><td data-l="Terakhir">' + (k.TerakhirDihubungi ? R.relatif(k.TerakhirDihubungi) : '<span class="t2">belum</span>') + '</td><td data-l="Pesan" class="r">' + (k.JumlahPesan || 0) + '</td><td class="r"><button class="btn btn-soft btn-sm" data-kt="' + esc(k.KontakID) + '" type="button">Detail</button></td></tr>'; }).join('') +
        '</tbody></table></div>' + UI.pager(d.total, d.halaman, d.per) + '</div>' : '<div class="tbl-wrap"><div class="empty">' + ic('users') + '<p>Tidak ada kontak. Tekan "Sinkron Sekarang".</p></div></div>';
      selBar();
    }); };
    const selBar = function () {
      const ids = Object.keys(CR.pilih).filter(function (k) { return CR.pilih[k]; });
      $('#crSel', el).innerHTML = ids.length ? '<div class="sel-bar"><b>' + ids.length + ' dipilih</b><button class="btn btn-sec btn-sm" data-bulk="deteksiWA" type="button">📱 Deteksi WA</button><button class="btn btn-sec btn-sm" data-bulk="tag" type="button">🏷 Beri Tag</button><button class="btn btn-sec btn-sm" data-bulk="blast" type="button">📣 Blast ke Terpilih</button><button class="btn btn-sec btn-sm" data-bulk="optout" type="button">⛔ Opt-out</button><button class="btn btn-sec btn-sm" data-bulk="optin" type="button">Opt-in</button><button class="btn btn-sec btn-sm" data-bulk="batal" type="button" style="margin-left:auto">Batal pilih</button></div>' : '';
    };
    kpi(); muat();
    $('#crQ', el).oninput = R.debounce(function () { CR.f.cari = this.value; CR.hal = 1; muat(); }, 350);
    $('#crWa', el).onchange = function () { CR.f.statusWA = this.value; CR.hal = 1; muat(); };
    $('#crSinkron', el).onclick = function () { R.sibuk(this, async function () { const r = await R.api('crm.sync', {}); R.toast(r.message, r.success ? 'ok' : 'err'); kpi(); muat(); }); };
    if ($('#crEks', el)) $('#crEks', el).onclick = function () { R.sibuk(this, async function () { const r = await R.api('crm.export', CR.f); if (r.success) R.csv('kontak-' + R.isoTgl() + '.csv', r.data.rows); else R.toast(r.message, 'err'); }); };
    $('#crImpor', el).onclick = function () {
      const m = R.modal({ judul: 'Impor kontak CSV', isi: '<p class="small">Kolom: <code>nama,email,wa,segmen,tag</code>. Kontak ganda (nomor/email sama) dilewati.</p><div class="row"><button class="btn btn-sec btn-sm" id="ciTpl" type="button">Unduh template</button><label class="btn btn-soft btn-sm">Pilih CSV<input type="file" accept=".csv" id="ciF" hidden></label></div><div id="ciInfo" class="small"></div>', kaki: '<button class="btn btn-sec" data-tutup>Tutup</button><button class="btn btn-primary" id="ciGo" disabled>Impor</button>' });
      let rows = []; m.$('#ciTpl').onclick = function () { R.unduh('template-kontak.csv', '﻿nama,email,wa,segmen,tag\nContoh Nama,contoh@mail.com,081234567890,Calon Penyewa,promo\n'); };
      m.$('#ciF').onchange = function () { const fr = new FileReader(); fr.onload = function () { rows = R.bacaCsv(String(fr.result)); m.$('#ciInfo').textContent = rows.length + ' baris terbaca.'; m.$('#ciGo').disabled = !rows.length; }; fr.readAsText(this.files[0]); };
      m.$('#ciGo').onclick = function () { R.sibuk(this, async function () { const r = await R.api('crm.import', { rows: rows }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { m.tutup(); kpi(); muat(); } }); };
    };
    $('#crDup', el).onclick = function () { CR.f = { duplikat: true }; CR.hal = 1; muat(); R.toast('Menampilkan kontak duplikat. Pilih ≥2 lalu buka Detail salah satunya untuk menggabung.'); };
    el.addEventListener('click', async function (e) {
      const k = e.target.closest('[data-f]'); if (k && k.closest('#crKpi')) { CR.f = JSON.parse(k.dataset.f); CR.hal = 1; muat(); return; }
      const s = e.target.closest('[data-seg]'); if (s) { CR.f.segmen = s.dataset.seg; CR.hal = 1; muat(); return; }
      const h = e.target.closest('[data-hal]'); if (h && !h.disabled) { CR.hal = Number(h.dataset.hal); muat(); return; }
      const d = e.target.closest('[data-kt]'); if (d) { detailKontak(d.dataset.kt, function () { kpi(); muat(); }); return; }
      const b = e.target.closest('[data-bulk]'); if (b) {
        const ids = Object.keys(CR.pilih).filter(function (x) { return CR.pilih[x]; }), aksi = b.dataset.bulk;
        if (aksi === 'batal') { CR.pilih = {}; muat(); return; }
        if (aksi === 'blast') { NT.idsCRM = ids; NT.tab = 'blast'; location.hash = '#/app/notifikasi'; return; }
        let nilai = '';
        if (aksi === 'tag') { nilai = await R.konfirmasi('Tag untuk ' + ids.length + ' kontak:', { isi: '<input class="input" id="tagV" style="margin-top:8px" placeholder="pelanggan-setia">', ambil: function (m) { return m.$('#tagV').value.trim(); } }); if (!nilai) return; }
        R.sibuk(b, async function () { const r = await R.api('crm.bulk', { ids: ids, aksi: aksi, nilai: nilai }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { CR.pilih = {}; kpi(); muat(); } });
      }
    });
    el.addEventListener('change', function (e) {
      const c = e.target.closest('[data-pk]'); if (c) { CR.pilih[c.dataset.pk] = c.checked; selBar(); }
      if (e.target.id === 'crAll') { $$('[data-pk]', el).forEach(function (x) { x.checked = e.target.checked; CR.pilih[x.dataset.pk] = e.target.checked; }); selBar(); }
    });
  }
  async function detailKontak(id, setelah) {
    const r = await R.api('crm.detail', { kontakId: id });
    if (!r.success) { R.toast(r.message, 'err'); return; }
    const k = r.data.kontak;
    const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.style.placeItems = 'stretch end'; bg.style.padding = '0';
    bg.innerHTML = '<div class="drawer-r"><div class="modal-h"><span class="avatar">' + esc(R.inisial(k.Nama)) + '</span><h3>' + esc(k.Nama) + '</h3><button class="btn btn-ghost btn-ico btn-sm" data-x>' + ic('x') + '</button></div><div class="modal-b">' +
      '<div class="row"><span class="badge b-info">' + esc(k.Segmen) + '</span><span class="badge b-off">' + esc(k.Sumber) + ':' + esc(k.RefID) + '</span>' + badgeWA(k.StatusWA) + '</div>' +
      '<div class="row">' + (k.NoWA ? '<a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + R.waLink(k.NoWA) + '">' + ic('chat', 's') + 'WhatsApp</a><button class="btn btn-sec btn-sm" type="button" onclick="RF.salin(\'' + esc(k.NoWA) + '\')">' + ic('copy', 's') + 'Salin nomor</button>' : '') + (k.Email ? '<a class="btn btn-sec btn-sm" href="mailto:' + esc(k.Email) + '">' + ic('mail', 's') + 'Email</a>' : '') + (k.Sumber === 'penyewa' ? '<a class="btn btn-sec btn-sm" href="#/app/penyewa/' + esc(k.RefID) + '" data-x>Data penyewa</a>' : '') + '</div>' +
      '<form id="ktF" class="grid-2"><div class="field"><label>Nama</label><input class="input" name="Nama" value="' + esc(k.Nama) + '"></div><div class="field"><label>WhatsApp</label><input class="input" name="NoWA" value="' + esc(k.NoWA) + '"></div><div class="field"><label>Email</label><input class="input" name="Email" value="' + esc(k.Email) + '"></div><div class="field"><label>Tag (koma)</label><input class="input" name="Tag" value="' + esc(k.Tag) + '"></div>' +
      '<div class="field" style="grid-column:1/-1"><label>Catatan</label><textarea class="input" name="Catatan" rows="2">' + esc(k.Catatan) + '</textarea></div><label class="chk"><input type="checkbox" name="OptOut"' + (k.OptOut === 'YA' ? ' checked' : '') + '> Opt-out dari blast</label><div class="row" style="justify-content:flex-end"><button class="btn btn-primary btn-sm" type="submit">Simpan</button></div></form>' +
      '<h4>Catat interaksi</h4><div class="row"><select class="input" id="inK" style="width:auto"><option>Telepon</option><option>WA Manual</option><option>Kunjungan</option><option>Catatan</option></select><input class="input" id="inR" placeholder="Ringkasan" style="flex:1"><button class="btn btn-sec btn-sm" id="inGo" type="button">Catat</button></div>' +
      '<h4>Timeline</h4><div class="timeline">' + (r.data.timeline.length ? r.data.timeline.map(function (t) { return '<div class="tl ' + (t.otomatis ? 'auto' : '') + '"><i></i><div><div class="small"><b>' + esc(t.kanal) + '</b> · ' + R.tgl(t.tanggal, true) + (t.status ? ' · ' + esc(t.status) : '') + '</div><div class="small muted">' + esc(t.ringkasan) + '</div></div></div>'; }).join('') : '<p class="small muted">Belum ada interaksi.</p>') + '</div>' +
      (k.duplikat ? '<div class="selisih"><b>Kontak duplikat</b><span class="small">Gabungkan kontak lain (yang dicentang di daftar) ke kontak ini?</span><button class="btn btn-sec btn-sm" id="ktMerge" type="button">Gabungkan yang dipilih ke sini</button></div>' : '') + '</div></div>';
    document.body.appendChild(bg); R.hidrasiIkon(bg);
    const tutup = function () { bg.remove(); };
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('[data-x]')) tutup(); });
    $('#ktF', bg).onsubmit = function (e) { e.preventDefault(); const v = R.nilaiForm(this); v.OptOut = v.OptOut ? 'YA' : 'TIDAK'; v.KontakID = k.KontakID; R.sibuk(this.querySelector('button'), async function () { const x = await R.api('crm.save', { kontak: v }); R.toast(x.message, x.success ? 'ok' : 'err'); if (x.success) { tutup(); setelah(); } }); };
    $('#inGo', bg).onclick = function () { R.sibuk(this, async function () { const x = await R.api('crm.interaksi', { kontakId: k.KontakID, kanal: $('#inK', bg).value, ringkasan: $('#inR', bg).value }); R.toast(x.message, x.success ? 'ok' : 'err'); if (x.success) { tutup(); detailKontak(id, setelah); } }); };
    const mg = $('#ktMerge', bg); if (mg) mg.onclick = function () { const ids = Object.keys(CR.pilih).filter(function (x) { return CR.pilih[x] && x !== k.KontakID; }); if (!ids.length) { R.toast('Centang kontak duplikat lain di daftar dulu.', 'err'); return; } R.sibuk(mg, async function () { const x = await R.api('crm.merge', { utama: k.KontakID, gabung: ids }); R.toast(x.message, x.success ? 'ok' : 'err'); if (x.success) { CR.pilih = {}; tutup(); setelah(); } }); };
  }
  RP.daftar('crm', { render: renderCrm });

  /* ================= STRUK & PRINTER ================= */
  let ST_TAB = 'model';
  function renderStruk(el) {
    el.innerHTML = UI.kepala('Struk &amp; Printer Thermal', 'Ubah tata letak tanda terima serah-terima (check-in/out) dan struk pembayaran 58/80 mm, lalu atur printer bawaan semua kasir & crew.', '') +
      tabs('stTab', [['model', 'Model struk'], ['printer', 'Pengaturan printer bawaan'], ['tes', 'Coba cetak']], ST_TAB) + '<div id="stIsi" style="margin-top:14px"></div>';
    const isi = $('#stIsi', el);
    const aksi = function (n, d) { return R.api(n, d); };
    const segarkan = function () { return R.api('struk.list', {}).then(function (r) { if (r.success && W.StrukPrinter) W.StrukPrinter.pasang({ templates: r.data.templates, server: r.data.printer }); }); };
    const pilih = function (t) {
      ST_TAB = t; $$('#stTab button', el).forEach(function (x) { x.classList.toggle('on', x.dataset.t === t); });
      if (!W.StrukUI) { isi.innerHTML = '<p class="err">Modul struk belum termuat.</p>'; return; }
      if (t === 'model') W.StrukUI.editor(isi, { aksi: aksi, segarkan: segarkan, toast: function (j, s, e) { R.toast(j + (s ? ' — ' + s : ''), e ? 'err' : 'ok'); }, konfirmasi: function (x) { return R.konfirmasi(x); } });
      else if (t === 'printer') W.StrukUI.pengaturan(isi, { aksi: aksi, toast: function (j, s, e) { R.toast(j + (s ? ' — ' + s : ''), e ? 'err' : 'ok'); } });
      else {
        isi.innerHTML = '<div class="grid-2"><section class="sec-card"><h3>Tanda terima serah-terima</h3><p class="small muted">Contoh data check-out & check-in.</p><div class="row"><button class="btn btn-primary" data-tes="SERAH|keluar" type="button">Check-out</button><button class="btn btn-accent" data-tes="SERAH|masuk" type="button">Check-in</button></div></section><section class="sec-card"><h3>Struk pembayaran</h3><p class="small muted">Contoh DP & pelunasan.</p><div class="row"><button class="btn btn-primary" data-tes="STRUK|dp" type="button">DP</button><button class="btn btn-sec" data-tes="STRUK|lunas" type="button">Pelunasan</button></div></section></div>';
        isi.onclick = function (e) { const b = e.target.closest('[data-tes]'); if (!b) return; const p = b.dataset.tes.split('|'); W.StrukUI.pratinjau({ jenis: p[0], data: W.StrukUI.CONTOH[p[0]][p[1]], nomor: 'CONTOH' }); };
      }
    };
    $('#stTab', el).onclick = function (e) { const b = e.target.closest('button'); if (b) pilih(b.dataset.t); };
    pilih(ST_TAB);
  }
  RP.daftar('struk', { render: renderStruk });

  /* ================= PENGGUNA & SISTEM ================= */
  let PG_TAB = 'pengguna';
  function renderPengguna(el) {
    el.innerHTML = UI.kepala('Pengguna &amp; Sistem', 'Kelola akun Google tim (Owner, Admin, Crew), keamanan login, log aktivitas, status sistem, dan impor data dari app lama.', '') +
      tabs('pgTab', [['pengguna', 'Pengguna'], ['keamanan', 'Keamanan'], ['log', 'Log aktivitas'], ['sistem', 'Status sistem'], ['migrasi', 'Impor data lama']], PG_TAB) + '<div id="pgIsi" class="stack" style="margin-top:14px"></div>';
    const isi = $('#pgIsi', el);
    const pilih = function (t) { PG_TAB = t; $$('#pgTab button', el).forEach(function (x) { x.classList.toggle('on', x.dataset.t === t); }); ({ pengguna: tabUser, keamanan: tabAman, log: tabLog, sistem: tabSistem, migrasi: tabMigrasi })[t](isi); R.hidrasiIkon(isi); };
    $('#pgTab', el).onclick = function (e) { const b = e.target.closest('button'); if (b) pilih(b.dataset.t); };
    pilih(PG_TAB);
  }
  function tabUser(box) {
    box.innerHTML = '<div class="row"><button class="btn btn-accent" id="ugBaru" type="button">' + ic('plus') + 'Tambah pengguna</button><span class="small muted">Pengguna masuk dengan akun Google sesuai email yang didaftarkan.</span></div><div id="ugList"><div class="skel" style="height:200px"></div></div>';
    const muat = function () { R.api('user.list', {}).then(function (r) {
      if (!r.success) { $('#ugList', box).innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
      $('#ugList', box).innerHTML = UI.tabel([{ l: 'Pengguna', full: true, f: function (u) { return '<div class="row" style="flex-wrap:nowrap"><span class="avatar">' + esc(R.inisial(u.nama || u.email)) + '</span><div><div class="t1">' + esc(u.nama || '-') + '</div><div class="t2">' + esc(u.email) + '</div></div></div>'; } },
        { l: 'Peran', f: function (u) { return '<span class="badge ' + (/owner/i.test(u.role) ? 'b-acc' : /admin/i.test(u.role) ? 'b-info' : 'b-purple') + '">' + esc(u.role) + '</span>'; } }, { l: 'Status', f: function (u) { return u.status_aktif === 'Y' ? '<span class="badge dot b-ok">Aktif</span>' : '<span class="badge b-off">Nonaktif</span>'; } },
        { l: 'Login terakhir', f: function (u) { return u.login_terakhir ? R.tgl(u.login_terakhir, true) : '<span class="t2">belum</span>'; } }, { l: '', r: true, f: function (u) { return '<button class="btn btn-soft btn-sm" data-ug="' + esc(u.email) + '" type="button">Ubah</button>'; } }], r.data.rows, { per: 50 });
      $('#ugList', box).onclick = function (e) { const b = e.target.closest('[data-ug]'); if (b) form(r.data.rows.filter(function (u) { return u.email === b.dataset.ug; })[0]); };
    }); };
    const form = function (u) {
      UI.formModal({ judul: u ? 'Ubah ' + u.email : 'Tambah pengguna', nilai: u ? { email: u.email, nama: u.nama, role: /owner/i.test(u.role) ? 'Owner' : /admin/i.test(u.role) ? 'Admin' : 'Crew', status_aktif: u.status_aktif, no_wa: u.no_wa } : { role: 'Admin', status_aktif: 'Y' },
        fields: [{ n: 'email', l: 'Email Google', t: 'email', req: true, ro: !!u }, { n: 'nama', l: 'Nama' }, { n: 'role', l: 'Peran', t: 'select', o: [['Owner', 'Owner — akses penuh'], ['Admin', 'Admin/CS/Kasir — operasional'], ['Crew', 'Crew Lapangan — serah terima & servis']] },
          { n: 'status_aktif', l: 'Status', t: 'select', o: [['Y', 'Aktif'], ['N', 'Nonaktif']] }, { n: 'no_wa', l: 'No. WA (opsional)', t: 'tel' }],
        kakiKiri: u ? '<button class="btn btn-danger" id="ugHapus" type="button" style="margin-right:auto">' + ic('trash') + 'Hapus</button><button class="btn btn-sec" id="ugCabut" type="button">Keluarkan dari semua perangkat</button>' : '',
        buka: function (m) {
          const h = m.$('#ugHapus'); if (h) h.onclick = async function () { if (!(await R.konfirmasi('Hapus akses ' + u.email + '?', { bahaya: true }))) return; const r = await R.api('user.hapus', { email: u.email }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { m.tutup(); muat(); } };
          const c = m.$('#ugCabut'); if (c) c.onclick = async function () { const r = await R.api('user.cabut', { email: u.email }); R.toast(r.message, r.success ? 'ok' : 'err'); };
        },
        simpan: function (v) { return R.api('user.simpan', v); }, setelah: muat });
    };
    $('#ugBaru', box).onclick = function () { form(null); };
    muat();
  }
  function tabAman(box) {
    box.innerHTML = '<div class="skel" style="height:200px"></div>';
    R.api('rahasia.status', {}).then(function (r) {
      if (!r.success) { box.innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
      const s = r.data, origin = location.origin;
      box.innerHTML = '<section class="sec-card"><div class="hd"><h3>' + ic('google', 'blue') + 'Login Google (Client ID)</h3>' + (s.GOOGLE_CLIENT_ID.ada ? '<span class="act badge b-ok">Aktif</span>' : '<span class="act badge b-warn">Belum diisi</span>') + '</div>' +
        '<p class="small muted">Buat OAuth Client ID (Web application) di Google Cloud Console. Authorized JavaScript origin: <code>' + esc(origin) + '</code> <button class="btn btn-ghost btn-sm" type="button" onclick="RF.salin(\'' + esc(origin) + '\')">Salin</button></p>' +
        '<div class="row"><input class="input" id="amCid" placeholder="' + esc(s.GOOGLE_CLIENT_ID.samar || '1234-abc.apps.googleusercontent.com') + '" style="flex:1"><button class="btn btn-primary" id="amCidGo" type="button">Simpan</button></div></section>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('lock', 'blue') + 'Akses darurat</h3>' + (s.darurat.terkunci ? '<span class="act badge b-bad">Terkunci sementara</span>' : '') + '</div><p class="small muted">Nama pengguna saat ini: <b>' + esc(s.darurat.user || '-') + '</b>. Ganti sandi setelah login pertama. Halaman masuk darurat: <code>#/darurat</code> (tidak ditautkan di mana pun).</p>' +
        '<div class="grid-2"><div class="field"><label>Nama pengguna</label><input class="input" id="amU" value="' + esc(s.darurat.user || 'darurat') + '" autocomplete="off"></div><div class="field"><label>Sandi baru (≥12, huruf+angka)</label><input class="input" type="password" id="amP" autocomplete="new-password"></div></div><div class="row" style="justify-content:flex-end"><button class="btn btn-primary" id="amPGo" type="button">Ganti kredensial darurat</button></div></section>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('logout', 'blue') + 'Sesi</h3></div><p class="small muted">Sesi login berlaku 72 jam. Bila perangkat hilang, keluarkan akun Anda dari semua perangkat.</p><button class="btn btn-danger" id="amAll" type="button" style="justify-self:start">Keluar dari semua perangkat</button></section>';
      R.hidrasiIkon(box);
      $('#amCidGo', box).onclick = function () { R.sibuk(this, async function () { const x = await R.api('rahasia.simpan', { kunci: 'GOOGLE_CLIENT_ID', nilai: $('#amCid', box).value }); R.toast(x.message, x.success ? 'ok' : 'err'); if (x.success) tabAman(box); }); };
      $('#amPGo', box).onclick = function () { R.sibuk(this, async function () { const x = await R.api('darurat.ganti', { username: $('#amU', box).value, sandiBaru: $('#amP', box).value }); R.toast(x.message, x.success ? 'ok' : 'err'); if (x.success) $('#amP', box).value = ''; }); };
      $('#amAll', box).onclick = async function () { if (!(await R.konfirmasi('Keluarkan akun Anda dari semua perangkat (termasuk yang ini)?', { bahaya: true }))) return; await R.api('auth.keluarSemua', {}); R.Sesi.hapus(); location.hash = '#/masuk'; };
    });
  }
  function tabLog(box) {
    box.innerHTML = '<div class="toolbar"><div class="search">' + ic('search') + '<input class="input" id="lgQ" placeholder="Cari email, aksi, ID"></div><button class="btn btn-sec btn-sm" id="lgCsv" type="button">' + ic('download', 's') + 'CSV</button></div><div id="lgList"><div class="skel" style="height:200px"></div></div>';
    let rows = [];
    const muat = function () { R.api('log.list', { q: $('#lgQ', box).value }).then(function (r) { if (!r.success) return; rows = r.data.rows; $('#lgList', box).innerHTML = UI.tabel([{ l: 'Waktu', f: function (x) { return R.tglPendek(x.waktu); } }, { l: 'Pengguna', f: function (x) { return esc(x.email); } }, { l: 'Aksi', f: function (x) { return '<span class="badge b-info">' + esc(x.aksi) + '</span>'; } }, { l: 'Ref', f: function (x) { return esc(x.id_referensi); } }, { l: 'Detail', full: true, f: function (x) { return '<span class="small muted">' + esc(x.detail) + '</span>'; } }], rows, { per: 50, kosong: 'Log kosong.' }); }); };
    $('#lgQ', box).oninput = R.debounce(muat, 400);
    $('#lgCsv', box).onclick = function () { R.csv('log-' + R.isoTgl() + '.csv', rows, ['waktu', 'email', 'aksi', 'id_referensi', 'detail']); };
    muat();
  }
  function tabSistem(box) {
    box.innerHTML = '<div class="skel" style="height:200px"></div>';
    R.api('sistem.status', { _fresh: true }).then(function (r) {
      if (!r.success) { box.innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
      const s = r.data;
      box.innerHTML = '<div class="kpis">' + UI.kpi('Versi backend', esc(s.versi), 'frontend ' + R.VERSI, '', 'info') + UI.kpi('Trigger', s.triggers.length, esc(s.triggers.join(', ') || 'belum ada') + ' · ' + (s.keepWarm === 'off' ? 'hemat (5 mnt)' : 'keep-warm (1 mnt)'), s.triggers.length ? 'ok' : 'bad', 'clock') +
        UI.kpi('Kuota email', s.emailKuota, 'tersisa hari ini', '', 'mail') + UI.kpi('Script Properties', s.propsKB + ' KB', 'dari ±500 KB', '', 'lock') + UI.kpi('Antrean notifikasi', s.antrian ? 'Ada' : 'Kosong', '', s.antrian ? 'warn' : 'ok', 'send') + '</div>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('database', 'blue') + 'Database & penyimpanan</h3></div><div class="row"><a class="btn btn-sec" target="_blank" rel="noopener" href="' + esc(s.spreadsheetUrl) + '">' + ic('external', 's') + 'Buka spreadsheet</a>' + (s.folderUrl ? '<a class="btn btn-sec" target="_blank" rel="noopener" href="' + esc(s.folderUrl) + '">' + ic('external', 's') + 'Folder Drive</a>' : '') + '</div>' +
        UI.tabel([{ l: 'Sheet', f: function (x) { return esc(x.nama); } }, { l: 'Baris data', r: true, f: function (x) { return R.angka(x.baris); } }], s.sheets, { per: 50 }) +
        '<p class="small muted">Warmup terakhir: ' + (s.warm ? esc(s.warm.at + ' (' + s.warm.scope + ')') : '-') + ' · Login Google: ' + (s.googleClientId ? 'aktif' : 'belum') + ' · Fonnte: ' + (s.fonnte ? 'token ada' : 'belum') + '</p>' +
        '<p class="small muted">Kinerja frontend: buka konsol (F12) lalu ketik <code>Perf.table()</code> atau <code>Perf.summary()</code>.</p></section>';
      R.hidrasiIkon(box);
    });
  }
  function tabMigrasi(box) {
    const sheets = ['Pengguna', 'Unit', 'Tarif', 'Paket', 'Penyewa', 'Booking', 'Pembayaran', 'CheckLog', 'Servis', 'Testimoni', 'PengaturanSitus', 'Log'];
    box.innerHTML = '<section class="sec-card"><div class="hd"><h3>' + ic('database', 'blue') + 'Impor dari spreadsheet app lama</h3></div><p class="small muted">Spreadsheet lama hanya <b>dibaca</b>. Data dicocokkan berdasarkan nama kolom dan ID, aman dijalankan berulang (tanpa baris dobel). Jalankan sekali lagi tepat sebelum pindah (delta sync). Spreadsheet harus milik akun Google yang sama.</p>' +
      '<div class="field"><label>URL atau ID spreadsheet lama</label><input class="input" id="mgSrc" placeholder="https://docs.google.com/spreadsheets/d/…"></div>' +
      '<div class="row">' + sheets.map(function (s) { return '<label class="chk"><input type="checkbox" data-sh="' + s + '"' + (s === 'Log' ? '' : ' checked') + '> ' + s + '</label>'; }).join('') + '</div>' +
      '<label class="chk"><input type="checkbox" id="mgTimpa"> Timpa data yang sudah ada (unit, tarif, paket, penyewa)</label>' +
      '<div class="row"><button class="btn btn-sec" id="mgPindai" type="button">' + ic('search') + 'Pindai (dry-run)</button><button class="btn btn-primary" id="mgJalan" type="button">' + ic('download') + 'Jalankan Impor</button></div><div id="mgHasil"></div></section>';
    const kirim = function (aksi, btn) {
      const sh = $$('[data-sh]', box).filter(function (c) { return c.checked; }).map(function (c) { return c.dataset.sh; });
      R.sibuk(btn, async function () {
        const r = await R.api(aksi, { source: $('#mgSrc', box).value, sheets: sh, timpa: $('#mgTimpa', box).checked }, { timeout: 330000 });
        if (!r.success) { $('#mgHasil', box).innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
        const d = r.data;
        $('#mgHasil', box).innerHTML = '<p class="small"><b>' + (d.dryRun ? 'Hasil pindai (belum ditulis)' : 'Impor selesai') + '</b> dari "' + esc(d.source.name) + '"</p>' +
          UI.tabel([{ l: 'Data', f: function (x) { return esc(x.k); } }, { l: 'Di app lama', r: true, f: function (x) { return x.v.source; } }, { l: 'Ditambah', r: true, f: function (x) { return '<b class="blue">' + x.v.inserted + '</b>'; } }, { l: 'Diperbarui', r: true, f: function (x) { return x.v.updated; } }, { l: 'Dilewati', r: true, f: function (x) { return x.v.skipped; } }],
            Object.keys(d.report).map(function (k) { return { k: k, v: d.report[k] }; }), { per: 50 }) + (d.warnings.length ? '<div class="selisih small"><b>Peringatan</b>' + d.warnings.map(function (w) { return '<div>• ' + esc(w) + '</div>'; }).join('') + '</div>' : '');
        if (!d.dryRun) { R.Mem.clear(); R.LS.bersihCache(); RP.boot(true); }
      });
    };
    $('#mgPindai', box).onclick = function () { kirim('migrasi.pindai', this); };
    $('#mgJalan', box).onclick = async function () { if (!(await R.konfirmasi('Jalankan impor sekarang? Spreadsheet lama tidak diubah.', { ya: 'Jalankan' }))) return; kirim('migrasi.jalankan', this); };
  }
  RP.daftar('pengguna', { render: renderPengguna });
})(window);
