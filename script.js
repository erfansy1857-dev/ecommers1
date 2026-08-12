// 1. Auto-Redirect ke Login jika belum memilih akses
if (!localStorage.getItem('userLoggedIn')) {
  window.location.href = 'login.html';
}

// 2. Data Default Produk jika localStorage kosong
const defaultProduk = [
  { 
    id: 1, 
    nama: "Sepatu Sneakers Casual", 
    harga: 250000, 
    stok: 15, 
    kategori: "Fashion", 
    gambar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    deskripsi: "Sepatu sneakers berkualitas tinggi dengan bahan sintetis yang nyaman dan sol karet anti-selip.",
    video: ""
  },
  { 
    id: 2, 
    nama: "Smartwatch Sport v2", 
    harga: 450000, 
    stok: 8, 
    kategori: "Elektronik", 
    gambar: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    deskripsi: "Smartwatch sport waterproof dengan pengukur detak jantung, monitor tidur, dan notifikasi pintar.",
    video: ""
  },
  { 
    id: 3, 
    nama: "Tas Ransel Anti Air", 
    harga: 180000, 
    stok: 20, 
    kategori: "Aksesoris", 
    gambar: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    deskripsi: "Tas ransel multifungsi dilapisi material waterproof, cocok untuk perkuliahan maupun travelling.",
    video: ""
  }
];

// 3. Inisialisasi Data Awal
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
let produkList = JSON.parse(localStorage.getItem('produk')) || [];
let keranjangList = JSON.parse(localStorage.getItem('keranjang')) || [];
let flashSaleList = JSON.parse(localStorage.getItem('flashsale')) || [];

function muatDataTerbaru() {
  produkList = JSON.parse(localStorage.getItem('produk')) || [];
  keranjangList = JSON.parse(localStorage.getItem('keranjang')) || [];
  flashSaleList = JSON.parse(localStorage.getItem('flashsale')) || [];
}

