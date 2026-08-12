/* ==========================================================================
   INITIALIZATION & SEED DATA
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initDefaultData();
    
    // Auto Load Data sesuai Halaman
    if (document.getElementById("table-produk")) {
        checkAdminSession();
        renderAdminDashboard();
        renderAdminProducts();
        renderAdminOrders();
        renderAdminFlashsale();
        renderAdminReports();
    }
    
    if (document.getElementById("grid-produk")) {
        renderCustomerProducts();
        renderCustomerFlashsale();
        renderCart();
    }
});

// Seed data default jika localStorage masih kosong
function initDefaultData() {
    if (!localStorage.getItem("products")) {
        const defaultProducts = [
            { id: 1, nama: "Smartphone Pro Max 128GB", harga: 4500000, stok: 5, kategori: "HP", gambar: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", video: "" },
            { id: 2, nama: "Laptop Ultra Slim Core i5", harga: 8500000, stok: 3, kategori: "Laptop", gambar: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", video: "" },
            { id: 3, nama: "Smart TV 4K Ultra HD 43 Inch", harga: 3800000, stok: 8, kategori: "TV", gambar: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400", video: "" },
            { id: 4, nama: "TWS Earphone Wireless Bass", harga: 350000, stok: 12, kategori: "Aksesori", gambar: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", video: "" },
            { id: 5, nama: "Charger Fast Charging 65W", harga: 150000, stok: 2, kategori: "Aksesori", gambar: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400", video: "" }
        ];
        localStorage.setItem("products", JSON.stringify(defaultProducts));
    }
    if (!localStorage.getItem("orders")) localStorage.setItem("orders", JSON.stringify([]));
    if (!localStorage.getItem("flashsales")) localStorage.setItem("flashsales", JSON.stringify([]));
    if (!localStorage.getItem("cart")) localStorage.setItem("cart", JSON.stringify([]));
}

// Helper Get & Set Storage
const getStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);

/* ==========================================================================
   1. LOGIN LOGIC
   ========================================================================== */
function showAdminForm() {
    document.getElementById("login-selection").classList.add("hidden");
    document.getElementById("admin-form").classList.remove("hidden");
}

function hideAdminForm() {
    document.getElementById("admin-form").classList.add("hidden");
    document.getElementById("login-selection").classList.remove("hidden");
}

function handleAdminLogin(event) {
    event.preventDefault();
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    if (u === "admin" && p === "admin123") {
        sessionStorage.setItem("adminLoggedIn", "true");
        window.location.href = "admin.html";
    } else {
        alert("Username atau Password Salah");
    }
}

function loginAsCustomer() {
    window.location.href = "index.html";
}

function checkAdminSession() {
    if (!sessionStorage.getItem("adminLoggedIn")) {
        window.location.href = "login.html";
    }
}

function logoutAdmin() {
    sessionStorage.removeItem("adminLoggedIn");
    window.location.href = "login.html";
}

/* ==========================================================================
   2. ADMIN PANEL LOGIC (CRUD, FLASH SALE, ORDERS & REPORTS)
   ========================================================================== */
function switchAdminTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    
    document.getElementById(`tab-${tabName}`).classList.remove("hidden");
    event.target.classList.add("active");

    if(tabName === 'dashboard') renderAdminDashboard();
    if(tabName === 'laporan') renderAdminReports();
}

// Modal Product Handler
function openProductModal(editId = null) {
    document.getElementById("form-produk").reset();
    document.getElementById("prod-id").value = "";
    document.getElementById("modal-produk-title").innerText = "Tambah Produk";

    if (editId) {
        const products = getStorage("products");
        const prod = products.find(p => p.id === editId);
        if (prod) {
            document.getElementById("prod-id").value = prod.id;
            document.getElementById("prod-nama").value = prod.nama;
            document.getElementById("prod-harga").value = prod.harga;
            document.getElementById("prod-stok").value = prod.stok;
            document.getElementById("prod-kategori").value = prod.kategori;
            document.getElementById("prod-gambar").value = prod.gambar;
            document.getElementById("prod-video").value = prod.video || "";
            document.getElementById("modal-produk-title").innerText = "Edit Produk";
        }
    }
    document.getElementById("modal-produk").classList.remove("hidden");
}

function closeProductModal() {
    document.getElementById("modal-produk").classList.add("hidden");
}

