/**
 * Integration Tests for User Event-Driven Architecture
 *
 * Tests the complete event-driven flow for user operations
 */

const { EventBusFactory } = require("../../src/shared/events/eventBusFactory");
const UserEventPublisher = require("../../src/modules/user/events/publishers/UserEventPublisher");
const UserSubscriberManager = require("../../src/modules/user/events/subscribers/UserSubscriberManager");
const { USER_EVENTS } = require("../../src/shared/events/eventDefinitions");

describe("User Event-Driven Architecture Integration Tests", () => {
  let eventBus;
  let userEventPublisher;
  let userSubscriberManager;
  let capturedEvents = [];

  beforeAll(async () => {
    // Create a test event bus
    eventBus = await EventBusFactory.createAndInitialize({
      maxListeners: 100,
    });

    // Initialize event publisher
    userEventPublisher = new UserEventPublisher();

    // Initialize subscriber manager
    userSubscriberManager = new UserSubscriberManager();
    await userSubscriberManager.initialize();

    // Capture all events for testing
    eventBus.subscribe("*", (eventPayload) => {
      capturedEvents.push(eventPayload);
    });
  });

  afterAll(async () => {
    await userSubscriberManager.cleanup();
    await eventBus.shutdown();
  });

  beforeEach(() => {
    capturedEvents = [];
  });

  describe("Event Bus Abstraction", () => {
    test("should create event bus successfully", () => {
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.publish).toBe("function");
      expect(typeof eventBus.subscribe).toBe("function");
    });

    test("should publish and receive events", async () => {
      const testEvent = "test.event";
      const testData = { message: "Hello World" };

      let receivedEvent = null;
      await eventBus.subscribe(testEvent, (eventPayload) => {
        receivedEvent = eventPayload;
      });

      await eventBus.publish(testEvent, testData);

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.data).toEqual(testData);
      expect(receivedEvent.eventType).toBe(testEvent);
    });
  });

  describe("User Event Publisher", () => {
    test("should publish user registered event with correct schema", async () => {
      const userData = {
        userId: "user123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "customer",
        registrationMethod: "email",
        userAgent: "Mozilla/5.0",
        ipAddress: "192.168.1.1",
        referrer: "https://google.com",
      };

      await userEventPublisher.publishUserRegistered(userData);

      // Check if event was captured
      const userRegisteredEvents = capturedEvents.filter(
        (event) => event.eventType === USER_EVENTS.USER_REGISTERED.name
      );

      expect(userRegisteredEvents).toHaveLength(1);

      const event = userRegisteredEvents[0];
      expect(event.data.userId).toBe(userData.userId);
      expect(event.data.email).toBe(userData.email);
      expect(event.data.firstName).toBe(userData.firstName);
      expect(event.data.lastName).toBe(userData.lastName);
      expect(event.data.role).toBe(userData.role);
      expect(event.data.registrationMethod).toBe(userData.registrationMethod);
      expect(event.data.metadata.userAgent).toBe(userData.userAgent);
      expect(event.data.metadata.ipAddress).toBe(userData.ipAddress);
      expect(event.data.metadata.referrer).toBe(userData.referrer);
    });

    test("should publish user updated event with correct schema", async () => {
      const userData = {
        userId: "user123",
        changes: { firstName: "Jane", lastName: "Smith" },
        updatedBy: "user123",
      };

      await userEventPublisher.publishUserUpdated(userData);

      const userUpdatedEvents = capturedEvents.filter(
        (event) => event.eventType === USER_EVENTS.USER_UPDATED.name
      );

      expect(userUpdatedEvents).toHaveLength(1);

      const event = userUpdatedEvents[0];
      expect(event.data.userId).toBe(userData.userId);
      expect(event.data.changes).toEqual(userData.changes);
      expect(event.data.updatedBy).toBe(userData.updatedBy);
    });

    test("should publish address added event with correct schema", async () => {
      const addressData = {
        userId: "user123",
        addressId: "addr123",
        addressType: "home",
        city: "New York",
        state: "NY",
        pincode: "10001",
      };

      await userEventPublisher.publishAddressAdded(addressData);

      const addressAddedEvents = capturedEvents.filter(
        (event) => event.eventType === USER_EVENTS.ADDRESS_ADDED.name
      );

      expect(addressAddedEvents).toHaveLength(1);

      const event = addressAddedEvents[0];
      expect(event.data.userId).toBe(addressData.userId);
      expect(event.data.addressId).toBe(addressData.addressId);
      expect(event.data.addressType).toBe(addressData.addressType);
      expect(event.data.city).toBe(addressData.city);
      expect(event.data.state).toBe(addressData.state);
      expect(event.data.pincode).toBe(addressData.pincode);
    });

    test("should publish wishlist item added event with correct schema", async () => {
      const wishlistData = {
        userId: "user123",
        productId: "prod123",
        productCategory: "electronics",
        productPrice: 299.99,
      };

      await userEventPublisher.publishWishlistItemAdded(wishlistData);

      const wishlistAddedEvents = capturedEvents.filter(
        (event) => event.eventType === USER_EVENTS.WISHLIST_ITEM_ADDED.name
      );

      expect(wishlistAddedEvents).toHaveLength(1);

      const event = wishlistAddedEvents[0];
      expect(event.data.userId).toBe(wishlistData.userId);
      expect(event.data.productId).toBe(wishlistData.productId);
      expect(event.data.productCategory).toBe(wishlistData.productCategory);
      expect(event.data.productPrice).toBe(wishlistData.productPrice);
    });
  });

  describe("Event Subscribers", () => {
    test("should handle user registered event with all subscribers", async () => {
      const userData = {
        userId: "user123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "customer",
        registrationMethod: "email",
        userAgent: "Mozilla/5.0",
        ipAddress: "192.168.1.1",
        referrer: "https://google.com",
      };

      await userEventPublisher.publishUserRegistered(userData);

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that notification events were triggered
      const notificationEvents = capturedEvents.filter(
        (event) => event.eventType === "notification.send_email"
      );
      expect(notificationEvents.length).toBeGreaterThan(0);

      // Check that analytics events were triggered
      const analyticsEvents = capturedEvents.filter((event) =>
        event.eventType.startsWith("analytics.")
      );
      expect(analyticsEvents.length).toBeGreaterThan(0);

      // Check that marketing events were triggered
      const marketingEvents = capturedEvents.filter((event) =>
        event.eventType.startsWith("marketing.")
      );
      expect(marketingEvents.length).toBeGreaterThan(0);
    });

    test("should handle user login failed event with security alerts", async () => {
      const loginData = {
        email: "test@example.com",
        attemptCount: 3,
        userAgent: "Mozilla/5.0",
        ipAddress: "192.168.1.1",
        failureReason: "invalid_credentials",
      };

      await userEventPublisher.publishUserLoginFailed(loginData);

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that security alert was sent
      const securityAlertEvents = capturedEvents.filter(
        (event) =>
          event.eventType === "notification.send_email" &&
          event.data.type === "security_alert"
      );
      expect(securityAlertEvents.length).toBeGreaterThan(0);

      // Check that analytics events were triggered
      const analyticsEvents = capturedEvents.filter((event) =>
        event.eventType.startsWith("analytics.")
      );
      expect(analyticsEvents.length).toBeGreaterThan(0);
    });

    test("should handle profile completion event with rewards", async () => {
      const profileData = {
        userId: "user123",
        completionPercentage: 100,
        completedFields: ["firstName", "lastName", "email", "phone"],
      };

      await userEventPublisher.publishUserProfileCompleted(profileData);

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that congratulations email was sent
      const congratsEvents = capturedEvents.filter(
        (event) =>
          event.eventType === "notification.send_email" &&
          event.data.type === "profile_completed"
      );
      expect(congratsEvents.length).toBeGreaterThan(0);

      // Check that marketing events were triggered
      const marketingEvents = capturedEvents.filter((event) =>
        event.eventType.startsWith("marketing.")
      );
      expect(marketingEvents.length).toBeGreaterThan(0);
    });
  });

  describe("Event Schema Validation", () => {
    test("should validate event schemas correctly", () => {
      const {
        validateEventPayload,
      } = require("../../src/shared/events/eventDefinitions");

      // Valid event should pass
      expect(() => {
        validateEventPayload(USER_EVENTS.USER_REGISTERED.name, {
          userId: "user123",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "customer",
          registrationMethod: "email",
          timestamp: new Date().toISOString(),
          metadata: {
            userAgent: "Mozilla/5.0",
            ipAddress: "192.168.1.1",
            referrer: "https://google.com",
          },
        });
      }).not.toThrow();

      // Invalid event should throw
      expect(() => {
        validateEventPayload(USER_EVENTS.USER_REGISTERED.name, {
          userId: "user123",
          // Missing required fields
        });
      }).toThrow();
    });
  });

  describe("Event Bus Health", () => {
    test("should return health status", async () => {
      const health = await eventBus.getHealth();

      expect(health).toBeDefined();
      expect(health.status).toBe("healthy");
      expect(health.type).toBe("eventemitter");
    });

    test("should return subscriber manager health", async () => {
      const health = await userSubscriberManager.healthCheck();

      expect(health).toBeDefined();
      expect(health.status).toBe("healthy");
      expect(health.subscribers).toBeDefined();
      expect(health.subscribers.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    test("should handle event handler errors gracefully", async () => {
      // Subscribe to error events
      let errorEvent = null;
      await eventBus.subscribe("event_handler_error", (eventPayload) => {
        errorEvent = eventPayload;
      });

      // Create a handler that throws an error
      await eventBus.subscribe("test.error.event", async () => {
        throw new Error("Test error");
      });

      // Publish event that will cause error
      await eventBus.publish("test.error.event", { test: "data" });

      // Wait for error handling
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Error should be captured
      expect(errorEvent).toBeDefined();
      expect(errorEvent.error).toBe("Test error");
    });
  });
});
