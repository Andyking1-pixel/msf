require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const productRoutes = require("./routes/products");
const offerRoutes = require("./routes/offers");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Mongo error:", err));

app.use("/api/products", productRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/orders", orderRoutes);

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("MSF corriendo en puerto", PORT);
});

