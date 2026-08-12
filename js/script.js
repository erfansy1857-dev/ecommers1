/* ==========================================================================
   HELPER UTILITIES & LOCALSTORAGE MANAGEMENT
   ========================================================================== */
const getStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);

// Inisialisasi Data Awal saat Pertama Buka Aplikasi
function initDefaultData() {
    if (!localStorage.getItem("products")) {
        const defaultProducts = [
            { id: 1, nama: "Smartphone Pro Max 128GB", harga: 4500000, stok: 5, kategori: "HP", gambar: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", video: "" },
            { id: 2, nama: "Laptop Ultra Slim Core i5", harga: 8500000, stok: 3, kategori: "Laptop", gambar: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", video: "" },
            { id: 3, nama: "Smart TV 4K Ultra HD 43 Inch", harga: 3800000, stok: 8, kategori: "TV", gambar: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400", video: "" },
            { id: 4, nama: "TWS Earphone Wireless Bass", harga: 350000, stok: 12, kategori: "Aksesori", gambar: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", video: "" },
            { id: 5, nama: "Charger Fast Charging 65W", harga: 150000, stok: 2, kategori: "Aksesori", gambar: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400", video: "" }
        ];
        setStorage("products", defaultProducts);
    }
    if (!localStorage.getItem("orders")) setStorage("orders", []);
    if (!localStorage.getItem("flashsales")) setStorage("flashsales", []);
    if (!localStorage.getItem("cart")) setStorage("cart", []);
}

// Inisialisasi saat Dokumen Selesai Dimuat
document.addEventListener("DOMContentLoaded", () => {
    initDefaultData();
    
    // Halaman Admin
    if (document.getElementById("table-produk")) {
        window.checkAdminSession();
        window.renderAdminDashboard();
        window.renderAdminProducts();
        window.renderAdminOrders();
        window.renderAdminFlashsale();
        window.renderAdminReports();
    }
    
    // Halaman Toko / Pelanggan
    if (document.getElementById("grid-produk")) {
        window.renderCustomerProducts();
        window.renderCustomerFlashsale();
        window.renderCart();
    }
});

/* ==========================================================================
   1. LOGIN & SESSION LOGIC (GLOBAL)
   ========================================================================== */
window.showAdminForm = function() {
    document.getElementById("login-selection").classList.add("hidden");
    document.getElementById("admin-form").classList.remove("hidden");
};

window.hideAdminForm = function() {
    document.getElementById("admin-form").classList.add("hidden");
    document.getElementById("login-selection").classList.remove("hidden");
};

window.handleAdminLogin = function(event) {
    event.preventDefault();
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    if (u === "admin" && p === "admin123") {
        sessionStorage.setItem("adminLoggedIn", "true");
        window.location.href = "admin.html";
    } else {
        alert("Username atau Password Salah");
    }
};

window.loginAsCustomer = function() {
    window.location.href = "index.html";
};

window.checkAdminSession = function() {
    if (!sessionStorage.getItem("adminLoggedIn")) {
        window.location.href = "login.html";
    }
};

window.logoutAdmin = function() {
    sessionStorage.removeItem("adminLoggedIn");
    window.location.href = "login.html";
};

/* ==========================================================================
   2. ADMIN TABS & MODALS CONTROLLERS (GLOBAL)
   ========================================================================== */
window.switchAdminTab = function(e, tabName) {
    if (e) e.preventDefault();
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".nav-links .nav-item").forEach(el => el.classList.remove("active"));
    
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.remove("hidden");
    if (e && e.target) e.target.classList.add("active");

    if (tabName === 'dashboard') window.renderAdminDashboard();
    if (tabName === 'laporan') window.renderAdminReports();
};

// Modal Produk
window.openProductModal = function(editId = null) {
    const form = document.getElementById("form-produk");
    if (form) form.reset();
    
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
    
    const modal = document.getElementById("modal-produk");
    if (modal) modal.classList.remove("hidden");
};

window.closeProductModal = function() {
    const modal = document.getElementById("modal-produk");
    if (modal) modal.classList.add("hidden");
};

window.saveProduct = function(event) {
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
    window.closeProductModal();
    window.renderAdminProducts();
    window.renderAdminDashboard();
};

window.deleteProduct = function(id) {
    if (confirm("Yakin ingin menghapus produk ini?")) {
        let products = getStorage("products").filter(p => p.id !== id);
        setStorage("products", products);
        
        let flashsales = getStorage("flashsales").filter(f => f.productId !== id);
        setStorage("flashsales", flashsales);

        window.renderAdminProducts();
        window.renderAdminDashboard();
    }
};

window.renderAdminProducts = function() {
    const products = getStorage("products");
    const tbody = document.getElementById("table-produk");
    if (!tbody) return;
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
                    <button type="button" class="btn btn-sm btn-warning" onclick="openProductModal(${p.id})">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Hapus</button>
                </td>
            </tr>
        `;
    });
};

// Modal Flash Sale
window.openFlashsaleModal = function() {
    const products = getStorage("products");
    const select = document.getElementById("fs-prod-id");
    
    if (!select) return;
    select.innerHTML = "";
    
    if (products.length === 0) {
        alert("Belum ada produk. Tambahkan produk terlebih dahulu!");
        return;
    }

    products.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nama} - (${formatRupiah(p.harga)})</option>`;
    });

    const modal = document.getElementById("modal-flashsale");
    if (modal) modal.classList.remove("hidden");
};

window.closeFlashsaleModal = function() {
    const modal = document.getElementById("modal-flashsale");
    if (modal) modal.classList.add("hidden");
};

window.saveFlashsale = function(e) {
    e.preventDefault();
    let flashsales = getStorage("flashsales");
    const prodId = parseInt(document.getElementById("fs-prod-id").value);
    const diskon = parseInt(document.getElementById("fs-diskon").value);

    flashsales = flashsales.filter(f => f.productId !== prodId);
    flashsales.push({ id: Date.now(), productId: prodId, diskon });
    
    setStorage("flashsales", flashsales);
    window.closeFlashsaleModal();
    window.renderAdminFlashsale();
};

window.deleteFlashsale = function(id) {
    let flashsales = getStorage("flashsales").filter(f => f.id !== id);
    setStorage("flashsales", flashsales);
    window.renderAdminFlashsale();
};

window.renderAdminFlashsale = function() {
    const flashsales = getStorage("flashsales");
    const products = getStorage("products");
    const tbody = document.getElementById("table-flashsale");
    if (!tbody) return;
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
                    <td><button type="button" class="btn btn-sm btn-danger" onclick="deleteFlashsale(${fs.id})">Hapus</button></td>
                </tr>
            `;
        }
    });
};

// Admin Dashboard, Orders & Reports Renderers
window.renderAdminOrders = function() {
    const orders = getStorage("orders");
    const tbody = document.getElementById("table-pesanan");
    if (!tbody) return;
    tbody.innerHTML = "";

    [...orders].reverse().forEach(o => {
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
};

window.renderAdminDashboard = function() {
    const products = getStorage("products");
    const orders = getStorage("orders");
    const todayStr = new Date().toISOString().split('T')[0];

    const dashTotal = document.getElementById("dash-total-produk");
    if (dashTotal) dashTotal.innerText = products.length;

    let totalTerjualHariIni = 0;
    orders.forEach(o => {
        if (o.tanggal === todayStr) {
            o.items.forEach(i => totalTerjualHariIni += i.qty);
        }
    });

    const dashTerjual = document.getElementById("dash-terjual-hari-ini");
    if (dashTerjual) dashTerjual.innerText = totalTerjualHariIni;
};

window.renderAdminReports = function() {
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

    if(document.getElementById("lap-minggu")) document.getElementById("lap-minggu").innerText = formatRupiah(mIngguIni);
    if(document.getElementById("lap-bulan")) document.getElementById("lap-bulan").innerText = formatRupiah(bulanIni);
    if(document.getElementById("lap-tahun")) document.getElementById("lap-tahun").innerText = formatRupiah(tahunIni);
};

/* ==========================================================================
   3. CUSTOMER / SHOP LOGIC (GLOBAL)
   ========================================================================== */
let activeCategory = "Semua";

window.switchCustomerTab = function(e, tabName) {
    if (e) e.preventDefault();
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".nav-links .nav-item").forEach(el => el.classList.remove("active"));
    
    const target = document.getElementById(`tab-${tabName === 'flashsale' ? 'flashsale-cust' : tabName}`);
    if (target) target.classList.remove("hidden");
    if (e && e.target) e.target.classList.add("active");

    if (tabName === 'keranjang') window.renderCart();
};

window.filterCategory = function(e, cat) {
    activeCategory = cat;
    document.querySelectorAll(".btn-category").forEach(b => {
        b.classList.toggle("active", b.innerText === cat);
    });
    window.renderCustomerProducts();
};

window.filterProducts = function() {
    window.renderCustomerProducts();
};

window.renderCustomerProducts = function() {
    const products = getStorage("products");
    const flashsales = getStorage("flashsales");
    const searchVal = document.getElementById("search-input") ? document.getElementById("search-input").value.toLowerCase() : "";

    // 1. Render Populer (4 Stok Terkecil)
    const sortedByStock = [...products].sort((a, b) => a.stok - b.stok).slice(0, 4);
    const gridPopuler = document.getElementById("grid-populer");
    if (gridPopuler) {
        gridPopuler.innerHTML = "";
        sortedByStock.forEach(p => gridPopuler.appendChild(createProductCard(p, flashsales)));
    }

    // 2. Render Katalog Produk
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
};

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

    const videoBtn = prod.video ? `<a href="${prod.video}" target="_blank" class="btn btn-sm btn-outline mt-1 text-center">🎥 Review Video</a>` : '';

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
            <button type="button" class="btn btn-primary btn-block btn-sm" onclick="addToCart(${prod.id})" ${prod.stok <= 0 ? 'disabled' : ''}>
                ${prod.stok > 0 ? '+ Keranjang' : 'Stok Habis'}
            </button>
            ${videoBtn}
        </div>
    `;
    return div;
}

window.renderCustomerFlashsale = function() {
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
};

// Cart & Checkout
window.addToCart = function(productId) {
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
    window.updateCartBadge();
    alert("Produk berhasil ditambahkan ke keranjang!");
};

window.updateCartBadge = function() {
    const cart = getStorage("cart");
    const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.innerText = totalCount;
};

window.renderCart = function() {
    window.updateCartBadge();
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
            const hargaEfektif = fs ? prod.harga - (prod.harga * (fs.diskon / 100)) : prod.harga;
            const subtotal = hargaEfektif * item.qty;
            grandTotal += subtotal;

            cartList.innerHTML += `
                <div class="flex-between mb-2">
                    <div>
                        <strong>${prod.nama}</strong><br>
                        <small>${formatRupiah(hargaEfektif)} x ${item.qty} = ${formatRupiah(subtotal)}</small>
                    </div>
                    <div class="flex-between gap-1">
                        <button type="button" class="btn btn-sm btn-secondary" onclick="updateCartQty(${prod.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="updateCartQty(${prod.id}, 1)">+</button>
                        <button type="button" class="btn btn-sm btn-danger" onclick="removeFromCart(${prod.id})">x</button>
                    </div>
                </div>
            `;
        }
    });

    document.getElementById("cart-total-price").innerText = formatRupiah(grandTotal);
};

