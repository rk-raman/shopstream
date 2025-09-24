# Seller Implementation Guide

This guide covers how to implement and use the Categories, Collections, and Brands system from the seller perspective in ShopStream.

## 🎯 Overview

As a seller, you can leverage the three-tier product organization system to:

- Organize products using existing categories and brands
- Create custom collections for marketing and promotions
- Optimize product discoverability and sales
- Track performance across different organizational structures

## 📋 Working with Categories

### **Understanding Category Structure**

Categories are predefined hierarchical structures managed by admins. As a seller, you:

- **Select** from existing categories when listing products
- **Inherit** category attributes for product specifications
- **Benefit** from category-based navigation and filtering

#### **Category Selection in Product Forms**

```jsx
// Product Form with Category Selection
import { useCategoryTree } from "@/hooks/useCategories";

const ProductForm = () => {
  const { data: categoryTree } = useCategoryTree();
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <form>
      <div className="category-selection">
        <label>Product Category *</label>
        <CategoryTreeSelect
          categories={categoryTree}
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="Select a category..."
        />

        {selectedCategory && (
          <div className="category-info">
            <p>Path: {selectedCategory.path}</p>
            <p>Commission: {selectedCategory.commission}%</p>
          </div>
        )}
      </div>

      {/* Category Attributes */}
      {selectedCategory?.attributes && (
        <CategoryAttributes
          attributes={selectedCategory.attributes}
          values={productAttributes}
          onChange={setProductAttributes}
        />
      )}
    </form>
  );
};
```

#### **Category Attributes Component**

```jsx
const CategoryAttributes = ({ attributes, values, onChange }) => {
  const handleAttributeChange = (attributeName, value) => {
    onChange((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  return (
    <div className="category-attributes">
      <h3>Product Specifications</h3>
      {attributes.map((attribute) => (
        <div key={attribute.name} className="attribute-field">
          <label>
            {attribute.name}
            {attribute.isRequired && <span className="required">*</span>}
          </label>

          {attribute.type === "select" && (
            <Select
              value={values[attribute.name] || ""}
              onValueChange={(value) =>
                handleAttributeChange(attribute.name, value)
              }
            >
              {attribute.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          )}

          {attribute.type === "multiselect" && (
            <MultiSelect
              options={attribute.options}
              value={values[attribute.name] || []}
              onChange={(value) => handleAttributeChange(attribute.name, value)}
            />
          )}

          {attribute.type === "text" && (
            <Input
              value={values[attribute.name] || ""}
              onChange={(e) =>
                handleAttributeChange(attribute.name, e.target.value)
              }
            />
          )}

          {attribute.type === "number" && (
            <Input
              type="number"
              value={values[attribute.name] || ""}
              onChange={(e) =>
                handleAttributeChange(attribute.name, e.target.value)
              }
            />
          )}
        </div>
      ))}
    </div>
  );
};
```

### **Category-Based Product Analytics**

```jsx
const CategoryPerformance = () => {
  const { data: categoryStats } = useCategoryPerformance();

  return (
    <div className="category-performance">
      <h2>Performance by Category</h2>
      <div className="category-stats">
        {categoryStats?.map((category) => (
          <div key={category._id} className="category-stat-card">
            <h3>{category.name}</h3>
            <div className="stats-grid">
              <div className="stat">
                <span className="label">Products</span>
                <span className="value">{category.productCount}</span>
              </div>
              <div className="stat">
                <span className="label">Sales</span>
                <span className="value">${category.revenue}</span>
              </div>
              <div className="stat">
                <span className="label">Commission</span>
                <span className="value">{category.commission}%</span>
              </div>
              <div className="stat">
                <span className="label">Avg. Price</span>
                <span className="value">${category.avgPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🏷️ Brand Management

### **Brand Selection and Association**

Sellers can associate products with existing verified brands or request new brand creation.

#### **API Endpoints**

```javascript
// Get available brands
GET /api/v1/products/brands?verified=true&active=true

