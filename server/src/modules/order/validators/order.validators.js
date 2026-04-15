const Joi = require("joi");
const { validateJoiMultiple: validateRequest } = require("../../../shared/middleware/validation.middleware");

// Common schemas
const objectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ObjectId format");

const addressSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  addressLine1: Joi.string().min(5).max(200).required(),
  addressLine2: Joi.string().max(200).optional(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  pincode: Joi.string()
    .regex(/^[0-9]{6}$/)
    .required(),
  country: Joi.string().default("India"),
  phone: Joi.string()
    .regex(/^[6-9]\d{9}$/)
    .required(),
});

const orderItemSchema = Joi.object({
  productId: objectIdSchema.required(),
  variantId: objectIdSchema.optional(),
  quantity: Joi.number().integer().min(1).max(100).required(),
});

const couponSchema = Joi.object({
  code: Joi.string().min(3).max(20).required(),
  discountAmount: Joi.number().min(0).optional(),
  discountType: Joi.string().valid("percentage", "fixed").optional(),
});

// Order creation validation
const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).max(50).required(),
  shippingAddress: addressSchema.required(),
  billingAddress: addressSchema.optional(),
  paymentMethod: Joi.string()
    .valid("cod", "card", "upi", "wallet", "netbanking")
    .required(),
  coupon: couponSchema.optional(),
  notes: Joi.string().max(500).optional(),
  specialInstructions: Joi.string().max(500).optional(),
});

// Order status update validation
const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
      "refunded"
    )
    .required(),
  note: Joi.string().max(500).optional(),
});

// Order cancellation validation
const cancelOrderSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required(),
});

// Payment processing validation
const processPaymentSchema = Joi.object({
  paymentData: Joi.object({
    transactionId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    gateway: Joi.string().optional(),
    gatewayResponse: Joi.object().optional(),
  }).required(),
});

// Refund initiation validation
const initiateRefundSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reason: Joi.string().min(10).max(500).required(),
});

// Return request validation
const requestReturnSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: objectIdSchema.required(),
        quantity: Joi.number().integer().min(1).required(),
        reason: Joi.string().max(200).optional(),
      })
    )
    .min(1)
    .optional(),
});

// Return processing validation
const processReturnSchema = Joi.object({
  action: Joi.string().valid("approve", "reject").required(),
  note: Joi.string().max(500).optional(),
});

// Tracking update validation
const updateTrackingSchema = Joi.object({
  trackingNumber: Joi.string().min(5).max(50).optional(),
  carrier: Joi.string().min(2).max(100).optional(),
  estimatedDelivery: Joi.date().iso().optional(),
  method: Joi.string().valid("standard", "express", "same_day").optional(),
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled"
    )
    .optional(),
  note: Joi.string().max(500).optional(),
});

// Tracking event validation
const addTrackingEventSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered"
    )
    .required(),
  location: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(5).max(500).required(),
  timestamp: Joi.date().iso().optional(),
});

// Bulk operations validation
const bulkUpdateOrdersSchema = Joi.object({
  orderIds: Joi.array().items(objectIdSchema).min(1).max(100).required(),
  updateData: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled"
      )
      .optional(),
    note: Joi.string().max(500).optional(),
  })
    .min(1)
    .required(),
});

const bulkUpdateTrackingSchema = Joi.object({
  updates: Joi.array()
    .items(
      Joi.object({
        orderId: objectIdSchema.required(),
        trackingData: updateTrackingSchema.required(),
      })
    )
    .min(1)
    .max(50)
    .required(),
});

// Query parameter validation schemas
const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().min(1).max(100).optional(),
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
      "refunded"
    )
    .optional(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed", "refunded", "partial_refund")
    .optional(),
  customerId: objectIdSchema.optional(),
  sellerId: objectIdSchema.optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "totalAmount", "orderNumber")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const orderStatsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sellerId: objectIdSchema.optional(),
  groupBy: Joi.string().valid("day", "week", "month").default("day"),
});

