const {
  validateJoiMultiple,
} = require("../../../shared/middleware/validation.middleware");
const categorySchemas = require("./category.schemas");

// Create category validator
const validateCreateCategory = validateJoiMultiple(
  categorySchemas.createCategorySchema
);

// Update category validator
const validateUpdateCategory = validateJoiMultiple(
  categorySchemas.updateCategorySchema
);

// Get category by ID validator
const validateGetCategoryById = validateJoiMultiple(
  categorySchemas.getCategoryByIdSchema
);

// Get category by slug validator
const validateGetCategoryBySlug = validateJoiMultiple(
  categorySchemas.getCategoryBySlugSchema
);

// Get categories validator
const validateGetCategories = validateJoiMultiple(
  categorySchemas.getCategoriesSchema
);

// Delete category validator
const validateDeleteCategory = validateJoiMultiple(
  categorySchemas.deleteCategorySchema
);

// Search categories validator
const validateSearchCategories = validateJoiMultiple(
  categorySchemas.searchCategoriesSchema
);

// Update category sort order validator
const validateUpdateCategorySortOrder = validateJoiMultiple(
  categorySchemas.updateCategorySortOrderSchema
);

// Bulk update categories validator
const validateBulkUpdateCategories = validateJoiMultiple(
  categorySchemas.bulkUpdateCategoriesSchema
);

// Get categories by level validator
const validateGetCategoriesByLevel = validateJoiMultiple(
  categorySchemas.getCategoriesByLevelSchema
);

// Get featured categories validator
const validateGetFeaturedCategories = validateJoiMultiple(
  categorySchemas.getFeaturedCategoriesSchema
);

// Get category tree validator
const validateGetCategoryTree = validateJoiMultiple(
  categorySchemas.getCategoryTreeSchema
);

// Upload category image validator
const validateUploadCategoryImage = validateJoiMultiple(
  categorySchemas.uploadCategoryImageSchema
);

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateGetCategoryById,
  validateGetCategoryBySlug,
  validateGetCategories,
  validateDeleteCategory,
  validateSearchCategories,
  validateUpdateCategorySortOrder,
  validateBulkUpdateCategories,
  validateGetCategoriesByLevel,
  validateGetFeaturedCategories,
  validateGetCategoryTree,
  validateUploadCategoryImage,
};
