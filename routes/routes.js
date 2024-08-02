const router = require("express").Router();
const { home, stk, callbacks, transactions, b2c, b2cresults, b2ctimeOut, balanceEnquiry } = require("../controlers/mpesa.controller");
const generateToken = require("../utils/tk");

// C2B routes
router.get("/", home);
router.post("/stk", generateToken, stk);
router.post("/callback", callbacks);
router.get("/transactions", transactions);

// B2C routes
router.post('/b2c', generateToken, b2c);
router.post('/b2cresults', b2cresults);
router.post('/b2ctimeout', b2ctimeOut);

// Query Balance
router.post('/balance', generateToken, balanceEnquiry)

module.exports = router;