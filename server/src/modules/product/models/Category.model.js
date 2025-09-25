const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const categorySchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
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
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    // Hierarchy
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 3, // Maximum 3 levels deep
    },
    path: {
      type: String,
      default: "",
    }, // e.g., "electronics/mobile/smartphones"

    // Media
    image: {
      public_id: String,
      url: String,
    },
    icon: {
      type: String,
      default: "📦", // Default emoji icon
    },

    // SEO (nested)
    seo: {
      metaTitle: {
        type: String,
        maxlength: [60, "Meta title cannot exceed 60 characters"],
        default: "",
      },
      metaDescription: {
        type: String,
        maxlength: [160, "Meta description cannot exceed 160 characters"],
        default: "",
      },
      metaKeywords: {
        type: [String],
        default: [],
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
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

    // Sorting
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Attributes/Specifications that products in this category can have
    attributes: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["text", "number", "select", "multiselect", "boolean"],
          default: "text",
        },
        options: [String], // For select/multiselect types
        isRequired: {
          type: Boolean,
          default: false,
        },
        isFilterable: {
          type: Boolean,
          default: true,
        },
        isSearchable: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Commission settings
    commission: {
      rate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ level: 1, sortOrder: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isFeatured: 1, isActive: 1 });

// Add pagination plugin
categorySchema.plugin(mongoosePaginate);

// Virtual for children categories
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for products in this category
categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
});

// Virtual for full path
categorySchema.virtual("fullPath").get(function () {
  return this.path || this.slug;
});

// Backward compatibility: migrate legacy flat SEO fields into nested seo object on save
categorySchema.pre("save", function (next) {
  // @ts-ignore legacy properties may exist on old docs
  const doc = this;
  if (!doc.seo) doc.seo = {};
  if (doc.metaTitle && !doc.seo.metaTitle) {
    doc.seo.metaTitle = doc.metaTitle;
    // @ts-ignore clean legacy
    doc.metaTitle = undefined;
  }
  if (doc.metaDescription && !doc.seo.metaDescription) {
    doc.seo.metaDescription = doc.metaDescription;
    // @ts-ignore clean legacy
    doc.metaDescription = undefined;
  }
  if (
    Array.isArray(doc.metaKeywords) &&
    (!doc.seo.metaKeywords || doc.seo.metaKeywords.length === 0)
  ) {
    doc.seo.metaKeywords = doc.metaKeywords;
    // @ts-ignore clean legacy
    doc.metaKeywords = undefined;
  }
  next();
});

// Pre-save middleware
categorySchema.pre("save", async function (next) {
  try {
    // Generate slug if not provided
    if (!this.slug) {
      this.slug = this.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");
    }

    // Set level and path based on parent
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
        this.path = parentCategory.path
          ? `${parentCategory.path}/${this.slug}`
          : this.slug;
      }
    } else {
      this.level = 0;
      this.path = this.slug;
    }

    // Validate level depth
    if (this.level > 3) {
      return next(new Error("Category hierarchy cannot exceed 3 levels"));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update parent's product count
categorySchema.pre("save", async function (next) {
  if (this.isModified("isActive") && this.parent) {
    const Product = mongoose.model("Product");
    const productCount = await Product.countDocuments({
      category: this._id,
      status: "active",
    });
    this.productCount = productCount;
  }
  next();
});

// Instance methods
categorySchema.methods.getChildren = async function () {
  return await this.constructor.find({ parent: this._id, isActive: true });
};

categorySchema.methods.getAncestors = async function () {
  const ancestors = [];
  let current = this;

  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      ancestors.unshift(current);
    } else {
      break;
    }
  }

  return ancestors;
};

categorySchema.methods.getDescendants = async function () {
  const descendants = [];
  const children = await this.getChildren();

  for (const child of children) {
    descendants.push(child);
    const grandChildren = await child.getDescendants();
    descendants.push(...grandChildren);
  }

  return descendants;
};

categorySchema.methods.updateProductCount = async function () {
  const Product = mongoose.model("Product");
  const count = await Product.countDocuments({
    category: this._id,
    status: "active",
  });
  this.productCount = count;
  await this.save();
};

// Static methods
categorySchema.statics.findRootCategories = function () {
  return this.find({ parent: null, isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findByLevel = function (level) {
  return this.find({ level, isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findFeatured = function () {
  return this.find({ isFeatured: true, isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.searchCategories = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  }).sort({ score: { $meta: "textScore" } });
};

categorySchema.statics.getCategoryTree = async function () {
  const buildTree = async (parentId = null) => {
    const categories = await this.find({ parent: parentId, isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    for (const category of categories) {
      category.children = await buildTree(category._id);
    }

    return categories;
  };

  return await buildTree();
};

// Post-save middleware to update product count
categorySchema.post("save", async function () {
  if (this.parent) {
    const parentCategory = await this.constructor.findById(this.parent);
    if (parentCategory) {
      await parentCategory.updateProductCount();
    }
  }
});

module.exports = mongoose.model("Category", categorySchema);
