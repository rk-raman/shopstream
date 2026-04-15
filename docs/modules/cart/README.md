# Cart Module

## Overview

The Cart module manages shopping cart operations for authenticated users. It supports product variants, automatic price calculations, coupon/promo code application, cart syncing between local storage and server, and abandoned cart tracking.

## Architecture

```
server/src/modules/cart/
├── controllers/
│   └── cart.controller.js        # Cart HTTP endpoint handlers
├── models/
│   └── Cart.model.js             # Cart schema with embedded items
├── services/
│   └── cart.service.js           # Cart business logic & calculations
├── routes/
│   └── cart.routes.js            # Route definitions
├── validators/
│   └── cart.validators.js        # Input validation middleware
├── events/
│   ├── cart.events.js            # Event type definitions
│   ├── cart.listeners.js         # Event listener registration
│   ├── publishers/
│   │   └── CartEventPublisher.js # Publishes cart events
│   └── subscribers/
│       ├── CartAnalyticsSubscriber.js    # Tracks cart behavior
│       ├── CartCacheSubscriber.js        # Cache invalidation
│       ├── CartNotificationSubscriber.js # Abandoned cart emails
│       └── index.js
└── index.js                      # Module exports
```

## Data Models

### Cart Model

| Field                 | Type       | Description                        |
|-----------------------|------------|------------------------------------|
| `user`                | ObjectId   | Reference to User (unique per user)|
| `items`               | [CartItem] | Array of cart items                |
| `totalItems`          | Number     | Sum of all item quantities         |
| `totalPrice`          | Number     | Sum of original prices             |
| `totalDiscountedPrice`| Number     | Sum of effective prices            |
| `savedAmount`         | Number     | Total discount savings             |
| `lastModified`        | Date       | Last cart modification time        |

### CartItem Sub-Schema

| Field           | Type     | Description                           |
|-----------------|----------|---------------------------------------|
| `product`       | ObjectId | Reference to Product                  |
| `variant`       | Object   | `{ variantId, name, value, sku }`     |
| `quantity`      | Number   | Item quantity (min: 1, max: 10)       |
| `price`         | Number   | Original unit price                   |
| `discountPrice` | Number   | Discounted unit price (optional)      |
| `addedAt`       | Date     | When item was added                   |

## API Endpoints

### Cart Routes (`/api/v1/cart`)

All routes require authentication.

| Method | Endpoint      | Auth     | Description                          |
|--------|---------------|----------|--------------------------------------|
| GET    | `/`           | User     | Get current user's cart              |
| POST   | `/add`        | User     | Add item to cart                     |
| PUT    | `/item/:itemId` | User   | Update item quantity                 |
| DELETE | `/item/:itemId` | User   | Remove item from cart                |
| DELETE | `/clear`      | User     | Clear entire cart                    |
| GET    | `/summary`    | User     | Get cart totals summary              |
| POST   | `/sync`       | User     | Sync local cart to server            |
| POST   | `/coupon`     | User     | Apply coupon/promo code              |
| DELETE | `/coupon`     | User     | Remove applied coupon                |
| GET    | `/abandoned`  | Admin    | Get abandoned carts list             |

## Cart Lifecycle

### Adding Items
1. Validate product exists and is in stock
2. Check if item (product + variant) already exists in cart
3. If exists: update quantity; if not: add new item
4. Recalculate totals via pre-save middleware

### Cart Sync (Login Flow)
1. User browses as guest -> items stored in browser localStorage
2. User logs in -> client sends `POST /cart/sync` with local items
3. Server merges local items with any existing server-side cart
4. Duplicates are resolved by keeping the higher quantity
5. Client clears local storage after successful sync

### Automatic Calculations (Pre-Save Middleware)
On every cart save, the following are recalculated:
- `totalItems`: Sum of all `item.quantity`
- `totalPrice`: Sum of `item.price * item.quantity`
- `totalDiscountedPrice`: Sum of `(item.discountPrice || item.price) * item.quantity`
- `savedAmount`: `totalPrice - totalDiscountedPrice`

## Events Published

| Event                | Payload                     | Triggered When                |
|----------------------|-----------------------------|-------------------------------|
| `cart.item.added`    | Cart ID, product, quantity  | Item added to cart            |
| `cart.item.removed`  | Cart ID, product            | Item removed from cart        |
| `cart.updated`       | Cart ID, totals             | Cart quantities changed       |
| `cart.cleared`       | Cart ID, user               | Cart emptied                  |
| `cart.abandoned`     | Cart ID, user, items        | Cart inactive for set period  |
| `cart.promo.applied` | Cart ID, promo code         | Coupon applied successfully   |

## Instance Methods

The Cart model provides the following convenience methods:

- `addItem(productData)` - Add or update an item in the cart
- `updateItemQuantity(itemId, quantity)` - Change item quantity (removes if <= 0)
- `removeItem(itemId)` - Remove a specific item
- `clear()` - Remove all items from the cart

## Database Indexes

- `{ user: 1 }` - Fast lookup by user
- `{ "items.product": 1 }` - Fast lookup by product in cart

## Dependencies

- **Internal**: Product module (product validation), User module (authentication)
- **External**: mongoose
