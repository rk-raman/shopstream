const { productEventEmitter, PRODUCT_EVENTS } = require("../product.events");

class ProductEventPublisher {
  constructor() {
    this.eventEmitter = productEventEmitter;
  }

  // Product lifecycle events
  async publishProductCreated(data) {
    try {
      this.eventEmitter.emitProductCreated({
        productId: data.productId,
        sellerId: data.sellerId,
        categoryId: data.categoryId,
        brandId: data.brandId,
        name: data.name,
        price: data.price,
        stock: data.stock,
        sku: data.sku,
        status: data.status || "draft",
        metadata: {
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          source: data.source || "web",
        },
      });
    } catch (error) {
      console.error("Error publishing product created event:", error);
    }
  }

  async publishProductUpdated(data) {
    try {
      this.eventEmitter.emitProductUpdated({
        productId: data.productId,
        sellerId: data.sellerId,
        changes: data.changes,
        updatedBy: data.updatedBy,
        previousValues: data.previousValues,
        metadata: {
          source: data.source || "web",
          reason: data.reason,
        },
      });
    } catch (error) {
      console.error("Error publishing product updated event:", error);
    }
  }

  async publishProductDeleted(data) {
    try {
      this.eventEmitter.emitProductDeleted({
        productId: data.productId,
        sellerId: data.sellerId,
        deletedBy: data.deletedBy,
        reason: data.reason,
        productData: {
          name: data.name,
          sku: data.sku,
          category: data.category,
        },
      });
    } catch (error) {
      console.error("Error publishing product deleted event:", error);
    }
  }

  async publishProductApproved(data) {
    try {
      this.eventEmitter.emitProductApproved({
        productId: data.productId,
        sellerId: data.sellerId,
        approvedBy: data.approvedBy,
        previousStatus: data.previousStatus,
        productData: {
          name: data.name,
          category: data.category,
          price: data.price,
        },
      });
    } catch (error) {
      console.error("Error publishing product approved event:", error);
    }
  }

  async publishProductRejected(data) {
    try {
      this.eventEmitter.emitProductRejected({
        productId: data.productId,
        sellerId: data.sellerId,
        rejectedBy: data.rejectedBy,
        reason: data.reason,
        previousStatus: data.previousStatus,
        productData: {
          name: data.name,
          category: data.category,
        },
      });
    } catch (error) {
      console.error("Error publishing product rejected event:", error);
    }
  }

  async publishProductViewed(data) {
    try {
      this.eventEmitter.emitProductViewed({
        productId: data.productId,
        userId: data.userId,
        sessionId: data.sessionId,
        categoryId: data.categoryId,
        sellerId: data.sellerId,
        viewSource: data.viewSource || "web",
        referrer: data.referrer,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      });
    } catch (error) {
      console.error("Error publishing product viewed event:", error);
    }
  }

  // Stock events
  async publishStockUpdated(data) {
    try {
      this.eventEmitter.emitStockUpdated({
        productId: data.productId,
        variantId: data.variantId,
        previousStock: data.previousStock,
        newStock: data.newStock,
        stockChange: data.stockChange,
        reason: data.reason,
        updatedBy: data.updatedBy,
        source: data.source || "manual",
      });

      // Check for low stock or out of stock conditions
      if (data.newStock <= data.lowStockThreshold && data.newStock > 0) {
        await this.publishStockLow({
          productId: data.productId,
          variantId: data.variantId,
          currentStock: data.newStock,
          threshold: data.lowStockThreshold,
        });
      } else if (data.newStock === 0) {
        await this.publishStockOut({
          productId: data.productId,
          variantId: data.variantId,
        });
      }
    } catch (error) {
      console.error("Error publishing stock updated event:", error);
    }
  }

  async publishStockLow(data) {
    try {
      this.eventEmitter.emitStockLow({
        productId: data.productId,
        variantId: data.variantId,
        currentStock: data.currentStock,
        threshold: data.threshold,
        sellerId: data.sellerId,
        productName: data.productName,
        sku: data.sku,
      });
    } catch (error) {
      console.error("Error publishing stock low event:", error);
    }
  }

  async publishStockOut(data) {
    try {
      this.eventEmitter.emitStockOut({
        productId: data.productId,
        variantId: data.variantId,
        sellerId: data.sellerId,
        productName: data.productName,
        sku: data.sku,
        lastStockUpdate: data.lastStockUpdate,
      });
    } catch (error) {
      console.error("Error publishing stock out event:", error);
    }
  }

  // Review events
  async publishReviewAdded(data) {
    try {
      this.eventEmitter.emitReviewAdded({
        productId: data.productId,
        reviewId: data.reviewId,
        userId: data.userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        variantId: data.variantId,
        isVerifiedPurchase: data.isVerifiedPurchase,
        sellerId: data.sellerId,
      });
    } catch (error) {
      console.error("Error publishing review added event:", error);
    }
  }

  async publishReviewUpdated(data) {
    try {
      this.eventEmitter.emitReviewUpdated({
        productId: data.productId,
        reviewId: data.reviewId,
        userId: data.userId,
        changes: data.changes,
        previousRating: data.previousRating,
        newRating: data.newRating,
      });
    } catch (error) {
      console.error("Error publishing review updated event:", error);
    }
  }

  async publishReviewDeleted(data) {
    try {
      this.eventEmitter.emitReviewDeleted({
        productId: data.productId,
        reviewId: data.reviewId,
        userId: data.userId,
        deletedBy: data.deletedBy,
        reason: data.reason,
        rating: data.rating,
      });
    } catch (error) {
      console.error("Error publishing review deleted event:", error);
    }
  }

