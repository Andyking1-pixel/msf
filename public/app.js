/* ============================================================
   CONFIGURACIÓN ADMIN
   ============================================================ */

const ADMIN_PASSWORD = "753951Andy";
const ADMIN_LOGGED_KEY = "msf_admin_logged_in";

/* ============================================================
   PRODUCTOS PREDETERMINADOS
   ============================================================ */

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Netflix Perfil",
    description: "Perfil de Netflix.",
    price: 70,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/Netflix.png"
  },
  {
    id: 2,
    name: "Netflix",
    description: "Netflix Completa.",
    price: 200,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/Netflix.png"
  },
  {
    id: 3,
    name: "Max Platino Perfil",
    description: "Perfil Max.",
    price: 45.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/hbo.png"
  },
  {
    id: 4,
    name: "Max Platino",
    description: "Max Platino Completa.",
    price: 145.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/hbo.png"
  },
  {
    id: 5,
    name: "Disney premium Perfil",
    description: "Perfil Disney.",
    price: 50.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/disneyplus.png"
  },
  {
    id: 6,
    name: "Disney premium",
    description: "Disney premium Completa.",
    price: 180.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/disneyplus.png"
  },
  {
    id: 7,
    name: "Vix 2 meses Perfil",
    description: "Perfil Vix Premium.",
    price: 40.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/vix.png"
  },
  {
    id: 8,
    name: "Vix 2 meses",
    description: "Vix Premium Completa.",
    price: 65.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/vix.png"
  },
  {
    id: 9,
    name: "Prime Video Perfil",
    description: "Perfil Prime Video.",
    price: 40.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/primevideo.png"
  },
  {
    id: 10,
    name: "Prime Video",
    description: "Prime Video Completa.",
    price: 70.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/primevideo.png"
  },
  {
    id: 11,
    name: "Crunchyroll Perfil",
    description: "Perfil Crunchyroll.",
    price: 35.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/crunchyroll.png"
  },
  {
    id: 12,
    name: "Crunchyroll",
    description: "Crunchyroll Completa.",
    price: 65.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/crunchyroll.png"
  }
];

/* ============================================================
   LOCAL STORAGE PRODUCTOS
   ============================================================ */

const PRODUCTS_KEY = "msf_products";

function loadProductsFromStorage() {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS.slice();
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRODUCTS.slice();
  }
}

