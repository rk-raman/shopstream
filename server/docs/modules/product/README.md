# Product Module

A comprehensive e-commerce product management system built with Node.js, Express, and MongoDB. This module provides complete product catalog management with advanced features including variants, categories, brands, reviews, and inventory tracking.

## 🚀 Features

### Core Product Management

- ✅ **Product CRUD Operations** - Create, read, update, delete products
- ✅ **Product Variants** - Support for product variations (size, color, etc.)
- ✅ **Inventory Management** - Stock tracking with low stock alerts
- ✅ **Multi-media Support** - Images and videos with Cloudinary integration
- ✅ **SEO Optimization** - Meta titles, descriptions, and friendly URLs
- ✅ **Product Reviews & Ratings** - Customer feedback system
- ✅ **Product Specifications** - Detailed technical specifications

### Categorization & Organization

- ✅ **Hierarchical Categories** - Multi-level category structure (up to 3 levels)
- ✅ **Brand Management** - Complete brand information and assets
- ✅ **Tag System** - Flexible product tagging
- ✅ **Featured Products** - Highlight special products

### Advanced Features

- ✅ **Advanced Search** - Full-text search with filters
- ✅ **Digital Products** - Support for downloadable products
- ✅ **Bulk Operations** - Batch update multiple products
- ✅ **Product Analytics** - Views, sales, and performance tracking
- ✅ **Approval Workflow** - Admin approval system for seller products
- ✅ **Shipping Management** - Weight, dimensions, and shipping classes

## 📁 Module Structure

```
src/modules/product/
├── controllers/
│   ├── product.controller.js     # Main product operations
│   ├── category.controller.js    # Category management (placeholder)
│   └── search.controller.js      # Search functionality (placeholder)
├── models/
│   ├── Product.model.js          # Product schema with variants
│   ├── Category.model.js         # Hierarchical category model
│   ├── Brand.model.js            # Brand information model
│   └── index.js                  # Model exports
├── routes/
│   ├── product.routes.js         # Product API routes
│   ├── category.routes.js        # Category routes (placeholder)
│   └── index.js                  # Route exports (placeholder)
├── validators/
│   ├── product.schemas.js        # Joi validation schemas
│   └── product.validators.js     # Validation middleware
└── services/
    └── product.service.js        # Business logic (referenced)
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Express.js application

### Installation

1. **Install Dependencies**

```bash
npm install mongoose joi express multer slugify
npm install mongoose-paginate-v2  # For pagination
```

2. **Environment Variables**

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database

# Cloudinary (for image/video uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# File Upload
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760  # 10MB
```

3. **Database Setup**
   The models will automatically create the necessary indexes when the application starts.

## 📚 API Documentation

### Product Endpoints

#### Public Routes

```http
GET    /api/products                    # Get all products with filters
GET    /api/products/search             # Search products
GET    /api/products/featured           # Get featured products
GET    /api/products/category/:categoryId  # Get products by category
GET    /api/products/seller/:sellerId   # Get products by seller
GET    /api/products/:productId         # Get product by ID
GET    /api/products/slug/:slug         # Get product by slug
GET    /api/products/:productId/related # Get related products
GET    /api/products/:productId/variants # Get product variants
```

#### Authenticated Routes (Sellers/Admins)

```http
POST   /api/products                    # Create new product
GET    /api/products/my/products        # Get my products (seller)
PUT    /api/products/:productId         # Update product
DELETE /api/products/:productId         # Delete product
POST   /api/products/:productId/images  # Upload product images
PATCH  /api/products/:productId/stock   # Update stock
GET    /api/products/:productId/stats   # Get product statistics
```

#### Variant Management

```http
POST   /api/products/:productId/variants           # Add variant
PUT    /api/products/:productId/variants/:variantId # Update variant
DELETE /api/products/:productId/variants/:variantId # Delete variant
```

#### Admin Only Routes

```http
PATCH  /api/products/:productId/approve    # Approve product
PATCH  /api/products/:productId/reject     # Reject product
PATCH  /api/products/:productId/featured   # Toggle featured status
POST   /api/products/bulk/update           # Bulk update products
GET    /api/products/admin/pending         # Get pending products
```

### Product Search & Filtering

The search API supports extensive filtering options:

```javascript
// Example search request
GET /api/products/search?q=laptop&category=electronics&brand=apple&minPrice=500&maxPrice=2000&sortBy=price&sortOrder=asc&page=1&limit=12
```

**Available Filters:**

- `q` - Search term
- `category` - Category ID
- `brand` - Brand ID
- `seller` - Seller ID
- `minPrice` / `maxPrice` - Price range
- `minRating` - Minimum rating
- `tags` - Product tags
- `status` - Product status
- `inStock` - Only in-stock products
- `isFeatured` - Featured products only
- `hasVariants` - Products with variants
- `isDigital` - Digital products only

## 🔧 Usage Examples

### Creating a Product

