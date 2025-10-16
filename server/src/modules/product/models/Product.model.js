const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const slugify = require("slugify");

// ==================== SUB-SCHEMAS ====================

/**
 * Variant Schema - For product variations like size, color, etc.
 */
const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Variant name is required"],
      trim: true,
      maxlength: [50, "Variant name cannot exceed 50 characters"],
    },
    value: {
      type: String,
      required: [true, "Variant value is required"],
      trim: true,
      maxlength: [100, "Variant value cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0.01, "Variant price must be positive"],
    },
    discountPrice: {
      type: Number,
      min: [0.01, "Variant discount price must be positive"],
      validate: {
        validator: function (value) {
          return !value || value < this.price;
        },
        message: "Discount price must be less than base price",
      },
    },
    stock: {
      type: Number,
      required: [true, "Variant stock is required"],
      min: [0, "Variant stock cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, "Variant SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "SKU must be at least 3 characters"],
      maxlength: [50, "SKU cannot exceed 50 characters"],
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Image must be a valid URL",
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Specification Schema - For product specifications
 */
const specificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Specification name is required"],
    trim: true,
    maxlength: [100, "Specification name cannot exceed 100 characters"],
  },
  value: {
    type: String,
    required: [true, "Specification value is required"],
    trim: true,
    maxlength: [500, "Specification value cannot exceed 500 characters"],
  },
  category: {
    type: String,
    enum: ["technical", "physical", "performance", "compatibility", "other"],
    default: "other",
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
});

/**
 * Image Schema - For product images
 */
const imageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: [true, "Image URL is required"],
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: "Image URL must be valid",
    },
  },
  isMain: {
    type: Boolean,
    default: false,
  },
  alt: {
    type: String,
    trim: true,
    maxlength: [200, "Alt text cannot exceed 200 characters"],
  },
  size: {
    type: Number,
    min: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Video Schema - For product videos
 */
const videoSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: [true, "Video URL is required"],
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: "Video URL must be valid",
    },
  },
  thumbnail: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: "Thumbnail must be a valid URL",
    },
  },
  duration: Number,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Dimensions Schema - For product dimensions
 */
const dimensionsSchema = new mongoose.Schema(
  {
    length: {
      type: Number,
      min: [0.01, "Length must be positive"],
    },
    width: {
      type: Number,
      min: [0.01, "Width must be positive"],
    },
    height: {
      type: Number,
      min: [0.01, "Height must be positive"],
    },
    unit: {
      type: String,
      enum: ["cm", "inch", "mm"],
      default: "cm",
    },
  },
  { _id: false }
);

/**
 * Downloadable File Schema - For digital products
 */
const downloadableFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
      maxlength: [100, "File name cannot exceed 100 characters"],
    },
    url: {
      type: String,
      required: [true, "File URL is required"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "File URL must be valid",
      },
    },
    size: {
      type: Number,
      min: 0,
    },
    type: {
      type: String,
      trim: true,
    },
    downloadLimit: {
      type: Number,
      min: -1, // -1 means unlimited
      default: -1,
    },
    expiryDays: {
      type: Number,
      min: 0,
      default: 0, // 0 means no expiry
    },
  },
  {
    timestamps: true,
  }
);

