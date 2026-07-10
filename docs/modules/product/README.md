# Product Module

## Overview

The Product module manages the entire product catalog including products, categories, brands, and collections. It supports product variants, multi-vendor listings, hierarchical categories, and full-text search via Elasticsearch.

## Architecture

```
server/src/modules/product/
├── controllers/
│   ├── product.controller.js     # Product CRUD, search, bulk ops
│   ├── category.controller.js    # Category tree management
│   ├── brand.controller.js       # Brand management
│   ├── collection.controller.js  # Collection management
│   └── search.controller.js      # Elasticsearch search
├── models/
│   ├── Product.model.js          # Product with variants schema
│   ├── Category.model.js         # Hierarchical category schema
│   ├── Brand.model.js            # Brand schema
│   ├── Collection.model.js       # Product collection schema
│   └── index.js                  # Model exports
├── services/
│   ├── product.service.js        # Product business logic
│   ├── category.service.js       # Category hierarchy logic
│   ├── brand.service.js          # Brand operations
│   ├── collection.service.js     # Collection operations
│   ├── search.service.js         # Elasticsearch integration
│   └── recommendation.service.js # Product recommendations
├── routes/
│   ├── product.routes.js         # Product endpoints
│   ├── category.routes.js        # Category endpoints
│   ├── brand.routes.js           # Brand endpoints
│   ├── collection.routes.js      # Collection endpoints
│   └── index.js                  # Route aggregator
├── validators/
│   ├── product.validators.js     # Product validation middleware
│   ├── product.schemas.js        # Joi schemas for products
│   ├── category.validators.js    # Category validation
│   ├── category.schemas.js       # Joi schemas for categories
│   ├── brand.schemas.js          # Joi schemas for brands
│   └── collection.schemas.js     # Joi schemas for collections
└── events/
    ├── product.events.js         # Event type definitions
    ├── product.listeners.js      # Event listener registration
    ├── publishers/
    │   └── ProductEventPublisher.js
    └── subscribers/
        ├── ProductSearchSubscriber.js     # Elasticsearch indexing
        ├── ProductCacheSubscriber.js      # Redis cache invalidation
        ├── ProductInventorySubscriber.js  # Stock updates
        ├── ProductAnalyticsSubscriber.js  # Analytics tracking
        ├── ProductNotificationSubscriber.js # Seller/admin alerts
        └── index.js
```

## Data Models

### Product Model

| Field              | Type       | Description                                      |
|--------------------|------------|--------------------------------------------------|
| `name`             | String     | Product name (required)                          |
| `slug`             | String     | URL-friendly slug (auto-generated)               |
| `description`      | String     | Product description                              |
| `price`            | Number     | Base price                                       |
| `discountPrice`    | Number     | Sale price (must be < price)                     |
| `category`         | ObjectId   | Reference to Category                            |
| `brand`            | ObjectId   | Reference to Brand                               |
| `seller`           | ObjectId   | Reference to User (seller)                       |
| `variants`         | [Variant]  | Array of product variants                        |
| `images`           | [String]   | Product image URLs                               |
| `stock`            | Number     | Total available stock                            |
| `sku`              | String     | Stock keeping unit                               |
| `status`           | String     | `draft`, `pending`, `active`, `inactive`         |
| `isFeatured`       | Boolean    | Featured product flag                            |
| `specifications`   | Object     | Key-value product specs                          |
| `seo`              | Object     | SEO metadata (title, description, keywords)      |

### Variant Sub-Schema

| Field               | Type    | Description                          |
|---------------------|---------|--------------------------------------|
| `name`              | String  | Variant type (e.g., "Size")         |
| `value`             | String  | Variant value (e.g., "XL")          |
| `price`             | Number  | Variant-specific price               |
| `discountPrice`     | Number  | Variant sale price                   |
| `stock`             | Number  | Variant stock count                  |
| `sku`               | String  | Variant-specific SKU                 |
| `images`            | [String]| Variant-specific images              |
| `isActive`          | Boolean | Variant availability                 |
| `lowStockThreshold` | Number  | Alert threshold (default: 5)         |

