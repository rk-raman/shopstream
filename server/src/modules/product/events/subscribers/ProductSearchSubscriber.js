const { productEventEmitter, PRODUCT_EVENTS } = require("../product.events");

class ProductSearchSubscriber {
  constructor() {
    this.eventEmitter = productEventEmitter;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Product lifecycle search index updates
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_CREATED,
      this.handleProductCreated.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_UPDATED,
      this.handleProductUpdated.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_DELETED,
      this.handleProductDeleted.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_APPROVED,
      this.handleProductApproved.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_REJECTED,
      this.handleProductRejected.bind(this)
    );

    // Stock updates affecting search availability
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_UPDATED,
      this.handleStockUpdated.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_OUT,
      this.handleStockOut.bind(this)
    );

    // Review updates affecting search rankings
    this.eventEmitter.on(
      PRODUCT_EVENTS.REVIEW_ADDED,
      this.handleReviewAdded.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.REVIEW_UPDATED,
      this.handleReviewUpdated.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.REVIEW_DELETED,
      this.handleReviewDeleted.bind(this)
    );

    // Pricing updates affecting search filters
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRICE_CHANGED,
      this.handlePriceChanged.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.DISCOUNT_APPLIED,
      this.handleDiscountApplied.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.DISCOUNT_REMOVED,
      this.handleDiscountRemoved.bind(this)
    );

    // Variant updates affecting search
    this.eventEmitter.on(
      PRODUCT_EVENTS.VARIANT_ADDED,
      this.handleVariantAdded.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.VARIANT_UPDATED,
      this.handleVariantUpdated.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.VARIANT_DELETED,
      this.handleVariantDeleted.bind(this)
    );

    // Search analytics
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_SEARCHED,
      this.handleProductSearched.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_VIEWED,
      this.handleProductViewed.bind(this)
    );

    // Bulk operations
    this.eventEmitter.on(
      PRODUCT_EVENTS.BULK_UPDATE_COMPLETED,
      this.handleBulkUpdateCompleted.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.BULK_DELETE_COMPLETED,
      this.handleBulkDeleteCompleted.bind(this)
    );
  }

  // Product lifecycle search handlers
  async handleProductCreated(eventData) {
    try {
      console.log(`[Search] Product created: ${eventData.productId}`);

      // Don't index products that are not approved yet
      if (eventData.status !== "approved") {
        console.log(
          `[Search] Skipping indexing for non-approved product: ${eventData.productId}`
        );
        return;
      }

      // Create search document
      const searchDocument = await this.createSearchDocument(eventData);
      await this.indexProduct(eventData.productId, searchDocument);

      // Update category search facets
      await this.updateCategoryFacets(eventData.categoryId);

      // Update brand search facets
      if (eventData.brandId) {
        await this.updateBrandFacets(eventData.brandId);
      }

      // Update seller search facets
      await this.updateSellerFacets(eventData.sellerId);
    } catch (error) {
      console.error("Error handling product created search indexing:", error);
    }
  }

  async handleProductUpdated(eventData) {
    try {
      console.log(`[Search] Product updated: ${eventData.productId}`);

      // Get the updated product data
      const updatedSearchDocument = await this.createSearchDocument(eventData);
      await this.updateProductIndex(
        eventData.productId,
        updatedSearchDocument,
        eventData.changes
      );

      // Check if category changed
      if (eventData.changes.category) {
        await this.updateCategoryFacets(eventData.changes.category);
        if (eventData.previousValues?.category) {
          await this.updateCategoryFacets(eventData.previousValues.category);
        }
      }

      // Check if brand changed
      if (eventData.changes.brand) {
        await this.updateBrandFacets(eventData.changes.brand);
        if (eventData.previousValues?.brand) {
          await this.updateBrandFacets(eventData.previousValues.brand);
        }
      }

      // Update search suggestions if name or tags changed
      if (eventData.changes.name || eventData.changes.tags) {
        await this.updateSearchSuggestions(eventData);
      }
    } catch (error) {
      console.error("Error handling product updated search indexing:", error);
    }
  }

  async handleProductDeleted(eventData) {
    try {
      console.log(`[Search] Product deleted: ${eventData.productId}`);

      // Remove from search index
      await this.removeProductFromIndex(eventData.productId);

      // Update category facets
      if (eventData.categoryId) {
        await this.updateCategoryFacets(eventData.categoryId);
      }

      // Update brand facets
      if (eventData.brandId) {
        await this.updateBrandFacets(eventData.brandId);
      }

      // Update seller facets
      await this.updateSellerFacets(eventData.sellerId);

      // Remove from search suggestions
      await this.removeFromSearchSuggestions(eventData);
    } catch (error) {
      console.error("Error handling product deleted search indexing:", error);
    }
  }

  async handleProductApproved(eventData) {
    try {
      console.log(`[Search] Product approved: ${eventData.productId}`);

      // Product is now searchable, add to index
      const searchDocument = await this.createSearchDocument(eventData);
      await this.indexProduct(eventData.productId, searchDocument);

      // Update facets
      await this.updateCategoryFacets(eventData.categoryId);
      if (eventData.brandId) {
        await this.updateBrandFacets(eventData.brandId);
      }
      await this.updateSellerFacets(eventData.sellerId);

      // Add to search suggestions
      await this.updateSearchSuggestions(eventData);
    } catch (error) {
      console.error("Error handling product approved search indexing:", error);
    }
  }

  async handleProductRejected(eventData) {
    try {
      console.log(`[Search] Product rejected: ${eventData.productId}`);

      // Remove from search index if it was previously indexed
      await this.removeProductFromIndex(eventData.productId);

      // Update facets
      await this.updateCategoryFacets(eventData.categoryId);
      await this.updateSellerFacets(eventData.sellerId);
    } catch (error) {
      console.error("Error handling product rejected search indexing:", error);
    }
  }

  // Stock search handlers
  async handleStockUpdated(eventData) {
    try {
      console.log(`[Search] Stock updated: ${eventData.productId}`);

      // Update availability in search index
      await this.updateProductAvailability(eventData.productId, {
        inStock: eventData.newStock > 0,
        stock: eventData.newStock,
        variantId: eventData.variantId,
      });

      // If stock went from 0 to > 0 or vice versa, update search filters
      if (
        (eventData.previousStock === 0 && eventData.newStock > 0) ||
        (eventData.previousStock > 0 && eventData.newStock === 0)
      ) {
        await this.updateAvailabilityFacets();
      }
    } catch (error) {
      console.error("Error handling stock updated search indexing:", error);
    }
  }

  async handleStockOut(eventData) {
    try {
      console.log(`[Search] Stock out: ${eventData.productId}`);

      // Update product availability in search
      await this.updateProductAvailability(eventData.productId, {
        inStock: false,
        stock: 0,
        variantId: eventData.variantId,
      });

      // Update availability facets
      await this.updateAvailabilityFacets();
    } catch (error) {
      console.error("Error handling stock out search indexing:", error);
    }
  }

  // Review search handlers
  async handleReviewAdded(eventData) {
    try {
      console.log(
        `[Search] Review added: ${eventData.reviewId} for product: ${eventData.productId}`
      );

      // Update product rating and review count in search index
      await this.updateProductReviewMetrics(eventData.productId, {
        newReview: true,
        rating: eventData.rating,
        reviewCount: eventData.totalReviews,
        averageRating: eventData.averageRating,
      });

      // Update rating facets
      await this.updateRatingFacets();
    } catch (error) {
      console.error("Error handling review added search indexing:", error);
    }
  }

  async handleReviewUpdated(eventData) {
    try {
      console.log(`[Search] Review updated: ${eventData.reviewId}`);

      // Update product rating metrics
      await this.updateProductReviewMetrics(eventData.productId, {
        reviewCount: eventData.totalReviews,
        averageRating: eventData.averageRating,
        ratingChanged: eventData.newRating !== eventData.previousRating,
      });

      // Update rating facets if rating changed significantly
      const ratingChange = Math.abs(
        eventData.newRating - eventData.previousRating
      );
      if (ratingChange >= 1) {
        await this.updateRatingFacets();
      }
    } catch (error) {
      console.error("Error handling review updated search indexing:", error);
    }
  }

  async handleReviewDeleted(eventData) {
    try {
      console.log(`[Search] Review deleted: ${eventData.reviewId}`);

      // Update product rating metrics
      await this.updateProductReviewMetrics(eventData.productId, {
        reviewCount: eventData.totalReviews,
        averageRating: eventData.averageRating,
        reviewDeleted: true,
      });

      // Update rating facets
      await this.updateRatingFacets();
    } catch (error) {
      console.error("Error handling review deleted search indexing:", error);
    }
  }

  // Pricing search handlers
  async handlePriceChanged(eventData) {
    try {
      console.log(`[Search] Price changed: ${eventData.productId}`);

      // Update product pricing in search index
      await this.updateProductPricing(eventData.productId, {
        basePrice: eventData.newPrice,
        previousPrice: eventData.previousPrice,
        priceChange: eventData.priceChange,
        priceChangePercentage: eventData.priceChangePercentage,
        variantId: eventData.variantId,
      });

      // Update price range facets
      await this.updatePriceRangeFacets();
    } catch (error) {
      console.error("Error handling price changed search indexing:", error);
    }
  }

  async handleDiscountApplied(eventData) {
    try {
      console.log(`[Search] Discount applied: ${eventData.productId}`);

      // Update product discount information in search
      await this.updateProductDiscount(eventData.productId, {
        hasDiscount: true,
        discountPercentage: eventData.discountPercentage,
        discountAmount: eventData.discountAmount,
        discountPrice: eventData.discountPrice,
        variantId: eventData.variantId,
      });

      // Update discount facets
      await this.updateDiscountFacets();
    } catch (error) {
      console.error("Error handling discount applied search indexing:", error);
    }
  }

  async handleDiscountRemoved(eventData) {
    try {
      console.log(`[Search] Discount removed: ${eventData.productId}`);

      // Remove discount information from search
      await this.updateProductDiscount(eventData.productId, {
        hasDiscount: false,
        discountPercentage: 0,
        discountAmount: 0,
        discountPrice: null,
        variantId: eventData.variantId,
      });

      // Update discount facets
      await this.updateDiscountFacets();
    } catch (error) {
      console.error("Error handling discount removed search indexing:", error);
    }
  }

  // Variant search handlers
  async handleVariantAdded(eventData) {
    try {
      console.log(
        `[Search] Variant added: ${eventData.variantId} to product: ${eventData.productId}`
      );

      // Update product variants in search index
      await this.updateProductVariants(eventData.productId, {
        action: "add",
        variant: eventData.variant,
      });

      // Update variant-related facets (size, color, etc.)
      await this.updateVariantFacets(eventData.variant);
    } catch (error) {
      console.error("Error handling variant added search indexing:", error);
    }
  }

  async handleVariantUpdated(eventData) {
    try {
      console.log(`[Search] Variant updated: ${eventData.variantId}`);

      // Update specific variant in search index
      await this.updateProductVariants(eventData.productId, {
        action: "update",
        variantId: eventData.variantId,
        changes: eventData.changes,
      });

      // Update variant facets if attributes changed
      if (eventData.changes.attributes) {
        await this.updateVariantFacets(eventData.changes.attributes);
      }
    } catch (error) {
      console.error("Error handling variant updated search indexing:", error);
    }
  }

  async handleVariantDeleted(eventData) {
    try {
      console.log(`[Search] Variant deleted: ${eventData.variantId}`);

      // Remove variant from search index
      await this.updateProductVariants(eventData.productId, {
        action: "remove",
        variantId: eventData.variantId,
      });

      // Update variant facets
      await this.updateVariantFacets();
    } catch (error) {
      console.error("Error handling variant deleted search indexing:", error);
    }
  }

  // Search analytics handlers
  async handleProductSearched(eventData) {
    try {
      console.log(`[Search] Product searched: "${eventData.searchQuery}"`);

      // Update search analytics
      await this.updateSearchAnalytics({
        query: eventData.searchQuery,
        filters: eventData.filters,
        resultsCount: eventData.resultsCount,
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        timestamp: eventData.timestamp,
      });

      // Update search suggestions based on popular queries
      await this.updatePopularSearches(
        eventData.searchQuery,
        eventData.resultsCount
      );
    } catch (error) {
      console.error("Error handling product searched analytics:", error);
    }
  }

  async handleProductViewed(eventData) {
    try {
      console.log(`[Search] Product viewed: ${eventData.productId}`);

      // Update product popularity score in search index
      await this.updateProductPopularity(eventData.productId, {
        viewCount: 1,
        userId: eventData.userId,
        viewSource: eventData.viewSource,
        timestamp: eventData.timestamp,
      });
    } catch (error) {
      console.error("Error handling product viewed search update:", error);
    }
  }

  // Bulk operation handlers
  async handleBulkUpdateCompleted(eventData) {
    try {
      console.log(`[Search] Bulk update completed: ${eventData.operationId}`);

      // For bulk operations, it's more efficient to reindex affected products
      if (eventData.productIds && eventData.productIds.length > 0) {
        await this.bulkReindexProducts(eventData.productIds);
      }

      // Update affected facets
      if (eventData.affectedCategories) {
        for (const categoryId of eventData.affectedCategories) {
          await this.updateCategoryFacets(categoryId);
        }
      }
    } catch (error) {
      console.error(
        "Error handling bulk update completed search indexing:",
        error
      );
    }
  }

  async handleBulkDeleteCompleted(eventData) {
    try {
      console.log(`[Search] Bulk delete completed: ${eventData.operationId}`);

      // Remove products from search index
      if (eventData.productIds && eventData.productIds.length > 0) {
        await this.bulkRemoveFromIndex(eventData.productIds);
      }

      // Update affected facets
      if (eventData.affectedCategories) {
        for (const categoryId of eventData.affectedCategories) {
          await this.updateCategoryFacets(categoryId);
        }
      }
    } catch (error) {
      console.error(
        "Error handling bulk delete completed search indexing:",
        error
      );
    }
  }

  // Search indexing helper methods
  async createSearchDocument(productData) {
    // Create a comprehensive search document
    return {
      id: productData.productId,
      name: productData.productName || productData.name,
      description: productData.description,
      shortDescription: productData.shortDescription,
      category: productData.categoryId,
      categoryName: productData.categoryName,
      brand: productData.brandId,
      brandName: productData.brandName,
      seller: productData.sellerId,
      sellerName: productData.sellerName,
      tags: productData.tags || [],
      sku: productData.sku,

      // Pricing
      basePrice: productData.basePrice,
      discountPrice: productData.discountPrice,
      salePrice: productData.salePrice,
      hasDiscount: productData.hasDiscount || false,
      discountPercentage: productData.discountPercentage || 0,

      // Availability
      inStock: productData.stock > 0,
      stock: productData.stock,

      // Reviews and ratings
      averageRating: productData.averageRating || 0,
      reviewCount: productData.reviewCount || 0,

      // Status and visibility
      status: productData.status,
      isActive: productData.isActive,
      isFeatured: productData.isFeatured || false,

      // Variants
      variants: productData.variants || [],
      hasVariants: productData.variants && productData.variants.length > 0,

      // Images
      images: productData.images || [],

      // SEO
      slug: productData.slug,
      metaTitle: productData.seo?.metaTitle,
      metaDescription: productData.seo?.metaDescription,

      // Timestamps
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt,

      // Search boost factors
      popularityScore: productData.popularityScore || 0,
      viewCount: productData.viewCount || 0,

      // Full-text search fields
      searchText: [
        productData.productName || productData.name,
        productData.description,
        productData.shortDescription,
        productData.categoryName,
        productData.brandName,
        ...(productData.tags || []),
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  async indexProduct(productId, searchDocument) {
    console.log(`[Search Index] Indexing product: ${productId}`);

    // This would integrate with your search engine (Elasticsearch, Algolia, etc.)
    // Example Elasticsearch implementation:
    // const { Client } = require('@elastic/elasticsearch');
    // const client = new Client({ node: process.env.ELASTICSEARCH_URL });
    //
    // await client.index({
    //   index: 'products',
    //   id: productId,
    //   body: searchDocument,
    // });

    console.log("Search document:", JSON.stringify(searchDocument, null, 2));
  }

  async updateProductIndex(productId, searchDocument, changes) {
    console.log(`[Search Index] Updating product: ${productId}`);

    // Partial update based on what changed
    const updateDoc = {};

    // Map changes to search document fields
    if (changes.name) updateDoc.name = searchDocument.name;
    if (changes.description) updateDoc.description = searchDocument.description;
    if (changes.basePrice) updateDoc.basePrice = searchDocument.basePrice;
    if (changes.stock !== undefined) {
      updateDoc.stock = searchDocument.stock;
      updateDoc.inStock = searchDocument.inStock;
    }
    if (changes.tags) updateDoc.tags = searchDocument.tags;
    if (changes.isActive !== undefined)
      updateDoc.isActive = searchDocument.isActive;

    // Update search text if content fields changed
    if (changes.name || changes.description || changes.tags) {
      updateDoc.searchText = searchDocument.searchText;
    }

    // Example Elasticsearch update:
    // await client.update({
    //   index: 'products',
    //   id: productId,
    //   body: { doc: updateDoc },
    // });

    console.log("Search update:", JSON.stringify(updateDoc, null, 2));
  }

  async removeProductFromIndex(productId) {
    console.log(`[Search Index] Removing product: ${productId}`);

    // Example Elasticsearch delete:
    // await client.delete({
    //   index: 'products',
    //   id: productId,
    // });
  }

  async updateProductAvailability(productId, availabilityData) {
    console.log(`[Search Index] Updating availability for: ${productId}`);

    // Update stock and availability fields
    // await client.update({
    //   index: 'products',
    //   id: productId,
    //   body: {
    //     doc: {
    //       inStock: availabilityData.inStock,
    //       stock: availabilityData.stock,
    //     }
    //   }
    // });
  }

  async updateProductReviewMetrics(productId, reviewData) {
    console.log(`[Search Index] Updating review metrics for: ${productId}`);

    // Update review-related fields
    // await client.update({
    //   index: 'products',
    //   id: productId,
    //   body: {
    //     doc: {
    //       averageRating: reviewData.averageRating,
    //       reviewCount: reviewData.reviewCount,
    //     }
    //   }
    // });
  }

  async updateProductPricing(productId, pricingData) {
    console.log(`[Search Index] Updating pricing for: ${productId}`);

    // Update price-related fields
    // await client.update({
    //   index: 'products',
    //   id: productId,
    //   body: {
    //     doc: {
    //       basePrice: pricingData.basePrice,
    //     }
    //   }
    // });
  }

  async updateProductDiscount(productId, discountData) {
    console.log(`[Search Index] Updating discount for: ${productId}`);

    // Update discount-related fields
    // await client.update({
    //   index: 'products',
    //   id: productId,
    //   body: {
    //     doc: {
    //       hasDiscount: discountData.hasDiscount,
    //       discountPercentage: discountData.discountPercentage,
    //       discountPrice: discountData.discountPrice,
    //     }
    //   }
    // });
  }

  async updateProductVariants(productId, variantData) {
    console.log(`[Search Index] Updating variants for: ${productId}`);

    // Update variant-related fields based on action
    // This would require fetching current variants and updating them
  }

  async updateProductPopularity(productId, popularityData) {
    console.log(`[Search Index] Updating popularity for: ${productId}`);

    // Update popularity score (could be based on views, purchases, etc.)
    // await client.update({
    //   index: 'products',
    //   id: productId,
    //   body: {
    //     script: {
    //       source: 'ctx._source.viewCount += params.increment; ctx._source.popularityScore = Math.log(ctx._source.viewCount + 1)',
    //       params: { increment: popularityData.viewCount }
    //     }
    //   }
    // });
  }

  // Facet update methods
  async updateCategoryFacets(categoryId) {
    console.log(`[Search Facets] Updating category facets: ${categoryId}`);
    // Update category-based search facets
  }

  async updateBrandFacets(brandId) {
    console.log(`[Search Facets] Updating brand facets: ${brandId}`);
    // Update brand-based search facets
  }

  async updateSellerFacets(sellerId) {
    console.log(`[Search Facets] Updating seller facets: ${sellerId}`);
    // Update seller-based search facets
  }

  async updateRatingFacets() {
    console.log(`[Search Facets] Updating rating facets`);
    // Update rating-based search facets
  }

  async updatePriceRangeFacets() {
    console.log(`[Search Facets] Updating price range facets`);
    // Update price range facets
  }

  async updateDiscountFacets() {
    console.log(`[Search Facets] Updating discount facets`);
    // Update discount-based facets
  }

  async updateAvailabilityFacets() {
    console.log(`[Search Facets] Updating availability facets`);
    // Update availability-based facets
  }

  async updateVariantFacets(variantAttributes = null) {
    console.log(`[Search Facets] Updating variant facets`);
    // Update variant attribute facets (size, color, etc.)
  }

  // Search suggestions and analytics
  async updateSearchSuggestions(productData) {
    console.log(
      `[Search Suggestions] Updating suggestions for: ${productData.productName}`
    );
    // Update search autocomplete suggestions
  }

  async removeFromSearchSuggestions(productData) {
    console.log(
      `[Search Suggestions] Removing suggestions for: ${productData.productName}`
    );
    // Remove from search suggestions
  }

  async updateSearchAnalytics(searchData) {
    console.log(`[Search Analytics] Recording search: "${searchData.query}"`);
    // Record search analytics
  }

  async updatePopularSearches(query, resultsCount) {
    console.log(`[Search Analytics] Updating popular searches: "${query}"`);
    // Update popular search terms
  }

  // Bulk operations
  async bulkReindexProducts(productIds) {
    console.log(`[Search Index] Bulk reindexing ${productIds.length} products`);

    // Fetch product data and reindex
    // const Product = require('../../models/Product.model');
    // const products = await Product.find({ _id: { $in: productIds } });
    //
    // const bulkOps = products.map(product => ({
    //   index: { _index: 'products', _id: product._id }
    // }));
    //
    // const bulkBody = [];
    // products.forEach(product => {
    //   bulkBody.push({ index: { _index: 'products', _id: product._id } });
    //   bulkBody.push(this.createSearchDocument(product));
    // });
    //
    // await client.bulk({ body: bulkBody });
  }

  async bulkRemoveFromIndex(productIds) {
    console.log(`[Search Index] Bulk removing ${productIds.length} products`);

    // Remove multiple products from index
    // const bulkBody = [];
    // productIds.forEach(productId => {
    //   bulkBody.push({ delete: { _index: 'products', _id: productId } });
    // });
    //
    // await client.bulk({ body: bulkBody });
  }
}

module.exports = ProductSearchSubscriber;
