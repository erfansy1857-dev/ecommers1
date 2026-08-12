// ==========================================
// 1. PROTEKSI HALAMAN ADMIN
// ==========================================
if (!localStorage.getItem('userLoggedIn') || localStorage.getItem('isAdmin') !== 'true') {
  alert('Akses ditolak! Halaman ini khusus untuk Admin.');
  window.location.href = 'login.html';
}

// ==========================================
// 2. LOAD DATA DARI LOCAL STORAGE
// ==========================================
let produkList = JSON.parse(localStorage.getItem('produk')) || [];
let pesananList = JSON.parse(localStorage.getItem('pesanan')) || [];
let flashSaleList = JSON.parse(localStorage.getItem('flashsale')) || [];

let modalProdukInstance = null;
let chartPendapatanInstance = null;
let imageBase64Temp = ''; // Menyimpan string gambar Base64 dari file upload

document.addEventListener('DOMContentLoaded', () => {
  modalProdukInstance = new bootstrap.Modal(document.getElementById('modalProduk'));
  renderDashboard();
  renderProdukTable();
});

function syncData() {
  localStorage.setItem('produk', JSON.stringify(produkList));
  localStorage.setItem('pesanan', JSON.stringify(pesananList));
  localStorage.setItem('flashsale', JSON.stringify(flashSaleList));
}

// ==========================================
// 3. NAVIGASI SEKSI ADMIN
// ==========================================
function showAdminSection(section) {
  // Daftar Seksi & Nav Link
  const sections = ['dashboard', 'produk', 'pesanan', 'flashsale', 'laporan'];

  sections.forEach(sec => {
    const secEl = document.getElementById(`adm-sec-${sec}`);
    const navEl = document.getElementById(`adm-${sec === 'dashboard' ? 'dash' : sec === 'produk' ? 'prod' : sec === 'pesanan' ? 'pesan' : sec === 'flashsale' ? 'flash' : 'lapor'}-link`);

    if (secEl) secEl.classList.add('d-none');
    if (navEl) navEl.classList.remove('active');
  });

  // Tampilkan seksi yang dipilih
  const activeSec = document.getElementById(`adm-sec-${section}`);
  const activeNav = document.getElementById(`adm-${section === 'dashboard' ? 'dash' : section === 'produk' ? 'prod' : section === 'pesanan' ? 'pesan' : section === 'flashsale' ? 'flash' : 'lapor'}-link`);

  if (activeSec) activeSec.classList.remove('d-none');
  if (activeNav) activeNav.classList.add('active');

  // Load data sesuai seksi
  if (section === 'dashboard') renderDashboard();
  if (section === 'produk') renderProdukTable();
  if (section === 'pesanan') renderPesananTable();
  if (section === 'flashsale') renderFlashTable();
  if (section === 'laporan') renderLaporanAndChart();
}

// ==========================================
// 4. RINGKASAN DASHBOARD
// ==========================================
function renderDashboard() {
  document.getElementById('dashTotalProduk').innerText = produkList.length;

  // Hitung Pesanan Hari Ini
  const hariIni = new Date().toISOString().split('T')[0];
  const pesananHariIni = pesananList.filter(p => {
    if (!p.tanggal) return false;
    const tglPesanan = new Date(p.tanggal).toISOString().split('T')[0];
    return tglPesanan === hariIni;
  });

  document.getElementById('dashPesananHariIni').innerText = pesananHariIni.length;
}

// ==========================================
// 5. MANAJEMEN PRODUK (CRUD)
// ==========================================
function renderProdukTable() {
  const tbody = document.getElementById('adminProdukTable');
  tbody.innerHTML = '';

  if (produkList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Belum ada produk.</td></tr>';
    return;
  }

  produkList.forEach((p, idx) => {
    const imgSrc = p.gambar || 'https://via.placeholder.com/50';
    tbody.innerHTML += `
      <tr>
        <td>
          <img src="${imgSrc}" alt="${p.nama}" width="50" height="50" class="rounded object-fit-cover">
        </td>
        <td class="fw-semibold">${p.nama}</td>
        <td><span class="badge bg-secondary">${p.kategori}</span></td>
        <td>Rp ${parseInt(p.harga || 0).toLocaleString('id-ID')}</td>
        <td>${p.stok}</td>
        <td class="text-end">
          <button onclick="editProduk(${idx})" class="btn btn-sm btn-warning me-1">Edit</button>
          <button onclick="hapusProduk(${idx})" class="btn btn-sm btn-danger">Hapus</button>
        </td>
      </tr>
    `;
  });
}

