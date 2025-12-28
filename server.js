const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ============================
   ARCHIVOS DE DATOS
   ============================ */

const DATA_FILE = path.join(__dirname, "data.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");

/* ============================
   DATA INICIAL
   ============================ */

const DEFAULT_DATA = {
  products: [
    {
      id: 1,
      name: "Netflix Perfil",
      description: "Perfil de Netflix.",
      price: 70,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png"
    }
  ],
  offers: []
};

/* ============================
   HELPERS DATA
   ============================ */

function loadJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  } catch (err) {
    console.error(`Error leyendo ${file}`, err);
  }
  return JSON.parse(JSON.stringify(fallback));
}

function saveJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error guardando ${file}`, err);
  }
}

let db = loadJSON(DATA_FILE, DEFAULT_DATA);
let ordersDB = loadJSON(ORDERS_FILE, { orders: [] });

/* ============================
   PRODUCTOS
   ============================ */

app.get("/api/products", (req, res) => {
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const {
    name,
    description,
    price,
    originCountry,
    estimatedDeliveryDays,
    image
  } = req.body;

  if (!name || !description || typeof price !== "number") {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const id =
    db.products.length > 0
      ? Math.max(...db.products.map((p) => p.id)) + 1
      : 1;

  const product = {
    id,
    name,
    description,
    price,
    originCountry,
    estimatedDeliveryDays,
    image
  };

  db.products.push(product);
  saveJSON(DATA_FILE, db);
  res.status(201).json(product);
});

/* ============================
   OFERTAS
   ============================ */

app.get("/api/offers", (req, res) => {
  res.json(db.offers);
});

app.post("/api/offers", (req, res) => {
  const { productId, newPrice, text } = req.body;
  const product = db.products.find((p) => p.id === productId);

  if (!product || typeof newPrice !== "number") {
    return res.status(400).json({ error: "Oferta inválida" });
  }

  const previousPrice = product.price;
  product.oldPrice = previousPrice;
  product.price = newPrice;

  db.offers = db.offers.filter((o) => o.productId !== productId);
  db.offers.push({
    productId,
    previousPrice,
    newPrice,
    text
  });

  saveJSON(DATA_FILE, db);
  res.status(201).json({ ok: true });
});

/* ============================
   PEDIDOS (NUEVO)
   ============================ */

app.post("/api/orders", (req, res) => {
  const { items, buyerName, totalAmount, createdAt } = req.body;

  if (!items || !buyerName || typeof totalAmount !== "number") {
    return res.status(400).json({ error: "Pedido inválido" });
  }

  const order = {
    id: ordersDB.orders.length + 1,
    buyerName,
    items,
    totalAmount,
    createdAt: createdAt || new Date().toISOString(),
    status: "nuevo"
  };

  ordersDB.orders.push(order);
  saveJSON(ORDERS_FILE, ordersDB);

  console.log("Pedido guardado:", order.id);
  res.json({ ok: true, orderId: order.id });
});

/* ============================
   FRONTEND
   ============================ */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`MSF backend corriendo en http://localhost:${PORT}`);
});

