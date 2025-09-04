const userService = require("../services/user.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updateData = req.body;

  // Remove sensitive fields that shouldn't be updated here
  delete updateData.password;
  delete updateData.email;
  delete updateData.role;
  delete updateData.refreshTokens;

  const user = await userService.updateUser(userId, updateData);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

// Upload avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, "Please upload an image");
  }

  // Here you would typically upload to cloud storage (Cloudinary, AWS S3, etc.)
  // For now, we'll just store the file path
  const avatarData = {
    avatar: {
      public_id: req.file.filename,
      url: `/uploads/avatars/${req.file.filename}`,
    },
  };

  const user = await userService.updateUser(userId, avatarData);

  res.json({
    success: true,
    message: "Avatar uploaded successfully",
    data: {
      user,
    },
  });
});

// Delete user account (soft delete)
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await userService.deleteUser(userId);

  // Clear cookies
  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});

// Get user's addresses
const getAddresses = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  res.json({
    success: true,
    data: {
      addresses: user.addresses,
    },
  });
});

// Add new address
const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressData = req.body;

  const address = await userService.addAddress(userId, addressData);

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: {
      address,
    },
  });
});

// Update address
const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;
  const updateData = req.body;

  const address = await userService.updateAddress(
    userId,
    addressId,
    updateData
  );

  res.json({
    success: true,
    message: "Address updated successfully",
    data: {
      address,
    },
  });
});

// Delete address
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  await userService.deleteAddress(userId, addressId);

  res.json({
    success: true,
    message: "Address deleted successfully",
  });
});

// Get wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { populate = "true" } = req.query;

  const wishlist = await userService.getWishlist(userId, populate === "true");

  res.json({
    success: true,
    data: {
      wishlist,
    },
  });
});

// Add to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  await userService.addToWishlist(userId, productId);

  res.status(201).json({
    success: true,
    message: "Product added to wishlist",
  });
});

// Remove from wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  await userService.removeFromWishlist(userId, productId);

  res.json({
    success: true,
    message: "Product removed from wishlist",
  });
});

// Clear entire wishlist
const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await userService.updateUser(userId, { wishlist: [] });

  res.json({
    success: true,
    message: "Wishlist cleared successfully",
  });
});

// Admin only: Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

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

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  };

  const users = await User.paginate(filter, options);

  res.json({
    success: true,
    data: users,
  });
});

// Admin only: Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  res.json({
    success: true,
    data: {
      user,
    },
  });
});

// Admin only: Update user
const updateUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  // Prevent updating password through this endpoint
  delete updateData.password;

  const user = await userService.updateUser(userId, updateData);

  res.json({
    success: true,
    message: "User updated successfully",
    data: {
      user,
    },
  });
});

// Admin only: Delete user
const deleteUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await userService.deleteUser(userId);

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
