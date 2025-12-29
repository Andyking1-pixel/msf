/* ===============================
   CONFIG
================================ */

const API_BASE = "/api";
const TOKEN_KEY = "msf_admin_token";

/* ===============================
   ESTADO GLOBAL
================================ */

let products = [];
let isAdmin = false;

/* ===============================
   UTILIDADES
================================ */

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

/* ===============================
   DOM
================================ */

const productsListEl = document.getElementById("products-list");
const adminPanelEl = document.getElementById("admin-panel");
const adminProductsTbody = document.getElementById("admin-products-tbody");

const productForm = document.getElementById("product-form");
const adminProductIdInput = document.getElementById("admin-product-id");
const adminNameInput = document.getElementById("admin-name");
const adminDescInput = document.getElementById("admin-description");
const adminPriceInput = document.getElementById("admin-price");
const adminOriginInput = document.getElementById("admin-origin");
const adminDaysInput = document.getElementById("admin-days");
const adminImageInput = document.getElementById("admin-image");

/* ===============================
   PRODUCTOS (CLIENTE)
================================ */

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    products = await res.json();
    renderProducts();
    if (isAdmin) renderAdminProducts();
  } catch (e) {
    console.error("Error cargando productos", e);
  }
}

function renderProducts() {
  if (!productsListEl) return;

  productsListEl.innerHTML = "";

  if (!products.length) {
    productsListEl.innerHTML = "<p>No hay productos aún.</p>";
    return;
  }

  products.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-image">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>$${p.price} MXN</strong></p>
    `;

    productsListEl.appendChild(card);
  });
}

/* ===============================
   ADMIN LOGIN
================================ */

async function adminLogin() {
  const user = prompt("Usuario admin:");
  const pass = prompt("Contraseña admin:");

  if (!user || !pass) return;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (!res.ok) throw new Error("Credenciales inválidas");

    const data = await res.json();
    setToken(data.token);
    isAdmin = true;
    adminPanelEl.classList.remove("hidden");
    loadProducts();
  } catch {
    alert("Contraseña incorrecta ❌");
    clearToken();
  }
}

/* ===============================
   ADMIN INIT
================================ */

function initAdmin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("admin") !== "1") return;

  adminLogin();
}

/* ===============================
   ADMIN – LISTA
================================ */

function renderAdminProducts() {
  if (!adminProductsTbody) return;

  adminProductsTbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.name}</td>
      <td>$${p.price}</td>
      <td>
        <button data-id="${p._id}" class="edit">Editar</button>
        <button data-id="${p._id}" class="delete">Eliminar</button>
      </td>
    `;

    adminProductsTbody.appendChild(tr);
  });
}

/* ===============================
   ADMIN – FORM
================================ */

if (productForm) {
  productForm.addEventListener("submit", async e => {
    e.preventDefault();

    const payload = {
      name: adminNameInput.value,
      description: adminDescInput.value,
      price: Number(adminPriceInput.value),
      originCountry: adminOriginInput.value,
      estimatedDeliveryDays: Number(adminDaysInput.value),
      image: adminImageInput.value
    };

    const id = adminProductIdInput.value;
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API_BASE}/products/${id}`
      : `${API_BASE}/products`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    });

    productForm.reset();
    adminProductIdInput.value = "";
    loadProducts();
  });
}

/* ===============================
   ADMIN – BOTONES
================================ */

document.addEventListener("click", async e => {
  if (e.target.classList.contains("edit")) {
    const p = products.find(x => x._id === e.target.dataset.id);
    if (!p) return;

    adminProductIdInput.value = p._id;
    adminNameInput.value = p.name;
    adminDescInput.value = p.description;
    adminPriceInput.value = p.price;
    adminOriginInput.value = p.originCountry;
    adminDaysInput.value = p.estimatedDeliveryDays;
    adminImageInput.value = p.image;
  }

  if (e.target.classList.contains("delete")) {
    if (!confirm("¿Eliminar producto?")) return;

    await fetch(`${API_BASE}/products/${e.target.dataset.id}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    loadProducts();
  }
});

/* ===============================
   INIT
================================ */

loadProducts();
initAdmin();

