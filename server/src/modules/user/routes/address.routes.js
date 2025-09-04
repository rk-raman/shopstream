const express = require("express");
const addressController = require("../controllers/address.controller");
const userValidators = require("../validators/user.validators");
const { authenticate } = require("../../../shared/middleware/auth.middleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate); // apply authentication globally

// Address CRUD routes
router.get("/", addressController.getAddresses);
router.post("/", userValidators.validateAddress, addressController.addAddress);
router.get("/default", addressController.getDefaultAddress);
router.get("/type/:type", addressController.getAddressesByType);
router.get("/:addressId", addressController.getAddress);
router.put(
  "/:addressId",
  userValidators.validateAddress,
  addressController.updateAddress
);
router.delete("/:addressId", addressController.deleteAddress);
router.patch("/:addressId/default", addressController.setDefaultAddress);

module.exports = router;
