const express = require("express");
const {
  authenticate,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const {
  validate,
} = require("../../../shared/middleware/validation.middleware");
const paymentController = require("../controllers/payment.controller");
const { paymentValidators } = require("../validators/payment.validators");

const router = express.Router();

// Public routes (no authentication required)
// Webhook endpoints - these should be public for payment gateways to call
router.post("/webhook/:gateway", paymentController.processWebhook);

// Get supported payment options
router.get("/options", paymentController.getSupportedOptions);

// Protected routes (authentication required)
router.use(authenticate);

// User payment operations
router.post(
  "/intent",
  validate(paymentValidators.createPaymentIntent),
  paymentController.createPaymentIntent
);

router.post(
  "/:paymentId/confirm",
  validate(paymentValidators.paymentId),
  validate(paymentValidators.confirmPayment),
  paymentController.confirmPayment
);

router.get(
  "/:paymentId",
  validate(paymentValidators.paymentId),
  paymentController.getPaymentById
);

router.post(
  "/:paymentId/cancel",
  validate(paymentValidators.paymentId),
  paymentController.cancelPayment
);

router.post(
  "/:paymentId/retry",
  validate(paymentValidators.paymentId),
  paymentController.retryPayment
);

// User's own payments
router.get(
  "/",
  validate(paymentValidators.paymentQuery),
  paymentController.getUserPayments
);

// Order payments
router.get(
  "/order/:orderId",
  validate(paymentValidators.objectId("orderId")),
  paymentController.getOrderPayments
);

// Payment methods management
router.get("/methods/saved", paymentController.getPaymentMethods);

router.post(
  "/methods/save",
  validate(paymentValidators.savePaymentMethod),
  paymentController.savePaymentMethod
);

router.delete(
  "/methods/:paymentMethodId",
  validate(paymentValidators.objectId("paymentMethodId")),
  paymentController.deletePaymentMethod
);

// Admin routes (admin authorization required)
router.use(authorize(["admin"]));

// Admin payment operations
router.get(
  "/admin/all",
  validate(paymentValidators.paymentQuery),
  paymentController.getAllPayments
);

router.get(
  "/admin/stats",
  validate(paymentValidators.statsQuery),
  paymentController.getPaymentStats
);

router.get(
  "/admin/user/:userId",
  validate(paymentValidators.objectId("userId")),
  validate(paymentValidators.paymentQuery),
  paymentController.getUserPayments
);

router.post(
  "/admin/:paymentId/refund",
  validate(paymentValidators.paymentId),
  validate(paymentValidators.refundPayment),
  paymentController.refundPayment
);

router.patch(
  "/admin/:paymentId/status",
  validate(paymentValidators.paymentId),
  validate(paymentValidators.updatePaymentStatus),
  paymentController.updatePaymentStatus
);

module.exports = router;
