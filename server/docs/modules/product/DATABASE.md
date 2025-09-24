# Database Schema Documentation

Complete database schema reference for ShopStream's Categories, Collections, and Brands system.

## 🗄️ Database Overview

ShopStream uses MongoDB with Mongoose ODM for data modeling. The system implements a three-tier product organization structure with proper indexing and relationships.

### **Database Structure**

```
shopstream_db/
├── categories          # Hierarchical product classification
├── brands             # Product manufacturers/vendors
├── collections        # Marketing product groupings
├── products           # Main product entities
├── users              # Customer/seller/admin accounts
├── carts              # Shopping cart data
├── orders             # Order management
└── uploads            # File upload tracking
```

## 📋 Categories Collection

### **Schema Definition**

```javascript
{
  _id: ObjectId,
  name: String,              // Required, unique, max 100 chars
  slug: String,              // Required, unique, lowercase
  description: String,       // Max 500 chars
  shortDescription: String,  // Max 200 chars

  // Hierarchy
  parent: ObjectId,          // Reference to parent category
  level: Number,             // 0-3 (max 3 levels deep)
  path: String,              // e.g., "electronics/mobile/smartphones"

  // Media
  image: {
    public_id: String,
    url: String
  },
  icon: String,              // Default: "📦"

  // SEO
  metaTitle: String,         // Max 60 chars
  metaDescription: String,   // Max 160 chars
  metaKeywords: [String],

  // Status
  isActive: Boolean,         // Default: true
  isFeatured: Boolean,       // Default: false

  // Analytics
  productCount: Number,      // Default: 0
  viewCount: Number,         // Default: 0

  // Sorting
  sortOrder: Number,         // Default: 0

  // Attributes/Specifications
  attributes: [{
    name: String,            // Required
    type: String,            // enum: ["text", "number", "select", "multiselect", "boolean"]
    options: [String],       // For select/multiselect types
    isRequired: Boolean,     // Default: false
    isFilterable: Boolean,   // Default: true
    isSearchable: Boolean    // Default: false
  }],

  // Commission settings
  commission: Number,        // 0-100, default: 0

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### **Indexes**

```javascript
// Text search index
{ name: "text", description: "text" }

// Hierarchy and filtering indexes
{ parent: 1, isActive: 1 }
{ level: 1, sortOrder: 1 }
{ slug: 1 }
{ isFeatured: 1, isActive: 1 }
```

### **Virtual Fields**

```javascript
// Children categories
children: [{
  ref: "Category",
  localField: "_id",
  foreignField: "parent"
}]

// Products in category
products: [{
  ref: "Product",
  localField: "_id",
  foreignField: "category"
}]

