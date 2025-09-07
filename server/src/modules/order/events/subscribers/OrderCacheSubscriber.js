const { orderEventEmitter, ORDER_EVENTS } = require("../order.events");

class OrderCacheSubscriber {
  constructor() {
    this.eventEmitter = orderEventEmitter;
    this.isActive = false;
    this.initialize();
  }

  initialize() {
    try {
      // Order lifecycle cache events
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_CREATED,
        this.handleOrderCreated.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_UPDATED,
        this.handleOrderUpdated.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_STATUS_CHANGED,
        this.handleOrderStatusChanged.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_CANCELLED,
        this.handleOrderCancelled.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_DELIVERED,
        this.handleOrderDelivered.bind(this)
      );

      // Payment cache events
      this.eventEmitter.on(
        ORDER_EVENTS.PAYMENT_SUCCESSFUL,
        this.handlePaymentSuccessful.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.PAYMENT_FAILED,
        this.handlePaymentFailed.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.PAYMENT_REFUNDED,
        this.handlePaymentRefunded.bind(this)
      );

      // Return cache events
      this.eventEmitter.on(
        ORDER_EVENTS.RETURN_REQUESTED,
        this.handleReturnRequested.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.RETURN_APPROVED,
        this.handleReturnApproved.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.RETURN_REJECTED,
        this.handleReturnRejected.bind(this)
      );

      // Tracking cache events
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_TRACKING_UPDATED,
        this.handleTrackingUpdated.bind(this)
      );

      // Inventory cache events
      this.eventEmitter.on(
        ORDER_EVENTS.INVENTORY_RESERVED,
        this.handleInventoryReserved.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.INVENTORY_RELEASED,
        this.handleInventoryReleased.bind(this)
      );

      // Bulk operation cache events
      this.eventEmitter.on(
        ORDER_EVENTS.BULK_STATUS_UPDATED,
        this.handleBulkStatusUpdated.bind(this)
      );