// 4. Navigasi Seksi
function showSection(section) {
  muatDataTerbaru();

  document.getElementById('sec-dashboard').classList.add('d-none');
  document.getElementById('sec-flashsale').classList.add('d-none');
  document.getElementById('sec-keranjang').classList.add('d-none');

  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  if (section === 'dashboard') {
    document.getElementById('sec-dashboard').classList.remove('d-none');
    document.getElementById('nav-dash-link').classList.add('active');
    renderProduk();
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

// 5. Render Produk Dashboard
function renderProduk(items = produkList) {
  const popularContainer = document.getElementById('popularProductsContainer');
  const allContainer = document.getElementById('allProductsContainer');

  popularContainer.innerHTML = '';
  allContainer.innerHTML = '';

  if (items.length === 0) {
    allContainer.innerHTML = '<div class="col-12 text-center text-muted py-4"><p>Tidak ada produk yang ditemukan.</p></div>';
    return;
  }

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
  const tombolBeli = p.stok > 0 
    ? `<button onclick="tambahKeKeranjang(${p.id})" class="btn btn-primary btn-sm mt-auto w-100">+ Keranjang</button>`
    : `<button class="btn btn-secondary btn-sm mt-auto w-100" disabled>Stok Habis</button>`;

  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card h-100 shadow-sm product-card">
        <img src="${p.gambar}" class="card-img-top object-fit-cover cursor-pointer" style="height: 180px;" alt="${p.nama}" onclick="bukaDetailProduk(${p.id})">
        <div class="card-body d-flex flex-column">
          <span class="badge bg-secondary mb-2 align-self-start">${p.kategori}</span>
          <h6 class="card-title fw-bold text-truncate cursor-pointer" onclick="bukaDetailProduk(${p.id})" title="${p.nama}">${p.nama}</h6>
          <p class="text-primary fw-bold mb-1">Rp ${p.harga.toLocaleString('id-ID')}</p>
          <small class="text-muted mb-3">Stok: ${p.stok}</small>
          ${tombolBeli}
        </div>
      </div>
    </div>
  `;
}

// 6. Filter & Pencarian
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

// 7. Tambah ke Keranjang
function tambahKeKeranjang(id) {
  const produk = produkList.find(p => p.id === id);
  if (!produk) return;

  if (produk.stok <= 0) {
    alert('Maaf, stok produk ini telah habis!');
    return;
  }

  keranjangList.push(produk);
  localStorage.setItem('keranjang', JSON.stringify(keranjangList));
  updateCartBadge();
  alert(`${produk.nama} berhasil ditambahkan ke keranjang!`);
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.innerText = keranjangList.length;
  }
}

// 8. Detail Produk & Modal Video
function bukaDetailProduk(id) {
  const produk = produkList.find(p => p.id === id);
  if (!produk) return;

  document.getElementById('detailGambar').src = produk.gambar;
  document.getElementById('detailKategori').innerText = produk.kategori;
  document.getElementById('detailNama').innerText = produk.nama;
  document.getElementById('detailHarga').innerText = `Rp ${produk.harga.toLocaleString('id-ID')}`;
  document.getElementById('detailStok').innerText = `Sisa Stok: ${produk.stok}`;
  document.getElementById('detailDeskripsi').innerText = produk.deskripsi || "Tidak ada deskripsi produk.";

  // Pengaturan Video YouTube
  const videoWrapper = document.getElementById('videoWrapper');
  const detailVideo = document.getElementById('detailVideo');

  if (produk.video && produk.video.trim() !== '') {
    let videoUrl = produk.video;
    if (videoUrl.includes('watch?v=')) {
      videoUrl = videoUrl.replace('watch?v=', 'embed/');
    }
    detailVideo.src = videoUrl;
    videoWrapper.classList.remove('d-none');
  } else {
    detailVideo.src = '';
    videoWrapper.classList.add('d-none');
  }

  // Tombol aksi pada modal
  const actionContainer = document.getElementById('detailActionBtn');
  actionContainer.innerHTML = produk.stok > 0
    ? `<button onclick="tambahKeKeranjang(${produk.id})" class="btn btn-primary w-100">+ Tambah ke Keranjang</button>`
    : `<button class="btn btn-secondary w-100" disabled>Stok Habis</button>`;

  const modalElement = document.getElementById('modalDetailProduk');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

function tutupDetailVideo() {
  const detailVideo = document.getElementById('detailVideo');
  if (detailVideo) detailVideo.src = '';
}

// 9. Render Flash Sale
function renderFlashSale() {
  const container = document.getElementById('flashSaleContainer');
  container.innerHTML = '';

  if (flashSaleList.length === 0) {
    container.innerHTML = '<div class="col-12"><p class="text-muted">Belum ada promo Flash Sale saat ini.</p></div>';
    return;
  }

  flashSaleList.forEach(fs => {
    const p = produkList.find(prod => prod.id === fs.produkId);
    if (!p) return;

    const hargaDiskon = p.harga - (p.harga * (fs.diskon / 100));

    container.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm position-relative">
          <span class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1 fs-6">-${fs.diskon}%</span>
          <img src="${p.gambar}" class="card-img-top object-fit-cover cursor-pointer" style="height: 180px;" alt="${p.nama}" onclick="bukaDetailProduk(${p.id})">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title fw-bold text-truncate cursor-pointer" onclick="bukaDetailProduk(${p.id})">${p.nama}</h6>
            <div class="mb-2">
              <span class="text-decoration-line-through text-muted small me-2">Rp ${p.harga.toLocaleString('id-ID')}</span>
              <span class="text-danger fw-bold">Rp ${hargaDiskon.toLocaleString('id-ID')}</span>
            </div>
            <button onclick="tambahKeKeranjangFlash(${p.id}, ${hargaDiskon})" class="btn btn-danger btn-sm mt-auto w-100">
              Beli Flash Sale
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function tambahKeKeranjangFlash(produkId, hargaDiskon) {
  const produk = produkList.find(p => p.id === produkId);
  if (!produk) return;

  if (produk.stok <= 0) {
    alert('Maaf, stok produk Flash Sale ini telah habis!');
    return;
  }

  const itemDiskon = { ...produk, harga: hargaDiskon };
  keranjangList.push(itemDiskon);
  localStorage.setItem('keranjang', JSON.stringify(keranjangList));
  updateCartBadge();
  alert(`${produk.nama} (Flash Sale) berhasil ditambahkan!`);
}

// 10. Render Keranjang
function renderKeranjang() {
  const tbody = document.getElementById('cartTableBody');
  tbody.innerHTML = '';

  if (keranjangList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">Keranjang Anda masih kosong.</td></tr>';
    document.getElementById('cartTotal').innerText = '0';
    return;
  }

  let total = 0;
  keranjangList.forEach((item, index) => {
    total += item.harga;
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <img src="${item.gambar}" width="50" height="50" class="rounded me-2 object-fit-cover" alt="${item.nama}">
            <span class="fw-semibold">${item.nama}</span>
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

// 11. Handle Checkout
function handleCheckout(e) {
  e.preventDefault();

  if (keranjangList.length === 0) {
    alert('Keranjang belanja Anda kosong!');
    return;
  }

  const nama = document.getElementById('custNama').value;
  const telp = document.getElementById('custTelp').value;
  const alamat = document.getElementById('custAlamat').value;

  const metodeSelected = document.querySelector('input[name="metodeBayar"]:checked');
  const metodePembayaran = metodeSelected ? metodeSelected.value : 'Transfer Bank';

  const totalHarga = keranjangList.reduce((sum, item) => sum + item.harga, 0);

  const pesananBaru = {
    id: Date.now(),
    nama,
    telepon: telp,
    alamat,
    metodePembayaran,
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

  alert(`Pesanan Berhasil!\nMetode Pembayaran: ${metodePembayaran}`);
  document.getElementById('checkoutForm').reset();
  renderKeranjang();
  updateCartBadge();
  showSection('dashboard');
}

// 12. Logout
function logout() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('isAdmin');
  window.location.href = 'login.html';
}

// Initial Render
renderProduk();