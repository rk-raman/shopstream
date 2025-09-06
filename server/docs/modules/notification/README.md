# Notification Module

A comprehensive notification system for ShopStream that supports multi-channel delivery (Email, SMS, Push, In-App) with template management, event-driven notifications, and advanced features like bulk operations, scheduling, and analytics.

## Features

### Core Features

- **Multi-Channel Support**: Email, SMS, Push notifications, and In-App notifications
- **Template Management**: Create, update, and manage notification templates
- **Event-Driven Notifications**: Automatically trigger notifications based on system events
- **Bulk Operations**: Send notifications to multiple recipients efficiently
- **Scheduling**: Schedule notifications for future delivery
- **Priority Management**: Set notification priority levels (low, normal, high, urgent)
- **Expiry Management**: Set expiration dates for notifications
- **Analytics & Tracking**: Track delivery, read, click, and dismiss events

### Advanced Features

- **Template Variables**: Dynamic content rendering with template variables
- **Channel-Specific Content**: Customize content for each delivery channel
- **Retry Mechanism**: Automatic retry for failed notifications
- **Rate Limiting**: Control notification frequency
- **Real-time Events**: Event publishing for notification lifecycle
- **Health Monitoring**: Monitor notification system health

## Architecture

```
notification/
├── controllers/           # Request handlers
│   ├── notification.controller.js
│   └── template.controller.js
├── events/               # Event handlers and publishers
│   ├── notification.listeners.js
│   ├── notification.listeners.modular.js
│   └── publishers/
│       └── NotificationEventPublisher.js
├── models/              # Database models
│   ├── Notification.model.js
│   └── NotificationTemplate.model.js
├── routes/              # API routes
│   ├── index.js
│   └── notification.routes.js
├── services/            # Business logic
│   ├── notification.service.js
│   ├── email.service.js
│   ├── sms.service.js
│   └── push.service.js
└── validators/          # Request validation
    └── notification.validators.js
```

## Quick Start

### 1. Configuration

Configure your notification services in your environment:

```javascript
// Email Configuration
EMAIL_SERVICE=smtp|gmail|sendgrid|mailgun
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@shopstream.com

// SMS Configuration (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
SMS_FROM_NUMBER=+1234567890

// Push Configuration (Firebase)
FIREBASE_SERVICE_ACCOUNT=path/to/service-account.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
WEBPUSH_PUBLIC_KEY=your-public-key
WEBPUSH_PRIVATE_KEY=your-private-key
```

### 2. Initialize the Module

```javascript
const { notificationRoutes } = require("./modules/notification/routes");

// Mount routes
app.use("/api/notifications", notificationRoutes);
```

### 3. Event Listeners Setup

```javascript
const notificationListeners = require("./modules/notification/events/notification.listeners");

// Initialize event listeners
await notificationListeners.initializeListeners();
```

## API Endpoints

### User Notifications

| Method | Endpoint                        | Description                 |
| ------ | ------------------------------- | --------------------------- |
| GET    | `/notifications`                | Get user notifications      |
| GET    | `/notifications/:id`            | Get notification by ID      |
| PATCH  | `/notifications/:id/read`       | Mark as read                |
| PATCH  | `/notifications/:id/click`      | Mark as clicked             |
| PATCH  | `/notifications/:id/dismiss`    | Mark as dismissed           |
| PATCH  | `/notifications/bulk/read`      | Bulk mark as read           |
| DELETE | `/notifications/bulk`           | Bulk delete notifications   |
| GET    | `/notifications/stats/overview` | Get notification statistics |

### Admin Notifications

| Method | Endpoint                                 | Description                     |
| ------ | ---------------------------------------- | ------------------------------- |
| POST   | `/notifications`                         | Create notification             |
| POST   | `/notifications/:id/send`                | Send notification               |
| GET    | `/notifications/admin/all`               | Get all notifications           |
| PUT    | `/notifications/:id`                     | Update notification             |
| DELETE | `/notifications/:id`                     | Delete notification             |
| POST   | `/notifications/admin/process-scheduled` | Process scheduled notifications |
| POST   | `/notifications/admin/retry-failed`      | Retry failed notifications      |
| POST   | `/notifications/admin/cleanup-expired`   | Cleanup expired notifications   |
| POST   | `/notifications/admin/bulk-send`         | Send bulk notifications         |

### Templates

| Method | Endpoint                              | Description          |
| ------ | ------------------------------------- | -------------------- |
| GET    | `/notifications/templates`            | Get templates        |
| GET    | `/notifications/templates/:id`        | Get template by ID   |
| GET    | `/notifications/templates/type/:type` | Get template by type |
| POST   | `/notifications/templates`            | Create template      |
| PUT    | `/notifications/templates/:id`        | Update template      |
| DELETE | `/notifications/templates/:id`        | Delete template      |
| POST   | `/notifications/templates/:id/test`   | Test template        |
| POST   | `/notifications/templates/validate`   | Validate template    |

## Usage Examples

### Creating a Simple Notification

```javascript
const notificationService = require("./services/notification.service");

// Create and send a notification
const notification = await notificationService.createNotification({
  recipient: "user123",
  type: "order",
  category: "success",
  title: "Order Confirmed",
  message: "Your order has been confirmed and is being processed.",
  channels: {
    email: { enabled: true },
    sms: { enabled: true },
    inApp: { enabled: true },
  },
  priority: "normal",
  actionUrl: "/orders/12345",
  actionText: "View Order",
});
```

### Using Templates

