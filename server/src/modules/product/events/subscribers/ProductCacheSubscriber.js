const { productEventEmitter, PRODUCT_EVENTS } = require("../product.events");

class ProductCacheSubscriber {
  constructor() {
    this.eventEmitter = productEventEmitter;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Product lifecycle cache invalidation
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

    // Stock cache invalidation
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_UPDATED,
      this.handleStockUpdated.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_LOW,
      this.handleStockLow.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_OUT,
      this.handleStockOut.bind(this)
    );

    // Review cache invalidation
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

    // Pricing cache invalidation
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

    // Variant cache invalidation
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

    // Bulk operation cache invalidation
    this.eventEmitter.on(
      PRODUCT_EVENTS.BULK_UPDATE_COMPLETED,
      this.handleBulkUpdateCompleted.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.BULK_DELETE_COMPLETED,
      this.handleBulkDeleteCompleted.bind(this)
    );
  }

  // Product lifecycle cache handlers
  async handleProductCreated(eventData) {
    try {
      console.log(`[Cache] Product created: ${eventData.productId}`);

      // Invalidate category-related caches
      await this.invalidateCategoryCache(eventData.categoryId);

      // Invalidate brand-related caches
      if (eventData.brandId) {
        await this.invalidateBrandCache(eventData.brandId);
      }

      // Invalidate seller-related caches
      await this.invalidateSellerCache(eventData.sellerId);

      // Invalidate search and listing caches
      await this.invalidateSearchCache();
      await this.invalidateListingCache();

      // Invalidate featured products cache if applicable
      if (eventData.isFeatured) {
        await this.invalidateFeaturedProductsCache();
      }
    } catch (error) {
      console.error(
        "Error handling product created cache invalidation:",
        error
      );
    }
  }

  async handleProductUpdated(eventData) {
    try {
      console.log(`[Cache] Product updated: ${eventData.productId}`);

      // Always invalidate the specific product cache
      await this.invalidateProductCache(eventData.productId);

      // Check what fields were updated and invalidate relevant caches
      const changes = eventData.changes;

      // Category change
      if (changes.category) {
        await this.invalidateCategoryCache(changes.category);
        if (eventData.previousValues?.category) {
          await this.invalidateCategoryCache(eventData.previousValues.category);
        }
      }

      // Brand change
      if (changes.brand) {
        await this.invalidateBrandCache(changes.brand);
        if (eventData.previousValues?.brand) {
          await this.invalidateBrandCache(eventData.previousValues.brand);
        }
      }

      // Price changes
      if (changes.basePrice || changes.discountPrice || changes.salePrice) {
        await this.invalidatePricingCache(eventData.productId);
        await this.invalidateSearchCache(); // Price filters in search
      }

      // Stock changes
      if (changes.stock || changes.variants) {
        await this.invalidateStockCache(eventData.productId);
        await this.invalidateAvailabilityCache();
      }

      // SEO/visibility changes
      if (
        changes.name ||
        changes.description ||
        changes.tags ||
        changes.isActive
      ) {
        await this.invalidateSearchCache();
        await this.invalidateListingCache();
      }

      // Featured status change
      if (changes.isFeatured !== undefined) {
        await this.invalidateFeaturedProductsCache();
      }

      // Seller cache
      await this.invalidateSellerCache(eventData.sellerId);
    } catch (error) {
      console.error(
        "Error handling product updated cache invalidation:",
        error
      );
    }
  }

  async handleProductDeleted(eventData) {
    try {
      console.log(`[Cache] Product deleted: ${eventData.productId}`);

      // Invalidate the specific product cache
      await this.invalidateProductCache(eventData.productId);

      // Invalidate category-related caches
      if (eventData.categoryId) {
        await this.invalidateCategoryCache(eventData.categoryId);
      }

      // Invalidate brand-related caches
      if (eventData.brandId) {
        await this.invalidateBrandCache(eventData.brandId);
      }

      // Invalidate seller-related caches
      await this.invalidateSellerCache(eventData.sellerId);

      // Invalidate search and listing caches
      await this.invalidateSearchCache();
      await this.invalidateListingCache();

      // Invalidate featured products cache
      await this.invalidateFeaturedProductsCache();

      // Invalidate recommendation caches
      await this.invalidateRecommendationCache();
    } catch (error) {
      console.error(
        "Error handling product deleted cache invalidation:",
        error
      );
    }
  }

  async handleProductApproved(eventData) {
    try {
      console.log(`[Cache] Product approved: ${eventData.productId}`);

      // Product is now visible, invalidate public caches
      await this.invalidateProductCache(eventData.productId);
      await this.invalidateCategoryCache(eventData.categoryId);
      await this.invalidateSearchCache();
      await this.invalidateListingCache();
      await this.invalidateSellerCache(eventData.sellerId);

      // If featured, invalidate featured products cache
      if (eventData.isFeatured) {
        await this.invalidateFeaturedProductsCache();
      }
    } catch (error) {
      console.error(
        "Error handling product approved cache invalidation:",
        error
      );
    }
  }

  async handleProductRejected(eventData) {
    try {
      console.log(`[Cache] Product rejected: ${eventData.productId}`);

      // Product is no longer visible, invalidate caches
      await this.invalidateProductCache(eventData.productId);
      await this.invalidateSellerCache(eventData.sellerId);
    } catch (error) {
      console.error(
        "Error handling product rejected cache invalidation:",
        error
      );
    }
  }

  // Stock cache handlers
  async handleStockUpdated(eventData) {
    try {
      console.log(`[Cache] Stock updated: ${eventData.productId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateStockCache(eventData.productId);
      await this.invalidateAvailabilityCache();

      // If variant stock updated
      if (eventData.variantId) {
        await this.invalidateVariantCache(
          eventData.productId,
          eventData.variantId
        );
      }

      // If stock went from 0 to > 0 or vice versa, invalidate search/listing
      if (
        (eventData.previousStock === 0 && eventData.newStock > 0) ||
        (eventData.previousStock > 0 && eventData.newStock === 0)
      ) {
        await this.invalidateSearchCache();
        await this.invalidateListingCache();
      }
    } catch (error) {
      console.error("Error handling stock updated cache invalidation:", error);
    }
  }

  async handleStockLow(eventData) {
    try {
      console.log(`[Cache] Stock low: ${eventData.productId}`);

      await this.invalidateStockCache(eventData.productId);
      await this.invalidateSellerCache(eventData.sellerId);
    } catch (error) {
      console.error("Error handling stock low cache invalidation:", error);
    }
  }

  async handleStockOut(eventData) {
    try {
      console.log(`[Cache] Stock out: ${eventData.productId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateStockCache(eventData.productId);
      await this.invalidateAvailabilityCache();
      await this.invalidateSearchCache();
      await this.invalidateListingCache();

      if (eventData.variantId) {
        await this.invalidateVariantCache(
          eventData.productId,
          eventData.variantId
        );
      }
    } catch (error) {
      console.error("Error handling stock out cache invalidation:", error);
    }
  }

  // Review cache handlers
  async handleReviewAdded(eventData) {
    try {
      console.log(
        `[Cache] Review added: ${eventData.reviewId} for product: ${eventData.productId}`
      );

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateReviewCache(eventData.productId);
      await this.invalidateRatingCache(eventData.productId);
      await this.invalidateSellerCache(eventData.sellerId);

      // Reviews might affect search rankings
      await this.invalidateSearchCache();
    } catch (error) {
      console.error("Error handling review added cache invalidation:", error);
    }
  }

  async handleReviewUpdated(eventData) {
    try {
      console.log(`[Cache] Review updated: ${eventData.reviewId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateReviewCache(eventData.productId);
      await this.invalidateRatingCache(eventData.productId);

      // If rating changed significantly, might affect search rankings
      const ratingChange = Math.abs(
        eventData.newRating - eventData.previousRating
      );
      if (ratingChange >= 1) {
        await this.invalidateSearchCache();
      }
    } catch (error) {
      console.error("Error handling review updated cache invalidation:", error);
    }
  }

  async handleReviewDeleted(eventData) {
    try {
      console.log(`[Cache] Review deleted: ${eventData.reviewId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateReviewCache(eventData.productId);
      await this.invalidateRatingCache(eventData.productId);
      await this.invalidateSellerCache(eventData.sellerId);

      // Might affect search rankings
      await this.invalidateSearchCache();
    } catch (error) {
      console.error("Error handling review deleted cache invalidation:", error);
    }
  }

  // Pricing cache handlers
  async handlePriceChanged(eventData) {
    try {
      console.log(`[Cache] Price changed: ${eventData.productId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidatePricingCache(eventData.productId);
      await this.invalidateSearchCache(); // Price filters
      await this.invalidateListingCache();

      if (eventData.variantId) {
        await this.invalidateVariantCache(
          eventData.productId,
          eventData.variantId
        );
      }

      // Might affect recommendations based on price
      await this.invalidateRecommendationCache();
    } catch (error) {
      console.error("Error handling price changed cache invalidation:", error);
    }
  }

  async handleDiscountApplied(eventData) {
    try {
      console.log(`[Cache] Discount applied: ${eventData.productId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidatePricingCache(eventData.productId);
      await this.invalidateSearchCache();
      await this.invalidateListingCache();

      // Discounted products might appear in special listings
      await this.invalidateDiscountCache();

      if (eventData.variantId) {
        await this.invalidateVariantCache(
          eventData.productId,
          eventData.variantId
        );
      }
    } catch (error) {
      console.error(
        "Error handling discount applied cache invalidation:",
        error
      );
    }
  }

  async handleDiscountRemoved(eventData) {
    try {
      console.log(`[Cache] Discount removed: ${eventData.productId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidatePricingCache(eventData.productId);
      await this.invalidateSearchCache();
      await this.invalidateListingCache();
      await this.invalidateDiscountCache();

      if (eventData.variantId) {
        await this.invalidateVariantCache(
          eventData.productId,
          eventData.variantId
        );
      }
    } catch (error) {
      console.error(
        "Error handling discount removed cache invalidation:",
        error
      );
    }
  }

  // Variant cache handlers
  async handleVariantAdded(eventData) {
    try {
      console.log(
        `[Cache] Variant added: ${eventData.variantId} to product: ${eventData.productId}`
      );

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateVariantCache(eventData.productId);
      await this.invalidateStockCache(eventData.productId);
      await this.invalidatePricingCache(eventData.productId);

      // New variant might affect search results
      await this.invalidateSearchCache();
    } catch (error) {
      console.error("Error handling variant added cache invalidation:", error);
    }
  }

  async handleVariantUpdated(eventData) {
    try {
      console.log(`[Cache] Variant updated: ${eventData.variantId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateVariantCache(
        eventData.productId,
        eventData.variantId
      );

      // Check what was updated
      if (eventData.changes.stock !== undefined) {
        await this.invalidateStockCache(eventData.productId);
        await this.invalidateAvailabilityCache();
      }

      if (eventData.changes.price !== undefined) {
        await this.invalidatePricingCache(eventData.productId);
        await this.invalidateSearchCache();
      }
    } catch (error) {
      console.error(
        "Error handling variant updated cache invalidation:",
        error
      );
    }
  }

  async handleVariantDeleted(eventData) {
    try {
      console.log(`[Cache] Variant deleted: ${eventData.variantId}`);

      await this.invalidateProductCache(eventData.productId);
      await this.invalidateVariantCache(eventData.productId);
      await this.invalidateStockCache(eventData.productId);
      await this.invalidatePricingCache(eventData.productId);
      await this.invalidateSearchCache();
    } catch (error) {
      console.error(
        "Error handling variant deleted cache invalidation:",
        error
      );
    }
  }

  // Bulk operation cache handlers
  async handleBulkUpdateCompleted(eventData) {
    try {
      console.log(`[Cache] Bulk update completed: ${eventData.operationId}`);

      // For bulk operations, it's often more efficient to clear broader caches
      await this.invalidateSearchCache();
      await this.invalidateListingCache();
      await this.invalidateSellerCache(eventData.sellerId);

      // If specific products were updated, invalidate their caches
      if (eventData.productIds && eventData.productIds.length > 0) {
        for (const productId of eventData.productIds) {
          await this.invalidateProductCache(productId);
        }
      }

      // If categories were affected
      if (
        eventData.affectedCategories &&
        eventData.affectedCategories.length > 0
      ) {
        for (const categoryId of eventData.affectedCategories) {
          await this.invalidateCategoryCache(categoryId);
        }
      }
    } catch (error) {
      console.error(
        "Error handling bulk update completed cache invalidation:",
        error
      );
    }
  }

  async handleBulkDeleteCompleted(eventData) {
    try {
      console.log(`[Cache] Bulk delete completed: ${eventData.operationId}`);

      // Clear broad caches for bulk delete
      await this.invalidateSearchCache();
      await this.invalidateListingCache();
      await this.invalidateSellerCache(eventData.sellerId);
      await this.invalidateRecommendationCache();

      // If specific products were deleted, invalidate their caches
      if (eventData.productIds && eventData.productIds.length > 0) {
        for (const productId of eventData.productIds) {
          await this.invalidateProductCache(productId);
        }
      }

      // If categories were affected
      if (
        eventData.affectedCategories &&
        eventData.affectedCategories.length > 0
      ) {
        for (const categoryId of eventData.affectedCategories) {
          await this.invalidateCategoryCache(categoryId);
        }
      }
    } catch (error) {
      console.error(
        "Error handling bulk delete completed cache invalidation:",
        error
      );
    }
  }

  // Cache invalidation helper methods
  async invalidateProductCache(productId) {
    console.log(`[Cache Invalidation] Product: ${productId}`);

    // Example cache keys to invalidate:
    const cacheKeys = [
      `product:${productId}`,
      `product:${productId}:details`,
      `product:${productId}:variants`,
      `product:${productId}:reviews`,
      `product:${productId}:related`,
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateCategoryCache(categoryId) {
    console.log(`[Cache Invalidation] Category: ${categoryId}`);

    const cacheKeys = [
      `category:${categoryId}:products`,
      `category:${categoryId}:products:*`, // Wildcard for pagination
      `category:${categoryId}:featured`,
      `category:${categoryId}:bestsellers`,
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateBrandCache(brandId) {
    console.log(`[Cache Invalidation] Brand: ${brandId}`);

    const cacheKeys = [
      `brand:${brandId}:products`,
      `brand:${brandId}:products:*`,
      `brand:${brandId}:featured`,
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateSellerCache(sellerId) {
    console.log(`[Cache Invalidation] Seller: ${sellerId}`);

    const cacheKeys = [
      `seller:${sellerId}:products`,
      `seller:${sellerId}:products:*`,
      `seller:${sellerId}:stats`,
      `seller:${sellerId}:analytics`,
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateSearchCache() {
    console.log(`[Cache Invalidation] Search cache`);

    const cacheKeys = ["search:*", "products:search:*", "filters:*"];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateListingCache() {
    console.log(`[Cache Invalidation] Listing cache`);

    const cacheKeys = [
      "products:list:*",
      "products:featured",
      "products:bestsellers",
      "products:new",
      "products:trending",
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateStockCache(productId) {
    console.log(`[Cache Invalidation] Stock: ${productId}`);

    const cacheKeys = [
      `product:${productId}:stock`,
      `product:${productId}:availability`,
      "products:in_stock",
      "products:low_stock",
      "products:out_of_stock",
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateAvailabilityCache() {
    console.log(`[Cache Invalidation] Availability cache`);

    const cacheKeys = [
      "products:available",
      "products:in_stock",
      "products:out_of_stock",
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidatePricingCache(productId) {
    console.log(`[Cache Invalidation] Pricing: ${productId}`);

    const cacheKeys = [
      `product:${productId}:price`,
      `product:${productId}:pricing`,
      "products:price_ranges",
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateReviewCache(productId) {
    console.log(`[Cache Invalidation] Reviews: ${productId}`);

    const cacheKeys = [
      `product:${productId}:reviews`,
      `product:${productId}:reviews:*`,
      `product:${productId}:rating`,
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateRatingCache(productId) {
    console.log(`[Cache Invalidation] Rating: ${productId}`);

    const cacheKeys = [
      `product:${productId}:rating`,
      `product:${productId}:rating_stats`,
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateVariantCache(productId, variantId = null) {
    console.log(
      `[Cache Invalidation] Variants: ${productId}${
        variantId ? `:${variantId}` : ""
      }`
    );

    const cacheKeys = [`product:${productId}:variants`];

    if (variantId) {
      cacheKeys.push(`product:${productId}:variant:${variantId}`);
    }

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateFeaturedProductsCache() {
    console.log(`[Cache Invalidation] Featured products`);

    const cacheKeys = [
      "products:featured",
      "products:featured:*",
      "homepage:featured",
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateRecommendationCache() {
    console.log(`[Cache Invalidation] Recommendations`);

    const cacheKeys = [
      "recommendations:*",
      "products:related:*",
      "products:similar:*",
      "products:recommended:*",
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateDiscountCache() {
    console.log(`[Cache Invalidation] Discount cache`);

    const cacheKeys = [
      "products:discounted",
      "products:on_sale",
      "discounts:*",
    ];

    await this.invalidateCacheKeys(cacheKeys);
  }

  async invalidateCacheKeys(keys) {
    try {
      // This would integrate with your caching system (Redis, Memcached, etc.)
      console.log(`[Cache] Invalidating keys:`, keys);

      // Example Redis implementation:
      // const redis = require('redis');
      // const client = redis.createClient();
      //
      // for (const key of keys) {
      //   if (key.includes('*')) {
      //     // Handle wildcard keys
      //     const matchingKeys = await client.keys(key);
      //     if (matchingKeys.length > 0) {
      //       await client.del(...matchingKeys);
      //     }
      //   } else {
      //     await client.del(key);
      //   }
      // }
    } catch (error) {
      console.error("Error invalidating cache keys:", error);
    }
  }
}

module.exports = ProductCacheSubscriber;
