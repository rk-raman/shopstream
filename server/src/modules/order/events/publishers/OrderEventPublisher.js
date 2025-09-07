const { orderEventEmitter, ORDER_EVENTS } = require("../order.events");

class OrderEventPublisher {
  constructor() {
    this.eventEmitter = orderEventEmitter;
  }

  // Order lifecycle events
  async publishOrderCreated(data) {
    try {
      this.eventEmitter.emitOrderCreated({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        sellerId: data.sellerId,
        items: data.items,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        status: data.status || "pending",
        metadata: {
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          source: data.source || "web",
        },
      });
    } catch (error) {
      console.error("Error publishing order created event:", error);
    }
  }

  async publishOrderUpdated(data) {
    try {
      this.eventEmitter.emitOrderUpdated({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        changes: data.changes,
        updatedBy: data.updatedBy,
        note: data.note,
        metadata: {
          source: data.source || "web",
          reason: data.reason,
        },
      });
    } catch (error) {
      console.error("Error publishing order updated event:", error);
    }
  }

  async publishOrderConfirmed(data) {
    try {
      this.eventEmitter.emitOrderConfirmed({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        items: data.items,
        totalAmount: data.totalAmount,
        confirmedBy: data.confirmedBy,
        paymentStatus: data.paymentStatus,
        estimatedDelivery: data.estimatedDelivery,
      });
    } catch (error) {
      console.error("Error publishing order confirmed event:", error);
    }
  }

  async publishOrderShipped(data) {
    try {
      this.eventEmitter.emitOrderShipped({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        shippingMethod: data.shippingMethod,
        estimatedDelivery: data.estimatedDelivery,
        shippedBy: data.shippedBy,
        items: data.items,
      });
    } catch (error) {
      console.error("Error publishing order shipped event:", error);
    }
  }

  async publishOrderDelivered(data) {
    try {
      this.eventEmitter.emitOrderDelivered({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        deliveredAt: data.deliveredAt,
        deliveryTime: data.deliveryTime,
        items: data.items,
        totalAmount: data.totalAmount,
        trackingNumber: data.trackingNumber,
      });
    } catch (error) {
      console.error("Error publishing order delivered event:", error);
    }
  }

  async publishOrderCancelled(data) {
    try {
      this.eventEmitter.emitOrderCancelled({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        cancelledBy: data.cancelledBy,
        reason: data.reason,
        cancelledAt: data.cancelledAt,
        refundAmount: data.refundAmount,
        items: data.items,
      });
    } catch (error) {
      console.error("Error publishing order cancelled event:", error);
    }
  }

  // Payment events
  async publishPaymentInitiated(data) {
    try {
      this.eventEmitter.emitPaymentInitiated({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        gateway: data.gateway,
        transactionId: data.transactionId,
        initiatedAt: data.initiatedAt,
      });
    } catch (error) {
      console.error("Error publishing payment initiated event:", error);
    }
  }

  async publishPaymentSuccessful(data) {
    try {
      this.eventEmitter.emitPaymentSuccessful({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        gateway: data.gateway,
        paidAt: data.paidAt,
        gatewayResponse: data.gatewayResponse,
      });
    } catch (error) {
      console.error("Error publishing payment successful event:", error);
    }
  }

  async publishPaymentFailed(data) {
    try {
      this.eventEmitter.emitPaymentFailed({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        gateway: data.gateway,
        failureReason: data.failureReason,
        errorCode: data.errorCode,
        failedAt: data.failedAt,
      });
    } catch (error) {
      console.error("Error publishing payment failed event:", error);
    }
  }

  async publishPaymentRefunded(data) {
    try {
      this.eventEmitter.emitPaymentRefunded({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        refundAmount: data.refundAmount,
        originalAmount: data.originalAmount,
        refundReason: data.refundReason,
        refundId: data.refundId,
        refundedBy: data.refundedBy,
        refundedAt: data.refundedAt,
      });
    } catch (error) {
      console.error("Error publishing payment refunded event:", error);
    }
  }

  // Return and exchange events
  async publishReturnRequested(data) {
    try {
      this.eventEmitter.emitReturnRequested({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        returnReason: data.returnReason,
        items: data.items,
        requestedAt: data.requestedAt,
        returnType: data.returnType, // "return" or "exchange"
      });
    } catch (error) {
      console.error("Error publishing return requested event:", error);
    }
  }

