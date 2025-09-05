# Event System Initialization Guide

This guide explains how to properly initialize the event-driven architecture in your Node.js application.

## Overview

The event system should be initialized during application startup to ensure all event publishers and subscribers are properly configured before any business logic runs.

## Initialization Order

The recommended initialization order is:

1. **Database connections** (MongoDB, Redis, etc.)
2. **Event Bus** (EventEmitter, Kafka, etc.)
3. **Event Subscribers** (Notification, Analytics, Marketing)
4. **Application routes and middleware**

## Implementation

### 1. In `app.js` or `server.js`

```javascript
const eventSystemManager = require("./shared/events/eventSystemManager");

// Call during application startup
const initializeServices = async () => {
  try {
    // Connect to databases first
    await connectDB();
    await connectRedis();

    // Initialize event system (handles all modules automatically)
    await eventSystemManager.initialize();

    console.log("All services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};
```

### 2. Graceful Shutdown

```javascript
const eventSystemManager = require("./shared/events/eventSystemManager");

async function gracefulShutdown(signal) {
  console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);

  try {
    // Cleanup event-driven architecture (handles all modules automatically)
    await eventSystemManager.cleanup();

    console.log("Graceful shutdown completed");
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
  } finally {
    process.exit(0);
  }
}

// Handle shutdown signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
```

### 3. Health Check Integration

```javascript
const eventSystemManager = require("./shared/events/eventSystemManager");

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Get event system health
    const eventSystemHealth = await eventSystem.getHealth();
    const eventSystemManagerHealth = await eventSystemManager.getHealth();

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        eventSystem: eventSystemHealth,
        eventSystemManager: eventSystemManagerHealth,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});
```

## Environment Configuration

### Event Bus Type

Set the event bus type via environment variable:

```bash
# For EventEmitter (default)
export EVENT_BUS_TYPE=eventemitter

# For Kafka (future)
export EVENT_BUS_TYPE=kafka
export KAFKA_BROKERS=localhost:9092

# For RabbitMQ (future)
export EVENT_BUS_TYPE=rabbitmq
export RABBITMQ_URL=amqp://localhost:5672
```

### Event Bus Options

```javascript
const eventBus = await EventBusFactory.createAndInitialize({
  maxListeners: 100, // Maximum number of listeners
  clientId: "my-app", // Client identifier
  brokers: ["localhost:9092"], // Kafka brokers (if using Kafka)
  // ... other options
});
```

## Module-Specific Initialization

### User Module

```javascript
// In user module initialization
const {
  initializeUserEventListeners,
} = require("./events/user.listeners.modular");

await initializeUserEventListeners();
```

### Custom Modules

For other modules (product, order, etc.), follow the same pattern:

```javascript
// Create similar initialization functions
const initializeProductEventListeners = async () => {
  // Initialize product event subscribers
};

const initializeOrderEventListeners = async () => {
  // Initialize order event subscribers
};
```

## Testing Initialization

### Unit Tests

```javascript
describe("Event System Initialization", () => {
  beforeEach(async () => {
    // Initialize event system for tests
    await initializeEventDrivenArchitecture();
  });

  afterEach(async () => {
    // Cleanup after tests
    await cleanupUserEventListeners();
  });

  test("should initialize event system successfully", async () => {
    const health = await eventSystem.getHealth();
    expect(health.status).toBe("healthy");
  });
});
```

### Integration Tests

```javascript
describe("Event System Integration", () => {
  beforeAll(async () => {
    // Initialize full event system
    await initializeEventDrivenArchitecture();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupUserEventListeners();
  });

  test("should handle user events end-to-end", async () => {
    // Test complete event flow
  });
});
```

## Error Handling

### Initialization Errors

```javascript
const initializeEventDrivenArchitecture = async () => {
  try {
    // Initialize event bus
    const eventBus = await EventBusFactory.createAndInitialize();

    // Initialize subscribers
    await initializeUserEventListeners();
  } catch (error) {
    console.error("Event system initialization failed:", error);

    // Log specific error details
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Event bus connection failed - check if service is running"
      );
    } else if (error.message.includes("validation")) {
      console.error("Event schema validation failed");
    }

    throw error;
  }
};
```

### Runtime Errors

The event system includes built-in error handling:

```javascript
// Errors in event handlers are automatically caught and logged
eventBus.on("event_handler_error", (errorEvent) => {
  console.error("Event handler error:", {
    eventType: errorEvent.eventType,
    subscriptionId: errorEvent.subscriptionId,
    error: errorEvent.error,
    stack: errorEvent.stack,
  });
});
```

## Monitoring and Observability

### Health Checks

```javascript
// Check event system health
const health = await eventSystem.getHealth();
console.log("Event system health:", health);

// Check specific subscriber health
const subscriberHealth = await userSubscriberManager.healthCheck();
console.log("User subscribers health:", subscriberHealth);
```

### Metrics

```javascript
// Get event system metrics
const metrics = {
  totalEvents: eventBus.getEventCount(),
  activeSubscriptions: eventBus.getSubscriptionCount(),
  errorRate: eventBus.getErrorRate(),
};
```

## Best Practices

1. **Initialize Early**: Initialize the event system as early as possible in your application lifecycle
2. **Handle Errors**: Always wrap initialization in try-catch blocks
3. **Graceful Shutdown**: Implement proper cleanup during shutdown
4. **Health Monitoring**: Include event system health in your health checks
5. **Environment Configuration**: Use environment variables for configuration
6. **Testing**: Test both initialization and cleanup in your test suites

## Troubleshooting

### Common Issues

1. **Event Bus Not Initialized**: Ensure `initializeEventDrivenArchitecture()` is called before using event publishers
2. **Subscribers Not Working**: Check that subscriber initialization completed successfully
3. **Memory Leaks**: Ensure proper cleanup during shutdown
4. **Event Validation Errors**: Check event schemas and payload structure

### Debug Mode

Enable debug logging:

```javascript
// Set debug environment variable
process.env.EVENT_DEBUG = "true";

// Or enable in code
const eventBus = await EventBusFactory.createAndInitialize({
  debug: true,
});
```

This will provide detailed logging of event publishing, subscribing, and processing.
