const { Product } = require("../models");
const ApiError = require("../../../shared/utils/apiError");

/**
 * Get personalized recommendations for a user.
 * Basic heuristic fallback: top-rated active products.
 */
const getPersonalizedRecommendations = async (userId, limit = 12) => {
  // TODO: Incorporate user behavior, orders, views when available
  const products = await Product.find({ status: "active", isApproved: true })
    .sort({ "rating.average": -1, "rating.count": -1, createdAt: -1 })
    .limit(Math.min(50, limit))
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .lean();
  return products;
};

/**
 * Get similar products based on category/brand and price proximity
 */
const getSimilarProducts = async (productId, limit = 12) => {
  const base = await Product.findById(productId).lean();
  if (!base) throw ApiError.notFound("Product not found");

  const price = base.discountPrice || base.basePrice || 0;
  const priceRange = {
    $gte: price * 0.7,
    $lte: price * 1.3,
  };

  const products = await Product.find({
    _id: { $ne: base._id },
    status: "active",
    isApproved: true,
    $or: [
      { category: base.category },
      base.brand ? { brand: base.brand } : null,
    ].filter(Boolean),
    $orEffectivePrice: 1,
  })
    .sort({ "rating.average": -1, createdAt: -1 })
    .limit(Math.min(50, limit))
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .lean();

  // Filter by price with effective price approximation
  const filtered = products.filter((p) => {
    const eff = p.discountPrice || p.basePrice || 0;
    return eff >= priceRange.$gte && eff <= priceRange.$lte;
  });

  return filtered.slice(0, limit);
};

module.exports = {
  getPersonalizedRecommendations,
  getSimilarProducts,
};

