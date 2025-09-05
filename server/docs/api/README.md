# API Documentation

Complete API documentation for the ShopStream e-commerce backend.

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Getting a Token

```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "pagination": { ... },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Email is required",
      "value": "",
      "type": "any.required"
    }
  ]
}
```

## Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 500  | Internal Server Error |

## Rate Limiting

API endpoints are rate limited:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Search endpoints**: 50 requests per 15 minutes

## Pagination

List endpoints support pagination:

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field
- `order` - Sort order (asc/desc)

### Response

```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Filtering and Search

Many endpoints support filtering and search:

### Query Parameters

- `q` - Search query
- `filter` - Filter criteria (JSON string)
- `fields` - Fields to include/exclude

### Example

```
GET /api/v1/products?q=laptop&filter={"category":"electronics","price":{"$gte":500}}&fields=name,price,image
```

## Error Codes

| Code                   | Description               |
| ---------------------- | ------------------------- |
| `VALIDATION_ERROR`     | Input validation failed   |
| `AUTHENTICATION_ERROR` | Authentication failed     |
| `AUTHORIZATION_ERROR`  | Insufficient permissions  |
| `NOT_FOUND`            | Resource not found        |
| `DUPLICATE_ERROR`      | Resource already exists   |
| `PAYMENT_ERROR`        | Payment processing failed |
| `INVENTORY_ERROR`      | Insufficient stock        |
| `RATE_LIMIT_ERROR`     | Rate limit exceeded       |

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `order.created`
- `order.updated`
- `payment.succeeded`
- `payment.failed`
- `inventory.low_stock`

### Webhook Payload

```json
{
  "event": "order.created",
  "data": {
    "orderId": "order_123",
    "userId": "user_456",
    "amount": 99.99
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install shopstream-sdk
```

### Python

```bash
pip install shopstream-python
```

### PHP

```bash
composer require shopstream/php-sdk
```

## Postman Collection

Download our Postman collection for easy API testing:
[Download Collection](./postman-collection.json)

## OpenAPI Specification

View the complete OpenAPI specification:
[OpenAPI Spec](./openapi.yaml)

## Support

For API support:

- Create an issue in the repository
- Check the [FAQ](./faq.md)
- Review existing issues and discussions
