/* ============================================================
 * landing.js — landing page publik: katalog, paket, testimoni,
 * booking instan (cek ketersediaan + estimasi + permintaan),
 * cek status booking & verifikasi nota. Tanpa login.
 * ============================================================ */
(function (W) {
  'use strict';
  const R = W.RF, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  const esc = R.esc, ic = R.ic;
  const LP = { data: null, kat: 'Semua', filter: 'Semua', semua: false, paket: '', hasil: null };

  /* ---------- Isi konten dari PengaturanSitus ---------- */
  function judulHero(s) { return esc(s || '').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>'); }
  function telpFmt(n) { const h = R.hp08(n); return h.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3'); }
  function render(d) {
    if (!d) return;
    LP.data = d; const s = d.situs || {};
    $$('[data-situs]').forEach(function (el) { const k = el.getAttribute('data-situs'); if (s[k] !== undefined && s[k] !== '') el.textContent = s[k]; });
    $$('[data-situs-wa]').forEach(function (el) { const v = s[el.getAttribute('data-situs-wa')]; if (v) el.textContent = telpFmt(v); });
    $('#heroJudul').innerHTML = judulHero(s.HERO_JUDUL);
    document.title = s.META_JUDUL || s.NAMA_USAHA || 'RentFleet';
    const md = $('meta[name="description"]'); if (md && s.META_DESKRIPSI) md.setAttribute('content', s.META_DESKRIPSI);
    if (s.LOGO_URL) $$('.brand-logo').forEach(function (el) { el.innerHTML = '<img src="' + esc(s.LOGO_URL) + '" alt="">'; });
    // hero
    const unggul = (d.units || []).filter(function (u) { return u.foto; })[0];
    const foto = s.HERO_FOTO || (unggul && unggul.foto);
    const art = $('#heroArt'); art.querySelectorAll('img,svg.ilustrasi').forEach(function (x) { x.remove(); });
    if (foto) { const im = document.createElement('img'); im.src = foto; im.alt = 'Armada ' + (s.NAMA_USAHA || ''); im.fetchPriority = 'high'; art.prepend(im); }
    else art.insertAdjacentHTML('afterbegin', '<svg class="ilustrasi" viewBox="0 0 500 400" aria-hidden="true"><circle cx="400" cy="70" r="120" fill="#ffffff" opacity=".07"/><circle cx="80" cy="360" r="160" fill="#FACC15" opacity=".12"/><g transform="translate(40 150) scale(1.9)">' + R.ilustrasi('Mobil', '#FACC15').replace(/^<svg[^>]*>|<\/svg>$/g, '') + '</g></svg>');
    $('#heroRating').textContent = (d.rating || 5).toFixed(1) + ' / 5.0';
    $('#jRating').textContent = (d.rating || 5).toFixed(1) + '/5 ★';
    $('#jUlasan').textContent = d.jumlahUlasan ? 'dari ' + d.jumlahUlasan + ' ulasan pelanggan' : 'pelanggan puas';
    $('#jBatal').textContent = String(s.KEBIJAKAN_PEMBATALAN || 'Sesuai kebijakan').split('.')[0];
    // promo
    const pb = $('#promoBanner'); if (s.PROMO_BANNER) { pb.src = s.PROMO_BANNER; pb.hidden = false; } else pb.hidden = true;
    // lokasi
    const lok = String(s.LOKASI_AMBIL || 'Kantor Utama').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    const sel = $('#cLok'), cur = sel.value;
    sel.innerHTML = lok.map(function (l) { return '<option>' + esc(l) + '</option>'; }).join('') + '<option value="__antar">Antar ke alamat saya</option>';
    if (cur) sel.value = cur;
    // kontak
    const wa = R.waLink(s.NO_WA, 'Halo ' + (s.NAMA_USAHA || '') + ', saya ingin bertanya tentang sewa kendaraan.');
    ['#btnWa', '#fabWa'].forEach(function (x) { $(x).href = wa; });
    $('#btnTelp').href = 'tel:' + R.hp08(s.NO_TELP || s.NO_WA);
    $('#lpTelp').href = 'tel:' + R.hp08(s.NO_TELP || s.NO_WA);
    const mp = $('#mapsLink'); if (s.MAPS_URL) { mp.href = s.MAPS_URL; mp.hidden = false; }
    $('#sosmed').innerHTML = [['SOSMED_IG', 'ig', 'Instagram'], ['SOSMED_FB', 'fb', 'Facebook'], ['SOSMED_TIKTOK', 'music', 'TikTok']].filter(function (x) { return s[x[0]]; })
      .map(function (x) { return '<a href="' + esc(s[x[0]]) + '" target="_blank" rel="noopener" aria-label="' + x[2] + '">' + ic(x[1], 's') + '</a>'; }).join('');
    renderUnit(); renderPaket(); renderTesti(); renderFaq();
  }
  function kartuUnit(u, est) {
    const foto = u.foto ? '<img src="' + esc(u.foto) + '" alt="' + esc(u.nama) + '" loading="lazy" decoding="async">' : R.ilustrasi(u.kategori, u.kategori === 'Motor' ? '#1E40AF' : '#1D4ED8');
    const label = est ? 'Estimasi ' + R.durasi(LP.hasil.mulai, LP.hasil.selesai) : (u.harian ? 'Mulai / hari' : 'Per jam');
    const harga = est ? R.rp(u.estimasi) : R.rp(u.harian || u.jam);
    return '<article class="ucard"><div class="foto">' + foto + '<span class="badge b-ok">Tersedia</span>' + (u.kelas ? '<span class="badge b-info r">' + esc(u.kelas) + '</span>' : '') + '</div>' +
      '<div><h4>' + esc(u.nama) + '</h4><div class="sub">' + esc(u.kategori) + (u.tahun ? ' · ' + esc(u.tahun) : '') + (u.warna ? ' · ' + esc(u.warna) : '') + '</div></div>' +
      '<div class="spec"><span>' + ic('seat', 's') + esc(u.kapasitas) + (u.kategori === 'Motor' ? ' orang' : ' kursi') + '</span><span>' + ic('cog', 's') + (u.transmisi === 'MT' ? 'Manual' : 'Matic') + '</span><span>' + ic('fuel', 's') + esc(u.bbm || 'Bensin') + '</span></div>' +
      '<div class="harga"><div><small>' + label + '</small><b class="tnum">' + harga + '</b></div><button class="btn btn-primary btn-sm" data-pesan="' + esc(u.id) + '" type="button">Pesan</button></div></article>';
  }
  function renderUnit() {
    const all = (LP.data && LP.data.units) || [];
    let list = all.filter(function (u) { return LP.filter === 'Semua' || u.kategori === LP.filter; });
    const lebih = list.length > 6 && !LP.semua;
    if (lebih) list = list.slice(0, 6);
    $('#unitGrid').innerHTML = list.length ? list.map(function (u) { return kartuUnit(u); }).join('') : '<div class="empty">' + ic('car') + '<p>Belum ada armada di katalog.</p></div>';
    $('#lihatSemua').textContent = LP.semua ? 'Tampilkan lebih sedikit ↑' : 'Jelajahi seluruh ' + all.length + ' armada →';
  }
  function renderPaket() {
    const p = (LP.data && LP.data.paket) || [];
    const sec = $('#harga'); sec.hidden = !p.length;
    $('#paketGrid').innerHTML = p.map(function (x, i) {
      return '<div class="pcard ' + (x.populer ? 'pop' : '') + '">' + (x.populer ? '<span class="pita">Paling Populer</span>' : '') +
        '<span class="tipe">' + esc(['Hemat', 'Favorit wisata & bisnis', 'Eksekutif'][i] || 'Paket') + '</span><h3>' + esc(x.nama) + '</h3><p class="small muted">' + esc(x.deskripsi) + '</p>' +
        '<div class="h tnum">' + R.rpK(x.harga) + ' <small>/ 24 jam</small></div>' +
        '<ul>' + x.fitur.map(function (f) { return '<li>' + ic('checkc', 's') + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>' +
        (x.tambahan ? '<p class="xs muted">Tambahan ' + R.rp(x.tambahan) + '/hari di atas tarif unit.</p>' : '<p class="xs muted">Tanpa biaya tambahan.</p>') +
        '<button class="btn ' + (x.populer ? 'btn-primary' : 'btn-sec') + '" data-paket="' + esc(x.id) + '" type="button">Pilih Paket ' + esc(x.nama) + '</button></div>';
    }).join('');
  }
  function bintang(n) { let s = ''; for (let i = 1; i <= 5; i++) s += ic(i <= n ? 'starf' : 'star', 's'); return '<div class="bintang" aria-label="' + n + ' bintang">' + s + '</div>'; }
  function renderTesti() {
    const t = (LP.data && LP.data.testimoni) || [];
    $('#tentang').hidden = !t.length;
    $('#testiTrack').innerHTML = t.map(function (x) { return '<div class="tcard">' + bintang(x.rating) + '<q>' + esc(x.isi) + '</q><div class="who"><span class="avatar">' + esc(R.inisial(x.nama)) + '</span><div><b>' + esc(x.nama) + '</b><div class="xs muted">' + esc(x.kota || 'Pelanggan') + '</div></div></div></div>'; }).join('');
    const n = Math.max(1, Math.ceil(t.length / (W.innerWidth < 900 ? 1 : 3)));
    $('#testiDots').innerHTML = n > 1 ? Array.from({ length: n }, function (_, i) { return '<button type="button" aria-label="Slide ' + (i + 1) + '" data-dot="' + i + '" class="' + (i ? '' : 'on') + '"></button>'; }).join('') : '';
  }
  function renderFaq() {
    const s = (LP.data && LP.data.situs) || {};
    const items = String(s.FAQ || '').split('\n').map(function (l) { const p = l.split('|'); return { q: (p[0] || '').trim(), a: p.slice(1).join('|').trim() }; }).filter(function (x) { return x.q; });
    $('#faqList').innerHTML = items.map(function (x, i) { return '<details' + (i ? '' : ' open') + '><summary>' + esc(x.q) + '</summary><p>' + esc(x.a) + '</p></details>'; }).join('') +
      '<details><summary>Kebijakan pembatalan</summary><p>' + esc(s.KEBIJAKAN_PEMBATALAN || '') + '</p></details>';
  }

  /* ---------- Booking instan ---------- */
  function defaultTanggal() {
    const besok = Date.now() + 86400e3;
    if (!$('#cTglA').value) $('#cTglA').value = R.isoTgl(besok);
    if (!$('#cTglK').value) $('#cTglK').value = R.isoTgl(besok + 86400e3);
    $('#cTglA').min = R.isoTgl(); $('#cTglK').min = R.isoTgl();
  }
  function rentangBar() { return { mulai: $('#cTglA').value + ' ' + ($('#cJamA').value || '09:00'), selesai: $('#cTglK').value + ' ' + ($('#cJamK').value || '09:00') }; }
  async function cari(e) {
    if (e) e.preventDefault();
    const r = rentangBar();
    if (!(R.ms(r.selesai) > R.ms(r.mulai))) { R.toast('Waktu kembali harus setelah waktu ambil.', 'err'); return; }
    await R.sibuk($('#cariBtn'), async function () {
      const res = await R.api('publik.cari', { kategori: LP.kat, mulai: r.mulai, selesai: r.selesai });
      if (!res.success) { R.toast(res.message, 'err'); return; }
      LP.hasil = res.data;
      const sec = $('#hasilCari'); sec.hidden = false;
      $('#hasilJudul').textContent = res.data.rows.length + ' unit tersedia · ' + R.tgl(r.mulai, true) + ' → ' + R.tgl(r.selesai, true);
      $('#hasilGrid').innerHTML = res.data.rows.length ? res.data.rows.map(function (u) { return kartuUnit(u, true); }).join('') :
        '<div class="empty">' + ic('calendar') + '<p>Semua unit ' + (LP.kat === 'Semua' ? '' : LP.kat.toLowerCase() + ' ') + 'sudah terpesan di jadwal ini.<br>Coba geser jadwal atau hubungi kami via WhatsApp.</p></div>';
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- Form pesan (modal) ---------- */
  function bukaPesan(id) {
    const u = ((LP.hasil && LP.hasil.rows) || []).concat((LP.data && LP.data.units) || []).filter(function (x) { return x.id === id; })[0];
    if (!u) return;
    const s = (LP.data && LP.data.situs) || {}, r = rentangBar(), paket = (LP.data && LP.data.paket) || [];
    const lok = String(s.LOKASI_AMBIL || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    const lokBar = $('#cLok').value;
    const isi = '<div class="row" style="gap:14px;align-items:center"><div class="thumb" style="width:84px;height:60px">' + (u.foto ? '<img src="' + esc(u.foto) + '" alt="">' : R.ilustrasi(u.kategori)) + '</div>' +
      '<div class="grow"><b>' + esc(u.nama) + '</b><div class="small muted">' + esc(u.kategori) + ' · ' + (u.transmisi === 'MT' ? 'Manual' : 'Matic') + ' · ' + esc(u.kapasitas) + (u.kategori === 'Motor' ? ' orang' : ' kursi') + '</div></div></div>' +
      '<form id="fPesan" class="stack" autocomplete="on">' +
      '<div class="grid-2"><div class="field"><label>Tanggal &amp; jam ambil</label><input class="input" type="datetime-local" name="mulai" step="900" required value="' + r.mulai.replace(' ', 'T') + '"></div>' +
      '<div class="field"><label>Tanggal &amp; jam kembali</label><input class="input" type="datetime-local" name="selesai" step="900" required value="' + r.selesai.replace(' ', 'T') + '"></div></div>' +
      (paket.length ? '<div class="field"><label>Paket layanan</label><select class="input" name="paket"><option value="">Tanpa paket (tarif dasar)</option>' + paket.map(function (p) { return '<option value="' + esc(p.id) + '"' + (LP.paket === p.id ? ' selected' : '') + '>' + esc(p.nama) + (p.tambahan ? ' (+' + R.rp(p.tambahan) + '/hari)' : '') + '</option>'; }).join('') + '</select></div>' : '') +
      '<label class="chk" id="drvRow" hidden><input type="checkbox" name="driver"> Dengan driver</label>' +
      '<div class="card card-pad" id="estBox" style="background:var(--primary-50);border-color:var(--primary-100)"><div class="skel" style="height:18px;width:60%"></div></div>' +
      '<div class="grid-2"><div class="field"><label>Nama lengkap</label><input class="input" name="nama" autocomplete="name" required minlength="3" maxlength="80"></div>' +
      '<div class="field"><label>No. WhatsApp</label><input class="input" name="no_wa" type="tel" inputmode="tel" autocomplete="tel" placeholder="0812xxxxxxxx" required></div></div>' +
      '<div class="field"><label>Email (opsional, untuk nota)</label><input class="input" name="email" type="email" autocomplete="email"></div>' +
      '<div class="grid-2"><div class="field"><label>Lokasi ambil / antar</label><input class="input" name="lokasi_antar" list="dlLok" value="' + esc(lokBar === '__antar' ? '' : lokBar) + '" placeholder="Pilih pool atau tulis alamat"></div>' +
      '<div class="field"><label>Lokasi kembali / jemput</label><input class="input" name="lokasi_jemput" list="dlLok" placeholder="Sama dengan lokasi ambil"></div></div>' +
      '<datalist id="dlLok">' + lok.map(function (l) { return '<option value="' + esc(l) + '">'; }).join('') + '</datalist>' +
      '<div class="field"><label>Catatan (opsional)</label><textarea class="input" name="catatan" rows="2" maxlength="500" placeholder="Misal: butuh 2 helm, kursi bayi, dll."></textarea></div>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
      '<label class="chk"><input type="checkbox" name="setuju" required> <span>Saya setuju dengan <a href="#" data-info="SYARAT_KETENTUAN">syarat &amp; ketentuan</a> serta <a href="#" data-info="KEBIJAKAN_PEMBATALAN">kebijakan pembatalan</a>.</span></label>' +
      '<p class="hint">Antar-jemput di luar pool: biaya dikonfirmasi admin. Jadwal ditahan maks. ' + esc(s.HOLD_JAM || 24) + ' jam sampai dikonfirmasi.</p></form>';
    const m = R.modal({ judul: 'Pesan ' + u.nama, isi: isi, kaki: '<button class="btn btn-sec" data-tutup type="button">Batal</button><button class="btn btn-accent" id="kirimPesan" type="button">' + ic('send') + 'Kirim Permintaan</button>' });
    const f = m.$('#fPesan');
    const estimasi = R.debounce(async function () {
      const v = R.nilaiForm(f), box = m.$('#estBox');
      const a = String(v.mulai).replace('T', ' '), z = String(v.selesai).replace('T', ' ');
      if (!a || !z) return;
      const res = await R.api('publik.estimasi', { id: u.id, mulai: a, selesai: z, paket: v.paket || '', driver: !!v.driver });
      if (!box.isConnected) return;
      if (!res.success) { box.innerHTML = '<p class="err">' + esc(res.message) + '</p>'; return; }
      const d = res.data; m.$('#drvRow').hidden = !d.driverAda;
      if (!d.ok) { box.innerHTML = '<p class="err">' + esc(d.pesan) + '</p>'; return; }
      box.innerHTML = (d.tersedia ? '<span class="badge dot b-ok">Tersedia di jadwal ini</span>' : '<span class="badge dot b-bad">Sudah terpesan di jadwal ini</span>') +
        '<div class="row between" style="margin-top:10px"><span class="muted small">Estimasi biaya sewa (' + R.durasi(a, z) + ')</span><b class="blue tnum" style="font-size:22px">' + R.rp(d.total) + '</b></div>' +
        '<div class="xs muted">' + d.rincian.map(esc).join(' · ') + '</div>' +
        '<div class="xs muted" style="margin-top:6px">Deposit jaminan ' + R.rp(d.deposit) + ' (dikembalikan) · Denda telat ' + R.rp(d.denda) + '/jam setelah toleransi ' + d.toleransi + ' menit' + (d.km ? ' · ' + d.km + ' km/hari' : '') + '</div>';
      m.$('#kirimPesan').disabled = !d.tersedia;
    }, 350);
    f.addEventListener('input', estimasi); f.addEventListener('change', estimasi); estimasi();
    m.$('#kirimPesan').onclick = function () {
      if (!f.reportValidity()) return;
      const v = R.nilaiForm(f);
      R.sibuk(m.$('#kirimPesan'), async function () {
        const res = await R.api('publik.ajukan', { id: u.id, mulai: v.mulai.replace('T', ' '), selesai: v.selesai.replace('T', ' '), nama: v.nama, no_wa: v.no_wa, email: v.email,
          lokasi_antar: v.lokasi_antar, lokasi_jemput: v.lokasi_jemput, catatan: v.catatan, paket: v.paket || '', driver: !!v.driver, setuju: v.setuju, website: v.website });
        if (!res.success) { R.toast(res.message, 'err'); if (res.code === 'CONFLICT') estimasi(); return; }
        LS_KODE(res.data.kode, v.no_wa);
        m.tutup(); sukses(res.data, v);
      });
    };
  }
  function LS_KODE(kode, wa) { const a = R.LS.get('kodeSaya', []); a.unshift({ kode: kode, wa: R.hp08(wa), t: Date.now() }); R.LS.set('kodeSaya', a.slice(0, 10)); }
  function sukses(d, v) {
    const s = (LP.data && LP.data.situs) || {};
    const pesan = 'Halo ' + (s.NAMA_USAHA || '') + ', saya ' + v.nama + ' sudah mengirim permintaan booking *' + d.kode + '* untuk ' + d.unit + ' (' + R.tgl(d.mulai, true) + ' – ' + R.tgl(d.selesai, true) + '). Mohon konfirmasinya. Terima kasih.';
    R.modal({ judul: 'Permintaan terkirim 🎉', isi: '<div class="hasil-verif"><span class="big b-ok" style="background:var(--ok-bg);color:var(--ok)">' + ic('checkc', 'l') + '</span>' +
      '<p>Kode booking Anda</p><b style="font-size:28px;letter-spacing:.04em" class="tnum">' + esc(d.kode) + '</b>' +
      '<p class="small muted">Jadwal ditahan sampai <b>' + R.tgl(d.hold_sampai, true) + ' WIB</b>. Admin akan menghubungi Anda via WhatsApp untuk konfirmasi & DP.</p></div>' +
      '<dl class="kv"><dt>Unit</dt><dd>' + esc(d.unit) + '</dd><dt>Jadwal</dt><dd>' + R.tglPendek(d.mulai) + ' – ' + R.tglPendek(d.selesai) + '</dd><dt>Estimasi</dt><dd class="blue">' + R.rp(d.total) + '</dd><dt>Deposit</dt><dd>' + R.rp(d.deposit) + '</dd></dl>',
      kaki: '<button class="btn btn-sec" type="button" onclick="RF.salin(\'' + esc(d.kode) + '\')">' + ic('copy') + 'Salin kode</button><a class="btn btn-sec" href="#/cek/' + esc(d.kode) + '" data-tutup>Cek status</a><a class="btn btn-wa" target="_blank" rel="noopener" href="' + R.waLink(s.NO_WA, pesan) + '">' + ic('chat') + 'Kirim via WhatsApp</a>' });
  }
  function info(k) {
    const s = (LP.data && LP.data.situs) || {};
    const judul = { SYARAT_KETENTUAN: 'Syarat & Ketentuan', KEBIJAKAN_PEMBATALAN: 'Kebijakan Pembatalan', KEBIJAKAN_PRIVASI: 'Kebijakan Privasi' }[k] || k;
    const isi = String(s[k] || '-').split('\n').filter(Boolean);
    R.modal({ judul: judul, isi: isi.length > 1 ? '<ol>' + isi.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '<p>' + esc(isi[0] || '-') + '</p>', kaki: '<button class="btn btn-primary" data-tutup>Tutup</button>' });
  }

  /* ---------- Cek status & verifikasi (halaman tunggal) ---------- */
  function kepalaSolo() { const s = (LP.data && LP.data.situs) || {}; return '<a class="brand" href="#/"><span class="brand-logo">' + ic('car') + '</span><span><b>' + esc(s.NAMA_USAHA || 'RentFleet') + '</b><small>' + esc(s.TAGLINE || '') + '</small></span></a>'; }
  function halamanCek(kode) {
    R.tampil('solo'); W.scrollTo(0, 0);
    const simpan = R.LS.get('kodeSaya', []), cocok = simpan.filter(function (x) { return x.kode === kode; })[0];
    $('#solo').innerHTML = '<div class="solo"><div class="solo-card">' + kepalaSolo() + '<h1>Cek Status Booking</h1>' +
      '<form id="fCek" class="stack"><div class="field"><label>Kode booking</label><input class="input" name="kode" required placeholder="RF-26-0001" value="' + esc(kode || '') + '" style="text-transform:uppercase"></div>' +
      '<div class="field"><label>No. WhatsApp pemesan</label><input class="input" name="no_wa" type="tel" required value="' + esc(cocok ? cocok.wa : '') + '"></div>' +
      '<button class="btn btn-primary btn-lg" type="submit">' + ic('search') + 'Cek Status</button></form><div id="hasilCek"></div>' +
      (simpan.length ? '<p class="xs muted">Kode tersimpan di perangkat ini: ' + simpan.map(function (x) { return '<a href="#/cek/' + esc(x.kode) + '">' + esc(x.kode) + '</a>'; }).join(', ') + '</p>' : '') +
      '<a class="btn btn-ghost" href="#/">' + ic('left') + 'Kembali ke beranda</a></div></div>';
    const f = $('#fCek');
    f.onsubmit = function (e) {
      e.preventDefault(); const v = R.nilaiForm(f);
      R.sibuk(f.querySelector('button'), async function () {
        const res = await R.api('publik.cek', { kode: v.kode.trim().toUpperCase(), no_wa: v.no_wa });
        const box = $('#hasilCek');
        if (!res.success) { box.innerHTML = '<p class="err">' + esc(res.message) + '</p>'; return; }
        const d = res.data;
        box.innerHTML = '<div class="card card-pad stack"><div class="row between"><b>' + esc(d.kode) + '</b>' + R.badge(d.status) + '</div>' +
          '<dl class="kv"><dt>Nama</dt><dd>' + esc(d.nama) + '</dd><dt>Unit</dt><dd>' + esc(d.unit) + '</dd><dt>Ambil</dt><dd>' + R.tgl(d.mulai, true) + '</dd><dt>Kembali</dt><dd>' + R.tgl(d.selesai, true) + '</dd>' +
          '<dt>Total</dt><dd>' + R.rp(d.total) + '</dd><dt>Terbayar</dt><dd>' + R.rp(d.terbayar) + '</dd><dt>Sisa</dt><dd class="blue">' + R.rp(d.sisa) + '</dd></dl>' +
          (d.hold_sampai ? '<p class="hint">Menunggu konfirmasi admin sampai ' + R.tgl(d.hold_sampai, true) + ' WIB.</p>' : '') + (d.alasan ? '<p class="err">' + esc(d.alasan) + '</p>' : '') + '</div>';
      });
    };
    if (kode && cocok) f.requestSubmit();
  }
  async function halamanVerif(kode) {
    R.tampil('solo'); W.scrollTo(0, 0);
    $('#solo').innerHTML = '<div class="solo"><div class="solo-card">' + kepalaSolo() + '<h1>Verifikasi Dokumen</h1><div id="hv" class="stack"><div class="skel" style="height:120px"></div></div><a class="btn btn-ghost" href="#/">' + ic('left') + 'Ke beranda</a></div></div>';
    const res = await R.api('publik.verifikasi', { kode: kode });
    const box = $('#hv');
    if (!res.success) { box.innerHTML = '<p class="err">' + esc(res.message) + '</p>'; return; }
    const d = res.data, peta = { 'SAH': ['b-ok', 'checkc', 'Dokumen SAH', 'Data cocok dengan catatan resmi sistem.'], 'TIDAK COCOK': ['b-warn', 'alert', 'Data tidak cocok', 'Data transaksi telah berubah di luar aplikasi. Hubungi kami untuk konfirmasi.'],
      'DIBATALKAN': ['b-bad', 'x', 'Transaksi dibatalkan', 'Booking ini sudah dibatalkan.'], 'DITOLAK': ['b-bad', 'x', 'Tidak dikenali', d.pesan || 'Kode tidak terdaftar.'] }[d.hasil] || ['b-off', 'info', d.hasil, ''];
    box.innerHTML = '<div class="hasil-verif"><span class="big badge ' + peta[0] + '" style="height:72px;width:72px;padding:0;justify-content:center">' + ic(peta[1], 'l') + '</span><h2>' + esc(peta[2]) + '</h2><p class="muted small">' + esc(peta[3]) + '</p></div>' +
      (d.ringkasan ? '<dl class="kv"><dt>Nomor</dt><dd>' + esc(d.ringkasan.nomor) + '</dd><dt>Pelanggan</dt><dd>' + esc(d.ringkasan.pelanggan) + '</dd><dt>Unit</dt><dd>' + esc(d.ringkasan.unit) + '</dd><dt>Periode</dt><dd>' + R.tglPendek(d.ringkasan.mulai) + ' – ' + R.tglPendek(d.ringkasan.selesai) + '</dd><dt>Total</dt><dd>' + R.rp(d.ringkasan.total) + '</dd><dt>Status</dt><dd>' + esc(d.ringkasan.status) + (d.ringkasan.lunas ? ' · Lunas' : '') + '</dd></dl>' : '');
  }

  /* ---------- Event ---------- */
  function pasangEvent() {
    $('#lpBurger').onclick = function () { const n = $('#lpNav'); n.classList.toggle('open'); this.setAttribute('aria-expanded', n.classList.contains('open')); };
    $$('.lp-menu a').forEach(function (a) { a.addEventListener('click', function () { $('#lpNav').classList.remove('open'); }); });
    $('#cariKat').onclick = function (e) { const b = e.target.closest('button'); if (!b) return; LP.kat = b.dataset.k; $$('#cariKat button').forEach(function (x) { x.classList.toggle('on', x === b); }); };
    $('#filterKat').onclick = function (e) { const b = e.target.closest('button'); if (!b) return; LP.filter = b.dataset.k; $$('#filterKat button').forEach(function (x) { x.classList.toggle('on', x === b); }); renderUnit(); };
    $('#cariForm').onsubmit = cari;
    $('#cTglA').addEventListener('change', function () { if ($('#cTglK').value < this.value) $('#cTglK').value = R.isoTgl(R.ms(this.value) + 86400e3); });
    $('#hasilTutup').onclick = function () { $('#hasilCari').hidden = true; LP.hasil = null; };
    $('#lihatSemua').onclick = function (e) { e.preventDefault(); LP.semua = !LP.semua; renderUnit(); };
    document.addEventListener('click', function (e) {
      const p = e.target.closest('[data-pesan]'); if (p) { bukaPesan(p.dataset.pesan); return; }
      const k = e.target.closest('[data-paket]'); if (k) { LP.paket = k.dataset.paket; R.toast('Paket dipilih. Tentukan jadwal lalu tekan Cari Kendaraan.', 'ok'); $('.cari').scrollIntoView({ behavior: 'smooth' }); return; }
      const i = e.target.closest('[data-info]'); if (i && !$('#landing').hidden || (i && e.target.closest('.modal'))) { e.preventDefault(); info(i.dataset.info); return; }
      const d = e.target.closest('[data-dot]'); if (d) { const tr = $('#testiTrack'); tr.scrollTo({ left: tr.clientWidth * Number(d.dataset.dot), behavior: 'smooth' }); }
    });
    $('#testiTrack').addEventListener('scroll', R.debounce(function () { const tr = $('#testiTrack'), i = Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth)); $$('#testiDots button').forEach(function (b, j) { b.classList.toggle('on', i === j); }); }, 80));
    $('#btnPasangLp').onclick = function () { R.Pasang.tampil(); };
    $('#newsForm').onsubmit = function (e) { e.preventDefault(); const s = (LP.data && LP.data.situs) || {}; W.open(R.waLink(s.NO_WA, 'Halo, saya ingin menerima info promo. Email saya: ' + this.querySelector('input').value), '_blank'); };
    $('#tahun').textContent = new Date().getFullYear();
    // sorot menu sesuai seksi yang terlihat
    if ('IntersectionObserver' in W) {
      const io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) $$('.lp-menu a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + x.target.id); }); }); }, { rootMargin: '-45% 0px -50% 0px' });
      ['beranda', 'armada', 'harga', 'cara-sewa', 'tentang', 'lokasi'].forEach(function (id) { const el = document.getElementById(id); if (el) io.observe(el); });
    }
  }

  /* ---------- Rute ---------- */
  let siap = false;
  function landing() {
    R.tampil('landing'); document.documentElement.removeAttribute('data-theme');
    if (siap) return; siap = true;
    defaultTanggal();
    if (!R.SIAP) { R.toast('Konfigurasi belum lengkap: isi GAS_URL di js/config.js.', 'err', 8000); return; }
    R.warmUp('pub');
    R.muat('pubboot', 'publik.boot', {}, { umur: 300, render: render, batch: false, diam: true }).then(function (d) { if (!d) R.toast('Gagal memuat katalog. Periksa koneksi.', 'err'); });
  }
  function kePanel(m) {
    if (W.RFPanel) { W.RFPanel.rute(m.input); return; }
    R.tampil('solo');
    if (!document.getElementById('solo').innerHTML) document.getElementById('solo').innerHTML = '<div class="solo"><div class="skel" style="width:min(460px,100%);height:360px;border-radius:24px"></div></div>';
    const daftar = ['./js/panel.js', './js/hal-operasional.js', './js/hal-lapangan.js', './js/hal-keuangan.js', './js/hal-admin.js', './js/struk-engine.js', './js/struk-printer.js', './js/struk-ui.js'];
    daftar.reduce(function (p, src) { return p.then(function () { return R.muatSkrip(src + '?v=' + R.VERSI); }); }, Promise.resolve())
      .then(function () { W.RFPanel.rute(m.input); })
      .catch(function (e) { R.toast(e.message + ' — periksa koneksi lalu muat ulang.', 'err', 8000); });
  }
  R.Router.on(/^#\/(masuk|darurat|app)(\/.*)?$/, kePanel);
  R.Router.on(/^#\/cek(?:\/([\w-]+))?$/, function (m) { if (!LP.data) R.muat('pubboot', 'publik.boot', {}, { umur: 3600, render: function (d) { LP.data = d; }, batch: false, diam: true }); halamanCek((m[1] || '').toUpperCase()); });
  R.Router.on(/^#\/v\/([\w-]+)$/, function (m) { halamanVerif(m[1].toUpperCase()); });
  R.Router.on(/^#\/?$/, landing);
  R.Router.on(/^#\/.*/, landing);

  document.addEventListener('DOMContentLoaded', function () {
    pasangEvent();
    const h = location.hash;
    if (!h || !/^#\//.test(h)) landing(); else R.Router.jalan();
  });
  W.RFLanding = { render: render, data: function () { return LP.data; } };
})(window);
