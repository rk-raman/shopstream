const productService = require("../services/product.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Create new product
const createProduct = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const productData = req.body;

  const product = await productService.createProduct(productData, sellerId);
  return res.created({ product }, "Product created successfully");
});

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { includeInactive = false } = req.query;

  const product = await productService.getProductById(
    productId,
    includeInactive === "true"
  );
  return res.success({ product }, "Product retrieved successfully");
});

// Get product by slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { includeInactive = false } = req.query;

  const product = await productService.getProductBySlug(
    slug,
    includeInactive === "true"
  );
  return res.success({ product }, "Product retrieved successfully");
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const updateData = req.body;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  const product = await productService.updateProduct(
    productId,
    updateData,
    sellerId
  );
  return res.success({ product }, "Product updated successfully");
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  await productService.deleteProduct(productId, sellerId);
  return res.success(null, "Product deleted successfully");
});

// Get all products with filters
const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    brand,
    seller,
    minPrice,
    maxPrice,
    inStock,
    status,
    isApproved,
    sortBy = "createdAt",
    sortOrder = "desc",
    featured,
  } = req.query;

  const filters = {
    search,
    category,
    brand,
    seller,
    minPrice,
    maxPrice,
    inStock: inStock === "true",
    status,
    isApproved: isApproved !== undefined ? isApproved === "true" : undefined,
    featured: featured !== undefined ? featured === "true" : undefined,
  };

  const options = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  const products = await productService.getAllProducts(filters, options);
  return res.paginated(products, "Products retrieved successfully");
});

// Search products
const searchProducts = asyncHandler(async (req, res) => {
  const {
    q,
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
  } = req.query;

  if (!q) {
    return res.badRequest("Search query is required");
  }

  const options = {
    page,
    limit,
    category,
    brand,
    minPrice,
    maxPrice,
  };

  const products = await productService.searchProducts(q, options);
  return res.paginated(products, "Search results retrieved successfully");
});

// Get products by seller
const getProductsBySeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const {
    page = 1,
    limit = 12,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page,
    limit,
    status,
    sortBy,
    sortOrder,
  };

  const products = await productService.getProductsBySeller(sellerId, options);
  return res.paginated(products, "Seller products retrieved successfully");
});

// Get my products (for authenticated sellers)
const getMyProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const {
    page = 1,
    limit = 12,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page,
    limit,
    status,
    sortBy,
    sortOrder,
  };

  const products = await productService.getProductsBySeller(sellerId, options);
  return res.paginated(products, "Your products retrieved successfully");
});

// Get products by category
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const {
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  const products = await productService.getProductsByCategory(
    categoryId,
    options
  );
  return res.paginated(products, "Category products retrieved successfully");
});

// Get featured products
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await productService.getFeaturedProducts(parseInt(limit));
  return res.success(
    { products, count: products.length },
    "Featured products retrieved successfully"
  );
});

// Get related products
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 6 } = req.query;

  const products = await productService.getRelatedProducts(
    productId,
    parseInt(limit)
  );
  return res.success(
    { products, count: products.length },
    "Related products retrieved successfully"
  );
});

// Upload product images
const uploadProductImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please upload at least one image");
  }

  // Process uploaded images
  const images = req.files.map((file) => ({
    public_id: file.filename,
    url: `/uploads/products/${file.filename}`,
    isMain: false,
  }));

  // If no main image exists, make the first one main
  if (images.length > 0) {
    images[0].isMain = true;
  }

  const updateData = {
    $push: { images: { $each: images } },
  };

  const product = await productService.updateProduct(
    productId,
    updateData,
    sellerId
  );

  return res.success({ product }, "Product images uploaded successfully");
});

// Update product stock
const updateProductStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { stockChange, variantId } = req.body;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  if (!stockChange) {
    throw new ApiError(400, "Stock change amount is required");
  }

  // Verify ownership if not admin
  if (sellerId) {
    await productService.getProductById(productId, true); // This will check ownership
  }

  const product = await productService.updateProductStock(
    productId,
    stockChange,
    variantId
  );

  return res.success({ product }, "Product stock updated successfully");
});

