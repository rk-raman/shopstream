# API Documentation

Complete API reference for ShopStream's Categories, Collections, and Brands system.

## 🔗 Base URL

```
Production: https://api.shopstream.com
Development: http://localhost:5000
```

All API endpoints are prefixed with `/api/v1`

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### **Role-based Access**

- **Customer**: Basic product browsing and cart operations
- **Seller**: Product management, collections, brand requests
- **Admin**: Full system access, category management, brand verification

## 📋 Categories API

### **Get Category Tree**

```http
GET /api/v1/products/categories/tree
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories",
      "path": "electronics",
      "level": 0,
      "parent": null,
      "image": {
        "public_id": "categories/electronics",
        "url": "https://res.cloudinary.com/shopstream/image/upload/v1/categories/electronics.jpg"
      },
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
      "productCount": 150,
      "isActive": true,
      "isFeatured": false,
      "children": [
        {
          "_id": "subcategory_id",
          "name": "Mobile Phones",
          "slug": "mobile-phones",
          "path": "electronics/mobile-phones",
          "level": 1,
          "parent": "category_id",
          "children": []
        }
      ]
    }
  ]
}
```

### **Get Categories (Paginated)**

```http
GET /api/v1/products/categories?page=1&limit=20&search=electronics&level=0&featured=true
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search term
- `level` (number): Category level (0, 1, 2)
- `featured` (boolean): Filter featured categories
- `active` (boolean): Filter active categories

### **Get Category by ID**

```http
GET /api/v1/products/categories/:id
```

### **Create Category** (Admin only)

```http
POST /api/v1/products/categories
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Smartphones",
  "description": "Mobile smartphones and accessories",
  "parent": "electronics_category_id",
  "attributes": [
    {
      "name": "Screen Size",
      "type": "select",
      "options": ["5.5\"", "6.1\"", "6.7\""],
      "isRequired": true,
      "isFilterable": true
    }
  ],
  "commission": 7.5,
  "metaTitle": "Smartphones - ShopStream",
  "metaDescription": "Browse our collection of smartphones"
}
```

### **Update Category** (Admin only)

```http
PUT /api/v1/products/categories/:id
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Updated Category Name",
  "commission": 8.0,
  "isFeatured": true
}
```

### **Delete Category** (Admin only)

```http
DELETE /api/v1/products/categories/:id
Authorization: Bearer <admin_token>
```

### **Bulk Update Categories** (Admin only)

```http
PUT /api/v1/products/categories/bulk
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "categoryIds": ["id1", "id2", "id3"],
  "updates": {
    "commission": 6.0,
    "isActive": true
  }
}
```

## 🏷️ Brands API

### **Get Brands**

```http
GET /api/v1/products/brands?page=1&limit=20&verified=true&search=apple&category=electronics
```

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `verified` (boolean): Filter verified brands
- `active` (boolean): Filter active brands
- `search` (string): Search term
- `category` (string): Category ID filter
- `alphabetical` (boolean): Alphabetical grouping

**Response:**

```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "brand_id",
        "name": "Apple",
        "slug": "apple",
        "description": "Technology company",
        "logo": {
          "public_id": "brands/apple-logo",
          "url": "https://res.cloudinary.com/shopstream/image/upload/v1/brands/apple-logo.jpg"
        },
        "website": "https://apple.com",
        "isVerified": true,
        "isActive": true,
        "productCount": 45,
        "categories": ["electronics_id"],
        "socialMedia": {
          "facebook": "https://facebook.com/apple",
          "twitter": "https://twitter.com/apple"
        },
        "guidelines": {
          "logoUsage": "Maintain minimum 20px height",
          "colorPalette": ["#000000", "#FFFFFF"]
        }
      }
    ],
    "totalDocs": 100,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true
  }
}
```

### **Get Brand by ID**

```http
GET /api/v1/products/brands/:id
```

### **Create Brand** (Admin only)

```http
POST /api/v1/products/brands
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "New Brand",
  "description": "Brand description",
  "website": "https://newbrand.com",
  "contactEmail": "contact@newbrand.com",
  "categories": ["category_id_1", "category_id_2"],
  "socialMedia": {
    "facebook": "https://facebook.com/newbrand"
  }
}
```

### **Request Brand Creation** (Seller)

```http
POST /api/v1/products/brands/request
Content-Type: multipart/form-data
Authorization: Bearer <seller_token>

