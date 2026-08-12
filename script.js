/* ==========================================================
   LOGIKA UTAMA E-COMMERCE ELEKTRONIK (LOCALSTORAGE)
   ========================================================== */

// Key LocalStorage Constant
const KEY_PRODUCTS = 'elektronik_products';
const KEY_ORDERS = 'elektronik_orders';
const KEY_FLASH = 'elektronik_flashsales';
const KEY_CART = 'elektronik_cart';

/* ----------------------------------------------------------
   1. DATA DEFAULT AWAL (JIKA LOCALSTORAGE KOSONG)
---------------------------------------------------------- */
function initDefaultData() {
    if (!localStorage.getItem(KEY_PRODUCTS)) {
        const defaultProducts = [
            {
                id: 'prod-1',
                nama: 'Smartphone Pro Max 15',
                harga: 14999000,
                stok: 12,
                kategori: 'HP',
                deskripsi: 'Smartphone flagship dengan layar AMOLED 120Hz, chipset super cepat, dan kamera 108MP.',
                gambar: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
                video: ''
            },
            {
                id: 'prod-2',
                nama: 'Laptop Gaming Nitro 5',
                harga: 12500000,
                stok: 5,
                kategori: 'Laptop',
                deskripsi: 'Laptop gaming bertenaga Intel i7, RAM 16GB, SSD 512GB dan kartu grafis RTX 3050.',
                gambar: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
                video: ''
            },
            {
                id: 'prod-3',
                nama: 'Smart TV 4K 43 Inch',
                harga: 4200000,
                stok: 8,
                kategori: 'TV',
                deskripsi: 'Nikmati menonton film favorit dengan resolusi Ultra HD 4K dan fitur Google TV terintegrasi.',
                gambar: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
                video: ''
            },
            {
                id: 'prod-4',
                nama: 'Headphone Wireless Bass',
                harga: 750000,
                stok: 20,
                kategori: 'Audio',
                deskripsi: 'Headphone Bluetooth dengan Noise Cancellation pasif dan daya tahan baterai hingga 30 jam.',
                gambar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                video: ''
            },
            {
                id: 'prod-5',
                nama: 'Charger Fast Charging 65W',
                harga: 250000,
                stok: 35,
                kategori: 'Aksesori',
                deskripsi: 'Adaptor charger GaN dual port Type-C cepat untuk mengisi daya HP dan Laptop.',
                gambar: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400',
                video: ''
            },
            {
                id: 'prod-6',
                nama: 'Earbuds TWS Bass Boost',
                harga: 399000,
                stok: 15,
                kategori: 'Audio',
                deskripsi: 'TWS earphone ringkas dengan koneksi Bluetooth 5.3 dan suara bass yang jernih.',
                gambar: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
                video: ''
            }
        ];
        localStorage.setItem(KEY_PRODUCTS, JSON.stringify(defaultProducts));
    }

    if (!localStorage.getItem(KEY_ORDERS)) localStorage.setItem(KEY_ORDERS, JSON.stringify([]));
    if (!localStorage.getItem(KEY_FLASH)) localStorage.setItem(KEY_FLASH, JSON.stringify([]));
    if (!localStorage.getItem(KEY_CART)) localStorage.setItem(KEY_CART, JSON.stringify([]));
}

// Helper untuk mengambil data dari LocalStorage
const getDB = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Helper Format Rupiah
function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

/* ----------------------------------------------------------
   2. LOGIKA AUTENTIKASI (login.html)
---------------------------------------------------------- */
function switchLoginMode(mode) {
    const adminForm = document.getElementById('adminLoginForm');
    const pelangganSec = document.getElementById('pelangganSection');
    const btnAdmin = document.getElementById('btnModeAdmin');
    const btnPelanggan = document.getElementById('btnModePelanggan');

    if (mode === 'admin') {
        adminForm.classList.remove('hidden');
        pelangganSec.classList.add('hidden');
        btnAdmin.classList.add('active');
        btnPelanggan.classList.remove('active');
    } else {
        adminForm.classList.add('hidden');
        pelangganSec.classList.remove('hidden');
        btnPelanggan.classList.add('active');
        btnAdmin.classList.remove('active');
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (user === 'admin' && pass === 'admin123') {
        window.location.href = 'admin.html';
    } else {
        alert('Login Gagal! Username atau Password Admin salah.');
    }
}

/* ----------------------------------------------------------
   3. LOGIKA ADMIN PANEL (admin.html)
---------------------------------------------------------- */
// Pindah Tab Admin
function openAdminTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));

    document.getElementById('tab-' + tabName).classList.add('active');
    element.classList.add('active');

    // Refresh data sesuai tab aktif
    if (tabName === 'dashboard') renderAdminDashboard();
    if (tabName === 'produk') renderAdminProducts();
    if (tabName === 'pesanan') renderAdminOrders();
    if (tabName === 'flashsale') renderAdminFlashSales();
    if (tabName === 'laporan') renderAdminReports();
}