// ==================== MAIN PRODUCT SCHEMA ====================

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },

    // Categorization
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],

    // Pricing
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0.01, "Base price must be positive"],
      index: true,
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (value) {
          if (!value) return true;
          let base = this.basePrice;
          if (this.getUpdate) {
            const u = this.getUpdate();
            base =
              base != null ? base : (u.$set && u.$set.basePrice) || u.basePrice;
          }
          // if base still missing, decide: allow or block
          if (base == null) return true; // or return false to block
          return value < base;
        },
        message: "Discount price must be less than base price",
      },
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100"],
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },

    // Media
    images: {
      type: [imageSchema],
      validate: {
        validator: function (v) {
          return v.length <= 20;
        },
        message: "Cannot have more than 20 images",
      },
    },
    videos: {
      type: [videoSchema],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "Cannot have more than 5 videos",
      },
    },

    // Inventory (for simple products without variants)
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      minlength: [3, "SKU must be at least 3 characters"],
      maxlength: [50, "SKU cannot exceed 50 characters"],
    },

    // Variants (for complex products)
    variants: {
      type: [variantSchema],
      validate: {
        validator: function (v) {
          return v.length <= 100;
        },
        message: "Cannot have more than 100 variants",
      },
    },
    hasVariants: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Specifications
    specifications: {
      type: [specificationSchema],
      validate: {
        validator: function (v) {
          return v.length <= 50;
        },
        message: "Cannot have more than 50 specifications",
      },
    },

    // Seller Information
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
      index: true,
    },

    // Ratings & Reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        index: true,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      distribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
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
      enum: {
        values: ["draft", "active", "inactive", "discontinued"],
        message: "Status must be one of: draft, active, inactive, discontinued",
      },
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
    approvalNotes: {
      type: String,
      maxlength: [500, "Approval notes cannot exceed 500 characters"],
    },

    // SEO
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    metaKeywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, "Meta keyword cannot exceed 50 characters"],
      },
    ],

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    wishlistCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Shipping
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
      // Weight in grams
    },
    dimensions: dimensionsSchema,
    shippingClass: {
      type: String,
      enum: {
        values: ["standard", "heavy", "fragile", "liquid"],
        message:
          "Shipping class must be one of: standard, heavy, fragile, liquid",
      },
      default: "standard",
      index: true,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    shippingCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Additional fields
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    isDigital: {
      type: Boolean,
      default: false,
      index: true,
    },
    downloadableFiles: {
      type: [downloadableFileSchema],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Cannot have more than 10 downloadable files",
      },
    },

    // Dates
    publishedAt: {
      type: Date,
      index: true,
    },
    discontinuedAt: Date,

    // Additional tracking
    lastViewedAt: Date,
    lastSoldAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Text search index
productSchema.index({
  name: "text",
  description: "text",
  shortDescription: "text",
  tags: "text",
});

// Compound indexes for better query performance
productSchema.index({ category: 1, status: 1, isApproved: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ "rating.average": -1, salesCount: -1 });
productSchema.index({ basePrice: 1, discountPrice: 1 });
productSchema.index({ isFeatured: 1, status: 1, isApproved: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ tags: 1 });
productSchema.index({ publishedAt: -1 });

// Sparse indexes
productSchema.index({ sku: 1 }, { sparse: true });
productSchema.index({ "variants.sku": 1 }, { sparse: true });

// Add pagination plugin
productSchema.plugin(mongoosePaginate);

// ==================== VIRTUALS ====================

// Effective price (discount price or base price)
productSchema.virtual("effectivePrice").get(function () {
  return this.discountPrice || this.basePrice;
});

// Calculated discount percentage
productSchema.virtual("calculatedDiscountPercentage").get(function () {
  if (this.discountPrice && this.discountPrice < this.basePrice) {
    return Math.round(
      ((this.basePrice - this.discountPrice) / this.basePrice) * 100
    );
  }
  return this.discountPercentage || 0;
});

// Total stock (including variants)
productSchema.virtual("totalStock").get(function () {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  return this.stock || 0;
});

// Availability status
productSchema.virtual("isAvailable").get(function () {
  return this.status === "active" && this.isApproved && this.totalStock > 0;
});

// Low stock status
productSchema.virtual("isLowStock").get(function () {
  const threshold = this.lowStockThreshold;
  return this.totalStock <= threshold && this.totalStock > 0;
});

// Out of stock status
productSchema.virtual("isOutOfStock").get(function () {
  return this.totalStock === 0;
});

// Main image
productSchema.virtual("mainImage").get(function () {
  const mainImg = this.images.find((img) => img.isMain);
  return mainImg || (this.images.length > 0 ? this.images[0] : null);
});

// Is on sale
productSchema.virtual("isOnSale").get(function () {
  return !!(this.discountPrice && this.discountPrice < this.basePrice);
});

// Savings amount
productSchema.virtual("savingsAmount").get(function () {
  if (this.isOnSale) {
    return this.basePrice - this.discountPrice;
  }
  return 0;
});

// ==================== PRE-SAVE MIDDLEWARE ====================

