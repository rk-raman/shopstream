# Coupon Module Documentation

## Overview

The coupon module allows sellers to create and manage discount codes (like Shopify). Customers apply these codes during checkout to receive discounts. The module supports percentage and flat discounts, usage limits, optional date ranges, minimum order requirements, and per-user restrictions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    COUPON MODULE                         │
│                                                          │
│  ┌────────────────┐          ┌────────────────────────┐ │
│  │  Seller/Admin   │          │      Customer           │ │
│  │                 │          │                          │ │
│  │ • Create coupon │          │ • Apply at checkout      │ │
│  │ • List / search │          │ • Remove from checkout   │ │
│  │ • Edit / delete │          │                          │ │
│  │ • Toggle on/off │          │                          │ │
│  │ • View usage    │          │                          │ │
│  │ • View stats    │          │                          │ │
│  └───────┬─────────┘          └────────────┬─────────── │ │
│          │                                  │            │
│          ▼                                  ▼            │
│  ┌───────────────────────────────────────────────────┐  │
│  │               Coupon Service                       │  │
│  │                                                    │  │
│  │  CRUD: create, read, update, delete, toggle        │  │
│  │  Validation: isValid, calculateDiscount            │  │
│  │  Analytics: stats, usage tracking                  │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│                         ▼                                │
│                  ┌─────────────┐                         │
│                  │ Coupon Model │                        │
│                  │  (MongoDB)   │                        │
│                  └─────────────┘                         │
└─────────────────────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
   ┌─────────────────┐     ┌──────────────────┐
   │ Checkout Module  │     │   Order Module    │
   │ (applies coupon) │     │ (stores coupon    │
   │                  │     │  info on order)   │
   └──────────────────┘     └──────────────────┘
```

---

## Minimum Required Fields

Only **3 fields** are required to create a coupon:

| Field | Required | Description |
|-------|----------|-------------|
| `code` | Yes | Unique discount code (auto-uppercased) |
| `type` | Yes | `percentage` or `flat` |
| `value` | Yes | Discount amount (% or ₹) |

Everything else is optional and has sensible defaults.

---

## API Endpoints

Base path: `/api/coupons`

All endpoints require authentication + `seller` or `admin` role.

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/stats` | `getCouponStats` | Dashboard stats overview |
| POST | `/` | `createCoupon` | Create new coupon |
| GET | `/` | `getCoupons` | List coupons (search, filter, paginate) |
| GET | `/:couponId` | `getCouponById` | Get single coupon details |
| PUT | `/:couponId` | `updateCoupon` | Update coupon fields |
| DELETE | `/:couponId` | `deleteCoupon` | Delete coupon permanently |
| PATCH | `/:couponId/toggle` | `toggleCoupon` | Toggle active/inactive |
| GET | `/:couponId/usage` | `getCouponUsage` | Get redemption history |

### Checkout Integration (separate routes)