window.updateCartQty = function(productId, change) {
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
            window.removeFromCart(productId);
            return;
        }
        cartItem.qty = newQty;
        setStorage("cart", cart);
        window.renderCart();
    }
};

window.removeFromCart = function(productId) {
    let cart = getStorage("cart").filter(c => c.productId !== productId);
    setStorage("cart", cart);
    window.renderCart();
};

window.handleCheckout = function(e) {
    e.preventDefault();
    const cart = getStorage("cart");
    let products = getStorage("products");
    const flashsales = getStorage("flashsales");

    if (cart.length === 0) {
        alert("Keranjang belanja kosong!");
        return;
    }

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
            const hargaEfektif = fs ? prod.harga - (prod.harga * (fs.diskon / 100)) : prod.harga;
            
            orderItems.push({
                productId: prod.id,
                nama: prod.nama,
                qty: item.qty,
                harga: hargaEfektif
            });

            totalBayar += hargaEfektif * item.qty;
            prod.stok -= item.qty;
        }
    }

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
    setStorage("cart", []);

    alert("Pesanan Berhasil!");
    document.getElementById("form-checkout").reset();
    window.renderCart();
};

// Listener global untuk menutup modal saat klik di luar kotak modal (backdrop click)
window.addEventListener("click", function(event) {
    const modalProd = document.getElementById("modal-produk");
    const modalFS = document.getElementById("modal-flashsale");
    
    if (event.target === modalProd) {
        window.closeProductModal();
    }
    if (event.target === modalFS) {
        window.closeFlashsaleModal();
    }
});