function saveProductsToStorage(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

let products = loadProductsFromStorage();

/* ============================
   OFERTAS (LIGADAS A PRODUCTOS)
   ============================ */

const OFFERS_KEY = "msf_offers";

function loadOffers() {
  const raw = localStorage.getItem(OFFERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveOffers(offers) {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

/*
  Estructura de oferta:
  {
    productId: number,
    previousPrice: number,
    newPrice: number,
    text: string
  }
*/
let offers = loadOffers();

/* ============================================================
   CARRITO
   ============================================================ */

let cart = []; // { productId, quantity }

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
}

function updateCartCount() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalQty;
}

/* ============================================================
   ELEMENTOS DEL DOM
   ============================================================ */

const productsListEl = document.getElementById("products-list");
const modalEl = document.getElementById("order-modal");
const closeModalBtn = document.getElementById("close-modal");
const orderForm = document.getElementById("order-form");

const buyerNameInput = document.getElementById("buyer-name");

// Panel admin
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

// Admin ofertas
const offerForm = document.getElementById("offer-form");
const offerProductSelect = document.getElementById("offer-product");
const offerNewPriceInput = document.getElementById("offer-new-price");
const offerTextInput = document.getElementById("offer-text");
const adminOffersList = document.getElementById("admin-offers-list");

// Carrito UI
const cartButton = document.getElementById("cart-button");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

/* ============================================================
   RENDER PRODUCTOS (CON DESCUENTO)
   ============================================================ */

function renderProducts() {
  if (!productsListEl) return;

  productsListEl.innerHTML = "";

  if (!products || products.length === 0) {
    productsListEl.innerHTML = "<p>No hay productos todavía.</p>";
    return;
  }

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
      alert("Producto agregado al carrito 🛒");
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

    const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);

    li.innerHTML = `
      <img src="${product.image}" alt="Oferta" class="offer-image">
      <div class="offer-content">
        <div class="offer-text">
          ${offer.text && offer.text.trim() !== "" ? offer.text : product.name}
        </div>
        <div class="offer-prices">
          ${
            hasDiscount
              ? `<span class="price-old">$${Number(product.oldPrice).toFixed(2)} MXN</span>`
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
   MODAL DE CARRITO
   ============================================================ */

function renderCartModal() {
  if (!cartItemsEl || !cartTotalEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = `<div class="cart-items-empty">Tu carrito está vacío 🛒</div>`;
    cartTotalEl.textContent = "";
    return;
  }

  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;
    total += subtotal;

    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-line">
          $${unitPrice.toFixed(2)} MXN x ${item.quantity} = $${subtotal.toFixed(2)} MXN
        </div>
      </div>
      <div class="cart-item-actions">
        <button class="cart-item-btn" data-cart-action="dec" data-product-id="${product.id}">−</button>
        <span>${item.quantity}</span>
        <button class="cart-item-btn" data-cart-action="inc" data-product-id="${product.id}">+</button>
        <button class="cart-item-btn" data-cart-action="remove" data-product-id="${product.id}">✖</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = `Total: $${total.toFixed(2)} MXN`;
}

function openCartModal() {
  if (!modalEl) return;
  renderCartModal();
  modalEl.classList.remove("hidden");
}

function closeOrderModal() {
  if (!modalEl) return;
  modalEl.classList.add("hidden");
}

/* Eventos de carrito en el modal */
if (cartButton) {
  cartButton.addEventListener("click", () => {
    openCartModal();
  });
}

if (cartItemsEl) {
  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cart-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-cart-action");
    const productId = parseInt(btn.getAttribute("data-product-id"));
    const item = cart.find((it) => it.productId === productId);
    if (!item) return;

    if (action === "inc") {
      item.quantity += 1;
    } else if (action === "dec") {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart = cart.filter((it) => it.productId !== productId);
      }
    } else if (action === "remove") {
      cart = cart.filter((it) => it.productId !== productId);
    }

    updateCartCount();
    renderCartModal();
  });
}

/* Cerrar modal */
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeOrderModal);
}

if (modalEl) {
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeOrderModal();
  });
}

/* ============================================================
   WHATSAPP
   ============================================================ */

function sendOrderToWhatsApp(message) {
  const phoneNumber = "523328312781";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* ============================================================
   FORMULARIO DE PEDIDO (USA CARRITO)
   ============================================================ */

if (orderForm) {
  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    const buyerName = buyerNameInput.value.trim();
    if (!buyerName) {
      alert("Por favor escribe tu nombre.");
      return;
    }

    let totalAmount = 0;
    let lines = "";

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      lines += `- ${product.name} x${item.quantity} – $${subtotal.toFixed(2)} MXN\n`;
    });

    const orderMessage =
      `MSF – Nuevo pedido:\n\n` +
      `Productos:\n${lines}\n` +
      `Total: $${totalAmount.toFixed(2)} MXN\n\n` +
      `Cliente: ${buyerName}\n\n` +
      `Fecha: ${new Date().toLocaleString()}`;

    // Enviar al backend de forma general
    const itemsForBackend = cart.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product ? product.name : "",
        quantity: item.quantity,
        unitPrice: product ? Number(product.price) : 0,
        subtotal: product ? Number(product.price) * item.quantity : 0
      };
    });

    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: itemsForBackend,
        buyerName,
        totalAmount,
        createdAt: new Date().toISOString()
      })
    }).catch((err) => {
      console.error("Error enviando pedido al backend:", err);
    });

    sendOrderToWhatsApp(orderMessage);

    alert("Se abrió WhatsApp con el pedido listo para enviar. Revísalo y mándalo desde ahí ✅ gracias por la confianza");

    // Limpiar carrito
    cart = [];
    updateCartCount();
    buyerNameInput.value = "";
    closeOrderModal();
  });
}

/* ============================================================
   PANEL ADMIN – PRODUCTOS
   ============================================================ */

function clearAdminForm() {
  adminProductIdInput.value = "";
  adminNameInput.value = "";
  adminDescInput.value = "";
  adminPriceInput.value = "";
  adminOriginInput.value = "";
  adminDaysInput.value = "";
  adminImageInput.value = "";
}

function fillAdminForm(product) {
  adminProductIdInput.value = product.id;
  adminNameInput.value = product.name;
  adminDescInput.value = product.description;
  adminPriceInput.value = product.price;
  adminOriginInput.value = product.originCountry;
  adminDaysInput.value = product.estimatedDeliveryDays;
  adminImageInput.value = product.image;
}

function renderAdminProductList() {
  if (!adminProductsTbody) return;

  adminProductsTbody.innerHTML = "";

  if (!products || products.length === 0) {
    adminProductsTbody.innerHTML = `<tr><td colspan="5">No hay productos.</td></tr>`;
    return;
  }

  products.forEach((p) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>$${Number(p.price).toFixed(2)} MXN</td>
      <td>${p.originCountry}</td>
      <td><button class="admin-edit-btn">Editar</button></td>
    `;

    tr.querySelector("button").addEventListener("click", () => fillAdminForm(p));

    adminProductsTbody.appendChild(tr);
  });
}

