# Payment Module

## Overview

The Payment module manages all payment processing including payment intent creation, confirmation, refunds, and webhook handling. It implements the **adapter pattern** to support multiple payment gateways (Stripe, Razorpay, PayPal) and provides saved payment method management.

## Architecture

```
server/src/modules/payment/
├── controllers/
│   └── payment.controller.js     # Payment HTTP endpoint handlers
├── models/
│   ├── Payment.model.js          # Payment transaction record
│   ├── PaymentMethod.model.js    # Saved payment methods
│   └── index.js                  # Model exports
├── services/
│   ├── payment.service.js        # Payment orchestration logic
│   ├── stripe.service.js         # Stripe-specific integration
│   ├── razorpay.service.js       # Razorpay-specific integration
│   └── gateways/
│       ├── StripeAdapter.js      # Stripe gateway adapter
│       └── PayPalAdapter.js      # PayPal gateway adapter
├── routes/
│   └── payment.routes.js         # Route definitions
├── validators/
│   └── payment.validators.js     # Input validation schemas
├── events/
│   ├── payment.events.js         # Event type definitions
│   ├── payment.listeners.js      # Event listener registration
│   ├── publishers/
│   │   └── PaymentEventPublisher.js
│   └── subscribers/
│       ├── PaymentNotificationSubscriber.js # Payment receipts
│       ├── PaymentAnalyticsSubscriber.js    # Revenue tracking
│       ├── PaymentCacheSubscriber.js        # Cache updates
│       └── index.js
└── index.js                      # Module exports
```

## Data Models

### Payment Model

| Field                | Type     | Description                                |
|----------------------|----------|--------------------------------------------|
| `paymentId`          | String   | Unique payment identifier                  |
| `orderId`            | ObjectId | Reference to Order                         |
| `userId`             | ObjectId | Reference to User                          |
| `gateway`            | String   | `stripe`, `paypal`, `razorpay`, `square`, `manual` |
| `gatewayTransactionId`| String  | Gateway-specific transaction ID            |
| `paymentIntentId`    | String   | Stripe payment intent ID                   |
| `paymentMethod.type` | String   | `card`, `bank_transfer`, `wallet`, `upi`, `cash` |
| `paymentMethod.details`| Object | Masked card details (last4, brand, etc.)  |
| `amount`             | Number   | Payment amount                             |
| `currency`           | String   | Currency code (e.g., INR, USD)             |
| `status`             | String   | Payment status (see below)                 |
| `refundAmount`       | Number   | Refunded amount (if applicable)            |

### Payment Statuses

```
created -> processing -> completed
              |              |
              +-> failed     +-> refunded
              |              |
              +-> cancelled  +-> partial_refund
```

### PaymentMethod Model (Saved Methods)

Stores tokenized payment methods for returning customers, including masked card details, expiry, and default flag.

## API Endpoints

### Payment Routes (`/api/v1/payments`)

| Method | Endpoint                         | Auth    | Description                      |
|--------|----------------------------------|---------|----------------------------------|
| POST   | `/webhook/:gateway`              | Public  | Payment gateway webhook          |
| GET    | `/options`                       | Public  | Get supported payment options    |
| POST   | `/intent`                        | User    | Create payment intent            |
| POST   | `/:paymentId/confirm`            | User    | Confirm payment                  |
| GET    | `/:paymentId`                    | User    | Get payment details              |
| POST   | `/:paymentId/cancel`             | User    | Cancel payment                   |
| POST   | `/:paymentId/retry`              | User    | Retry failed payment             |
| GET    | `/`                              | User    | Get own payments (paginated)     |
| GET    | `/order/:orderId`                | User    | Get payments for an order        |
| GET    | `/methods/saved`                 | User    | Get saved payment methods        |
| POST   | `/methods/save`                  | User    | Save a payment method            |
| DELETE | `/methods/:paymentMethodId`      | User    | Delete saved payment method      |
| GET    | `/admin/all`                     | Admin   | All payments (paginated)         |
| GET    | `/admin/stats`                   | Admin   | Payment statistics & revenue     |
| GET    | `/admin/user/:userId`            | Admin   | Payments by specific user        |
| POST   | `/admin/:paymentId/refund`       | Admin   | Process refund                   |
| PATCH  | `/admin/:paymentId/status`       | Admin   | Manually update payment status   |

## Payment Flow

### Standard Payment Flow

```
1. Client calls POST /payments/intent
   -> Creates payment intent on gateway (e.g., Stripe PaymentIntent)
   -> Returns client_secret for frontend SDK

2. Client uses gateway SDK to complete payment
   -> Stripe.js / Razorpay checkout handles card input

3. Gateway sends webhook to POST /payments/webhook/:gateway
   -> Webhook signature verified
   -> Payment status updated in database
   -> Order status updated

4. Client calls POST /payments/:paymentId/confirm (backup)
   -> Verifies payment completed on gateway
   -> Updates local records
```

### Refund Flow

```
1. Admin initiates POST /admin/:paymentId/refund
2. Refund request sent to gateway
3. Gateway processes refund (may take 5-10 business days)
4. Webhook confirms refund completion
5. Payment status updated to 'refunded' or 'partial_refund'
6. Order status updated accordingly
```

## Gateway Adapter Pattern

The module uses an adapter pattern to abstract payment gateway differences:

```
PaymentService
    ├── StripeAdapter   -> Stripe API
    ├── PayPalAdapter   -> PayPal API
    └── RazorpayService -> Razorpay API
```

Each adapter implements:
- `createPaymentIntent(amount, currency, metadata)`
- `confirmPayment(paymentIntentId)`
- `cancelPayment(paymentIntentId)`
- `refundPayment(paymentId, amount)`
- `verifyWebhook(payload, signature)`

## Events Published

| Event                  | Payload                       | Triggered When              |
|------------------------|-------------------------------|-----------------------------|
| `payment.created`      | Payment ID, order, amount     | Payment intent created      |
| `payment.processing`   | Payment ID                    | Payment being processed     |
| `payment.completed`    | Payment ID, order, amount     | Payment successful          |
| `payment.failed`       | Payment ID, error             | Payment failed              |
| `payment.cancelled`    | Payment ID                    | Payment cancelled           |
| `payment.refunded`     | Payment ID, refund amount     | Refund processed            |

## Webhook Security

- Each gateway webhook endpoint verifies the request signature
- Stripe: `stripe-signature` header verified against webhook secret
- Razorpay: HMAC signature verification
- Idempotency: Duplicate webhook events are detected and ignored

## Dependencies

- **Internal**: Order module (order updates), Notification module (via events)
- **External**: stripe, razorpay, mongoose-paginate-v2
