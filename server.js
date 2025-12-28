const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Archivo donde guardamos productos y ofertas
const DATA_FILE = path.join(__dirname, "data.json");

// Productos por defecto (con URLs que te gustaban)
const DEFAULT_DATA = {
  products: [
    {
      id: 1,
      name: "Netflix Perfil",
      description: "Perfil de Netflix.",
      price: 70,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png"
    },
    {
      id: 2,
      name: "Netflix",
      description: "Netflix Completa.",
      price: 200,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png"
    },
    {
      id: 3,
      name: "Max Platino Perfil",
      description: "Perfil Max.",
      price: 45.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg"
    },
    {
      id: 4,
      name: "Max Platino",
      description: "Max Platino Completa.",
      price: 145.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg"
    },
    {
      id: 5,
      name: "Disney premium Perfil",
      description: "Perfil Disney.",
      price: 50.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"
    },
    {
      id: 6,
      name: "Disney premium",
      description: "Disney premium Completa.",
      price: 180.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"
    },
    {
      id: 7,
      name: "Vix 2 meses Perfil",
      description: "Perfil Vix Premium.",
      price: 40.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/ViX_Logo.svg"
    },
    {
      id: 8,
      name: "Vix 2 meses",
      description: "Vix Premium Completa.",
      price: 65.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/ViX_Logo.svg"
    },
    {
      id: 9,
      name: "Prime Video Perfil",
      description: "Perfil Prime Video.",
      price: 40.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg"
    },
    {
      id: 10,
      name: "Prime Video",
      description: "Prime Video Completa.",
      price: 70.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg"
    },
    {
      id: 11,
      name: "Crunchyroll Perfil",
      description: "Perfil Crunchyroll.",
      price: 35.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Crunchyroll_Logo.svg"
    },
    {
      id: 12,
      name: "Crunchyroll",
      description: "Crunchyroll Completa.",
      price: 65.0,
      originCountry: "Mexico",
      estimatedDeliveryDays: 1,
      image: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Crunchyroll_Logo.svg"
    }
  ],
  offers: []
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return {
        products:
          Array.isArray(parsed.products) && parsed.products.length
            ? parsed.products
            : DEFAULT_DATA.products,
        offers: Array.isArray(parsed.offers) ? parsed.offers : []
      };
    }
  } catch (err) {
    console.error("Error leyendo data.json, usando valores por defecto:", err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

let db = loadData();

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error guardando data.json:", err);
  }
}

/* =========
   PRODUCTOS
   ========= */

app.get("/api/products", (req, res) => {
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const { name, description, price, originCountry, estimatedDeliveryDays, image } =
    req.body || {};

  if (
    !name ||
    !description ||
    typeof price !== "number" ||
    !originCountry ||
    typeof estimatedDeliveryDays !== "number" ||
    !image
  ) {
    return res.status(400).json({ error: "Datos de producto inválidos" });
  }

  const newId =
    db.products.length > 0 ? Math.max(...db.products.map((p) => p.id)) + 1 : 1;

  const product = {
    id: newId,
    name,
    description,
    price,
    originCountry,
    estimatedDeliveryDays,
    image
  };

  db.products.push(product);
  saveData();
  res.status(201).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

  const update = req.body || {};
  db.products[index] = { ...db.products[index], ...update, id };
  saveData();
  res.json(db.products[index]);
});

/* =======
   OFERTAS
   ======= */

app.get("/api/offers", (req, res) => {
  res.json(db.offers);
});

app.post("/api/offers", (req, res) => {
  const { productId, newPrice, text } = req.body || {};
  const id = parseInt(productId);
  const product = db.products.find((p) => p.id === id);

  if (!product || typeof newPrice !== "number") {
    return res.status(400).json({ error: "Datos de oferta inválidos" });
  }

  const previousPrice =
    typeof product.oldPrice === "number" ? product.oldPrice : product.price;

  product.oldPrice = previousPrice;
  product.price = newPrice;

  db.offers = db.offers.filter((o) => o.productId !== id);

  const offer = {
    productId: id,
    previousPrice,
    newPrice,
    text: text || ""
  };

  db.offers.push(offer);
  saveData();
  res.status(201).json(offer);
});

app.delete("/api/offers/:productId", (req, res) => {
  const id = parseInt(req.params.productId);
  const index = db.offers.findIndex((o) => o.productId === id);
  if (index === -1) {
    return res.status(404).json({ error: "Oferta no encontrada" });
  }

  const offer = db.offers[index];
  const product = db.products.find((p) => p.id === id);

  if (product && typeof offer.previousPrice === "number") {
    product.price = offer.previousPrice;
    delete product.oldPrice;
  }

  db.offers.splice(index, 1);
  saveData();
  res.json({ success: true });
});

/* =======
   PEDIDOS
   ======= */

app.post("/api/orders", (req, res) => {
  console.log("Nuevo pedido recibido:", req.body);
  res.json({ ok: true });
});

/* ==========
   FRONTEND
   ========== */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`MSF backend escuchando en http://localhost:${PORT}`);
});

