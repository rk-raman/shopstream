# Checkout Module Documentation

## Overview

The checkout module implements a **Flipkart-style accordion checkout flow**. It uses a server-side session model that snapshots the cart at checkout initiation and guides the user through 4 sequential steps: Login, Address, Order Summary, and Payment.

---

## Architecture

```
Cart Page ─── [PLACE ORDER] ───> POST /checkout/session
                                        │
                                        ▼
                              CheckoutSession created
                              (cart items snapshotted)
                                        │
                    ┌───────────────────┴───────────────────┐
                    │          CheckoutContext               │
                    │   { session, steps, actions }          │
                    └───┬────────┬────────┬────────┬───────┘
                        │        │        │        │
                     Login   Address   Summary   Payment
                     Step     Step      Step      Step
                        │        │        │        │
                        │  PUT /address   │   POST /payment/*
                        │        │   GET /summary    │
                        │        │        │          │
                        └────────┴────────┴──────────┘
                                        │
                                        ▼
                              Order Confirmation
```

**Key design decisions:**
- Cart is snapshotted into the session — prices are locked at checkout start
- Session has a 30-minute TTL (auto-expires via MongoDB TTL index)
- Each API access refreshes the TTL
- Inventory is validated again at order placement time

---

## API Endpoints

Base path: `/api/checkout`

All endpoints require authentication (`authenticate` + `customerOnly` middleware).

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/session` | `createSession` | Create or resume checkout session from cart |
| GET | `/session/:sessionId` | `getSession` | Get current session state |
| PUT | `/session/:sessionId/address` | `setAddress` | Set delivery address |
| GET | `/session/:sessionId/summary` | `getSummary` | Get order summary + delivery estimates |
| POST | `/session/:sessionId/coupon` | `applyCoupon` | Apply coupon code |
| DELETE | `/session/:sessionId/coupon` | `removeCoupon` | Remove applied coupon |
| POST | `/session/:sessionId/payment/initiate` | `initiatePayment` | Set payment method, create intent |
| POST | `/session/:sessionId/payment/confirm` | `confirmPayment` | Confirm payment and place order |
| POST | `/session/:sessionId/payment/cod` | `placeCODOrder` | Place Cash on Delivery order |
| GET | `/session/:sessionId/confirmation` | `getConfirmation` | Get order confirmation data |

---

## Data Models

### CheckoutSession

```
CheckoutSession {
  user                  ObjectId (ref: User, required)
  status                enum: active | completed | abandoned | expired
  currentStep           enum: login | address | summary | payment

  // Address
  selectedAddressId     ObjectId (saved address reference)
  deliveryAddress {
    fullName            String
    phone               String
    addressLine1        String
    addressLine2        String
    city                String
    state               String
    pincode             String
    country             String (default: "India")
    type                enum: home | office | other
  }

  // Items (snapshot from cart)
  items [{
    product             ObjectId (ref: Product)
    productName         String (required)
    productImage        String
    variant {
      variantId         ObjectId
      name              String
      value             String
      sku               String
    }
    quantity            Number (1-10)
    price               Number (required)
    discountPrice       Number
    seller              ObjectId (ref: User)
    deliveryEstimate {
      date              Date
      method            enum: standard | express | same_day
    }
  }]

  // Pricing (auto-calculated)
  pricing {
    subtotal            Number
    discount            Number
    deliveryCharge      Number
    tax                 Number
    total               Number
  }

  // Coupon
  appliedCoupon {
    couponId            ObjectId
    code                String
    discountType        enum: percentage | flat
    discountValue       Number
    discountAmount      Number
  }

  // Payment
  selectedPaymentMethod enum: upi | card | wallet | cod | emi | netbanking
  paymentIntentId       String

  // Result
  orderId               ObjectId (ref: Order)
  cartSnapshotAt        Date
  expiresAt             Date (TTL: 30 minutes)
  completedAt           Date
  createdAt             Date (auto)
  updatedAt             Date (auto)
}
```

**Indexes:**
- `{ user: 1, status: 1 }` — find active session for user
- `{ expiresAt: 1 }` with `expireAfterSeconds: 0` — auto-delete expired sessions
- `{ status: 1, createdAt: -1 }` — query by status

**Instance methods:**
- `refreshExpiry()` — resets `expiresAt` to 30 minutes from now
- `calculatePricing()` — computes subtotal, 18% GST, delivery (free above ₹500, else ₹40), applies coupon discount

### Coupon

```
Coupon {
  code                  String (unique, uppercase, required)
  description           String
  type                  enum: percentage | flat (required)
  value                 Number (required)
  minOrderAmount        Number (default: 0)
  maxDiscount           Number (nullable, caps percentage discounts)
  validFrom             Date (default: now)
  validTo               Date (required)
  usageLimit            Number (nullable, total redemptions)
  usedCount             Number (default: 0)
  perUserLimit          Number (default: 1)
  usedBy [{
    user                ObjectId
    usedAt              Date
  }]
  applicableProducts    ObjectId[] (ref: Product)
  applicableCategories  ObjectId[] (ref: Category)
  isActive              Boolean (default: true)
  createdBy             ObjectId (ref: User)
}
```

**Instance methods:**
- `isValid(orderAmount, userId)` — checks active, date range, usage limits, min amount, per-user limit
- `calculateDiscount(orderAmount)` — returns discount amount (percentage capped by maxDiscount)

---

## Checkout Flow (Step by Step)

### Step 1: Session Creation

```
POST /api/checkout/session
Authorization: Bearer <token>
```

**What happens:**
1. Checks for existing active session for the user
2. Fetches user's cart with populated product data
3. Validates cart is not empty
4. Snapshots cart items (product name, image, price, seller, variant)
5. Sets default delivery estimate (5 days)
6. Calculates pricing (subtotal, tax, delivery)
7. Returns session with user's saved addresses

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "_id": "...",
      "user": { "_id": "...", "firstName": "...", "addresses": [...] },
      "status": "active",
      "currentStep": "address",
      "items": [...],
      "pricing": { "subtotal": 1500, "tax": 270, "deliveryCharge": 0, "total": 1770 }
    }
  }
}
```

