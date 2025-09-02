const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["in", "out", "reserved", "released", "adjustment"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reference: {
    type: String, // Order ID, Purchase ID, etc.
    required: true,
  },
  reason: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      sku: {
        type: String,
        required: true,
        unique: true,
      },
    },

    // Stock levels
    totalStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Thresholds
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    reorderPoint: {
      type: Number,
      default: 10,
    },

    // Location and warehouse info
    location: {
      warehouse: String,
      zone: String,
      shelf: String,
    },

    // Stock movements history
    movements: [stockMovementSchema],

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
    },

    // Alerts
    alerts: [
      {
        type: {
          type: String,
          enum: ["low_stock", "out_of_stock", "overstock"],
        },
        message: String,
        isResolved: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
inventorySchema.index({ product: 1 });
inventorySchema.index({ "variant.sku": 1 });
inventorySchema.index({ availableStock: 1 });
inventorySchema.index({ status: 1 });

// Virtual for stock status
inventorySchema.virtual("stockStatus").get(function () {
  if (this.availableStock <= 0) return "out_of_stock";
  if (this.availableStock <= this.lowStockThreshold) return "low_stock";
  return "in_stock";
});

// Methods
inventorySchema.methods.addStock = function (
  quantity,
  reference,
  reason,
  performedBy
) {
  this.totalStock += quantity;
  this.availableStock += quantity;

  this.movements.push({
    type: "in",
    quantity,
    reference,
    reason,
    performedBy,
  });

  return this.save();
};

inventorySchema.methods.removeStock = function (
  quantity,
  reference,
  reason,
  performedBy
) {
  if (this.availableStock < quantity) {
    throw new Error("Insufficient available stock");
  }

  this.totalStock -= quantity;
  this.availableStock -= quantity;

  this.movements.push({
    type: "out",
    quantity,
    reference,
    reason,
    performedBy,
  });

  return this.save();
};

inventorySchema.methods.reserveStock = function (quantity, reference) {
  if (this.availableStock < quantity) {
    throw new Error("Insufficient available stock");
  }

  this.availableStock -= quantity;
  this.reservedStock += quantity;

  this.movements.push({
    type: "reserved",
    quantity,
    reference,
  });

  return this.save();
};

inventorySchema.methods.releaseStock = function (quantity, reference) {
  this.availableStock += quantity;
  this.reservedStock -= quantity;

  this.movements.push({
    type: "released",
    quantity,
    reference,
  });

  return this.save();
};

inventorySchema.methods.checkAndCreateAlerts = function () {
  // Clear existing unresolved alerts
  this.alerts = this.alerts.filter((alert) => alert.isResolved);

  if (this.availableStock <= 0) {
    this.alerts.push({
      type: "out_of_stock",
      message: "Product is out of stock",
    });
  } else if (this.availableStock <= this.lowStockThreshold) {
    this.alerts.push({
      type: "low_stock",
      message: `Stock is running low. Only ${this.availableStock} units remaining.`,
    });
  }
};

// Pre-save middleware
inventorySchema.pre("save", function (next) {
  this.checkAndCreateAlerts();
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
