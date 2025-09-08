const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const uploadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["cloudinary", "aws", "local"],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video", "raw", "auto"],
      default: "image",
    },
    format: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    folder: {
      type: String,
      default: "general",
    },
    category: {
      type: String,
      enum: ["avatar", "product", "banner", "category", "document", "general"],
      default: "general",
    },
    userType: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    metadata: {
      mimeType: String,
      encoding: String,
      etag: String,
      versionId: String,
      tags: [String],
      description: String,
      alt: String,
    },
    transformation: {
      applied: {
        type: Boolean,
        default: false,
      },
      options: {
        width: Number,
        height: Number,
        quality: Number,
        format: String,
        crop: String,
        gravity: String,
        background: String,
        opacity: Number,
        radius: Number,
        border: String,
        effect: String,
      },
    },
    usage: {
      downloads: {
        type: Number,
        default: 0,
      },
      views: {
        type: Number,
        default: 0,
      },
      lastAccessed: Date,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
uploadSchema.index({ user: 1, category: 1 });
uploadSchema.index({ user: 1, isActive: 1 });
uploadSchema.index({ provider: 1, publicId: 1 });
uploadSchema.index({ folder: 1, category: 1 });
uploadSchema.index({ createdAt: -1 });
uploadSchema.index({ expiresAt: 1 }, { sparse: true });

// Virtual for file size in human readable format
uploadSchema.virtual("sizeFormatted").get(function () {
  const bytes = this.size;
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
});

// Virtual for file type
uploadSchema.virtual("fileType").get(function () {
  if (this.resourceType === "image") {
    return "Image";
  } else if (this.resourceType === "video") {
    return "Video";
  } else if (this.resourceType === "raw") {
    return "Document";
  }
  return "File";
});

// Virtual for thumbnail URL (for images)
uploadSchema.virtual("thumbnailUrl").get(function () {
  if (this.resourceType === "image" && this.provider === "cloudinary") {
    return this.url.replace("/upload/", "/upload/w_150,h_150,c_fill/");
  }
  return this.url;
});

// Instance method to increment view count
uploadSchema.methods.incrementViews = function () {
  this.usage.views += 1;
  this.usage.lastAccessed = new Date();
  return this.save();
};

// Instance method to increment download count
uploadSchema.methods.incrementDownloads = function () {
  this.usage.downloads += 1;
  this.usage.lastAccessed = new Date();
  return this.save();
};

// Instance method to get safe data for API responses
uploadSchema.methods.getSafeData = function () {
  return {
    _id: this._id,
    originalName: this.originalName,
    fileName: this.fileName,
    publicId: this.publicId,
    url: this.url,
    secureUrl: this.secureUrl,
    provider: this.provider,
    resourceType: this.resourceType,
    format: this.format,
    size: this.size,
    sizeFormatted: this.sizeFormatted,
    width: this.width,
    height: this.height,
    folder: this.folder,
    category: this.category,
    fileType: this.fileType,
    thumbnailUrl: this.thumbnailUrl,
    isPublic: this.isPublic,
    metadata: this.metadata,
    transformation: this.transformation,
    usage: this.usage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to get user uploads
uploadSchema.statics.getUserUploads = function (userId, options = {}) {
  const {
    category,
    resourceType,
    isActive = true,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const filter = { user: userId, isActive };
  if (category) filter.category = category;
  if (resourceType) filter.resourceType = resourceType;

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  return this.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: { path: "user", select: "firstName lastName email" },
  });
};

// Static method to get uploads by category
uploadSchema.statics.getByCategory = function (category, options = {}) {
  const {
    isActive = true,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const filter = { category, isActive };
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  return this.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: { path: "user", select: "firstName lastName email" },
  });
};

// Pre-save middleware to set folder based on category and user type
uploadSchema.pre("save", function (next) {
  if (this.isNew && !this.folder) {
    this.folder = `${this.category}/${this.userType}/${this.user}`;
  }
  next();
});

// Add pagination plugin
uploadSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Upload", uploadSchema);
