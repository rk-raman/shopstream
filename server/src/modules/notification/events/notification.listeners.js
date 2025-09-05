/**
 * Notification Event Listeners
 *
 * Handles notification-related events from other modules
 * and triggers appropriate notification actions
 */

const notificationService = require("../services/notification.service");
const { Notification, NotificationTemplate } = require("../models");
const eventEmitter = require("../../../shared/events/eventEmitter");
const {
  USER_EVENTS,
  ORDER_EVENTS,
  PAYMENT_EVENTS,
  PRODUCT_EVENTS,
} = require("../../../shared/events/eventDefinitions");

class NotificationListeners {
  constructor() {
    this.initializeListeners();
  }

  initializeListeners() {
    // User-related notification listeners
    eventEmitter.on(
      USER_EVENTS.USER_REGISTERED.name,
      this.handleUserRegistered.bind(this)
    );
    eventEmitter.on(
      USER_EVENTS.USER_LOGGED_IN.name,
      this.handleUserLoggedIn.bind(this)
    );
    eventEmitter.on(
      USER_EVENTS.USER_LOGIN_FAILED.name,
      this.handleUserLoginFailed.bind(this)
    );
    eventEmitter.on(
      USER_EVENTS.USER_ACCOUNT_LOCKED.name,
      this.handleUserAccountLocked.bind(this)
    );
    eventEmitter.on(
      USER_EVENTS.PASSWORD_CHANGED.name,
      this.handlePasswordChanged.bind(this)
    );
    eventEmitter.on(
      USER_EVENTS.EMAIL_VERIFIED.name,
      this.handleEmailVerified.bind(this)
    );

    // Order-related notification listeners
    eventEmitter.on(
      ORDER_EVENTS.ORDER_CREATED.name,
      this.handleOrderCreated.bind(this)
    );
    eventEmitter.on(
      ORDER_EVENTS.ORDER_CONFIRMED.name,
      this.handleOrderConfirmed.bind(this)
    );
    eventEmitter.on(
      ORDER_EVENTS.ORDER_SHIPPED.name,
      this.handleOrderShipped.bind(this)
    );
    eventEmitter.on(
      ORDER_EVENTS.ORDER_DELIVERED.name,
      this.handleOrderDelivered.bind(this)
    );

    // Payment-related notification listeners
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_SUCCESSFUL.name,
      this.handlePaymentSuccessful.bind(this)
    );
    eventEmitter.on(
      PAYMENT_EVENTS.PAYMENT_FAILED.name,
      this.handlePaymentFailed.bind(this)
    );

