const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validTo: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

couponSchema.methods.isValid = function (orderAmount, userId) {
  const now = new Date();

  if (!this.isActive) return { valid: false, message: "Coupon is inactive" };
  if (now < this.validFrom)
    return { valid: false, message: "Coupon is not yet active" };
  if (now > this.validTo)
    return { valid: false, message: "Coupon has expired" };
  if (this.usageLimit && this.usedCount >= this.usageLimit)
    return { valid: false, message: "Coupon usage limit reached" };
  if (orderAmount < this.minOrderAmount)
    return {
      valid: false,
      message: `Minimum order amount is ₹${this.minOrderAmount}`,
    };

  // Check per-user limit
  if (userId) {
    const userUsage = this.usedBy.filter(
      (u) => u.user.toString() === userId.toString()
    );
    if (userUsage.length >= this.perUserLimit)
      return {
        valid: false,
        message: "You have already used this coupon",
      };
  }

  return { valid: true, message: "Coupon is valid" };
};

couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;

  if (this.type === "percentage") {
    discount = Math.round((orderAmount * this.value) / 100);
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = this.value;
  }

  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model("Coupon", couponSchema);
