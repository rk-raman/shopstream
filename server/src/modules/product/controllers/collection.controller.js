const collectionService = require("../services/collection.service");
const uploadService = require("../../upload/services/upload.service");
const asyncHandler = require("../../../shared/middleware/asyncHandler");
const { successResponse } = require("../../../shared/utils/responseUtils");

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

  successResponse(res, {
    message: "Collection created successfully",
    data: collection,
    statusCode: 201,
  });
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

  successResponse(res, {
    message: "Collections retrieved successfully",
    data: result,
  });
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

  successResponse(res, {
    message: "Collection retrieved successfully",
    data: collection,
  });
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

  successResponse(res, {
    message: "Collection retrieved successfully",
    data: collection,
  });
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

  successResponse(res, {
    message: "Collection updated successfully",
    data: collection,
  });
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

  successResponse(res, {
    message: result.message,
  });
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

  successResponse(res, {
    message: "Collection products retrieved successfully",
    data: products,
  });
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

  successResponse(res, {
    message: "Products added to collection successfully",
    data: collection,
  });
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

  successResponse(res, {
    message: "Products removed from collection successfully",
    data: collection,
  });
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

  successResponse(res, {
    message: "Collections search completed successfully",
    data: collections,
  });
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

  successResponse(res, {
    message: "Bulk update completed",
    data: result,
  });
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

  successResponse(res, {
    message: "Collection visibility updated successfully",
    data: collection,
  });
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

  successResponse(res, {
    message: "Seller collections retrieved successfully",
    data: collections,
  });
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

  successResponse(res, {
    message: "Published collections retrieved successfully",
    data: collections,
  });
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

  successResponse(res, {
    message: "Collection statistics retrieved successfully",
    data: stats,
  });
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

  successResponse(res, {
    message: "Collection image uploaded successfully",
    data: {
      collection: updatedCollection,
      image: uploadResult,
    },
  });
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

  successResponse(res, {
    message: "Collection image removed successfully",
    data: updatedCollection,
  });
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

  successResponse(res, {
    message: "Your collections retrieved successfully",
    data: collections,
  });
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

  successResponse(res, {
    message: "Collection duplicated successfully",
    data: duplicatedCollection,
  });
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
