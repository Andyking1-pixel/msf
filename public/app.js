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
    image: "/img/netflix-perfil.png"
  },
  {
    id: 2,
    name: "Netflix",
    description: "Netflix Completa.",
    price: 200,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/netflix-completa.png"
  },
  {
    id: 3,
    name: "Max Platino Perfil",
    description: "Perfil Max.",
    price: 45.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/max-perfil.png"
  },
  {
    id: 4,
    name: "Max Platino",
    description: "Max Platino Completa.",
    price: 145.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/max-completa.png"
  },
  {
    id: 5,
    name: "Disney premium Perfil",
    description: "Perfil Disney.",
    price: 50.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/disney-perfil.png"
  },
  {
    id: 6,
    name: "Disney premium",
    description: "Disney premium Completa.",
    price: 180.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/disney-completa.png"
  },
  {
    id: 7,
    name: "Vix 2 meses Perfil",
    description: "Perfil Vix Premium.",
    price: 40.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/vix-perfil.png"
  },
  {
    id: 8,
    name: "Vix 2 meses",
    description: "Vix Premium Completa.",
    price: 65.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/vix-completa.png"
  },
  {
    id: 9,
    name: "Prime Video Perfil",
    description: "Perfil Prime Video.",
    price: 40.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/prime-perfil.png"
  },
  {
    id: 10,
    name: "Prime Video",
    description: "Prime Video Completa.",
    price: 70.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/prime-completa.png"
  },
  {
    id: 11,
    name: "Crunchyroll Perfil",
    description: "Perfil Crunchyroll.",
    price: 35.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/crunchy-perfil.png"
  },
  {
    id: 12,
    name: "Crunchyroll",
    description: "Crunchyroll Completa.",
    price: 65.0,
    originCountry: "Mexico",
    estimatedDeliveryDays: 1,
    image: "/img/crunchy-completa.png"
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
   OFERTAS
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

// Estructura: { text, image }
let offers = loadOffers();

/* ============================================================
   ELEMENTOS DEL DOM
   ============================================================ */

const productsListEl = document.getElementById("products-list");
const modalEl = document.getElementById("order-modal");
const closeModalBtn = document.getElementById("close-modal");
const orderForm = document.getElementById("order-form");

const productIdInput = document.getElementById("product-id");
const buyerNameInput = document.getElementById("buyer-name");
const quantityInput = document.getElementById("quantity");
const modalProductNameEl = document.getElementById("modal-product-name");

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
const offerTextInput = document.getElementById("offer-text");
const offerImageInput = document.getElementById("offer-image");
const adminOffersList = document.getElementById("admin-offers-list");

/* ============================================================
   RENDER PRODUCTOS (CON ANIMACIÓN)
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

    // Delay para que entren en cascada
    card.style.animationDelay = `${index * 0.07}s`;

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-image">
      <h3 class="product-name">${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <p class="product-meta">Origen: ${p.originCountry} · Entrega estimada: ${p.estimatedDeliveryDays} días</p>
      <p class="product-price">$${Number(p.price).toFixed(2)} MXN</p>
      <button class="order-btn" data-id="${p.id}">Ordenar</button>
    `;

    productsListEl.appendChild(card);
  });

  const orderButtons = document.querySelectorAll(".order-btn");
  orderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = parseInt(btn.getAttribute("data-id"));
      openOrderModal(productId);
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
    const li = document.createElement("li");
    li.className = "offer-card";

    const hasImage = offer.image && offer.image.trim() !== "";

    li.innerHTML = `
      ${hasImage ? `<img src="${offer.image}" alt="Oferta" class="offer-image">` : ""}
      <div class="offer-content">
        <div class="offer-text">${offer.text}</div>
        <span class="offer-badge">Oferta limitada</span>
      </div>
    `;

    offersList.appendChild(li);
  });
}

/* ============================================================
   MODAL DE PEDIDO
   ============================================================ */

function openOrderModal(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  productIdInput.value = product.id;
  modalProductNameEl.textContent = `Producto: ${product.name} – $${Number(product.price).toFixed(2)} MXN`;
  quantityInput.value = 1;
  modalEl.classList.remove("hidden");
}

function closeOrderModal() {
  modalEl.classList.add("hidden");
  if (orderForm) orderForm.reset();
  modalProductNameEl.textContent = "";
}

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
  const phoneNumber = "523328312781"; // tu número
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* ============================================================
   FORMULARIO PÚBLICO (PEDIDO)
   ============================================================ */

if (orderForm) {
  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const productId = parseInt(productIdInput.value);
    const product = products.find((p) => p.id === productId);

    const buyerName = buyerNameInput.value.trim();
    const quantity = parseInt(quantityInput.value);

    if (!product || !buyerName || quantity < 1) {
      alert("Por favor completa todos los campos correctamente.");
      return;
    }

    const totalAmount = Number(product.price) * quantity;

    const orderMessage =
      `MSF – Nuevo pedido:\n\n` +
      `Producto: ${product.name}\n` +
      `Cantidad: ${quantity}\n` +
      `Total: $${totalAmount.toFixed(2)} MXN\n\n` +
      `Cliente: ${buyerName}\n\n` +
      `Fecha: ${new Date().toLocaleString()}`;

    // Enviar pedido al backend (log / futuro historial)
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        buyerName,
        quantity,
        totalAmount,
        createdAt: new Date().toISOString()
      })
    }).catch((err) => {
      console.error("Error enviando pedido al backend:", err);
    });

    // Enviar a WhatsApp
    sendOrderToWhatsApp(orderMessage);

    alert("Se abrió WhatsApp con el pedido listo para enviar. Revísalo y mándalo desde ahí ✅ gracias por la confianza");

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

