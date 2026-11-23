/* ============================================================
 * hal-keuangan.js — Keuangan & Deposit (DP, pelunasan, denda,
 * antar-jemput, pengembalian deposit) dan Laporan Owner
 * ============================================================ */
(function (W) {
  'use strict';
  const R = W.RF, RP = W.RFPanel, UI = W.RFUI, esc = R.esc, ic = R.ic;
  const $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  const WARNA_JENIS = { 'DP': 'b-info', 'Pelunasan': 'b-info', 'Deposit': 'b-warn', 'Denda': 'b-bad', 'Antar-Jemput': 'b-purple', 'Pengembalian Deposit': 'b-off' };

  /* ================= KEUANGAN ================= */
  const KU = { jenis: '', q: '', metode: '', dari: '', sampai: '', hal: 1 };
  function awalBulan() { const x = R.wib(); return x.y + '-' + R.p2(x.m + 1) + '-01'; }
  function renderKeuangan(el) {
    KU.dari = KU.dari || awalBulan(); KU.sampai = KU.sampai || R.isoTgl();
    el.innerHTML = UI.kepala('Keuangan &amp; Deposit', 'Pantau arus kas masuk, pelunasan tagihan, deposit penyewa yang ditahan, dan pengembalian deposit.',
      '<button class="btn btn-sec" id="kuCsv" type="button">' + ic('download') + 'Ekspor Rekap (CSV)</button><button class="btn btn-accent" id="kuBaru" type="button">' + ic('plus') + 'Catat Pembayaran</button>') +
      '<div class="kpis" id="kuKpi">' + '<div class="kpi skel" style="height:118px"></div>'.repeat(4) + '</div>' +
      '<div class="toolbar"><div class="pill-tabs" id="kuTab">' + [['', 'Semua'], ['DP', 'DP'], ['Pelunasan', 'Pelunasan'], ['Deposit', 'Deposit'], ['Denda', 'Denda'], ['Antar-Jemput', 'Antar-Jemput'], ['Pengembalian Deposit', 'Refund']].map(function (t) { return '<button type="button" class="chip ' + (KU.jenis === t[0] ? 'on' : '') + '" data-j="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="search">' + ic('search') + '<input class="input" id="kuQ" placeholder="Kode booking, penyewa, unit" value="' + esc(KU.q) + '"></div>' +
      '<select class="input" id="kuM"><option value="">Semua metode</option>' + ['Tunai', 'Transfer', 'QRIS', 'E-Wallet', 'Potong Deposit'].map(function (m) { return '<option' + (KU.metode === m ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select>' +
      '<input class="input pill" type="date" id="kuDari" value="' + KU.dari + '" style="width:auto" aria-label="Dari"><input class="input pill" type="date" id="kuSampai" value="' + KU.sampai + '" style="width:auto" aria-label="Sampai"></div>' +
      '<div id="kuIsi"><div class="skel" style="height:300px"></div></div><div id="kuDep"></div>';
    R.muat('keu_ringkas', 'keu.ringkas', {}, { umur: 60, render: function (d) {
      if (!d) return; const naik = d.pemasukanLalu ? Math.round((d.pemasukan - d.pemasukanLalu) / d.pemasukanLalu * 100) : 0;
      $('#kuKpi', el).innerHTML = UI.kpi('Pemasukan bulan ini', '<span class="tnum">' + R.rp(d.pemasukan) + '</span>', (d.pemasukanLalu ? (naik >= 0 ? '▲ +' : '▼ ') + naik + '% vs bulan lalu' : 'Bulan lalu ' + R.rp(d.pemasukanLalu)), 'info', 'wallet') +
        UI.kpi('Deposit ditahan', R.rp(d.depositDitahan), d.depositN + ' booking aktif', '', 'shield') + UI.kpi('Piutang / belum lunas', R.rp(d.piutang), d.piutangN + ' tagihan', d.piutang ? 'bad' : '', 'alert') +
        UI.kpi('Biaya servis &amp; pajak', R.rp(d.servis), d.servisN + ' catatan bulan ini', '', 'wrench', RP.role() === 'OWNER' ? 'servis' : '');
      $$('[data-go]', $('#kuKpi', el)).forEach(function (k) { if (k.dataset.go) k.onclick = function () { location.hash = '#/app/' + k.dataset.go; }; });
      R.hidrasiIkon($('#kuKpi', el));
    } });
    let data = null;
    const kunci = function () { return 'bayar_' + KU.dari + '_' + KU.sampai; };
    const gambar = function () {
      if (!data) return;
      const q = KU.q.toLowerCase();
      const rows = data.rows.filter(function (p) { return (!KU.jenis || p.jenis === KU.jenis) && (!KU.metode || p.metode === KU.metode) && (!q || [p.id_bayar, p.id_booking, p.penyewa, p.unit].join(' ').toLowerCase().indexOf(q) > -1); });
      const tot = rows.reduce(function (a, p) { return a + (p.batal === 'Y' ? 0 : (p.jenis === 'Pengembalian Deposit' ? -1 : 1) * Number(p.nominal)); }, 0);
      $('#kuIsi', el).innerHTML = UI.tabel([
        { l: 'Kode booking & penyewa', full: true, f: function (p) { return '<a class="t1" href="#/app/booking/' + esc(p.id_booking) + '">#' + esc(p.id_booking) + '</a><div class="t1">' + esc(p.penyewa) + '</div><div class="t2">' + esc(p.unit) + '</div>'; } },
        { l: 'Jenis', f: function (p) { return '<span class="badge dot ' + (WARNA_JENIS[p.jenis] || 'b-off') + '">' + esc(p.jenis === 'Pengembalian Deposit' ? 'Refund deposit' : p.jenis) + '</span>' + (p.batal === 'Y' ? ' <span class="badge b-off">BATAL</span>' : ''); } },
        { l: 'Nominal', r: true, f: function (p) { const neg = p.jenis === 'Pengembalian Deposit'; return '<b class="tnum ' + (p.jenis === 'Denda' ? 'err' : '') + '" style="' + (p.batal === 'Y' ? 'text-decoration:line-through;opacity:.5' : '') + '">' + (neg ? '-' : '') + R.rp(p.nominal) + '</b>'; } },
        { l: 'Metode & tanggal', f: function (p) { return '<div class="t1">' + esc(p.metode) + '</div><div class="t2">' + R.tgl(p.tanggal, true) + '</div>'; } },
        { l: 'Bukti', f: function (p) { return p.bukti_url ? '<a href="' + esc(p.bukti_url) + '" target="_blank" rel="noopener">' + ic('image', 's') + ' Lihat</a>' : '<span class="t2"><i>Tanpa lampiran</i></span>'; } },
        { l: 'Dicatat oleh', f: function (p) { return '<span class="t2">' + esc(String(p.dicatat_oleh || '').split('@')[0]) + '</span>'; } }
      ], rows, { hal: KU.hal, kosong: 'Belum ada transaksi di periode ini.', ikon: 'wallet' }) + '<p class="small muted" style="margin-top:8px">Total bersih tampilan ini: <b class="tnum">' + R.rp(tot) + '</b></p>';
      R.hidrasiIkon($('#kuIsi', el));
    };
    const ambil = function (paksa) { R.muat(kunci(), 'bayar.list', { dari: KU.dari, sampai: KU.sampai }, { umur: 30, paksa: paksa, render: function (d) { if (d) { data = d; gambar(); } } }); };
    ambil();
    const dep = function () { R.muat('deposit_antrean', 'deposit.antrean', {}, { umur: 30, render: function (d) {
      if (!d) return; const box = $('#kuDep', el); if (!box) return;
      box.innerHTML = '<section class="sec-card"><div class="hd"><h3><span class="kpi" style="padding:0;border:0;box-shadow:none;background:none"><span class="ic" style="background:var(--accent-50);color:#854D0E">' + ic('refresh', 's') + '</span></span>Antrean Pengembalian Deposit</h3><span class="act badge b-warn">' + d.rows.length + ' menunggu refund</span></div><p class="small muted">Unit sudah check-in (atau booking batal) dan deposit masih ditahan.</p>' +
        (d.rows.length ? '<div class="grid-2">' + d.rows.map(function (x) { return '<div class="mini" style="padding:16px"><div class="row"><b class="blue">#' + esc(x.id_booking) + '</b><span class="badge b-info">' + (x.status === 'Selesai' ? 'Check-in selesai' : esc(x.status)) + '</span></div><b>' + esc(x.penyewa) + ' · ' + esc(x.unit) + '</b>' +
          '<div class="row small"><span>Deposit: <b>' + R.rp(x.deposit_ditahan) + '</b></span><span>Sisa tagihan: <b class="' + (x.sisa ? 'err' : '') + '">' + R.rp(x.sisa) + '</b></span></div>' + (x.flag ? '<div class="xs err">' + esc(x.flag) + '</div>' : '') +
          '<button class="btn btn-primary btn-sm" data-dep="' + esc(x.id_booking) + '" data-dt="' + x.deposit_ditahan + '" data-ss="' + x.sisa + '" type="button" style="justify-self:start;margin-top:6px">Proses Refund</button></div>'; }).join('') + '</div>' : '<p class="small muted">Tidak ada deposit yang menunggu dikembalikan.</p>') + '</section>';
      R.hidrasiIkon(box);
    } }); };
    dep();
    $('#kuTab', el).onclick = function (e) { const b = e.target.closest('[data-j]'); if (!b) return; KU.jenis = b.dataset.j; KU.hal = 1; $$('#kuTab .chip', el).forEach(function (x) { x.classList.toggle('on', x === b); }); gambar(); };
    $('#kuQ', el).oninput = R.debounce(function () { KU.q = this.value; KU.hal = 1; gambar(); }, 250);
    $('#kuM', el).onchange = function () { KU.metode = this.value; gambar(); };
    $('#kuDari', el).onchange = function () { KU.dari = this.value; ambil(); };
    $('#kuSampai', el).onchange = function () { KU.sampai = this.value; ambil(); };
    $('#kuCsv', el).onclick = function () { if (data) R.csv('rekap-keuangan-' + KU.dari + '_' + KU.sampai + '.csv', data.rows, ['id_bayar', 'id_booking', 'penyewa', 'unit', 'jenis', 'nominal', 'metode', 'tanggal', 'dicatat_oleh', 'catatan', 'batal']); };
    $('#kuBaru', el).onclick = pilihBooking;
    UI.ikat($('#kuIsi', el), function (h) { KU.hal = h; gambar(); });
    el.addEventListener('click', function (e) {
      const d = e.target.closest('[data-dep]');
      if (d) prosesDeposit(d.dataset.dep, { deposit_ditahan: Number(d.dataset.dt), sisa: Number(d.dataset.ss) }, function () { R.Mem.basi(); ambil(true); dep(); });
    });
  }
  /** Pilih booking lalu buka form pembayaran. */
  function pilihBooking() {
    const list = (R.Mem.get('booking') && R.Mem.get('booking').data.rows) || [];
    const m = R.modal({ judul: 'Catat Pembayaran', isi: '<div class="field"><label>Kode booking</label><input class="input" id="pbKode" list="pbList" placeholder="RF-26-0001 atau nama penyewa" style="text-transform:uppercase"><datalist id="pbList">' +
      list.filter(function (r) { return r.status !== 'Dibatalkan'; }).slice(0, 300).map(function (r) { return '<option value="' + esc(r.id_booking) + '">' + esc(r.penyewa + ' · ' + r.unit + ' · sisa ' + R.rp(r.sisa)) + '</option>'; }).join('') + '</datalist></div>',
      kaki: '<button class="btn btn-sec" data-tutup>Batal</button><button class="btn btn-primary" id="pbLanjut" type="button">Lanjut</button>' });
    m.$('#pbLanjut').onclick = function () {
      const id = m.$('#pbKode').value.trim().toUpperCase().split(' ')[0]; if (!id) return;
      R.sibuk(this, async function () { const r = await R.api('booking.detail', { id: id }); if (!r.success) { R.toast(r.message, 'err'); return; } m.tutup(); UI.formBayar(r.data, function () { R.Mem.basi(); if (RP.P.aktif === 'keuangan') renderKeuangan($('#page')); }); });
    };
  }
  function prosesDeposit(id, k, setelah) {
    const potong = Math.min(k.deposit_ditahan, k.sisa || 0);
    UI.formModal({ judul: 'Proses Deposit · ' + id, tombol: 'Proses Refund',
      atas: '<div class="info-chips"><div class="ichip"><small>Deposit ditahan</small><b>' + R.rp(k.deposit_ditahan) + '</b></div><div class="ichip"><small>Sisa tagihan</small><b class="' + (k.sisa ? 'err' : '') + '">' + R.rp(k.sisa || 0) + '</b></div><div class="ichip"><small>Dikembalikan</small><b class="blue" id="depKembali">' + R.rp(k.deposit_ditahan - potong) + '</b></div></div>',
      nilai: { potong: potong, metode: 'Transfer', alasan: potong ? 'Pelunasan sisa tagihan/denda' : '' },
      fields: [{ n: 'potong', l: 'Potong dari deposit (Rp)', t: 'number', min: 0, max: k.deposit_ditahan, hint: 'Otomatis = sisa tagihan. Ubah bila ada kesepakatan lain.' }, { n: 'metode', l: 'Metode pengembalian', t: 'select', o: ['Transfer', 'Tunai', 'QRIS', 'E-Wallet'] },
        { n: 'alasan', l: 'Alasan potongan', full: true }, { n: 'catatan', l: 'Catatan pengembalian', full: true }],
      buka: function (m, f) { f.querySelector('[name=potong]').oninput = function () { m.$('#depKembali').textContent = R.rp(Math.max(0, k.deposit_ditahan - (Number(this.value) || 0))); }; },
      simpan: function (v) { return R.api('deposit.proses', { id: id, potong: v.potong, metode: v.metode, alasan: v.alasan, catatan: v.catatan }); }, setelah: setelah });
  }
  W.RFKeu = { prosesDeposit: prosesDeposit };
  RP.daftar('keuangan', { render: renderKeuangan });

  /* ================= LAPORAN (OWNER) ================= */
  const LP = { dari: '', sampai: '', urut: 'laba' };
  function preset(p) {
    const x = R.wib(), t0 = function (y, m) { return y + '-' + R.p2(m + 1) + '-01'; };
    if (p === 'bulan') return [t0(x.y, x.m), R.isoTgl()];
    if (p === 'lalu') { const y = x.m ? x.y : x.y - 1, m = x.m ? x.m - 1 : 11; return [t0(y, m), R.isoTgl(R.ms(t0(x.y, x.m)) - 86400e3)]; }
    if (p === '3') return [R.isoTgl(Date.now() - 90 * 86400e3), R.isoTgl()];
    if (p === 'tahun') return [x.y + '-01-01', R.isoTgl()];
    return [LP.dari, LP.sampai];
  }
  function pie(items, ukuran) {
    const tot = items.reduce(function (a, x) { return a + x.v; }, 0) || 1; let a = 0; const r = 46, c = 2 * Math.PI * r;
    return '<div class="donut-wrap"><svg width="' + (ukuran || 130) + '" height="' + (ukuran || 130) + '" viewBox="0 0 120 120" role="img"><circle r="' + r + '" cx="60" cy="60" fill="none" stroke="var(--line-2)" stroke-width="20"/>' +
      items.map(function (x) { const len = x.v / tot * c; const s = '<circle r="' + r + '" cx="60" cy="60" fill="none" stroke="' + x.w + '" stroke-width="20" stroke-dasharray="' + len + ' ' + (c - len) + '" stroke-dashoffset="' + (-a) + '" transform="rotate(-90 60 60)"><title>' + esc(x.l) + '</title></circle>'; a += len; return s; }).join('') + '</svg>' +
      '<div class="legend">' + items.map(function (x) { return '<div><i style="background:' + x.w + '"></i>' + esc(x.l) + '<b>' + Math.round(x.v / tot * 100) + '%</b></div>'; }).join('') + '</div></div>';
  }
  function renderLaporan(el) {
    if (!LP.dari) { const p = preset('bulan'); LP.dari = p[0]; LP.sampai = p[1]; }
    el.innerHTML = UI.kepala('Laporan Keuangan &amp; Armada', 'Pendapatan per periode, laba bersih per unit (setelah biaya servis), unit terlaris, unit paling sering ke bengkel, dan sumber booking.',
      '<button class="btn btn-sec" id="lpCsv" type="button">' + ic('download') + 'Excel (CSV)</button><button class="btn btn-sec" id="lpPdf" type="button">' + ic('printer') + 'PDF / Cetak</button>') +
      '<div class="toolbar"><div class="seg" id="lpPre"><button type="button" data-p="bulan">Bulan ini</button><button type="button" data-p="lalu">Bulan lalu</button><button type="button" data-p="3">90 hari</button><button type="button" data-p="tahun">Tahun ini</button></div>' +
      '<input class="input pill" type="date" id="lpDari" value="' + LP.dari + '" style="width:auto"><span class="muted">s/d</span><input class="input pill" type="date" id="lpSampai" value="' + LP.sampai + '" style="width:auto"></div><div id="lpIsi"><div class="skel" style="height:420px"></div></div>';
    const gambar = function (d) {
      if (!d) return; const box = $('#lpIsi', el); if (!box) return;
      LP.data = d;
      let seri = d.harian;
      if (seri.length > 45) { const mg = {}; seri.forEach(function (x) { const k = x.tgl.slice(0, 7); mg[k] = (mg[k] || 0) + x.nilai; }); seri = Object.keys(mg).map(function (k) { return { tgl: k + '-01', nilai: mg[k], bulan: true }; }); }
      const mx = Math.max.apply(null, seri.map(function (x) { return x.nilai; }).concat([1]));
      const unitRows = d.unit.slice().sort(function (a, b) { return LP.urut === 'booking' ? b.booking - a.booking : LP.urut === 'servis' ? b.servis - a.servis : b.laba - a.laba; });
      box.innerHTML = '<div class="kpis">' + UI.kpi('Pendapatan', R.rp(d.pendapatan), 'DP, pelunasan, denda, antar-jemput', 'info', 'wallet') + UI.kpi('Biaya servis &amp; pajak', R.rp(d.biayaServis), '', 'warn', 'wrench') +
        UI.kpi('Laba bersih', R.rp(d.labaBersih), d.pendapatan ? Math.round(d.labaBersih / d.pendapatan * 100) + '% margin' : '', d.labaBersih >= 0 ? 'ok' : 'bad', 'chart') + UI.kpi('Booking', d.nBooking, 'tidak termasuk batal', '', 'clip') +
        UI.kpi('Deposit masuk / kembali', R.rpK(d.depositMasuk) + ' / ' + R.rpK(d.depositKembali), 'bukan pendapatan', '', 'shield') + '</div>' +
        '<div class="dash"><section class="sec-card"><div class="hd"><h3>' + ic('chart', 'blue') + 'Pendapatan ' + (seri[0] && seri[0].bulan ? 'per bulan' : 'per hari') + '</h3></div>' +
        '<div class="bars" style="--n:' + seri.length + ';gap:' + (seri.length > 20 ? 3 : 8) + 'px">' + seri.map(function (x) { const h = Math.max(2, Math.round(x.nilai / mx * 100)); return '<div class="b ' + (x.nilai === mx && x.nilai ? 'mx' : '') + '" title="' + (x.bulan ? x.tgl.slice(0, 7) : R.tgl(x.tgl)) + ': ' + R.rp(x.nilai) + '"><i style="height:' + h + '%"></i></div>'; }).join('') + '</div>' +
        '<div class="bars-x" style="--n:' + seri.length + ';gap:' + (seri.length > 20 ? 3 : 8) + 'px">' + seri.map(function (x, i) { const tampil = seri.length <= 14 || i % Math.ceil(seri.length / 10) === 0; return '<span>' + (tampil ? (x.bulan ? R.BLN[Number(x.tgl.slice(5, 7)) - 1] : x.tgl.slice(8, 10)) : '') + '</span>'; }).join('') + '</div></section>' +
        '<div class="stack" style="gap:20px"><section class="sec-card"><div class="hd"><h3>' + ic('globe', 'blue') + 'Sumber booking</h3></div>' + pie([{ l: 'Admin (' + d.sumber.Admin.n + ')', v: d.sumber.Admin.n, w: '#1D4ED8' }, { l: 'Landing page (' + d.sumber.Landing.n + ')', v: d.sumber.Landing.n, w: '#FACC15' }]) +
        '<p class="small muted">Nilai booking: Admin ' + R.rp(d.sumber.Admin.nilai) + ' · Landing ' + R.rp(d.sumber.Landing.nilai) + '</p></section>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('wallet', 'blue') + 'Metode pembayaran</h3></div>' + pie(Object.keys(d.perMetode).map(function (k, i) { return { l: k, v: d.perMetode[k], w: ['#1D4ED8', '#16A34A', '#FACC15', '#8B5CF6', '#94A3B8'][i % 5] }; })) + '</section></div></div>' +
        '<div class="grid-2"><section class="sec-card"><div class="hd"><h3>' + ic('star', 'blue') + 'Unit terlaris</h3></div><div class="mini-list">' + d.terlaris.map(function (u, i) { return '<div class="mini"><div class="row"><b>' + (i + 1) + '. ' + esc(u.unit) + '</b><span class="badge b-info">' + u.booking + ' booking</span></div><span class="small muted">' + u.hariSewa + ' hari sewa · ' + R.rp(u.pendapatan) + '</span></div>'; }).join('') + '</div></section>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('wrench', 'blue') + 'Paling sering ke bengkel</h3></div><div class="mini-list">' + (d.seringBengkel.length ? d.seringBengkel.map(function (u) { return '<div class="mini warn"><div class="row"><b>' + esc(u.unit) + '</b><span class="badge b-warn">' + u.nServis + '× servis</span></div><span class="small muted">Biaya ' + R.rp(u.servis) + '</span></div>'; }).join('') : '<p class="small muted">Belum ada catatan servis di periode ini.</p>') + '</div></section></div>' +
        '<section class="sec-card"><div class="hd"><h3>' + ic('car', 'blue') + 'Laba bersih per unit</h3><div class="act seg" id="lpUrut"><button type="button" data-u="laba" class="' + (LP.urut === 'laba' ? 'on' : '') + '">Laba</button><button type="button" data-u="booking" class="' + (LP.urut === 'booking' ? 'on' : '') + '">Booking</button><button type="button" data-u="servis" class="' + (LP.urut === 'servis' ? 'on' : '') + '">Biaya servis</button></div></div>' +
        UI.tabel([{ l: 'Unit', full: true, f: function (u) { return '<div class="t1">' + esc(u.unit) + '</div><div class="t2"><span class="plat">' + esc(u.plat) + '</span> · ' + esc(u.kategori) + '</div>'; } }, { l: 'Booking', r: true, f: function (u) { return u.booking + ' <span class="t2">(' + u.hariSewa + ' hr)</span>'; } },
          { l: 'Pendapatan', r: true, f: function (u) { return R.rp(u.pendapatan); } }, { l: 'Biaya servis', r: true, f: function (u) { return R.rp(u.servis); } }, { l: 'Laba bersih', r: true, f: function (u) { return '<b class="tnum ' + (u.laba < 0 ? 'err' : 'blue') + '">' + R.rp(u.laba) + '</b>'; } }], unitRows, { per: 100 }) + '</section>';
      $('#lpUrut', box).onclick = function (e) { const b = e.target.closest('button'); if (b) { LP.urut = b.dataset.u; gambar(d); } };
      R.hidrasiIkon(box);
    };
    const ambil = function () { $('#lpDari', el).value = LP.dari; $('#lpSampai', el).value = LP.sampai; R.muat('lap_' + LP.dari + '_' + LP.sampai, 'lap.ringkas', { dari: LP.dari, sampai: LP.sampai }, { umur: 120, render: gambar }); };
    ambil();
    $('#lpPre', el).onclick = function (e) { const b = e.target.closest('button'); if (!b) return; const p = preset(b.dataset.p); LP.dari = p[0]; LP.sampai = p[1]; $$('#lpPre button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); ambil(); };
    $('#lpDari', el).onchange = function () { LP.dari = this.value; ambil(); };
    $('#lpSampai', el).onchange = function () { LP.sampai = this.value; ambil(); };
    $('#lpCsv', el).onclick = function () { if (LP.data) R.csv('laporan-unit-' + LP.dari + '_' + LP.sampai + '.csv', LP.data.unit, [{ label: 'Unit', k: 'unit' }, { label: 'Plat', k: 'plat' }, { label: 'Kategori', k: 'kategori' }, { label: 'Booking', k: 'booking' }, { label: 'Hari sewa', k: 'hariSewa' }, { label: 'Pendapatan', k: 'pendapatan' }, { label: 'Biaya servis', k: 'servis' }, { label: 'Laba bersih', k: 'laba' }]); };
    $('#lpPdf', el).onclick = function () { W.print(); };
  }
  RP.daftar('laporan', { render: renderLaporan });
})(window);
