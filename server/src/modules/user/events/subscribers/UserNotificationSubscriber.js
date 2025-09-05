/**
 * User Notification Subscriber
 *
 * Handles all notification-related side effects for user events
 * Separated for better maintainability and testing
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../../shared/events/eventDefinitions");

class UserNotificationSubscriber {
  constructor() {
    this.eventEmitter = eventEmitter;
    this.subscriptions = [];
  }

  /**
   * Initialize all notification subscriptions
   */
  async initialize() {
    // User registration notifications
    await this.subscribeToUserRegistered();

    // User login notifications
    await this.subscribeToUserLoginFailed();
    await this.subscribeToUserAccountLocked();

    // Profile notifications
    await this.subscribeToUserProfileCompleted();

    // Security notifications
    await this.subscribeToPasswordChanged();
    await this.subscribeToEmailVerified();
    await this.subscribeToPhoneVerified();

    // Account status notifications
    await this.subscribeToUserDeactivated();
    await this.subscribeToUserRoleChanged();

    console.log("User notification subscriber initialized");
  }

  /**
   * Subscribe to user registration events
   */
  async subscribeToUserRegistered() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_REGISTERED.name,
      async (eventPayload) => {
        console.log(
          "User registered - sending welcome email:",
          eventPayload.data
        );

        // Send welcome email
        await this.eventEmitter.publish("notification.send_email", {
          type: "welcome",
          to: eventPayload.data.email,
          data: {
            firstName: eventPayload.data.firstName,
            lastName: eventPayload.data.lastName,
            userId: eventPayload.data.userId,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });

        // Send email verification if not already verified
        await this.eventEmitter.publish("notification.send_email", {
          type: "email_verification",
          to: eventPayload.data.email,
          data: {
            firstName: eventPayload.data.firstName,
            verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=PLACEHOLDER_TOKEN`,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to failed login events
   */
  async subscribeToUserLoginFailed() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_LOGIN_FAILED.name,
      async (eventPayload) => {
        console.log(
          "User login failed - checking security alerts:",
          eventPayload.data
        );

        // Send security alert if multiple failures
        if (eventPayload.data.attemptCount >= 3) {
          await this.eventEmitter.publish("notification.send_email", {
            type: "security_alert",
            to: eventPayload.data.email,
            data: {
              attemptCount: eventPayload.data.attemptCount,
              timestamp: eventPayload.timestamp,
              ipAddress: eventPayload.data.metadata?.ipAddress,
            },
            metadata: {
              eventId: eventPayload.id,
              timestamp: eventPayload.timestamp,
            },
          });
        }
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to account locked events
   */
  async subscribeToUserAccountLocked() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_ACCOUNT_LOCKED.name,
      async (eventPayload) => {
        console.log(
          "User account locked - sending notification:",
          eventPayload.data
        );

        await this.eventEmitter.publish("notification.send_email", {
          type: "account_locked",
          to: eventPayload.data.email,
          data: {
            reason: eventPayload.data.reason,
            lockedUntil: eventPayload.data.lockedUntil,
            timestamp: eventPayload.timestamp,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to profile completion events
   */
  async subscribeToUserProfileCompleted() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_PROFILE_COMPLETED.name,
      async (eventPayload) => {
        console.log(
          "User profile completed - sending congratulations:",
          eventPayload.data
        );

        await this.eventEmitter.publish("notification.send_email", {
          type: "profile_completed",
          to: eventPayload.data.userId, // This would need to be resolved to email
          data: {
            completionPercentage: eventPayload.data.completionPercentage,
            completedFields: eventPayload.data.completedFields,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to password changed events
   */
  async subscribeToPasswordChanged() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.PASSWORD_CHANGED.name,
      async (eventPayload) => {
        console.log(
          "Password changed - sending confirmation:",
          eventPayload.data
        );

        await this.eventEmitter.publish("notification.send_email", {
          type: "password_changed_confirmation",
          to: eventPayload.data.userId, // This would need to be resolved to email
          data: {
            changeMethod: eventPayload.data.changeMethod,
            timestamp: eventPayload.timestamp,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to email verification events
   */
  async subscribeToEmailVerified() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.EMAIL_VERIFIED.name,
      async (eventPayload) => {
        console.log("Email verified - sending welcome:", eventPayload.data);

        await this.eventEmitter.publish("notification.send_email", {
          type: "email_verified_welcome",
          to: eventPayload.data.email,
          data: {
            verificationMethod: eventPayload.data.verificationMethod,
            timestamp: eventPayload.timestamp,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to phone verification events
   */
  async subscribeToPhoneVerified() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.PHONE_VERIFIED.name,
      async (eventPayload) => {
        console.log(
          "Phone verified - sending SMS confirmation:",
          eventPayload.data
        );

        await this.eventEmitter.publish("notification.send_sms", {
          type: "phone_verified",
          to: eventPayload.data.phone,
          data: {
            verificationMethod: eventPayload.data.verificationMethod,
            timestamp: eventPayload.timestamp,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user deactivation events
   */
  async subscribeToUserDeactivated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_DEACTIVATED.name,
      async (eventPayload) => {
        console.log(
          "User deactivated - sending confirmation:",
          eventPayload.data
        );

        await this.eventEmitter.publish("notification.send_email", {
          type: "account_deactivated",
          to: eventPayload.data.userId, // This would need to be resolved to email
          data: {
            deactivatedBy: eventPayload.data.deactivatedBy,
            reason: eventPayload.data.reason,
            timestamp: eventPayload.timestamp,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user role changed events
   */
  async subscribeToUserRoleChanged() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_ROLE_CHANGED.name,
      async (eventPayload) => {
        console.log(
          "User role changed - sending notification:",
          eventPayload.data
        );

        await this.eventEmitter.publish("notification.send_email", {
          type: "role_changed",
          to: eventPayload.data.userId, // This would need to be resolved to email
          data: {
            oldRole: eventPayload.data.oldRole,
            newRole: eventPayload.data.newRole,
            changedBy: eventPayload.data.changedBy,
            reason: eventPayload.data.reason,
            timestamp: eventPayload.timestamp,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Cleanup subscriptions
   */
  async cleanup() {
    for (const subscriptionId of this.subscriptions) {
      // Note: The current event emitter doesn't support unsubscribing by ID
      // This would need to be implemented in the event bus abstraction
      console.log(`Cleaning up subscription: ${subscriptionId}`);
    }
    this.subscriptions = [];
  }
}

module.exports = UserNotificationSubscriber;
