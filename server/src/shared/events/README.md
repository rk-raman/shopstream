# Event-Driven Architecture

This directory contains the event-driven architecture implementation for the ShopStream application. The architecture is designed to be modular, scalable, and easily swappable between different event bus implementations.

## Architecture Overview

The event-driven architecture consists of several key components:

### 1. Event Bus Abstraction Layer

- **`eventBus.js`** - Abstract interface for event publishing and subscribing
- **`implementations/`** - Concrete implementations (EventEmitter, Kafka, etc.)
- **`eventBusFactory.js`** - Factory for creating event bus instances

### 2. Event Definitions

- **`eventDefinitions.js`** - Centralized event schemas and validation
- **`eventTypes.js`** - Legacy event type constants (for backward compatibility)

### 3. Event Publishers

- **`publishers/`** - Classes responsible for publishing events
- Each module has its own publisher (e.g., `UserEventPublisher`)

### 4. Event Subscribers

- **`subscribers/`** - Classes responsible for handling events and side effects
- Organized by concern (notifications, analytics, marketing, etc.)

## Key Features

### 🔄 Easy Event Bus Swapping

The architecture allows you to easily swap between different event bus implementations:

```javascript
// Current: EventEmitter (in-memory)
process.env.EVENT_BUS_TYPE = "eventemitter";

// Future: Kafka
process.env.EVENT_BUS_TYPE = "kafka";
```

### 📋 Event Schema Validation

All events have defined schemas with validation:

```javascript
const { validateEventPayload, USER_EVENTS } = require("./eventDefinitions");

// This will throw if the payload doesn't match the schema
validateEventPayload(USER_EVENTS.USER_REGISTERED.name, userData);
```

### 🏗️ Modular Design

Each concern is separated into its own subscriber:

- **NotificationSubscriber** - Handles emails, SMS, push notifications
- **AnalyticsSubscriber** - Tracks user behavior and analytics
- **MarketingSubscriber** - Manages user segments and campaigns

### 🔍 Event Tracing

Every event includes metadata for tracing:

```javascript
{
  eventType: 'user.registered',
  data: { /* event payload */ },
  timestamp: '2024-01-01T00:00:00.000Z',
  id: 'evt_1234567890_abc123',
  metadata: { /* additional context */ }
}
```

## Usage Examples

### Publishing Events

```javascript
const UserEventPublisher = require("./modules/user/events/publishers/UserEventPublisher");

const publisher = new UserEventPublisher();

// Publish user registration event
await publisher.publishUserRegistered({
  userId: "user123",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "customer",
  registrationMethod: "email",
  userAgent: "Mozilla/5.0",
  ipAddress: "192.168.1.1",
  referrer: "https://google.com",
});
```

### Subscribing to Events

```javascript
const eventBus = require("./shared/events/eventEmitter");

// Subscribe to user events
await eventBus.subscribe("user.registered", async (eventPayload) => {
  console.log("User registered:", eventPayload.data);
  // Handle the event
});
```

### Creating Custom Subscribers

```javascript
class CustomSubscriber {
  constructor() {
    this.eventBus = require("../../shared/events/eventEmitter");
    this.subscriptions = [];
  }

  async initialize() {
    const subscriptionId = await this.eventBus.subscribe(
      "user.registered",
      this.handleUserRegistered.bind(this)
    );
    this.subscriptions.push(subscriptionId);
  }

  async handleUserRegistered(eventPayload) {
    // Custom logic here
    console.log("Handling user registration:", eventPayload.data);
  }

  async cleanup() {
    // Cleanup subscriptions
    this.subscriptions.forEach((id) => {
      // Unsubscribe logic
    });
  }
}
```

## Event Bus Implementations

### EventEmitter (Current)

- **File**: `implementations/eventEmitterBus.js`
- **Type**: In-memory
- **Use Case**: Development, testing, small applications
- **Pros**: Simple, fast, no external dependencies
- **Cons**: Not suitable for distributed systems

### Kafka (Future)

- **File**: `implementations/kafkaBus.js`
- **Type**: Distributed message broker
- **Use Case**: Production, microservices, high throughput
- **Pros**: Scalable, durable, supports multiple consumers
- **Cons**: More complex setup, external dependency

