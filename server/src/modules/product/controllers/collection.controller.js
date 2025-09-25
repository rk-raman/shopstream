const collectionService = require("../services/collection.service");
const uploadService = require("../../upload/services/upload.service");
const asyncHandler = require("../../../shared/middleware/asyncHandler");

/**
 * Create a new collection
 * @route POST /api/collections
 * @access Private (Seller/Admin)
 */
const createCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.createCollection(
    req.body,
    req.user.id
  );

  return res.created(collection, "Collection created successfully");
});

/**
 * Get all collections with filters and pagination
 * @route GET /api/collections
 * @access Public
 */
const getCollections = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    sellerId,
    type,
    isVisible,
    isPublished,
    search,
    includeHidden,
    includeUnpublished,
  } = req.query;

  const filters = {
    sellerId,
    type,
    isVisible: isVisible !== undefined ? isVisible === "true" : undefined,
    isPublished: isPublished !== undefined ? isPublished === "true" : undefined,
    search,
    includeHidden: includeHidden === "true",
    includeUnpublished: includeUnpublished === "true",
  };

  const pagination = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
  };

  const result = await collectionService.getCollections(filters, pagination);

  return res.success(result, "Collections retrieved successfully");
});

/**
 * Get collection by ID
 * @route GET /api/collections/:id
 * @access Public
 */
const getCollectionById = asyncHandler(async (req, res) => {
  const { includeProducts } = req.query;
  const options = {
    includeProducts: includeProducts === "true",
    sellerId: req.user?.id,
  };

  const collection = await collectionService.getCollectionById(
    req.params.id,
    options
  );

  return res.success(collection, "Collection retrieved successfully");
});

/**
 * Get collection by handle
 * @route GET /api/collections/handle/:handle
 * @access Public
 */
const getCollectionByHandle = asyncHandler(async (req, res) => {
  const { includeProducts } = req.query;
  const options = {
    includeProducts: includeProducts === "true",
  };

  const collection = await collectionService.getCollectionByHandle(
    req.params.handle,
    options
  );

  return res.success(collection, "Collection retrieved successfully");
});

/**
 * Update collection
 * @route PUT /api/collections/:id
 * @access Private (Seller/Admin)
 */
const updateCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.updateCollection(
    req.params.id,
    req.body,
    req.user.id
  );

  return res.success(collection, "Collection updated successfully");
});

/**
 * Delete collection
 * @route DELETE /api/collections/:id
 * @access Private (Seller/Admin)
 */
const deleteCollection = asyncHandler(async (req, res) => {
  const result = await collectionService.deleteCollection(
    req.params.id,
    req.user.id
  );

  return res.success(null, result.message);
});

/**
 * Get collection products
 * @route GET /api/collections/:id/products
 * @access Public
 */
const getCollectionProducts = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, populate } = req.query;

  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    sortBy: sortBy || "manual",
    populate: populate !== "false",
  };

  const products = await collectionService.getCollectionProducts(
    req.params.id,
    options
  );

  return res.success(products, "Collection products retrieved successfully");
});

/**
 * Add products to collection
 * @route POST /api/collections/:id/products
 * @access Private (Seller/Admin)
 */
const addProductsToCollection = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const collection = await collectionService.addProductsToCollection(
    req.params.id,
    productIds,
    req.user.id
  );

  return res.success(collection, "Products added to collection successfully");
});

/**
 * Remove products from collection
 * @route DELETE /api/collections/:id/products
 * @access Private (Seller/Admin)
 */
const removeProductsFromCollection = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const collection = await collectionService.removeProductsFromCollection(
    req.params.id,
    productIds,
    req.user.id
  );

  return res.success(
    collection,
    "Products removed from collection successfully"
  );
});

/**
 * Search collections
 * @route GET /api/collections/search
 * @access Public
 */
const searchCollections = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit, sellerId } = req.query;

  const options = {
    limit: parseInt(limit) || 20,
    sellerId,
  };

  const collections = await collectionService.searchCollections(
    searchTerm,
    options
  );

  return res.success(collections, "Collections search completed successfully");
});

/**
 * Bulk update collections
 * @route PATCH /api/collections/bulk/update
 * @access Private (Seller/Admin)
 */
const bulkUpdateCollections = asyncHandler(async (req, res) => {
  const { updates } = req.body;

  const result = await collectionService.bulkUpdateCollections(
    updates,
    req.user.id
  );

  return res.success(result, "Bulk update completed");
});

/**
 * Update collection visibility
 * @route PATCH /api/collections/:id/visibility
 * @access Private (Seller/Admin)
 */
const updateCollectionVisibility = asyncHandler(async (req, res) => {
  const { isVisible } = req.body;

  const collection = await collectionService.updateCollectionVisibility(
    req.params.id,
    isVisible,
    req.user.id
  );

  return res.success(collection, "Collection visibility updated successfully");
});

/**
 * Get collections by seller
 * @route GET /api/collections/seller/:sellerId
 * @access Public
 */
