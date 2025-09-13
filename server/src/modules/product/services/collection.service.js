const Collection = require("../models/Collection.model");
const Product = require("../models/Product.model");
const ApiError = require("../../../shared/utils/ApiError");
const ProductEventPublisher = require("../events/ProductEventPublisher");

class CollectionService {
  /**
   * Create a new collection
   * @param {Object} collectionData - Collection data
   * @param {String} sellerId - Seller ID
   * @returns {Promise<Object>} Created collection
   */
  async createCollection(collectionData, sellerId) {
    try {
      // Validate seller exists
      if (!sellerId) {
        throw new ApiError(400, "Seller ID is required");
      }

      // Check for duplicate handle
      if (collectionData.handle) {
        const existingCollection = await Collection.findOne({
          handle: collectionData.handle,
          seller: sellerId,
        });
        if (existingCollection) {
          throw new ApiError(400, "Collection with this handle already exists");
        }
      }

      // Validate products if provided (for manual collections)
      if (
        collectionData.type === "manual" &&
        collectionData.products?.length > 0
      ) {
        const validProducts = await Product.find({
          _id: { $in: collectionData.products },
          seller: sellerId,
          status: "active",
        });

        if (validProducts.length !== collectionData.products.length) {
          throw new ApiError(
            400,
            "Some products are invalid or not owned by seller"
          );
        }
      }

      // Create collection
      const collection = new Collection({
        ...collectionData,
        seller: sellerId,
      });

      await collection.save();

      // Publish event
      await ProductEventPublisher.publishCollectionCreated({
        collectionId: collection._id,
        sellerId,
        collectionData: {
          name: collection.name,
          handle: collection.handle,
          type: collection.type,
          productCount: collection.productCount,
        },
      });

      return collection;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to create collection: ${error.message}`);
    }
  }

  /**
   * Get collection by ID
   * @param {String} collectionId - Collection ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Collection
   */
  async getCollectionById(collectionId, options = {}) {
    try {
      const { includeProducts = false, sellerId } = options;

      let query = Collection.findById(collectionId);

      if (includeProducts) {
        query = query.populate({
          path: "products",
          match: { status: "active" },
          select: "name slug basePrice images category brand",
          populate: [
            { path: "category", select: "name slug" },
            { path: "brand", select: "name logo" },
          ],
        });
      }

      query = query.populate("seller", "firstName lastName");

      const collection = await query;

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      // Check seller access for private collections
      if (sellerId && collection.seller._id.toString() !== sellerId) {
        if (!collection.isVisible || !collection.isPublished) {
          throw new ApiError(403, "Access denied to this collection");
        }
      }

      return collection;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to get collection: ${error.message}`);
    }
  }

  /**
   * Get collection by handle
   * @param {String} handle - Collection handle
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Collection
   */
  async getCollectionByHandle(handle, options = {}) {
    try {
      const { includeProducts = false } = options;

      let query = Collection.findOne({
        handle,
        isVisible: true,
        isPublished: true,
      });

      if (includeProducts) {
        query = query.populate({
          path: "products",
          match: { status: "active" },
          select: "name slug basePrice images category brand",
          populate: [
            { path: "category", select: "name slug" },
            { path: "brand", select: "name logo" },
          ],
        });
      }

      query = query.populate("seller", "firstName lastName");

      const collection = await query;

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      // Increment view count
      await Collection.findByIdAndUpdate(collection._id, {
        $inc: { viewCount: 1 },
      });

      return collection;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Failed to get collection by handle: ${error.message}`
      );
    }
  }

  /**
   * Get collections with filters and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated collections
   */
  async getCollections(filters = {}, pagination = {}) {
    try {
      const {
        sellerId,
        type,
        isVisible,
        isPublished,
        search,
        includeHidden = false,
        includeUnpublished = false,
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = pagination;

      // Build query
      const query = {};

      if (sellerId) {
        query.seller = sellerId;
      }

      if (type) {
        query.type = type;
      }

      if (isVisible !== undefined) {
        query.isVisible = isVisible;
      } else if (!includeHidden) {
        query.isVisible = true;
      }

      if (isPublished !== undefined) {
        query.isPublished = isPublished;
      } else if (!includeUnpublished) {
        query.isPublished = true;
      }

      if (search) {
        query.$text = { $search: search };
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: [{ path: "seller", select: "firstName lastName" }],
      };

      const result = await Collection.paginate(query, options);
      return result;
    } catch (error) {
      throw new ApiError(500, `Failed to get collections: ${error.message}`);
    }
  }

  /**
   * Update collection
   * @param {String} collectionId - Collection ID
   * @param {Object} updateData - Update data
   * @param {String} sellerId - Seller ID
   * @returns {Promise<Object>} Updated collection
   */
  async updateCollection(collectionId, updateData, sellerId) {
    try {
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      // Check ownership
      if (collection.seller.toString() !== sellerId) {
        throw new ApiError(403, "Not authorized to update this collection");
      }

      // Check for duplicate handle if updating
      if (updateData.handle && updateData.handle !== collection.handle) {
        const existingCollection = await Collection.findOne({
          handle: updateData.handle,
          seller: sellerId,
          _id: { $ne: collectionId },
        });
        if (existingCollection) {
          throw new ApiError(400, "Collection with this handle already exists");
        }
      }

      // Validate products if updating (for manual collections)
      if (updateData.products && collection.type === "manual") {
        const validProducts = await Product.find({
          _id: { $in: updateData.products },
          seller: sellerId,
          status: "active",
        });

        if (validProducts.length !== updateData.products.length) {
          throw new ApiError(
            400,
            "Some products are invalid or not owned by seller"
          );
        }
      }

      // Update collection
      Object.assign(collection, updateData);
      await collection.save();

      // Publish event
      await ProductEventPublisher.publishCollectionUpdated({
        collectionId: collection._id,
        sellerId,
        updateData,
        collectionData: {
          name: collection.name,
          handle: collection.handle,
          type: collection.type,
          productCount: collection.productCount,
        },
      });

      return collection;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to update collection: ${error.message}`);
    }
  }

  /**
   * Delete collection
   * @param {String} collectionId - Collection ID
   * @param {String} sellerId - Seller ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCollection(collectionId, sellerId) {
    try {
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      // Check ownership
      if (collection.seller.toString() !== sellerId) {
        throw new ApiError(403, "Not authorized to delete this collection");
      }

      await Collection.findByIdAndDelete(collectionId);

      // Publish event
      await ProductEventPublisher.publishCollectionDeleted({
        collectionId,
        sellerId,
        collectionData: {
          name: collection.name,
          handle: collection.handle,
          type: collection.type,
          productCount: collection.productCount,
        },
      });

      return { message: "Collection deleted successfully" };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete collection: ${error.message}`);
    }
  }

  /**
   * Add products to collection
   * @param {String} collectionId - Collection ID
   * @param {Array} productIds - Product IDs to add
   * @param {String} sellerId - Seller ID
   * @returns {Promise<Object>} Updated collection
   */
  async addProductsToCollection(collectionId, productIds, sellerId) {
    try {
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      // Check ownership
      if (collection.seller.toString() !== sellerId) {
        throw new ApiError(403, "Not authorized to modify this collection");
      }

      if (collection.type !== "manual") {
        throw new ApiError(400, "Can only add products to manual collections");
      }

      // Validate products
      const validProducts = await Product.find({
        _id: { $in: productIds },
        seller: sellerId,
        status: "active",
      });

      if (validProducts.length !== productIds.length) {
        throw new ApiError(
          400,
          "Some products are invalid or not owned by seller"
        );
      }

      await collection.addMultipleProducts(productIds);

      // Publish event
      await ProductEventPublisher.publishCollectionProductsAdded({
        collectionId: collection._id,
        sellerId,
        productIds,
        productCount: collection.productCount,
      });

      return collection;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Failed to add products to collection: ${error.message}`
      );
    }
  }

  /**
   * Remove products from collection
   * @param {String} collectionId - Collection ID
   * @param {Array} productIds - Product IDs to remove
   * @param {String} sellerId - Seller ID
   * @returns {Promise<Object>} Updated collection
   */
  async removeProductsFromCollection(collectionId, productIds, sellerId) {
    try {
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      // Check ownership
      if (collection.seller.toString() !== sellerId) {
        throw new ApiError(403, "Not authorized to modify this collection");
      }

      if (collection.type !== "manual") {
        throw new ApiError(
          400,
          "Can only remove products from manual collections"
        );
      }

      await collection.removeMultipleProducts(productIds);

      // Publish event
      await ProductEventPublisher.publishCollectionProductsRemoved({
        collectionId: collection._id,
        sellerId,
        productIds,
        productCount: collection.productCount,
      });

      return collection;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Failed to remove products from collection: ${error.message}`
      );
    }
  }

  /**
   * Get collection products with pagination and sorting
   * @param {String} collectionId - Collection ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated products
   */
  async getCollectionProducts(collectionId, options = {}) {
    try {
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      const products = await collection.getProducts(options);
      return products;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Failed to get collection products: ${error.message}`
      );
    }
  }

  /**
   * Search collections
   * @param {String} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchCollections(searchTerm, options = {}) {
    try {
      const { limit = 20, sellerId } = options;

      const collections = await Collection.searchCollections(searchTerm, {
        limit,
        sellerId,
      });
      return collections;
    } catch (error) {
      throw new ApiError(500, `Failed to search collections: ${error.message}`);
    }
  }

  /**
   * Bulk update collections
   * @param {Array} updates - Array of update objects
   * @param {String} sellerId - Seller ID
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateCollections(updates, sellerId) {
    try {
      const results = {
        updated: 0,
        errors: [],
      };

      for (const update of updates) {
        try {
          const { collectionId, ...updateData } = update;
          await this.updateCollection(collectionId, updateData, sellerId);
          results.updated++;
        } catch (error) {
          results.errors.push({
            collectionId: update.collectionId,
            error: error.message,
          });
        }
      }

      // Publish event
      await ProductEventPublisher.publishCollectionsBulkUpdated({
        sellerId,
        updatedCount: results.updated,
        errorCount: results.errors.length,
      });

      return results;
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to bulk update collections: ${error.message}`
      );
    }
  }

  /**
   * Update collection visibility
   * @param {String} collectionId - Collection ID
   * @param {Boolean} isVisible - Visibility status
   * @param {String} sellerId - Seller ID
   * @returns {Promise<Object>} Updated collection
   */
  async updateCollectionVisibility(collectionId, isVisible, sellerId) {
    try {
      const collection = await Collection.findById(collectionId);

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }

      // Check ownership
      if (collection.seller.toString() !== sellerId) {
        throw new ApiError(403, "Not authorized to update this collection");
      }

      collection.isVisible = isVisible;
      await collection.save();

      // Publish event
      await ProductEventPublisher.publishCollectionVisibilityUpdated({
        collectionId: collection._id,
        sellerId,
        isVisible,
      });

      return collection;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Failed to update collection visibility: ${error.message}`
      );
    }
  }

  /**
   * Get collection statistics
   * @param {String} sellerId - Seller ID (optional)
   * @returns {Promise<Object>} Collection statistics
   */
  async getCollectionStats(sellerId = null) {
    try {
      const matchStage = sellerId
        ? { seller: mongoose.Types.ObjectId(sellerId) }
        : {};

      const stats = await Collection.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalCollections: { $sum: 1 },
            publishedCollections: {
              $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] },
            },
            visibleCollections: {
              $sum: { $cond: [{ $eq: ["$isVisible", true] }, 1, 0] },
            },
            manualCollections: {
              $sum: { $cond: [{ $eq: ["$type", "manual"] }, 1, 0] },
            },
            automatedCollections: {
              $sum: { $cond: [{ $eq: ["$type", "automated"] }, 1, 0] },
            },
            totalProducts: { $sum: "$productCount" },
            totalViews: { $sum: "$viewCount" },
            avgProductsPerCollection: { $avg: "$productCount" },
          },
        },
      ]);

      return (
        stats[0] || {
          totalCollections: 0,
          publishedCollections: 0,
          visibleCollections: 0,
          manualCollections: 0,
          automatedCollections: 0,
          totalProducts: 0,
          totalViews: 0,
          avgProductsPerCollection: 0,
        }
      );
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to get collection statistics: ${error.message}`
      );
    }
  }

  /**
   * Get collections by seller
   * @param {String} sellerId - Seller ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Seller collections
   */
  async getCollectionsBySeller(sellerId, options = {}) {
    try {
      const collections = await Collection.findBySeller(sellerId, options);
      return collections;
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to get collections by seller: ${error.message}`
      );
    }
  }

  /**
   * Get published collections
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Published collections
   */
  async getPublishedCollections(options = {}) {
    try {
      const collections = await Collection.findPublished(options);
      return collections;
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to get published collections: ${error.message}`
      );
    }
  }
}

module.exports = new CollectionService();
