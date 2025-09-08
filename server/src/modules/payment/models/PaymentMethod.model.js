const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ["stripe", "paypal", "razorpay"],
      required: true,
    },
    gatewayMethodId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["card", "bank_account", "digital_wallet"],
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      // Card details (masked)
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
      // Bank account details (masked)
      bankName: String,
      accountType: String,
      // Digital wallet details
      walletType: String,
      // Common fields
      country: String,
      currency: String,
    },
    fingerprint: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
paymentMethodSchema.index({ user: 1, isDefault: 1 });
paymentMethodSchema.index({ user: 1, isActive: 1 });
paymentMethodSchema.index({ gateway: 1, gatewayMethodId: 1 });

// Ensure only one default payment method per user
paymentMethodSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Virtual for display name
paymentMethodSchema.virtual("displayName").get(function () {
  if (this.type === "card") {
    return `${this.metadata.brand} ending in ${this.metadata.last4}`;
  } else if (this.type === "bank_account") {
    return `${this.metadata.bankName} ${this.metadata.accountType}`;
  } else if (this.type === "digital_wallet") {
    return `${this.metadata.walletType} wallet`;
  }
  return "Payment method";
});

// Instance method to get safe representation
paymentMethodSchema.methods.getSafeData = function () {
  return {
    _id: this._id,
    gateway: this.gateway,
    type: this.type,
    isDefault: this.isDefault,
    isActive: this.isActive,
    displayName: this.displayName,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to get user's default payment method
paymentMethodSchema.statics.getDefaultForUser = function (userId) {
  return this.findOne({ user: userId, isDefault: true, isActive: true });
};

// Static method to get user's active payment methods
paymentMethodSchema.statics.getActiveForUser = function (userId) {
  return this.find({ user: userId, isActive: true }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

// Add pagination plugin
paymentMethodSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
