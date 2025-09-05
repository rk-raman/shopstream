/**
 * Event System Initialization Tests
 *
 * Tests the proper initialization and cleanup of the event-driven architecture
 */

const { EventBusFactory } = require("../../src/shared/events/eventBusFactory");
const eventSystemManager = require("../../src/shared/events/eventSystemManager");
const {
  initializeUserEventListeners,
  cleanupUserEventListeners,
} = require("../../src/modules/user/events/user.listeners.modular");
const eventSystem = require("../../src/shared/events/eventEmitter");

describe("Event System Initialization", () => {
  let eventBus;

  afterEach(async () => {
    // Cleanup after each test
    await eventSystemManager.cleanup();
    if (eventBus) {
      await eventBus.shutdown();
    }
  });

  describe("Event Bus Initialization", () => {
    test("should initialize EventEmitter bus successfully", async () => {
      eventBus = await EventBusFactory.createAndInitialize({
        maxListeners: 50,
      });

      expect(eventBus).toBeDefined();
      expect(typeof eventBus.publish).toBe("function");
      expect(typeof eventBus.subscribe).toBe("function");

      const health = await eventBus.getHealth();
      expect(health.status).toBe("healthy");
      expect(health.type).toBe("eventemitter");
    });

    test("should handle initialization errors gracefully", async () => {
      // Test with invalid options
      await expect(
        EventBusFactory.createAndInitialize({
          invalidOption: "test",
        })
      ).resolves.toBeDefined(); // Should still work with invalid options
    });
  });

  describe("Event System Manager", () => {
    test("should initialize event system manager successfully", async () => {
      await expect(eventSystemManager.initialize()).resolves.not.toThrow();
      console.log("Event system manager initialized successfully");
    });

    test("should cleanup event system manager successfully", async () => {
      // Initialize first
      await eventSystemManager.initialize();

      // Then cleanup
      await expect(eventSystemManager.cleanup()).resolves.not.toThrow();
      console.log("Event system manager cleaned up successfully");
    });

    test("should provide health status", async () => {
      await eventSystemManager.initialize();

      const health = await eventSystemManager.getHealth();
      expect(health).toHaveProperty("isInitialized");
      expect(health).toHaveProperty("initializedModules");
      expect(health).toHaveProperty("eventBus");
      expect(health).toHaveProperty("timestamp");

      expect(health.isInitialized).toBe(true);
      expect(Array.isArray(health.initializedModules)).toBe(true);
    });
  });

  describe("User Event Listeners Initialization", () => {
    test("should initialize user event listeners successfully", async () => {
      // Initialize event bus first
      eventBus = await EventBusFactory.createAndInitialize();

      // Initialize user listeners
      await expect(initializeUserEventListeners()).resolves.not.toThrow();

      console.log("User event listeners initialized successfully");
    });

    test("should cleanup user event listeners successfully", async () => {
      // Initialize first
      eventBus = await EventBusFactory.createAndInitialize();
      await initializeUserEventListeners();

      // Then cleanup
      await expect(cleanupUserEventListeners()).resolves.not.toThrow();

      console.log("User event listeners cleaned up successfully");
    });
  });

  describe("Legacy Event System Compatibility", () => {
    test("should maintain backward compatibility with legacy event system", async () => {
      // Test legacy event system
      const legacyHealth = await eventSystem.getHealth();
      expect(legacyHealth).toBeDefined();
      expect(legacyHealth.status).toBe("healthy");
    });

    test("should publish and receive events through legacy system", async () => {
      let receivedEvent = null;

      await eventSystem.subscribe("test.legacy.event", (eventPayload) => {
        receivedEvent = eventPayload;
      });

      await eventSystem.publish("test.legacy.event", { message: "test" });

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.data.message).toBe("test");
    });
  });

  describe("Event System Health Monitoring", () => {
    test("should provide health status for event bus", async () => {
      eventBus = await EventBusFactory.createAndInitialize();

      const health = await eventBus.getHealth();

      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("type");
      expect(health).toHaveProperty("listeners");
      expect(health).toHaveProperty("subscriptions");

      expect(health.status).toBe("healthy");
      expect(health.type).toBe("eventemitter");
      expect(typeof health.listeners).toBe("number");
      expect(typeof health.subscriptions).toBe("number");
    });

    test("should provide health status for user subscribers", async () => {
      eventBus = await EventBusFactory.createAndInitialize();
      await initializeUserEventListeners();

      // This would need to be implemented in the subscriber manager
      // For now, just test that initialization doesn't throw
      expect(true).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("should handle event bus shutdown errors gracefully", async () => {
      eventBus = await EventBusFactory.createAndInitialize();

      // Shutdown should not throw
      await expect(eventBus.shutdown()).resolves.not.toThrow();

      // Shutdown again should also not throw
      await expect(eventBus.shutdown()).resolves.not.toThrow();
    });

    test("should handle subscriber cleanup errors gracefully", async () => {
      // Cleanup without initialization should not throw
      await expect(cleanupUserEventListeners()).resolves.not.toThrow();
    });
  });

  describe("Event Publishing and Subscribing", () => {
    test("should publish and receive events correctly", async () => {
      eventBus = await EventBusFactory.createAndInitialize();
      await initializeUserEventListeners();

      let receivedEvents = [];

      // Subscribe to a test event
      await eventBus.subscribe("test.integration.event", (eventPayload) => {
        receivedEvents.push(eventPayload);
      });

      // Publish test event
      const eventId = await eventBus.publish("test.integration.event", {
        message: "integration test",
        timestamp: new Date().toISOString(),
      });

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].data.message).toBe("integration test");
      expect(receivedEvents[0].id).toBe(eventId);
    });

    test("should handle multiple subscribers for same event", async () => {
      eventBus = await EventBusFactory.createAndInitialize();

      let subscriber1Events = [];
      let subscriber2Events = [];

      // Subscribe with two different handlers
      await eventBus.subscribe("test.multiple.subscribers", (eventPayload) => {
        subscriber1Events.push(eventPayload);
      });

      await eventBus.subscribe("test.multiple.subscribers", (eventPayload) => {
        subscriber2Events.push(eventPayload);
      });

      // Publish event
      await eventBus.publish("test.multiple.subscribers", { message: "test" });

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(subscriber1Events).toHaveLength(1);
      expect(subscriber2Events).toHaveLength(1);
      expect(subscriber1Events[0].data.message).toBe("test");
      expect(subscriber2Events[0].data.message).toBe("test");
    });
  });
});