productSchema.pre("save", function (next) {
  // Generate slug if not provided
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }

  // Calculate discount percentage
  if (
    this.discountPrice &&
    this.basePrice &&
    this.discountPrice < this.basePrice
  ) {
    this.discountPercentage = Math.round(
      ((this.basePrice - this.discountPrice) / this.basePrice) * 100
    );
  }

  // Ensure only one main image
  if (this.images && this.images.length > 0) {
    const mainImages = this.images.filter((img) => img.isMain);
    if (mainImages.length > 1) {
      this.images.forEach((img, index) => {
        img.isMain = index === 0;
      });
    } else if (mainImages.length === 0) {
      this.images[0].isMain = true;
    }
  }

  // Set publishedAt when status changes to active
  if (
    this.isModified("status") &&
    this.status === "active" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  // Set discontinuedAt when status changes to discontinued
  if (
    this.isModified("status") &&
    this.status === "discontinued" &&
    !this.discontinuedAt
  ) {
    this.discontinuedAt = new Date();
  }

  // Update hasVariants based on variants array
  this.hasVariants = this.variants && this.variants.length > 0;

  // Generate SKU if not provided for simple products
  if (!this.hasVariants && !this.sku) {
    this.sku = `PRD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;
  }

  next();
});

// ==================== PRE-REMOVE MIDDLEWARE ====================

productSchema.pre("remove", async function (next) {
  try {
    // Remove associated reviews
    if (this.reviews && this.reviews.length > 0) {
      await this.model("Review").deleteMany({ _id: { $in: this.reviews } });
    }

    // TODO: Remove images and videos from Cloudinary
    // TODO: Remove from wishlists
    // TODO: Remove from cart items

    next();
  } catch (error) {
    next(error);
  }
});

// ==================== INSTANCE METHODS ====================

// Variant management
productSchema.methods.addVariant = function (variantData) {
  this.variants.push(variantData);
  this.hasVariants = true;
  return this.variants[this.variants.length - 1];
};

productSchema.methods.removeVariant = function (variantId) {
  this.variants.pull(variantId);
  this.hasVariants = this.variants.length > 0;
  return this;
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

// Specification management
productSchema.methods.addSpecification = function (
  name,
  value,
  category = "other"
) {
  const existingSpec = this.specifications.find((spec) => spec.name === name);
  if (existingSpec) {
    existingSpec.value = value;
    existingSpec.category = category;
  } else {
    this.specifications.push({ name, value, category });
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

// Rating and analytics
productSchema.methods.updateRating = function (newRating, oldRating = null) {
  if (oldRating) {
    // Update existing rating
    const totalRating =
      this.rating.average * this.rating.count - oldRating + newRating;
    this.rating.average = totalRating / this.rating.count;
    this.rating.distribution[oldRating] = Math.max(
      0,
      this.rating.distribution[oldRating] - 1
    );
  } else {
    // Add new rating
    const totalRating = this.rating.average * this.rating.count + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
  }

  this.rating.distribution[newRating] =
    (this.rating.distribution[newRating] || 0) + 1;
  return this.rating;
};

productSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.viewCount;
};

productSchema.methods.incrementSalesCount = function (quantity = 1) {
  this.salesCount += quantity;
  this.lastSoldAt = new Date();
  return this.salesCount;
};

productSchema.methods.incrementWishlistCount = function () {
  this.wishlistCount += 1;
  return this.wishlistCount;
};

productSchema.methods.decrementWishlistCount = function () {
  this.wishlistCount = Math.max(0, this.wishlistCount - 1);
  return this.wishlistCount;
};

// Stock management
productSchema.methods.updateStock = function (
  quantity,
  variantId = null,
  operation = "set"
) {
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    if (variant) {
      switch (operation) {
        case "add":
          variant.stock += quantity;
          break;
        case "subtract":
          variant.stock = Math.max(0, variant.stock - quantity);
          break;
        default:
          variant.stock = Math.max(0, quantity);
      }
      return variant.stock;
    }
  } else {
    switch (operation) {
      case "add":
        this.stock += quantity;
        break;
      case "subtract":
        this.stock = Math.max(0, this.stock - quantity);
        break;
      default:
        this.stock = Math.max(0, quantity);
    }
    return this.stock;
  }
  return null;
};

// ==================== STATIC METHODS ====================

// Basic queries
productSchema.statics.findActive = function (options = {}) {
  return this.find({
    status: "active",
    isApproved: true,
    ...options,
  });
};

productSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId });
};

productSchema.statics.findByCategory = function (categoryId) {
  return this.findActive({ category: categoryId });
};

productSchema.statics.findFeatured = function (limit = 10) {
  return this.findActive({ isFeatured: true })
    .limit(limit)
    .sort({ createdAt: -1 });
};

productSchema.statics.findLowStock = function (threshold = null) {
  return this.aggregate([
    { $match: { status: "active", isApproved: true } },
    {
      $addFields: {
        totalStock: {
          $cond: {
            if: "$hasVariants",
            then: { $sum: "$variants.stock" },
            else: "$stock",
          },
        },
      },
    },
    {
      $match: {
        totalStock: {
          $lte: threshold || 10,
          $gt: 0,
        },
      },
    },
  ]);
};

productSchema.statics.findOutOfStock = function () {
  return this.aggregate([
    { $match: { status: "active", isApproved: true } },
    {
      $addFields: {
        totalStock: {
          $cond: {
            if: "$hasVariants",
            then: { $sum: "$variants.stock" },
            else: "$stock",
          },
        },
      },
    },
    { $match: { totalStock: 0 } },
  ]);
};

// Advanced search
productSchema.statics.searchProducts = function (searchTerm, options = {}) {
  const {
    page = 1,
    limit = 12,
    category,
    subcategory,
    brand,
    seller,
    minPrice,
    maxPrice,
    minRating,
    tags,
    status = "active",
    isApproved = true,
    isFeatured,
    inStock,
    hasVariants,
    isDigital,
    shippingClass,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Build filter
  const filter = { status, isApproved };

  if (searchTerm) {
    filter.$text = { $search: searchTerm };
  }

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (brand) filter.brand = brand;
  if (seller) filter.seller = seller;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured;
  if (hasVariants !== undefined) filter.hasVariants = hasVariants;
  if (isDigital !== undefined) filter.isDigital = isDigital;
  if (shippingClass) filter.shippingClass = shippingClass;

  // Price filter
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (minRating) {
    filter["rating.average"] = { $gte: parseFloat(minRating) };
  }

  // Tags filter
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filter.tags = { $in: tagArray };
  }

  // Stock filter
  if (inStock) {
    filter.$expr = {
      $gt: [
        {
          $cond: {
            if: "$hasVariants",
            then: { $sum: "$variants.stock" },
            else: "$stock",
          },
        },
        0,
      ],
    };
  }

  // Build sort
  const sort = {};
  if (searchTerm) {
    sort.score = { $meta: "textScore" };
  }
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.paginate(filter, {
    page,
    limit,
    sort,
    populate: [
      { path: "category", select: "name slug" },
      { path: "subcategory", select: "name slug" },
      { path: "brand", select: "name logo" },
      { path: "seller", select: "firstName lastName email" },
    ],
  });
};

// Bulk operations
productSchema.statics.bulkUpdateStatus = function (productIds, status) {
  return this.updateMany(
    { _id: { $in: productIds } },
    { status, updatedAt: new Date() }
  );
};

productSchema.statics.bulkUpdatePrices = function (
  productIds,
  priceMultiplier
) {
  return this.updateMany(
    { _id: { $in: productIds } },
    {
      $mul: {
        basePrice: priceMultiplier,
        discountPrice: priceMultiplier,
      },
      updatedAt: new Date(),
    }
  );
};

productSchema.statics.bulkDelete = function (productIds) {
  return this.deleteMany({ _id: { $in: productIds } });
};

// Analytics
productSchema.statics.getTopRated = function (limit = 10) {
  return this.findActive()
    .sort({ "rating.average": -1, "rating.count": -1 })
    .limit(limit);
};

productSchema.statics.getBestSellers = function (limit = 10) {
  return this.findActive().sort({ salesCount: -1 }).limit(limit);
};

productSchema.statics.getMostViewed = function (limit = 10) {
  return this.findActive().sort({ viewCount: -1 }).limit(limit);
};

productSchema.statics.getRecentlyAdded = function (limit = 10) {
  return this.findActive().sort({ createdAt: -1 }).limit(limit);
};

// Get products by price range
productSchema.statics.getByPriceRange = function (
  minPrice,
  maxPrice,
  options = {}
) {
  const filter = {
    status: "active",
    isApproved: true,
    basePrice: { $gte: minPrice, $lte: maxPrice },
  };

  return this.find(filter, null, options);
};

// Get similar products
productSchema.statics.getSimilarProducts = function (productId, limit = 5) {
  return this.findById(productId).then((product) => {
    if (!product) return [];

    return this.findActive({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } },
      ],
    })
      .limit(limit)
      .sort({ "rating.average": -1 });
  });
};

// Get products with discounts
productSchema.statics.getOnSale = function (options = {}) {
  return this.findActive(
    {
      discountPrice: { $exists: true, $ne: null },
      $expr: { $lt: ["$discountPrice", "$basePrice"] },
    },
    null,
    options
  );
};

// Get expired products (for cleanup)
productSchema.statics.getExpiredProducts = function (days = 365) {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - days);

  return this.find({
    status: "discontinued",
    discontinuedAt: { $lt: expiredDate },
  });
};

// Get products requiring approval
productSchema.statics.getPendingApproval = function () {
  return this.find({
    status: "draft",
    isApproved: false,
  }).populate("seller", "firstName lastName email");
};

// Aggregate statistics
productSchema.statics.getStatistics = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "active"] },
                  { $eq: ["$isApproved", true] },
                ],
              },
              1,
              0,
            ],
          },
        },
        draftProducts: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
        },
        inactiveProducts: {
          $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
        },
        discontinuedProducts: {
          $sum: { $cond: [{ $eq: ["$status", "discontinued"] }, 1, 0] },
        },
        featuredProducts: {
          $sum: { $cond: ["$isFeatured", 1, 0] },
        },
        totalViews: { $sum: "$viewCount" },
        totalSales: { $sum: "$salesCount" },
        averagePrice: { $avg: "$basePrice" },
        totalValue: { $sum: "$basePrice" },
      },
    },
  ]);
};

// Get category statistics
productSchema.statics.getCategoryStatistics = function () {
  return this.aggregate([
    {
      $match: { status: "active", isApproved: true },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        averagePrice: { $avg: "$basePrice" },
        averageRating: { $avg: "$rating.average" },
        totalSales: { $sum: "$salesCount" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $project: {
        _id: 1,
        name: "$categoryInfo.name",
        slug: "$categoryInfo.slug",
        count: 1,
        averagePrice: { $round: ["$averagePrice", 2] },
        averageRating: { $round: ["$averageRating", 2] },
        totalSales: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

// Get seller statistics
productSchema.statics.getSellerStatistics = function (sellerId) {
  return this.aggregate([
    {
      $match: { seller: new mongoose.Types.ObjectId(sellerId) },
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "active"] },
                  { $eq: ["$isApproved", true] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalViews: { $sum: "$viewCount" },
        totalSales: { $sum: "$salesCount" },
        totalWishlists: { $sum: "$wishlistCount" },
        averageRating: { $avg: "$rating.average" },
        totalReviews: { $sum: "$rating.count" },
        totalValue: {
          $sum: {
            $multiply: ["$basePrice", "$salesCount"],
          },
        },
      },
    },
  ]);
};

// Clean up orphaned data
productSchema.statics.cleanupOrphanedData = function () {
  // This would typically be run as a maintenance job
  return Promise.all([
    // Remove products with no seller
    this.deleteMany({ seller: { $exists: false } }),

    // Remove products with invalid categories
    this.deleteMany({ category: { $exists: false } }),

    // Reset invalid stock values
    this.updateMany({ stock: { $lt: 0 } }, { $set: { stock: 0 } }),

    // Reset invalid ratings
    this.updateMany(
      { "rating.average": { $gt: 5 } },
      { $set: { "rating.average": 5 } }
    ),
  ]);
};

// ==================== MODEL EXPORT ====================

const Product = mongoose.model("Product", productSchema);

// Create indexes after model creation
Product.createIndexes().catch(console.error);

module.exports = Product;
