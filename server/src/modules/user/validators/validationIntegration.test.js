const { expect } = require("chai");
const mongoose = require("mongoose");
const { userRegistrationSchema } = require("./user.schemas");
const User = require("../models/User.model");

describe("Validation Integration Tests", () => {
  before(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_TEST_URI ||
          "mongodb://localhost:27017/shopstream_test"
      );
    }
  });

  after(async () => {
    // Clean up test database
    await User.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe("Joi Validation", () => {
    it("should validate valid user registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "SecurePass123!",
        firstName: "John",
        lastName: "Doe",
        phone: "9876543210",
        marketingConsent: false,
      };

      const { error, value } = userRegistrationSchema.validate(validData);
      expect(error).to.be.undefined;
      expect(value.email).to.equal("test@example.com");
      expect(value.firstName).to.equal("John");
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "invalid-email",
        password: "SecurePass123!",
        firstName: "John",
        lastName: "Doe",
      };

      const { error } = userRegistrationSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error.details[0].message).to.include("valid email address");
    });

    it("should reject weak password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "weak",
        firstName: "John",
        lastName: "Doe",
      };

      const { error } = userRegistrationSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error.details[0].message).to.include("Password must contain");
    });

    it("should reject invalid phone number", () => {
      const invalidData = {
        email: "test@example.com",
        password: "SecurePass123!",
        firstName: "John",
        lastName: "Doe",
        phone: "1234567890", // Invalid Indian mobile number
      };

      const { error } = userRegistrationSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error.details[0].message).to.include("valid 10-digit");
    });
  });

  describe("Mongoose Validation", () => {
    it("should save valid user data", async () => {
      const userData = {
        email: "mongoose-test@example.com",
        password: "SecurePass123!",
        firstName: "Jane",
        lastName: "Smith",
        phone: "9876543210",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).to.exist;
      expect(savedUser.email).to.equal("mongoose-test@example.com");
      expect(savedUser.firstName).to.equal("Jane");
    });

    it("should reject duplicate email", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "SecurePass123!",
        firstName: "Test",
        lastName: "User",
      };

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same email
      const user2 = new User(userData);

      try {
        await user2.save();
        expect.fail("Should have thrown duplicate key error");
      } catch (error) {
        expect(error.code).to.equal(11000); // MongoDB duplicate key error
      }
    });

    it("should reject invalid email format at database level", async () => {
      const userData = {
        email: "invalid-email-format",
        password: "SecurePass123!",
        firstName: "Test",
        lastName: "User",
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error.name).to.equal("ValidationError");
      }
    });

    it("should reject invalid phone number format", async () => {
      const userData = {
        email: "phone-test@example.com",
        password: "SecurePass123!",
        firstName: "Test",
        lastName: "User",
        phone: "1234567890", // Invalid format
      };

      const user = new User(userData);

      try {
        await user.save();
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error.name).to.equal("ValidationError");
        expect(error.errors.phone.message).to.include("valid 10-digit");
      }
    });
  });

  describe("Validation Consistency", () => {
    it("should have consistent validation between Joi and Mongoose", () => {
      // Test that both layers reject the same invalid data
      const invalidData = {
        email: "invalid-email",
        password: "weak",
        firstName: "J", // Too short
        lastName: "D",
      };

      // Joi validation
      const { error: joiError } = userRegistrationSchema.validate(invalidData);
      expect(joiError).to.not.be.undefined;

      // Mongoose validation (simulate)
      const user = new User(invalidData);
      const mongooseError = user.validateSync();
      expect(mongooseError).to.not.be.undefined;
    });
  });
});