// Preview gambar saat upload dari HP/Galeri Komputer
function previewGambarGaleri(event) {
  const file = event.target.files[0];
  const previewImg = document.getElementById('prodGambarPreview');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageBase64Temp = e.target.result;
      previewImg.src = imageBase64Temp;
      previewImg.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  }
}

function bukaModalProduk() {
  document.getElementById('formProduk').reset();
  document.getElementById('prodIndex').value = '';
  document.getElementById('prodGambarPreview').classList.add('d-none');
  document.getElementById('prodGambarPreview').src = '#';
  document.getElementById('modalProdukLabel').innerText = 'Tambah Produk';
  imageBase64Temp = '';
  modalProdukInstance.show();
}

function simpanProduk(e) {
  e.preventDefault();

  const index = document.getElementById('prodIndex').value;
  const nama = document.getElementById('prodNama').value.trim();
  const kategori = document.getElementById('prodKategori').value.trim();
  const harga = parseInt(document.getElementById('prodHarga').value);
  const stok = parseInt(document.getElementById('prodStok').value);

  let gambarFinal = imageBase64Temp;

  if (index !== '') {
    // Mode Edit
    const idx = parseInt(index);
    if (!gambarFinal) {
      gambarFinal = produkList[idx].gambar; // Tetap pakai gambar lama jika tidak diubah
    }
    produkList[idx] = { id: produkList[idx].id || Date.now(), nama, kategori, harga, stok, gambar: gambarFinal };
  } else {
    // Mode Tambah
    if (!gambarFinal) {
      gambarFinal = 'https://via.placeholder.com/150'; // Default jika tidak pilih gambar
    }
    produkList.push({ id: Date.now(), nama, kategori, harga, stok, gambar: gambarFinal });
  }

  syncData();
  modalProdukInstance.hide();
  renderProdukTable();
  renderDashboard();
  alert('Data produk berhasil disimpan!');
}

function editProduk(index) {
  const p = produkList[index];
  if (!p) return;

  document.getElementById('prodIndex').value = index;
  document.getElementById('prodNama').value = p.nama;
  document.getElementById('prodKategori').value = p.kategori;
  document.getElementById('prodHarga').value = p.harga;
  document.getElementById('prodStok').value = p.stok;

  const previewImg = document.getElementById('prodGambarPreview');
  if (p.gambar) {
    previewImg.src = p.gambar;
    previewImg.classList.remove('d-none');
    imageBase64Temp = p.gambar;
  } else {
    previewImg.classList.add('d-none');
    imageBase64Temp = '';
  }

  document.getElementById('modalProdukLabel').innerText = 'Edit Produk';
  modalProdukInstance.show();
}

function hapusProduk(index) {
  if (confirm('Yakin ingin menghapus produk ini?')) {
    produkList.splice(index, 1);
    syncData();
    renderProdukTable();
    renderDashboard();
  }
}

// ==========================================
// 6. DAFTAR PESANAN
// ==========================================
function renderPesananTable() {
  const tbody = document.getElementById('adminPesananTable');
  tbody.innerHTML = '';

  if (pesananList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Belum ada pesanan masuk.</td></tr>';
    return;
  }

  pesananList.forEach(p => {
    const tglStr = p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID') : '-';
    
    // Penanganan tampilan daftar barang
    let barangStr = '-';
    if (Array.isArray(p.items)) {
      barangStr = p.items.map(item => `${item.nama} (${item.qty || 1}x)`).join(', ');
    } else if (p.barang) {
      barangStr = p.barang;
    }

    tbody.innerHTML += `
      <tr>
        <td><small>${tglStr}</small></td>
        <td class="fw-semibold">${p.nama || '-'}</td>
        <td>${p.telepon || p.noTelp || '-'}</td>
        <td><small>${p.alamat || '-'}</small></td>
        <td><small>${barangStr}</small></td>
        <td><span class="badge bg-info text-dark">${p.pembayaran || p.metodePembayaran || 'Transfer'}</span></td>
        <td class="fw-bold text-success">Rp ${parseInt(p.totalHarga || 0).toLocaleString('id-ID')}</td>
      </tr>
    `;
  });
}

// ==========================================
// 7. MANAJEMEN FLASH SALE
// ==========================================
function renderFlashTable() {
  const tbody = document.getElementById('adminFlashTable');
  tbody.innerHTML = '';

  if (flashSaleList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Belum ada produk Flash Sale.</td></tr>';
    return;
  }

  flashSaleList.forEach((fs, idx) => {
    const hargaAsli = parseInt(fs.hargaAsli || fs.harga || 0);
    const diskon = parseInt(fs.diskon || 0);
    const hargaDiskon = hargaAsli - (hargaAsli * (diskon / 100));

    tbody.innerHTML += `
      <tr>
        <td class="fw-semibold">${fs.nama}</td>
        <td class="text-muted text-decoration-line-through">Rp ${hargaAsli.toLocaleString('id-ID')}</td>
        <td><span class="badge bg-danger">-${diskon}%</span></td>
        <td class="fw-bold text-danger">Rp ${hargaDiskon.toLocaleString('id-ID')}</td>
        <td class="text-end">
          <button onclick="hapusFlashSale(${idx})" class="btn btn-sm btn-outline-danger">Hapus</button>
        </td>
      </tr>
    `;
  });
}

