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

// Create payment intent validation
const createPaymentIntentSchema = Joi.object({
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
});

// Confirm payment validation
const confirmPaymentSchema = Joi.object({
  paymentMethodId: Joi.string().optional(),
  returnUrl: Joi.string().uri().optional(),
  billingAddress: billingAddressSchema.optional(),
  savePaymentMethod: Joi.boolean().default(false),
});

// Refund payment validation
const refundPaymentSchema = Joi.object({
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
});

// Update payment status validation (Admin only)
const updatePaymentStatusSchema = Joi.object({
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
});

// Query parameters validation
const paymentQuerySchema = Joi.object({
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
});

// Save payment method validation
const savePaymentMethodSchema = Joi.object({
  paymentMethodId: Joi.string().required().messages({
    "any.required": "Payment method ID is required",
  }),
  gateway: Joi.string().valid("stripe", "paypal").default("stripe"),
  setAsDefault: Joi.boolean().default(false),
});

// Webhook validation
const webhookSchema = Joi.object({
  gateway: Joi.string().valid("stripe", "paypal").required(),
}).unknown(true); // Allow unknown properties for webhook payload

// Payment statistics query validation
const statsQuerySchema = Joi.object({
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
});

// Validation middleware functions
const validateCreatePaymentIntent = (req, res, next) => {
  const { error, value } = createPaymentIntentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  req.body = value;
  next();
};

const validateConfirmPayment = (req, res, next) => {
  const { error, value } = confirmPaymentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  req.body = value;
  next();
};

const validateRefundPayment = (req, res, next) => {
  const { error, value } = refundPaymentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  req.body = value;
  next();
};

const validateUpdatePaymentStatus = (req, res, next) => {
  const { error, value } = updatePaymentStatusSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  req.body = value;
  next();
};

const validatePaymentQuery = (req, res, next) => {
  const { error, value } = paymentQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  req.query = value;
  next();
};

const validateSavePaymentMethod = (req, res, next) => {
  const { error, value } = savePaymentMethodSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  req.body = value;
  next();
};

const validateStatsQuery = (req, res, next) => {
  const { error, value } = statsQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  req.query = value;
  next();
};

// Parameter validation
const validatePaymentId = (req, res, next) => {
  const { paymentId } = req.params;

  if (!paymentId || typeof paymentId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid payment ID",
    });
  }

  next();
};

const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  const { error } = objectIdSchema.validate(value);

  if (error) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} format`,
    });
  }

  next();
};

module.exports = {
  // Validation schemas
  createPaymentIntentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
  updatePaymentStatusSchema,
  paymentQuerySchema,
  savePaymentMethodSchema,
  statsQuerySchema,

  // Validation middleware
  validateCreatePaymentIntent,
  validateConfirmPayment,
  validateRefundPayment,
  validateUpdatePaymentStatus,
  validatePaymentQuery,
  validateSavePaymentMethod,
  validateStatsQuery,
  validatePaymentId,
  validateObjectId,
};
