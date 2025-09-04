const express = require("express");
const addressController = require("../controllers/address.controller");
const userValidators = require("../validators/user.validators");
const auth = require("../../../shared/middleware/auth");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

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
