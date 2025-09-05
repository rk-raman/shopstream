# Event Module Templates

This directory contains templates and examples for creating new event-driven modules.

## Creating a New Event Module

### 1. Copy the Template

```bash
# Copy the template file
cp moduleTemplates/eventModuleTemplate.js ../modules/[YOUR_MODULE]/events/[YOUR_MODULE].listeners.modular.js

# Example for product module
cp moduleTemplates/eventModuleTemplate.js ../modules/product/events/product.listeners.modular.js
```

### 2. Update the Template

Replace the following placeholders in your copied file:

- `[MODULE_NAME]` → Your module name (e.g., "Product", "Order", "Payment")
- `your.module.event` → Your actual event names
- Add your specific event handling logic

### 3. Register in Event System Manager

Update `eventSystemManager.js` to include your new module:

```javascript
const modules = [
  { name: "user", path: "./modules/user/events/user.listeners.modular" },
  {
    name: "product",
    path: "./modules/product/events/product.listeners.modular",
  }, // Add this
  { name: "order", path: "./modules/order/events/order.listeners.modular" }, // Add this
  // ... other modules
];
```

### 4. Export Required Functions

Your module file must export these functions:

```javascript
// Required exports
module.exports = {
  initialize[ModuleName]EventListeners,  // e.g., initializeProductEventListeners
  cleanup[ModuleName]EventListeners,    // e.g., cleanupProductEventListeners
  [ModuleName]SubscriberManager         // e.g., ProductSubscriberManager (optional)
};
```

## Example: Product Module

Here's how a product module might look:

```javascript
// modules/product/events/product.listeners.modular.js

const ProductEventSubscriber = require("./subscribers/ProductEventSubscriber");
const ProductAnalyticsSubscriber = require("./subscribers/ProductAnalyticsSubscriber");

class ProductSubscriberManager {
  constructor() {
    this.subscribers = {
      events: new ProductEventSubscriber(),
      analytics: new ProductAnalyticsSubscriber(),
    };
  }

  async initialize() {
    await Promise.all([
      this.subscribers.events.initialize(),
      this.subscribers.analytics.initialize(),
    ]);
  }

  async cleanup() {
    await Promise.all([
      this.subscribers.events.cleanup(),
      this.subscribers.analytics.cleanup(),
    ]);
  }
}

const productSubscriberManager = new ProductSubscriberManager();

const initializeProductEventListeners = async () => {
  await productSubscriberManager.initialize();
};

const cleanupProductEventListeners = async () => {
  await productSubscriberManager.cleanup();
};

module.exports = {
  initializeProductEventListeners,
  cleanupProductEventListeners,
  ProductSubscriberManager,
};
```

## Event Naming Conventions

Follow these conventions for event names:

- **Module Events**: `[module].[action]` (e.g., `product.created`, `order.updated`)
- **Cross-Module Events**: `[module].[action]` (e.g., `user.registered`, `payment.completed`)
- **System Events**: `system.[action]` (e.g., `system.startup`, `system.shutdown`)

## Event Schema

Define your events in `eventDefinitions.js`:

```javascript
const PRODUCT_EVENTS = {
  PRODUCT_CREATED: {
    name: "product.created",
    category: EVENT_CATEGORIES.PRODUCT,
    schema: {
      productId: "string",
      name: "string",
      price: "number",
      category: "string",
      createdBy: "string",
      timestamp: "string",
    },
  },
  // ... other events
};
```

## Best Practices

1. **Separation of Concerns**: Create separate subscriber classes for different concerns (notifications, analytics, etc.)
2. **Error Handling**: Always wrap event handlers in try-catch blocks
3. **Logging**: Log important events and errors
4. **Testing**: Write tests for your event handlers
5. **Documentation**: Document your events and their schemas

## Testing Your Module

Create tests for your event module:

```javascript
// tests/integration/[module]EventListeners.test.js

describe('[Module] Event Listeners', () => {
  let eventBus;
  let [module]SubscriberManager;

  beforeAll(async () => {
    eventBus = await EventBusFactory.createAndInitialize();
    [module]SubscriberManager = new [Module]SubscriberManager();
    await [module]SubscriberManager.initialize();
  });

  afterAll(async () => {
    await [module]SubscriberManager.cleanup();
    await eventBus.shutdown();
  });

  test('should handle [module] events correctly', async () => {
    // Your test logic
  });
});
```

## Integration with Event System Manager

The Event System Manager will automatically:

1. **Initialize** your module during application startup
2. **Cleanup** your module during application shutdown
3. **Monitor** your module's health status
4. **Handle errors** gracefully if your module fails

No additional configuration needed - just follow the template and register your module!
