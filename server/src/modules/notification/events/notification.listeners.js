const eventEmitter = require("../../../shared/events/eventEmitter");
const {
  USER_EVENTS,
  ORDER_EVENTS,
  PAYMENT_EVENTS,
} = require("../../../shared/events/eventTypes");
const notificationService = require("../services/notification.service");

// Welcome email for new users
eventEmitter.subscribe(USER_EVENTS.USER_REGISTERED, async (data) => {
  try {
    await notificationService.sendWelcomeEmail(data);
    console.log(`Welcome email sent to ${data.email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
});

// Order confirmation email
eventEmitter.subscribe(ORDER_EVENTS.ORDER_CREATED, async (data) => {
  try {
    await notificationService.sendOrderConfirmationEmail(data);
    console.log(`Order confirmation email sent for order ${data.orderNumber}`);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
});

// Order status update notifications
eventEmitter.subscribe(ORDER_EVENTS.ORDER_UPDATED, async (data) => {
  try {
    await notificationService.sendOrderStatusUpdateEmail(data);
    console.log(`Order status update email sent for order ${data.orderNumber}`);
  } catch (error) {
    console.error("Error sending order status update email:", error);
  }
});

// Payment confirmation
eventEmitter.subscribe(PAYMENT_EVENTS.PAYMENT_COMPLETED, async (data) => {
  try {
    await notificationService.sendPaymentConfirmationEmail(data);
    console.log(`Payment confirmation email sent`);
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
  }
});

// Low stock alerts for sellers
eventEmitter.subscribe("inventory.low_stock", async (data) => {
  try {
    await notificationService.sendLowStockAlert(data);
    console.log(`Low stock alert sent for product ${data.productId}`);
  } catch (error) {
    console.error("Error sending low stock alert:", error);
  }
});

console.log("Notification event listeners initialized");
