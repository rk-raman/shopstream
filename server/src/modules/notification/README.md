# Notification Module

A comprehensive notification system for the ShopStream e-commerce platform that supports multiple delivery channels including email, SMS, push notifications, and in-app notifications.

## Features

### Core Functionality

- **Multi-channel Notifications**: Email, SMS, Push, and In-app notifications
- **Template System**: Reusable notification templates with variable substitution
- **Scheduled Notifications**: Send notifications at specific times
- **Bulk Notifications**: Send notifications to multiple recipients efficiently
- **Notification Analytics**: Track delivery, read, and click rates
- **Event-driven Architecture**: Automatic notifications based on system events

### Notification Types

- **Account**: User registration, login, verification, security alerts
- **Order**: Order confirmation, shipping updates, delivery notifications
- **Payment**: Payment success/failure, refund notifications
- **Product**: Stock alerts, price drops, back-in-stock notifications
- **System**: System maintenance, updates, general announcements
- **Promotion**: Marketing campaigns, special offers

### Delivery Channels

#### Email Notifications

- HTML and text email support
- Template-based email generation
- Attachment support
- Multiple email service providers (Gmail, SendGrid, Mailgun, SMTP)

#### SMS Notifications

- Text message delivery
- OTP and verification codes
- Multiple SMS providers (Twilio, AWS SNS, TextLocal)
- Character limit validation

#### Push Notifications

- Firebase Cloud Messaging (FCM)
- Web Push API
- Rich notifications with images and actions
- Device token management

#### In-App Notifications

- Real-time in-app notifications
- Read/unread status tracking
- Dismissible notifications
- Action buttons and deep linking

## API Endpoints

### User Notification Endpoints

```
GET    /api/notifications              # Get user notifications
GET    /api/notifications/:id          # Get specific notification
PATCH  /api/notifications/:id/read     # Mark as read
PATCH  /api/notifications/:id/click    # Mark as clicked
PATCH  /api/notifications/:id/dismiss  # Mark as dismissed
PATCH  /api/notifications/bulk/read    # Bulk mark as read
DELETE /api/notifications/bulk         # Bulk delete
GET    /api/notifications/stats        # Get notification stats
```

### Admin Notification Endpoints

```
POST   /api/notifications              # Create notification
POST   /api/notifications/:id/send     # Send notification
GET    /api/notifications/admin/all    # Get all notifications
PUT    /api/notifications/:id          # Update notification
DELETE /api/notifications/:id          # Delete notification
POST   /api/notifications/admin/bulk-send # Send bulk notifications
```

### Template Management Endpoints

```
GET    /api/notifications/templates              # Get templates
GET    /api/notifications/templates/:id          # Get template by ID
GET    /api/notifications/templates/type/:type   # Get template by type
POST   /api/notifications/templates              # Create template
PUT    /api/notifications/templates/:id          # Update template
DELETE /api/notifications/templates/:id          # Delete template
POST   /api/notifications/templates/:id/duplicate # Duplicate template
POST   /api/notifications/templates/:id/test     # Test template
```

## Models

### Notification Model

```javascript
{
  title: String,           // Notification title
  message: String,         // Notification message
  recipient: ObjectId,     // User ID
  type: String,           // Notification type
  category: String,       // Notification category
  channels: {             // Delivery channels
    email: { enabled: Boolean, sent: Boolean },
    sms: { enabled: Boolean, sent: Boolean },
    push: { enabled: Boolean, sent: Boolean },
    inApp: { enabled: Boolean, delivered: Boolean, read: Boolean }
  },
  priority: String,       // Priority level
  scheduledAt: Date,      // Scheduled delivery time
  expiresAt: Date,        // Expiration time
  actionUrl: String,      // Action URL
  actionText: String,     // Action button text
  relatedEntity: {        // Related entity info
    type: String,
    id: ObjectId
  },
  templateId: ObjectId,   // Template reference
  templateData: Object,   // Template variables
  status: String,         // Notification status
  analytics: {            // Analytics data
    opened: Boolean,
    clicked: Boolean,
    dismissed: Boolean
  }
}
```

### NotificationTemplate Model

```javascript
{
  name: String,           // Template name
  type: String,           // Template type
  category: String,       // Template category
  subject: String,        // Email subject
  title: String,          // Notification title
  message: String,        // Notification message
  emailContent: {         // Email-specific content
    html: String,
    text: String
  },
  smsContent: {           // SMS-specific content
    message: String
  },
  pushContent: {          // Push-specific content
    title: String,
    body: String,
    icon: String,
    image: String
  },
  variables: [{           // Template variables
    name: String,
    type: String,
    required: Boolean,
    defaultValue: String
  }],
  channels: {             // Channel configuration
    email: { enabled: Boolean, required: Boolean },
    sms: { enabled: Boolean, required: Boolean },
    push: { enabled: Boolean, required: Boolean },
    inApp: { enabled: Boolean, required: Boolean }
  },
  priority: String,       // Default priority
  defaultExpiry: Number,  // Default expiry in days
  isActive: Boolean,      // Template status
  isDefault: Boolean,     // Default template flag
  usage: {                // Usage statistics
    totalSent: Number,
    lastUsed: Date,
    successRate: Number
  }
}
```

