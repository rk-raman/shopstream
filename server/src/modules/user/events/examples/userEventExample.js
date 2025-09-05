/**
 * User Event Architecture Example
 *
 * This file demonstrates how to use the new event-driven architecture
 * for user operations
 */

const UserEventPublisher = require("../publishers/UserEventPublisher");
const UserSubscriberManager = require("../subscribers/UserSubscriberManager");
const {
  EventBusFactory,
} = require("../../../../shared/events/eventBusFactory");

class UserEventExample {
  constructor() {
    this.eventBus = null;
    this.userEventPublisher = null;
    this.userSubscriberManager = null;
  }

  async initialize() {
    // Initialize event bus
    this.eventBus = await EventBusFactory.createAndInitialize();

    // Initialize event publisher
    this.userEventPublisher = new UserEventPublisher();

    // Initialize subscriber manager
    this.userSubscriberManager = new UserSubscriberManager();
    await this.userSubscriberManager.initialize();

    console.log("User event example initialized");
  }

  async demonstrateUserRegistration() {
    console.log("\n=== User Registration Example ===");

    const userData = {
      userId: "user_12345",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "customer",
      registrationMethod: "email",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "192.168.1.100",
      referrer: "https://google.com",
    };

    // Publish user registration event
    const eventId = await this.userEventPublisher.publishUserRegistered(
      userData
    );
    console.log(`User registration event published with ID: ${eventId}`);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("User registration event processed by all subscribers");
  }

  async demonstrateUserProfileUpdate() {
    console.log("\n=== User Profile Update Example ===");

    const updateData = {
      userId: "user_12345",
      changes: {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1234567890",
      },
      updatedBy: "user_12345",
    };

    // Publish user update event
    const eventId = await this.userEventPublisher.publishUserUpdated(
      updateData
    );
    console.log(`User update event published with ID: ${eventId}`);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("User update event processed by all subscribers");
  }

  async demonstrateAddressManagement() {
    console.log("\n=== Address Management Example ===");

    // Add address
    const addressData = {
      userId: "user_12345",
      addressId: "addr_001",
      addressType: "home",
      city: "New York",
      state: "NY",
      pincode: "10001",
    };

    const addEventId = await this.userEventPublisher.publishAddressAdded(
      addressData
    );
    console.log(`Address added event published with ID: ${addEventId}`);

    // Update address
    const updateAddressData = {
      userId: "user_12345",
      addressId: "addr_001",
      changes: {
        city: "Brooklyn",
        pincode: "11201",
      },
    };

    const updateEventId = await this.userEventPublisher.publishAddressUpdated(
      updateAddressData
    );
    console.log(`Address updated event published with ID: ${updateEventId}`);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Address management events processed by all subscribers");
  }

  async demonstrateWishlistOperations() {
    console.log("\n=== Wishlist Operations Example ===");

    // Add to wishlist
    const wishlistData = {
      userId: "user_12345",
      productId: "prod_001",
      productCategory: "electronics",
      productPrice: 299.99,
    };

    const addEventId = await this.userEventPublisher.publishWishlistItemAdded(
      wishlistData
    );
    console.log(`Wishlist item added event published with ID: ${addEventId}`);

    // Remove from wishlist
    const removeData = {
      userId: "user_12345",
      productId: "prod_001",
    };

    const removeEventId =
      await this.userEventPublisher.publishWishlistItemRemoved(removeData);
    console.log(
      `Wishlist item removed event published with ID: ${removeEventId}`
    );

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Wishlist operation events processed by all subscribers");
  }

  async demonstrateSecurityEvents() {
    console.log("\n=== Security Events Example ===");

    // Password changed
    const passwordData = {
      userId: "user_12345",
      changeMethod: "user_initiated",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };

    const passwordEventId =
      await this.userEventPublisher.publishPasswordChanged(passwordData);
    console.log(`Password changed event published with ID: ${passwordEventId}`);

    // Email verified
    const emailData = {
      userId: "user_12345",
      email: "john.doe@example.com",
      verificationMethod: "email_link",
    };

    const emailEventId = await this.userEventPublisher.publishEmailVerified(
      emailData
    );
    console.log(`Email verified event published with ID: ${emailEventId}`);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Security events processed by all subscribers");
  }

  async demonstrateAccountStatusChanges() {
    console.log("\n=== Account Status Changes Example ===");

    // User activated
    const activateData = {
      userId: "user_12345",
      activatedBy: "admin_001",
      reason: "manual_activation",
    };

    const activateEventId = await this.userEventPublisher.publishUserActivated(
      activateData
    );
    console.log(`User activated event published with ID: ${activateEventId}`);

    // Role changed
    const roleData = {
      userId: "user_12345",
      oldRole: "customer",
      newRole: "premium",
      changedBy: "admin_001",
      reason: "upgrade_request",
    };

    const roleEventId = await this.userEventPublisher.publishUserRoleChanged(
      roleData
    );
    console.log(`User role changed event published with ID: ${roleEventId}`);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Account status change events processed by all subscribers");
  }

  async getHealthStatus() {
    console.log("\n=== Health Status ===");

    // Event bus health
    const eventBusHealth = await this.eventBus.getHealth();
    console.log("Event Bus Health:", eventBusHealth);

    // Subscriber manager health
    const subscriberHealth = await this.userSubscriberManager.healthCheck();
    console.log("Subscriber Manager Health:", subscriberHealth);
  }

  async cleanup() {
    if (this.userSubscriberManager) {
      await this.userSubscriberManager.cleanup();
    }

    if (this.eventBus) {
      await this.eventBus.shutdown();
    }

    console.log("User event example cleaned up");
  }

  async runAllExamples() {
    try {
      await this.initialize();

      await this.demonstrateUserRegistration();
      await this.demonstrateUserProfileUpdate();
      await this.demonstrateAddressManagement();
      await this.demonstrateWishlistOperations();
      await this.demonstrateSecurityEvents();
      await this.demonstrateAccountStatusChanges();

      await this.getHealthStatus();
    } catch (error) {
      console.error("Error running examples:", error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  const example = new UserEventExample();
  example.runAllExamples().catch(console.error);
}

module.exports = UserEventExample;
