# Order Module Documentation

## Overview

The order module manages the complete order lifecycle — from creation through delivery, returns, and refunds. It supports three user roles (customer, seller, admin) with role-specific access, and includes tracking, analytics, customer aggregation, and bulk operations.

---

## Architecture

```
                         ┌──────────────┐
                         │   Checkout   │
                         │   Module     │
                         └──────┬───────┘
                                │ creates
                                ▼
┌───────────────────────────────────────────────────────────┐
│                       ORDER MODULE                         │
│                                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Customer   │  │    Seller    │  │      Admin       │ │
│  │              │  │              │  │                  │ │
│  │ • My Orders  │  │ • My Orders  │  │ • All Orders     │ │
│  │ • Cancel     │  │ • Status Mgmt│  │ • Refunds        │ │
│  │ • Return     │  │ • Tracking   │  │ • Bulk Ops       │ │
│  │ • Track      │  │ • Returns    │  │ • Reports        │ │
│  │              │  │ • Customers  │  │                  │ │
│  │              │  │ • Analytics  │  │                  │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         └─────────────────┼────────────────────┘           │
│                           ▼                                │
│                    ┌─────────────┐                         │
│                    │ Order Model │                         │
│                    │  (MongoDB)  │                         │
│                    └──────┬──────┘                         │
│                           │                                │
│              ┌────────────┼────────────┐                   │
│              ▼            ▼            ▼                   │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│        │Inventory │ │  Events  │ │ Tracking │            │
│        │ Service  │ │  (Kafka) │ │ Service  │            │
│        └──────────┘ └──────────┘ └──────────┘            │
└───────────────────────────────────────────────────────────┘
```

---

## Order Lifecycle

```
pending ──→ confirmed ──→ processing ──→ shipped ──→ out_for_delivery ──→ delivered
   │            │              │
   │            │              │
   └────────────┴──────────────┘──→ cancelled
                                                                            │
                                                            delivered ──→ returned ──→ refunded
```

**Cancellation rules:** Only `pending`, `confirmed`, or `processing` orders can be cancelled.
**Return rules:** Only `delivered` orders within 7 days of delivery.

---

## API Endpoints

Base path: `/api/orders`

### Public Routes

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/tracking/:trackingNumber` | `getTrackingByNumber` | Look up order by tracking number |

### Customer Routes (requires `customerOnly`)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/` | `createOrder` | Create order directly (non-checkout) |
| GET | `/my-orders` | `getMyOrders` | List customer's orders (paginated) |
| GET | `/:orderId` | `getOrderById` | Get single order details |
| PATCH | `/:orderId/cancel` | `cancelOrder` | Cancel order with reason |
| POST | `/:orderId/return` | `requestReturn` | Request return with reason |
| GET | `/:orderId/tracking` | `getTrackingByOrderId` | Get tracking info |
| GET | `/:orderId/tracking/history` | `getTrackingHistory` | Get tracking timeline |

### Seller Routes (requires `authorize("seller", "admin")`)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/seller/my-orders` | `getOrdersBySeller` | List seller's orders (paginated) |
| PATCH | `/:orderId/status` | `updateOrderStatus` | Update order status with note |
| PATCH | `/:orderId/tracking` | `updateTracking` | Update tracking number/carrier |
| POST | `/:orderId/tracking/events` | `addTrackingEvent` | Add tracking event |
| PATCH | `/:orderId/return/process` | `processReturnRequest` | Approve/reject return |
| GET | `/analytics/stats` | `getOrderStats` | Order statistics |
| GET | `/export/data` | `exportOrders` | Export orders (CSV/JSON) |
| GET | `/seller/customers` | `getSellerCustomers` | Aggregated customer list |
| GET | `/seller/customers/:customerId` | `getSellerCustomerDetails` | Customer detail + order history |

### Admin Routes (requires `authorize("admin")`)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/admin/all` | `getAllOrders` | All orders with filters |
| GET | `/admin/seller/:sellerId` | `getOrdersBySeller` | Orders for specific seller |
| POST | `/:orderId/payment/process` | `processPayment` | Process payment manually |
| POST | `/:orderId/refund` | `initiateRefund` | Initiate refund |
| PATCH | `/admin/bulk-update` | `bulkUpdateOrders` | Bulk status update |
| PATCH | `/admin/bulk-update-tracking` | `bulkUpdateTracking` | Bulk tracking update |
| GET | `/admin/tracking/report` | `generateTrackingReport` | Tracking analytics report |

---

## Data Model

### Order