const getCollectionsBySeller = asyncHandler(async (req, res) => {
  const { includeHidden, includeUnpublished } = req.query;

  const options = {
    includeHidden: includeHidden === "true",
    includeUnpublished: includeUnpublished === "true",
  };

  const collections = await collectionService.getCollectionsBySeller(
    req.params.sellerId,
    options
  );

  return res.success(collections, "Seller collections retrieved successfully");
});

/**
 * Get published collections
 * @route GET /api/collections/published
 * @access Public
 */
const getPublishedCollections = asyncHandler(async (req, res) => {
  const { limit, sortBy, sortOrder } = req.query;

  const options = {
    limit: parseInt(limit) || 20,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
  };

  const collections = await collectionService.getPublishedCollections(options);

  return res.success(
    collections,
    "Published collections retrieved successfully"
  );
});

/**
 * Get collection statistics
 * @route GET /api/collections/stats
 * @access Private (Admin) / Public for seller-specific stats
 */
const getCollectionStats = asyncHandler(async (req, res) => {
  const { sellerId } = req.query;

  // If sellerId is provided and user is not admin, ensure they can only see their own stats
  let targetSellerId = sellerId;
  if (sellerId && req.user.role !== "admin" && req.user.id !== sellerId) {
    targetSellerId = req.user.id;
  }

  const stats = await collectionService.getCollectionStats(targetSellerId);

  return res.success(stats, "Collection statistics retrieved successfully");
});

/**
 * Upload collection image
 * @route POST /api/collections/:id/image
 * @access Private (Seller/Admin)
 */
const uploadCollectionImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image file provided",
    });
  }

  // Get collection to verify ownership
  const collection = await collectionService.getCollectionById(req.params.id, {
    sellerId: req.user.id,
  });

  // Upload image
  const uploadResult = await uploadService.uploadImage(req.file, {
    folder: "collections",
    transformation: {
      width: 800,
      height: 600,
      crop: "fill",
      quality: "auto",
    },
  });

  // Update collection with new image
  const updatedCollection = await collectionService.updateCollection(
    req.params.id,
    {
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    },
    req.user.id
  );

  return res.success(
    { collection: updatedCollection, image: uploadResult },
    "Collection image uploaded successfully"
  );
});

/**
 * Remove collection image
 * @route DELETE /api/collections/:id/image
 * @access Private (Seller/Admin)
 */
const removeCollectionImage = asyncHandler(async (req, res) => {
  // Get collection to verify ownership and get current image
  const collection = await collectionService.getCollectionById(req.params.id, {
    sellerId: req.user.id,
  });

  // Delete image from cloud storage if exists
  if (collection.image?.public_id) {
    await uploadService.deleteImage(collection.image.public_id);
  }

  // Update collection to remove image
  const updatedCollection = await collectionService.updateCollection(
    req.params.id,
    {
      image: {
        public_id: null,
        url: null,
      },
    },
    req.user.id
  );

  return res.success(
    updatedCollection,
    "Collection image removed successfully"
  );
});

/**
 * Get my collections (authenticated seller)
 * @route GET /api/collections/my
 * @access Private (Seller/Admin)
 */
const getMyCollections = asyncHandler(async (req, res) => {
  const { includeHidden, includeUnpublished } = req.query;

  const options = {
    includeHidden: includeHidden === "true",
    includeUnpublished: includeUnpublished === "true",
  };

  const collections = await collectionService.getCollectionsBySeller(
    req.user.id,
    options
  );

  return res.success(collections, "Your collections retrieved successfully");
});

/**
 * Duplicate collection
 * @route POST /api/collections/:id/duplicate
 * @access Private (Seller/Admin)
 */
const duplicateCollection = asyncHandler(async (req, res) => {
  // Get original collection
  const originalCollection = await collectionService.getCollectionById(
    req.params.id,
    {
      sellerId: req.user.id,
      includeProducts: true,
    }
  );

  // Create duplicate with modified name and handle
  const duplicateData = {
    name: `${originalCollection.name} (Copy)`,
    description: originalCollection.description,
    type: originalCollection.type,
    products: originalCollection.products.map((p) => p._id),
    seo: originalCollection.seo,
    sortOrder: originalCollection.sortOrder,
    isVisible: false, // Start as hidden
    isPublished: false, // Start as unpublished
  };

  const duplicatedCollection = await collectionService.createCollection(
    duplicateData,
    req.user.id
  );

  return res.success(
    duplicatedCollection,
    "Collection duplicated successfully"
  );
});

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  getCollectionByHandle,
  updateCollection,
  deleteCollection,
  getCollectionProducts,
  addProductsToCollection,
  removeProductsFromCollection,
  searchCollections,
  bulkUpdateCollections,
  updateCollectionVisibility,
  getCollectionsBySeller,
  getPublishedCollections,
  getCollectionStats,
  uploadCollectionImage,
  removeCollectionImage,
  getMyCollections,
  duplicateCollection,
};
