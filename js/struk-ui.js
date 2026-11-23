/* ============================================================
 * struk-ui.js — Jendela Pratinjau & Cetak (kertas 1:1), Editor
 * Model (Owner, riwayat versi, kamus penanda), Pengaturan Printer
 * Bawaan. Kelas CSS berawalan sk-, selalu bertema terang.
 * ============================================================ */
(function (W) {
  'use strict';
  const E = W.StrukEngine, SP = W.StrukPrinter;
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- Gaya (disuntik sekali) ---------- */
  (function () {
    if (document.getElementById('sk-gaya')) return;
    const s = document.createElement('style'); s.id = 'sk-gaya';
    s.textContent = '.sk{--sk-aksen:var(--primary,#1D4ED8);color-scheme:light;color:#0F172A}.sk-bg{position:fixed;inset:0;z-index:80;background:rgba(15,23,42,.5);display:grid;place-items:center;padding:12px}' +
      '.sk-win{background:#fff;color:#0F172A;border-radius:20px;width:min(1000px,100%);max-height:calc(100dvh - 24px);display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.3)}' +
      '.sk-h{display:flex;gap:10px;align-items:center;padding:14px 18px;border-bottom:1px solid #E2E8F0}.sk-h b{font-size:17px;flex:1}.sk-body{display:grid;grid-template-columns:minmax(0,1fr) 330px;overflow:hidden}' +
      '.sk-prev{background:repeating-linear-gradient(45deg,#EEF2F7,#EEF2F7 10px,#F5F7FB 10px,#F5F7FB 20px);overflow:auto;padding:20px;display:grid;justify-items:center;align-content:start}' +
      '.sk-side{border-left:1px solid #E2E8F0;overflow:auto;padding:16px;display:grid;gap:12px;align-content:start;background:#fff}.sk-f{padding:12px 18px;border-top:1px solid #E2E8F0;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;background:#F8FAFC}' +
      '.sk-l{font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.05em}.sk-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.sk-seg{display:inline-flex;background:#EFF4FF;border-radius:99px;padding:3px}' +
      '.sk-seg button{border:0;background:transparent;border-radius:99px;padding:6px 12px;font:600 13px Inter,system-ui;color:#64748B;cursor:pointer}.sk-seg button.on{background:var(--sk-aksen);color:#fff}' +
      '.sk select,.sk input[type=text],.sk input[type=number],.sk textarea{font:inherit;border:1px solid #E2E8F0;border-radius:10px;padding:8px 10px;background:#fff;color:#0F172A;width:100%}' +
      '.sk-chk{display:flex;gap:8px;align-items:center;font-size:14px;cursor:pointer}.sk-chk input{width:18px;height:18px;accent-color:var(--sk-aksen)}' +
      '.sk-b{display:inline-flex;gap:6px;align-items:center;justify-content:center;border:1px solid #CBD5E1;background:#fff;color:#0F172A;border-radius:99px;padding:0 14px;min-height:38px;font:600 13.5px Inter,system-ui;cursor:pointer}.sk-b:hover{background:#F8FAFC}' +
      '.sk-b.p{background:var(--sk-aksen);border-color:var(--sk-aksen);color:#fff}.sk-b.a{background:#FACC15;border-color:#FACC15;color:#0F172A}.sk-b.wa{background:#16A34A;border-color:#16A34A;color:#fff}.sk-b[disabled]{opacity:.5;pointer-events:none}' +
      '.paper{font-family:"Courier New",ui-monospace,"JetBrains Mono",Consolas,monospace;font-size:13px;line-height:1.25;background:#fff;color:#111;width:calc(var(--kol,32) * 1ch + 24px);padding:14px 12px 18px;box-shadow:0 2px 0 #E2E8F0,0 10px 30px rgba(15,23,42,.12);border-radius:2px;position:relative}' +
      '.paper::after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:8px;background:linear-gradient(-45deg,transparent 6px,#fff 0) 0 0/12px 8px,linear-gradient(45deg,transparent 6px,#fff 0) 0 0/12px 8px}' +
      '.paper .pl{white-space:pre;overflow:hidden;min-height:1.25em}.paper .b{font-weight:700}.paper .s2{font-size:2em;line-height:1.15;font-weight:700}.paper .sh{font-weight:700;transform:scaleY(2);transform-origin:top;margin-bottom:1.25em}' +
      '.paper .inv{background:#111;color:#fff}.paper .pimg{text-align:center;margin:6px 0}.paper .pimg img{display:inline-block}.paper .pcut{text-align:center;color:#94A3B8;font-size:11px;margin:6px 0;border-top:1px dashed #CBD5E1;padding-top:4px}' +
      '.sk-info{font-size:12.5px;color:#64748B}.sk-ed{display:grid;grid-template-columns:230px minmax(0,1fr) minmax(0,auto);gap:14px;align-items:start}.sk-list{display:grid;gap:6px}' +
      '.sk-item{border:1px solid #E2E8F0;border-radius:12px;padding:10px 12px;cursor:pointer;background:#fff;text-align:left;font:inherit;color:#0F172A}.sk-item.on{border-color:var(--sk-aksen);background:#EFF4FF}.sk-item small{display:block;color:#64748B;font-size:12px}' +
      '.sk-code{font-family:ui-monospace,"JetBrains Mono",Consolas,monospace;font-size:12.5px;min-height:420px;white-space:pre;tab-size:2;line-height:1.5}.sk-kamus{display:flex;flex-wrap:wrap;gap:5px}.sk-kamus button{border:1px solid #E2E8F0;background:#F8FAFC;border-radius:8px;padding:3px 8px;font:600 11.5px ui-monospace,monospace;cursor:pointer;color:#1E40AF}' +
      '.sk-card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:14px;display:grid;gap:10px}' +
      '@media(max-width:860px){.sk-body{grid-template-columns:1fr;overflow:auto}.sk-side{border-left:0;border-top:1px solid #E2E8F0}.sk-prev{max-height:none}.sk-ed{grid-template-columns:1fr}.sk-bg{padding:0;place-items:end stretch}.sk-win{border-radius:20px 20px 0 0;max-height:96dvh}}';
    document.head.appendChild(s);
  })();
  function toastDef(j, s, e) { if (W.RF) W.RF.toast(j + (s ? ' — ' + s : ''), e ? 'err' : 'ok'); else alert(j + (s ? '\n' + s : '')); }

  /* ---------- Kamus & data contoh ---------- */
  const KAMUS = {
    SERAH: [['TOKO_NAMA', 'Nama usaha'], ['TOKO_ALAMAT', 'Alamat'], ['TOKO_WA', 'WA toko'], ['KODE', 'Kode booking'], ['NOTA', 'ID log'], ['TIPE', 'CHECK-OUT / CHECK-IN'], ['KELUAR', 'YA bila check-out'], ['MASUK', 'YA bila check-in'],
      ['TANGGAL', 'dd-mm-yyyy'], ['JAM', 'HH:mm'], ['PETUGAS', 'Nama petugas'], ['PENYEWA', 'Nama penyewa'], ['PENYEWA_WA', 'WA penyewa'], ['UNIT', 'Nama unit'], ['PLAT', 'Plat nomor'], ['KATEGORI', 'Motor/Mobil'],
      ['MULAI', 'Jadwal ambil'], ['SELESAI', 'Jadwal kembali'], ['LOKASI', 'Lokasi serah'], ['BBM', 'BBM %'], ['ODO', 'Odometer'], ['BBM_KELUAR', 'BBM saat keluar'], ['ODO_KELUAR', 'Odo saat keluar'], ['SELISIH_KM', 'Jarak tempuh'],
      ['#ITEM', 'Blok kelengkapan'], ['ITEM.NAMA', 'Nama item'], ['ITEM.STATUS', 'Ada/TIDAK ADA'], ['JUMLAH_FOTO', 'Jumlah foto'], ['CATATAN', 'Catatan kondisi'], ['FLAG', 'Penanda sistem'], ['TELAT_JAM', 'Jam telat'],
      ['DENDA', 'Denda (angka)'], ['BIAYA_LAIN', 'Biaya BBM/rusak'], ['DEPOSIT', 'Deposit ditahan'], ['SISA', 'Sisa tagihan'], ['JAMINAN', 'Jenis jaminan'], ['URL_VERIFIKASI', 'Tautan QR'], ['HASH', 'Sidik SHA-256'], ['PESAN_KAKI', 'Pesan kaki']],
    STRUK: [['TOKO_NAMA', 'Nama usaha'], ['TOKO_ALAMAT', 'Alamat'], ['TOKO_WA', 'WA toko'], ['NOTA', 'No. bukti'], ['KODE', 'Kode booking'], ['JENIS_BAYAR', 'DP/Pelunasan/…'], ['NOMINAL', 'Nominal (angka)'], ['METODE', 'Metode'],
      ['TANGGAL', 'Tanggal'], ['JAM', 'Jam'], ['KASIR', 'Kasir'], ['PENYEWA', 'Penyewa'], ['UNIT', 'Unit'], ['PLAT', 'Plat'], ['MULAI', 'Ambil'], ['SELESAI', 'Kembali'], ['TOTAL', 'Total tagihan'], ['TERBAYAR', 'Sudah dibayar'],
      ['SISA', 'Sisa'], ['DEPOSIT', 'Deposit ditahan'], ['LUNAS', 'YA bila lunas'], ['BELUM', 'YA bila belum'], ['STATUS', 'Teks status'], ['CATATAN', 'Catatan'], ['URL_VERIFIKASI', 'Tautan QR'], ['HASH', 'Sidik'], ['PESAN_KAKI', 'Pesan kaki']]
  };
  const PENGUBAH = ['rp', 'angka', 'kapital', 'kecil', 'judul', 'tgl', 'terbilang:rupiah', 'potong:20', 'bawaan:-', 'kosong0', 'awal:', 'akhir:'];
  const DIREKTIF = [['[C]', 'Tengah'], ['[R]', 'Kanan'], ['[B]', 'Tebal'], ['[2]', 'Huruf 2×'], ['[H]', 'Tinggi 2×'], ['[LR]kiri||kanan', 'Kiri-kanan'], ['[-]', 'Garis'], ['[=]', 'Garis ganda'], ['[BOX]', 'Blok sorot'], ['[QR]', 'QR verifikasi'], ['[BAR]', 'Barcode'], ['[LOGO]', 'Logo'], ['[FEED]', 'Baris kosong'], ['[CUT]', 'Potong'], ['// ', 'Komentar']];
  const toko = { TOKO_NAMA: 'RentFleet', TOKO_ALAMAT: 'Jl. Contoh No. 1, Bandung', TOKO_WA: '081234567890' };
  const itemKel = [{ NAMA: 'STNK', STATUS: 'Ada' }, { NAMA: 'Kunci Utama', STATUS: 'Ada' }, { NAMA: 'Kunci Serep', STATUS: 'Ada' }, { NAMA: 'Dongkrak & Toolkit', STATUS: 'Ada' }, { NAMA: 'Kartu E-Toll', STATUS: 'TIDAK ADA' }];
  const CONTOH = {
    SERAH: {
      keluar: Object.assign({}, toko, { KODE: 'RF-26-0088', NOTA: 'CHK-00012', TIPE: 'CHECK-OUT (SERAH KELUAR)', KELUAR: 'YA', MASUK: '', TANGGAL: '16-10-2026', JAM: '09:25', PETUGAS: 'Rian H.', PENYEWA: 'Ahmad Fauzi', PENYEWA_WA: '081390214821',
        UNIT: 'Toyota All New Avanza', PLAT: 'B 2841 SKZ', KATEGORI: 'Mobil', MULAI: '16 Okt 2026, 09:30', SELESAI: '19 Okt 2026, 18:00', LOKASI: 'Kantor Utama', BBM: 90, ODO: 41930, ITEM: itemKel.slice(0, 4), JUMLAH_FOTO: 4,
        CATATAN: 'Baret halus bumper kiri depan.', JAMINAN: 'E-KTP asli + Motor Vario', URL_VERIFIKASI: 'https://contoh.github.io/rentfleet/#/v/RF-26-0088-ABCDEF2345', HASH: 'sha256:9f2c1ab0e4d55a7c', PESAN_KAKI: 'Selamat berkendara, hati-hati di jalan.' }),
      masuk: Object.assign({}, toko, { KODE: 'RF-26-0088', NOTA: 'CHK-00019', TIPE: 'CHECK-IN (PENGEMBALIAN)', KELUAR: '', MASUK: 'YA', TANGGAL: '19-10-2026', JAM: '20:40', PETUGAS: 'Rian H.', PENYEWA: 'Ahmad Fauzi', PENYEWA_WA: '081390214821',
        UNIT: 'Toyota All New Avanza', PLAT: 'B 2841 SKZ', KATEGORI: 'Mobil', MULAI: '16 Okt 2026, 09:30', SELESAI: '19 Okt 2026, 18:00', LOKASI: 'Kantor Utama', BBM: 75, ODO: 42580, BBM_KELUAR: 90, ODO_KELUAR: 41930, SELISIH_KM: 650,
        ITEM: itemKel, JUMLAH_FOTO: 5, CATATAN: 'Kabin bersih.', FLAG: 'BBM kurang 15% dari saat keluar', TELAT_JAM: 2, DENDA: 100000, BIAYA_LAIN: 50000, DEPOSIT: 500000, SISA: 150000,
        URL_VERIFIKASI: 'https://contoh.github.io/rentfleet/#/v/RF-26-0088-ABCDEF2345', HASH: 'sha256:9f2c1ab0e4d55a7c', PESAN_KAKI: 'Terima kasih telah menyewa!' })
    },
    STRUK: {
      dp: Object.assign({}, toko, { NOTA: 'BYR-00031', KODE: 'RF-26-0089', JENIS_BAYAR: 'DP', NOMINAL: 350000, METODE: 'QRIS', TANGGAL: '17-10-2026', JAM: '14:20', KASIR: 'Sari', PENYEWA: 'Ahmad Dani', UNIT: 'Honda Brio RS', PLAT: 'B 1928 EFD',
        MULAI: '20 Okt 2026, 09:00', SELESAI: '22 Okt 2026, 09:00', TOTAL: 800000, TERBAYAR: 350000, SISA: 450000, DEPOSIT: 0, LUNAS: '', BELUM: 'YA', STATUS: 'BELUM LUNAS', URL_VERIFIKASI: 'https://contoh.github.io/rentfleet/#/v/RF-26-0089-QWERTY2345', PESAN_KAKI: 'Simpan struk ini sebagai bukti pembayaran.' }),
      lunas: Object.assign({}, toko, { NOTA: 'BYR-00032', KODE: 'RF-26-0088', JENIS_BAYAR: 'Pelunasan', NOMINAL: 1000000, METODE: 'Transfer', TANGGAL: '16-10-2026', JAM: '09:15', KASIR: 'Budi', PENYEWA: 'Ahmad Fauzi', UNIT: 'Toyota All New Avanza', PLAT: 'B 2841 SKZ',
        MULAI: '16 Okt 2026, 09:30', SELESAI: '19 Okt 2026, 18:00', TOTAL: 1350000, TERBAYAR: 1350000, SISA: 0, DEPOSIT: 500000, LUNAS: 'YA', BELUM: '', STATUS: 'LUNAS', URL_VERIFIKASI: 'https://contoh.github.io/rentfleet/#/v/RF-26-0088-ABCDEF2345', HASH: 'sha256:9f2c1ab0e4d55a7c', PESAN_KAKI: 'Simpan struk ini sebagai bukti pembayaran.' })
    }
  };
  function pastikanQR() { return W.qrcode || !W.RF ? Promise.resolve() : W.RF.muatQR(); }

  /* ---------- Jendela Pratinjau & Cetak ---------- */
  function pratinjau(o) {
    o = o || {};
    const jenis = o.jenis || 'STRUK', toast = o.toast || toastDef;
    let st = SP.pengaturan(o.opsi), kode = SP.pilihKode(st, jenis), h = null;
    const bg = document.createElement('div'); bg.className = 'sk sk-bg';
    bg.innerHTML = '<div class="sk-win" role="dialog" aria-modal="true"><div class="sk-h"><b>' + esc(o.judul || (jenis === 'SERAH' ? 'Tanda Terima Serah Terima' : 'Struk Pembayaran')) + (o.nomor ? ' · ' + esc(o.nomor) : '') + '</b><button class="sk-b" data-x type="button" aria-label="Tutup">✕</button></div>' +
      '<div class="sk-body"><div class="sk-prev" id="skPrev"></div><div class="sk-side">' +
      '<div><div class="sk-l">Kertas</div><div class="sk-seg" id="skLebar"><button type="button" data-l="58">58 mm</button><button type="button" data-l="80">80 mm</button></div></div>' +
      '<div><div class="sk-l">Model</div><select id="skModel"></select></div>' +
      '<div class="sk-row"><label class="sk-chk"><input type="checkbox" id="skQr"> QR</label><label class="sk-chk"><input type="checkbox" id="skLogo"> Logo</label><label class="sk-chk"><input type="checkbox" id="skHemat"> Ultra hemat</label></div>' +
      '<div class="sk-row"><div style="flex:1"><div class="sk-l">Rangkap</div><select id="skSalin"><option>1</option><option>2</option><option>3</option></select></div><div style="flex:1"><div class="sk-l">Kepekatan</div><select id="skPekat"><option value="normal">Normal</option><option value="tebal">Tebal</option></select></div></div>' +
      '<div class="sk-row"><label class="sk-chk"><input type="checkbox" id="skPotong"> Potong otomatis</label><label class="sk-chk"><input type="checkbox" id="skBeep"> Bunyi</label></div>' +
      '<div><div class="sk-l">Metode cetak</div><select id="skMetode"><option value="browser">Dialog cetak browser (USB/LAN/AirPrint)</option><option value="bt">Bluetooth langsung (Chrome Android/PC)</option><option value="rawbt">Aplikasi RawBT (Android)</option></select><div class="sk-info" id="skBt"></div></div>' +
      '<div class="sk-info" id="skInfo"></div><div class="sk-row"><button class="sk-b" id="skTes" type="button">Tes printer</button><button class="sk-b" id="skPng" type="button">Unduh PNG</button><button class="sk-b" id="skSalinTeks" type="button">Salin teks</button></div>' +
      '<p class="sk-info">Pilihan di jendela ini tersimpan di perangkat ini. Default semua kasir diatur Owner di menu Struk &amp; Printer.</p></div></div>' +
      '<div class="sk-f">' + (o.onBaru ? '<button class="sk-b" id="skBaru" type="button">+ Transaksi baru</button>' : '') + '<button class="sk-b wa" id="skWa" type="button">Kirim WhatsApp</button><button class="sk-b a" id="skCetak" type="button">🖨 Cetak (Enter)</button></div></div>';
    document.body.appendChild(bg);
    const $ = function (s) { return bg.querySelector(s); };
    const isiModel = function () { $('#skModel').innerHTML = SP.daftar(jenis).map(function (t) { return '<option value="' + esc(t.kode) + '"' + (t.kode === kode ? ' selected' : '') + '>' + esc(t.nama) + ' (' + t.lebar + ' kol)</option>'; }).join('') || '<option value="">Cadangan</option>'; };
    const sinkron = function () {
      $$('#skLebar button').forEach(function (b) { b.classList.toggle('on', Number(b.dataset.l) === st.lebar); });
      $('#skQr').checked = !!st.qr; $('#skLogo').checked = !!st.logo; $('#skHemat').checked = !!st.hemat; $('#skSalin').value = String(st.salinan || 1); $('#skPekat').value = st.kepekatan || 'normal';
      $('#skPotong').checked = !!st.potong; $('#skBeep').checked = !!st.beep; $('#skMetode').value = st.metode;
      $('#skBt').textContent = st.metode === 'bt' ? (SP.BT.didukung() ? (SP.BT.terhubung() ? 'Terhubung: ' + SP.BT.nama() : 'Belum terhubung — pemilih perangkat muncul saat Cetak.') : 'Browser ini tidak mendukung Web Bluetooth. Pakai RawBT/dialog cetak.') : st.metode === 'rawbt' ? 'Pasang aplikasi RawBT dari Play Store dan pasangkan printer di sana.' : 'Atur ukuran kertas ' + st.lebar + ' mm dan margin None di dialog cetak.';
    };
    function $$(s) { return Array.prototype.slice.call(bg.querySelectorAll(s)); }
    const gambar = function () {
      h = SP.siapkan(o.data || {}, Object.assign({}, st, { jenis: jenis, kode: kode }));
      $('#skPrev').innerHTML = E.html(h);
      $('#skInfo').textContent = 'Model ' + h.tpl.kode + ' · ' + h.kolom + ' kolom · ±' + E.panjangCm(h) + ' cm kertas';
    };
    const ubahSt = function (patch) { st = Object.assign({}, st, patch); const lok = SP.pengaturan(); SP.simpanLokal(Object.assign({}, (function () { try { return JSON.parse(localStorage.getItem('rf_printer') || '{}'); } catch (e) { return {}; } })(), patch)); if (patch.lebar) { kode = SP.pilihKode(st, jenis); isiModel(); } sinkron(); gambar(); return lok; };
    const tutup = function () { bg.remove(); document.removeEventListener('keydown', kunci); if (o.onTutup) o.onTutup(); };
    const cetak = async function () { const b = $('#skCetak'); b.disabled = true; try { const r = await SP.cetak(h, st); if (r.cadangan) toast('Dialihkan ke dialog cetak', r.cadangan, true); else toast('Dikirim ke printer', r.cara === 'bt' ? 'Bluetooth ' + SP.BT.nama() : r.cara === 'rawbt' ? 'via RawBT' : ''); } catch (e) { toast('Gagal cetak', e.message, true); } b.disabled = false; };
    const kunci = function (e) { if (e.key === 'Escape') tutup(); else if (e.key === 'Enter' && !/TEXTAREA|SELECT|INPUT/.test(document.activeElement.tagName)) { e.preventDefault(); cetak(); } };
    document.addEventListener('keydown', kunci);
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('[data-x]')) tutup(); });
    $('#skLebar').onclick = function (e) { const b = e.target.closest('button'); if (b) ubahSt({ lebar: Number(b.dataset.l) }); };
    $('#skModel').onchange = function () { kode = this.value; const p = {}; p[jenis.toLowerCase() + st.lebar] = kode; ubahSt(p); };
    [['#skQr', 'qr'], ['#skLogo', 'logo'], ['#skHemat', 'hemat'], ['#skPotong', 'potong'], ['#skBeep', 'beep']].forEach(function (x) { $(x[0]).onchange = function () { const p = {}; p[x[1]] = this.checked; ubahSt(p); }; });
    $('#skSalin').onchange = function () { ubahSt({ salinan: Number(this.value) }); };
    $('#skPekat').onchange = function () { ubahSt({ kepekatan: this.value }); };
    $('#skMetode').onchange = function () { ubahSt({ metode: this.value }); };
    $('#skTes').onclick = function () { SP.tes(st).then(function (r) { if (r && r.cadangan) toast('Tes dialihkan', r.cadangan, true); }); };
    $('#skPng').onclick = function () { E.png(h).then(function (u) { const a = document.createElement('a'); a.href = u; a.download = (o.nomor || 'struk') + '.png'; a.click(); }); };
    $('#skSalinTeks').onclick = function () { const t = E.teks(h); if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('Teks disalin'); }); else prompt('Salin:', t); };
    $('#skWa').onclick = function () { const t = o.wa ? o.wa(h) : SP.waMonospace(h, o.judul || '', o.waLink || ''); SP.bukaWa(o.waNomor || '', t); };
    $('#skCetak').onclick = cetak;
    if (o.onBaru) $('#skBaru').onclick = function () { tutup(); o.onBaru(); };
    isiModel(); sinkron(); pastikanQR().then(gambar);
    setTimeout(function () { $('#skCetak').focus(); }, 30);
    return { tutup: tutup, cetak: cetak };
  }

  /* ---------- Editor model (Owner) ---------- */
  function editor(el, o) {
    o = o || {}; const toast = o.toast || toastDef, konf = o.konfirmasi || function (t) { return Promise.resolve(confirm(t)); };
    let semua = [], aktif = null, contohKey = null;
    el.classList.add('sk');
    el.innerHTML = '<div class="sk-card">Memuat model…</div>';
    const muat = function (pilihKode) { return o.aksi('struk.semua', {}).then(function (r) { if (!r.success) { el.innerHTML = '<div class="sk-card">' + esc(r.message) + '</div>'; return; } semua = r.data.templates; gambarList(pilihKode || (aktif && aktif.kode) || (semua[0] || {}).kode); }); };
    const gambarList = function (pk) {
      el.innerHTML = '<div class="sk-ed"><div class="sk-list" id="edList"></div><div class="sk-card" id="edMain"></div><div class="sk-card" id="edPrev" style="justify-items:center"></div></div>';
      el.querySelector('#edList').innerHTML = '<button class="sk-b p" id="edBaru" type="button">+ Model baru</button>' + ['SERAH', 'STRUK'].map(function (j) {
        return '<div class="sk-l" style="margin-top:8px">' + (j === 'SERAH' ? 'Serah terima' : 'Pembayaran') + '</div>' + semua.filter(function (t) { return t.jenis === j; }).map(function (t) { return '<button type="button" class="sk-item' + (t.kode === pk ? ' on' : '') + '" data-k="' + esc(t.kode) + '"><b>' + esc(t.nama) + '</b><small>' + esc(t.kode) + ' · ' + t.lebar + ' kol · v' + t.versi + (String(t.aktif).toUpperCase() === 'N' ? ' · nonaktif' : '') + '</small></button>'; }).join('');
      }).join('') + semua.filter(function (t) { return ['SERAH', 'STRUK'].indexOf(t.jenis) === -1; }).map(function (t) { return '<button type="button" class="sk-item' + (t.kode === pk ? ' on' : '') + '" data-k="' + esc(t.kode) + '"><b>' + esc(t.nama) + '</b><small>' + esc(t.kode) + '</small></button>'; }).join('');
      el.querySelector('#edList').onclick = function (e) { const b = e.target.closest('[data-k]'); if (b) gambarList(b.dataset.k); };
      el.querySelector('#edBaru').onclick = async function () {
        const kode = (prompt('Kode model baru (huruf besar/angka/_), mis. SERAH_58_RINGKAS:') || '').trim().toUpperCase(); if (!kode) return;
        const jenis = (prompt('Jenis: SERAH atau STRUK', 'SERAH') || 'SERAH').trim().toUpperCase();
        const r = await o.aksi('struk.simpan', { kode: kode, nama: kode.replace(/_/g, ' '), jenis: jenis, lebar: 32, isi: '[C][B]{{TOKO_NAMA}}\n[-]\n[LR]Kode||{{KODE}}\n[CUT]' });
        toast(r.success ? 'Model dibuat' : 'Gagal', r.message, !r.success); if (r.success) { await muat(kode); if (o.segarkan) o.segarkan(); }
      };
      aktif = semua.filter(function (t) { return t.kode === pk; })[0];
      if (aktif) gambarMain();
    };
    const gambarMain = function () {
      const t = aktif, contoh = CONTOH[t.jenis] || CONTOH.STRUK;
      contohKey = contohKey && contoh[contohKey] ? contohKey : Object.keys(contoh)[0];
      const main = el.querySelector('#edMain');
      main.innerHTML = '<div class="sk-row"><b style="flex:1">' + esc(t.nama) + ' <span class="sk-info">' + esc(t.kode) + ' · v' + t.versi + (t.oleh ? ' · ' + esc(t.oleh) : '') + '</span></b></div>' +
        '<div class="sk-row"><label class="sk-info">Nama <input type="text" id="edNama" value="' + esc(t.nama) + '" style="width:200px"></label><label class="sk-info">Kolom <input type="number" id="edLebar" min="24" max="64" value="' + t.lebar + '" style="width:80px"></label><label class="sk-chk"><input type="checkbox" id="edAktif"' + (String(t.aktif).toUpperCase() !== 'N' ? ' checked' : '') + '> Aktif</label></div>' +
        '<textarea class="sk-code" id="edIsi" spellcheck="false">' + esc(t.isi) + '</textarea>' +
        '<div class="sk-row"><button class="sk-b p" id="edSimpan" type="button">Simpan</button><button class="sk-b" id="edDup" type="button">Duplikat</button>' + (String(t.standar).toUpperCase() === 'Y' ? '<button class="sk-b" id="edReset" type="button">Reset ke bawaan</button>' : '<button class="sk-b" id="edHapus" type="button">Hapus</button>') +
        '<button class="sk-b" id="edUnduh" type="button">Unduh .txt</button><label class="sk-b">Unggah .txt<input type="file" accept=".txt,text/plain" id="edUnggah" hidden></label>' +
        '<button class="sk-b" id="ed58" type="button">Pakai di 58 mm</button><button class="sk-b" id="ed80" type="button">Pakai di 80 mm</button></div>' +
        '<div class="sk-row"><span class="sk-l">Riwayat</span><select id="edRiw" style="width:auto"><option value="">Memuat…</option></select><button class="sk-b" id="edPulih" type="button">Pulihkan versi</button></div>' +
        '<div class="sk-l">Penanda (klik untuk sisipkan)</div><div class="sk-kamus" id="edKamus">' + (KAMUS[t.jenis] || KAMUS.STRUK).map(function (k) { return '<button type="button" title="' + esc(k[1]) + '" data-s="' + esc(k[0][0] === '#' ? '{{#' + k[0].slice(1) + '}}\n\n{{/' + k[0].slice(1) + '}}' : '{{' + k[0] + '}}') + '">' + esc(k[0]) + '</button>'; }).join('') + '</div>' +
        '<div class="sk-l">Direktif &amp; pengubah</div><div class="sk-kamus" id="edDir">' + DIREKTIF.map(function (d) { return '<button type="button" title="' + esc(d[1]) + '" data-s="' + esc(d[0]) + '">' + esc(d[0]) + '</button>'; }).join('') + PENGUBAH.map(function (p) { return '<button type="button" data-s="|' + esc(p) + '">|' + esc(p) + '</button>'; }).join('') + '</div>' +
        '<p class="sk-info">Baris yang berisi penanda tetapi hasilnya kosong otomatis dibuang. {{?KUNCI}}…{{/KUNCI}} tampil bila ada nilai. 58 mm = 32 kolom, 80 mm = 48 kolom.</p>';
      const prev = el.querySelector('#edPrev');
      const render = function () {
        const isi = main.querySelector('#edIsi').value, kol = Number(main.querySelector('#edLebar').value) || 32;
        const h = E.render(isi, contoh[contohKey], kol, { qr: true });
        prev.innerHTML = '<div class="sk-row"><span class="sk-l">Data contoh</span><select id="edContoh" style="width:auto">' + Object.keys(contoh).map(function (k) { return '<option' + (k === contohKey ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></div>' + E.html(h) + '<div class="sk-info">' + h.kolom + ' kolom · ±' + E.panjangCm(h) + ' cm</div>';
        prev.querySelector('#edContoh').onchange = function () { contohKey = this.value; render(); };
      };
      pastikanQR().then(render);
      const ta = main.querySelector('#edIsi');
      ta.addEventListener('input', debounce(render, 200)); main.querySelector('#edLebar').addEventListener('input', debounce(render, 200));
      const sisip = function (s) { const p = ta.selectionStart || 0; ta.value = ta.value.slice(0, p) + s + ta.value.slice(ta.selectionEnd || p); ta.focus(); ta.selectionStart = ta.selectionEnd = p + s.length; render(); };
      main.querySelector('#edKamus').onclick = main.querySelector('#edDir').onclick = function (e) { const b = e.target.closest('[data-s]'); if (b) sisip(b.dataset.s); };
      o.aksi('struk.detail', { kode: t.kode }).then(function (r) { const s = main.querySelector('#edRiw'); if (!s) return; const riw = r.success ? r.data.riwayat : []; s.innerHTML = riw.length ? riw.map(function (v) { return '<option value="' + v.versi + '">v' + v.versi + ' · ' + esc(v.waktu || '') + ' · ' + esc(v.oleh || '') + '</option>'; }).join('') : '<option value="">Belum ada riwayat</option>'; s._riw = riw; });
      const simpan = async function () { const r = await o.aksi('struk.simpan', { kode: t.kode, nama: main.querySelector('#edNama').value, lebar: Number(main.querySelector('#edLebar').value), isi: ta.value, aktif: main.querySelector('#edAktif').checked ? 'Y' : 'N' }); toast(r.success ? 'Tersimpan' : 'Gagal', r.message, !r.success); if (r.success) { await muat(t.kode); if (o.segarkan) o.segarkan(); } };
      main.querySelector('#edSimpan').onclick = simpan;
      main.querySelector('#edDup').onclick = async function () { const r = await o.aksi('struk.duplikat', { kode: t.kode }); toast(r.success ? 'Diduplikat' : 'Gagal', r.message, !r.success); if (r.success) muat(r.data.kode); };
      const rs = main.querySelector('#edReset'); if (rs) rs.onclick = async function () { if (!(await konf('Kembalikan model ' + t.kode + ' ke bawaan? Versi sekarang masuk riwayat.'))) return; const r = await o.aksi('struk.reset', { kode: t.kode }); toast(r.success ? 'Direset' : 'Gagal', r.message, !r.success); if (r.success) { await muat(t.kode); if (o.segarkan) o.segarkan(); } };
      const hp = main.querySelector('#edHapus'); if (hp) hp.onclick = async function () { if (!(await konf('Hapus model ' + t.kode + '?'))) return; const r = await o.aksi('struk.hapus', { kode: t.kode }); toast(r.success ? 'Dihapus' : 'Gagal', r.message, !r.success); if (r.success) { aktif = null; await muat(); if (o.segarkan) o.segarkan(); } };
      main.querySelector('#edUnduh').onclick = function () { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ta.value], { type: 'text/plain' })); a.download = t.kode + '.txt'; a.click(); };
      main.querySelector('#edUnggah').onchange = function () { const fr = new FileReader(); fr.onload = function () { ta.value = String(fr.result); render(); toast('Isi dimuat', 'Tekan Simpan untuk menyimpan'); }; fr.readAsText(this.files[0]); };
      main.querySelector('#edPulih').onclick = async function () { const v = main.querySelector('#edRiw').value; if (!v) return; if (!(await konf('Pulihkan versi ' + v + '?'))) return; const r = await o.aksi('struk.pulihkan', { kode: t.kode, versi: Number(v) }); toast(r.success ? 'Dipulihkan' : 'Gagal', r.message, !r.success); if (r.success) { await muat(t.kode); if (o.segarkan) o.segarkan(); } };
      [['#ed58', 58], ['#ed80', 80]].forEach(function (x) { main.querySelector(x[0]).onclick = async function () { const p = {}; p[t.jenis.toLowerCase() + x[1]] = t.kode; const r = await o.aksi('printer.simpan', { printer: p }); toast(r.success ? 'Dipakai di ' + x[1] + ' mm' : 'Gagal', r.message, !r.success); if (r.success && o.segarkan) o.segarkan(); }; });
    };
    muat();
  }
  function debounce(f, ms) { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(function () { f.apply(null, a); }, ms); }; }

  /* ---------- Pengaturan printer bawaan (Owner) ---------- */
  function pengaturan(el, o) {
    o = o || {}; const toast = o.toast || toastDef;
    el.classList.add('sk'); el.innerHTML = '<div class="sk-card">Memuat…</div>';
    o.aksi('struk.semua', {}).then(function (r) {
      if (!r.success) { el.innerHTML = '<div class="sk-card">' + esc(r.message) + '</div>'; return; }
      const p = r.data.printer, T = r.data.templates;
      const opsi = function (j, v) { return T.filter(function (t) { return t.jenis === j; }).map(function (t) { return '<option value="' + esc(t.kode) + '"' + (t.kode === v ? ' selected' : '') + '>' + esc(t.nama) + '</option>'; }).join(''); };
      el.innerHTML = '<div class="sk-card" style="max-width:720px"><p class="sk-info">Default untuk semua kasir & crew. Tiap perangkat tetap bisa menimpa pilihan di jendela cetak (tersimpan di perangkat itu).</p>' +
        '<div class="sk-row"><div style="flex:1"><div class="sk-l">Lebar kertas</div><select id="pLebar"><option value="58"' + (p.lebar === 58 ? ' selected' : '') + '>58 mm (Bluetooth genggam)</option><option value="80"' + (p.lebar === 80 ? ' selected' : '') + '>80 mm (kasir USB/LAN)</option></select></div>' +
        '<div style="flex:1"><div class="sk-l">Metode cetak</div><select id="pMetode"><option value="browser"' + (p.metode === 'browser' ? ' selected' : '') + '>Dialog cetak browser</option><option value="bt"' + (p.metode === 'bt' ? ' selected' : '') + '>Bluetooth langsung</option><option value="rawbt"' + (p.metode === 'rawbt' ? ' selected' : '') + '>RawBT (Android)</option></select></div></div>' +
        '<div class="sk-row"><div style="flex:1"><div class="sk-l">Serah terima 58 mm</div><select id="pS58">' + opsi('SERAH', p.serah58) + '</select></div><div style="flex:1"><div class="sk-l">Serah terima 80 mm</div><select id="pS80">' + opsi('SERAH', p.serah80) + '</select></div></div>' +
        '<div class="sk-row"><div style="flex:1"><div class="sk-l">Struk bayar 58 mm</div><select id="pB58">' + opsi('STRUK', p.struk58) + '</select></div><div style="flex:1"><div class="sk-l">Struk bayar 80 mm</div><select id="pB80">' + opsi('STRUK', p.struk80) + '</select></div></div>' +
        '<div class="sk-row"><label class="sk-chk"><input type="checkbox" id="pQr"' + (p.qr ? ' checked' : '') + '> QR verifikasi</label><label class="sk-chk"><input type="checkbox" id="pLogo"' + (p.logo ? ' checked' : '') + '> Logo (dari Konten Situs → LOGO_URL)</label><label class="sk-chk"><input type="checkbox" id="pHemat"' + (p.hemat ? ' checked' : '') + '> Ultra hemat kertas</label></div>' +
        '<div class="sk-row"><label class="sk-chk"><input type="checkbox" id="pPotong"' + (p.potong ? ' checked' : '') + '> Potong otomatis</label><label class="sk-chk"><input type="checkbox" id="pBeep"' + (p.beep ? ' checked' : '') + '> Bunyi</label><label class="sk-chk"><input type="checkbox" id="pOto"' + (p.otomatis ? ' checked' : '') + '> Buka jendela cetak otomatis setelah serah terima</label></div>' +
        '<div class="sk-row"><div><div class="sk-l">Rangkap</div><select id="pSalin"><option' + (p.salinan === 1 ? ' selected' : '') + '>1</option><option' + (p.salinan === 2 ? ' selected' : '') + '>2</option><option' + (p.salinan === 3 ? ' selected' : '') + '>3</option></select></div><div><div class="sk-l">Kepekatan</div><select id="pPekat"><option value="normal">Normal</option><option value="tebal"' + (p.kepekatan === 'tebal' ? ' selected' : '') + '>Tebal</option></select></div></div>' +
        '<div class="sk-row" style="justify-content:flex-end"><button class="sk-b" id="pTes" type="button">Tes printer</button><button class="sk-b p" id="pSimpan" type="button">Simpan pengaturan bawaan</button></div></div>';
      const $ = function (s) { return el.querySelector(s); };
      const nilai = function () { return { lebar: Number($('#pLebar').value), metode: $('#pMetode').value, serah58: $('#pS58').value, serah80: $('#pS80').value, struk58: $('#pB58').value, struk80: $('#pB80').value, qr: $('#pQr').checked, logo: $('#pLogo').checked, hemat: $('#pHemat').checked, potong: $('#pPotong').checked, beep: $('#pBeep').checked, otomatis: $('#pOto').checked, salinan: Number($('#pSalin').value), kepekatan: $('#pPekat').value }; };
      $('#pSimpan').onclick = async function () { const r = await o.aksi('printer.simpan', { printer: nilai() }); toast(r.success ? 'Tersimpan' : 'Gagal', r.message, !r.success); if (r.success) SP.pasang({ server: r.data.printer }); };
      $('#pTes').onclick = function () { SP.tes(nilai()); };
    });
  }

  W.StrukUI = { pratinjau: pratinjau, editor: editor, pengaturan: pengaturan, KAMUS: KAMUS, CONTOH: CONTOH, DIREKTIF: DIREKTIF, toast: toastDef };
})(window);
