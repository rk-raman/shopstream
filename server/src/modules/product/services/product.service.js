const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const Brand = require("../models/Brand.model");
const ApiError = require("../../../shared/utils/apiError");
const ProductEventPublisher = require("../events/publishers/ProductEventPublisher");
// Instantiate publisher (class with instance methods)
const productEventPublisher = new ProductEventPublisher();

// Helper: derive a public_id from a URL
function derivePublicIdFromUrl(url, prefix = "prod") {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || `file-${Date.now()}`;
    const base = last.replace(/\.[a-zA-Z0-9]+$/, "");
    return `${prefix}_${base}_${Date.now()}`;
  } catch {
    // Fallback if URL parsing fails
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
  }
}

// Helper: normalize images array to model's imageSchema
function normalizeImages(images) {
  if (!Array.isArray(images)) return images;
  const mapped = images
    .slice(0, 20)
    .map((img) => {
      if (typeof img === "string") {
        return {
          public_id: derivePublicIdFromUrl(img, "img"),
          url: img,
          isMain: false,
        };
      }
      // Ensure required fields exist
      return {
        public_id: img.public_id || derivePublicIdFromUrl(img.url || "", "img"),
        url: img.url,
        isMain: Boolean(img.isMain),
        alt: img.alt,
        size: img.size,
        uploadedAt: img.uploadedAt,
      };
    })
    .filter((i) => !!i && !!i.url);

  // Ensure exactly one main image if any exist
  if (mapped.length > 0) {
    const hasMain = mapped.some((i) => i.isMain);
    if (!hasMain) mapped[0].isMain = true;
    else {
      // If multiple marked as main, keep the first as main
      let seen = false;
      mapped.forEach((i) => {
        if (i.isMain && !seen) {
          seen = true;
        } else if (i.isMain && seen) {
          i.isMain = false;
        }
      });
    }
  }

  return mapped;
}