```
Order {
  // Identification
  orderNumber             String (unique, auto-generated: ORD{timestamp}{count})
  customer                ObjectId (ref: User, required)

  // Items
  items [{
    product               ObjectId (ref: Product, required)
    productName           String (required, cached)
    productImage          String (cached)
    variant {
      name                String
      value               String
      sku                 String
    }
    quantity              Number (required, min: 1)
    price                 Number (required, original price)
    discountPrice         Number (sale price)
    seller                ObjectId (ref: User, required)
  }]

  // Pricing
  subtotal                Number (required)
  tax                     Number (default: 0, 18% GST)
  shippingCharges         Number (default: 0, free above ₹500)
  discount                Number (default: 0, from coupon)
  totalAmount             Number (required)

  // Addresses
  shippingAddress {       (required)
    fullName              String (required)
    addressLine1          String (required)
    addressLine2          String
    city                  String (required)
    state                 String (required)
    pincode               String (required)
    country               String (default: "India")
    phone                 String (required)
  }
  billingAddress          Same schema (optional, defaults to shipping)

  // Status
  status                  enum: pending | confirmed | processing | shipped |
                                out_for_delivery | delivered | cancelled |
                                returned | refunded
  statusHistory [{
    status                String
    timestamp             Date (default: now)
    note                  String
    updatedBy             ObjectId (ref: User)
  }]

  // Payment
  payment {
    method                enum: cod | card | upi | wallet | netbanking (required)
    status                enum: pending | paid | failed | refunded | partial_refund
    transactionId         String
    paidAt                Date
    refundAmount          Number
    refundReason          String
  }

  // Shipping
  shipping {
    method                enum: standard | express | same_day
    trackingNumber        String
    carrier               String
    estimatedDelivery     Date
    actualDelivery        Date
  }

  // Coupon
  coupon {
    code                  String
    discountAmount        Number
    discountType          enum: percentage | fixed
  }

  // Additional
  notes                   String
  specialInstructions     String
  cancellationReason      String
  returnReason            String
  returnRequestedAt       Date
  returnApprovedAt        Date

  // Timestamps
  createdAt               Date (auto)
  updatedAt               Date (auto)
}
```

**Indexes:**
- `{ customer: 1, createdAt: -1 }` — customer order history
- `{ orderNumber: 1 }` — order lookup
- `{ status: 1 }` — filter by status
- `{ "items.seller": 1 }` — seller order queries
- `{ createdAt: -1 }` — recent orders

**Instance Methods:**
- `updateStatus(newStatus, note, updatedBy)` — updates status, appends to history, sets `actualDelivery` on delivery
- `canBeCancelled()` — true if status is `pending` or `confirmed`
- `canBeReturned()` — true if `delivered` within 7 days

---

## Service Methods

### Order Lifecycle

| Method | Description |
|--------|-------------|
| `createOrder(userId, orderData)` | Validates items, calculates pricing, checks inventory, reserves stock, clears cart, emits `ORDER_CREATED` |
| `updateOrderStatus(orderId, newStatus, note, updatedBy)` | Updates status with history. On delivery: sets timestamp. On cancel: releases inventory. Emits events |
| `cancelOrder(orderId, userId, reason)` | Customer self-service cancel. Only pending/confirmed. Records reason |
| `requestReturn(orderId, reason, items, userId)` | Customer return request. Only delivered within 7 days |
| `processReturnRequest(orderId, action, note, processedBy)` | Seller/admin approve or reject return |

### Queries

| Method | Description |
|--------|-------------|
| `getOrdersByCustomer(customerId, page, limit)` | Paginated customer orders with product population |
| `getOrderDetails(orderId, userId, role)` | Role-based access: customers see own orders, sellers see orders with their items, admins see all |
| `getOrdersBySeller(sellerId, options)` | Orders containing seller's items. Supports status filter, sorting, pagination |
| `getAllOrders(filters, options)` | Admin: full-text search, status/payment/customer/seller/date filters |

### Payment & Refund

| Method | Description |
|--------|-------------|
| `processPayment(orderId, paymentData)` | Sets payment to paid, auto-confirms order, emits `PAYMENT_SUCCESSFUL` |
| `initiateRefund(orderId, amount, reason, initiatedBy)` | Full or partial refund, emits `PAYMENT_REFUNDED` |

### Analytics & Export

| Method | Description |
|--------|-------------|
| `getOrderStatistics(filters)` | Aggregation by day/week/month. Returns time series + overall stats (totalOrders, totalRevenue, avgOrderValue) |
| `exportOrders(filters, format)` | Export to CSV or JSON with order summaries |

### Seller Customers (aggregated from orders)

| Method | Description |
|--------|-------------|
| `getSellerCustomers(sellerId, options)` | MongoDB aggregation: groups orders by customer, deduplicates, calculates totalOrders, totalSpent, deliveredCount, cancelledCount. Supports search, sort, pagination |
| `getSellerCustomerDetails(sellerId, customerId, options)` | Customer profile + order stats (avgOrderValue, first/last order) + paginated order history |

### Inventory

