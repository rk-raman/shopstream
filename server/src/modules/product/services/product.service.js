const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const Brand = require("../models/Brand.model");
const ApiError = require("../../../shared/utils/apiError");
const { eventBus } = require("../../../shared/events/eventBus");

// Create new product
const createProduct = async (productData, sellerId) => {
  try {
    // Check if SKU already exists
    if (productData.sku) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (existingProduct) {
        throw new ApiError(409, "Product with this SKU already exists");
      }
    }

    // Verify category exists
    if (productData.category) {
      const categoryExists = await Category.findById(productData.category);
      if (!categoryExists) {
        throw new ApiError(404, "Category not found");
      }
    }

    // Verify brand exists (if provided)
    if (productData.brand) {
      const brandExists = await Brand.findById(productData.brand);
      if (!brandExists) {
        throw new ApiError(404, "Brand not found");
      }
    }

    // Add seller to product data
    productData.seller = sellerId;

    // Create product
    const product = await Product.create(productData);

    // Populate references
    await product.populate([
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName email" },
    ]);

    // Publish event
    eventBus.emit("product.created", {
      productId: product._id,
      sellerId: sellerId,
      categoryId: product.category._id,
      brandId: product.brand?._id,
      name: product.name,
      price: product.basePrice,
      stock: product.totalStock,
    });

    return product;
  } catch (error) {
    throw error;
  }
};

// Get product by ID
const getProductById = async (productId, includeInactive = false) => {
  const filter = { _id: productId };
  if (!includeInactive) {
    filter.status = "active";
    filter.isApproved = true;
  }

  const product = await Product.findOne(filter).populate([
    { path: "category", select: "name slug" },
    { path: "brand", select: "name logo" },
    { path: "seller", select: "firstName lastName email avatar" },
    {
      path: "reviews",
      select: "rating comment user createdAt",
      populate: { path: "user", select: "firstName lastName avatar" },
    },
  ]);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Increment view count
  await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });

  // Publish view event
  eventBus.emit("product.viewed", {
    productId: product._id,
    categoryId: product.category._id,
    sellerId: product.seller._id,
    viewedAt: new Date(),
  });

  return product;
};

// Get product by slug
const getProductBySlug = async (slug, includeInactive = false) => {
  const filter = { slug };
  if (!includeInactive) {
    filter.status = "active";
    filter.isApproved = true;
  }

  const product = await Product.findOne(filter).populate([
    { path: "category", select: "name slug" },
    { path: "brand", select: "name logo" },
    { path: "seller", select: "firstName lastName email avatar" },
    {
      path: "reviews",
      select: "rating comment user createdAt",
      populate: { path: "user", select: "firstName lastName avatar" },
    },
  ]);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Increment view count
  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  return product;
};

// Update product
const updateProduct = async (productId, updateData, sellerId = null) => {
  // If seller is provided, ensure they own the product
  const filter = { _id: productId };
  if (sellerId) {
    filter.seller = sellerId;
  }

  // Check if SKU is being updated and if it already exists
  if (updateData.sku) {
    const existingProduct = await Product.findOne({
      sku: updateData.sku,
      _id: { $ne: productId },
    });
    if (existingProduct) {
      throw new ApiError(409, "Product with this SKU already exists");
    }
  }

  const product = await Product.findOneAndUpdate(filter, updateData, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "category", select: "name slug" },
    { path: "brand", select: "name logo" },
    { path: "seller", select: "firstName lastName email" },
  ]);

  if (!product) {
    throw new ApiError(
      404,
      "Product not found or you don't have permission to update it"
    );
  }

  // Publish event
  eventBus.emit("product.updated", {
    productId: product._id,
    sellerId: product.seller._id,
    changes: updateData,
    updatedBy: sellerId || "admin",
  });

  return product;
};

// Delete product (soft delete)
const deleteProduct = async (productId, sellerId = null) => {
  const filter = { _id: productId };
  if (sellerId) {
    filter.seller = sellerId;
  }

  const product = await Product.findOneAndUpdate(
    filter,
    { status: "discontinued", isApproved: false },
    { new: true }
  );

  if (!product) {
    throw new ApiError(
      404,
      "Product not found or you don't have permission to delete it"
    );
  }

  // Publish event
  eventBus.emit("product.deleted", {
    productId: product._id,
    sellerId: product.seller,
    deletedBy: sellerId || "admin",
  });

  return { message: "Product deleted successfully" };
};

