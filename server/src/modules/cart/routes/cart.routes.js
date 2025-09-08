const express = require("express");
const cartController = require("../controllers/cart.controller");
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveCartItem,
  validateApplyCoupon,
  validateGetAbandonedCarts,
} = require("../validators/cart.validators");
const {
  authenticate,
  adminOnly,
} = require("../../../shared/middleware/auth.middleware");

const router = express.Router();

// 🔹 Apply authentication middleware to all cart routes
router.use(authenticate);

// Cart management routes
router.get("/", cartController.getCart);
router.post("/add", validateAddToCart, cartController.addToCart);
router.put(
  "/item/:itemId",
  validateUpdateCartItem,
  cartController.updateCartItem
);
router.delete(
  "/item/:itemId",
  validateRemoveCartItem,
  cartController.removeFromCart
);
router.delete("/clear", cartController.clearCart);

// Cart summary and sync
router.get("/summary", cartController.getCartSummary);
router.post("/sync", cartController.syncCart);

// Coupon management (future implementation)
router.post("/coupon", validateApplyCoupon, cartController.applyCoupon);
router.delete("/coupon", cartController.removeCoupon);

// 🔹 Admin-only routes
router.use(adminOnly);
router.get(
  "/abandoned",
  validateGetAbandonedCarts,
  cartController.getAbandonedCarts
);

module.exports = router;