  async publishReturnApproved(data) {
    try {
      this.eventEmitter.emitReturnApproved({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        refundAmount: data.refundAmount,
        returnInstructions: data.returnInstructions,
      });
    } catch (error) {
      console.error("Error publishing return approved event:", error);
    }
  }

  async publishReturnRejected(data) {
    try {
      this.eventEmitter.emitReturnRejected({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        rejectedBy: data.rejectedBy,
        rejectedAt: data.rejectedAt,
        rejectionReason: data.rejectionReason,
      });
    } catch (error) {
      console.error("Error publishing return rejected event:", error);
    }
  }

  // Tracking events
  async publishTrackingUpdated(data) {
    try {
      this.eventEmitter.emitTrackingUpdated({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        status: data.status,
        location: data.location,
        updatedBy: data.updatedBy,
        updatedAt: data.updatedAt,
      });
    } catch (error) {
      console.error("Error publishing tracking updated event:", error);
    }
  }

  async publishTrackingEvent(data) {
    try {
      this.eventEmitter.emitTrackingEvent({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        trackingNumber: data.trackingNumber,
        event: data.event,
        location: data.location,
        description: data.description,
        eventTime: data.eventTime,
      });
    } catch (error) {
      console.error("Error publishing tracking event:", error);
    }
  }

  // Inventory events
  async publishInventoryReserved(data) {
    try {
      this.eventEmitter.emitInventoryReserved({
        orderId: data.orderId,
        items: data.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          reservedStock: item.reservedStock,
        })),
        reservedBy: data.reservedBy,
        reservedAt: data.reservedAt,
      });
    } catch (error) {
      console.error("Error publishing inventory reserved event:", error);
    }
  }

  async publishInventoryReleased(data) {
    try {
      this.eventEmitter.emitInventoryReleased({
        orderId: data.orderId,
        items: data.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          releasedStock: item.releasedStock,
        })),
        releasedBy: data.releasedBy,
        releasedAt: data.releasedAt,
        reason: data.reason,
      });
    } catch (error) {
      console.error("Error publishing inventory released event:", error);
    }
  }

  // Analytics events
  async publishOrderAnalytics(data) {
    try {
      this.eventEmitter.emitOrderAnalytics({
        orderId: data.orderId,
        customerId: data.customerId,
        orderValue: data.orderValue,
        itemCount: data.itemCount,
        categories: data.categories,
        sellers: data.sellers,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        customerSegment: data.customerSegment,
        acquisitionChannel: data.acquisitionChannel,
        deviceType: data.deviceType,
        location: data.location,
      });
    } catch (error) {
      console.error("Error publishing order analytics event:", error);
    }
  }

  async publishOrderMetrics(data) {
    try {
      this.eventEmitter.emitOrderMetrics({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        metrics: {
          processingTime: data.processingTime,
          fulfillmentTime: data.fulfillmentTime,
          deliveryTime: data.deliveryTime,
          customerSatisfaction: data.customerSatisfaction,
          profitMargin: data.profitMargin,
        },
        calculatedAt: data.calculatedAt,
      });
    } catch (error) {
      console.error("Error publishing order metrics event:", error);
    }
  }

  // Notification events
  async publishOrderNotification(data) {
    try {
      this.eventEmitter.emitOrderNotification({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        notificationType: data.notificationType,
        channel: data.channel, // "email", "sms", "push", "in-app"
        template: data.template,
        data: data.notificationData,
        priority: data.priority || "normal",
        scheduledAt: data.scheduledAt,
      });
    } catch (error) {
      console.error("Error publishing order notification event:", error);
    }
  }

  // Bulk operations
  async publishBulkOrdersUpdated(data) {
    try {
      this.eventEmitter.emitBulkOrdersUpdated({
        orderIds: data.orderIds,
        operation: data.operation,
        updateData: data.updateData,
        modifiedCount: data.modifiedCount,
        performedBy: data.performedBy,
        reason: data.reason,
        updatedAt: data.updatedAt,
      });
    } catch (error) {
      console.error("Error publishing bulk orders updated event:", error);
    }
  }

  // Error events
  async publishOrderError(data) {
    try {
      this.eventEmitter.emitOrderError({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        errorCode: data.errorCode,
        stackTrace: data.stackTrace,
        context: data.context,
        occurredAt: data.occurredAt,
        severity: data.severity || "error",
      });
    } catch (error) {
      console.error("Error publishing order error event:", error);
    }
  }
}

module.exports = OrderEventPublisher;
