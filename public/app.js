/* ============================================================
   CONFIGURACIÓN ADMIN
   ============================================================ */

const ADMIN_LOGGED_KEY = "msf_admin_logged_in";

/* ============================================================
   ESTADO GLOBAL (BACKEND)
   ============================================================ */

let products = [];
let offers = [];
let cart = []; // carrito sigue siendo local

/* ============================================================
   FETCH HELPERS
   ============================================================ */

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error("Error API");
  return res.json();
}

async function loadDataFromServer() {
  products = await fetchJSON("/api/products");
  offers = await fetchJSON("/api/offers");
  renderProducts();
  renderOffers();
  updateCartCount();

  if (adminPanelEl && !adminPanelEl.classList.contains("hidden")) {
    renderAdminProductList();
    renderOfferProductOptions();
    renderAdminOffers();
  }
}

/* ============================================================
   DOM
   ============================================================ */

const productsListEl = document.getElementById("products-list");
const cartButton = document.getElementById("cart-button");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartToastEl = document.getElementById("cart-toast");

const adminPanelEl = document.getElementById("admin-panel");
const productForm = document.getElementById("product-form");
const adminProductIdInput = document.getElementById("admin-product-id");
const adminNameInput = document.getElementById("admin-name");
const adminDescInput = document.getElementById("admin-description");
const adminPriceInput = document.getElementById("admin-price");
const adminOriginInput = document.getElementById("admin-origin");
const adminDaysInput = document.getElementById("admin-days");
const adminImageInput = document.getElementById("admin-image");
const adminProductsTbody = document.getElementById("admin-products-tbody");

const offerForm = document.getElementById("offer-form");
const offerProductSelect = document.getElementById("offer-product");
const offerNewPriceInput = document.getElementById("offer-new-price");
const offerTextInput = document.getElementById("offer-text");
const adminOffersList = document.getElementById("admin-offers-list");

/* ============================================================
   RENDER PRODUCTOS
   ============================================================ */

function renderProducts() {
  productsListEl.innerHTML = "";

  products.forEach((p, i) => {
    const hasDiscount = p.oldPrice && p.oldPrice > p.price;

    productsListEl.innerHTML += `
      <article class="product-card" style="animation-delay:${i * 0.07}s">
        <img src="${p.image}" class="product-image">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p class="product-meta">
          Origen: ${p.originCountry} · ${p.estimatedDeliveryDays} días
        </p>
        <p class="product-price">
          ${
            hasDiscount
              ? `<span class="price-old">$${p.oldPrice}</span>`
              : ""
          }
          <span class="price-new">$${p.price}</span>
        </p>
        <button onclick="addToCart(${p.id})">Agregar al carrito</button>
      </article>
    `;
  });
}

/* ============================================================
   OFERTAS
   ============================================================ */

function renderOffers() {
  const list = document.getElementById("offers-list");
  if (!list) return;
  list.innerHTML = "";

  offers.forEach((o) => {
    const p = products.find((x) => x.id === o.productId);
    if (!p) return;

    list.innerHTML += `
      <li class="offer-card">
        <img src="${p.image}">
        <div>
          <strong>${o.text || p.name}</strong>
          <p>
            <span class="price-old">$${o.previousPrice}</span>
            <span class="price-new">$${p.price}</span>
          </p>
        </div>
      </li>
    `;
  });
}

/* ============================================================
   ADMIN PRODUCTOS
   ============================================================ */

productForm.addEventListener("submit", async (e) => {
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

  if (id) {
    await fetchJSON(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } else {
    await fetchJSON("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  await loadDataFromServer();
  productForm.reset();
});

/* ============================================================
   LOGIN ADMIN
   ============================================================ */

function initAdminPanelVisibility() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("admin") !== "1") return;

  if (localStorage.getItem(ADMIN_LOGGED_KEY) === "true") {
    adminPanelEl.classList.remove("hidden");
    loadDataFromServer();
    return;
  }

  fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: prompt("Usuario admin"),
      pass: prompt("Contraseña")
    })
  })
    .then((r) => r.json())
    .then((d) => {
      localStorage.setItem("msf_token", d.token);
      localStorage.setItem(ADMIN_LOGGED_KEY, "true");
      adminPanelEl.classList.remove("hidden");
      loadDataFromServer();
    })
    .catch(() => alert("Login incorrecto"));
}

/* ============================================================
   INIT
   ============================================================ */

loadDataFromServer();
initAdminPanelVisibility();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}

