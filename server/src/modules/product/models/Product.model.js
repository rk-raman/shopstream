const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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
      index: true,
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
      index: true,
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
      index: true,
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
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
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
    salesCount: {
      type: Number,
      default: 0,
    },
    wishlistCount: {
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

    // Additional fields for better functionality
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    isDigital: {
      type: Boolean,
      default: false,
    },
    downloadableFiles: [
      {
        name: String,
        url: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound Indexes for better performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1, isApproved: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ "rating.average": -1 });
productSchema.index({ basePrice: 1, discountPrice: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ isFeatured: 1, status: 1, isApproved: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ tags: 1 });

// Add pagination plugin
productSchema.plugin(mongoosePaginate);

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

// Virtual for availability status
productSchema.virtual("isAvailable").get(function () {
  return this.status === "active" && this.isApproved && this.totalStock > 0;
});

// Virtual for low stock status
productSchema.virtual("isLowStock").get(function () {
  return this.totalStock <= this.lowStockThreshold && this.totalStock > 0;
});

// Virtual for out of stock status
productSchema.virtual("isOutOfStock").get(function () {
  return this.totalStock === 0;
});

// Virtual for main image
productSchema.virtual("mainImage").get(function () {
  const mainImg = this.images.find((img) => img.isMain);
  return mainImg || (this.images.length > 0 ? this.images[0] : null);
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

// Instance methods
productSchema.methods.addVariant = function (variantData) {
  this.variants.push(variantData);
  this.hasVariants = true;
  return this.variants[this.variants.length - 1];
};

productSchema.methods.removeVariant = function (variantId) {
  this.variants.pull(variantId);
  if (this.variants.length === 0) {
    this.hasVariants = false;
  }
  return true;
};

productSchema.methods.updateVariant = function (variantId, updateData) {
  const variant = this.variants.id(variantId);
  if (!variant) return null;

  Object.assign(variant, updateData);
  return variant;
};

productSchema.methods.getVariantBySku = function (sku) {
  return this.variants.find((variant) => variant.sku === sku);
};

productSchema.methods.addSpecification = function (name, value) {
  const existingSpec = this.specifications.find((spec) => spec.name === name);
  if (existingSpec) {
    existingSpec.value = value;
  } else {
    this.specifications.push({ name, value });
  }
  return this.specifications;
};

productSchema.methods.removeSpecification = function (name) {
  const index = this.specifications.findIndex((spec) => spec.name === name);
  if (index > -1) {
    this.specifications.splice(index, 1);
    return true;
  }
  return false;
};

productSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.rating;
};

productSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.viewCount;
};

productSchema.methods.incrementSalesCount = function (quantity = 1) {
  this.salesCount += quantity;
  return this.salesCount;
};

productSchema.methods.updateStock = function (quantity, variantId = null) {
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    if (variant) {
      variant.stock = Math.max(0, variant.stock + quantity);
      return variant.stock;
    }
  } else {
    this.stock = Math.max(0, this.stock + quantity);
    return this.stock;
  }
  return null;
};

// Static methods
productSchema.statics.findActive = function () {
  return this.find({ status: "active", isApproved: true });
};

productSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId });
};

productSchema.statics.findByCategory = function (categoryId) {
  return this.find({
    category: categoryId,
    status: "active",
    isApproved: true,
  });
};

productSchema.statics.findFeatured = function (limit = 10) {
  return this.find({ isFeatured: true, status: "active", isApproved: true })
    .limit(limit)
    .sort({ createdAt: -1 });
};

productSchema.statics.findLowStock = function (threshold = null) {
  const stockThreshold = threshold || 10;
  return this.find({
    status: "active",
    isApproved: true,
    $or: [
      { hasVariants: false, stock: { $lte: stockThreshold, $gt: 0 } },
      { hasVariants: true, "variants.stock": { $lte: stockThreshold, $gt: 0 } },
    ],
  });
};

productSchema.statics.findOutOfStock = function () {
  return this.find({
    status: "active",
    isApproved: true,
    $or: [
      { hasVariants: false, stock: 0 },
      { hasVariants: true, "variants.stock": 0 },
    ],
  });
};

productSchema.statics.searchProducts = function (searchTerm, options = {}) {
  const { page = 1, limit = 12, category, brand, minPrice, maxPrice } = options;

  const filter = {
    $text: { $search: searchTerm },
    status: "active",
    isApproved: true,
  };

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
  }

  return this.paginate(filter, {
    page,
    limit,
    sort: { score: { $meta: "textScore" } },
    populate: [
      { path: "category", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName" },
    ],
  });
};

module.exports = mongoose.model("Product", productSchema);
