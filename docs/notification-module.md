# Notification Module Documentation

## Overview

The notification module is a multi-channel, event-driven system that sends notifications via **Email**, **SMS**, **Push**, **WhatsApp**, and **In-App** channels. It uses Bull queues (backed by Redis) for reliable async delivery with automatic retries, and webhook endpoints for delivery status tracking from external providers.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      EVENT PRODUCERS                          │
│                                                                │
│  User Module      Order Module     Payment Module    Product   │
│  ─ registered     ─ created        ─ success        ─ low_stock│
│  ─ verified       ─ shipped        ─ failed         ─ back_in  │
│  ─ login_failed   ─ delivered      ─ refunded         _stock   │
│  ─ acct_locked    ─ cancelled                                  │
│                                                                │
└───────────────────────────┬────────────────────────────────────┘
                            │ events
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              NOTIFICATION LISTENERS                           │
│  notification.listeners.js                                    │
│  Subscribes to user/order/payment/product events              │
│  Creates Notification records with appropriate channels       │
└───────────────────────────┬──────────────────────────────────┘
                            │ createNotification()
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              NOTIFICATION SERVICE                             │
│  notification.service.js                                      │
│                                                                │
│  1. Render template (if templateId provided)                   │
│  2. Save Notification to MongoDB (status: pending)             │
│  3. Resolve recipient → user email/phone                       │
│  4. Mark in-app as delivered (immediate)                       │
│  5. Enqueue external channels to Bull queues                   │
└───────┬──────────┬──────────┬──────────┬─────────────────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
 ┌──────────┐┌──────────┐┌──────────┐┌──────────┐
 │ Email Q  ││  SMS Q   ││ Push Q   ││WhatsApp Q│  ← Bull + Redis
 │ 5 conc.  ││ 3 conc.  ││ 10 conc. ││ 2 conc.  │
 │ 3 retry  ││ 3 retry  ││ 3 retry  ││ 2 retry  │
 └────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘
      │           │           │           │
      ▼           ▼           ▼           ▼
 ┌──────────┐┌──────────┐┌──────────┐┌──────────┐
 │ Gmail    ││ Twilio   ││ FCM      ││ Meta     │  ← Providers
 │ SendGrid ││ AWS SNS  ││ Web Push ││ Twilio   │
 │ Mailgun  ││ TextLocal││          ││ WhatsApp │
 │ SMTP     ││          ││          ││          │
 └────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘
      │           │           │           │
      └───────────┴───────────┴───────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ WEBHOOK HANDLERS│
             │ /api/webhooks/* │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Update Delivery │
             │ Status + Analytics│
             └─────────────────┘
```

---

## Event → Notification Mapping

| Event | Channels | Priority | Notification |
|-------|----------|----------|-------------|
| **User Registered** | Email + In-App | Normal | Welcome message with profile CTA |
| **User Login (new IP)** | Email + In-App | Normal | Security alert with IP address |
| **Login Failed (3+ attempts)** | Email + SMS + In-App | **High** | Multiple failed attempts warning |
| **Account Locked** | Email + SMS + In-App | **Urgent** | Account locked notification |
| **Password Changed** | Email + In-App | Normal | Password change confirmation |
| **Email Verified** | Email + In-App | Normal | Verification success |
| **Order Created** | Email + In-App | Normal | Order confirmation with total |
| **Order Confirmed** | Email + In-App | Normal | Confirmed with delivery estimate |
| **Order Shipped** | Email + SMS + In-App | Normal | Tracking number and carrier |
| **Order Delivered** | Email + SMS + In-App | Normal | Delivery confirmation + review CTA |
| **Payment Success** | Email + In-App | Normal | Payment receipt |
| **Payment Failed** | Email + In-App | **High** | Failure reason + retry CTA |
| **Product Low Stock** | Email + In-App | Normal | Admin/seller inventory alert |
| **Product Out of Stock** | Email + In-App | Normal | Wishlist users notified |
| **Product Back in Stock** | Email + In-App | Normal | Wishlist users — "Buy Now" CTA |

---

## Queue System (Bull + Redis)

### Queue Configuration

| Queue | Concurrency | Retries | Backoff | Purpose |
|-------|-------------|---------|---------|---------|
| `notification:email` | 5 workers | 3 | Exponential (5s → 10s → 20s) | Email delivery |
| `notification:sms` | 3 workers | 3 | Exponential (5s → 10s → 20s) | SMS delivery |
| `notification:push` | 10 workers | 3 | Exponential (5s → 10s → 20s) | FCM + Web Push |
| `notification:whatsapp` | 2 workers | 2 | Exponential (5s → 10s) | WhatsApp (rate limited) |

### Priority Levels

| Priority | Bull Priority | Use Case |
|----------|--------------|----------|
| Urgent | 1 | Account locked, OTP |
| High | 2 | Payment failed, security alerts |
| Normal | 3 | Order confirmations, shipping updates |
| Low | 4 | Marketing, promotions |

### Job Lifecycle

```
Job Created → Waiting → Active → Completed
                           ↓ (on failure)
                        Failed → Delayed (backoff) → Active (retry)
                                                        ↓ (max retries)
                                                     Permanently Failed
```

---

## Data Models

### Notification

```
Notification {
  // Content
  title                 String (required)
  message               String (required)
  subject               String (for email)
  description           String

  // Routing
  recipient             ObjectId (ref: User, required, indexed)
  recipientType         enum: user | admin | seller | all
  type                  enum: order | payment | product | promotion | system |
                              security | review | inventory | shipping | account | general
  category              enum: info | success | warning | error | promotion | reminder | alert

  // Channels
  channels {
    email {
      enabled           Boolean
      sent              Boolean
      sentAt            Date
      delivered         Boolean
      deliveredAt       Date
      failed            Boolean
      error             String
      deliveryData      Mixed (provider-specific: emailId, jobId, etc.)
    }
    sms { ... same structure ... }
    push { ... + deviceTokens[] ... }
    inApp { ... + read/readAt ... }
    whatsapp { ... same structure ... }
  }

  // Priority & Scheduling
  priority              enum: low | normal | high | urgent
  scheduledAt           Date
  expiresAt             Date (TTL index)

  // Action
  actionUrl             String (deep link)
  actionText            String (CTA text)
  actionData            Mixed (custom payload)

  // Related Entity
  relatedEntity {
    type                enum: order | product | payment | user | review
    id                  ObjectId
  }

  // Template
  templateId            ObjectId (ref: NotificationTemplate)
  templateData          Mixed (template variables)

  // Status
  status                enum: pending | scheduled | processing | sent | delivered | failed | cancelled

  // Delivery Tracking
  deliveryAttempts      Number (default: 0)
  lastDeliveryAttempt   Date

  // Analytics
  opened                Boolean
  openedAt              Date
  clicked               Boolean
  clickedAt             Date
  dismissed             Boolean
  dismissedAt           Date

  // Metadata
  metadata {
    source              enum: system | admin | user | automated
    triggerEvent        String (e.g. "order_created")
    tags                String[]
  }

  timestamps            createdAt, updatedAt
}
```

### NotificationTemplate

```
NotificationTemplate {
  name                  String (unique, required)
  description           String
  type                  same 11 types as Notification
  category              same 7 categories

  // Content (with {{variable}} placeholders)
  subject               String
  title                 String (required)
  message               String (required)
  emailContent {
    html                String (HTML template)
    text                String (plain text fallback)
  }
  smsContent {
    message             String (max 160 chars)
  }
  pushContent {
    title, body, icon, image, actionUrl, actionText
  }

  // Variables
  variables [{
    name                String (required)
    type                enum: string | number | date | boolean | object
    required            Boolean
    defaultValue        Mixed
    description         String
  }]

  // Channel config
  channels {
    email/sms/push/inApp {
      enabled           Boolean
      required          Boolean
    }
  }

  // Settings
  priority              enum
  defaultExpiry         Number (days)
  autoSend              Boolean
  isActive              Boolean
  version               Number (auto-incremented)
  isDefault             Boolean (unique per type)

  // Usage
  usage {
    totalSent           Number
    lastUsed            Date
    successRate         Number (0-100)
  }
}
```

---

## Channel Services

### Email Service

| Provider | Config | Notes |
|----------|--------|-------|
| Gmail | `EMAIL_SERVICE=gmail, EMAIL_USER, EMAIL_PASSWORD` | App password required |
| SMTP | `EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD` | Any SMTP server |
| SendGrid | `EMAIL_SERVICE=sendgrid, EMAIL_API_KEY` | Via nodemailer |
| Mailgun | `EMAIL_SERVICE=mailgun, EMAIL_API_KEY` | Via nodemailer |

**Methods:** `sendEmail()`, `sendBulkEmails()`, `sendTemplateEmail()`, `validateEmailAddress()`

### SMS Service

| Provider | Config | Status |
|----------|--------|--------|
| Twilio | `SMS_PROVIDER=twilio, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER` | Fully implemented |
| AWS SNS | `SMS_PROVIDER=aws-sns` | Stub |
| TextLocal | `SMS_PROVIDER=textlocal` | Stub |

**Methods:** `sendSMS()`, `sendBulkSMS()`, `sendOTP()`, `sendTemplateSMS()`, `formatPhoneNumber()`, `getDeliveryStatus()`

**Built-in Templates:** welcome, orderConfirmation, otp, passwordReset, deliveryUpdate, paymentReminder

### Push Service

| Provider | Config |
|----------|--------|
| Firebase (FCM) | `PUSH_FIREBASE_ENABLED=true, FIREBASE_SERVICE_ACCOUNT, FIREBASE_DATABASE_URL` |
| Web Push | `PUSH_WEBPUSH_ENABLED=true, VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY` |

**Methods:** `sendPushNotification()`, `registerDeviceToken()`, `unregisterDeviceToken()`, `sendBulkPushNotifications()`

### WhatsApp Service

| Provider | Config |
|----------|--------|
| Meta Cloud API | `WHATSAPP_PROVIDER=meta, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_VERIFY_TOKEN` |
| Twilio WhatsApp | `WHATSAPP_PROVIDER=twilio, TWILIO_WHATSAPP_FROM=whatsapp:+14155238886` |

**Methods:** `sendMessage()`, `sendTemplate()`, `sendOrderConfirmation()`, `sendShippingUpdate()`, `sendDeliveryConfirmation()`, `sendOTP()`, `verifyWebhook()`, `parseWebhookPayload()`

---

## API Endpoints

Base path: `/api/notifications`

### User Routes (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get user's notifications (paginated, filterable) |
| GET | `/:notificationId` | Get single notification |
| PATCH | `/:notificationId/read` | Mark as read |
| PATCH | `/:notificationId/click` | Mark as clicked |
| PATCH | `/:notificationId/dismiss` | Mark as dismissed |
| PATCH | `/bulk/read` | Bulk mark as read |
| DELETE | `/bulk` | Bulk delete |
| GET | `/stats/overview` | Notification statistics |

### Admin Routes (admin only)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create notification |
| POST | `/:notificationId/send` | Send notification |
| GET | `/admin/all` | Get all notifications |
| PUT | `/:notificationId` | Update notification |
| DELETE | `/:notificationId` | Delete notification |
| POST | `/admin/process-scheduled` | Process scheduled notifications |
| POST | `/admin/retry-failed` | Retry failed notifications |
| POST | `/admin/cleanup-expired` | Cleanup expired |
| POST | `/admin/bulk-send` | Bulk send |

### Template Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/templates` | List templates (paginated) |
| GET | `/templates/:id` | Get template |
| GET | `/templates/type/:type` | Get by type |
| POST | `/templates` | Create template |
| PUT | `/templates/:id` | Update template |
| DELETE | `/templates/:id` | Delete template |
| POST | `/templates/:id/duplicate` | Clone template |
| POST | `/templates/:id/test` | Test template |
| GET | `/templates/stats/overview` | Template statistics |

### Webhook Endpoints

Base path: `/api/webhooks`

| Method | Path | Provider | Events |
|--------|------|----------|--------|
| POST | `/twilio/sms` | Twilio | delivered, failed, undelivered |
| POST | `/sendgrid/email` | SendGrid | delivered, open, click, bounce, dropped, spam_report |
| GET | `/whatsapp` | Meta | Webhook verification |
| POST | `/whatsapp` | Meta | sent, delivered, read, failed + incoming messages |

---

## Notification Flow (End-to-End Example)

```
1. Customer places order
   └→ checkout.service emits ORDER_CREATED { orderId, orderNumber, customerId, totalAmount }

2. Notification listener receives event
   └→ handleOrderCreated() calls notificationService.createNotification({
        recipient: customerId,
        type: "order",
        title: "Order Placed Successfully",
        message: "Your order #ORD17762778488380001 has been placed. Total: ₹1,770",
        channels: { email: { enabled: true }, inApp: { enabled: true } },
        priority: "normal",
        actionUrl: "/orders/68abc123...",
        actionText: "View Order",
      })

3. Notification service
   └→ Saves Notification to MongoDB (status: pending)
   └→ Calls sendNotification(notificationId)
   └→ Resolves recipient → { email: "john@example.com", phone: "9876543210" }
   └→ Marks in-app as delivered (immediate)
   └→ Calls enqueueNotification() → pushes to email queue

4. Email queue worker picks up job
   └→ emailService.sendEmail({
        to: "john@example.com",
        subject: "Order Placed Successfully",
        html: "<h2>Order Placed Successfully</h2><p>Your order #ORD... Total: ₹1,770</p>..."
      })
   └→ Updates notification.channels.email.sent = true

5. SendGrid webhook callback (later)
   └→ POST /api/webhooks/sendgrid/email
   └→ Event: "delivered" → updates notification.channels.email.delivered = true
   └→ Event: "open" → updates notification.openedAt
```

---

## Events Published

| Event | When | Payload |
|-------|------|---------|
| `notification.created` | Notification saved | notificationId, recipient, type, channels |
| `notification.sent` | Queued for delivery | notificationId, recipient, channelsQueued |
| `notification.delivered` | All channels delivered | notificationId, recipient |
| `notification.read` | User reads notification | notificationId, userId |
| `notification.clicked` | User clicks CTA | notificationId, actionUrl |
| `notification.dismissed` | User dismisses | notificationId, userId |
| `notification.failed` | Delivery failed | notificationId, error |
| `notification.expired` | TTL expired | notificationId |
| `notification.template.created` | Template created | templateId, name, type |
| `notification.template.updated` | Template updated | templateId, changes |
| `notification.template.deleted` | Template deleted | templateId |
| `notification.bulk.sent` | Bulk send completed | count, results |

---

## Environment Variables

```env
# Email
EMAIL_SERVICE=gmail|smtp|sendgrid|mailgun
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
EMAIL_FROM="ShopStream <noreply@shopstream.com>"
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_API_KEY=SG.xxx (for SendGrid)

# SMS
SMS_PROVIDER=twilio|aws-sns|textlocal
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890
SMS_DEFAULT_COUNTRY_CODE=+91

# Push
PUSH_FIREBASE_ENABLED=true
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
FIREBASE_DATABASE_URL=https://xxx.firebaseio.com
PUSH_WEBPUSH_ENABLED=true
VAPID_SUBJECT=mailto:admin@shopstream.com
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx

# WhatsApp
WHATSAPP_PROVIDER=meta|twilio
WHATSAPP_PHONE_NUMBER_ID=123456
WHATSAPP_ACCESS_TOKEN=EAABxxx
WHATSAPP_VERIFY_TOKEN=my-verify-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Redis (for Bull queues)
REDIS_URL=redis://localhost:6379

# Client URL (for email CTAs)
CLIENT_URL=http://localhost:3000
```

---

## File Reference

### Services

| File | Path |
|------|------|
| Notification Service | `server/src/modules/notification/services/notification.service.js` |
| Email Service | `server/src/modules/notification/services/email.service.js` |
| SMS Service | `server/src/modules/notification/services/sms.service.js` |
| Push Service | `server/src/modules/notification/services/push.service.js` |
| WhatsApp Service | `server/src/modules/notification/services/whatsapp.service.js` |

### Models

| File | Path |
|------|------|
| Notification Model | `server/src/modules/notification/models/Notification.model.js` |
| Template Model | `server/src/modules/notification/models/NotificationTemplate.model.js` |

### Events

| File | Path |
|------|------|
| Event Listeners | `server/src/modules/notification/events/notification.listeners.js` |
| Modular Listeners | `server/src/modules/notification/events/notification.listeners.modular.js` |
| Event Publisher | `server/src/modules/notification/events/publishers/NotificationEventPublisher.js` |
| Event Types | `server/src/shared/events/eventTypes.js` (NOTIFICATION_EVENTS) |
| Event Definitions | `server/src/shared/events/eventDefinitions.js` |

### Queue System

| File | Path |
|------|------|
| Notification Queues | `server/src/jobs/notificationQueue.js` |

### Routes & Controllers

| File | Path |
|------|------|
| Notification Routes | `server/src/modules/notification/routes/notification.routes.js` |
| Notification Controller | `server/src/modules/notification/controllers/notification.controller.js` |
| Template Controller | `server/src/modules/notification/controllers/template.controller.js` |

### Webhooks

| File | Path |
|------|------|
| Webhook Controller | `server/src/modules/notification/webhooks/webhook.controller.js` |
| Webhook Routes | `server/src/modules/notification/webhooks/webhook.routes.js` |
| Route Registration | `server/src/routes/index.js` (`/webhooks`) |

### Server

| File | Path |
|------|------|
| Graceful Shutdown | `server/server.js` (closeQueues on SIGINT/SIGTERM) |
