/**
 * Cart Module Entry Point
 *
 * This file initializes the cart module following the product module pattern
 * with comprehensive event system and module management capabilities
 */

// Import and initialize event subscribers
const { cartEventSubscribers } = require("./events/subscribers");

// Export the main components
module.exports = {
  // Models
  Cart: require("./models/Cart.model"),

  // Services
  CartService: require("./services/cart.service"),
  cartService: new (require("./services/cart.service"))(),

  // Controllers
  cartController: require("./controllers/cart.controller"),

  // Routes
  cartRoutes: require("./routes/cart.routes"),

  // Validators
  cartValidators: require("./validators/cart.validators"),

  // Event System
  cartEventEmitter: require("./events/cart.events").cartEventEmitter,
  CartEventEmitter: require("./events/cart.events").CartEventEmitter,
  CART_EVENTS: require("./events/cart.events").CART_EVENTS,

  // Event Publisher
  CartEventPublisher: require("./events/publishers/CartEventPublisher"),

  // Event Subscribers
  cartEventSubscribers,
  CartAnalyticsSubscriber: require("./events/subscribers/CartAnalyticsSubscriber"),
  CartNotificationSubscriber: require("./events/subscribers/CartNotificationSubscriber"),
  CartCacheSubscriber: require("./events/subscribers/CartCacheSubscriber"),

  // Individual subscriber instances for backward compatibility
  cartAnalyticsSubscriber: cartEventSubscribers.getSubscriber("analytics"),
  cartNotificationSubscriber:
    cartEventSubscribers.getSubscriber("notification"),
  cartCacheSubscriber: cartEventSubscribers.getSubscriber("cache"),

  // Module management methods
  async initialize() {
    console.log("[Cart Module] Initializing cart module...");

    try {
      // Initialize event subscribers (already done in constructor)
      console.log("[Cart Module] Event subscribers initialized");

      // Perform any additional initialization
      console.log("[Cart Module] Cart module initialized successfully");
      return this;
    } catch (error) {
      console.error("[Cart Module] Error initializing cart module:", error);
      throw error;
    }
  },

  async shutdown() {
    console.log("[Cart Module] Shutting down cart module...");

    try {
      // Shutdown event subscribers
      if (
        cartEventSubscribers &&
        typeof cartEventSubscribers.shutdown === "function"
      ) {
        await cartEventSubscribers.shutdown();
      }

      console.log("[Cart Module] Cart module shut down successfully");
      return this;
    } catch (error) {
      console.error("[Cart Module] Error shutting down cart module:", error);
      throw error;
    }
  },

  async restart() {
    console.log("[Cart Module] Restarting cart module...");

    try {
      await this.shutdown();
      return await this.initialize();
    } catch (error) {
      console.error("[Cart Module] Error restarting cart module:", error);
      throw error;
    }
  },

  async healthCheck() {
    const health = {
      module: "cart",
      status: "healthy",
      timestamp: new Date().toISOString(),
      components: {
        model: "active",
        service: "active",
        controller: "active",
        routes: "active",
        validators: "active",
        events: "active",
      },
      subscribers: {},
    };

    try {
      // Check event subscribers health
      if (
        cartEventSubscribers &&
        typeof cartEventSubscribers.healthCheck === "function"
      ) {
        const subscribersHealth = await cartEventSubscribers.healthCheck();
        health.subscribers = subscribersHealth.subscribers;

        // Update overall status based on subscribers
        if (subscribersHealth.status === "degraded") {
          health.status = "degraded";
        }
      }
    } catch (error) {
      console.error("[Cart Module] Error during health check:", error);
      health.status = "unhealthy";
      health.error = error.message;
    }

    return health;
  },

  // Additional management methods following product module pattern
  async restartSubscriber(subscriberName) {
    if (
      cartEventSubscribers &&
      typeof cartEventSubscribers.restartSubscriber === "function"
    ) {
      return await cartEventSubscribers.restartSubscriber(subscriberName);
    }
    throw new Error("Event subscribers not available");
  },

  async toggleSubscriber(subscriberName, enabled) {
    if (
      cartEventSubscribers &&
      typeof cartEventSubscribers.toggleSubscriber === "function"
    ) {
      return await cartEventSubscribers.toggleSubscriber(
        subscriberName,
        enabled
      );
    }
    throw new Error("Event subscribers not available");
  },

  getSubscriberStats() {
    if (
      cartEventSubscribers &&
      typeof cartEventSubscribers.getSubscriberStats === "function"
    ) {
      return cartEventSubscribers.getSubscriberStats();
    }
    return { error: "Event subscribers not available" };
  },

  getSubscriber(name) {
    if (
      cartEventSubscribers &&
      typeof cartEventSubscribers.getSubscriber === "function"
    ) {
      return cartEventSubscribers.getSubscriber(name);
    }
    return null;
  },

  getAllSubscribers() {
    if (
      cartEventSubscribers &&
      typeof cartEventSubscribers.getAllSubscribers === "function"
    ) {
      return cartEventSubscribers.getAllSubscribers();
    }
    return {};
  },
};
