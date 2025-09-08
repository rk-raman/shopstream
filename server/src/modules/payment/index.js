// Payment Module - Main Entry Point
// Following the established module pattern from user and product modules

// Models
const { Payment, PaymentMethod } = require("./models");

// Services
const paymentService = require("./services/payment.service");

// Controllers
const paymentController = require("./controllers/payment.controller");

// Routes
const paymentRoutes = require("./routes/payment.routes");

// Validators
const paymentValidators = require("./validators/payment.validators");

// Events
const {
  PaymentEventEmitter,
  paymentEventEmitter,
  PAYMENT_EVENTS,
} = require("./events/payment.events");
const {
  PaymentEventPublisher,
} = require("./events/publishers/PaymentEventPublisher");
const paymentSubscribers = require("./events/subscribers");

// Create event system instances
const paymentEventPublisher = new PaymentEventPublisher();

// Module state
let isInitialized = false;
let initializationPromise = null;

/**
 * Initialize the payment module
 * Sets up event subscribers and performs any necessary startup tasks
 */
async function initialize() {
  try {
    if (isInitialized) {
      console.log("Payment module already initialized");
      return;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      console.log("Initializing payment module...");

      // Initialize event subscribers
      await paymentSubscribers.initialize(paymentEventEmitter);

      // Set up service dependencies
      paymentService.setEventPublisher(paymentEventPublisher);

      isInitialized = true;
      console.log("Payment module initialized successfully");
    })();

    await initializationPromise;
  } catch (error) {
    console.error("Error initializing payment module:", error);
    isInitialized = false;
    initializationPromise = null;
    throw error;
  }
}

/**
 * Shutdown the payment module
 * Gracefully shuts down all subscribers and cleans up resources
 */
async function shutdown() {
  try {
    if (!isInitialized) {
      console.log("Payment module not initialized, nothing to shutdown");
      return;
    }

    console.log("Shutting down payment module...");

    // Shutdown event subscribers
    await paymentSubscribers.shutdown();

    isInitialized = false;
    initializationPromise = null;

    console.log("Payment module shut down successfully");
  } catch (error) {
    console.error("Error shutting down payment module:", error);
    throw error;
  }
}

/**
 * Restart the payment module
 * Performs a graceful shutdown followed by initialization
 */
async function restart() {
  try {
    console.log("Restarting payment module...");
    await shutdown();
    await initialize();
    console.log("Payment module restarted successfully");
  } catch (error) {
    console.error("Error restarting payment module:", error);
    throw error;
  }
}

/**
 * Get the health status of the payment module
 * Returns comprehensive health information about all components
 */
function getHealthStatus() {
  const status = {
    module: {
      name: "payment",
      isInitialized,
      version: "1.0.0",
    },
    components: {
      models: {
        Payment: !!Payment,
        PaymentMethod: !!PaymentMethod,
      },
      services: {
        paymentService: !!paymentService,
      },
      controllers: {
        paymentController: !!paymentController,
      },
      events: {
        eventEmitter: !!paymentEventEmitter,
        eventPublisher: !!paymentEventPublisher,
        subscribers: paymentSubscribers.getHealthStatus(),
      },
    },
    timestamp: new Date().toISOString(),
  };

  return status;
}

/**
 * Check if the payment module is healthy
 * Returns true if all critical components are functioning
 */
function isHealthy() {
  try {
    if (!isInitialized) return false;

    const subscribersHealthy = paymentSubscribers.isHealthy();
    return subscribersHealthy;
  } catch (error) {
    console.error("Error checking payment module health:", error);
    return false;
  }
}

/**
 * Get detailed module information
 * Returns comprehensive information about the module structure and status
 */
function getModuleInfo() {
  return {
    name: "payment",
    version: "1.0.0",
    description:
      "Payment processing module with multiple gateway support and event-driven architecture",
    isInitialized,
    components: {
      models: ["Payment", "PaymentMethod"],
      services: ["paymentService"],
      controllers: ["paymentController"],
      routes: ["paymentRoutes"],
      validators: ["paymentValidators"],
      events: [
        "PaymentEventEmitter",
        "PaymentEventPublisher",
        "PAYMENT_EVENTS",
      ],
      subscribers: paymentSubscribers.getSubscriberInfo(),
    },
    features: [
      "Payment processing",
      "Payment method management",
      "Multiple gateway integration",
      "Event-driven architecture",
      "Analytics tracking",
      "Notification system",
      "Cache management",
      "Fraud detection",
      "Dispute handling",
      "Refund processing",
      "Webhook handling",
    ],
    healthStatus: getHealthStatus(),
  };
}

// Auto-initialize on module load (can be disabled by setting PAYMENT_AUTO_INIT=false)
if (process.env.PAYMENT_AUTO_INIT !== "false") {
  // Use setImmediate to avoid blocking module loading
  setImmediate(() => {
    initialize().catch((error) => {
      console.error("Failed to auto-initialize payment module:", error);
    });
  });
}

// Export all module components
module.exports = {
  // Models
  Payment,
  PaymentMethod,

  // Services
  paymentService,

  // Controllers
  paymentController,

  // Routes
  paymentRoutes,

  // Validators
  paymentValidators,

  // Events
  PaymentEventEmitter,
  PaymentEventPublisher,
  PAYMENT_EVENTS,
  paymentEventEmitter,
  paymentEventPublisher,
  paymentSubscribers,

  // Module management
  initialize,
  shutdown,
  restart,
  getHealthStatus,
  isHealthy,
  getModuleInfo,

  // Module state
  get isInitialized() {
    return isInitialized;
  },
};
