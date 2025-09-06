const productService = require("../services/product.service");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Dedicated search controller for products
const search = asyncHandler(async (req, res) => {
  const data = await productService.searchProducts(req.query);
  return res.paginated(data, "Search results retrieved successfully");
});

module.exports = {
  search,
};
