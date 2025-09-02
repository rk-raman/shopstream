const eventEmitter = require("../../../shared/events/eventEmitter");
const {
  USER_EVENTS,
  ORDER_EVENTS,
} = require("../../../shared/events/eventTypes");

// Listen for user registration to send welcome email
eventEmitter.subscribe(USER_EVENTS.USER_REGISTERED, async (data) => {
  console.log("User registered event received:", data);

  // Trigger welcome email (handled by notification service)
  eventEmitter.publish("notification.send_email", {
    type: "welcome",
    to: data.email,
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });

  // Initialize user analytics (handled by analytics service)
  eventEmitter.publish("analytics.user_registered", {
    userId: data.userId,
    timestamp: data.timestamp,
  });
});

// Listen for user login to track analytics
eventEmitter.subscribe(USER_EVENTS.USER_LOGGED_IN, async (data) => {
  console.log("User logged in event received:", data);

  // Track login analytics
  eventEmitter.publish("analytics.user_login", {
    userId: data.userId,
    timestamp: data.timestamp,
  });
});

// Listen for order events to update user stats
eventEmitter.subscribe(ORDER_EVENTS.ORDER_COMPLETED, async (data) => {
  console.log("Order completed - updating user stats:", data);

  // Could update user's order count, total spent, etc.
  // This shows how different modules can react to each other's events
});

console.log("User event listeners initialized");
