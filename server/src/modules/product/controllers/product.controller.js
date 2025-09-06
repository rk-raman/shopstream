const productService = require("../services/product.service");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const ApiError = require("../../../shared/utils/apiError");

// List products
const listProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    isActive,
    status,
    tags,
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    q,
    category,
    brand,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: typeof inStock === "string" ? inStock === "true" : undefined,
    isActive: typeof isActive === "string" ? isActive === "true" : undefined,
    status,
    tags,
  };

  const result = await productService.getProducts(options);
  return res.paginated(result, "Products retrieved successfully");
});

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await productService.getProductById(productId);
  return res.success({ product }, "Product retrieved successfully");
});

// Create product
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user._id);
  return res.created({ product }, "Product created successfully");
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await productService.updateProduct(productId, req.body, req.user._id);
  return res.success({ product }, "Product updated successfully");
});

// Delete product (soft delete)
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await productService.deleteProduct(productId, req.user._id);
  return res.noContent("Product deleted successfully");
});

// Upload product image
const uploadProductImage = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!req.file) throw ApiError.badRequest("Image file is required");
  const imageUrl = `/uploads/${req.file.filename}`;
  const product = await productService.addProductImages(productId, [imageUrl]);
  return res.success({ product }, "Image uploaded successfully");
});

// Bulk operations
const bulkOperation = asyncHandler(async (req, res) => {
  const result = await productService.bulkOperate(req.body);
  return res.success({ result }, "Bulk operation completed");
});

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  bulkOperation,
};

