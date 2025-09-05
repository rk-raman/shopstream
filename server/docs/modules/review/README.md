# Review Module

The Review module manages product reviews, ratings, and user feedback.

## Features

- Product reviews and ratings
- Review moderation
- Review analytics
- Review helpfulness voting
- Review images
- Review responses

## API Endpoints

### Reviews

- `GET /api/v1/reviews` - Get reviews with filtering
- `GET /api/v1/reviews/:id` - Get review by ID
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Product Reviews

- `GET /api/v1/products/:productId/reviews` - Get product reviews
- `GET /api/v1/products/:productId/rating` - Get product rating summary

### Review Interactions

- `POST /api/v1/reviews/:id/helpful` - Mark review as helpful
- `POST /api/v1/reviews/:id/report` - Report inappropriate review
- `POST /api/v1/reviews/:id/response` - Respond to review (Admin)

## Models

### Review Model

```javascript
{
  userId: ObjectId,
  productId: ObjectId,
  orderId: ObjectId,
  rating: Number, // 1-5
  title: String,
  comment: String,
  images: [String],
  isVerified: Boolean,
  isApproved: Boolean,
  helpfulVotes: Number,
  reportCount: Number,
  response: {
    text: String,
    respondedBy: ObjectId,
    respondedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Review Guidelines

### Rating System

- 1 star: Poor
- 2 stars: Fair
- 3 stars: Good
- 4 stars: Very Good
- 5 stars: Excellent

### Review Requirements

- Must be a verified purchase
- Minimum 10 characters for comment
- No profanity or inappropriate content
- Must be related to the product

## Services

- **ReviewService**: Core review operations
- **RatingService**: Rating calculations and analytics
- **ModerationService**: Review moderation and approval
- **AnalyticsService**: Review analytics and insights

## Events

The module emits events for:

- Review created
- Review updated
- Review deleted
- Review reported
- Review approved/rejected

## Moderation

- Automatic profanity filtering
- Spam detection
- Manual review for flagged content
- Admin approval workflow

## Dependencies

- MongoDB (Mongoose)
- Redis (caching)
- Product Module
- User Module
- Order Module
