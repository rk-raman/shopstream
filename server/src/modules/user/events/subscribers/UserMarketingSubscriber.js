/**
 * User Marketing Subscriber
 *
 * Handles all marketing-related side effects for user events
 * Manages user segments, campaigns, and marketing automation
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../../shared/events/eventDefinitions");

class UserMarketingSubscriber {
  constructor() {
    this.eventEmitter = eventEmitter;
    this.subscriptions = [];
  }

  /**
   * Initialize all marketing subscriptions
   */
  async initialize() {
    // User lifecycle marketing
    await this.subscribeToUserRegistered();
    await this.subscribeToUserLoggedIn();

    // Profile marketing
    await this.subscribeToUserProfileCompleted();
    await this.subscribeToEmailVerified();
    await this.subscribeToPhoneVerified();

    // Wishlist marketing
    await this.subscribeToWishlistItemAdded();
    await this.subscribeToWishlistItemRemoved();

    // Account status marketing
    await this.subscribeToUserActivated();
    await this.subscribeToUserDeactivated();
    await this.subscribeToUserRoleChanged();

    // Activity marketing
    await this.subscribeToUserActivityTracked();

    console.log("User marketing subscriber initialized");
  }

  /**
   * Subscribe to user registration events
   */
  async subscribeToUserRegistered() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.USER_REGISTERED.name,
      async (eventPayload) => {
        console.log(
          "User registered - setting up marketing:",
          eventPayload.data
        );

        // Create default user segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["new_user", `role_${eventPayload.data.role}`],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Trigger welcome campaign
        await this.eventEmitter.publish("marketing.trigger_campaign", {
          campaignType: "welcome_series",
          userId: eventPayload.data.userId,
          email: eventPayload.data.email,
          firstName: eventPayload.data.firstName,
          lastName: eventPayload.data.lastName,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Set up onboarding journey
        await this.eventEmitter.publish("marketing.start_journey", {
          journeyType: "onboarding",
          userId: eventPayload.data.userId,
          entryPoint: "registration",
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
        console.log(
          "User logged in - updating marketing segments:",
          eventPayload.data
        );

        // Update user engagement segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["active_user", "recent_login"],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Check for re-engagement campaigns
        await this.eventEmitter.publish("marketing.check_reengagement", {
          userId: eventPayload.data.userId,
          loginMethod: eventPayload.data.loginMethod,
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
          "User profile completed - updating marketing:",
          eventPayload.data
        );

        // Update user segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["profile_complete"],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Trigger profile completion rewards
        await this.eventEmitter.publish("marketing.trigger_campaign", {
          campaignType: "profile_completion_reward",
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
   * Subscribe to email verification events
   */
  async subscribeToEmailVerified() {
    const subscriptionId = await this.eventEmitter.subscribe(
      USER_EVENTS.EMAIL_VERIFIED.name,
      async (eventPayload) => {
        console.log(
          "Email verified - updating marketing segments:",
          eventPayload.data
        );

        // Update user segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["verified_email"],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Trigger email verification rewards
        await this.eventEmitter.publish("marketing.trigger_campaign", {
          campaignType: "email_verification_reward",
          userId: eventPayload.data.userId,
          email: eventPayload.data.email,
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
        console.log(
          "Phone verified - updating marketing segments:",
          eventPayload.data
        );

        // Update user segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["verified_phone"],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Trigger phone verification rewards
        await this.eventEmitter.publish("marketing.trigger_campaign", {
          campaignType: "phone_verification_reward",
          userId: eventPayload.data.userId,
          phone: eventPayload.data.phone,
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
          "Wishlist item added - updating marketing:",
          eventPayload.data
        );

        // Update user interest segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: [`interested_in_${eventPayload.data.productCategory}`],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Set up price drop alerts
        await this.eventEmitter.publish("marketing.setup_price_alert", {
          userId: eventPayload.data.userId,
          productId: eventPayload.data.productId,
          currentPrice: eventPayload.data.productPrice,
          productCategory: eventPayload.data.productCategory,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Trigger wishlist campaigns
        await this.eventEmitter.publish("marketing.trigger_campaign", {
          campaignType: "wishlist_abandonment",
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
          "Wishlist item removed - updating marketing:",
          eventPayload.data
        );

        // Cancel price alerts
        await this.eventEmitter.publish("marketing.cancel_price_alert", {
          userId: eventPayload.data.userId,
          productId: eventPayload.data.productId,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Update recommendation engine
        await this.eventEmitter.publish("marketing.update_recommendations", {
          userId: eventPayload.data.userId,
          productId: eventPayload.data.productId,
          action: "removed_from_wishlist",
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
        console.log("User activated - updating marketing:", eventPayload.data);

        // Update user segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["active_user"],
          removeSegments: ["inactive_user"],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Trigger reactivation campaign
        await this.eventEmitter.publish("marketing.trigger_campaign", {
          campaignType: "reactivation_welcome",
          userId: eventPayload.data.userId,
          activationReason: eventPayload.data.reason,
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
          "User deactivated - updating marketing:",
          eventPayload.data
        );

        // Update user segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["inactive_user"],
          removeSegments: ["active_user"],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Pause all active campaigns
        await this.eventEmitter.publish("marketing.pause_user_campaigns", {
          userId: eventPayload.data.userId,
          reason: "account_deactivated",
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
          "User role changed - updating marketing:",
          eventPayload.data
        );

        // Update user segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: [`role_${eventPayload.data.newRole}`],
          removeSegments: [`role_${eventPayload.data.oldRole}`],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Trigger role-specific campaigns
        await this.eventEmitter.publish("marketing.trigger_campaign", {
          campaignType: "role_change_welcome",
          userId: eventPayload.data.userId,
          oldRole: eventPayload.data.oldRole,
          newRole: eventPayload.data.newRole,
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
          "User activity tracked - updating marketing:",
          eventPayload.data
        );

        // Update engagement segments
        await this.eventEmitter.publish("marketing.user_segment_assigned", {
          userId: eventPayload.data.userId,
          segments: ["engaged_user"],
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });

        // Check for engagement-based campaigns
        await this.eventEmitter.publish(
          "marketing.check_engagement_campaigns",
          {
            userId: eventPayload.data.userId,
            activityType: eventPayload.data.activityType,
            metadata: eventPayload.data.metadata,
            timestamp: eventPayload.timestamp,
            eventId: eventPayload.id,
          }
        );
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  /**
   * Cleanup subscriptions
   */
  async cleanup() {
    for (const subscriptionId of this.subscriptions) {
      console.log(`Cleaning up marketing subscription: ${subscriptionId}`);
    }
    this.subscriptions = [];
  }
}

module.exports = UserMarketingSubscriber;
