const Payment = require("../models/Payment.model");
const ApiError = require("../../../shared/utils/apiError");
const PaymentEventPublisher = require("../events/publishers/PaymentEventPublisher");

// Payment gateway adapters
const StripeAdapter = require("./gateways/StripeAdapter");
const PayPalAdapter = require("./gateways/PayPalAdapter");

class PaymentService {
  constructor() {
    this.eventPublisher = new PaymentEventPublisher();
    this.gateways = {
      stripe: new StripeAdapter(),
      paypal: new PayPalAdapter(),
      // Add more gateways here as needed
    };
  }

  // Get gateway adapter
  getGateway(gatewayName) {
    const gateway = this.gateways[gatewayName];
    if (!gateway) {
      throw new ApiError(400, `Unsupported payment gateway: ${gatewayName}`);
    }
    return gateway;
  }

  // Create payment intent
  async createPaymentIntent(paymentData, userId) {
    try {
      const {
        orderId,
        amount,
        currency = "USD",
        gateway = "stripe",
        paymentMethod,
        billingAddress,
        metadata = {},
      } = paymentData;

      // Validate required fields
      if (!orderId || !amount || !amount.subtotal) {
        throw new ApiError(400, "Missing required payment data");
      }

      // Get gateway adapter
      const gatewayAdapter = this.getGateway(gateway);

      // Create payment intent with gateway
      const gatewayResponse = await gatewayAdapter.createPaymentIntent({
        amount: amount.total || amount.subtotal,
        currency,
        metadata: {
          orderId: orderId.toString(),
          userId: userId.toString(),
          ...metadata,
        },
      });

      // Create payment record
      const payment = await Payment.create({
        orderId,
        userId,
        gateway,
        gatewayTransactionId: gatewayResponse.id,
        paymentIntentId: gatewayResponse.id,
        amount,
        currency: currency.toUpperCase(),
        status: "pending",
        paymentMethod,
        billingAddress,
        gatewayResponse: {
          raw: gatewayResponse,
          clientSecret: gatewayResponse.client_secret,
        },
        metadata: {
          ...metadata,
          source: "web",
        },
      });

      // Publish event
      await this.eventPublisher.publishPaymentInitiated({
        paymentId: payment.paymentId,
        orderId,
        userId,
        amount: amount.total || amount.subtotal,
        currency,
        gateway,
        paymentMethod: paymentMethod?.type,
        metadata,
      });

      return {
        payment: payment.getSummary(),
        clientSecret: gatewayResponse.client_secret,
        gatewayData: gatewayResponse,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create payment intent");
    }
  }

  // Confirm payment
  async confirmPayment(paymentId, confirmationData = {}) {
    try {
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }

      if (payment.status !== "pending") {
        throw new ApiError(
          400,
          `Payment cannot be confirmed. Current status: ${payment.status}`
        );
      }

      // Get gateway adapter
      const gatewayAdapter = this.getGateway(payment.gateway);

      // Confirm payment with gateway
      const gatewayResponse = await gatewayAdapter.confirmPayment(
        payment.paymentIntentId,
        confirmationData
      );

      // Update payment based on gateway response
      if (gatewayResponse.status === "succeeded") {
        payment.markAsSucceeded({
          ...payment.gatewayResponse,
          ...gatewayResponse,
        });

        // Publish success event
        await this.eventPublisher.publishPaymentSuccessful({
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          userId: payment.userId,
          amount: payment.amount.total,
          currency: payment.currency,
          gateway: payment.gateway,
          gatewayTransactionId: payment.gatewayTransactionId,
          paymentMethod: payment.paymentMethod,
        });
      } else if (gatewayResponse.status === "requires_action") {
        payment.status = "processing";
        payment.gatewayResponse = {
          ...payment.gatewayResponse,
          ...gatewayResponse,
        };
      } else {
        payment.markAsFailed({
          code: gatewayResponse.last_payment_error?.code,
          message: gatewayResponse.last_payment_error?.message,
        });

        // Publish failure event
        await this.eventPublisher.publishPaymentFailed({
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          userId: payment.userId,
          amount: payment.amount.total,
          currency: payment.currency,
          gateway: payment.gateway,
          failureReason: payment.failureReason,
        });
      }

      await payment.save();
      return payment;
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to confirm payment");
    }
  }

  // Process webhook from payment gateway
  async processWebhook(gateway, webhookData, signature) {
    try {
      const gatewayAdapter = this.getGateway(gateway);

      // Verify webhook signature
      const isValid = await gatewayAdapter.verifyWebhook(
        webhookData,
        signature
      );
      if (!isValid) {
        throw new ApiError(400, "Invalid webhook signature");
      }

      const event = gatewayAdapter.parseWebhookEvent(webhookData);

      // Find payment by gateway transaction ID
      const payment = await Payment.findOne({
        $or: [
          { gatewayTransactionId: event.data.object.id },
          { paymentIntentId: event.data.object.id },
        ],
      });

      if (!payment) {
        console.warn(`Payment not found for webhook event: ${event.id}`);
        return { processed: false, reason: "Payment not found" };
      }

      // Add webhook event to payment record
      payment.webhookEvents.push({
        eventType: event.type,
        eventId: event.id,
        data: event.data,
      });

      // Process different event types
      switch (event.type) {
        case "payment_intent.succeeded":
          if (payment.status !== "succeeded") {
            payment.markAsSucceeded(event.data.object);
            await this.eventPublisher.publishPaymentSuccessful({
              paymentId: payment.paymentId,
              orderId: payment.orderId,
              userId: payment.userId,
              amount: payment.amount.total,
              currency: payment.currency,
              gateway: payment.gateway,
              gatewayTransactionId: payment.gatewayTransactionId,
            });
          }
          break;

        case "payment_intent.payment_failed":
          if (payment.status !== "failed") {
            payment.markAsFailed({
              code: event.data.object.last_payment_error?.code,
              message: event.data.object.last_payment_error?.message,
            });
            await this.eventPublisher.publishPaymentFailed({
              paymentId: payment.paymentId,
              orderId: payment.orderId,
              userId: payment.userId,
              failureReason: payment.failureReason,
            });
          }
          break;

        case "charge.dispute.created":
          payment.addDispute({
            disputeId: event.data.object.id,
            amount: event.data.object.amount / 100,
            reason: event.data.object.reason,
            status: event.data.object.status,
          });
          break;

        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }

      await payment.save();
      return { processed: true, eventType: event.type };
    } catch (error) {
      console.error("Error processing webhook:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to process webhook");
    }
  }

