# Shared Validation Middleware

This directory contains reusable validation middleware that can be used across all modules in the application.

> 📋 **Naming Conventions**: See [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) for standard file naming patterns across all modules.

## Overview

The validation middleware provides both **Joi-based validation** (recommended) and **Express-validator** (legacy) for request validation. It includes common patterns, sanitization, file validation, and custom validation capabilities.

## Quick Start

```javascript
const {
  validateJoiBody,
  validateJoiQuery,
  validateJoiParams,
  validateFile,
  sanitizeMiddleware,
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

const Joi = require("joi");

// Create a schema
const userSchema = Joi.object({
  email: commonJoiPatterns.email.required(),
  name: commonJoiPatterns.name.required(),
  phone: commonJoiPatterns.phone.optional(),
});

// Create validator
const validateUser = [sanitizeMiddleware, validateJoiBody(userSchema)];

// Use in routes
router.post("/users", validateUser, userController.createUser);
```

## Available Functions

### Joi Validation Functions

#### `validateJoi(schema, source, options)`

Generic validation function that can validate any request source.

**Parameters:**

- `schema` (Object): Joi schema to validate against
- `source` (string): Source of data ('body', 'query', 'params')
- `options` (Object): Additional validation options

**Example:**

```javascript
const schema = Joi.object({ name: Joi.string().required() });
const validator = validateJoi(schema, "body");
```

#### `validateJoiBody(schema, options)`

Validates request body data.

**Example:**

```javascript
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
const validateUser = validateJoiBody(userSchema);
```

#### `validateJoiQuery(schema, options)`

Validates query parameters.

**Example:**

```javascript
const searchSchema = Joi.object({
  q: Joi.string().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
});
const validateSearch = validateJoiQuery(searchSchema);
```

#### `validateJoiParams(schema, options)`

Validates route parameters.

**Example:**

```javascript
const idSchema = Joi.object({
  id: commonJoiPatterns.objectId.required(),
});
const validateId = validateJoiParams(idSchema);
```

#### `validateJoiMultiple(schemas, options)`

Validates multiple sources at once.

**Example:**

```javascript
const schemas = {
  body: userSchema,
  query: paginationSchema,
  params: idSchema,
};
const validateMultiple = validateJoiMultiple(schemas);
```

#### `validateJoiConditional(condition, schema, source, options)`

Conditional validation based on request data.

**Example:**

```javascript
const validateConditional = validateJoiConditional(
  (req) => req.body.type === "premium",
  premiumUserSchema,
  "body"
);
```

### File Validation

#### `validateFile(options)`

Validates file uploads.

**Options:**

- `required` (boolean): Whether file is required (default: true)
- `allowedTypes` (array): Allowed MIME types
- `maxSize` (number): Maximum file size in bytes
- `fieldName` (string): Field name for file (default: "file")

**Example:**

```javascript
const validateAvatar = validateFile({
  required: false,
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 2 * 1024 * 1024, // 2MB
  fieldName: "avatar",
});
```

### Custom Validation

#### `validateCustom(validator, errorMessage)`

Custom business logic validation.

**Example:**

```javascript
const validatePasswordMatch = validateCustom(
  (req) => req.body.password === req.body.confirmPassword,
  "Passwords do not match"
);
```

#### `validateRateLimit(options)`

Basic rate limiting validation.

**Example:**

```javascript
const validateRateLimit = validateRateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (req) => req.ip,
});
```

### Sanitization

#### `sanitizeMiddleware`

Pre-validation sanitization to prevent XSS attacks.

**Example:**

```javascript
const validateWithSanitization = [
  sanitizeMiddleware,
  validateJoiBody(userSchema),
];
```

## Common Joi Patterns

The middleware includes pre-defined common patterns for reuse:

### `commonJoiPatterns.email`

Email validation with proper formatting.

```javascript
const emailSchema = commonJoiPatterns.email.required();
```

### `commonJoiPatterns.strongPassword`

Strong password validation.

```javascript
const passwordSchema = commonJoiPatterns.strongPassword.required();
```

### `commonJoiPatterns.name`

Name validation (letters and spaces only).

```javascript
const nameSchema = commonJoiPatterns.name.required();
```

### `commonJoiPatterns.phone`

Indian mobile number validation.

```javascript
const phoneSchema = commonJoiPatterns.phone.required();
```

### `commonJoiPatterns.objectId`

MongoDB ObjectId validation.

```javascript
const idSchema = commonJoiPatterns.objectId.required();
```

### `commonJoiPatterns.pincode`

Indian pincode validation.

```javascript
const pincodeSchema = commonJoiPatterns.pincode.required();
```

### `commonJoiPatterns.dateOfBirth`

Date of birth with age validation.

```javascript
const dobSchema = commonJoiPatterns.dateOfBirth.required();
```

### `commonJoiPatterns.pagination`

Standard pagination parameters.

```javascript
const paginationSchema = commonJoiPatterns.pagination;
```

