# ShopStream Backend Architecture

> A guide for new developers to understand how the backend is designed and how all the pieces fit together.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Application Startup Flow](#application-startup-flow)
5. [Modular Architecture](#modular-architecture)
6. [Middleware Pipeline](#middleware-pipeline)
7. [Authentication & Authorization](#authentication--authorization)
8. [Database Layer](#database-layer)
9. [API Routes](#api-routes)
10. [Event-Driven Architecture](#event-driven-architecture)
11. [Payment Processing](#payment-processing)
12. [File Uploads & Media](#file-uploads--media)
13. [Notifications](#notifications)
14. [Caching & Rate Limiting (Redis)](#caching--rate-limiting-redis)
15. [Background Jobs](#background-jobs)
16. [Error Handling](#error-handling)
17. [Security](#security)
18. [Testing](#testing)
19. [Environment Configuration](#environment-configuration)
20. [Key Design Patterns](#key-design-patterns)

---

## High-Level Overview

ShopStream is a **multi-vendor e-commerce platform**. The backend is a Node.js/Express REST API that supports:

- Buyers browsing products, managing carts, placing orders
- Sellers listing products, managing inventory, fulfilling orders
- Admins overseeing the platform (users, analytics, content)
- Real-time notifications (email, SMS, push, in-app)
- Multiple payment gateways (Stripe, Razorpay, PayPal)

```
┌─────────────┐       ┌──────────────────────────────────────────────┐
│   Frontend   │──────>│              Express API Server              │
│  (React app) │<──────│                 Port 5000                    │
└─────────────┘       └──────┬────────┬────────┬────────┬────────────┘
                             │        │        │        │
                        ┌────▼──┐ ┌───▼───┐ ┌──▼──┐ ┌──▼──────────┐
                        │MongoDB│ │ Redis │ │Kafka│ │Elasticsearch│
                        └───────┘ └───────┘ └─────┘ └─────────────┘
                                      │
                              ┌───────┴───────┐
                              │  Bull Queues   │
                              │ (Background    │
                              │  Jobs)         │
                              └───────────────┘
```

---

## Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Runtime            | Node.js                                         |
| Framework          | Express 4.18                                    |
| Database           | MongoDB (Mongoose 7.0 ODM)                      |
| Cache / Queues     | Redis 4.7                                       |
| Search             | Elasticsearch 8.7 (optional)                    |
| Message Broker     | Kafka via kafkajs (optional, alternative to in-memory events) |
| Background Jobs    | Bull 4.10 (Redis-backed)                        |
| Auth               | JWT (jsonwebtoken), bcryptjs, Passport (Google/Facebook OAuth) |
| Payments           | Stripe, Razorpay, PayPal                        |
| File Storage       | Cloudinary, AWS S3                              |
| Notifications      | Nodemailer (email), Twilio (SMS), Firebase/Web Push |
| Validation         | Joi, express-validator                          |
| Logging            | Winston, Morgan                                 |
| Testing            | Jest, Supertest                                 |

---

## Project Structure

```
server/
├── server.js                       # Entry point - starts HTTP server
├── src/
│   ├── app.js                      # Express app setup (middleware, routes)
│   │
│   ├── config/                     # External service configs
│   │   ├── database.js             #   MongoDB connection
│   │   ├── redis.js                #   Redis client
│   │   ├── cloudinary.js           #   Cloudinary setup
│   │   ├── elasticsearch.js        #   Elasticsearch client
│   │   ├── kafka.js                #   Kafka producer/consumer
│   │   └── index.js                #   Aggregated config (email, SMS, push, uploads)
│   │
│   ├── modules/                    # Feature modules (the core of the app)
│   │   ├── user/                   #   Auth, profiles, addresses, wishlist
│   │   ├── product/                #   Products, categories, brands, collections
│   │   ├── cart/                   #   Shopping cart
│   │   ├── order/                  #   Order lifecycle
│   │   ├── payment/                #   Payment processing & gateways
│   │   ├── notification/           #   Email, SMS, push, in-app
│   │   ├── upload/                 #   File uploads (Cloudinary, S3)
│   │   ├── review/                 #   Product reviews
│   │   ├── inventory/              #   Stock management
│   │   └── analytics/              #   Event tracking
│   │
│   ├── routes/
│   │   └── index.js                # Route aggregator (/api/*)
│   │
│   ├── jobs/                       # Background job processors
│   │   ├── emailQueue.js
│   │   ├── inventoryUpdate.js
│   │   └── analyticsProcessor.js
│   │
│   └── shared/                     # Cross-cutting concerns
│       ├── middleware/              #   Auth, rate limiting, validation, error handling
│       ├── utils/                  #   JWT helpers, validators, response formatter
│       ├── events/                 #   Event bus, event types, publishers
│       └── constants/              #   Error codes, enums
│
├── .env / .env.example             # Environment variables
├── package.json
└── docker-compose.dev.yml          # Dev Docker setup
```

### How to read the structure

Each **module** under `src/modules/` follows a consistent internal layout:

```
modules/<feature>/
├── models/          # Mongoose schemas
├── controllers/     # Route handlers (thin - delegate to services)
├── services/        # Business logic
├── routes/          # Express route definitions
├── middleware/       # Module-specific middleware
├── validators/      # Input validation schemas
└── events/
    └── publishers/  # Event publishing for this module
```

---

## Application Startup Flow

**Entry point:** `server.js`

```
1. Load environment variables (dotenv)
2. Connect to MongoDB
3. Connect to Redis
4. Initialize Elasticsearch (optional)
5. Initialize Event System (EventEmitter or Kafka)
6. Create Express app (src/app.js)
7. Start HTTP server on PORT 5000
8. Register graceful shutdown handlers (SIGINT, SIGTERM)
```

If any step fails, the process exits with code 1.

---

## Modular Architecture

The backend is organized into **self-contained feature modules**. Each module owns its models, routes, controllers, services, and events. Modules communicate via the event bus, not by importing each other's internals.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   User   │  │ Product  │  │   Cart   │  │  Order   │
│  Module  │  │  Module  │  │  Module  │  │  Module  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │
     └─────────────┴─────────────┴─────────────┘
                         │
                   ┌─────▼─────┐
                   │ Event Bus │  (EventEmitter or Kafka)
                   └─────┬─────┘
                         │
     ┌───────────────────┼───────────────────┐
     │                   │                   │
┌────▼─────┐  ┌──────────▼──┐  ┌─────────────▼──┐
│ Payment  │  │ Notification│  │   Analytics    │
│  Module  │  │   Module    │  │    Module      │
└──────────┘  └─────────────┘  └────────────────┘
```

**Why this matters:** You can work on one module without needing to understand all the others. Follow the event contracts to see how modules interact.

---

## Middleware Pipeline

When a request hits the server, it passes through this middleware stack (defined in `src/app.js`):

```
Request
  │
  ├── 1. Response Handler     – Wraps responses in a consistent format
  ├── 2. Request ID           – Attaches a unique ID for tracing
  ├── 3. Helmet               – Security headers (XSS, clickjacking, MIME)
  ├── 4. CORS                 – Allow requests from CLIENT_URL
  ├── 5. Rate Limiter         – 100 req/min prod, 1000 req/min dev
  ├── 6. Body Parser          – JSON & form data (10MB limit)
  ├── 7. Mongo Sanitize       – Prevent NoSQL injection
  ├── 8. Compression          – Gzip responses
  ├── 9. Morgan Logger        – Log HTTP requests
  ├── 10. Route Handlers      – Business logic
  └── 11. Error Handler       – Catch-all error formatting (must be last)
  │
Response
```

---

## Authentication & Authorization

### JWT Token Flow

```
Client                          Server
  │                               │
  │── POST /api/users/login ─────>│
  │                               │── Verify credentials
  │<── { accessToken,             │── Generate token pair
  │      refreshToken } ─────────│
  │                               │
  │── GET /api/products ─────────>│
  │   Authorization: Bearer <AT>  │── Verify access token
  │<── 200 OK ───────────────────│
  │                               │
  │── POST /api/users/refresh ──>│   (when access token expires)
  │   { refreshToken }            │── Verify refresh token
  │<── { new accessToken,         │── Generate new pair
  │      new refreshToken } ─────│
```

| Token          | Lifetime | Purpose                              |
| -------------- | -------- | ------------------------------------ |
| Access Token   | 15 min   | Authenticate API requests            |
| Refresh Token  | 7 days   | Obtain new access tokens             |

### Auth Middleware (shared/middleware/auth.middleware.js)

| Middleware                    | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `authenticate`                | Require valid JWT; attach `req.user`                   |
| `optionalAuth`                | Attach user if token present; don't block if absent    |
| `authorize(...roles)`         | Role-based access: `'admin'`, `'seller'`, `'customer'` |
| `checkOwnership(param)`       | User owns the resource OR is admin                     |
| `requireEmailVerification`    | Block unverified email users                           |
| `updateLastActive`            | Track user's last activity timestamp                   |

### Social Login

- **Google OAuth 2.0** and **Facebook OAuth** via Passport.js
- Stores `googleId` / `facebookId` on the User model

---

## Database Layer

### MongoDB + Mongoose

- **Connection:** configured in `src/config/database.js`, URI from `MONGODB_URI` env var
- **Pagination:** all list endpoints use `mongoose-paginate-v2`
- **Indexes:** 40+ indexes across models for query performance

### Data Models (17 total)

```
┌──────────────────────────────────────────────────────────────┐
│                        Core Models                           │
├──────────────┬───────────────┬───────────────┬───────────────┤
│    User      │   Product     │   Category    │    Brand      │
│  (auth,      │  (variants,   │  (hierarchy,  │  (name, logo) │
│   profile,   │   pricing,    │   parent/     │               │
│   roles,     │   media,      │   child)      │               │
│   addresses) │   specs)      │               │               │
├──────────────┼───────────────┼───────────────┼───────────────┤
│    Cart      │   Order       │  OrderItem    │   Payment     │
│  (items,     │  (lifecycle   │  (line item   │  (gateway,    │
│   totals)    │   tracking,   │   details)    │   status,     │
│              │   status      │               │   refunds)    │
│              │   history)    │               │               │
├──────────────┼───────────────┼───────────────┼───────────────┤
│   Review     │  Inventory    │   Upload      │  Analytics    │
│  (rating,    │  (stock,      │  (provider,   │  (events,     │
│   verified   │   alerts)     │   metadata)   │   tracking)   │
│   purchase)  │               │               │               │
├──────────────┼───────────────┼───────────────┼───────────────┤
│ Notification │ Notification  │   Address     │ PaymentMethod │
│              │   Template    │  (shipping/   │  (saved cards,│
│              │  (reusable)   │   billing)    │   wallets)    │
├──────────────┴───────────────┴───────────────┴───────────────┤
│                       Collection                             │
│                  (curated product groups)                     │
└──────────────────────────────────────────────────────────────┘
```

### Key Model Relationships

```
User ──< Address          (user has many addresses)
User ──< Order            (user places many orders)
User ──< Review           (user writes many reviews)
User ──< Cart             (user has one cart)
User ──< PaymentMethod    (user saves payment methods)

Product >── Category      (product belongs to a category)
Product >── Brand         (product belongs to a brand)
Product >── User(seller)  (product listed by a seller)
Product ──< Review        (product has many reviews)

Order ──< OrderItem       (order has many line items)
Order ──< Payment         (order has payment records)

Collection ──< Product    (collection contains many products)
```

---

## API Routes

All routes are mounted under `/api`. Here's the full route map:

### Auth & Users (`/api/users`)

| Method | Endpoint                   | Auth     | Description               |
| ------ | -------------------------- | -------- | ------------------------- |
| POST   | `/register`                | Public   | Register new user         |
| POST   | `/login`                   | Public   | Login                     |
| POST   | `/refresh-token`           | Public   | Refresh access token      |
| POST   | `/logout`                  | Auth     | Logout                    |
| GET    | `/verify-email/:token`     | Public   | Verify email              |
| POST   | `/resend-verification`     | Auth     | Resend verification email |
| POST   | `/forgot-password`         | Public   | Request password reset    |
| POST   | `/reset-password`          | Public   | Reset password with token |
| GET    | `/me`                      | Auth     | Get current user profile  |
| PUT    | `/change-password`         | Auth     | Change password           |
| POST   | `/enable-2fa`              | Auth     | Enable two-factor auth    |
| POST   | `/verify-2fa`              | Auth     | Verify 2FA code           |

### Products (`/api/products`)

| Method | Endpoint      | Auth          | Description                          |
| ------ | ------------- | ------------- | ------------------------------------ |
| GET    | `/`           | Public        | List products (filter, sort, page)   |
| POST   | `/`           | Seller/Admin  | Create product                       |
| GET    | `/:id`        | Public        | Get product details                  |
| PUT    | `/:id`        | Seller/Admin  | Update product                       |
| DELETE | `/:id`        | Seller/Admin  | Delete product                       |

### Cart (`/api/cart`)

| Method | Endpoint      | Auth | Description          |
| ------ | ------------- | ---- | -------------------- |
| GET    | `/`           | Auth | Get user's cart      |
| POST   | `/`           | Auth | Add item to cart     |
| PUT    | `/:itemId`    | Auth | Update item quantity |
| DELETE | `/:itemId`    | Auth | Remove item          |
| DELETE | `/`           | Auth | Clear entire cart    |

### Orders (`/api/orders`)

| Method | Endpoint  | Auth         | Description          |
| ------ | --------- | ------------ | -------------------- |
| POST   | `/`       | Auth         | Create order         |
| GET    | `/`       | Auth         | List user's orders   |
| GET    | `/:id`    | Auth         | Get order details    |
| PUT    | `/:id`    | Seller/Admin | Update order status  |

### Payments (`/api/payments`)

| Method | Endpoint      | Auth   | Description             |
| ------ | ------------- | ------ | ----------------------- |
| POST   | `/intent`     | Auth   | Create payment intent   |
| POST   | `/confirm`    | Auth   | Confirm payment         |
| POST   | `/webhook`    | Public | Gateway webhook handler |
| POST   | `/refund`     | Admin  | Refund a payment        |
| GET    | `/:id`        | Auth   | Get payment status      |

### Additional Routes

| Prefix               | Description                  |
| -------------------- | ---------------------------- |
| `/api/categories`    | Category CRUD                |
| `/api/brands`        | Brand CRUD                   |
| `/api/collections`   | Collection CRUD              |
| `/api/reviews`       | Product reviews              |
| `/api/notifications` | User notifications           |
| `/api/uploads`       | File upload/delete           |
| `/api/inventory`     | Stock management             |

---

## Event-Driven Architecture

The backend uses an **event bus** to decouple modules. When something happens (e.g., order placed), the module publishes an event. Other modules subscribe and react independently.

### Event Flow Example

```
Order Module                    Event Bus                  Subscribers
    │                              │                           │
    │── ORDER_CREATED ────────────>│                           │
    │                              │── Notification Module ──> Send confirmation email
    │                              │── Inventory Module ────> Decrease stock
    │                              │── Analytics Module ────> Track conversion
    │                              │── Payment Module ──────> Initiate payment
```

### Event Bus Implementations

| Implementation     | When to use                           |
| ------------------ | ------------------------------------- |
| `EventEmitterBus`  | Default. In-memory, single process    |
| `KafkaBus`         | Distributed, multi-service deployment |

Configured via `EVENT_BUS_TYPE` env var (`eventemitter` or `kafka`).

### Event Categories

| Category     | Examples                                                            |
| ------------ | ------------------------------------------------------------------- |
| User (26)    | `USER_REGISTERED`, `USER_LOGGED_IN`, `PASSWORD_CHANGED`, `EMAIL_VERIFIED` |
| Product (6)  | `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_VIEWED`             |
| Cart (11)    | `ITEM_ADDED_TO_CART`, `CART_ABANDONED`, `COUPON_APPLIED`           |
| Order (6)    | `ORDER_CREATED`, `ORDER_SHIPPED`, `ORDER_DELIVERED`                |
| Payment (4)  | `PAYMENT_SUCCESSFUL`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`        |
| Inventory (4)| `LOW_STOCK_ALERT`, `OUT_OF_STOCK`, `STOCK_REPLENISHED`            |
| Review (3)   | `REVIEW_CREATED`, `REVIEW_UPDATED`, `REVIEW_DELETED`              |
| Notification (8) | `NOTIFICATION_SENT`, `NOTIFICATION_READ`, `NOTIFICATION_FAILED` |

Each module has a **Publisher** class (e.g., `UserEventPublisher`) that validates payloads and publishes to the bus.

---

## Payment Processing

### Gateway Architecture (Adapter Pattern)

```
PaymentService
    │
    ├── StripeAdapter      ── Stripe API
    ├── RazorpayAdapter    ── Razorpay API
    └── PayPalAdapter      ── PayPal API (stub)
```

Each adapter implements:
- `createPaymentIntent(amount, currency, metadata)`
- `confirmPayment(paymentIntentId)`
- `verifyWebhook(payload, signature)`
- `createRefund(paymentId, amount)`

### Payment Flow

```
1. Client ── POST /api/payments/intent ──> Server creates intent via gateway
2. Client ── Completes payment on frontend (Stripe Elements / Razorpay checkout)
3. Gateway ── POST /api/payments/webhook ──> Server verifies & updates order
4. Server ── Publishes PAYMENT_SUCCESSFUL event
5. Subscribers: update order status, send receipt, track analytics
```

### Order Status Lifecycle

```
pending -> confirmed -> processing -> shipped -> out_for_delivery -> delivered
    │                                                                    │
    └──> cancelled                                          returned <───┘
```

---

## File Uploads & Media

### Provider Architecture

```
UploadService
    │
    ├── CloudinaryProvider   ── Image hosting + transformations
    └── AWSProvider          ── S3 object storage
```

Configured via `UPLOAD_PROVIDER` env var.

### Upload Types

| Type     | Transforms            | Folder               | Limit        |
| -------- | --------------------- | --------------------- | ------------ |
| Avatar   | 200x200, crop         | `users/{userId}`      | 1 file       |
| Product  | 800x600, fit          | `products/{sellerId}` | 20 images    |
| Banner   | Admin only            | `banners/{type}`      | varies       |
| Document | None                  | `documents/{userId}`  | varies       |

### How it works

1. Client sends file via `multipart/form-data`
2. **Multer** middleware receives the file into memory
3. **UploadService** validates MIME type and size (5MB default)
4. File is uploaded to the configured provider with transformations
5. **Upload model** record is created for tracking
6. URL is returned to the client

---

## Notifications

The notification module supports **4 channels**:

| Channel | Provider         | Use Cases                              |
| ------- | ---------------- | -------------------------------------- |
| Email   | Nodemailer/SMTP  | Order confirmations, password resets   |
| SMS     | Twilio           | OTP verification, delivery updates     |
| Push    | Firebase FCM     | Real-time alerts on mobile             |
| Web Push| web-push (VAPID) | Browser notifications                  |

### Template System

Notification templates are stored in the `NotificationTemplate` model with variable placeholders. Example:

```
"Your order {{orderNumber}} has been shipped! Track it at {{trackingUrl}}"
```

The service substitutes variables at send time.

---

## Caching & Rate Limiting (Redis)

### Redis is used for:

1. **Rate Limiting** - Track request counts per IP/user
2. **Bull Job Queues** - Persist background job state
3. **Session/Token Management** - Blacklist revoked tokens

### Rate Limiting Rules

| Endpoint Type      | Limit                | Window   |
| ------------------ | -------------------- | -------- |
| General API        | 100 requests         | 1 min    |
| Auth (register)    | 5 attempts           | 15 min   |
| Login              | 5 attempts           | 15 min   |
| Password Reset     | 3 attempts           | 1 hour   |
| Email Verification | 3 attempts           | 1 hour   |
| File Upload        | 10 uploads           | 1 hour   |
| Search             | 30 searches          | 1 min    |

In development mode, the general limit is raised to 1000 req/min.

---

## Background Jobs

Powered by **Bull** (Redis-backed job queues).

| Queue                | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `emailQueue`         | Send emails asynchronously                |
| `inventoryUpdate`    | Process stock changes                     |
| `analyticsProcessor` | Aggregate and process analytics events    |

Jobs support retry logic, scheduling, and priority levels.

---

## Error Handling

### Custom Error Class

```javascript
class ApiError extends Error {
  constructor(statusCode, message, errorCode, errors)
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "errors": { "email": "Invalid email format" },
  "timestamp": "2026-04-11T..."
}
```

### What the global error handler catches

- Mongoose `ValidationError` -> 400
- Mongoose `CastError` (bad ObjectId) -> 400
- MongoDB duplicate key (E11000) -> 409
- JWT errors (invalid, expired) -> 401
- Multer file upload errors -> 400
- Everything else -> 500

All controllers use an `asyncHandler` wrapper so unhandled promise rejections are caught automatically.

---

## Security

| Layer                | Mechanism                                              |
| -------------------- | ------------------------------------------------------ |
| Transport            | HTTPS (configured at deployment/proxy level)           |
| Headers              | Helmet (XSS, clickjacking, MIME sniffing protection)   |
| Authentication       | JWT with short-lived access tokens                     |
| Authorization        | Role-based (admin, seller, customer) + ownership check |
| Passwords            | bcrypt with 12 salt rounds                             |
| Input Validation     | Joi schemas + express-validator                        |
| Injection Prevention | express-mongo-sanitize (NoSQL), parameterized queries  |
| Rate Limiting        | Per-endpoint limits via Redis                          |
| CORS                 | Restricted to `CLIENT_URL`                             |
| Payments             | Gateway-proxied (PCI compliant), webhook sig verify    |
| Account Security     | Login attempt tracking, account locking, 2FA support   |

---

## Testing

```bash
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report
```

- **Jest** as the test runner
- **Supertest** for HTTP integration tests

---

## Environment Configuration

Copy `.env.example` to `.env` and configure:

| Variable Group      | Key Variables                                         |
| ------------------- | ----------------------------------------------------- |
| Server              | `NODE_ENV`, `PORT`                                    |
| Database            | `MONGODB_URI`, `REDIS_URL`, `ELASTICSEARCH_URL`       |
| JWT                 | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, expiry times |
| Payments            | `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`                |
| Upload              | `UPLOAD_PROVIDER`, `CLOUDINARY_*` or `AWS_*`          |
| Email               | `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`          |
| SMS                 | `SMS_PROVIDER`, `SMS_ACCOUNT_SID`, `SMS_AUTH_TOKEN`   |
| Push                | `FIREBASE_*`, `WEBPUSH_*`                             |
| Events              | `EVENT_BUS_TYPE` (`eventemitter` or `kafka`)           |
| Frontend            | `CLIENT_URL`                                          |

---

## Key Design Patterns

| Pattern             | Where it's used                                          |
| ------------------- | -------------------------------------------------------- |
| **MVC**             | Controllers -> Services -> Models across all modules     |
| **Service Layer**   | Business logic lives in `services/`, not controllers     |
| **Adapter**         | Payment gateways (Stripe/Razorpay/PayPal), Upload providers (Cloudinary/S3) |
| **Factory**         | `EventBusFactory`, `ProviderFactory` for upload providers|
| **Observer**        | Event bus: publishers emit, subscribers react            |
| **Singleton**       | Redis client, EventSystemManager                        |
| **Strategy**        | Different rate limiting configs per endpoint type        |
| **Middleware Chain** | Express middleware pipeline for cross-cutting concerns   |
| **Repository**      | Mongoose static methods encapsulate complex queries      |

### The Request Lifecycle (putting it all together)

```
HTTP Request
  │
  ├── Express Middleware Pipeline (security, parsing, logging)
  │
  ├── Route Matching (/api/orders)
  │     │
  │     ├── Auth Middleware (authenticate, authorize)
  │     ├── Validation Middleware (Joi schema check)
  │     └── Controller
  │           │
  │           └── Service Layer
  │                 │
  │                 ├── Database (Mongoose model operations)
  │                 ├── External APIs (payment gateways, upload providers)
  │                 └── Event Publishing (ORDER_CREATED, etc.)
  │                       │
  │                       └── Event Subscribers
  │                             ├── Notification Service
  │                             ├── Inventory Service
  │                             └── Analytics Service
  │
  ├── Response Formatting (ResponseHandler)
  │
  └── Error Handler (if anything threw)
```

---

## Quick Start for New Developers

```bash
# 1. Install dependencies
cd server && npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI, Redis URL, etc.

# 3. Start in development mode
npm run dev          # Uses nodemon for auto-reload

# 4. Or start with Docker
npm run dev:docker   # Uses docker-compose.dev.yml
```

### Where to start reading code

1. `server.js` - See how the app boots
2. `src/app.js` - See the middleware stack
3. `src/routes/index.js` - See all available routes
4. Pick any module in `src/modules/` and read its `routes -> controller -> service -> model` chain
5. `src/shared/events/` - Understand how modules communicate

---

*This document reflects the architecture as of the current codebase state. When in doubt, the code is the source of truth.*
