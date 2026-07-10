# Auth Module (Client)

## Overview

The Auth module on the client side manages user authentication and authorization across the ShopStream frontend. It provides login/registration forms for both customers and sellers, global authentication state via React Context, route protection, and JWT token management.

## Architecture

```
client/src/features/auth/
├── components/
│   ├── CustomerLoginForm.tsx       # Customer login form
│   ├── CustomerRegisterForm.tsx    # Customer registration form
│   ├── SellerLoginForm.tsx         # Seller login form
│   ├── SellerRegisterForm.tsx      # Seller registration form
│   └── ProtectedRoute.tsx          # Route guard component
├── context/
│   └── AuthContext.tsx              # Global auth state provider
├── hooks/
│   └── useAuthForm.ts              # Shared form logic hook
├── layouts/
│   └── AuthLayout.tsx              # Auth page layout wrapper
└── services/
    └── AuthService.ts              # API calls for auth endpoints
```

## Components

### CustomerLoginForm
Login form for customer users with email/password fields, validation, and error handling. Redirects to shop on success.

### CustomerRegisterForm
Registration form for new customers with fields for name, email, password, and phone. Includes password strength validation.

### SellerLoginForm
Login form for seller users with email/password fields. Redirects to seller dashboard on success.

### SellerRegisterForm
Registration form for sellers with additional business-specific fields (business name). Includes email verification flow.

### ProtectedRoute
Route guard component that:
- Checks if user is authenticated
- Verifies user role matches required role
- Redirects to login if unauthenticated
- Redirects to appropriate dashboard if role mismatch

## Auth Context

The `AuthContext` provides global authentication state to the entire application:

### State
| Field           | Type          | Description                       |
|-----------------|---------------|-----------------------------------|
| `user`          | User \| null  | Current authenticated user        |
| `isAuthenticated`| Boolean      | Whether user is logged in         |
| `isLoading`     | Boolean       | Auth state loading indicator      |
| `role`          | String        | User role (customer/seller/admin) |

### Methods
| Method          | Description                                     |
|-----------------|-------------------------------------------------|
| `login()`       | Authenticate user and store tokens              |
| `register()`    | Create new account and auto-login               |
| `logout()`      | Clear tokens and reset state                    |
| `refreshToken()`| Silently refresh expired access token           |

## Hooks

### useAuthForm
Shared hook encapsulating form submission logic for all auth forms:
- Form state management
- API call execution
- Error handling and display
- Loading state
- Redirect after success

## Services

### AuthService

| Method                | Endpoint                    | Description                  |
|-----------------------|-----------------------------|------------------------------|
| `register(data)`     | `POST /auth/register`       | Register new user            |
| `login(data)`        | `POST /auth/login`          | Login with credentials       |
| `logout()`           | `POST /auth/logout`         | Logout and invalidate tokens |
| `refreshToken()`     | `POST /auth/refresh-token`  | Refresh access token         |
| `getMe()`            | `GET /auth/me`              | Get current user profile     |
| `forgotPassword()`   | `POST /auth/forgot-password`| Request password reset       |
| `resetPassword()`    | `POST /auth/reset-password` | Reset password with token    |
| `verifyEmail(token)` | `GET /auth/verify-email/:token` | Verify email address     |

## Token Management

- **Access Token**: Short-lived (~15 min), stored in localStorage, sent as `Authorization: Bearer <token>` header
- **Refresh Token**: Long-lived (~7 days), stored in localStorage, used to obtain new access tokens
- **Auto-Refresh**: Axios interceptors automatically refresh expired access tokens using the refresh token
- **Dual Axios Instances**: Separate configured instances for customer (`axiosCustomer`) and seller (`axiosSeller`) API calls

## Route Protection

```
App
├── (auth)/                    # Public auth pages
│   ├── login/                 # Customer login
│   ├── signup/                # Customer registration
│   ├── seller/login/          # Seller login
│   └── seller/signup/         # Seller registration
├── (customer)/                # Protected customer routes
│   ├── shop/                  # Requires: authenticated
│   ├── cart/                  # Requires: authenticated
│   ├── checkout/              # Requires: authenticated
│   └── account/               # Requires: authenticated + customer role
└── (seller)/                  # Protected seller routes
    └── dashboard/             # Requires: authenticated + seller role
```

## Dependencies

- **Internal**: Used by all other client modules for auth state
- **External**: React Context API, Axios, React Hook Form, Zod
