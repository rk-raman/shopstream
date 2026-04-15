const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema({
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
    variantId: mongoose.Schema.Types.ObjectId,
    name: String,
    value: String,
    sku: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: Number,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deliveryEstimate: {
    date: Date,
    method: {
      type: String,
      enum: ["standard", "express", "same_day"],
      default: "standard",
    },
  },
});

const checkoutSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "abandoned", "expired"],
      default: "active",
    },

    currentStep: {
      type: String,
      enum: ["login", "address", "summary", "payment"],
      default: "address",
    },

    // Step 1 - Address
    selectedAddressId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    deliveryAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
      type: {
        type: String,
        enum: ["home", "office", "other"],
        default: "home",
      },
    },

    // Step 2 - Order Summary (items snapshot from cart)
    items: [checkoutItemSchema],

    // Pricing
    pricing: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      deliveryCharge: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    // Coupon
    appliedCoupon: {
      couponId: mongoose.Schema.Types.ObjectId,
      code: String,
      discountType: {
        type: String,
        enum: ["percentage", "flat"],
      },
      discountValue: Number,
      discountAmount: Number,
    },

    // Step 3 - Payment
    selectedPaymentMethod: {
      type: String,
      enum: ["upi", "card", "wallet", "cod", "emi", "netbanking"],
    },
    paymentIntentId: String,

    // Result
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // Meta
    cartSnapshotAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 min TTL
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
checkoutSessionSchema.index({ user: 1, status: 1 });
checkoutSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
checkoutSessionSchema.index({ status: 1, createdAt: -1 });

// Instance methods
checkoutSessionSchema.methods.refreshExpiry = function () {
  this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  return this;
};

checkoutSessionSchema.methods.calculatePricing = function () {
  let subtotal = 0;

  this.items.forEach((item) => {
    const effectivePrice = item.discountPrice || item.price;
    subtotal += effectivePrice * item.quantity;
  });

  const tax = Math.round(subtotal * 0.18); // 18% GST
  const deliveryCharge = subtotal > 500 ? 0 : 40;

  let discount = 0;
  if (this.appliedCoupon && this.appliedCoupon.discountAmount) {
    discount = this.appliedCoupon.discountAmount;
  }

  const total = subtotal + tax + deliveryCharge - discount;

  this.pricing = { subtotal, discount, deliveryCharge, tax, total };
  return this;
};

module.exports = mongoose.model("CheckoutSession", checkoutSessionSchema);