### Step 2: Set Delivery Address

```
PUT /api/checkout/session/:sessionId/address
```

**Using saved address:**
```json
{ "addressId": "saved_address_id" }
```

**Using new address:**
```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "addressLine1": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "type": "home"
}
```

**What happens:**
1. Validates session ownership and active status
2. Copies address (from saved or request body) into session
3. Recalculates delivery estimates based on pincode (metro: 3 days, other: 6 days)
4. Advances `currentStep` to "summary"
5. Recalculates pricing

### Step 3: Order Summary

```
GET /api/checkout/session/:sessionId/summary
```

Returns items, delivery address, pricing breakdown, applied coupon, and per-item delivery estimates.

### Step 3a: Apply/Remove Coupon (Optional)

```
POST /api/checkout/session/:sessionId/coupon
{ "code": "SAVE20" }
```

```
DELETE /api/checkout/session/:sessionId/coupon
```

**Coupon validation checks:** active status, date range, usage limits, minimum order amount, per-user limit.

### Step 4: Payment

**Initiate payment:**
```
POST /api/checkout/session/:sessionId/payment/initiate
{ "paymentMethod": "upi" }
```

Sets payment method on session. For online payments, returns a payment intent placeholder. For COD, no intent needed.

**Place order (COD):**
```
POST /api/checkout/session/:sessionId/payment/cod
```

**Confirm payment (online):**
```
POST /api/checkout/session/:sessionId/payment/confirm
{ "transactionId": "txn_123..." }
```

**What happens on order placement:**
1. Validates delivery address and payment method are set
2. Re-validates inventory for all items
3. Generates order number (`ORD{timestamp}{count}`)
4. Creates Order document with items, pricing, addresses, payment info
5. Reserves inventory for each item
6. Marks coupon as used (if applied)
7. Clears user's cart
8. Updates session to `completed`
9. Emits `ORDER_CREATED` event

### Step 5: Confirmation

```
GET /api/checkout/session/:sessionId/confirmation
```

Returns order details, delivery address, pricing, payment method, and placement timestamp.

---

## Frontend Architecture

### Component Tree

```
CheckoutPage
└── CheckoutProvider (Context)
    └── CheckoutContent
        ├── [Loading State] — Spinner
        ├── [Error State] — Error message + link to cart
        ├── [Order Placed] — OrderConfirmation
        └── [Active Checkout]
            ├── Left Column (lg:col-span-2)
            │   ├── CheckoutStep (login)
            │   │   └── LoginStep
            │   ├── CheckoutStep (address)
            │   │   └── AddressStep
            │   ├── CheckoutStep (summary)
            │   │   └── OrderSummaryStep
            │   └── CheckoutStep (payment)
            │       └── PaymentStep
            └── Right Column (lg:col-span-1)
                └── PriceDetails (sticky)
```

### CheckoutContext State

| Field | Type | Description |
|-------|------|-------------|
| `session` | `CheckoutSession \| null` | Current server-side session |
| `isLoading` | `boolean` | API call in progress |
| `error` | `string \| null` | Last error message |
| `orderPlaced` | `boolean` | True after successful order |
| `orderData` | `any` | Order object after placement |
| `activeStep` | `CheckoutStep` | Currently expanded step |
| `completedSteps` | `CheckoutStep[]` | Steps marked complete |
| `steps` | `StepState[]` | Computed step states for accordion |

### CheckoutContext Actions

| Action | Params | Description |
|--------|--------|-------------|
| `initSession()` | — | Creates session, auto-completes login step |
| `selectAddress(data)` | `addressId` or new address fields | Sets address, auto-advances to summary |
| `applyCoupon(code)` | coupon code string | Applies coupon, updates pricing |
| `removeCoupon()` | — | Removes coupon |
| `selectPaymentMethod(method)` | PaymentMethodType | Initiates payment |
| `placeOrder(paymentData?)` | optional `{ transactionId }` | Places order (COD or online) |
| `goToStep(step)` | CheckoutStep | Navigate to specific step |

