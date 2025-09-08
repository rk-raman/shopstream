const cartService = require("../services/cart.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Get user's cart
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await cartService.getCart(userId);
  return res.success({ cart }, "Cart retrieved successfully");
});

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, variantId, quantity } = req.body;

  const cart = await cartService.addToCart(
    userId,
    productId,
    variantId,
    quantity
  );
  return res.success({ cart }, "Item added to cart successfully");
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await cartService.updateCartItem(userId, itemId, quantity);
  return res.success({ cart }, "Cart item updated successfully");
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await cartService.removeFromCart(userId, itemId);
  return res.success({ cart }, "Item removed from cart successfully");
});

// Clear entire cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await cartService.clearCart(userId);
  return res.success(result, "Cart cleared successfully");
});

// Get cart summary (totals, taxes, shipping)
const getCartSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const summary = await cartService.getCartSummary(userId);
  return res.success({ summary }, "Cart summary retrieved successfully");
});

// Apply coupon to cart (placeholder for future implementation)
const applyCoupon = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { couponCode } = req.body;

  // TODO: Implement coupon service integration
  throw new ApiError(501, "Coupon functionality not yet implemented");
});

// Remove coupon from cart (placeholder for future implementation)
const removeCoupon = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // TODO: Implement coupon service integration
  throw new ApiError(501, "Coupon functionality not yet implemented");
});

// Get abandoned carts (admin only)
const getAbandonedCarts = asyncHandler(async (req, res) => {
  const { daysAgo = 1 } = req.query;
  const abandonedCarts = await cartService.findAbandonedCarts(
    parseInt(daysAgo)
  );
  return res.success(
    { abandonedCarts },
    "Abandoned carts retrieved successfully"
  );
});

// Sync cart with product updates (validate all items)
const syncCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await cartService.getCart(userId);
  return res.success({ cart }, "Cart synchronized successfully");
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  applyCoupon,
  removeCoupon,
  getAbandonedCarts,
  syncCart,
};
