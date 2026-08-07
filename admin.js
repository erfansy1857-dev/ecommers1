// Proteksi Halaman Admin
if (localStorage.getItem('isAdmin') !== 'true') {
  alert('Akses Ditolak! Silakan login sebagai admin.');
  window.location.href = 'login.html';
}

// Ambil Data awal dari LocalStorage
let produkList = JSON.parse(localStorage.getItem('produk')) || [];
let pesananList = JSON.parse(localStorage.getItem('pesanan')) || [];
let flashSaleList = JSON.parse(localStorage.getItem('flashsale')) || [];

// Navigasi Admin (Pindah Tab)
function showAdminSection(sec) {
  const mapLink = {
    'dashboard': 'adm-dash-link',
    'produk': 'adm-prod-link',
    'pesanan': 'adm-pesan-link',
    'flashsale': 'adm-flash-link',
    'laporan': 'adm-lapor-link'
  };

  ['dashboard', 'produk', 'pesanan', 'flashsale', 'laporan'].forEach(s => {
    document.getElementById(`adm-sec-${s}`)?.classList.add('d-none');
    document.getElementById(mapLink[s])?.classList.remove('active');
  });

  document.getElementById(`adm-sec-${sec}`)?.classList.remove('d-none');
  document.getElementById(mapLink[sec])?.classList.add('active');

  if (sec === 'dashboard') renderAdminDashboard();
  if (sec === 'produk') renderAdminProduk();
  if (sec === 'pesanan') renderAdminPesanan();
  if (sec === 'flashsale') renderAdminFlashSale();
  if (sec === 'laporan') renderAdminLaporan();
}

// 1. Dashboard
function renderAdminDashboard() {
  const totalEl = document.getElementById('dashTotalProduk');
  if (totalEl) totalEl.innerText = produkList.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const countToday = pesananList.filter(p => p.tanggal && p.tanggal.startsWith(todayStr)).length;
  const todayEl = document.getElementById('dashPesananHariIni');
  if (todayEl) todayEl.innerText = countToday;
}

// 2. Produk
function renderAdminProduk() {
  const tbody = document.getElementById('adminProdukTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  produkList.forEach((p, idx) => {
    tbody.innerHTML += `
      <tr>
        <td><img src="${p.gambar}" width="50" height="50" class="rounded object-fit-cover" alt="${p.nama}"></td>
        <td class="fw-bold">${p.nama}</td>
        <td><span class="badge bg-secondary">${p.kategori}</span></td>
        <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
        <td>${p.stok}</td>
        <td>
          <button onclick="editProduk(${idx})" class="btn btn-sm btn-warning me-1">Edit</button>
          <button onclick="hapusProduk(${idx})" class="btn btn-sm btn-danger">Hapus</button>
        </td>
      </tr>
    `;
  });
}

// Buka Modal Tambah/Edit Produk
function bukaModalProduk(idx = null) {
  const modalEl = document.getElementById('modalProduk');
  
  if (!modalEl) {
    alert('Elemen modal tidak ditemukan di HTML!');
    return;
  }

  const form = document.getElementById('formProduk');
  if (form) form.reset();

  const preview = document.getElementById('prodGambarPreview');
  if (preview) {
    preview.src = '#';
    preview.classList.add('d-none');
  }

  const fileInput = document.getElementById('prodGambarFile');
  if (fileInput) fileInput.value = '';

  if (idx !== null) {
    // Mode Edit
    const p = produkList[idx];
    const label = document.getElementById('modalProdukLabel');
    if (label) label.innerText = 'Edit Produk';
    
    document.getElementById('prodIndex').value = idx;
    document.getElementById('prodNama').value = p.nama || '';
    document.getElementById('prodKategori').value = p.kategori || '';
    document.getElementById('prodHarga').value = p.harga || 0;
    document.getElementById('prodStok').value = p.stok || 0;

    if (p.gambar && preview) {
      preview.src = p.gambar;
      preview.classList.remove('d-none');
    }
  } else {
    // Mode Tambah
    const label = document.getElementById('modalProdukLabel');
    if (label) label.innerText = 'Tambah Produk';
    
    document.getElementById('prodIndex').value = '';
  }

  try {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  } catch (err) {
    console.error('Gagal membuka modal Bootstrap:', err);
    alert('Gagal membuka form modal.');
  }
}

