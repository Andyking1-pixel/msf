/* =========================================================
   ESTADO GLOBAL
========================================================= */

let products = [];
let offers = [];
let cart = [];

/* =========================================================
   ELEMENTOS DOM
========================================================= */

const productsListEl = document.getElementById("products-list");
const cartButton = document.getElementById("cart-button");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartToastEl = document.getElementById("cart-toast");

const modalEl = document.getElementById("order-modal");
const closeModalBtn = document.getElementById("close-modal");
const orderForm = document.getElementById("order-form");
const buyerNameInput = document.getElementById("buyer-name");

// Admin
const adminPanelEl = document.getElementById("admin-panel");
const productForm = document.getElementById("product-form");
const adminProductsTbody = document.getElementById("admin-products-tbody");

/* =========================================================
   FETCH API
========================================================= */

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    products = await res.json();
    renderProducts();
    renderAdminProducts();
  } catch (err) {
    console.error("Error cargando productos", err);
  }
}

async function loadOffers() {
  try {
    const res = await fetch("/api/offers");
    offers = await res.json();
    renderOffers();
  } catch (err) {
    console.error("Error cargando ofertas", err);
  }
}

/* =========================================================
   RENDER PRODUCTOS
========================================================= */

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
      <img src="${p.image}" alt="${p.name}" class="product-image">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>$${Number(p.price).toFixed(2)} MXN</strong></p>
      <button class="order-btn" data-id="${p._id}">Agregar</button>
    `;

    productsListEl.appendChild(card);
  });

  document.querySelectorAll(".order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
    });
  });
}

/* =========================================================
   CARRITO
========================================================= */

function addToCart(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  const existing = cart.find((i) => i.productId === productId);
  if (existing) existing.quantity++;
  else cart.push({ productId, quantity: 1 });

  updateCartCount();
  showCartToast();
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = cart.reduce((a, b) => a + b.quantity, 0);
}

function showCartToast() {
  if (!cartToastEl) return;
  cartToastEl.classList.add("show");
  setTimeout(() => cartToastEl.classList.remove("show"), 1200);
}

/* =========================================================
   MODAL CARRITO
========================================================= */

function renderCartModal() {
  if (!cartItemsEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = "<p>Carrito vacío</p>";
    cartTotalEl.textContent = "";
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = "";

  cart.forEach((item) => {
    const product = products.find((p) => p._id === item.productId);
    if (!product) return;

    const subtotal = product.price * item.quantity;
    total += subtotal;

    cartItemsEl.innerHTML += `
      <div>
        ${product.name} x${item.quantity} – $${subtotal.toFixed(2)}
      </div>
    `;
  });

  cartTotalEl.textContent = `Total: $${total.toFixed(2)} MXN`;
}

if (cartButton) {
  cartButton.addEventListener("click", () => {
    renderCartModal();
    modalEl.classList.remove("hidden");
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    modalEl.classList.add("hidden");
  });
}

/* =========================================================
   ADMIN – SESIÓN
========================================================= */

async function initAdmin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("admin") !== "1") return;

  const res = await fetch("/api/auth/me");
  if (res.status !== 200) {
    const password = prompt("Contraseña admin:");
    if (!password) return;

    const login = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!login.ok) {
      alert("Contraseña incorrecta");
      return;
    }
  }

  adminPanelEl.classList.remove("hidden");
}

/* =========================================================
   ADMIN – PRODUCTOS
========================================================= */

function renderAdminProducts() {
  if (!adminProductsTbody) return;

  adminProductsTbody.innerHTML = "";

  products.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>$${p.price}</td>
      <td>
        <button data-id="${p._id}" class="delete-btn">Eliminar</button>
      </td>
    `;
    adminProductsTbody.appendChild(tr);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("¿Eliminar producto?")) return;

      await fetch(`/api/products/${btn.dataset.id}`, {
        method: "DELETE"
      });

      loadProducts();
    });
  });
}

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

/* =========================================================
   INICIO
========================================================= */

loadProducts();
loadOffers();
initAdmin();

