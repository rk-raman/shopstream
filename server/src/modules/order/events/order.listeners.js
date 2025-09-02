const eventEmitter = require("../../../shared/events/eventEmitter");
const {
  ORDER_EVENTS,
  PAYMENT_EVENTS,
} = require("../../../shared/events/eventTypes");
const orderService = require("../services/order.service");

// Listen for payment completion to update order status
eventEmitter.subscribe(PAYMENT_EVENTS.PAYMENT_COMPLETED, async (data) => {
  try {
    console.log("Payment completed event received:", data);

    if (data.orderId) {
      await orderService.updateOrderStatus(
        data.orderId,
        "confirmed",
        "Payment completed successfully",
        null
      );
    }
  } catch (error) {
    console.error("Error handling payment completed event:", error);
  }
});

// Listen for payment failure to handle order cancellation
eventEmitter.subscribe(PAYMENT_EVENTS.PAYMENT_FAILED, async (data) => {
  try {
    console.log("Payment failed event received:", data);

    if (data.orderId) {
      await orderService.updateOrderStatus(
        data.orderId,
        "cancelled",
        "Payment failed - Order cancelled",
        null
      );
    }
  } catch (error) {
    console.error("Error handling payment failed event:", error);
  }
});

// Listen for inventory out of stock events
eventEmitter.subscribe("inventory.out_of_stock", async (data) => {
  try {
    console.log("Product out of stock:", data);

    // Find pending orders with this product and notify customers
    // This is where you might implement order modification or cancellation logic
  } catch (error) {
    console.error("Error handling out of stock event:", error);
  }
});

console.log("Order event listeners initialized");
