const { productEventEmitter, PRODUCT_EVENTS } = require("../product.events");

class ProductNotificationSubscriber {
  constructor() {
    this.eventEmitter = productEventEmitter;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Product lifecycle notifications
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_CREATED,
      this.handleProductCreated.bind(this)
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
      PRODUCT_EVENTS.PRODUCT_DELETED,
      this.handleProductDeleted.bind(this)
    );

    // Stock notifications
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_LOW,
      this.handleStockLow.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_OUT,
      this.handleStockOut.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.STOCK_UPDATED,
      this.handleStockUpdated.bind(this)
    );

    // Review notifications
    this.eventEmitter.on(
      PRODUCT_EVENTS.REVIEW_ADDED,
      this.handleReviewAdded.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.REVIEW_UPDATED,
      this.handleReviewUpdated.bind(this)
    );

    // Pricing notifications
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRICE_CHANGED,
      this.handlePriceChanged.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.DISCOUNT_APPLIED,
      this.handleDiscountApplied.bind(this)
    );

    // Wishlist and cart notifications
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_WISHLISTED,
      this.handleProductWishlisted.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_BACK_IN_STOCK,
      this.handleProductBackInStock.bind(this)
    );

    // Bulk operation notifications
    this.eventEmitter.on(
      PRODUCT_EVENTS.BULK_UPDATE_COMPLETED,
      this.handleBulkUpdateCompleted.bind(this)
    );
    this.eventEmitter.on(
      PRODUCT_EVENTS.BULK_DELETE_COMPLETED,
      this.handleBulkDeleteCompleted.bind(this)
    );
  }

  // Product lifecycle notification handlers
  async handleProductCreated(eventData) {
    try {
      console.log(`[Notification] Product created: ${eventData.productId}`);

      // Notify seller about successful product creation
      await this.sendNotification({
        userId: eventData.sellerId,
        type: "product_created",
        title: "Product Created Successfully",
        message: `Your product "${eventData.productName}" has been created and is pending approval.`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          status: "pending_approval",
        },
        channels: ["in_app", "email"],
      });

      // Notify admins about new product for approval
      await this.sendAdminNotification({
        type: "product_approval_required",
        title: "New Product Requires Approval",
        message: `Product "${eventData.productName}" by seller ${eventData.sellerName} requires approval.`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          sellerId: eventData.sellerId,
          sellerName: eventData.sellerName,
          categoryId: eventData.categoryId,
        },
        channels: ["in_app", "email"],
        priority: "medium",
      });
    } catch (error) {
      console.error("Error handling product created notification:", error);
    }
  }

  async handleProductApproved(eventData) {
    try {
      console.log(`[Notification] Product approved: ${eventData.productId}`);

      // Notify seller about product approval
      await this.sendNotification({
        userId: eventData.sellerId,
        type: "product_approved",
        title: "Product Approved!",
        message: `Great news! Your product "${eventData.productName}" has been approved and is now live.`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          approvedBy: eventData.approvedBy,
          approvedAt: eventData.timestamp,
        },
        channels: ["in_app", "email", "push"],
        priority: "high",
      });

      // Notify users who wishlisted this product (if it was previously out of stock)
      await this.notifyWishlistUsers(eventData.productId, {
        type: "wishlisted_product_available",
        title: "Wishlisted Product Now Available",
        message: `"${eventData.productName}" is now available for purchase!`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
        },
        channels: ["in_app", "push"],
      });
    } catch (error) {
      console.error("Error handling product approved notification:", error);
    }
  }

  async handleProductRejected(eventData) {
    try {
      console.log(`[Notification] Product rejected: ${eventData.productId}`);

      // Notify seller about product rejection
      await this.sendNotification({
        userId: eventData.sellerId,
        type: "product_rejected",
        title: "Product Rejected",
        message: `Your product "${eventData.productName}" was rejected. Reason: ${eventData.reason}`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          rejectedBy: eventData.rejectedBy,
          reason: eventData.reason,
          rejectedAt: eventData.timestamp,
        },
        channels: ["in_app", "email"],
        priority: "high",
      });
    } catch (error) {
      console.error("Error handling product rejected notification:", error);
    }
  }

  async handleProductDeleted(eventData) {
    try {
      console.log(`[Notification] Product deleted: ${eventData.productId}`);

      // Notify seller about product deletion (if not deleted by seller)
      if (eventData.deletedBy !== eventData.sellerId) {
        await this.sendNotification({
          userId: eventData.sellerId,
          type: "product_deleted",
          title: "Product Removed",
          message: `Your product "${eventData.productName}" has been removed. Reason: ${eventData.reason}`,
          data: {
            productId: eventData.productId,
            productName: eventData.productName,
            deletedBy: eventData.deletedBy,
            reason: eventData.reason,
            deletedAt: eventData.timestamp,
          },
          channels: ["in_app", "email"],
          priority: "high",
        });
      }

      // Notify users who had this product in their wishlist or cart
      await this.notifyAffectedUsers(eventData.productId, {
        type: "product_unavailable",
        title: "Product No Longer Available",
        message: `"${eventData.productName}" is no longer available and has been removed from your wishlist/cart.`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
        },
        channels: ["in_app"],
      });
    } catch (error) {
      console.error("Error handling product deleted notification:", error);
    }
  }

  // Stock notification handlers
  async handleStockLow(eventData) {
    try {
      console.log(`[Notification] Low stock alert: ${eventData.productId}`);

      // Notify seller about low stock
      await this.sendNotification({
        userId: eventData.sellerId,
        type: "stock_low",
        title: "Low Stock Alert",
        message: `Your product "${eventData.productName}" is running low on stock (${eventData.currentStock} remaining).`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          variantId: eventData.variantId,
          currentStock: eventData.currentStock,
          threshold: eventData.threshold,
        },
        channels: ["in_app", "email"],
        priority: "medium",
      });
    } catch (error) {
      console.error("Error handling stock low notification:", error);
    }
  }

  async handleStockOut(eventData) {
    try {
      console.log(`[Notification] Stock out alert: ${eventData.productId}`);

      // Notify seller about out of stock
      await this.sendNotification({
        userId: eventData.sellerId,
        type: "stock_out",
        title: "Out of Stock Alert",
        message: `Your product "${eventData.productName}" is now out of stock. Please restock to continue sales.`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          variantId: eventData.variantId,
        },
        channels: ["in_app", "email", "push"],
        priority: "high",
      });

      // Notify users who have this product in their cart
      await this.notifyCartUsers(eventData.productId, eventData.variantId, {
        type: "cart_item_out_of_stock",
        title: "Cart Item Out of Stock",
        message: `"${eventData.productName}" in your cart is currently out of stock.`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          variantId: eventData.variantId,
        },
        channels: ["in_app"],
      });
    } catch (error) {
      console.error("Error handling stock out notification:", error);
    }
  }

  async handleStockUpdated(eventData) {
    try {
      console.log(`[Notification] Stock updated: ${eventData.productId}`);

      // If stock was increased significantly, notify interested users
      if (eventData.stockChange > 0 && eventData.previousStock === 0) {
        // Product is back in stock
        await this.handleProductBackInStock({
          productId: eventData.productId,
          productName: eventData.productName,
          variantId: eventData.variantId,
          newStock: eventData.newStock,
          timestamp: eventData.timestamp,
        });
      }
    } catch (error) {
      console.error("Error handling stock updated notification:", error);
    }
  }

  async handleProductBackInStock(eventData) {
    try {
      console.log(
        `[Notification] Product back in stock: ${eventData.productId}`
      );

      // Notify users who wishlisted this product
      await this.notifyWishlistUsers(eventData.productId, {
        type: "product_back_in_stock",
        title: "Back in Stock!",
        message: `"${eventData.productName}" is back in stock. Get it before it runs out again!`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          variantId: eventData.variantId,
          stock: eventData.newStock,
        },
        channels: ["in_app", "push", "email"],
        priority: "high",
      });

      // Notify users who requested stock notifications
      await this.notifyStockNotificationUsers(eventData.productId, {
        type: "stock_notification",
        title: "Stock Alert",
        message: `"${eventData.productName}" is now available!`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          variantId: eventData.variantId,
        },
        channels: ["in_app", "push", "email"],
      });
    } catch (error) {
      console.error(
        "Error handling product back in stock notification:",
        error
      );
    }
  }

  // Review notification handlers
  async handleReviewAdded(eventData) {
    try {
      console.log(
        `[Notification] Review added: ${eventData.reviewId} for product: ${eventData.productId}`
      );

      // Notify seller about new review
      await this.sendNotification({
        userId: eventData.sellerId,
        type: "review_added",
        title: "New Product Review",
        message: `Your product "${eventData.productName}" received a ${eventData.rating}-star review.`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          reviewId: eventData.reviewId,
          rating: eventData.rating,
          reviewerName: eventData.reviewerName,
          isVerifiedPurchase: eventData.isVerifiedPurchase,
        },
        channels: ["in_app"],
        priority: "low",
      });

      // If it's a low rating (1-2 stars), send high priority notification
      if (eventData.rating <= 2) {
        await this.sendNotification({
          userId: eventData.sellerId,
          type: "low_rating_review",
          title: "Low Rating Alert",
          message: `Your product "${eventData.productName}" received a ${eventData.rating}-star review. Consider reaching out to the customer.`,
          data: {
            productId: eventData.productId,
            productName: eventData.productName,
            reviewId: eventData.reviewId,
            rating: eventData.rating,
          },
          channels: ["in_app", "email"],
          priority: "high",
        });
      }
    } catch (error) {
      console.error("Error handling review added notification:", error);
    }
  }

  async handleReviewUpdated(eventData) {
    try {
      console.log(`[Notification] Review updated: ${eventData.reviewId}`);

      // Notify seller if rating changed significantly
      const ratingChange = Math.abs(
        eventData.newRating - eventData.previousRating
      );
      if (ratingChange >= 2) {
        await this.sendNotification({
          userId: eventData.sellerId,
          type: "review_updated",
          title: "Review Rating Changed",
          message: `A review for "${eventData.productName}" was updated from ${eventData.previousRating} to ${eventData.newRating} stars.`,
          data: {
            productId: eventData.productId,
            productName: eventData.productName,
            reviewId: eventData.reviewId,
            previousRating: eventData.previousRating,
            newRating: eventData.newRating,
          },
          channels: ["in_app"],
          priority: "low",
        });
      }
    } catch (error) {
      console.error("Error handling review updated notification:", error);
    }
  }

  // Pricing notification handlers
  async handlePriceChanged(eventData) {
    try {
      console.log(`[Notification] Price changed: ${eventData.productId}`);

      // Notify users who wishlisted this product about price drop
      if (eventData.priceChange < 0) {
        await this.notifyWishlistUsers(eventData.productId, {
          type: "price_drop",
          title: "Price Drop Alert!",
          message: `"${eventData.productName}" price dropped by ${Math.abs(
            eventData.priceChangePercentage
          )}%!`,
          data: {
            productId: eventData.productId,
            productName: eventData.productName,
            variantId: eventData.variantId,
            previousPrice: eventData.previousPrice,
            newPrice: eventData.newPrice,
            priceChange: eventData.priceChange,
            priceChangePercentage: eventData.priceChangePercentage,
          },
          channels: ["in_app", "push"],
          priority: "medium",
        });
      }
    } catch (error) {
      console.error("Error handling price changed notification:", error);
    }
  }

  async handleDiscountApplied(eventData) {
    try {
      console.log(`[Notification] Discount applied: ${eventData.productId}`);

      // Notify users who wishlisted this product about discount
      await this.notifyWishlistUsers(eventData.productId, {
        type: "discount_applied",
        title: "Discount Alert!",
        message: `"${eventData.productName}" now has ${eventData.discountPercentage}% off!`,
        data: {
          productId: eventData.productId,
          productName: eventData.productName,
          variantId: eventData.variantId,
          discountPercentage: eventData.discountPercentage,
          discountAmount: eventData.discountAmount,
        },
        channels: ["in_app", "push"],
        priority: "medium",
      });
    } catch (error) {
      console.error("Error handling discount applied notification:", error);
    }
  }

  // Wishlist notification handlers
  async handleProductWishlisted(eventData) {
    try {
      console.log(
        `[Notification] Product wishlisted: ${eventData.productId} - ${eventData.action}`
      );

      // Notify seller about wishlist addition (for analytics/engagement)
      if (eventData.action === "added") {
        await this.sendNotification({
          userId: eventData.sellerId,
          type: "product_wishlisted",
          title: "Product Added to Wishlist",
          message: `Your product "${eventData.productName}" was added to a customer's wishlist.`,
          data: {
            productId: eventData.productId,
            productName: eventData.productName,
            userId: eventData.userId,
          },
          channels: ["in_app"],
          priority: "low",
        });
      }
    } catch (error) {
      console.error("Error handling product wishlisted notification:", error);
    }
  }

  // Bulk operation notification handlers
  async handleBulkUpdateCompleted(eventData) {
    try {
      console.log(
        `[Notification] Bulk update completed: ${eventData.operationId}`
      );

      // Notify the user who initiated the bulk operation
      await this.sendNotification({
        userId: eventData.initiatedBy,
        type: "bulk_update_completed",
        title: "Bulk Update Completed",
        message: `Your bulk update operation has been completed. ${eventData.successCount} products updated successfully.`,
        data: {
          operationId: eventData.operationId,
          successCount: eventData.successCount,
          failureCount: eventData.failureCount,
          totalCount: eventData.totalCount,
          failures: eventData.failures,
        },
        channels: ["in_app", "email"],
        priority: "medium",
      });
    } catch (error) {
      console.error(
        "Error handling bulk update completed notification:",
        error
      );
    }
  }

  async handleBulkDeleteCompleted(eventData) {
    try {
      console.log(
        `[Notification] Bulk delete completed: ${eventData.operationId}`
      );

      // Notify the user who initiated the bulk operation
      await this.sendNotification({
        userId: eventData.initiatedBy,
        type: "bulk_delete_completed",
        title: "Bulk Delete Completed",
        message: `Your bulk delete operation has been completed. ${eventData.successCount} products deleted successfully.`,
        data: {
          operationId: eventData.operationId,
          successCount: eventData.successCount,
          failureCount: eventData.failureCount,
          totalCount: eventData.totalCount,
          failures: eventData.failures,
        },
        channels: ["in_app", "email"],
        priority: "medium",
      });
    } catch (error) {
      console.error(
        "Error handling bulk delete completed notification:",
        error
      );
    }
  }

  // Helper methods for sending notifications
  async sendNotification(notificationData) {
    try {
      console.log(
        `[Send Notification] ${notificationData.type} to user ${notificationData.userId}`
      );

      // This would integrate with your notification service
      // Example: await NotificationService.send(notificationData);

      // For now, just log the notification
      console.log(
        "Notification Data:",
        JSON.stringify(notificationData, null, 2)
      );
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  async sendAdminNotification(notificationData) {
    try {
      console.log(`[Send Admin Notification] ${notificationData.type}`);

      // This would send notifications to all admin users
      // Example:
      // const adminUsers = await User.find({ role: 'admin' });
      // for (const admin of adminUsers) {
      //   await this.sendNotification({
      //     ...notificationData,
      //     userId: admin._id,
      //   });
      // }

      console.log(
        "Admin Notification Data:",
        JSON.stringify(notificationData, null, 2)
      );
    } catch (error) {
      console.error("Error sending admin notification:", error);
    }
  }

  async notifyWishlistUsers(productId, notificationData) {
    try {
      console.log(`[Notify Wishlist Users] Product ${productId}`);

      // This would find all users who have this product in their wishlist
      // Example:
      // const wishlistUsers = await User.find({
      //   'wishlist.products': productId
      // }).select('_id');
      //
      // for (const user of wishlistUsers) {
      //   await this.sendNotification({
      //     ...notificationData,
      //     userId: user._id,
      //   });
      // }

      console.log(
        "Wishlist Notification Data:",
        JSON.stringify(notificationData, null, 2)
      );
    } catch (error) {
      console.error("Error notifying wishlist users:", error);
    }
  }

  async notifyCartUsers(productId, variantId, notificationData) {
    try {
      console.log(
        `[Notify Cart Users] Product ${productId}, Variant ${variantId}`
      );

      // This would find all users who have this product/variant in their cart
      // Example:
      // const cartUsers = await User.find({
      //   'cart.items.product': productId,
      //   ...(variantId && { 'cart.items.variant': variantId })
      // }).select('_id');
      //
      // for (const user of cartUsers) {
      //   await this.sendNotification({
      //     ...notificationData,
      //     userId: user._id,
      //   });
      // }

      console.log(
        "Cart Notification Data:",
        JSON.stringify(notificationData, null, 2)
      );
    } catch (error) {
      console.error("Error notifying cart users:", error);
    }
  }

  async notifyAffectedUsers(productId, notificationData) {
    try {
      console.log(`[Notify Affected Users] Product ${productId}`);

      // This would find all users who have this product in wishlist or cart
      // Example:
      // const affectedUsers = await User.find({
      //   $or: [
      //     { 'wishlist.products': productId },
      //     { 'cart.items.product': productId }
      //   ]
      // }).select('_id');
      //
      // for (const user of affectedUsers) {
      //   await this.sendNotification({
      //     ...notificationData,
      //     userId: user._id,
      //   });
      // }

      console.log(
        "Affected Users Notification Data:",
        JSON.stringify(notificationData, null, 2)
      );
    } catch (error) {
      console.error("Error notifying affected users:", error);
    }
  }

  async notifyStockNotificationUsers(productId, notificationData) {
    try {
      console.log(`[Notify Stock Notification Users] Product ${productId}`);

      // This would find all users who requested stock notifications for this product
      // Example:
      // const stockNotificationUsers = await StockNotification.find({
      //   productId
      // }).populate('userId');
      //
      // for (const notification of stockNotificationUsers) {
      //   await this.sendNotification({
      //     ...notificationData,
      //     userId: notification.userId._id,
      //   });
      //
      //   // Remove the stock notification request after sending
      //   await StockNotification.findByIdAndDelete(notification._id);
      // }

      console.log(
        "Stock Notification Data:",
        JSON.stringify(notificationData, null, 2)
      );
    } catch (error) {
      console.error("Error notifying stock notification users:", error);
    }
  }
}

module.exports = ProductNotificationSubscriber;