{
  "name": "Brand Name",
  "description": "Brand description",
  "website": "https://brand.com",
  "contactEmail": "contact@brand.com",
  "logo": <file>,
  "documentation": <files>
}
```

### **Verify Brand** (Admin only)

```http
PUT /api/v1/products/brands/:id/verify
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "isVerified": true,
  "verificationNotes": "Brand documentation verified"
}
```

### **Update Brand**

```http
PUT /api/v1/products/brands/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "description": "Updated description",
  "guidelines": {
    "logoUsage": "Updated guidelines"
  }
}
```

## 📦 Collections API

### **Get Collections**

```http
GET /api/v1/products/collections?page=1&limit=20&seller=seller_id&published=true&search=summer
```

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `seller` (string): Seller ID filter
- `published` (boolean): Filter published collections
- `visible` (boolean): Filter visible collections
- `search` (string): Search term
- `type` (string): Collection type (manual/automated)

### **Get My Collections** (Seller)

```http
GET /api/v1/products/collections/my-collections
Authorization: Bearer <seller_token>
```

### **Get Collection by Handle**

```http
GET /api/v1/products/collections/handle/:handle
```

### **Get Collection by ID**

```http
GET /api/v1/products/collections/:id
```

### **Create Collection** (Seller)

```http
POST /api/v1/products/collections
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "name": "Summer Sale 2024",
  "description": "Hot deals for summer season",
  "type": "manual",
  "products": ["product_id_1", "product_id_2"],
  "sortOrder": "manual",
  "seo": {
    "title": "Summer Sale - Up to 50% Off",
    "description": "Discover amazing summer deals",
    "keywords": ["summer", "sale", "discount"]
  },
  "isVisible": true,
  "isPublished": false
}
```

### **Update Collection** (Seller)

```http
PUT /api/v1/products/collections/:id
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "name": "Updated Collection Name",
  "description": "Updated description",
  "isPublished": true
}
```

### **Add Products to Collection** (Seller)

```http
POST /api/v1/products/collections/:id/products
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "productIds": ["product_id_3", "product_id_4"]
}
```

### **Remove Products from Collection** (Seller)

```http
DELETE /api/v1/products/collections/:id/products
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "productIds": ["product_id_1"]
}
```

### **Get Collection Products**

```http
GET /api/v1/products/collections/:id/products?page=1&limit=20&sortBy=manual
```

### **Delete Collection** (Seller)

```http
DELETE /api/v1/products/collections/:id
Authorization: Bearer <seller_token>
```

### **Bulk Delete Collections** (Seller)

```http
DELETE /api/v1/products/collections/bulk
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "collectionIds": ["id1", "id2", "id3"]
}
```

## 🛍️ Products API

### **Get Products**

```http
GET /api/v1/products?page=1&limit=20&category=electronics&brand=apple&minPrice=100&maxPrice=1000&status=active
```

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Category ID or slug
- `brand` (string): Brand ID or slug
- `seller` (string): Seller ID
- `status` (string): Product status
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `search` (string): Search term
- `sortBy` (string): Sort field
- `sortOrder` (string): asc/desc
- `featured` (boolean): Featured products
- `inStock` (boolean): In stock products

### **Get My Products** (Seller)

```http
GET /api/v1/products/my-products
Authorization: Bearer <seller_token>
```

### **Get Product by ID**

```http
GET /api/v1/products/:id
```

### **Get Product by Slug**

```http
GET /api/v1/products/slug/:slug
```

### **Create Product** (Seller)

```http
POST /api/v1/products
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "category": "smartphones_category_id",
  "brand": "apple_brand_id",
  "basePrice": 999.99,
  "discountPrice": 899.99,
  "stock": 50,
  "specifications": {
    "Screen Size": "6.1\"",
    "Storage": "128GB",
    "RAM": "8GB"
  },
  "tags": ["smartphone", "apple", "premium"],
  "seo": {
    "title": "iPhone 15 Pro - Premium Smartphone",
    "description": "Experience the latest iPhone technology"
  }
}
```

### **Update Product** (Seller)

```http
PUT /api/v1/products/:id
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "name": "Updated Product Name",
  "basePrice": 1099.99,
  "stock": 75
}
```

### **Update Product Status** (Seller/Admin)

```http
PUT /api/v1/products/:id/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "active"
}
```

### **Delete Product** (Seller)

```http
DELETE /api/v1/products/:id
Authorization: Bearer <seller_token>
```

### **Bulk Operations** (Seller)

```http
PUT /api/v1/products/bulk
Content-Type: application/json
Authorization: Bearer <seller_token>