function renderAdminOffers() {
  if (!adminOffersList) return;

  adminOffersList.innerHTML = "";

  if (!offers || offers.length === 0) {
    adminOffersList.innerHTML = "<li>No hay ofertas.</li>";
    return;
  }

  offers.forEach((offer, index) => {
    const li = document.createElement("li");
    li.className = "offer-item-admin";

    const hasImage = offer.image && offer.image.trim() !== "";

    li.innerHTML = `
      ${hasImage ? `<img src="${offer.image}" alt="Oferta">` : ""}
      <span>${offer.text}</span>
      <button data-offer-index="${index}" class="btn-secondary" style="margin-left:auto;font-size:0.8rem;">
        Eliminar
      </button>
    `;
    adminOffersList.appendChild(li);
  });
}

if (offerForm && offerTextInput && offerImageInput) {
  offerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = offerTextInput.value.trim();
    const image = offerImageInput.value.trim();

    if (!text || !image) {
      alert("Completa texto e imagen de la oferta.");
      return;
    }

    offers.push({ text, image });
    saveOffers(offers);
    offerTextInput.value = "";
    offerImageInput.value = "";

    renderOffers();
    renderAdminOffers();
  });
}

// Eliminar ofertas (delegación para botones)
document.addEventListener("click", (e) => {
  const btn = e.target;
  if (btn && btn.matches("[data-offer-index]")) {
    const index = parseInt(btn.getAttribute("data-offer-index"));
    if (!isNaN(index)) {
      offers.splice(index, 1);
      saveOffers(offers);
      renderOffers();
      renderAdminOffers();
    }
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
    // Si no trae ?admin=1, no mostramos nada
    return;
  }

  const alreadyLogged = localStorage.getItem(ADMIN_LOGGED_KEY) === "true";
  if (alreadyLogged) {
    adminPanelEl.classList.remove("hidden");
    renderAdminProductList();
    renderAdminOffers();
    return;
  }

  const pwd = prompt("Ingresa la contraseña de administrador:");

  if (pwd === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_LOGGED_KEY, "true");
    adminPanelEl.classList.remove("hidden");
    renderAdminProductList();
    renderAdminOffers();
  } else {
    alert("Contraseña incorrecta. Acceso denegado.");
  }
}

/* ============================================================
   INICIALIZACIÓN GENERAL
   ============================================================ */

renderProducts();
renderOffers();
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

