
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/login", async (req,res)=>{
  const {user, pass} = req.body;
  if(user !== process.env.ADMIN_USER) return res.sendStatus(401);
  const ok = await bcrypt.compare(pass, process.env.ADMIN_PASS_HASH);
  if(!ok) return res.sendStatus(401);
  const token = jwt.sign({user}, process.env.JWT_SECRET, {expiresIn:"8h"});
  res.json({token});
});

module.exports = router;
