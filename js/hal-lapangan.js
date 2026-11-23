/* ============================================================
 * hal-lapangan.js — Antar-jemput (tugas harian), Serah Terima
 * check-out/check-in bertahap (foto 4 sisi, BBM, odometer,
 * kelengkapan, draft offline, struk thermal), Servis & Pajak
 * ============================================================ */
(function (W) {
  'use strict';
  const R = W.RF, RP = W.RFPanel, UI = W.RFUI, esc = R.esc, ic = R.ic;
  const $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ================= ANTAR-JEMPUT / TUGAS ================= */
  const TG = { tgl: null, tab: 'Semua' };
  function renderTugas(el) {
    TG.tgl = TG.tgl || R.isoTgl();
    const units = ((RP.P.boot && RP.P.boot.units) || []).filter(function (u) { return u.status === 'Perlu Cek/Bersih'; });
    el.innerHTML = UI.kepala('Jadwal Antar-Jemput &amp; Serah Terima', 'Daftar pengambilan, pengantaran, penjemputan, dan pengembalian. Yang terlambat ikut ditampilkan di hari ini.',
      '<input class="input pill" type="date" id="tgTgl" value="' + TG.tgl + '" style="width:auto"><button class="btn btn-sec" id="tgHariIni" type="button">Hari ini</button>') +
      '<div class="seg" id="tgTab">' + ['Semua', 'Keluar', 'Masuk', 'Antar'].map(function (t) { return '<button type="button" data-t="' + t + '" class="' + (TG.tab === t ? 'on' : '') + '">' + { Semua: 'Semua', Keluar: 'Pengambilan', Masuk: 'Pengembalian', Antar: 'Antar/Jemput lokasi' }[t] + '</button>'; }).join('') + '</div>' +
      '<div id="tgIsi" class="aktivitas"><div class="skel" style="height:90px"></div><div class="skel" style="height:90px"></div></div>' +
      (units.length ? '<section class="sec-card"><div class="hd"><h3>' + ic('alert', 'blue') + 'Unit perlu cek / bersih (' + units.length + ')</h3></div><div class="mini-list">' + units.map(function (u) { return '<div class="mini warn"><div class="row"><b>' + esc(u.merek + ' ' + u.tipe) + '</b><span class="plat">' + esc(u.plat_nomor) + '</span><button class="btn btn-ok btn-sm" data-siap="' + esc(u.id_unit) + '" type="button" style="margin-left:auto">' + ic('check', 's') + 'Sudah dicek & bersih</button></div></div>'; }).join('') + '</div></section>' : '');
    const gambar = function (d) {
      if (!d) return;
      const rows = d.rows.filter(function (t) { return TG.tab === 'Semua' || (TG.tab === 'Antar' ? t.antar : t.tipe === TG.tab); });
      const box = $('#tgIsi', el); if (!box) return;
      box.innerHTML = rows.length ? rows.map(function (t) {
        const telat = t.telat || (t.tipe === 'Keluar' && t.terlambat);
        return '<div class="akt ' + (t.telat ? 'telat' : '') + '"><div class="jam">' + R.jam(t.waktu) + '<small>' + (R.isoTgl(R.ms(t.waktu)) === R.isoTgl() ? 'WIB' : R.tgl(t.waktu).split(' ').slice(0, 2).join(' ')) + '</small></div>' +
          '<div style="min-width:0"><h4><span class="badge ' + (t.tipe === 'Keluar' ? 'b-info' : 'b-warn') + '">' + (t.tipe === 'Keluar' ? (t.antar ? 'Antar ke lokasi' : 'Pengambilan') : (t.antar ? 'Jemput di lokasi' : 'Pengembalian')) + '</span>' + esc(t.unit) + ' <span class="plat">' + esc(t.plat) + '</span></h4>' +
          '<div class="meta"><span>' + ic('user', 's') + esc(t.penyewa) + '</span><span>' + ic('pin', 's') + esc(t.lokasi) + '</span>' + (telat ? '<span class="err">' + ic('alert', 's') + (t.telat ? 'Telat kembali' : 'Lewat jadwal') + '</span>' : '') + '</div></div>' +
          '<div class="row" style="justify-content:flex-end"><a class="btn btn-ghost btn-sm" href="tel:' + esc(t.no_wa) + '" aria-label="Telepon">' + ic('phone', 's') + '</a><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + R.waLink(t.no_wa, 'Halo ' + t.penyewa + ', kami dari ' + RP.situs('NAMA_USAHA', '') + ' terkait ' + (t.tipe === 'Keluar' ? 'pengantaran' : 'penjemputan') + ' unit ' + t.unit + ' (' + t.id_booking + ').') + '" aria-label="WhatsApp">' + ic('chat', 's') + '</a>' +
          (t.antar && t.lokasi ? '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(t.lokasi) + '" aria-label="Peta">' + ic('pin', 's') + '</a>' : '') +
          '<a class="btn ' + (t.tipe === 'Keluar' ? 'btn-primary' : 'btn-accent') + ' btn-sm" href="#/app/cek/' + esc(t.id_booking) + '">' + (t.tipe === 'Keluar' ? 'Check-out' : 'Check-in') + '</a></div></div>';
      }).join('') : '<div class="tbl-wrap"><div class="empty">' + ic('checkc') + '<p>Tidak ada tugas pada tanggal ini.</p></div></div>';
      R.hidrasiIkon(box);
    };
    R.muat('tugas_' + TG.tgl, 'tugas.list', { tanggal: TG.tgl }, { umur: 30, render: gambar });
    $('#tgTgl', el).onchange = function () { TG.tgl = this.value || R.isoTgl(); renderTugas(el); R.hidrasiIkon(el); };
    $('#tgHariIni', el).onclick = function () { TG.tgl = R.isoTgl(); renderTugas(el); R.hidrasiIkon(el); };
    $('#tgTab', el).onclick = function (e) { const b = e.target.closest('button'); if (!b) return; TG.tab = b.dataset.t; renderTugas(el); R.hidrasiIkon(el); };
    el.addEventListener('click', function (e) { const s = e.target.closest('[data-siap]'); if (s) R.sibuk(s, async function () { const r = await R.api('unit.status', { id: s.dataset.siap, status: 'Tersedia' }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { await RP.boot(true); renderTugas(el); R.hidrasiIkon(el); } }); });
  }
  RP.daftar('tugas', { render: renderTugas });

  /* ================= SERAH TERIMA (CHECK-OUT / CHECK-IN) ================= */
  const SISI = ['Depan', 'Kanan', 'Kiri', 'Belakang'];
  function renderCek(el, arg) {
    if (arg) return formCek(el, arg.toUpperCase());
    el.innerHTML = UI.kepala('Check-in / Check-out', 'Pilih jadwal serah terima di bawah, atau masukkan kode booking.', '') +
      '<form class="toolbar" id="ckForm"><div class="search">' + ic('search') + '<input class="input" id="ckKode" placeholder="Kode booking, mis. RF-26-0012" style="text-transform:uppercase" required></div><button class="btn btn-primary" type="submit">Buka</button></form><div id="ckIsi" class="aktivitas"><div class="skel" style="height:90px"></div></div>';
    $('#ckForm', el).onsubmit = function (e) { e.preventDefault(); location.hash = '#/app/cek/' + $('#ckKode', el).value.trim().toUpperCase(); };
    const draf = R.LS.get('drafCek', {});
    R.muat('tugas_' + R.isoTgl(), 'tugas.list', { tanggal: R.isoTgl() }, { umur: 30, render: function (d) {
      if (!d) return; const box = $('#ckIsi', el); if (!box) return;
      const kd = Object.keys(draf);
      box.innerHTML = (kd.length ? '<div class="selisih"><b>' + ic('file', 's') + ' Draft tersimpan di perangkat ini</b>' + kd.map(function (k) { return '<a href="#/app/cek/' + esc(k) + '">' + esc(k) + ' (' + esc(draf[k].tipe) + ', ' + R.relatif(R.isoWaktu(draf[k].t)) + ')</a>'; }).join(' · ') + '</div>' : '') +
        (d.rows.length ? d.rows.map(function (t) { return '<a class="akt" href="#/app/cek/' + esc(t.id_booking) + '" style="color:inherit;text-decoration:none"><div class="jam">' + R.jam(t.waktu) + '<small>WIB</small></div><div><h4><span class="badge ' + (t.tipe === 'Keluar' ? 'b-info' : 'b-warn') + '">' + (t.tipe === 'Keluar' ? 'Check-out' : 'Check-in') + '</span>' + esc(t.unit) + ' <span class="plat">' + esc(t.plat) + '</span></h4><div class="meta"><span>' + esc(t.id_booking) + '</span><span>' + esc(t.penyewa) + '</span>' + (t.telat ? '<span class="err">Telat</span>' : '') + '</div></div><span class="btn btn-sec btn-sm">' + ic('right', 's') + '</span></a>'; }).join('') : '<div class="tbl-wrap"><div class="empty">' + ic('checkc') + '<p>Tidak ada serah terima hari ini.</p></div></div>');
      R.hidrasiIkon(box);
    } });
  }
  function formCek(el, id) {
    el.innerHTML = '<div class="st-wrap"><div class="skel" style="height:140px"></div><div class="skel" style="height:260px"></div></div>';
    R.api('cek.konteks', { id: id }).then(function (r) {
      if (!r.success) { el.innerHTML = '<div class="empty">' + ic('alert') + '<p>' + esc(r.message) + '</p><a class="btn btn-sec" href="#/app/cek">Kembali</a></div>'; R.hidrasiIkon(el); return; }
      gambarCek(el, r.data); R.hidrasiIkon(el);
    });
  }
  function gambarCek(el, k) {
    const b = k.booking, u = k.unit, p = k.penyewa || {}, masuk = k.tipe === 'Masuk', crew = RP.role() === 'CREW';
    if (!k.tipe) { el.innerHTML = '<div class="empty">' + ic('info') + '<p>Booking ' + esc(b.id_booking) + ' berstatus <b>' + esc(b.status) + '</b> — tidak bisa serah terima.</p><a class="btn btn-sec" href="#/app/cek">Kembali</a></div>'; return; }
    const draf = (R.LS.get('drafCek', {})[b.id_booking] || {});
    const kelAwal = masuk && k.keluar ? (function () { try { return JSON.parse(k.keluar.kelengkapan || '{}'); } catch (e) { return {}; } })() : null;
    const S = { bbm: draf.bbm != null ? draf.bbm : (masuk && k.keluar ? Number(k.keluar.bbm_persen) : (u.bbm || 100)), odo: draf.odo != null ? draf.odo : (masuk ? Math.max(u.odometer, k.keluar ? Number(k.keluar.odometer) : 0) : u.odometer),
      kel: draf.kel || (function () { const o = {}; k.kelengkapan.forEach(function (x) { o[x] = kelAwal ? kelAwal[x] !== false : true; }); return o; })(),
      foto: draf.foto || {}, catatan: draf.catatan || '', biaya: draf.biaya || 0, jaminan: draf.jaminan !== undefined ? draf.jaminan : !!b.jaminan_jenis, konfirmasiOdo: false };
    const telatMnt = masuk ? Math.round((Date.now() - R.ms(b.selesai)) / 60000) : 0;
    const status = masuk ? (telatMnt > b.toleransi_menit ? '<span class="badge dot b-bad">Telat ' + Math.ceil((telatMnt - b.toleransi_menit) / 60) + ' jam</span>' : '<span class="badge dot b-ok">Tepat waktu</span>') : '<span class="badge dot b-info">Siap serah</span>';
    el.innerHTML = '<div class="st-wrap">' +
      '<div class="seg" style="justify-self:stretch;display:grid;grid-template-columns:1fr 1fr"><button type="button" class="' + (masuk ? '' : 'on') + '" disabled>' + ic('upload', 's') + ' Check-out (Serah Keluar)</button><button type="button" class="' + (masuk ? 'on' : '') + '" disabled>' + ic('download', 's') + ' Check-in (Kembali Masuk)</button></div>' +
      '<section class="st-sec" style="gap:10px"><div class="row"><span class="small muted">BOOKING #' + esc(b.id_booking) + '</span><span style="margin-left:auto">' + status + '</span></div><h2 style="font-size:22px">' + esc(u.nama) + '</h2>' +
      '<div class="row"><span class="plat" style="font-size:14px">' + esc(u.plat) + '</span><span class="badge b-info">' + (u.transmisi === 'MT' ? 'Manual' : 'Automatic') + (u.warna ? ' · ' + esc(u.warna) : '') + '</span></div>' +
      '<div class="row" style="background:var(--soft);border-radius:14px;padding:10px"><span class="avatar">' + esc(R.inisial(p.nama)) + '</span><div class="grow"><b>' + esc(p.nama) + '</b><div class="small muted">' + esc(p.no_wa) + '</div></div><a class="btn btn-soft btn-ico" target="_blank" rel="noopener" href="' + R.waLink(p.no_wa) + '" aria-label="WhatsApp">' + ic('chat') + '</a><a class="btn btn-soft btn-ico" href="tel:' + esc(p.no_wa) + '" aria-label="Telepon">' + ic('phone') + '</a></div>' +
      '<div class="small muted">' + R.tgl(b.mulai, true) + ' → ' + R.tgl(b.selesai, true) + ' · ' + esc(masuk ? (b.lokasi_jemput || 'Pool') : (b.lokasi_antar || 'Pool')) + '</div></section>' +
      '<div id="ckSelisih"></div>' +
      '<section class="st-sec"><h3>1. BBM &amp; Odometer</h3><div class="bbm"><div class="row between"><span class="small muted">Indikator tangki BBM</span><b style="font-size:24px;color:var(--primary)" id="ckBbmV">' + S.bbm + '%</b></div>' +
      '<input type="range" min="0" max="100" step="5" id="ckBbm" value="' + S.bbm + '" aria-label="Persentase BBM"><div class="scale"><span>E (Kosong)</span>' + (masuk && k.keluar ? '<span>● Awal: ' + esc(k.keluar.bbm_persen) + '%</span>' : '<span>½</span>') + '<span>F (Penuh)</span></div></div>' +
      '<div class="field"><label>Angka odometer (km)' + (masuk && k.keluar ? ' <span class="blue" id="ckOdoDiff"></span>' : '') + '</label><div class="odo"><button class="btn btn-sec" type="button" data-odo="-10" aria-label="Kurangi">' + ic('minus') + '</button><input class="input tnum" type="number" inputmode="numeric" id="ckOdo" value="' + S.odo + '" min="0"><button class="btn btn-sec" type="button" data-odo="10" aria-label="Tambah">' + ic('plus') + '</button></div>' +
      '<div class="row between xs muted"><span>' + (masuk && k.keluar ? 'Saat keluar: <b>' + R.angka(k.keluar.odometer) + ' km</b>' : 'Tercatat terakhir: <b>' + R.angka(u.odometer) + ' km</b>') + '</span>' + (b.km_include ? '<span>Batas ' + b.km_include + ' km/hari</span>' : '') + '</div></div></section>' +
      '<section class="st-sec"><div class="row between"><h3>2. Kelengkapan &amp; Dokumen</h3><span class="small blue" id="ckKelN"></span></div><div class="kel-list" id="ckKel">' +
      k.kelengkapan.map(function (x) { return '<label class="kel ' + (S.kel[x] ? '' : 'off') + '">' + ic(/stnk|kartu|toll/i.test(x) ? 'file' : /kunci/i.test(x) ? 'key' : /helm|jas/i.test(x) ? 'shield' : 'wrench') + '<span><b>' + esc(x) + '</b>' + (kelAwal && kelAwal[x] === false ? '<div class="xs muted">Tidak ada saat keluar</div>' : '') + '</span><input type="checkbox" data-kel="' + esc(x) + '"' + (S.kel[x] ? ' checked' : '') + '></label>'; }).join('') + '</div></section>' +
      '<section class="st-sec"><div class="row between"><h3>3. Foto ' + k.fotoMin + ' Sisi Unit (Wajib)</h3><span class="badge b-info" id="ckFotoN"></span></div><div class="foto-grid" id="ckFoto"></div>' +
      '<label class="btn btn-soft">' + ic('camera') + 'Tambah foto kerusakan / catatan khusus<input type="file" accept="image/*" capture="environment" id="ckFotoX" hidden></label><p class="hint">Foto dikompres otomatis (±1 MB) dan diunggah satu per satu. Bila sinyal lemah, ketuk foto bertanda merah untuk mengulang.</p></section>' +
      '<section class="st-sec"><h3>4. Catatan Fisik &amp; Status</h3><textarea class="input" id="ckCatatan" rows="3" placeholder="Mis. baret halus bumper kiri depan, sudah dicatat bersama penyewa.">' + esc(S.catatan) + '</textarea>' +
      (masuk && !crew ? '<div class="field"><label>Biaya kerusakan (Rp, opsional)</label><input class="input" type="number" min="0" id="ckBiaya" value="' + (S.biaya || '') + '" inputmode="numeric"></div>' : '') +
      '<div class="selisih small ln">' + ic('info', 's') + (masuk ? ' Setelah check-in, unit otomatis berstatus <b>Perlu Cek/Bersih</b> dan booking <b>Selesai</b>.' : ' Setelah check-out, unit berstatus <b>Disewa</b> dan booking <b>Sedang Berjalan</b>.') + '</div></section>' +
      (!masuk && b.jaminan_jenis ? '<section class="st-sec"><h3>5. Jaminan</h3><label class="kel"><span><b>' + esc(b.jaminan_jenis) + '</b><div class="xs muted">Centang bila jaminan sudah diterima petugas</div></span><input type="checkbox" id="ckJam"' + (S.jaminan ? ' checked' : '') + '></label></section>' : '') +
      (masuk && k.keuangan ? '<section class="st-sec"><h3>5. Tagihan &amp; Deposit</h3><div class="info-chips"><div class="ichip"><small>Deposit ditahan</small><b>' + R.rp(k.keuangan.deposit_ditahan) + '</b></div><div class="ichip"><small>Sisa tagihan</small><b>' + R.rp(k.keuangan.sisa) + '</b></div><div class="ichip"><small>Estimasi denda</small><b class="' + (k.estimasiDenda.denda ? 'err' : '') + '">' + R.rp(k.estimasiDenda.denda) + '</b><span class="xs muted">' + k.estimasiDenda.jamTelat + ' jam × ' + R.rp(k.keuangan.denda_per_jam) + '</span></div></div>' +
        (RP.role() === 'OWNER' && k.estimasiDenda.denda ? '<label class="chk"><input type="checkbox" id="ckHapusDenda"> Hapuskan denda (kebijakan Owner)</label>' : '') + '</section>' : '') +
      (masuk && crew && k.estimasiDenda.jamTelat ? '<div class="selisih"><b>' + ic('alert', 's') + ' Telat ' + k.estimasiDenda.jamTelat + ' jam</b><span class="small">Denda dihitung otomatis oleh sistem dan diproses admin.</span></div>' : '') +
      '<div class="st-bar"><button class="btn btn-accent btn-lg" id="ckSimpan" type="button">' + ic('checkc') + 'Selesaikan &amp; Simpan ' + (masuk ? 'Check-in' : 'Check-out') + '</button><button class="btn btn-ghost btn-sm" id="ckDraf" type="button">Simpan draft sementara (offline)</button></div></div>';
    // ---- foto
    const slotHtml = function (key, label) {
      const f = S.foto[key] || {};
      return '<label class="fslot ' + (f.status === 'up' ? 'up' : f.status === 'err' ? 'err' : '') + '" data-slot="' + esc(key) + '">' + (f.prev ? '<img src="' + f.prev + '" alt="">' : '<span class="cam">' + ic('camera') + '<span>' + esc(label) + '</span></span>') +
        (f.id || f.status ? '<span class="st">' + ic(f.status === 'up' ? 'refresh' : f.status === 'err' ? 'alert' : 'check', 's') + '</span>' : '') + '<span class="lb">' + esc(label) + (f.t ? ' · ' + esc(f.t) : '') + '</span><input type="file" accept="image/*" capture="environment" data-file="' + esc(key) + '"></label>';
    };
    const gambarFoto = function () {
      const ekstra = Object.keys(S.foto).filter(function (k2) { return SISI.indexOf(k2) === -1; });
      const box = $('#ckFoto', el); box.innerHTML = SISI.slice(0, Math.max(4, k.fotoMin)).map(function (s) { return slotHtml(s, 'Tampak ' + s); }).join('') + ekstra.map(function (x) { return slotHtml(x, 'Catatan ' + x.replace('X', '')); }).join('');
      const n = Object.keys(S.foto).filter(function (x) { return S.foto[x].id; }).length;
      $('#ckFotoN', el).textContent = n + ' terunggah';
      R.hidrasiIkon(box);
      // pasang langsung di tiap input: bila slot digambar ulang saat kamera masih terbuka (unggahan lain selesai),
      // input lama sudah terlepas dari DOM tetapi pendengarnya tetap jalan → foto tidak hilang.
      box.querySelectorAll('[data-file]').forEach(function (inp) { inp.onchange = function () { if (inp.files[0]) unggah(inp.dataset.file, inp.files[0]); }; });
    };
    const unggah = async function (key, file) {
      try {
        const c = await R.kompresFoto(file, 1280);
        S.foto[key] = { prev: c.url, status: 'up', t: R.jam(Date.now()) }; gambarFoto();
        const r = await R.api('cek.foto', { id: b.id_booking, sisi: key, b64: c.b64, mime: c.mime });
        if (!r.success) throw new Error(r.message);
        S.foto[key] = { id: r.data.fileId, prev: c.url, status: 'ok', t: R.jam(Date.now()) };
      } catch (e) { S.foto[key] = Object.assign(S.foto[key] || {}, { status: 'err' }); R.toast('Foto ' + key + ': ' + e.message, 'err'); }
      gambarFoto(); simpanDraf(true);
    };
    $('#ckFotoX', el).onchange = function () { if (this.files[0]) { const key = 'X' + (Object.keys(S.foto).filter(function (x) { return x[0] === 'X'; }).length + 1); unggah(key, this.files[0]); } };
    // ---- BBM, odometer, kelengkapan
    const selisih = function () {
      $('#ckBbmV', el).textContent = S.bbm + '%';
      const kelN = Object.keys(S.kel).filter(function (x) { return S.kel[x]; }).length;
      $('#ckKelN', el).textContent = kelN + '/' + Object.keys(S.kel).length + ' terverifikasi';
      if (!masuk || !k.keluar) return;
      const kurang = Number(k.keluar.bbm_persen) - S.bbm, km = S.odo - Number(k.keluar.odometer);
      const d = $('#ckOdoDiff', el); if (d) d.textContent = (km >= 0 ? '+' : '') + R.angka(km) + ' km';
      const biaya = kurang >= 5 && k.biayaBbm10 ? Math.ceil(kurang / 10) * k.biayaBbm10 : 0;
      $('#ckSelisih', el).innerHTML = kurang >= 5 ? '<div class="selisih"><b>' + ic('alert', 's') + ' Selisih BBM terdeteksi</b><span class="small">Turun ' + kurang + '% dari kondisi serah terima keluar (' + k.keluar.bbm_persen + '% → ' + S.bbm + '%).</span>' + (biaya && !crew ? '<div class="row between"><span class="small">Penyesuaian biaya BBM otomatis</span><b class="err">' + R.rp(biaya) + '</b></div>' : '') + '</div>' :
        (km < 0 ? '<div class="selisih"><b class="err">Odometer lebih kecil dari saat keluar</b><span class="small">Periksa lagi angka odometer.</span></div>' : '');
    };
    $('#ckBbm', el).oninput = function () { S.bbm = Number(this.value); selisih(); };
    $('#ckOdo', el).oninput = function () { S.odo = Number(this.value) || 0; selisih(); };
    $$('[data-odo]', el).forEach(function (bt) { bt.onclick = function () { S.odo = Math.max(0, S.odo + Number(bt.dataset.odo)); $('#ckOdo', el).value = S.odo; selisih(); }; });
    $('#ckKel', el).onchange = function (e) { const c = e.target.closest('[data-kel]'); if (!c) return; S.kel[c.dataset.kel] = c.checked; c.closest('.kel').classList.toggle('off', !c.checked); selisih(); };
    // ---- draft offline
    const simpanDraf = function (diam) {
      S.catatan = $('#ckCatatan', el).value; if ($('#ckBiaya', el)) S.biaya = Number($('#ckBiaya', el).value) || 0; if ($('#ckJam', el)) S.jaminan = $('#ckJam', el).checked;
      const all = R.LS.get('drafCek', {}), fotoRingan = {};
      Object.keys(S.foto).forEach(function (x) { if (S.foto[x].id) fotoRingan[x] = { id: S.foto[x].id, status: 'ok', t: S.foto[x].t }; });
      all[b.id_booking] = { tipe: k.tipe, t: Date.now(), bbm: S.bbm, odo: S.odo, kel: S.kel, foto: fotoRingan, catatan: S.catatan, biaya: S.biaya, jaminan: S.jaminan };
      R.LS.set('drafCek', all); if (!diam) R.toast('Draft tersimpan di perangkat ini.', 'ok');
    };
    $('#ckDraf', el).onclick = function () { simpanDraf(false); };
    // ---- simpan
    $('#ckSimpan', el).onclick = function () {
      const fotoIds = Object.keys(S.foto).map(function (x) { return S.foto[x].id; }).filter(Boolean);
      if (Object.keys(S.foto).some(function (x) { return S.foto[x].status === 'up'; })) { R.toast('Tunggu unggahan foto selesai.', 'err'); return; }
      if (fotoIds.length < k.fotoMin) { R.toast('Foto minimal ' + k.fotoMin + ' sisi wajib (baru ' + fotoIds.length + ').', 'err'); $('#ckFoto', el).scrollIntoView({ behavior: 'smooth' }); return; }
      simpanDraf(true);
      const btn = this;
      const kirim = function (konfOdo) {
        return R.sibuk(btn, async function () {
          const r = await R.api('cek.simpan', { id: b.id_booking, tipe: k.tipe, bbm_persen: S.bbm, odometer: S.odo, kelengkapan: S.kel, foto_drive_ids: fotoIds, catatan_kerusakan: S.catatan,
            biaya_kerusakan: S.biaya, jaminanDiterima: S.jaminan, konfirmasiOdo: konfOdo, hapusDenda: !!($('#ckHapusDenda', el) && $('#ckHapusDenda', el).checked) });
          if (!r.success && r.code === 'ODO') { if (await R.konfirmasi(r.message, { ya: 'Ya, angka sudah benar' })) return kirim(true); return; }
          if (!r.success) { R.toast(r.message, 'err'); return; }
          const all = R.LS.get('drafCek', {}); delete all[b.id_booking]; R.LS.set('drafCek', all);
          R.Mem.basi(); RP.segarkanDash(); RP.boot(true);
          selesai(r, b, p, masuk);
        });
      };
      kirim(false);
    };
    gambarFoto(); selisih();
  }
  function selesai(r, b, p, masuk) {
    const d = r.data, crew = RP.role() === 'CREW';
    const m = R.modal({ judul: (masuk ? 'Check-in' : 'Check-out') + ' tersimpan ✓', isi: '<p>' + esc(r.message) + '</p>' +
      (d.flag.length ? '<div class="selisih"><b>' + ic('alert', 's') + ' Catatan sistem</b><ul style="margin:0;padding-left:18px">' + d.flag.map(function (f) { return '<li class="small">' + esc(f) + '</li>'; }).join('') + '</ul></div>' : '') +
      (masuk && !crew ? '<div class="info-chips"><div class="ichip"><small>Denda telat</small><b class="' + (d.denda.denda ? 'err' : '') + '">' + R.rp(d.denda.denda) + '</b><span class="xs muted">' + d.denda.jamTelat + ' jam</span></div><div class="ichip"><small>Biaya lain</small><b>' + R.rp(d.biaya_bbm + d.biaya_kerusakan) + '</b></div><div class="ichip"><small>Sisa tagihan</small><b class="blue">' + R.rp(d.keuangan.sisa) + '</b></div><div class="ichip"><small>Deposit ditahan</small><b>' + R.rp(d.keuangan.deposit_ditahan) + '</b></div></div>' : ''),
      kaki: '<button class="btn btn-sec" id="sgCetak" type="button">' + ic('printer') + 'Cetak Tanda Terima</button>' + (masuk && !crew ? '<a class="btn btn-sec" href="#/app/booking/' + esc(b.id_booking) + '" data-tutup>Detail &amp; Deposit</a>' : '') + '<a class="btn btn-primary" href="#/app/' + (crew ? 'tugas' : 'dashboard') + '" data-tutup>Selesai</a>' });
    const cetak = function () { if (W.StrukUI && d.struk) W.StrukUI.pratinjau({ jenis: 'SERAH', data: d.struk, nomor: b.id_booking + (masuk ? '-IN' : '-OUT'), judul: 'Tanda Terima ' + (masuk ? 'Check-in' : 'Check-out'), waNomor: p.no_wa, setelahSimpan: true }); };
    m.$('#sgCetak').onclick = cetak;
    if (W.StrukPrinter && W.StrukPrinter.pengaturan().otomatis) setTimeout(cetak, 250);
  }
  RP.daftar('cek', { render: renderCek });

  /* ================= SERVIS & PAJAK ================= */
  const SV = { q: '', jenis: '', hal: 1 };
  function renderServis(el) {
    const oa = RP.role() !== 'CREW';
    el.innerHTML = UI.kepala('Servis &amp; Pajak', 'Catatan servis, biaya bengkel, serta pengingat STNK, pajak, KIR, dan asuransi berdasar tanggal atau kilometer. Biaya masuk ke laba bersih unit.',
      (oa ? '<button class="btn btn-sec" id="svCsv" type="button">' + ic('download') + 'Ekspor</button>' : '') + '<button class="btn btn-accent" id="svBaru" type="button">' + ic('plus') + 'Catat Servis</button>') +
      '<div id="svPeng"></div><div class="toolbar"><div class="search">' + ic('search') + '<input class="input" id="svQ" placeholder="Unit, plat, catatan" value="' + esc(SV.q) + '"></div><select class="input" id="svJ"><option value="">Semua jenis</option>' + ['oli', 'ban', 'rem', 'STNK', 'pajak', 'KIR', 'asuransi', 'lainnya'].map(function (j) { return '<option' + (SV.jenis === j ? ' selected' : '') + '>' + j + '</option>'; }).join('') + '</select></div><div id="svIsi"><div class="skel" style="height:260px"></div></div>';
    let data = null;
    const gambar = function () {
      if (!data) return;
      const q = SV.q.toLowerCase();
      const rows = data.rows.filter(function (s) { return (!SV.jenis || s.jenis === SV.jenis) && (!q || [s.unit, s.plat, s.catatan, s.id_servis].join(' ').toLowerCase().indexOf(q) > -1); });
      $('#svPeng', el).innerHTML = data.pengingat.length ? '<section class="sec-card"><div class="hd"><h3>' + ic('bell', 'blue') + 'Jatuh tempo &amp; mendekati (' + data.pengingat.length + ')</h3></div><div class="kpis">' + data.pengingat.map(function (s) { return '<div class="mini ' + (s.lewat ? 'bad' : 'warn') + '"><div class="row"><b>' + esc(s.unit) + '</b><span class="badge ' + (s.lewat ? 'b-bad' : 'b-warn') + '">' + (s.lewat ? 'LEWAT' : 'SEGERA') + '</span></div><div class="small">' + esc(s.jenis.toUpperCase()) + ' · <span class="plat">' + esc(s.plat) + '</span></div><div class="xs muted">' + (s.sisaHari !== null ? (s.sisaHari < 0 ? 'lewat ' + (-s.sisaHari) : s.sisaHari) + ' hari ' : '') + (s.sisaKm !== null ? '· sisa ' + R.angka(s.sisaKm) + ' km' : '') + '</div><button class="btn btn-soft btn-sm" data-perpanjang="' + esc(s.id_unit) + '|' + esc(s.jenis) + '" type="button">Catat perpanjangan</button></div>'; }).join('') + '</div></section>' : '';
      $('#svIsi', el).innerHTML = UI.tabel([
        { l: 'Unit', full: true, f: function (s) { return '<div class="t1">' + esc(s.unit) + '</div><div class="t2"><span class="plat">' + esc(s.plat) + '</span> · ' + esc(s.id_servis) + '</div>'; } },
        { l: 'Jenis', f: function (s) { return '<span class="badge b-info">' + esc(s.jenis) + '</span>'; } },
        { l: 'Tanggal / km', f: function (s) { return R.tgl(s.tanggal) + '<div class="t2 tnum">' + R.angka(s.odometer) + ' km</div>'; } },
        { l: 'Biaya', r: true, f: function (s) { return s.biaya === null ? '-' : '<b class="tnum">' + R.rp(s.biaya) + '</b>'; } },
        { l: 'Berikutnya', f: function (s) { return (s.next_due_tanggal ? R.tgl(s.next_due_tanggal) : '') + (s.next_due_km ? '<div class="t2">' + R.angka(s.next_due_km) + ' km</div>' : '') || '-'; } },
        { l: 'Status', f: function (s) { return '<span class="badge ' + (s.status === 'Selesai' ? 'b-ok' : s.status === 'Dikerjakan' ? 'b-bad' : 'b-warn') + '">' + esc(s.status) + '</span>'; } },
        { l: '', r: true, f: function (s) { return '<button class="btn btn-soft btn-sm" data-sv="' + esc(s.id_servis) + '" type="button">Ubah</button>'; } }
      ], rows, { hal: SV.hal, kosong: 'Belum ada catatan servis.', ikon: 'wrench' });
      R.hidrasiIkon(el);
    };
    R.muat('servis', 'servis.list', {}, { umur: 60, render: function (d) { if (d) { data = d; gambar(); } } });
    const segar = function () { R.Mem.basi(); R.muat('servis', 'servis.list', {}, { paksa: true, render: function (d) { if (d) { data = d; gambar(); } } }); RP.boot(true); };
    $('#svQ', el).oninput = R.debounce(function () { SV.q = this.value; SV.hal = 1; gambar(); }, 250);
    $('#svJ', el).onchange = function () { SV.jenis = this.value; gambar(); };
    $('#svBaru', el).onclick = function () { formServis(null, {}, segar); };
    if ($('#svCsv', el)) $('#svCsv', el).onclick = function () { if (data) R.csv('servis-' + R.isoTgl() + '.csv', data.rows, ['id_servis', 'unit', 'plat', 'jenis', 'tanggal', 'odometer', 'biaya', 'next_due_tanggal', 'next_due_km', 'status', 'catatan']); };
    UI.ikat($('#svIsi', el), function (h) { SV.hal = h; gambar(); });
    el.addEventListener('click', function (e) {
      const s = e.target.closest('[data-sv]'); if (s && data) formServis(data.rows.filter(function (x) { return x.id_servis === s.dataset.sv; })[0], {}, segar);
      const p = e.target.closest('[data-perpanjang]'); if (p) { const x = p.dataset.perpanjang.split('|'); formServis(null, { id_unit: x[0], jenis: x[1] }, segar); }
    });
  }
  function formServis(s, pre, segar) {
    const oa = RP.role() !== 'CREW';
    UI.formModal({ judul: s ? 'Ubah ' + s.id_servis : 'Catat Servis / Pajak', nilai: s || Object.assign({ tanggal: R.isoTgl(), status: 'Selesai', jenis: 'oli' }, pre),
      fields: [{ n: 'id_unit', l: 'Unit', t: 'select', o: [['', '— pilih unit —']].concat(UI.opsiUnit(function () { return true; })), req: true, full: true },
        { n: 'jenis', l: 'Jenis', t: 'select', o: [['oli', 'Ganti oli'], ['ban', 'Ban'], ['rem', 'Rem'], ['STNK', 'STNK (5 tahunan)'], ['pajak', 'Pajak tahunan'], ['KIR', 'KIR'], ['asuransi', 'Asuransi'], ['lainnya', 'Lainnya']] },
        { n: 'status', l: 'Status', t: 'select', o: [['Selesai', 'Selesai'], ['Dikerjakan', 'Sedang dikerjakan (unit Maintenance)'], ['Terjadwal', 'Terjadwal']] },
        { n: 'tanggal', l: 'Tanggal', t: 'date' }, { n: 'odometer', l: 'Odometer (km)', t: 'number', min: 0 },
        { n: 'biaya', l: 'Biaya (Rp)', t: 'number', min: 0 }, { n: 'next_due_tanggal', l: 'Jatuh tempo berikutnya (tanggal)', t: 'date' },
        { n: 'next_due_km', l: 'Jatuh tempo berikutnya (km)', t: 'number', min: 0 }, { n: 'catatan', l: 'Catatan', t: 'textarea', full: true, rows: 2 }],
      kakiKiri: s && oa ? '<button class="btn btn-danger" id="svHapus" type="button" style="margin-right:auto">' + ic('trash') + 'Hapus</button>' : '',
      buka: function (m, f) {
        const sel = f.querySelector('[name=jenis]'), nd = f.querySelector('[name=next_due_tanggal]'), nk = f.querySelector('[name=next_due_km]'), od = f.querySelector('[name=odometer]');
        const unitSel = f.querySelector('[name=id_unit]');
        const isiOtomatis = function () { if (s) return; const u = RP.unit(unitSel.value); if (u && !od.value) od.value = u.odometer_terakhir; const tgl = f.querySelector('[name=tanggal]').value || R.isoTgl(), t = R.ms(tgl);
          const thn = { pajak: 1, asuransi: 1, KIR: .5, STNK: 5 }[sel.value]; if (thn && !nd.value) nd.value = R.isoTgl(t + thn * 365 * 86400e3);
          if (sel.value === 'oli' && !nk.value && od.value) nk.value = Number(od.value) + (u && u.kategori === 'Motor' ? 2000 : 5000); };
        sel.onchange = isiOtomatis; unitSel.onchange = isiOtomatis;
        const h = m.$('#svHapus'); if (h) h.onclick = async function () { if (!(await R.konfirmasi('Hapus catatan servis ini?', { bahaya: true }))) return; const r = await R.api('servis.hapus', { id: s.id_servis }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { m.tutup(); segar(); } };
      },
      simpan: function (v) { if (s) v.id_servis = s.id_servis; return R.api('servis.simpan', v); }, setelah: segar });
  }
  RP.daftar('servis', { render: renderServis });
})(window);
