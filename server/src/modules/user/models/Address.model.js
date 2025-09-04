const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
      required: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
      maxlength: [200, "Address line 1 cannot exceed 200 characters"],
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [200, "Address line 2 cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [50, "City name cannot exceed 50 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [50, "State name cannot exceed 50 characters"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"],
    },
    country: {
      type: String,
      default: "India",
      trim: true,
      maxlength: [50, "Country name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [100, "Landmark cannot exceed 100 characters"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    // Coordinates for location-based services
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
      },
    },
  },
  {
    timestamps: true,
    _id: true, // Ensure _id is generated for subdocuments
  }
);

// Index for better query performance
addressSchema.index({ pincode: 1 });
addressSchema.index({ city: 1, state: 1 });
addressSchema.index({ isDefault: 1 });

// Virtual for full address
addressSchema.virtual("fullAddress").get(function () {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.pincode,
    this.country,
  ].filter(Boolean);

  return parts.join(", ");
});

// Method to format address for display
addressSchema.methods.getFormattedAddress = function () {
  return {
    name: this.fullName,
    address: this.fullAddress,
    phone: this.phone,
    type: this.type,
    isDefault: this.isDefault,
  };
};

// Pre-save middleware to ensure only one default address per user
addressSchema.pre("save", function (next) {
  // This will be handled at the parent document level
  next();
});

module.exports = addressSchema;
