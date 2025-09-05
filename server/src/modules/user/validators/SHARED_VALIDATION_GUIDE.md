# Shared Validation System Guide

This guide explains how to use the shared validation system that eliminates duplication between Joi and Mongoose validations in the user module.

## Overview

The shared validation system provides a centralized way to define validation rules that can be used by both:

- **Joi validation** (API layer)
- **Mongoose validation** (Database layer)

This eliminates code duplication and ensures consistency between validation layers.

## File Structure

```
validators/
├── sharedValidation.js          # Core shared validation configuration
├── user.schemas.js             # Joi schemas using shared validation
├── sharedValidation.test.js    # Unit tests for shared validation
└── validationIntegration.test.js # Integration tests
```

## Usage

### 1. Using Shared Validation in Joi Schemas

```javascript
const { getJoiValidation, createJoiSchema } = require("./sharedValidation");

// Method 1: Individual field validation
const emailValidation = getJoiValidation("email", true); // required
const phoneValidation = getJoiValidation("phone", false); // optional

// Method 2: Schema creation
const userSchema = createJoiSchema({
  email: true, // required email
  password: true, // required password
  phone: false, // optional phone
  firstName: { required: true, field: "name" }, // required name validation
  lastName: { required: true, field: "name" }, // required name validation
});
```

### 2. Using Shared Validation in Mongoose Models

```javascript
const {
  getMongooseValidation,
  createMongooseFields,
} = require("./sharedValidation");

// Method 1: Individual field validation
const emailField = getMongooseValidation("email");
const phoneField = getMongooseValidation("phone", { index: true }); // with overrides

// Method 2: Multiple fields
const userFields = createMongooseFields({
  email: true,
  password: false,
  firstName: { required: true, field: "name" },
});

const userSchema = new mongoose.Schema({
  ...userFields,
  // other fields...
});
```

## Available Validation Rules

### Core Fields

| Field              | Joi Validation                | Mongoose Validation                       | Description         |
| ------------------ | ----------------------------- | ----------------------------------------- | ------------------- |
| `email`            | Email format, lowercase, trim | String, required, unique, lowercase, trim | Email validation    |
| `password`         | Min 8 chars, complexity rules | String, conditional required              | Password validation |
| `name`             | Min 2, max 50, letters only   | String, required, trim, maxlength         | Name validation     |
| `phone`            | Indian mobile format          | String, unique, sparse, match             | Phone validation    |
| `dateOfBirth`      | Date, age 13-120              | Date, not future                          | Date of birth       |
| `gender`           | Enum: male/female/other       | Enum: male/female/other                   | Gender validation   |
| `role`             | Enum: customer/seller/admin   | Enum: customer/seller/admin               | User role           |
| `objectId`         | MongoDB ObjectId format       | ObjectId, ref validation                  | ObjectId validation |
| `pincode`          | 6-digit Indian pincode        | String, required, match                   | Pincode validation  |
| `marketingConsent` | Boolean                       | Boolean, default false                    | Marketing consent   |

### Field Mapping

Some fields can be mapped to shared validation rules:

```javascript
// firstName and lastName both use "name" validation
firstName: { required: true, field: "name" }
lastName: { required: true, field: "name" }
```

## Adding New Validation Rules

### 1. Add to sharedValidation.js

```javascript
const sharedValidation = {
  // ... existing rules ...

  newField: {
    joi: Joi.string().min(3).max(50).messages({
      "string.min": "Field must be at least 3 characters",
      "string.max": "Field cannot exceed 50 characters",
    }),
    mongoose: {
      type: String,
      required: [true, "Field is required"],
      minlength: [3, "Field must be at least 3 characters"],
      maxlength: [50, "Field cannot exceed 50 characters"],
    },
  },
};
```

### 2. Use in Schemas

```javascript
// Joi schema
const newFieldValidation = getJoiValidation("newField", true);

// Mongoose schema
const newFieldMongoose = getMongooseValidation("newField");
```

## Benefits

### 1. **Eliminates Duplication**

- Single source of truth for validation rules
- No need to maintain validation logic in two places

### 2. **Ensures Consistency**

- Both API and database layers use identical validation rules
- Reduces bugs from inconsistent validation

### 3. **Easier Maintenance**

- Update validation rules in one place
- Changes automatically apply to both layers

### 4. **Better Testing**

- Centralized validation logic is easier to test
- Integration tests ensure both layers work correctly

## Migration Guide

### Before (Duplicated Validation)

```javascript
// user.schemas.js
const emailValidation = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  });

// User.model.js
email: {
  type: String,
  required: [true, "Email is required"],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
  index: true,
},
```

### After (Shared Validation)

```javascript
// user.schemas.js
const emailValidation = getJoiValidation("email", true);

// User.model.js
email: getMongooseValidation("email"),
```

## Testing

### Unit Tests

```bash
npm test -- sharedValidation.test.js
```

### Integration Tests

```bash
npm test -- validationIntegration.test.js
```

## Best Practices

1. **Keep Validation Rules Simple**: Focus on essential validation only
2. **Use Overrides Sparingly**: Only when you need to modify shared behavior
3. **Test Both Layers**: Ensure Joi and Mongoose validation work consistently
4. **Document New Rules**: Add comments explaining complex validation logic
5. **Version Control**: Track changes to shared validation rules carefully

## Troubleshooting

### Common Issues

1. **Field Not Found Error**

   ```
   Error: No shared validation found for field: unknownField
   ```

   **Solution**: Add the field to `sharedValidation.js` or check field name spelling

2. **Validation Inconsistency**

   ```
   Joi accepts data but Mongoose rejects it
   ```

   **Solution**: Check that both validation rules are identical in `sharedValidation.js`

3. **Override Not Working**
   ```
   Mongoose field doesn't have expected properties
   ```
   **Solution**: Ensure overrides are passed correctly to `getMongooseValidation()`

### Debug Tips

1. **Check Validation Rules**: Use `console.log(sharedValidation.fieldName)` to inspect rules
2. **Test Individually**: Test Joi and Mongoose validation separately
3. **Use Integration Tests**: Run integration tests to catch consistency issues
