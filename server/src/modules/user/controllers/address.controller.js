const userService = require("../services/user.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

const getAddresses = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  return res.success(user.addresses, "Addresses retrieved successfully");
});

// Get single address by ID
const getAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await userService.getUserById(req.user._id);

  const address = user.addresses.id(addressId);
  if (!address) {
    throw ApiError.notFound("Address not found", "ADDRESS_NOT_FOUND");
  }

  return res.success({ address }, "Address retrieved successfully");
});

// Add new address
const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressData = req.body;

  const address = await userService.addAddress(userId, addressData);
  return res.created({ address }, "Address added successfully");
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
  return res.success({ address }, "Address updated successfully");
});

// Delete address
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  await userService.deleteAddress(userId, addressId);
  return res.success(null, "Address deleted successfully");
});

// Set address as default
const setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressId } = req.params;

  const address = await userService.updateAddress(userId, addressId, {
    isDefault: true,
  });

  return res.success({ address }, "Default address updated successfully");
});

// Get default address
const getDefaultAddress = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  const defaultAddress = user.getDefaultAddress();

  if (!defaultAddress) {
    return res.success({ address: null }, "No default address found");
  }

  return res.success(
    { address: defaultAddress },
    "Default address retrieved successfully"
  );
});

// Get addresses by type
const getAddressesByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const user = await userService.getUserById(req.user._id);

  const addresses = user.addresses.filter((address) => address.type === type);

  return res.success(
    {
      addresses,
      count: addresses.length,
    },
    `${type} addresses retrieved successfully`
  );
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
