// Login sebagai Admin
function loginAdmin() {
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;

  // Verifikasi Kredensial Admin
  if (user === 'admin' && pass === '12345') {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('userLoggedIn', 'true');
    alert('Login Admin Berhasil!');
    window.location.href = 'admin.html';
  } else {
    alert('Username atau Password Admin Salah!');
  }
}

// Masuk sebagai Pelanggan
function masukPelanggan() {
  localStorage.setItem('isAdmin', 'false');
  localStorage.setItem('userLoggedIn', 'true');
  window.location.href = 'index.html';
}