### Accordion Behavior (CheckoutStep)

- **Active step:** Blue header (#2874f0), content expanded
- **Completed step:** White header, shows summary text + "CHANGE" button, content collapsed
- **Pending step:** Gray header, no interaction, content collapsed
- **Step auto-advances** when the current step's action completes

### Step Components

| Component | Step | Key Features |
|-----------|------|-------------|
| `LoginStep` | 1 | Read-only display of user name, email, phone |
| `AddressStep` | 2 | Saved addresses as radio list, "Add New Address" form, "DELIVER HERE" button |
| `OrderSummaryStep` | 3 | Item list with images/prices/delivery dates, coupon input, "CONTINUE" button |
| `PaymentStep` | 4 | 6 payment methods (UPI, Card, Net Banking, Wallet, COD, EMI) with method-specific UIs |
| `PriceDetails` | Sidebar | Sticky price breakdown, savings, trust badges |
| `OrderConfirmation` | Post-order | Success header, item list, price summary, address/payment cards, action buttons |

### Payment Methods

| Method | UI | Action |
|--------|-----|--------|
| UPI | UPI ID input field | PAY button with amount |
| Card | "Redirected to gateway" message | PAY button |
| Net Banking | "Redirected to bank" message | PAY button |
| Wallet | Provider info | PAY button |
| COD | "Pay on delivery" message | CONFIRM ORDER button |
| EMI | Eligibility info | PAY button |

---

## Pricing Logic

```
subtotal = sum(item.effectivePrice * item.quantity)    // effectivePrice = discountPrice || price
tax = round(subtotal * 0.18)                           // 18% GST
deliveryCharge = subtotal > 500 ? 0 : 40               // Free above ₹500
couponDiscount = appliedCoupon.discountAmount || 0
total = subtotal + tax + deliveryCharge - couponDiscount
```

## Delivery Estimation

Metro pincodes (starting with 110, 400, 500, 600, 700, 560, 380, 411) get **3-day** delivery. All others get **6-day** delivery. Default estimate when no address is set: 5 days.

---

## Error Handling

| Scenario | HTTP | Message |
|----------|------|---------|
| Cart empty | 400 | "Cart is empty" |
| Session not found | 404 | "Checkout session not found" |
| Session expired | 400 | "Checkout session is no longer active" |
| No address set | 400 | "Please select a delivery address first" |
| No payment method | 400 | "Please select a payment method" |
| Product unavailable | 400 | "{productName} is no longer available" |
| Insufficient stock | 400 | "Insufficient stock for {productName}" |
| Invalid coupon | 400/404 | Coupon-specific message |
| Access denied | 403 | "Access denied" |

---

## Events Emitted

| Event | When | Payload |
|-------|------|---------|
| `ORDER_CREATED` | Order placed | orderId, orderNumber, customerId, totalAmount, paymentMethod |

---

## File Reference

### Backend

| File | Path |
|------|------|
| Session Model | `server/src/modules/checkout/models/CheckoutSession.model.js` |
| Checkout Service | `server/src/modules/checkout/services/checkout.service.js` |
| Checkout Controller | `server/src/modules/checkout/controllers/checkout.controller.js` |
| Checkout Routes | `server/src/modules/checkout/routes/checkout.routes.js` |
| Coupon Model | `server/src/modules/coupon/models/Coupon.model.js` |
| Coupon Service | `server/src/modules/coupon/services/coupon.service.js` |
| Event Types | `server/src/shared/events/eventTypes.js` (CHECKOUT_EVENTS) |
| Route Registration | `server/src/routes/index.js` (`/checkout`) |

### Frontend

| File | Path |
|------|------|
| Types | `client/src/features/customer/checkout/types.ts` |
| API Service | `client/src/features/customer/checkout/services/checkoutService.ts` |
| Context | `client/src/features/customer/checkout/context/CheckoutContext.tsx` |
| Main Page | `client/src/features/customer/checkout/components/CheckoutPage.tsx` |
| Accordion Step | `client/src/features/customer/checkout/components/CheckoutStep.tsx` |
| Login Step | `client/src/features/customer/checkout/components/steps/LoginStep.tsx` |
| Address Step | `client/src/features/customer/checkout/components/steps/AddressStep.tsx` |
| Summary Step | `client/src/features/customer/checkout/components/steps/OrderSummaryStep.tsx` |
| Payment Step | `client/src/features/customer/checkout/components/steps/PaymentStep.tsx` |
| Price Sidebar | `client/src/features/customer/checkout/components/sidebar/PriceDetails.tsx` |
| Confirmation | `client/src/features/customer/checkout/components/confirmation/OrderConfirmation.tsx` |
| API Endpoints | `client/src/lib/api/endpoints.ts` (CHECKOUT section) |
| Route Page | `client/src/app/(customer)/checkout/page.tsx` |
