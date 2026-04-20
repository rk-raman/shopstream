# Reviews & Ratings Module Documentation

## Overview

The reviews module lets customers rate and review products they've purchased. It supports star ratings, written reviews, verified purchase badges, helpful votes, seller replies, and real-time rating aggregation on the product model.

---

## Architecture

```
Customer writes review
        │
        ▼
  POST /reviews/product/:productId
        │
        ▼
┌──────────────────────────────────────┐
│          REVIEW SERVICE               │
│                                        │
│  1. Check duplicate (unique index)     │
│  2. Verify purchase (Order lookup)     │
│  3. Create Review document             │
│  4. Recalculate Product.rating         │
│  5. Emit REVIEW_CREATED event          │
└──────────┬───────────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌──────────┐
│ Review  │ │ Product  │
│ Model   │ │ .rating  │
│ (store) │ │ (update) │
└─────────┘ └──────────┘
```

**Key design decisions:**
- Reviews stored in separate `Review` collection (not embedded in Product)
- One review per user per product enforced by compound unique index
- Product.rating (average, count, distribution) recalculated from Review aggregation after every change
- Verified purchase auto-detected by checking Order collection

---

## API Endpoints

Base path: `/api/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/product/:productId` | Public | Get reviews with stats + pagination |
| POST | `/product/:productId` | Customer | Submit review |
| GET | `/my-reviews` | Customer | Get user's own reviews |
| PUT | `/:reviewId` | Author | Update own review |
| DELETE | `/:reviewId` | Author/Admin | Delete review |
| POST | `/:reviewId/helpful` | Customer | Toggle helpful vote |
| POST | `/:reviewId/reply` | Seller | Add seller reply |

---

## Data Model

### Review

```
Review {
  product               ObjectId (ref: Product, required, indexed)
  user                  ObjectId (ref: User, required, indexed)
  rating                Number (1-5, required)
  title                 String (max 200 chars)
  comment               String (max 2000 chars)
  images [{
    url                 String
    public_id           String
  }]
  isVerifiedPurchase    Boolean (default: false, auto-set)
  helpfulCount          Number (default: 0)
  helpfulBy             ObjectId[] (users who voted helpful)
  sellerReply {
    comment             String
    repliedAt           Date
  }
  status                enum: active | hidden | flagged (default: active)
  createdAt             Date (auto)
  updatedAt             Date (auto)
}
```

**Indexes:**
- `{ product: 1, user: 1 }` — **unique** (one review per user per product)
- `{ product: 1, rating: -1 }` — filter by star rating
- `{ product: 1, createdAt: -1 }` — sort by recent

### Product Rating Fields (updated by review service)

```
Product.rating {
  average               Number (0-5, rounded to 1 decimal)
  count                 Number (total reviews)
  distribution {
    5                   Number (count of 5-star reviews)
    4                   Number
    3                   Number
    2                   Number
    1                   Number
  }
}
```

---

## Service Methods

| Method | Description |
|--------|-------------|
| `addReview(userId, productId, data)` | Creates review. Checks for existing review (compound index). Looks up delivered orders to set `isVerifiedPurchase`. Recalculates product rating. Emits `REVIEW_CREATED` event |
| `getProductReviews(productId, options)` | Returns `{ reviews, stats, pagination }`. Stats include `averageRating`, `totalReviews`, `distribution`. Supports: `page`, `limit`, `sortBy` (createdAt/rating/helpfulCount), `sortOrder`, `rating` (filter by star) |
| `updateReview(userId, reviewId, data)` | Updates own review (rating, title, comment, images). Recalculates product rating |
| `deleteReview(userId, reviewId, role)` | Deletes review. Admin can delete any. Recalculates product rating |
| `markHelpful(userId, reviewId)` | Toggles helpful vote. Can't vote on own review. Uses atomic `$addToSet`/`$pull` + `$inc` |
| `addSellerReply(sellerId, reviewId, comment)` | Adds seller response. Verifies seller owns the product via `product.seller` |
| `recalculateProductRating(productId)` | Aggregation pipeline: computes average, count, and 5-star distribution from all active reviews. Updates `Product.rating` atomically |
| `getUserReviews(userId, page, limit)` | Returns paginated list of user's reviews with product info |

---

## Verified Purchase Logic

```
When a review is submitted:
  1. Query: Order.exists({
       customer: userId,
       "items.product": productId,
       status: "delivered"
     })
  2. If found → isVerifiedPurchase = true
  3. Badge displayed next to review: ✓ Verified Purchase
```

The check happens at review creation time. It looks for at least one delivered order containing the reviewed product.

---

## Rating Recalculation

After every add, update, or delete, the product's rating is recalculated from scratch:

```javascript
// Aggregation pipeline
Review.aggregate([
  { $match: { product: productId, status: "active" } },
  { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
])

// Distribution pipeline
Review.aggregate([
  { $match: { product: productId, status: "active" } },
  { $group: { _id: "$rating", count: { $sum: 1 } } }
])

// Update product atomically
Product.findByIdAndUpdate(productId, {
  "rating.average": roundedAverage,
  "rating.count": totalCount,
  "rating.distribution": { 5: n, 4: n, 3: n, 2: n, 1: n }
})
```