  // Refund payment
  async refundPayment(paymentId, refundData, refundedBy) {
    try {
      const { amount, reason = "requested_by_customer" } = refundData;

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }

      if (!payment.canBeRefunded()) {
        throw new ApiError(400, "Payment cannot be refunded");
      }

      const refundAmount = amount || payment.getRefundableAmount();
      if (refundAmount > payment.getRefundableAmount()) {
        throw new ApiError(400, "Refund amount exceeds refundable amount");
      }

      // Get gateway adapter
      const gatewayAdapter = this.getGateway(payment.gateway);

      // Process refund with gateway
      const gatewayRefund = await gatewayAdapter.createRefund({
        paymentIntentId: payment.paymentIntentId,
        amount: refundAmount,
        reason,
      });

      // Add refund to payment
      payment.addRefund({
        gatewayRefundId: gatewayRefund.id,
        amount: refundAmount,
        reason,
        status: gatewayRefund.status === "succeeded" ? "succeeded" : "pending",
        processedAt: gatewayRefund.status === "succeeded" ? new Date() : null,
        processedBy: refundedBy,
      });

      await payment.save();

      // Publish refund event
      await this.eventPublisher.publishPaymentRefunded({
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        userId: payment.userId,
        refundAmount,
        totalRefunded: payment.totalRefunded,
        reason,
        processedBy: refundedBy,
      });

      return payment;
    } catch (error) {
      console.error("Error processing refund:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to process refund");
    }
  }

  // Get payment by ID
  async getPaymentById(paymentId, userId = null) {
    try {
      const query = { paymentId };
      if (userId) query.userId = userId;

      const payment = await Payment.findOne(query)
        .populate("orderId", "orderNumber items status")
        .populate("userId", "firstName lastName email");

      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }

      return payment;
    } catch (error) {
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve payment");
    }
  }

  // Get payments by user
  async getPaymentsByUser(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        gateway,
        startDate,
        endDate,
      } = options;

      const filter = { userId };
      if (status) filter.status = status;
      if (gateway) filter.gateway = gateway;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const paginationOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [{ path: "orderId", select: "orderNumber items status" }],
      };

      return await Payment.paginate(filter, paginationOptions);
    } catch (error) {
      throw new ApiError(500, "Failed to retrieve user payments");
    }
  }

  // Get payments by order
  async getPaymentsByOrder(orderId) {
    try {
      return await Payment.findByOrder(orderId);
    } catch (error) {
      throw new ApiError(500, "Failed to retrieve order payments");
    }
  }

  // Get payment statistics
  async getPaymentStats(filters = {}) {
    try {
      const stats = await Payment.getStats(filters);
      return (
        stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          avgAmount: 0,
          successfulPayments: 0,
          failedPayments: 0,
          totalRefunded: 0,
        }
      );
    } catch (error) {
      throw new ApiError(500, "Failed to retrieve payment statistics");
    }
  }

  // Cancel payment
  async cancelPayment(paymentId, userId = null) {
    try {
      const query = { paymentId };
      if (userId) query.userId = userId;

      const payment = await Payment.findOne(query);
      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }

      if (!["pending", "processing"].includes(payment.status)) {
        throw new ApiError(
          400,
          `Payment cannot be canceled. Current status: ${payment.status}`
        );
      }

      // Get gateway adapter
      const gatewayAdapter = this.getGateway(payment.gateway);

      // Cancel payment with gateway
      await gatewayAdapter.cancelPayment(payment.paymentIntentId);

      // Update payment status
      payment.status = "canceled";
      payment.processedAt = new Date();
      await payment.save();

      return payment;
    } catch (error) {
      console.error("Error canceling payment:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to cancel payment");
    }
  }

  // Retry failed payment
  async retryPayment(paymentId, userId = null) {
    try {
      const query = { paymentId };
      if (userId) query.userId = userId;

      const payment = await Payment.findOne(query);
      if (!payment) {
        throw new ApiError(404, "Payment not found");
      }

      if (payment.status !== "failed") {
        throw new ApiError(
          400,
          `Payment cannot be retried. Current status: ${payment.status}`
        );
      }

      // Create new payment intent
      return await this.createPaymentIntent(
        {
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          paymentMethod: payment.paymentMethod,
          billingAddress: payment.billingAddress,
          metadata: { ...payment.metadata, retryOf: paymentId },
        },
        userId
      );
    } catch (error) {
      console.error("Error retrying payment:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retry payment");
    }
  }
}

module.exports = new PaymentService();
