const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  buyerName: {
    type: String,
    required: true
  },
  items: [
    {
      productId: Number,
      productName: String,
      quantity: Number,
      unitPrice: Number,
      subtotal: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "pendiente"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", OrderSchema);

