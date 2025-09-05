const admin = require("firebase-admin");
const webpush = require("web-push");
const ApiError = require("../../../shared/utils/apiError");
const config = require("../../../config");
const User = require("../../user/models/User.model");

class PushService {
  constructor() {
    this.firebaseApp = null;
    this.webpushConfigured = false;
    this.initializeServices();
  }

  async initializeServices() {
    try {
      // Initialize Firebase Admin SDK
      if (config.push.firebase.enabled) {
        if (!admin.apps.length) {
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(
              config.push.firebase.serviceAccount
            ),
            databaseURL: config.push.firebase.databaseURL,
          });
        } else {
          this.firebaseApp = admin.app();
        }
        console.log("Firebase push service initialized successfully");
      }

      // Initialize Web Push
      if (config.push.webpush.enabled) {
        webpush.setVapidDetails(
          config.push.webpush.subject,
          config.push.webpush.publicKey,
          config.push.webpush.privateKey
        );
        this.webpushConfigured = true;
        console.log("Web push service initialized successfully");
      }
    } catch (error) {
      console.error("Failed to initialize push services:", error);
      throw new ApiError(500, "Push service initialization failed");
    }
  }

  async sendPushNotification(pushData) {
    try {
      const {
        recipient,
        title,
        body,
        icon,
        image,
        actionUrl,
        actionText,
        data,
        priority = "normal",
        ttl = 86400, // 24 hours
        badge,
        sound,
        vibrate,
        requireInteraction = false,
        silent = false,
      } = pushData;

      // Validate required fields
      if (!recipient || !title || !body) {
        throw new ApiError(400, "Missing required push notification fields");
      }

      // Get user's device tokens
      const deviceTokens = await this.getUserDeviceTokens(recipient);

      if (!deviceTokens || deviceTokens.length === 0) {
        throw new ApiError(404, "No device tokens found for user");
      }

      const results = {
        firebase: null,
        webpush: null,
        deviceTokens: deviceTokens,
      };

      // Send Firebase push notifications
      if (
        this.firebaseApp &&
        deviceTokens.firebase &&
        deviceTokens.firebase.length > 0
      ) {
        try {
          results.firebase = await this.sendFirebasePush({
            tokens: deviceTokens.firebase,
            title,
            body,
            icon,
            image,
            data,
            priority,
            ttl,
            badge,
            sound,
          });
        } catch (error) {
          console.error("Firebase push failed:", error);
          results.firebase = { error: error.message };
        }
      }

      // Send Web Push notifications
      if (
        this.webpushConfigured &&
        deviceTokens.webpush &&
        deviceTokens.webpush.length > 0
      ) {
        try {
          results.webpush = await this.sendWebPush({
            subscriptions: deviceTokens.webpush,
            title,
            body,
            icon,
            image,
            actionUrl,
            actionText,
            data,
            ttl,
            badge,
            vibrate,
            requireInteraction,
            silent,
          });
        } catch (error) {
          console.error("Web push failed:", error);
          results.webpush = { error: error.message };
        }
      }

      return {
        success: true,
        results,
        totalTokens:
          deviceTokens.firebase?.length + deviceTokens.webpush?.length || 0,
      };
    } catch (error) {
      console.error("Push notification sending failed:", error);
      throw new ApiError(
        500,
        `Push notification sending failed: ${error.message}`
      );
    }
  }

  async sendFirebasePush(firebaseData) {
    try {
      const {
        tokens,
        title,
        body,
        icon,
        image,
        data,
        priority,
        ttl,
        badge,
        sound,
      } = firebaseData;

      const message = {
        notification: {
          title,
          body,
          imageUrl: image,
        },
        data: {
          ...data,
          icon: icon || "",
          click_action: data?.actionUrl || "",
        },
        android: {
          priority: priority === "high" ? "high" : "normal",
          ttl: ttl * 1000, // Convert to milliseconds
          notification: {
            icon: icon || "ic_notification",
            sound: sound || "default",
            clickAction: data?.actionUrl || "",
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              badge: badge || 1,
              sound: sound || "default",
              "content-available": 1,
            },
          },
        },
        tokens,
      };

      const response = await admin.messaging().sendMulticast(message);

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      throw new ApiError(500, `Firebase push failed: ${error.message}`);
    }
  }

  async sendWebPush(webpushData) {
    try {
      const {
        subscriptions,
        title,
        body,
        icon,
        image,
        actionUrl,
        actionText,
        data,
        ttl,
        badge,
        vibrate,
        requireInteraction,
        silent,
      } = webpushData;

      const payload = JSON.stringify({
        title,
        body,
        icon: icon || "/icon-192x192.png",
        image,
        badge: badge || "/badge-72x72.png",
        data: {
          ...data,
          url: actionUrl || "/",
          actionText: actionText || "View",
        },
        actions: actionUrl
          ? [
              {
                action: "view",
                title: actionText || "View",
                icon: "/icon-192x192.png",
              },
              {
                action: "dismiss",
                title: "Dismiss",
              },
            ]
          : undefined,
        vibrate: vibrate || [200, 100, 200],
        requireInteraction,
        silent,
        timestamp: Date.now(),
      });

      const results = await Promise.allSettled(
        subscriptions.map((subscription) =>
          webpush.sendNotification(subscription, payload, {
            TTL: ttl,
            urgency: "normal",
          })
        )
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failed = results.filter((result) => result.status === "rejected");

      return {
        successCount: successful.length,
        failureCount: failed.length,
        results: results.map((result, index) => ({
          index,
          success: result.status === "fulfilled",
          error: result.status === "rejected" ? result.reason.message : null,
        })),
      };
    } catch (error) {
      throw new ApiError(500, `Web push failed: ${error.message}`);
    }
  }

  async getUserDeviceTokens(userId) {
    try {
      const user = await User.findById(userId).select("deviceTokens");

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Group tokens by type
      const tokens = {
        firebase: [],
        webpush: [],
      };

      if (user.deviceTokens && user.deviceTokens.length > 0) {
        user.deviceTokens.forEach((token) => {
          if (token.type === "firebase" && token.token) {
            tokens.firebase.push(token.token);
          } else if (token.type === "webpush" && token.subscription) {
            tokens.webpush.push(token.subscription);
          }
        });
      }

      return tokens;
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to get user device tokens: ${error.message}`
      );
    }
  }

  async registerDeviceToken(userId, tokenData) {
    try {
      const { type, token, subscription, deviceInfo } = tokenData;

      if (!type || (!token && !subscription)) {
        throw new ApiError(400, "Invalid device token data");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Initialize deviceTokens array if it doesn't exist
      if (!user.deviceTokens) {
        user.deviceTokens = [];
      }

      // Check if token already exists
      const existingTokenIndex = user.deviceTokens.findIndex(
        (t) =>
          (t.type === type && t.token === token) ||
          (t.type === type &&
            JSON.stringify(t.subscription) === JSON.stringify(subscription))
      );

      const tokenDataToSave = {
        type,
        token,
        subscription,
        deviceInfo: deviceInfo || {},
        registeredAt: new Date(),
        lastUsed: new Date(),
      };

      if (existingTokenIndex >= 0) {
        // Update existing token
        user.deviceTokens[existingTokenIndex] = tokenDataToSave;
      } else {
        // Add new token
        user.deviceTokens.push(tokenDataToSave);
      }

      await user.save();

      return {
        success: true,
        message: "Device token registered successfully",
        tokenCount: user.deviceTokens.length,
      };
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to register device token: ${error.message}`
      );
    }
  }

  async unregisterDeviceToken(userId, tokenData) {
    try {
      const { type, token, subscription } = tokenData;

      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (!user.deviceTokens) {
        return { success: true, message: "No device tokens found" };
      }

      // Remove matching token
      user.deviceTokens = user.deviceTokens.filter(
        (t) =>
          !(
            (t.type === type && t.token === token) ||
            (t.type === type &&
              JSON.stringify(t.subscription) === JSON.stringify(subscription))
          )
      );

      await user.save();

      return {
        success: true,
        message: "Device token unregistered successfully",
        tokenCount: user.deviceTokens.length,
      };
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to unregister device token: ${error.message}`
      );
    }
  }

  async sendBulkPushNotifications(notificationsData) {
    try {
      const results = await Promise.allSettled(
        notificationsData.map((notificationData) =>
          this.sendPushNotification(notificationData)
        )
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failed = results.filter((result) => result.status === "rejected");

      return {
        total: notificationsData.length,
        successful: successful.length,
        failed: failed.length,
        results: results.map((result, index) => ({
          index,
          success: result.status === "fulfilled",
          data: result.status === "fulfilled" ? result.value : null,
          error: result.status === "rejected" ? result.reason.message : null,
        })),
      };
    } catch (error) {
      throw new ApiError(
        500,
        `Bulk push notification sending failed: ${error.message}`
      );
    }
  }

  async getPushStats(timeRange = "7d") {
    try {
      // This would typically fetch from Firebase Analytics or your own analytics
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
        timeRange,
      };
    } catch (error) {
      throw new ApiError(500, `Failed to get push stats: ${error.message}`);
    }
  }

  async validateDeviceToken(token, type) {
    try {
      if (type === "firebase") {
        // Validate Firebase token format
        return /^[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/.test(token);
      } else if (type === "webpush") {
        // Validate Web Push subscription
        return token && token.endpoint && token.keys;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const pushService = new PushService();

module.exports = pushService;
