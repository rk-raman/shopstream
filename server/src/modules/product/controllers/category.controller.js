const categoryService = require("../services/category.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

class CategoryController {
  // Create new category
  createCategory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const category = await categoryService.createCategory(req.body, userId);

    return res.created(category, "Category created successfully");
  });

  // Get all categories with filters and pagination
  getCategories = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      search,
      parent,
      level,
      isActive,
      isFeatured,
      sortBy,
      sortOrder,
      populate = false,
    } = req.query;

    const filters = {
      search,
      parent,
      level: level ? parseInt(level) : undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
      sortBy,
      sortOrder,
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: populate === "true",
    };

    const result = await categoryService.getCategories(filters, options);

    return res.success(result, "Categories fetched successfully");
  });

  // Get category by ID
  getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { populate = true } = req.query;

    const category = await categoryService.getCategoryById(
      id,
      populate === "true"
    );

    return res.success(category, "Category fetched successfully");
  });

  // Get category by slug
  getCategoryBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { populate = true } = req.query;

    const category = await categoryService.getCategoryBySlug(
      slug,
      populate === "true"
    );

    return res.success(category, "Category fetched successfully");
  });

  // Update category
  updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const category = await categoryService.updateCategory(id, req.body, userId);

    return res.success(category, "Category updated successfully");
  });

  // Delete category
  deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await categoryService.deleteCategory(id, userId);

    return res.success(null, result.message);
  });

  // Get category tree
  getCategoryTree = asyncHandler(async (req, res) => {
    const { includeInactive = false } = req.query;

    const tree = await categoryService.getCategoryTree(
      includeInactive === "true"
    );

    return res.success(tree, "Category tree fetched successfully");
  });

  // Get featured categories
  getFeaturedCategories = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const categories = await categoryService.getFeaturedCategories(
      parseInt(limit)
    );

    return res.success(categories, "Featured categories fetched successfully");
  });

  // Search categories
  searchCategories = asyncHandler(async (req, res) => {
    const { q: searchTerm } = req.query;
    const { limit = 20, includeInactive = false } = req.query;

    if (!searchTerm) {
      throw new ApiError(400, "Search term is required");
    }

    const options = {
      limit: parseInt(limit),
      includeInactive: includeInactive === "true",
    };

    const categories = await categoryService.searchCategories(
      searchTerm,
      options
    );

    return res.success(categories, "Categories searched successfully");
  });

  // Update category sort order
  updateCategorySortOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sortOrder } = req.body;
    const userId = req.user._id;

    if (sortOrder === undefined || sortOrder === null) {
      throw new ApiError(400, "Sort order is required");
    }

    const category = await categoryService.updateCategorySortOrder(
      id,
      parseInt(sortOrder),
      userId
    );

    return res.success(category, "Category sort order updated successfully");
  });

  // Bulk update categories
  bulkUpdateCategories = asyncHandler(async (req, res) => {
    const { categoryIds, updateData } = req.body;
    const userId = req.user._id;

    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      throw new ApiError(400, "Category IDs array is required");
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ApiError(400, "Update data is required");
    }

    const result = await categoryService.bulkUpdateCategories(
      categoryIds,
      updateData,
      userId
    );

    return res.success({ modifiedCount: result.modifiedCount }, result.message);
  });

  // Get category statistics
  getCategoryStats = asyncHandler(async (req, res) => {
    const stats = await categoryService.getCategoryStats();

    return res.success(stats, "Category statistics fetched successfully");
  });

  // Upload category image
  uploadCategoryImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!req.file) {
      throw new ApiError(400, "Image file is required");
    }

    // Get upload service
    const uploadService = require("../../upload/services/upload.service");

    // Upload image
    const uploadResult = await uploadService.uploadCategoryImage(
      req.file,
      userId
    );

    // Update category with image
    const updateData = {
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    };

    const category = await categoryService.updateCategory(
      id,
      updateData,
      userId
    );

    return res.success(
      {
        category,
        image: uploadResult,
      },
      "Category image uploaded successfully"
    );
  });

  // Remove category image
  removeCategoryImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const category = await categoryService.getCategoryById(id, false);

    if (category.image && category.image.public_id) {
      // Get upload service to delete from cloud
      const uploadService = require("../../upload/services/upload.service");
      await uploadService.deleteImage(category.image.public_id);
    }

    // Remove image from category
    const updateData = { image: null };
    const updatedCategory = await categoryService.updateCategory(
      id,
      updateData,
      userId
    );

    return res.success(updatedCategory, "Category image removed successfully");
  });

  // Get categories by level
  getCategoriesByLevel = asyncHandler(async (req, res) => {
    const { level } = req.params;
    const { limit = 50, isActive = true } = req.query;

    const filters = {
      level: parseInt(level),
      isActive: isActive === "true",
    };

    const options = {
      limit: parseInt(limit),
      populate: true,
    };

    const result = await categoryService.getCategories(filters, options);

    return res.success(
      result,
      `Level ${level} categories fetched successfully`
    );
  });

  // Get root categories (level 0)
  getRootCategories = asyncHandler(async (req, res) => {
    const { limit = 50, isActive = true } = req.query;

    const filters = {
      level: 0,
      isActive: isActive === "true",
    };

    const options = {
      limit: parseInt(limit),
      populate: true,
    };

    const result = await categoryService.getCategories(filters, options);

    return res.success(result, "Root categories fetched successfully");
  });

  // Get category children
  getCategoryChildren = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive = true } = req.query;

    const filters = {
      parent: id,
      isActive: isActive === "true",
    };

    const options = {
      populate: true,
    };

    const result = await categoryService.getCategories(filters, options);

    return res.success(result, "Category children fetched successfully");
  });

  // Get category ancestors (breadcrumb)
  getCategoryAncestors = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id, false);
    const ancestors = await category.getAncestors();

    return res.success(ancestors, "Category ancestors fetched successfully");
  });

  // Get category descendants
  getCategoryDescendants = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id, false);
    const descendants = await category.getDescendants();

    return res.success(
      descendants,
      "Category descendants fetched successfully"
    );
  });

  // Update product count for category
  updateCategoryProductCount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id, false);
    await category.updateProductCount();

    return res.success(
      { productCount: category.productCount },
      "Category product count updated successfully"
    );
  });
}

module.exports = new CategoryController();
