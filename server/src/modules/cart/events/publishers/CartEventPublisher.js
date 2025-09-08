const { cartEventEmitter, CART_EVENTS } = require("../cart.events");

class CartEventPublisher {
  constructor() {
    this.eventEmitter = cartEventEmitter;
  }

  // Item management events
  async publishItemAdded(data) {
    try {
      this.eventEmitter.emitItemAdded({
        cartId: data.cartId,
        userId: data.userId,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        price: data.price,
        totalPrice: data.totalPrice,
        productData: {
          name: data.productName,
          sku: data.sku,
          category: data.category,
        },
        metadata: {
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          source: data.source || "web",
        },
      });
    } catch (error) {
      console.error("Error publishing cart item added event:", error);
    }
  }

  async publishItemRemoved(data) {
    try {
      this.eventEmitter.emitItemRemoved({
        cartId: data.cartId,
        userId: data.userId,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        price: data.price,
        totalPrice: data.totalPrice,
        reason: data.reason,
        productData: {
          name: data.productName,
          sku: data.sku,
        },
        metadata: {
          source: data.source || "web",
        },
      });
    } catch (error) {
      console.error("Error publishing cart item removed event:", error);
    }
  }

  async publishItemQuantityUpdated(data) {
    try {
      this.eventEmitter.emitItemQuantityUpdated({
        cartId: data.cartId,
        userId: data.userId,
        productId: data.productId,
        variantId: data.variantId,
        previousQuantity: data.previousQuantity,
        newQuantity: data.newQuantity,
        quantityChange: data.quantityChange,
        price: data.price,
        previousTotalPrice: data.previousTotalPrice,
        newTotalPrice: data.newTotalPrice,
        updatedBy: data.updatedBy,
      });
    } catch (error) {
      console.error(
        "Error publishing cart item quantity updated event:",
        error
      );
    }
  }

  // Cart lifecycle events
  async publishCartCreated(data) {
    try {
      this.eventEmitter.emitCartCreated({
        cartId: data.cartId,
        userId: data.userId,
        sessionId: data.sessionId,
        source: data.source || "web",
        metadata: {
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
        },
      });
    } catch (error) {
      console.error("Error publishing cart created event:", error);
    }
  }

  async publishCartUpdated(data) {
    try {
      this.eventEmitter.emitCartUpdated({
        cartId: data.cartId,
        userId: data.userId,
        changes: data.changes,
        previousValues: data.previousValues,
        updatedBy: data.updatedBy,
        metadata: {
          source: data.source || "web",
          reason: data.reason,
        },
      });
    } catch (error) {
      console.error("Error publishing cart updated event:", error);
    }
  }

  async publishCartCleared(data) {
    try {
      this.eventEmitter.emitCartCleared({
        cartId: data.cartId,
        userId: data.userId,
        itemCount: data.itemCount,
        totalValue: data.totalValue,
        clearedBy: data.clearedBy,
        reason: data.reason,
        cartData: {
          items: data.items,
          coupons: data.coupons,
        },
      });
    } catch (error) {
      console.error("Error publishing cart cleared event:", error);
    }
  }

  async publishCartSynchronized(data) {
    try {
      this.eventEmitter.emitCartSynchronized({
        cartId: data.cartId,
        userId: data.userId,
        syncType: data.syncType, // "merge", "overwrite", "validate"
        changes: data.changes,
        conflicts: data.conflicts,
        resolvedConflicts: data.resolvedConflicts,
      });
    } catch (error) {
      console.error("Error publishing cart synchronized event:", error);
    }
  }

  // Cart behavior events
  async publishCartAbandoned(data) {
    try {
      this.eventEmitter.emitCartAbandoned({
        cartId: data.cartId,
        userId: data.userId,
        sessionId: data.sessionId,
        itemCount: data.itemCount,
        totalValue: data.totalValue,
        lastActivity: data.lastActivity,
        abandonmentDuration: data.abandonmentDuration,
        cartData: {
          items: data.items,
          coupons: data.coupons,
        },
      });
    } catch (error) {
      console.error("Error publishing cart abandoned event:", error);
    }
  }

  async publishCartRecovered(data) {
    try {
      this.eventEmitter.emitCartRecovered({
        cartId: data.cartId,
        userId: data.userId,
        recoveryMethod: data.recoveryMethod, // "email", "notification", "manual"
        recoverySource: data.recoverySource,
        abandonmentDuration: data.abandonmentDuration,
        itemCount: data.itemCount,
        totalValue: data.totalValue,
      });
    } catch (error) {
      console.error("Error publishing cart recovered event:", error);
    }
  }

  async publishCheckoutInitiated(data) {
    try {
      this.eventEmitter.emitCheckoutInitiated({
        cartId: data.cartId,
        userId: data.userId,
        sessionId: data.sessionId,
        itemCount: data.itemCount,
        totalValue: data.totalValue,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        cartData: {
          items: data.items,
          coupons: data.coupons,
        },
      });
    } catch (error) {
      console.error("Error publishing checkout initiated event:", error);
    }
  }

  // Coupon events
  async publishCouponApplied(data) {
    try {
      this.eventEmitter.emitCouponApplied({
        cartId: data.cartId,
        userId: data.userId,
        couponId: data.couponId,
        couponCode: data.couponCode,
        discountType: data.discountType,
        discountAmount: data.discountAmount,
        discountPercentage: data.discountPercentage,
        previousTotal: data.previousTotal,
        newTotal: data.newTotal,
        appliedBy: data.appliedBy,
      });
    } catch (error) {
      console.error("Error publishing coupon applied event:", error);
    }
  }

  async publishCouponRemoved(data) {
    try {
      this.eventEmitter.emitCouponRemoved({
        cartId: data.cartId,
        userId: data.userId,
        couponId: data.couponId,
        couponCode: data.couponCode,
        previousDiscountAmount: data.previousDiscountAmount,
        previousTotal: data.previousTotal,
        newTotal: data.newTotal,
        removedBy: data.removedBy,
        reason: data.reason,
      });
    } catch (error) {
      console.error("Error publishing coupon removed event:", error);
    }
  }

  async publishCouponExpired(data) {
    try {
      this.eventEmitter.emitCouponExpired({
        cartId: data.cartId,
        userId: data.userId,
        couponId: data.couponId,
        couponCode: data.couponCode,
        expiredAt: data.expiredAt,
        discountAmount: data.discountAmount,
        autoRemoved: data.autoRemoved,
      });
    } catch (error) {
      console.error("Error publishing coupon expired event:", error);
    }
  }

  // Analytics events
  async publishCartValueChanged(data) {
    try {
      this.eventEmitter.emitCartValueChanged({
        cartId: data.cartId,
        userId: data.userId,
        previousValue: data.previousValue,
        newValue: data.newValue,
        valueChange: data.valueChange,
        valueChangePercentage: data.valueChangePercentage,
        changeReason: data.changeReason,
        itemCount: data.itemCount,
      });
    } catch (error) {
      console.error("Error publishing cart value changed event:", error);
    }
  }

  async publishCartItemsCountChanged(data) {
    try {
      this.eventEmitter.emitCartItemsCountChanged({
        cartId: data.cartId,
        userId: data.userId,
        previousCount: data.previousCount,
        newCount: data.newCount,
        countChange: data.countChange,
        changeReason: data.changeReason,
        totalValue: data.totalValue,
      });
    } catch (error) {
      console.error("Error publishing cart items count changed event:", error);
    }
  }
}

module.exports = CartEventPublisher;
