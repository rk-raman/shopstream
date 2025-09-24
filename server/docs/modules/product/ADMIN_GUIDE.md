# Admin Implementation Guide

This guide covers how to implement and manage the Categories, Collections, and Brands system from the admin perspective in ShopStream.

## 🎯 Overview

As an admin, you have full control over the platform's product organization system. You can:

- Manage global category hierarchies
- Oversee brand verification and management
- Monitor seller collections across the platform
- Set commission rates and business rules
- Access comprehensive analytics and reporting

## 📋 Categories Management

### **Creating Category Hierarchies**

Categories form the backbone of product classification. Admins can create up to 3 levels of hierarchy.

#### **API Endpoints**

```javascript
// Get category tree
GET /api/v1/products/categories/tree

// Create new category
POST /api/v1/products/categories
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "parent": null, // null for root categories
  "attributes": [
    {
      "name": "Brand",
      "type": "select",
      "options": ["Apple", "Samsung", "Sony"],
      "isRequired": true,
      "isFilterable": true
    }
  ],
  "commission": 5.5,
  "metaTitle": "Electronics - ShopStream",
  "metaDescription": "Browse our wide range of electronic products"
}

// Update category
PUT /api/v1/products/categories/:id

// Delete category (moves products to parent)
DELETE /api/v1/products/categories/:id
```

#### **Frontend Implementation**

```jsx
// Admin Category Management Component
import { useCategoryTree, useCreateCategory } from "@/hooks/useCategories";

const AdminCategoryManager = () => {
  const { data: categoryTree, isLoading } = useCategoryTree();
  const createCategory = useCreateCategory();

  const handleCreateCategory = async (categoryData) => {
    try {
      await createCategory.mutateAsync(categoryData);
      toast.success("Category created successfully");
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  return (
    <div className="admin-category-manager">
      <CategoryTreeView
        categories={categoryTree}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        showCommission={true}
        showAnalytics={true}
      />
      <CategoryForm
        onSubmit={handleCreateCategory}
        showAdvancedOptions={true}
      />
    </div>
  );
};
```

### **Category Attributes System**

Define product specifications that inherit from categories:

```javascript
// Category with attributes
{
  "name": "Smartphones",
  "parent": "mobile_phones_id",
  "attributes": [
    {
      "name": "Screen Size",
      "type": "select",
      "options": ["5.5\"", "6.1\"", "6.7\""],
      "isRequired": true,
      "isFilterable": true
    },
    {
      "name": "Storage",
      "type": "multiselect",
      "options": ["64GB", "128GB", "256GB", "512GB"],
      "isRequired": true,
      "isFilterable": true
    },
    {
      "name": "RAM",
      "type": "number",
      "isRequired": false,
      "isFilterable": true
    }
  ]
}
```

### **Commission Management**

Set commission rates at category level:

```jsx
const CommissionManager = () => {
  const { data: categories } = useCategories();

  const updateCommission = async (categoryId, rate) => {
    await categoryService.updateCategory(categoryId, { commission: rate });
  };

  return (
    <div className="commission-manager">
      {categories.map((category) => (
        <div key={category._id} className="commission-row">
          <span>{category.name}</span>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={category.commission}
            onChange={(e) => updateCommission(category._id, e.target.value)}
          />
          <span>%</span>
        </div>
      ))}
    </div>
  );
};
```

## 🏷️ Brand Management

### **Brand Verification System**

Admins control brand verification and guidelines:

#### **API Endpoints**

```javascript
// Get all brands with admin filters
GET /api/v1/products/brands?includeUnverified=true&includeInactive=true

// Verify brand
PUT /api/v1/products/brands/:id/verify
{
  "isVerified": true,
  "verificationNotes": "Brand documentation verified"
}

// Update brand guidelines
PUT /api/v1/products/brands/:id
{
  "guidelines": {
    "logoUsage": "Logo must maintain minimum 20px height",
    "colorPalette": ["#FF0000", "#FFFFFF", "#000000"],
    "typography": "Use brand font for all marketing materials",
    "toneOfVoice": "Professional and approachable"
  }
}
```

#### **Brand Verification Interface**

