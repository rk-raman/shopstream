const reviewService = require("../services/review.service");
const asyncHandler = require("../../../shared/utils/asyncHandler");

const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const review = await reviewService.addReview(req.user._id, productId, req.body);
  return res.created({ review }, "Review added successfully");
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page, limit, sortBy, sortOrder, rating } = req.query;
  const result = await reviewService.getProductReviews(productId, {
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    sortBy,
    sortOrder,
    rating,
  });
  return res.success(result, "Reviews retrieved successfully");
});

const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.updateReview(req.user._id, reviewId, req.body);
  return res.success({ review }, "Review updated successfully");
});

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  await reviewService.deleteReview(req.user._id, reviewId, req.user.role);
  return res.success(null, "Review deleted successfully");
});

const markHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const result = await reviewService.markHelpful(req.user._id, reviewId);
  return res.success(result, result.helpful ? "Marked as helpful" : "Removed helpful mark");
});

const addSellerReply = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { comment } = req.body;
  const review = await reviewService.addSellerReply(req.user._id, reviewId, comment);
  return res.success({ review }, "Reply added successfully");
});

const getUserReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.getUserReviews(
    req.user._id,
    page ? parseInt(page) : undefined,
    limit ? parseInt(limit) : undefined
  );
  return res.success(result, "User reviews retrieved");
});

module.exports = {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
  addSellerReply,
  getUserReviews,
};
