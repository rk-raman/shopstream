# Order Module

## Overview

The Order module handles the complete order lifecycle from creation through delivery, including order tracking, returns/refunds, multi-seller order splitting, and comprehensive analytics. It supports role-based access for customers, sellers, and admins.

## Architecture

```
server/src/modules/order/
├── controllers/
│   ├── order.controller.js       # Order CRUD, status management
│   └── tracking.controller.js    # Shipment tracking operations
├── models/
│   ├── Order.model.js            # Order schema with items & shipping
│   ├── OrderItem.model.js        # Individual order item schema
│   └── index.js                  # Model exports
├── services/
│   ├── order.service.js          # Order business logic
│   └── tracking.service.js       # Tracking information logic
├── routes/
│   ├── order.routes.js           # Route definitions with Swagger docs
│   └── index.js                  # Route aggregator
├── validators/
│   └── order.validators.js       # Comprehensive input validation
└── events/
    ├── order.events.js           # Event type definitions
    ├── order.listeners.js        # Event listener registration
    ├── publishers/
    │   └── OrderEventPublisher.js
    └── subscribers/
        ├── OrderNotificationSubscriber.js # Order status emails
        ├── OrderAnalyticsSubscriber.js    # Sales tracking
        └── OrderCacheSubscriber.js        # Cache invalidation
```

## Data Models

### Order Model

| Field               | Type       | Description                                  |
|---------------------|------------|----------------------------------------------|
| `orderNumber`       | String     | Unique order identifier                      |
| `customer`          | ObjectId   | Reference to User                            |
| `items`             | [OrderItem]| Array of ordered items                       |
| `status`            | String     | Order status (see workflow below)            |
| `totalAmount`       | Number     | Total order amount                           |
| `shippingAddress`   | Object     | Delivery address                             |
| `billingAddress`    | Object     | Billing address                              |
| `payment`           | Object     | Payment method, status, transactionId        |
| `shipping`          | Object     | Carrier, tracking number, delivery dates     |
| `coupon`            | Object     | Applied coupon code and discount             |
| `notes`             | String     | Customer notes                               |
| `specialInstructions`| String    | Delivery instructions                        |

### OrderItem Sub-Schema

| Field          | Type     | Description                     |
|----------------|----------|---------------------------------|
| `product`      | ObjectId | Reference to Product            |
| `productName`  | String   | Snapshot of product name        |
| `productImage` | String   | Snapshot of product image       |
| `variant`      | Object   | `{ name, value, sku }`         |
| `quantity`     | Number   | Ordered quantity (min: 1)       |
| `price`        | Number   | Unit price at time of order     |
| `discountPrice`| Number   | Discounted price (if applicable)|
| `seller`       | ObjectId | Reference to User (seller)      |

### Order Status Workflow

```
pending -> confirmed -> processing -> shipped -> out_for_delivery -> delivered
   |                                                                     |
   +-> cancelled                                              returned <-+
                                                                  |
                                                              refunded
```

### Payment Methods & Statuses

**Methods**: `cod`, `card`, `upi`, `wallet`, `netbanking`
**Statuses**: `pending`, `paid`, `failed`, `refunded`, `partial_refund`

### Shipping Methods

`standard`, `express`, `same_day`

## API Endpoints

### Public Routes

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| GET    | `/tracking/:trackingNumber`      | Track order by tracking number |

### Customer Routes (`/api/v1/orders`)

| Method | Endpoint                         | Auth    | Description                |
|--------|----------------------------------|---------|----------------------------|
| POST   | `/`                              | User    | Create new order           |
| GET    | `/my-orders`                     | User    | Get own orders             |
| GET    | `/:orderId`                      | User    | Get order details          |
| PATCH  | `/:orderId/cancel`               | User    | Cancel order               |
| POST   | `/:orderId/return`               | User    | Request return             |
| GET    | `/:orderId/tracking`             | User    | Get tracking info          |
| GET    | `/:orderId/tracking/history`     | User    | Get tracking history       |

### Seller Routes

| Method | Endpoint                         | Auth    | Description                  |
|--------|----------------------------------|---------|------------------------------|
| GET    | `/seller/my-orders`              | Seller  | Get orders to fulfill        |
| PATCH  | `/:orderId/status`               | Seller  | Update order status          |
| PATCH  | `/:orderId/tracking`             | Seller  | Update tracking info         |
| POST   | `/:orderId/tracking/events`      | Seller  | Add tracking event           |
| PATCH  | `/:orderId/return/process`       | Seller  | Approve/reject return        |
| GET    | `/analytics/stats`               | Seller  | Order statistics             |
| GET    | `/export/data`                   | Seller  | Export orders (CSV/JSON)     |

### Admin Routes

| Method | Endpoint                         | Auth    | Description                  |
|--------|----------------------------------|---------|------------------------------|
| GET    | `/admin/all`                     | Admin   | All orders                   |
| GET    | `/admin/seller/:sellerId`        | Admin   | Orders by specific seller    |
| POST   | `/:orderId/payment/process`      | Admin   | Process payment              |
| POST   | `/:orderId/refund`               | Admin   | Initiate refund              |
| PATCH  | `/admin/bulk-update`             | Admin   | Bulk update orders           |
| PATCH  | `/admin/bulk-update-tracking`    | Admin   | Bulk update tracking         |
| GET    | `/admin/tracking/report`         | Admin   | Generate tracking report     |

## Events Published

| Event                      | Description                           |
|----------------------------|---------------------------------------|
| `order.created`            | New order placed                      |
| `order.confirmed`          | Order confirmed after payment         |
| `order.processing`         | Order being prepared                  |
| `order.shipped`            | Order shipped with tracking           |
| `order.out_for_delivery`   | Out for delivery                      |
| `order.delivered`          | Order delivered to customer           |
| `order.cancelled`          | Order cancelled                       |
| `order.refund.requested`   | Return/refund requested               |
| `order.refunded`           | Refund processed                      |

## Key Features

- **Multi-Seller Orders**: Orders contain items from multiple sellers, with per-seller fulfillment
- **Order Tracking**: Real-time tracking with event history and tracking number lookup
- **Return/Refund Flow**: Customers can request returns, sellers approve/reject, admins process refunds
- **Bulk Operations**: Admin can bulk update order statuses and tracking information
- **Export**: Sellers can export their orders in CSV/JSON format
- **Analytics**: Order statistics with date range filtering
- **Swagger Documentation**: Full API documentation in route file

## Dependencies

- **Internal**: Cart module (order items source), Product module (product validation), Payment module (payment processing), Inventory module (stock deduction), Notification module (via events)
- **External**: mongoose