function tambahProdukPrompt() {
  bukaModalProduk();
}

// Pratinjau Gambar saat memilih file dari galeri
function previewGambarGaleri(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('prodGambarPreview');

  if (file && preview) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  } else if (preview) {
    preview.src = '#';
    preview.classList.add('d-none');
  }
}

// Kompresi Gambar Otomatis
function kompresGambar(file, maxWidth = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Simpan Produk (Tambah Baru / Edit)
async function simpanProduk(event) {
  event.preventDefault();

  const idx = document.getElementById('prodIndex').value;
  const nama = document.getElementById('prodNama').value.trim();
  const kategori = document.getElementById('prodKategori').value.trim();
  const harga = parseInt(document.getElementById('prodHarga').value);
  const stok = parseInt(document.getElementById('prodStok').value);
  const fileInput = document.getElementById('prodGambarFile');

  let gambarUrl = '';

  try {
    if (fileInput && fileInput.files && fileInput.files[0]) {
      gambarUrl = await kompresGambar(fileInput.files[0]);
    } else if (idx !== '' && produkList[idx]) {
      gambarUrl = produkList[idx].gambar;
    } else {
      alert('Silakan pilih gambar terlebih dahulu!');
      return;
    }

    if (idx !== '') {
      produkList[idx] = { ...produkList[idx], nama, harga, stok, kategori, gambar: gambarUrl };
    } else {
      const produkBaru = { id: Date.now(), nama, harga, stok, kategori, gambar: gambarUrl };
      produkList.push(produkBaru);
    }

    saveAndRefresh();

    const modalEl = document.getElementById('modalProduk');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    alert('Produk berhasil disimpan!');
  } catch (error) {
    console.error('Gagal menyimpan produk:', error);
    alert('Terjadi kesalahan saat mengolah gambar.');
  }
}

function editProduk(idx) {
  bukaModalProduk(idx);
}

function hapusProduk(idx) {
  if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    produkList.splice(idx, 1);
    saveAndRefresh();
  }
}

// 3. PESANAN (Ditambahkan tampilan Metode Pembayaran)
function renderAdminPesanan() {
  const tbody = document.getElementById('adminPesananTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  pesananList.forEach(p => {
    const barangStr = p.items ? p.items.map(i => i.nama).join(', ') : '-';
    const tgl = p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID') : '-';
    const metode = p.metodePembayaran || 'Transfer Bank';

    tbody.innerHTML += `
      <tr>
        <td>${tgl}</td>
        <td class="fw-bold">${p.nama}</td>
        <td>${p.telepon}</td>
        <td>${p.alamat}</td>
        <td><small>${barangStr}</small></td>
        <td><span class="badge bg-info text-dark">${metode}</span></td>
        <td class="text-success fw-bold">Rp ${(p.totalHarga || 0).toLocaleString('id-ID')}</td>
      </tr>
    `;
  });
}

// 4. Flash Sale
function renderAdminFlashSale() {
  const tbody = document.getElementById('adminFlashTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  flashSaleList.forEach((fs, idx) => {
    const p = produkList.find(prod => prod.id === fs.produkId);
    if (!p) return;

    const hargaDiskon = p.harga - (p.harga * (fs.diskon / 100));

    tbody.innerHTML += `
      <tr>
        <td>${p.nama}</td>
        <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
        <td>${fs.diskon}%</td>
        <td class="text-danger fw-bold">Rp ${hargaDiskon.toLocaleString('id-ID')}</td>
        <td>
          <button onclick="hapusFlashSale(${idx})" class="btn btn-sm btn-danger">Hapus</button>
        </td>
      </tr>
    `;
  });
}

