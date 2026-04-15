const checkoutService = require("../services/checkout.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Create or resume checkout session from cart
const createSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const session = await checkoutService.createSession(userId);
  return res.created({ session }, "Checkout session created");
});

// Get current session state
const getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  const session = await checkoutService.getSession(sessionId, userId);
  return res.success({ session }, "Checkout session retrieved");
});

// Set delivery address
const setAddress = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  const addressData = req.body;

  const session = await checkoutService.setAddress(
    sessionId,
    userId,
    addressData
  );
  return res.success({ session }, "Delivery address set");
});

// Get order summary with delivery estimate
const getSummary = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  const summary = await checkoutService.getSummary(sessionId, userId);
  return res.success({ summary }, "Order summary retrieved");
});

// Apply coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  const { code } = req.body;

  if (!code) {
    throw ApiError.badRequest("Coupon code is required");
  }

  const session = await checkoutService.applyCoupon(sessionId, userId, code);
  return res.success({ session }, "Coupon applied successfully");
});

// Remove coupon
const removeCoupon = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  const session = await checkoutService.removeCoupon(sessionId, userId);
  return res.success({ session }, "Coupon removed");
});

// Initiate payment
const initiatePayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    throw ApiError.badRequest("Payment method is required");
  }

  const result = await checkoutService.initiatePayment(
    sessionId,
    userId,
    paymentMethod
  );
  return res.success(result, "Payment initiated");
});

// Confirm payment and place order
const confirmPayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;
  const paymentData = req.body;

  const result = await checkoutService.confirmAndPlaceOrder(
    sessionId,
    userId,
    paymentData
  );
  return res.created(result, "Order placed successfully");
});

// Place COD order
const placeCODOrder = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const result = await checkoutService.placeCODOrder(sessionId, userId);
  return res.created(result, "COD order placed successfully");
});

// Get order confirmation
const getConfirmation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const confirmation = await checkoutService.getConfirmation(
    sessionId,
    userId
  );
  return res.success({ confirmation }, "Order confirmation retrieved");
});

module.exports = {
  createSession,
  getSession,
  setAddress,
  getSummary,
  applyCoupon,
  removeCoupon,
  initiatePayment,
  confirmPayment,
  placeCODOrder,
  getConfirmation,
};
