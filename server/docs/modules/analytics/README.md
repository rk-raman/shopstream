# Analytics Module

The Analytics module provides comprehensive analytics and reporting for the e-commerce platform.

## Features

- User behavior tracking
- Sales analytics and reporting
- Product performance metrics
- Revenue analytics
- Custom dashboard creation
- Real-time analytics
- Data export capabilities

## API Endpoints

### Analytics Data

- `GET /api/v1/analytics/overview` - Get analytics overview
- `GET /api/v1/analytics/sales` - Get sales analytics
- `GET /api/v1/analytics/products` - Get product performance
- `GET /api/v1/analytics/users` - Get user analytics
- `GET /api/v1/analytics/revenue` - Get revenue analytics

### Custom Reports

- `POST /api/v1/analytics/reports` - Create custom report
- `GET /api/v1/analytics/reports` - Get user reports
- `GET /api/v1/analytics/reports/:id` - Get specific report
- `PUT /api/v1/analytics/reports/:id` - Update report
- `DELETE /api/v1/analytics/reports/:id` - Delete report

### Data Export

- `POST /api/v1/analytics/export` - Export analytics data
- `GET /api/v1/analytics/export/:id` - Download exported data

## Models

### Analytics Model

```javascript
{
  eventType: String,
  userId: ObjectId,
  productId: ObjectId,
  orderId: ObjectId,
  metadata: Object,
  timestamp: Date,
  sessionId: String,
  ipAddress: String,
  userAgent: String
}
```

### Report Model

```javascript
{
  name: String,
  description: String,
  query: Object,
  filters: Object,
  createdBy: ObjectId,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Analytics Events

The module tracks various events:

- Page views
- Product views
- Add to cart
- Purchase completion
- User registration
- Search queries
- Email opens/clicks

## Services

- **AnalyticsService**: Core analytics operations
- **ReportService**: Report generation and management
- **DataExportService**: Data export functionality
- **DashboardService**: Dashboard data aggregation

## Dependencies

- MongoDB (Mongoose)
- Elasticsearch (analytics storage)
- Redis (caching)
- All other modules (event sources)
