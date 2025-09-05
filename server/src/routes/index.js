// const express = require("express");
// const router = express.Router();

// // Import all module routes
// const userRoutes = require("../modules/user/routes");
// // const productRoutes = require("../modules/product/routes");
// // const cartRoutes = require("../modules/cart/routes");
// // const orderRoutes = require("../modules/order/routes");
// // const paymentRoutes = require("../modules/payment/routes");
// // const inventoryRoutes = require("../modules/inventory/routes");
// // const notificationRoutes = require("../modules/notification/routes");
// // const reviewRoutes = require("../modules/review/routes");
// // const analyticsRoutes = require("../modules/analytics/routes");

// // Health check for each module
// router.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     modules: {
//       user: "active",
//       product: "active",
//       cart: "active",
//       order: "active",
//       payment: "active",
//       inventory: "active",
//       notification: "active",
//       review: "active",
//       analytics: "active",
//     },
//     timestamp: new Date().toISOString(),
//   });
// });

// // Module routes (these will become separate services later)
// router.use("/users", userRoutes);
// // router.use("/products", productRoutes);
// // router.use("/cart", cartRoutes);
// // router.use("/orders", orderRoutes);
// // router.use("/payments", paymentRoutes);
// // router.use("/inventory", inventoryRoutes);
// // router.use("/notifications", notificationRoutes);
// // router.use("/reviews", reviewRoutes);
// // router.use("/analytics", analyticsRoutes);

// module.exports = router;

const express = require("express");
const router = express.Router();
const userRoutes = require("../modules/user/routes");
const { notificationRoutes } = require("../modules/notification/routes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running!",
    data: {
      service: "E-commerce Backend",
      status: "active",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

router.use(userRoutes);
router.use("/notifications", notificationRoutes);

// API Info endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to E-commerce API",
    data: {
      version: "1.0.0",
      documentation: "/api/docs",
      health: "/api/health",
    },
  });
});

module.exports = router;
