const express = require("express");
const router = express.Router();

// Import controllers
const paymentController = require("../controllers/payment.controller");

// Import middleware
const { authenticate, authorize } = require("../../../shared/middleware/auth");
const {
  validateCreatePaymentIntent,
  validateConfirmPayment,
  validateRefundPayment,
  validateUpdatePaymentStatus,
  validatePaymentQuery,
  validateSavePaymentMethod,
  validateStatsQuery,
  validatePaymentId,
  validateObjectId,
} = require("../validators/payment.validators");

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
  validateCreatePaymentIntent,
  paymentController.createPaymentIntent
);
router.post(
  "/:paymentId/confirm",
  validatePaymentId,
  validateConfirmPayment,
  paymentController.confirmPayment
);
router.get("/:paymentId", validatePaymentId, paymentController.getPaymentById);
router.post(
  "/:paymentId/cancel",
  validatePaymentId,
  paymentController.cancelPayment
);
router.post(
  "/:paymentId/retry",
  validatePaymentId,
  paymentController.retryPayment
);

// User's own payments
router.get("/", validatePaymentQuery, paymentController.getUserPayments);

// Order payments
router.get(
  "/order/:orderId",
  validateObjectId("orderId"),
  paymentController.getOrderPayments
);

// Payment methods management
router.get("/methods/saved", paymentController.getPaymentMethods);
router.post(
  "/methods/save",
  validateSavePaymentMethod,
  paymentController.savePaymentMethod
);
router.delete(
  "/methods/:paymentMethodId",
  paymentController.deletePaymentMethod
);

// Admin routes (admin authorization required)
router.use(authorize(["admin"]));

// Admin payment operations
router.get(
  "/admin/all",
  validatePaymentQuery,
  paymentController.getAllPayments
);
router.get(
  "/admin/stats",
  validateStatsQuery,
  paymentController.getPaymentStats
);
router.get(
  "/admin/user/:userId",
  validateObjectId("userId"),
  validatePaymentQuery,
  paymentController.getUserPayments
);
router.post(
  "/admin/:paymentId/refund",
  validatePaymentId,
  validateRefundPayment,
  paymentController.refundPayment
);
router.patch(
  "/admin/:paymentId/status",
  validatePaymentId,
  validateUpdatePaymentStatus,
  paymentController.updatePaymentStatus
);

module.exports = router;
