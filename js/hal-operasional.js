/* ============================================================
 * hal-operasional.js — Armada, Tarif & Paket, Kalender, Booking
 * (antrean landing page + detail + nota), Penyewa & Jaminan
 * + RFUI: tabel, pager, form builder dipakai halaman lain
 * ============================================================ */
(function (W) {
  'use strict';
  const R = W.RF, RP = W.RFPanel, esc = R.esc, ic = R.ic;
  const $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ================= RFUI: komponen bersama ================= */
  const UI = {
    /** Field form: {n, l, t, o, req, ph, hint, full, step, min, max, v} */
    field: function (f, nilai) {
      const v = nilai && nilai[f.n] !== undefined && nilai[f.n] !== null ? nilai[f.n] : (f.v !== undefined ? f.v : '');
      const req = f.req ? ' required' : '', ph = f.ph ? ' placeholder="' + esc(f.ph) + '"' : '', extra = (f.min !== undefined ? ' min="' + f.min + '"' : '') + (f.max !== undefined ? ' max="' + f.max + '"' : '') + (f.step ? ' step="' + f.step + '"' : '') + (f.ro ? ' readonly' : '');
      let inp;
      if (f.t === 'select') inp = '<select class="input" name="' + f.n + '"' + req + '>' + (f.o || []).map(function (o) { const ov = Array.isArray(o) ? o[0] : o, ol = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(ov) + '"' + (String(ov) === String(v) ? ' selected' : '') + '>' + esc(ol) + '</option>'; }).join('') + '</select>';
      else if (f.t === 'textarea') inp = '<textarea class="input' + (f.code ? ' code' : '') + '" name="' + f.n + '" rows="' + (f.rows || 3) + '"' + req + ph + '>' + esc(v) + '</textarea>';
      else if (f.t === 'check') return '<label class="chk' + (f.full ? '" style="grid-column:1/-1' : '') + '"><input type="checkbox" name="' + f.n + '"' + (v === true || v === 'Y' || v === 'YA' ? ' checked' : '') + '> ' + esc(f.l) + '</label>';
      else if (f.t === 'datetime') inp = '<input class="input" type="datetime-local" step="900" name="' + f.n + '" value="' + esc(String(v).replace(' ', 'T').slice(0, 16)) + '"' + req + '>';
      else inp = '<input class="input" type="' + (f.t || 'text') + '" name="' + f.n + '" value="' + esc(v) + '"' + req + ph + extra + (f.t === 'number' ? ' inputmode="numeric"' : '') + (f.list ? ' list="' + f.list + '"' : '') + '>';
      return '<div class="field"' + (f.full ? ' style="grid-column:1/-1"' : '') + '><label>' + esc(f.l) + (f.req ? ' *' : '') + '</label>' + inp + (f.hint ? '<span class="hint">' + f.hint + '</span>' : '') + '</div>';
    },
    form: function (fields, nilai, id) { return '<form class="grid-2" id="' + (id || 'fUI') + '" novalidate>' + fields.map(function (f) { return f.html || UI.field(f, nilai); }).join('') + '</form>'; },
    /** Modal form → onSimpan(nilai, modal) mengembalikan Promise<respons>; sukses → tutup. */
    formModal: function (o) {
      const m = R.modal({ judul: o.judul, lebar: o.lebar, isi: (o.atas || '') + UI.form(o.fields, o.nilai, 'fUI') + (o.bawah || ''),
        kaki: (o.kakiKiri || '') + '<button class="btn btn-sec" data-tutup type="button">Batal</button><button class="btn btn-primary" id="fSimpan" type="button">' + ic('check') + esc(o.tombol || 'Simpan') + '</button>' });
      const f = m.$('#fUI');
      m.$('#fSimpan').onclick = function () {
        const kosong = $$('[required]', f).filter(function (x) { return !String(x.value).trim(); });
        if (kosong.length) { kosong[0].focus(); R.toast('Lengkapi isian bertanda *', 'err'); return; }
        const v = R.nilaiForm(f);
        R.sibuk(this, async function () { const r = await o.simpan(v, m); if (r && r.success) { R.toast(r.message || 'Tersimpan.', 'ok'); m.tutup(); if (o.setelah) o.setelah(r); } else if (r) R.toast(r.message, 'err'); });
      };
      if (o.buka) o.buka(m, f);
      return m;
    },
    /** Tabel → kartu di ponsel. cols: [{l, f(row), r?, c?, full?}] */
    tabel: function (cols, rows, opt) {
      opt = opt || {};
      if (!rows.length) return '<div class="tbl-wrap"><div class="empty">' + ic(opt.ikon || 'list') + '<p>' + esc(opt.kosong || 'Belum ada data.') + '</p></div></div>';
      const per = opt.per || 25, hal = Math.max(1, Math.min(opt.hal || 1, Math.ceil(rows.length / per)));
      const potong = rows.slice((hal - 1) * per, hal * per);
      const head = '<thead><tr>' + cols.map(function (c) { return '<th class="' + (c.r ? 'r' : c.c ? 'c' : '') + '">' + esc(c.l) + '</th>'; }).join('') + '</tr></thead>';
      const body = '<tbody>' + potong.map(function (row) { return '<tr' + (opt.go ? ' data-go="' + esc(opt.go(row)) + '"' : '') + '>' + cols.map(function (c) { return '<td data-l="' + esc(c.l) + '" class="' + (c.r ? 'r ' : c.c ? 'c ' : '') + (c.full ? 'full' : '') + '">' + c.f(row) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
      return '<div class="tbl-wrap"><div class="tbl-scroll"><table class="tbl kartu">' + head + body + '</table></div>' + UI.pager(rows.length, hal, per) + '</div>';
    },
    pager: function (n, hal, per) {
      const tot = Math.ceil(n / per); if (tot <= 1) return '<div class="pager"><span>Menampilkan ' + n + ' data</span></div>';
      const nums = []; for (let i = 1; i <= tot; i++) if (i === 1 || i === tot || Math.abs(i - hal) <= 1) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…');
      return '<div class="pager"><span>Menampilkan ' + ((hal - 1) * per + 1) + '–' + Math.min(n, hal * per) + ' dari ' + n + '</span><div class="row">' +
        '<button type="button" data-hal="' + (hal - 1) + '"' + (hal <= 1 ? ' disabled' : '') + ' aria-label="Sebelumnya">‹</button>' +
        nums.map(function (x) { return x === '…' ? '<span>…</span>' : '<button type="button" data-hal="' + x + '" class="' + (x === hal ? 'on' : '') + '">' + x + '</button>'; }).join('') +
        '<button type="button" data-hal="' + (hal + 1) + '"' + (hal >= tot ? ' disabled' : '') + ' aria-label="Berikutnya">›</button></div></div>';
    },
    /** Pasang klik pager + baris data-go. */
    ikat: function (el, onHal) {
      el.onclick = function (e) {
        const p = e.target.closest('[data-hal]'); if (p && !p.disabled) { onHal(Number(p.dataset.hal)); return; }
        const g = e.target.closest('tr[data-go]'); if (g && !e.target.closest('a,button,input,select,label')) location.hash = g.dataset.go;
      };
    },
    kpi: function (t, v, s, kls, ikon, go) { return '<div class="kpi ' + (kls || '') + '"' + (go ? ' data-go="' + go + '"' : '') + '><div class="t"><span>' + t + '</span><span class="ic">' + ic(ikon || 'car', 's') + '</span></div><div class="v tnum">' + v + '</div><div class="s">' + (s || '') + '</div></div>'; },
    kepala: function (judul, sub, aksi) { return '<div class="page-h"><div><h1>' + judul + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div><div class="act">' + (aksi || '') + '</div></div>'; },
    opsiUnit: function (filterFn) { return ((RP.P.boot && RP.P.boot.units) || []).filter(filterFn || function (u) { return u.status !== 'Nonaktif'; }).map(function (u) { return [u.id_unit, u.merek + ' ' + u.tipe + ' · ' + u.plat_nomor]; }); },
    segarBoot: function () { return RP.boot(true); }
  };
  W.RFUI = UI;
  function namaU(u) { return u ? u.merek + ' ' + u.tipe : '-'; }
  function fotoU(u, w) { return u && u.url_foto_utama ? '<img src="' + esc(u.url_foto_utama.replace(/sz=w\d+/, 'sz=w' + (w || 200))) + '" alt="" loading="lazy">' : R.ilustrasi(u ? u.kategori : 'Mobil'); }

  /* ================= ARMADA ================= */
  const AR = { kat: 'Semua', st: '', tr: '', q: '', katalog: false, hal: 1 };
  function renderArmada(el, arg) {
    const units = (RP.P.boot && RP.P.boot.units) || [], oa = RP.role() !== 'CREW', owner = RP.role() === 'OWNER';
    const st = {}; units.forEach(function (u) { st[u.status] = (st[u.status] || 0) + 1; });
    let rows = units.filter(function (u) {
      if (AR.kat !== 'Semua' && u.kategori !== AR.kat) return false; if (AR.st && u.status !== AR.st) return false; if (AR.tr && u.transmisi !== AR.tr) return false;
      if (AR.katalog && u.tampil_di_katalog !== 'Y') return false;
      if (AR.q && [u.id_unit, u.merek, u.tipe, u.plat_nomor, u.no_rangka, u.kelas].join(' ').toLowerCase().indexOf(AR.q.toLowerCase()) === -1) return false; return true;
    });
    const tarifH = {}; ((RP.P.boot && RP.P.boot.tarif) || []).forEach(function (t) { if (t.jenis === 'harian' && t.opsi_driver !== 'Y' && t.aktif !== 'N') tarifH[t.id_unit_atau_kategori] = t.harga; });
    const cols = [
      { l: 'Unit kendaraan & tipe', full: true, f: function (u) { return '<div class="row" style="flex-wrap:nowrap"><div class="thumb">' + fotoU(u) + '</div><div style="min-width:0"><div class="t1">' + esc(namaU(u)) + ' ' + (u.kelas ? '<span class="badge b-info">' + esc(u.kelas) + '</span>' : '') + '</div><div class="t2">' + esc(u.kategori) + ' · ' + esc(u.tahun) + ' · ' + esc(u.warna || '-') + (u.tampil_di_katalog === 'Y' ? ' · ' + ic('globe', 's') + ' katalog' : '') + '</div></div></div>'; } },
      { l: 'Plat & identitas', f: function (u) { return '<span class="plat">' + esc(u.plat_nomor) + '</span>' + (u.no_rangka ? '<div class="t2">' + esc(String(u.no_rangka).slice(0, 6)) + '…' + esc(String(u.no_rangka).slice(-3)) + '</div>' : ''); } },
      { l: 'Spesifikasi', f: function (u) { return '<div class="t1">' + (u.transmisi === 'MT' ? 'Manual' : 'Matic') + '</div><div class="t2">' + esc(u.kapasitas) + (u.kategori === 'Motor' ? ' orang' : ' kursi') + ' · ' + esc(u.bahan_bakar) + '</div>'; } },
      { l: 'Odometer & servis', f: function (u) { const s = (u.servis || [])[0]; return '<div class="t1 tnum">' + R.angka(u.odometer_terakhir) + ' km</div><div class="t2">' + (s ? '<span class="' + (s.lewat ? 'err' : '') + '" style="color:' + (s.lewat ? '' : '#B45309') + '">' + ic('wrench', 's') + esc(s.jenis) + (s.sisaHari !== null ? ' · ' + (s.sisaHari < 0 ? 'lewat' : s.sisaHari + ' hr') : '') + (s.sisaKm !== null ? ' · ' + R.angka(s.sisaKm) + ' km' : '') + '</span>' : '<span style="color:#15803D">' + ic('checkc', 's') + ' Servis aman</span>') + '</div>'; } },
      { l: 'Tarif sewa', f: function (u) { const h = tarifH[u.id_unit] || tarifH[u.kategori]; return h ? '<b class="blue tnum">' + R.rp(h) + '</b><div class="t2">per hari</div>' : '<span class="t2">' + (oa ? 'Belum diatur' : '-') + '</span>'; } },
      { l: 'Status', f: function (u) { return R.badge(u.status); } },
      { l: '', r: true, f: function (u) { return (u.status === 'Perlu Cek/Bersih' ? '<button class="btn btn-ok btn-sm" data-siap="' + esc(u.id_unit) + '" type="button">' + ic('check', 's') + 'Siap</button> ' : '') + (oa ? '<button class="btn btn-soft btn-sm" data-edit="' + esc(u.id_unit) + '" type="button">' + ic('edit', 's') + 'Ubah</button>' : ''); } }
    ];
    el.innerHTML = UI.kepala('Manajemen Armada <span class="badge b-info" style="vertical-align:middle">' + units.length + ' unit</span>', 'Kelola unit motor dan mobil, status operasional, kepatuhan servis, dan visibilitas katalog publik.',
      '<button class="btn btn-sec" id="arCsv" type="button">' + ic('download') + 'Ekspor CSV</button>' + (owner ? '<button class="btn btn-sec" id="arImpor" type="button">' + ic('upload') + 'Impor CSV</button>' : '') + (oa ? '<button class="btn btn-accent" id="arBaru" type="button">' + ic('plus') + 'Tambah Unit Baru</button>' : '')) +
      '<div class="kpis">' + UI.kpi('Total armada', units.length + ' <small>unit</small>', units.filter(function (u) { return u.kategori === 'Mobil'; }).length + ' mobil · ' + units.filter(function (u) { return u.kategori === 'Motor'; }).length + ' motor', '', 'car') +
      UI.kpi('Siap disewa', (st['Tersedia'] || 0) + ' <small>unit</small>', units.length ? Math.round((st['Tersedia'] || 0) / units.length * 100) + '% kapasitas siap' : '', 'ok', 'checkc') +
      UI.kpi('Sedang disewa', (st['Disewa'] || 0) + ' <small>unit</small>', 'Dalam perjalanan', 'info', 'key') +
      UI.kpi('Perlu cek / bersih', (st['Perlu Cek/Bersih'] || 0) + ' <small>unit</small>', 'Setelah pengembalian', 'warn', 'alert') +
      UI.kpi('Bengkel / nonaktif', ((st['Maintenance'] || 0) + (st['Nonaktif'] || 0)) + ' <small>unit</small>', (st['Maintenance'] || 0) + ' maintenance', 'bad', 'wrench') + '</div>' +
      '<div class="toolbar"><div class="seg" id="arKat">' + ['Semua', 'Mobil', 'Motor'].map(function (k) { return '<button type="button" data-k="' + k + '" class="' + (AR.kat === k ? 'on' : '') + '">' + k + ' (' + (k === 'Semua' ? units.length : units.filter(function (u) { return u.kategori === k; }).length) + ')</button>'; }).join('') + '</div>' +
      '<div class="search">' + ic('search') + '<input class="input" id="arQ" placeholder="Cari merek, tipe, plat" value="' + esc(AR.q) + '"></div>' +
      '<select class="input" id="arSt"><option value="">Semua status</option>' + ['Tersedia', 'Disewa', 'Perlu Cek/Bersih', 'Maintenance', 'Nonaktif'].map(function (s) { return '<option' + (AR.st === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
      '<select class="input" id="arTr"><option value="">Semua transmisi</option><option value="AT"' + (AR.tr === 'AT' ? ' selected' : '') + '>Matic</option><option value="MT"' + (AR.tr === 'MT' ? ' selected' : '') + '>Manual</option></select>' +
      '<label class="chk"><input type="checkbox" id="arKatalog"' + (AR.katalog ? ' checked' : '') + '> ' + ic('globe', 's') + ' Katalog publik saja</label></div><div id="arTbl"></div>';
    const tbl = $('#arTbl', el);
    const gambar = function () { tbl.innerHTML = UI.tabel(cols, rows, { hal: AR.hal, kosong: 'Tidak ada unit yang cocok.', ikon: 'car' }); R.hidrasiIkon(tbl); };
    gambar(); UI.ikat(tbl, function (h) { AR.hal = h; gambar(); });
    $('#arKat', el).onclick = function (e) { const b = e.target.closest('button'); if (b) { AR.kat = b.dataset.k; AR.hal = 1; renderArmada(el); } };
    $('#arQ', el).oninput = R.debounce(function () { AR.q = this.value; AR.hal = 1; renderArmada(el); const q = $('#arQ', el); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }, 300);
    $('#arSt', el).onchange = function () { AR.st = this.value; AR.hal = 1; renderArmada(el); };
    $('#arTr', el).onchange = function () { AR.tr = this.value; renderArmada(el); };
    $('#arKatalog', el).onchange = function () { AR.katalog = this.checked; renderArmada(el); };
    $('#arCsv', el).onclick = function () { R.csv('armada-' + R.isoTgl() + '.csv', units, ['id_unit', 'kategori', 'merek', 'tipe', 'plat_nomor', 'tahun', 'warna', 'transmisi', 'kapasitas', 'bahan_bakar', 'no_rangka', 'no_mesin', 'status', 'odometer_terakhir', 'tampil_di_katalog', 'kelas', 'deskripsi_singkat'].filter(function (k) { return oa || !/no_/.test(k); })); };
    if ($('#arBaru', el)) $('#arBaru', el).onclick = function () { formUnit(null); };
    if ($('#arImpor', el)) $('#arImpor', el).onclick = function () { imporCsv('Unit', 'kategori,merek,tipe,plat_nomor,tahun,warna,transmisi,kapasitas,bahan_bakar,no_rangka,no_mesin,deskripsi_singkat,kelas'); };
    tbl.addEventListener('click', function (e) {
      const ed = e.target.closest('[data-edit]'); if (ed) formUnit(RP.unit(ed.dataset.edit));
      const sp = e.target.closest('[data-siap]'); if (sp) R.sibuk(sp, async function () { const r = await R.api('unit.status', { id: sp.dataset.siap, status: 'Tersedia' }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { await UI.segarBoot(); renderArmada(el); } });
    });
    if (arg === 'baru' && oa) { formUnit(null); history.replaceState(null, '', '#/app/armada'); }
  }
  function formUnit(u) {
    const baru = !u;
    const fotoBox = baru ? '' : '<div class="field" style="grid-column:1/-1"><label>Foto katalog</label><div class="row"><div class="thumb" style="width:120px;height:80px" id="fuThumb">' + fotoU(u, 400) + '</div><label class="btn btn-sec">' + ic('camera') + 'Unggah foto<input type="file" accept="image/*" id="fuFoto" hidden multiple></label><span class="hint" id="fuInfo">Dikompres otomatis ±1 MB. Foto pertama = foto utama.</span></div></div>';
    UI.formModal({ judul: baru ? 'Tambah Unit Baru' : 'Ubah ' + namaU(u), lebar: true, nilai: u || { kategori: 'Mobil', transmisi: 'AT', status: 'Tersedia', tampil_di_katalog: 'Y', bahan_bakar: 'Bensin' },
      fields: [
        { n: 'kategori', l: 'Kategori', t: 'select', o: ['Mobil', 'Motor'], req: true }, { n: 'kelas', l: 'Kelas / label', ph: 'MPV, City Car, Maxi…' },
        { n: 'merek', l: 'Merek', req: true, ph: 'Toyota' }, { n: 'tipe', l: 'Tipe', req: true, ph: 'All New Avanza 1.3 G' },
        { n: 'plat_nomor', l: 'Plat nomor', req: true, ph: 'B 1234 ABC', hint: 'Harus unik.' }, { n: 'tahun', l: 'Tahun', t: 'number', req: true, min: 1990, max: new Date().getFullYear() + 1 },
        { n: 'warna', l: 'Warna' }, { n: 'transmisi', l: 'Transmisi', t: 'select', o: [['AT', 'Matic (AT)'], ['MT', 'Manual (MT)']] },
        { n: 'kapasitas', l: 'Kapasitas (kursi/orang)', t: 'number', min: 1 }, { n: 'bahan_bakar', l: 'Bahan bakar', t: 'select', o: ['Bensin', 'Solar', 'Listrik', 'Hybrid'] },
        { n: 'no_rangka', l: 'Nomor rangka', req: true }, { n: 'no_mesin', l: 'Nomor mesin' },
        { n: 'odometer_terakhir', l: 'Odometer (km)', t: 'number', min: 0 }, { n: 'status', l: 'Status', t: 'select', o: ['Tersedia', 'Disewa', 'Perlu Cek/Bersih', 'Maintenance', 'Nonaktif'] },
        { n: 'deskripsi_singkat', l: 'Deskripsi singkat (tampil di katalog)', t: 'textarea', full: true, rows: 2 },
        { n: 'urutan', l: 'Urutan tampil', t: 'number' }, { html: '<div class="field"><label>Visibilitas</label><label class="chk"><input type="checkbox" name="tampil_di_katalog"' + (!u || u.tampil_di_katalog === 'Y' ? ' checked' : '') + '> Tampilkan di katalog publik</label><label class="chk"><input type="checkbox" name="unggulan"' + (u && u.unggulan === 'Y' ? ' checked' : '') + '> Unit unggulan (hero/atas)</label></div>' },
        { html: fotoBox }
      ],
      kakiKiri: !baru && RP.role() === 'OWNER' ? '<button class="btn btn-danger" id="fuHapus" type="button" style="margin-right:auto">' + ic('trash') + 'Hapus</button>' : '',
      simpan: function (v) { v.tampil_di_katalog = v.tampil_di_katalog ? 'Y' : 'N'; v.unggulan = v.unggulan ? 'Y' : 'N'; if (u) v.id_unit = u.id_unit; return R.api('unit.simpan', v); },
      setelah: function () { UI.segarBoot().then(function () { if (RP.P.aktif === 'armada') renderArmada($('#page')); }); },
      buka: function (m) {
        const inp = m.$('#fuFoto');
        if (inp) inp.onchange = async function () {
          const files = Array.prototype.slice.call(this.files || []);
          for (let i = 0; i < files.length; i++) {
            m.$('#fuInfo').textContent = 'Mengunggah ' + (i + 1) + '/' + files.length + '…';
            try { const k = await R.kompresFoto(files[i], 1400); m.$('#fuThumb').innerHTML = '<img src="' + k.url + '" alt="">'; const r = await R.api('unit.foto', { id: u.id_unit, b64: k.b64, mime: k.mime, utama: i === 0 }); if (!r.success) throw new Error(r.message); }
            catch (e) { R.toast(e.message, 'err'); }
          }
          m.$('#fuInfo').textContent = 'Foto tersimpan ✓'; UI.segarBoot();
        };
        const h = m.$('#fuHapus');
        if (h) h.onclick = async function () { if (!(await R.konfirmasi('Hapus unit ' + namaU(u) + '? Unit yang punya riwayat sewa akan dinonaktifkan saja.', { bahaya: true, ya: 'Hapus' }))) return; const r = await R.api('unit.hapus', { id: u.id_unit }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { m.tutup(); await UI.segarBoot(); renderArmada($('#page')); } };
      }
    });
  }
  function imporCsv(sheet, kolom) {
    const m = R.modal({ judul: 'Impor CSV ' + sheet, isi: '<p class="small">Kolom: <code>' + esc(kolom) + '</code>. Baris pertama = nama kolom. Kolom ID boleh kosong (dibuat otomatis).</p>' +
      '<div class="row"><button class="btn btn-sec btn-sm" id="tplCsv" type="button">' + ic('download', 's') + 'Unduh template</button><label class="btn btn-soft btn-sm">' + ic('upload', 's') + 'Pilih berkas CSV<input type="file" accept=".csv,text/csv" id="fCsv" hidden></label></div><div id="csvHasil" class="small"></div>',
      kaki: '<button class="btn btn-sec" data-tutup>Tutup</button><button class="btn btn-primary" id="csvJalan" disabled>Impor sekarang</button>' });
    let rows = [];
    m.$('#tplCsv').onclick = function () { R.unduh('template-' + sheet.toLowerCase() + '.csv', '﻿' + kolom + '\n'); };
    m.$('#fCsv').onchange = function () { const fr = new FileReader(); fr.onload = async function () { rows = R.bacaCsv(String(fr.result)); const r = await R.api('migrasi.pindai', { csv: { sheet: sheet, rows: rows } }); m.$('#csvHasil').innerHTML = r.success ? 'Pindai: ' + rows.length + ' baris → <b>' + r.data.report[sheet].inserted + ' baru</b>, ' + r.data.report[sheet].updated + ' diperbarui, ' + r.data.report[sheet].skipped + ' dilewati.' : '<span class="err">' + esc(r.message) + '</span>'; m.$('#csvJalan').disabled = !r.success; }; fr.readAsText(this.files[0]); };
    m.$('#csvJalan').onclick = function () { R.sibuk(this, async function () { const r = await R.api('migrasi.jalankan', { csv: { sheet: sheet, rows: rows } }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { m.tutup(); await UI.segarBoot(); RP.rute(location.hash); } }); };
  }
  UI.imporCsv = imporCsv;
  RP.daftar('armada', { render: renderArmada });

  /* ================= TARIF & PAKET ================= */
  function renderTarif(el) {
    el.innerHTML = UI.kepala('Tarif &amp; Paket', 'Atur banyak tarif per unit atau kategori (jam, harian, mingguan, bulanan), denda keterlambatan, dan paket yang tampil di landing page.',
      '<button class="btn btn-sec" id="tfPaket" type="button">' + ic('plus') + 'Paket</button><button class="btn btn-accent" id="tfBaru" type="button">' + ic('plus') + 'Tarif Baru</button>') +
      '<div class="tabs" id="tfTab"><button class="on" data-t="tarif" type="button">Tarif sewa</button><button data-t="paket" type="button">Paket landing page</button></div><div id="tfIsi"><div class="skel" style="height:240px"></div></div>';
    let tab = 'tarif', data = null;
    const gambar = function () {
      const isi = $('#tfIsi', el); if (!data) return;
      if (tab === 'tarif') {
        const U = {}; ((RP.P.boot && RP.P.boot.units) || []).forEach(function (u) { U[u.id_unit] = u; });
        const rows = data.tarif.slice().sort(function (a, b) { return String(a.id_unit_atau_kategori).localeCompare(String(b.id_unit_atau_kategori)) || ['jam', 'harian', 'mingguan', 'bulanan', 'paket'].indexOf(a.jenis) - ['jam', 'harian', 'mingguan', 'bulanan', 'paket'].indexOf(b.jenis); });
        isi.innerHTML = '<p class="small muted">Tarif khusus unit menimpa tarif kategori. Denda = ⌈jam telat setelah toleransi⌉ × denda per jam. Sistem memilih kombinasi termurah otomatis.</p>' +
          UI.tabel([{ l: 'Berlaku untuk', full: true, f: function (t) { const u = U[t.id_unit_atau_kategori]; return '<div class="t1">' + (u ? esc(namaU(u)) + ' <span class="plat">' + esc(u.plat_nomor) + '</span>' : '<span class="badge b-info">Semua ' + esc(t.id_unit_atau_kategori) + '</span>') + '</div><div class="t2">' + esc(t.nama || '') + '</div>'; } },
            { l: 'Jenis', f: function (t) { return esc(t.jenis) + (t.opsi_driver === 'Y' ? ' <span class="badge b-purple">+ driver</span>' : ''); } },
            { l: 'Harga', r: true, f: function (t) { return '<b class="blue tnum">' + R.rp(t.harga) + '</b>'; } },
            { l: 'Denda / toleransi', r: true, f: function (t) { return R.rp(t.denda_per_jam) + '/jam · ' + esc(t.toleransi_menit) + ' mnt'; } },
            { l: 'Deposit', r: true, f: function (t) { return R.rp(t.deposit_default); } },
            { l: 'Min / km', r: true, f: function (t) { return (t.min_durasi ? t.min_durasi + '× · ' : '') + (t.km_include ? t.km_include + ' km' : '∞'); } },
            { l: 'Aktif', c: true, f: function (t) { return t.aktif === 'N' ? R.badge('Nonaktif') : R.badge('Tersedia').replace('Tersedia', 'Aktif'); } },
            { l: '', r: true, f: function (t) { return '<button class="btn btn-soft btn-sm" data-tarif="' + esc(t.id_tarif) + '" type="button">Ubah</button>'; } }], rows, { per: 50, kosong: 'Belum ada tarif.' });
      } else {
        isi.innerHTML = '<div class="paket-grid" style="max-width:none">' + data.paket.map(function (p) { return '<div class="pcard ' + (p.label_populer === 'Y' ? 'pop' : '') + '">' + (p.label_populer === 'Y' ? '<span class="pita">Paling Populer</span>' : '') + '<h3>' + esc(p.nama) + ' ' + (p.aktif === 'N' ? R.badge('Nonaktif') : '') + '</h3><p class="small muted">' + esc(p.deskripsi) + '</p><div class="h">' + R.rpK(p.harga_mulai) + ' <small>/24 jam</small></div><ul>' + String(p.fitur || '').split('\n').filter(Boolean).map(function (f) { return '<li>' + ic('checkc', 's') + esc(f) + '</li>'; }).join('') + '</ul><p class="xs muted">Tambahan ' + R.rp(p.biaya_tambahan_harian) + '/hari</p><button class="btn btn-sec" data-paket="' + esc(p.id_paket) + '" type="button">Ubah paket</button></div>'; }).join('') + '</div>';
      }
      R.hidrasiIkon(isi);
    };
    R.muat('tarif', 'tarif.list', {}, { umur: 60, render: function (d) { if (d) { data = d; gambar(); } } });
    $('#tfTab', el).onclick = function (e) { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; $$('#tfTab button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); gambar(); };
    const segar = function () { R.Mem.basi(); R.muat('tarif', 'tarif.list', {}, { paksa: true, render: function (d) { if (d) { data = d; gambar(); } } }); UI.segarBoot(); };
    $('#tfBaru', el).onclick = function () { formTarif(null, segar); };
    $('#tfPaket', el).onclick = function () { formPaket(null, segar); };
    el.addEventListener('click', function (e) {
      const t = e.target.closest('[data-tarif]'); if (t && data) formTarif(data.tarif.filter(function (x) { return x.id_tarif === t.dataset.tarif; })[0], segar);
      const p = e.target.closest('[data-paket]'); if (p && data) formPaket(data.paket.filter(function (x) { return x.id_paket === p.dataset.paket; })[0], segar);
    });
  }
  function formTarif(t, segar) {
    const target = [['Mobil', 'Semua Mobil (kategori)'], ['Motor', 'Semua Motor (kategori)']].concat(UI.opsiUnit());
    UI.formModal({ judul: t ? 'Ubah Tarif ' + t.id_tarif : 'Tarif Baru', nilai: t || { jenis: 'harian', opsi_driver: 'N', toleransi_menit: 60, aktif: 'Y' },
      fields: [{ n: 'id_unit_atau_kategori', l: 'Berlaku untuk', t: 'select', o: target, req: true, full: true }, { n: 'jenis', l: 'Jenis tarif', t: 'select', o: ['jam', 'harian', 'mingguan', 'bulanan', 'paket'] },
        { n: 'harga', l: 'Harga (Rp)', t: 'number', req: true, min: 1 }, { n: 'denda_per_jam', l: 'Denda per jam (Rp)', t: 'number', min: 0 }, { n: 'toleransi_menit', l: 'Toleransi telat (menit)', t: 'number', min: 0 },
        { n: 'deposit_default', l: 'Deposit bawaan (Rp)', t: 'number', min: 0 }, { n: 'km_include', l: 'Batas km/hari (0 = tanpa batas)', t: 'number', min: 0 },
        { n: 'min_durasi', l: 'Durasi minimum (satuan jenis)', t: 'number', min: 0, hint: 'Mis. 6 untuk tarif jam = minimal 6 jam.' }, { n: 'nama', l: 'Label', ph: 'Mobil harian lepas kunci' },
        { n: 'opsi_driver', l: 'Opsi driver', t: 'select', o: [['N', 'Tanpa driver (lepas kunci)'], ['Y', 'Dengan driver']] }, { n: 'aktif', l: 'Aktif', t: 'select', o: [['Y', 'Aktif'], ['N', 'Nonaktif']] }],
      kakiKiri: t ? '<button class="btn btn-danger" id="tHapus" type="button" style="margin-right:auto">' + ic('trash') + 'Hapus</button>' : '',
      simpan: function (v) { if (t) v.id_tarif = t.id_tarif; return R.api('tarif.simpan', v); }, setelah: segar,
      buka: function (m) { const h = m.$('#tHapus'); if (h) h.onclick = async function () { if (!(await R.konfirmasi('Hapus tarif ini?', { bahaya: true }))) return; const r = await R.api('tarif.hapus', { id: t.id_tarif }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { m.tutup(); segar(); } }; } });
  }
  function formPaket(p, segar) {
    UI.formModal({ judul: p ? 'Ubah Paket ' + p.nama : 'Paket Baru', nilai: p || { label_populer: 'N', aktif: 'Y', biaya_tambahan_harian: 0 },
      fields: [{ n: 'nama', l: 'Nama paket', req: true, ph: 'Standard' }, { n: 'harga_mulai', l: 'Harga mulai (tampilan)', t: 'number', min: 0 }, { n: 'deskripsi', l: 'Deskripsi', t: 'textarea', full: true, rows: 2 },
        { n: 'fitur', l: 'Fitur (satu per baris)', t: 'textarea', full: true, rows: 4 }, { n: 'biaya_tambahan_harian', l: 'Biaya tambahan per hari (Rp)', t: 'number', min: 0, hint: 'Ditambahkan ke estimasi saat penyewa memilih paket ini.' },
        { n: 'urutan', l: 'Urutan', t: 'number' }, { n: 'label_populer', l: 'Label "Paling Populer"', t: 'select', o: [['N', 'Tidak'], ['Y', 'Ya']] }, { n: 'aktif', l: 'Tampil', t: 'select', o: [['Y', 'Tampil'], ['N', 'Sembunyikan']] }],
      kakiKiri: p ? '<button class="btn btn-danger" id="pHapus" type="button" style="margin-right:auto">' + ic('trash') + 'Hapus</button>' : '',
      simpan: function (v) { if (p) v.id_paket = p.id_paket; return R.api('paket.simpan', v); }, setelah: segar,
      buka: function (m) { const h = m.$('#pHapus'); if (h) h.onclick = async function () { if (!(await R.konfirmasi('Hapus paket ini?', { bahaya: true }))) return; const r = await R.api('paket.hapus', { id: p.id_paket }); if (r.success) { m.tutup(); segar(); } R.toast(r.message, r.success ? 'ok' : 'err'); }; } });
  }
  RP.daftar('tarif', { render: renderTarif });

  /* ================= KALENDER ================= */
  const KL = { dari: null, kat: 'Semua', q: '' };
  function senin(t) { const x = R.wib(t); return R.ms(R.isoTgl(t)) - ((x.w + 6) % 7) * 86400e3; }
  function renderKalender(el) {
    if (!KL.dari) KL.dari = senin(Date.now());
    const dari = KL.dari, sampai = dari + 7 * 86400e3, kunci = 'kalender_' + R.isoTgl(dari);
    const x0 = R.wib(dari), x1 = R.wib(sampai - 1);
    el.innerHTML = UI.kepala('Kalender Ketersediaan Armada', 'Timeline sewa mingguan per unit. Klik slot kosong untuk booking baru, klik balok untuk detail. Tumpang tindih dicegah otomatis oleh server.',
      '<button class="btn btn-sec" id="klCsv" type="button">' + ic('download') + 'Ekspor Jadwal</button><button class="btn btn-accent" id="klBaru" type="button">' + ic('plus') + 'Booking Baru</button>') +
      '<div class="toolbar"><div class="row"><button class="btn btn-sec btn-ico btn-sm" id="klPrev" type="button" aria-label="Minggu sebelumnya">' + ic('left') + '</button><button class="btn btn-sec btn-sm" id="klNow" type="button">Hari ini</button><button class="btn btn-sec btn-ico btn-sm" id="klNext" type="button" aria-label="Minggu berikutnya">' + ic('right') + '</button></div>' +
      '<b>' + ic('calendar', 's blue') + ' ' + x0.d + ' ' + R.BLN[x0.m] + ' – ' + x1.d + ' ' + R.BLN[x1.m] + ' ' + x1.y + '</b>' +
      '<div class="seg" id="klKat" style="margin-left:auto">' + ['Semua', 'Mobil', 'Motor'].map(function (k) { return '<button type="button" data-k="' + k + '" class="' + (KL.kat === k ? 'on' : '') + '">' + k + '</button>'; }).join('') + '</div>' +
      '<div class="search" style="flex:0 1 220px">' + ic('search') + '<input class="input" id="klQ" placeholder="Plat / model" value="' + esc(KL.q) + '"></div></div><div id="klKpi" class="kpis"></div><div id="klGrid"><div class="skel" style="height:420px"></div></div>';
    const gambar = function (d) {
      if (!d) return;
      const units = d.units.filter(function (u) { return (KL.kat === 'Semua' || u.kategori === KL.kat) && (!KL.q || (u.unit + ' ' + u.plat).toLowerCase().indexOf(KL.q.toLowerCase()) > -1); });
      const jalanMinggu = d.booking.filter(function (b) { return b.status !== 'Selesai'; }).length;
      const jamTerpakai = d.booking.reduce(function (a, b) { return a + Math.max(0, Math.min(b.z, sampai) - Math.max(b.a, dari)); }, 0);
      const util = d.units.length ? Math.round(jamTerpakai / (d.units.length * 7 * 86400e3) * 1000) / 10 : 0;
      const hold = d.booking.filter(function (b) { return b.status === 'Menunggu Konfirmasi'; }).length;
      $('#klKpi', el).innerHTML = UI.kpi('Total armada', d.units.length + ' <small>unit</small>', '', '', 'car') + UI.kpi('Booking minggu ini', jalanMinggu, 'aktif & terjadwal', 'info', 'key') +
        UI.kpi('Tingkat utilisasi', util + '%', 'jam tersewa / kapasitas', '', 'chart') + UI.kpi('Validasi overlap', '0 <small>konflik</small>', 'Dijaga LockService', 'ok', 'shield') + UI.kpi('Hold landing page', hold + ' <small>unit</small>', 'Batas ' + esc(RP.situs('HOLD_JAM', 24)) + ' jam', hold ? 'warn' : '', 'hourglass', 'booking/permintaan');
      const hari = []; for (let i = 0; i < 7; i++) hari.push(dari + i * 86400e3);
      const today = R.isoTgl();
      const kls = function (b) { if (b.telat) return 'telat'; return { 'Sedang Berjalan': 'jalan', 'Terkonfirmasi': 'konf', 'Menunggu DP': 'dp', 'Menunggu Konfirmasi': 'hold', 'Selesai': 'selesai', 'Draft': 'draft' }[b.status] || 'konf'; };
      let h = '<div class="kal"><div class="kal-leg"><span><i style="background:#16A34A"></i>Sedang berjalan</span><span><i style="background:#1D4ED8"></i>Terkonfirmasi</span><span><i style="background:#EAB308"></i>Menunggu DP</span><span><i style="background:#FACC15"></i>Hold landing page</span><span><i style="background:#DC2626"></i>Telat / servis</span><span><i style="background:#CBD5E1"></i>Selesai</span><span>' + ic('shield', 's') + ' Server menolak jadwal yang tumpang tindih</span></div>' +
        '<div class="kal-scroll"><div class="kal-grid"><div class="kal-h" style="text-align:left;position:sticky;left:0;z-index:3">Unit armada</div>' +
        hari.map(function (t) { const x = R.wib(t); return '<div class="kal-h ' + (R.isoTgl(t) === today ? 'today' : '') + '">' + (R.isoTgl(t) === today ? 'Hari ini' : R.HARI[x.w]) + '<b>' + x.d + ' ' + R.BLN[x.m] + '</b></div>'; }).join('');
      if (!units.length) h += '<div style="grid-column:1/-1" class="empty">Tidak ada unit.</div>';
      units.forEach(function (u) {
        h += '<div class="kal-u"><div class="thumb" style="width:44px;height:44px;border-radius:50%">' + (u.foto ? '<img src="' + esc(u.foto.replace(/sz=w\d+/, 'sz=w120')) + '" alt="">' : R.ilustrasi(u.kategori)) + '</div><div style="min-width:0"><b class="ellipsis">' + esc(u.unit) + '</b><small><span class="plat">' + esc(u.plat) + '</span> ' + (u.status !== 'Tersedia' ? R.badge(u.status) : '') + '</small></div></div>';
        h += '<div class="kal-row">' + hari.map(function (t) { return '<div class="sl ' + (R.isoTgl(t) === today ? 'today' : '') + '" data-slot="' + esc(u.id_unit) + '|' + R.isoTgl(t) + '" title="Klik untuk booking ' + esc(u.unit) + '"></div>'; }).join('');
        d.booking.filter(function (b) { return b.id_unit === u.id_unit; }).forEach(function (b) {
          const a = Math.max(b.a, dari), z = Math.min(b.z, sampai); if (z <= a) return;
          const L = (a - dari) / (7 * 86400e3) * 100, Wd = (z - a) / (7 * 86400e3) * 100;
          h += '<div class="kal-bar ' + kls(b) + '" style="left:calc(' + L + '% + 2px);width:calc(' + Wd + '% - 4px)" data-bk="' + esc(b.id) + '" title="' + esc(b.id + ' · ' + b.penyewa + ' · ' + R.tglPendek(b.mulai) + ' – ' + R.tglPendek(b.selesai) + ' · ' + b.status) + '">' + (b.status === 'Menunggu Konfirmasi' ? ic('hourglass', 's') : b.sumber === 'Landing' ? ic('globe', 's') : '') + '<b>' + esc(b.id) + '</b> ' + esc(b.penyewa) + (b.telat ? ' · TELAT' : '') + '</div>';
        });
        (d.servis || []).filter(function (s) { return s.id_unit === u.id_unit; }).forEach(function () { h += '<div class="kal-bar servis" style="left:2px;width:calc(100% - 4px);top:auto;bottom:4px;height:18px;font-size:10.5px">' + ic('wrench', 's') + ' Sedang servis</div>'; });
        h += '</div>';
      });
      h += '</div></div></div>';
      $('#klGrid', el).innerHTML = h; R.hidrasiIkon($('#klGrid', el));
      KL.data = d;
    };
    R.muat(kunci, 'kalender.data', { dari: R.isoTgl(dari), sampai: R.isoTgl(sampai) }, { umur: 30, render: gambar });
    const ganti = function (t) { KL.dari = t; renderKalender(el); R.hidrasiIkon(el); };
    $('#klPrev', el).onclick = function () { ganti(dari - 7 * 86400e3); };
    $('#klNext', el).onclick = function () { ganti(dari + 7 * 86400e3); };
    $('#klNow', el).onclick = function () { ganti(senin(Date.now())); };
    $('#klKat', el).onclick = function (e) { const b = e.target.closest('button'); if (b) { KL.kat = b.dataset.k; renderKalender(el); R.hidrasiIkon(el); } };
    $('#klQ', el).oninput = R.debounce(function () { KL.q = this.value; gambar(KL.data); }, 300);
    $('#klBaru', el).onclick = function () { formBooking(null, {}); };
    $('#klCsv', el).onclick = function () { if (KL.data) R.csv('jadwal-' + R.isoTgl(dari) + '.csv', KL.data.booking.map(function (b) { const u = KL.data.units.filter(function (x) { return x.id_unit === b.id_unit; })[0] || {}; return { kode: b.id, unit: u.unit, plat: u.plat, penyewa: b.penyewa, mulai: b.mulai, selesai: b.selesai, status: b.status }; })); };
    $('#klGrid', el).onclick = function (e) {
      const b = e.target.closest('[data-bk]'); if (b) { location.hash = '#/app/booking/' + b.dataset.bk; return; }
      const s = e.target.closest('[data-slot]'); if (s) { const p = s.dataset.slot.split('|'); formBooking(null, { id_unit: p[0], mulai: p[1] + ' 09:00', selesai: R.isoTgl(R.ms(p[1]) + 86400e3) + ' 09:00' }); }
    };
  }
  RP.daftar('kalender', { render: renderKalender });

  /* ================= BOOKING ================= */
  const BKS = { tab: 'Semua', q: '', hal: 1 };
  const TAB_BK = [['Semua', ''], ['Permintaan Landing', 'Menunggu Konfirmasi'], ['Draft', 'Draft'], ['Menunggu DP', 'Menunggu DP'], ['Terkonfirmasi', 'Terkonfirmasi'], ['Berjalan', 'Sedang Berjalan'], ['Selesai', 'Selesai'], ['Dibatalkan', 'Dibatalkan']];
  function renderBooking(el, arg) {
    if (arg && /^RF-/i.test(arg)) return renderDetail(el, arg.toUpperCase());
    if (arg === 'permintaan') { BKS.tab = 'Permintaan Landing'; history.replaceState(null, '', '#/app/booking'); }
    if (arg === 'cari') { BKS.q = RP.P.cari || ''; BKS.tab = 'Semua'; history.replaceState(null, '', '#/app/booking'); }
    if (arg === 'baru') { history.replaceState(null, '', '#/app/booking'); setTimeout(function () { formBooking(null, {}); }, 0); }
    el.innerHTML = UI.kepala('Booking', 'Kelola reservasi dari admin & landing page. Validasi tumpang tindih jadwal dijalankan server di dalam LockService.',
      '<button class="btn btn-sec" id="bkCsv" type="button">' + ic('download') + 'Ekspor CSV</button><button class="btn btn-accent" id="bkBaru" type="button">' + ic('plus') + 'Booking Baru</button>') +
      '<div class="toolbar"><div class="pill-tabs" id="bkTab"></div><div class="search" style="flex:1 1 240px">' + ic('search') + '<input class="input" id="bkQ" placeholder="Kode, unit, plat, nama, WA" value="' + esc(BKS.q) + '"></div></div><div id="bkIsi"><div class="skel" style="height:300px"></div></div>';
    let data = null;
    const gambar = function () {
      if (!data) return;
      const st = (TAB_BK.filter(function (t) { return t[0] === BKS.tab; })[0] || TAB_BK[0])[1];
      const q = BKS.q.toLowerCase();
      $('#bkTab', el).innerHTML = TAB_BK.map(function (t) { const n = t[1] ? data.rows.filter(function (r) { return r.status === t[1]; }).length : data.rows.length; return '<button type="button" class="chip ' + (BKS.tab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '">' + t[0] + ' <b>' + n + '</b></button>'; }).join('');
      const rows = data.rows.filter(function (r) { return (!st || r.status === st) && (!q || [r.id_booking, r.unit, r.plat, r.penyewa, r.no_wa].join(' ').toLowerCase().indexOf(q) > -1); });
      const isi = $('#bkIsi', el);
      if (BKS.tab === 'Permintaan Landing') {
        isi.innerHTML = rows.length ? '<div class="stack">' + rows.map(kartuPermintaan).join('') + '</div>' : '<div class="tbl-wrap"><div class="empty">' + ic('checkc') + '<p>Tidak ada permintaan yang menunggu. Mantap!</p></div></div>';
      } else {
        isi.innerHTML = UI.tabel([
          { l: 'Kode & penyewa', full: true, f: function (r) { return '<div class="t1 blue">#' + esc(r.id_booking) + ' ' + (r.sumber === 'Landing' ? '<span class="badge b-purple">' + ic('globe', 's') + 'Landing</span>' : '') + '</div><div class="t2">' + esc(r.penyewa) + (r.blacklist ? ' <span class="badge b-bad">Blacklist</span>' : '') + '</div>'; } },
          { l: 'Unit', f: function (r) { return '<div class="t1">' + esc(r.unit) + '</div><div class="t2"><span class="plat">' + esc(r.plat) + '</span></div>'; } },
          { l: 'Jadwal', f: function (r) { return '<div class="t1">' + R.tglPendek(r.mulai) + '</div><div class="t2">s/d ' + R.tglPendek(r.selesai) + ' · ' + R.durasi(r.mulai, r.selesai) + '</div>'; } },
          { l: 'Tagihan', r: true, f: function (r) { return '<div class="t1 tnum">' + R.rp(r.tagihan) + '</div><div class="t2">' + (r.lunas ? '<span style="color:#15803D">Lunas</span>' : 'Sisa ' + R.rp(r.sisa)) + '</div>'; } },
          { l: 'Status', f: function (r) { return R.badge(r.telat ? 'Telat' : r.status); } }
        ], rows, { hal: BKS.hal, go: function (r) { return '#/app/booking/' + r.id_booking; }, kosong: 'Tidak ada booking untuk filter ini.', ikon: 'clip' });
      }
      R.hidrasiIkon(isi);
    };
    R.muat('booking', 'booking.list', {}, { umur: 20, render: function (d) { if (d) { data = d; gambar(); } } });
    $('#bkTab', el).onclick = function (e) { const b = e.target.closest('[data-tab]'); if (b) { BKS.tab = b.dataset.tab; BKS.hal = 1; gambar(); } };
    $('#bkQ', el).oninput = R.debounce(function () { BKS.q = this.value; BKS.hal = 1; gambar(); }, 250);
    $('#bkBaru', el).onclick = function () { formBooking(null, {}); };
    $('#bkCsv', el).onclick = function () { if (data) R.csv('booking-' + R.isoTgl() + '.csv', data.rows, ['id_booking', 'sumber', 'status', 'unit', 'plat', 'penyewa', 'no_wa', 'mulai', 'selesai', 'total_harga', 'denda', 'tagihan', 'terbayar', 'sisa', 'deposit_ditahan']); };
    UI.ikat($('#bkIsi', el), function (h) { BKS.hal = h; gambar(); });
    $('#bkIsi', el).addEventListener('click', function (e) {
      const k = e.target.closest('[data-konf]'); if (k) konfirmasiLanding(data.rows.filter(function (r) { return r.id_booking === k.dataset.konf; })[0]);
      const t = e.target.closest('[data-tolak]'); if (t) tolakLanding(t.dataset.tolak);
    });
  }
  function kartuPermintaan(r) {
    const sisa = R.ms(r.hold_sampai) - Date.now(), jam = Math.max(0, Math.floor(sisa / 3600e3)), mnt = Math.max(0, Math.floor(sisa % 3600e3 / 60000));
    const pesan = 'Halo ' + r.penyewa + ', terima kasih sudah memesan ' + r.unit + ' (' + R.tglPendek(r.mulai) + ' – ' + R.tglPendek(r.selesai) + ') dengan kode ' + r.id_booking + '. Estimasi biaya ' + R.rp(r.total_harga) + '. Boleh kami konfirmasi detailnya?';
    return '<div class="sec-card" style="gap:10px"><div class="row"><b class="blue">#' + esc(r.id_booking) + '</b><span class="badge b-warn">' + ic('hourglass', 's') + 'Hold sisa ' + jam + ' j ' + mnt + ' m</span>' + (r.blacklist ? '<span class="badge b-bad">Penyewa blacklist</span>' : '') + '<span class="small muted" style="margin-left:auto">Masuk ' + R.relatif(r.dibuat_pada) + '</span></div>' +
      '<div class="info-chips"><div class="ichip"><small>Unit</small><b>' + esc(r.unit) + '</b><span class="plat">' + esc(r.plat) + '</span></div><div class="ichip"><small>Jadwal</small><b>' + R.tglPendek(r.mulai) + '</b><span class="small muted">s/d ' + R.tglPendek(r.selesai) + '</span></div>' +
      '<div class="ichip"><small>Penyewa</small><b>' + esc(r.penyewa) + '</b><span class="small muted">' + esc(r.no_wa) + '</span></div><div class="ichip"><small>Estimasi</small><b class="blue">' + R.rp(r.total_harga) + '</b><span class="small muted">' + esc(r.lokasi_antar || 'Ambil di pool') + '</span></div></div>' +
      (r.catatan ? '<p class="small"><b>Catatan:</b> ' + esc(r.catatan) + '</p>' : '') +
      '<div class="row"><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + R.waLink(r.no_wa, pesan) + '">' + ic('chat', 's') + 'Hubungi via WA</a><a class="btn btn-sec btn-sm" href="#/app/booking/' + esc(r.id_booking) + '">Detail</a>' +
      '<span class="grow"></span><button class="btn btn-danger btn-sm" data-tolak="' + esc(r.id_booking) + '" type="button">' + ic('x', 's') + 'Tolak</button><button class="btn btn-primary btn-sm" data-konf="' + esc(r.id_booking) + '" type="button">' + ic('check', 's') + 'Konfirmasi / Ubah Jadwal</button></div></div>';
  }
  function konfirmasiLanding(r) {
    if (!r) return;
    UI.formModal({ judul: 'Konfirmasi ' + r.id_booking, tombol: 'Konfirmasi', nilai: { id_unit: r.id_unit, mulai: r.mulai, selesai: r.selesai, biaya_antar_jemput: 0, diskon: 0, deposit: r.deposit, status: 'Menunggu DP', catatan: r.catatan },
      atas: '<p class="small muted">Ubah unit/jadwal bila perlu. Server memeriksa ulang tumpang tindih sebelum menyimpan.</p>',
      fields: [{ n: 'id_unit', l: 'Unit', t: 'select', o: UI.opsiUnit(), full: true }, { n: 'mulai', l: 'Ambil', t: 'datetime', req: true }, { n: 'selesai', l: 'Kembali', t: 'datetime', req: true },
        { n: 'biaya_antar_jemput', l: 'Biaya antar-jemput (Rp)', t: 'number', min: 0 }, { n: 'diskon', l: 'Diskon (Rp)', t: 'number', min: 0 }, { n: 'deposit', l: 'Deposit (Rp)', t: 'number', min: 0 },
        { n: 'status', l: 'Status setelah konfirmasi', t: 'select', o: [['Menunggu DP', 'Menunggu DP'], ['Terkonfirmasi', 'Terkonfirmasi (DP sudah/ tidak perlu)']] }, { n: 'catatan', l: 'Catatan', t: 'textarea', full: true, rows: 2 }],
      bawah: '<div id="kEst" class="card card-pad small"></div>',
      buka: function (m, f) { const est = R.debounce(async function () { const v = R.nilaiForm(f); const x = await R.api('booking.estimasi', { id_unit: v.id_unit, mulai: v.mulai.replace('T', ' '), selesai: v.selesai.replace('T', ' '), biaya_antar_jemput: v.biaya_antar_jemput, diskon: v.diskon, kecuali: r.id_booking }); const b = m.$('#kEst'); if (!b) return; b.innerHTML = x.success ? (x.data.bentrok ? '<span class="err">Bentrok dengan ' + esc(x.data.bentrok) + '</span>' : x.data.ok ? 'Total baru: <b class="blue">' + R.rp(x.data.total) + '</b> · ' + x.data.label.map(esc).join(' · ') : '<span class="err">' + esc(x.data.pesan) + '</span>') : esc(x.message); }, 350); f.addEventListener('input', est); est(); },
      simpan: function (v) { v.id = r.id_booking; v.mulai = v.mulai.replace('T', ' '); v.selesai = v.selesai.replace('T', ' '); return R.api('booking.konfirmasi', v); },
      setelah: function () { RP.segarkanDash(); RP.rute(location.hash); } });
  }
  async function tolakLanding(id) {
    const alasan = await R.konfirmasi('Tolak permintaan ' + id + '? Jadwal unit akan dilepas dan penyewa diberi tahu.', { bahaya: true, ya: 'Tolak', isi: '<div class="field" style="margin-top:10px"><label>Alasan (dikirim ke penyewa)</label><input class="input" id="alasanTolak" placeholder="Unit tidak tersedia, dll."></div>', ambil: function (m) { return m.$('#alasanTolak').value || 'Ditolak admin'; } });
    if (!alasan) return;
    const r = await R.api('booking.konfirmasi', { id: id, aksi: 'tolak', alasan: alasan });
    R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) { RP.segarkanDash(); RP.rute(location.hash); }
  }
  /** Form booking baru / ubah dengan estimasi & cek ketersediaan langsung. */
  function formBooking(b, pre) {
    const penyewa = (R.Mem.get('penyewa') && R.Mem.get('penyewa').data.rows) || [];
    if (!penyewa.length) R.muat('penyewa', 'penyewa.list', {}, { umur: 60, diam: true });
    const paket = ((RP.P.boot && RP.P.boot.paket) || []).filter(function (p) { return p.aktif !== 'N'; });
    const v0 = b || Object.assign({ status: 'Menunggu DP', dengan_driver: 'N' }, pre);
    UI.formModal({ judul: b ? 'Ubah Booking ' + b.id_booking : 'Booking Baru', lebar: true, nilai: v0, tombol: b ? 'Simpan Perubahan' : 'Buat Booking',
      fields: [
        { n: 'id_unit', l: 'Unit', t: 'select', o: [['', '— pilih unit —']].concat(UI.opsiUnit()), req: true, full: true },
        { n: 'mulai', l: 'Ambil', t: 'datetime', req: true }, { n: 'selesai', l: 'Kembali', t: 'datetime', req: true },
        { html: '<div class="field" style="grid-column:1/-1"><label>Penyewa *</label><input class="input" id="psCari" list="psList" placeholder="Ketik nama / nomor WA penyewa lama, atau isi data baru di bawah" value="' + esc(v0.penyewa_nama || '') + '"><datalist id="psList">' + penyewa.map(function (p) { return '<option value="' + esc(p.nama + ' · ' + p.no_wa + ' · ' + p.id_penyewa) + '">'; }).join('') + '</datalist><input type="hidden" name="id_penyewa" value="' + esc(v0.id_penyewa || '') + '"><span class="hint" id="psInfo"></span></div>' },
        { n: 'pb_nama', l: 'Nama penyewa baru' }, { n: 'pb_wa', l: 'WA penyewa baru', t: 'tel', ph: '0812…' },
        { n: 'paket', l: 'Paket', t: 'select', o: [['', 'Tanpa paket']].concat(paket.map(function (p) { return [p.id_paket, p.nama]; })) }, { n: 'dengan_driver', l: 'Driver', t: 'select', o: [['N', 'Lepas kunci'], ['Y', 'Dengan driver']] },
        { n: 'lokasi_antar', l: 'Lokasi ambil/antar' }, { n: 'lokasi_jemput', l: 'Lokasi kembali/jemput' },
        { n: 'biaya_antar_jemput', l: 'Biaya antar-jemput (Rp)', t: 'number', min: 0 }, { n: 'diskon', l: 'Diskon (Rp)', t: 'number', min: 0 },
        { n: 'deposit', l: 'Deposit (kosong = bawaan tarif)', t: 'number', min: 0 }, { n: 'jaminan_jenis', l: 'Jaminan', ph: 'E-KTP asli + motor' },
        b ? { html: '' } : { n: 'status', l: 'Status awal', t: 'select', o: [['Menunggu DP', 'Menunggu DP'], ['Terkonfirmasi', 'Terkonfirmasi'], ['Draft', 'Draft (tidak menahan jadwal)']] },
        { n: 'total_manual', l: 'Total manual (opsional)', t: 'number', min: 0, hint: 'Isi hanya bila harga disepakati berbeda.' },
        { n: 'catatan', l: 'Catatan', t: 'textarea', full: true, rows: 2 }
      ],
      bawah: '<div id="bEst" class="card card-pad"><span class="muted small">Pilih unit & jadwal untuk melihat estimasi.</span></div>',
      buka: function (m, f) {
        const cari = m.$('#psCari'), hid = f.querySelector('[name=id_penyewa]');
        cari.oninput = function () { const id = (this.value.match(/(PSW-\d+)$/) || [])[1]; hid.value = id || ''; m.$('#psInfo').textContent = id ? 'Penyewa lama dipilih ✓' : (this.value ? 'Tidak cocok dengan data lama — isi nama & WA penyewa baru.' : ''); };
        const est = R.debounce(async function () {
          const v = R.nilaiForm(f); const box = m.$('#bEst'); if (!v.id_unit || !v.mulai || !v.selesai) return;
          const x = await R.api('booking.estimasi', { id_unit: v.id_unit, mulai: v.mulai.replace('T', ' '), selesai: v.selesai.replace('T', ' '), dengan_driver: v.dengan_driver, paket: v.paket, biaya_antar_jemput: v.biaya_antar_jemput, diskon: v.diskon, kecuali: b ? b.id_booking : '' });
          if (!box.isConnected) return;
          if (!x.success) { box.innerHTML = '<span class="err">' + esc(x.message) + '</span>'; return; }
          const d = x.data;
          box.innerHTML = (d.bentrok ? '<span class="badge dot b-bad">Bentrok dengan ' + esc(d.bentrok) + '</span> ' : '<span class="badge dot b-ok">Jadwal kosong</span> ') +
            (d.ok ? '<div class="row between" style="margin-top:8px"><span class="small muted">' + d.label.map(esc).join(' · ') + '</span><b class="blue tnum" style="font-size:20px">' + R.rp(d.total) + '</b></div><div class="xs muted">Deposit ' + R.rp(d.deposit) + ' · denda ' + R.rp(d.denda_per_jam) + '/jam · toleransi ' + d.toleransi_menit + ' mnt</div>' : '<p class="err">' + esc(d.pesan) + '</p>');
        }, 350);
        f.addEventListener('input', est); f.addEventListener('change', est); est();
      },
      simpan: function (v) {
        const o = { id_unit: v.id_unit, mulai: v.mulai.replace('T', ' '), selesai: v.selesai.replace('T', ' '), id_penyewa: v.id_penyewa, paket: v.paket, dengan_driver: v.dengan_driver,
          lokasi_antar: v.lokasi_antar, lokasi_jemput: v.lokasi_jemput, biaya_antar_jemput: v.biaya_antar_jemput, diskon: v.diskon, deposit: v.deposit, jaminan_jenis: v.jaminan_jenis, status: v.status, total_manual: v.total_manual, catatan: v.catatan };
        if (!o.id_penyewa) { if (!v.pb_nama || !v.pb_wa) return Promise.resolve({ success: false, message: 'Pilih penyewa lama atau isi nama & WA penyewa baru.' }); o.penyewa_baru = { nama: v.pb_nama, no_wa: v.pb_wa }; }
        if (b) o.id_booking = b.id_booking;
        return R.api('booking.simpan', o);
      },
      setelah: function (r) { RP.segarkanDash(); if (r.data && r.data.id_booking) location.hash = '#/app/booking/' + r.data.id_booking; }
    });
  }
  UI.formBooking = formBooking;

  /* ---------- Detail booking + nota ---------- */
  function renderDetail(el, id) {
    el.innerHTML = '<div class="skel" style="height:60px"></div><div class="det"><div class="skel" style="height:420px"></div><div class="skel" style="height:420px"></div></div>';
    R.muat('bk_' + id, 'booking.detail', { id: id }, { umur: 10, batch: false, render: function (d, dariCache, err) {
      if (!d) { el.innerHTML = '<div class="empty">' + ic('alert') + '<p>' + esc(err ? err.message : 'Booking tidak ditemukan.') + '</p><a class="btn btn-sec" href="#/app/booking">Kembali</a></div>'; return; }
      gambarDetail(el, d); R.hidrasiIkon(el);
    } });
  }
  function gambarDetail(el, d) {
    const b = d.booking, u = d.unit || {}, p = d.penyewa || {}, k = d.ringkas, owner = RP.role() === 'OWNER';
    const bisaKeluar = ['Terkonfirmasi', 'Menunggu DP'].indexOf(b.status) > -1, bisaMasuk = b.status === 'Sedang Berjalan';
    const app = RP.situs('APP_URL', location.origin + location.pathname).replace(/\/+$/, '');
    const urlV = d.verifikasi ? app + '/#/v/' + d.verifikasi : '';
    const log = d.log || [];
    const kel = function (l) { let o = {}; try { o = JSON.parse(l.kelengkapan || '{}'); } catch (e) { } const ks = Object.keys(o); return ks.filter(function (x) { return o[x]; }).length + '/' + ks.length; };
    el.innerHTML = '<div class="page-h"><div><div class="small muted"><a href="#/app/booking">Booking</a> › Detail</div><h1>Detail Booking #' + esc(b.id_booking) + '</h1><div class="row" style="margin-top:8px">' + R.badge(b.status) + '<span class="badge b-off">Sumber: ' + esc(b.sumber) + '</span>' + (k.lunas ? '<span class="badge b-ok">LUNAS</span>' : '') + '</div></div>' +
      '<div class="act"><button class="btn btn-sec" id="dtNotaMail" type="button">' + ic('mail') + 'Kirim Nota (Gmail)</button><button class="btn btn-sec" id="dtPdf" type="button">' + ic('download') + 'Unduh PDF</button>' +
      (bisaKeluar ? '<a class="btn btn-primary" href="#/app/cek/' + esc(b.id_booking) + '">' + ic('key') + 'Check-out (Serah)</a>' : '') + (bisaMasuk ? '<a class="btn btn-accent" href="#/app/cek/' + esc(b.id_booking) + '">' + ic('key') + 'Check-in Pengembalian</a>' : '') + '</div></div>' +
      '<div class="det"><div class="stack" style="gap:18px">' +
      '<section class="sec-card"><div class="hd"><h3>' + ic('car', 'blue') + 'Informasi Unit &amp; Jadwal Sewa</h3><span class="act badge b-info">' + (b.dengan_driver === 'Y' ? 'Dengan driver' : 'Lepas kunci') + '</span></div>' +
      '<div class="row" style="background:var(--primary-50);border-radius:20px;padding:12px;flex-wrap:nowrap"><div class="thumb" style="width:120px;height:80px">' + fotoU(u, 300) + '</div><div><b style="font-size:17px">' + esc(namaU(u)) + '</b><div class="row" style="margin-top:6px"><span class="plat">' + esc(u.plat_nomor || '') + '</span><span class="small muted">' + esc(u.transmisi || '') + ' · ' + esc(u.tahun || '') + '</span></div><div class="small muted" style="margin-top:4px">' + esc(u.deskripsi_singkat || '') + '</div></div></div>' +
      '<div class="info-chips"><div class="ichip"><small>Waktu ambil</small><b>' + R.tgl(b.mulai) + '</b><span class="small muted">' + R.jam(b.mulai) + ' WIB</span></div><div class="ichip"><small>Waktu kembali</small><b>' + R.tgl(b.selesai) + '</b><span class="small muted">' + R.jam(b.selesai) + ' WIB</span></div>' +
      '<div class="ichip"><small>Durasi</small><b class="blue">' + R.durasi(b.mulai, b.selesai) + '</b><span class="small muted">Toleransi ' + esc(b.toleransi_menit) + ' menit</span></div><div class="ichip"><small>Lokasi</small><b class="ellipsis">' + esc(b.lokasi_antar || 'Pool') + '</b><span class="small muted ellipsis">Kembali: ' + esc(b.lokasi_jemput || 'Pool') + '</span></div></div>' +
      (b.catatan ? '<p class="small"><b>Catatan:</b> ' + esc(b.catatan) + '</p>' : '') +
      '<div class="row">' + (d.transisi.length ? d.transisi.map(function (t) { return '<button class="btn ' + (t === 'Dibatalkan' ? 'btn-danger' : 'btn-soft') + ' btn-sm" data-st="' + esc(t) + '" type="button">→ ' + esc(t) + '</button>'; }).join('') : '') +
      (['Selesai', 'Dibatalkan', 'Sedang Berjalan'].indexOf(b.status) === -1 ? '<button class="btn btn-sec btn-sm" id="dtEdit" type="button">' + ic('edit', 's') + 'Ubah booking</button>' : '') + '</div></section>' +
      '<section class="sec-card"><div class="hd"><h3>' + ic('user', 'blue') + 'Data Penyewa &amp; Jaminan</h3><span class="act small muted">ID ' + esc(p.id_penyewa || '') + '</span></div>' +
      '<div class="grid-2"><div><div class="lbl">Nama lengkap</div><b>' + esc(p.nama || '') + '</b>' + (p.status_blacklist === 'Y' ? ' <span class="badge b-bad">Blacklist</span>' : '') + (Number(p.jumlah_telat) >= 2 ? ' <span class="badge b-warn">Sering telat</span>' : '') + '</div>' +
      '<div><div class="lbl">No. WhatsApp</div><b>' + esc(p.no_wa || '') + '</b> <a class="btn btn-soft btn-sm" target="_blank" rel="noopener" href="' + R.waLink(p.no_wa, 'Halo ' + (p.nama || '') + ', terkait booking ' + b.id_booking + ' …') + '">' + ic('chat', 's') + 'WA</a></div>' +
      '<div><div class="lbl">Email</div>' + esc(p.email || '-') + '</div><div><div class="lbl">Kontak darurat</div>' + esc(p.kontak_darurat || '-') + '</div></div>' +
      '<div class="selisih"><div class="row"><span class="lbl">JAMINAN</span>' + (b.jaminan_status ? '<span class="badge ' + (b.jaminan_status === 'Ditahan' ? 'b-warn' : b.jaminan_status === 'Dikembalikan' ? 'b-ok' : 'b-off') + '" style="margin-left:auto">' + esc(b.jaminan_status) + '</span>' : '') + '</div><b>' + esc(b.jaminan_jenis || 'Belum dicatat') + '</b>' +
      '<div class="row"><button class="btn btn-sec btn-sm" id="dtJam" type="button">' + ic('edit', 's') + 'Status jaminan</button><label class="btn btn-sec btn-sm">' + ic('upload', 's') + 'Unggah dokumen<input type="file" accept="image/*,application/pdf" id="dtJamFile" hidden></label><span class="xs muted">' + String(b.jaminan_drive_ids || '').split(',').filter(Boolean).length + ' dokumen · folder Jaminan (akses Owner)</span></div></div></section>' +
      '<section class="sec-card"><div class="hd"><h3>' + ic('wallet', 'blue') + 'Ringkasan Tagihan &amp; Riwayat Pembayaran</h3><span class="act">' + (k.lunas ? '<span class="badge b-ok">LUNAS</span>' : '<span class="badge b-warn">Sisa ' + R.rp(k.sisa) + '</span>') + '</span></div>' +
      '<div class="info-chips"><div class="ichip"><small>Total tagihan</small><b class="tnum">' + R.rp(k.tagihan) + '</b></div><div class="ichip" style="background:var(--primary-50)"><small>Terbayar</small><b class="blue tnum">' + R.rp(k.terbayar) + '</b></div><div class="ichip" style="background:var(--accent-50)"><small>Deposit ditahan</small><b class="tnum">' + R.rp(k.deposit_ditahan) + '</b></div></div>' +
      (d.bayar.length ? UI.tabel([{ l: 'Tahap', f: function (x) { return esc(x.jenis); } }, { l: 'Metode', f: function (x) { return esc(x.metode); } }, { l: 'Tanggal', f: function (x) { return R.tglPendek(x.tanggal); } }, { l: 'Nominal', r: true, f: function (x) { return '<b class="tnum">' + R.rp(x.nominal) + '</b>'; } }, { l: '', r: true, f: function (x) { return '<button class="btn btn-ghost btn-sm" data-struk="' + esc(x.id_bayar) + '" type="button">' + ic('printer', 's') + '</button>' + (owner ? '<button class="btn btn-ghost btn-sm" data-batal="' + esc(x.id_bayar) + '" type="button" title="Batalkan">' + ic('x', 's') + '</button>' : ''); } }], d.bayar, { per: 50 }) : '<p class="small muted">Belum ada pembayaran.</p>') +
      '<div class="row"><button class="btn btn-accent btn-sm" id="dtBayar" type="button">' + ic('plus', 's') + 'Catat Pembayaran</button>' + (k.deposit_ditahan > 0 && b.status === 'Selesai' ? '<button class="btn btn-sec btn-sm" id="dtDeposit" type="button">' + ic('refresh', 's') + 'Proses Deposit</button>' : '') + '</div></section>' +
      (log.length ? '<section class="sec-card"><div class="hd"><h3>' + ic('clip', 'blue') + 'Log Serah Terima</h3></div>' + log.map(function (l) { return '<div class="info-chips"><div class="ichip"><small>' + (l.tipe === 'Keluar' ? 'Check-out' : 'Check-in') + '</small><b>' + R.tglPendek(l.waktu) + '</b></div><div class="ichip"><small>BBM</small><b>' + esc(l.bbm_persen) + '%</b><div class="progress"><i style="width:' + Number(l.bbm_persen) + '%"></i></div></div><div class="ichip"><small>Odometer</small><b class="tnum">' + R.angka(l.odometer) + ' km</b></div><div class="ichip"><small>Kelengkapan</small><b class="blue">' + kel(l) + '</b><span class="xs muted">' + String(l.foto_drive_ids || '').split(',').filter(Boolean).length + ' foto</span></div></div>' + (l.flag ? '<p class="small err">' + ic('alert', 's') + esc(l.flag) + '</p>' : '') + (l.catatan_kerusakan ? '<p class="small">' + esc(l.catatan_kerusakan) + '</p>' : ''); }).join('') + '</section>' : '') +
      '</div><div class="stack" style="gap:12px;position:sticky;top:84px"><div class="row between"><span class="lbl">PRATINJAU NOTA RESMI</span><span class="xs muted">PDF A4 / Thermal</span></div>' +
      '<div class="nota"><div class="nota-in"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="grow"><div class="row"><span class="brand-logo" style="width:34px;height:34px">' + ic('car', 's') + '</span><b>' + esc(RP.situs('NAMA_USAHA', 'RentFleet').toUpperCase()) + '</b></div><div class="xs muted" style="margin-top:4px">Nota Resmi &amp; Tiket Sewa Kendaraan</div></div><div style="text-align:right"><div class="qrbox" id="dtQr"></div><div class="xs blue bold">#' + esc(b.id_booking) + '</div></div></div>' +
      '<dl class="kv"><dt>Penyewa</dt><dd>' + esc(p.nama || '') + '</dd><dt>Unit</dt><dd>' + esc(namaU(u)) + ' · ' + esc(u.plat_nomor || '') + '</dd><dt>Periode</dt><dd>' + R.tglPendek(b.mulai) + ' – ' + R.tglPendek(b.selesai) + '</dd></dl>' +
      '<div style="border-top:1px dashed var(--line);padding-top:10px"><div class="lbl">RINCIAN BIAYA</div><dl class="kv" style="margin-top:6px">' + (b.rincian || []).map(function (r) { return '<dt>' + esc(labelR(r)) + '</dt><dd class="tnum">' + R.rp(r.qty * r.harga) + '</dd>'; }).join('') +
      (Number(b.biaya_antar_jemput) ? '<dt>Antar-jemput</dt><dd>' + R.rp(b.biaya_antar_jemput) + '</dd>' : '') + (Number(b.diskon) ? '<dt>Diskon</dt><dd>-' + R.rp(b.diskon) + '</dd>' : '') + (Number(b.denda) ? '<dt>Denda telat</dt><dd class="err">' + R.rp(b.denda) + '</dd>' : '') + (Number(b.biaya_lain) ? '<dt>Biaya lain</dt><dd>' + R.rp(b.biaya_lain) + '</dd>' : '') + '</dl></div>' +
      '<div class="tot"><span>Total tagihan</span><b class="tnum">' + R.rp(k.tagihan) + '</b></div><div class="row between small"><span class="muted">Status pembayaran</span>' + (k.lunas ? '<span class="badge b-ok">LUNAS</span>' : '<span class="badge b-warn">SISA ' + R.rp(k.sisa) + '</span>') + '</div>' +
      (Number(b.deposit) ? '<div class="selisih small ln">' + ic('info', 's') + ' Deposit jaminan <b>' + R.rp(b.deposit) + '</b> dikembalikan penuh saat check-in tanpa kerusakan/denda.</div>' : '') +
      '<p class="xs muted" style="text-align:center">Dokumen sah diterbitkan sistem. Pindai QR untuk cek keaslian.</p></div></div>' +
      '<div class="grid-2"><button class="btn btn-sec" id="dtCetak" type="button">' + ic('printer') + 'Cetak Tiket</button><button class="btn btn-primary" id="dtLink" type="button">' + ic('copy') + 'Salin Link Nota</button></div></div></div>';
    if (urlV) R.muatQR().then(function () { const q = $('#dtQr', el); if (q) q.innerHTML = '<img alt="QR verifikasi" src="' + R.qrDataUrl(urlV, 3) + '">'; });
    const segar = function () { R.Mem.basi(); renderDetail(el, b.id_booking); RP.segarkanDash(); };
    $('#dtLink', el).onclick = function () { R.salin(urlV || b.id_booking); };
    $('#dtPdf', el).onclick = function () { const w = W.open('', '_blank'); R.sibuk(this, async function () { const r = await R.api('nota.pdf', { id: b.id_booking }); if (r.success) { if (w) w.location = r.data.url; else W.open(r.data.url, '_blank'); R.toast('Nota PDF tersimpan di Drive.', 'ok'); } else { if (w) w.close(); R.toast(r.message, 'err'); } }); };
    $('#dtNotaMail', el).onclick = function () { R.sibuk(this, async function () { const r = await R.api('nota.kirim', { id: b.id_booking }); R.toast(r.message, r.success ? 'ok' : 'err'); }); };
    $('#dtCetak', el).onclick = function () { if (!W.StrukUI) return; W.StrukUI.pratinjau({ jenis: 'STRUK', judul: 'Tiket ' + b.id_booking, data: dataTiket(d, urlV), nomor: b.id_booking, waNomor: p.no_wa }); };
    $('#dtBayar', el).onclick = function () { formBayar(d, segar); };
    if ($('#dtDeposit', el)) $('#dtDeposit', el).onclick = function () { W.RFKeu && W.RFKeu.prosesDeposit(b.id_booking, k, segar); };
    if ($('#dtEdit', el)) $('#dtEdit', el).onclick = function () { formBooking(Object.assign({}, b, { penyewa_nama: p.nama ? p.nama + ' · ' + p.no_wa + ' · ' + p.id_penyewa : '' }), {}); };
    $$('[data-st]', el).forEach(function (bt) { bt.onclick = async function () {
      const ke = bt.dataset.st; let alasan = '';
      if (ke === 'Dibatalkan') { alasan = await R.konfirmasi('Batalkan booking ' + b.id_booking + '?', { bahaya: true, ya: 'Batalkan', isi: '<div class="field" style="margin-top:10px"><label>Alasan</label><input class="input" id="alBatal"></div>', ambil: function (m) { return m.$('#alBatal').value || 'Dibatalkan admin'; } }); if (!alasan) return; }
      R.sibuk(bt, async function () { const r = await R.api('booking.status', { id: b.id_booking, status: ke, alasan: alasan }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) segar(); });
    }; });
    $('#dtJam', el).onclick = function () { UI.formModal({ judul: 'Jaminan ' + b.id_booking, nilai: { jenis: b.jaminan_jenis, status: b.jaminan_status || 'Ditahan' }, fields: [{ n: 'jenis', l: 'Jenis jaminan', full: true }, { n: 'status', l: 'Status', t: 'select', o: ['Belum diterima', 'Ditahan', 'Dikembalikan'] }], simpan: function (v) { v.id = b.id_booking; return R.api('jaminan.status', v); }, setelah: segar }); };
    $('#dtJamFile', el).onchange = async function () { const f = this.files[0]; if (!f) return; try { const k2 = await R.kompresFoto(f, 1600); const r = await R.api('jaminan.upload', { id: b.id_booking, b64: k2.b64, mime: k2.mime }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) segar(); } catch (e) { R.toast(e.message, 'err'); } };
    el.addEventListener('click', async function (e) {
      const s = e.target.closest('[data-struk]'); if (s && W.StrukUI) { const x = d.bayar.filter(function (y) { return y.id_bayar === s.dataset.struk; })[0]; W.StrukUI.pratinjau({ jenis: 'STRUK', data: dataStrukBayarLokal(x, d, urlV), nomor: x.id_bayar, waNomor: p.no_wa }); }
      const c = e.target.closest('[data-batal]'); if (c) { const al = await R.konfirmasi('Batalkan pembayaran ' + c.dataset.batal + '? (tetap tercatat sebagai batal)', { bahaya: true, ya: 'Batalkan', isi: '<input class="input" id="alB" placeholder="Alasan" style="margin-top:10px">', ambil: function (m) { return m.$('#alB').value || '-'; } }); if (!al) return; const r = await R.api('bayar.batal', { id: c.dataset.batal, alasan: al }); R.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) segar(); }
    });
  }
  function labelR(r) { const nm = { jam: 'jam', harian: 'hari', mingguan: 'minggu', bulanan: 'bulan' }; return String(r.jenis).indexOf('paket') === 0 ? 'Paket ' + r.jenis.slice(6) + ' (' + r.qty + ' hari × ' + R.rp(r.harga) + ')' : 'Sewa ' + r.qty + ' ' + (nm[r.jenis] || r.jenis) + ' × ' + R.rp(r.harga); }
  function dasarToko() { return { TOKO_NAMA: RP.situs('NAMA_USAHA', 'RentFleet'), TOKO_ALAMAT: RP.situs('ALAMAT', ''), TOKO_WA: RP.situs('NO_WA', '') }; }
  function dataTiket(d, urlV) {
    const b = d.booking, u = d.unit || {}, p = d.penyewa || {}, k = d.ringkas;
    return Object.assign(dasarToko(), { NOTA: b.id_booking, KODE: b.id_booking, JENIS_BAYAR: 'Ringkasan tagihan', NOMINAL: k.terbayar, METODE: '-', TANGGAL: R.isoTgl().split('-').reverse().join('-'), JAM: R.jam(Date.now()),
      KASIR: (R.Sesi.me || {}).nama, PENYEWA: p.nama, UNIT: namaU(u), PLAT: u.plat_nomor, MULAI: R.tgl(b.mulai, true), SELESAI: R.tgl(b.selesai, true), TOTAL: k.tagihan, TERBAYAR: k.terbayar, SISA: k.sisa, DEPOSIT: k.deposit_ditahan,
      LUNAS: k.lunas ? 'YA' : '', BELUM: k.lunas ? '' : 'YA', STATUS: k.lunas ? 'LUNAS' : 'BELUM LUNAS', URL_VERIFIKASI: urlV, CATATAN: '', PESAN_KAKI: 'Tunjukkan tiket ini saat serah terima.' });
  }
  function dataStrukBayarLokal(x, d, urlV) { const t = dataTiket(d, urlV); return Object.assign(t, { NOTA: x.id_bayar, JENIS_BAYAR: x.jenis, NOMINAL: Number(x.nominal), METODE: x.metode, TANGGAL: String(x.tanggal).slice(0, 10).split('-').reverse().join('-'), JAM: String(x.tanggal).slice(11, 16), CATATAN: x.catatan || '', PESAN_KAKI: 'Simpan struk ini sebagai bukti pembayaran.' }); }
  /** Form catat pembayaran (dipakai juga oleh halaman Keuangan). */
  function formBayar(d, setelah) {
    const b = d.booking, k = d.ringkas;
    let buktiId = '';
    UI.formModal({ judul: 'Catat Pembayaran · ' + b.id_booking, nilai: { jenis: k.terbayar ? 'Pelunasan' : 'DP', nominal: k.sisa || '', metode: 'Transfer', tanggal: R.isoWaktu() },
      atas: '<div class="info-chips"><div class="ichip"><small>Tagihan</small><b>' + R.rp(k.tagihan) + '</b></div><div class="ichip"><small>Sisa</small><b class="blue">' + R.rp(k.sisa) + '</b></div><div class="ichip"><small>Deposit ditahan</small><b>' + R.rp(k.deposit_ditahan) + '</b></div></div>',
      fields: [{ n: 'jenis', l: 'Jenis', t: 'select', o: ['DP', 'Pelunasan', 'Deposit', 'Denda', 'Antar-Jemput', 'Pengembalian Deposit'] }, { n: 'nominal', l: 'Nominal (Rp)', t: 'number', req: true, min: 1 },
        { n: 'metode', l: 'Metode', t: 'select', o: ['Tunai', 'Transfer', 'QRIS', 'E-Wallet', 'Potong Deposit'] }, { n: 'tanggal', l: 'Tanggal', t: 'datetime' },
        { n: 'catatan', l: 'Catatan', full: true }, { html: '<div class="field" style="grid-column:1/-1"><label>Bukti transfer (opsional)</label><label class="btn btn-sec btn-sm" style="justify-self:start">' + ic('upload', 's') + 'Pilih foto/PDF<input type="file" accept="image/*,application/pdf" id="bkBukti" hidden></label><span class="hint" id="bkBuktiInfo"></span></div>' },
        { n: 'lebihOk', l: 'Izinkan lebih bayar', t: 'check' }, { n: 'cetak', l: 'Cetak struk setelah simpan', t: 'check', v: true }],
      buka: function (m) { m.$('#bkBukti').onchange = async function () { const f = this.files[0]; if (!f) return; m.$('#bkBuktiInfo').textContent = 'Mengunggah…'; try { const c = await R.kompresFoto(f); const r = await R.api('bayar.bukti', { id_booking: b.id_booking, b64: c.b64, mime: c.mime }); if (!r.success) throw new Error(r.message); buktiId = r.data.fileId; m.$('#bkBuktiInfo').textContent = 'Bukti terunggah ✓'; } catch (e) { m.$('#bkBuktiInfo').textContent = e.message; } }; },
      simpan: async function (v) {
        const r = await R.api('bayar.simpan', { id_booking: b.id_booking, jenis: v.jenis, nominal: v.nominal, metode: v.metode, tanggal: String(v.tanggal).replace('T', ' '), catatan: v.catatan, bukti_drive_id: buktiId, lebihOk: v.lebihOk });
        if (r.success && v.cetak && W.StrukUI && r.data.struk) setTimeout(function () { W.StrukUI.pratinjau({ jenis: 'STRUK', data: r.data.struk, nomor: r.data.id_bayar, waNomor: d.penyewa && d.penyewa.no_wa, setelahSimpan: true }); }, 200);
        return r;
      }, setelah: setelah });
  }
  UI.formBayar = formBayar;
  RP.daftar('booking', { render: renderBooking });

  /* ================= PENYEWA ================= */
  const PS = { q: '', hal: 1, f: '' };
  function renderPenyewa(el, arg) {
    el.innerHTML = UI.kepala('Penyewa &amp; Jaminan', 'Profil penyewa, riwayat sewa, penanda sering telat dan blacklist. Dokumen jaminan disimpan di folder Drive terbatas (Owner).',
      '<button class="btn btn-sec" id="psCsv" type="button">' + ic('download') + 'Ekspor</button>' + (RP.role() === 'OWNER' ? '<button class="btn btn-sec" id="psImpor" type="button">' + ic('upload') + 'Impor CSV</button>' : '') + '<button class="btn btn-accent" id="psBaru" type="button">' + ic('plus') + 'Penyewa Baru</button>') +
      '<div class="toolbar"><div class="search">' + ic('search') + '<input class="input" id="psQ" placeholder="Nama, WA, email, ID" value="' + esc(PS.q) + '"></div><div class="seg" id="psF"><button type="button" data-f="" class="' + (PS.f ? '' : 'on') + '">Semua</button><button type="button" data-f="aktif" class="' + (PS.f === 'aktif' ? 'on' : '') + '">Sedang sewa</button><button type="button" data-f="telat" class="' + (PS.f === 'telat' ? 'on' : '') + '">Sering telat</button><button type="button" data-f="bl" class="' + (PS.f === 'bl' ? 'on' : '') + '">Blacklist</button></div></div><div id="psIsi"><div class="skel" style="height:300px"></div></div>';
    let data = null;
    const gambar = function () {
      if (!data) return;
      const q = PS.q.toLowerCase();
      const rows = data.rows.filter(function (p) { if (PS.f === 'aktif' && !p.aktif) return false; if (PS.f === 'telat' && !p.seringTelat) return false; if (PS.f === 'bl' && p.status_blacklist !== 'Y') return false; return !q || [p.id_penyewa, p.nama, p.no_wa, p.email].join(' ').toLowerCase().indexOf(q) > -1; });
      $('#psIsi', el).innerHTML = UI.tabel([
        { l: 'Penyewa', full: true, f: function (p) { return '<div class="row" style="flex-wrap:nowrap"><span class="avatar">' + esc(R.inisial(p.nama)) + '</span><div><div class="t1">' + esc(p.nama) + ' ' + (p.status_blacklist === 'Y' ? '<span class="badge b-bad">Blacklist</span>' : '') + (p.seringTelat ? ' <span class="badge b-warn">Sering telat</span>' : '') + '</div><div class="t2">' + esc(p.id_penyewa) + ' · ' + esc(p.sumber || 'Admin') + '</div></div></div>'; } },
        { l: 'Kontak', f: function (p) { return '<div class="t1">' + esc(p.no_wa) + ' ' + (p.StatusWA === 'Terdaftar' ? '<span class="wa-badge ya">✓ WA</span>' : '') + '</div><div class="t2">' + esc(p.email || '-') + '</div>'; } },
        { l: 'Sewa selesai', r: true, f: function (p) { return '<b>' + esc(p.jumlah_sewa_selesai || 0) + '</b>×' + (p.jumlah_telat ? ' <span class="t2">(' + p.jumlah_telat + ' telat)</span>' : ''); } },
        { l: 'Aktif', c: true, f: function (p) { return p.aktif ? '<span class="badge b-info">' + p.aktif + ' booking</span>' : '-'; } },
        { l: '', r: true, f: function (p) { return '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + R.waLink(p.no_wa) + '">' + ic('chat', 's') + '</a><button class="btn btn-soft btn-sm" data-ps="' + esc(p.id_penyewa) + '" type="button">Detail</button>'; } }
      ], rows, { hal: PS.hal, kosong: 'Belum ada penyewa.', ikon: 'users' });
      R.hidrasiIkon($('#psIsi', el));
    };
    R.muat('penyewa', 'penyewa.list', {}, { umur: 30, render: function (d) { if (d) { data = d; gambar(); } } });
    $('#psQ', el).oninput = R.debounce(function () { PS.q = this.value; PS.hal = 1; gambar(); }, 250);
    $('#psF', el).onclick = function (e) { const b = e.target.closest('button'); if (!b) return; PS.f = b.dataset.f; PS.hal = 1; $$('#psF button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); gambar(); };
    $('#psBaru', el).onclick = function () { formPenyewa(null); };
    $('#psCsv', el).onclick = function () { if (data) R.csv('penyewa-' + R.isoTgl() + '.csv', data.rows, ['id_penyewa', 'nama', 'no_wa', 'email', 'kontak_darurat', 'alamat', 'jumlah_sewa_selesai', 'jumlah_telat', 'status_blacklist', 'sumber']); };
    if ($('#psImpor', el)) $('#psImpor', el).onclick = function () { imporCsv('Penyewa', 'nama,no_wa,email,kontak_darurat,alamat,catatan'); };
    UI.ikat($('#psIsi', el), function (h) { PS.hal = h; gambar(); });
    $('#psIsi', el).addEventListener('click', function (e) { const b = e.target.closest('[data-ps]'); if (b) detailPenyewa(b.dataset.ps); });
    if (arg) detailPenyewa(arg);
  }
  function formPenyewa(p) {
    UI.formModal({ judul: p ? 'Ubah ' + p.nama : 'Penyewa Baru', nilai: p || { status_blacklist: 'N' },
      fields: [{ n: 'nama', l: 'Nama lengkap', req: true }, { n: 'no_wa', l: 'No. WhatsApp', t: 'tel', req: true }, { n: 'email', l: 'Email', t: 'email' }, { n: 'kontak_darurat', l: 'Kontak darurat (nama & nomor)' },
        { n: 'alamat', l: 'Alamat', t: 'textarea', full: true, rows: 2 }, { n: 'catatan', l: 'Catatan internal', t: 'textarea', full: true, rows: 2 },
        { n: 'status_blacklist', l: 'Status', t: 'select', o: [['N', 'Normal'], ['Y', 'Blacklist (tandai berisiko)']] }],
      simpan: function (v) { if (p) v.id_penyewa = p.id_penyewa; return R.api('penyewa.simpan', v); },
      setelah: function () { R.Mem.basi(); if (RP.P.aktif === 'penyewa') renderPenyewa($('#page')); } });
  }
  async function detailPenyewa(id) {
    const r = await R.api('penyewa.detail', { id: id });
    if (!r.success) { R.toast(r.message, 'err'); return; }
    const p = r.data.penyewa;
    const m = R.modal({ judul: p.nama, lebar: true, isi: '<div class="info-chips"><div class="ichip"><small>WhatsApp</small><b>' + esc(p.no_wa) + '</b></div><div class="ichip"><small>Sewa selesai</small><b>' + esc(p.jumlah_sewa_selesai) + '×</b></div><div class="ichip"><small>Telat</small><b class="' + (p.jumlah_telat ? 'err' : '') + '">' + esc(p.jumlah_telat) + '×</b></div><div class="ichip"><small>Piutang</small><b class="blue">' + R.rp(r.data.piutang) + '</b></div><div class="ichip"><small>Deposit ditahan</small><b>' + R.rp(r.data.depositDitahan) + '</b></div></div>' +
      (p.catatan ? '<p class="small"><b>Catatan:</b> ' + esc(p.catatan) + '</p>' : '') + '<h4>Riwayat sewa</h4>' +
      UI.tabel([{ l: 'Kode', f: function (x) { return '<a href="#/app/booking/' + esc(x.id_booking) + '" data-tutup>#' + esc(x.id_booking) + '</a>'; } }, { l: 'Unit', f: function (x) { return esc(x.unit); } }, { l: 'Jadwal', f: function (x) { return R.tglPendek(x.mulai); } }, { l: 'Tagihan', r: true, f: function (x) { return R.rp(x.tagihan); } }, { l: 'Status', f: function (x) { return R.badge(x.status); } }], r.data.riwayat, { per: 10, kosong: 'Belum ada riwayat.' }),
      kaki: '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + R.waLink(p.no_wa) + '">' + ic('chat') + 'WhatsApp</a><button class="btn btn-sec" id="dpEdit" type="button">' + ic('edit') + 'Ubah data</button><button class="btn btn-primary" id="dpBook" type="button">' + ic('plus') + 'Booking baru</button>' });
    m.$('#dpEdit').onclick = function () { m.tutup(); formPenyewa(p); };
    m.$('#dpBook').onclick = function () { m.tutup(); formBooking(null, { id_penyewa: p.id_penyewa, penyewa_nama: p.nama + ' · ' + p.no_wa + ' · ' + p.id_penyewa }); };
  }
  RP.daftar('penyewa', { render: renderPenyewa });
})(window);
