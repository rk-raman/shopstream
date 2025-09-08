const Joi = require("joi");
const {
  validateJoiBody,
  validateJoiQuery,
  validateJoiParams,
  sanitizeMiddleware,
} = require("../../../shared/middleware/validation.middleware");

// ==================== CART SCHEMAS ====================

const addToCartSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid product ID format",
      "any.required": "Product ID is required",
    }),
  variantId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid variant ID format",
    }),
  quantity: Joi.number().integer().min(1).max(10).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 10",
  }),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(10).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 0",
    "number.max": "Quantity cannot exceed 10",
    "any.required": "Quantity is required",
  }),
});

const cartItemParamsSchema = Joi.object({
  itemId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid item ID format",
      "any.required": "Item ID is required",
    }),
});

const applyCouponSchema = Joi.object({
  couponCode: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      "string.base": "Coupon code must be a string",
      "string.empty": "Coupon code cannot be empty",
      "string.min": "Coupon code must be at least 3 characters",
      "string.max": "Coupon code cannot exceed 20 characters",
      "string.pattern.base":
        "Coupon code can only contain uppercase letters and numbers",
      "any.required": "Coupon code is required",
    }),
});

const abandonedCartsQuerySchema = Joi.object({
  daysAgo: Joi.number().integer().min(1).max(365).default(1).messages({
    "number.base": "Days ago must be a number",
    "number.integer": "Days ago must be an integer",
    "number.min": "Days ago must be at least 1",
    "number.max": "Days ago cannot exceed 365",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

// ==================== CART VALIDATORS ====================

/**
 * Add to Cart Validation
 * Validates product ID, optional variant ID, and quantity
 */
const validateAddToCart = [
  sanitizeMiddleware,
  validateJoiBody(addToCartSchema),
];

/**
 * Update Cart Item Validation
 * Validates item ID in params and quantity in body
 */
const validateUpdateCartItem = [
  sanitizeMiddleware,
  validateJoiParams(cartItemParamsSchema),
  validateJoiBody(updateCartItemSchema),
];

/**
 * Remove Cart Item Validation
 * Validates item ID in params
 */
const validateRemoveCartItem = [
  sanitizeMiddleware,
  validateJoiParams(cartItemParamsSchema),
];

/**
 * Apply Coupon Validation
 * Validates coupon code format and requirements
 */
const validateApplyCoupon = [
  sanitizeMiddleware,
  validateJoiBody(applyCouponSchema),
];

/**
 * Get Abandoned Carts Validation
 * Validates query parameters for admin endpoint
 */
const validateGetAbandonedCarts = [
  sanitizeMiddleware,
  validateJoiQuery(abandonedCartsQuerySchema),
];

module.exports = {
  // Schemas
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
  applyCouponSchema,
  abandonedCartsQuerySchema,

  // Validators
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveCartItem,
  validateApplyCoupon,
  validateGetAbandonedCarts,
};
