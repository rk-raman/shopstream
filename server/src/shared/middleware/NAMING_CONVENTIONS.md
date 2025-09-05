# Module Validation Naming Conventions

This document defines the standard naming conventions for validation files across all modules in the application.

## 📁 **Standard File Structure**

Each module should follow this consistent structure:

```
📁 src/modules/{moduleName}/validators/
├── {moduleName}.validators.js      # Main validators (middleware functions)
├── {moduleName}.schemas.js         # Joi schemas only
├── {moduleName}.validators.test.js # Test files
└── README.md                       # Module-specific documentation
```

## 🎯 **File Naming Rules**

### 1. **Validators File**: `{moduleName}.validators.js`

- Contains all validation middleware functions
- Exports ready-to-use Express middleware
- Imports schemas from the schemas file
- Imports shared validation functions

**Example:**

```javascript
// user.validators.js
const {
  validateJoiBody,
  sanitizeMiddleware,
} = require("../../../shared/middleware/validation.middleware");
const { userRegistrationSchema } = require("./user.schemas");

const validateRegister = [
  sanitizeMiddleware,
  validateJoiBody(userRegistrationSchema),
];

module.exports = { validateRegister };
```

### 2. **Schemas File**: `{moduleName}.schemas.js`

- Contains only Joi schema definitions
- No middleware functions
- Reusable across different validators
- Can be imported by other modules if needed

**Example:**

```javascript
// user.schemas.js
const Joi = require("joi");
const {
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

const userRegistrationSchema = Joi.object({
  email: commonJoiPatterns.email.required(),
  password: commonJoiPatterns.strongPassword.required(),
  firstName: commonJoiPatterns.name.required(),
});

module.exports = { userRegistrationSchema };
```

### 3. **Test File**: `{moduleName}.validators.test.js`

- Tests all validation functions
- Tests both valid and invalid data
- Performance benchmarks
- Custom validation tests

### 4. **Documentation**: `README.md`

- Module-specific validation documentation
- Usage examples
- Schema descriptions
- Custom validation rules

## 📋 **Module Examples**

### User Module

```
📁 src/modules/user/validators/
├── user.validators.js
├── user.schemas.js
├── user.validators.test.js
└── README.md
```

### Product Module

```
📁 src/modules/product/validators/
├── product.validators.js
├── product.schemas.js
├── product.validators.test.js
└── README.md
```

### Order Module

```
📁 src/modules/order/validators/
├── order.validators.js
├── order.schemas.js
├── order.validators.test.js
└── README.md
```

### Payment Module

```
📁 src/modules/payment/validators/
├── payment.validators.js
├── payment.schemas.js
├── payment.validators.test.js
└── README.md
```

## 🔧 **Import Patterns**

### In Route Files

```javascript
// auth.routes.js
const {
  validateRegister,
  validateLogin,
} = require("../validators/user.validators");
```

### In Validator Files

```javascript
// user.validators.js
const {
  validateJoiBody,
  sanitizeMiddleware,
} = require("../../../shared/middleware/validation.middleware");
const { userRegistrationSchema } = require("./user.schemas");
```

### In Schema Files

```javascript
// user.schemas.js
const Joi = require("joi");
const {
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");
```

## 📝 **Naming Guidelines**

### 1. **Use kebab-case for file names**

- ✅ `user.validators.js`
- ✅ `product.schemas.js`
- ❌ `userValidators.js`
- ❌ `ProductSchemas.js`

### 2. **Use camelCase for function names**

- ✅ `validateUserRegistration`
- ✅ `validateProductCreate`
- ❌ `validate_user_registration`
- ❌ `ValidateProductCreate`

### 3. **Use PascalCase for schema names**

- ✅ `userRegistrationSchema`
- ✅ `productCreateSchema`
- ❌ `user_registration_schema`
- ❌ `userRegistration`

### 4. **Use descriptive names**

- ✅ `validateUserRegistration`
- ✅ `validateProductImageUpload`
- ❌ `validate1`
- ❌ `validateUser`

## 🚀 **Migration Guide**

### From Old Naming to New Naming

1. **Rename files:**

   ```bash
   # Old → New
   joiValidators.js → {moduleName}.validators.js
   joiSchemas.js → {moduleName}.schemas.js
   testJoiValidation.js → {moduleName}.validators.test.js
   ```

2. **Update imports:**

   ```javascript
   // Old
   const { validateRegister } = require("../validators/joiValidators");
   const { userSchema } = require("./joiSchemas");

   // New
   const { validateRegister } = require("../validators/user.validators");
   const { userSchema } = require("./user.schemas");
   ```

3. **Update documentation:**
   - Update README files
   - Update import examples
   - Update file references

## ✅ **Benefits of This Convention**

1. **Consistency**: Same pattern across all modules
2. **Discoverability**: Easy to find related files
3. **Scalability**: Works for any module size
4. **Maintainability**: Clear separation of concerns
5. **Reusability**: Schemas can be shared between modules
6. **Testing**: Dedicated test files for each module

## 🔍 **File Responsibilities**

### `{moduleName}.validators.js`

- ✅ Express middleware functions
- ✅ Validation logic composition
- ✅ Error handling
- ❌ Schema definitions
- ❌ Business logic

### `{moduleName}.schemas.js`

- ✅ Joi schema definitions
- ✅ Validation rules
- ✅ Custom validators
- ❌ Express middleware
- ❌ Route handling

### `{moduleName}.validators.test.js`

- ✅ Unit tests for validators
- ✅ Performance benchmarks
- ✅ Edge case testing
- ❌ Integration tests
- ❌ E2E tests

## 📚 **Best Practices**

1. **Keep schemas pure**: No side effects, only validation rules
2. **Compose validators**: Combine multiple validation functions
3. **Use common patterns**: Leverage shared validation patterns
4. **Test thoroughly**: Cover all validation scenarios
5. **Document clearly**: Explain complex validation rules
6. **Version schemas**: Consider backward compatibility

## 🎯 **Quick Start Template**

### 1. Create the files:

```bash
mkdir src/modules/{moduleName}/validators
touch src/modules/{moduleName}/validators/{moduleName}.validators.js
touch src/modules/{moduleName}/validators/{moduleName}.schemas.js
touch src/modules/{moduleName}/validators/{moduleName}.validators.test.js
touch src/modules/{moduleName}/validators/README.md
```

### 2. Basic schema file:

```javascript
// {moduleName}.schemas.js
const Joi = require("joi");
const { commonJoiPatterns } = require("../../../shared/middleware/validation.middleware");

const {moduleName}CreateSchema = Joi.object({
  name: Joi.string().min(2).required(),
  // Add more fields...
});

module.exports = { {moduleName}CreateSchema };
```

### 3. Basic validator file:

```javascript
// {moduleName}.validators.js
const { validateJoiBody, sanitizeMiddleware } = require("../../../shared/middleware/validation.middleware");
const { {moduleName}CreateSchema } = require("./{moduleName}.schemas");

const validate{ModuleName}Create = [
  sanitizeMiddleware,
  validateJoiBody({moduleName}CreateSchema),
];

module.exports = { validate{ModuleName}Create };
```

### 4. Basic test file:

```javascript
// {moduleName}.validators.test.js
const { validate{ModuleName}Create } = require("./{moduleName}.validators");

// Add your tests here...
```

This naming convention ensures consistency, maintainability, and scalability across your entire application!
