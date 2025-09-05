const express = require("express");
const addressController = require("../controllers/address.controller");
const {
  validateAddress,
  validateAddressId,
} = require("../validators/joiValidators");
const { authenticate } = require("../../../shared/middleware/auth.middleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate); // apply authentication globally

// Address CRUD routes
router.get("/", addressController.getAddresses);
router.post("/", validateAddress, addressController.addAddress);
router.get("/default", addressController.getDefaultAddress);
router.get("/type/:type", addressController.getAddressesByType);
router.get("/:addressId", validateAddressId, addressController.getAddress);
router.put(
  "/:addressId",
  validateAddressId,
  validateAddress,
  addressController.updateAddress
);
router.delete(
  "/:addressId",
  validateAddressId,
  addressController.deleteAddress
);
router.patch(
  "/:addressId/default",
  validateAddressId,
  addressController.setDefaultAddress
);

module.exports = router;
