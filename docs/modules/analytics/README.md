# Analytics Module

## Overview

The Analytics module tracks and aggregates platform-wide metrics including sales data, user behavior, product performance, and custom events. It listens to events from all other modules to build a comprehensive analytics dataset for dashboard reporting and business intelligence.

## Architecture

```
server/src/modules/analytics/
├── controllers/
│   └── analytics.controller.js   # Analytics endpoint handlers
├── models/
│   └── Analytics.model.js        # Analytics event schema
├── services/
│   └── analytics.service.js      # Analytics aggregation logic
├── routes/
│   └── analytics.routes.js       # Route definitions
└── events/
    └── analytics.listeners.js    # Listens to all module events
```

## Data Model

### Analytics Model

Stores individual analytics events that can be aggregated for dashboards and reports. Each event captures:

| Field         | Type     | Description                              |
|---------------|----------|------------------------------------------|
| `eventType`   | String   | Type of event tracked                    |
| `category`    | String   | Event category (sales, users, products)  |
| `data`        | Object   | Event-specific payload data              |
| `userId`      | ObjectId | User who triggered the event             |
| `sessionId`   | String   | Browser/app session identifier           |
| `timestamp`   | Date     | When the event occurred                  |
| `metadata`    | Object   | Additional context (IP, device, etc.)    |

## API Endpoints

### Analytics Routes (`/api/v1/analytics`)

| Method | Endpoint              | Auth        | Description                    |
|--------|-----------------------|-------------|--------------------------------|
| GET    | `/dashboard`          | Seller/Admin| Dashboard overview metrics     |
| GET    | `/sales`              | Seller/Admin| Sales data with date filters   |
| GET    | `/products`           | Seller/Admin| Product performance metrics    |
| GET    | `/users`              | Admin       | User acquisition & behavior    |
| POST   | `/events`             | User        | Track custom event             |

## Tracked Metrics

### Sales Analytics
- Total revenue (daily, weekly, monthly, yearly)
- Order count and average order value
- Revenue by product category
- Revenue by payment method
- Refund rate and amount
- Top selling products

### Product Analytics
- Product views and conversion rate
- Most viewed products
- Add-to-cart rate
- Wishlist additions
- Stock turnover rate
- Category performance

### User Analytics
- New user registrations over time
- Active users (DAU, WAU, MAU)
- User retention and churn
- Top customers by revenue
- Geographic distribution

### Custom Events
- Page views and navigation paths
- Search queries and results
- Filter usage patterns
- Checkout abandonment points

## Event Integration

The analytics module passively listens to events from all other modules:

| Source Module   | Events Tracked                                        |
|-----------------|-------------------------------------------------------|
| User            | Registrations, logins, profile updates                |
| Product         | Views, creation, updates, stock changes               |
| Cart            | Item additions, removals, abandonments                |
| Order           | Creation, status changes, cancellations, returns      |
| Payment         | Completions, failures, refunds                        |
| Review          | Submissions, ratings                                  |
| Inventory       | Stock movements, low stock events                     |

## Dashboard Metrics

The `/dashboard` endpoint returns an aggregated overview:

```json
{
  "totalRevenue": 125000,
  "totalOrders": 342,
  "averageOrderValue": 365.50,
  "newCustomers": 89,
  "conversionRate": 3.2,
  "topProducts": [...],
  "revenueChart": [...],
  "orderStatusBreakdown": {...}
}
```

## Dependencies

- **Internal**: Listens to events from all modules (User, Product, Cart, Order, Payment, Review, Inventory)
- **External**: mongoose
