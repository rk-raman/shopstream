# Product Module

The Product module handles all product-related functionality including product catalog, categories, brands, search, and recommendations.

## Features

- Product CRUD operations
- Category management
- Brand management
- Advanced search with Elasticsearch
- Product recommendations
- Image upload and management
- Inventory tracking

## API Endpoints

### Products

- `GET /api/v1/products` - Get all products with filtering and pagination
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product (Admin only)
- `PUT /api/v1/products/:id` - Update product (Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)

### Categories

- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create category (Admin only)
- `PUT /api/v1/categories/:id` - Update category (Admin only)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

### Search

- `GET /api/v1/search` - Search products with advanced filters
- `GET /api/v1/search/suggestions` - Get search suggestions

### Recommendations

- `GET /api/v1/recommendations/:userId` - Get personalized recommendations
- `GET /api/v1/recommendations/similar/:productId` - Get similar products

## Models

### Product Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  categoryId: ObjectId,
  brandId: ObjectId,
  images: [String],
  stock: Number,
  sku: String,
  tags: [String],
  specifications: Object,
  isActive: Boolean
}
```

### Category Model

```javascript
{
  name: String,
  description: String,
  parentId: ObjectId,
  image: String,
  isActive: Boolean
}
```

### Brand Model

```javascript
{
  name: String,
  description: String,
  logo: String,
  website: String,
  isActive: Boolean
}
```

## Services

- **ProductService**: Core product operations
- **SearchService**: Elasticsearch integration
- **RecommendationService**: AI-powered recommendations
- **CategoryService**: Category management
- **BrandService**: Brand management

## Validation

All endpoints use Joi validation with comprehensive error handling. See [Validation Documentation](../shared/middleware/README.md) for details.

## Events

The module emits events for:

- Product created/updated/deleted
- Category changes
- Search queries
- Recommendation requests

## Dependencies

- MongoDB (Mongoose)
- Elasticsearch
- Cloudinary (image storage)
- Redis (caching)