// Request new brand creation
POST /api/v1/products/brands/request
{
  "name": "New Brand Name",
  "description": "Brand description",
  "website": "https://brand-website.com",
  "contactEmail": "contact@brand.com",
  "logo": "base64_image_data",
  "documentation": ["business_license.pdf", "trademark_cert.pdf"]
}
```

#### **Brand Selection Component**

```jsx
const BrandSelector = ({ value, onChange }) => {
  const { data: brands } = useVerifiedBrands();
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <div className="brand-selector">
      <label>Brand</label>
      <div className="brand-selection-wrapper">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a brand..." />
          </SelectTrigger>
          <SelectContent>
            {brands?.map((brand) => (
              <SelectItem key={brand._id} value={brand._id}>
                <div className="brand-option">
                  {brand.logo?.url && (
                    <img
                      src={brand.logo.url}
                      alt={brand.name}
                      className="brand-logo"
                    />
                  )}
                  <span>{brand.name}</span>
                  {brand.isVerified && (
                    <Badge variant="success">✓ Verified</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowRequestForm(true)}
        >
          Request New Brand
        </Button>
      </div>

      {showRequestForm && (
        <BrandRequestModal
          onClose={() => setShowRequestForm(false)}
          onSubmit={handleBrandRequest}
        />
      )}
    </div>
  );
};
```

#### **Brand Request Form**

```jsx
const BrandRequestModal = ({ onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [logoFile, setLogoFile] = useState(null);

  const submitBrandRequest = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    await onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request New Brand</DialogTitle>
          <DialogDescription>
            Submit a request to add a new brand. Admin approval required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitBrandRequest)} className="space-y-4">
          <div>
            <Label htmlFor="name">Brand Name *</Label>
            <Input
              {...register("name", { required: "Brand name is required" })}
              placeholder="Enter brand name"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Describe the brand..."
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              {...register("website")}
              type="url"
              placeholder="https://brand-website.com"
            />
          </div>

          <div>
            <Label htmlFor="logo">Brand Logo</Label>
            <FileUpload
              accept="image/*"
              onFileSelect={setLogoFile}
              preview={true}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### **Brand Performance Tracking**

```jsx
const BrandPerformance = () => {
  const { data: brandStats } = useBrandPerformance();

  return (
    <div className="brand-performance">
      <h2>Performance by Brand</h2>
      <div className="brand-stats-grid">
        {brandStats?.map((brand) => (
          <div key={brand._id} className="brand-performance-card">
            <div className="brand-header">
              {brand.logo?.url && <img src={brand.logo.url} alt={brand.name} />}
              <div>
                <h3>{brand.name}</h3>
                {brand.isVerified && <Badge>✓ Verified</Badge>}
              </div>
            </div>

            <div className="performance-metrics">
              <div className="metric">
                <span>Products</span>
                <span>{brand.productCount}</span>
              </div>
              <div className="metric">
                <span>Revenue</span>
                <span>${brand.revenue}</span>
              </div>
              <div className="metric">
                <span>Avg. Rating</span>
                <span>{brand.avgRating}/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 📦 Collections Management

### **Creating and Managing Collections**

Collections are seller-specific product groupings for marketing and organization.

#### **API Endpoints**

```javascript
// Get seller's collections
GET /api/v1/products/collections/my-collections

// Create new collection
POST /api/v1/products/collections
{
  "name": "Summer Sale 2024",
  "description": "Hot deals for summer season",
  "type": "manual",
  "products": ["product_id_1", "product_id_2"],
  "sortOrder": "manual",
  "seo": {
    "title": "Summer Sale - Up to 50% Off",
    "description": "Discover amazing summer deals on our curated collection"
  }
}

// Update collection
PUT /api/v1/products/collections/:id

// Add products to collection
POST /api/v1/products/collections/:id/products
{
  "productIds": ["product_id_3", "product_id_4"]
}
```

#### **Collection Management Interface**

```jsx
const CollectionManager = () => {
  const { data: collections } = useMyCollections();
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="collection-manager">
      <div className="header">
        <h1>My Collections</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Collection
        </Button>
      </div>

      <div className="collections-grid">
        {collections?.map((collection) => (
          <CollectionCard
            key={collection._id}
            collection={collection}
            onEdit={handleEditCollection}
            onDelete={handleDeleteCollection}
          />
        ))}
      </div>

      {showCreateForm && (
        <CollectionForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCollection}
        />
      )}
    </div>
  );
};
```

#### **Collection Form Component**

```jsx
const CollectionForm = ({ collection, onClose, onSubmit }) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: collection || {
      type: "manual",
      sortOrder: "manual",
      isVisible: true,
      isPublished: false,
    },
  });

  const [selectedProducts, setSelectedProducts] = useState(
    collection?.products || []
  );
  const [collectionImage, setCollectionImage] = useState(null);

  const collectionType = watch("type");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {collection ? "Edit Collection" : "Create New Collection"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="name">Collection Name *</Label>
                <Input
                  {...register("name", {
                    required: "Collection name is required",
                  })}
                  placeholder="Enter collection name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Describe your collection..."
                />
              </div>

              <div>
                <Label htmlFor="type">Collection Type</Label>
                <Select
                  value={collectionType}
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automated">
                    Automated (Coming Soon)
                  </SelectItem>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select
                  {...register("sortOrder")}
                  onValueChange={(value) => setValue("sortOrder", value)}
                >
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="best-selling">Best Selling</SelectItem>
                  <SelectItem value="created-desc">Newest First</SelectItem>
                  <SelectItem value="created-asc">Oldest First</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="alphabetical-asc">A-Z</SelectItem>
                  <SelectItem value="alphabetical-desc">Z-A</SelectItem>
                </Select>
              </div>

              <div>
                <Label>Collection Image</Label>
                <FileUpload
                  accept="image/*"
                  onFileSelect={setCollectionImage}
                  preview={true}
                  existingImage={collection?.image?.url}
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox {...register("isVisible")} id="isVisible" />
                  <Label htmlFor="isVisible">Visible to customers</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox {...register("isPublished")} id="isPublished" />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products">
              {collectionType === "manual" && (
                <ProductSelector
                  selectedProducts={selectedProducts}
                  onSelectionChange={setSelectedProducts}
                />
              )}

              {collectionType === "automated" && (
                <div className="text-center py-8">
                  <p>Automated collections are coming soon!</p>
                  <p className="text-sm text-gray-500">
                    This feature will allow you to automatically include
                    products based on rules.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div>
                <Label htmlFor="seo.title">SEO Title</Label>
                <Input
                  {...register("seo.title")}
                  placeholder="SEO title for search engines"
                  maxLength={60}
                />
              </div>

              <div>
                <Label htmlFor="seo.description">SEO Description</Label>
                <Textarea
                  {...register("seo.description")}
                  placeholder="SEO description for search engines"
                  maxLength={160}
                />
              </div>

              <div>
                <Label htmlFor="seo.keywords">SEO Keywords</Label>
                <TagInput
                  value={watch("seo.keywords") || []}
                  onChange={(keywords) => setValue("seo.keywords", keywords)}
                  placeholder="Add SEO keywords..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {collection ? "Update Collection" : "Create Collection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

#### **Product Selector for Collections**

```jsx
const ProductSelector = ({ selectedProducts, onSelectionChange }) => {
  const { data: myProducts } = useMyProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = myProducts?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (productId) => {
    const isSelected = selectedProducts.includes(productId);
    if (isSelected) {
      onSelectionChange(selectedProducts.filter((id) => id !== productId));
    } else {
      onSelectionChange([...selectedProducts, productId]);
    }
  };

  return (
    <div className="product-selector">
      <div className="search-bar">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="selected-count">
        {selectedProducts.length} products selected
      </div>

      <div className="products-grid">
        {filteredProducts?.map((product) => (
          <div
            key={product._id}
            className={`product-card ${
              selectedProducts.includes(product._id) ? "selected" : ""
            }`}
            onClick={() => toggleProduct(product._id)}
          >
            <div className="product-image">
              {product.images?.[0] && (
                <img src={product.images[0].url} alt={product.name} />
              )}
            </div>
            <div className="product-info">
              <h4>{product.name}</h4>
              <p>${product.basePrice}</p>
              <Badge
                variant={product.status === "active" ? "success" : "secondary"}
              >
                {product.status}
              </Badge>
            </div>
            <div className="selection-indicator">
              {selectedProducts.includes(product._id) && <CheckIcon />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **Collection Analytics**

```jsx
const CollectionAnalytics = () => {
  const { data: collectionStats } = useCollectionAnalytics();

  return (
    <div className="collection-analytics">
      <h2>Collection Performance</h2>

      <div className="overview-stats">
        <StatCard
          title="Total Collections"
          value={collectionStats?.totalCollections}
        />
        <StatCard
          title="Published Collections"
          value={collectionStats?.publishedCollections}
        />
        <StatCard title="Total Views" value={collectionStats?.totalViews} />
        <StatCard
          title="Avg. Products per Collection"
          value={collectionStats?.avgProductsPerCollection}
        />
      </div>

      <div className="collection-performance-list">
        {collectionStats?.collections?.map((collection) => (
          <div key={collection._id} className="collection-performance-item">
            <div className="collection-info">
              {collection.image?.url && (
                <img src={collection.image.url} alt={collection.name} />
              )}
              <div>
                <h3>{collection.name}</h3>
                <p>{collection.productCount} products</p>
              </div>
            </div>

            <div className="performance-metrics">
              <div className="metric">
                <span>Views</span>
                <span>{collection.viewCount}</span>
              </div>
              <div className="metric">
                <span>Clicks</span>
                <span>{collection.clickCount}</span>
              </div>
              <div className="metric">
                <span>CTR</span>
                <span>{collection.ctr}%</span>
              </div>
              <div className="metric">
                <span>Revenue</span>
                <span>${collection.revenue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🎯 Product Organization Strategy

### **Best Practices for Sellers**

#### **Category Selection**

- Choose the most specific category that fits your product
- Ensure all required category attributes are filled
- Use category attributes to improve searchability

#### **Brand Association**

- Always associate products with verified brands when possible
- Request new brands with complete documentation
- Maintain consistent brand representation across products

#### **Collection Creation**

- Create themed collections for marketing campaigns
- Use descriptive names and SEO-optimized descriptions
- Regularly update collections with new products
- Monitor collection performance and optimize accordingly

### **Integration Example**

```jsx
// Complete Product Management Component
const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="product-management">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductList />
        </TabsContent>

        <TabsContent value="collections">
          <CollectionManager />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="analytics-dashboard">
            <CategoryPerformance />
            <BrandPerformance />
            <CollectionAnalytics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

## 🚀 Implementation Checklist

### **Setup Requirements**

- [ ] Implement React Query hooks for all operations
- [ ] Set up seller authentication and role verification
- [ ] Create reusable components for category/brand/collection selection
- [ ] Implement file upload for collection images

### **UI Components**

- [ ] CategoryTreeSelect component
- [ ] BrandSelector with request functionality
- [ ] CollectionForm with tabbed interface
- [ ] ProductSelector for collection management
- [ ] Analytics dashboard components

### **API Integration**

- [ ] Category tree fetching and caching
- [ ] Brand selection and request APIs
- [ ] Collection CRUD operations
- [ ] Product association management
- [ ] Analytics data fetching

### **Performance Optimization**

- [ ] Implement proper caching strategies
- [ ] Use pagination for large product lists
- [ ] Optimize image loading and display
- [ ] Implement search debouncing

## 🔍 Troubleshooting

### **Common Issues**

1. **Category attributes not loading**: Check category selection and API response
2. **Brand request not submitting**: Verify file upload and form validation
3. **Collection products not updating**: Ensure proper product ID handling
4. **Analytics not displaying**: Check date ranges and data availability

### **Performance Tips**

1. **Use React Query** for efficient data fetching and caching
2. **Implement virtual scrolling** for large product lists
3. **Optimize images** with proper sizing and lazy loading
4. **Cache frequently accessed data** like category trees and brand lists

This seller implementation guide provides comprehensive tools for effective product organization and marketing through the three-tier system.
