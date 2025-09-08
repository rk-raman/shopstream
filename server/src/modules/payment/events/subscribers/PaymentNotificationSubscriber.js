const { PAYMENT_EVENTS } = require("../payment.events");

class PaymentNotificationSubscriber {
  constructor() {
    this.name = "PaymentNotificationSubscriber";
    this.isActive = true;
  }

  // Initialize event listeners
  initialize(eventEmitter) {
    if (!this.isActive) return;

    // Payment lifecycle notifications
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_INITIATED,
      this.handlePaymentInitiated.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_SUCCESSFUL,
      this.handlePaymentSuccessful.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_FAILED,
      this.handlePaymentFailed.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_CANCELED,
      this.handlePaymentCanceled.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_REFUNDED,
      this.handlePaymentRefunded.bind(this)
    );

    // Payment processing notifications
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_REQUIRES_ACTION,
      this.handlePaymentRequiresAction.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_CAPTURED,
      this.handlePaymentCaptured.bind(this)
    );

    // Dispute and chargeback notifications
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_DISPUTED,
      this.handlePaymentDisputed.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_CHARGEBACK,
      this.handlePaymentChargeback.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.DISPUTE_RESOLVED,
      this.handleDisputeResolved.bind(this)
    );

    // Refund notifications
    eventEmitter.on(
      PAYMENT_EVENTS.REFUND_SUCCESSFUL,
      this.handleRefundSuccessful.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.REFUND_FAILED,
      this.handleRefundFailed.bind(this)
    );

    // Risk and fraud notifications
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_FRAUD_DETECTED,
      this.handlePaymentFraudDetected.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_BLOCKED,
      this.handlePaymentBlocked.bind(this)
    );

    // Webhook notifications
    eventEmitter.on(
      PAYMENT_EVENTS.WEBHOOK_FAILED,
      this.handleWebhookFailed.bind(this)
    );

    console.log(`${this.name} initialized successfully`);
  }

  // Payment initiated notification
  async handlePaymentInitiated(eventData) {
    try {
      // Notify user about payment initiation
      await this.sendNotification({
        type: "payment_initiated",
        recipient: "user",
        userId: eventData.userId,
        title: "Payment Processing",
        message: `Your payment of ${eventData.currency} ${eventData.amount} is being processed.`,
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          amount: eventData.amount,
          currency: eventData.currency,
          gateway: eventData.gateway,
        },
        channels: ["in_app", "email"],
        priority: "normal",
      });

      // Notify admin for high-value payments
      if (eventData.amount > 1000) {
        await this.sendNotification({
          type: "high_value_payment",
          recipient: "admin",
          title: "High Value Payment Initiated",
          message: `High value payment of ${eventData.currency} ${eventData.amount} initiated by user ${eventData.userId}`,
          data: {
            paymentId: eventData.paymentId,
            orderId: eventData.orderId,
            userId: eventData.userId,
            amount: eventData.amount,
            currency: eventData.currency,
          },
          channels: ["in_app", "slack"],
          priority: "high",
        });
      }
    } catch (error) {
      console.error("Error handling payment initiated notification:", error);
    }
  }

  // Payment successful notification
  async handlePaymentSuccessful(eventData) {
    try {
      // Notify user about successful payment
      await this.sendNotification({
        type: "payment_successful",
        recipient: "user",
        userId: eventData.userId,
        title: "Payment Successful",
        message: `Your payment of ${eventData.currency} ${eventData.amount} has been processed successfully.`,
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          amount: eventData.amount,
          currency: eventData.currency,
          gatewayTransactionId: eventData.gatewayTransactionId,
        },
        channels: ["in_app", "email", "sms"],
        priority: "high",
      });

      // Notify seller about successful payment (if applicable)
      if (eventData.sellerId) {
        await this.sendNotification({
          type: "payment_received",
          recipient: "seller",
          userId: eventData.sellerId,
          title: "Payment Received",
          message: `You received a payment of ${eventData.currency} ${eventData.amount} for order ${eventData.orderId}`,
          data: {
            paymentId: eventData.paymentId,
            orderId: eventData.orderId,
            amount: eventData.amount,
            currency: eventData.currency,
          },
          channels: ["in_app", "email"],
          priority: "normal",
        });
      }
    } catch (error) {
      console.error("Error handling payment successful notification:", error);
    }
  }

  // Payment failed notification
  async handlePaymentFailed(eventData) {
    try {
      // Notify user about failed payment
      await this.sendNotification({
        type: "payment_failed",
        recipient: "user",
        userId: eventData.userId,
        title: "Payment Failed",
        message: `Your payment of ${eventData.currency} ${
          eventData.amount
        } could not be processed. ${
          eventData.failureReason?.message || "Please try again."
        }`,
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          amount: eventData.amount,
          currency: eventData.currency,
          failureReason: eventData.failureReason,
          retryable: eventData.retryable,
        },
        channels: ["in_app", "email"],
        priority: "high",
      });

      // Notify admin for recurring payment failures
      if (eventData.metadata?.attemptNumber > 3) {
        await this.sendNotification({
          type: "recurring_payment_failure",
          recipient: "admin",
          title: "Recurring Payment Failure",
          message: `User ${eventData.userId} has ${eventData.metadata.attemptNumber} failed payment attempts`,
          data: {
            paymentId: eventData.paymentId,
            userId: eventData.userId,
            attemptNumber: eventData.metadata.attemptNumber,
            failureReason: eventData.failureReason,
          },
          channels: ["in_app", "slack"],
          priority: "high",
        });
      }
    } catch (error) {
      console.error("Error handling payment failed notification:", error);
    }
  }

  // Payment canceled notification
  async handlePaymentCanceled(eventData) {
    try {
      // Notify user about canceled payment
      await this.sendNotification({
        type: "payment_canceled",
        recipient: "user",
        userId: eventData.userId,
        title: "Payment Canceled",
        message: `Your payment of ${eventData.currency} ${eventData.amount} has been canceled.`,
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          amount: eventData.amount,
          currency: eventData.currency,
          reason: eventData.reason,
        },
        channels: ["in_app", "email"],
        priority: "normal",
      });
    } catch (error) {
      console.error("Error handling payment canceled notification:", error);
    }
  }

  // Payment refunded notification
  async handlePaymentRefunded(eventData) {
    try {
      // Notify user about refund
      await this.sendNotification({
        type: "payment_refunded",
        recipient: "user",
        userId: eventData.userId,
        title: eventData.isPartialRefund
          ? "Partial Refund Processed"
          : "Refund Processed",
        message: `A refund of ${eventData.currency} ${
          eventData.refundAmount
        } has been processed. ${
          eventData.metadata?.estimatedArrival
            ? `Expected in your account within ${eventData.metadata.estimatedArrival}.`
            : ""
        }`,
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          refundAmount: eventData.refundAmount,
          totalRefunded: eventData.totalRefunded,
          originalAmount: eventData.originalAmount,
          currency: eventData.currency,
          reason: eventData.reason,
          isPartialRefund: eventData.isPartialRefund,
        },
        channels: ["in_app", "email"],
        priority: "high",
      });

      // Notify seller about refund (if applicable)
      if (eventData.sellerId) {
        await this.sendNotification({
          type: "refund_issued",
          recipient: "seller",
          userId: eventData.sellerId,
          title: "Refund Issued",
          message: `A refund of ${eventData.currency} ${eventData.refundAmount} has been issued for order ${eventData.orderId}`,
          data: {
            paymentId: eventData.paymentId,
            orderId: eventData.orderId,
            refundAmount: eventData.refundAmount,
            reason: eventData.reason,
          },
          channels: ["in_app", "email"],
          priority: "normal",
        });
      }
    } catch (error) {
      console.error("Error handling payment refunded notification:", error);
    }
  }

  // Payment requires action notification
  async handlePaymentRequiresAction(eventData) {
    try {
      // Notify user about required action (e.g., 3D Secure)
      await this.sendNotification({
        type: "payment_requires_action",
        recipient: "user",
        userId: eventData.userId,
        title: "Payment Authentication Required",
        message:
          "Your payment requires additional authentication. Please complete the verification process.",
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          actionType: eventData.actionType,
          actionUrl: eventData.actionUrl,
          expiresAt: eventData.expiresAt,
        },
        channels: ["in_app", "email"],
        priority: "urgent",
      });
    } catch (error) {
      console.error(
        "Error handling payment requires action notification:",
        error
      );
    }
  }

  // Payment captured notification
  async handlePaymentCaptured(eventData) {
    try {
      // Notify admin about manual payment capture
      if (eventData.captureMethod === "manual") {
        await this.sendNotification({
          type: "payment_captured",
          recipient: "admin",
          title: "Payment Manually Captured",
          message: `Payment ${eventData.paymentId} of ${eventData.currency} ${eventData.amount} has been manually captured`,
          data: {
            paymentId: eventData.paymentId,
            orderId: eventData.orderId,
            amount: eventData.amount,
            currency: eventData.currency,
            captureMethod: eventData.captureMethod,
          },
          channels: ["in_app"],
          priority: "normal",
        });
      }
    } catch (error) {
      console.error("Error handling payment captured notification:", error);
    }
  }

  // Payment disputed notification
  async handlePaymentDisputed(eventData) {
    try {
      // Notify admin about dispute
      await this.sendNotification({
        type: "payment_disputed",
        recipient: "admin",
        title: "Payment Dispute Received",
        message: `Payment ${eventData.paymentId} has been disputed. Reason: ${eventData.reason}`,
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          userId: eventData.userId,
          disputeId: eventData.disputeId,
          amount: eventData.amount,
          currency: eventData.currency,
          reason: eventData.reason,
          evidenceDueBy: eventData.evidenceDueBy,
        },
        channels: ["in_app", "email", "slack"],
        priority: "urgent",
      });

      // Notify seller about dispute (if applicable)
      if (eventData.sellerId) {
        await this.sendNotification({
          type: "payment_disputed",
          recipient: "seller",
          userId: eventData.sellerId,
          title: "Payment Dispute",
          message: `A payment dispute has been filed for order ${eventData.orderId}. Please provide evidence if requested.`,
          data: {
            paymentId: eventData.paymentId,
            orderId: eventData.orderId,
            disputeId: eventData.disputeId,
            reason: eventData.reason,
          },
          channels: ["in_app", "email"],
          priority: "high",
        });
      }
    } catch (error) {
      console.error("Error handling payment disputed notification:", error);
    }
  }

  // Payment chargeback notification
  async handlePaymentChargeback(eventData) {
    try {
      // Notify admin about chargeback
      await this.sendNotification({
        type: "payment_chargeback",
        recipient: "admin",
        title: "Payment Chargeback",
        message: `Payment ${eventData.paymentId} has been charged back. Amount: ${eventData.currency} ${eventData.amount}`,
        data: {
          paymentId: eventData.paymentId,
          orderId: eventData.orderId,
          userId: eventData.userId,
          chargebackId: eventData.chargebackId,
          amount: eventData.amount,
          currency: eventData.currency,
          reason: eventData.reason,
        },
        channels: ["in_app", "email", "slack"],
        priority: "urgent",
      });
    } catch (error) {
      console.error("Error handling payment chargeback notification:", error);
    }
  }

  // Dispute resolved notification
  async handleDisputeResolved(eventData) {
    try {
      // Notify admin about dispute resolution
      await this.sendNotification({
        type: "dispute_resolved",
        recipient: "admin",
        title: "Dispute Resolved",
        message: `Dispute ${eventData.disputeId} for payment ${
          eventData.paymentId
        } has been resolved in ${
          eventData.outcome === "won" ? "our favor" : "customer's favor"
        }`,
        data: {
          paymentId: eventData.paymentId,
          disputeId: eventData.disputeId,
          outcome: eventData.outcome,
          resolution: eventData.resolution,
        },
        channels: ["in_app", "slack"],
        priority: "normal",
      });
    } catch (error) {
      console.error("Error handling dispute resolved notification:", error);
    }
  }

  // Refund successful notification
  async handleRefundSuccessful(eventData) {
    try {
      // Additional notification for refund processing completion
      await this.sendNotification({
        type: "refund_processed",
        recipient: "user",
        userId: eventData.userId,
        title: "Refund Completed",
        message: `Your refund of ${eventData.currency} ${eventData.amount} has been completed and should appear in your account soon.`,
        data: {
          paymentId: eventData.paymentId,
          refundId: eventData.refundId,
          amount: eventData.amount,
          currency: eventData.currency,
          estimatedArrival: eventData.estimatedArrival,
        },
        channels: ["in_app"],
        priority: "normal",
      });
    } catch (error) {
      console.error("Error handling refund successful notification:", error);
    }
  }

  // Refund failed notification
  async handleRefundFailed(eventData) {
    try {
      // Notify admin about failed refund
      await this.sendNotification({
        type: "refund_failed",
        recipient: "admin",
        title: "Refund Failed",
        message: `Refund ${eventData.refundId} for payment ${eventData.paymentId} failed. Reason: ${eventData.failureReason}`,
        data: {
          paymentId: eventData.paymentId,
          refundId: eventData.refundId,
          userId: eventData.userId,
          amount: eventData.amount,
          currency: eventData.currency,
          failureReason: eventData.failureReason,
        },
        channels: ["in_app", "email"],
        priority: "high",
      });
    } catch (error) {
      console.error("Error handling refund failed notification:", error);
    }
  }

  // Payment fraud detected notification
  async handlePaymentFraudDetected(eventData) {
    try {
      // Notify admin about fraud detection
      await this.sendNotification({
        type: "payment_fraud_detected",
        recipient: "admin",
        title: "Fraud Detected",
        message: `Potential fraud detected for payment ${eventData.paymentId}. Confidence: ${eventData.confidence}%`,
        data: {
          paymentId: eventData.paymentId,
          userId: eventData.userId,
          fraudType: eventData.fraudType,
          confidence: eventData.confidence,
          indicators: eventData.indicators,
          action: eventData.action,
        },
        channels: ["in_app", "email", "slack"],
        priority: "urgent",
      });
    } catch (error) {
      console.error(
        "Error handling payment fraud detected notification:",
        error
      );
    }
  }

  // Payment blocked notification
  async handlePaymentBlocked(eventData) {
    try {
      // Notify user about blocked payment
      await this.sendNotification({
        type: "payment_blocked",
        recipient: "user",
        userId: eventData.userId,
        title: "Payment Blocked",
        message:
          "Your payment has been blocked for security reasons. Please contact support if you believe this is an error.",
        data: {
          paymentId: eventData.paymentId,
          reason: eventData.reason,
          blockType: eventData.blockType,
        },
        channels: ["in_app", "email"],
        priority: "high",
      });

      // Notify admin about blocked payment
      await this.sendNotification({
        type: "payment_blocked",
        recipient: "admin",
        title: "Payment Blocked",
        message: `Payment ${eventData.paymentId} blocked due to ${eventData.blockType}. Reason: ${eventData.reason}`,
        data: {
          paymentId: eventData.paymentId,
          userId: eventData.userId,
          reason: eventData.reason,
          blockType: eventData.blockType,
          blockedBy: eventData.blockedBy,
        },
        channels: ["in_app", "slack"],
        priority: "high",
      });
    } catch (error) {
      console.error("Error handling payment blocked notification:", error);
    }
  }

  // Webhook failed notification
  async handleWebhookFailed(eventData) {
    try {
      // Notify admin about webhook failures
      await this.sendNotification({
        type: "webhook_failed",
        recipient: "admin",
        title: "Webhook Processing Failed",
        message: `Webhook from ${eventData.gateway} failed to process. Event: ${eventData.eventType}`,
        data: {
          gateway: eventData.gateway,
          eventType: eventData.eventType,
          eventId: eventData.eventId,
          paymentId: eventData.paymentId,
          error: eventData.error,
          retryCount: eventData.retryCount,
        },
        channels: ["in_app", "slack"],
        priority: "high",
      });
    } catch (error) {
      console.error("Error handling webhook failed notification:", error);
    }
  }

  // Helper method to send notifications
  async sendNotification(notificationData) {
    try {
      // This would integrate with your notification service
      console.log(`[Notification] ${notificationData.type}:`, {
        recipient: notificationData.recipient,
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        channels: notificationData.channels,
        priority: notificationData.priority,
        data: notificationData.data,
        timestamp: new Date().toISOString(),
      });

      // TODO: Implement actual notification service integration
      // Examples:
      // - Send push notifications
      // - Send emails via SendGrid/SES
      // - Send SMS via Twilio
      // - Send Slack messages
      // - Store in-app notifications in database
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  // Subscriber management methods
  shutdown() {
    this.isActive = false;
    console.log(`${this.name} shut down`);
  }

  restart() {
    this.isActive = true;
    console.log(`${this.name} restarted`);
  }

  getStatus() {
    return {
      name: this.name,
      isActive: this.isActive,
      type: "notification",
    };
  }
}

module.exports = PaymentNotificationSubscriber;
