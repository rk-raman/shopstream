const { Product, Category, Brand } = require("../models");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { PRODUCT_EVENTS, validateEventPayload } = require("../../../shared/events/eventDefinitions");

/**
 * Emit a product event safely with basic payload validation
 */
const emitProductEvent = async (eventName, payload) => {
  try {
    validateEventPayload(eventName, payload);
    await eventEmitter.publish(eventName, payload);
  } catch (err) {
    // Do not block business logic on event publish errors
    console.error(`Failed to publish event ${eventName}:`, err.message);
  }
};

/**
 * Create a new product
 */
const createProduct = async (productData, createdByUserId) => {
  // Basic category validation
  const category = await Category.findById(productData.categoryId || productData.category);
  if (!category) {
    throw ApiError.badRequest("Invalid category");
  }

  const brandId = productData.brandId || productData.brand;
  if (brandId) {
    const brand = await Brand.findById(brandId);
    if (!brand) {
      throw ApiError.badRequest("Invalid brand");
    }
  }

  const payload = {
    name: productData.name,
    description: productData.description,
    basePrice: productData.price || productData.basePrice,
    category: category._id,
    brand: brandId || undefined,
    images: Array.isArray(productData.images)
      ? productData.images.map((url, index) => ({ url, isMain: index === 0 }))
      : [],
    stock: productData.stock ?? 0,
    sku: productData.sku,
    specifications: Array.isArray(productData.specifications)
      ? productData.specifications
      : [],
    tags: productData.tags || [],
    seller: createdByUserId,
    status: productData.isActive === false ? "inactive" : "active",
    isApproved: true,
  };

  const product = await Product.create(payload);

  await emitProductEvent(PRODUCT_EVENTS.PRODUCT_CREATED.name, {
    productId: product._id.toString(),
    name: product.name,
    category: product.category.toString(),
    price: Number(product.effectivePrice || product.basePrice || 0),
    createdBy: createdByUserId.toString(),
    timestamp: new Date().toISOString(),
  });

  return product;
};

/**
 * Build Mongo filters from query options
 */
const buildProductFilters = (options = {}) => {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    isActive,
    sellerId,
    status,
    tags,
  } = options;

  const filters = {};

  if (q) {
    // Prefer text index when available; fallback to regex
    filters.$or = [
      { $text: { $search: q } },
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
    ];
  }

  if (category) filters.category = category;
  if (brand) filters.brand = brand;
  if (sellerId) filters.seller = sellerId;
  if (typeof isActive === "boolean")
    filters.$and = [...(filters.$and || []), { status: isActive ? "active" : { $ne: "active" } }];
  if (status) filters.status = status;

  if (minPrice || maxPrice) {
    filters.$and = filters.$and || [];
    const priceCond = {};
    if (minPrice) priceCond.$gte = Number(minPrice);
    if (maxPrice) priceCond.$lte = Number(maxPrice);
    // Effective price approximated by discountPrice or basePrice
    filters.$and.push({ $or: [{ discountPrice: priceCond }, { basePrice: priceCond }] });
  }

  if (typeof inStock === "boolean") {
    filters.$and = filters.$and || [];
    if (inStock) {
      filters.$and.push({ $or: [{ stock: { $gt: 0 } }, { "variants.stock": { $gt: 0 } }] });
    } else {
      filters.$and.push({ stock: { $lte: 0 } });
    }
  }

  if (Array.isArray(tags) && tags.length > 0) {
    filters.tags = { $in: tags };
  }

  return filters;
};

/**
 * Get products with filtering and pagination
 */
const getProducts = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    projection = null,
    populate = [
      { path: "category", select: "name slug" },
      { path: "brand", select: "name slug" },
    ],
  } = options;

  const filters = buildProductFilters(options);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const pageNumber = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNumber - 1) * pageSize;

  const [docs, totalDocs] = await Promise.all([
    Product.find(filters, projection)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Product.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalDocs / pageSize) || 1;

  return {
    docs,
    totalDocs,
    limit: pageSize,
    page: pageNumber,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPrevPage: pageNumber > 1,
    nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
    prevPage: pageNumber > 1 ? pageNumber - 1 : null,
  };
};

/**
 * Get single product by ID
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate({ path: "category", select: "name slug" })
    .populate({ path: "brand", select: "name slug" });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
};

/**
 * Update product
 */
const updateProduct = async (productId, updateData, updatedByUserId) => {
  if (updateData.categoryId) {
    const exists = await Category.exists({ _id: updateData.categoryId });
    if (!exists) throw ApiError.badRequest("Invalid category");
    updateData.category = updateData.categoryId;
    delete updateData.categoryId;
  }
  if (updateData.brandId) {
    const exists = await Brand.exists({ _id: updateData.brandId });
    if (!exists) throw ApiError.badRequest("Invalid brand");
    updateData.brand = updateData.brandId;
    delete updateData.brandId;
  }

  const product = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound("Product not found");

  await emitProductEvent(PRODUCT_EVENTS.PRODUCT_UPDATED.name, {
    productId: product._id.toString(),
    changes: updateData,
    updatedBy: updatedByUserId.toString(),
    timestamp: new Date().toISOString(),
  });

  return product;
};

/**
 * Soft delete product
 */
const deleteProduct = async (productId, deletedByUserId, reason = "deleted") => {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");

  product.status = "inactive";
  product.isApproved = false;
  await product.save();

  await emitProductEvent(PRODUCT_EVENTS.PRODUCT_DELETED.name, {
    productId: product._id.toString(),
    deletedBy: deletedByUserId.toString(),
    reason,
    timestamp: new Date().toISOString(),
  });

  return product;
};

/**
 * Update product images by appending new ones
 */
const addProductImages = async (productId, images = []) => {
  if (!Array.isArray(images) || images.length === 0) {
    throw ApiError.badRequest("Images array is required");
  }

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");

  const mapped = images.map((url) => ({ url }));
  product.images = [...product.images, ...mapped];
  await product.save();

  return product;
};

/**
 * Bulk operations on products
 */
const bulkOperate = async ({ productIds, operation, data = {} }) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw ApiError.badRequest("productIds must be a non-empty array");
  }

  switch (operation) {
    case "activate":
      return await Product.updateMany({ _id: { $in: productIds } }, { status: "active" });
    case "deactivate":
      return await Product.updateMany({ _id: { $in: productIds } }, { status: "inactive" });
    case "delete":
      return await Product.updateMany({ _id: { $in: productIds } }, { status: "inactive", isApproved: false });
    case "updatePrice": {
      if (typeof data.price !== "number") throw ApiError.badRequest("data.price must be a number");
      return await Product.updateMany({ _id: { $in: productIds } }, { basePrice: data.price });
    }
    case "updateStock": {
      if (typeof data.stock !== "number") throw ApiError.badRequest("data.stock must be a number");
      return await Product.updateMany({ _id: { $in: productIds } }, { stock: data.stock });
    }
    default:
      throw ApiError.badRequest("Unsupported bulk operation");
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductImages,
  bulkOperate,
};

