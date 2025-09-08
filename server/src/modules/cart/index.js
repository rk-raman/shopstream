/**
 * Cart Module Entry Point
 *
 * This file initializes the cart module and ensures
 * all event listeners are properly set up
 */

// Import and initialize event listeners
require("./events/cart.listeners");

// Export the main components
module.exports = {
  // Models
  Cart: require("./models/Cart.model"),

  // Services
  cartService: require("./services/cart.service"),

  // Controllers
  cartController: require("./controllers/cart.controller"),

  // Routes
  cartRoutes: require("./routes/cart.routes"),

  // Validators
  cartValidators: require("./validators/cart.validators"),

  // Event System
  cartEventPublisher: require("./events/cart.events").cartEventPublisher,
  CartEventPublisher: require("./events/cart.events").CartEventPublisher,
  CART_EVENTS: require("./events/cart.events").CART_EVENTS,

  // Event Subscribers
  cartAnalyticsSubscriber: require("./events/cart.listeners")
    .cartAnalyticsSubscriber,
  cartNotificationSubscriber: require("./events/cart.listeners")
    .cartNotificationSubscriber,
  cartCacheSubscriber: require("./events/cart.listeners").cartCacheSubscriber,

  // Module management methods
  initialize() {
    console.log("Cart module initialized successfully");
    return this;
  },

  shutdown() {
    console.log("Cart module shutting down...");
    // Clean up event listeners if needed
    return this;
  },

  restart() {
    console.log("Cart module restarting...");
    this.shutdown();
    return this.initialize();
  },

  healthCheck() {
    return {
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
    };
  },
};
