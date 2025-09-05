/**
 * Test file to demonstrate Joi validation implementation
 * Run this file to test the validation schemas
 */

const {
  userRegistrationSchema,
  userLoginSchema,
  changePasswordSchema,
  addressSchema,
  wishlistSchema,
} = require("./user.schemas");

// Test data samples
const testData = {
  validRegistration: {
    email: "test@example.com",
    password: "SecurePass123!",
    firstName: "John",
    lastName: "Doe",
    phone: "9876543210",
    marketingConsent: false,
  },

  invalidRegistration: {
    email: "invalid-email",
    password: "weak",
    firstName: "J",
    lastName: "",
    phone: "1234567890",
  },

  validLogin: {
    email: "test@example.com",
    password: "SecurePass123!",
    rememberMe: true,
  },

  invalidLogin: {
    email: "invalid-email",
    password: "",
  },

  validChangePassword: {
    currentPassword: "OldPass123!",
    newPassword: "NewSecurePass123!",
    confirmPassword: "NewSecurePass123!",
  },

  invalidChangePassword: {
    currentPassword: "OldPass123!",
    newPassword: "weak",
    confirmPassword: "different",
  },

  validAddress: {
    type: "home",
    fullName: "John Doe",
    addressLine1: "123 Main Street, Apartment 4B",
    addressLine2: "Near Central Park",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    phone: "9876543210",
    landmark: "Opposite Metro Station",
    isDefault: true,
    coordinates: {
      latitude: 19.076,
      longitude: 72.8777,
    },
  },

  invalidAddress: {
    type: "invalid",
    fullName: "J",
    addressLine1: "Short",
    city: "M",
    state: "M",
    pincode: "12345",
    phone: "1234567890",
  },

  validWishlist: {
    productId: "507f1f77bcf86cd799439011",
  },

  invalidWishlist: {
    productId: "invalid-id",
  },
};

// Test function
function testValidation(schema, data, testName) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log("📝 Input:", JSON.stringify(data, null, 2));

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    console.log("❌ Validation Failed");
    console.log("🚨 Errors:");
    error.details.forEach((detail, index) => {
      console.log(
        `   ${index + 1}. ${detail.path.join(".")}: ${detail.message}`
      );
    });
  } else {
    console.log("✅ Validation Passed");
    console.log("✨ Sanitized Output:", JSON.stringify(value, null, 2));
  }

  return { error, value };
}

// Run all tests
function runAllTests() {
  console.log("🚀 Starting Joi Validation Tests\n");
  console.log("=".repeat(50));

  // Registration tests
  testValidation(
    userRegistrationSchema,
    testData.validRegistration,
    "Valid User Registration"
  );
  testValidation(
    userRegistrationSchema,
    testData.invalidRegistration,
    "Invalid User Registration"
  );

  // Login tests
  testValidation(userLoginSchema, testData.validLogin, "Valid User Login");
  testValidation(userLoginSchema, testData.invalidLogin, "Invalid User Login");

  // Change password tests
  testValidation(
    changePasswordSchema,
    testData.validChangePassword,
    "Valid Change Password"
  );
  testValidation(
    changePasswordSchema,
    testData.invalidChangePassword,
    "Invalid Change Password"
  );

  // Address tests
  testValidation(addressSchema, testData.validAddress, "Valid Address");
  testValidation(addressSchema, testData.invalidAddress, "Invalid Address");

  // Wishlist tests
  testValidation(wishlistSchema, testData.validWishlist, "Valid Wishlist");
  testValidation(wishlistSchema, testData.invalidWishlist, "Invalid Wishlist");

  console.log("\n" + "=".repeat(50));
  console.log("🏁 All tests completed!");
}

// Performance test
function performanceTest() {
  console.log("\n⚡ Performance Test");
  console.log("=".repeat(30));

  const iterations = 1000;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    userRegistrationSchema.validate(testData.validRegistration);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;

  console.log(`📊 Validated ${iterations} registrations in ${totalTime}ms`);
  console.log(`📈 Average time per validation: ${avgTime.toFixed(4)}ms`);
  console.log(`🚀 Validations per second: ${Math.round(1000 / avgTime)}`);
}

// Custom validation test
function customValidationTest() {
  console.log("\n🔧 Custom Validation Test");
  console.log("=".repeat(35));

  // Test custom phone validation
  const phoneSchema = require("./user.schemas").commonPatterns.phone;

  const phoneTests = [
    { phone: "9876543210", expected: true },
    { phone: "1234567890", expected: false }, // starts with 1
    { phone: "987654321", expected: false }, // too short
    { phone: "98765432101", expected: false }, // too long
    { phone: "abc1234567", expected: false }, // contains letters
  ];

  phoneTests.forEach(({ phone, expected }) => {
    const { error } = phoneSchema.validate(phone);
    const isValid = !error;
    const status = isValid === expected ? "✅" : "❌";
    console.log(
      `${status} Phone: ${phone} - Expected: ${expected}, Got: ${isValid}`
    );
  });
}

// Export for use in other files
module.exports = {
  testValidation,
  runAllTests,
  performanceTest,
  customValidationTest,
  testData,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
  performanceTest();
  customValidationTest();
}
