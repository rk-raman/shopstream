const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productImage: String,
  variant: {
    name: String,
    value: String,
    sku: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: Number,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: "India",
  },
  phone: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    // Order Identification
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Customer Information
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order Items
    items: [orderItemSchema],

    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // Addresses
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    billingAddress: shippingAddressSchema,

    // Order Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "pending",
    },

    // Status History
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Payment Information
    payment: {
      method: {
        type: String,
        enum: ["cod", "card", "upi", "wallet", "netbanking"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded", "partial_refund"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
      refundAmount: Number,
      refundReason: String,
    },

    // Shipping Information
    shipping: {
      method: {
        type: String,
        enum: ["standard", "express", "same_day"],
        default: "standard",
      },
      trackingNumber: String,
      carrier: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
    },

    // Coupon/Discount
    coupon: {
      code: String,
      discountAmount: Number,
      discountType: {
        type: String,
        enum: ["percentage", "fixed"],
      },
    },

    // Special Instructions
    notes: String,
    specialInstructions: String,

    // Cancellation/Return
    cancellationReason: String,
    returnReason: String,
    returnRequestedAt: Date,
    returnApprovedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "items.seller": 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD${Date.now()}${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

// Instance methods
orderSchema.methods.updateStatus = function (newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy,
    timestamp: new Date(),
  });

  // Update specific timestamps
  if (newStatus === "delivered") {
    this.shipping.actualDelivery = new Date();
  }

  return this.save();
};

orderSchema.methods.canBeCancelled = function () {
  return ["pending", "confirmed"].includes(this.status);
};

orderSchema.methods.canBeReturned = function () {
  return (
    this.status === "delivered" &&
    Date.now() - this.shipping.actualDelivery.getTime() <=
      7 * 24 * 60 * 60 * 1000
  ); // 7 days
};

// Static methods
orderSchema.statics.findByCustomer = function (customerId) {
  return this.find({ customer: customerId }).sort({ createdAt: -1 });
};

orderSchema.statics.findBySeller = function (sellerId) {
  return this.find({ "items.seller": sellerId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Order", orderSchema);