// Full path virtual
fullPath: computed from path || slug
```

### **Validation Rules**

- `name`: Required, unique, 1-100 characters
- `level`: Maximum 3 levels deep
- `commission`: 0-100 range
- `slug`: Auto-generated from name if not provided
- `path`: Auto-generated based on hierarchy

## 🏷️ Brands Collection

### **Schema Definition**

```javascript
{
  _id: ObjectId,
  name: String,              // Required, max 100 chars
  slug: String,              // Required, unique, lowercase
  description: String,       // Max 1000 chars

  // Media
  logo: {
    public_id: String,
    url: String
  },
  banner: {
    public_id: String,
    url: String
  },
  gallery: [{
    public_id: String,
    url: String,
    alt: String
  }],

  // Company Information
  website: String,
  contactEmail: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Social Media
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },

  // Verification
  isVerified: Boolean,       // Default: false
  verificationDate: Date,
  verificationNotes: String,

  // Status
  isActive: Boolean,         // Default: true
  isFeatured: Boolean,       // Default: false

  // Categories this brand operates in
  categories: [ObjectId],    // References to Category

  // Analytics
  productCount: Number,      // Default: 0
  viewCount: Number,         // Default: 0
  rating: Number,            // Average rating
  reviewCount: Number,       // Total reviews

  // SEO
  metaTitle: String,         // Max 60 chars
  metaDescription: String,   // Max 160 chars
  metaKeywords: [String],

  // Tags
  tags: [String],

  // Commission settings
  commission: Number,        // 0-100, default: 0

  // Brand Guidelines
  guidelines: {
    logoUsage: String,
    colorPalette: [String],
    typography: String,
    toneOfVoice: String
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### **Indexes**

```javascript
// Text search index
{ name: "text", description: "text" }

// Filtering indexes
{ slug: 1 }
{ isActive: 1, isFeatured: 1 }
{ categories: 1 }
{ tags: 1 }
{ isVerified: 1 }
```

### **Virtual Fields**

```javascript
// Products by this brand
products: [{
  ref: "Product",
  localField: "_id",
  foreignField: "brand"
}]

// Display name with verification badge
displayName: computed as `${name} ${isVerified ? '✓' : ''}`
```

### **Validation Rules**

- `name`: Required, 1-100 characters
- `slug`: Auto-generated from name if not provided
- `contactEmail`: Valid email format
- `website`: Valid URL format
- `commission`: 0-100 range

## 📦 Collections Collection

### **Schema Definition**

```javascript
{
  _id: ObjectId,
  name: String,              // Required, max 100 chars
  handle: String,            // Required, unique, lowercase, max 100 chars
  description: String,       // Max 1000 chars

  // Collection Type
  type: String,              // enum: ["manual", "automated"], default: "manual"

  // Automated Collection Rules (future implementation)
  rules: {
    conditions: [{
      field: String,         // enum: ["title", "type", "vendor", "price", "weight", "tag", "category", "brand"]
      relation: String,      // enum: ["equals", "not_equals", "starts_with", "ends_with", "contains", "not_contains", "greater_than", "less_than"]
      value: String
    }],
    match: String           // enum: ["all", "any"], default: "all"
  },

  // Products (for manual collections)
  products: [ObjectId],      // References to Product

  // Media
  image: {
    public_id: String,
    url: String
  },

  // SEO
  seo: {
    title: String,           // Max 60 chars
    description: String,     // Max 160 chars
    keywords: [String]       // Max 50 chars each
  },

  // Visibility and Status
  isVisible: Boolean,        // Default: true
  isPublished: Boolean,      // Default: false

  // Sorting
  sortOrder: String,         // enum: ["manual", "best-selling", "created-desc", "created-asc", "price-desc", "price-asc", "alphabetical-asc", "alphabetical-desc"]

  // Analytics
  productCount: Number,      // Default: 0
  viewCount: Number,         // Default: 0

  // Seller/Owner
  seller: ObjectId,          // Required, reference to User

  // Timestamps
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Indexes**

```javascript
// Text search index
{ name: "text", description: "text" }

// Filtering indexes
{ seller: 1, isVisible: 1 }
{ handle: 1 }
{ type: 1, isVisible: 1 }
{ isPublished: 1, isVisible: 1 }
{ createdAt: -1 }
```

### **Virtual Fields**

```javascript
// Collection URL
url: computed as `/collections/${handle}`

// Populated products with details
populatedProducts: [{
  ref: "Product",
  localField: "products",
  foreignField: "_id",
  options: { sort: { createdAt: -1 } }
}]
```

### **Validation Rules**

- `name`: Required, 1-100 characters
- `handle`: Auto-generated from name, unique
- `seller`: Required reference to User
- `type`: Must be "manual" or "automated"
- `sortOrder`: Valid enum value

## 🛍️ Products Collection

### **Schema Definition**

```javascript
{
  _id: ObjectId,
  name: String,              // Required, max 200 chars
  slug: String,              // Required, unique, lowercase
  description: String,       // Max 5000 chars
  shortDescription: String,  // Max 300 chars

  // Organization
  category: ObjectId,        // Required, reference to Category
  brand: ObjectId,           // Reference to Brand
  seller: ObjectId,          // Required, reference to User

  // Pricing
  basePrice: Number,         // Required, min: 0
  discountPrice: Number,     // Min: 0
  costPrice: Number,         // Min: 0
  currency: String,          // Default: "USD"

  // Inventory
  stock: Number,             // Default: 0, min: 0
  lowStockThreshold: Number, // Default: 10
  trackQuantity: Boolean,    // Default: true
  allowBackorder: Boolean,   // Default: false

  // Media
  images: [{
    public_id: String,
    url: String,
    alt: String,
    isPrimary: Boolean       // Default: false
  }],

  // Product Details
  sku: String,               // Unique
  barcode: String,
  weight: Number,            // In grams
  dimensions: {
    length: Number,          // In cm
    width: Number,           // In cm
    height: Number           // In cm
  },

  // Specifications (inherited from category attributes)
  specifications: Map,       // Dynamic key-value pairs

  // Variants (for future implementation)
  variants: [{
    name: String,
    options: [String],
    price: Number,
    stock: Number,
    sku: String,
    image: String
  }],

  // SEO
  seo: {
    title: String,           // Max 60 chars
    description: String,     // Max 160 chars
    keywords: [String]
  },

  // Status and Visibility
  status: String,            // enum: ["draft", "active", "inactive", "discontinued"], default: "draft"
  isPublished: Boolean,      // Default: false
  isFeatured: Boolean,       // Default: false

  // Shipping
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: Boolean,   // Default: false
    shippingClass: String
  },

  // Tags and Search
  tags: [String],
  searchKeywords: [String],

  // Analytics
  viewCount: Number,         // Default: 0
  salesCount: Number,        // Default: 0
  wishlistCount: Number,     // Default: 0

  // Reviews
  rating: Number,            // Average rating, 0-5
  reviewCount: Number,       // Total reviews

  // Timestamps
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Indexes**

```javascript
// Text search index
{ name: "text", description: "text", tags: "text" }

// Filtering indexes
{ category: 1, status: 1 }
{ brand: 1, status: 1 }
{ seller: 1, status: 1 }
{ slug: 1 }
{ sku: 1 }
{ status: 1, isPublished: 1 }
{ isFeatured: 1, status: 1 }
{ basePrice: 1 }
{ createdAt: -1 }
{ rating: -1 }
{ salesCount: -1 }

// Compound indexes for common queries
{ category: 1, brand: 1, status: 1 }
{ seller: 1, category: 1, status: 1 }
{ basePrice: 1, status: 1, isPublished: 1 }
```

### **Virtual Fields**

```javascript
// Final price calculation
finalPrice: computed from basePrice and discountPrice

// Discount percentage
discountPercentage: computed from basePrice and discountPrice

// Stock status
stockStatus: computed based on stock and lowStockThreshold

// Primary image
primaryImage: computed from images array where isPrimary: true
```

### **Validation Rules**

- `name`: Required, 1-200 characters
- `basePrice`: Required, minimum 0
- `category`: Required reference to Category
- `seller`: Required reference to User
- `status`: Valid enum value
- `slug`: Auto-generated from name if not provided
- `sku`: Unique if provided

## 👥 Users Collection (Related)

### **Relevant Fields for Product System**

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  role: String,              // enum: ["customer", "seller", "admin"]

  // Seller-specific fields
  sellerProfile: {
    businessName: String,
    businessType: String,
    taxId: String,
    address: Object,
    bankDetails: Object,
    isVerified: Boolean,
    verificationDocuments: [Object]
  },

  // Status
  isActive: Boolean,
  isEmailVerified: Boolean,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## 🔗 Relationships and References

### **Category Relationships**

```javascript
// Parent-Child Hierarchy
Category.parent → Category._id
Category.children ← Category.parent

// Category-Product Relationship
Category._id ← Product.category
```

### **Brand Relationships**

```javascript
// Brand-Category Association
Brand.categories → [Category._id]

// Brand-Product Relationship
Brand._id ← Product.brand
```

### **Collection Relationships**

```javascript
// Collection-Product Association
Collection.products → [Product._id]

// Collection-Seller Ownership
Collection.seller → User._id
```

### **Product Relationships**

```javascript
// Product belongs to Category
Product.category → Category._id

// Product belongs to Brand
Product.brand → Brand._id

// Product belongs to Seller
Product.seller → User._id
```

## 📊 Aggregation Pipelines

### **Category Analytics Pipeline**

```javascript
[
  {
    $match: { isActive: true },
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "category",
      as: "products",
    },
  },
  {
    $addFields: {
      productCount: { $size: "$products" },
      avgPrice: { $avg: "$products.basePrice" },
      totalRevenue: { $sum: "$products.salesCount" },
    },
  },
  {
    $sort: { productCount: -1 },
  },
];
```

### **Brand Performance Pipeline**

```javascript
[
  {
    $match: { isActive: true },
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "brand",
      as: "products",
    },
  },
  {
    $addFields: {
      productCount: { $size: "$products" },
      avgRating: { $avg: "$products.rating" },
      totalSales: { $sum: "$products.salesCount" },
    },
  },
  {
    $sort: { totalSales: -1 },
  },
];
```

### **Collection Statistics Pipeline**

```javascript
[
  {
    $match: {
      seller: ObjectId("seller_id"),
      isPublished: true,
    },
  },
  {
    $lookup: {
      from: "products",
      localField: "products",
      foreignField: "_id",
      as: "productDetails",
    },
  },
  {
    $addFields: {
      productCount: { $size: "$productDetails" },
      totalValue: { $sum: "$productDetails.basePrice" },
    },
  },
];
```

## 🔧 Database Configuration

### **MongoDB Settings**

```javascript
// Connection string
mongodb://localhost:27017/shopstream_db

// Connection options
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}
```

### **Mongoose Configuration**

```javascript
// Global options
mongoose.set("strictQuery", false);
mongoose.set("toJSON", { virtuals: true });
mongoose.set("toObject", { virtuals: true });

// Pagination plugin
mongoosePaginate.paginate.options = {
  lean: false,
  limit: 20,
  customLabels: {
    totalDocs: "totalDocs",
    docs: "docs",
    limit: "limit",
    page: "page",
    nextPage: "nextPage",
    prevPage: "prevPage",
    totalPages: "totalPages",
    hasNextPage: "hasNextPage",
    hasPrevPage: "hasPrevPage",
  },
};
```

## 🚀 Performance Optimization

### **Indexing Strategy**

1. **Text Search**: Full-text search on name and description fields
2. **Filtering**: Compound indexes for common filter combinations
3. **Sorting**: Indexes on frequently sorted fields
4. **Relationships**: Indexes on foreign key fields

### **Query Optimization**

1. **Use projection** to limit returned fields
2. **Implement pagination** for large datasets
3. **Use aggregation pipelines** for complex queries
4. **Cache frequently accessed data**

### **Database Maintenance**

```javascript
// Regular maintenance tasks
db.categories.reIndex();
db.brands.reIndex();
db.collections.reIndex();
db.products.reIndex();

// Update product counts
db.categories.updateMany({}, { $set: { productCount: 0 } });
db.brands.updateMany({}, { $set: { productCount: 0 } });
```

## 🔒 Security Considerations

### **Data Validation**

- All schemas include comprehensive validation rules
- Input sanitization through Joi validators
- XSS protection for text fields

### **Access Control**

- Role-based access control (RBAC)
- Field-level permissions
- Audit logging for sensitive operations

### **Data Integrity**

- Referential integrity through proper relationships
- Cascade delete operations where appropriate
- Transaction support for critical operations

This database schema provides a robust foundation for the ShopStream e-commerce platform's three-tier product organization system.