These are handled by the checkout module but use the coupon service internally:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/checkout/session/:sessionId/coupon` | Apply coupon code to checkout |
| DELETE | `/checkout/session/:sessionId/coupon` | Remove applied coupon |

---

## Data Model

### Coupon

```
Coupon {
  code                  String (unique, uppercase, required)
  description           String (optional, internal note)
  type                  enum: "percentage" | "flat" (required)
  value                 Number (required, min: 0)

  // Restrictions
  minOrderAmount        Number (default: 0, no minimum)
  maxDiscount           Number (default: null, no cap — only relevant for percentage)

  // Date Range (both optional)
  validFrom             Date (default: null — active immediately)
  validTo               Date (default: null — never expires)

  // Usage Limits
  usageLimit            Number (default: null — unlimited)
  usedCount             Number (default: 0, auto-incremented)
  perUserLimit          Number (default: 1)
  usedBy [{
    user                ObjectId (ref: User)
    usedAt              Date
  }]

  // Targeting (optional)
  applicableProducts    ObjectId[] (ref: Product, empty = all products)
  applicableCategories  ObjectId[] (ref: Category, empty = all categories)

  // Meta
  isActive              Boolean (default: true)
  createdBy             ObjectId (ref: User, seller who created it)
  createdAt             Date (auto)
  updatedAt             Date (auto)
}
```

**Indexes:**
- `{ code: 1 }` — unique code lookup
- `{ isActive: 1, validFrom: 1, validTo: 1 }` — status filtering

### Instance Methods

**`isValid(orderAmount, userId)`** — Returns `{ valid: boolean, message: string }`

Validation checks (in order):
1. `isActive` must be `true`
2. `validFrom` — if set, current time must be after it
3. `validTo` — if set, current time must be before it
4. `usageLimit` — if set, `usedCount` must be below it
5. `minOrderAmount` — order total must meet minimum
6. `perUserLimit` — user's usage count must be below limit

**`calculateDiscount(orderAmount)`** — Returns discount amount (Number)

- **Percentage:** `round(orderAmount * value / 100)`, capped by `maxDiscount` if set
- **Flat:** `value`, capped by `orderAmount` (can't discount more than the order)

---

## Coupon Status Logic

Status is **computed** from `isActive`, `validFrom`, and `validTo` (not stored as a field):

| Status | Condition |
|--------|-----------|
| **Active** | `isActive = true` AND (no `validFrom` OR `validFrom <= now`) AND (no `validTo` OR `validTo >= now`) |
| **Inactive** | `isActive = false` |
| **Expired** | `validTo` is set AND `validTo < now` |
| **Scheduled** | `validFrom` is set AND `validFrom > now` |

---

## Service Methods

### CRUD Operations

| Method | Params | Description |
|--------|--------|-------------|
| `createCoupon(data, createdBy)` | Coupon fields + seller ID | Creates coupon. Checks for duplicate code. Auto-uppercases code |
| `getCoupons(sellerId, options)` | Filters: page, limit, search, status, type, sortBy, sortOrder | Returns paginated coupons scoped to seller. Search matches code and description |
| `getCouponById(couponId, sellerId)` | IDs | Returns single coupon. Scoped to seller |
| `updateCoupon(couponId, sellerId, data)` | IDs + update fields | Updates coupon. Checks for code conflicts if code is changing |
| `deleteCoupon(couponId, sellerId)` | IDs | Permanently deletes coupon. Scoped to seller |
| `toggleCoupon(couponId, sellerId)` | IDs | Flips `isActive` flag |

### Checkout Integration

| Method | Params | Description |
|--------|--------|-------------|
| `validateAndApply(code, orderAmount, userId)` | Code string, order total, user ID | Validates coupon and returns discount details: `{ couponId, code, discountType, discountValue, discountAmount }` |
| `markUsed(couponId, userId)` | IDs | Increments `usedCount`, adds entry to `usedBy` array. Called after order is placed |

### Analytics

| Method | Params | Description |
|--------|--------|-------------|
| `getCouponStats(sellerId)` | Seller ID | Returns: `{ totalCoupons, activeCoupons, expiredCoupons, totalRedemptions }` |
| `getCouponUsage(couponId, sellerId, options)` | IDs + pagination | Returns paginated list of users who redeemed the coupon (with names, emails, timestamps) |

---

## Discount Calculation

```
if type === "percentage":
    discount = round(orderAmount * value / 100)
    if maxDiscount is set:
        discount = min(discount, maxDiscount)

if type === "flat":
    discount = value

