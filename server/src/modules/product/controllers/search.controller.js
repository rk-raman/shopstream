const searchService = require("../services/search.service");
const recommendationService = require("../services/recommendation.service");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Search products
const searchProducts = asyncHandler(async (req, res) => {
  const result = await searchService.searchProducts({ ...req.query });
  return res.paginated(result, "Search results retrieved successfully");
});

// Get search suggestions
const getSuggestions = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  const suggestions = await searchService.getSearchSuggestions(q, parseInt(limit));
  return res.success({ suggestions }, "Suggestions retrieved successfully");
});

// Recommendations for user
const getRecommendationsForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 12 } = req.query;
  const products = await recommendationService.getPersonalizedRecommendations(
    userId,
    parseInt(limit)
  );
  return res.success({ products }, "Recommendations retrieved successfully");
});

// Similar products
const getSimilarProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 12 } = req.query;
  const products = await recommendationService.getSimilarProducts(
    productId,
    parseInt(limit)
  );
  return res.success({ products }, "Similar products retrieved successfully");
});

module.exports = {
  searchProducts,
  getSuggestions,
  getRecommendationsForUser,
  getSimilarProducts,
};