| Method | Description |
|--------|-------------|
| `validateOrderItems(items)` | Validates products exist, are active, handles variants, returns validated items with pricing |
| `calculateOrderPricing(items, coupon)` | Calculates subtotal, 18% GST, shipping (free >₹500), coupon discount |
| `checkInventoryAvailability(items)` | Validates stock for all items |
| `reserveInventory(items, orderId)` | Reserves stock for order |
| `releaseInventory(items, orderId)` | Releases stock on cancellation |

---

## Tracking Service

| Method | Description |
|--------|-------------|
| `getOrderTracking(orderId, userId, role)` | Returns order tracking with status history. Role-based access |
| `getTrackingByNumber(trackingNumber)` | Public lookup by tracking number |
| `updateOrderTracking(orderId, data, updatedBy)` | Update tracking number, carrier, estimated delivery. Emits `ORDER_TRACKING_UPDATED` |
| `addTrackingEvent(orderId, eventData)` | Add event to history (status, location, description). Auto-updates order status |
| `getTrackingHistory(orderId, userId, role)` | Sorted history (newest first) |
| `bulkUpdateTracking(updates, updatedBy)` | Batch tracking updates. Returns success/failure counts |
| `generateTrackingReport(filters, format)` | Tracking analytics report (JSON/CSV/Excel) |
| `getDeliveryStatusSummary(sellerId?)` | Aggregate count and avg delivery time by status |
| `getDeliveryPerformance(sellerId?, days)` | Daily performance: totalOrders, deliveredOrders, avgDeliveryTime |

---

## Pricing Logic

```
subtotal       = sum(item.effectivePrice * item.quantity)
tax            = round(subtotal * 0.18)                    // 18% GST
shippingCharges = subtotal > 500 ? 0 : 40                  // Free above ₹500
discount       = coupon.discountAmount || 0
totalAmount    = subtotal + tax + shippingCharges - discount
```

---

## Events Emitted

| Event | Trigger | Key Payload |
|-------|---------|-------------|
| `ORDER_CREATED` | Order placed | orderId, orderNumber, customerId, totalAmount, paymentMethod |
| `ORDER_UPDATED` | Status changed | orderId, oldStatus, newStatus, customerId |
| `ORDER_DELIVERED` | Status → delivered | orderId, customerId, items |
| `ORDER_CANCELLED` | Status → cancelled | orderId, customerId |
| `PAYMENT_SUCCESSFUL` | Payment confirmed | orderId, amount, transactionId |
| `PAYMENT_REFUNDED` | Refund issued | orderId, refundAmount, reason |
| `ORDER_TRACKING_UPDATED` | Tracking info changed | orderId, trackingNumber, carrier |
| `ORDER_TRACKING_EVENT` | Event added to timeline | orderId, status, location |

---

## Frontend — Customer

### Pages

**Orders List** (`/account/orders`)
- Fetches from `GET /orders/my-orders` with pagination
- Search by order number or product name (client-side)
- Status filter dropdown (server-side)
- Loading, error, and empty states
- Pagination controls

**Order Detail** (`/account/orders/:id`)
- Fetches from `GET /orders/:id`
- Tracking timeline via `buildTrackingSteps()` helper
- Items list with images, variants, price breakdown
- Shipping address and payment info cards
- Cancel modal (textarea for reason, only for pending/confirmed)
- Return button (only for delivered within 7 days)

### Components

| Component | Description |
|-----------|-------------|
| `OrderCard` | Clickable card with order number, date, status badge, item thumbnails, total amount, payment method |
| `OrderStatusBadge` | Color-coded badge for all 9 statuses (pending through refunded) |
| `OrderSearchFilter` | Search input + status dropdown |
| `OrderTracking` | Vertical timeline with green checkmarks for completed steps |
| `OrderItemsList` | Item list with images + price breakdown (subtotal, discount, shipping, tax, total) |
| `OrderAddressDisplay` | Formatted address card with map pin icon |
| `OrderEmptyState` | Package icon + message + optional CTA button |

### `buildTrackingSteps(order)` Helper

Converts order status and `statusHistory` into a visual timeline:
- **Normal flow:** Order Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered
- **Cancelled/Returned:** Shows completed steps up to the cancellation/return point
- Dates pulled from `statusHistory` entries
- Pending steps show "Expected soon" or "Pending"

---

## Frontend — Seller

### Pages

**Orders List** (`/dashboard/orders`)
- Table layout: order number, customer (name + email), item thumbnails, amount, payment (method + status), order status, date, view action
- **Inline status updates** — status column is a dropdown showing only valid next statuses
- Status transition rules enforced in UI:

  | Current | Allowed Next |
  |---------|-------------|
  | pending | confirmed, cancelled |
  | confirmed | processing, cancelled |
  | processing | shipped, cancelled |
  | shipped | out_for_delivery |
  | out_for_delivery | delivered |
  | delivered | — |
  | cancelled | — |

