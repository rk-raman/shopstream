/**
 * User Event Publisher
 *
 * Centralized class for publishing user-related events
 * Handles event validation and consistent event structure
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const {
  USER_EVENTS,
  validateEventPayload,
} = require("../../../../shared/events/eventDefinitions");

class UserEventPublisher {
  constructor() {
    this.eventEmitter = eventEmitter;
  }

  /**
   * Publish user registration event
   */
  async publishUserRegistered(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      registrationMethod: userData.registrationMethod || "email",
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: userData.userAgent,
        ipAddress: userData.ipAddress,
        referrer: userData.referrer,
      },
    };

    // Validate event payload
    validateEventPayload(USER_EVENTS.USER_REGISTERED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_REGISTERED.name,
      eventData
    );
  }

  /**
   * Publish user login event
   */
  async publishUserLoggedIn(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      email: userData.email,
      loginMethod: userData.loginMethod || "email",
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: userData.userAgent,
        ipAddress: userData.ipAddress,
        sessionId: userData.sessionId,
      },
    };

    validateEventPayload(USER_EVENTS.USER_LOGGED_IN.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_LOGGED_IN.name,
      eventData
    );
  }

  /**
   * Publish user logout event
   */
  async publishUserLoggedOut(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      sessionId: userData.sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        logoutReason: userData.logoutReason || "user_initiated",
        sessionDuration: userData.sessionDuration,
      },
    };

    validateEventPayload(USER_EVENTS.USER_LOGGED_OUT.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_LOGGED_OUT.name,
      eventData
    );
  }

  /**
   * Publish failed login event
   */
  async publishUserLoginFailed(loginData) {
    const eventData = {
      email: loginData.email,
      attemptCount: loginData.attemptCount || 1,
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: loginData.userAgent,
        ipAddress: loginData.ipAddress,
        failureReason: loginData.failureReason || "invalid_credentials",
      },
    };

    validateEventPayload(USER_EVENTS.USER_LOGIN_FAILED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_LOGIN_FAILED.name,
      eventData
    );
  }

  /**
   * Publish account locked event
   */
  async publishUserAccountLocked(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      email: userData.email,
      reason: userData.reason || "too_many_failed_attempts",
      lockedUntil: userData.lockedUntil,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.USER_ACCOUNT_LOCKED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_ACCOUNT_LOCKED.name,
      eventData
    );
  }

  /**
   * Publish user profile updated event
   */
  async publishUserUpdated(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      changes: userData.changes,
      timestamp: new Date().toISOString(),
      updatedBy: userData.updatedBy || userData.userId || userData._id,
    };

    validateEventPayload(USER_EVENTS.USER_UPDATED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_UPDATED.name,
      eventData
    );
  }

  /**
   * Publish profile completion event
   */
  async publishUserProfileCompleted(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      completionPercentage: userData.completionPercentage,
      completedFields: userData.completedFields,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.USER_PROFILE_COMPLETED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_PROFILE_COMPLETED.name,
      eventData
    );
  }

  /**
   * Publish password changed event
   */
  async publishPasswordChanged(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      changeMethod: userData.changeMethod || "user_initiated",
      timestamp: new Date().toISOString(),
      metadata: {
        ipAddress: userData.ipAddress,
        userAgent: userData.userAgent,
      },
    };

    validateEventPayload(USER_EVENTS.PASSWORD_CHANGED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.PASSWORD_CHANGED.name,
      eventData
    );
  }

  /**
   * Publish email verification event
   */
  async publishEmailVerified(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      email: userData.email,
      verificationMethod: userData.verificationMethod || "email_link",
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.EMAIL_VERIFIED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.EMAIL_VERIFIED.name,
      eventData
    );
  }

  /**
   * Publish phone verification event
   */
  async publishPhoneVerified(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      phone: userData.phone,
      verificationMethod: userData.verificationMethod || "sms_code",
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.PHONE_VERIFIED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.PHONE_VERIFIED.name,
      eventData
    );
  }

  /**
   * Publish address added event
   */
  async publishAddressAdded(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      addressId: userData.addressId,
      addressType: userData.addressType || "home",
      city: userData.city,
      state: userData.state,
      pincode: userData.pincode,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.ADDRESS_ADDED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.ADDRESS_ADDED.name,
      eventData
    );
  }

  /**
   * Publish address updated event
   */
  async publishAddressUpdated(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      addressId: userData.addressId,
      changes: userData.changes,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.ADDRESS_UPDATED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.ADDRESS_UPDATED.name,
      eventData
    );
  }

  /**
   * Publish address deleted event
   */
  async publishAddressDeleted(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      addressId: userData.addressId,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.ADDRESS_DELETED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.ADDRESS_DELETED.name,
      eventData
    );
  }

  /**
   * Publish wishlist item added event
   */
  async publishWishlistItemAdded(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      productId: userData.productId,
      productCategory: userData.productCategory,
      productPrice: userData.productPrice,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.WISHLIST_ITEM_ADDED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.WISHLIST_ITEM_ADDED.name,
      eventData
    );
  }

  /**
   * Publish wishlist item removed event
   */
  async publishWishlistItemRemoved(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      productId: userData.productId,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.WISHLIST_ITEM_REMOVED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.WISHLIST_ITEM_REMOVED.name,
      eventData
    );
  }

  /**
   * Publish user activated event
   */
  async publishUserActivated(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      activatedBy: userData.activatedBy,
      reason: userData.reason || "manual_activation",
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.USER_ACTIVATED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_ACTIVATED.name,
      eventData
    );
  }

  /**
   * Publish user deactivated event
   */
  async publishUserDeactivated(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      deactivatedBy: userData.deactivatedBy,
      reason: userData.reason || "manual_deactivation",
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.USER_DEACTIVATED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_DEACTIVATED.name,
      eventData
    );
  }

  /**
   * Publish user deleted event
   */
  async publishUserDeleted(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      deletedBy: userData.deletedBy,
      reason: userData.reason || "user_request",
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.USER_DELETED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_DELETED.name,
      eventData
    );
  }

  /**
   * Publish user role changed event
   */
  async publishUserRoleChanged(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      oldRole: userData.oldRole,
      newRole: userData.newRole,
      changedBy: userData.changedBy,
      reason: userData.reason || "admin_action",
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(USER_EVENTS.USER_ROLE_CHANGED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_ROLE_CHANGED.name,
      eventData
    );
  }

  /**
   * Publish user activity tracked event
   */
  async publishUserActivityTracked(userData) {
    const eventData = {
      userId: userData.userId || userData._id,
      activityType: userData.activityType,
      timestamp: new Date().toISOString(),
      metadata: userData.metadata || {},
    };

    validateEventPayload(USER_EVENTS.USER_ACTIVITY_TRACKED.name, eventData);

    return await this.eventEmitter.publish(
      USER_EVENTS.USER_ACTIVITY_TRACKED.name,
      eventData
    );
  }
}

module.exports = UserEventPublisher;
