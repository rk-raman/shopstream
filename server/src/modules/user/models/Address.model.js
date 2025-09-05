const mongoose = require("mongoose");
const { getMongooseValidation } = require("../validators/sharedValidation");

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
    pincode: getMongooseValidation("pincode"),
    country: {
      type: String,
      default: "India",
      trim: true,
      maxlength: [50, "Country name cannot exceed 50 characters"],
    },
    phone: getMongooseValidation("phone", {
      required: [true, "Phone number is required"],
    }),
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

// Indexes for better query performance
addressSchema.index({ pincode: 1 });
addressSchema.index({ city: 1, state: 1 });
addressSchema.index({ isDefault: 1 });
addressSchema.index({ type: 1, isDefault: 1 });
addressSchema.index(
  { "coordinates.latitude": 1, "coordinates.longitude": 1 },
  { sparse: true }
);

// Virtual for full address (cached for performance)
addressSchema.virtual("fullAddress").get(function () {
  if (this._fullAddressCache) {
    return this._fullAddressCache;
  }

  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.pincode,
    this.country,
  ].filter(Boolean);

  this._fullAddressCache = parts.join(", ");
  return this._fullAddressCache;
});

// Method to format address for display
addressSchema.methods.getFormattedAddress = function () {
  return {
    id: this._id,
    name: this.fullName,
    address: this.fullAddress,
    phone: this.phone,
    type: this.type,
    isDefault: this.isDefault,
    coordinates: this.coordinates,
  };
};

// Method to check if coordinates are valid
addressSchema.methods.hasValidCoordinates = function () {
  return (
    this.coordinates &&
    typeof this.coordinates.latitude === "number" &&
    typeof this.coordinates.longitude === "number" &&
    this.coordinates.latitude >= -90 &&
    this.coordinates.latitude <= 90 &&
    this.coordinates.longitude >= -180 &&
    this.coordinates.longitude <= 180
  );
};

// Pre-save middleware
addressSchema.pre("save", function (next) {
  // Clear cache when address fields change
  if (
    this.isModified([
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "country",
    ])
  ) {
    this._fullAddressCache = null;
  }

  // Normalize phone number
  if (this.isModified("phone") && this.phone) {
    this.phone = this.phone.replace(/\D/g, "");
  }

  next();
});

module.exports = addressSchema;
