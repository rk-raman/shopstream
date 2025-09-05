# Payment Module

The Payment module handles all payment processing, including multiple payment gateways, payment verification, and refund management.

## Features

- Multiple payment gateway integration (Stripe, Razorpay)
- Payment intent creation and confirmation
- Refund processing
- Payment history and analytics
- Webhook handling for payment events
- Payment method management

## Supported Payment Gateways

### Stripe

- Credit/Debit cards
- International payments
- 3D Secure authentication
- Recurring payments

### Razorpay

- Credit/Debit cards
- Net Banking
- UPI payments
- Wallets
- EMI options

## API Endpoints

### Payment Processing

- `POST /api/v1/payments/create` - Create payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/capture` - Capture authorized payment
- `POST /api/v1/payments/refund` - Process refund

### Payment Methods

- `GET /api/v1/payments/methods` - Get available payment methods
- `POST /api/v1/payments/methods` - Add payment method
- `DELETE /api/v1/payments/methods/:id` - Remove payment method

### Payment History

- `GET /api/v1/payments` - Get payment history
- `GET /api/v1/payments/:id` - Get payment details
- `GET /api/v1/payments/:id/refunds` - Get refund history

### Webhooks

- `POST /api/v1/payments/webhooks/stripe` - Stripe webhook
- `POST /api/v1/payments/webhooks/razorpay` - Razorpay webhook

## Models

### Payment Model

```javascript
{
  userId: ObjectId,
  orderId: ObjectId,
  amount: Number,
  currency: String,
  status: String, // pending, succeeded, failed, cancelled, refunded
  paymentMethod: String, // card, upi, netbanking, wallet
  gateway: String, // stripe, razorpay
  gatewayPaymentId: String,
  gatewayOrderId: String,
  gatewaySignature: String,
  refundAmount: Number,
  refundReason: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Payment Flow

1. **Create Payment Intent**

   - Validate order and amount
   - Create payment intent with gateway
   - Return client secret/payment ID

2. **Confirm Payment**

   - Verify payment with gateway
   - Update payment status
   - Trigger order confirmation

3. **Handle Webhooks**
   - Process gateway notifications
   - Update payment status
   - Trigger appropriate events

## Services

- **PaymentService**: Core payment operations
- **StripeService**: Stripe integration
- **RazorpayService**: Razorpay integration
- **RefundService**: Refund processing
- **WebhookService**: Webhook handling

## Events

The module emits events for:

- Payment created
- Payment succeeded
- Payment failed
- Payment refunded
- Webhook received

## Security Features

- Payment signature verification
- Webhook signature validation
- PCI DSS compliance
- Secure token handling
- Fraud detection integration

## Validation

All payment operations use comprehensive validation:

- Payment amount validation
- Currency validation
- Payment method validation
- Gateway-specific validation

## Error Handling

- Gateway-specific error mapping
- User-friendly error messages
- Retry mechanisms for failed payments
- Comprehensive logging

## Configuration

### Stripe Configuration

```javascript
{
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
}
```

### Razorpay Configuration

```javascript
{
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
}
```

## Testing

- Unit tests for all services
- Integration tests with test gateways
- Webhook testing with ngrok
- Mock payment scenarios

## Dependencies

- Stripe SDK
- Razorpay SDK
- MongoDB (Mongoose)
- Redis (caching)
- Kafka (events)
- Order Module
- User Module
