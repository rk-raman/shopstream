const express = require("express");
const userController = require("../controllers/user.controller");
const userValidators = require("../validators/user.validators");
const { authenticate, adminOnly } = require("../../../shared/middleware/auth");
const upload = require("../../../shared/middleware/upload");

const router = express.Router();

// 🔹 Apply authentication middleware to all profile & wishlist routes
router.use(authenticate);

// Profile routes
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  userValidators.validateUpdateProfile,
  userController.updateProfile
);
router.post("/avatar", upload.single("avatar"), userController.uploadAvatar);
router.delete("/account", userController.deleteAccount);

// Wishlist routes
router.get("/wishlist", userController.getWishlist);
router.post(
  "/wishlist",
  userValidators.validateProductId,
  userController.addToWishlist
);
router.delete("/wishlist/:productId", userController.removeFromWishlist);
router.delete("/wishlist", userController.clearWishlist);

// 🔹 Admin-only routes
router.use(adminOnly);
router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);
router.put(
  "/:userId",
  userValidators.validateUpdateProfile,
  userController.updateUserById
);
router.delete("/:userId", userController.deleteUserById);

module.exports = router;
