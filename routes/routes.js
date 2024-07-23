const router = require("express").Router();
const { home, stk, callbacks, transactions } = require("../controlers/mpesa.controller");
const generateToken = require("../utils/tk");

router.get("/", home);
router.post("/stk", generateToken, stk);
router.post("/callback", callbacks);
router.get("/transactions", transactions);

module.exports = router;