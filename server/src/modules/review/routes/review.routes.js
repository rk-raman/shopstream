const express = require("express");
const router = express.Router();
const {
  authenticate,
  optionalAuth,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const reviewController = require("../controllers/review.controller");

// Public: get product reviews (no auth required)
router.get("/product/:productId", reviewController.getProductReviews);

// Authenticated: user's own reviews
router.get("/my-reviews", authenticate, reviewController.getUserReviews);

// Authenticated: add review
router.post("/product/:productId", authenticate, reviewController.addReview);

// Authenticated: update own review
router.put("/:reviewId", authenticate, reviewController.updateReview);

// Authenticated: delete own review (admin can delete any)
router.delete("/:reviewId", authenticate, reviewController.deleteReview);

// Authenticated: mark as helpful
router.post("/:reviewId/helpful", authenticate, reviewController.markHelpful);

// Seller: reply to review
router.post(
  "/:reviewId/reply",
  authenticate,
  authorize("seller", "admin"),
  reviewController.addSellerReply
);

module.exports = router;
