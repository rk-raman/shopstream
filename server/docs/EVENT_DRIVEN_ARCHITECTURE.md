# Event-Driven Architecture

> A deep-dive into how ShopStream's backend modules communicate through events, enabling decoupled, scalable, and observable systems.

---

## Table of Contents

1. [Why Events?](#why-events)
2. [Architecture Overview](#architecture-overview)
3. [Event Bus Layer](#event-bus-layer)
4. [Event Definitions & Payload Schemas](#event-definitions--payload-schemas)
5. [Publishers](#publishers)
6. [Subscribers](#subscribers)
7. [Initialization & Lifecycle](#initialization--lifecycle)
8. [Integration Patterns](#integration-patterns)
9. [Error Handling](#error-handling)
10. [Event Catalog](#event-catalog)
11. [End-to-End Walkthroughs](#end-to-end-walkthroughs)
12. [Background Jobs (Bull Queues)](#background-jobs-bull-queues)
13. [Kafka Roadmap](#kafka-roadmap)
14. [Best Practices & Conventions](#best-practices--conventions)

---

## Why Events?

Without events, modules would import each other directly:

```
OrderService.create()
  ├── NotificationService.sendEmail()    // tight coupling
  ├── InventoryService.decreaseStock()   // OrderService "knows" about inventory
  └── AnalyticsService.trackConversion() // hard to add/remove
```

With events, the order module just announces what happened:

```
OrderService.create()
  └── publish("order.created", { ... })  // fire and forget

// Elsewhere, independently:
NotificationSubscriber  ── listens to "order.created" ──> sends email
InventorySubscriber     ── listens to "order.created" ──> decreases stock
AnalyticsSubscriber     ── listens to "order.created" ──> tracks conversion
```

**Benefits:**
- Modules don't know about each other — add/remove subscribers without touching the publisher
- Side effects (emails, analytics) don't slow down the main operation
- Failed subscribers don't break the business operation
- Easy to test each piece in isolation

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Event Bus Layer                          │
│                                                                 │
│   ┌───────────────────┐        ┌───────────────────┐           │
│   │  EventBusInterface│◄───────│  EventBusFactory   │           │
│   │  (abstract)       │        │  (creates impl)    │           │
│   └────────┬──────────┘        └───────────────────┘           │
│            │                                                    │
│    ┌───────┴────────┐                                          │
│    │                │                                          │
│ ┌──▼──────────┐ ┌──▼──────┐                                   │
│ │EventEmitter │ │ KafkaBus│                                    │
│ │Bus (active) │ │ (future)│                                    │
│ └─────────────┘ └─────────┘                                    │
│                                                                 │
│   ┌───────────────────────────────────┐                        │
│   │      EventSystemManager           │                        │
│   │  (orchestrates init & cleanup)    │                        │
│   └───────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
          ▲ publish                          ▲ subscribe
          │                                  │
┌─────────┴──────────┐           ┌───────────┴──────────┐
│     Publishers      │           │     Subscribers       │
│                     │           │                       │
│ UserEventPublisher  │           │ UserNotification      │
│ ProductEventPublisher│          │ UserAnalytics         │
│ OrderEventPublisher │           │ OrderAnalytics        │
│ PaymentEventPublisher│          │ ProductCache          │
│ CartEventPublisher  │           │ ProductSearch         │
│ NotificationPublisher│          │ PaymentNotification   │
│ UploadEventPublisher│           │ ...and more           │
└─────────────────────┘           └───────────────────────┘
```

**Key files:**

| File | Purpose |
| ---- | ------- |
| `src/shared/events/EventBusInterface.js` | Abstract base class defining the contract |
| `src/shared/events/EventBusFactory.js` | Creates the right bus implementation |
| `src/shared/events/EventEmitterBus.js` | In-memory implementation (current) |
| `src/shared/events/KafkaBus.js` | Kafka implementation (placeholder) |
| `src/shared/events/EventSystemManager.js` | Startup/shutdown orchestrator |
| `src/shared/events/eventDefinitions.js` | All event names, categories, and schemas |
| `src/shared/events/eventEmitter.js` | Legacy wrapper for backward compatibility |

---

## Event Bus Layer

### EventBusInterface (Abstract Contract)

Every event bus implementation must provide:

```javascript
class EventBusInterface {
  async publish(eventType, data, options)    // Emit an event
  async subscribe(eventType, handler, options) // Listen for an event
  async unsubscribe(subscriptionId)          // Remove a listener
  async initialize()                         // Setup connections
  async shutdown()                           // Cleanup
  getHealth()                                // Return bus health status
}
```

### EventEmitterBus (Current Implementation)

The active implementation wraps Node.js `EventEmitter`:

- **Event IDs:** Each published event gets a unique ID: `evt_{timestamp}_{randomString}`
- **Subscription tracking:** All subscriptions stored in a `Map` for cleanup
- **Max listeners:** Configurable (default 50) to prevent memory leaks
- **Error isolation:** Each handler is wrapped so failures don't crash others
- **Error events:** Failed handlers emit `event_handler_error` for monitoring

```
publish("order.created", payload)
    │
    ├── Generate event ID: evt_1712847600_abc123
    ├── Wrap payload with metadata: { id, timestamp, type, data }
    └── eventEmitter.emit("order.created", wrappedPayload)
            │
            ├── Handler 1 (notification) ── runs async, errors caught
            ├── Handler 2 (analytics)    ── runs async, errors caught
            └── Handler 3 (inventory)    ── runs async, errors caught
```

### EventBusFactory

Reads `EVENT_BUS_TYPE` env var and returns the right implementation:

| Value | Implementation | Use Case |
| ----- | -------------- | -------- |
| `eventemitter` (default) | EventEmitterBus | Single-process, development, small-scale |
| `kafka` | KafkaBus | Distributed, multi-service, production-scale |

```javascript
const bus = EventBusFactory.createAndInitialize({ type: "eventemitter" });
```

---

## Event Definitions & Payload Schemas

**Location:** `src/shared/events/eventDefinitions.js`

Every event is defined with a **name**, **category**, and **schema**. The schema describes the expected payload structure.

### Schema Example

```javascript
USER_REGISTERED: {
  name: "user.registered",
  category: "user",
  schema: {
    userId: "string",
    email: "string",
    firstName: "string",
    lastName: "string",
    role: "string",
    registrationMethod: "string",   // "email", "google", "facebook"
    timestamp: "string",            // ISO 8601
    metadata: {
      userAgent: "string",
      ipAddress: "string",
      referrer: "string"
    }
  }
}
```

### Payload Validation

Before publishing, every payload is validated against its schema:

```javascript
validateEventPayload(eventName, payload)
```

- Recursively validates all fields
- Checks types: `string`, `number`, `object`, `array`
- Handles nested objects
- Throws detailed errors with field paths on mismatch

### Naming Convention

Events follow `{module}.{action}` dot notation:

```
user.registered
user.logged_in
order.created
order.shipped
payment.successful
cart.item_added
notification.sent
```

Derivative/secondary events use a prefix:

```
analytics.user_registered     ← derived from user.registered
notification.send_email       ← triggered by various primary events
```

---

## Publishers

Each module has a **Publisher** class responsible for formatting, validating, and publishing events from that module.

**Location:** `src/modules/{module}/events/publishers/{Module}EventPublisher.js`

### Common Publisher Pattern

```javascript
class ModuleEventPublisher {
  static async publishSomeEvent(data) {
    // 1. Normalize data (e.g., _id → userId)
    const userId = data._id?.toString() || data.userId;

    // 2. Build payload matching the schema
    const payload = {
      userId,
      email: data.email,
      timestamp: new Date().toISOString(),
      metadata: { userAgent, ipAddress, referrer }
    };

    // 3. Validate against schema
    validateEventPayload("user.registered", payload);

    // 4. Publish to event bus
    await eventBus.publish("user.registered", payload);
  }
}
```

### Publisher Inventory

| Publisher | Methods | Key Events |
| --------- | ------- | ---------- |
| **UserEventPublisher** | 20+ | `user.registered`, `user.logged_in`, `user.logged_out`, `user.login_failed`, `user.account_locked`, `user.password_changed`, `user.email_verified`, `user.avatar_updated` |
| **ProductEventPublisher** | 30+ | `product.created`, `product.updated`, `product.deleted`, `product.viewed`, `product.stock_updated`, `product.price_changed`, `product.review_added`, `product.variant_added` |
| **OrderEventPublisher** | 25+ | `order.created`, `order.confirmed`, `order.shipped`, `order.delivered`, `order.cancelled`, `order.return_requested`, `order.inventory_reserved` |
| **PaymentEventPublisher** | 25+ | `payment.initiated`, `payment.successful`, `payment.failed`, `payment.refunded`, `payment.disputed`, `payment.fraud_detected`, `payment.webhook_received` |
| **CartEventPublisher** | 14 | `cart.item_added`, `cart.item_removed`, `cart.cleared`, `cart.abandoned`, `cart.recovered`, `cart.coupon_applied`, `cart.checkout_initiated` |
| **NotificationEventPublisher** | 11 | `notification.created`, `notification.sent`, `notification.delivered`, `notification.read`, `notification.failed` |
| **UploadEventPublisher** | 18 | `upload.uploaded`, `upload.deleted`, `upload.transformed`, `upload.accessed` |

### Smart Publishing

Some publishers trigger derived events automatically:

```
ProductEventPublisher.publishStockUpdated({ quantity: 3, threshold: 5 })
    │
    ├── publish("product.stock_updated", ...)
    └── if (quantity <= threshold)
          └── publish("product.low_stock", ...)   ← auto-derived
```

---

## Subscribers

Subscribers listen for events and perform side-effect actions. Each subscriber focuses on a single concern (notifications, analytics, cache invalidation, etc.).

**Location:** `src/modules/{module}/events/subscribers/`

### Subscriber Pattern

```javascript
class UserNotificationSubscriber {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.subscriptionIds = [];        // track for cleanup
  }

  async initialize() {
    // Register all listeners
    const id1 = await this.eventBus.subscribe(
      "user.registered",
      this.handleUserRegistered.bind(this)
    );
    this.subscriptionIds.push(id1);
    // ... more subscriptions
  }

  async handleUserRegistered(event) {
    try {
      // Send welcome email
      await this.eventBus.publish("notification.send_email", {
        to: event.data.email,
        type: "welcome",
        ...
      });
      // Send verification email
      await this.eventBus.publish("notification.send_email", {
        to: event.data.email,
        type: "email_verification",
        ...
      });
    } catch (error) {
      console.error("Failed to handle user.registered:", error);
      // Error is caught — doesn't affect user registration
    }
  }

  async cleanup() {
    for (const id of this.subscriptionIds) {
      await this.eventBus.unsubscribe(id);
    }
  }
}
```

### Subscriber Inventory

#### User Module Subscribers

| Subscriber | Listens To | Actions |
| ---------- | ---------- | ------- |
| **UserNotificationSubscriber** | `user.registered`, `user.login_failed`, `user.account_locked`, `user.password_changed`, `user.email_verified`, `user.phone_verified`, `user.deactivated`, `user.role_changed` | Sends welcome emails, security alerts, verification confirmations, account status notifications |
| **UserAnalyticsSubscriber** | 15+ user events | Publishes `analytics.*` events for registration source, login patterns, verification rates, security incidents |
| **UserMarketingSubscriber** | Registration, profile completion, preferences | Triggers marketing campaign enrollments |

#### Order Module Subscribers

| Subscriber | Listens To | Actions |
| ---------- | ---------- | ------- |
| **OrderAnalyticsSubscriber** | `order.created`, `order.confirmed`, `order.shipped`, `order.delivered`, `order.cancelled`, payment events, returns | Records revenue metrics (potential → actual → lost), calculates fulfillment & delivery times, tracks seller performance, updates conversion funnels |

#### Other Module Subscribers (Ready to Activate)

| Subscriber | Concern |
| ---------- | ------- |
| ProductAnalyticsSubscriber | View counts, search tracking, wishlist analytics |
| ProductCacheSubscriber | Invalidate cached product data on updates |
| ProductInventorySubscriber | Stock adjustments on order events |
| ProductNotificationSubscriber | Seller alerts for reviews, low stock |
| ProductSearchSubscriber | Update Elasticsearch index on changes |
| CartAnalyticsSubscriber | Abandonment tracking, conversion metrics |
| CartCacheSubscriber | Cache invalidation for cart state |
| CartNotificationSubscriber | Abandoned cart reminder emails |
| PaymentAnalyticsSubscriber | Revenue tracking, gateway performance |
| PaymentNotificationSubscriber | Receipt emails, failure alerts |
| UploadAnalyticsSubscriber | Storage usage, upload frequency tracking |

### Subscriber Manager Pattern

Each module groups its subscribers under a **SubscriberManager**:

```javascript
class UserSubscriberManager {
  constructor(eventBus) {
    this.notificationSubscriber = new UserNotificationSubscriber(eventBus);
    this.analyticsSubscriber = new UserAnalyticsSubscriber(eventBus);
    this.marketingSubscriber = new UserMarketingSubscriber(eventBus);
  }

  async initialize() {
    await Promise.all([               // Initialize all in parallel
      this.notificationSubscriber.initialize(),
      this.analyticsSubscriber.initialize(),
      this.marketingSubscriber.initialize(),
    ]);
  }

  async cleanup() { /* cleanup all */ }
  healthCheck() { /* check all */ }
}
```

---

## Initialization & Lifecycle

### Startup Sequence

```
server.js
  │
  └── EventSystemManager.initialize()
        │
        ├── 1. Create event bus via EventBusFactory
        │      └── Reads EVENT_BUS_TYPE env → creates EventEmitterBus
        │
        ├── 2. Initialize event bus
        │      └── Sets up EventEmitter, max listeners, error handling
        │
        └── 3. Initialize module listeners (in order)
               │
               ├── User Module
               │     └── user.listeners.modular.js
               │           └── initializeUserEventListeners()
               │                 └── UserSubscriberManager.initialize()
               │                       ├── UserNotificationSubscriber
               │                       ├── UserAnalyticsSubscriber
               │                       └── UserMarketingSubscriber
               │
               └── Notification Module
                     └── initializeNotificationEventListeners()
```

### Shutdown Sequence

```
SIGINT / SIGTERM
  │
  └── EventSystemManager.cleanup()
        │
        ├── 1. Cleanup each module's listeners
        │      └── SubscriberManager.cleanup()
        │            └── Unsubscribe all subscription IDs
        │
        └── 2. Shutdown event bus
               └── eventBus.shutdown()
```

### Currently Active vs. Pending Modules

| Module | Status |
| ------ | ------ |
| User | Active |
| Notification | Active |
| Product | Ready (commented out) |
| Order | Ready (commented out) |
| Payment | Ready (commented out) |
| Cart | Ready (commented out) |
| Inventory | Ready (commented out) |
| Review | Ready (commented out) |
| Analytics | Ready (commented out) |

To activate a module, uncomment its entry in `EventSystemManager.initialize()`.

---

## Integration Patterns

### How Services Publish Events

Events are published from the **service layer** after the business operation succeeds:

```javascript
// In OrderService.create()
async createOrder(orderData) {
  // 1. Business logic
  const order = await Order.create(orderData);

  // 2. Publish event (fire-and-forget)
  await OrderEventPublisher.publishOrderCreated({
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerId: order.customer,
    items: order.items,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    status: order.status
  });

  // 3. Return result (doesn't wait for subscribers)
  return order;
}
```

### Event Chaining

Subscribers can publish new events, creating chains:

```
user.registered
    │
    ├── UserNotificationSubscriber
    │     ├── publish("notification.send_email", { type: "welcome" })
    │     └── publish("notification.send_email", { type: "email_verification" })
    │
    └── UserAnalyticsSubscriber
          ├── publish("analytics.user_registered", { ... })
          └── publish("analytics.registration_source", { ... })
```

**Infinite loop prevention:** Derivative events use distinct names (`analytics.*`, `notification.*`) that the original publisher doesn't listen to.

### Metadata Standard

All major events include a `metadata` object for tracing and auditing:

```javascript
{
  metadata: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    source: "web",           // web, mobile, api
    reason: "user_initiated", // for status changes
    timestamp: "2026-04-11T10:30:00.000Z"
  }
}
```

---

## Error Handling

### Handler-Level Isolation

Each subscriber handler is wrapped by the EventEmitterBus so a failure in one handler does not affect others:

```
publish("order.created")
    │
    ├── NotificationSubscriber.handle()  ✅ Success
    ├── AnalyticsSubscriber.handle()     ❌ Throws Error
    │     └── Error logged, "event_handler_error" emitted
    └── InventorySubscriber.handle()     ✅ Still runs (not affected)
```

### Error Event

When a handler fails, the bus emits a monitoring event:

```javascript
{
  eventType: "order.created",
  subscriptionId: "sub_123",
  error: "Cannot read property 'amount' of undefined",
  stack: "Error: ...",
  timestamp: "2026-04-11T10:30:00.000Z"
}
```

You can subscribe to `event_handler_error` for alerting/monitoring.

### Subscriber-Level Try-Catch

Every subscriber method has its own try-catch as a second safety net:

```javascript
async handleOrderCreated(event) {
  try {
    await this.recordMetric("orders.created", event.data);
  } catch (error) {
    console.error("OrderAnalytics: failed to record metric:", error);
    // Swallow error — order creation is not affected
  }
}
```

### What's NOT Handled Yet

| Gap | Impact | Future Fix |
| --- | ------ | ---------- |
| No retry logic | Failed handlers don't retry | Bull queue with retry policy |
| No dead-letter queue | Unparseable events are lost | DLQ with Kafka |
| No circuit breaker | Cascading failures possible | Circuit breaker pattern |

---

## Event Catalog

### User Events (19+)

| Event Name | Trigger | Key Payload Fields |
| ---------- | ------- | ------------------ |
| `user.registered` | New user signs up | userId, email, firstName, lastName, role, registrationMethod |
| `user.logged_in` | Successful login | userId, email, loginMethod, device |
| `user.logged_out` | User logs out | userId, sessionDuration |
| `user.login_failed` | Bad credentials | email, attemptCount, reason |
| `user.account_locked` | Too many failed logins | userId, lockReason, lockDuration |
| `user.updated` | Profile edit | userId, updatedFields[] |
| `user.profile_completed` | All required fields filled | userId, completionPercentage |
| `user.avatar_updated` | New avatar uploaded | userId, avatarUrl |
| `user.password_changed` | Password change | userId, changeMethod |
| `user.email_verified` | Email confirmed | userId, email |
| `user.phone_verified` | Phone confirmed | userId, phone |
| `user.two_factor_enabled` | 2FA activated | userId, method |
| `user.two_factor_disabled` | 2FA deactivated | userId |
| `user.address_added` | New address | userId, addressId, type |
| `user.address_updated` | Address edited | userId, addressId |
| `user.address_deleted` | Address removed | userId, addressId |
| `user.wishlist_item_added` | Product wishlisted | userId, productId |
| `user.wishlist_item_removed` | Removed from wishlist | userId, productId |
| `user.activated` | Account activated | userId, activatedBy |
| `user.deactivated` | Account deactivated | userId, reason |
| `user.deleted` | Account deleted | userId |
| `user.role_changed` | Role update | userId, oldRole, newRole |
| `user.activity_tracked` | Any tracked activity | userId, activityType, details |

### Product Events (20+)

| Event Name | Trigger | Key Payload Fields |
| ---------- | ------- | ------------------ |
| `product.created` | New product listed | productId, sellerId, name, price, category |
| `product.updated` | Product edited | productId, updatedFields[] |
| `product.deleted` | Product removed | productId, sellerId |
| `product.approved` | Admin approves listing | productId, approvedBy |
| `product.rejected` | Admin rejects listing | productId, reason |
| `product.viewed` | Product page visited | productId, userId, source |
| `product.stock_updated` | Stock level changed | productId, oldQuantity, newQuantity |
| `product.low_stock` | Below threshold | productId, quantity, threshold |
| `product.out_of_stock` | Zero stock | productId, sellerId |
| `product.price_changed` | Price updated | productId, oldPrice, newPrice |
| `product.discount_applied` | Discount set | productId, discountPercentage |
| `product.discount_removed` | Discount removed | productId |
| `product.review_added` | New review | productId, reviewId, rating |
| `product.review_updated` | Review edited | productId, reviewId |
| `product.review_deleted` | Review removed | productId, reviewId |
| `product.variant_added` | New variant | productId, variantId |
| `product.variant_updated` | Variant edited | productId, variantId |
| `product.variant_deleted` | Variant removed | productId, variantId |
| `product.bulk_updated` | Batch update | productIds[], updatedFields |
| `product.searched` | Search performed | query, filters, resultCount |

### Order Events (20+)

| Event Name | Trigger | Key Payload Fields |
| ---------- | ------- | ------------------ |
| `order.created` | New order placed | orderId, orderNumber, customerId, items[], totalAmount, paymentMethod |
| `order.confirmed` | Order confirmed | orderId, confirmedAt |
| `order.processing` | Being prepared | orderId |
| `order.shipped` | Shipped out | orderId, trackingNumber, carrier, estimatedDelivery |
| `order.delivered` | Delivered | orderId, deliveredAt, deliveryTime |
| `order.cancelled` | Cancelled | orderId, reason, cancelledBy |
| `order.return_requested` | Return initiated | orderId, items[], reason |
| `order.return_approved` | Return accepted | orderId, refundAmount |
| `order.return_rejected` | Return denied | orderId, reason |
| `order.payment_initiated` | Payment started | orderId, paymentId, gateway |
| `order.payment_successful` | Payment cleared | orderId, paymentId, transactionId |
| `order.payment_failed` | Payment failed | orderId, paymentId, failureReason |
| `order.refunded` | Refund processed | orderId, refundAmount |
| `order.tracking_updated` | New tracking info | orderId, trackingNumber, status |
| `order.inventory_reserved` | Stock reserved | orderId, items[] |
| `order.inventory_released` | Stock released (cancel) | orderId, items[] |

### Payment Events (24+)

| Event Name | Trigger | Key Payload Fields |
| ---------- | ------- | ------------------ |
| `payment.initiated` | Payment flow started | paymentId, orderId, amount, currency, gateway |
| `payment.processing` | Being processed | paymentId, gateway |
| `payment.successful` | Payment cleared | paymentId, transactionId, amount |
| `payment.failed` | Payment failed | paymentId, failureCode, failureMessage |
| `payment.canceled` | User cancelled | paymentId |
| `payment.refunded` | Full refund | paymentId, refundAmount |
| `payment.partially_refunded` | Partial refund | paymentId, refundAmount, remainingAmount |
| `payment.captured` | Funds captured | paymentId, capturedAmount |
| `payment.requires_action` | 3DS / OTP needed | paymentId, actionType, actionUrl |
| `payment.disputed` | Chargeback filed | paymentId, disputeId, reason |
| `payment.dispute_resolved` | Dispute settled | paymentId, disputeId, resolution |
| `payment.webhook_received` | Gateway webhook hit | gateway, eventType, rawPayload |
| `payment.webhook_processed` | Webhook handled | gateway, eventType, result |
| `payment.risk_assessed` | Risk evaluation done | paymentId, riskScore, riskLevel |
| `payment.fraud_detected` | Fraud flagged | paymentId, riskScore, indicators[], action |
| `payment.method_saved` | Card/wallet saved | userId, methodId, type |
| `payment.method_deleted` | Saved method removed | userId, methodId |

### Cart Events (13)

| Event Name | Trigger | Key Payload Fields |
| ---------- | ------- | ------------------ |
| `cart.item_added` | Add to cart | cartId, userId, productId, variantId, quantity, price |
| `cart.item_removed` | Remove from cart | cartId, userId, productId |
| `cart.quantity_updated` | Change quantity | cartId, productId, oldQty, newQty |
| `cart.created` | New cart | cartId, userId |
| `cart.updated` | Cart modified | cartId, totalItems, totalPrice |
| `cart.cleared` | Cart emptied | cartId, userId, itemCount |
| `cart.synchronized` | Cart synced (login) | cartId, userId |
| `cart.abandoned` | No activity timeout | cartId, userId, abandonDuration, cartValue |
| `cart.recovered` | User returns | cartId, userId |
| `cart.checkout_initiated` | Checkout started | cartId, userId, totalAmount |
| `cart.coupon_applied` | Coupon added | cartId, couponCode, discountAmount |
| `cart.coupon_removed` | Coupon removed | cartId, couponCode |
| `cart.coupon_expired` | Coupon expired | cartId, couponCode |

### Notification Events (15+)

| Event Name | Trigger | Key Payload Fields |
| ---------- | ------- | ------------------ |
| `notification.created` | Notification generated | notificationId, recipientId, type, channel |
| `notification.sent` | Dispatched to provider | notificationId, channel, provider |
| `notification.delivered` | Confirmed delivered | notificationId, deliveredAt |
| `notification.read` | User read it | notificationId, readAt |
| `notification.clicked` | User clicked action | notificationId, actionUrl |
| `notification.dismissed` | User dismissed | notificationId |
| `notification.failed` | Send failed | notificationId, channel, error |
| `notification.expired` | TTL reached | notificationId |
| `notification.template_created` | New template | templateId, name, channels[] |
| `notification.template_updated` | Template edited | templateId |
| `notification.template_deleted` | Template removed | templateId |

### Upload Events (18)

| Event Name | Trigger | Key Payload Fields |
| ---------- | ------- | ------------------ |
| `upload.uploaded` | File uploaded | uploadId, uploaderId, provider, url, size |
| `upload.failed` | Upload failed | uploaderId, error, fileType |
| `upload.deleted` | File removed | uploadId, provider |
| `upload.viewed` | File accessed | uploadId, viewerId |
| `upload.downloaded` | File downloaded | uploadId, downloaderId |
| `upload.transformed` | Image transformed | uploadId, transformations |
| `upload.transform_failed` | Transform failed | uploadId, error |

---

## End-to-End Walkthroughs

### Walkthrough 1: User Registration

```
Client ── POST /api/users/register ──> AuthController.register()
                                            │
                                       AuthService.register()
                                            │
                                            ├── 1. Hash password (bcrypt)
                                            ├── 2. Create User in MongoDB
                                            ├── 3. Generate token pair (JWT)
                                            │
                                            └── 4. UserEventPublisher.publishUserRegistered()
                                                      │
                                                      ├── Validate payload against schema
                                                      └── publish("user.registered", {
                                                            userId, email, firstName,
                                                            lastName, role, metadata
                                                          })
                                                            │
                              ┌──────────────────────────────┤
                              │                              │
                   UserNotificationSubscriber      UserAnalyticsSubscriber
                              │                              │
                   ├── publish("notification.       ├── publish("analytics.
                   │    send_email", {               │    user_registered")
                   │    type: "welcome"})            │
                   │                                 └── publish("analytics.
                   └── publish("notification.             registration_source")
                        send_email", {
                        type: "email_verification"})
```

### Walkthrough 2: Order Lifecycle

```
Step 1: Order Created
─────────────────────
OrderService.create()
  └── publish("order.created")
        ├── OrderAnalyticsSubscriber ──> record potential revenue, track conversion
        ├── InventorySubscriber ──> reserve stock (order.inventory_reserved)
        └── NotificationSubscriber ──> send order confirmation email

Step 2: Payment Processed
─────────────────────────
PaymentService.processPayment()
  └── publish("payment.successful")
        ├── OrderAnalyticsSubscriber ──> record payment metric
        └── PaymentNotificationSubscriber ──> send receipt email

Step 3: Order Shipped
─────────────────────
OrderService.shipOrder()
  └── publish("order.shipped")
        ├── OrderAnalyticsSubscriber ──> calculate fulfillment time
        └── NotificationSubscriber ──> send shipping notification with tracking

Step 4: Order Delivered
───────────────────────
OrderService.deliverOrder()
  └── publish("order.delivered")
        ├── OrderAnalyticsSubscriber ──> convert potential → actual revenue
        │                                calculate delivery time
        └── NotificationSubscriber ──> send delivery confirmation

Step 4 (alt): Order Cancelled
─────────────────────────────
OrderService.cancelOrder()
  └── publish("order.cancelled")
        ├── OrderAnalyticsSubscriber ──> record lost revenue
        ├── InventorySubscriber ──> release reserved stock
        ├── PaymentSubscriber ──> initiate refund
        └── NotificationSubscriber ──> send cancellation email
```

### Walkthrough 3: Cart Abandonment

```
CartService.addItem()
  └── publish("cart.item_added")
        └── CartAnalyticsSubscriber ──> track add-to-cart event

  ... time passes with no activity ...

Background Job / Scheduler
  └── publish("cart.abandoned", { cartId, userId, abandonDuration, cartValue })
        ├── CartNotificationSubscriber ──> send abandoned cart email
        └── CartAnalyticsSubscriber ──> track abandonment rate

User returns
  └── publish("cart.recovered")
        └── CartAnalyticsSubscriber ──> track recovery rate
```

---

## Background Jobs (Bull Queues)

Bull queues complement the event system for operations that need **retry logic**, **scheduling**, or **rate control**.

**Location:** `src/jobs/`

| Queue | Purpose | Triggered By |
| ----- | ------- | ------------ |
| `emailQueue` | Async email delivery with retries | `notification.send_email` events |
| `inventoryUpdate` | Batch stock adjustments | `order.created`, `order.cancelled` events |
| `analyticsProcessor` | Aggregate analytics events | `analytics.*` events |

All queues are **Redis-backed** via Bull, providing:
- Automatic retries with exponential backoff
- Job prioritization
- Delayed/scheduled jobs
- Failed job tracking

> **Note:** These queue files are currently stubs. The event system handles operations directly for now. Queues will be populated as the platform scales.

---

## Kafka Roadmap

The architecture is designed for a migration from in-memory EventEmitter to Kafka when the platform needs:

| Need | EventEmitter | Kafka |
| ---- | ------------ | ----- |
| Multi-process | No | Yes |
| Message persistence | No | Yes (configurable retention) |
| Consumer groups | No | Yes (parallel consumers) |
| Replay events | No | Yes (offset reset) |
| Ordering guarantees | Per-process | Per-partition |
| Horizontal scaling | No | Yes |

### Migration path

1. The `EventBusInterface` abstraction is already in place
2. `KafkaBus` class exists with placeholder implementation
3. Topic convention: `{module}-events` (e.g., `user-events`, `order-events`)
4. Switch by changing `EVENT_BUS_TYPE=kafka` in `.env`
5. Configure brokers in `src/config/kafka.js`
6. **Zero changes needed** in publishers or subscribers — they talk to the interface, not the implementation

---

## Best Practices & Conventions

### For Publishers

| Rule | Why |
| ---- | --- |
| Always validate payloads before publishing | Catch bad data at the source, not in 5 different subscribers |
| Normalize IDs (`_id` → `userId`) | Consistent payloads across the system |
| Include `timestamp` in ISO 8601 | Enables time-series analysis and debugging |
| Include `metadata` (userAgent, IP) | Enables audit trails |
| Publish **after** the DB write succeeds | Don't announce events that didn't actually happen |
| Keep payloads flat where possible | Easier to validate, log, and debug |

### For Subscribers

| Rule | Why |
| ---- | --- |
| Always wrap handlers in try-catch | A failed subscriber must not break the business operation |
| Keep handlers lightweight | Heavy work belongs in Bull queues |
| Track subscription IDs | Required for proper cleanup on shutdown |
| Use distinct event names for derivatives | Prevents infinite event loops |
| Don't rely on handler execution order | Multiple handlers for the same event run independently |

### Naming

| Convention | Example |
| ---------- | ------- |
| Event names | `{module}.{past_tense_action}` — `order.created`, `payment.refunded` |
| Derivative events | `{concern}.{module}_{action}` — `analytics.user_registered` |
| Publisher class | `{Module}EventPublisher` |
| Subscriber class | `{Module}{Concern}Subscriber` |
| Manager class | `{Module}SubscriberManager` |

### Adding a New Event

1. Define the event in `src/shared/events/eventDefinitions.js` with name, category, and schema
2. Add a publish method to the appropriate `{Module}EventPublisher`
3. Create subscriber(s) in `src/modules/{module}/events/subscribers/`
4. Register the subscriber in the module's `SubscriberManager`
5. Ensure the module is listed in `EventSystemManager.initialize()`

### Adding a New Module to the Event System

1. Create `src/modules/{module}/events/publishers/{Module}EventPublisher.js`
2. Create `src/modules/{module}/events/subscribers/` directory with subscriber classes
3. Create `src/modules/{module}/events/{module}.listeners.modular.js` with `initialize{Module}EventListeners()` and `cleanup{Module}EventListeners()`
4. Add the module name to the modules array in `EventSystemManager`

---

*This document reflects the architecture as of the current codebase state. When in doubt, the code is the source of truth.*
