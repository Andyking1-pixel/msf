const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Offer",
  new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    previousPrice: Number,
    newPrice: Number,
    text: String
  })
);

