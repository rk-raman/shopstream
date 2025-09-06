const express = require("express");
const controller = require("../controllers/category.controller");
const {
  authenticate,
  adminOnly,
} = require("../../../shared/middleware/auth.middleware");

const router = express.Router();

// Public
router.get("/", controller.listCategories);
router.get("/:categoryId", controller.getCategoryById);

// Admin
router.post("/", authenticate, adminOnly, controller.createCategory);
router.put("/:categoryId", authenticate, adminOnly, controller.updateCategory);
router.delete("/:categoryId", authenticate, adminOnly, controller.deleteCategory);

module.exports = router;

