const CheckoutSession = require("../models/CheckoutSession.model");
const Cart = require("../../cart/models/Cart.model");
const Product = require("../../product/models/Product.model");
const Order = require("../../order/models/Order.model");
const User = require("../../user/models/User.model");
const couponService = require("../../coupon/services/coupon.service");
const inventoryService = require("../../inventory/services/inventory.service");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { ORDER_EVENTS, CHECKOUT_EVENTS } = require("../../../shared/events/eventTypes");

class CheckoutService {
  /**
   * Create or resume an active checkout session from the user's cart
   */
  async createSession(userId) {
    // Check for existing active session
    let session = await CheckoutSession.findOne({
      user: userId,
      status: "active",
    });

    // Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select:
        "name images basePrice discountPrice stock status hasVariants variants seller",
    });

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Cart is empty");
    }

    // Snapshot cart items into checkout items
    const checkoutItems = cart.items.map((item) => {
      const product = item.product;
      const mainImage = product.images?.find((img) => img.isMain)?.url ||
        product.images?.[0]?.url || "";

      return {
        product: product._id,
        productName: product.name,
        productImage: mainImage,
        variant: item.variant?.variantId ? item.variant : undefined,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice,
        seller: product.seller,
        deliveryEstimate: {
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days default
          method: "standard",
        },
      };
    });

    if (session) {
      // Update existing session with fresh cart data
      session.items = checkoutItems;
      session.cartSnapshotAt = new Date();
      session.refreshExpiry();
      session.calculatePricing();
      await session.save();
    } else {
      // Create new session
      session = new CheckoutSession({
        user: userId,
        items: checkoutItems,
        cartSnapshotAt: new Date(),
        currentStep: "address",
      });
      session.calculatePricing();
      await session.save();
    }

    return await this.getSessionWithDetails(session._id);
  }

  /**
   * Get session by ID with user validation
   */
  async getSession(sessionId, userId) {
    const session = await this.getSessionWithDetails(sessionId);

    if (!session) {
      throw ApiError.notFound("Checkout session not found");
    }

    if (session.user._id.toString() !== userId.toString()) {
      throw ApiError.forbidden("Access denied");
    }

    if (session.status !== "active") {
      throw ApiError.badRequest("Checkout session is no longer active");
    }

    // Refresh TTL on access
    session.refreshExpiry();
    await session.save();

    return session;
  }

  /**
   * Set delivery address for the session
   */
  async setAddress(sessionId, userId, addressData) {
    const session = await this.getSession(sessionId, userId);

    if (addressData.addressId) {
      // Use a saved address from user profile
      const user = await User.findById(userId);
      const savedAddress = user.addresses.id(addressData.addressId);

      if (!savedAddress) {
        throw ApiError.notFound("Address not found");
      }

      session.selectedAddressId = savedAddress._id;
      session.deliveryAddress = {
        fullName: savedAddress.fullName,
        phone: savedAddress.phone,
        addressLine1: savedAddress.addressLine1,
        addressLine2: savedAddress.addressLine2,
        city: savedAddress.city,
        state: savedAddress.state,
        pincode: savedAddress.pincode,
        country: savedAddress.country || "India",
        type: savedAddress.type || "home",
      };
    } else {
      // Use a new address provided in the request
      session.selectedAddressId = null;
      session.deliveryAddress = {
        fullName: addressData.fullName,
        phone: addressData.phone,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        country: addressData.country || "India",
        type: addressData.type || "home",
      };
    }

    // Update delivery estimates based on pincode
    session.items.forEach((item) => {
      item.deliveryEstimate = this.estimateDelivery(
        session.deliveryAddress.pincode
      );
    });

    session.currentStep = "summary";
    session.calculatePricing();
    await session.save();

    return await this.getSessionWithDetails(session._id);
  }

  /**
   * Get order summary with delivery estimates
   */
  async getSummary(sessionId, userId) {
    const session = await this.getSession(sessionId, userId);

    if (!session.deliveryAddress || !session.deliveryAddress.fullName) {
      throw ApiError.badRequest("Please select a delivery address first");
    }

    return {
      items: session.items,
      deliveryAddress: session.deliveryAddress,
      pricing: session.pricing,
      appliedCoupon: session.appliedCoupon,
      estimatedDelivery: session.items.map((item) => ({
        productName: item.productName,
        deliveryDate: item.deliveryEstimate?.date,
        method: item.deliveryEstimate?.method,
      })),
    };
  }

  /**
   * Apply coupon code to the session
   */
  async applyCoupon(sessionId, userId, code) {
    const session = await this.getSession(sessionId, userId);

    const couponResult = await couponService.validateAndApply(
      code,
      session.pricing.subtotal,
      userId
    );

    session.appliedCoupon = {
      couponId: couponResult.couponId,
      code: couponResult.code,
      discountType: couponResult.discountType,
      discountValue: couponResult.discountValue,
      discountAmount: couponResult.discountAmount,
    };

    session.calculatePricing();
    await session.save();

    return await this.getSessionWithDetails(session._id);
  }

  /**
   * Remove coupon from the session
   */
  async removeCoupon(sessionId, userId) {
    const session = await this.getSession(sessionId, userId);

    session.appliedCoupon = undefined;
    session.calculatePricing();
    await session.save();

    return await this.getSessionWithDetails(session._id);
  }

  /**
   * Initiate payment — create a payment intent or prepare for COD
   */
  async initiatePayment(sessionId, userId, paymentMethod) {
    const session = await this.getSession(sessionId, userId);

    if (!session.deliveryAddress || !session.deliveryAddress.fullName) {
      throw ApiError.badRequest("Please select a delivery address first");
    }

    session.selectedPaymentMethod = paymentMethod;
    session.currentStep = "payment";
    await session.save();

    // For COD, no payment intent needed
    if (paymentMethod === "cod") {
      return {
        session: await this.getSessionWithDetails(session._id),
        paymentIntent: null,
        requiresAction: false,
      };
    }

    // For online payments, a payment intent would be created via
    // the payment service (Stripe/Razorpay). Placeholder for now.
    return {
      session: await this.getSessionWithDetails(session._id),
      paymentIntent: {
        id: `pi_${Date.now()}`,
        amount: session.pricing.total,
        currency: "INR",
      },
      requiresAction: true,
    };
  }

  /**
   * Confirm payment and place order
   */
  async confirmAndPlaceOrder(sessionId, userId, paymentData = {}) {
    const session = await this.getSession(sessionId, userId);

    if (!session.deliveryAddress || !session.deliveryAddress.fullName) {
      throw ApiError.badRequest("Please select a delivery address first");
    }

    if (!session.selectedPaymentMethod) {
      throw ApiError.badRequest("Please select a payment method");
    }

    // Validate inventory one final time
    for (const item of session.items) {
      const product = await Product.findById(item.product);
      if (!product || product.status !== "active") {
        throw ApiError.badRequest(`${item.productName} is no longer available`);
      }

      if (product.hasVariants && item.variant?.variantId) {
        const variant = product.variants.id(item.variant.variantId);
        if (!variant || variant.stock < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for ${item.productName}`
          );
        }
      } else if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for ${item.productName}`
        );
      }
    }

    // Generate order number (pre-save hook can't run before required validation)
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${Date.now()}${(orderCount + 1)
      .toString()
      .padStart(4, "0")}`;

    // Create the order
    const order = new Order({
      orderNumber,
      customer: userId,
      items: session.items.map((item) => ({
        product: item.product,
        productName: item.productName,
        productImage: item.productImage,
        variant: item.variant?.variantId
          ? {
              name: item.variant.name,
              value: item.variant.value,
              sku: item.variant.sku,
            }
          : undefined,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice,
        seller: item.seller,
      })),
      subtotal: session.pricing.subtotal,
      tax: session.pricing.tax,
      shippingCharges: session.pricing.deliveryCharge,
      discount: session.pricing.discount,
      totalAmount: session.pricing.total,
      shippingAddress: {
        fullName: session.deliveryAddress.fullName,
        addressLine1: session.deliveryAddress.addressLine1,
        addressLine2: session.deliveryAddress.addressLine2,
        city: session.deliveryAddress.city,
        state: session.deliveryAddress.state,
        pincode: session.deliveryAddress.pincode,
        country: session.deliveryAddress.country,
        phone: session.deliveryAddress.phone,
      },
      payment: {
        method: session.selectedPaymentMethod,
        status:
          session.selectedPaymentMethod === "cod" ? "pending" : "paid",
        transactionId: paymentData.transactionId || null,
        paidAt:
          session.selectedPaymentMethod !== "cod" ? new Date() : null,
      },
      shipping: {
        method: "standard",
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      coupon: session.appliedCoupon
        ? {
            code: session.appliedCoupon.code,
            discountAmount: session.appliedCoupon.discountAmount,
            discountType: session.appliedCoupon.discountType,
          }
        : undefined,
      statusHistory: [
        {
          status: "pending",
          note: "Order placed via checkout",
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    // Reserve inventory for each item
    for (const item of session.items) {
      try {
        await inventoryService.reserveStock(
          item.product,
          item.variant?.sku,
          item.quantity,
          order._id
        );
      } catch (err) {
        // Log but don't fail the order
        console.error("Inventory reservation error:", err.message);
      }
    }

    // Mark coupon as used
    if (session.appliedCoupon?.couponId) {
      try {
        await couponService.markUsed(session.appliedCoupon.couponId, userId);
      } catch (err) {
        console.error("Coupon mark-used error:", err.message);
      }
    }

    // Clear the user's cart
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      await cart.clear();
    }

    // Update session to completed
    session.status = "completed";
    session.orderId = order._id;
    session.completedAt = new Date();
    await session.save();

    // Emit events
    eventEmitter.publish(ORDER_EVENTS.ORDER_CREATED, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerId: userId,
      totalAmount: session.pricing.total,
      paymentMethod: session.selectedPaymentMethod,
      timestamp: new Date().toISOString(),
    });

    return {
      order: await Order.findById(order._id).populate("items.product", "name images"),
      session,
    };
  }

  /**
   * Place COD order (shortcut for COD flow)
   */
  async placeCODOrder(sessionId, userId) {
    const session = await this.getSession(sessionId, userId);
    session.selectedPaymentMethod = "cod";
    await session.save();

    return await this.confirmAndPlaceOrder(sessionId, userId);
  }

  /**
   * Get confirmation data after order is placed
   */
  async getConfirmation(sessionId, userId) {
    const session = await CheckoutSession.findById(sessionId).populate({
      path: "orderId",
      populate: { path: "items.product", select: "name images" },
    });

    if (!session) {
      throw ApiError.notFound("Session not found");
    }

    if (session.user.toString() !== userId.toString()) {
      throw ApiError.forbidden("Access denied");
    }

    if (!session.orderId) {
      throw ApiError.badRequest("Order has not been placed yet");
    }

    return {
      order: session.orderId,
      deliveryAddress: session.deliveryAddress,
      pricing: session.pricing,
      paymentMethod: session.selectedPaymentMethod,
      placedAt: session.completedAt,
    };
  }

  // --- Helper methods ---

  async getSessionWithDetails(sessionId) {
    return await CheckoutSession.findById(sessionId).populate(
      "user",
      "firstName lastName email phone addresses"
    );
  }

  estimateDelivery(pincode) {
    // Simplified delivery estimation based on pincode ranges
    // Metro pincodes get faster delivery
    const metroPincodes = [
      "110", "400", "500", "600", "700", "560", "380", "411",
    ];
    const isMetro = metroPincodes.some((prefix) => pincode?.startsWith(prefix));

    const days = isMetro ? 3 : 6;
    return {
      date: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      method: "standard",
    };
  }
}

module.exports = new CheckoutService();
