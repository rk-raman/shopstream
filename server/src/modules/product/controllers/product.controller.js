const productService = require("../services/product.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const { Product } = require("../models");

// Create a new product (seller or admin)
const createProduct = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const product = await productService.createProduct(req.body, sellerId);
  return res.created({ product }, "Product created successfully");
});

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await productService.getProductById(productId);
  return res.success({ product }, "Product retrieved successfully");
});

// Get product by slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await productService.getProductBySlug(slug);
  return res.success({ product }, "Product retrieved successfully");
});

// Update product (owner or admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const existing = await Product.findById(productId);
  if (!existing) throw new ApiError(404, "Product not found");

  if (
    req.user.role !== "admin" &&
    existing.seller.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You do not have permission to update this product");
  }

  const product = await productService.updateProduct(productId, req.body);
  return res.success({ product }, "Product updated successfully");
});

// Delete (soft) product (owner or admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const existing = await Product.findById(productId);
  if (!existing) throw new ApiError(404, "Product not found");

  if (
    req.user.role !== "admin" &&
    existing.seller.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You do not have permission to delete this product");
  }

  const result = await productService.deleteProduct(productId);
  return res.success(result, "Product deleted successfully");
});

// List products (public)
const listProducts = asyncHandler(async (req, res) => {
  const data = await productService.listProducts(req.query);
  return res.paginated(data, "Products retrieved successfully");
});

// Search products (public)
const searchProducts = asyncHandler(async (req, res) => {
  const data = await productService.searchProducts(req.query);
  return res.paginated(data, "Search results retrieved successfully");
});

// Upload single product image (owner or admin)
const uploadImage = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const existing = await Product.findById(productId);
  if (!existing) throw new ApiError(404, "Product not found");

  if (
    req.user.role !== "admin" &&
    existing.seller.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You do not have permission to update this product");
  }

  if (!req.file) throw new ApiError(400, "Please upload an image");

  existing.images = existing.images || [];
  existing.images.push({
    public_id: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    isMain: existing.images.length === 0,
  });
  await existing.save();

  return res.success({ product: existing }, "Image uploaded successfully");
});

// Bulk operations (admin only)
const bulkOperate = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admins can perform bulk operations");
  }
  const result = await productService.bulkOperateProducts(req.body);
  return res.success(result, "Bulk operation executed successfully");
});

module.exports = {
  createProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  listProducts,
  searchProducts,
  uploadImage,
  bulkOperate,
};
