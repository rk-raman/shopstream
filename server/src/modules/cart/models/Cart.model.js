const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
    },
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
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalDiscountedPrice: {
      type: Number,
      default: 0,
    },
    savedAmount: {
      type: Number,
      default: 0,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
cartSchema.index({ user: 1 });
cartSchema.index({ "items.product": 1 });

// Pre-save middleware to calculate totals
cartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  this.totalPrice = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  this.totalDiscountedPrice = this.items.reduce((total, item) => {
    const effectivePrice = item.discountPrice || item.price;
    return total + effectivePrice * item.quantity;
  }, 0);

  this.savedAmount = this.totalPrice - this.totalDiscountedPrice;
  this.lastModified = new Date();

  next();
});

// Instance methods
cartSchema.methods.addItem = function (productData) {
  const { product, variant, quantity, price, discountPrice } = productData;

  // Check if item already exists
  const existingItemIndex = this.items.findIndex((item) => {
    return (
      item.product.toString() === product.toString() &&
      (!variant ||
        item.variant?.variantId?.toString() === variant?.variantId?.toString())
    );
  });

  if (existingItemIndex > -1) {
    // Update quantity
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price;
    this.items[existingItemIndex].discountPrice = discountPrice;
  } else {
    // Add new item
    this.items.push({
      product,
      variant,
      quantity,
      price,
      discountPrice,
    });
  }

  return this.save();
};

cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error("Item not found in cart");
  }

  if (quantity <= 0) {
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  return this.save();
};

cartSchema.methods.removeItem = function (itemId) {
  this.items.pull(itemId);
  return this.save();
};

cartSchema.methods.clear = function () {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model("Cart", cartSchema);
