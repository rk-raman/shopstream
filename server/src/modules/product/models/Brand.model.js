const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const brandSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    // Media
    logo: {
      public_id: String,
      url: String,
    },
    banner: {
      public_id: String,
      url: String,
    },
    images: [
      {
        public_id: String,
        url: String,
        caption: String,
      },
    ],

    // Company Information
    companyInfo: {
      foundedYear: Number,
      headquarters: String,
      website: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "Website must be a valid URL",
        },
      },
      email: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: "Email must be a valid email address",
        },
      },
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },

    // Social Media
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
    },

    // SEO
    metaTitle: {
      type: String,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    metaKeywords: [String],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Analytics
    productCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
    },

    // Sorting
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Brand Categories (which categories this brand operates in)
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // Brand Tags
    tags: [String],

    // Commission settings
    commission: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Brand Guidelines
    guidelines: {
      logoUsage: String,
      colorPalette: [String],
      typography: String,
      toneOfVoice: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
brandSchema.index({ name: "text", description: "text" });
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1, isFeatured: 1 });
brandSchema.index({ categories: 1 });
brandSchema.index({ tags: 1 });

// Add pagination plugin
brandSchema.plugin(mongoosePaginate);

// Virtual for products
brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brand",
});

// Virtual for full name with verification badge
brandSchema.virtual("displayName").get(function () {
  return this.isVerified ? `${this.name} ✓` : this.name;
});

// Pre-save middleware
brandSchema.pre("save", function (next) {
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  }

  // Ensure website has protocol
  if (
    this.companyInfo.website &&
    !this.companyInfo.website.startsWith("http")
  ) {
    this.companyInfo.website = `https://${this.companyInfo.website}`;
  }

  next();
});

// Instance methods
brandSchema.methods.updateProductCount = async function () {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({
    brand: this._id,
    status: "active",
  });
  this.productCount = count;
  await this.save();
};

brandSchema.methods.getProducts = async function (options = {}) {
  const Product = mongoose.model("Product");
  const query = { brand: this._id, status: "active" };

  if (options.category) {
    query.category = options.category;
  }

  if (options.limit) {
    return await Product.find(query)
      .limit(options.limit)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
  }

  return await Product.find(query)
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
};

brandSchema.methods.getTopProducts = async function (limit = 10) {
  const Product = mongoose.model("Product");
  return await Product.find({
    brand: this._id,
    status: "active",
  })
    .sort({ "rating.average": -1, "rating.count": -1 })
    .limit(limit)
    .populate("category", "name slug");
};

// Static methods
brandSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

brandSchema.statics.findFeatured = function () {
  return this.find({ isFeatured: true, isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
};

brandSchema.statics.findVerified = function () {
  return this.find({ isVerified: true, isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
};

brandSchema.statics.findByCategory = function (categoryId) {
  return this.find({
    categories: categoryId,
    isActive: true,
  }).sort({ sortOrder: 1, name: 1 });
};

brandSchema.statics.searchBrands = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  }).sort({ score: { $meta: "textScore" } });
};

brandSchema.statics.getPopularBrands = function (limit = 20) {
  return this.find({ isActive: true })
    .sort({ productCount: -1, viewCount: -1 })
    .limit(limit);
};

brandSchema.statics.getBrandsByAlphabet = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { $substr: ["$name", 0, 1] },
        brands: {
          $push: {
            _id: "$_id",
            name: "$name",
            slug: "$slug",
            logo: "$logo",
            productCount: "$productCount",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Post-save middleware to update product count
brandSchema.post("save", async function () {
  // Update product count for this brand
  await this.updateProductCount();
});

module.exports = mongoose.model("Brand", brandSchema);
