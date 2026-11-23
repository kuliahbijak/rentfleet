/* ============================================================
 * panel.js — cangkang panel internal: login (Google + darurat),
 * boot 1 panggilan, navigasi berbasis peran, dashboard, polling
 * ============================================================ */
(function (W) {
  'use strict';
  const R = W.RF, esc = R.esc, ic = R.ic;
  const $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  const P = { boot: R.Mem.get('boot') ? R.Mem.get('boot').data : null, halaman: {}, aktif: '', arg: '', render: 0 };

  /* ---------- Registri halaman ---------- */
  const MENU = [
    { id: 'dashboard', judul: 'Dashboard', ikon: 'grid', roles: ['OWNER', 'ADMIN', 'CREW'] },
    { grp: 'Operasional' },
    { id: 'armada', judul: 'Armada', ikon: 'car', roles: ['OWNER', 'ADMIN', 'CREW'] },
    { id: 'tarif', judul: 'Tarif & Paket', ikon: 'tag', roles: ['OWNER'] },
    { id: 'kalender', judul: 'Kalender', ikon: 'calendar', roles: ['OWNER', 'ADMIN'] },
    { id: 'booking', judul: 'Booking', ikon: 'clip', roles: ['OWNER', 'ADMIN'], badge: 'permintaan' },
    { id: 'tugas', judul: 'Antar-Jemput', ikon: 'truck', roles: ['OWNER', 'ADMIN', 'CREW'] },
    { id: 'cek', judul: 'Check-in/out', ikon: 'key', roles: ['OWNER', 'ADMIN', 'CREW'] },
    { id: 'penyewa', judul: 'Penyewa', ikon: 'users', roles: ['OWNER', 'ADMIN'] },
    { grp: 'Keuangan & Armada' },
    { id: 'keuangan', judul: 'Keuangan & Deposit', ikon: 'wallet', roles: ['OWNER', 'ADMIN'] },
    { id: 'servis', judul: 'Servis & Pajak', ikon: 'wrench', roles: ['OWNER', 'ADMIN', 'CREW'] },
    { id: 'laporan', judul: 'Laporan', ikon: 'chart', roles: ['OWNER'] },
    { grp: 'Pemasaran & Sistem' },
    { id: 'konten', judul: 'Konten Situs', ikon: 'layout', roles: ['OWNER', 'ADMIN'] },
    { id: 'notifikasi', judul: 'WhatsApp & Notifikasi', ikon: 'chat', roles: ['OWNER', 'ADMIN'] },
    { id: 'crm', judul: 'CRM Kontak', ikon: 'users', roles: ['OWNER', 'ADMIN'] },
    { id: 'struk', judul: 'Struk & Printer', ikon: 'printer', roles: ['OWNER'] },
    { id: 'pengguna', judul: 'Pengguna & Sistem', ikon: 'settings', roles: ['OWNER'] }
  ];
  function daftar(id, def) { P.halaman[id] = def; }
  function role() { return R.Sesi.me ? R.Sesi.me.role : ''; }
  function boleh(id) { const m = MENU.filter(function (x) { return x.id === id; })[0]; return m && m.roles.indexOf(role()) > -1; }
  function situs(k, d) { return P.boot && P.boot.situs && P.boot.situs[k] !== undefined && P.boot.situs[k] !== '' ? P.boot.situs[k] : d; }

  /* ---------- Login ---------- */
  function kepala() { return '<a class="brand" href="#/"><span class="brand-logo">' + ic('car') + '</span><span><b>' + esc(situs('NAMA_USAHA', 'RentFleet')) + '</b><small>Operations Panel</small></span></a>'; }
  function halamanMasuk() {
    if (R.Sesi.token) { location.hash = '#/app'; return; }
    R.tampil('solo'); R.warmUp('admin');
    $('#solo').innerHTML = '<div class="solo"><div class="solo-card">' + kepala() + '<h1>Masuk ke Panel</h1>' +
      '<p class="muted small" style="text-align:center">Gunakan akun Google yang sudah didaftarkan Owner.</p>' +
      '<div id="gBtn" style="display:grid;justify-items:center;min-height:44px"><div class="skel" style="height:44px;width:240px"></div></div>' +
      '<p class="hint" id="gInfo" style="text-align:center"></p>' +
      '<a class="btn btn-ghost" href="#/">' + ic('left') + 'Kembali ke situs</a></div></div>';
    if (!R.SIAP) { $('#gBtn').innerHTML = '<p class="err">Konfigurasi belum lengkap: isi GAS_URL di js/config.js.</p>'; return; }
    R.api('auth.config', {}).then(function (r) {
      if (!r.success) { $('#gBtn').innerHTML = '<p class="err">' + esc(r.message) + '</p>'; return; }
      if (!r.data.siap) { $('#gBtn').innerHTML = '<p class="err">Backend belum disiapkan. Jalankan setupAppEnvironment() di Apps Script.</p>'; return; }
      if (!r.data.googleClientId) { $('#gBtn').innerHTML = '<p class="hint" style="text-align:center">Login Google belum diaktifkan. Owner perlu masuk lewat akses darurat (alamat <code>#/darurat</code>) lalu mengisi Client ID di menu Pengguna & Sistem → Keamanan.</p>'; return; }
      R.muatSkrip('https://accounts.google.com/gsi/client').then(function () {
        W.google.accounts.id.initialize({ client_id: r.data.googleClientId, callback: function (resp) { masukGoogle(resp.credential); }, auto_select: false, ux_mode: 'popup' });
        $('#gBtn').innerHTML = '';
        W.google.accounts.id.renderButton($('#gBtn'), { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id', width: 280 });
      }).catch(function () { $('#gBtn').innerHTML = '<p class="err">Gagal memuat tombol Google. Periksa koneksi.</p>'; });
    });
  }
  function masukGoogle(cred) {
    $('#gInfo').textContent = 'Memeriksa akun…';
    R.api('auth.google', { credential: cred }).then(function (r) {
      if (!r.success) { $('#gInfo').innerHTML = '<span class="err">' + esc(r.message) + '</span>'; return; }
      setelahMasuk(r.data);
    });
  }
  function halamanDarurat() {
    if (R.Sesi.token) { location.hash = '#/app'; return; }
    R.tampil('solo');
    $('#solo').innerHTML = '<div class="solo"><div class="solo-card">' + kepala() + '<h1>Akses Darurat</h1><p class="hint" style="text-align:center">Dipakai Owner untuk pengaturan awal atau saat login Google bermasalah.</p>' +
      '<form id="fDar" class="stack" autocomplete="off"><div class="field"><label>Nama pengguna</label><input class="input" name="username" required autocomplete="username"></div>' +
      '<div class="field"><label>Kata sandi</label><input class="input" name="password" type="password" required autocomplete="current-password"></div>' +
      '<button class="btn btn-primary btn-lg" type="submit">' + ic('lock') + 'Masuk</button></form><a class="btn btn-ghost" href="#/masuk">Masuk dengan Google</a></div></div>';
    $('#fDar').onsubmit = function (e) {
      e.preventDefault(); const v = R.nilaiForm(this), btn = this.querySelector('button');
      R.sibuk(btn, async function () { const r = await R.api('auth.darurat', v); if (!r.success) { R.toast(r.message, 'err'); return; } setelahMasuk(r.data); });
    };
  }
  function setelahMasuk(d) {
    R.Sesi.set(d.token, d.me); R.Mem.clear(); R.LS.bersihCache(); P.boot = null;
    R.toast('Selamat datang, ' + (d.me.nama || d.me.email) + '!', 'ok');
    location.hash = '#/app';
  }
  async function keluar(semua) {
    if (!(await R.konfirmasi(semua ? 'Keluarkan akun ini dari SEMUA perangkat?' : 'Keluar dari panel?', { ya: 'Keluar' }))) return;
    R.api(semua ? 'auth.keluarSemua' : 'auth.keluar', {});
    R.Sesi.hapus(); P.boot = null; clearInterval(P.poll);
    try { if (W.google && W.google.accounts) W.google.accounts.id.disableAutoSelect(); } catch (e) { }
    location.hash = '#/masuk';
  }

  /* ---------- Boot & cangkang ---------- */
  async function boot(paksa) {
    const r = await R.muat('boot', 'boot', { appUrl: location.origin + location.pathname }, { umur: paksa ? 0 : 20, batch: false, paksa: !!paksa, render: function (d) {
      P.boot = d; if (d && d.me) { R.Sesi.me = Object.assign({}, R.Sesi.me, d.me); R.LS.set('me', R.Sesi.me); }
      if (W.StrukPrinter && d && d.struk) W.StrukPrinter.pasang({ templates: d.struk.templates, server: d.struk.printer, logoUrl: (d.situs && d.situs.LOGO_URL) || '', appUrl: (d.situs && d.situs.APP_URL) || location.origin + location.pathname });
      segarkanCangkang();
      if (P.aktif === 'dashboard') tampilHalaman();
    } });
    return r;
  }
  function cangkang() {
    const me = R.Sesi.me || {};
    const nav = MENU.filter(function (m) { return m.grp || m.roles.indexOf(me.role) > -1; }).map(function (m) {
      if (m.grp) return '<div class="grp">' + esc(m.grp) + '</div>';
      return '<a href="#/app/' + m.id + '" data-nav="' + m.id + '">' + ic(m.ikon) + '<span>' + esc(m.judul) + '</span>' + (m.badge ? '<span class="nb" data-badge="' + m.badge + '" hidden></span>' : '') + '</a>';
    }).join('').replace(/(<div class="grp">[^<]*<\/div>)(?=<div class="grp">|$)/g, '');
    const crew = me.role === 'CREW';
    const bnav = crew ? [['dashboard', 'grid', 'Beranda'], ['tugas', 'truck', 'Tugas'], ['cek', 'key', 'Serah'], ['servis', 'wrench', 'Servis']] : [['dashboard', 'grid', 'Beranda'], ['booking', 'clip', 'Booking'], ['cek', 'key', 'Serah'], ['kalender', 'calendar', 'Kalender']];
    $('#panel').innerHTML =
      '<aside class="side" id="side"><div class="side-brand"><span class="brand-logo">' + ic('car') + '</span><div><b data-s="NAMA_USAHA">' + esc(situs('NAMA_USAHA', 'RentFleet')) + '</b><small>Operations Panel</small></div></div>' +
      '<nav class="nav" aria-label="Menu panel">' + nav + '</nav>' +
      '<div class="side-foot"><div class="me-chip"><span class="avatar">' + esc(R.inisial(me.nama || me.email)) + '</span><div class="grow"><b class="ellipsis">' + esc(me.nama || me.email) + '</b><small>' + esc({ OWNER: 'Owner', ADMIN: 'Admin/CS/Kasir', CREW: 'Crew Lapangan' }[me.role] || '') + '</small></div></div>' +
      '<button class="inst" data-pasang type="button">' + ic('phone2') + 'Pasang Aplikasi</button><button type="button" style="color:#C7D2FE" id="btnTema">' + ic('moon') + '<span>Mode gelap</span></button><button type="button" id="btnKeluar">' + ic('logout') + 'Keluar (Logout)</button></div></aside>' +
      '<div class="main"><header class="top no-print"><div class="top-in">' +
      '<button class="btn btn-sec btn-ico btn-menu" id="btnMenu" type="button" aria-label="Buka menu">' + ic('menu') + '</button>' +
      '<div class="crumb"><div class="c1">Operasional ' + ic('right', 's') + ' <span id="crumbNm">Dashboard</span></div><div class="live"><span id="syncDot" class="sync-dot"></span><span class="hi"> Hari ini ·</span> <span id="jamWib"></span> WIB</div></div>' +
      '<div class="top-search">' + ic('search') + '<input class="input" id="cariGlobal" placeholder="Cari booking, plat, penyewa" aria-label="Cari"></div>' +
      '<div class="top-stat" id="topStat"></div>' +
      (crew ? '' : '<a class="btn btn-ghost btn-ico bell" href="#/app/booking/permintaan" aria-label="Permintaan baru">' + ic('bell') + '<span class="dot" data-badge="permintaan" hidden></span></a>') +
      '<a class="btn btn-sec btn-sm" href="#/" target="_blank" rel="noopener">' + ic('external', 's') + '<span class="hide-sm">Web Publik</span></a>' +
      '<div class="user-chip"><span class="avatar on">' + esc(R.inisial(me.nama || me.email)) + '</span><div><b>' + esc(me.nama || me.email) + '</b><small>' + esc(me.email) + '</small></div></div>' +
      '</div></header><main class="page" id="page"></main></div>' +
      '<nav class="bnav no-print" aria-label="Navigasi bawah">' + bnav.map(function (b) { return '<a href="#/app/' + b[0] + '" data-nav="' + b[0] + '">' + ic(b[1]) + b[2] + (b[0] === 'booking' ? '<span class="nb" data-badge="permintaan" hidden></span>' : '') + '</a>'; }).join('') +
      '<a href="#" id="bnavMenu">' + ic('menu') + 'Menu</a></nav>';
    $('#btnMenu').onclick = bukaDrawer; $('#bnavMenu').onclick = function (e) { e.preventDefault(); bukaDrawer(); };
    $('#panel').addEventListener('click', function (e) { if (e.target === $('#panel') || (e.target.closest('.nav a') && W.innerWidth <= 960)) $('#panel').classList.remove('drawer'); });
    $('#btnKeluar').onclick = function () { keluar(false); };
    $('#btnTema').onclick = function () { const g = document.documentElement.getAttribute('data-theme') === 'dark'; if (g) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', 'dark'); R.LS.set('tema', g ? 'light' : 'dark'); try { localStorage.setItem('rf_tema', g ? 'light' : 'dark'); } catch (x) { } labelTema(); };
    $$('[data-pasang]').forEach(function (b) { b.onclick = function () { R.Pasang.tampil(); }; });
    $('#cariGlobal').addEventListener('keydown', function (e) { if (e.key === 'Enter' && this.value.trim()) { P.cari = this.value.trim(); location.hash = '#/app/booking/cari'; } });
    labelTema(); R.Pasang.segarkanTombol(); jam();
    P.cangkang = me.email + me.role;
  }
  function labelTema() { const g = document.documentElement.getAttribute('data-theme') === 'dark'; const b = $('#btnTema'); if (b) b.innerHTML = ic(g ? 'sun' : 'moon') + '<span>' + (g ? 'Mode terang' : 'Mode gelap') + '</span>'; }
  function bukaDrawer() { $('#panel').classList.add('drawer'); }
  function jam() { const el = $('#jamWib'); if (el) { const x = R.wib(); el.textContent = R.HARI[x.w] + ', ' + x.d + ' ' + R.BLN[x.m] + ' ' + R.p2(x.h) + ':' + R.p2(x.i); } }
  function segarkanCangkang() {
    const d = P.boot && P.boot.dash; if (!d) return;
    const st = d.unit.status || {};
    const ts = $('#topStat'); if (ts) ts.innerHTML = '<span class="g">Armada Siap: ' + (st['Tersedia'] || 0) + '</span><span class="r">Servis: ' + ((st['Maintenance'] || 0) + d.perluServis) + '</span>';
    $$('[data-badge="permintaan"]').forEach(function (b) { b.textContent = d.permintaan || ''; b.hidden = !d.permintaan; });
    $$('[data-s="NAMA_USAHA"]').forEach(function (b) { b.textContent = situs('NAMA_USAHA', 'RentFleet'); });
  }
  async function segarkanDash() {
    const r = await R.apiQ('dash.ringkas', {});
    if (!r.success || !P.boot) return;
    const lama = P.boot.dash ? P.boot.dash.permintaan : 0;
    P.boot.dash = r.data; R.Mem.set('boot', P.boot);
    if (r.data.permintaan > lama && role() !== 'CREW') R.toast('🔔 Ada ' + (r.data.permintaan - lama) + ' permintaan booking baru dari landing page.', 'ok', 6000);
    segarkanCangkang();
    if (P.aktif === 'dashboard') tampilHalaman();
  }

  /* ---------- Router panel ---------- */
  async function rute(hash) {
    const m = String(hash || location.hash).match(/^#\/(masuk|darurat|app)(?:\/([\w-]+))?(?:\/(.+))?$/);
    if (!m) return;
    if (m[1] === 'masuk') return halamanMasuk();
    if (m[1] === 'darurat') return halamanDarurat();
    if (!R.Sesi.token) { location.hash = '#/masuk'; return; }
    R.tampil('panel');
    if (R.LS.get('tema', 'light') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    const me = R.Sesi.me || {};
    if (P.cangkang !== me.email + me.role || !$('#side')) cangkang();
    if (!P.bootJalan) { P.bootJalan = true; boot().then(function () { prefetch(); }); mulaiPolling(); }
    const id = m[2] || 'dashboard';
    if (!boleh(id)) { R.toast('Menu tidak tersedia untuk peran Anda.', 'err'); location.hash = '#/app'; return; }
    P.aktif = id; P.arg = m[3] ? decodeURIComponent(m[3]) : '';
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === id); });
    const def = MENU.filter(function (x) { return x.id === id; })[0];
    $('#crumbNm').textContent = def ? def.judul : '';
    $('#panel').classList.remove('drawer');
    W.scrollTo(0, 0);
    tampilHalaman();
  }
  function tampilHalaman() {
    const el = $('#page'), id = P.aktif;
    const h = id === 'dashboard' ? { render: renderDashboard } : P.halaman[id];
    P.render++;
    if (!h) { el.innerHTML = '<div class="empty">' + ic('info') + '<p>Halaman belum tersedia.</p></div>'; return; }
    try { h.render(el, P.arg, P.render); } catch (e) { console.error(e); el.innerHTML = '<div class="empty">' + ic('alert') + '<p>Terjadi kesalahan menampilkan halaman: ' + esc(e.message) + '</p></div>'; }
    R.hidrasiIkon(el);
  }
  /** Prefetch menu inti saat perangkat diam → pindah menu terasa instan. */
  function prefetch() {
    const jalan = function () {
      if (!R.Sesi.token) return;
      const r = role();
      if (r !== 'CREW') { R.muat('booking', 'booking.list', {}, { umur: 30, diam: true }); R.muat('penyewa', 'penyewa.list', {}, { umur: 60, diam: true }); R.muat('kalender_' + R.isoTgl(Date.now() - (R.wib().w + 6) % 7 * 86400e3), 'kalender.data', { dari: R.isoTgl(Date.now() - (R.wib().w + 6) % 7 * 86400e3) }, { umur: 30, diam: true }); }
      R.muat('tugas_' + R.isoTgl(), 'tugas.list', { tanggal: R.isoTgl() }, { umur: 30, diam: true });
      R.muat('servis', 'servis.list', {}, { umur: 120, diam: true });
    };
    if ('requestIdleCallback' in W) requestIdleCallback(jalan, { timeout: 2500 }); else setTimeout(jalan, 1200);
  }
  function mulaiPolling() {
    clearInterval(P.poll);
    P.poll = setInterval(function () {
      jam();
      if (!R.Sesi.token || $('#panel').hidden) return;
      if (R.Aktivitas.jatuh('dash', 60000, 300000)) segarkanDash();
    }, 15000);
  }

  /* ---------- Dashboard ---------- */
  function donut(st, total) {
    const warna = { 'Tersedia': '#16A34A', 'Disewa': '#1D4ED8', 'Perlu Cek/Bersih': '#EAB308', 'Maintenance': '#DC2626', 'Nonaktif': '#94A3B8' };
    let a = 0; const r = 52, c = 2 * Math.PI * r;
    const seg = Object.keys(warna).map(function (k) { const v = st[k] || 0; if (!v || !total) return ''; const len = v / total * c; const s = '<circle r="' + r + '" cx="70" cy="70" fill="none" stroke="' + warna[k] + '" stroke-width="18" stroke-dasharray="' + len + ' ' + (c - len) + '" stroke-dashoffset="' + (-a) + '" transform="rotate(-90 70 70)"/>'; a += len; return s; }).join('');
    return '<div class="donut-wrap"><svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="Distribusi status armada"><circle r="' + r + '" cx="70" cy="70" fill="none" stroke="var(--line-2)" stroke-width="18"/>' + seg +
      '<text x="70" y="68" text-anchor="middle" font-size="26" font-weight="800" fill="currentColor">' + total + '</text><text x="70" y="88" text-anchor="middle" font-size="10" fill="var(--muted)" letter-spacing="1">ARMADA</text></svg>' +
      '<div class="legend">' + Object.keys(warna).map(function (k) { return '<div><i style="background:' + warna[k] + '"></i>' + esc(k) + '<b>' + (st[k] || 0) + (total ? ' <span class="faint xs">(' + Math.round((st[k] || 0) / total * 100) + '%)</span>' : '') + '</b></div>'; }).join('') + '</div></div>';
  }
  function itemTugas(t) {
    const telat = t.telat || (t.tipe === 'Keluar' && t.terlambat);
    const lbl = t.tipe === 'Keluar' ? (t.antar ? 'Antar ke lokasi' : 'Check-out (Ambil)') : (t.antar ? 'Jemput di lokasi' : 'Check-in (Kembali)');
    const btn = t.tipe === 'Keluar' ? '<a class="btn btn-primary btn-sm" href="#/app/cek/' + esc(t.id_booking) + '">Proses Check-out</a>' :
      (t.telat ? '<a class="btn btn-danger btn-sm" target="_blank" rel="noopener" href="' + R.waLink(t.no_wa, 'Halo ' + t.penyewa + ', unit ' + t.unit + ' (' + t.id_booking + ') sudah melewati jadwal kembali. Mohon segera dikembalikan ya. Terima kasih.') + '">' + ic('chat', 's') + 'Follow-up WA</a>' : '') +
      '<a class="btn btn-accent btn-sm" href="#/app/cek/' + esc(t.id_booking) + '">Mulai Check-in</a>';
    return '<div class="akt ' + (t.telat ? 'telat' : '') + '"><div class="jam">' + R.jam(t.waktu) + '<small>' + (R.isoTgl(R.ms(t.waktu)) === R.isoTgl() ? 'WIB' : R.tgl(t.waktu).split(' ').slice(0, 2).join(' ')) + '</small></div>' +
      '<div style="min-width:0"><h4><span class="badge ' + (t.tipe === 'Keluar' ? 'b-info' : 'b-warn') + '">' + lbl + '</span>' + esc(t.unit) + ' <span class="plat">' + esc(t.plat) + '</span></h4>' +
      '<div class="meta"><span>' + ic('user', 's') + esc(t.penyewa) + (t.no_wa ? ' (' + esc(t.no_wa) + ')' : '') + '</span><span>' + ic('pin', 's') + esc(t.lokasi || 'Pool') + '</span>' +
      (telat ? '<span class="err">' + ic('alert', 's') + (t.telat ? 'Telat kembali' : 'Lewat jadwal ambil') + '</span>' : '<span class="blue">● ' + esc(t.id_booking) + '</span>') + '</div></div>' +
      '<div class="row" style="justify-content:flex-end">' + btn + '</div></div>';
  }
  function renderDashboard(el) {
    const b = P.boot, d = b && b.dash;
    if (!d) { el.innerHTML = '<div class="kpis">' + '<div class="kpi skel" style="height:120px"></div>'.repeat(6) + '</div><div class="skel" style="height:300px"></div>'; return; }
    const crew = role() === 'CREW', st = d.unit.status || {};
    const tab = P.dashTab || 'Semua';
    const tugas = (d.tugas || []).filter(function (t) { return tab === 'Semua' || (tab === 'Keluar' ? t.tipe === 'Keluar' : t.tipe === 'Masuk'); });
    const nK = (d.tugas || []).filter(function (t) { return t.tipe === 'Keluar'; }).length, nM = (d.tugas || []).length - nK;
    const kpi = function (o) { return '<div class="kpi ' + (o.c || '') + '"' + (o.go ? ' data-go="' + o.go + '"' : '') + '><div class="t"><span>' + o.t + '</span>' + (o.b ? o.b : '<span class="ic">' + ic(o.i || 'car', 's') + '</span>') + '</div><div class="v tnum">' + o.v + '<small>' + (o.u || 'Unit') + '</small></div><div class="s">' + (o.s || '') + '</div></div>'; };
    let h = '';
    if (!crew && d.permintaan) h += '<section class="alert-hero"><span class="big">' + ic('zap', 'l') + '</span><div style="flex:1;min-width:240px"><span class="badge b-acc">PENTING · REALTIME</span> <span class="xs" style="color:#BFDBFE">Hold kedaluwarsa otomatis: ' + esc(situs('HOLD_JAM', 24)) + ' jam</span>' +
      '<h2 style="margin-top:8px">' + d.permintaan + ' permintaan booking baru dari landing page menunggu konfirmasi!</h2><p>Hubungi penyewa via WhatsApp, lalu konfirmasi atau tolak sebelum hold berakhir.</p></div>' +
      '<div class="row"><a class="btn btn-accent" href="#/app/booking/permintaan">' + ic('clip') + 'Tinjau Permintaan (' + d.permintaan + ')</a><a class="btn btn-sec" href="#/app/kalender">' + ic('calendar') + 'Kalender Armada</a></div></section>';
    h += '<div class="kpis">' +
      kpi({ t: 'Total Unit', v: d.unit.total, s: d.unit.mobil + ' Mobil · ' + d.unit.motor + ' Motor', i: 'car', go: 'armada' }) +
      kpi({ t: 'Tersedia', v: st['Tersedia'] || 0, c: 'ok', b: '<span class="badge dot b-ok">Siap</span>', s: 'Siap disewa sekarang', go: 'armada' }) +
      kpi({ t: 'Disewa', v: st['Disewa'] || 0, c: 'info', b: '<span class="badge dot b-info">Aktif</span>', s: d.unit.total ? 'Utilisasi ' + Math.round((st['Disewa'] || 0) / d.unit.total * 100) + '%' : '', go: crew ? '' : 'kalender' }) +
      kpi({ t: 'Jatuh Tempo Hari Ini', v: d.jatuhTempo, c: 'warn', b: '<span class="badge b-warn">Hari ini</span>', s: 'Perlu check-in hari ini', go: 'tugas' }) +
      kpi({ t: 'Telat Kembali', v: d.telat, c: d.telat ? 'bad' : '', b: d.telat ? '<span class="badge dot b-bad">Overdue</span>' : '', s: d.telatList.length ? esc(d.telatList[0].plat) + ' · telat ' + d.telatList[0].jam + ' jam' : 'Tidak ada', go: 'tugas' }) +
      kpi({ t: 'Perlu Servis', v: d.perluServis, c: d.perluServis ? 'warn' : '', b: '<span class="badge dot b-warn">Bengkel</span>', u: 'Item', s: (st['Perlu Cek/Bersih'] || 0) + ' unit perlu cek/bersih', go: 'servis' }) +
      (crew ? '' : kpi({ t: 'Tagihan Belum Lunas', v: d.belumLunas || 0, u: 'Booking', c: d.belumLunas ? 'bad' : '', i: 'wallet', s: 'Total ' + R.rp(d.piutang || 0), go: 'keuangan' })) +
      (crew ? '' : kpi({ t: 'Permintaan Landing', v: d.permintaan || 0, u: 'Baru', c: d.permintaan ? 'warn' : '', i: 'globe', s: 'Menunggu konfirmasi', go: 'booking/permintaan' })) +
      '</div>';
    h += '<div class="dash"><div class="stack" style="gap:20px">' +
      '<section class="sec-card"><div class="hd"><h3>' + ic('swap', 'blue') + 'Aktivitas Serah Terima Hari Ini</h3><div class="act"><div class="seg" id="dashTab">' +
      [['Semua', d.tugas.length], ['Keluar', nK], ['Masuk', nM]].map(function (x) { return '<button type="button" data-t="' + x[0] + '" class="' + (tab === x[0] ? 'on' : '') + '">' + (x[0] === 'Keluar' ? 'Pengambilan' : x[0] === 'Masuk' ? 'Pengembalian' : 'Semua') + ' (' + x[1] + ')</button>'; }).join('') + '</div></div></div>' +
      '<p class="small muted">Jadwal antar-jemput, pengambilan, dan pengembalian armada hari ini (termasuk yang terlambat).</p>' +
      '<div class="aktivitas">' + (tugas.length ? tugas.map(itemTugas).join('') : '<div class="empty">' + ic('checkc') + '<p>Tidak ada serah terima terjadwal.</p></div>') + '</div>' +
      '<div class="row between small muted"><span>Menampilkan ' + tugas.length + ' aktivitas</span>' + (crew ? '<a href="#/app/tugas">Lihat semua tugas →</a>' : '<a href="#/app/kalender">Lihat jadwal di kalender →</a>') + '</div></section>';
    if (!crew && d.pendapatan7) {
      const tot = d.pendapatan7.map(function (x) { return x.mobil + x.motor; }), mx = Math.max.apply(null, tot.concat([1])), sum = tot.reduce(function (a, x) { return a + x; }, 0);
      const sumMob = d.pendapatan7.reduce(function (a, x) { return a + x.mobil; }, 0);
      h += '<section class="sec-card"><div class="hd"><h3>' + ic('wallet', 'blue') + 'Pendapatan 7 Hari Terakhir</h3><div class="act small muted">Mobil ' + (sum ? Math.round(sumMob / sum * 100) : 0) + '% · Motor ' + (sum ? 100 - Math.round(sumMob / sum * 100) : 0) + '%</div></div>' +
        '<div style="font-size:28px;font-weight:800;color:var(--primary);letter-spacing:-.02em" class="tnum">' + R.rp(sum) + '</div>' +
        '<div class="bars" style="--n:7">' + d.pendapatan7.map(function (x, i) { const v = tot[i], hh = Math.max(4, Math.round(v / mx * 100)); return '<div class="b ' + (i === 6 ? 'hi' : v === mx && v ? 'mx' : '') + '" style="--h:' + hh + '%" title="' + R.tgl(x.tgl) + ': ' + R.rp(v) + '"><span class="tip">' + (v ? R.rpK(v).replace('Rp ', '') : '') + '</span><i style="height:' + hh + '%"></i></div>'; }).join('') + '</div>' +
        '<div class="bars-x" style="--n:7">' + d.pendapatan7.map(function (x, i) { return '<span>' + (i === 6 ? '<b>Hari ini</b>' : R.HARI[new Date(R.ms(x.tgl) + 7 * 3600e3).getUTCDay()]) + '</span>'; }).join('') + '</div>' +
        '<div class="row between small muted"><span>Rata-rata: <b>' + R.rp(sum / 7) + '</b>/hari</span>' + (role() === 'OWNER' ? '<a href="#/app/laporan">Laporan lengkap →</a>' : '') + '</div></section>';
    }
    h += '</div><div class="stack" style="gap:20px">' +
      '<section class="sec-card"><div class="hd"><h3>' + ic('chart', 'blue') + 'Distribusi Status Armada</h3></div>' + donut(st, d.unit.total) +
      (crew ? '' : '<a class="btn btn-accent" href="#/app/armada/baru">' + ic('plus') + 'Tambah Unit Baru</a>') + '</section>';
    if (!crew) h += '<section class="sec-card"><div class="hd"><h3>' + ic('wallet', 'blue') + 'Pembayaran &amp; Deposit</h3><span class="badge b-warn act">' + (d.tagihanList || []).length + ' tindakan</span></div><div class="mini-list">' +
      ((d.tagihanList || []).length ? d.tagihanList.map(function (t) { return '<a class="mini" href="#/app/booking/' + esc(t.id) + '" style="color:inherit;text-decoration:none"><div class="row"><b>#' + esc(t.id) + '</b><span class="badge b-bad">Belum lunas</span></div><div class="row"><span class="small muted">' + esc(t.penyewa) + ' · ' + esc(t.status) + '</span><b class="err">' + R.rp(t.sisa) + '</b></div></a>'; }).join('') : '<p class="small muted">Semua tagihan lunas 🎉</p>') +
      '</div><a class="small" href="#/app/keuangan">Ke menu Keuangan &amp; Deposit →</a></section>';
    h += '<section class="sec-card"><div class="hd"><h3>' + ic('bell', 'blue') + 'Pengingat Pajak &amp; Servis</h3></div><div class="mini-list">' +
      (d.servisList.length ? d.servisList.map(function (s) { return '<div class="mini ' + (s.lewat ? 'bad' : 'warn') + '"><div class="row"><b>' + esc(s.unit) + '</b><span class="badge ' + (s.lewat ? 'b-bad' : 'b-warn') + '">' + (s.lewat ? 'LEWAT' : s.sisaHari !== null ? s.sisaHari + ' HARI LAGI' : 'SEGERA') + '</span></div><div class="small">' + esc(s.jenis.toUpperCase()) + ' · ' + esc(s.plat) + (s.sisaKm !== null ? ' · sisa ' + R.angka(s.sisaKm) + ' km' : '') + (s.next_due_tanggal ? ' · jatuh tempo ' + R.tgl(s.next_due_tanggal) : '') + '</div></div>'; }).join('') : '<p class="small muted">Tidak ada servis/pajak yang mendekati jatuh tempo.</p>') +
      '</div><a class="small" href="#/app/servis">Ke menu Servis &amp; Pajak →</a></section></div></div>';
    el.innerHTML = '<div class="page-h"><div><h1>' + (crew ? 'Tugas Hari Ini' : 'Ringkasan Operasional') + '</h1><p>Halo ' + esc((R.Sesi.me || {}).nama || '') + ' — data diperbarui otomatis tiap menit.</p></div><div class="act"><button class="btn btn-sec btn-sm" id="dashSegar" type="button">' + ic('refresh', 's') + 'Segarkan</button></div></div>' + h;
    $('#dashTab', el) && ($('#dashTab', el).onclick = function (e) { const bt = e.target.closest('button'); if (!bt) return; P.dashTab = bt.dataset.t; renderDashboard(el); R.hidrasiIkon(el); });
    $$('[data-go]', el).forEach(function (k) { if (k.dataset.go) k.onclick = function () { location.hash = '#/app/' + k.dataset.go; }; });
    $('#dashSegar', el).onclick = function () { R.sibuk(this, function () { return boot(true); }); };
  }

  W.RFPanel = { rute: rute, daftar: daftar, P: P, role: role, boleh: boleh, situs: situs, boot: boot, segarkanDash: segarkanDash, unit: function (id) { return ((P.boot && P.boot.units) || []).filter(function (u) { return u.id_unit === id; })[0]; } };
})(window);
