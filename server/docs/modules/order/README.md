# Order Module

The Order module handles order processing, tracking, and management for the e-commerce platform.

## Features

- Order creation and management
- Order tracking and status updates
- Order history and analytics
- Order cancellation and refunds
- Shipping address management
- Order notifications

## API Endpoints

### Orders

- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user orders with pagination
- `GET /api/v1/orders/:id` - Get order by ID
- `PUT /api/v1/orders/:id/cancel` - Cancel order
- `PUT /api/v1/orders/:id/status` - Update order status (Admin only)

### Order Items

- `GET /api/v1/orders/:id/items` - Get order items
- `POST /api/v1/orders/:id/items` - Add item to order
- `PUT /api/v1/orders/:id/items/:itemId` - Update order item
- `DELETE /api/v1/orders/:id/items/:itemId` - Remove item from order

### Tracking

- `GET /api/v1/orders/:id/tracking` - Get order tracking information
- `POST /api/v1/orders/:id/tracking` - Update tracking information (Admin only)

## Models

### Order Model

```javascript
{
  userId: ObjectId,
  orderNumber: String,
  status: String, // pending, confirmed, shipped, delivered, cancelled
  items: [OrderItem],
  shippingAddress: Object,
  billingAddress: Object,
  paymentId: ObjectId,
  totalAmount: Number,
  shippingCost: Number,
  taxAmount: Number,
  discountAmount: Number,
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date
}
```

### OrderItem Model

```javascript
{
  productId: ObjectId,
  quantity: Number,
  price: Number,
  totalPrice: Number,
  specifications: Object
}
```

## Order Status Flow

1. **pending** - Order created, awaiting payment
2. **confirmed** - Payment confirmed, order being processed
3. **shipped** - Order shipped, tracking available
4. **delivered** - Order delivered successfully
5. **cancelled** - Order cancelled (before shipping)

## Services

- **OrderService**: Core order operations
- **TrackingService**: Order tracking and status updates
- **OrderItemService**: Order item management
- **NotificationService**: Order-related notifications

## Events

The module emits events for:

- Order created
- Order status updated
- Order cancelled
- Order delivered
- Payment confirmed
- Tracking updated

## Validation

All order operations use comprehensive Joi validation:

- Order creation validation
- Order item validation
- Status update validation
- Tracking information validation

## Integration

- **Payment Module**: Payment processing and confirmation
- **Inventory Module**: Stock management and updates
- **Notification Module**: Order status notifications
- **User Module**: User and address management

## Business Rules

- Orders can only be cancelled before shipping
- Order status can only move forward (pending → confirmed → shipped → delivered)
- Refunds are handled through the payment module
- Order tracking is automatically updated when status changes

## Dependencies

- MongoDB (Mongoose)
- Redis (caching)
- Kafka (events)
- Payment Module
- Inventory Module
- Notification Module