function tambahFlashSalePrompt() {
  if (produkList.length === 0) {
    alert("Tidak ada produk tersedia!");
    return;
  }

  let pOptions = produkList.map((p, i) => `${i + 1}. ${p.nama}`).join('\n');
  const choice = parseInt(prompt(`Pilih Nomor Produk untuk Flash Sale:\n${pOptions}`)) - 1;

  if (isNaN(choice) || choice < 0 || choice >= produkList.length) {
    alert("Pilihan tidak valid!");
    return;
  }

  const diskon = parseInt(prompt("Masukkan Diskon (%):"));
  if (!isNaN(diskon) && diskon > 0 && diskon <= 100) {
    flashSaleList.push({ produkId: produkList[choice].id, diskon });
    localStorage.setItem('flashsale', JSON.stringify(flashSaleList));
    renderAdminFlashSale();
  } else {
    alert("Persentase diskon tidak valid!");
  }
}

function hapusFlashSale(idx) {
  flashSaleList.splice(idx, 1);
  localStorage.setItem('flashsale', JSON.stringify(flashSaleList));
  renderAdminFlashSale();
}

// 5. Laporan Penjualan
function renderAdminLaporan() {
  const now = new Date();
  let totalMinggu = 0, totalBulan = 0, totalTahun = 0, totalKeseluruhan = 0;

  pesananList.forEach(p => {
    if (!p.tanggal || !p.totalHarga) return;
    const tgl = new Date(p.tanggal);
    const diffTime = Math.abs(now - tgl);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    totalKeseluruhan += p.totalHarga;

    if (diffDays <= 7) totalMinggu += p.totalHarga;
    if (tgl.getMonth() === now.getMonth() && tgl.getFullYear() === now.getFullYear()) totalBulan += p.totalHarga;
    if (tgl.getFullYear() === now.getFullYear()) totalTahun += p.totalHarga;
  });

  const lapMinggu = document.getElementById('lapMinggu');
  const lapBulan = document.getElementById('lapBulan');
  const lapTahun = document.getElementById('lapTahun');
  const lapTotal = document.getElementById('lapTotal');

  if (lapMinggu) lapMinggu.innerText = `Rp ${totalMinggu.toLocaleString('id-ID')}`;
  if (lapBulan) lapBulan.innerText = `Rp ${totalBulan.toLocaleString('id-ID')}`;
  if (lapTahun) lapTahun.innerText = `Rp ${totalTahun.toLocaleString('id-ID')}`;
  if (lapTotal) lapTotal.innerText = `Rp ${totalKeseluruhan.toLocaleString('id-ID')}`;

  renderGrafikPendapatan();
}

// Helper Simpan & Update Data
function saveAndRefresh() {
  localStorage.setItem('produk', JSON.stringify(produkList));
  renderAdminProduk();
  renderAdminDashboard();
}

function logoutAdmin() {
  localStorage.setItem('isAdmin', 'false');
  localStorage.removeItem('userLoggedIn');
  window.location.href = 'login.html';
}

// Grafik Pendapatan via Chart.js
let chartPendapatan = null;

function renderGrafikPendapatan() {
  const dataHarian = {};

  pesananList.forEach(p => {
    if (!p.tanggal || !p.totalHarga) return;
    const tanggal = new Date(p.tanggal).toLocaleDateString("id-ID");

    if (!dataHarian[tanggal]) {
      dataHarian[tanggal] = 0;
    }

    dataHarian[tanggal] += p.totalHarga;
  });

  const labels = Object.keys(dataHarian);
  const data = Object.values(dataHarian);

  const ctx = document.getElementById("grafikPendapatan");

  if (!ctx) return;

  if (chartPendapatan) {
    chartPendapatan.destroy();
  }

  chartPendapatan = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Pendapatan Harian",
        data: data,
        borderColor: "#198754",
        backgroundColor: "rgba(25,135,84,0.2)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

// Jalankan tampilan awal
renderAdminDashboard();