```jsx
const BrandVerificationPanel = () => {
  const { data: pendingBrands } = usePendingBrands();
  const verifyBrand = useVerifyBrand();

  const handleVerification = async (brandId, verified, notes) => {
    await verifyBrand.mutateAsync({
      brandId,
      isVerified: verified,
      verificationNotes: notes,
    });
  };

  return (
    <div className="brand-verification">
      <h2>Pending Brand Verifications</h2>
      {pendingBrands?.map((brand) => (
        <div key={brand._id} className="verification-card">
          <div className="brand-info">
            <img src={brand.logo?.url} alt={brand.name} />
            <div>
              <h3>{brand.name}</h3>
              <p>{brand.description}</p>
              <p>Submitted by: {brand.submittedBy?.name}</p>
            </div>
          </div>

          <div className="verification-actions">
            <Button
              onClick={() => handleVerification(brand._id, true, "Approved")}
              className="bg-green-600"
            >
              Verify Brand
            </Button>
            <Button
              onClick={() =>
                handleVerification(brand._id, false, "Needs more documentation")
              }
              variant="outline"
            >
              Request Changes
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### **Brand Guidelines Management**

```jsx
const BrandGuidelinesEditor = ({ brand, onSave }) => {
  const [guidelines, setGuidelines] = useState(brand.guidelines || {});

  return (
    <div className="guidelines-editor">
      <div className="guideline-section">
        <label>Logo Usage Guidelines</label>
        <Textarea
          value={guidelines.logoUsage || ""}
          onChange={(e) =>
            setGuidelines((prev) => ({
              ...prev,
              logoUsage: e.target.value,
            }))
          }
          placeholder="Specify logo usage requirements..."
        />
      </div>

      <div className="guideline-section">
        <label>Brand Color Palette</label>
        <ColorPaletteEditor
          colors={guidelines.colorPalette || []}
          onChange={(colors) =>
            setGuidelines((prev) => ({
              ...prev,
              colorPalette: colors,
            }))
          }
        />
      </div>

      <div className="guideline-section">
        <label>Typography Guidelines</label>
        <Input
          value={guidelines.typography || ""}
          onChange={(e) =>
            setGuidelines((prev) => ({
              ...prev,
              typography: e.target.value,
            }))
          }
          placeholder="Brand typography requirements..."
        />
      </div>

      <Button onClick={() => onSave(guidelines)}>Save Guidelines</Button>
    </div>
  );
};
```

## 📦 Collections Oversight

### **Platform-wide Collection Management**

Monitor and manage collections across all sellers:

#### **API Endpoints**

```javascript
// Get all collections with admin filters
GET /api/v1/products/collections?includeHidden=true&seller=all

// Feature/unfeature collections
PUT /api/v1/products/collections/:id/feature
{
  "isFeatured": true,
  "featuredUntil": "2024-12-31T23:59:59Z"
}

