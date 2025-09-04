const userService = require("../services/user.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Get all addresses for current user
const getAddresses = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  res.json({
    success: true,
    data: {
      addresses: user.addresses,
      count: user.addresses.length,
    },
  });
});

// Get single address by ID
const getAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await userService.getUserById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  res.json({
    success: true,
    data: {
      address,
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

// Update existing address
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

// Set address as default
const setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  const address = await userService.updateAddress(userId, addressId, {
    isDefault: true,
  });

  res.json({
    success: true,
    message: "Default address updated successfully",
    data: {
      address,
    },
  });
});

// Get default address
const getDefaultAddress = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  const defaultAddress = user.getDefaultAddress();

  if (!defaultAddress) {
    return res.json({
      success: true,
      message: "No default address found",
      data: {
        address: null,
      },
    });
  }

  res.json({
    success: true,
    data: {
      address: defaultAddress,
    },
  });
});

// Get addresses by type
const getAddressesByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const user = await userService.getUserById(req.user._id);

  const addresses = user.addresses.filter((address) => address.type === type);

  res.json({
    success: true,
    data: {
      addresses,
      count: addresses.length,
    },
  });
});

module.exports = {
  getAddresses,
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
  getAddressesByType,
};
