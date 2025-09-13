const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const collectionSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
      maxlength: [100, "Collection name cannot exceed 100 characters"],
    },
    handle: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, "Handle cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },

    // Collection Type
    type: {
      type: String,
      enum: ["manual", "automated"],
      default: "manual",
      required: true,
    },

    // Automated Collection Rules (for future implementation)
    rules: {
      conditions: [
        {
          field: {
            type: String,
            enum: [
              "title",
              "type",
              "vendor",
              "price",
              "weight",
              "tag",
              "category",
              "brand",
            ],
          },
          relation: {
            type: String,
            enum: [
              "equals",
              "not_equals",
              "starts_with",
              "ends_with",
              "contains",
              "not_contains",
              "greater_than",
              "less_than",
            ],
          },
          value: String,
        },
      ],
      match: {
        type: String,
        enum: ["all", "any"],
        default: "all",
      },
    },

    // Products (for manual collections)
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Media
    image: {
      public_id: String,
      url: String,
    },

    // SEO
    seo: {
      title: {
        type: String,
        maxlength: [60, "SEO title cannot exceed 60 characters"],
        trim: true,
      },
      description: {
        type: String,
        maxlength: [160, "SEO description cannot exceed 160 characters"],
        trim: true,
      },
      keywords: [
        {
          type: String,
          trim: true,
          maxlength: [50, "SEO keyword cannot exceed 50 characters"],
        },
      ],
    },

    // Visibility and Status
    isVisible: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },

    // Sorting
    sortOrder: {
      type: String,
      enum: [
        "manual",
        "best-selling",
        "created-desc",
        "created-asc",
        "price-desc",
        "price-asc",
        "alphabetical-asc",
        "alphabetical-desc",
      ],
      default: "manual",
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

    // Seller/Owner
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Timestamps for publishing
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
collectionSchema.index({ name: "text", description: "text" });
collectionSchema.index({ seller: 1, isVisible: 1 });
collectionSchema.index({ handle: 1 });
collectionSchema.index({ type: 1, isVisible: 1 });
collectionSchema.index({ isPublished: 1, isVisible: 1 });
collectionSchema.index({ createdAt: -1 });

// Add pagination plugin
collectionSchema.plugin(mongoosePaginate);

// Virtual for full URL
collectionSchema.virtual("url").get(function () {
  return `/collections/${this.handle}`;
});

// Virtual for populated products with details
collectionSchema.virtual("populatedProducts", {
  ref: "Product",
  localField: "products",
  foreignField: "_id",
  options: { sort: { createdAt: -1 } },
});

// Pre-save middleware
collectionSchema.pre("save", async function (next) {
  try {
    // Generate handle if not provided
    if (!this.handle && this.name) {
      this.handle = this.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Ensure handle uniqueness
      let counter = 1;
      let originalHandle = this.handle;
      while (
        await this.constructor.findOne({
          handle: this.handle,
          _id: { $ne: this._id },
        })
      ) {
        this.handle = `${originalHandle}-${counter}`;
        counter++;
      }
    }

    // Update product count for manual collections
    if (this.type === "manual" && this.isModified("products")) {
      this.productCount = this.products.length;
    }

    // Set published timestamp
    if (
      this.isModified("isPublished") &&
      this.isPublished &&
      !this.publishedAt
    ) {
      this.publishedAt = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware for automated collections (future implementation)
collectionSchema.pre("save", async function (next) {
  if (this.type === "automated" && this.isModified("rules")) {
    // TODO: Implement automated product matching logic
    // This would query products based on the rules and update the products array
    // For now, we'll just set productCount to 0
    this.productCount = 0;
  }
  next();
});

// Instance methods
collectionSchema.methods.addProduct = async function (productId) {
  if (this.type !== "manual") {
    throw new Error("Can only add products to manual collections");
  }

  if (!this.products.includes(productId)) {
    this.products.push(productId);
    this.productCount = this.products.length;
    await this.save();
  }

  return this;
};

collectionSchema.methods.removeProduct = async function (productId) {
  if (this.type !== "manual") {
    throw new Error("Can only remove products from manual collections");
  }

  this.products = this.products.filter((id) => !id.equals(productId));
  this.productCount = this.products.length;
  await this.save();

  return this;
};

collectionSchema.methods.addMultipleProducts = async function (productIds) {
  if (this.type !== "manual") {
    throw new Error("Can only add products to manual collections");
  }

  const uniqueIds = [
    ...new Set([...this.products.map((id) => id.toString()), ...productIds]),
  ];
  this.products = uniqueIds.map((id) => mongoose.Types.ObjectId(id));
  this.productCount = this.products.length;
  await this.save();

  return this;
};

collectionSchema.methods.removeMultipleProducts = async function (productIds) {
  if (this.type !== "manual") {
    throw new Error("Can only remove products from manual collections");
  }

  const idsToRemove = productIds.map((id) => id.toString());
  this.products = this.products.filter(
    (id) => !idsToRemove.includes(id.toString())
  );
  this.productCount = this.products.length;
  await this.save();

  return this;
};

collectionSchema.methods.updateProductCount = async function () {
  if (this.type === "manual") {
    this.productCount = this.products.length;
  } else {
    // For automated collections, count products that match the rules
    // TODO: Implement automated product counting logic
    this.productCount = 0;
  }

  await this.save();
  return this.productCount;
};

collectionSchema.methods.getProducts = async function (options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = this.sortOrder,
    populate = true,
  } = options;

  if (this.type === "manual") {
    let query = mongoose.model("Product").find({
      _id: { $in: this.products },
      status: "active",
    });

    // Apply sorting
    switch (sortBy) {
      case "best-selling":
        query = query.sort({ salesCount: -1 });
        break;
      case "created-desc":
        query = query.sort({ createdAt: -1 });
        break;
      case "created-asc":
        query = query.sort({ createdAt: 1 });
        break;
      case "price-desc":
        query = query.sort({ basePrice: -1 });
        break;
      case "price-asc":
        query = query.sort({ basePrice: 1 });
        break;
      case "alphabetical-asc":
        query = query.sort({ name: 1 });
        break;
      case "alphabetical-desc":
        query = query.sort({ name: -1 });
        break;
      case "manual":
      default:
        // Maintain the order from the products array
        const productOrder = this.products.map((id) => id.toString());
        query = query.sort({
          _id: {
            $in: productOrder.map((id) => mongoose.Types.ObjectId(id)),
          },
        });
        break;
    }

    if (populate) {
      query = query.populate([
        { path: "category", select: "name slug" },
        { path: "brand", select: "name logo" },
        { path: "seller", select: "firstName lastName" },
      ]);
    }

    const paginateOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      lean: false,
    };

    return await mongoose
      .model("Product")
      .paginate(query.getQuery(), paginateOptions);
  } else {
    // TODO: Implement automated collection product fetching
    return {
      docs: [],
      totalDocs: 0,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
};

// Static methods
collectionSchema.statics.findByHandle = function (handle) {
  return this.findOne({ handle, isVisible: true, isPublished: true });
};

collectionSchema.statics.findBySeller = function (sellerId, options = {}) {
  const { includeHidden = false, includeUnpublished = false } = options;

  const query = { seller: sellerId };

  if (!includeHidden) {
    query.isVisible = true;
  }

  if (!includeUnpublished) {
    query.isPublished = true;
  }

  return this.find(query).sort({ createdAt: -1 });
};

collectionSchema.statics.findPublished = function (options = {}) {
  const { limit = 20, sortBy = "createdAt", sortOrder = "desc" } = options;

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find({ isVisible: true, isPublished: true })
    .sort(sort)
    .limit(limit)
    .populate("seller", "firstName lastName");
};

collectionSchema.statics.searchCollections = function (
  searchTerm,
  options = {}
) {
  const { limit = 20, sellerId } = options;

  const query = {
    $text: { $search: searchTerm },
    isVisible: true,
    isPublished: true,
  };

  if (sellerId) {
    query.seller = sellerId;
  }

  return this.find(query)
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
};

// Post-save middleware to update product counts
collectionSchema.post("save", async function () {
  if (this.isModified("products") && this.type === "manual") {
    // Update product count in the collection
    this.productCount = this.products.length;
  }
});

module.exports = mongoose.model("Collection", collectionSchema);
