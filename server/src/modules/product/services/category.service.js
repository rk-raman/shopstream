const Category = require("../models/Category.model");
const Product = require("../models/Product.model");
const ApiError = require("../../../shared/utils/apiError");
const ProductEventPublisher = require("../events/publishers/ProductEventPublisher");
const productEventPublisher = new ProductEventPublisher();

// Create new category
const createCategory = async (categoryData, userId) => {
  try {
    // Check if category name already exists
    const existingCategory = await Category.findOne({
      name: categoryData.name,
    });
    if (existingCategory) {
      throw new ApiError(409, "Category with this name already exists");
    }

    // Check if slug already exists
    if (categoryData.slug) {
      const existingSlug = await Category.findOne({
        slug: categoryData.slug,
      });
      if (existingSlug) {
        throw new ApiError(409, "Category with this slug already exists");
      }
    }

    // Verify parent category exists and validate hierarchy
    if (categoryData.parent) {
      const parentCategory = await Category.findById(categoryData.parent);
      if (!parentCategory) {
        throw new ApiError(404, "Parent category not found");
      }

      // Check if parent is active
      if (!parentCategory.isActive) {
        throw new ApiError(400, "Cannot create category under inactive parent");
      }

      // Check hierarchy depth (max 3 levels)
      if (parentCategory.level >= 2) {
        throw new ApiError(400, "Category hierarchy cannot exceed 3 levels");
      }
    }

    // Create category
    const category = await Category.create(categoryData);

    // Populate parent if exists
    if (category.parent) {
      await category.populate("parent", "name slug level");
    }

    // Publish event
    await productEventPublisher.publishCategoryCreated({
      categoryId: category._id,
      userId: userId,
      categoryData: {
        name: category.name,
        slug: category.slug,
        level: category.level,
        parent: category.parent,
        isActive: category.isActive,
        isFeatured: category.isFeatured,
      },
      metadata: {
        timestamp: new Date(),
        source: "category_service",
      },
    });

    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to create category: ${error.message}`);
  }
};

// Get all categories with filters and pagination
const getCategories = async (filters = {}, options = {}) => {
  try {
    const {
      search,
      parent,
      level,
      isActive,
      isFeatured,
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = filters;

    const { page = 1, limit = 20, populate = false } = options;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (parent !== undefined) {
      query.parent = parent === "null" ? null : parent;
    }

    if (level !== undefined) {
      query.level = level;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination options
    const paginateOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      lean: false,
    };

    if (populate) {
      paginateOptions.populate = [
        { path: "parent", select: "name slug level" },
        { path: "children", select: "name slug level isActive" },
      ];
    }

    const result = await Category.paginate(query, paginateOptions);
    return result;
  } catch (error) {
    throw new ApiError(500, `Failed to fetch categories: ${error.message}`);
  }
};

// Get category by ID
const getCategoryById = async (categoryId, populate = true) => {
  try {
    let query = Category.findById(categoryId);

    if (populate) {
      query = query.populate([
        { path: "parent", select: "name slug level" },
        { path: "children", select: "name slug level isActive productCount" },
      ]);
    }

    const category = await query;
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch category: ${error.message}`);
  }
};

// Get category by slug
const getCategoryBySlug = async (slug, populate = true) => {
  try {
    let query = Category.findOne({ slug, isActive: true });

    if (populate) {
      query = query.populate([
        { path: "parent", select: "name slug level" },
        { path: "children", select: "name slug level isActive productCount" },
      ]);
    }

    const category = await query;
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to fetch category: ${error.message}`);
  }
};

// Update category
const updateCategory = async (categoryId, updateData, userId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // Check if name is being updated and already exists
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: updateData.name,
        _id: { $ne: categoryId },
      });
      if (existingCategory) {
        throw new ApiError(409, "Category with this name already exists");
      }
    }

    // Check if slug is being updated and already exists
    if (updateData.slug && updateData.slug !== category.slug) {
      const existingSlug = await Category.findOne({
        slug: updateData.slug,
        _id: { $ne: categoryId },
      });
      if (existingSlug) {
        throw new ApiError(409, "Category with this slug already exists");
      }
    }

    // Validate parent change
    if (
      updateData.parent !== undefined &&
      updateData.parent !== category.parent?.toString()
    ) {
      if (updateData.parent) {
        const parentCategory = await Category.findById(updateData.parent);
        if (!parentCategory) {
          throw new ApiError(404, "Parent category not found");
        }

        // Check if trying to set self as parent
        if (updateData.parent === categoryId) {
          throw new ApiError(400, "Category cannot be its own parent");
        }

        // Check if trying to create circular reference
        const descendants = await category.getDescendants();
        const descendantIds = descendants.map((d) => d._id.toString());
        if (descendantIds.includes(updateData.parent)) {
          throw new ApiError(
            400,
            "Cannot set descendant as parent (circular reference)"
          );
        }

        // Check hierarchy depth
        if (parentCategory.level >= 2) {
          throw new ApiError(400, "Category hierarchy cannot exceed 3 levels");
        }
      }
    }

    // Store original data for event
    const originalData = {
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      parent: category.parent,
    };

    // Update category
    Object.assign(category, updateData);
    await category.save();

    // Populate references
    await category.populate([
      { path: "parent", select: "name slug level" },
      { path: "children", select: "name slug level isActive" },
    ]);

    // Publish event
    await productEventPublisher.publishCategoryUpdated({
      categoryId: category._id,
      userId: userId,
      originalData,
      updatedData: {
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        isFeatured: category.isFeatured,
        parent: category.parent,
      },
      changes: Object.keys(updateData),
      metadata: {
        timestamp: new Date(),
        source: "category_service",
      },
    });

    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to update category: ${error.message}`);
  }
};