const exportOrdersQuerySchema = Joi.object({
  format: Joi.string().valid("csv", "excel", "pdf", "json").default("csv"),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled"
    )
    .optional(),
  sellerId: objectIdSchema.optional(),
});

const trackingReportQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered"
    )
    .optional(),
  carrier: Joi.string().min(2).max(100).optional(),
  sellerId: objectIdSchema.optional(),
  format: Joi.string().valid("json", "csv", "excel").default("json"),
});

// Parameter validation schemas
const orderIdParamSchema = Joi.object({
  orderId: objectIdSchema.required(),
});

const trackingNumberParamSchema = Joi.object({
  trackingNumber: Joi.string().min(5).max(50).required(),
});

const sellerIdParamSchema = Joi.object({
  sellerId: objectIdSchema.required(),
});

// Validation middleware functions
const validateCreateOrder = validateRequest({
  body: createOrderSchema,
});

const validateUpdateOrderStatus = validateRequest({
  body: updateOrderStatusSchema,
  params: orderIdParamSchema,
});

const validateCancelOrder = validateRequest({
  body: cancelOrderSchema,
  params: orderIdParamSchema,
});

const validateProcessPayment = validateRequest({
  body: processPaymentSchema,
  params: orderIdParamSchema,
});

const validateInitiateRefund = validateRequest({
  body: initiateRefundSchema,
  params: orderIdParamSchema,
});

const validateRequestReturn = validateRequest({
  body: requestReturnSchema,
  params: orderIdParamSchema,
});

const validateProcessReturn = validateRequest({
  body: processReturnSchema,
  params: orderIdParamSchema,
});

const validateUpdateTracking = validateRequest({
  body: updateTrackingSchema,
  params: orderIdParamSchema,
});

const validateAddTrackingEvent = validateRequest({
  body: addTrackingEventSchema,
  params: orderIdParamSchema,
});

const validateBulkUpdateOrders = validateRequest({
  body: bulkUpdateOrdersSchema,
});

const validateBulkUpdateTracking = validateRequest({
  body: bulkUpdateTrackingSchema,
});

const validateOrderQuery = validateRequest({
  query: orderQuerySchema,
});

const validateOrderStatsQuery = validateRequest({
  query: orderStatsQuerySchema,
});

const validateExportOrdersQuery = validateRequest({
  query: exportOrdersQuerySchema,
});

const validateTrackingReportQuery = validateRequest({
  query: trackingReportQuerySchema,
});

const validateOrderIdParam = validateRequest({
  params: orderIdParamSchema,
});

const validateTrackingNumberParam = validateRequest({
  params: trackingNumberParamSchema,
});

const validateSellerIdParam = validateRequest({
  params: sellerIdParamSchema,
});

module.exports = {
  // Schemas
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  processPaymentSchema,
  initiateRefundSchema,
  requestReturnSchema,
  processReturnSchema,
  updateTrackingSchema,
  addTrackingEventSchema,
  bulkUpdateOrdersSchema,
  bulkUpdateTrackingSchema,
  orderQuerySchema,
  orderStatsQuerySchema,
  exportOrdersQuerySchema,
  trackingReportQuerySchema,
  orderIdParamSchema,
  trackingNumberParamSchema,
  sellerIdParamSchema,

  // Validation middleware
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCancelOrder,
  validateProcessPayment,
  validateInitiateRefund,
  validateRequestReturn,
  validateProcessReturn,
  validateUpdateTracking,
  validateAddTrackingEvent,
  validateBulkUpdateOrders,
  validateBulkUpdateTracking,
  validateOrderQuery,
  validateOrderStatsQuery,
  validateExportOrdersQuery,
  validateTrackingReportQuery,
  validateOrderIdParam,
  validateTrackingNumberParam,
  validateSellerIdParam,
};
