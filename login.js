/* =========================================================
   SCRIPT UNTUK HALAMAN LOGIN (login.html)
   ========================================================= */

// Login Admin
function loginAdmin(event) {
    event.preventDefault();
    const user = document.getElementById("admin-username").value.trim();
    const pass = document.getElementById("admin-password").value.trim();

    if (user === "admin" && pass === "123") {
        localStorage.setItem("isAdmin", "true");
        alert("Login Admin Berhasil!");
        window.location.href = "admin.html";
    } else {
        alert("Username atau Password Admin Salah!");
    }
}

// Masuk Sebagai Pelanggan
function loginPelanggan() {
    localStorage.setItem("isAdmin", "false");
    window.location.href = "index.html";
}