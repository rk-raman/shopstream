const { Category } = require("../models");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const ApiError = require("../../../shared/utils/apiError");

// List categories (optionally by parent)
const listCategories = asyncHandler(async (req, res) => {
  const { parent = null } = req.query;
  const filter = { isActive: true };
  if (parent === "root") filter.parent = null;
  else if (parent) filter.parent = parent;

  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
  return res.success({ categories }, "Categories retrieved successfully");
});

// Get category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  if (!category) throw ApiError.notFound("Category not found");
  return res.success({ category }, "Category retrieved successfully");
});

// Create category
const createCategory = asyncHandler(async (req, res) => {
  const data = req.body;
  const category = await Category.create(data);
  return res.created({ category }, "Category created successfully");
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const data = req.body;
  const category = await Category.findByIdAndUpdate(categoryId, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound("Category not found");
  return res.success({ category }, "Category updated successfully");
});

// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw ApiError.notFound("Category not found");
  return res.noContent("Category deleted successfully");
});

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

