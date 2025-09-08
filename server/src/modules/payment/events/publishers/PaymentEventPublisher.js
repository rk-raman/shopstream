const { paymentEventEmitter, PAYMENT_EVENTS } = require("../payment.events");

class PaymentEventPublisher {
  constructor() {
    this.eventEmitter = paymentEventEmitter;
  }

  // Payment lifecycle events
  async publishPaymentInitiated(data) {
    try {
      this.eventEmitter.emitPaymentInitiated({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        paymentMethod: data.paymentMethod,
        metadata: {
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          source: data.source || "web",
          ...data.metadata,
        },
      });
    } catch (error) {
      console.error("Error publishing payment initiated event:", error);
    }
  }

  async publishPaymentSuccessful(data) {
    try {
      this.eventEmitter.emitPaymentSuccessful({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        gatewayTransactionId: data.gatewayTransactionId,
        paymentMethod: data.paymentMethod,
        processingTime: data.processingTime,
        fees: data.fees,
        netAmount: data.netAmount,
        metadata: {
          source: data.source || "web",
          conversionData: data.conversionData,
        },
      });
    } catch (error) {
      console.error("Error publishing payment successful event:", error);
    }
  }

  async publishPaymentFailed(data) {
    try {
      this.eventEmitter.emitPaymentFailed({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        failureReason: data.failureReason,
        errorCode: data.errorCode,
        declineCode: data.declineCode,
        paymentMethod: data.paymentMethod,
        retryable: data.retryable || false,
        metadata: {
          source: data.source || "web",
          attemptNumber: data.attemptNumber || 1,
        },
      });
    } catch (error) {
      console.error("Error publishing payment failed event:", error);
    }
  }

  async publishPaymentCanceled(data) {
    try {
      this.eventEmitter.emitPaymentCanceled({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        canceledBy: data.canceledBy,
        reason: data.reason,
        canceledAt: data.canceledAt || new Date(),
      });
    } catch (error) {
      console.error("Error publishing payment canceled event:", error);
    }
  }

  async publishPaymentRefunded(data) {
    try {
      this.eventEmitter.emitPaymentRefunded({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        refundAmount: data.refundAmount,
        totalRefunded: data.totalRefunded,
        originalAmount: data.originalAmount,
        currency: data.currency,
        gateway: data.gateway,
        refundId: data.refundId,
        reason: data.reason,
        processedBy: data.processedBy,
        isPartialRefund: data.totalRefunded < data.originalAmount,
        metadata: {
          refundMethod: data.refundMethod,
          estimatedArrival: data.estimatedArrival,
        },
      });
    } catch (error) {
      console.error("Error publishing payment refunded event:", error);
    }
  }

  // Payment processing events
  async publishPaymentProcessing(data) {
    try {
      this.eventEmitter.emitPaymentProcessing({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        gateway: data.gateway,
        processingStage: data.processingStage,
        estimatedCompletionTime: data.estimatedCompletionTime,
      });
    } catch (error) {
      console.error("Error publishing payment processing event:", error);
    }
  }

  async publishPaymentRequiresAction(data) {
    try {
      this.eventEmitter.emitPaymentRequiresAction({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        gateway: data.gateway,
        actionType: data.actionType, // 3d_secure, bank_authorization, etc.
        actionUrl: data.actionUrl,
        clientSecret: data.clientSecret,
        expiresAt: data.expiresAt,
      });
    } catch (error) {
      console.error("Error publishing payment requires action event:", error);
    }
  }

  async publishPaymentCaptured(data) {
    try {
      this.eventEmitter.emitPaymentCaptured({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        capturedAt: data.capturedAt || new Date(),
        captureMethod: data.captureMethod, // automatic, manual
      });
    } catch (error) {
      console.error("Error publishing payment captured event:", error);
    }
  }

  // Dispute and chargeback events
  async publishPaymentDisputed(data) {
    try {
      this.eventEmitter.emitPaymentDisputed({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        disputeId: data.disputeId,
        amount: data.amount,
        currency: data.currency,
        reason: data.reason,
        status: data.status,
        evidenceRequired: data.evidenceRequired,
        evidenceDueBy: data.evidenceDueBy,
        gateway: data.gateway,
      });
    } catch (error) {
      console.error("Error publishing payment disputed event:", error);
    }
  }

  async publishPaymentChargeback(data) {
    try {
      this.eventEmitter.emitPaymentChargeback({
        paymentId: data.paymentId,
        orderId: data.orderId,
        userId: data.userId,
        chargebackId: data.chargebackId,
        amount: data.amount,
        currency: data.currency,
        reason: data.reason,
        gateway: data.gateway,
        chargebackAt: data.chargebackAt || new Date(),
      });
    } catch (error) {
      console.error("Error publishing payment chargeback event:", error);
    }
  }

  // Refund events
  async publishRefundInitiated(data) {
    try {
      this.eventEmitter.emitRefundInitiated({
        paymentId: data.paymentId,
        refundId: data.refundId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        reason: data.reason,
        initiatedBy: data.initiatedBy,
        gateway: data.gateway,
      });
    } catch (error) {
      console.error("Error publishing refund initiated event:", error);
    }
  }

