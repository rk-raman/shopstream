const { EventEmitter } = require("events");

// Payment Event Types
const PAYMENT_EVENTS = {
  // Payment lifecycle events
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESSFUL: "payment.successful",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_CANCELED: "payment.canceled",
  PAYMENT_REFUNDED: "payment.refunded",
  PAYMENT_PARTIALLY_REFUNDED: "payment.partially_refunded",

  // Payment processing events
  PAYMENT_PROCESSING: "payment.processing",
  PAYMENT_REQUIRES_ACTION: "payment.requires_action",
  PAYMENT_CAPTURED: "payment.captured",

  // Dispute and chargeback events
  PAYMENT_DISPUTED: "payment.disputed",
  PAYMENT_CHARGEBACK: "payment.chargeback",
  DISPUTE_RESOLVED: "payment.dispute.resolved",

  // Refund events
  REFUND_INITIATED: "payment.refund.initiated",
  REFUND_SUCCESSFUL: "payment.refund.successful",
  REFUND_FAILED: "payment.refund.failed",

  // Payment method events
  PAYMENT_METHOD_SAVED: "payment.method.saved",
  PAYMENT_METHOD_DELETED: "payment.method.deleted",
  PAYMENT_METHOD_FAILED: "payment.method.failed",

  // Webhook events
  WEBHOOK_RECEIVED: "payment.webhook.received",
  WEBHOOK_PROCESSED: "payment.webhook.processed",
  WEBHOOK_FAILED: "payment.webhook.failed",

  // Risk and fraud events
  PAYMENT_RISK_ASSESSED: "payment.risk.assessed",
  PAYMENT_FRAUD_DETECTED: "payment.fraud.detected",
  PAYMENT_BLOCKED: "payment.blocked",

  // Analytics events
  PAYMENT_ANALYTICS: "payment.analytics",
  PAYMENT_CONVERSION: "payment.conversion",
};

// Payment Event Emitter
class PaymentEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for multiple subscribers
  }

  // Payment lifecycle events
  emitPaymentInitiated(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_INITIATED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_INITIATED,
    });
  }

  emitPaymentSuccessful(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_SUCCESSFUL, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_SUCCESSFUL,
    });
  }

  emitPaymentFailed(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_FAILED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_FAILED,
    });
  }

  emitPaymentCanceled(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_CANCELED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_CANCELED,
    });
  }

  emitPaymentRefunded(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_REFUNDED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_REFUNDED,
    });
  }

  emitPaymentPartiallyRefunded(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_PARTIALLY_REFUNDED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_PARTIALLY_REFUNDED,
    });
  }

  // Payment processing events
  emitPaymentProcessing(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_PROCESSING, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_PROCESSING,
    });
  }

  emitPaymentRequiresAction(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_REQUIRES_ACTION, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_REQUIRES_ACTION,
    });
  }

  emitPaymentCaptured(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_CAPTURED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_CAPTURED,
    });
  }

  // Dispute and chargeback events
  emitPaymentDisputed(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_DISPUTED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_DISPUTED,
    });
  }

  emitPaymentChargeback(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_CHARGEBACK, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_CHARGEBACK,
    });
  }

  emitDisputeResolved(data) {
    this.emit(PAYMENT_EVENTS.DISPUTE_RESOLVED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.DISPUTE_RESOLVED,
    });
  }

  // Refund events
  emitRefundInitiated(data) {
    this.emit(PAYMENT_EVENTS.REFUND_INITIATED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.REFUND_INITIATED,
    });
  }

  emitRefundSuccessful(data) {
    this.emit(PAYMENT_EVENTS.REFUND_SUCCESSFUL, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.REFUND_SUCCESSFUL,
    });
  }

  emitRefundFailed(data) {
    this.emit(PAYMENT_EVENTS.REFUND_FAILED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.REFUND_FAILED,
    });
  }

  // Payment method events
  emitPaymentMethodSaved(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_METHOD_SAVED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_METHOD_SAVED,
    });
  }

  emitPaymentMethodDeleted(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_METHOD_DELETED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_METHOD_DELETED,
    });
  }

  emitPaymentMethodFailed(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_METHOD_FAILED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_METHOD_FAILED,
    });
  }

  // Webhook events
  emitWebhookReceived(data) {
    this.emit(PAYMENT_EVENTS.WEBHOOK_RECEIVED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.WEBHOOK_RECEIVED,
    });
  }

  emitWebhookProcessed(data) {
    this.emit(PAYMENT_EVENTS.WEBHOOK_PROCESSED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.WEBHOOK_PROCESSED,
    });
  }

  emitWebhookFailed(data) {
    this.emit(PAYMENT_EVENTS.WEBHOOK_FAILED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.WEBHOOK_FAILED,
    });
  }

  // Risk and fraud events
  emitPaymentRiskAssessed(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_RISK_ASSESSED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_RISK_ASSESSED,
    });
  }

  emitPaymentFraudDetected(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_FRAUD_DETECTED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_FRAUD_DETECTED,
    });
  }

  emitPaymentBlocked(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_BLOCKED, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_BLOCKED,
    });
  }

  // Analytics events
  emitPaymentAnalytics(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_ANALYTICS, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_ANALYTICS,
    });
  }

  emitPaymentConversion(data) {
    this.emit(PAYMENT_EVENTS.PAYMENT_CONVERSION, {
      ...data,
      timestamp: new Date(),
      eventType: PAYMENT_EVENTS.PAYMENT_CONVERSION,
    });
  }
}

// Create singleton instance
const paymentEventEmitter = new PaymentEventEmitter();

module.exports = {
  PAYMENT_EVENTS,
  paymentEventEmitter,
  PaymentEventEmitter,
};