```javascript
// Create a template
const template = await notificationService.createNotificationTemplate({
  name: "Order Confirmation",
  type: "order",
  category: "success",
  subject: "Order {{orderNumber}} Confirmed",
  title: "Order Confirmed!",
  message: "Hi {{firstName}}, your order #{{orderNumber}} has been confirmed.",
  variables: [
    { name: "firstName", type: "string", required: true },
    { name: "orderNumber", type: "string", required: true },
  ],
  channels: {
    email: { enabled: true },
    sms: { enabled: true },
  },
});

// Use template to create notification
const notification = await notificationService.createNotification({
  recipient: "user123",
  templateId: template._id,
  templateData: {
    firstName: "John",
    orderNumber: "ORD-12345",
  },
});
```

### Bulk Notifications

```javascript
const notifications = [
  {
    recipient: "user1",
    type: "promotion",
    title: "Special Offer",
    message: "Get 20% off on your next purchase!",
  },
  {
    recipient: "user2",
    type: "promotion",
    title: "Special Offer",
    message: "Get 20% off on your next purchase!",
  },
];

const results = await notificationService.sendBulkNotifications(notifications);
```

### Event-Driven Notifications

The system automatically sends notifications for various events:

```javascript
// These events automatically trigger notifications:

// User Events
eventEmitter.emit("user:registered", { userId, email, firstName });
eventEmitter.emit("user:login_failed", { email, attemptCount });

// Order Events
eventEmitter.emit("order:created", { orderId, userId, totalAmount });
eventEmitter.emit("order:shipped", { orderId, userId, trackingNumber });

// Payment Events
eventEmitter.emit("payment:successful", { paymentId, userId, amount });
eventEmitter.emit("payment:failed", { paymentId, userId, reason });

// Product Events
eventEmitter.emit("product:back_in_stock", { productId, productName });
```

## Configuration Options

### Notification Types

- `account` - Account-related notifications
- `order` - Order-related notifications
- `payment` - Payment-related notifications
- `shipping` - Shipping and delivery notifications
- `security` - Security alerts
- `product` - Product updates
- `promotion` - Marketing and promotional messages
- `system` - System announcements

### Categories

- `success` - Success messages (green)
- `info` - Informational messages (blue)
- `warning` - Warning messages (yellow)
- `error` - Error messages (red)

### Priorities

- `low` - Low priority
- `normal` - Normal priority (default)
- `high` - High priority
- `urgent` - Urgent priority

### Channels

- `email` - Email notifications
- `sms` - SMS notifications
- `push` - Push notifications (Firebase/WebPush)
- `inApp` - In-app notifications

## Event System

The module publishes various events throughout the notification lifecycle:

### Notification Events

- `notification:created` - When a notification is created
- `notification:sent` - When a notification is sent
- `notification:delivered` - When a notification is delivered
- `notification:read` - When a notification is read
- `notification:clicked` - When a notification is clicked
- `notification:dismissed` - When a notification is dismissed
- `notification:failed` - When a notification fails
- `notification:expired` - When a notification expires

### Template Events

- `template:created` - When a template is created
- `template:updated` - When a template is updated
- `template:deleted` - When a template is deleted

## Error Handling

The module uses structured error handling:

```javascript
try {
  const notification = await notificationService.createNotification(data);
} catch (error) {
  if (error.statusCode === 404) {
    // Template not found
  } else if (error.statusCode === 400) {
    // Validation error
  } else {
    // Other errors
  }
}
```

## Best Practices

### 1. Use Templates

Always use templates for recurring notifications to maintain consistency and enable easy updates.

### 2. Set Appropriate Priorities

Use priority levels wisely:

- `urgent` - Critical security alerts, payment failures
- `high` - Order confirmations, shipping updates
- `normal` - General updates, promotions
- `low` - Newsletter, tips

### 3. Channel Selection

Choose appropriate channels based on notification type:

- **Email**: Detailed information, receipts, confirmations
- **SMS**: Time-sensitive alerts, OTPs, critical updates
- **Push**: Real-time updates, user engagement
- **In-App**: Non-critical updates, feature announcements

### 4. Expiry Management

Set appropriate expiry times:

- OTP notifications: 5-10 minutes
- Promotional offers: Based on offer validity
- General updates: 30 days

### 5. Content Optimization

- Keep SMS content under 160 characters
- Use clear, actionable email subjects
- Include clear call-to-action buttons
- Ensure mobile-friendly content

## Testing

### Unit Tests

```bash
npm test modules/notification
```

### Template Testing

Use the template test endpoint to validate templates:

```javascript
POST /api/notifications/templates/:id/test
{
  "testData": { "firstName": "John", "orderNumber": "12345" },
  "recipient": "test@example.com"
}
```

## Monitoring

### Health Check

```javascript
const health = await notificationService.getSystemHealth();
console.log(health);
// {
//   status: 'healthy',
//   services: {
//     email: 'connected',
//     sms: 'connected',
//     push: 'connected'
//   }
// }
```

### Analytics

```javascript
const stats = await notificationService.getNotificationStats(userId);
// {
//   total: 150,
//   unread: 5,
//   byType: [...],
//   byStatus: [...]
// }
```

## Troubleshooting

### Common Issues

1. **Email not sending**

   - Check SMTP configuration
   - Verify authentication credentials
   - Check firewall settings

2. **SMS not sending**

   - Verify Twilio credentials
   - Check phone number format
   - Verify account balance

3. **Push notifications not working**

   - Check Firebase configuration
   - Verify device tokens
   - Check VAPID keys for web push

4. **Templates not rendering**
   - Verify template variables
   - Check template syntax
   - Validate template data

### Debugging

Enable debug logs:

```javascript
DEBUG=notification:* npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License

This module is part of the ShopStream application and follows the main project's license.
