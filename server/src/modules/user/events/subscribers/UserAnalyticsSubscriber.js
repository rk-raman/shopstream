/**
 * User Analytics Subscriber
 *
 * Handles all analytics-related side effects for user events
 * Tracks user behavior and generates analytics data
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../../shared/events/eventDefinitions");

class UserAnalyticsSubscriber {
  constructor() {
    this.eventEmitter = eventEmitter;
    this.subscriptions = [];
  }

  /**
   * Initialize all analytics subscriptions
   */
  async initialize() {
    // User lifecycle analytics
    await this.subscribeToUserRegistered();
    await this.subscribeToUserLoggedIn();
    await this.subscribeToUserLoggedOut();
    await this.subscribeToUserLoginFailed();

    // Profile analytics
    await this.subscribeToUserUpdated();
    await this.subscribeToUserProfileCompleted();

    // Security analytics
    await this.subscribeToPasswordChanged();
    await this.subscribeToEmailVerified();
    await this.subscribeToPhoneVerified();

    // Address analytics
    await this.subscribeToAddressAdded();
    await this.subscribeToAddressUpdated();

    // Wishlist analytics
    await this.subscribeToWishlistItemAdded();
    await this.subscribeToWishlistItemRemoved();

    // Account status analytics
    await this.subscribeToUserActivated();
    await this.subscribeToUserDeactivated();
    await this.subscribeToUserRoleChanged();

    // Activity analytics
    await this.subscribeToUserActivityTracked();

    console.log("User analytics subscriber initialized");
  }

  /**
   * Subscribe to user registration events
   */
  async subscribeToUserRegistered() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_REGISTERED.name,
      async (eventPayload) => {
        console.log("User registered - tracking analytics:", eventPayload.data);

        // Track user registration analytics
        await this.eventEmitter.publish("analytics.user_registered", {
          userId: eventPayload.data.userId,
          email: eventPayload.data.email,
          registrationMethod: eventPayload.data.registrationMethod,
          timestamp: eventPayload.timestamp,
          metadata: eventPayload.data.metadata,
          eventId: eventPayload.id,
        });

        // Track registration source
        await this.eventEmitter.publish("analytics.registration_source", {
          userId: eventPayload.data.userId,
          referrer: eventPayload.data.metadata?.referrer,
          userAgent: eventPayload.data.metadata?.userAgent,
          ipAddress: eventPayload.data.metadata?.ipAddress,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user login events
   */
  async subscribeToUserLoggedIn() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_LOGGED_IN.name,
      async (eventPayload) => {
        console.log("User logged in - tracking analytics:", eventPayload.data);

        // Track login analytics
        await this.eventEmitter.publish("analytics.user_login", {
          userId: eventPayload.data.userId,
          loginMethod: eventPayload.data.loginMethod,
          timestamp: eventPayload.timestamp,
          metadata: eventPayload.data.metadata,
          eventId: eventPayload.id,
        });

        // Track session analytics
        await this.eventEmitter.publish("analytics.session_started", {
          userId: eventPayload.data.userId,
          sessionId: eventPayload.data.metadata?.sessionId,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user logout events
   */
  async subscribeToUserLoggedOut() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_LOGGED_OUT.name,
      async (eventPayload) => {
        console.log("User logged out - tracking analytics:", eventPayload.data);

        // Track session analytics
        await this.eventEmitter.publish("analytics.session_ended", {
          userId: eventPayload.data.userId,
          sessionId: eventPayload.data.sessionId,
          sessionDuration: eventPayload.data.metadata?.sessionDuration,
          logoutReason: eventPayload.data.metadata?.logoutReason,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
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
          "User login failed - tracking security analytics:",
          eventPayload.data
        );

        // Track failed login analytics
        await this.eventEmitter.publish("analytics.login_failed", {
          email: eventPayload.data.email,
          attemptCount: eventPayload.data.attemptCount,
          failureReason: eventPayload.data.metadata?.failureReason,
          ipAddress: eventPayload.data.metadata?.ipAddress,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Track security events
        await this.eventEmitter.publish("analytics.security_event", {
          type: "failed_login",
          email: eventPayload.data.email,
          attemptCount: eventPayload.data.attemptCount,
          ipAddress: eventPayload.data.metadata?.ipAddress,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user profile updated events
   */
  async subscribeToUserUpdated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_UPDATED.name,
      async (eventPayload) => {
        console.log(
          "User updated - tracking profile analytics:",
          eventPayload.data
        );

        // Track profile update analytics
        await this.eventEmitter.publish("analytics.profile_updated", {
          userId: eventPayload.data.userId,
          changes: eventPayload.data.changes,
          updatedBy: eventPayload.data.updatedBy,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
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
          "User profile completed - tracking analytics:",
          eventPayload.data
        );

        // Track profile completion analytics
        await this.eventEmitter.publish("analytics.profile_completed", {
          userId: eventPayload.data.userId,
          completionPercentage: eventPayload.data.completionPercentage,
          completedFields: eventPayload.data.completedFields,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
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
          "Password changed - tracking security analytics:",
          eventPayload.data
        );

        // Track security analytics
        await this.eventEmitter.publish("analytics.security_event", {
          type: "password_changed",
          userId: eventPayload.data.userId,
          changeMethod: eventPayload.data.changeMethod,
          ipAddress: eventPayload.data.metadata?.ipAddress,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
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
        console.log("Email verified - tracking analytics:", eventPayload.data);

        // Track verification analytics
        await this.eventEmitter.publish("analytics.verification_completed", {
          userId: eventPayload.data.userId,
          verificationType: "email",
          verificationMethod: eventPayload.data.verificationMethod,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
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
        console.log("Phone verified - tracking analytics:", eventPayload.data);

        // Track verification analytics
        await this.eventEmitter.publish("analytics.verification_completed", {
          userId: eventPayload.data.userId,
          verificationType: "phone",
          verificationMethod: eventPayload.data.verificationMethod,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to address added events
   */
  async subscribeToAddressAdded() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.ADDRESS_ADDED.name,
      async (eventPayload) => {
        console.log("Address added - tracking analytics:", eventPayload.data);

        // Track address analytics
        await this.eventEmitter.publish("analytics.address_added", {
          userId: eventPayload.data.userId,
          addressType: eventPayload.data.addressType,
          city: eventPayload.data.city,
          state: eventPayload.data.state,
          pincode: eventPayload.data.pincode,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to address updated events
   */
  async subscribeToAddressUpdated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.ADDRESS_UPDATED.name,
      async (eventPayload) => {
        console.log("Address updated - tracking analytics:", eventPayload.data);

        // Track address update analytics
        await this.eventEmitter.publish("analytics.address_updated", {
          userId: eventPayload.data.userId,
          addressId: eventPayload.data.addressId,
          changes: eventPayload.data.changes,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to wishlist item added events
   */
  async subscribeToWishlistItemAdded() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.WISHLIST_ITEM_ADDED.name,
      async (eventPayload) => {
        console.log(
          "Wishlist item added - tracking analytics:",
          eventPayload.data
        );

        // Track wishlist analytics
        await this.eventEmitter.publish("analytics.wishlist_item_added", {
          userId: eventPayload.data.userId,
          productId: eventPayload.data.productId,
          productCategory: eventPayload.data.productCategory,
          productPrice: eventPayload.data.productPrice,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to wishlist item removed events
   */
  async subscribeToWishlistItemRemoved() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.WISHLIST_ITEM_REMOVED.name,
      async (eventPayload) => {
        console.log(
          "Wishlist item removed - tracking analytics:",
          eventPayload.data
        );

        // Track wishlist analytics
        await this.eventEmitter.publish("analytics.wishlist_item_removed", {
          userId: eventPayload.data.userId,
          productId: eventPayload.data.productId,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user activated events
   */
  async subscribeToUserActivated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_ACTIVATED.name,
      async (eventPayload) => {
        console.log("User activated - tracking analytics:", eventPayload.data);

        // Track account status analytics
        await this.eventEmitter.publish("analytics.account_status_changed", {
          userId: eventPayload.data.userId,
          status: "activated",
          activatedBy: eventPayload.data.activatedBy,
          reason: eventPayload.data.reason,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user deactivated events
   */
  async subscribeToUserDeactivated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_DEACTIVATED.name,
      async (eventPayload) => {
        console.log(
          "User deactivated - tracking analytics:",
          eventPayload.data
        );

        // Track account status analytics
        await this.eventEmitter.publish("analytics.account_status_changed", {
          userId: eventPayload.data.userId,
          status: "deactivated",
          deactivatedBy: eventPayload.data.deactivatedBy,
          reason: eventPayload.data.reason,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
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
          "User role changed - tracking analytics:",
          eventPayload.data
        );

        // Track role change analytics
        await this.eventEmitter.publish("analytics.role_changed", {
          userId: eventPayload.data.userId,
          oldRole: eventPayload.data.oldRole,
          newRole: eventPayload.data.newRole,
          changedBy: eventPayload.data.changedBy,
          reason: eventPayload.data.reason,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Subscribe to user activity tracked events
   */
  async subscribeToUserActivityTracked() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_ACTIVITY_TRACKED.name,
      async (eventPayload) => {
        console.log(
          "User activity tracked - processing analytics:",
          eventPayload.data
        );

        // Track general activity analytics
        await this.eventEmitter.publish("analytics.activity_tracked", {
          userId: eventPayload.data.userId,
          activityType: eventPayload.data.activityType,
          metadata: eventPayload.data.metadata,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
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
      console.log(`Cleaning up analytics subscription: ${subscriptionId}`);
    }
    this.subscriptions = [];
  }
}

module.exports = UserAnalyticsSubscriber;
