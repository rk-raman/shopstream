const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoosePaginate = require("mongoose-paginate-v2");
const addressSchema = require("./Address.model");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Hide password by default
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
      index: true,
    },

    // Profile Information
    avatar: {
      public_id: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+\..+/.test(v);
          },
          message: "Please enter a valid URL for avatar",
        },
      },
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v < new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
    },

    // Role and Status
    role: {
      type: String,
      enum: {
        values: ["customer", "seller", "admin"],
        message: "Role must be customer, seller, or admin",
      },
      default: "customer",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // Related Data
    addresses: [addressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        validate: {
          validator: function (v) {
            return mongoose.Types.ObjectId.isValid(v);
          },
          message: "Invalid product ID in wishlist",
        },
      },
    ],

    // User Preferences
    preferences: {
      language: {
        type: String,
        enum: ["en", "hi", "ta", "te", "bn"],
        default: "en",
      },
      currency: {
        type: String,
        enum: ["INR", "USD"],
        default: "INR",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
      privacy: {
        showProfile: {
          type: Boolean,
          default: false,
        },
        showWishlist: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Social Login
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    facebookId: {
      type: String,
      sparse: true,
      index: true,
    },

    // Security
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Analytics and Tracking
    lastLoginAt: Date,
    loginCount: {
      type: Number,
      default: 0,
      min: [0, "Login count cannot be negative"],
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      lastDevice: String,
      lastIP: String,
      lastUserAgent: String,
    },

    // Account Status
    accountLockedUntil: Date,
    loginAttempts: {
      type: Number,
      default: 0,
      max: [5, "Too many login attempts"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.twoFactorSecret;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Compound Indexes for better performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ "addresses.pincode": 1 });
userSchema.index({ "addresses.city": 1, "addresses.state": 1 });

// Text index for search functionality
userSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
});

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account age in days
userSchema.virtual("accountAge").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual to check if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
});

// Pre-save middleware
userSchema.pre("save", async function (next) {
  try {
    // Hash password if modified
    if (this.isModified("password") && this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }

    // Update lastActiveAt on every save
    if (this.isModified() && !this.isNew) {
      this.lastActiveAt = new Date();
    }

    // Ensure only one default address
    if (this.isModified("addresses") && this.addresses.length > 0) {
      const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);

      if (defaultAddresses.length > 1) {
        // Keep the last modified one as default
        this.addresses.forEach((addr, index) => {
          addr.isDefault =
            index === this.addresses.length - 1 && addr.isDefault;
        });
      } else if (defaultAddresses.length === 0) {
        // If no default address, make the first one default
        this.addresses[0].isDefault = true;
      }
    }

    // Clear login attempts on successful operations
    if (this.isModified("lastLoginAt")) {
      this.loginAttempts = 0;
      this.accountLockedUntil = undefined;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getDefaultAddress = function () {
  const defaultAddr = this.addresses.find((addr) => addr.isDefault);
  return defaultAddr || (this.addresses.length > 0 ? this.addresses[0] : null);
};

userSchema.methods.addAddress = function (addressData) {
  // If this is the first address, make it default
  if (this.addresses.length === 0) {
    addressData.isDefault = true;
  }

  // If new address is set as default, remove default from others
  if (addressData.isDefault) {
    this.addresses.forEach((addr) => (addr.isDefault = false));
  }

  this.addresses.push(addressData);
  return this.addresses[this.addresses.length - 1];
};

userSchema.methods.updateAddress = function (addressId, updateData) {
  const address = this.addresses.id(addressId);
  if (!address) return null;

  // If setting as default, remove default from others
  if (updateData.isDefault) {
    this.addresses.forEach((addr) => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  Object.assign(address, updateData);
  return address;
};

userSchema.methods.removeAddress = function (addressId) {
  const address = this.addresses.id(addressId);
  if (!address) return false;

  const wasDefault = address.isDefault;
  this.addresses.pull(addressId);

  // If removed address was default, make first remaining address default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }

  return true;
};

userSchema.methods.addToWishlist = function (productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    return true;
  }
  return false;
};

userSchema.methods.removeFromWishlist = function (productId) {
  const index = this.wishlist.indexOf(productId);
  if (index > -1) {
    this.wishlist.splice(index, 1);
    return true;
  }
  return false;
};

userSchema.methods.isInWishlist = function (productId) {
  return this.wishlist.includes(productId);
};

// Handle failed login attempts
userSchema.methods.handleFailedLogin = async function () {
  this.loginAttempts += 1;

  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }

  return this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.accountLockedUntil = undefined;
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

userSchema.statics.searchUsers = function (searchTerm, options = {}) {
  const { page = 1, limit = 10, role, isActive } = options;

  const filter = {
    $text: { $search: searchTerm },
    ...(role && { role }),
    ...(isActive !== undefined && { isActive }),
  };

  return this.paginate(filter, {
    page,
    limit,
    sort: { score: { $meta: "textScore" } },
  });
};

// Export the model
module.exports = mongoose.model("User", userSchema);