    // Product-related notification listeners
    eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_LOW_STOCK.name,
      this.handleProductLowStock.bind(this)
    );
    eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_OUT_OF_STOCK.name,
      this.handleProductOutOfStock.bind(this)
    );
    eventEmitter.on(
      PRODUCT_EVENTS.PRODUCT_BACK_IN_STOCK.name,
      this.handleProductBackInStock.bind(this)
    );

    console.log("Notification listeners initialized successfully");
  }

  // ==================== USER EVENT HANDLERS ====================

  async handleUserRegistered(eventData) {
    try {
      const { userId, email, firstName, lastName } = eventData;

      // Send welcome notification
      await notificationService.createNotification({
        recipient: userId,
        type: "account",
        category: "success",
        title: "Welcome to ShopStream!",
        message: `Hi ${firstName}, welcome to ShopStream! Your account has been created successfully.`,
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: "/profile",
        actionText: "Complete Profile",
        metadata: {
          source: "system",
          triggerEvent: "user_registered",
        },
      });
    } catch (error) {
      console.error("Error handling user registered event:", error);
    }
  }

  async handleUserLoggedIn(eventData) {
    try {
      const { userId, loginMethod, metadata } = eventData;

      // Send security notification for unusual login
      if (loginMethod === "email" && metadata?.ipAddress) {
        await notificationService.createNotification({
          recipient: userId,
          type: "security",
          category: "info",
          title: "New Login Detected",
          message: `Your account was accessed from ${metadata.ipAddress}. If this wasn't you, please secure your account.`,
          channels: {
            email: { enabled: true },
            inApp: { enabled: true },
          },
          priority: "normal",
          actionUrl: "/security",
          actionText: "Review Security",
          metadata: {
            source: "system",
            triggerEvent: "user_logged_in",
          },
        });
      }
    } catch (error) {
      console.error("Error handling user logged in event:", error);
    }
  }

  async handleUserLoginFailed(eventData) {
    try {
      const { email, attemptCount, metadata } = eventData;

      // Send security alert for multiple failed attempts
      if (attemptCount >= 3) {
        // Find user by email to get userId
        const User = require("../../user/models/User.model");
        const user = await User.findOne({ email });

        if (user) {
          await notificationService.createNotification({
            recipient: user._id,
            type: "security",
            category: "warning",
            title: "Multiple Failed Login Attempts",
            message: `We detected ${attemptCount} failed login attempts on your account. Please secure your account if this wasn't you.`,
            channels: {
              email: { enabled: true },
              sms: { enabled: true },
              inApp: { enabled: true },
            },
            priority: "high",
            actionUrl: "/security",
            actionText: "Secure Account",
            metadata: {
              source: "system",
              triggerEvent: "user_login_failed",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error handling user login failed event:", error);
    }
  }

  async handleUserAccountLocked(eventData) {
    try {
      const { userId, email, reason } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "security",
        category: "error",
        title: "Account Temporarily Locked",
        message: `Your account has been temporarily locked due to ${reason}. Please contact support for assistance.`,
        channels: {
          email: { enabled: true },
          sms: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "urgent",
        actionUrl: "/support",
        actionText: "Contact Support",
        metadata: {
          source: "system",
          triggerEvent: "user_account_locked",
        },
      });
    } catch (error) {
      console.error("Error handling user account locked event:", error);
    }
  }

  async handlePasswordChanged(eventData) {
    try {
      const { userId, changeMethod } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "security",
        category: "success",
        title: "Password Changed Successfully",
        message:
          "Your password has been changed successfully. If you didn't make this change, please contact support immediately.",
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: "/security",
        actionText: "Review Security",
        metadata: {
          source: "system",
          triggerEvent: "password_changed",
        },
      });
    } catch (error) {
      console.error("Error handling password changed event:", error);
    }
  }

  async handleEmailVerified(eventData) {
    try {
      const { userId, email } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "account",
        category: "success",
        title: "Email Verified Successfully",
        message:
          "Your email address has been verified successfully. You can now enjoy all features of ShopStream.",
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: "/profile",
        actionText: "Complete Profile",
        metadata: {
          source: "system",
          triggerEvent: "email_verified",
        },
      });
    } catch (error) {
      console.error("Error handling email verified event:", error);
    }
  }

  // ==================== ORDER EVENT HANDLERS ====================

  async handleOrderCreated(eventData) {
    try {
      const { orderId, userId, totalAmount, items } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "order",
        category: "success",
        title: "Order Placed Successfully",
        message: `Your order #${orderId} has been placed successfully. Total amount: ₹${totalAmount}`,
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: `/orders/${orderId}`,
        actionText: "View Order",
        relatedEntity: {
          type: "order",
          id: orderId,
        },
        metadata: {
          source: "system",
          triggerEvent: "order_created",
        },
      });
    } catch (error) {
      console.error("Error handling order created event:", error);
    }
  }

  async handleOrderConfirmed(eventData) {
    try {
      const { orderId, userId, estimatedDelivery } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "order",
        category: "success",
        title: "Order Confirmed",
        message: `Your order #${orderId} has been confirmed and is being prepared. Expected delivery: ${estimatedDelivery}`,
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: `/orders/${orderId}`,
        actionText: "Track Order",
        relatedEntity: {
          type: "order",
          id: orderId,
        },
        metadata: {
          source: "system",
          triggerEvent: "order_confirmed",
        },
      });
    } catch (error) {
      console.error("Error handling order confirmed event:", error);
    }
  }

  async handleOrderShipped(eventData) {
    try {
      const { orderId, userId, trackingNumber, carrier } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "shipping",
        category: "success",
        title: "Order Shipped",
        message: `Your order #${orderId} has been shipped via ${carrier}. Tracking number: ${trackingNumber}`,
        channels: {
          email: { enabled: true },
          sms: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: `/orders/${orderId}/track`,
        actionText: "Track Package",
        relatedEntity: {
          type: "order",
          id: orderId,
        },
        metadata: {
          source: "system",
          triggerEvent: "order_shipped",
        },
      });
    } catch (error) {
      console.error("Error handling order shipped event:", error);
    }
  }

  async handleOrderDelivered(eventData) {
    try {
      const { orderId, userId, deliveredAt } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "shipping",
        category: "success",
        title: "Order Delivered",
        message: `Your order #${orderId} has been delivered successfully. We hope you love your purchase!`,
        channels: {
          email: { enabled: true },
          sms: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: `/orders/${orderId}/review`,
        actionText: "Leave Review",
        relatedEntity: {
          type: "order",
          id: orderId,
        },
        metadata: {
          source: "system",
          triggerEvent: "order_delivered",
        },
      });
    } catch (error) {
      console.error("Error handling order delivered event:", error);
    }
  }

  // ==================== PAYMENT EVENT HANDLERS ====================

  async handlePaymentSuccessful(eventData) {
    try {
      const { paymentId, userId, amount, orderId } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "payment",
        category: "success",
        title: "Payment Successful",
        message: `Your payment of ₹${amount} has been processed successfully.`,
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: `/payments/${paymentId}`,
        actionText: "View Receipt",
        relatedEntity: {
          type: "payment",
          id: paymentId,
        },
        metadata: {
          source: "system",
          triggerEvent: "payment_successful",
        },
      });
    } catch (error) {
      console.error("Error handling payment successful event:", error);
    }
  }

  async handlePaymentFailed(eventData) {
    try {
      const { paymentId, userId, amount, reason } = eventData;

      await notificationService.createNotification({
        recipient: userId,
        type: "payment",
        category: "error",
        title: "Payment Failed",
        message: `Your payment of ₹${amount} failed. Reason: ${reason}. Please try again or use a different payment method.`,
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "high",
        actionUrl: `/payments/${paymentId}/retry`,
        actionText: "Retry Payment",
        relatedEntity: {
          type: "payment",
          id: paymentId,
        },
        metadata: {
          source: "system",
          triggerEvent: "payment_failed",
        },
      });
    } catch (error) {
      console.error("Error handling payment failed event:", error);
    }
  }

  // ==================== PRODUCT EVENT HANDLERS ====================

  async handleProductLowStock(eventData) {
    try {
      const { productId, productName, currentStock, threshold } = eventData;

      // This would typically notify admin users
      await notificationService.createNotification({
        recipient: null, // Would be admin user ID
        type: "inventory",
        category: "warning",
        title: "Low Stock Alert",
        message: `${productName} is running low on stock. Current: ${currentStock}, Threshold: ${threshold}`,
        channels: {
          email: { enabled: true },
          inApp: { enabled: true },
        },
        priority: "normal",
        actionUrl: `/products/${productId}/inventory`,
        actionText: "Manage Inventory",
        relatedEntity: {
          type: "product",
          id: productId,
        },
        metadata: {
          source: "system",
          triggerEvent: "product_low_stock",
        },
      });
    } catch (error) {
      console.error("Error handling product low stock event:", error);
    }
  }

  async handleProductOutOfStock(eventData) {
    try {
      const { productId, productName } = eventData;

      // Notify users who have this product in their wishlist
      const User = require("../../user/models/User.model");
      const usersWithProductInWishlist = await User.find({
        wishlist: productId,
      });

      for (const user of usersWithProductInWishlist) {
        await notificationService.createNotification({
          recipient: user._id,
          type: "product",
          category: "info",
          title: "Product Out of Stock",
          message: `${productName} is currently out of stock. We'll notify you when it's back in stock.`,
          channels: {
            email: { enabled: true },
            inApp: { enabled: true },
          },
          priority: "normal",
          actionUrl: `/products/${productId}`,
          actionText: "View Product",
          relatedEntity: {
            type: "product",
            id: productId,
          },
          metadata: {
            source: "system",
            triggerEvent: "product_out_of_stock",
          },
        });
      }
    } catch (error) {
      console.error("Error handling product out of stock event:", error);
    }
  }

  async handleProductBackInStock(eventData) {
    try {
      const { productId, productName, newStock } = eventData;

      // Notify users who have this product in their wishlist
      const User = require("../../user/models/User.model");
      const usersWithProductInWishlist = await User.find({
        wishlist: productId,
      });

      for (const user of usersWithProductInWishlist) {
        await notificationService.createNotification({
          recipient: user._id,
          type: "product",
          category: "success",
          title: "Product Back in Stock",
          message: `Great news! ${productName} is back in stock. ${newStock} units available.`,
          channels: {
            email: { enabled: true },
            inApp: { enabled: true },
          },
          priority: "normal",
          actionUrl: `/products/${productId}`,
          actionText: "Buy Now",
          relatedEntity: {
            type: "product",
            id: productId,
          },
          metadata: {
            source: "system",
            triggerEvent: "product_back_in_stock",
          },
        });
      }
    } catch (error) {
      console.error("Error handling product back in stock event:", error);
    }
  }
}

// Create and export singleton instance
const notificationListeners = new NotificationListeners();

module.exports = notificationListeners;