// Render Dashboard Admin
function renderAdminDashboard() {
    const products = getDB(KEY_PRODUCTS);
    const orders = getDB(KEY_ORDERS);

    const todayStr = new Date().toISOString().split('T')[0];

    let terjualHariIni = 0;
    let pendapatanHariIni = 0;

    orders.forEach(ord => {
        if (ord.tanggal.startsWith(todayStr)) {
            pendapatanHariIni += ord.total;
            ord.items.forEach(item => terjualHariIni += item.qty);
        }
    });

    document.getElementById('dashTotalProduk').innerText = products.length;
    document.getElementById('dashTerjualHariIni').innerText = terjualHariIni;
    document.getElementById('dashPendapatanHariIni').innerText = formatRupiah(pendapatanHariIni);
}

// Render Tabel Produk Admin
function renderAdminProducts() {
    const products = getDB(KEY_PRODUCTS);
    const tbody = document.getElementById('adminProductTable');
    tbody.innerHTML = '';

    products.forEach((p) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.gambar}" class="table-thumb" alt="${p.nama}"></td>
            <td><strong>${p.nama}</strong></td>
            <td>${formatRupiah(p.harga)}</td>
            <td>${p.stok}</td>
            <td><span class="status-badge status-baru">${p.kategori}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${p.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Modal CRUD Produk
function openProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodImgBase64').value = '';
    document.getElementById('prodVidBase64').value = '';
    document.getElementById('prodImgPreview').classList.add('hidden');
    document.getElementById('prodVidPreview').classList.add('hidden');
    document.getElementById('productModalTitle').innerText = 'Tambah Produk Baru';
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Preview File FileReader (Konversi ke Base64)
function previewBase64(inputId, previewId, isVideo = false) {
    const file = document.getElementById(inputId).files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            const previewEl = document.getElementById(previewId);
            previewEl.src = base64;
            previewEl.classList.remove('hidden');

            if (!isVideo) document.getElementById('prodImgBase64').value = base64;
            else document.getElementById('prodVidBase64').value = base64;
        };
        reader.readAsDataURL(file);
    }
}

// Simpan Tambah/Edit Produk
function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('prodId').value;
    const nama = document.getElementById('prodNama').value;
    const harga = parseInt(document.getElementById('prodHarga').value);
    const stok = parseInt(document.getElementById('prodStok').value);
    const kategori = document.getElementById('prodKategori').value;
    const deskripsi = document.getElementById('prodDeskripsi').value;

    let gambar = document.getElementById('prodImgBase64').value;
    let video = document.getElementById('prodVidBase64').value;

    let products = getDB(KEY_PRODUCTS);

    if (id) {
        // Edit produk
        const idx = products.findIndex(p => p.id === id);
        if (idx !== -1) {
            products[idx].nama = nama;
            products[idx].harga = harga;
            products[idx].stok = stok;
            products[idx].kategori = kategori;
            products[idx].deskripsi = deskripsi;
            if (gambar) products[idx].gambar = gambar;
            if (video) products[idx].video = video;
        }
    } else {
        // Tambah produk baru
        if (!gambar) gambar = 'https://via.placeholder.com/150?text=No+Image';
        const newProduct = {
            id: 'prod-' + Date.now(),
            nama, harga, stok, kategori, deskripsi, gambar, video
        };
        products.push(newProduct);
    }

    setDB(KEY_PRODUCTS, products);
    closeProductModal();
    renderAdminProducts();
    alert('Produk berhasil disimpan!');
}

function editProduct(id) {
    const products = getDB(KEY_PRODUCTS);
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    openProductModal();
    document.getElementById('productModalTitle').innerText = 'Edit Produk';
    document.getElementById('prodId').value = p.id;
    document.getElementById('prodNama').value = p.nama;
    document.getElementById('prodHarga').value = p.harga;
    document.getElementById('prodStok').value = p.stok;
    document.getElementById('prodKategori').value = p.kategori;
    document.getElementById('prodDeskripsi').value = p.deskripsi;
    
    document.getElementById('prodImgBase64').value = p.gambar;
    const imgPreview = document.getElementById('prodImgPreview');
    imgPreview.src = p.gambar;
    imgPreview.classList.remove('hidden');

    if (p.video) {
        document.getElementById('prodVidBase64').value = p.video;
        const vidPreview = document.getElementById('prodVidPreview');
        vidPreview.src = p.video;
        vidPreview.classList.remove('hidden');
    }
}

