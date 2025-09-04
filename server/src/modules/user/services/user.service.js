const User = require("../models/User.model");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../shared/events/eventTypes");

// Create new user
const createUser = async (userData) => {
  try {
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        ...(userData.phone ? [{ phone: userData.phone }] : []),
      ],
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists with this email or phone");
    }

    // Create user
    const user = await User.create(userData);

    // Publish event for other services
    eventEmitter.publish(USER_EVENTS.USER_REGISTERED, {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      timestamp: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Get user by ID
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

// Get user by email
const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

// Update user
const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Publish event
  eventEmitter.publish(USER_EVENTS.USER_UPDATED, {
    userId: user._id,
    changes: updateData,
    timestamp: new Date().toISOString(),
  });

  return user;
};

// Delete user (soft delete)
const deleteUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Publish event
  eventEmitter.publish(USER_EVENTS.USER_DEACTIVATED, {
    userId: user._id,
    timestamp: new Date().toISOString(),
  });

  return { message: "User deactivated successfully" };
};

// Get all users with pagination and filters
const getAllUsers = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = { ...filters, ...options };

  // Build filter object
  const filter = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  };

  return await User.paginate(filter, paginationOptions);
};

// Address management functions

// Add address to user
const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If this is the first address or marked as default, make it default
  if (user.addresses.length === 0 || addressData.isDefault) {
    // Remove default from other addresses
    user.addresses.forEach((addr) => (addr.isDefault = false));
    addressData.isDefault = true;
  }

  user.addresses.push(addressData);
  await user.save();

  const newAddress = user.addresses[user.addresses.length - 1];

  // Publish event
  eventEmitter.publish(USER_EVENTS.ADDRESS_ADDED, {
    userId: user._id,
    addressId: newAddress._id,
    addressType: newAddress.type,
    timestamp: new Date().toISOString(),
  });

  return newAddress;
};

// Update address
const updateAddress = async (userId, addressId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  Object.assign(address, updateData);

  // Handle default address logic
  if (updateData.isDefault) {
    user.addresses.forEach((addr) => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();

  // Publish event
  eventEmitter.publish(USER_EVENTS.ADDRESS_UPDATED, {
    userId: user._id,
    addressId: address._id,
    changes: updateData,
    timestamp: new Date().toISOString(),
  });

  return address;
};

// Delete address
const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const wasDefault = address.isDefault;
  user.addresses.pull(addressId);

  // If deleted address was default, make first remaining address default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  // Publish event
  eventEmitter.publish(USER_EVENTS.ADDRESS_DELETED, {
    userId: user._id,
    addressId,
    timestamp: new Date().toISOString(),
  });

  return { message: "Address deleted successfully" };
};

// Get user addresses
const getUserAddresses = async (userId) => {
  const user = await getUserById(userId);
  return user.addresses;
};

// Get default address
const getDefaultAddress = async (userId) => {
  const user = await getUserById(userId);
  return user.getDefaultAddress();
};

// Get addresses by type
const getAddressesByType = async (userId, type) => {
  const user = await getUserById(userId);
  return user.addresses.filter((address) => address.type === type);
};

// Wishlist management functions

// Add to wishlist
const addToWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.wishlist.includes(productId)) {
    throw new ApiError(409, "Product already in wishlist");
  }

  user.wishlist.push(productId);
  await user.save();

  // Publish event
  eventEmitter.publish(USER_EVENTS.WISHLIST_UPDATED, {
    userId: user._id,
    action: "added",
    productId,
    timestamp: new Date().toISOString(),
  });

  return { message: "Product added to wishlist" };
};

// Remove from wishlist
const removeFromWishlist = async (userId, productId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Publish event
  eventEmitter.publish(USER_EVENTS.WISHLIST_UPDATED, {
    userId: user._id,
    action: "removed",
    productId,
    timestamp: new Date().toISOString(),
  });

  return { message: "Product removed from wishlist" };
};

// Get wishlist
const getWishlist = async (userId, populate = true) => {
  let query = User.findById(userId);

  if (populate) {
    query = query.populate({
      path: "wishlist",
      select: "name price images discountPrice rating",
    });
  }

  const user = await query;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.wishlist;
};

// Clear wishlist
const clearWishlist = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { wishlist: [] },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Publish event
  eventEmitter.publish(USER_EVENTS.WISHLIST_UPDATED, {
    userId: user._id,
    action: "cleared",
    timestamp: new Date().toISOString(),
  });

  return { message: "Wishlist cleared successfully" };
};

// Check if product is in wishlist
const isInWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.wishlist.includes(productId);
};

// Update user preferences
const updateUserPreferences = async (userId, preferences) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { preferences },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// Get user statistics
const getUserStats = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    totalAddresses: user.addresses.length,
    wishlistCount: user.wishlist.length,
    loginCount: user.loginCount,
    lastLoginAt: user.lastLoginAt,
    accountAge: Date.now() - user.createdAt,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
  };
};

// Search users (admin function)
const searchUsers = async (searchQuery, options = {}) => {
  const { page = 1, limit = 10, role, isActive } = options;

  const filter = {
    $or: [
      { firstName: { $regex: searchQuery, $options: "i" } },
      { lastName: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
    ],
  };

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;

  const paginationOptions = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
  };

  return await User.paginate(filter, paginationOptions);
};

// Verify user email
const verifyUserEmail = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Publish event
  eventEmitter.publish(USER_EVENTS.EMAIL_VERIFIED, {
    userId: user._id,
    email: user.email,
    timestamp: new Date().toISOString(),
  });

  return user;
};

// Verify user phone
const verifyUserPhone = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isPhoneVerified: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// Update user role (admin function)
const updateUserRole = async (userId, newRole) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Publish event
  eventEmitter.publish(USER_EVENTS.USER_UPDATED, {
    userId: user._id,
    changes: { role: newRole },
    timestamp: new Date().toISOString(),
  });

  return user;
};

// Activate/Deactivate user (admin function)
const toggleUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const eventType = isActive
    ? USER_EVENTS.USER_UPDATED
    : USER_EVENTS.USER_DEACTIVATED;
  eventEmitter.publish(eventType, {
    userId: user._id,
    changes: { isActive },
    timestamp: new Date().toISOString(),
  });

  return user;
};

module.exports = {
  // Basic user operations
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  searchUsers,
  getUserStats,

  // Address operations
  addAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
  getDefaultAddress,
  getAddressesByType,

  // Wishlist operations
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  isInWishlist,

  // User preferences and verification
  updateUserPreferences,
  verifyUserEmail,
  verifyUserPhone,

  // Admin operations
  updateUserRole,
  toggleUserStatus,
};
