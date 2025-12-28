const router = require("express").Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  res.json(await Product.find());
});

router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(product);
});

module.exports = router;

