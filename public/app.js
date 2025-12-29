/* ============================================================
   CONFIG ADMIN
============================================================ */

const ADMIN_PASSWORD = "753951Andy";
const ADMIN_LOGGED_KEY = "msf_admin_logged_in";

/* ============================================================
   ESTADO GLOBAL
============================================================ */

let products = [];
let cart = [];

/* ============================================================
   ELEMENTOS DOM
============================================================ */

const productsListEl = document.getElementById("products-list");
const cartButton = document.getElementById("cart-button");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const modalEl = document.getElementById("order-modal");
const closeModalBtn = document.getElementById("close-modal");
const buyerNameInput = document.getElementById("buyer-name");

/* ADMIN */
const adminPanelEl = document.getElementById("admin-panel");
const productForm = document.getElementById("product-form");
const adminProductsTbody = document.getElementById("admin-products-tbody");

/* ============================================================
   CARGAR PRODUCTOS DESDE MONGODB
============================================================ */

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    products = await res.json();
    renderProducts();
    renderAdminProductList();
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

/* ============================================================
   RENDER PRODUCTOS
============================================================ */

function renderProducts() {
  if (!productsListEl) return;
  productsListEl.innerHTML = "";

  if (products.length === 0) {
    productsListEl.innerHTML = "<p>No hay productos aún.</p>";
    return;
  }

  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" class="product-image">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>$${p.price} MXN</strong></p>
      <button data-id="${p._id}">Agregar al carrito</button>
    `;

    card.querySelector("button").onclick = () => addToCart(p._id);
    productsListEl.appendChild(card);
  });
}

/* ============================================================
   CARRITO
============================================================ */

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

/* ============================================================
   ADMIN – LISTA
============================================================ */

function renderAdminProductList() {
  if (!adminProductsTbody) return;
  adminProductsTbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>$${p.price}</td>
      <td>${p.originCountry}</td>
    `;
    adminProductsTbody.appendChild(tr);
  });
}

/* ============================================================
   ADMIN – CREAR PRODUCTO (MongoDB)
============================================================ */

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: productForm.name.value,
      description: productForm.description.value,
      price: Number(productForm.price.value),
      originCountry: productForm.origin.value,
      estimatedDeliveryDays: Number(productForm.days.value),
      image: productForm.image.value
    };

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    productForm.reset();
    loadProducts();
  });
}

/* ============================================================
   LOGIN ADMIN
============================================================ */

function initAdminPanelVisibility() {
  if (!adminPanelEl) return;

  if (new URLSearchParams(location.search).get("admin") !== "1") return;

  if (localStorage.getItem(ADMIN_LOGGED_KEY) === "true") {
    adminPanelEl.classList.remove("hidden");
    return;
  }

  const pwd = prompt("Contraseña admin:");
  if (pwd === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_LOGGED_KEY, "true");
    adminPanelEl.classList.remove("hidden");
  } else {
    alert("Contraseña incorrecta");
  }
}

/* ============================================================
   INIT
============================================================ */

loadProducts();
initAdminPanelVisibility();

