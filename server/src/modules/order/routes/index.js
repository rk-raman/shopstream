const express = require("express");
const router = express.Router();

// Import route modules
const orderRoutes = require("./order.routes");

// Mount routes
router.use("/", orderRoutes);

module.exports = router;
