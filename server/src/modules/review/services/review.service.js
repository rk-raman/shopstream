const mongoose = require("mongoose");
const Review = require("../models/Review.model");
const Product = require("../../product/models/Product.model");
const Order = require("../../order/models/Order.model");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { REVIEW_EVENTS } = require("../../../shared/events/eventTypes");

class ReviewService {
  /**
   * Add a review. Checks for duplicates and verified purchase.
   */
  async addReview(userId, productId, reviewData) {
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      throw ApiError.conflict("You have already reviewed this product");
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== "active") {
      throw ApiError.notFound("Product not found");
    }

    // Check verified purchase
    const hasPurchased = await Order.exists({
      customer: userId,
      "items.product": productId,
      status: "delivered",
    });

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images || [],
      isVerifiedPurchase: !!hasPurchased,
    });

    await this.recalculateProductRating(productId);

    eventEmitter.publish(REVIEW_EVENTS.REVIEW_CREATED, {
      reviewId: review._id,
      productId,
      userId,
      rating: review.rating,
      isVerifiedPurchase: review.isVerifiedPurchase,
    });

    return await Review.findById(review._id).populate(
      "user",
      "firstName lastName avatar"
    );
  }

  /**
   * Get reviews for a product with stats, pagination, sorting.
   */
  async getProductReviews(productId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      rating,
    } = options;

    const query = { product: productId, status: "active" };
    if (rating) query.rating = Number(rating);

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const [reviews, total, distribution] = await Promise.all([
      Review.find(query)
        .populate("user", "firstName lastName avatar")
        .sort(sort)
        .limit(limit)
        .skip(skip),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), status: "active" } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => { ratingDist[d._id] = d.count; });
    const totalReviews = Object.values(ratingDist).reduce((a, b) => a + b, 0);
    const avgRating = totalReviews > 0
      ? distribution.reduce((sum, d) => sum + d._id * d.count, 0) / totalReviews
      : 0;

    return {
      reviews,
      stats: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        distribution: ratingDist,
      },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async updateReview(userId, reviewId, updateData) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) throw ApiError.notFound("Review not found");

    if (updateData.rating) review.rating = updateData.rating;
    if (updateData.title !== undefined) review.title = updateData.title;
    if (updateData.comment !== undefined) review.comment = updateData.comment;
    if (updateData.images) review.images = updateData.images;
    await review.save();

    await this.recalculateProductRating(review.product);
    return await Review.findById(review._id).populate("user", "firstName lastName avatar");
  }

  async deleteReview(userId, reviewId, role = "customer") {
    const query = { _id: reviewId };
    if (role !== "admin") query.user = userId;

    const review = await Review.findOneAndDelete(query);
    if (!review) throw ApiError.notFound("Review not found");

    await this.recalculateProductRating(review.product);
    return review;
  }

  async markHelpful(userId, reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) throw ApiError.notFound("Review not found");
    if (review.user.toString() === userId.toString()) {
      throw ApiError.badRequest("Cannot mark your own review as helpful");
    }

    const alreadyMarked = review.helpfulBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyMarked) {
      await Review.findByIdAndUpdate(reviewId, {
        $pull: { helpfulBy: userId },
        $inc: { helpfulCount: -1 },
      });
      return { helpful: false };
    }

    await Review.findByIdAndUpdate(reviewId, {
      $addToSet: { helpfulBy: userId },
      $inc: { helpfulCount: 1 },
    });
    return { helpful: true };
  }

  async addSellerReply(sellerId, reviewId, comment) {
    const review = await Review.findById(reviewId).populate("product", "seller");
    if (!review) throw ApiError.notFound("Review not found");
    if (review.product.seller.toString() !== sellerId.toString()) {
      throw ApiError.forbidden("You can only reply to reviews on your products");
    }

    review.sellerReply = { comment, repliedAt: new Date() };
    await review.save();
    return review;
  }

  async recalculateProductRating(productId) {
    const [stats, distribution] = await Promise.all([
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), status: "active" } },
        { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), status: "active" } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => { dist[d._id] = d.count; });
    const { average = 0, count = 0 } = stats[0] || {};

    await Product.findByIdAndUpdate(productId, {
      "rating.average": Math.round(average * 10) / 10,
      "rating.count": count,
      "rating.distribution": dist,
    });
  }

  async getUserReviews(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .populate("product", "name images slug")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Review.countDocuments({ user: userId }),
    ]);
    return { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }
}

module.exports = new ReviewService();