// Get product statistics
const getProductStats = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  // Verify ownership if not admin
  if (sellerId) {
    const product = await productService.getProductById(productId, true);
    if (product.seller._id.toString() !== sellerId.toString()) {
      throw new ApiError(403, "You don't have permission to view these stats");
    }
  }

  const stats = await productService.getProductStats(productId);
  return res.success({ stats }, "Product statistics retrieved successfully");
});

// Admin only: Approve product
const approveProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await productService.approveProduct(productId);
  return res.success({ product }, "Product approved successfully");
});

// Admin only: Reject product
const rejectProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { reason } = req.body;

  const product = await productService.rejectProduct(productId, reason);
  return res.success({ product }, "Product rejected successfully");
});

// Admin only: Bulk update products
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, updateData } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, "Product IDs array is required");
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Update data is required");
  }

  const result = await productService.bulkUpdateProducts(
    productIds,
    updateData
  );

  return res.success(
    { modifiedCount: result.modifiedCount },
    `${result.modifiedCount} products updated successfully`
  );
});

// Admin only: Get pending products for approval
const getPendingProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filters = {
    status: "draft",
    isApproved: false,
  };

  const options = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  const products = await productService.getAllProducts(filters, options);
  return res.paginated(products, "Pending products retrieved successfully");
});

// Toggle product featured status
const toggleFeaturedStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { isFeatured } = req.body;

  if (typeof isFeatured !== "boolean") {
    throw new ApiError(400, "Featured status must be a boolean value");
  }

  const product = await productService.updateProduct(
    productId,
    { isFeatured },
    null // Admin only
  );

  return res.success(
    { product },
    `Product ${isFeatured ? "featured" : "unfeatured"} successfully`
  );
});

// Get product variants
const getProductVariants = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await productService.getProductById(productId, true);

  if (!product.hasVariants) {
    return res.success({ variants: [] }, "Product has no variants");
  }

  return res.success(
    { variants: product.variants },
    "Product variants retrieved successfully"
  );
});

// Add product variant
const addProductVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const variantData = req.body;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  // Get current product
  const product = await productService.getProductById(productId, true);

  // Verify ownership if not admin
  if (sellerId && product.seller._id.toString() !== sellerId.toString()) {
    throw new ApiError(403, "You don't have permission to modify this product");
  }

  // Add variant to product
  const updateData = {
    hasVariants: true,
    $push: { variants: variantData },
  };

  const updatedProduct = await productService.updateProduct(
    productId,
    updateData,
    sellerId
  );

  return res.success(
    { product: updatedProduct },
    "Product variant added successfully"
  );
});

// Update product variant
const updateProductVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const updateData = req.body;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  // Get current product
  const product = await productService.getProductById(productId, true);

  // Verify ownership if not admin
  if (sellerId && product.seller._id.toString() !== sellerId.toString()) {
    throw new ApiError(403, "You don't have permission to modify this product");
  }

  // Find and update the variant
  const variant = product.variants.id(variantId);
  if (!variant) {
    throw new ApiError(404, "Product variant not found");
  }

  Object.assign(variant, updateData);
  await product.save();

  return res.success({ product }, "Product variant updated successfully");
});

// Delete product variant
const deleteProductVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const sellerId = req.user.role === "admin" ? null : req.user._id;

  // Get current product
  const product = await productService.getProductById(productId, true);

  // Verify ownership if not admin
  if (sellerId && product.seller._id.toString() !== sellerId.toString()) {
    throw new ApiError(403, "You don't have permission to modify this product");
  }

  // Remove the variant
  product.variants.pull(variantId);

  // If no variants left, set hasVariants to false
  if (product.variants.length === 0) {
    product.hasVariants = false;
  }

  await product.save();

  return res.success({ product }, "Product variant deleted successfully");
});

// Add product review
const addProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const review = await productService.addProductReview(productId, {
    user: userId,
    rating,
    comment,
  });

  return res.success({ review }, "Product review added successfully");
});

module.exports = {
  // Basic product operations
  createProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getAllProducts,
  searchProducts,

  // Product queries
  getProductsBySeller,
  getMyProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,

  // Product management
  uploadProductImages,
  updateProductStock,
  getProductStats,

  // Variant management
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,

  // Review management
  addProductReview,

  // Admin operations
  approveProduct,
  rejectProduct,
  bulkUpdateProducts,
  getPendingProducts,
  toggleFeaturedStatus,
};