This ensures Product.rating is always consistent with the actual reviews, even if reviews are edited or deleted.

---

## Helpful Votes

```
POST /reviews/:reviewId/helpful

Toggle behavior:
  - First click: adds userId to helpfulBy[], increments helpfulCount
  - Second click: removes userId from helpfulBy[], decrements helpfulCount
  - Cannot vote on own review (returns 400)

Uses atomic MongoDB operations:
  $addToSet / $pull for helpfulBy
  $inc for helpfulCount
```

---

## Seller Reply

```
POST /reviews/:reviewId/reply
Authorization: seller or admin
Body: { "comment": "Thank you for your feedback..." }

Validation:
  1. Find review and populate product.seller
  2. Check review.product.seller === req.user._id
  3. If mismatch → 403 "You can only reply to reviews on your products"
  4. Store: review.sellerReply = { comment, repliedAt: now }

Display:
  Shown below the review with "Seller Response" badge and blue left-border
```

---

## Events Published

| Event | When | Payload |
|-------|------|---------|
| `review.created` | New review submitted | reviewId, productId, userId, rating, isVerifiedPurchase |
| `review.updated` | Review edited | reviewId, productId, userId |
| `review.deleted` | Review removed | reviewId, productId, userId |

---

## Frontend

### ReviewSection Component

A single self-contained client component that renders the complete review experience on the product detail page.

```
<ReviewSection productId={id} />
```

**Sections:**

```
┌──────────────────────────────────────────────────────┐
│  Ratings & Reviews                   [Write a Review] │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ┌─ Review Form (toggle) ──────────────────────────┐  │
│  │  ★ ★ ★ ★ ☆  Very Good                          │  │
│  │  [Review title                              ]    │  │
│  │  [Describe your experience...               ]    │  │
│  │  [Submit Review]  [Cancel]                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Rating Summary ────────────────────────────────┐  │
│  │  4.2        5 ★ ████████████████ 42             │  │
│  │  ★★★★☆     4 ★ ██████████       28             │  │
│  │  128 reviews 3 ★ ██████          18             │  │
│  │             2 ★ ███              10             │  │
│  │             1 ★ ██                6             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  [3 star only ×]              Sort: [Most Recent ▼]    │
│                                                        │
│  ── Review List ───────────────────────────────────    │
│                                                        │
│  ★★★★★  ✓ Verified Purchase           12 Oct 2025    │
│  Great product!                                        │
│  Excellent quality and fast delivery...                │
│  Rahul K.                          👍 Helpful (5)     │
│                                                        │
│     ┌─ Seller Response ────────────────────────┐      │
│     │ Thank you for your kind words!           │      │
│     │ 15 Oct 2025                              │      │
│     └──────────────────────────────────────────┘      │
│                                                        │
│  ★★★☆☆                                3 Oct 2025     │
│  Decent but could be better                            │
│  The material is okay but sizing runs small...         │
│  Priya M.                          👍 Helpful (2)     │
│                                                        │
│          [Previous]  1 / 3  [Next]                     │
└──────────────────────────────────────────────────────┘
```

**Features:**
- **Star input** — hover preview + click to set + text label (Poor/Fair/Good/Very Good/Excellent)
- **Rating summary** — large average number + star display + clickable distribution bars
- **Star filter** — click any bar to filter reviews by that rating, click again to clear
- **Sort** — Most Recent, Most Helpful, Highest Rating (dropdown)
- **Review cards** — stars, verified badge, title, comment, author name, date
- **Helpful button** — toggle with count, disabled for own review
- **Seller reply** — blue bordered card below review with "Seller Response" label
- **Pagination** — Previous/Next with page count
- **Write a Review** — button visible only when logged in, toggles form
- **Empty state** — star icon + "Be the first to review!" message

---

## Error Handling

| Scenario | HTTP | Message |
|----------|------|---------|
| Duplicate review | 409 | "You have already reviewed this product" |
| Product not found | 404 | "Product not found" |
| Review not found | 404 | "Review not found" |
| Vote on own review | 400 | "Cannot mark your own review as helpful" |
| Seller reply — wrong seller | 403 | "You can only reply to reviews on your products" |

---

## File Reference

### Backend

| File | Path |
|------|------|
| Review Model | `server/src/modules/review/models/Review.model.js` |
| Review Service | `server/src/modules/review/services/review.service.js` |
| Review Controller | `server/src/modules/review/controllers/review.controller.js` |
| Review Routes | `server/src/modules/review/routes/review.routes.js` |
| Route Registration | `server/src/routes/index.js` (`/reviews`) |
| Event Types | `server/src/shared/events/eventTypes.js` (REVIEW_EVENTS) |

### Frontend

| File | Path |
|------|------|
| Review Service | `client/src/features/customer/reviews/reviewService.ts` |
| ReviewSection Component | `client/src/features/customer/reviews/components/ReviewSection.tsx` |
| API Endpoints | `client/src/lib/api/endpoints.ts` (REVIEWS section) |
| Product Detail Page | `client/src/app/(customer)/product/[id]/page.tsx` |
