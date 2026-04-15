# Notification Module

## Overview

The Notification module provides a unified notification system supporting email, SMS, push notifications, and in-app notifications. It features a template engine for customizable message formatting, scheduled delivery, bulk operations, and listens to events from all other modules to trigger automated notifications.

## Architecture

```
server/src/modules/notification/
├── controllers/
│   ├── notification.controller.js  # Notification CRUD & delivery
│   └── template.controller.js      # Template management
├── models/
│   ├── Notification.model.js       # Notification record schema
│   ├── NotificationTemplate.model.js # Template schema
│   └── index.js                    # Model exports
├── services/
│   ├── notification.service.js     # Notification orchestration
│   ├── email.service.js            # Nodemailer email delivery
│   ├── sms.service.js              # Twilio SMS delivery
│   └── push.service.js             # Firebase push notifications
├── routes/
│   ├── notification.routes.js      # Route definitions
│   └── index.js                    # Route aggregator
├── validators/
│   ├── notification.validators.js  # Validation middleware
│   └── notification.schemas.js     # Joi validation schemas
├── events/
│   ├── notification.listeners.js         # Listens to all module events
│   ├── notification.listeners.modular.js # Modular listener setup
│   └── publishers/
│       └── NotificationEventPublisher.js
└── index.js                        # Module exports
```

## Data Models

### Notification Model

| Field           | Type     | Description                                         |
|-----------------|----------|-----------------------------------------------------|
| `title`         | String   | Notification title (max 200 chars)                  |
| `message`       | String   | Notification body (max 1000 chars)                  |
| `description`   | String   | Extended description (max 2000 chars)               |
| `recipient`     | ObjectId | Reference to User                                   |
| `recipientType` | String   | `user`, `admin`, `seller`, `all`                    |
| `type`          | String   | Category (see types below)                          |
| `channel`       | String   | `email`, `sms`, `push`, `in_app`                    |
| `status`        | String   | `pending`, `sent`, `delivered`, `failed`, `read`    |
| `isRead`        | Boolean  | Read status                                         |
| `isClicked`     | Boolean  | Click-through status                                |
| `isDismissed`   | Boolean  | Dismissed status                                    |
| `scheduledFor`  | Date     | Scheduled delivery time                             |
| `sentAt`        | Date     | Actual send time                                    |
| `expiresAt`     | Date     | Notification expiry                                 |
| `metadata`      | Object   | Additional context data                             |

### Notification Types

`order`, `payment`, `product`, `promotion`, `system`, `security`, `review`, `inventory`, `shipping`, `account`, `general`

### NotificationTemplate Model

Templates support variable interpolation for dynamic content generation. Templates are managed by admins and used by the automated notification system.

## API Endpoints

### User Notification Routes (`/api/v1/notifications`)

| Method | Endpoint                    | Auth  | Description                     |
|--------|-----------------------------|-------|---------------------------------|
| GET    | `/`                         | User  | Get own notifications           |
| GET    | `/:notificationId`          | User  | Get notification by ID          |
| PATCH  | `/:notificationId/read`     | User  | Mark as read                    |
| PATCH  | `/:notificationId/click`    | User  | Mark as clicked                 |
| PATCH  | `/:notificationId/dismiss`  | User  | Mark as dismissed               |
| PATCH  | `/bulk/read`                | User  | Bulk mark as read               |
| DELETE | `/bulk`                     | User  | Bulk delete notifications       |
| GET    | `/stats/overview`           | User  | Notification statistics         |

### Admin Notification Routes

| Method | Endpoint                       | Auth  | Description                     |
|--------|--------------------------------|-------|---------------------------------|
| POST   | `/`                            | Admin | Create notification             |
| POST   | `/:notificationId/send`        | Admin | Send notification               |
| GET    | `/admin/all`                   | Admin | Get all notifications           |
| PUT    | `/:notificationId`             | Admin | Update notification             |
| DELETE | `/:notificationId`             | Admin | Delete notification             |
| POST   | `/admin/process-scheduled`     | Admin | Process scheduled notifications |
| POST   | `/admin/retry-failed`          | Admin | Retry failed notifications      |
| POST   | `/admin/cleanup-expired`       | Admin | Clean up expired notifications  |
| POST   | `/admin/bulk-send`             | Admin | Send bulk notifications         |

### Template Routes (Admin Only)

| Method | Endpoint                          | Auth  | Description                  |
|--------|-----------------------------------|-------|------------------------------|
| GET    | `/templates`                      | Admin | List templates               |
| GET    | `/templates/:templateId`          | Admin | Get template by ID           |
| GET    | `/templates/type/:type`           | Admin | Get template by type         |
| POST   | `/templates`                      | Admin | Create template              |
| PUT    | `/templates/:templateId`          | Admin | Update template              |
| DELETE | `/templates/:templateId`          | Admin | Delete template              |
| POST   | `/templates/:templateId/duplicate`| Admin | Duplicate template           |
| POST   | `/templates/:templateId/test`     | Admin | Test template (send preview) |
| GET    | `/templates/stats/overview`       | Admin | Template statistics          |
| PATCH  | `/templates/bulk/status`          | Admin | Bulk update status           |
| GET    | `/templates/:templateId/export`   | Admin | Export template              |
| POST   | `/templates/import`               | Admin | Import template              |
| POST   | `/templates/validate`             | Admin | Validate template            |

## Automated Notification Triggers

The module listens to events from other modules and automatically sends notifications:

| Source Event            | Notification Sent                  | Channel     |
|-------------------------|------------------------------------|-------------|
| `user.created`          | Welcome email                      | Email       |
| `user.email.verified`   | Email verified confirmation        | Email       |
| `order.created`         | Order confirmation                 | Email, Push |
| `order.shipped`         | Shipping notification              | Email, SMS  |
| `order.delivered`       | Delivery confirmation              | Email, Push |
| `order.cancelled`       | Cancellation notice                | Email       |
| `payment.completed`     | Payment receipt                    | Email       |
| `payment.failed`        | Payment failure alert              | Email, Push |
| `payment.refunded`      | Refund confirmation                | Email       |
| `product.stock.low`     | Low stock alert (to seller)        | Email, Push |
| `product.approved`      | Product approval notice (to seller)| Email       |
| `cart.abandoned`        | Abandoned cart reminder            | Email       |

## Delivery Services

### Email Service (`email.service.js`)
- Powered by **Nodemailer**
- Supports SMTP, Gmail, and custom mail servers
- HTML email templates with variable interpolation

### SMS Service (`sms.service.js`)
- Powered by **Twilio**
- Order status updates and OTP delivery
- Global coverage

### Push Service (`push.service.js`)
- Powered by **Firebase Admin SDK**
- Cross-platform push notifications (iOS, Android, Web)
- Supports notification payloads with custom data

## Dependencies

- **Internal**: Listens to events from User, Order, Payment, Product, Cart, Inventory modules
- **External**: nodemailer, twilio, firebase-admin, mongoose-paginate-v2
