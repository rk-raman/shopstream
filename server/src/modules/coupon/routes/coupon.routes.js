const express = require("express");
const router = express.Router();
const {
  authenticate,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const couponController = require("../controllers/coupon.controller");

// All routes require authentication + seller/admin role
router.use(authenticate);
router.use(authorize("seller", "admin"));

// Stats
router.get("/stats", couponController.getCouponStats);

// CRUD
router.post("/", couponController.createCoupon);
router.get("/", couponController.getCoupons);
router.get("/:couponId", couponController.getCouponById);
router.put("/:couponId", couponController.updateCoupon);
router.delete("/:couponId", couponController.deleteCoupon);

// Toggle active/inactive
router.patch("/:couponId/toggle", couponController.toggleCoupon);

// Usage analytics
router.get("/:couponId/usage", couponController.getCouponUsage);

module.exports = router;