// Save / Edit Product
function saveProduct(event) {
    event.preventDefault();
    let products = getStorage("products");
    const id = document.getElementById("prod-id").value;
    
    const newProduct = {
        id: id ? parseInt(id) : Date.now(),
        nama: document.getElementById("prod-nama").value,
        harga: parseFloat(document.getElementById("prod-harga").value),
        stok: parseInt(document.getElementById("prod-stok").value),
        kategori: document.getElementById("prod-kategori").value,
        gambar: document.getElementById("prod-gambar").value,
        video: document.getElementById("prod-video").value
    };

    if (id) {
        products = products.map(p => p.id === parseInt(id) ? newProduct : p);
    } else {
        products.push(newProduct);
    }

    setStorage("products", products);
    closeProductModal();
    renderAdminProducts();
    renderAdminDashboard();
}

function deleteProduct(id) {
    if (confirm("Yakin ingin menghapus produk ini?")) {
        let products = getStorage("products").filter(p => p.id !== id);
        setStorage("products", products);
        
        // Hapus juga dari flash sale jika ada
        let flashsales = getStorage("flashsales").filter(f => f.productId !== id);
        setStorage("flashsales", flashsales);

        renderAdminProducts();
        renderAdminDashboard();
    }
}

function renderAdminProducts() {
    const products = getStorage("products");
    const tbody = document.getElementById("table-produk");
    tbody.innerHTML = "";

    products.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${p.gambar}" class="table-img" alt="img"></td>
                <td><strong>${p.nama}</strong></td>
                <td>${formatRupiah(p.harga)}</td>
                <td>${p.stok}</td>
                <td>${p.kategori}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="openProductModal(${p.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

// Flash Sale Admin Logic
function openFlashsaleModal() {
    const products = getStorage("products");
    const select = document.getElementById("fs-prod-id");
    select.innerHTML = "";
    
    products.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nama} - (${formatRupiah(p.harga)})</option>`;
    });

    document.getElementById("modal-flashsale").classList.remove("hidden");
}

function closeFlashsaleModal() {
    document.getElementById("modal-flashsale").classList.add("hidden");
}

function saveFlashsale(e) {
    e.preventDefault();
    let flashsales = getStorage("flashsales");
    const prodId = parseInt(document.getElementById("fs-prod-id").value);
    const diskon = parseInt(document.getElementById("fs-diskon").value);

    // Hapus duplikat jika produk sudah ada di flash sale
    flashsales = flashsales.filter(f => f.productId !== prodId);

    flashsales.push({ id: Date.now(), productId: prodId, diskon });
    setStorage("flashsales", flashsales);

    closeFlashsaleModal();
    renderAdminFlashsale();
}

function deleteFlashsale(id) {
    let flashsales = getStorage("flashsales").filter(f => f.id !== id);
    setStorage("flashsales", flashsales);
    renderAdminFlashsale();
}

function renderAdminFlashsale() {
    const flashsales = getStorage("flashsales");
    const products = getStorage("products");
    const tbody = document.getElementById("table-flashsale");
    tbody.innerHTML = "";

    flashsales.forEach(fs => {
        const prod = products.find(p => p.id === fs.productId);
        if (prod) {
            const hargaDiskon = prod.harga - (prod.harga * (fs.diskon / 100));
            tbody.innerHTML += `
                <tr>
                    <td>${prod.nama}</td>
                    <td>${formatRupiah(prod.harga)}</td>
                    <td><span class="text-danger font-bold">${fs.diskon}%</span></td>
                    <td>${formatRupiah(hargaDiskon)}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteFlashsale(${fs.id})">Hapus</button></td>
                </tr>
            `;
        }
    });
}

// Render Orders & Dashboard stats
function renderAdminOrders() {
    const orders = getStorage("orders");
    const tbody = document.getElementById("table-pesanan");
    tbody.innerHTML = "";

    orders.reverse().forEach(o => {
        const itemDetails = o.items.map(i => `${i.nama} (${i.qty}x)`).join(", ");
        tbody.innerHTML += `
            <tr>
                <td>${o.tanggal}</td>
                <td><strong>${o.nama}</strong></td>
                <td>${o.phone}</td>
                <td>${o.alamat}</td>
                <td>${itemDetails}</td>
                <td><strong>${formatRupiah(o.total)}</strong></td>
                <td><span class="btn btn-sm btn-success">${o.status}</span></td>
            </tr>
        `;
    });
}

function renderAdminDashboard() {
    const products = getStorage("products");
    const orders = getStorage("orders");
    const todayStr = new Date().toISOString().split('T')[0];

    document.getElementById("dash-total-produk").innerText = products.length;

    let totalTerjualHariIni = 0;
    orders.forEach(o => {
        if (o.tanggal === todayStr) {
            o.items.forEach(i => totalTerjualHariIni += i.qty);
        }
    });
    document.getElementById("dash-terjual-hari-ini").innerText = totalTerjualHariIni;
}

// Render Sales Reports
function renderAdminReports() {
    const orders = getStorage("orders");
    const now = new Date();

    let mIngguIni = 0, bulanIni = 0, tahunIni = 0;

    orders.forEach(o => {
        const oDate = new Date(o.tanggal);
        const diffDays = (now - oDate) / (1000 * 60 * 60 * 24);

        if (diffDays <= 7) mIngguIni += o.total;
        if (oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear()) bulanIni += o.total;
        if (oDate.getFullYear() === now.getFullYear()) tahunIni += o.total;
    });

    document.getElementById("lap-minggu").innerText = formatRupiah(mIngguIni);
    document.getElementById("lap-bulan").innerText = formatRupiah(bulanIni);
    document.getElementById("lap-tahun").innerText = formatRupiah(tahunIni);
}

/* ==========================================================================
   3. CUSTOMER / SHOP LOGIC (CATALOG, CART, FLASH SALE & CHECKOUT)
   ========================================================================== */
let activeCategory = "Semua";

function switchCustomerTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    
    document.getElementById(`tab-${tabName === 'flashsale' ? 'flashsale-cust' : tabName}`).classList.remove("hidden");
    event.target.classList.add("active");

    if (tabName === 'keranjang') renderCart();
}

function filterCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll(".btn-category").forEach(b => {
        b.classList.toggle("active", b.innerText === cat);
    });
    renderCustomerProducts();
}

function filterProducts() {
    renderCustomerProducts();
}

function renderCustomerProducts() {
    const products = getStorage("products");
    const flashsales = getStorage("flashsales");
    const searchVal = document.getElementById("search-input") ? document.getElementById("search-input").value.toLowerCase() : "";

    // 1. Render Produk Terpopuler (4 Stok Terendah)
    const sortedByStock = [...products].sort((a, b) => a.stok - b.stok).slice(0, 4);
    const gridPopuler = document.getElementById("grid-populer");
    if (gridPopuler) {
        gridPopuler.innerHTML = "";
        sortedByStock.forEach(p => gridPopuler.appendChild(createProductCard(p, flashsales)));
    }

    // 2. Render Semua Produk dengan Filter
    const gridProduk = document.getElementById("grid-produk");
    if (gridProduk) {
        gridProduk.innerHTML = "";
        const filtered = products.filter(p => {
            const matchCat = activeCategory === "Semua" || p.kategori === activeCategory;
            const matchSearch = p.nama.toLowerCase().includes(searchVal);
            return matchCat && matchSearch;
        });

        filtered.forEach(p => gridProduk.appendChild(createProductCard(p, flashsales)));
    }
}

function createProductCard(prod, flashsales) {
    const fs = flashsales.find(f => f.productId === prod.id);
    let finalHarga = prod.harga;
    let badgeHtml = "";
    let priceHtml = `<strong>${formatRupiah(prod.harga)}</strong>`;

    if (fs) {
        finalHarga = prod.harga - (prod.harga * (fs.diskon / 100));
        badgeHtml = `<span class="badge-discount">${fs.diskon}% OFF</span>`;
        priceHtml = `
            <span class="old-price">${formatRupiah(prod.harga)}</span><br>
            <strong class="text-danger">${formatRupiah(finalHarga)}</strong>
        `;
    }

    const videoBtn = prod.video ? `<a href="${prod.video}" target="_blank" class="btn btn-sm btn-outline mt-1 text-center">🎥 Video Review</a>` : '';

    const div = document.createElement("div");
    div.className = "card product-card";
    div.innerHTML = `
        ${badgeHtml}
        <img src="${prod.gambar}" class="product-img" alt="${prod.nama}">
        <div class="mt-1">
            <h4>${prod.nama}</h4>
            <small class="text-muted">Stok: ${prod.stok} | ${prod.kategori}</small>
            <div class="mt-1 mb-1">${priceHtml}</div>
        </div>
        <div class="flex-col gap-1 mt-1">
            <button class="btn btn-primary btn-block btn-sm" onclick="addToCart(${prod.id})" ${prod.stok <= 0 ? 'disabled' : ''}>
                ${prod.stok > 0 ? '+ Keranjang' : 'Stok Habis'}
            </button>
            ${videoBtn}
        </div>
    `;
    return div;
}

function renderCustomerFlashsale() {
    const flashsales = getStorage("flashsales");
    const products = getStorage("products");
    const grid = document.getElementById("grid-flashsale");
    if (!grid) return;

    grid.innerHTML = "";
    flashsales.forEach(fs => {
        const prod = products.find(p => p.id === fs.productId);
        if (prod) {
            grid.appendChild(createProductCard(prod, flashsales));
        }
    });
}

// CART & CHECKOUT LOGIC
function addToCart(productId) {
    let cart = getStorage("cart");
    const products = getStorage("products");
    const prod = products.find(p => p.id === productId);

    if (!prod || prod.stok <= 0) {
        alert("Stok produk tidak mencukupi!");
        return;
    }

    const cartItem = cart.find(c => c.productId === productId);
    if (cartItem) {
        if (cartItem.qty + 1 > prod.stok) {
            alert("Jumlah melebihi stok yang tersedia!");
            return;
        }
        cartItem.qty += 1;
    } else {
        cart.push({ productId: prod.id, qty: 1 });
    }

    setStorage("cart", cart);
    updateCartBadge();
    alert("Produk berhasil ditambahkan ke keranjang!");
}

function updateCartBadge() {
    const cart = getStorage("cart");
    const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.innerText = totalCount;
}

function renderCart() {
    updateCartBadge();
    const cart = getStorage("cart");
    const products = getStorage("products");
    const flashsales = getStorage("flashsales");
    const cartList = document.getElementById("cart-items-list");
    if (!cartList) return;

    cartList.innerHTML = "";
    let grandTotal = 0;

    if (cart.length === 0) {
        cartList.innerHTML = `<p class="text-muted text-center">Keranjang Anda Masih Kosong.</p>`;
        document.getElementById("cart-total-price").innerText = formatRupiah(0);
        return;
    }

    cart.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
            const fs = flashsales.find(f => f.productId === prod.id);
            const hargaEfetif = fs ? prod.harga - (prod.harga * (fs.diskon / 100)) : prod.harga;
            const subtotal = hargaEfetif * item.qty;
            grandTotal += subtotal;

            cartList.innerHTML += `
                <div class="flex-between mb-2">
                    <div>
                        <strong>${prod.nama}</strong><br>
                        <small>${formatRupiah(hargaEfetif)} x ${item.qty} = ${formatRupiah(subtotal)}</small>
                    </div>
                    <div class="flex-between gap-1">
                        <button class="btn btn-sm btn-secondary" onclick="updateCartQty(${prod.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="btn btn-sm btn-secondary" onclick="updateCartQty(${prod.id}, 1)">+</button>
                        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${prod.id})">x</button>
                    </div>
                </div>
            `;
        }
    });

    document.getElementById("cart-total-price").innerText = formatRupiah(grandTotal);
}

function updateCartQty(productId, change) {
    let cart = getStorage("cart");
    const products = getStorage("products");
    const prod = products.find(p => p.id === productId);
    const cartItem = cart.find(c => c.productId === productId);

    if (cartItem) {
        const newQty = cartItem.qty + change;
        if (newQty > prod.stok) {
            alert("Jumlah melebihi stok yang tersedia!");
            return;
        }
        if (newQty <= 0) {
            removeFromCart(productId);
            return;
        }
        cartItem.qty = newQty;
        setStorage("cart", cart);
        renderCart();
    }
}

function removeFromCart(productId) {
    let cart = getStorage("cart").filter(c => c.productId !== productId);
    setStorage("cart", cart);
    renderCart();
}

function handleCheckout(e) {
    e.preventDefault();
    const cart = getStorage("cart");
    let products = getStorage("products");
    const flashsales = getStorage("flashsales");

    if (cart.length === 0) {
        alert("Keranjang belanja kosong!");
        return;
    }

    // Hitung Item & Total Bayar
    let orderItems = [];
    let totalBayar = 0;

    for (let item of cart) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
            if (prod.stok < item.qty) {
                alert(`Stok untuk ${prod.nama} tidak mencukupi!`);
                return;
            }
            const fs = flashsales.find(f => f.productId === prod.id);
            const hargaEfetif = fs ? prod.harga - (prod.harga * (fs.diskon / 100)) : prod.harga;
            
            orderItems.push({
                productId: prod.id,
                nama: prod.nama,
                qty: item.qty,
                harga: hargaEfetif
            });

            totalBayar += hargaEfetif * item.qty;

            // Potong Stok Produk
            prod.stok -= item.qty;
        }
    }

    // Simpan Pesanan ke Storage
    const newOrder = {
        id: Date.now(),
        tanggal: new Date().toISOString().split('T')[0],
        nama: document.getElementById("cust-nama").value,
        phone: document.getElementById("cust-phone").value,
        alamat: document.getElementById("cust-alamat").value,
        items: orderItems,
        total: totalBayar,
        status: "Baru"
    };

    let orders = getStorage("orders");
    orders.push(newOrder);
    
    setStorage("orders", orders);
    setStorage("products", products);
    setStorage("cart", []); // Kosongkan Keranjang

    alert("Pesanan Berhasil!");
    document.getElementById("form-checkout").reset();
    renderCart();
}