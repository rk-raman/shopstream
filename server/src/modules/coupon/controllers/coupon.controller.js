const couponService = require("../services/coupon.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Create coupon
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body, req.user._id);
  return res.created({ coupon }, "Coupon created successfully");
});

// Get seller's coupons (paginated + filters)
const getCoupons = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const { page, limit, search, status, type, sortBy, sortOrder } = req.query;

  const result = await couponService.getCoupons(sellerId, {
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    search,
    status,
    type,
    sortBy,
    sortOrder,
  });

  return res.success(result, "Coupons retrieved successfully");
});

// Get single coupon
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(
    req.params.couponId,
    req.user._id
  );
  return res.success({ coupon }, "Coupon retrieved successfully");
});

// Update coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(
    req.params.couponId,
    req.user._id,
    req.body
  );
  return res.success({ coupon }, "Coupon updated successfully");
});

// Delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.couponId, req.user._id);
  return res.success(null, "Coupon deleted successfully");
});

// Toggle active/inactive
const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.toggleCoupon(
    req.params.couponId,
    req.user._id
  );
  return res.success({ coupon }, `Coupon ${coupon.isActive ? "activated" : "deactivated"}`);
});

// Get stats
const getCouponStats = asyncHandler(async (req, res) => {
  const stats = await couponService.getCouponStats(req.user._id);
  return res.success({ stats }, "Coupon stats retrieved");
});

// Get usage details
const getCouponUsage = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await couponService.getCouponUsage(
    req.params.couponId,
    req.user._id,
    { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
  );
  return res.success(result, "Coupon usage retrieved");
});

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  getCouponStats,
  getCouponUsage,
};
