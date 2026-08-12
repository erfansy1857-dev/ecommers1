/* =========================================================
   SCRIPT UNTUK HALAMAN ADMIN (admin.html)
   ========================================================= */

// Proteksi Halaman Admin
if (localStorage.getItem("isAdmin") !== "true") {
    alert("Akses ditolak! Anda harus login sebagai Admin.");
    window.location.href = "login.html";
}

// Navigasi Tab Single Page
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabName}`);
    const activeNav = document.getElementById(`nav-${tabName}`);

    if (activeTab) activeTab.classList.remove('d-none');
    if (activeNav) activeNav.classList.add('active');

    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'produk') loadProdukAdmin();
    if (tabName === 'pesanan') loadPesananAdmin();
    if (tabName === 'flashsale') loadFlashSaleAdmin();
    if (tabName === 'laporan') loadLaporanAdmin();
}

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

// 1. DASHBOARD
function loadDashboard() {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const pesananList = JSON.parse(localStorage.getItem("pesanan")) || [];

    document.getElementById("dash-total-produk").innerText = produkList.length;

    const todayStr = new Date().toISOString().split('T')[0];
    const pesananToday = pesananList.filter(p => p.tanggal && p.tanggal.split('T')[0] === todayStr);

    document.getElementById("dash-pesanan-today").innerText = pesananToday.length;
}

// 2. KELOLA PRODUK
function loadProdukAdmin() {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const container = document.getElementById("admin-produk-list");

    if (produkList.length === 0) {
        container.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Belum ada produk.</td></tr>`;
        return;
    }

    container.innerHTML = produkList.map(p => `
        <tr>
            <td class="ps-3"><img src="${p.gambar}" style="width:50px; height:50px; object-fit:cover;" class="rounded-3 shadow-sm"></td>
            <td class="fw-semibold">${p.nama}</td>
            <td><span class="badge bg-secondary font-weight-normal">${p.kategori}</span></td>
            <td class="text-warning fw-bold">${formatRupiah(p.harga)}</td>
            <td>${p.stok}</td>
            <td class="small text-truncate" style="max-width: 150px;">${p.video || '-'}</td>
            <td class="text-end pe-3">
                <button class="btn btn-sm btn-outline-dark me-1" onclick="editProdukPrompt(${p.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="hapusProduk(${p.id})"><i class="bi bi-trash-fill"></i></button>
            </td>
        </tr>
    `).join('');
}

function tambahProdukPrompt() {
    const nama = prompt("Masukkan Nama Produk:");
    if (!nama) return;

    const harga = prompt("Masukkan Harga Produk (angka):");
    if (!harga || isNaN(harga)) return alert("Harga harus angka!");

    const stok = prompt("Masukkan Jumlah Stok:");
    if (!stok || isNaN(stok)) return alert("Stok harus angka!");

    const kategori = prompt("Masukkan Kategori (Smartphone, Laptop, Aksesoris, dll):");
    if (!kategori) return;

    const gambar = prompt("Masukkan URL Gambar Produk:");
    if (!gambar) return;

    const video = prompt("Masukkan URL Vidio (YouTube Embed/Link):") || "";

    let produkList = JSON.parse(localStorage.getItem("produk")) || [];
    produkList.push({
        id: Date.now(),
        nama: nama,
        harga: Number(harga),
        stok: Number(stok),
        kategori: kategori,
        gambar: gambar,
        video: video,
        deskripsi: "Produk unggulan berkualitas terbaik."
    });

    localStorage.setItem("produk", JSON.stringify(produkList));
    loadProdukAdmin();
    alert("Produk berhasil ditambahkan!");
}

function editProdukPrompt(id) {
    let produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const prod = produkList.find(p => p.id === id);
    if (!prod) return;

    const nama = prompt("Edit Nama Produk:", prod.nama);
    if (nama === null) return;

    const harga = prompt("Edit Harga Produk:", prod.harga);
    if (harga === null || isNaN(harga)) return alert("Harga harus angka!");

    const stok = prompt("Edit Stok Produk:", prod.stok);
    if (stok === null || isNaN(stok)) return alert("Stok harus angka!");

    const kategori = prompt("Edit Kategori Produk:", prod.kategori);
    if (kategori === null) return;

    const gambar = prompt("Edit URL Gambar:", prod.gambar);
    if (gambar === null) return;

    const video = prompt("Edit URL Vidio:", prod.video || "");

    prod.nama = nama;
    prod.harga = Number(harga);
    prod.stok = Number(stok);
    prod.kategori = kategori;
    prod.gambar = gambar;
    prod.video = video;

    localStorage.setItem("produk", JSON.stringify(produkList));
    loadProdukAdmin();
    alert("Data produk berhasil diperbarui!");
}

function hapusProduk(id) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
        let produkList = JSON.parse(localStorage.getItem("produk")) || [];
        produkList = produkList.filter(p => p.id !== id);
        localStorage.setItem("produk", JSON.stringify(produkList));
        loadProdukAdmin();
    }
}

