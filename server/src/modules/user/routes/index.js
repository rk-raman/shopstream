// index.js - Main routes file
const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const addressRoutes = require("./address.routes");

const router = express.Router();

// Mount routes
router.use("/users/addresses", addressRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;