  async publishRefundSuccessful(data) {
    try {
      this.eventEmitter.emitRefundSuccessful({
        paymentId: data.paymentId,
        refundId: data.refundId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        processedAt: data.processedAt || new Date(),
        estimatedArrival: data.estimatedArrival,
      });
    } catch (error) {
      console.error("Error publishing refund successful event:", error);
    }
  }

  async publishRefundFailed(data) {
    try {
      this.eventEmitter.emitRefundFailed({
        paymentId: data.paymentId,
        refundId: data.refundId,
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        gateway: data.gateway,
        failureReason: data.failureReason,
        errorCode: data.errorCode,
      });
    } catch (error) {
      console.error("Error publishing refund failed event:", error);
    }
  }

  // Payment method events
  async publishPaymentMethodSaved(data) {
    try {
      this.eventEmitter.emitPaymentMethodSaved({
        userId: data.userId,
        paymentMethodId: data.paymentMethodId,
        gateway: data.gateway,
        paymentMethodType: data.paymentMethodType,
        last4: data.last4,
        brand: data.brand,
        isDefault: data.isDefault,
      });
    } catch (error) {
      console.error("Error publishing payment method saved event:", error);
    }
  }

  async publishPaymentMethodDeleted(data) {
    try {
      this.eventEmitter.emitPaymentMethodDeleted({
        userId: data.userId,
        paymentMethodId: data.paymentMethodId,
        gateway: data.gateway,
        deletedBy: data.deletedBy,
        reason: data.reason,
      });
    } catch (error) {
      console.error("Error publishing payment method deleted event:", error);
    }
  }

  // Webhook events
  async publishWebhookReceived(data) {
    try {
      this.eventEmitter.emitWebhookReceived({
        gateway: data.gateway,
        eventType: data.eventType,
        eventId: data.eventId,
        paymentId: data.paymentId,
        receivedAt: data.receivedAt || new Date(),
        signature: data.signature,
        verified: data.verified,
      });
    } catch (error) {
      console.error("Error publishing webhook received event:", error);
    }
  }

  async publishWebhookProcessed(data) {
    try {
      this.eventEmitter.emitWebhookProcessed({
        gateway: data.gateway,
        eventType: data.eventType,
        eventId: data.eventId,
        paymentId: data.paymentId,
        processedAt: data.processedAt || new Date(),
        processingTime: data.processingTime,
        result: data.result,
      });
    } catch (error) {
      console.error("Error publishing webhook processed event:", error);
    }
  }

  async publishWebhookFailed(data) {
    try {
      this.eventEmitter.emitWebhookFailed({
        gateway: data.gateway,
        eventType: data.eventType,
        eventId: data.eventId,
        paymentId: data.paymentId,
        failedAt: data.failedAt || new Date(),
        error: data.error,
        retryCount: data.retryCount || 0,
      });
    } catch (error) {
      console.error("Error publishing webhook failed event:", error);
    }
  }

  // Risk and fraud events
  async publishPaymentRiskAssessed(data) {
    try {
      this.eventEmitter.emitPaymentRiskAssessed({
        paymentId: data.paymentId,
        userId: data.userId,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        riskFactors: data.riskFactors,
        recommendation: data.recommendation,
        assessedAt: data.assessedAt || new Date(),
      });
    } catch (error) {
      console.error("Error publishing payment risk assessed event:", error);
    }
  }

  async publishPaymentFraudDetected(data) {
    try {
      this.eventEmitter.emitPaymentFraudDetected({
        paymentId: data.paymentId,
        userId: data.userId,
        fraudType: data.fraudType,
        confidence: data.confidence,
        indicators: data.indicators,
        action: data.action, // block, review, allow
        detectedAt: data.detectedAt || new Date(),
      });
    } catch (error) {
      console.error("Error publishing payment fraud detected event:", error);
    }
  }

  async publishPaymentBlocked(data) {
    try {
      this.eventEmitter.emitPaymentBlocked({
        paymentId: data.paymentId,
        userId: data.userId,
        reason: data.reason,
        blockType: data.blockType, // fraud, risk, compliance
        blockedBy: data.blockedBy,
        blockedAt: data.blockedAt || new Date(),
      });
    } catch (error) {
      console.error("Error publishing payment blocked event:", error);
    }
  }

  // Analytics events
  async publishPaymentAnalytics(data) {
    try {
      this.eventEmitter.emitPaymentAnalytics({
        paymentId: data.paymentId,
        userId: data.userId,
        orderId: data.orderId,
        gateway: data.gateway,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        country: data.country,
        device: data.device,
        channel: data.channel,
        conversionFunnel: data.conversionFunnel,
        sessionData: data.sessionData,
      });
    } catch (error) {
      console.error("Error publishing payment analytics event:", error);
    }
  }

  async publishPaymentConversion(data) {
    try {
      this.eventEmitter.emitPaymentConversion({
        paymentId: data.paymentId,
        userId: data.userId,
        orderId: data.orderId,
        conversionType: data.conversionType, // checkout, retry, upsell
        previousStatus: data.previousStatus,
        newStatus: data.newStatus,
        conversionValue: data.conversionValue,
        conversionTime: data.conversionTime,
        touchpoints: data.touchpoints,
      });
    } catch (error) {
      console.error("Error publishing payment conversion event:", error);
    }
  }
}

module.exports = PaymentEventPublisher;
