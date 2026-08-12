// Auto-Redirect: Jika pengguna sudah login, langsung alihkan ke halaman utama/admin
if (localStorage.getItem('userLoggedIn')) {
  if (localStorage.getItem('isAdmin') === 'true') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'index.html';
  }
}

// 1. Fungsi Login Admin
function loginAdmin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();

  // Kredensial default untuk Admin (Bisa disesuaikan)
  if (user === 'admin' && pass === 'admin123') {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('username', 'Admin');

    alert('Login Admin Berhasil!');
    window.location.href = 'admin.html'; // Mengarah ke Dashboard Admin
  } else {
    alert('Username atau Password Admin salah!\n(Default: admin / admin123)');
  }
}

// 2. Fungsi Masuk Sebagai Pelanggan
function masukPelanggan() {
  localStorage.setItem('userLoggedIn', 'true');
  localStorage.removeItem('isAdmin'); // Memastikan bukan status admin
  localStorage.setItem('username', 'Pelanggan');

  alert('Selamat datang di Toko Online!');
  window.location.href = 'index.html'; // Mengarah ke Toko Pelanggan
}