## Services

### NotificationService

Main service for notification operations:

- `createNotification()` - Create new notification
- `sendNotification()` - Send notification through enabled channels
- `getUserNotifications()` - Get user's notifications
- `markAsRead()` - Mark notification as read
- `bulkMarkAsRead()` - Bulk mark as read
- `getNotificationStats()` - Get notification statistics

### EmailService

Email delivery service:

- `sendEmail()` - Send single email
- `sendBulkEmails()` - Send bulk emails
- `sendTemplateEmail()` - Send templated email
- `validateEmailAddress()` - Validate email format

### SMSService

SMS delivery service:

- `sendSMS()` - Send single SMS
- `sendBulkSMS()` - Send bulk SMS
- `sendOTP()` - Send OTP SMS
- `validatePhoneNumber()` - Validate phone number

### PushService

Push notification service:

- `sendPushNotification()` - Send push notification
- `registerDeviceToken()` - Register device token
- `unregisterDeviceToken()` - Unregister device token
- `getUserDeviceTokens()` - Get user's device tokens

## Event System

The notification module integrates with the event-driven architecture:

### Event Listeners

- **User Events**: Registration, login, security alerts
- **Order Events**: Order lifecycle notifications
- **Payment Events**: Payment success/failure notifications
- **Product Events**: Stock and price notifications

### Event Publishers

- **NotificationEventPublisher**: Publishes notification-related events
- Events: created, sent, delivered, read, clicked, dismissed, failed, expired

## Configuration

### Environment Variables

```bash
# Email Configuration
EMAIL_SERVICE=gmail|smtp|sendgrid|mailgun
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com

# SMS Configuration
SMS_PROVIDER=twilio|aws-sns|textlocal
SMS_ACCOUNT_SID=your-account-sid
SMS_AUTH_TOKEN=your-auth-token
SMS_FROM_NUMBER=+1234567890

# Push Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
WEBPUSH_PUBLIC_KEY=your-public-key
WEBPUSH_PRIVATE_KEY=your-private-key
```

## Usage Examples

### Create a Simple Notification

```javascript
const notificationService = require("./services/notification.service");

await notificationService.createNotification({
  recipient: userId,
  type: "order",
  category: "success",
  title: "Order Confirmed",
  message: "Your order has been confirmed and is being prepared.",
  channels: {
    email: { enabled: true },
    inApp: { enabled: true },
  },
  actionUrl: `/orders/${orderId}`,
  actionText: "View Order",
});
```

### Create a Template-based Notification

```javascript
await notificationService.createNotification({
  recipient: userId,
  templateId: templateId,
  templateData: {
    firstName: "John",
    orderNumber: "ORD-123",
    totalAmount: 1500,
  },
  channels: {
    email: { enabled: true },
    sms: { enabled: true },
    inApp: { enabled: true },
  },
});
```

### Send Bulk Notifications

```javascript
const notifications = [
  {
    recipient: userId1,
    type: "promotion",
    title: "Special Offer",
    message: "20% off today!",
  },
  {
    recipient: userId2,
    type: "promotion",
    title: "Special Offer",
    message: "20% off today!",
  },
];

await notificationService.sendBulkNotifications(notifications, {
  batchSize: 100,
  delayBetweenBatches: 1000,
});
```

## Best Practices

1. **Template Usage**: Use templates for consistent messaging and easy updates
2. **Channel Selection**: Choose appropriate channels based on notification type and urgency
3. **Scheduling**: Use scheduled notifications for non-urgent messages
4. **Analytics**: Monitor notification performance and user engagement
5. **Rate Limiting**: Implement rate limiting to prevent spam
6. **Error Handling**: Always handle delivery failures gracefully
7. **Testing**: Test notifications in development before production deployment

## Monitoring and Analytics

The notification module provides comprehensive analytics:

- Delivery rates by channel
- Read and click-through rates
- Failed delivery tracking
- User engagement metrics
- Template performance statistics

## Security Considerations

- Validate all notification data
- Sanitize user inputs
- Implement rate limiting
- Secure API endpoints with authentication
- Protect sensitive information in notifications
- Monitor for abuse and spam

## Troubleshooting

### Common Issues

1. **Email not sending**: Check email service configuration and credentials
2. **SMS delivery failures**: Verify phone number format and SMS provider settings
3. **Push notifications not received**: Ensure device tokens are valid and up-to-date
4. **Template rendering errors**: Check variable names and data types

### Debug Mode

Enable debug logging by setting `DEBUG=notification:*` environment variable.

## Contributing

When contributing to the notification module:

1. Follow the existing code structure and patterns
2. Add appropriate tests for new functionality
3. Update documentation for API changes
4. Ensure backward compatibility
5. Follow security best practices
