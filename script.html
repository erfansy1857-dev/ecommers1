// Auto-Redirect ke Login jika belum memilih akses
if (!localStorage.getItem('userLoggedIn')) {
  window.location.href = 'login.html';
}

// Data Default Produk jika localStorage kosong
const defaultProduk = [
  { id: 1, nama: "Sepatu Sneakers Casual", harga: 250000, stok: 15, kategori: "Fashion", gambar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" },
  { id: 2, nama: "Smartwatch Sport v2", harga: 450000, stok: 8, kategori: "Elektronik", gambar: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" },
  { id: 3, nama: "Tas Ransel Anti Air", harga: 180000, stok: 20, kategori: "Aksesoris", gambar: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" }
];

// Inisialisasi Data awal
function initData() {
  if (!localStorage.getItem('produk')) {
    localStorage.setItem('produk', JSON.stringify(defaultProduk));
  }
  if (!localStorage.getItem('keranjang')) {
    localStorage.setItem('keranjang', JSON.stringify([]));
  }
  if (!localStorage.getItem('pesanan')) {
    localStorage.setItem('pesanan', JSON.stringify([]));
  }
  if (!localStorage.getItem('flashsale')) {
    localStorage.setItem('flashsale', JSON.stringify([]));
  }
}

initData();

// Ambil Data dari localStorage
let produkList = JSON.parse(localStorage.getItem('produk'));
let keranjangList = JSON.parse(localStorage.getItem('keranjang'));
let flashSaleList = JSON.parse(localStorage.getItem('flashsale'));

// Navigasi Seksi
function showSection(section) {
  document.getElementById('sec-dashboard').classList.add('d-none');
  document.getElementById('sec-flashsale').classList.add('d-none');
  document.getElementById('sec-keranjang').classList.add('d-none');

  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  if (section === 'dashboard') {
    document.getElementById('sec-dashboard').classList.remove('d-none');
    document.getElementById('nav-dash-link').classList.add('active');
  } else if (section === 'flashsale') {
    document.getElementById('sec-flashsale').classList.remove('d-none');
    document.getElementById('nav-flash-link').classList.add('active');
    renderFlashSale();
  } else if (section === 'keranjang') {
    document.getElementById('sec-keranjang').classList.remove('d-none');
    document.getElementById('nav-cart-link').classList.add('active');
    renderKeranjang();
  }
}

// Render Produk Dashboard
function renderProduk(items = produkList) {
  const popularContainer = document.getElementById('popularProductsContainer');
  const allContainer = document.getElementById('allProductsContainer');

  popularContainer.innerHTML = '';
  allContainer.innerHTML = '';

  // Produk Terpopuler (4 Pertama)
  const populars = items.slice(0, 4);
  populars.forEach(p => {
    popularContainer.innerHTML += createProductCard(p);
  });

  // Semua Produk
  items.forEach(p => {
    allContainer.innerHTML += createProductCard(p);
  });

  renderCategoryButtons();
  updateCartBadge();
}

function createProductCard(p) {
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card h-100 shadow-sm">
        <img src="${p.gambar}" class="card-img-top" alt="${p.nama}">
        <div class="card-body d-flex flex-column">
          <span class="badge bg-secondary mb-2 align-self-start">${p.kategori}</span>
          <h6 class="card-title fw-bold">${p.nama}</h6>
          <p class="text-primary fw-bold mb-1">Rp ${p.harga.toLocaleString('id-ID')}</p>
          <small class="text-muted mb-3">Stok: ${p.stok}</small>
          <button onclick="tambahKeKeranjang(${p.id})" class="btn btn-primary btn-sm mt-auto w-100">
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  `;
}

// Filter & Pencarian
function filterProduk() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = produkList.filter(p => p.nama.toLowerCase().includes(query));
  renderProduk(filtered);
}

function filterKategori(kat) {
  if (kat === 'Semua') {
    renderProduk(produkList);
  } else {
    const filtered = produkList.filter(p => p.kategori === kat);
    renderProduk(filtered);
  }
}

function renderCategoryButtons() {
  const categories = ['Semua', ...new Set(produkList.map(p => p.kategori))];
  const container = document.getElementById('categoryButtons');
  container.innerHTML = categories.map(k => `
    <button onclick="filterKategori('${k}')" class="btn btn-outline-primary btn-sm me-1 mb-1">${k}</button>
  `).join('');
}

// Tambah ke Keranjang
function tambahKeKeranjang(id) {
  const produk = produkList.find(p => p.id === id);
  keranjangList.push(produk);
  localStorage.setItem('keranjang', JSON.stringify(keranjangList));
  updateCartBadge();
  alert(`${produk.nama} berhasil ditambahkan ke keranjang!`);
}

function updateCartBadge() {
  document.getElementById('cartCount').innerText = keranjangList.length;
}

// Render Flash Sale
function renderFlashSale() {
  const container = document.getElementById('flashSaleContainer');
  container.innerHTML = '';

  if (flashSaleList.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada promo Flash Sale saat ini.</p>';
    return;
  }

  flashSaleList.forEach(fs => {
    const p = produkList.find(prod => prod.id === fs.produkId);
    if (!p) return;

    const hargaDiskon = p.harga - (p.harga * (fs.diskon / 100));

    container.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm">
          <span class="badge-flash">-${fs.diskon}%</span>
          <img src="${p.gambar}" class="card-img-top" alt="${p.nama}">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title fw-bold">${p.nama}</h6>
            <div class="mb-2">
              <span class="price-old me-2">Rp ${p.harga.toLocaleString('id-ID')}</span>
              <span class="price-new">Rp ${hargaDiskon.toLocaleString('id-ID')}</span>
            </div>
            <button onclick='tambahKeKeranjangFlash(${JSON.stringify(p)}, ${hargaDiskon})' class="btn btn-danger btn-sm mt-auto w-100">
              Beli Flash Sale
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function tambahKeKeranjangFlash(produk, hargaDiskon) {
  const itemDiskon = { ...produk, harga: hargaDiskon };
  keranjangList.push(itemDiskon);
  localStorage.setItem('keranjang', JSON.stringify(keranjangList));
  updateCartBadge();
  alert(`${produk.nama} (Flash Sale) berhasil ditambahkan!`);
}

// Render Keranjang
function renderKeranjang() {
  const tbody = document.getElementById('cartTableBody');
  tbody.innerHTML = '';

  let total = 0;
  keranjangList.forEach((item, index) => {
    total += item.harga;
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <img src="${item.gambar}" width="50" height="50" class="rounded me-2 object-fit-cover">
            <span>${item.nama}</span>
          </div>
        </td>
        <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
        <td>
          <button onclick="hapusKeranjangItem(${index})" class="btn btn-sm btn-outline-danger">Hapus</button>
        </td>
      </tr>
    `;
  });

  document.getElementById('cartTotal').innerText = total.toLocaleString('id-ID');
}

function hapusKeranjangItem(index) {
  keranjangList.splice(index, 1);
  localStorage.setItem('keranjang', JSON.stringify(keranjangList));
  renderKeranjang();
  updateCartBadge();
}

// Handle Checkout
function handleCheckout(e) {
  e.preventDefault();

  if (keranjangList.length === 0) {
    alert('Keranjang belanja Anda kosong!');
    return;
  }

  const nama = document.getElementById('custNama').value;
  const telp = document.getElementById('custTelp').value;
  const alamat = document.getElementById('custAlamat').value;

  const totalHarga = keranjangList.reduce((sum, item) => sum + item.harga, 0);

  const pesananBaru = {
    id: Date.now(),
    nama,
    telepon: telp,
    alamat,
    totalHarga,
    tanggal: new Date().toISOString(),
    items: [...keranjangList]
  };

  const pesananList = JSON.parse(localStorage.getItem('pesanan')) || [];
  pesananList.push(pesananBaru);
  localStorage.setItem('pesanan', JSON.stringify(pesananList));

  // Kosongkan Keranjang
  keranjangList = [];
  localStorage.setItem('keranjang', JSON.stringify([]));

  alert('Pesanan Berhasil!');
  document.getElementById('checkoutForm').reset();
  renderKeranjang();
  updateCartBadge();
  showSection('dashboard');
}

function logout() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('isAdmin');
  window.location.href = 'login.html';
}

// Initial Render
renderProduk();