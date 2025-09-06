const { Product } = require("../models");
const productService = require("./product.service");

/**
 * Search products using Mongo filters. In production, integrate Elasticsearch here.
 */
const searchProducts = async (options = {}) => {
  return await productService.getProducts(options);
};

/**
 * Get name suggestions based on partial query
 */
const getSearchSuggestions = async (q, limit = 10) => {
  if (!q || typeof q !== "string") return [];
  const regex = new RegExp(q, "i");
  const results = await Product.find({ name: regex })
    .select("name slug")
    .limit(Math.min(20, Math.max(1, parseInt(limit))))
    .lean();
  // Return unique names maintaining order
  const seen = new Set();
  const suggestions = [];
  for (const r of results) {
    if (!seen.has(r.name)) {
      seen.add(r.name);
      suggestions.push({ name: r.name, slug: r.slug });
    }
  }
  return suggestions.slice(0, limit);
};

module.exports = {
  searchProducts,
  getSearchSuggestions,
};

