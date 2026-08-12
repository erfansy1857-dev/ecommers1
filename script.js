// ==========================================
// 1. DATA STATE & INISIALISASI
// ==========================================
let produkList = JSON.parse(localStorage.getItem('produk')) || [];
let keranjangList = JSON.parse(localStorage.getItem('keranjang')) || [];
let pesananList = JSON.parse(localStorage.getItem('pesanan')) || [];

let activeCategory = 'Semua';
let detailModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('modalDetailProduk');
  if (modalEl) {
    detailModalInstance = new bootstrap.Modal(modalEl);
  }

  renderKategoriButtons();
  renderSemuaTampilan();
  updateCartBadge();
});

// Sync data ke localStorage
function syncStorage() {
  localStorage.setItem('keranjang', JSON.stringify(keranjangList));
  localStorage.setItem('pesanan', JSON.stringify(pesananList));
  updateCartBadge();
}

// Update Jumlah Badge Keranjang
function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) {
    const totalQty = keranjangList.reduce((acc, curr) => acc + (curr.qty || 1), 0);
    badge.innerText = totalQty;
  }
}

// Navigasi Seksi Tampilan (Dashboard, Flashsale, Keranjang)
function showSection(sectionName) {
  document.getElementById('sec-dashboard').classList.add('d-none');
  document.getElementById('sec-flashsale').classList.add('d-none');
  document.getElementById('sec-keranjang').classList.add('d-none');

  document.getElementById('nav-dash-link').classList.remove('active');
  document.getElementById('nav-flash-link').classList.remove('active');
  document.getElementById('nav-cart-link').classList.remove('active');

  if (sectionName === 'dashboard') {
    document.getElementById('sec-dashboard').classList.remove('d-none');
    document.getElementById('nav-dash-link').classList.add('active');
  } else if (sectionName === 'flashsale') {
    document.getElementById('sec-flashsale').classList.remove('d-none');
    document.getElementById('nav-flash-link').classList.add('active');
  } else if (sectionName === 'keranjang') {
    document.getElementById('sec-keranjang').classList.remove('d-none');
    document.getElementById('nav-cart-link').classList.add('active');
    renderCartTable();
  }
}

function logout() {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    window.location.href = 'login.html';
  }
}

// ==========================================
// 2. RENDER KATALOG & KATEGORI
// ==========================================
function renderKategoriButtons() {
  const container = document.getElementById('categoryButtons');
  if (!container) return;

  const kategoriSet = new Set(['Semua']);
  produkList.forEach(p => {
    if (p.kategori) kategoriSet.add(p.kategori);
  });

  container.innerHTML = '';
  kategoriSet.forEach(kat => {
    const isAct = kat === activeCategory ? 'btn-primary' : 'btn-outline-primary';
    container.innerHTML += `
      <button class="btn ${isAct} btn-sm" onclick="setKategori('${kat}')">${kat}</button>
    `;
  });
}

function setKategori(kat) {
  activeCategory = kat;
  renderKategoriButtons();
  renderSemuaTampilan();
}

function filterProduk() {
  renderSemuaTampilan();
}

function renderSemuaTampilan() {
  const keyword = (document.getElementById('searchInput')?.value || '').toLowerCase();

  // Filter berdasarkan pencarian & kategori
  const filtered = produkList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(keyword) || (p.deskripsi && p.deskripsi.toLowerCase().includes(keyword));
    const matchKat = activeCategory === 'Semua' || p.kategori === activeCategory;
    return matchSearch && matchKat;
  });

  renderPopularProducts(filtered);
  renderAllProducts(filtered);
  renderFlashSaleProducts();
}

