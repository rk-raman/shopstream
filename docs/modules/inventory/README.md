# Inventory Module

## Overview

The Inventory module manages stock levels across all products and their variants. It tracks total stock, available stock, reserved stock (during checkout), and maintains a complete history of stock movements for auditing purposes. The module integrates with the order lifecycle to automatically adjust stock on purchase, cancellation, and returns.

## Architecture

```
server/src/modules/inventory/
├── controllers/
│   └── inventory.controller.js   # Inventory endpoint handlers
├── models/
│   └── Inventory.model.js        # Inventory schema with stock movements
├── services/
│   └── inventory.service.js      # Stock management business logic
├── routes/
│   └── inventory.routes.js       # Route definitions
├── validators/
│   └── inventory.validators.js   # Input validation
└── events/
    ├── inventory.events.js       # Event type definitions
    └── inventory.listeners.js    # Listens to order/product events
```

## Data Model

### Inventory Model

| Field              | Type       | Description                                |
|--------------------|------------|--------------------------------------------|
| `product`          | ObjectId   | Reference to Product                       |
| `variant.variantId`| ObjectId   | Reference to specific variant              |
| `variant.sku`      | String     | Unique SKU identifier                      |
| `totalStock`       | Number     | Total physical stock (min: 0)              |
| `availableStock`   | Number     | Stock available for purchase               |
| `reservedStock`    | Number     | Stock reserved during checkout             |
| `lowStockThreshold`| Number     | Alert threshold                            |
| `stockMovements`   | [Movement] | History of all stock changes               |

### Stock Movement Sub-Schema

| Field         | Type     | Description                                  |
|---------------|----------|----------------------------------------------|
| `type`        | String   | `in`, `out`, `reserved`, `released`, `adjustment` |
| `quantity`    | Number   | Movement quantity                            |
| `reference`   | String   | Order ID, purchase order ID, etc.            |
| `reason`      | String   | Human-readable reason for movement           |
| `performedBy` | ObjectId | User who performed the action                |
| `timestamp`   | Date     | When the movement occurred                   |

## Stock Movement Types

| Type          | Description                                          |
|---------------|------------------------------------------------------|
| `in`          | Stock received (purchase orders, returns)            |
| `out`         | Stock shipped (order fulfilled)                      |
| `reserved`    | Stock held during checkout (not yet shipped)         |
| `released`    | Reserved stock released (order cancelled, timeout)   |
| `adjustment`  | Manual stock correction by seller/admin              |

## Stock Lifecycle

### Order Placement
```
Customer places order
  -> Stock reserved (availableStock -= quantity, reservedStock += quantity)
  -> Order confirmed
  -> Stock decremented (reservedStock -= quantity, totalStock -= quantity)
```

### Order Cancellation
```
Order cancelled
  -> Reserved stock released (reservedStock -= quantity, availableStock += quantity)
```

### Return Processing
```
Return approved
  -> Stock incremented (totalStock += quantity, availableStock += quantity)
  -> Movement recorded with type 'in' and reference to return
```

### Low Stock Alert
```
After any stock movement
  -> Check if availableStock <= lowStockThreshold
  -> If yes, publish 'product.stock.low' event
  -> Notification module sends alert to seller
```

## Event Integration

### Events Listened To

| Source Event          | Action                                  |
|-----------------------|-----------------------------------------|
| `order.created`       | Reserve stock for order items           |
| `order.confirmed`     | Deduct reserved stock from total        |
| `order.cancelled`     | Release reserved stock                  |
| `order.returned`      | Add stock back                          |
| `product.created`     | Initialize inventory record             |
| `product.updated`     | Sync stock if variant changes           |

### Events Published

| Event                  | Payload                         | Triggered When               |
|------------------------|---------------------------------|------------------------------|
| `inventory.low_stock`  | Product ID, variant, stock left | Stock below threshold        |
| `inventory.out_of_stock`| Product ID, variant            | Stock reaches zero           |
| `inventory.updated`    | Product ID, new stock levels    | Any stock movement           |

## Key Formulas

```
availableStock = totalStock - reservedStock
savedAmount    = movement history audit trail
```

The `availableStock` is what customers see as "in stock". The `reservedStock` prevents overselling during concurrent checkouts.

## Dependencies

- **Internal**: Product module (product/variant references), Order module (stock movements on orders), Notification module (low stock alerts via events)
- **External**: mongoose