// 3. PESANAN
function loadPesananAdmin() {
    const pesananList = JSON.parse(localStorage.getItem("pesanan")) || [];
    const container = document.getElementById("admin-pesanan-list");

    if (pesananList.length === 0) {
        container.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Belum ada pesanan masuk.</td></tr>`;
        return;
    }

    container.innerHTML = pesananList.map(p => {
        const tgl = new Date(p.tanggal).toLocaleDateString("id-ID", {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        return `
            <tr>
                <td class="ps-3 small text-muted">${tgl}</td>
                <td class="fw-semibold">${p.nama}</td>
                <td>${p.telepon}</td>
                <td class="small">${p.alamat}</td>
                <td><span class="badge bg-light text-dark border">${p.daftarBarang}</span></td>
                <td class="text-warning fw-bold">${formatRupiah(p.totalHarga)}</td>
            </tr>
        `;
    }).join('');
}

// 4. FLASH SALE
function loadFlashSaleAdmin() {
    const flashList = JSON.parse(localStorage.getItem("flashsale")) || [];
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const container = document.getElementById("admin-flashsale-list");

    if (flashList.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Belum ada item Flash Sale.</td></tr>`;
        return;
    }

    let html = "";
    flashList.forEach((fs, index) => {
        const prod = produkList.find(p => p.id === fs.produkId);
        if (prod) {
            const hargaDiskon = prod.harga - (prod.harga * (fs.diskonPercent / 100));
            html += `
                <tr>
                    <td class="ps-3 fw-semibold">${prod.nama}</td>
                    <td>${formatRupiah(prod.harga)}</td>
                    <td><span class="badge bg-danger">-${fs.diskonPercent}%</span></td>
                    <td class="text-danger fw-bold">${formatRupiah(hargaDiskon)}</td>
                    <td class="text-end pe-3">
                        <button class="btn btn-sm btn-outline-danger" onclick="hapusFlashSale(${index})"><i class="bi bi-trash-fill"></i> Hapus</button>
                    </td>
                </tr>
            `;
        }
    });

    container.innerHTML = html;
}

function tambahFlashSalePrompt() {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    if (produkList.length === 0) return alert("Tambahkan produk terlebih dahulu!");

    let pListString = produkList.map((p, i) => `${i + 1}. ${p.nama} (${formatRupiah(p.harga)})`).join("\n");
    let pChoice = prompt(`Pilih Produk untuk Flash Sale (Ketik No Urut):\n\n${pListString}`);

    if (!pChoice || isNaN(pChoice) || pChoice < 1 || pChoice > produkList.length) {
        return alert("Pilihan tidak valid!");
    }

    const selectedProduk = produkList[pChoice - 1];
    let diskon = prompt(`Masukkan Persentase Diskon % untuk ${selectedProduk.nama}:`, "10");

    if (!diskon || isNaN(diskon) || diskon <= 0 || diskon >= 100) {
        return alert("Masukkan angka diskon 1 - 99!");
    }

    let flashList = JSON.parse(localStorage.getItem("flashsale")) || [];
    flashList = flashList.filter(fs => fs.produkId !== selectedProduk.id);
    flashList.push({ produkId: selectedProduk.id, diskonPercent: Number(diskon) });

    localStorage.setItem("flashsale", JSON.stringify(flashList));
    loadFlashSaleAdmin();
    alert("Flash Sale berhasil ditambahkan!");
}

function hapusFlashSale(index) {
    let flashList = JSON.parse(localStorage.getItem("flashsale")) || [];
    flashList.splice(index, 1);
    localStorage.setItem("flashsale", JSON.stringify(flashList));
    loadFlashSaleAdmin();
}

// 5. LAPORAN PENJUALAN
function loadLaporanAdmin() {
    const pesananList = JSON.parse(localStorage.getItem("pesanan")) || [];
    const now = new Date();

    let totalMingguIni = 0, totalBulanIni = 0, totalTahunIni = 0, totalKeseluruhan = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    pesananList.forEach(p => {
        const pDate = new Date(p.tanggal);
        const harga = Number(p.totalHarga) || 0;

        totalKeseluruhan += harga;
        if (pDate >= oneWeekAgo && pDate <= now) totalMingguIni += harga;
        if (pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear()) totalBulanIni += harga;
        if (pDate.getFullYear() === now.getFullYear()) totalTahunIni += harga;
    });

    document.getElementById("lap-minggu").innerText = formatRupiah(totalMingguIni);
    document.getElementById("lap-bulan").innerText = formatRupiah(totalBulanIni);
    document.getElementById("lap-tahun").innerText = formatRupiah(totalTahunIni);
    document.getElementById("lap-total").innerText = formatRupiah(totalKeseluruhan);
}

function logoutAdmin() {
    localStorage.removeItem("isAdmin");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});