// Helper: normalize videos array to model's videoSchema
function normalizeVideos(videos) {
  if (!Array.isArray(videos)) return videos;
  return videos
    .slice(0, 5)
    .map((v) => {
      if (typeof v === "string") {
        return {
          public_id: derivePublicIdFromUrl(v, "vid"),
          url: v,
        };
      }
      return {
        public_id: v.public_id || derivePublicIdFromUrl(v.url || "", "vid"),
        url: v.url,
        thumbnail: v.thumbnail,
        duration: v.duration,
        size: v.size,
        uploadedAt: v.uploadedAt,
      };
    })
    .filter((i) => !!i && !!i.url);
}

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

    // Normalize media fields (accept strings or objects)
    if (productData.images) {
      productData.images = normalizeImages(productData.images);
    }
    if (productData.videos) {
      productData.videos = normalizeVideos(productData.videos);
    }

    // Normalize variants: ensure each variant has a unique SKU

    if (Array.isArray(productData.variants)) {
      productData.variants = productData.variants.map((v, idx) => {
        const variant = { ...v };
        // Coerce numeric fields
        if (variant.price != null) variant.price = Number(variant.price);
        if (variant.stock != null) variant.stock = Number(variant.stock);

        // Ensure SKU exists and is unique-ish
        if (!variant.sku) {
          variant.sku = `VRT-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)
            .toUpperCase()}-${idx}`;
        }
        return variant;
      });
    }

    // Create product
    const product = await Product.create(productData);

    // Populate references
    await product.populate([
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName email" },
    ]);

    // Publish event using productEventPublisher instance
    await productEventPublisher.publishProductCreated({
      productId: product._id,
      sellerId: sellerId,
      categoryId: product.category._id,
      brandId: product.brand?._id,
      name: product.name,
      price: product.basePrice,
      stock: product.totalStock,
      metadata: {
        hasVariants: product.hasVariants,
        isDigital: product.isDigital,
        status: product.status,
      },
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
    // { path: "category", select: "name slug" },
    { path: "brand", select: "name logo" },
    { path: "seller", select: "firstName lastName email avatar" },
    // {
    //   path: "reviews",
    //   select: "rating comment user createdAt",
    //   populate: { path: "user", select: "firstName lastName avatar" },
    // },
  ]);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Increment view count
  await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });

  // Publish view event using productEventPublisher instance
  await productEventPublisher.publishProductViewed({
    productId: product._id,
    categoryId: product.category._id,
    sellerId: product.seller._id,
    viewedAt: new Date(),
    metadata: {
      productName: product.name,
      price: product.effectivePrice,
    },
  });

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

  // Only normalize if this is a direct document replacement/update (no operators)
  const hasOperator = Object.keys(updateData || {}).some((k) =>
    k.startsWith("$")
  );
  if (!hasOperator) {
    if (Array.isArray(updateData.images)) {
      updateData.images = normalizeImages(updateData.images);
    }
    if (Array.isArray(updateData.videos)) {
      updateData.videos = normalizeVideos(updateData.videos);
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

  // Publish event using productEventPublisher instance
  await productEventPublisher.publishProductUpdated({
    productId: product._id,
    sellerId: product.seller._id,
    changes: updateData,
    updatedBy: sellerId || "admin",
    metadata: {
      productName: product.name,
      previousData: updateData,
    },
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

  // Publish view event using productEventPublisher instance
  await productEventPublisher.publishProductViewed({
    productId: product._id,
    categoryId: product.category._id,
    sellerId: product.seller._id,
    viewedAt: new Date(),
    metadata: {
      productName: product.name,
      price: product.effectivePrice,
    },
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

  // Publish event using productEventPublisher instance
  await productEventPublisher.publishProductDeleted({
    productId: product._id,
    sellerId: product.seller,
    deletedBy: sellerId || "admin",
    metadata: {
      productName: product.name,
      category: product.category,
    },
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

  let oldStock, newStock;

  if (product.hasVariants && variantId) {
    // Update variant stock
    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new ApiError(404, "Product variant not found");
    }

    oldStock = variant.stock;
    variant.stock = Math.max(0, variant.stock + stockChange);
    newStock = variant.stock;
  } else {
    // Update main product stock
    oldStock = product.stock;
    product.stock = Math.max(0, product.stock + stockChange);
    newStock = product.stock;
  }

  await product.save();

  // Publish stock update event using productEventPublisher instance
  // Note: underlying publisher exposes `publishStockUpdated`
  await productEventPublisher.publishStockUpdated({
    productId: product._id,
    variantId,
    oldStock,
    newStock,
    stockChange,
    metadata: {
      productName: product.name,
      sellerId: product.seller,
    },
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

  // Publish event using productEventPublisher instance
  await productEventPublisher.publishProductApproved({
    productId: product._id,
    sellerId: product.seller,
    approvedAt: new Date(),
    metadata: {
      productName: product.name,
      category: product.category,
    },
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

  // Publish event using productEventPublisher instance
  await productEventPublisher.publishProductRejected({
    productId: product._id,
    sellerId: product.seller,
    reason,
    rejectedAt: new Date(),
    metadata: {
      productName: product.name,
      category: product.category,
    },
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

  // Publish bulk update event using productEventPublisher instance
  // Note: underlying publisher exposes `publishBulkUpdated`
  await productEventPublisher.publishBulkUpdated({
    productIds,
    updateData,
    modifiedCount: result.modifiedCount,
    metadata: {
      operation: "bulk_update",
      timestamp: new Date(),
    },
  });

  return result;
};

// Add product review
const addProductReview = async (productId, reviewData) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user already reviewed this product
  const existingReview = product.reviews.find(
    (review) => review.user.toString() === reviewData.user.toString()
  );

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  // Add review to product
  product.reviews.push(reviewData);
  await product.save();

  // Populate the new review
  await product.populate({
    path: "reviews.user",
    select: "firstName lastName avatar",
  });

  const newReview = product.reviews[product.reviews.length - 1];

  // Publish review event using productEventPublisher instance
  // Note: underlying publisher exposes `publishReviewAdded`
  await productEventPublisher.publishReviewAdded({
    productId: product._id,
    reviewId: newReview._id,
    userId: reviewData.user,
    rating: reviewData.rating,
    sellerId: product.seller,
    metadata: {
      productName: product.name,
      reviewComment: reviewData.comment,
    },
  });

  return newReview;
};

//Bulk Create/Update Products

const bulkCreateUpdateProducts = async (operations, options = {}, sellerId) => {
  const {
    stopOnError = false,
    validateOnly = false,
    skipDuplicates = true,
    updateExisting = false,
  } = options;

  const results = {
    success: [],
    errors: [],
    summary: {
      total: operations.length,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    },
  };

  // PHASE 1: VALIDATION
  const validationErrors = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const errors = await validateOperation(op, i, sellerId);
    if (errors.length > 0) {
      validationErrors.push(...errors);
    }
  }

  if (validationErrors.length > 0 && stopOnError) {
    throw new ApiError(400, "Validation failed", validationErrors);
  }

  if (validateOnly) {
    return {
      valid: validationErrors.length === 0,
      errors: validationErrors,
      summary: {
        total: operations.length,
        validOperations: operations.length - validationErrors.length,
        invalidOperations: validationErrors.length,
      },
    };
  }

  // PHASE 2: PROCESSING
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];

    try {
      if (op.operation === "create") {
        const result = await processCreateOperation(
          op,
          sellerId,
          skipDuplicates
        );

        if (result.skipped) {
          results.summary.skipped++;
          results.success.push({
            index: i,
            operation: "create",
            status: "skipped",
            reason: result.reason,
            data: result.data,
          });
        } else {
          results.summary.created++;
          results.success.push({
            index: i,
            operation: "create",
            status: "created",
            productId: result.product._id,
            sku: result.product.sku,
            data: result.product,
          });
        }
      } else if (op.operation === "update") {
        const result = await processUpdateOperation(
          op,
          sellerId,
          updateExisting
        );

        if (result.skipped) {
          results.summary.skipped++;
          results.success.push({
            index: i,
            operation: "update",
            status: "skipped",
            reason: result.reason,
          });
        } else {
          results.summary.updated++;
          results.success.push({
            index: i,
            operation: "update",
            status: "updated",
            productId: result.product._id,
            sku: result.product.sku,
            data: result.product,
          });
        }
      }
    } catch (error) {
      results.summary.failed++;
      results.errors.push({
        index: i,
        operation: op.operation,
        productId: op.productId,
        sku: op.sku || op.data?.sku,
        error: error.message,
        details: error.details || null,
      });

      if (stopOnError) {
        throw new ApiError(
          400,
          `Bulk operation failed at index ${i}: ${error.message}`,
          results
        );
      }
    }
  }

  // Publish event
  await productEventPublisher.publishBulkUpdated({
    sellerId,
    operationType: "bulk_create_update",
    summary: results.summary,
    timestamp: new Date(),
  });

  return results;
};

/**
 * Validate Operation
 */
async function validateOperation(operation, index, sellerId) {
  const errors = [];

  if (operation.operation === "create") {
    if (!operation.data.name) {
      errors.push({
        index,
        field: "name",
        message: "Product name is required for create operation",
      });
    }
    if (!operation.data.basePrice) {
      errors.push({
        index,
        field: "basePrice",
        message: "Base price is required for create operation",
      });
    }
    if (!operation.data.category) {
      errors.push({
        index,
        field: "category",
        message: "Category is required for create operation",
      });
    }
  } else if (operation.operation === "update") {
    if (!operation.productId && !operation.sku) {
      errors.push({
        index,
        message: "Either productId or SKU is required for update operation",
      });
    }
  }

  if (operation.data.category) {
    const categoryExists = await Category.findById(operation.data.category);
    if (!categoryExists) {
      errors.push({
        index,
        field: "category",
        message: `Category ${operation.data.category} not found`,
      });
    }
  }

  if (operation.data.brand) {
    const brandExists = await Brand.findById(operation.data.brand);
    if (!brandExists) {
      errors.push({
        index,
        field: "brand",
        message: `Brand ${operation.data.brand} not found`,
      });
    }
  }

  if (operation.operation === "create" && operation.data.sku) {
    const existingProduct = await Product.findOne({ sku: operation.data.sku });
    if (existingProduct) {
      errors.push({
        index,
        field: "sku",
        message: `Product with SKU ${operation.data.sku} already exists`,
      });
    }
  }

  if (operation.data.variants && operation.data.variants.length > 0) {
    const skus = operation.data.variants.map((v) => v.sku);
    const uniqueSkus = new Set(skus);
    if (skus.length !== uniqueSkus.size) {
      errors.push({
        index,
        field: "variants",
        message: "Duplicate variant SKUs found in operation",
      });
    }
  }

  return errors;
}

/**
 * Process Create Operation
 */
async function processCreateOperation(operation, sellerId, skipDuplicates) {
  const productData = { ...operation.data, seller: sellerId };

  if (skipDuplicates && productData.sku) {
    const existing = await Product.findOne({ sku: productData.sku });
    if (existing) {
      return {
        skipped: true,
        reason: "Product with this SKU already exists",
        data: { sku: productData.sku, existingProductId: existing._id },
      };
    }
  }

  if (productData.images) {
    productData.images = normalizeImages(productData.images);
  }
  if (productData.videos) {
    productData.videos = normalizeVideos(productData.videos);
  }

  if (Array.isArray(productData.variants)) {
    productData.variants = productData.variants.map((v, idx) => {
      const variant = { ...v };
      if (variant.price != null) variant.price = Number(variant.price);
      if (variant.stock != null) variant.stock = Number(variant.stock);
      if (!variant.sku) {
        variant.sku = `VRT-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}-${idx}`;
      }
      return variant;
    });
  }

  const product = await Product.create(productData);

  await product.populate([
    { path: "category", select: "name slug" },
    { path: "brand", select: "name logo" },
    { path: "seller", select: "firstName lastName email" },
  ]);

  return { product };
}

/**
 * Process Update Operation
 */
async function processUpdateOperation(operation, sellerId, updateExisting) {
  const filter = {};

  if (operation.productId) {
    filter._id = operation.productId;
  } else if (operation.sku) {
    filter.sku = operation.sku;
  } else {
    throw new ApiError(400, "Either productId or SKU is required for update");
  }

  if (sellerId) {
    filter.seller = sellerId;
  }

  const existingProduct = await Product.findOne(filter);
  if (!existingProduct) {
    if (updateExisting) {
      return await processCreateOperation(
        { data: operation.data },
        sellerId,
        false
      );
    }
    throw new ApiError(404, "Product not found");
  }

  const updateData = { ...operation.data };

  if (updateData.images) {
    updateData.images = normalizeImages(updateData.images);
  }
  if (updateData.videos) {
    updateData.videos = normalizeVideos(updateData.videos);
  }

  Object.assign(existingProduct, updateData);
  await existingProduct.save();

  await existingProduct.populate([
    { path: "category", select: "name slug" },
    { path: "brand", select: "name logo" },
    { path: "seller", select: "firstName lastName email" },
  ]);

  return { product: existingProduct };
}

// Helper functions
function derivePublicIdFromUrl(url, prefix = "prod") {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || `file-${Date.now()}`;
    const base = last.replace(/\.[a-zA-Z0-9]+$/, "");
    return `${prefix}_${base}_${Date.now()}`;
  } catch {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
  }
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return images;
  const mapped = images
    .slice(0, 20)
    .map((img) => {
      if (typeof img === "string") {
        return {
          public_id: derivePublicIdFromUrl(img, "img"),
          url: img,
          isMain: false,
        };
      }
      return {
        public_id: img.public_id || derivePublicIdFromUrl(img.url || "", "img"),
        url: img.url,
        isMain: Boolean(img.isMain),
        alt: img.alt,
        size: img.size,
        uploadedAt: img.uploadedAt,
      };
    })
    .filter((i) => !!i && !!i.url);

  if (mapped.length > 0) {
    const hasMain = mapped.some((i) => i.isMain);
    if (!hasMain) mapped[0].isMain = true;
    else {
      let seen = false;
      mapped.forEach((i) => {
        if (i.isMain && !seen) {
          seen = true;
        } else if (i.isMain && seen) {
          i.isMain = false;
        }
      });
    }
  }

  return mapped;
}

function normalizeVideos(videos) {
  if (!Array.isArray(videos)) return videos;
  return videos
    .slice(0, 5)
    .map((v) => {
      if (typeof v === "string") {
        return {
          public_id: derivePublicIdFromUrl(v, "vid"),
          url: v,
        };
      }
      return {
        public_id: v.public_id || derivePublicIdFromUrl(v.url || "", "vid"),
        url: v.url,
        thumbnail: v.thumbnail,
        duration: v.duration,
        size: v.size,
        uploadedAt: v.uploadedAt,
      };
    })
    .filter((i) => !!i && !!i.url);
}

module.exports = {
  // Basic product operations
  createProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getAllProducts,
  searchProducts,
  bulkCreateUpdateProducts,

  // Product queries
  getProductsBySeller,
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,

  // Stock management
  updateProductStock,

  // Review management
  addProductReview,

  // Admin operations
  approveProduct,
  rejectProduct,
  bulkUpdateProducts,

  // Statistics
  getProductStats,
};
