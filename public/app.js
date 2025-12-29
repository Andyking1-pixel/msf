let products = [];
let cart = [];

/* =============================
   CARGAR PRODUCTOS DESDE API
============================= */
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    products = await res.json();
    renderProducts();
    renderAdminProductList();
  } catch (err) {
    console.error("Error cargando productos", err);
  }
}

/* =============================
   RENDER PRODUCTOS
============================= */
function renderProducts() {
  const el = document.getElementById("products-list");
  if (!el) return;

  el.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" class="product-image">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>$${p.price} MXN</strong></p>
      <button onclick="addToCart('${p._id}')">Agregar</button>
    `;

    el.appendChild(card);
  });
}

/* =============================
   CARRITO
============================= */
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  alert("Agregado al carrito");
}

/* =============================
   ADMIN - LISTA
============================= */
function renderAdminProductList() {
  const tbody = document.getElementById("admin-products-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>$${p.price}</td>
      <td>
        <button onclick="deleteProduct('${p._id}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* =============================
   ADMIN - CREAR
============================= */
const productForm = document.getElementById("product-form");
if (productForm) {
  productForm.addEventListener("submit", async e => {
    e.preventDefault();

    const data = {
      name: adminName.value,
      description: adminDescription.value,
      price: Number(adminPrice.value),
      originCountry: adminOrigin.value,
      estimatedDeliveryDays: Number(adminDays.value),
      image: adminImage.value
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

/* =============================
   ADMIN - ELIMINAR
============================= */
async function deleteProduct(id) {
  if (!confirm("Eliminar producto?")) return;

  await fetch(`/api/products/${id}`, { method: "DELETE" });
  loadProducts();
}

/* =============================
   INIT
============================= */
loadProducts();