  // Pricing events
  async publishPriceChanged(data) {
    try {
      this.eventEmitter.emitPriceChanged({
        productId: data.productId,
        variantId: data.variantId,
        previousPrice: data.previousPrice,
        newPrice: data.newPrice,
        priceChange: data.priceChange,
        priceChangePercentage: data.priceChangePercentage,
        changedBy: data.changedBy,
        reason: data.reason,
        effectiveDate: data.effectiveDate,
      });
    } catch (error) {
      console.error("Error publishing price changed event:", error);
    }
  }

  async publishDiscountApplied(data) {
    try {
      this.eventEmitter.emitDiscountApplied({
        productId: data.productId,
        variantId: data.variantId,
        originalPrice: data.originalPrice,
        discountPrice: data.discountPrice,
        discountAmount: data.discountAmount,
        discountPercentage: data.discountPercentage,
        discountType: data.discountType,
        appliedBy: data.appliedBy,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
      });
    } catch (error) {
      console.error("Error publishing discount applied event:", error);
    }
  }

  async publishDiscountRemoved(data) {
    try {
      this.eventEmitter.emitDiscountRemoved({
        productId: data.productId,
        variantId: data.variantId,
        previousDiscountPrice: data.previousDiscountPrice,
        currentPrice: data.currentPrice,
        removedBy: data.removedBy,
        reason: data.reason,
      });
    } catch (error) {
      console.error("Error publishing discount removed event:", error);
    }
  }

  // Variant events
  async publishVariantAdded(data) {
    try {
      this.eventEmitter.emitVariantAdded({
        productId: data.productId,
        variantId: data.variantId,
        variantData: {
          name: data.name,
          value: data.value,
          price: data.price,
          stock: data.stock,
          sku: data.sku,
        },
        addedBy: data.addedBy,
      });
    } catch (error) {
      console.error("Error publishing variant added event:", error);
    }
  }

  async publishVariantUpdated(data) {
    try {
      this.eventEmitter.emitVariantUpdated({
        productId: data.productId,
        variantId: data.variantId,
        changes: data.changes,
        updatedBy: data.updatedBy,
        previousValues: data.previousValues,
      });
    } catch (error) {
      console.error("Error publishing variant updated event:", error);
    }
  }

  async publishVariantDeleted(data) {
    try {
      this.eventEmitter.emitVariantDeleted({
        productId: data.productId,
        variantId: data.variantId,
        deletedBy: data.deletedBy,
        variantData: data.variantData,
        reason: data.reason,
      });
    } catch (error) {
      console.error("Error publishing variant deleted event:", error);
    }
  }

  // Bulk operations
  async publishBulkUpdated(data) {
    try {
      this.eventEmitter.emitBulkUpdated({
        productIds: data.productIds,
        operation: data.operation,
        updateData: data.updateData,
        modifiedCount: data.modifiedCount,
        performedBy: data.performedBy,
        reason: data.reason,
      });
    } catch (error) {
      console.error("Error publishing bulk updated event:", error);
    }
  }

  async publishBulkDeleted(data) {
    try {
      this.eventEmitter.emitBulkDeleted({
        productIds: data.productIds,
        deletedCount: data.deletedCount,
        performedBy: data.performedBy,
        reason: data.reason,
      });
    } catch (error) {
      console.error("Error publishing bulk deleted event:", error);
    }
  }

  // Analytics events
  async publishProductSearched(data) {
    try {
      this.eventEmitter.emitProductSearched({
        searchQuery: data.searchQuery,
        filters: data.filters,
        resultsCount: data.resultsCount,
        userId: data.userId,
        sessionId: data.sessionId,
        searchSource: data.searchSource || "web",
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      });
    } catch (error) {
      console.error("Error publishing product searched event:", error);
    }
  }

  async publishProductWishlisted(data) {
    try {
      this.eventEmitter.emitProductWishlisted({
        productId: data.productId,
        userId: data.userId,
        action: data.action, // "added" or "removed"
        categoryId: data.categoryId,
        sellerId: data.sellerId,
        productPrice: data.productPrice,
        source: data.source || "web",
      });
    } catch (error) {
      console.error("Error publishing product wishlisted event:", error);
    }
  }

  async publishProductCartAdded(data) {
    try {
      this.eventEmitter.emitProductCartAdded({
        productId: data.productId,
        variantId: data.variantId,
        userId: data.userId,
        quantity: data.quantity,
        price: data.price,
        categoryId: data.categoryId,
        sellerId: data.sellerId,
        source: data.source || "web",
      });
    } catch (error) {
      console.error("Error publishing product cart added event:", error);
    }
  }

  // Category events (lightweight publisher to support category service)
  async publishCategoryCreated(data) {
    try {
      // Emit a generic event name; can be wired to dedicated subscribers
      this.eventEmitter.emit("category.created", {
        ...data,
        timestamp: new Date(),
        eventType: "category.created",
      });
    } catch (error) {
      console.error("Error publishing category created event:", error);
    }
  }

  async publishCategoryUpdated(data) {
    try {
      this.eventEmitter.emit("category.updated", {
        ...data,
        timestamp: new Date(),
        eventType: "category.updated",
      });
    } catch (error) {
      console.error("Error publishing category updated event:", error);
    }
  }

  async publishCategoryDeleted(data) {
    try {
      this.eventEmitter.emit("category.deleted", {
        ...data,
        timestamp: new Date(),
        eventType: "category.deleted",
      });
    } catch (error) {
      console.error("Error publishing category deleted event:", error);
    }
  }

  async publishCategoryBulkUpdated(data) {
    try {
      this.eventEmitter.emit("categories.bulk.updated", {
        ...data,
        timestamp: new Date(),
        eventType: "categories.bulk.updated",
      });
    } catch (error) {
      console.error("Error publishing categories bulk updated event:", error);
    }
  }
}

module.exports = ProductEventPublisher;
