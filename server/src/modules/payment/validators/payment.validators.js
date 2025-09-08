const Joi = require("joi");

// Common validation schemas
const objectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ObjectId format");

const amountSchema = Joi.object({
  subtotal: Joi.number().positive().required().messages({
    "number.positive": "Subtotal must be a positive number",
    "any.required": "Subtotal is required",
  }),
  tax: Joi.number().min(0).default(0),
  shipping: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  total: Joi.number().positive().optional(),
});

const billingAddressSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50),
  lastName: Joi.string().trim().min(1).max(50),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/),
  line1: Joi.string().trim().max(100),
  line2: Joi.string().trim().max(100).allow(""),
  city: Joi.string().trim().max(50),
  state: Joi.string().trim().max(50),
  postalCode: Joi.string().trim().max(20),
  country: Joi.string().length(2).uppercase(),
});

const paymentMethodSchema = Joi.object({
  type: Joi.string()
    .valid("card", "bank_transfer", "wallet", "upi", "cash")
    .required(),
  details: Joi.object({
    // Card details
    last4: Joi.string().length(4).pattern(/^\d+$/),
    brand: Joi.string().valid(
      "visa",
      "mastercard",
      "amex",
      "discover",
      "diners",
      "jcb",
      "unionpay"
    ),
    expiryMonth: Joi.number().integer().min(1).max(12),
    expiryYear: Joi.number().integer().min(new Date().getFullYear()),

    // Bank transfer details
    bankName: Joi.string().max(100),
    accountLast4: Joi.string().length(4).pattern(/^\d+$/),

    // Wallet details
    walletProvider: Joi.string().valid(
      "apple_pay",
      "google_pay",
      "samsung_pay",
      "paypal"
    ),

    // UPI details
    upiId: Joi.string().pattern(/^[\w\.\-_]{2,256}@[a-zA-Z]{2,64}$/),
  }).optional(),
});

// Payment validation schemas
const paymentValidators = {
  // Create payment intent validation
  createPaymentIntent: {
    body: Joi.object({
      orderId: objectIdSchema.required().messages({
        "any.required": "Order ID is required",
      }),
      amount: amountSchema.required(),
      currency: Joi.string().length(3).uppercase().default("USD").messages({
        "string.length": "Currency must be a 3-letter code",
      }),
      gateway: Joi.string()
        .valid("stripe", "paypal", "razorpay", "square", "manual")
        .default("stripe"),
      paymentMethod: paymentMethodSchema.optional(),
      billingAddress: billingAddressSchema.optional(),
      metadata: Joi.object().optional(),
    }),
  },

  // Confirm payment validation
  confirmPayment: {
    body: Joi.object({
      paymentMethodId: Joi.string().optional(),
      returnUrl: Joi.string().uri().optional(),
      billingAddress: billingAddressSchema.optional(),
      savePaymentMethod: Joi.boolean().default(false),
    }),
  },

  // Refund payment validation
  refundPayment: {
    body: Joi.object({
      amount: Joi.number().positive().optional().messages({
        "number.positive": "Refund amount must be positive",
      }),
      reason: Joi.string()
        .valid(
          "duplicate",
          "fraudulent",
          "requested_by_customer",
          "expired_uncaptured_charge"
        )
        .default("requested_by_customer"),
      metadata: Joi.object().optional(),
    }),
  },

  // Update payment status validation (Admin only)
  updatePaymentStatus: {
    body: Joi.object({
      status: Joi.string()
        .valid(
          "pending",
          "processing",
          "succeeded",
          "failed",
          "canceled",
          "refunded",
          "partially_refunded",
          "disputed",
          "chargeback"
        )
        .required(),
      reason: Joi.string().max(500).optional(),
    }),
  },

  // Query parameters validation
  paymentQuery: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.string()
        .valid(
          "pending",
          "processing",
          "succeeded",
          "failed",
          "canceled",
          "refunded",
          "partially_refunded",
          "disputed",
          "chargeback"
        )
        .optional(),
      gateway: Joi.string()
        .valid("stripe", "paypal", "razorpay", "square", "manual")
        .optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
      userId: objectIdSchema.optional(),
    }),
  },

  // Save payment method validation
  savePaymentMethod: {
    body: Joi.object({
      paymentMethodId: Joi.string().required().messages({
        "any.required": "Payment method ID is required",
      }),
      gateway: Joi.string().valid("stripe", "paypal").default("stripe"),
      setAsDefault: Joi.boolean().default(false),
    }),
  },

  // Payment statistics query validation
  statsQuery: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
      gateway: Joi.string()
        .valid("stripe", "paypal", "razorpay", "square", "manual")
        .optional(),
      status: Joi.string()
        .valid(
          "pending",
          "processing",
          "succeeded",
          "failed",
          "canceled",
          "refunded",
          "partially_refunded",
          "disputed",
          "chargeback"
        )
        .optional(),
    }),
  },

  // Parameter validation
  paymentId: {
    params: Joi.object({
      paymentId: Joi.string().required().messages({
        "any.required": "Payment ID is required",
      }),
    }),
  },

  // Generic ObjectId parameter validation
  objectId: (paramName) => ({
    params: Joi.object({
      [paramName]: objectIdSchema.required().messages({
        "any.required": `${paramName} is required`,
      }),
    }),
  }),

  // Webhook validation
  webhook: {
    body: Joi.object().unknown(true), // Allow unknown properties for webhook payload
    params: Joi.object({
      gateway: Joi.string().valid("stripe", "paypal").required(),
    }),
  },
};

module.exports = {
  paymentValidators,
  // Export individual schemas for direct use if needed
  objectIdSchema,
  amountSchema,
  billingAddressSchema,
  paymentMethodSchema,
};