```javascript
const productData = {
  name: "Premium Laptop",
  description: "High-performance laptop for professionals",
  shortDescription: "Powerful laptop with latest specs",
  category: "60f1b2b4c8d4f12a3c4d5e6f", // ObjectId
  brand: "60f1b2b4c8d4f12a3c4d5e70", // ObjectId
  basePrice: 1299.99,
  discountPrice: 1199.99,
  stock: 50,
  sku: "LAPTOP-001",
  tags: ["laptop", "computer", "electronics"],
  specifications: [
    { name: "Processor", value: "Intel Core i7" },
    { name: "RAM", value: "16GB DDR4" },
    { name: "Storage", value: "512GB SSD" },
  ],
  weight: 2000, // grams
  dimensions: {
    length: 35,
    width: 25,
    height: 2,
  },
};

// POST /api/products
```

### Creating Product with Variants

```javascript
const variantProduct = {
  name: "T-Shirt Collection",
  description: "Premium cotton t-shirts in multiple sizes and colors",
  category: "clothing-id",
  basePrice: 29.99,
  hasVariants: true,
  variants: [
    {
      name: "Size-Color",
      value: "Small-Red",
      price: 29.99,
      stock: 10,
      sku: "TSHIRT-SM-RED",
    },
    {
      name: "Size-Color",
      value: "Medium-Blue",
      price: 29.99,
      stock: 15,
      sku: "TSHIRT-MD-BLUE",
    },
  ],
};
```

### Advanced Product Search

```javascript
const searchOptions = {
  q: "smartphone",
  category: "electronics-id",
  minPrice: 200,
  maxPrice: 800,
  minRating: 4,
  inStock: true,
  sortBy: "rating.average",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};

// GET /api/products/search with query parameters
```

## 🏗️ Data Models

### Product Model Features

- **Flexible Pricing** - Base price, discount price, automatic percentage calculation
- **Media Management** - Multiple images and videos with main image designation
- **Variant Support** - Complex product variations with individual pricing and stock
- **Rich Specifications** - Categorized product specifications
- **SEO Ready** - Meta tags, slugs, and search optimization
- **Analytics Tracking** - Views, sales, wishlists tracking
- **Status Management** - Draft, active, inactive, discontinued states
- **Approval Workflow** - Admin approval system for marketplace scenarios

### Category Model Features

- **Hierarchical Structure** - Up to 3 levels of categories
- **Path Management** - Automatic path generation for breadcrumbs
- **Attribute System** - Define category-specific product attributes
- **SEO Support** - Meta tags and descriptions
- **Analytics** - Product counts and view tracking

### Brand Model Features

- **Complete Brand Info** - Logo, banner, company information
- **Social Media Links** - All major social platforms
- **Verification System** - Verified brand badges
- **Brand Guidelines** - Logo usage, colors, typography
- **Analytics** - Product count, follower count, views

## 🔒 Authentication & Authorization

The module uses role-based access control:

- **Public** - View products, search, read reviews
- **Authenticated Users** - Add reviews, wishlist products
- **Sellers** - Manage their own products, variants, inventory
- **Admins** - Full access, approve products, bulk operations

## 📊 Analytics & Reporting

### Product Analytics

- View count tracking
- Sales performance
- Wishlist additions
- Rating distribution
- Low stock alerts

### Category Analytics

- Product count per category
- Average ratings by category
- Sales performance by category
- Price analysis by category

### Seller Analytics

- Total products and sales
- Revenue tracking
- Performance metrics
- Customer ratings

## 🚦 Validation & Error Handling

The module uses comprehensive Joi validation schemas:

- **Input Sanitization** - Clean and validate all inputs
- **Type Checking** - Strict data type validation
- **Business Rules** - Enforce business logic constraints
- **File Validation** - Image and video upload validation
- **Error Messages** - Clear, user-friendly error messages

## 🔧 Performance Optimizations

### Database Optimizations

- **Strategic Indexing** - Optimized indexes for common queries
- **Aggregation Pipelines** - Efficient data aggregation
- **Pagination** - Built-in pagination support
- **Text Search** - MongoDB text search indexes

### Caching Strategy

- Static content caching
- Database query result caching
- Image optimization and CDN delivery

## 🧪 Testing

```bash
# Run tests (implement your testing strategy)
npm test

# Test specific modules
npm run test:products
npm run test:categories
npm run test:brands
```

## 🚀 Deployment

### Production Checklist

- [ ] Set up MongoDB with proper indexes
- [ ] Configure Cloudinary for media storage
- [ ] Set up proper environment variables
- [ ] Configure file upload limits
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Set up backup strategies

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use ESLint configuration
- Follow JSDoc documentation standards
- Write comprehensive tests
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, please:

1. Check the documentation above
2. Search existing issues
3. Create a new issue with detailed information
4. Join our community discussions

## 🔮 Roadmap

### Upcoming Features

- [ ] Product bundles and kits
- [ ] Advanced inventory management
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Product recommendations engine
- [ ] Integration with payment systems
- [ ] Advanced shipping calculations
- [ ] Product comparison features

---

**Built with ❤️ for modern e-commerce applications**