if (productForm) {
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = adminProductIdInput.value.trim();
    const name = adminNameInput.value.trim();
    const description = adminDescInput.value.trim();
    const price = parseFloat(adminPriceInput.value);
    const origin = adminOriginInput.value.trim();
    const days = parseInt(adminDaysInput.value);
    const image = adminImageInput.value.trim();

    if (!name || !description || isNaN(price) || !origin || isNaN(days) || !image) {
      alert("Completa todos los campos del producto correctamente.");
      return;
    }

    if (id) {
      const index = products.findIndex((p) => p.id === Number(id));
      if (index !== -1) {
        products[index] = {
          ...products[index],
          id: Number(id),
          name,
          description,
          price,
          originCountry: origin,
          estimatedDeliveryDays: days,
          image
        };
      }
    } else {
      const newId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

      products.push({
        id: newId,
        name,
        description,
        price,
        originCountry: origin,
        estimatedDeliveryDays: days,
        image
      });
    }

    saveProductsToStorage(products);
    renderProducts();
    renderAdminProductList();
    renderOfferProductOptions();
    alert("Producto guardado correctamente ✅");
    clearAdminForm();
  });
}

if (newProductBtn) {
  newProductBtn.addEventListener("click", clearAdminForm);
}

/* ============================================================
   PANEL ADMIN – OFERTAS
   ============================================================ */

