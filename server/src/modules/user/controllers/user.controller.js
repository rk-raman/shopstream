const userService = require("../services/user.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  return res.success({ user }, "Profile retrieved successfully");
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
  return res.success({ user }, "Profile updated successfully");
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

  return res.success({ user }, "Avatar uploaded successfully");
});

// Delete user account (soft delete)
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await userService.deleteUser(userId);

  // Clear cookies
  res.clearCookie("refreshToken");
  return res.success(null, "Account deleted successfully");
});

// Get user's addresses
const getAddresses = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  return res.success(
    {
      addresses: user.addresses,
      count: user.addresses.length,
    },
    "Addresses retrieved successfully"
  );
});

// Add new address
const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressData = req.body;
  const address = await userService.addAddress(userId, addressData);
  return res.created({ address }, "Address added successfully");
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

  return res.success({ address }, "Address updated successfully");
});

// Delete address
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  await userService.deleteAddress(userId, addressId);

  return res.success(null, "Address deleted successfully");
});

// Get wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { populate = "true" } = req.query;
  const wishlist = await userService.getWishlist(userId, populate === "true");
  return res.success({ wishlist }, "Wishlist retrieved successfully");
});

// Add to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  await userService.addToWishlist(userId, productId);
  return res.created(null, "Product added to wishlist");
});

// Remove from wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  await userService.removeFromWishlist(userId, productId);
  return res.success(null, "Product removed from wishlist");
});

// Clear entire wishlist
const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await userService.updateUser(userId, { wishlist: [] });
  return res.success(null, "Wishlist cleared successfully");
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

  return res.paginated(users, "Users retrieved successfully");
});

// Admin only: Search users
const searchUsers = asyncHandler(async (req, res) => {
  const {
    q,
    page = 1,
    limit = 10,
    role,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  if (!q) {
    return res.badRequest("Search query is required");
  }

  // Build filter object
  const filter = {
    $or: [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ],
  };

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

  return res.paginated(users, "Search results retrieved successfully");
});

// Admin only: Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  return res.success({ user }, "User retrieved successfully");
});

// Admin only: Update user
const updateUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  // Prevent updating password through this endpoint
  delete updateData.password;
  const user = await userService.updateUser(userId, updateData);
  return res.success({ user }, "User updated successfully");
});

// Admin only: Delete user
const deleteUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await userService.deleteUser(userId);
  return res.success(null, "User deleted successfully");
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
  searchUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
