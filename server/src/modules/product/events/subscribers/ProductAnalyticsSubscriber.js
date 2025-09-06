const { productEventEmitter, PRODUCT_EVENTS } = require("../product.events");

class ProductAnalyticsSubscriber {
  constructor() {
    this.eventEmitter = productEventEmitter;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Product lifecycle analytics
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
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_VIEWED,
      this.handleProductViewed.bind(this)
    );

    // Stock analytics
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

    // Review analytics
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

    // Pricing analytics
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

    // Search and interaction analytics
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_SEARCHED,
      this.handleProductSearched.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_WISHLISTED,
      this.handleProductWishlisted.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_CART_ADDED,
      this.handleProductCartAdded.bind(this)
    );
  }

  // Product lifecycle analytics handlers
  async handleProductCreated(eventData) {
    try {
      console.log(`[Analytics] Product created: ${eventData.productId}`);

      // Track product creation metrics
      await this.trackMetric("product.created", {
        productId: eventData.productId,
        sellerId: eventData.sellerId,
        categoryId: eventData.categoryId,
        brandId: eventData.brandId,
        price: eventData.price,
        stock: eventData.stock,
        timestamp: eventData.timestamp,
        metadata: eventData.metadata,
      });

      // Update seller analytics
      await this.updateSellerMetrics(eventData.sellerId, "products_created", 1);

      // Update category analytics
      await this.updateCategoryMetrics(
        eventData.categoryId,
        "products_added",
        1
      );
    } catch (error) {
      console.error("Error handling product created analytics:", error);
    }
  }

  async handleProductUpdated(eventData) {
    try {
      console.log(`[Analytics] Product updated: ${eventData.productId}`);

      await this.trackMetric("product.updated", {
        productId: eventData.productId,
        sellerId: eventData.sellerId,
        changes: Object.keys(eventData.changes),
        timestamp: eventData.timestamp,
      });

      // Track specific field updates
      if (eventData.changes.basePrice) {
        await this.trackMetric("product.price_updated", {
          productId: eventData.productId,
          oldPrice: eventData.previousValues?.basePrice,
          newPrice: eventData.changes.basePrice,
          timestamp: eventData.timestamp,
        });
      }
    } catch (error) {
      console.error("Error handling product updated analytics:", error);
    }
  }

  async handleProductDeleted(eventData) {
    try {
      console.log(`[Analytics] Product deleted: ${eventData.productId}`);

      await this.trackMetric("product.deleted", {
        productId: eventData.productId,
        sellerId: eventData.sellerId,
        reason: eventData.reason,
        timestamp: eventData.timestamp,
      });

      // Update seller analytics
      await this.updateSellerMetrics(eventData.sellerId, "products_deleted", 1);
    } catch (error) {
      console.error("Error handling product deleted analytics:", error);
    }
  }

  async handleProductApproved(eventData) {
    try {
      console.log(`[Analytics] Product approved: ${eventData.productId}`);

      await this.trackMetric("product.approved", {
        productId: eventData.productId,
        sellerId: eventData.sellerId,
        approvedBy: eventData.approvedBy,
        timestamp: eventData.timestamp,
      });

      // Update seller analytics
      await this.updateSellerMetrics(
        eventData.sellerId,
        "products_approved",
        1
      );
    } catch (error) {
      console.error("Error handling product approved analytics:", error);
    }
  }

  async handleProductRejected(eventData) {
    try {
      console.log(`[Analytics] Product rejected: ${eventData.productId}`);

      await this.trackMetric("product.rejected", {
        productId: eventData.productId,
        sellerId: eventData.sellerId,
        rejectedBy: eventData.rejectedBy,
        reason: eventData.reason,
        timestamp: eventData.timestamp,
      });

      // Update seller analytics
      await this.updateSellerMetrics(
        eventData.sellerId,
        "products_rejected",
        1
      );
    } catch (error) {
      console.error("Error handling product rejected analytics:", error);
    }
  }

  async handleProductViewed(eventData) {
    try {
      console.log(`[Analytics] Product viewed: ${eventData.productId}`);

      await this.trackMetric("product.viewed", {
        productId: eventData.productId,
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        categoryId: eventData.categoryId,
        sellerId: eventData.sellerId,
        viewSource: eventData.viewSource,
        timestamp: eventData.timestamp,
      });

      // Update product view count (handled in model, but track for analytics)
      await this.updateProductMetrics(eventData.productId, "views", 1);

      // Track hourly view patterns
      await this.trackHourlyMetric("product_views", eventData.timestamp);
    } catch (error) {
      console.error("Error handling product viewed analytics:", error);
    }
  }

  // Stock analytics handlers
  async handleStockUpdated(eventData) {
    try {
      console.log(`[Analytics] Stock updated: ${eventData.productId}`);

      await this.trackMetric("stock.updated", {
        productId: eventData.productId,
        variantId: eventData.variantId,
        previousStock: eventData.previousStock,
        newStock: eventData.newStock,
        stockChange: eventData.stockChange,
        reason: eventData.reason,
        timestamp: eventData.timestamp,
      });
    } catch (error) {
      console.error("Error handling stock updated analytics:", error);
    }
  }

  async handleStockLow(eventData) {
    try {
      console.log(`[Analytics] Low stock alert: ${eventData.productId}`);

      await this.trackMetric("stock.low", {
        productId: eventData.productId,
        variantId: eventData.variantId,
        currentStock: eventData.currentStock,
        threshold: eventData.threshold,
        timestamp: eventData.timestamp,
      });

      // Update low stock alerts count
      await this.updateSellerMetrics(eventData.sellerId, "low_stock_alerts", 1);
    } catch (error) {
      console.error("Error handling stock low analytics:", error);
    }
  }

  async handleStockOut(eventData) {
    try {
      console.log(`[Analytics] Stock out: ${eventData.productId}`);

      await this.trackMetric("stock.out", {
        productId: eventData.productId,
        variantId: eventData.variantId,
        sellerId: eventData.sellerId,
        timestamp: eventData.timestamp,
      });

      // Update out of stock count
      await this.updateSellerMetrics(
        eventData.sellerId,
        "out_of_stock_products",
        1
      );
    } catch (error) {
      console.error("Error handling stock out analytics:", error);
    }
  }

  // Review analytics handlers
  async handleReviewAdded(eventData) {
    try {
      console.log(
        `[Analytics] Review added: ${eventData.reviewId} for product: ${eventData.productId}`
      );

      await this.trackMetric("review.added", {
        productId: eventData.productId,
        reviewId: eventData.reviewId,
        userId: eventData.userId,
        rating: eventData.rating,
        isVerifiedPurchase: eventData.isVerifiedPurchase,
        timestamp: eventData.timestamp,
      });

      // Update product review metrics
      await this.updateProductMetrics(eventData.productId, "reviews", 1);
      await this.updateProductMetrics(
        eventData.productId,
        "total_rating",
        eventData.rating
      );

      // Update seller review metrics
      await this.updateSellerMetrics(eventData.sellerId, "reviews_received", 1);
    } catch (error) {
      console.error("Error handling review added analytics:", error);
    }
  }

  async handleReviewUpdated(eventData) {
    try {
      console.log(`[Analytics] Review updated: ${eventData.reviewId}`);

      await this.trackMetric("review.updated", {
        productId: eventData.productId,
        reviewId: eventData.reviewId,
        userId: eventData.userId,
        previousRating: eventData.previousRating,
        newRating: eventData.newRating,
        timestamp: eventData.timestamp,
      });
    } catch (error) {
      console.error("Error handling review updated analytics:", error);
    }
  }

  async handleReviewDeleted(eventData) {
    try {
      console.log(`[Analytics] Review deleted: ${eventData.reviewId}`);

      await this.trackMetric("review.deleted", {
        productId: eventData.productId,
        reviewId: eventData.reviewId,
        userId: eventData.userId,
        deletedBy: eventData.deletedBy,
        reason: eventData.reason,
        timestamp: eventData.timestamp,
      });
    } catch (error) {
      console.error("Error handling review deleted analytics:", error);
    }
  }

  // Pricing analytics handlers
  async handlePriceChanged(eventData) {
    try {
      console.log(`[Analytics] Price changed: ${eventData.productId}`);

      await this.trackMetric("price.changed", {
        productId: eventData.productId,
        variantId: eventData.variantId,
        previousPrice: eventData.previousPrice,
        newPrice: eventData.newPrice,
        priceChange: eventData.priceChange,
        priceChangePercentage: eventData.priceChangePercentage,
        timestamp: eventData.timestamp,
      });
    } catch (error) {
      console.error("Error handling price changed analytics:", error);
    }
  }

  async handleDiscountApplied(eventData) {
    try {
      console.log(`[Analytics] Discount applied: ${eventData.productId}`);

      await this.trackMetric("discount.applied", {
        productId: eventData.productId,
        variantId: eventData.variantId,
        discountPercentage: eventData.discountPercentage,
        discountAmount: eventData.discountAmount,
        timestamp: eventData.timestamp,
      });
    } catch (error) {
      console.error("Error handling discount applied analytics:", error);
    }
  }

  async handleDiscountRemoved(eventData) {
    try {
      console.log(`[Analytics] Discount removed: ${eventData.productId}`);

      await this.trackMetric("discount.removed", {
        productId: eventData.productId,
        variantId: eventData.variantId,
        previousDiscountPrice: eventData.previousDiscountPrice,
        currentPrice: eventData.currentPrice,
        timestamp: eventData.timestamp,
      });
    } catch (error) {
      console.error("Error handling discount removed analytics:", error);
    }
  }

  // Search and interaction analytics handlers
  async handleProductSearched(eventData) {
    try {
      console.log(`[Analytics] Product searched: "${eventData.searchQuery}"`);

      await this.trackMetric("product.searched", {
        searchQuery: eventData.searchQuery,
        filters: eventData.filters,
        resultsCount: eventData.resultsCount,
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        timestamp: eventData.timestamp,
      });

      // Track popular search terms
      await this.trackSearchTerm(eventData.searchQuery, eventData.resultsCount);
    } catch (error) {
      console.error("Error handling product searched analytics:", error);
    }
  }

  async handleProductWishlisted(eventData) {
    try {
      console.log(
        `[Analytics] Product wishlisted: ${eventData.productId} - ${eventData.action}`
      );

      await this.trackMetric("product.wishlisted", {
        productId: eventData.productId,
        userId: eventData.userId,
        action: eventData.action,
        categoryId: eventData.categoryId,
        sellerId: eventData.sellerId,
        timestamp: eventData.timestamp,
      });

      // Update product wishlist metrics
      const increment = eventData.action === "added" ? 1 : -1;
      await this.updateProductMetrics(
        eventData.productId,
        "wishlist_count",
        increment
      );
    } catch (error) {
      console.error("Error handling product wishlisted analytics:", error);
    }
  }

  async handleProductCartAdded(eventData) {
    try {
      console.log(`[Analytics] Product added to cart: ${eventData.productId}`);

      await this.trackMetric("product.cart_added", {
        productId: eventData.productId,
        variantId: eventData.variantId,
        userId: eventData.userId,
        quantity: eventData.quantity,
        price: eventData.price,
        categoryId: eventData.categoryId,
        sellerId: eventData.sellerId,
        timestamp: eventData.timestamp,
      });

      // Update product cart metrics
      await this.updateProductMetrics(eventData.productId, "cart_additions", 1);
    } catch (error) {
      console.error("Error handling product cart added analytics:", error);
    }
  }

  // Helper methods for analytics tracking
  async trackMetric(eventType, data) {
    // This would typically send data to an analytics service like Google Analytics,
    // Mixpanel, or a custom analytics database
    console.log(`[Metric] ${eventType}:`, data);

    // Example: Store in analytics database
    // await AnalyticsModel.create({
    //   eventType,
    //   data,
    //   timestamp: new Date(),
    // });
  }

  async updateSellerMetrics(sellerId, metric, increment) {
    console.log(`[Seller Metrics] ${sellerId} - ${metric}: +${increment}`);

    // Example: Update seller analytics
    // await SellerAnalytics.findOneAndUpdate(
    //   { sellerId },
    //   { $inc: { [metric]: increment } },
    //   { upsert: true }
    // );
  }

  async updateProductMetrics(productId, metric, increment) {
    console.log(`[Product Metrics] ${productId} - ${metric}: +${increment}`);

    // Example: Update product analytics
    // await ProductAnalytics.findOneAndUpdate(
    //   { productId },
    //   { $inc: { [metric]: increment } },
    //   { upsert: true }
    // );
  }

  async updateCategoryMetrics(categoryId, metric, increment) {
    console.log(`[Category Metrics] ${categoryId} - ${metric}: +${increment}`);

    // Example: Update category analytics
    // await CategoryAnalytics.findOneAndUpdate(
    //   { categoryId },
    //   { $inc: { [metric]: increment } },
    //   { upsert: true }
    // );
  }

  async trackHourlyMetric(metric, timestamp) {
    const hour = new Date(timestamp).getHours();
    console.log(`[Hourly Metrics] ${metric} at hour ${hour}`);

    // Example: Track hourly patterns
    // await HourlyAnalytics.findOneAndUpdate(
    //   {
    //     date: new Date(timestamp).toDateString(),
    //     hour,
    //     metric
    //   },
    //   { $inc: { count: 1 } },
    //   { upsert: true }
    // );
  }

  async trackSearchTerm(searchQuery, resultsCount) {
    console.log(
      `[Search Analytics] "${searchQuery}" - ${resultsCount} results`
    );

    // Example: Track popular search terms
    // await SearchAnalytics.findOneAndUpdate(
    //   { searchQuery: searchQuery.toLowerCase() },
    //   {
    //     $inc: { searchCount: 1 },
    //     $set: { lastSearched: new Date() },
    //     $push: { resultsCounts: resultsCount }
    //   },
    //   { upsert: true }
    // );
  }
}

module.exports = ProductAnalyticsSubscriber;