function tambahFlashSalePrompt() {
  if (produkList.length === 0) {
    alert('Tambah produk terlebih dahulu di menu Produk!');
    return;
  }

  let pesanOpsi = "Pilih nomor produk yang ingin dijadikan Flash Sale:\n\n";
  produkList.forEach((p, i) => {
    pesanOpsi += `${i + 1}. ${p.nama} (Rp ${parseInt(p.harga).toLocaleString('id-ID')})\n`;
  });

  const pilihan = prompt(pesanOpsi);
  if (!pilihan) return;

  const idxProduk = parseInt(pilihan) - 1;
  if (isNaN(idxProduk) || idxProduk < 0 || idxProduk >= produkList.length) {
    alert('Nomor produk tidak valid!');
    return;
  }

  const diskonStr = prompt('Masukkan persentase diskon (1-99%):', '20');
  if (!diskonStr) return;

  const diskon = parseInt(diskonStr);
  if (isNaN(diskon) || diskon <= 0 || diskon >= 100) {
    alert('Persentase diskon tidak valid!');
    return;
  }

  const prodSelected = produkList[idxProduk];
  flashSaleList.push({
    produkId: prodSelected.id,
    nama: prodSelected.nama,
    hargaAsli: prodSelected.harga,
    diskon: diskon
  });

  syncData();
  renderFlashTable();
  alert('Produk berhasil ditambahkan ke Flash Sale!');
}

function hapusFlashSale(index) {
  if (confirm('Hapus produk ini dari Flash Sale?')) {
    flashSaleList.splice(index, 1);
    syncData();
    renderFlashTable();
  }
}

// ==========================================
// 8. REKAP LAPORAN & GRAFIK (CHART.JS)
// ==========================================
function renderLaporanAndChart() {
  const sekarang = new Date();

  let totalMinggu = 0;
  let totalBulan = 0;
  let totalTahun = 0;
  let totalSemua = 0;

  // Objek untuk grafik harian (7 hari terakhir)
  const data7Hari = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(sekarang.getDate() - i);
    const key = d.toISOString().split('T')[0];
    data7Hari[key] = 0;
  }

  pesananList.forEach(p => {
    if (!p.tanggal) return;
    const tgl = new Date(p.tanggal);
    const nominal = parseInt(p.totalHarga || 0);

    totalSemua += nominal;

    // Cek Tahun Ini
    if (tgl.getFullYear() === sekarang.getFullYear()) {
      totalTahun += nominal;

      // Cek Bulan Ini
      if (tgl.getMonth() === sekarang.getMonth()) {
        totalBulan += nominal;
      }
    }

    // Cek Minggu Ini (7 Hari Terakhir)
    const selisihHari = (sekarang - tgl) / (1000 * 60 * 60 * 24);
    if (selisihHari >= 0 && selisihHari <= 7) {
      totalMinggu += nominal;
    }

    // Data Grafik
    const keyTgl = tgl.toISOString().split('T')[0];
    if (data7Hari[keyTgl] !== undefined) {
      data7Hari[keyTgl] += nominal;
    }
  });

  // Display ke Card Laporan
  document.getElementById('lapMinggu').innerText = `Rp ${totalMinggu.toLocaleString('id-ID')}`;
  document.getElementById('lapBulan').innerText = `Rp ${totalBulan.toLocaleString('id-ID')}`;
  document.getElementById('lapTahun').innerText = `Rp ${totalTahun.toLocaleString('id-ID')}`;
  document.getElementById('lapTotal').innerText = `Rp ${totalSemua.toLocaleString('id-ID')}`;

  // Render Chart.js
  const ctx = document.getElementById('grafikPendapatan').getContext('2d');
  const labels = Object.keys(data7Hari).map(tgl => {
    const d = new Date(tgl);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  });
  const values = Object.values(data7Hari);

  if (chartPendapatanInstance) {
    chartPendapatanInstance.destroy();
  }

  chartPendapatanInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pendapatan (Rp)',
        data: values,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rp ' + value.toLocaleString('id-ID');
            }
          }
        }
      }
    }
  });
}

// ==========================================
// 9. LOGOUT
// ==========================================
function logoutAdmin() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('isAdmin');
  window.location.href = 'login.html';
}
