const express = require("express");
const categoryController = require("../controllers/category.controller");
const { authenticate, adminOnly } = require("../../../shared/middleware/auth.middleware");

const router = express.Router();

// Public
router.get("/", categoryController.getCategories);
router.get("/tree", categoryController.getCategoryTree);
router.get("/:categoryId", categoryController.getCategoryById);

// Admin
router.post("/", authenticate, adminOnly, categoryController.createCategory);
router.put(
  "/:categoryId",
  authenticate,
  adminOnly,
  categoryController.updateCategory
);
router.delete(
  "/:categoryId",
  authenticate,
  adminOnly,
  categoryController.deleteCategory
);

module.exports = router;