// Collection analytics
GET /api/v1/products/collections/:id/analytics
```

#### **Collection Oversight Dashboard**

```jsx
const CollectionOversightDashboard = () => {
  const { data: collections } = useAllCollections();
  const { data: analytics } = useCollectionAnalytics();

  return (
    <div className="collection-oversight">
      <div className="overview-stats">
        <StatCard
          title="Total Collections"
          value={analytics?.totalCollections}
        />
        <StatCard
          title="Active Collections"
          value={analytics?.activeCollections}
        />
        <StatCard
          title="Featured Collections"
          value={analytics?.featuredCollections}
        />
      </div>

      <div className="collections-table">
        <DataTable
          data={collections}
          columns={[
            { key: "name", label: "Collection Name" },
            { key: "seller.name", label: "Seller" },
            { key: "productCount", label: "Products" },
            { key: "viewCount", label: "Views" },
            { key: "isPublished", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          actions={[
            { label: "Feature", action: handleFeatureCollection },
            { label: "Hide", action: handleHideCollection },
            { label: "Analytics", action: handleViewAnalytics },
          ]}
        />
      </div>
    </div>
  );
};
```

## 📊 Analytics & Reporting

### **Category Performance Analytics**

```jsx
const CategoryAnalytics = () => {
  const { data: categoryStats } = useCategoryAnalytics();

  return (
    <div className="category-analytics">
      <div className="metrics-grid">
        <MetricCard
          title="Top Performing Categories"
          data={categoryStats?.topCategories}
          renderItem={(category) => (
            <div className="category-metric">
              <span>{category.name}</span>
              <span>{category.productCount} products</span>
              <span>${category.revenue}</span>
            </div>
          )}
        />

        <MetricCard
          title="Commission Revenue"
          data={categoryStats?.commissionBreakdown}
          renderItem={(item) => (
            <div className="commission-metric">
              <span>{item.category}</span>
              <span>{item.rate}%</span>
              <span>${item.earned}</span>
            </div>
          )}
        />
      </div>

      <div className="charts-section">
        <CategoryGrowthChart data={categoryStats?.growth} />
        <CommissionTrendsChart data={categoryStats?.commissionTrends} />
      </div>
    </div>
  );
};
```

### **Brand Performance Tracking**

```jsx
const BrandAnalytics = () => {
  const { data: brandStats } = useBrandAnalytics();

  return (
    <div className="brand-analytics">
      <div className="brand-metrics">
        <div className="top-brands">
          <h3>Top Performing Brands</h3>
          {brandStats?.topBrands?.map((brand) => (
            <div key={brand._id} className="brand-stat">
              <img src={brand.logo?.url} alt={brand.name} />
              <div>
                <h4>
                  {brand.name} {brand.isVerified && "✓"}
                </h4>
                <p>{brand.productCount} products</p>
                <p>${brand.revenue} revenue</p>
              </div>
            </div>
          ))}
        </div>

        <div className="verification-stats">
          <h3>Verification Status</h3>
          <div className="verification-breakdown">
            <div>Verified: {brandStats?.verificationStats?.verified}</div>
            <div>Pending: {brandStats?.verificationStats?.pending}</div>
            <div>Unverified: {brandStats?.verificationStats?.unverified}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 🔧 Bulk Operations

### **Bulk Category Management**

```jsx
const BulkCategoryOperations = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const bulkUpdateCategories = useBulkUpdateCategories();

  const handleBulkCommissionUpdate = async (newRate) => {
    await bulkUpdateCategories.mutateAsync({
      categoryIds: selectedCategories,
      updates: { commission: newRate },
    });
  };

  const handleBulkStatusUpdate = async (isActive) => {
    await bulkUpdateCategories.mutateAsync({
      categoryIds: selectedCategories,
      updates: { isActive },
    });
  };

  return (
    <div className="bulk-operations">
      <div className="selection-info">
        {selectedCategories.length} categories selected
      </div>

      <div className="bulk-actions">
        <div className="commission-update">
          <Input
            type="number"
            placeholder="New commission rate"
            onChange={(e) => setNewCommissionRate(e.target.value)}
          />
          <Button onClick={() => handleBulkCommissionUpdate(newCommissionRate)}>
            Update Commission
          </Button>
        </div>

        <div className="status-actions">
          <Button onClick={() => handleBulkStatusUpdate(true)}>
            Activate Selected
          </Button>
          <Button onClick={() => handleBulkStatusUpdate(false)}>
            Deactivate Selected
          </Button>
        </div>
      </div>
    </div>
  );
};
```

## 🚀 Implementation Checklist

### **Backend Setup**

- [ ] Ensure all product module routes are mounted in `/routes/index.js`
- [ ] Configure admin role permissions in auth middleware
- [ ] Set up event listeners for analytics tracking
- [ ] Configure file upload for category/brand images

### **Frontend Setup**

- [ ] Create admin dashboard layout with navigation
- [ ] Implement React Query hooks for all admin operations
- [ ] Set up role-based route protection
- [ ] Create reusable admin components (DataTable, MetricCard, etc.)

### **Database Configuration**

- [ ] Create indexes for admin queries (seller lookups, date ranges)
- [ ] Set up aggregation pipelines for analytics
- [ ] Configure proper validation rules

### **Security Considerations**

- [ ] Implement admin-only middleware for sensitive operations
- [ ] Add audit logging for admin actions
- [ ] Set up rate limiting for bulk operations
- [ ] Validate admin permissions on frontend and backend

## 🔍 Troubleshooting

### **Common Issues**

1. **Category hierarchy errors**: Ensure max depth validation (3 levels)
2. **Commission calculation issues**: Verify number type and range validation
3. **Brand verification workflow**: Check role permissions and notification system
4. **Analytics performance**: Optimize aggregation queries with proper indexes

### **Performance Optimization**

1. **Use pagination** for large datasets
2. **Implement caching** for frequently accessed data
3. **Optimize database queries** with proper indexing
4. **Use React Query** for efficient data fetching and caching

This admin implementation provides comprehensive control over the platform's product organization system while maintaining security and performance standards.