### Category Model

Supports hierarchical tree structure with parent-child relationships, featured categories, sort ordering, and image support.

### Brand Model

Tracks brand name, slug, logo, description, active/featured/verified status, and associated categories.

### Collection Model

Groups products into named collections (manual or rule-based), with handle-based URL slugs, visibility controls, and seller ownership.

## API Endpoints

### Product Routes (`/api/v1/products`)

| Method | Endpoint                          | Auth        | Description                     |
|--------|-----------------------------------|-------------|---------------------------------|
| GET    | `/`                               | Public      | Get all products (filtered)     |
| GET    | `/search`                         | Public      | Full-text search                |
| GET    | `/featured`                       | Public      | Get featured products           |
| GET    | `/category/:categoryId`           | Public      | Products by category            |
| GET    | `/seller/:sellerId`               | Public      | Products by seller              |
| GET    | `/my-products`                    | Seller      | Get own products                |
| GET    | `/:productId`                     | Public      | Get product by ID               |
| GET    | `/slug/:slug`                     | Public      | Get product by slug             |
| GET    | `/:productId/related`             | Public      | Get related products            |
| GET    | `/:productId/variants`            | Public      | Get product variants            |
| POST   | `/:productId/reviews`             | User        | Add product review              |
| POST   | `/`                               | Seller      | Create product                  |
| PUT    | `/:productId`                     | Seller      | Update product                  |
| DELETE | `/:productId`                     | Seller      | Delete product                  |
| POST   | `/:productId/images`              | Seller      | Upload product images           |
| PATCH  | `/:productId/stock`               | Seller      | Update stock                    |
| POST   | `/:productId/variants`            | Seller      | Add variant                     |
| PUT    | `/:productId/variants/:variantId` | Seller      | Update variant                  |
| DELETE | `/:productId/variants/:variantId` | Seller      | Delete variant                  |
| GET    | `/:productId/stats`               | Seller      | Product statistics              |
| POST   | `/bulk/create-update`             | Seller      | Bulk create/update products     |
| POST   | `/bulk/validate`                  | Seller      | Validate bulk data              |
| GET    | `/bulk/template`                  | Seller      | Download bulk template          |
| PATCH  | `/:productId/approve`             | Admin       | Approve product                 |
| PATCH  | `/:productId/reject`              | Admin       | Reject product                  |
| PATCH  | `/:productId/featured`            | Admin       | Toggle featured status          |
| POST   | `/bulk/update`                    | Admin       | Bulk update products            |
| GET    | `/admin/pending`                  | Admin       | Get pending products            |

### Category Routes (`/api/v1/categories`)

| Method | Endpoint                  | Auth        | Description                |
|--------|---------------------------|-------------|----------------------------|
| GET    | `/tree`                   | Public      | Full category tree         |
| GET    | `/featured`               | Public      | Featured categories        |
| GET    | `/`                       | Public      | List with filters          |
| GET    | `/search`                 | Public      | Search categories          |
| GET    | `/level/:level`           | Public      | Categories by depth level  |
| GET    | `/root`                   | Public      | Root-level categories      |
| GET    | `/slug/:slug`             | Public      | Category by slug           |
| GET    | `/:id`                    | Public      | Category by ID             |
| GET    | `/:id/children`           | Public      | Direct children            |
| GET    | `/:id/ancestors`          | Public      | Ancestor chain             |
| GET    | `/:id/descendants`        | Public      | All descendants            |
| POST   | `/`                       | Seller      | Create category            |
| PUT    | `/:id`                    | Seller      | Update category            |
| DELETE | `/:id`                    | Seller      | Delete category            |
| PATCH  | `/:id/sort-order`         | Seller      | Update sort order          |
| PATCH  | `/bulk/update`            | Seller      | Bulk update categories     |
| POST   | `/:id/image`              | Seller      | Upload category image      |
| DELETE | `/:id/image`              | Seller      | Remove category image      |
| GET    | `/admin/stats`            | Admin       | Category statistics        |

