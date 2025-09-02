const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Size", "Color"
  },
  value: {
    type: String,
    required: true, // e.g., "XL", "Red"
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: Number,
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const specificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },

    // Categorization
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    tags: [String],

    // Pricing
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    // Media
    images: [
      {
        public_id: String,
        url: {
          type: String,
          required: true,
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    videos: [
      {
        public_id: String,
        url: String,
      },
    ],

    // Inventory (for simple products without variants)
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Variants (for complex products)
    variants: [variantSchema],
    hasVariants: {
      type: Boolean,
      default: false,
    },

    // Specifications
    specifications: [specificationSchema],

    // Seller Information
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ratings & Reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "discontinued"],
      default: "draft",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },

    // SEO
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },

    // Shipping
    weight: Number, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    shippingClass: {
      type: String,
      enum: ["standard", "heavy", "fragile", "liquid"],
      default: "standard",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ "rating.average": -1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for effective price
productSchema.virtual("effectivePrice").get(function () {
  return this.discountPrice || this.basePrice;
});

// Virtual for discount percentage calculation
productSchema.virtual("calculatedDiscountPercentage").get(function () {
  if (this.discountPrice && this.discountPrice < this.basePrice) {
    return Math.round(
      ((this.basePrice - this.discountPrice) / this.basePrice) * 100
    );
  }
  return 0;
});

// Virtual for total stock (including variants)
productSchema.virtual("totalStock").get(function () {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  return this.stock;
});

// Pre-save middleware
productSchema.pre("save", function (next) {
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  }

  // Calculate discount percentage
  if (this.discountPrice && this.basePrice) {
    this.discountPercentage = Math.round(
      ((this.basePrice - this.discountPrice) / this.basePrice) * 100
    );
  }

  // Ensure only one main image
  const mainImages = this.images.filter((img) => img.isMain);
  if (mainImages.length > 1) {
    this.images.forEach((img, index) => {
      img.isMain = index === 0;
    });
  } else if (mainImages.length === 0 && this.images.length > 0) {
    this.images[0].isMain = true;
  }

  next();
});

// Static methods
productSchema.statics.findActive = function () {
  return this.find({ status: "active", isApproved: true });
};

productSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId });
};

module.exports = mongoose.model("Product", productSchema);
