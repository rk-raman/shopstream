const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const paymentSchema = new mongoose.Schema(
  {
    // Payment identification
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Order reference
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Payment gateway information
    gateway: {
      type: String,
      enum: ["stripe", "paypal", "razorpay", "square", "manual"],
      required: true,
      default: "stripe",
    },

    // Gateway-specific transaction ID
    gatewayTransactionId: {
      type: String,
      required: true,
      index: true,
    },

    // Payment intent/session ID (for Stripe)
    paymentIntentId: {
      type: String,
      index: true,
    },

    // Payment method information
    paymentMethod: {
      type: {
        type: String,
        enum: ["card", "bank_transfer", "wallet", "upi", "cash"],
        required: true,
      },
      details: {
        // Card details (masked)
        last4: String,
        brand: String, // visa, mastercard, etc.
        expiryMonth: Number,
        expiryYear: Number,

        // Bank transfer details
        bankName: String,
        accountLast4: String,

        // Wallet details
        walletProvider: String, // apple_pay, google_pay, etc.

        // UPI details
        upiId: String,
      },
    },

    // Amount information
    amount: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
      },
      shipping: {
        type: Number,
        default: 0,
        min: 0,
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // Currency
    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
    },

    // Payment status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "canceled",
        "refunded",
        "partially_refunded",
        "disputed",
        "chargeback",
      ],
      required: true,
      default: "pending",
      index: true,
    },

    // Payment flow type
    paymentType: {
      type: String,
      enum: ["one_time", "subscription", "installment"],
      required: true,
      default: "one_time",
    },

    // Billing address
    billingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    // Gateway response data
    gatewayResponse: {
      raw: mongoose.Schema.Types.Mixed, // Raw response from gateway
      receiptUrl: String,
      receiptNumber: String,
      networkTransactionId: String,
    },

    // Refund information
    refunds: [
      {
        refundId: {
          type: String,
          required: true,
        },
        gatewayRefundId: String,
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        reason: {
          type: String,
          enum: [
            "duplicate",
            "fraudulent",
            "requested_by_customer",
            "expired_uncaptured_charge",
          ],
        },
        status: {
          type: String,
          enum: ["pending", "succeeded", "failed", "canceled"],
          default: "pending",
        },
        processedAt: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        processedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    // Dispute information
    disputes: [
      {
        disputeId: String,
        amount: Number,
        reason: String,
        status: String,
        evidence: mongoose.Schema.Types.Mixed,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Failure information
    failureReason: {
      code: String,
      message: String,
      declineCode: String,
      networkReasonCode: String,
    },

    // Metadata for additional information
    metadata: {
      customerIp: String,
      userAgent: String,
      source: {
        type: String,
        default: "web",
      },
      campaignId: String,
      affiliateId: String,
      notes: String,
    },

    // Timestamps
    processedAt: Date,
    capturedAt: Date,
    refundedAt: Date,

    // Risk assessment
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "blocked"],
    },

    // Webhook events tracking
    webhookEvents: [
      {
        eventType: String,
        eventId: String,
        processedAt: {
          type: Date,
          default: Date.now,
        },
        data: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ gateway: 1, status: 1 });
paymentSchema.index({ gatewayTransactionId: 1, gateway: 1 });
paymentSchema.index({ paymentIntentId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ "amount.total": 1, currency: 1 });

// Virtual for total refunded amount
paymentSchema.virtual("totalRefunded").get(function () {
  return this.refunds
    .filter((refund) => refund.status === "succeeded")
    .reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for refund status
paymentSchema.virtual("refundStatus").get(function () {
  const totalRefunded = this.totalRefunded;
  if (totalRefunded === 0) return "none";
  if (totalRefunded >= this.amount.total) return "full";
  return "partial";
});

// Virtual for payment age in days
paymentSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate payment ID
paymentSchema.pre("save", function (next) {
  if (!this.paymentId) {
    this.paymentId = `pay_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

// Pre-save middleware to calculate total amount
paymentSchema.pre("save", function (next) {
  if (this.amount) {
    this.amount.total =
      (this.amount.subtotal || 0) +
      (this.amount.tax || 0) +
      (this.amount.shipping || 0) -
      (this.amount.discount || 0);
  }
  next();
});

// Instance method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function () {
  return (
    this.status === "succeeded" &&
    this.totalRefunded < this.amount.total &&
    this.ageInDays <= 180 // 6 months refund window
  );
};

// Instance method to get refundable amount
paymentSchema.methods.getRefundableAmount = function () {
  if (!this.canBeRefunded()) return 0;
  return this.amount.total - this.totalRefunded;
};

// Instance method to add refund
paymentSchema.methods.addRefund = function (refundData) {
  this.refunds.push({
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...refundData,
  });

  // Update payment status if fully refunded
  if (this.totalRefunded >= this.amount.total) {
    this.status = "refunded";
    this.refundedAt = new Date();
  } else if (this.totalRefunded > 0) {
    this.status = "partially_refunded";
  }
};

// Instance method to add dispute
paymentSchema.methods.addDispute = function (disputeData) {
  this.disputes.push(disputeData);
  this.status = "disputed";
};

// Instance method to mark as failed
paymentSchema.methods.markAsFailed = function (failureReason) {
  this.status = "failed";
  this.failureReason = failureReason;
  this.processedAt = new Date();
};

// Instance method to mark as succeeded
paymentSchema.methods.markAsSucceeded = function (gatewayResponse = {}) {
  this.status = "succeeded";
  this.processedAt = new Date();
  this.capturedAt = new Date();
  if (gatewayResponse) {
    this.gatewayResponse = { ...this.gatewayResponse, ...gatewayResponse };
  }
};

// Instance method to get payment summary
paymentSchema.methods.getSummary = function () {
  return {
    paymentId: this.paymentId,
    orderId: this.orderId,
    amount: this.amount.total,
    currency: this.currency,
    status: this.status,
    gateway: this.gateway,
    paymentMethod: this.paymentMethod.type,
    createdAt: this.createdAt,
    processedAt: this.processedAt,
  };
};

// Static method to find payments by user
paymentSchema.statics.findByUser = function (userId, options = {}) {
  const { status, gateway, limit = 10, skip = 0 } = options;

  const query = { userId };
  if (status) query.status = status;
  if (gateway) query.gateway = gateway;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("orderId", "orderNumber items")
    .populate("userId", "firstName lastName email");
};

// Static method to find payments by order
paymentSchema.statics.findByOrder = function (orderId) {
  return this.find({ orderId })
    .sort({ createdAt: -1 })
    .populate("userId", "firstName lastName email");
};

// Static method to get payment statistics
paymentSchema.statics.getStats = function (filters = {}) {
  const matchStage = {};

  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate)
      matchStage.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
  }

  if (filters.gateway) matchStage.gateway = filters.gateway;
  if (filters.status) matchStage.status = filters.status;

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount.total" },
        avgAmount: { $avg: "$amount.total" },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ["$status", "succeeded"] }, 1, 0] },
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        totalRefunded: {
          $sum: {
            $cond: [
              { $in: ["$status", ["refunded", "partially_refunded"]] },
              "$totalRefunded",
              0,
            ],
          },
        },
      },
    },
  ]);
};

// Add pagination plugin
paymentSchema.plugin(mongoosePaginate);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
