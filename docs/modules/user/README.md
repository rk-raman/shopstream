# User Module

## Overview

The User module handles all user-related functionality including authentication, authorization, profile management, address management, and wishlist operations. It supports three user roles: **customer**, **seller**, and **admin**, each with distinct permissions and capabilities.

## Architecture

```
server/src/modules/user/
├── controllers/
│   ├── auth.controller.js        # Authentication endpoints (login, register, etc.)
│   ├── user.controller.js        # Profile & admin user management
│   └── address.controller.js     # Address CRUD operations
├── models/
│   ├── User.model.js             # User schema with role-based fields
│   ├── Address.model.js          # Embedded address sub-schema
│   └── index.js                  # Model exports
├── services/
│   ├── auth.service.js           # Authentication business logic
│   └── user.service.js           # User profile business logic
├── routes/
│   ├── auth.routes.js            # Auth route definitions
│   ├── user.routes.js            # User route definitions
│   ├── address.routes.js         # Address route definitions
│   └── index.js                  # Route aggregator
├── validators/
│   ├── user.validators.js        # Express-validator middleware
│   ├── user.schemas.js           # Joi validation schemas
│   └── sharedValidation.js       # Reusable validation utilities
└── events/
    ├── publishers/
    │   └── UserEventPublisher.js # Publishes user lifecycle events
    └── subscribers/
        ├── UserNotificationSubscriber.js  # Sends welcome emails, etc.
        ├── UserAnalyticsSubscriber.js     # Tracks registration metrics
        ├── UserMarketingSubscriber.js     # Mailing list integration
        └── UserSubscriberManager.js       # Manages subscriber lifecycle
```

## Data Models

### User Model

| Field             | Type     | Description                                    |
|-------------------|----------|------------------------------------------------|
| `email`           | String   | Unique, validated email address                |
| `password`        | String   | Bcrypt-hashed password                         |
| `firstName`       | String   | User's first name                              |
| `lastName`        | String   | User's last name                               |
| `phone`           | String   | Phone number with validation                   |
| `avatar`          | Object   | `{ public_id, url }` for profile image         |
| `dateOfBirth`     | Date     | Optional date of birth                         |
| `gender`          | String   | Optional gender field                          |
| `role`            | String   | `customer`, `seller`, or `admin`               |
| `isActive`        | Boolean  | Account active status                          |
| `isEmailVerified` | Boolean  | Email verification status                      |
| `isPhoneVerified` | Boolean  | Phone verification status                      |
| `businessName`    | String   | Required for seller role                       |

### Address Model (Embedded)

| Field          | Type    | Description              |
|----------------|---------|--------------------------|
| `fullName`     | String  | Recipient name           |
| `addressLine1` | String  | Primary address          |
| `addressLine2` | String  | Secondary address        |
| `city`         | String  | City                     |
| `state`        | String  | State/province           |
| `pincode`      | String  | Postal/ZIP code          |
| `country`      | String  | Country (default: India) |
| `phone`        | String  | Contact phone            |
| `type`         | String  | `shipping` or `billing`  |
| `isDefault`    | Boolean | Default address flag     |

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint                | Auth     | Rate Limited | Description                  |
|--------|-------------------------|----------|--------------|------------------------------|
| POST   | `/register`             | Public   | Yes          | Register a new user          |
| POST   | `/login`                | Public   | Yes          | Login with credentials       |
| POST   | `/forgot-password`      | Public   | Yes          | Request password reset email |
| POST   | `/reset-password`       | Public   | Yes          | Reset password with token    |
| GET    | `/verify-email/:token`  | Public   | No           | Verify email address         |
| POST   | `/resend-verification`  | Public   | Yes          | Resend verification email    |
| POST   | `/refresh-token`        | Semi     | No           | Refresh access token         |
| POST   | `/logout`               | Semi     | No           | Invalidate tokens            |
| GET    | `/me`                   | Required | No           | Get current user profile     |
| POST   | `/change-password`      | Required | No           | Change password              |
| POST   | `/enable-2fa`           | Required | No           | Enable two-factor auth       |
| POST   | `/verify-2fa`           | Required | No           | Verify 2FA code              |

### User Routes (`/api/v1/users`)

| Method | Endpoint               | Auth    | Description                |
|--------|------------------------|---------|----------------------------|
| GET    | `/profile`             | User    | Get own profile            |
| PUT    | `/profile`             | User    | Update own profile         |
| POST   | `/avatar`              | User    | Upload profile avatar      |
| DELETE | `/account`             | User    | Delete own account         |
| GET    | `/wishlist`            | User    | Get wishlist               |
| POST   | `/wishlist`            | User    | Add product to wishlist    |
| DELETE | `/wishlist/:productId` | User    | Remove from wishlist       |
| DELETE | `/wishlist`            | User    | Clear entire wishlist      |
| GET    | `/`                    | Admin   | List all users (paginated) |
| GET    | `/search`              | Admin   | Search users               |
| GET    | `/:userId`             | Admin   | Get user by ID             |
| PUT    | `/:userId`             | Admin   | Update user by ID          |
| DELETE | `/:userId`             | Admin   | Delete user by ID          |

### Address Routes (`/api/v1/addresses`)

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/`                   | User | Get all addresses        |
| POST   | `/`                   | User | Add new address          |
| GET    | `/default`            | User | Get default address      |
| GET    | `/type/:type`         | User | Get addresses by type    |
| GET    | `/:addressId`         | User | Get specific address     |
| PUT    | `/:addressId`         | User | Update address           |
| DELETE | `/:addressId`         | User | Delete address           |
| PATCH  | `/:addressId/default` | User | Set as default address   |

## Authentication Flow

1. **Registration**: User submits email/password -> password hashed with bcrypt -> user created -> verification email sent -> JWT tokens issued
2. **Login**: Credentials validated -> rate limiting checked -> tokens generated (access + refresh) -> returned to client
3. **Token Refresh**: Refresh token validated -> new access token issued
4. **Password Reset**: Email submitted -> reset token generated -> reset email sent -> token validated -> password updated

## Events Published

| Event                   | Payload                     | Triggered When                  |
|-------------------------|-----------------------------|---------------------------------|
| `user.created`          | User object                 | New user registers              |
| `user.email.verified`   | User ID, email              | Email verified successfully     |
| `user.profile.updated`  | User ID, changed fields     | Profile information updated     |
| `user.password.reset`   | User ID                     | Password reset completed        |

## Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: Separate limiters for login, registration, password reset, and email verification
- **Failed Login Tracking**: Tracks failed attempts and applies progressive rate limiting
- **JWT Tokens**: Short-lived access tokens (~15 min) and long-lived refresh tokens (~7 days)
- **Two-Factor Authentication**: Optional 2FA support
- **Input Validation**: Both express-validator middleware and Joi schema validation

## Dependencies

- **Internal**: Upload module (avatar uploads), Notification module (via events)
- **External**: bcryptjs, jsonwebtoken, mongoose-paginate-v2
