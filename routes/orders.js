
const router = require("express").Router();
const Order = require("../models/Order");

router.post("/", async(req,res)=>{
  await Order.create(req.body);
  res.json({ok:true});
});

module.exports = router;