// Never discount more than the order total
discount = min(discount, orderAmount)
```

**Examples:**
- `SAVE20` — 20% off, max ₹500 → ₹2000 order gets ₹400 off, ₹5000 order gets ₹500 off (capped)
- `FLAT100` — ₹100 flat off → any qualifying order gets ₹100 off
- `WELCOME10` — 10% off, no cap, min ₹500 → ₹500 order gets ₹50 off

---

## Checkout Flow Integration

```
1. Customer enters code in checkout → POST /checkout/session/:id/coupon
2. Backend calls couponService.validateAndApply(code, subtotal, userId)
3. If valid → stores appliedCoupon in CheckoutSession, recalculates pricing
4. If invalid → returns error message (expired, min amount, already used, etc.)
5. Customer can remove → DELETE /checkout/session/:id/coupon
6. On order placement → couponService.markUsed(couponId, userId)
7. Coupon info stored on Order document: { code, discountAmount, discountType }
```

---

## Frontend — Seller Dashboard

### Pages

**Coupon List** (`/dashboard/coupons`)
- Stats cards: total coupons, active, expired, total redemptions
- Search by code or description
- Status filter: all, active, scheduled, expired, inactive
- Table columns: code (copyable), type, discount value, usage count, valid period, status badge
- Actions per row: view detail, toggle active/inactive, delete
- Pagination

**Create Coupon** (`/dashboard/coupons/create`) — Shopify-style form
- **Discount Code section:** Code input with auto-generate button, internal description
- **Discount Value section:** Type selector (percentage/flat), value input with unit indicator, min order amount, max discount cap (shown only for percentage type)
- **Active Dates section (optional):** Start date, end date — both optional, leave empty for no restriction
- **Usage Limits section:** Total usage limit (empty = unlimited), per customer limit (default: 1)
- **Status toggle:** Active or save as draft
- **Live Preview card:** Shows formatted discount summary as you type

**Coupon Detail** (`/dashboard/coupons/:id`)
- Header: code (copyable), toggle active/inactive, edit, delete buttons
- Stats cards: discount amount, times used (with usage limit), status, expiry date
- Usage progress bar (if usage limit set)
- **View mode:** Read-only details table
- **Edit mode:** Inline form with all editable fields + save/cancel
- **Redemption history:** List of users who used the coupon with timestamps

### Navigation

Coupons link in seller sidebar with sub-items:
- All Coupons → `/dashboard/coupons`
- Create Coupon → `/dashboard/coupons/create`

---

## Frontend — Customer

Coupon application happens inside the checkout flow (OrderSummaryStep):
- Text input for coupon code + "APPLY" button
- Applied coupon shows as green badge with code, savings amount, and remove (X) button
- Discount reflected in PriceDetails sidebar

---

## Error Handling

| Scenario | HTTP | Message |
|----------|------|---------|
| Duplicate code | 409 | "A coupon with this code already exists" |
| Invalid code | 404 | "Invalid coupon code" |
| Coupon inactive | 400 | "Coupon is inactive" |
| Not yet active | 400 | "Coupon is not yet active" |
| Expired | 400 | "Coupon has expired" |
| Usage limit reached | 400 | "Coupon usage limit reached" |
| Below minimum | 400 | "Minimum order amount is ₹{amount}" |
| Already used by user | 400 | "You have already used this coupon" |
| Coupon not found | 404 | "Coupon not found" |

---

## File Reference

### Backend

| File | Path |
|------|------|
| Coupon Model | `server/src/modules/coupon/models/Coupon.model.js` |
| Coupon Service | `server/src/modules/coupon/services/coupon.service.js` |
| Coupon Controller | `server/src/modules/coupon/controllers/coupon.controller.js` |
| Coupon Routes | `server/src/modules/coupon/routes/coupon.routes.js` |
| Route Registration | `server/src/routes/index.js` (`/coupons`) |
| Checkout Integration | `server/src/modules/checkout/services/checkout.service.js` (applyCoupon, removeCoupon) |

### Frontend — Seller

| File | Path |
|------|------|
| Coupon Service | `client/src/features/seller/services/sellerCouponService.ts` |
| Coupon List Page | `client/src/app/(seller)/dashboard/coupons/page.tsx` |
| Create Coupon Page | `client/src/app/(seller)/dashboard/coupons/create/page.tsx` |
| Coupon Detail Page | `client/src/app/(seller)/dashboard/coupons/[id]/page.tsx` |
| API Endpoints | `client/src/lib/api/endpoints.ts` (COUPONS section) |
| Sidebar Nav | `client/src/components/layout/Sidebar/SellerSidebar.tsx` |

### Frontend — Customer (checkout integration)

| File | Path |
|------|------|
| Checkout Service | `client/src/features/customer/checkout/services/checkoutService.ts` (applyCoupon, removeCoupon) |
| Checkout Context | `client/src/features/customer/checkout/context/CheckoutContext.tsx` (applyCoupon, removeCoupon) |
| Coupon UI | `client/src/features/customer/checkout/components/steps/OrderSummaryStep.tsx` |
| API Endpoints | `client/src/lib/api/endpoints.ts` (CHECKOUT section — applyCoupon, removeCoupon) |
