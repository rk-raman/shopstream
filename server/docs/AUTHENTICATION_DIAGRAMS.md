# Authentication Flow Diagrams

This document contains visual diagrams for the authentication flows described in the main documentation.

## Current Authentication System

### User Registration Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Auth API  │    │  Database   │    │   Events    │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. POST /register │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Check exists   │                   │
       │                   ├──────────────────►│                   │
       │                   │ 3. User not found │                   │
       │                   │◄──────────────────┤                   │
       │                   │ 4. Create user    │                   │
       │                   ├──────────────────►│                   │
       │                   │ 5. User created   │                   │
       │                   │◄──────────────────┤                   │
       │                   │ 6. Generate tokens│                   │
       │                   │ 7. Store refresh  │                   │
       │                   ├──────────────────►│                   │
       │                   │ 8. Set cookie     │                   │
       │                   │ 9. Publish event  │                   │
       │                   ├──────────────────────────────────────►│
       │ 10. 201 Created   │                   │                   │
       │◄──────────────────┤                   │                   │
       │ {user, accessToken}│                   │                   │
```

### User Login Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Auth API  │    │  Database   │    │   Events    │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. POST /login    │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Find user      │                   │
       │                   ├──────────────────►│                   │
       │                   │ 3. User found     │                   │
       │                   │◄──────────────────┤                   │
       │                   │ 4. Verify password│                   │
       │                   │ 5. Check status   │                   │
       │                   │ 6. Generate tokens│                   │
       │                   │ 7. Store refresh  │                   │
       │                   ├──────────────────►│                   │
       │                   │ 8. Update stats   │                   │
       │                   ├──────────────────►│                   │
       │                   │ 9. Set cookie     │                   │
       │                   │ 10. Publish event │                   │
       │                   ├──────────────────────────────────────►│
       │ 11. 200 Success   │                   │                   │
       │◄──────────────────┤                   │                   │
       │ {user, accessToken}│                   │                   │
```

### Token Refresh Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Auth API  │    │  Database   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. POST /refresh  │                   │
       │ (cookie)          │                   │
       ├──────────────────►│                   │
       │                   │ 2. Verify token   │
       │                   │ 3. Check in array │
       │                   ├──────────────────►│
       │                   │ 4. Token valid    │
       │                   │◄──────────────────┤
       │                   │ 5. Generate new   │
       │                   │ 6. Replace old    │
       │                   ├──────────────────►│
       │                   │ 7. Set new cookie │
       │ 8. 200 Success    │                   │
       │◄──────────────────┤                   │
       │ {accessToken}     │                   │
```

### Protected Route Access

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │ Middleware  │    │   API       │    │  Database   │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. GET /protected │                   │                   │
       │ (Bearer token)    │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Extract token  │                   │
       │                   │ 3. Verify token   │                   │
       │                   │ 4. Get user       │                   │
       │                   ├──────────────────────────────────────►│
       │                   │ 5. User found     │                   │
       │                   │◄──────────────────────────────────────┤
       │                   │ 6. Check status   │                   │
       │                   │ 7. Add to request │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 8. Check role     │
       │                   │                   │ 9. Authorize      │
       │                   │                   │ 10. Process       │
       │ 11. 200 Success   │                   │                   │
       │◄──────────────────┤◄──────────────────┤                   │
       │ Protected data    │                   │                   │
```

## Multi-Device Support

### Multiple Device Login

```
User Login from Mobile:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Mobile    │    │   Auth API  │    │  Database   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login          │                   │
       ├──────────────────►│                   │
       │                   │ 2. Generate token │
       │                   │ 3. Add to array   │
       │                   ├──────────────────►│
       │                   │ refreshTokens:    │
       │                   │ [mobile_token]    │
       │                   │◄──────────────────┤
       │ 4. Success        │                   │
       │◄──────────────────┤                   │

User Login from Desktop:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Desktop    │    │   Auth API  │    │  Database   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login          │                   │
       ├──────────────────►│                   │
       │                   │ 2. Generate token │
       │                   │ 3. Add to array   │
       │                   ├──────────────────►│
       │                   │ refreshTokens:    │
       │                   │ [mobile_token,    │
       │                   │  desktop_token]   │
       │                   │◄──────────────────┤
       │ 4. Success        │                   │
       │◄──────────────────┤                   │
```

## Role-Based Access Control

### Role Hierarchy

```
┌─────────────────┐
│   SUPER_ADMIN   │ ← Highest privileges
│                 │
├─────────────────┤
│     ADMIN       │ ← System administration
│                 │
├─────────────────┤
│   MODERATOR     │ ← Content moderation
│                 │
├─────────────────┤
│     SELLER      │ ← Product management
│                 │
├─────────────────┤
│    CUSTOMER     │ ← Basic user access
│                 │
└─────────────────┘
```

### Permission Matrix

