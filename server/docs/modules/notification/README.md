# Notification Module

The Notification module handles all types of notifications including email, SMS, and push notifications.

## Features

- Email notifications
- SMS notifications
- Push notifications
- Notification templates
- Notification scheduling
- Notification preferences
- Delivery tracking

## API Endpoints

### Notifications

- `GET /api/v1/notifications` - Get user notifications
- `POST /api/v1/notifications` - Send notification
- `PUT /api/v1/notifications/:id/read` - Mark notification as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Templates

- `GET /api/v1/notifications/templates` - Get notification templates
- `POST /api/v1/notifications/templates` - Create template (Admin)
- `PUT /api/v1/notifications/templates/:id` - Update template (Admin)
- `DELETE /api/v1/notifications/templates/:id` - Delete template (Admin)

### Preferences

- `GET /api/v1/notifications/preferences` - Get user preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

## Models

### Notification Model

```javascript
{
  userId: ObjectId,
  type: String, // email, sms, push
  title: String,
  message: String,
  templateId: ObjectId,
  status: String, // pending, sent, delivered, failed
  channel: String,
  metadata: Object,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date
}
```

### Template Model

```javascript
{
  name: String,
  type: String, // email, sms, push
  subject: String,
  content: String,
  variables: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Notification Types

### Email Notifications

- Order confirmations
- Payment receipts
- Shipping updates
- Password resets
- Welcome emails
- Promotional emails

### SMS Notifications

- Order confirmations
- OTP verification
- Delivery updates
- Payment alerts

### Push Notifications

- Order status updates
- Promotional offers
- Price drop alerts
- New product notifications

## Services

- **EmailService**: Email sending and management
- **SMSService**: SMS sending and management
- **PushService**: Push notification management
- **TemplateService**: Template management
- **NotificationService**: Core notification operations

## Events

The module listens for events from other modules:

- Order created/updated
- Payment processed
- User registered
- Product price changed
- Low stock alert

## Dependencies

- Nodemailer (email)
- Twilio (SMS)
- Firebase (push notifications)
- MongoDB (Mongoose)
- Redis (caching)
- All other modules (event sources)
