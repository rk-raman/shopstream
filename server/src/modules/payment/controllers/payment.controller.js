const paymentService = require("../services/payment.service");
const { Payment } = require("../models");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Create payment intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const paymentData = req.body;

  const result = await paymentService.createPaymentIntent(paymentData, userId);

  return res.success(result, "Payment intent created successfully");
});

// Confirm payment
const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const confirmationData = req.body;

  const payment = await paymentService.confirmPayment(
    paymentId,
    confirmationData
  );

  return res.success(payment.getSummary(), "Payment confirmed successfully");
});

// Get payment by ID
const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.role === "admin" ? null : req.user.id;

  const payment = await paymentService.getPaymentById(paymentId, userId);

  return res.success(payment, "Payment retrieved successfully");
});

// Get user payments
const getUserPayments = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;

  // Only allow users to access their own payments unless admin
  if (req.user.role !== "admin" && userId !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  const options = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    gateway: req.query.gateway,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };

  const payments = await paymentService.getPaymentsByUser(userId, options);

  return res.success(payments, "User payments retrieved successfully");
});

// Get order payments
const getOrderPayments = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const payments = await paymentService.getPaymentsByOrder(orderId);

  return res.success(payments, "Order payments retrieved successfully");
});

// Refund payment
const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const refundData = req.body;
  const refundedBy = req.user.id;

  const payment = await paymentService.refundPayment(
    paymentId,
    refundData,
    refundedBy
  );

  return res.success(payment.getSummary(), "Payment refunded successfully");
});

// Cancel payment
const cancelPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.role === "admin" ? null : req.user.id;

  const payment = await paymentService.cancelPayment(paymentId, userId);

  return res.success(payment.getSummary(), "Payment canceled successfully");
});

// Retry failed payment
const retryPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.role === "admin" ? null : req.user.id;

  const result = await paymentService.retryPayment(paymentId, userId);

  return res.success(result, "Payment retry initiated successfully");
});

// Process webhook
const processWebhook = asyncHandler(async (req, res) => {
  const { gateway } = req.params;
  const signature =
    req.headers["stripe-signature"] || req.headers["paypal-auth-algo"];
  const webhookData = req.body;

  const result = await paymentService.processWebhook(
    gateway,
    webhookData,
    signature
  );

  return res.success(result, "Webhook processed successfully");
});

// Get payment statistics (Admin only)
const getPaymentStats = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    gateway: req.query.gateway,
    status: req.query.status,
  };

  const stats = await paymentService.getPaymentStats(filters);

  return res.success(stats, "Payment statistics retrieved successfully");
});

// Get all payments (Admin only)
const getAllPayments = asyncHandler(async (req, res) => {
  const options = req.query;

  // Build filter object
  const filter = {};
  if (options.status) filter.status = options.status;
  if (options.gateway) filter.gateway = options.gateway;
  if (options.userId) filter.userId = options.userId;

  // Date range filter
  if (options.startDate || options.endDate) {
    filter.createdAt = {};
    if (options.startDate) filter.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) filter.createdAt.$lte = new Date(options.endDate);
  }

  const paginationOptions = {
    page: parseInt(options.page),
    limit: parseInt(options.limit),
    populate: [
      { path: "userId", select: "firstName lastName email" },
      { path: "orderId", select: "orderNumber status" },
    ],
    sort: { createdAt: -1 },
  };

  const payments = await Payment.paginate(filter, paginationOptions);
  res.success(payments, "Payments retrieved successfully");
});

// Update payment status (Admin only)
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { status, reason } = req.body;

  const payment = await Payment.findOne({ paymentId });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const previousStatus = payment.status;
  payment.status = status;

  if (reason) {
    payment.metadata = { ...payment.metadata, statusChangeReason: reason };
  }

  await payment.save();

  return res.success(
    {
      paymentId: payment.paymentId,
      previousStatus,
      newStatus: status,
      updatedAt: payment.updatedAt,
    },
    "Payment status updated successfully"
  );
});

// Get payment methods for user
const getPaymentMethods = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { gateway = "stripe" } = req.query;

  // This would typically fetch saved payment methods from the gateway
  // For now, return empty array as placeholder
  return res.success(
    {
      paymentMethods: [],
      gateway,
    },
    "Payment methods retrieved successfully"
  );
});

// Save payment method for user
const savePaymentMethod = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { paymentMethodId, gateway = "stripe" } = req.body;

  // This would typically save the payment method with the gateway
  // Implementation depends on gateway-specific logic
  return res.success(
    {
      paymentMethodId,
      gateway,
      userId,
    },
    "Payment method saved successfully"
  );
});

// Delete payment method
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { paymentMethodId } = req.params;

  // This would typically delete the payment method from the gateway
  // Implementation depends on gateway-specific logic
  return res.success(
    {
      paymentMethodId,
      userId,
    },
    "Payment method deleted successfully"
  );
});

// Get supported gateways and currencies
const getSupportedOptions = asyncHandler(async (req, res) => {
  const supportedGateways = [
    {
      name: "stripe",
      displayName: "Stripe",
      currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
      paymentMethods: ["card", "apple_pay", "google_pay"],
      enabled: true,
    },
    {
      name: "paypal",
      displayName: "PayPal",
      currencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
      paymentMethods: ["paypal"],
      enabled: false, // Not implemented yet
    },
  ];

  return res.success(
    {
      gateways: supportedGateways,
      defaultGateway: "stripe",
      defaultCurrency: "USD",
    },
    "Supported payment options retrieved successfully"
  );
});

module.exports = {
  // Core payment operations
  createPaymentIntent,
  confirmPayment,
  getPaymentById,
  getUserPayments,
  getOrderPayments,
  refundPayment,
  cancelPayment,
  retryPayment,

  // Webhook handling
  processWebhook,

  // Admin operations
  getPaymentStats,
  getAllPayments,
  updatePaymentStatus,

  // Payment methods
  getPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,

  // Configuration
  getSupportedOptions,
};
