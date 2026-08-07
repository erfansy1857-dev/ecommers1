// Proteksi Halaman Admin
if (localStorage.getItem('isAdmin') !== 'true') {
  alert('Akses Ditolak! Silakan login sebagai admin.');
  window.location.href = 'login.html';
}

// Ambil Data awal
let produkList = JSON.parse(localStorage.getItem('produk')) || [];
let pesananList = JSON.parse(localStorage.getItem('pesanan')) || [];
let flashSaleList = JSON.parse(localStorage.getItem('flashsale')) || [];

// Navigasi Admin
function showAdminSection(sec) {
  ['dashboard', 'produk', 'pesanan', 'flashsale', 'laporan'].forEach(s => {
    document.getElementById(`adm-sec-${s}`).classList.add('d-none');
    document.getElementById(`adm-${s.substring(0, 4)}-link`)?.classList.remove('active');
  });

  document.getElementById(`adm-sec-${sec}`).classList.remove('d-none');
  
  if (sec === 'dashboard') renderAdminDashboard();
  if (sec === 'produk') renderAdminProduk();
  if (sec === 'pesanan') renderAdminPesanan();
  if (sec === 'flashsale') renderAdminFlashSale();
  if (sec === 'laporan') renderAdminLaporan();
}

// 1. Dashboard
function renderAdminDashboard() {
  document.getElementById('dashTotalProduk').innerText = produkList.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const countToday = pesananList.filter(p => p.tanggal.startsWith(todayStr)).length;
  document.getElementById('dashPesananHariIni').innerText = countToday;
}

// 2. Produk (Tambah via Prompt)
function renderAdminProduk() {
  const tbody = document.getElementById('adminProdukTable');
  tbody.innerHTML = '';

  produkList.forEach((p, idx) => {
    tbody.innerHTML += `
      <tr>
        <td><img src="${p.gambar}" width="50" height="50" class="rounded object-fit-cover"></td>
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

function tambahProdukPrompt() {
  const nama = prompt("Masukkan Nama Produk:");
  if (!nama) return;
  const harga = parseInt(prompt("Masukkan Harga Produk (Angka):"));
  const stok = parseInt(prompt("Masukkan Stok Produk (Angka):"));
  const kategori = prompt("Masukkan Kategori Produk:");
  const gambar = prompt("Masukkan URL Gambar Produk:");

  if (nama && !isNaN(harga) && !isNaN(stok) && kategori && gambar) {
    const produkBaru = { id: Date.now(), nama, harga, stok, kategori, gambar };
    produkList.push(produkBaru);
    saveAndRefresh();
  } else {
    alert("Input tidak valid!");
  }
}

function editProduk(idx) {
  const p = produkList[idx];
  const nama = prompt("Edit Nama Produk:", p.nama);
  const harga = parseInt(prompt("Edit Harga Produk:", p.harga));
  const stok = parseInt(prompt("Edit Stok Produk:", p.stok));
  const kategori = prompt("Edit Kategori Produk:", p.kategori);
  const gambar = prompt("Edit URL Gambar:", p.gambar);

  if (nama && !isNaN(harga) && !isNaN(stok) && kategori && gambar) {
    produkList[idx] = { ...p, nama, harga, stok, kategori, gambar };
    saveAndRefresh();
  }
}

function hapusProduk(idx) {
  if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    produkList.splice(idx, 1);
    saveAndRefresh();
  }
}

// 3. Pesanan
function renderAdminPesanan() {
  const tbody = document.getElementById('adminPesananTable');
  tbody.innerHTML = '';

  pesananList.forEach(p => {
    const barangStr = p.items.map(i => i.nama).join(', ');
    const tgl = new Date(p.tanggal).toLocaleDateString('id-ID');

    tbody.innerHTML += `
      <tr>
        <td>${tgl}</td>
        <td class="fw-bold">${p.nama}</td>
        <td>${p.telepon}</td>
        <td>${p.alamat}</td>
        <td><small>${barangStr}</small></td>
        <td class="text-success fw-bold">Rp ${p.totalHarga.toLocaleString('id-ID')}</td>
      </tr>
    `;
  });
}

// 4. Flash Sale
function renderAdminFlashSale() {
  const tbody = document.getElementById('adminFlashTable');
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
    const tgl = new Date(p.tanggal);
    const diffTime = Math.abs(now - tgl);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    totalKeseluruhan += p.totalHarga;

    if (diffDays <= 7) totalMinggu += p.totalHarga;
    if (tgl.getMonth() === now.getMonth() && tgl.getFullYear() === now.getFullYear()) totalBulan += p.totalHarga;
    if (tgl.getFullYear() === now.getFullYear()) totalTahun += p.totalHarga;
  });

  document.getElementById('lapMinggu').innerText = `Rp ${totalMinggu.toLocaleString('id-ID')}`;
  document.getElementById('lapBulan').innerText = `Rp ${totalBulan.toLocaleString('id-ID')}`;
  document.getElementById('lapTahun').innerText = `Rp ${totalTahun.toLocaleString('id-ID')}`;
  document.getElementById('lapTotal').innerText = `Rp ${totalKeseluruhan.toLocaleString('id-ID')}`;
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
let chartPendapatan = null;

function renderGrafikPendapatan() {

    const dataHarian = {};

    pesananList.forEach(p => {

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
// Initial View
renderAdminDashboard();