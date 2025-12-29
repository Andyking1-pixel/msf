/* ============================================================
   ESTADO GLOBAL
   ============================================================ */

let products = [];
let offers = [];
let cart = [];

/* ============================================================
   ELEMENTOS DOM
   ============================================================ */

const productsListEl = document.getElementById("products-list");
const cartButton = document.getElementById("cart-button");
const cartCountEl = document.getElementById("cart-count");

/* ============================================================
   API HELPERS
   ============================================================ */

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

async function createProduct(product) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return res.json();
}

/* ============================================================
   RENDER PRODUCTOS
   ============================================================ */

function renderProducts() {
  if (!productsListEl) return;

  productsListEl.innerHTML = "";

  if (!products.length) {
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
      <p class="product-meta">
        Origen: ${p.originCountry} · ${p.estimatedDeliveryDays} días
      </p>
      <p class="product-price">$${Number(p.price).toFixed(2)} MXN</p>
      <button data-id="${p._id}" class="order-btn">Agregar</button>
    `;

    productsListEl.appendChild(card);
  });

  document.querySelectorAll(".order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
    });
  });
}

/* ============================================================
   CARRITO
   ============================================================ */

function addToCart(productId) {
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ productId, qty: 1 });
  }
  updateCartCount();
}

function updateCartCount() {
  if (!cartCountEl) return;
  cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

/* ============================================================
   ADMIN
   ============================================================ */

const adminPanel = document.getElementById("admin-panel");
const productForm = document.getElementById("product-form");

function initAdmin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("admin") !== "1") return;

  adminPanel?.classList.remove("hidden");
}

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const product = {
      name: adminName.value,
      description: adminDescription.value,
      price: Number(adminPrice.value),
      originCountry: adminOrigin.value,
      estimatedDeliveryDays: Number(adminDays.value),
      image: adminImage.value,
    };

    await createProduct(product);
    await fetchProducts();
    productForm.reset();
    alert("Producto guardado y visible globalmente ✅");
  });
}

/* ============================================================
   INIT
   ============================================================ */

fetchProducts();
initAdmin();

