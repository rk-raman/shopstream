const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const addressSchema = require("./Address.model");
const {
  hashPassword,
  comparePassword,
} = require("../../../shared/utils/bcrypt");
const {
  getMongooseValidation,
  createMongooseFields,
} = require("../validators/sharedValidation");

const userSchema = new mongoose.Schema(
  {
    // Basic Information using shared validation
    email: getMongooseValidation("email"),
    password: getMongooseValidation("password"),
    firstName: getMongooseValidation("name", {
      required: [true, "First name is required"],
    }),
    lastName: getMongooseValidation("name", {
      required: [true, "Last name is required"],
    }),
    phone: getMongooseValidation("phone"),

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
    dateOfBirth: getMongooseValidation("dateOfBirth"),
    gender: getMongooseValidation("gender"),

    // Role and Status
    role: getMongooseValidation("role", { index: true }),
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
userSchema.index({ isEmailVerified: 1, isActive: 1 });
userSchema.index({ googleId: 1, facebookId: 1 }, { sparse: true });
userSchema.index({ lastActiveAt: -1, isActive: 1 });
userSchema.index({ accountLockedUntil: 1, loginAttempts: 1 });

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
    // Hash password only if it's a new password (not already hashed)
    if (
      this.isModified("password") &&
      this.password &&
      !this.password.startsWith("$2b$")
    ) {
      this.password = await hashPassword(this.password, 12);
    }

    // Update lastActiveAt only on significant changes
    if (
      this.isModified() &&
      !this.isNew &&
      this.isModified([
        "firstName",
        "lastName",
        "email",
        "phone",
        "preferences",
      ])
    ) {
      this.lastActiveAt = new Date();
    }

    // Optimize address default logic
    if (this.isModified("addresses") && this.addresses.length > 0) {
      this._normalizeDefaultAddress();
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
  return await comparePassword(candidatePassword, this.password);
};

userSchema.methods.getDefaultAddress = function () {
  const defaultAddr = this.addresses.find((addr) => addr.isDefault);
  return defaultAddr || (this.addresses.length > 0 ? this.addresses[0] : null);
};

userSchema.methods.addAddress = function (addressData) {
  // If this is the first address, make it default
  if (this.addresses.length === 0) {
    addressData.isDefault = true;
  } else if (addressData.isDefault) {
    // If new address is set as default, remove default from others
    this.addresses.forEach((addr) => (addr.isDefault = false));
  }

  this.addresses.push(addressData);
  return this.addresses[this.addresses.length - 1];
};

// Helper method to normalize default address
userSchema.methods._normalizeDefaultAddress = function () {
  const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);

  if (defaultAddresses.length > 1) {
    // Keep only the last one as default
    this.addresses.forEach((addr, index) => {
      addr.isDefault =
        index === this.addresses.length - 1 && defaultAddresses.includes(addr);
    });
  } else if (defaultAddresses.length === 0 && this.addresses.length > 0) {
    // If no default address, make the first one default
    this.addresses[0].isDefault = true;
  }
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
  if (!this.wishlist.some((id) => id.toString() === productId.toString())) {
    this.wishlist.push(productId);
    return true;
  }
  return false;
};

userSchema.methods.removeFromWishlist = function (productId) {
  const index = this.wishlist.findIndex(
    (id) => id.toString() === productId.toString()
  );
  if (index > -1) {
    this.wishlist.splice(index, 1);
    return true;
  }
  return false;
};

userSchema.methods.isInWishlist = function (productId) {
  return this.wishlist.some((id) => id.toString() === productId.toString());
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
