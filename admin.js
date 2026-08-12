/* =========================================================
   SCRIPT UNTUK HALAMAN PELANGGAN (index.html)
   ========================================================= */

// Redirect ke login.html jika belum set status login
if (localStorage.getItem("isAdmin") === null) {
    window.location.href = "login.html";
}

// Inisialisasi Data Default jika localStorage masih kosong
function initDefaultData() {
    if (!localStorage.getItem("produk")) {
        const defaultProduk = [
            {
                id: 1,
                nama: "Smartphone Flagship X",
                harga: 12000000,
                stok: 15,
                kategori: "Smartphone",
                gambar: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                deskripsi: "Smartphone dengan kamera kelas profesional 108MP, layar AMOLED 120Hz."
            },
            {
                id: 2,
                nama: "Laptop Pro 15 Inch",
                harga: 18500000,
                stok: 8,
                kategori: "Laptop",
                gambar: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                deskripsi: "Laptop performa tinggi cocok untuk desainer dan programmer."
            },
            {
                id: 3,
                nama: "Wireless Headphone ANC",
                harga: 2500000,
                stok: 25,
                kategori: "Aksesoris",
                gambar: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
                video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                deskripsi: "Headphone nirkabel dengan Active Noise Cancelling dan daya tahan baterai 30 jam."
            }
        ];
        localStorage.setItem("produk", JSON.stringify(defaultProduk));
    }

    if (!localStorage.getItem("keranjang")) localStorage.setItem("keranjang", JSON.stringify([]));
    if (!localStorage.getItem("pesanan")) localStorage.setItem("pesanan", JSON.stringify([]));
    if (!localStorage.getItem("flashsale")) {
        localStorage.setItem("flashsale", JSON.stringify([{ produkId: 3, diskonPercent: 20 }]));
    }
}

initDefaultData();

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

