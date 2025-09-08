const paymentService = require("../services/payment.service");
const ApiError = require("../../../shared/utils/apiError");
const catchAsync = require("../../../shared/utils/catchAsync");
const { successResponse } = require("../../../shared/utils/responseHelper");

// Create payment intent
const createPaymentIntent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const paymentData = req.body;

  const result = await paymentService.createPaymentIntent(paymentData, userId);

  successResponse(res, {
    message: "Payment intent created successfully",
    data: result,
  });
});

// Confirm payment
const confirmPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const confirmationData = req.body;

  const payment = await paymentService.confirmPayment(
    paymentId,
    confirmationData
  );

  successResponse(res, {
    message: "Payment confirmed successfully",
    data: payment.getSummary(),
  });
});

// Get payment by ID
const getPaymentById = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.role === "admin" ? null : req.user.id;

  const payment = await paymentService.getPaymentById(paymentId, userId);

  successResponse(res, {
    message: "Payment retrieved successfully",
    data: payment,
  });
});

// Get user payments
const getUserPayments = catchAsync(async (req, res) => {
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

  successResponse(res, {
    message: "User payments retrieved successfully",
    data: payments,
  });
});

// Get order payments
const getOrderPayments = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const payments = await paymentService.getPaymentsByOrder(orderId);

  successResponse(res, {
    message: "Order payments retrieved successfully",
    data: payments,
  });
});

// Refund payment
const refundPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const refundData = req.body;
  const refundedBy = req.user.id;

  const payment = await paymentService.refundPayment(
    paymentId,
    refundData,
    refundedBy
  );

  successResponse(res, {
    message: "Payment refunded successfully",
    data: payment.getSummary(),
  });
});

// Cancel payment
const cancelPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.role === "admin" ? null : req.user.id;

  const payment = await paymentService.cancelPayment(paymentId, userId);

  successResponse(res, {
    message: "Payment canceled successfully",
    data: payment.getSummary(),
  });
});

// Retry failed payment
const retryPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.role === "admin" ? null : req.user.id;

  const result = await paymentService.retryPayment(paymentId, userId);

  successResponse(res, {
    message: "Payment retry initiated successfully",
    data: result,
  });
});

// Process webhook
const processWebhook = catchAsync(async (req, res) => {
  const { gateway } = req.params;
  const signature =
    req.headers["stripe-signature"] || req.headers["paypal-auth-algo"];
  const webhookData = req.body;

  const result = await paymentService.processWebhook(
    gateway,
    webhookData,
    signature
  );

  res.status(200).json({
    success: true,
    message: "Webhook processed successfully",
    data: result,
  });
});

// Get payment statistics (Admin only)
const getPaymentStats = catchAsync(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    gateway: req.query.gateway,
    status: req.query.status,
  };

  const stats = await paymentService.getPaymentStats(filters);

  successResponse(res, {
    message: "Payment statistics retrieved successfully",
    data: stats,
  });
});

// Get all payments (Admin only)
const getAllPayments = catchAsync(async (req, res) => {
  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 20,
    status: req.query.status,
    gateway: req.query.gateway,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    userId: req.query.userId,
  };

  // Build filter for admin queries
  const filter = {};
  if (options.status) filter.status = options.status;
  if (options.gateway) filter.gateway = options.gateway;
  if (options.userId) filter.userId = options.userId;
  if (options.startDate || options.endDate) {
    filter.createdAt = {};
    if (options.startDate) filter.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) filter.createdAt.$lte = new Date(options.endDate);
  }

  const Payment = require("../models/Payment.model");
  const paginationOptions = {
    page: parseInt(options.page),
    limit: parseInt(options.limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "orderId", select: "orderNumber items status" },
      { path: "userId", select: "firstName lastName email" },
    ],
  };

  const payments = await Payment.paginate(filter, paginationOptions);

  successResponse(res, {
    message: "All payments retrieved successfully",
    data: payments,
  });
});

// Update payment status (Admin only)
const updatePaymentStatus = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { status, reason } = req.body;

  const Payment = require("../models/Payment.model");
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

  successResponse(res, {
    message: "Payment status updated successfully",
    data: {
      paymentId: payment.paymentId,
      previousStatus,
      newStatus: status,
      updatedAt: payment.updatedAt,
    },
  });
});

// Get payment methods for user
const getPaymentMethods = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { gateway = "stripe" } = req.query;

  // This would typically fetch saved payment methods from the gateway
  // For now, return empty array as placeholder
  successResponse(res, {
    message: "Payment methods retrieved successfully",
    data: {
      paymentMethods: [],
      gateway,
    },
  });
});

// Save payment method for user
const savePaymentMethod = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { paymentMethodId, gateway = "stripe" } = req.body;

  // This would typically save the payment method with the gateway
  // Implementation depends on gateway-specific logic
  successResponse(res, {
    message: "Payment method saved successfully",
    data: {
      paymentMethodId,
      gateway,
      userId,
    },
  });
});

// Delete payment method
const deletePaymentMethod = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { paymentMethodId } = req.params;

  // This would typically delete the payment method from the gateway
  // Implementation depends on gateway-specific logic
  successResponse(res, {
    message: "Payment method deleted successfully",
    data: {
      paymentMethodId,
      userId,
    },
  });
});

// Get supported gateways and currencies
const getSupportedOptions = catchAsync(async (req, res) => {
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

  successResponse(res, {
    message: "Supported payment options retrieved successfully",
    data: {
      gateways: supportedGateways,
      defaultGateway: "stripe",
      defaultCurrency: "USD",
    },
  });
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
