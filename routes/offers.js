const router = require("express").Router();
const Offer = require("../models/Offer");
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  res.json(await Offer.find());
});

router.post("/", async (req, res) => {
  const { productId, newPrice, text } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  const offer = await Offer.create({
    productId,
    previousPrice: product.price,
    newPrice,
    text
  });

  product.oldPrice = product.price;
  product.price = newPrice;
  await product.save();

  res.status(201).json(offer);
});

router.delete("/:productId", async (req, res) => {
  const offer = await Offer.findOne({ productId: req.params.productId });
  if (!offer) return res.sendStatus(404);

  const product = await Product.findById(req.params.productId);
  if (product) {
    product.price = offer.previousPrice;
    product.oldPrice = undefined;
    await product.save();
  }

  await offer.deleteOne();
  res.json({ ok: true });
});

module.exports = router;

