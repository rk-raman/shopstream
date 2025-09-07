const { orderEventEmitter, ORDER_EVENTS } = require("../order.events");

class OrderAnalyticsSubscriber {
  constructor() {
    this.eventEmitter = orderEventEmitter;
    this.isActive = false;
    this.initialize();
  }

  initialize() {
    try {
      // Order lifecycle analytics
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_CREATED,
        this.handleOrderCreated.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_CONFIRMED,
        this.handleOrderConfirmed.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_SHIPPED,
        this.handleOrderShipped.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_DELIVERED,
        this.handleOrderDelivered.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_CANCELLED,
        this.handleOrderCancelled.bind(this)
      );

      // Payment analytics
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

      // Return analytics
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

      // Inventory analytics
      this.eventEmitter.on(
        ORDER_EVENTS.INVENTORY_RESERVED,
        this.handleInventoryReserved.bind(this)
      );
      this.eventEmitter.on(
        ORDER_EVENTS.INVENTORY_RELEASED,
        this.handleInventoryReleased.bind(this)
      );

      // Bulk operation analytics
      this.eventEmitter.on(
        ORDER_EVENTS.BULK_STATUS_UPDATED,
        this.handleBulkStatusUpdated.bind(this)
      );

      this.isActive = true;
      console.log("OrderAnalyticsSubscriber initialized successfully");
    } catch (error) {
      console.error("Error initializing OrderAnalyticsSubscriber:", error);
    }
  }

  // Order lifecycle analytics handlers
  async handleOrderCreated(eventData) {
    try {
      const {
        orderId,
        orderNumber,
        customerId,
        totalAmount,
        items,
        paymentMethod,
        timestamp,
      } = eventData;

      // Track order creation metrics
      await this.recordMetric({
        type: "order_created",
        orderId,
        customerId,
        value: totalAmount,
        metadata: {
          orderNumber,
          itemCount: items.length,
          paymentMethod,
          timestamp,
        },
      });

      // Track revenue metrics
      await this.recordRevenue({
        type: "potential_revenue",
        amount: totalAmount,
        orderId,
        customerId,
        timestamp,
      });

      // Track customer behavior
      await this.recordCustomerMetric({
        customerId,
        action: "order_placed",
        value: totalAmount,
        metadata: {
          orderId,
          itemCount: items.length,
          paymentMethod,
        },
      });

      // Track product performance
      for (const item of items) {
        await this.recordProductMetric({
          productId: item.productId,
          action: "ordered",
          quantity: item.quantity,
          revenue: item.price * item.quantity,
          orderId,
          customerId,
        });
      }

      // Track seller performance
      const sellerMetrics = this.groupItemsBySeller(items);
      for (const [sellerId, sellerItems] of sellerMetrics) {
        const sellerRevenue = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        await this.recordSellerMetric({
          sellerId,
          action: "order_received",
          orderCount: 1,
          revenue: sellerRevenue,
          itemCount: sellerItems.length,
          orderId,
        });
      }

      console.log(`Order created analytics recorded for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling order created analytics:", error);
    }
  }

  async handleOrderConfirmed(eventData) {
    try {
      const { orderId, orderNumber, customerId, totalAmount } = eventData;

      await this.recordMetric({
        type: "order_confirmed",
        orderId,
        customerId,
        value: totalAmount,
        metadata: { orderNumber },
      });

      // Update conversion funnel
      await this.updateConversionFunnel("order_confirmed", customerId);

      console.log(
        `Order confirmed analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order confirmed analytics:", error);
    }
  }

  async handleOrderShipped(eventData) {
    try {
      const { orderId, orderNumber, customerId, totalAmount, shippedAt } =
        eventData;

      await this.recordMetric({
        type: "order_shipped",
        orderId,
        customerId,
        value: totalAmount,
        metadata: {
          orderNumber,
          shippedAt,
          fulfillmentTime: this.calculateFulfillmentTime(
            eventData.createdAt,
            shippedAt
          ),
        },
      });

      // Track fulfillment performance
      await this.recordFulfillmentMetric({
        orderId,
        stage: "shipped",
        timestamp: shippedAt,
        fulfillmentTime: this.calculateFulfillmentTime(
          eventData.createdAt,
          shippedAt
        ),
      });

      console.log(`Order shipped analytics recorded for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling order shipped analytics:", error);
    }
  }

  async handleOrderDelivered(eventData) {
    try {
      const { orderId, orderNumber, customerId, totalAmount, deliveredAt } =
        eventData;

      await this.recordMetric({
        type: "order_delivered",
        orderId,
        customerId,
        value: totalAmount,
        metadata: {
          orderNumber,
          deliveredAt,
          deliveryTime: this.calculateDeliveryTime(
            eventData.shippedAt,
            deliveredAt
          ),
        },
      });

      // Convert potential revenue to actual revenue
      await this.recordRevenue({
        type: "actual_revenue",
        amount: totalAmount,
        orderId,
        customerId,
        timestamp: deliveredAt,
      });

      // Track customer satisfaction opportunity
      await this.recordCustomerMetric({
        customerId,
        action: "order_completed",
        value: totalAmount,
        metadata: { orderId, deliveredAt },
      });

      // Update conversion funnel
      await this.updateConversionFunnel("order_completed", customerId);

      console.log(
        `Order delivered analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order delivered analytics:", error);
    }
  }

  async handleOrderCancelled(eventData) {
    try {
      const {
        orderId,
        orderNumber,
        customerId,
        totalAmount,
        reason,
        cancelledAt,
      } = eventData;

      await this.recordMetric({
        type: "order_cancelled",
        orderId,
        customerId,
        value: totalAmount,
        metadata: {
          orderNumber,
          reason,
          cancelledAt,
        },
      });

      // Track lost revenue
      await this.recordRevenue({
        type: "lost_revenue",
        amount: totalAmount,
        orderId,
        customerId,
        timestamp: cancelledAt,
        reason,
      });

      // Track cancellation reasons
      await this.recordCancellationMetric({
        reason,
        orderId,
        customerId,
        amount: totalAmount,
        timestamp: cancelledAt,
      });

      console.log(
        `Order cancelled analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order cancelled analytics:", error);
    }
  }

  // Payment analytics handlers
  async handlePaymentSuccessful(eventData) {
    try {
      const {
        orderId,
        orderNumber,
        customerId,
        amount,
        paymentMethod,
        transactionId,
      } = eventData;

      await this.recordPaymentMetric({
        type: "payment_successful",
        orderId,
        customerId,
        amount,
        paymentMethod,
        transactionId,
        status: "success",
      });

      // Track payment method performance
      await this.recordPaymentMethodMetric({
        paymentMethod,
        action: "successful_payment",
        amount,
        orderId,
      });

      console.log(
        `Payment successful analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling payment successful analytics:", error);
    }
  }

  async handlePaymentFailed(eventData) {
    try {
      const {
        orderId,
        orderNumber,
        customerId,
        amount,
        paymentMethod,
        failureReason,
      } = eventData;

      await this.recordPaymentMetric({
        type: "payment_failed",
        orderId,
        customerId,
        amount,
        paymentMethod,
        status: "failed",
        failureReason,
      });

      // Track payment method failure rates
      await this.recordPaymentMethodMetric({
        paymentMethod,
        action: "failed_payment",
        amount,
        orderId,
        failureReason,
      });

      // Track lost revenue due to payment failure
      await this.recordRevenue({
        type: "lost_revenue_payment_failure",
        amount,
        orderId,
        customerId,
        reason: failureReason,
      });

      console.log(`Payment failed analytics recorded for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling payment failed analytics:", error);
    }
  }

  async handlePaymentRefunded(eventData) {
    try {
      const { orderId, orderNumber, customerId, refundAmount, refundReason } =
        eventData;

      await this.recordPaymentMetric({
        type: "payment_refunded",
        orderId,
        customerId,
        amount: refundAmount,
        status: "refunded",
        refundReason,
      });

      // Track refunded revenue
      await this.recordRevenue({
        type: "refunded_revenue",
        amount: refundAmount,
        orderId,
        customerId,
        reason: refundReason,
      });

      console.log(
        `Payment refunded analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling payment refunded analytics:", error);
    }
  }

  // Return analytics handlers
  async handleReturnRequested(eventData) {
    try {
      const { orderId, orderNumber, customerId, returnReason, items } =
        eventData;

      await this.recordReturnMetric({
        type: "return_requested",
        orderId,
        customerId,
        reason: returnReason,
        itemCount: items.length,
        status: "requested",
      });

      // Track return reasons
      await this.recordReturnReasonMetric({
        reason: returnReason,
        orderId,
        customerId,
        itemCount: items.length,
      });

      console.log(
        `Return requested analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling return requested analytics:", error);
    }
  }

  async handleReturnApproved(eventData) {
    try {
      const { orderId, orderNumber, customerId, refundAmount } = eventData;

      await this.recordReturnMetric({
        type: "return_approved",
        orderId,
        customerId,
        refundAmount,
        status: "approved",
      });

      console.log(
        `Return approved analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling return approved analytics:", error);
    }
  }

  async handleReturnRejected(eventData) {
    try {
      const { orderId, orderNumber, customerId, rejectionReason } = eventData;

      await this.recordReturnMetric({
        type: "return_rejected",
        orderId,
        customerId,
        rejectionReason,
        status: "rejected",
      });

      console.log(
        `Return rejected analytics recorded for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling return rejected analytics:", error);
    }
  }

  // Inventory analytics handlers
  async handleInventoryReserved(eventData) {
    try {
      const { orderId, items } = eventData;

      for (const item of items) {
        await this.recordInventoryMetric({
          type: "inventory_reserved",
          productId: item.productId,
          quantity: item.quantity,
          orderId,
        });
      }

      console.log(`Inventory reserved analytics recorded for order ${orderId}`);
    } catch (error) {
      console.error("Error handling inventory reserved analytics:", error);
    }
  }

  async handleInventoryReleased(eventData) {
    try {
      const { orderId, items, reason } = eventData;

      for (const item of items) {
        await this.recordInventoryMetric({
          type: "inventory_released",
          productId: item.productId,
          quantity: item.quantity,
          orderId,
          reason,
        });
      }

      console.log(`Inventory released analytics recorded for order ${orderId}`);
    } catch (error) {
      console.error("Error handling inventory released analytics:", error);
    }
  }

  // Bulk operation analytics handlers
  async handleBulkStatusUpdated(eventData) {
    try {
      const { orderIds, newStatus, updatedBy, timestamp } = eventData;

      await this.recordBulkOperationMetric({
        type: "bulk_status_update",
        orderCount: orderIds.length,
        newStatus,
        updatedBy,
        timestamp,
      });

      console.log(
        `Bulk status update analytics recorded for ${orderIds.length} orders`
      );
    } catch (error) {
      console.error("Error handling bulk status update analytics:", error);
    }
  }

  // Utility methods for recording metrics
  async recordMetric(metricData) {
    try {
      // This would integrate with your analytics service
      console.log("Recording metric:", metricData);

      // Here you would integrate with:
      // - Google Analytics
      // - Mixpanel
      // - Amplitude
      // - Custom analytics database
      // - Data warehouse (BigQuery, Redshift, etc.)

      return true;
    } catch (error) {
      console.error("Error recording metric:", error);
      return false;
    }
  }

  async recordRevenue(revenueData) {
    try {
      console.log("Recording revenue:", revenueData);
      // Revenue tracking logic here
      return true;
    } catch (error) {
      console.error("Error recording revenue:", error);
      return false;
    }
  }

  async recordCustomerMetric(customerData) {
    try {
      console.log("Recording customer metric:", customerData);
      // Customer analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording customer metric:", error);
      return false;
    }
  }

  async recordProductMetric(productData) {
    try {
      console.log("Recording product metric:", productData);
      // Product analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording product metric:", error);
      return false;
    }
  }

  async recordSellerMetric(sellerData) {
    try {
      console.log("Recording seller metric:", sellerData);
      // Seller analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording seller metric:", error);
      return false;
    }
  }

  async recordPaymentMetric(paymentData) {
    try {
      console.log("Recording payment metric:", paymentData);
      // Payment analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording payment metric:", error);
      return false;
    }
  }

  async recordPaymentMethodMetric(methodData) {
    try {
      console.log("Recording payment method metric:", methodData);
      // Payment method analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording payment method metric:", error);
      return false;
    }
  }

  async recordReturnMetric(returnData) {
    try {
      console.log("Recording return metric:", returnData);
      // Return analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording return metric:", error);
      return false;
    }
  }

  async recordReturnReasonMetric(reasonData) {
    try {
      console.log("Recording return reason metric:", reasonData);
      // Return reason analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording return reason metric:", error);
      return false;
    }
  }

  async recordInventoryMetric(inventoryData) {
    try {
      console.log("Recording inventory metric:", inventoryData);
      // Inventory analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording inventory metric:", error);
      return false;
    }
  }

  async recordFulfillmentMetric(fulfillmentData) {
    try {
      console.log("Recording fulfillment metric:", fulfillmentData);
      // Fulfillment analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording fulfillment metric:", error);
      return false;
    }
  }

  async recordCancellationMetric(cancellationData) {
    try {
      console.log("Recording cancellation metric:", cancellationData);
      // Cancellation analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording cancellation metric:", error);
      return false;
    }
  }

  async recordBulkOperationMetric(bulkData) {
    try {
      console.log("Recording bulk operation metric:", bulkData);
      // Bulk operation analytics logic here
      return true;
    } catch (error) {
      console.error("Error recording bulk operation metric:", error);
      return false;
    }
  }

  async updateConversionFunnel(stage, customerId) {
    try {
      console.log(
        `Updating conversion funnel: ${stage} for customer ${customerId}`
      );
      // Conversion funnel tracking logic here
      return true;
    } catch (error) {
      console.error("Error updating conversion funnel:", error);
      return false;
    }
  }

  // Helper methods
  groupItemsBySeller(items) {
    const sellerMap = new Map();

    for (const item of items) {
      if (!sellerMap.has(item.sellerId)) {
        sellerMap.set(item.sellerId, []);
      }
      sellerMap.get(item.sellerId).push(item);
    }

    return sellerMap;
  }

  calculateFulfillmentTime(createdAt, shippedAt) {
    const created = new Date(createdAt);
    const shipped = new Date(shippedAt);
    return Math.floor((shipped - created) / (1000 * 60 * 60)); // Hours
  }

  calculateDeliveryTime(shippedAt, deliveredAt) {
    const shipped = new Date(shippedAt);
    const delivered = new Date(deliveredAt);
    return Math.floor((delivered - shipped) / (1000 * 60 * 60)); // Hours
  }

  // Lifecycle methods
  shutdown() {
    try {
      this.eventEmitter.removeAllListeners();
      this.isActive = false;
      console.log("OrderAnalyticsSubscriber shut down successfully");
    } catch (error) {
      console.error("Error shutting down OrderAnalyticsSubscriber:", error);
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      listenerCount: this.eventEmitter.listenerCount(),
    };
  }
}

module.exports = OrderAnalyticsSubscriber;
