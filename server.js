// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, "public")));

// Endpoint simple para probar que el backend responde
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MSF backend funcionando 🚀" });
});

// Endpoint para registrar pedidos (por ahora, solo log)
app.post("/api/orders", (req, res) => {
  const order = req.body;
  console.log("📦 Nuevo pedido recibido en backend:", order);

  // Aquí en el futuro podrías:
  // - Guardar en una base de datos
  // - Mandar un correo
  // - Notificar a otro servicio

  res.json({ ok: true, message: "Pedido recibido por el backend" });
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`MSF backend escuchando en http://localhost:${PORT}`);
});

