# Review Module

## Overview

The Review module enables customers to leave product reviews with ratings. It supports verified purchase validation, review moderation, and rating aggregation for product quality scoring.

## Architecture

```
server/src/modules/review/
├── controllers/
│   └── review.controller.js    # Review CRUD endpoint handlers
├── models/
│   └── Review.model.js         # Review schema
├── services/
│   └── review.service.js       # Review business logic
├── routes/
│   └── review.routes.js        # Route definitions
├── validators/
│   └── review.validators.js    # Input validation
└── events/
    ├── review.events.js        # Event type definitions
    └── review.listeners.js     # Event listener registration
```

## Data Model

### Review Model

| Field               | Type     | Description                          |
|---------------------|----------|--------------------------------------|
| `product`           | ObjectId | Reference to Product (indexed)       |
| `user`              | ObjectId | Reference to User (indexed)          |
| `rating`            | Number   | Rating score (1-5)                   |
| `title`             | String   | Review title (max 200 chars)         |
| `comment`           | String   | Review text (max 2000 chars)         |
| `isVerifiedPurchase`| Boolean  | Whether user purchased the product   |

## API Endpoints

Product reviews are primarily accessed through the Product module routes:

| Method | Endpoint                      | Auth   | Description                |
|--------|-------------------------------|--------|----------------------------|
| POST   | `/products/:productId/reviews`| User   | Create a review            |
| GET    | `/products/:productId/reviews`| Public | Get reviews for a product  |

## Key Features

- **Verified Purchase Badge**: Reviews from users who purchased the product are flagged as `isVerifiedPurchase`
- **One Review Per Product**: Each user can submit one review per product (enforced by compound index on `product` + `user`)
- **Rating Aggregation**: Average rating and rating distribution are computed for product listings
- **Character Limits**: Title (200 chars) and comment (2000 chars) to maintain quality

## Events Published

| Event              | Payload                           | Triggered When           |
|--------------------|-----------------------------------|--------------------------|
| `review.created`   | Review object, product ID, rating | New review submitted     |
| `review.updated`   | Review ID, updated fields         | Review edited            |
| `review.deleted`   | Review ID, product ID             | Review removed           |

## Dependencies

- **Internal**: Product module (product validation), User module (authentication), Order module (purchase verification)
- **External**: mongoose