// Delete category
const deleteCategory = async (categoryId, userId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: categoryId });
    if (childrenCount > 0) {
      throw new ApiError(
        400,
        "Cannot delete category with subcategories. Delete subcategories first."
      );
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: categoryId });
    if (productCount > 0) {
      throw new ApiError(
        400,
        "Cannot delete category with products. Move or delete products first."
      );
    }

    // Store category data for event
    const categoryData = {
      name: category.name,
      slug: category.slug,
      level: category.level,
      parent: category.parent,
      productCount: category.productCount,
    };

    // Delete category
    await Category.findByIdAndDelete(categoryId);

    // Publish event
    await productEventPublisher.publishCategoryDeleted({
      categoryId: categoryId,
      userId: userId,
      categoryData,
      metadata: {
        timestamp: new Date(),
        source: "category_service",
      },
    });

    return { message: "Category deleted successfully" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Failed to delete category: ${error.message}`);
  }
};

// Get category tree
const getCategoryTree = async (includeInactive = false) => {
  try {
    const query = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(query)
      .sort({ level: 1, sortOrder: 1 })
      .lean();

    // Build tree structure
    const buildTree = (parentId = null) => {
      return categories
        .filter((cat) => {
          if (parentId === null) {
            return cat.parent === null || cat.parent === undefined;
          }
          return cat.parent && cat.parent.toString() === parentId.toString();
        })
        .map((cat) => ({
          ...cat,
          children: buildTree(cat._id),
        }));
    };

    return buildTree();
  } catch (error) {
    throw new ApiError(500, `Failed to fetch category tree: ${error.message}`);
  }
};

// Get featured categories
const getFeaturedCategories = async (limit = 10) => {
  try {
    const categories = await Category.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({ sortOrder: 1 })
      .limit(limit)
      .populate("parent", "name slug");

    return categories;
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to fetch featured categories: ${error.message}`
    );
  }
};

// Search categories
const searchCategories = async (searchTerm, options = {}) => {
  try {
    const { limit = 20, includeInactive = false } = options;

    const query = {
      $text: { $search: searchTerm },
    };

    if (!includeInactive) {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .populate("parent", "name slug");

    return categories;
  } catch (error) {
    throw new ApiError(500, `Failed to search categories: ${error.message}`);
  }
};

// Update category sort order
const updateCategorySortOrder = async (categoryId, sortOrder, userId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    const originalSortOrder = category.sortOrder;
    category.sortOrder = sortOrder;
    await category.save();

    // Publish event
    await productEventPublisher.publishCategoryUpdated({
      categoryId: category._id,
      userId: userId,
      originalData: { sortOrder: originalSortOrder },
      updatedData: { sortOrder: sortOrder },
      changes: ["sortOrder"],
      metadata: {
        timestamp: new Date(),
        source: "category_service",
      },
    });

    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      `Failed to update category sort order: ${error.message}`
    );
  }
};

// Bulk update categories
const bulkUpdateCategories = async (categoryIds, updateData, userId) => {
  try {
    const result = await Category.updateMany(
      { _id: { $in: categoryIds } },
      updateData
    );

    // Publish bulk update event
    await productEventPublisher.publishCategoryBulkUpdated({
      categoryIds,
      userId: userId,
      updateData,
      modifiedCount: result.modifiedCount,
      metadata: {
        timestamp: new Date(),
        source: "category_service",
      },
    });

    return {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} categories updated successfully`,
    };
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to bulk update categories: ${error.message}`
    );
  }
};

// Get category statistics
const getCategoryStats = async () => {
  try {
    const stats = await Category.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          activeCategories: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          featuredCategories: {
            $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] },
          },
          rootCategories: {
            $sum: { $cond: [{ $eq: ["$level", 0] }, 1, 0] },
          },
          totalProductCount: { $sum: "$productCount" },
        },
      },
    ]);

    const levelStats = await Category.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      overview: stats[0] || {
        totalCategories: 0,
        activeCategories: 0,
        featuredCategories: 0,
        rootCategories: 0,
        totalProductCount: 0,
      },
      levelDistribution: levelStats,
    };
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to fetch category statistics: ${error.message}`
    );
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getFeaturedCategories,
  searchCategories,
  updateCategorySortOrder,
  bulkUpdateCategories,
  getCategoryStats,
};
