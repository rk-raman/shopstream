# Inventory Module

The Inventory module manages product stock levels, inventory tracking, and low stock alerts.

## Features

- Real-time stock tracking
- Low stock alerts
- Inventory updates on order/purchase
- Stock reservation system
- Inventory analytics
- Bulk inventory operations

## API Endpoints

### Inventory Management

- `GET /api/v1/inventory` - Get inventory list with filtering
- `GET /api/v1/inventory/:productId` - Get product inventory
- `PUT /api/v1/inventory/:productId` - Update product stock
- `POST /api/v1/inventory/bulk-update` - Bulk update inventory
- `GET /api/v1/inventory/low-stock` - Get low stock products
- `POST /api/v1/inventory/reserve` - Reserve stock for order

## Models

### Inventory Model

```javascript
{
  productId: ObjectId,
  currentStock: Number,
  reservedStock: Number,
  availableStock: Number,
  minStockLevel: Number,
  maxStockLevel: Number,
  lastUpdated: Date,
  alerts: [StockAlert]
}
```

### StockAlert Model

```javascript
{
  type: String, // low_stock, out_of_stock, overstock
  message: String,
  threshold: Number,
  isActive: Boolean,
  createdAt: Date
}
```

## Services

- **InventoryService**: Core inventory operations
- **StockAlertService**: Low stock alert management
- **StockReservationService**: Stock reservation system
- **InventoryAnalyticsService**: Inventory reporting

## Events

The module emits events for:

- Stock updated
- Low stock alert
- Out of stock alert
- Stock reserved
- Stock released

## Dependencies

- MongoDB (Mongoose)
- Redis (caching)
- Product Module
- Order Module
- Notification Module
