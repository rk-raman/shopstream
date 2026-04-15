const express = require("express");
const router = express.Router();
const {
  authenticate,
  customerOnly,
} = require("../../../shared/middleware/auth.middleware");
const checkoutController = require("../controllers/checkout.controller");

// All checkout routes require authentication
router.use(authenticate);
router.use(customerOnly);

// Session lifecycle
router.post("/session", checkoutController.createSession);
router.get("/session/:sessionId", checkoutController.getSession);

// Step: Address
router.put("/session/:sessionId/address", checkoutController.setAddress);

// Step: Summary
router.get("/session/:sessionId/summary", checkoutController.getSummary);

// Coupon
router.post("/session/:sessionId/coupon", checkoutController.applyCoupon);
router.delete("/session/:sessionId/coupon", checkoutController.removeCoupon);

// Step: Payment
router.post(
  "/session/:sessionId/payment/initiate",
  checkoutController.initiatePayment
);
router.post(
  "/session/:sessionId/payment/confirm",
  checkoutController.confirmPayment
);
router.post("/session/:sessionId/payment/cod", checkoutController.placeCODOrder);

// Confirmation
router.get(
  "/session/:sessionId/confirmation",
  checkoutController.getConfirmation
);

module.exports = router;