// Get all products with filters and pagination
const getAllProducts = async (filters = {}, options = {}) => {
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
    status = "active",
    isApproved = true,
    sortBy = "createdAt",
    sortOrder = "desc",
    featured,
  } = { ...filters, ...options };

  // Build filter object
  const filter = {};

  // Status and approval filters
  if (status) filter.status = status;
  if (isApproved !== undefined) filter.isApproved = isApproved;

  // Search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Category filter
  if (category) filter.category = category;

  // Brand filter
  if (brand) filter.brand = brand;

  // Seller filter
  if (seller) filter.seller = seller;

  // Price range filter
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
  }

  // Stock filter
  if (inStock === true) {
    filter.$or = [
      { hasVariants: false, stock: { $gt: 0 } },
      { hasVariants: true, "variants.stock": { $gt: 0 } },
    ];
  }

  // Featured filter
  if (featured !== undefined) {
    filter.isFeatured = featured;
  }

  // Build sort object
  const sort = {};
  if (sortBy === "price") {
    sort.basePrice = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "rating") {
    sort["rating.average"] = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "popularity") {
    sort.viewCount = sortOrder === "asc" ? 1 : -1;
  } else {
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  }

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: [
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName" },
    ],
  };

  return await Product.paginate(filter, paginationOptions);
};

// Search products
const searchProducts = async (searchQuery, options = {}) => {
  const { page = 1, limit = 12, category, brand, minPrice, maxPrice } = options;

  const filter = {
    $text: { $search: searchQuery },
    status: "active",
    isApproved: true,
  };

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
  }

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { score: { $meta: "textScore" } },
    populate: [
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName" },
    ],
  };

  return await Product.paginate(filter, paginationOptions);
};

// Get products by seller
const getProductsBySeller = async (sellerId, options = {}) => {
  const {
    page = 1,
    limit = 12,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const filter = { seller: sellerId };
  if (status) filter.status = status;

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: [
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
    ],
  };

  return await Product.paginate(filter, paginationOptions);
};

// Get products by category
const getProductsByCategory = async (categoryId, options = {}) => {
  const {
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const filter = {
    category: categoryId,
    status: "active",
    isApproved: true,
  };

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: [
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName" },
    ],
  };

  return await Product.paginate(filter, paginationOptions);
};

// Get featured products
const getFeaturedProducts = async (limit = 8) => {
  return await Product.find({
    isFeatured: true,
    status: "active",
    isApproved: true,
  })
    .limit(limit)
    .populate([
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName" },
    ])
    .sort({ createdAt: -1 });
};

// Get related products
const getRelatedProducts = async (productId, limit = 6) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return await Product.find({
    _id: { $ne: productId },
    category: product.category,
    status: "active",
    isApproved: true,
  })
    .limit(limit)
    .populate([
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName" },
    ])
    .sort({ "rating.average": -1 });
};

// Update product stock
const updateProductStock = async (productId, stockChange, variantId = null) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.hasVariants && variantId) {
    // Update variant stock
    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new ApiError(404, "Product variant not found");
    }

    variant.stock = Math.max(0, variant.stock + stockChange);
  } else {
    // Update main product stock
    product.stock = Math.max(0, product.stock + stockChange);
  }

  await product.save();

  // Publish stock update event
  eventBus.emit("product.stock.updated", {
    productId: product._id,
    variantId,
    newStock: variantId ? product.variants.id(variantId).stock : product.stock,
    stockChange,
  });

  return product;
};

// Approve product (admin function)
const approveProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isApproved: true, status: "active" },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Publish event
  eventBus.emit("product.approved", {
    productId: product._id,
    sellerId: product.seller,
    approvedAt: new Date(),
  });

  return product;
};

// Reject product (admin function)
const rejectProduct = async (productId, reason = "") => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isApproved: false, status: "inactive" },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Publish event
  eventBus.emit("product.rejected", {
    productId: product._id,
    sellerId: product.seller,
    reason,
    rejectedAt: new Date(),
  });

  return product;
};

// Get product statistics
const getProductStats = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return {
    viewCount: product.viewCount,
    rating: product.rating,
    totalStock: product.totalStock,
    reviewCount: product.reviews.length,
    createdAt: product.createdAt,
    lastUpdated: product.updatedAt,
  };
};

// Bulk operations
const bulkUpdateProducts = async (productIds, updateData) => {
  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    updateData,
    { runValidators: true }
  );

  // Publish bulk update event
  eventBus.emit("products.bulk.updated", {
    productIds,
    updateData,
    modifiedCount: result.modifiedCount,
  });

  return result;
};

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
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,

  // Stock management
  updateProductStock,

  // Admin operations
  approveProduct,
  rejectProduct,
  bulkUpdateProducts,

  // Statistics
  getProductStats,
};
