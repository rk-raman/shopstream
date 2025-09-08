const express = require("express");
const userController = require("../controllers/user.controller");
const {
  validateUpdateProfile,
  validateAvatarUpload,
  validateWishlistAdd,
  validateWishlistRemove,
  validateUserId,
  validatePagination,
  validateSearch,
  validateAdminUpdate,
} = require("../validators/user.validators");
const {
  authenticate,
  adminOnly,
} = require("../../../shared/middleware/auth.middleware");
const uploadMiddleware = require("../../upload/middleware/upload.middleware");

const router = express.Router();

// 🔹 Apply authentication middleware to all profile & wishlist routes
router.use(authenticate);

// Profile routes
router.get("/profile", userController.getProfile);
router.put("/profile", validateUpdateProfile, userController.updateProfile);
router.post(
  "/avatar",
  uploadMiddleware.avatar(),
  validateAvatarUpload,
  userController.uploadAvatar
);
router.delete("/account", userController.deleteAccount);

// Wishlist routes
router.get("/wishlist", userController.getWishlist);
router.post("/wishlist", validateWishlistAdd, userController.addToWishlist);
router.delete(
  "/wishlist/:productId",
  validateWishlistRemove,
  userController.removeFromWishlist
);
router.delete("/wishlist", userController.clearWishlist);

// 🔹 Admin-only routes
router.use(adminOnly);
router.get("/", validatePagination, userController.getAllUsers);
router.get("/search", validateSearch, userController.searchUsers);
router.get("/:userId", validateUserId, userController.getUserById);
router.put(
  "/:userId",
  validateUserId,
  validateAdminUpdate,
  userController.updateUserById
);
router.delete("/:userId", validateUserId, userController.deleteUserById);

module.exports = router;