function renderOfferProductOptions() {
  if (!offerProductSelect) return;
  offerProductSelect.innerHTML = `<option value="">Selecciona un producto</option>`;
  products.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.id} – ${p.name}`;
    offerProductSelect.appendChild(opt);
  });
}

function renderAdminOffers() {
  if (!adminOffersList) return;

  adminOffersList.innerHTML = "";

  if (!offers || offers.length === 0) {
    adminOffersList.innerHTML = "<li>No hay ofertas.</li>";
    return;
  }

  offers.forEach((offer, index) => {
    const product = products.find((p) => p.id === offer.productId);

    const li = document.createElement("li");
    li.className = "offer-item-admin";

    if (!product) {
      li.textContent = `Oferta ${index + 1} (producto no encontrado)`;
    } else {
      li.innerHTML = `
        <img src="${product.image}" alt="Oferta">
        <div>
          <div><strong>${product.name}</strong></div>
          <div style="font-size:0.85rem;">
            ${offer.text ? offer.text + "<br>" : ""}
            <span class="price-old">$${Number(offer.previousPrice).toFixed(2)} MXN</span>
            <span class="price-new">$${Number(product.price).toFixed(2)} MXN</span>
          </div>
        </div>
        <button data-offer-index="${index}" class="btn-secondary" style="margin-left:auto;font-size:0.8rem;">
          Quitar oferta
        </button>
      `;
    }

    adminOffersList.appendChild(li);
  });
}

if (offerForm && offerProductSelect && offerNewPriceInput) {
  offerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const productId = parseInt(offerProductSelect.value);
    const newPrice = parseFloat(offerNewPriceInput.value);
    const text = offerTextInput.value.trim();

    if (!productId || isNaN(newPrice)) {
      alert("Selecciona un producto y pon un nuevo precio.");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      alert("Producto no encontrado.");
      return;
    }

    const previousPrice = Number(product.price);

    // Actualizar producto con descuento
    product.oldPrice = previousPrice;
    product.price = newPrice;

    // Quitar oferta previa de ese producto si ya existía
    offers = offers.filter((o) => o.productId !== productId);

    offers.push({
      productId,
      previousPrice,
      newPrice,
      text
    });

    saveProductsToStorage(products);
    saveOffers(offers);

    offerNewPriceInput.value = "";
    offerTextInput.value = "";
    offerProductSelect.value = "";

    renderProducts();
    renderOffers();
    renderAdminOffers();

    alert("Oferta aplicada al producto ✅");
  });
}

// Quitar oferta y restaurar precio original
document.addEventListener("click", (e) => {
  const btn = e.target;
  if (btn && btn.matches("[data-offer-index]")) {
    const index = parseInt(btn.getAttribute("data-offer-index"));
    if (isNaN(index) || !offers[index]) return;

    const offer = offers[index];
    const product = products.find((p) => p.id === offer.productId);

    if (product) {
      product.price = offer.previousPrice;
      delete product.oldPrice;
      saveProductsToStorage(products);
      renderProducts();
    }

    offers.splice(index, 1);
    saveOffers(offers);
    renderOffers();
    renderAdminOffers();
  }
});

/* ============================================================
   LOGIN ADMIN (CONTRASEÑA)
   ============================================================ */

function initAdminPanelVisibility() {
  if (!adminPanelEl) return;

  const params = new URLSearchParams(window.location.search);
  const wantsAdmin = params.get("admin") === "1";

  if (!wantsAdmin) {
    return;
  }

  const alreadyLogged = localStorage.getItem(ADMIN_LOGGED_KEY) === "true";
  if (alreadyLogged) {
    adminPanelEl.classList.remove("hidden");
    renderAdminProductList();
    renderOfferProductOptions();
    renderAdminOffers();
    return;
  }

  const pwd = prompt("Ingresa la contraseña de administrador:");

  if (pwd === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_LOGGED_KEY, "true");
    adminPanelEl.classList.remove("hidden");
    renderAdminProductList();
    renderOfferProductOptions();
    renderAdminOffers();
  } else {
    alert("Contraseña incorrecta. Acceso denegado.");
  }
}

/* ============================================================
   HEADER TRANSPARENTE AL HACER SCROLL
   ============================================================ */

const headerEl = document.querySelector(".header");
window.addEventListener("scroll", () => {
  if (!headerEl) return;
  if (window.scrollY <= 0) {
    headerEl.classList.remove("header-scrolled");
  } else {
    headerEl.classList.add("header-scrolled");
  }
});

/* ============================================================
   INICIALIZACIÓN GENERAL
   ============================================================ */

renderProducts();
renderOffers();
updateCartCount();
initAdminPanelVisibility();

/* ============================
   REGISTRO DEL SERVICE WORKER
   ============================ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Service Worker registrado ✅", reg.scope);
      })
      .catch((err) => {
        console.error("Error registrando Service Worker", err);
      });
  });
}

/* ========================
   COPIAR NÚMERO DE CUENTA
   ======================== */
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "copy-account-btn") {
    const numberEl = document.getElementById("account-number");
    const statusEl = document.getElementById("copy-status");
    if (!numberEl || !statusEl) return;

    const number = numberEl.textContent;
    navigator.clipboard
      .writeText(number)
      .then(() => {
        statusEl.textContent = "Número copiado ✔";
        setTimeout(() => {
          statusEl.textContent = "";
        }, 2000);
      })
      .catch(() => {
        statusEl.textContent = "Error al copiar";
      });
  }
});