## Module Implementation Examples

### User Module

```javascript
// src/modules/user/validators/user.validators.js
const {
  validateJoiBody,
  validateJoiParams,
  sanitizeMiddleware,
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

const Joi = require("joi");

const userRegistrationSchema = Joi.object({
  email: commonJoiPatterns.email.required(),
  password: commonJoiPatterns.strongPassword.required(),
  firstName: commonJoiPatterns.name.required(),
  lastName: commonJoiPatterns.name.required(),
  phone: commonJoiPatterns.phone.optional(),
  acceptTerms: Joi.boolean().valid(true).required(),
});

const validateRegister = [
  sanitizeMiddleware,
  validateJoiBody(userRegistrationSchema),
];

module.exports = { validateRegister };
```

### Product Module

```javascript
// src/modules/product/validators/product.validators.js
const {
  validateJoiBody,
  validateJoiQuery,
  validateFile,
  sanitizeMiddleware,
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

const Joi = require("joi");

const productCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().required(),
  categoryId: commonJoiPatterns.objectId.required(),
  stock: Joi.number().integer().min(0).required(),
});

const validateProductCreate = [
  sanitizeMiddleware,
  validateJoiBody(productCreateSchema),
];

const validateProductImage = validateFile({
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024,
});

module.exports = { validateProductCreate, validateProductImage };
```

### Order Module

```javascript
// src/modules/order/validators/order.validators.js
const {
  validateJoiBody,
  validateJoiParams,
  validateCustom,
  sanitizeMiddleware,
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

const Joi = require("joi");

const orderCreateSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: commonJoiPatterns.objectId.required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddressId: commonJoiPatterns.objectId.required(),
  paymentMethod: Joi.string().valid("card", "upi", "cod").required(),
});

const validateOrderCreate = [
  sanitizeMiddleware,
  validateJoiBody(orderCreateSchema),
  validateCustom(
    (req) => req.body.items.length > 0,
    "Order must contain at least one item"
  ),
];

module.exports = { validateOrderCreate };
```

## Error Handling

The validation middleware automatically formats errors and throws `ApiError` instances with:

- **Status Code**: 400 (Bad Request)
- **Error Code**: `VALIDATION_ERROR`
- **Message**: User-friendly error message
- **Details**: Array of specific field errors

**Error Response Format:**

```json
{
  "success": false,
  "message": "Validation failed: Email is required, Password must be at least 8 characters long",
  "errorCode": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Email is required",
      "value": "",
      "type": "any.required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "weak",
      "type": "string.min"
    }
  ]
}
```

## Best Practices

### 1. Always Use Sanitization

```javascript
const validateUser = [
  sanitizeMiddleware, // Always include this first
  validateJoiBody(userSchema),
];
```

### 2. Use Common Patterns

```javascript
// Good
const schema = Joi.object({
  email: commonJoiPatterns.email.required(),
  phone: commonJoiPatterns.phone.optional(),
});

// Avoid
const schema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional(),
});
```

### 3. Combine Validators

```javascript
const validateUserWithAvatar = [
  sanitizeMiddleware,
  validateJoiBody(userSchema),
  validateFile({
    required: false,
    allowedTypes: ["image/jpeg", "image/png"],
    maxSize: 2 * 1024 * 1024,
  }),
];
```

### 4. Use Conditional Validation

```javascript
const validateUserUpdate = validateJoiConditional(
  (req) => req.body.email !== undefined,
  emailUpdateSchema,
  "body"
);
```

### 5. Custom Error Messages

```javascript
const schema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
});
```

## Migration from Express-validator

If you're migrating from express-validator, here's a comparison:

### Before (Express-validator)

```javascript
const { body, validationResult } = require("express-validator");

const validateUser = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

### After (Joi)

```javascript
const {
  validateJoiBody,
  sanitizeMiddleware,
} = require("../../../shared/middleware/validation.middleware");

const userSchema = Joi.object({
  email: commonJoiPatterns.email.required(),
  password: commonJoiPatterns.strongPassword.required(),
});

const validateUser = [sanitizeMiddleware, validateJoiBody(userSchema)];
```

## Performance Considerations

- Joi validation is highly optimized and performs well
- Sanitization adds minimal overhead
- File validation only runs when files are present
- Rate limiting uses in-memory storage (consider Redis for production)

## Testing

You can test your validators using the shared test utilities:

```javascript
const {
  validateJoiBody,
} = require("../../../shared/middleware/validation.middleware");

// Test valid data
const validData = { email: "test@example.com", password: "SecurePass123!" };
const validator = validateJoiBody(userSchema);

// Test invalid data
const invalidData = { email: "invalid", password: "weak" };
```

## Support

For questions or issues with the validation middleware, please refer to:

- [Joi Documentation](https://joi.dev/api/)
- [Express-validator Documentation](https://express-validator.github.io/docs/)
- Internal API documentation for error codes and status codes
