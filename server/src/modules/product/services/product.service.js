const { Product, Category, Brand } = require("../models");
const ApiError = require("../../../shared/utils/apiError");
const ProductEventPublisher = require("../events/publishers/ProductEventPublisher");

const productEventPublisher = new ProductEventPublisher();

// Build MongoDB query for product search/listing based on filters
const buildProductQuery = (filters = {}) => {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    isActive,
    sellerId,
  } = filters;

  const query = {};

  if (q) {
    query.$text = { $search: q };
  }

  if (category) query.category = category;
  if (brand) query.brand = brand;

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }

  if (inStock !== undefined) {
    query.$or = [
      { hasVariants: false, stock: { $gt: 0 } },
      { hasVariants: true, "variants.stock": { $gt: 0 } },
    ];
  }

  if (isActive !== undefined) {
    query.status = isActive === true || isActive === "true" ? "active" : { $ne: "active" };
  }

  if (sellerId) {
    query.seller = sellerId;
  }

  return query;
};

// Create a new product
const createProduct = async (productData, sellerId) => {
  // Validate foreign references
  const category = await Category.findById(productData.categoryId || productData.category);
  if (!category) throw new ApiError(400, "Invalid category");

  if (productData.brandId || productData.brand) {
    const brand = await Brand.findById(productData.brandId || productData.brand);
    if (!brand) throw new ApiError(400, "Invalid brand");
  }

  const product = await Product.create({
    name: productData.name,
    description: productData.description,
    basePrice: productData.price ?? productData.basePrice,
    discountPrice: productData.discountPrice,
    category: productData.categoryId || productData.category,
    brand: productData.brandId || productData.brand,
    sku: productData.sku,
    stock: productData.stock,
    images: productData.images || [],
    tags: productData.tags || [],
    specifications: Array.isArray(productData.specifications)
      ? productData.specifications
      : [],
    isApproved: false,
    seller: sellerId,
    status: "draft",
  });

  // Publish event
  await productEventPublisher.publishProductCreated(product, sellerId);

  return product;
};

// Get single product by ID
const getProductById = async (productId, options = {}) => {
  const product = await Product.findById(productId)
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .populate({ path: "reviews", select: "rating title" });
  if (!product) throw new ApiError(404, "Product not found");
  if (options.requireActive && (product.status !== "active" || !product.isApproved)) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

// Get product by slug
const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug })
    .populate("category", "name slug")
    .populate("brand", "name slug");
  if (!product) throw new ApiError(404, "Product not found");
  if (product.status !== "active" || !product.isApproved) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

// Update product
const updateProduct = async (productId, updateData) => {
  if (updateData.categoryId) updateData.category = updateData.categoryId;
  if (updateData.brandId) updateData.brand = updateData.brandId;

  const product = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  await productEventPublisher.publishProductUpdated(productId, updateData, updateData.updatedBy);
  return product;
};

// Soft delete product
const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { status: "inactive", isApproved: false },
    { new: true }
  );
  if (!product) throw new ApiError(404, "Product not found");
  await productEventPublisher.publishProductDeleted(productId, "system", "soft_delete");
  return { message: "Product deactivated successfully" };
};

// Adjust stock for product or a variant
const adjustStock = async (productId, { variantSku, delta }) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  if (variantSku) {
    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) throw new ApiError(404, "Variant not found");
    const newStock = (variant.stock || 0) + Number(delta || 0);
    if (newStock < 0) throw new ApiError(400, "Insufficient variant stock");
    variant.stock = newStock;
  } else {
    const newStock = (product.stock || 0) + Number(delta || 0);
    if (newStock < 0) throw new ApiError(400, "Insufficient stock");
    product.stock = newStock;
  }

  await product.save();
  return product;
};

// Search products with manual pagination format compatible with ResponseFormatter.paginated
const searchProducts = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    includeInactive = false,
  } = filters;

  const query = buildProductQuery(filters);
  if (!includeInactive) {
    query.status = "active";
    query.isApproved = true;
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const numericLimit = Math.max(1, Math.min(100, parseInt(limit)));
  const numericPage = Math.max(1, parseInt(page));

  const [docs, totalDocs] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort(sort)
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalDocs / numericLimit) || 1;

  return {
    docs,
    page: numericPage,
    totalPages,
    totalDocs,
    limit: numericLimit,
    hasNextPage: numericPage < totalPages,
    hasPrevPage: numericPage > 1,
    nextPage: numericPage < totalPages ? numericPage + 1 : null,
    prevPage: numericPage > 1 ? numericPage - 1 : null,
  };
};

// List products (alias for search without q)
const listProducts = async (options = {}) => {
  return await searchProducts(options);
};

// Bulk operate on products
const bulkOperateProducts = async ({ productIds, operation, data = {} }) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, "Product IDs are required");
  }

  switch (operation) {
    case "activate":
      await Product.updateMany({ _id: { $in: productIds } }, { status: "active" });
      break;
    case "deactivate":
      await Product.updateMany({ _id: { $in: productIds } }, { status: "inactive" });
      break;
    case "delete":
      await Product.updateMany({ _id: { $in: productIds } }, { status: "inactive" });
      break;
    case "updatePrice": {
      const { basePrice, discountPrice } = data;
      if (basePrice === undefined && discountPrice === undefined) {
        throw new ApiError(400, "Price data is required");
      }
      const update = {};
      if (basePrice !== undefined) update.basePrice = Number(basePrice);
      if (discountPrice !== undefined) update.discountPrice = Number(discountPrice);
      await Product.updateMany({ _id: { $in: productIds } }, update);
      break;
    }
    case "updateStock": {
      const { stock } = data;
      if (stock === undefined) throw new ApiError(400, "Stock value is required");
      await Product.updateMany({ _id: { $in: productIds } }, { stock: Number(stock) });
      break;
    }
    default:
      throw new ApiError(400, "Invalid bulk operation");
  }

  return { message: "Bulk operation completed" };
};

module.exports = {
  createProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  adjustStock,
  searchProducts,
  listProducts,
  bulkOperateProducts,
};
