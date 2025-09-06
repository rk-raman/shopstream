const eventEmitter = require("../../../shared/events/eventEmitter");
const { PRODUCT_EVENTS } = require("../../../shared/events/eventDefinitions");

let subscriptions = [];

const initializeProductEventListeners = async () => {
  // Example listeners: log product lifecycle events for analytics pipeline
  const subCreated = await eventEmitter.subscribe(
    PRODUCT_EVENTS.PRODUCT_CREATED.name,
    async (event) => {
      console.log("[product] created:", event?.data || event);
    }
  );

  const subUpdated = await eventEmitter.subscribe(
    PRODUCT_EVENTS.PRODUCT_UPDATED.name,
    async (event) => {
      console.log("[product] updated:", event?.data || event);
    }
  );

  const subDeleted = await eventEmitter.subscribe(
    PRODUCT_EVENTS.PRODUCT_DELETED.name,
    async (event) => {
      console.log("[product] deleted:", event?.data || event);
    }
  );

  subscriptions.push(subCreated, subUpdated, subDeleted);
};

const cleanupProductEventListeners = async () => {
  // Depending on event bus implementation, we might need to unsubscribe.
  // Here we just clear local refs.
  subscriptions = [];
};

module.exports = {
  initializeProductEventListeners,
  cleanupProductEventListeners,
};