### RabbitMQ (Future)

- **File**: `implementations/rabbitmqBus.js` (to be implemented)
- **Type**: Message broker
- **Use Case**: Production, complex routing needs
- **Pros**: Advanced routing, reliable delivery
- **Cons**: More complex than EventEmitter

### Redis Pub/Sub (Future)

- **File**: `implementations/redisBus.js` (to be implemented)
- **Type**: In-memory data store with pub/sub
- **Use Case**: Production, caching + events
- **Pros**: Fast, simple, good for caching
- **Cons**: Not durable, limited features

## Event Schema

All events follow a consistent structure:

```javascript
{
  eventType: 'string',        // Event name (e.g., 'user.registered')
  data: 'object',             // Event payload
  timestamp: 'string',        // ISO 8601 timestamp
  id: 'string',               // Unique event ID
  metadata: {                 // Optional additional context
    source: 'string',
    version: 'string',
    correlationId: 'string'
  }
}
```

## Error Handling

The architecture includes comprehensive error handling:

1. **Event Validation** - Schemas are validated before publishing
2. **Handler Errors** - Errors in event handlers are caught and logged
3. **Retry Logic** - Failed events can be retried (implementation dependent)
4. **Dead Letter Queue** - Failed events can be sent to a dead letter queue

## Testing

The architecture includes comprehensive tests:

```bash
# Run integration tests
npm test -- tests/integration/userEventDrivenArchitecture.test.js

# Run all event-related tests
npm test -- --grep "event"
```

## Migration Guide

### From Legacy Event System

1. **Replace direct EventEmitter usage**:

   ```javascript
   // Old
   eventEmitter.publish("user.registered", data);

   // New
   await userEventPublisher.publishUserRegistered(data);
   ```

2. **Update event listeners**:

   ```javascript
   // Old
   eventEmitter.subscribe("user.registered", handler);

   // New
   await eventBus.subscribe("user.registered", handler);
   ```

3. **Use event publishers**:

   ```javascript
   // Old
   const { USER_EVENTS } = require("./eventTypes");
   eventEmitter.publish(USER_EVENTS.USER_REGISTERED, data);

   // New
   const UserEventPublisher = require("./publishers/UserEventPublisher");
   const publisher = new UserEventPublisher();
   await publisher.publishUserRegistered(data);
   ```

### To Different Event Bus

1. **Change environment variable**:

   ```bash
   # For Kafka
   export EVENT_BUS_TYPE=kafka
   export KAFKA_BROKERS=localhost:9092

   # For RabbitMQ
   export EVENT_BUS_TYPE=rabbitmq
   export RABBITMQ_URL=amqp://localhost:5672
   ```

2. **Update configuration**:
   ```javascript
   const eventBus = await EventBusFactory.createAndInitialize({
     brokers: process.env.KAFKA_BROKERS?.split(","),
     clientId: "shopstream-events",
   });
   ```

## Best Practices

1. **Use Event Publishers** - Always use publisher classes instead of direct event bus calls
2. **Validate Events** - Always validate event payloads before publishing
3. **Handle Errors** - Implement proper error handling in event handlers
4. **Test Events** - Write tests for event publishing and handling
5. **Monitor Events** - Implement monitoring and alerting for event failures
6. **Document Events** - Keep event schemas and documentation up to date

## Monitoring and Observability

The architecture supports monitoring through:

1. **Event Metrics** - Count of events published/consumed
2. **Error Tracking** - Failed event handlers and validation errors
3. **Performance Metrics** - Event processing times
4. **Health Checks** - Event bus and subscriber health status

```javascript
// Get event bus health
const health = await eventBus.getHealth();
console.log("Event bus health:", health);

// Get subscriber health
const subscriberHealth = await userSubscriberManager.healthCheck();
console.log("Subscriber health:", subscriberHealth);
```

## Future Enhancements

1. **Event Sourcing** - Store all events for audit and replay
2. **CQRS** - Separate read and write models
3. **Saga Pattern** - Handle distributed transactions
4. **Event Replay** - Replay events for testing and recovery
5. **Event Versioning** - Handle schema evolution
6. **Event Compression** - Compress large event payloads
7. **Event Encryption** - Encrypt sensitive event data