      this.isActive = true;
      console.log("OrderCacheSubscriber initialized successfully");
    } catch (error) {
      console.error("Error initializing OrderCacheSubscriber:", error);
    }
  }

  // Order lifecycle cache handlers
  async handleOrderCreated(eventData) {
    try {
      const { orderId, orderNumber, customerId, items } = eventData;

      // Cache the new order
      await this.cacheOrder(orderId, eventData);

      // Update customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Update seller order caches
      const sellerIds = [...new Set(items.map((item) => item.sellerId))];
      for (const sellerId of sellerIds) {
        await this.invalidateSellerOrderCache(sellerId);
      }

      // Update order statistics cache
      await this.invalidateOrderStatisticsCache();

      // Update recent orders cache
      await this.updateRecentOrdersCache(eventData);

      console.log(
        `Order created cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order created cache:", error);
    }
  }

  async handleOrderUpdated(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update cached order
      await this.updateOrderCache(orderId, eventData);

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Invalidate order details cache
      await this.invalidateOrderDetailsCache(orderId);

      console.log(
        `Order updated cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order updated cache:", error);
    }
  }

  async handleOrderStatusChanged(eventData) {
    try {
      const { orderId, orderNumber, customerId, newStatus, oldStatus } =
        eventData;

      // Update order status in cache
      await this.updateOrderStatusCache(orderId, newStatus);

      // Invalidate status-based caches
      await this.invalidateOrdersByStatusCache(oldStatus);
      await this.invalidateOrdersByStatusCache(newStatus);

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Update order statistics cache
      await this.invalidateOrderStatisticsCache();

      console.log(
        `Order status changed cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order status changed cache:", error);
    }
  }

  async handleOrderCancelled(eventData) {
    try {
      const { orderId, orderNumber, customerId, items } = eventData;

      // Update order cache with cancellation data
      await this.updateOrderCache(orderId, {
        ...eventData,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Update seller order caches
      const sellerIds = [...new Set(items.map((item) => item.sellerId))];
      for (const sellerId of sellerIds) {
        await this.invalidateSellerOrderCache(sellerId);
      }

      // Invalidate cancelled orders cache
      await this.invalidateOrdersByStatusCache("cancelled");

      // Update order statistics cache
      await this.invalidateOrderStatisticsCache();

      console.log(
        `Order cancelled cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order cancelled cache:", error);
    }
  }

  async handleOrderDelivered(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update order cache with delivery data
      await this.updateOrderCache(orderId, {
        ...eventData,
        status: "delivered",
        deliveredAt: eventData.deliveredAt || new Date().toISOString(),
      });

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Invalidate delivered orders cache
      await this.invalidateOrdersByStatusCache("delivered");

      // Update order statistics cache
      await this.invalidateOrderStatisticsCache();

      // Cache for review requests (delivered orders eligible for reviews)
      await this.updateReviewEligibleOrdersCache(orderId, eventData);

      console.log(
        `Order delivered cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order delivered cache:", error);
    }
  }

  // Payment cache handlers
  async handlePaymentSuccessful(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update order payment status in cache
      await this.updateOrderPaymentCache(orderId, {
        paymentStatus: "paid",
        paidAt: new Date().toISOString(),
        transactionId: eventData.transactionId,
      });

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Update payment statistics cache
      await this.invalidatePaymentStatisticsCache();

      console.log(
        `Payment successful cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling payment successful cache:", error);
    }
  }

  async handlePaymentFailed(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update order payment status in cache
      await this.updateOrderPaymentCache(orderId, {
        paymentStatus: "failed",
        paymentFailedAt: new Date().toISOString(),
        failureReason: eventData.failureReason,
      });

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Cache failed payment for retry attempts
      await this.cacheFailedPayment(orderId, eventData);

      console.log(
        `Payment failed cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling payment failed cache:", error);
    }
  }

  async handlePaymentRefunded(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update order payment status in cache
      await this.updateOrderPaymentCache(orderId, {
        paymentStatus: "refunded",
        refundedAt: new Date().toISOString(),
        refundAmount: eventData.refundAmount,
        refundReason: eventData.refundReason,
      });

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Update refund statistics cache
      await this.invalidateRefundStatisticsCache();

      console.log(
        `Payment refunded cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling payment refunded cache:", error);
    }
  }

  // Return cache handlers
  async handleReturnRequested(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Cache return request
      await this.cacheReturnRequest(orderId, eventData);

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      // Update return statistics cache
      await this.invalidateReturnStatisticsCache();

      // Cache for admin/seller approval queue
      await this.updateReturnApprovalQueueCache(orderId, eventData);

      console.log(
        `Return requested cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling return requested cache:", error);
    }
  }

  async handleReturnApproved(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update return status in cache
      await this.updateReturnCache(orderId, {
        status: "approved",
        approvedAt: new Date().toISOString(),
        refundAmount: eventData.refundAmount,
      });

      // Remove from approval queue cache
      await this.removeFromReturnApprovalQueueCache(orderId);

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      console.log(
        `Return approved cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling return approved cache:", error);
    }
  }

  async handleReturnRejected(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update return status in cache
      await this.updateReturnCache(orderId, {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        rejectionReason: eventData.rejectionReason,
      });

      // Remove from approval queue cache
      await this.removeFromReturnApprovalQueueCache(orderId);

      // Invalidate customer order cache
      await this.invalidateCustomerOrderCache(customerId);

      console.log(
        `Return rejected cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling return rejected cache:", error);
    }
  }

  // Tracking cache handlers
  async handleTrackingUpdated(eventData) {
    try {
      const { orderId, orderNumber, customerId } = eventData;

      // Update tracking cache
      await this.updateTrackingCache(orderId, eventData);

      // Invalidate customer order cache (includes tracking info)
      await this.invalidateCustomerOrderCache(customerId);

      // Update tracking history cache
      await this.updateTrackingHistoryCache(orderId, eventData);

      console.log(
        `Tracking updated cache operations completed for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling tracking updated cache:", error);
    }
  }

  // Inventory cache handlers
  async handleInventoryReserved(eventData) {
    try {
      const { orderId, items } = eventData;

      // Update product inventory cache
      for (const item of items) {
        await this.invalidateProductInventoryCache(item.productId);
      }

      // Update inventory reservation cache
      await this.updateInventoryReservationCache(orderId, items);

      console.log(
        `Inventory reserved cache operations completed for order ${orderId}`
      );
    } catch (error) {
      console.error("Error handling inventory reserved cache:", error);
    }
  }

  async handleInventoryReleased(eventData) {
    try {
      const { orderId, items } = eventData;

      // Update product inventory cache
      for (const item of items) {
        await this.invalidateProductInventoryCache(item.productId);
      }

      // Remove inventory reservation cache
      await this.removeInventoryReservationCache(orderId);

      console.log(
        `Inventory released cache operations completed for order ${orderId}`
      );
    } catch (error) {
      console.error("Error handling inventory released cache:", error);
    }
  }

  // Bulk operation cache handlers
  async handleBulkStatusUpdated(eventData) {
    try {
      const { orderIds, newStatus, oldStatus } = eventData;

      // Update individual order caches
      for (const orderId of orderIds) {
        await this.updateOrderStatusCache(orderId, newStatus);
      }

      // Invalidate status-based caches
      if (oldStatus) {
        await this.invalidateOrdersByStatusCache(oldStatus);
      }
      await this.invalidateOrdersByStatusCache(newStatus);

      // Invalidate order statistics cache
      await this.invalidateOrderStatisticsCache();

      console.log(
        `Bulk status update cache operations completed for ${orderIds.length} orders`
      );
    } catch (error) {
      console.error("Error handling bulk status update cache:", error);
    }
  }

  // Cache operation methods
  async cacheOrder(orderId, orderData) {
    try {
      const cacheKey = `order:${orderId}`;
      await this.setCache(cacheKey, orderData, 3600); // 1 hour TTL
      console.log(`Cached order ${orderId}`);
    } catch (error) {
      console.error(`Error caching order ${orderId}:`, error);
    }
  }

  async updateOrderCache(orderId, updateData) {
    try {
      const cacheKey = `order:${orderId}`;
      const existingData = await this.getCache(cacheKey);

      if (existingData) {
        const updatedData = { ...existingData, ...updateData };
        await this.setCache(cacheKey, updatedData, 3600);
      }

      console.log(`Updated order cache ${orderId}`);
    } catch (error) {
      console.error(`Error updating order cache ${orderId}:`, error);
    }
  }

  async updateOrderStatusCache(orderId, newStatus) {
    try {
      const cacheKey = `order:${orderId}`;
      const existingData = await this.getCache(cacheKey);

      if (existingData) {
        existingData.status = newStatus;
        existingData.updatedAt = new Date().toISOString();
        await this.setCache(cacheKey, existingData, 3600);
      }

      console.log(`Updated order status cache ${orderId} to ${newStatus}`);
    } catch (error) {
      console.error(`Error updating order status cache ${orderId}:`, error);
    }
  }

  async updateOrderPaymentCache(orderId, paymentData) {
    try {
      const cacheKey = `order:${orderId}`;
      const existingData = await this.getCache(cacheKey);

      if (existingData) {
        existingData.payment = { ...existingData.payment, ...paymentData };
        await this.setCache(cacheKey, existingData, 3600);
      }

      console.log(`Updated order payment cache ${orderId}`);
    } catch (error) {
      console.error(`Error updating order payment cache ${orderId}:`, error);
    }
  }

  async invalidateCustomerOrderCache(customerId) {
    try {
      const patterns = [
        `customer:${customerId}:orders:*`,
        `customer:${customerId}:order_count`,
        `customer:${customerId}:order_stats`,
      ];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log(`Invalidated customer order cache for ${customerId}`);
    } catch (error) {
      console.error(
        `Error invalidating customer order cache ${customerId}:`,
        error
      );
    }
  }

  async invalidateSellerOrderCache(sellerId) {
    try {
      const patterns = [
        `seller:${sellerId}:orders:*`,
        `seller:${sellerId}:order_count`,
        `seller:${sellerId}:order_stats`,
      ];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log(`Invalidated seller order cache for ${sellerId}`);
    } catch (error) {
      console.error(
        `Error invalidating seller order cache ${sellerId}:`,
        error
      );
    }
  }

  async invalidateOrdersByStatusCache(status) {
    try {
      const patterns = [
        `orders:status:${status}:*`,
        `orders:status:${status}:count`,
      ];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log(`Invalidated orders by status cache for ${status}`);
    } catch (error) {
      console.error(
        `Error invalidating orders by status cache ${status}:`,
        error
      );
    }
  }

  async invalidateOrderDetailsCache(orderId) {
    try {
      const cacheKey = `order:${orderId}:details`;
      await this.deleteCache(cacheKey);
      console.log(`Invalidated order details cache ${orderId}`);
    } catch (error) {
      console.error(
        `Error invalidating order details cache ${orderId}:`,
        error
      );
    }
  }

  async invalidateOrderStatisticsCache() {
    try {
      const patterns = [
        "orders:stats:*",
        "orders:analytics:*",
        "orders:dashboard:*",
      ];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log("Invalidated order statistics cache");
    } catch (error) {
      console.error("Error invalidating order statistics cache:", error);
    }
  }

  async invalidatePaymentStatisticsCache() {
    try {
      const patterns = ["payments:stats:*", "payments:analytics:*"];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log("Invalidated payment statistics cache");
    } catch (error) {
      console.error("Error invalidating payment statistics cache:", error);
    }
  }

  async invalidateRefundStatisticsCache() {
    try {
      const patterns = ["refunds:stats:*", "refunds:analytics:*"];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log("Invalidated refund statistics cache");
    } catch (error) {
      console.error("Error invalidating refund statistics cache:", error);
    }
  }

  async invalidateReturnStatisticsCache() {
    try {
      const patterns = ["returns:stats:*", "returns:analytics:*"];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log("Invalidated return statistics cache");
    } catch (error) {
      console.error("Error invalidating return statistics cache:", error);
    }
  }

  async invalidateProductInventoryCache(productId) {
    try {
      const patterns = [
        `product:${productId}:inventory`,
        `product:${productId}:stock`,
        `product:${productId}:availability`,
      ];

      for (const pattern of patterns) {
        await this.deleteCache(pattern);
      }

      console.log(`Invalidated product inventory cache for ${productId}`);
    } catch (error) {
      console.error(
        `Error invalidating product inventory cache ${productId}:`,
        error
      );
    }
  }

  async updateRecentOrdersCache(orderData) {
    try {
      const cacheKey = "orders:recent";
      const recentOrders = (await this.getCache(cacheKey)) || [];

      // Add new order to the beginning
      recentOrders.unshift(orderData);

      // Keep only the last 100 orders
      const trimmedOrders = recentOrders.slice(0, 100);

      await this.setCache(cacheKey, trimmedOrders, 1800); // 30 minutes TTL
      console.log("Updated recent orders cache");
    } catch (error) {
      console.error("Error updating recent orders cache:", error);
    }
  }

  async updateReviewEligibleOrdersCache(orderId, orderData) {
    try {
      const cacheKey = "orders:review_eligible";
      const eligibleOrders = (await this.getCache(cacheKey)) || [];

      eligibleOrders.push({
        orderId,
        customerId: orderData.customerId,
        deliveredAt: orderData.deliveredAt,
        items: orderData.items,
      });

      await this.setCache(cacheKey, eligibleOrders, 7200); // 2 hours TTL
      console.log(`Added order ${orderId} to review eligible cache`);
    } catch (error) {
      console.error(
        `Error updating review eligible orders cache for ${orderId}:`,
        error
      );
    }
  }

  async cacheFailedPayment(orderId, paymentData) {
    try {
      const cacheKey = `payment:failed:${orderId}`;
      await this.setCache(cacheKey, paymentData, 86400); // 24 hours TTL
      console.log(`Cached failed payment for order ${orderId}`);
    } catch (error) {
      console.error(`Error caching failed payment for ${orderId}:`, error);
    }
  }

  async cacheReturnRequest(orderId, returnData) {
    try {
      const cacheKey = `return:${orderId}`;
      await this.setCache(cacheKey, returnData, 7200); // 2 hours TTL
      console.log(`Cached return request for order ${orderId}`);
    } catch (error) {
      console.error(`Error caching return request for ${orderId}:`, error);
    }
  }

  async updateReturnCache(orderId, updateData) {
    try {
      const cacheKey = `return:${orderId}`;
      const existingData = await this.getCache(cacheKey);

      if (existingData) {
        const updatedData = { ...existingData, ...updateData };
        await this.setCache(cacheKey, updatedData, 7200);
      }

      console.log(`Updated return cache for order ${orderId}`);
    } catch (error) {
      console.error(`Error updating return cache for ${orderId}:`, error);
    }
  }

  async updateReturnApprovalQueueCache(orderId, returnData) {
    try {
      const cacheKey = "returns:approval_queue";
      const queue = (await this.getCache(cacheKey)) || [];

      queue.push({
        orderId,
        customerId: returnData.customerId,
        requestedAt: new Date().toISOString(),
        reason: returnData.returnReason,
      });

      await this.setCache(cacheKey, queue, 3600); // 1 hour TTL
      console.log(`Added order ${orderId} to return approval queue cache`);
    } catch (error) {
      console.error(
        `Error updating return approval queue cache for ${orderId}:`,
        error
      );
    }
  }

  async removeFromReturnApprovalQueueCache(orderId) {
    try {
      const cacheKey = "returns:approval_queue";
      const queue = (await this.getCache(cacheKey)) || [];

      const updatedQueue = queue.filter((item) => item.orderId !== orderId);
      await this.setCache(cacheKey, updatedQueue, 3600);

      console.log(`Removed order ${orderId} from return approval queue cache`);
    } catch (error) {
      console.error(
        `Error removing from return approval queue cache for ${orderId}:`,
        error
      );
    }
  }

  async updateTrackingCache(orderId, trackingData) {
    try {
      const cacheKey = `tracking:${orderId}`;
      await this.setCache(cacheKey, trackingData, 1800); // 30 minutes TTL
      console.log(`Updated tracking cache for order ${orderId}`);
    } catch (error) {
      console.error(`Error updating tracking cache for ${orderId}:`, error);
    }
  }

  async updateTrackingHistoryCache(orderId, trackingEvent) {
    try {
      const cacheKey = `tracking:${orderId}:history`;
      const history = (await this.getCache(cacheKey)) || [];

      history.push({
        ...trackingEvent,
        timestamp: new Date().toISOString(),
      });

      await this.setCache(cacheKey, history, 3600); // 1 hour TTL
      console.log(`Updated tracking history cache for order ${orderId}`);
    } catch (error) {
      console.error(
        `Error updating tracking history cache for ${orderId}:`,
        error
      );
    }
  }

  async updateInventoryReservationCache(orderId, items) {
    try {
      const cacheKey = `inventory:reservation:${orderId}`;
      await this.setCache(cacheKey, items, 1800); // 30 minutes TTL
      console.log(`Updated inventory reservation cache for order ${orderId}`);
    } catch (error) {
      console.error(
        `Error updating inventory reservation cache for ${orderId}:`,
        error
      );
    }
  }

  async removeInventoryReservationCache(orderId) {
    try {
      const cacheKey = `inventory:reservation:${orderId}`;
      await this.deleteCache(cacheKey);
      console.log(`Removed inventory reservation cache for order ${orderId}`);
    } catch (error) {
      console.error(
        `Error removing inventory reservation cache for ${orderId}:`,
        error
      );
    }
  }

  // Base cache operations (would integrate with Redis, Memcached, etc.)
  async setCache(key, value, ttl = 3600) {
    try {
      // This would integrate with your cache service
      console.log(`Setting cache: ${key} with TTL ${ttl}`);
      // Redis: await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting cache ${key}:`, error);
      return false;
    }
  }

  async getCache(key) {
    try {
      // This would integrate with your cache service
      console.log(`Getting cache: ${key}`);
      // Redis: const value = await redis.get(key); return value ? JSON.parse(value) : null;
      return null; // Placeholder
    } catch (error) {
      console.error(`Error getting cache ${key}:`, error);
      return null;
    }
  }

  async deleteCache(pattern) {
    try {
      // This would integrate with your cache service
      console.log(`Deleting cache pattern: ${pattern}`);
      // Redis: const keys = await redis.keys(pattern); if (keys.length > 0) await redis.del(...keys);
      return true;
    } catch (error) {
      console.error(`Error deleting cache pattern ${pattern}:`, error);
      return false;
    }
  }

  // Lifecycle methods
  shutdown() {
    try {
      this.eventEmitter.removeAllListeners();
      this.isActive = false;
      console.log("OrderCacheSubscriber shut down successfully");
    } catch (error) {
      console.error("Error shutting down OrderCacheSubscriber:", error);
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      listenerCount: this.eventEmitter.listenerCount(),
    };
  }
}

module.exports = OrderCacheSubscriber;