### Brand Routes (`/api/v1/brands`)

| Method | Endpoint                  | Auth        | Description                |
|--------|---------------------------|-------------|----------------------------|
| GET    | `/`                       | Public      | List brands with filters   |
| GET    | `/:id`                    | Public      | Get brand by ID            |
| GET    | `/slug/:slug`             | Public      | Get brand by slug          |
| GET    | `/search`                 | Public      | Search brands              |
| GET    | `/active`                 | Public      | Active brands              |
| GET    | `/featured`               | Public      | Featured brands            |
| GET    | `/verified`               | Public      | Verified brands            |
| GET    | `/popular`                | Public      | Popular brands             |
| GET    | `/category/:categoryId`   | Public      | Brands by category         |
| GET    | `/alphabet`               | Public      | Brands grouped A-Z         |
| POST   | `/`                       | Seller      | Create brand               |
| PUT    | `/:id`                    | Seller      | Update brand               |
| DELETE | `/:id`                    | Seller      | Delete brand               |
| DELETE | `/bulk`                   | Seller      | Bulk delete brands         |
| PATCH  | `/:id/status`             | Seller      | Update active status       |
| PATCH  | `/:id/featured`           | Seller      | Toggle featured            |
| PATCH  | `/:id/verified`           | Seller      | Toggle verified            |
| PATCH  | `/:id/sort-order`         | Seller      | Update sort order          |

### Collection Routes (`/api/v1/collections`)

| Method | Endpoint                  | Auth        | Description                   |
|--------|---------------------------|-------------|-------------------------------|
| GET    | `/published`              | Public      | Published collections         |
| GET    | `/search`                 | Public      | Search collections            |
| GET    | `/`                       | Public      | List with filters             |
| GET    | `/seller/:sellerId`       | Public      | Collections by seller         |
| GET    | `/handle/:handle`         | Public      | Get by URL handle             |
| GET    | `/:id`                    | Public      | Get by ID                     |
| GET    | `/:id/products`           | Public      | Products in collection        |
| GET    | `/my/collections`         | User        | My collections                |
| GET    | `/stats/overview`         | User        | Collection statistics         |
| POST   | `/`                       | Seller      | Create collection             |
| PUT    | `/:id`                    | Seller      | Update collection             |
| DELETE | `/:id`                    | Seller      | Delete collection             |
| POST   | `/:id/duplicate`          | Seller      | Duplicate collection          |
| PATCH  | `/:id/visibility`         | Seller      | Update visibility             |
| POST   | `/:id/products`           | Seller      | Add products to collection    |
| DELETE | `/:id/products`           | Seller      | Remove products               |
| PATCH  | `/bulk/update`            | Seller      | Bulk update collections       |
| POST   | `/:id/image`              | Seller      | Upload collection image       |
| DELETE | `/:id/image`              | Seller      | Remove collection image       |

## Events Published

| Event                        | Description                           |
|------------------------------|---------------------------------------|
| `product.created`            | New product created                   |
| `product.updated`            | Product information modified          |
| `product.deleted`            | Product removed                       |
| `product.stock.low`          | Stock falls below threshold           |
| `product.approval.pending`   | Product submitted for admin review    |
| `product.approved`           | Product approved by admin             |
| `product.rejected`           | Product rejected by admin             |

## Key Features

- **Variant System**: Products support multiple variants (size, color, etc.) each with independent pricing, stock, and SKU
- **Slug Generation**: Automatic URL-friendly slug generation using slugify
- **Elasticsearch Integration**: Full-text search with filters indexed via event subscribers
- **Redis Caching**: Product data cached in Redis, invalidated on updates
- **Bulk Operations**: CSV/JSON bulk import with validation pipeline
- **Admin Approval Workflow**: Products require admin approval before going live
- **Recommendation Engine**: Related product suggestions via recommendation service

## Dependencies

- **Internal**: Upload module (images), Inventory module (stock), Review module (ratings), Notification module (via events)
- **External**: mongoose-paginate-v2, slugify, Elasticsearch client
