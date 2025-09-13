const categoryService = require("../services/category.service");
const ApiError = require("../../../shared/utils/apiError");
const { successResponse } = require("../../../shared/utils/responseHandler");
const asyncHandler = require("../../../shared/utils/asyncHandler");

class CategoryController {
  // Create new category
  createCategory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const category = await categoryService.createCategory(req.body, userId);

    successResponse(res, {
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    });
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

    successResponse(res, {
      message: "Categories fetched successfully",
      data: result,
    });
  });

  // Get category by ID
  getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { populate = true } = req.query;

    const category = await categoryService.getCategoryById(
      id,
      populate === "true"
    );

    successResponse(res, {
      message: "Category fetched successfully",
      data: category,
    });
  });

  // Get category by slug
  getCategoryBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { populate = true } = req.query;

    const category = await categoryService.getCategoryBySlug(
      slug,
      populate === "true"
    );

    successResponse(res, {
      message: "Category fetched successfully",
      data: category,
    });
  });

  // Update category
  updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const category = await categoryService.updateCategory(id, req.body, userId);

    successResponse(res, {
      message: "Category updated successfully",
      data: category,
    });
  });

  // Delete category
  deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await categoryService.deleteCategory(id, userId);

    successResponse(res, {
      message: result.message,
      data: null,
    });
  });

  // Get category tree
  getCategoryTree = asyncHandler(async (req, res) => {
    const { includeInactive = false } = req.query;

    const tree = await categoryService.getCategoryTree(
      includeInactive === "true"
    );

    successResponse(res, {
      message: "Category tree fetched successfully",
      data: tree,
    });
  });

  // Get featured categories
  getFeaturedCategories = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const categories = await categoryService.getFeaturedCategories(
      parseInt(limit)
    );

    successResponse(res, {
      message: "Featured categories fetched successfully",
      data: categories,
    });
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

    successResponse(res, {
      message: "Categories searched successfully",
      data: categories,
    });
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

    successResponse(res, {
      message: "Category sort order updated successfully",
      data: category,
    });
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

    successResponse(res, {
      message: result.message,
      data: { modifiedCount: result.modifiedCount },
    });
  });

  // Get category statistics
  getCategoryStats = asyncHandler(async (req, res) => {
    const stats = await categoryService.getCategoryStats();

    successResponse(res, {
      message: "Category statistics fetched successfully",
      data: stats,
    });
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

    successResponse(res, {
      message: "Category image uploaded successfully",
      data: {
        category,
        image: uploadResult,
      },
    });
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

    successResponse(res, {
      message: "Category image removed successfully",
      data: updatedCategory,
    });
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

    successResponse(res, {
      message: `Level ${level} categories fetched successfully`,
      data: result,
    });
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

    successResponse(res, {
      message: "Root categories fetched successfully",
      data: result,
    });
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

    successResponse(res, {
      message: "Category children fetched successfully",
      data: result,
    });
  });

  // Get category ancestors (breadcrumb)
  getCategoryAncestors = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id, false);
    const ancestors = await category.getAncestors();

    successResponse(res, {
      message: "Category ancestors fetched successfully",
      data: ancestors,
    });
  });

  // Get category descendants
  getCategoryDescendants = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id, false);
    const descendants = await category.getDescendants();

    successResponse(res, {
      message: "Category descendants fetched successfully",
      data: descendants,
    });
  });

  // Update product count for category
  updateCategoryProductCount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id, false);
    await category.updateProductCount();

    successResponse(res, {
      message: "Category product count updated successfully",
      data: { productCount: category.productCount },
    });
  });
}

module.exports = new CategoryController();
