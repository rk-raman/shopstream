const { Category } = require("../models");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Create category (admin only)
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return res.created({ category }, "Category created successfully");
});

// Get paginated categories
const getCategories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    isActive,
    parent,
    sortBy = "sortOrder",
    sortOrder = "asc",
  } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (parent !== undefined) filter.parent = parent || null;

  const categories = await Category.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
  });

  return res.paginated(categories, "Categories retrieved successfully");
});

// Get category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  if (!category) throw new ApiError(404, "Category not found");
  return res.success({ category }, "Category retrieved successfully");
});

// Update category (admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findByIdAndUpdate(categoryId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found");
  return res.success({ category }, "Category updated successfully");
});

// Delete category (admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw new ApiError(404, "Category not found");
  return res.success(null, "Category deleted successfully");
});

// Get full category tree
const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await Category.getCategoryTree();
  return res.success({ tree }, "Category tree retrieved successfully");
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryTree,
};
