// ===================================
// LOGIN.JS
// ===================================

// Jika belum ada status admin
if (localStorage.getItem("isAdmin") === null) {
    localStorage.setItem("isAdmin", "false");
}

// Ambil elemen
const username = document.getElementById("username");
const password = document.getElementById("password");
const btnLogin = document.getElementById("loginAdmin");
const btnCustomer = document.getElementById("customerMode");

// ==============================
// LOGIN ADMIN
// ==============================

function loginAdmin() {

    const user = username.value.trim();
    const pass = password.value.trim();

    if (user === "admin" && pass === "12345") {

        localStorage.setItem("isAdmin", "true");

        alert("Login Admin Berhasil!");

        window.location.href = "admin.html";

    } else {

        alert("Username atau Password salah!");

        password.value = "";
        password.focus();

    }

}

// Tombol Login
btnLogin.addEventListener("click", loginAdmin);

// Tekan Enter untuk Login
document.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        loginAdmin();

    }

});

// ==============================
// MODE PELANGGAN
// ==============================

btnCustomer.addEventListener("click", function () {

    localStorage.setItem("isAdmin", "false");

    window.location.href = "index.html";

});