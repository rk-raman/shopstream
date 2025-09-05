/**
 * Event Module Template
 *
 * Template for creating new event-driven modules
 * Copy this file and modify it for your specific module
 */

const eventEmitter = require("../../events/eventEmitter");
const { EVENT_CATEGORIES } = require("../../events/eventDefinitions");

class EventModuleTemplate {
  constructor() {
    this.eventEmitter = eventEmitter;
    this.subscriptions = [];
  }

  /**
   * Initialize all event subscriptions for this module
   */
  async initialize() {
    try {
      console.log("Initializing [MODULE_NAME] event listeners...");

      // Add your event subscriptions here
      await this.subscribeToModuleEvents();
      // await this.subscribeToCrossModuleEvents();

      console.log("[MODULE_NAME] event listeners initialized successfully");
    } catch (error) {
      console.error(
        "Failed to initialize [MODULE_NAME] event listeners:",
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to module-specific events
   */
  async subscribeToModuleEvents() {
    // Example: Subscribe to your module's events
    // const subscriptionId = await this.eventEmitter.subscribe(
    //   "your.module.event",
    //   this.handleYourModuleEvent.bind(this)
    // );
    // this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to cross-module events (events from other modules)
   */
  async subscribeToCrossModuleEvents() {
    // Example: Subscribe to user events
    // const subscriptionId = await this.eventEmitter.subscribe(
    //   "user.registered",
    //   this.handleUserRegistered.bind(this)
    // );
    // this.subscriptions.push(subscriptionId);
  }

  /**
   * Event handler methods
   */
  async handleYourModuleEvent(eventPayload) {
    try {
      console.log("Handling [MODULE_NAME] event:", eventPayload.data);

      // Your event handling logic here
    } catch (error) {
      console.error("Error handling [MODULE_NAME] event:", error);
    }
  }

  async handleUserRegistered(eventPayload) {
    try {
      console.log(
        "Handling user registered event in [MODULE_NAME]:",
        eventPayload.data
      );

      // Your cross-module event handling logic here
    } catch (error) {
      console.error(
        "Error handling user registered event in [MODULE_NAME]:",
        error
      );
    }
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanup() {
    try {
      console.log("Cleaning up [MODULE_NAME] event listeners...");

      // Cleanup subscriptions
      for (const subscriptionId of this.subscriptions) {
        // Note: The current event emitter doesn't support unsubscribing by ID
        // This would need to be implemented in the event bus abstraction
        console.log(`Cleaning up subscription: ${subscriptionId}`);
      }

      this.subscriptions = [];
      console.log("[MODULE_NAME] event listeners cleaned up successfully");
    } catch (error) {
      console.error("Failed to cleanup [MODULE_NAME] event listeners:", error);
      throw error;
    }
  }

  /**
   * Get health status
   */
  async getHealth() {
    return {
      isInitialized: this.subscriptions.length > 0,
      subscriptionCount: this.subscriptions.length,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = EventModuleTemplate;