{
  "productIds": ["id1", "id2", "id3"],
  "action": "updateStatus",
  "data": {
    "status": "inactive"
  }
}
```

## 📊 Analytics API

### **Category Analytics** (Admin)

```http
GET /api/v1/analytics/categories?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

### **Brand Analytics** (Admin)

```http
GET /api/v1/analytics/brands?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

### **Collection Analytics** (Seller/Admin)

```http
GET /api/v1/analytics/collections?seller=seller_id&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### **Product Analytics** (Seller/Admin)

```http
GET /api/v1/analytics/products?seller=seller_id&category=electronics&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

## 📤 Upload API

### **Upload Category Image** (Admin)

```http
POST /api/v1/uploads/category-image
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

{
  "image": <file>,
  "categoryId": "category_id"
}
```

### **Upload Brand Logo** (Admin/Seller)

```http
POST /api/v1/uploads/brand-logo
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "logo": <file>,
  "brandId": "brand_id"
}
```

### **Upload Collection Image** (Seller)

```http
POST /api/v1/uploads/collection-image
Content-Type: multipart/form-data
Authorization: Bearer <seller_token>

{
  "image": <file>,
  "collectionId": "collection_id"
}
```

### **Upload Product Images** (Seller)

```http
POST /api/v1/uploads/product-images
Content-Type: multipart/form-data
Authorization: Bearer <seller_token>

{
  "images": <files>,
  "productId": "product_id"
}
```

## ❌ Error Responses

### **Error Format**

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### **Common Error Codes**

- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `INTERNAL_ERROR` (500): Server error

### **Validation Error Example**

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "name": "Category name is required",
      "commission": "Commission must be between 0 and 100"
    }
  }
}
```

## 🔄 Rate Limiting

- **General endpoints**: 100 requests per minute
- **Upload endpoints**: 20 requests per minute
- **Bulk operations**: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 Pagination

All paginated endpoints follow this format:

**Request:**

```http
GET /api/v1/endpoint?page=1&limit=20
```

**Response:**

```json
{
  "success": true,
  "data": {
    "docs": [...],
    "totalDocs": 100,
    "limit": 20,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

## 🔍 Search & Filtering

### **Text Search**

Use the `search` parameter for full-text search across name and description fields.

### **Advanced Filtering**

Combine multiple query parameters for advanced filtering:

```http
GET /api/v1/products?category=electronics&brand=apple&minPrice=500&maxPrice=2000&inStock=true&featured=true
```

### **Sorting**

Use `sortBy` and `sortOrder` parameters:

```http
GET /api/v1/products?sortBy=createdAt&sortOrder=desc
```

Available sort fields:

- `name`, `createdAt`, `updatedAt`, `price`, `popularity`, `rating`

## 🎯 Best Practices

1. **Always include error handling** for API calls
2. **Use pagination** for large datasets
3. **Implement caching** for frequently accessed data
4. **Validate input** on both client and server side
5. **Use appropriate HTTP methods** (GET, POST, PUT, DELETE)
6. **Include proper authentication headers**
7. **Handle rate limiting** gracefully
8. **Optimize queries** with appropriate filters

## 📚 SDKs and Libraries

### **JavaScript/Node.js**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.shopstream.com/api/v1",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// Get categories
const categories = await api.get("/products/categories/tree");

// Create collection
const collection = await api.post("/products/collections", {
  name: "Summer Sale",
  type: "manual",
});
```

### **React Query Integration**

```javascript
import { useQuery, useMutation } from "@tanstack/react-query";

// Fetch categories
const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/products/categories/tree"),
  });
};

// Create collection mutation
const useCreateCollection = () => {
  return useMutation({
    mutationFn: (data) => api.post("/products/collections", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["collections"]);
    },
  });
};
```