```
┌─────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Permission  │ Customer │  Seller  │Moderator │  Admin   │SuperAdmin│
├─────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Read Products│    ✅    │    ✅    │    ✅    │    ✅    │    ✅    │
│ Create Order │    ✅    │    ❌    │    ❌    │    ❌    │    ❌    │
│ Manage Products│   ❌    │    ✅    │    ✅    │    ✅    │    ✅    │
│ View Analytics│   ❌    │    ✅    │    ✅    │    ✅    │    ✅    │
│ Manage Users │    ❌    │    ❌    │    ❌    │    ✅    │    ✅    │
│ System Admin │    ❌    │    ❌    │    ❌    │    ❌    │    ✅    │
└─────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

## Proposed Seller Authentication System

### Seller Registration Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Seller    │    │ Seller API  │    │  Database   │    │Verification │
│             │    │             │    │             │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. POST /register │                   │                   │
       │ (business info)   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Validate data  │                   │
       │                   │ 3. Create seller  │                   │
       │                   │    (pending)      │                   │
       │                   ├──────────────────►│                   │
       │                   │ 4. Submit docs    │                   │
       │                   ├──────────────────────────────────────►│
       │                   │ 5. Send email     │                   │
       │ 6. Registration   │                   │                   │
       │    submitted      │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │                   │ 7. Manual review  │                   │
       │                   │◄──────────────────────────────────────┤
       │                   │ 8. Update status  │                   │
       │                   ├──────────────────►│                   │
       │                   │ 9. Send result    │                   │
       │                   ├──────────────────────────────────────►│
```

### Seller Login with 2FA

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Seller    │    │ Seller API  │    │  Database   │    │   2FA       │
│             │    │             │    │             │    │  Service    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. POST /login    │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Find seller    │                   │
       │                   ├──────────────────►│                   │
       │                   │ 3. Verify password│                   │
       │                   │ 4. Check status   │                   │
       │                   │ 5. Generate 2FA   │                   │
       │                   ├──────────────────────────────────────►│
       │ 6. 2FA Required   │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 7. POST /verify-2fa│                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 8. Verify code    │                   │
       │                   ├──────────────────────────────────────►│
       │                   │ 9. Generate tokens│                   │
       │                   │ 10. Store refresh │                   │
       │                   ├──────────────────►│                   │
       │                   │ 11. Set cookie    │                   │
       │ 12. Login Success │                   │                   │
       │◄──────────────────┤                   │                   │
       │ {seller, token}   │                   │                   │
```

## Security Features

### Token Security

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login          │                   │
       ├──────────────────►│                   │
       │                   │ 2. Generate tokens│
       │                   │ 3. Store refresh  │
       │                   ├──────────────────►│
       │                   │ 4. Set HttpOnly   │
       │                   │    cookie         │
       │ 5. Access token   │                   │
       │◄──────────────────┤                   │
       │                   │                   │
       │ 6. API request    │                   │
       │ (Bearer token)    │                   │
       ├──────────────────►│                   │
       │                   │ 7. Verify token   │
       │                   │ 8. Get user       │
       │                   ├──────────────────►│
       │                   │ 9. Authorize      │
       │ 10. Response      │                   │
       │◄──────────────────┤                   │
```

### Rate Limiting

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │ Rate Limiter│    │   Auth API  │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login attempt  │                   │
       ├──────────────────►│                   │
       │                   │ 2. Check limit    │
       │                   │ 3. Allow/Block    │
       │                   ├──────────────────►│
       │                   │                   │
       │ 4a. Success       │                   │
       │◄──────────────────┤◄──────────────────┤
       │                   │                   │
       │ OR                │                   │
       │                   │                   │
       │ 4b. Rate Limited  │                   │
       │◄──────────────────┤                   │
       │ 429 Too Many      │                   │
       │    Requests       │                   │
```

## Error Handling

### Authentication Error Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Auth API  │    │  Database   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Login request  │                   │
       ├──────────────────►│                   │
       │                   │ 2. Find user      │
       │                   ├──────────────────►│
       │                   │ 3. User not found │
       │                   │◄──────────────────┤
       │                   │ 4. Increment      │
       │                   │    attempts       │
       │                   ├──────────────────►│
       │                   │ 5. Check limit    │
       │                   │ 6. Lock account   │
       │                   ├──────────────────►│
       │ 7. 401 Unauthorized│                   │
       │◄──────────────────┤                   │
       │ Invalid credentials│                   │
```

## Compliance & Audit

### Audit Logging Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Auth API  │    │  Database   │    │ Audit Log   │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Login request  │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Process login  │                   │
       │                   ├──────────────────►│                   │
       │                   │ 3. Login success  │                   │
       │                   │◄──────────────────┤                   │
       │                   │ 4. Log event      │                   │
       │                   ├──────────────────────────────────────►│
       │                   │ 5. Store audit    │                   │
       │                   │    record         │                   │
       │ 6. Success        │                   │                   │
       │◄──────────────────┤                   │                   │
```

### Data Privacy Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │   API       │    │  Database   │    │ Compliance  │
│             │    │             │    │             │    │   Engine    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Data request   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Check consent  │                   │
       │                   ├──────────────────►│                   │
       │                   │ 3. Verify GDPR    │                   │
       │                   ├──────────────────────────────────────►│
       │                   │ 4. Consent valid  │                   │
       │                   │◄──────────────────────────────────────┤
       │                   │ 5. Process data   │                   │
       │                   ├──────────────────►│                   │
       │                   │ 6. Return data    │                   │
       │                   │◄──────────────────┤                   │
       │ 7. Data response  │                   │                   │
       │◄──────────────────┤                   │                   │
```

These diagrams provide a visual representation of the authentication flows and help understand the system architecture and data flow between different components.