// 1. DASHBOARD: Render Produk
function renderProducts() {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const searchVal = document.getElementById("search-input") ? document.getElementById("search-input").value.toLowerCase() : "";
    const filterCat = document.getElementById("filter-kategori") ? document.getElementById("filter-kategori").value : "";

    let filtered = produkList.filter(p => {
        const matchSearch = p.nama.toLowerCase().includes(searchVal);
        const matchCat = filterCat === "" || p.kategori === filterCat;
        return matchSearch && matchCat;
    });

    let isDefaultView = searchVal === "" && filterCat === "";
    let displayList = isDefaultView ? filtered.slice(0, 4) : filtered;

    const countLabel = document.getElementById("product-count-label");
    if (countLabel) {
        countLabel.innerText = isDefaultView ? `Menampilkan 4 produk populer` : `Menemukan ${displayList.length} produk`;
    }

    const container = document.getElementById("produk-list");
    if (!container) return;

    if (displayList.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-5"><i class="bi bi-inbox fs-1 d-block mb-2"></i>Produk tidak ditemukan.</div>`;
        return;
    }

    container.innerHTML = displayList.map(p => `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 product-card shadow-sm border-0">
                <img src="${p.gambar}" class="card-img-top product-img" alt="${p.nama}" onclick="openProductModal(${p.id})">
                <div class="card-body d-flex flex-column p-3">
                    <span class="badge bg-secondary mb-2 align-self-start font-weight-normal">${p.kategori}</span>
                    <h6 class="card-title fw-bold text-dark mb-1 text-truncate" onclick="openProductModal(${p.id})" style="cursor:pointer;">${p.nama}</h6>
                    <p class="text-warning fw-bold fs-6 mb-2">${formatRupiah(p.harga)}</p>
                    <p class="text-muted small mb-3">Stok: ${p.stok}</p>
                    <button class="btn btn-warning text-dark fw-bold w-100 mt-auto rounded-3" onclick="tambahKeKeranjang(${p.id})">
                        <i class="bi bi-cart-plus me-1"></i> Beli
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 2. FLASH SALE
function renderFlashSale() {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const flashList = JSON.parse(localStorage.getItem("flashsale")) || [];
    const container = document.getElementById("flashsale-list");

    if (!container) return;

    if (flashList.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-4"><i class="bi bi-lightning-charge fs-2 d-block mb-2"></i>Belum ada Flash Sale.</div>`;
        return;
    }

    let html = '';
    flashList.forEach(fs => {
        const prod = produkList.find(p => p.id === fs.produkId);
        if (prod) {
            const hargaDiskon = prod.harga - (prod.harga * (fs.diskonPercent / 100));
            html += `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100 product-card border-warning border-2 shadow-sm position-relative">
                        <span class="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 fw-bold rounded-end-3 small z-1">
                            -${fs.diskonPercent}%
                        </span>
                        <img src="${prod.gambar}" class="card-img-top product-img" alt="${prod.nama}" onclick="openProductModal(${prod.id})">
                        <div class="card-body d-flex flex-column p-3">
                            <h6 class="card-title fw-bold text-dark mb-1 text-truncate" onclick="openProductModal(${prod.id})" style="cursor:pointer;">${prod.nama}</h6>
                            <div class="mb-2">
                                <span class="text-muted text-decoration-line-through small me-1">${formatRupiah(prod.harga)}</span>
                                <span class="text-danger fw-bold fs-6">${formatRupiah(hargaDiskon)}</span>
                            </div>
                            <button class="btn btn-danger text-white fw-bold w-100 mt-auto rounded-3" onclick="tambahKeKeranjangDirect(${prod.id}, ${hargaDiskon})">
                                <i class="bi bi-lightning-fill me-1"></i> Beli Flash
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

function tambahKeKeranjang(id) {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const prod = produkList.find(p => p.id === id);
    if (!prod) return;

    let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
    keranjang.push({ cartId: Date.now(), id: prod.id, nama: prod.nama, harga: prod.harga, gambar: prod.gambar });

    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    renderKeranjang();
    alert(`"${prod.nama}" berhasil ditambahkan ke keranjang!`);
}

function tambahKeKeranjangDirect(id, hargaDiskon) {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const prod = produkList.find(p => p.id === id);
    if (!prod) return;

    let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
    keranjang.push({ cartId: Date.now(), id: prod.id, nama: prod.nama + " (Flash Sale)", harga: hargaDiskon, gambar: prod.gambar });

    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    renderKeranjang();
    alert(`"${prod.nama}" (Flash Sale) berhasil ditambahkan ke keranjang!`);
}

// 3. KERANJANG & CHECKOUT
function renderKeranjang() {
    const keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
    const container = document.getElementById("keranjang-list");
    const totalElem = document.getElementById("total-keranjang");
    const badgeElem = document.getElementById("cart-badge");

    if (badgeElem) {
        badgeElem.innerText = keranjang.length;
        badgeElem.style.display = keranjang.length > 0 ? "inline-block" : "none";
    }

    if (!container) return;

    if (keranjang.length === 0) {
        container.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">Keranjang masih kosong.</td></tr>`;
        if (totalElem) totalElem.innerText = "Rp 0";
        return;
    }

    let total = 0;
    container.innerHTML = keranjang.map((item, index) => {
        total += Number(item.harga);
        return `
            <tr>
                <td class="ps-4">
                    <div class="d-flex align-items-center">
                        <img src="${item.gambar}" class="rounded-2 me-3" style="width: 45px; height: 45px; object-fit: cover;">
                        <span class="fw-medium text-dark">${item.nama}</span>
                    </div>
                </td>
                <td class="fw-semibold">${formatRupiah(item.harga)}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="hapusKeranjang(${index})">
                        <i class="bi bi-trash-fill fs-6"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (totalElem) totalElem.innerText = formatRupiah(total);
}

function hapusKeranjang(index) {
    let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
    keranjang.splice(index, 1);
    localStorage.setItem("keranjang", JSON.stringify(keranjang));
    renderKeranjang();
}

function checkout(event) {
    event.preventDefault();
    let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];

    if (keranjang.length === 0) {
        alert("Keranjang Anda masih kosong.");
        return;
    }

    const nama = document.getElementById("cust-nama").value.trim();
    const telepon = document.getElementById("cust-telepon").value.trim();
    const alamat = document.getElementById("cust-alamat").value.trim();

    let totalHarga = keranjang.reduce((sum, item) => sum + Number(item.harga), 0);
    let daftarBarang = keranjang.map(item => item.nama).join(", ");

    const pesananBaru = {
        id: Date.now(),
        nama: nama,
        telepon: telepon,
        alamat: alamat,
        totalHarga: totalHarga,
        daftarBarang: daftarBarang,
        tanggal: new Date().toISOString()
    };

    let pesananList = JSON.parse(localStorage.getItem("pesanan")) || [];
    pesananList.push(pesananBaru);
    localStorage.setItem("pesanan", JSON.stringify(pesananList));

    localStorage.setItem("keranjang", JSON.stringify([]));
    renderKeranjang();
    document.getElementById("checkout-form").reset();

    alert("Pesanan Berhasil!");
}

// Modal Video / Popup Detail
function openProductModal(id) {
    const produkList = JSON.parse(localStorage.getItem("produk")) || [];
    const prod = produkList.find(p => p.id === id);
    if (!prod) return;

    document.getElementById("modal-title").innerText = prod.nama;
    
    let videoHtml = "";
    if (prod.video) {
        let embedUrl = prod.video;
        if (embedUrl.includes("watch?v=")) embedUrl = embedUrl.replace("watch?v=", "embed/");
        videoHtml = `
            <div class="ratio ratio-16x9 mb-3 rounded-3 overflow-hidden shadow-sm">
                <iframe src="${embedUrl}" title="Product Video" allowfullscreen></iframe>
            </div>
        `;
    }

    document.getElementById("modal-body").innerHTML = `
        ${videoHtml}
        <div class="row align-items-center">
            <div class="col-md-5 mb-3 mb-md-0">
                <img src="${prod.gambar}" class="img-fluid rounded-3 shadow-sm w-100" alt="${prod.nama}">
            </div>
            <div class="col-md-7">
                <span class="badge bg-warning text-dark mb-2">${prod.kategori}</span>
                <h4 class="fw-bold text-dark">${prod.nama}</h4>
                <h3 class="text-warning fw-bold mb-3">${formatRupiah(prod.harga)}</h3>
                <p class="text-muted small mb-2"><strong>Stok:</strong> ${prod.stok} unit</p>
                <p class="text-secondary">${prod.deskripsi || 'Deskripsi produk belum tersedia.'}</p>
                <button class="btn btn-warning fw-bold text-dark w-100 py-2 rounded-3 mt-2" onclick="tambahKeKeranjang(${prod.id}); bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();">
                    <i class="bi bi-cart-plus me-1"></i> Tambah Ke Keranjang
                </button>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function logout() {
    localStorage.removeItem("isAdmin");
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderFlashSale();
    renderKeranjang();
});