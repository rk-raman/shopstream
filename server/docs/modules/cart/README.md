# Cart Module

The Cart module manages shopping cart functionality including adding/removing items, cart persistence, and cart calculations.

## Features

- Add/remove items from cart
- Update item quantities
- Cart persistence across sessions
- Cart calculations (subtotal, tax, total)
- Cart expiration and cleanup
- Guest cart support

## API Endpoints

### Cart Operations

- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:itemId` - Update cart item quantity
- `DELETE /api/v1/cart/items/:itemId` - Remove item from cart
- `DELETE /api/v1/cart` - Clear entire cart
- `POST /api/v1/cart/merge` - Merge guest cart with user cart

## Models

### Cart Model

```javascript
{
  userId: ObjectId,
  items: [CartItem],
  subtotal: Number,
  taxAmount: Number,
  totalAmount: Number,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### CartItem Model

```javascript
{
  productId: ObjectId,
  quantity: Number,
  price: Number,
  totalPrice: Number,
  specifications: Object
}
```

## Services

- **CartService**: Core cart operations
- **CartCalculationService**: Price calculations
- **CartCleanupService**: Expired cart cleanup

## Events

The module emits events for:

- Item added to cart
- Item removed from cart
- Cart cleared
- Cart expired

## Dependencies

- MongoDB (Mongoose)
- Redis (caching)
- Product Module
- User Module
