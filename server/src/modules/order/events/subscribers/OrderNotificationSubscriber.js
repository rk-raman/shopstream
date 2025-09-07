const { orderEventEmitter, ORDER_EVENTS } = require("../order.events");

class OrderNotificationSubscriber {
  constructor() {
    this.eventEmitter = orderEventEmitter;
    this.isActive = false;
    this.initialize();
  }

  initialize() {
    try {
      // Order lifecycle notifications
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

      // Payment notifications
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

      // Return notifications
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

      // Tracking notifications
      this.eventEmitter.on(
        ORDER_EVENTS.ORDER_TRACKING_UPDATED,
        this.handleTrackingUpdated.bind(this)
      );

      this.isActive = true;
      console.log("OrderNotificationSubscriber initialized successfully");
    } catch (error) {
      console.error("Error initializing OrderNotificationSubscriber:", error);
    }
  }

  // Order lifecycle notification handlers
  async handleOrderCreated(eventData) {
    try {
      const { orderId, orderNumber, customerId, totalAmount, items } =
        eventData;

      // Send order confirmation email to customer
      await this.sendNotification({
        type: "order_created",
        channel: "email",
        recipientId: customerId,
        template: "order-confirmation",
        data: {
          orderNumber,
          totalAmount,
          itemCount: items.length,
          estimatedDelivery: this.calculateEstimatedDelivery(),
        },
        priority: "high",
      });

      // Send SMS notification if enabled
      await this.sendNotification({
        type: "order_created",
        channel: "sms",
        recipientId: customerId,
        template: "order-confirmation-sms",
        data: { orderNumber, totalAmount },
        priority: "normal",
      });

      // Notify sellers about new orders
      const sellerIds = [...new Set(items.map((item) => item.sellerId))];
      for (const sellerId of sellerIds) {
        const sellerItems = items.filter((item) => item.sellerId === sellerId);
        await this.sendNotification({
          type: "new_order_seller",
          channel: "email",
          recipientId: sellerId,
          template: "new-order-seller",
          data: {
            orderNumber,
            items: sellerItems,
            customerInfo: eventData.shippingAddress,
          },
          priority: "high",
        });
      }

      console.log(`Order created notifications sent for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling order created notification:", error);
    }
  }

  async handleOrderConfirmed(eventData) {
    try {
      const { orderNumber, customerId, estimatedDelivery } = eventData;

      await this.sendNotification({
        type: "order_confirmed",
        channel: "email",
        recipientId: customerId,
        template: "order-confirmed",
        data: {
          orderNumber,
          estimatedDelivery,
        },
        priority: "normal",
      });

      console.log(`Order confirmed notification sent for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling order confirmed notification:", error);
    }
  }

  async handleOrderShipped(eventData) {
    try {
      const {
        orderNumber,
        customerId,
        trackingNumber,
        carrier,
        estimatedDelivery,
      } = eventData;

      // Email notification
      await this.sendNotification({
        type: "order_shipped",
        channel: "email",
        recipientId: customerId,
        template: "order-shipped",
        data: {
          orderNumber,
          trackingNumber,
          carrier,
          estimatedDelivery,
          trackingUrl: this.generateTrackingUrl(trackingNumber, carrier),
        },
        priority: "high",
      });

      // Push notification
      await this.sendNotification({
        type: "order_shipped",
        channel: "push",
        recipientId: customerId,
        template: "order-shipped-push",
        data: { orderNumber, trackingNumber },
        priority: "high",
      });

      console.log(`Order shipped notifications sent for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling order shipped notification:", error);
    }
  }

  async handleOrderDelivered(eventData) {
    try {
      const { orderNumber, customerId, deliveredAt } = eventData;

      // Delivery confirmation
      await this.sendNotification({
        type: "order_delivered",
        channel: "email",
        recipientId: customerId,
        template: "order-delivered",
        data: {
          orderNumber,
          deliveredAt,
        },
        priority: "normal",
      });

      // Request review notification (delayed)
      setTimeout(async () => {
        await this.sendNotification({
          type: "review_request",
          channel: "email",
          recipientId: customerId,
          template: "review-request",
          data: { orderNumber },
          priority: "low",
        });
      }, 24 * 60 * 60 * 1000); // 24 hours delay

      console.log(
        `Order delivered notifications sent for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling order delivered notification:", error);
    }
  }

  async handleOrderCancelled(eventData) {
    try {
      const { orderNumber, customerId, reason, refundAmount } = eventData;

      await this.sendNotification({
        type: "order_cancelled",
        channel: "email",
        recipientId: customerId,
        template: "order-cancelled",
        data: {
          orderNumber,
          reason,
          refundAmount,
          refundTimeline: "3-5 business days",
        },
        priority: "high",
      });

      console.log(`Order cancelled notification sent for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling order cancelled notification:", error);
    }
  }

  // Payment notification handlers
  async handlePaymentSuccessful(eventData) {
    try {
      const { orderNumber, customerId, amount, paymentMethod } = eventData;

      await this.sendNotification({
        type: "payment_successful",
        channel: "email",
        recipientId: customerId,
        template: "payment-successful",
        data: {
          orderNumber,
          amount,
          paymentMethod,
        },
        priority: "normal",
      });

      console.log(
        `Payment successful notification sent for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling payment successful notification:", error);
    }
  }

  async handlePaymentFailed(eventData) {
    try {
      const { orderNumber, customerId, failureReason } = eventData;

      await this.sendNotification({
        type: "payment_failed",
        channel: "email",
        recipientId: customerId,
        template: "payment-failed",
        data: {
          orderNumber,
          failureReason,
          retryUrl: this.generateRetryPaymentUrl(eventData.orderId),
        },
        priority: "high",
      });

      console.log(`Payment failed notification sent for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling payment failed notification:", error);
    }
  }

  async handlePaymentRefunded(eventData) {
    try {
      const { orderNumber, customerId, refundAmount, refundReason } = eventData;

      await this.sendNotification({
        type: "payment_refunded",
        channel: "email",
        recipientId: customerId,
        template: "payment-refunded",
        data: {
          orderNumber,
          refundAmount,
          refundReason,
        },
        priority: "normal",
      });

      console.log(
        `Payment refunded notification sent for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling payment refunded notification:", error);
    }
  }

  // Return notification handlers
  async handleReturnRequested(eventData) {
    try {
      const { orderNumber, customerId, returnReason } = eventData;

      // Notify customer
      await this.sendNotification({
        type: "return_requested",
        channel: "email",
        recipientId: customerId,
        template: "return-requested",
        data: {
          orderNumber,
          returnReason,
          processingTime: "2-3 business days",
        },
        priority: "normal",
      });

      // Notify admin/seller for approval
      await this.sendNotification({
        type: "return_approval_needed",
        channel: "email",
        recipientId: "admin", // Or specific seller
        template: "return-approval-needed",
        data: {
          orderNumber,
          returnReason,
          customerInfo: eventData.customerId,
        },
        priority: "high",
      });

      console.log(
        `Return requested notifications sent for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error handling return requested notification:", error);
    }
  }

  async handleReturnApproved(eventData) {
    try {
      const { orderNumber, customerId, refundAmount, returnInstructions } =
        eventData;

      await this.sendNotification({
        type: "return_approved",
        channel: "email",
        recipientId: customerId,
        template: "return-approved",
        data: {
          orderNumber,
          refundAmount,
          returnInstructions,
        },
        priority: "high",
      });

      console.log(`Return approved notification sent for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling return approved notification:", error);
    }
  }

  async handleReturnRejected(eventData) {
    try {
      const { orderNumber, customerId, rejectionReason } = eventData;

      await this.sendNotification({
        type: "return_rejected",
        channel: "email",
        recipientId: customerId,
        template: "return-rejected",
        data: {
          orderNumber,
          rejectionReason,
        },
        priority: "normal",
      });

      console.log(`Return rejected notification sent for order ${orderNumber}`);
    } catch (error) {
      console.error("Error handling return rejected notification:", error);
    }
  }

  // Tracking notification handlers
  async handleTrackingUpdated(eventData) {
    try {
      const { orderNumber, customerId, status, location } = eventData;

      // Only send notifications for significant status changes
      const significantStatuses = ["shipped", "out_for_delivery", "delivered"];

      if (significantStatuses.includes(status)) {
        await this.sendNotification({
          type: "tracking_updated",
          channel: "push",
          recipientId: customerId,
          template: "tracking-updated",
          data: {
            orderNumber,
            status,
            location,
          },
          priority: "normal",
        });

        console.log(
          `Tracking updated notification sent for order ${orderNumber}`
        );
      }
    } catch (error) {
      console.error("Error handling tracking updated notification:", error);
    }
  }

  // Utility methods
  async sendNotification(notificationData) {
    try {
      // This would integrate with your notification service
      // For now, we'll log the notification
      console.log("Sending notification:", {
        type: notificationData.type,
        channel: notificationData.channel,
        recipient: notificationData.recipientId,
        template: notificationData.template,
        priority: notificationData.priority,
      });

      // Here you would integrate with:
      // - Email service (SendGrid, AWS SES, etc.)
      // - SMS service (Twilio, AWS SNS, etc.)
      // - Push notification service (Firebase, OneSignal, etc.)
      // - In-app notification system

      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  }

  calculateEstimatedDelivery() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
    return deliveryDate.toISOString();
  }

  generateTrackingUrl(trackingNumber, carrier) {
    const trackingUrls = {
      fedex: `https://www.fedex.com/fedextrack/?tracknumber=${trackingNumber}`,
      ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      dhl: `https://www.dhl.com/track?trackingNumber=${trackingNumber}`,
      default: `https://yourstore.com/track/${trackingNumber}`,
    };

    return trackingUrls[carrier?.toLowerCase()] || trackingUrls.default;
  }

  generateRetryPaymentUrl(orderId) {
    return `https://yourstore.com/orders/${orderId}/payment`;
  }

  // Lifecycle methods
  shutdown() {
    try {
      this.eventEmitter.removeAllListeners();
      this.isActive = false;
      console.log("OrderNotificationSubscriber shut down successfully");
    } catch (error) {
      console.error("Error shutting down OrderNotificationSubscriber:", error);
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      listenerCount: this.eventEmitter.listenerCount(),
    };
  }
}

module.exports = OrderNotificationSubscriber;