- Search (order number, customer name/email)
- Status filter dropdown
- Sortable columns (amount, date)
- Pagination

**Order Detail** (`/dashboard/orders/:id`)
- **Left column (2/3):**
  - Items card with images, variants, quantities, full price breakdown
  - Status History timeline (all transitions with dates and notes)
- **Right column (1/3):**
  - **Update Status** panel — dropdown + note textarea + button (only if next statuses exist)
  - **Tracking Info** panel — tracking number + carrier inputs (shown for processing/shipped/out_for_delivery)
  - **Return Processing** panel — approve/reject selector + note (shown when status is returned)
  - Customer info card (name, email, phone)
  - Shipping address card
  - Payment card (method, status, transaction ID)

**Customers List** (`/dashboard/customers`)
- Summary cards: total customers, total revenue, total orders
- Search by name or email
- Sort by: last order date, total spent, order count, name
- Table: avatar + name + email, order count, total spent, delivered count, cancelled count, last order date
- Pagination

**Customer Detail** (`/dashboard/customers/:id`)
- Profile header: avatar, name, email, phone, member since date
- Stats cards: total orders, total spent, avg order value, last order date
- **Left column (2/3):** Paginated order history (item previews, amount, status badges)
- **Right column (1/3):** Default address, all addresses, activity timeline (first order, last order, last active)

---

## Error Handling

| Scenario | HTTP | Message |
|----------|------|---------|
| Product unavailable | 400 | "Product {id} is not available" |
| Variant unavailable | 400 | "Product variant not available" |
| Insufficient stock | 400 | "Insufficient stock for {productName}" |
| Order not found | 404 | "Order not found" |
| Cannot cancel | 400 | "Order cannot be cancelled" |
| Cannot return | 400 | "Order cannot be returned" |
| Cannot refund unpaid | 400 | "Cannot refund unpaid order" |
| Customer not found | 404 | "Customer not found" |
| Missing order IDs | 400 | "Order IDs array is required" |
| Missing update data | 400 | "Update data is required" |

---

## File Reference

### Backend

| File | Path |
|------|------|
| Order Model | `server/src/modules/order/models/Order.model.js` |
| Order Service | `server/src/modules/order/services/order.service.js` |
| Order Controller | `server/src/modules/order/controllers/order.controller.js` |
| Order Routes | `server/src/modules/order/routes/order.routes.js` |
| Tracking Service | `server/src/modules/order/services/tracking.service.js` |
| Tracking Controller | `server/src/modules/order/controllers/tracking.controller.js` |
| Order Validators | `server/src/modules/order/validators/order.validators.js` |
| Route Registration | `server/src/routes/index.js` (`/orders`) |

### Frontend — Customer

| File | Path |
|------|------|
| Types + Helpers | `client/src/features/customer/account/orders/types.ts` |
| Order Service | `client/src/features/customer/account/orders/services/orderService.ts` |
| Orders List Page | `client/src/app/(customer)/account/orders/page.tsx` |
| Order Detail Page | `client/src/app/(customer)/account/orders/[id]/page.tsx` |
| OrderCard | `client/src/features/customer/account/orders/components/OrderCard.tsx` |
| OrderStatusBadge | `client/src/features/customer/account/orders/components/OrderStatusBadge.tsx` |
| OrderSearchFilter | `client/src/features/customer/account/orders/components/OrderSearchFilter.tsx` |
| OrderTracking | `client/src/features/customer/account/orders/components/OrderTracking.tsx` |
| OrderItemsList | `client/src/features/customer/account/orders/components/OrderItemsList.tsx` |
| OrderAddressDisplay | `client/src/features/customer/account/orders/components/OrderAddressDisplay.tsx` |
| OrderEmptyState | `client/src/features/customer/account/orders/components/OrderEmptyState.tsx` |
| API Endpoints | `client/src/lib/api/endpoints.ts` (ORDERS section) |

### Frontend — Seller

| File | Path |
|------|------|
| Seller Order Service | `client/src/features/seller/services/sellerOrderService.ts` |
| Seller Customer Service | `client/src/features/seller/services/sellerCustomerService.ts` |
| Seller Orders List | `client/src/app/(seller)/dashboard/orders/page.tsx` |
| Seller Order Detail | `client/src/app/(seller)/dashboard/orders/[id]/page.tsx` |
| Seller Customers List | `client/src/app/(seller)/dashboard/customers/page.tsx` |
| Seller Customer Detail | `client/src/app/(seller)/dashboard/customers/[id]/page.tsx` |
| API Endpoints | `client/src/lib/api/endpoints.ts` (SELLER_ORDERS, SELLER_CUSTOMERS) |
