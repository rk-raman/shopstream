# Seller Module (Client)

## Overview

The Seller module provides the seller dashboard interface for managing products, categories, brands, collections, orders, and viewing sales analytics. It is the primary management interface for merchants on the ShopStream platform.

## Architecture

```
client/src/features/seller/
├── components/
│   ├── Products/
│   │   ├── ProductForm/
│   │   │   └── ProductForm.tsx       # Multi-step product creation/edit form
│   │   └── ProductList/
│   │       └── ProductList.tsx       # Product listing with filters
│   ├── Categories/
│   │   ├── CategoryForm/
│   │   │   └── CategoryForm.tsx      # Category create/edit form
│   │   ├── CategoryTree/
│   │   │   └── CategoryTree.tsx      # Hierarchical category tree view
│   │   ├── CategoryNavigation/
│   │   │   └── CategoryNavigation.tsx # Category sidebar navigation
│   │   └── index.ts                  # Component exports
│   ├── Brands/
│   │   ├── BrandForm/
│   │   │   └── BrandForm.tsx         # Brand create/edit form
│   │   └── BrandList/
│   │       └── BrandList.tsx         # Brand listing
│   └── Collections/
│       ├── CollectionForm/
│       │   └── CollectionForm.tsx    # Collection create/edit form
│       └── CollectionList/
│           └── CollectionList.tsx    # Collection listing
├── hooks/
│   ├── useProducts.ts                # Product CRUD operations
│   ├── useCategories.ts              # Category management
│   ├── useBrands.ts                  # Brand management
│   ├── useCollections.ts             # Collection management
│   ├── useSeller.ts                  # Seller profile operations
│   ├── useSellerDashboard.ts         # Dashboard metrics
│   └── useSellerOrders.ts            # Order management
└── services/
    ├── productService.ts             # Product API calls
    ├── sellerProductService.ts       # Seller-specific product API
    ├── categoryService.ts            # Category API calls
    ├── brandService.ts               # Brand API calls
    ├── collectionService.ts          # Collection API calls
    ├── sellerService.ts              # Seller profile API
    └── sellerOrderService.ts         # Order management API
```

## Dashboard Pages

The seller dashboard is accessible at `/dashboard/` and includes:

```
(seller)/dashboard/
├── /                   # Dashboard overview (analytics, metrics)
├── products/           # Product management
│   ├── /               # Product list
│   ├── new/            # Create new product
│   └── [id]/edit/      # Edit product
├── orders/             # Order management
├── customers/          # Customer insights
├── categories/         # Category management
├── brands/             # Brand management
├── collections/        # Collection management
└── settings/           # Seller settings
```

## Components

### ProductForm
A multi-step form for creating and editing products with:
- Basic info (name, description, price, SKU)
- Category, brand, and collection assignment
- Variant management (size, color, etc. with individual pricing/stock)
- Image upload with drag-and-drop
- Specifications and attributes
- SEO metadata (title, description, keywords)
- Stock and inventory settings

### ProductList
Paginated product table with:
- Search and filter capabilities
- Status badges (draft, pending, active, inactive)
- Quick actions (edit, delete, toggle status)
- Stock level indicators
- Bulk operations

### CategoryTree
Interactive tree visualization of the category hierarchy:
- Expandable/collapsible nodes
- Drag-and-drop reordering
- Inline editing
- Product count per category

### CategoryForm
Form for creating/editing categories with:
- Name, description, slug
- Parent category selection
- Image upload
- Featured and active toggles
- Sort order

### BrandForm / BrandList
Brand management with logo upload, description, status (active/featured/verified), and category association.

### CollectionForm / CollectionList
Collection management with product selection, visibility controls, image upload, and handle-based URL generation.

## Hooks

### useProducts
Manages product CRUD operations with TanStack React Query:
- `products` - Paginated product list
- `createProduct()` - Create new product
- `updateProduct()` - Update existing product
- `deleteProduct()` - Delete product
- `toggleStatus()` - Toggle product active status

### useCategories
- `categories` - Category list/tree
- `createCategory()` - Create category
- `updateCategory()` - Update category
- `deleteCategory()` - Delete category
- `reorderCategories()` - Update sort order

### useBrands
- `brands` - Brand list
- `createBrand()` / `updateBrand()` / `deleteBrand()`
- `toggleFeatured()` / `toggleVerified()`

### useCollections
- `collections` - Collection list
- `createCollection()` / `updateCollection()` / `deleteCollection()`
- `addProducts()` / `removeProducts()`
- `duplicateCollection()`

### useSellerDashboard
Fetches dashboard analytics:
- Total revenue, orders, products
- Recent orders
- Top-selling products
- Revenue charts (daily/weekly/monthly)
- Order status breakdown

### useSellerOrders
Order management for sellers:
- `orders` - Paginated order list
- `updateOrderStatus()` - Change order status
- `updateTracking()` - Add tracking info
- `processReturn()` - Handle return requests

## Services

All services use the `axiosSeller` instance configured with seller authentication tokens.

| Service                | Base Endpoint          | Purpose                     |
|------------------------|------------------------|-----------------------------|
| `productService`       | `/products`            | Product CRUD                |
| `sellerProductService` | `/products/my-products`| Seller's own products       |
| `categoryService`      | `/categories`          | Category management         |
| `brandService`         | `/brands`              | Brand management            |
| `collectionService`    | `/collections`         | Collection management       |
| `sellerService`        | `/users/profile`       | Seller profile              |
| `sellerOrderService`   | `/orders/seller`       | Seller order management     |

## Dependencies

- **Internal**: Auth module (authentication), Upload module (image uploads), shared UI components
- **External**: TanStack React Query, React Hook Form, Zod, Axios, Lucide React (icons)