// Card Renderer Utility
function createProductCard(p, isFlash = false) {
  const imgSrc = p.gambar || 'https://via.placeholder.com/300';
  const hargaDisplay = parseInt(p.harga || 0).toLocaleString('id-ID');
  const deskripsiShort = p.deskripsi ? (p.deskripsi.length > 50 ? p.deskripsi.substring(0, 50) + '...' : p.deskripsi) : 'Klik untuk lihat detail';
  const hasVideoBadge = p.video ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2 z-1">▶ Ada Video</span>' : '';

  return `
    <div class="col-md-3 col-sm-6">
      <div class="card h-100 shadow-sm border-0 position-relative">
        ${hasVideoBadge}
        <img src="${imgSrc}" class="card-img-top object-fit-cover" style="height: 180px;" alt="${p.nama}">
        <div class="card-body d-flex flex-column">
          <span class="badge bg-light text-dark border align-self-start mb-2">${p.kategori || 'Umum'}</span>
          <h6 class="card-title fw-bold text-truncate">${p.nama}</h6>
          <p class="card-text text-muted small flex-grow-1">${deskripsiShort}</p>
          <div class="mt-2">
            <div class="fw-bold ${isFlash ? 'text-danger' : 'text-primary'} fs-5 mb-2">
              Rp ${hargaDisplay}
            </div>
            <div class="d-grid gap-1">
              <button onclick="bukaDetailProdukById(${p.id})" class="btn btn-outline-primary btn-sm">Lihat Detail</button>
              <button onclick="tambahKeKeranjangById(${p.id})" class="btn btn-primary btn-sm">+ Keranjang</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPopularProducts(list) {
  const container = document.getElementById('popularProductsContainer');
  if (!container) return;
  container.innerHTML = '';

  const popular = list.slice(0, 4);
  if (popular.length === 0) {
    container.innerHTML = '<div class="col-12 text-muted small">Tidak ada produk terpopuler.</div>';
    return;
  }
  popular.forEach(p => {
    container.innerHTML += createProductCard(p);
  });
}

function renderAllProducts(list) {
  const container = document.getElementById('allProductsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<div class="col-12 text-center text-muted py-4">Produk tidak ditemukan.</div>';
    return;
  }
  list.forEach(p => {
    container.innerHTML += createProductCard(p);
  });
}

function renderFlashSaleProducts() {
  const container = document.getElementById('flashSaleContainer');
  if (!container) return;
  container.innerHTML = '';

  // Produk Flash Sale adalah produk yang bertipe / berisikan flag promo (atau 4 produk acak)
  const flashList = produkList.filter(p => p.isFlashSale || p.stok < 10).slice(0, 8);
  const displayList = flashList.length > 0 ? flashList : produkList.slice(0, 4);

  if (displayList.length === 0) {
    container.innerHTML = '<div class="col-12 text-white">Belum ada promo flash sale.</div>';
    return;
  }
  displayList.forEach(p => {
    container.innerHTML += createProductCard(p, true);
  });
}

// ==========================================
// 3. LOGIKA DETAIL PRODUK (DESKRIPSI & VIDEO)
// ==========================================
function bukaDetailProdukById(id) {
  const p = produkList.find(item => item.id == id);
  if (!p) return;

  document.getElementById('detailNamaHeader').innerText = p.nama;
  document.getElementById('detailNama').innerText = p.nama;
  document.getElementById('detailKategori').innerText = p.kategori || 'Umum';
  document.getElementById('detailHarga').innerText = `Rp ${parseInt(p.harga || 0).toLocaleString('id-ID')}`;
  document.getElementById('detailStok').innerText = `Stok Tersedia: ${p.stok || 0}`;
  document.getElementById('detailDeskripsi').innerText = p.deskripsi || 'Tidak ada deskripsi produk.';
  document.getElementById('detailGambar').src = p.gambar || 'https://via.placeholder.com/300';

  // Handling Video Player
  const wrapper = document.getElementById('videoWrapper');
  const player = document.getElementById('detailVideoContainer');
  player.innerHTML = '';

  if (p.video && p.video.trim() !== '') {
    wrapper.classList.remove('d-none');

    // Cek jenis video (File MP4/Base64 vs Link YouTube)
    if (p.video.startsWith('data:video') || p.video.endsWith('.mp4')) {
      player.innerHTML = `
        <video controls class="w-100 rounded" style="max-height: 200px;">
          <source src="${p.video}" type="video/mp4">
          Browser tidak mendukung pemutar video.
        </video>`;
    } else if (p.video.includes('youtube.com') || p.video.includes('youtu.be')) {
      let embedUrl = p.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
      player.innerHTML = `
        <div class="ratio ratio-16x9 rounded overflow-hidden">
          <iframe src="${embedUrl}" title="YouTube video player" allowfullscreen></iframe>
        </div>`;
    } else {
      player.innerHTML = `
        <video controls class="w-100 rounded" style="max-height: 200px;">
          <source src="${p.video}">
        </video>`;
    }
  } else {
    wrapper.classList.add('d-none');
  }

  // Tombol aksi di modal
  document.getElementById('detailActionBtn').innerHTML = `
    <button onclick="tambahKeKeranjangById(${p.id}); detailModalInstance.hide();" class="btn btn-primary btn-lg w-100">
      + Tambah ke Keranjang
    </button>
  `;

  detailModalInstance.show();
}

function tutupDetailVideo() {
  const player = document.getElementById('detailVideoContainer');
  if (player) player.innerHTML = '';
}

// ==========================================
// 4. KERANJANG & CHECKOUT
// ==========================================
function tambahKeKeranjangById(id) {
  const p = produkList.find(item => item.id == id);
  if (!p) return;

  const itemInCart = keranjangList.find(item => item.id == id);
  if (itemInCart) {
    itemInCart.qty = (itemInCart.qty || 1) + 1;
  } else {
    keranjangList.push({
      id: p.id,
      nama: p.nama,
      harga: p.harga,
      gambar: p.gambar,
      qty: 1
    });
  }

  syncStorage();
  alert(`"${p.nama}" berhasil ditambahkan ke keranjang!`);
}

function renderCartTable() {
  const tbody = document.getElementById('cartTableBody');
  const totalEl = document.getElementById('cartTotal');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (keranjangList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Keranjang Anda masih kosong.</td></tr>';
    totalEl.innerText = '0';
    return;
  }

  let totalSemua = 0;
  keranjangList.forEach((item, idx) => {
    const qty = item.qty || 1;
    const subtotal = parseInt(item.harga || 0) * qty;
    totalSemua += subtotal;

    tbody.innerHTML += `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${item.gambar || 'https://via.placeholder.com/50'}" width="40" height="40" class="rounded object-fit-cover">
            <div>
              <div class="fw-bold small">${item.nama}</div>
            </div>
          </div>
        </td>
        <td>Rp ${parseInt(item.harga || 0).toLocaleString('id-ID')}</td>
        <td class="fw-bold text-primary">
          <div class="d-flex align-items-center gap-1">
            <button onclick="updateQty(${idx}, -1)" class="btn btn-sm btn-outline-secondary py-0 px-2">-</button>
            <span>${qty}</span>
            <button onclick="updateQty(${idx}, 1)" class="btn btn-sm btn-outline-secondary py-0 px-2">+</button>
          </div>
        </td>
        <td class="text-end">
          <button onclick="hapusCartItem(${idx})" class="btn btn-sm btn-outline-danger">Hapus</button>
        </td>
      </tr>
    `;
  });

  totalEl.innerText = totalSemua.toLocaleString('id-ID');
}

function updateQty(index, delta) {
  keranjangList[index].qty = (keranjangList[index].qty || 1) + delta;
  if (keranjangList[index].qty <= 0) {
    keranjangList.splice(index, 1);
  }
  syncStorage();
  renderCartTable();
}

function hapusCartItem(index) {
  keranjangList.splice(index, 1);
  syncStorage();
  renderCartTable();
}

function handleCheckout(e) {
  e.preventDefault();

  if (keranjangList.length === 0) {
    alert('Keranjang belanja Anda masih kosong!');
    return;
  }

  const nama = document.getElementById('custNama').value.trim();
  const telp = document.getElementById('custTelp').value.trim();
  const alamat = document.getElementById('custAlamat').value.trim();
  const metodeBayar = document.querySelector('input[name="metodeBayar"]:checked')?.value || 'QRIS';

  const totalHarga = keranjangList.reduce((acc, curr) => acc + (parseInt(curr.harga || 0) * (curr.qty || 1)), 0);

  const pesananBaru = {
    id: Date.now(),
    tanggal: new Date().toLocaleString('id-ID'),
    nama: nama,
    telepon: telp,
    alamat: alamat,
    metodeBayar: metodeBayar,
    items: keranjangList,
    totalHarga: totalHarga,
    status: 'Pending'
  };

  // Simpan ke pesananList lokal agar terbaca oleh Admin
  pesananList.push(pesananBaru);
  localStorage.setItem('pesanan', JSON.stringify(pesananList));

  // Reset keranjang
  keranjangList = [];
  syncStorage();

  document.getElementById('checkoutForm').reset();
  renderCartTable();

  alert('Pesanan Anda berhasil dibuat! Admin akan memproses pesanan Anda.');
  showSection('dashboard');
}