function deleteProduct(id) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        let products = getDB(KEY_PRODUCTS);
        products = products.filter(p => p.id !== id);
        setDB(KEY_PRODUCTS, products);
        renderAdminProducts();
    }
}

// Render Tabel Pesanan Admin
function renderAdminOrders() {
    const orders = getDB(KEY_ORDERS);
    const tbody = document.getElementById('adminOrderTable');
    tbody.innerHTML = '';

    orders.forEach(o => {
        const itemsList = o.items.map(i => `${i.nama} (${i.qty})`).join(', ');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${o.tanggal}</td>
            <td><strong>${o.nama}</strong></td>
            <td>${o.telp}<br><small>${o.alamat}</small></td>
            <td>${itemsList}</td>
            <td><strong>${formatRupiah(o.total)}</strong></td>
            <td>
                <select onchange="updateOrderStatus('${o.id}', this.value)" class="form-control" style="padding: 2px 5px; font-size: 0.75rem;">
                    <option value="Baru" ${o.status === 'Baru' ? 'selected' : ''}>Baru</option>
                    <option value="Diproses" ${o.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
                    <option value="Selesai" ${o.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                </select>
            </td>
            <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateOrderStatus(orderId, newStatus) {
    let orders = getDB(KEY_ORDERS);
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = newStatus;
        setDB(KEY_ORDERS, orders);
        renderAdminOrders();
        alert('Status pesanan berhasil diperbarui!');
    }
}

// Flash Sale Admin
function openFlashSaleModal() {
    const products = getDB(KEY_PRODUCTS);
    const select = document.getElementById('flashProdId');
    select.innerHTML = '';
    products.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nama} - ${formatRupiah(p.harga)}</option>`;
    });
    document.getElementById('flashModal').style.display = 'flex';
}

function closeFlashModal() {
    document.getElementById('flashModal').style.display = 'none';
}

function saveFlashSale(event) {
    event.preventDefault();
    const prodId = document.getElementById('flashProdId').value;
    const diskon = parseInt(document.getElementById('flashDiscount').value);
    const endTime = document.getElementById('flashEndTime').value;

    let flashSales = getDB(KEY_FLASH);
    flashSales.push({
        id: 'flash-' + Date.now(),
        productId: prodId,
        diskon,
        endTime
    });

    setDB(KEY_FLASH, flashSales);
    closeFlashModal();
    renderAdminFlashSales();
    alert('Flash sale berhasil ditambahkan!');
}

function renderAdminFlashSales() {
    const flashSales = getDB(KEY_FLASH);
    const products = getDB(KEY_PRODUCTS);
    const tbody = document.getElementById('adminFlashTable');
    tbody.innerHTML = '';

    flashSales.forEach(f => {
        const p = products.find(prod => prod.id === f.productId);
        if (!p) return;

        const hargaDiskon = p.harga - (p.harga * (f.diskon / 100));
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.gambar}" class="table-thumb" alt="${p.nama}"></td>
            <td><strong>${p.nama}</strong></td>
            <td>${formatRupiah(p.harga)}</td>
            <td><span class="status-badge status-diproses">${f.diskon}%</span></td>
            <td><strong class="text-accent">${formatRupiah(hargaDiskon)}</strong></td>
            <td><small>${new Date(f.endTime).toLocaleString('id-ID')}</small></td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteFlashSale('${f.id}')">Hapus</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteFlashSale(id) {
    let flashSales = getDB(KEY_FLASH);
    flashSales = flashSales.filter(f => f.id !== id);
    setDB(KEY_FLASH, flashSales);
    renderAdminFlashSales();
}

// Laporan Admin
function renderAdminReports() {
    const orders = getDB(KEY_ORDERS);
    const now = new Date();

    let mguIni = 0, blnIni = 0, thnIni = 0;

    orders.forEach(o => {
        const oDate = new Date(o.tanggal);
        const diffTime = Math.abs(now - oDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) mguIni += o.total;
        if (oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear()) blnIni += o.total;
        if (oDate.getFullYear() === now.getFullYear()) thnIni += o.total;
    });

    document.getElementById('lapMingguIni').innerText = formatRupiah(mguIni);
    document.getElementById('lapBulanIni').innerText = formatRupiah(blnIni);
    document.getElementById('lapTahunIni').innerText = formatRupiah(thnIni);

    // 10 Pesanan Terbaru
    const tbody = document.getElementById('adminReportTable');
    tbody.innerHTML = '';
    const recentOrders = [...orders].reverse().slice(0, 10);

    recentOrders.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><small>${o.id}</small><br>${o.tanggal}</td>
            <td><strong>${o.nama}</strong></td>
            <td>${formatRupiah(o.total)}</td>
            <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}


/* ----------------------------------------------------------
   4. LOGIKA PELANGGAN / USER (index.html)
---------------------------------------------------------- */
let activeCategory = 'Semua';

function switchUserTab(tabName, element) {
    document.querySelectorAll('.user-tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(ni => ni.classList.remove('active'));

    document.getElementById('user-tab-' + tabName).classList.add('active');
    element.classList.add('active');

    if (tabName === 'home') renderUserProducts();
    if (tabName === 'flashsale') renderUserFlashSales();
    if (tabName === 'cart') renderCart();
}

function setCategoryFilter(cat, btnElement) {
    activeCategory = cat;
    document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    renderUserProducts();
}

function filterUserProducts() {
    renderUserProducts();
}

function renderUserProducts() {
    const products = getDB(KEY_PRODUCTS);
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    
    const popularGrid = document.getElementById('popularGrid');
    const catalogGrid = document.getElementById('userProductGrid');

    let filtered = products.filter(p => {
        const matchCat = (activeCategory === 'Semua' || p.kategori === activeCategory);
        const matchSearch = p.nama.toLowerCase().includes(searchVal);
        return matchCat && matchSearch;
    });

    // Render Produk Terpopuler (4 produk pertama)
    if (activeCategory === 'Semua' && searchVal === '') {
        document.getElementById('popularSection').classList.remove('hidden');
        popularGrid.innerHTML = '';
        products.slice(0, 4).forEach(p => {
            popularGrid.appendChild(createProductCard(p));
        });
    } else {
        document.getElementById('popularSection').classList.add('hidden');
    }

    // Render Main Catalog
    catalogGrid.innerHTML = '';
    filtered.forEach(p => {
        catalogGrid.appendChild(createProductCard(p));
    });
}

function createProductCard(p, flashData = null) {
    const card = document.createElement('div');
    card.className = 'product-card';

    let priceHTML = `<div class="product-price">${formatRupiah(p.harga)}</div>`;
    let badgeHTML = '';
    let timerHTML = '';

    if (flashData) {
        const hargaFlash = p.harga - (p.harga * (flashData.diskon / 100));
        priceHTML = `
            <div>
                <span class="old-price">${formatRupiah(p.harga)}</span>
                <span class="product-price">${formatRupiah(hargaFlash)}</span>
            </div>
        `;
        badgeHTML = `<span class="badge-discount">${flashData.diskon}% OFF</span>`;
        timerHTML = `<div class="timer-badge" data-endtime="${flashData.endTime}">⏱ Loading...</div>`;
    }

    card.innerHTML = `
        ${badgeHTML}
        <img src="${p.gambar}" class="product-img" alt="${p.nama}">
        <div class="product-info">
            <div class="product-title">${p.nama}</div>
            ${priceHTML}
            ${timerHTML}
            <button class="btn btn-sm btn-accent mt-2" onclick="openProductDetail('${p.id}', ${flashData ? flashData.diskon : 0})">Detail & Beli</button>
        </div>
    `;
    return card;
}

// Modal Detail Produk
function openProductDetail(prodId, diskon = 0) {
    const products = getDB(KEY_PRODUCTS);
    const p = products.find(item => item.id === prodId);
    if (!p) return;

    let finalHarga = p.harga;
    if (diskon > 0) finalHarga = p.harga - (p.harga * (diskon / 100));

    const content = document.getElementById('detailContent');
    content.innerHTML = `
        <img src="${p.gambar}" style="width: 100%; height: 200px; object-fit: contain; border-radius: 8px; background: #000;" class="mb-3">
        ${p.video ? `<video src="${p.video}" controls style="width:100%; max-height:180px; border-radius:8px;" class="mb-3"></video>` : ''}
        <h3>${p.nama}</h3>
        <p class="text-accent fs-12 font-weight-bold mb-2">${formatRupiah(finalHarga)} ${diskon > 0 ? `<small class="old-price">${formatRupiah(p.harga)}</small>` : ''}</p>
        <p style="font-size:0.8rem; color: var(--text-muted);" class="mb-2">Stok Tersedia: <strong>${p.stok}</strong> | Kategori: <strong>${p.kategori}</strong></p>
        <p style="font-size:0.85rem;" class="mb-3">${p.deskripsi}</p>
        <button class="btn btn-accent btn-block" onclick="addToCart('${p.id}', ${finalHarga})">+ Tambah Ke Keranjang</button>
    `;

    document.getElementById('detailModal').style.display = 'flex';
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Flash Sale User Render
function renderUserFlashSales() {
    const flashSales = getDB(KEY_FLASH);
    const products = getDB(KEY_PRODUCTS);
    const grid = document.getElementById('userFlashGrid');
    grid.innerHTML = '';

    flashSales.forEach(f => {
        const p = products.find(prod => prod.id === f.productId);
        if (p) {
            grid.appendChild(createProductCard(p, f));
        }
    });
}

// Countdown Timers
function startFlashTimers() {
    setInterval(() => {
        document.querySelectorAll('.timer-badge').forEach(el => {
            const endTime = new Date(el.getAttribute('data-endtime')).getTime();
            const now = new Date().getTime();
            const diff = endTime - now;

            if (diff <= 0) {
                el.innerText = '⚠️ Selesai';
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                el.innerText = `⏱ ${hours}j ${minutes}m ${seconds}d`;
            }
        });
    }, 1000);
}

/* ----------------------------------------------------------
   5. LOGIKA KERANJANG & CHECKOUT
---------------------------------------------------------- */
function addToCart(prodId, fixPrice) {
    const products = getDB(KEY_PRODUCTS);
    const p = products.find(item => item.id === prodId);
    if (!p) return;

    if (p.stok <= 0) {
        alert('Maaf, stok produk habis!');
        return;
    }

    let cart = getDB(KEY_CART);
    const existIdx = cart.findIndex(c => c.productId === prodId);

    if (existIdx !== -1) {
        cart[existIdx].qty += 1;
    } else {
        cart.push({
            productId: p.id,
            nama: p.nama,
            harga: fixPrice,
            gambar: p.gambar,
            qty: 1
        });
    }

    setDB(KEY_CART, cart);
    updateCartBadge();
    closeDetailModal();
    alert('Produk berhasil ditambahkan ke keranjang!');
}

function updateCartBadge() {
    const cart = getDB(KEY_CART);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) badge.innerText = totalQty;
}

function renderCart() {
    const cart = getDB(KEY_CART);
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';

    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">Keranjang masih kosong.</p>`;
    } else {
        cart.forEach((item, index) => {
            total += item.harga * item.qty;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.gambar}" class="cart-img" alt="${item.nama}">
                <div class="cart-detail">
                    <strong>${item.nama}</strong>
                    <div class="text-accent">${formatRupiah(item.harga)}</div>
                </div>
                <div class="cart-qty-ctrl">
                    <button class="btn-qty" onclick="changeCartQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="btn-qty" onclick="changeCartQty(${index}, 1)">+</button>
                    <button class="btn btn-sm btn-danger ml-2" onclick="removeCartItem(${index})">✕</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    document.getElementById('cartTotalPrice').innerText = formatRupiah(total);
    updateCartBadge();
}

function changeCartQty(index, change) {
    let cart = getDB(KEY_CART);
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    setDB(KEY_CART, cart);
    renderCart();
}

function removeCartItem(index) {
    let cart = getDB(KEY_CART);
    cart.splice(index, 1);
    setDB(KEY_CART, cart);
    renderCart();
}

// Fitur Checkout
function handleCheckout(event) {
    event.preventDefault();
    const cart = getDB(KEY_CART);

    if (cart.length === 0) {
        alert('Keranjang belanja Anda masih kosong!');
        return;
    }

    const nama = document.getElementById('custName').value.trim();
    const telp = document.getElementById('custPhone').value.trim();
    const alamat = document.getElementById('custAddress').value.trim();

    const total = cart.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0].substring(0, 5);

    // Buat Objek Pesanan
    const newOrder = {
        id: 'ORD-' + Date.now(),
        tanggal: dateStr,
        nama,
        telp,
        alamat,
        items: cart,
        total,
        status: 'Baru'
    };

    // Simpan ke Pesanan
    let orders = getDB(KEY_ORDERS);
    orders.push(newOrder);
    setDB(KEY_ORDERS, orders);

    // Kurangi stok produk
    let products = getDB(KEY_PRODUCTS);
    cart.forEach(cItem => {
        const p = products.find(prod => prod.id === cItem.productId);
        if (p) p.stok = Math.max(0, p.stok - cItem.qty);
    });
    setDB(KEY_PRODUCTS, products);

    // Kosongkan keranjang & reset form
    setDB(KEY_CART, []);
    document.getElementById('checkoutForm').reset();
    renderCart();

    alert('Pesanan Berhasil! Pesanan Anda telah dikirim ke admin.');
}