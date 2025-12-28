/* ============================================================
   CONFIGURACIÓN ADMIN
   ============================================================ */

const ADMIN_PASSWORD = "753951Andy";
const ADMIN_LOGGED_KEY = "msf_admin_logged_in";

/* ============================================================
   ESTADO GLOBAL (traído desde el backend)
   ============================================================ */

let products = []; // vienen de /api/products
let offers = [];   // vienen de /api/offers

/* CARRITO (este sí es local por dispositivo) */
let cart = []; // { productId, quantity }

/* ============================================================
   HELPERS FETCH
   ============================================================ */

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error ${res.status} en ${url}: ${text}`);
  }
  return res.json().catch(() => null);
}

async function loadDataFromServer() {
  try {
    const [prod, offs] = await Promise.all([
      fetchJSON("/api/products"),
      fetchJSON("/api/offers")
    ]);
    products = Array.isArray(prod) ? prod : [];
    offers = Array.isArray(offs) ? offs : [];
    renderProducts();
    renderOffers();
    updateCartCount();

    if (adminPanelEl && !adminPanelEl.classList.contains("hidden")) {
      renderAdminProductList();
      renderOfferProductOptions();
      renderAdminOffers();
    }
  } catch (err) {
    console.error("Error cargando datos desde el backend:", err);
    if (productsListEl) {
      productsListEl.innerHTML =
        "<p>Error cargando productos. Intenta recargar la página.</p>";
    }
  }
}

/* ============================================================
   ELEMENTOS DEL DOM
   ============================================================ */

const productsListEl = document.getElementById("products-list");
const modalEl = document.getElementById("order-modal");
const closeModalBtn = document.getElementById("close-modal");
const orderForm = document.getElementById("order-form");
const buyerNameInput = document.getElementById("buyer-name");

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
const newProductBtn = document.getElementById("new-product-btn");
const adminProductsTbody = document.getElementById("admin-products-tbody");

const offerForm = document.getElementById("offer-form");
const offerProductSelect = document.getElementById("offer-product");
const offerNewPriceInput = document.getElementById("offer-new-price");
const offerTextInput = document.getElementById("offer-text");
const adminOffersList = document.getElementById("admin-offers-list");

/* ============================================================
   CARRITO
   ============================================================ */

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  updateCartCount();
  animateCartButton();
  showCartToast();
}

function updateCartCount() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalQty;
}

function animateCartButton() {
  if (!cartButton) return;
  cartButton.classList.remove("cart-bump");
  void cartButton.offsetWidth;
  cartButton.classList.add("cart-bump");
}

function showCartToast() {
  if (!cartToastEl) return;
  cartToastEl.classList.add("show");
  clearTimeout(showCartToast._timeout);
  showCartToast._timeout = setTimeout(() => {
    cartToastEl.classList.remove("show");
  }, 1600);
}

/* ============================================================
   RENDER PRODUCTOS
   ============================================================ */

function renderProducts() {
  if (!productsListEl) return;

  if (!products || products.length === 0) {
    productsListEl.innerHTML = "<p>No hay productos todavía.</p>";
    return;
  }

  productsListEl.innerHTML = "";

  products.forEach((p, index) => {
    const card = document.createElement("article");
    card.className = "product-card product-card-animate";
    card.style.animationDelay = `${index * 0.07}s`;

    const hasDiscount = p.oldPrice && Number(p.oldPrice) > Number(p.price);

    const priceHtml = hasDiscount
      ? `
      <p class="product-price">
        <span class="price-old">$${Number(p.oldPrice).toFixed(2)} MXN</span>
        <span class="price-new">$${Number(p.price).toFixed(2)} MXN</span>
      </p>
    `
      : `
      <p class="product-price">
        <span class="price-new">$${Number(p.price).toFixed(2)} MXN</span>
      </p>
    `;

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-image">
      <h3 class="product-name">${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <p class="product-meta">Origen: ${p.originCountry} · Entrega estimada: ${p.estimatedDeliveryDays} días</p>
      ${priceHtml}
      <button class="order-btn" data-id="${p.id}">Agregar al carrito</button>
    `;

    productsListEl.appendChild(card);
  });

  const orderButtons = document.querySelectorAll(".order-btn");
  orderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = parseInt(btn.getAttribute("data-id"));
      addToCart(productId);
    });
  });
}

/* ============================================================
   RENDER OFERTAS (CLIENTE)
   ============================================================ */

function renderOffers() {
  const offersList = document.getElementById("offers-list");
  if (!offersList) return;

  offersList.innerHTML = "";

  if (!offers || offers.length === 0) {
    offersList.innerHTML = "<li>No hay ofertas por ahora.</li>";
    return;
  }

  offers.forEach((offer) => {
    const product = products.find((p) => p.id === offer.productId);
    if (!product) return;

    const li = document.createElement("li");
    li.className = "offer-card";

    const hasDiscount =
      product.oldPrice && Number(product.oldPrice) > Number(product.price);

    li.innerHTML = `
      <img src="${product.image}" alt="Oferta" class="offer-image">
      <div class="offer-content">
        <div class="offer-text">
          ${offer.text && offer.text.trim() !== "" ? offer.text : product.name}
        </div>
        <div class="offer-prices">
          ${
            hasDiscount
              ? `<span class="price-old">$${Number(
                  product.oldPrice
                ).toFixed(2)} MXN</span>`
              : ""
          }
          <span class="price-new">$${Number(product.price).toFixed(2)} MXN</span>
        </div>
        <span class="offer-badge">Oferta limitada</span>
      </div>
    `;

    offersList.appendChild(li);
  });
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

if (productsListEl) {
  productsListEl.innerHTML = "<p>Cargando productos...</p>";
}

loadDataFromServer().then(() => {
  initAdminPanelVisibility();
});

