const Order = require("../models/Order.model");
const Product = require("../../product/models/Product.model");
const cartService = require("../../cart/services/cart.service");
const inventoryService = require("../../inventory/services/inventory.service");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { ORDER_EVENTS } = require("../../../shared/events/eventTypes");

class OrderService {
  async createOrder(userId, orderData) {
    const { items, shippingAddress, billingAddress, paymentMethod, coupon } =
      orderData;

    try {
      // Validate and calculate order totals
      const validatedItems = await this.validateOrderItems(items);
      const pricing = await this.calculateOrderPricing(validatedItems, coupon);

      // Check inventory availability
      await this.checkInventoryAvailability(validatedItems);

      // Create order
      const order = new Order({
        customer: userId,
        items: validatedItems,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        shippingCharges: pricing.shippingCharges,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        payment: {
          method: paymentMethod,
          status: paymentMethod === "cod" ? "pending" : "pending",
        },
        coupon: pricing.couponApplied,
      });

      await order.save();

      // Reserve inventory
      await this.reserveInventory(validatedItems, order._id);

      // Clear user's cart
      await cartService.clearCart(userId);

      // Publish order created event
      eventEmitter.publish(ORDER_EVENTS.ORDER_CREATED, {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerId: userId,
        items: validatedItems,
        totalAmount: pricing.totalAmount,
        paymentMethod,
        timestamp: new Date().toISOString(),
      });

      return await Order.findById(order._id).populate("items.product");
    } catch (error) {
      throw error;
    }
  }

  async validateOrderItems(items) {
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== "active") {
        throw new ApiError(400, `Product ${item.productId} is not available`);
      }

      // Handle variants
      let price = product.basePrice;
      let discountPrice = product.discountPrice;
      let variant = null;

      if (item.variantId && product.hasVariants) {
        variant = product.variants.id(item.variantId);
        if (!variant || !variant.isActive) {
          throw new ApiError(400, `Product variant not available`);
        }
        price = variant.price;
        discountPrice = variant.discountPrice;
      }

      validatedItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images.find((img) => img.isMain)?.url,
        variant: variant
          ? {
              name: variant.name,
              value: variant.value,
              sku: variant.sku,
            }
          : null,
        quantity: item.quantity,
        price: price,
        discountPrice: discountPrice,
        seller: product.seller,
      });
    }

    return validatedItems;
  }

  async calculateOrderPricing(items, coupon) {
    let subtotal = 0;

    // Calculate subtotal
    items.forEach((item) => {
      const effectivePrice = item.discountPrice || item.price;
      subtotal += effectivePrice * item.quantity;
    });

    // Calculate tax (18% GST)
    const tax = Math.round(subtotal * 0.18);

    // Calculate shipping charges
    const shippingCharges = subtotal > 500 ? 0 : 40; // Free shipping above ₹500

    // Apply coupon discount
    let discount = 0;
    let couponApplied = null;

    if (coupon) {
      // Validate and apply coupon (implement coupon service)
      // For now, simple fixed discount
      discount = 50;
      couponApplied = {
        code: coupon.code,
        discountAmount: discount,
        discountType: "fixed",
      };
    }

    const totalAmount = subtotal + tax + shippingCharges - discount;

    return {
      subtotal,
      tax,
      shippingCharges,
      discount,
      totalAmount,
      couponApplied,
    };
  }

  async checkInventoryAvailability(items) {
    for (const item of items) {
      const isAvailable = await inventoryService.checkAvailability(
        item.product,
        item.variant?.sku,
        item.quantity
      );

      if (!isAvailable) {
        throw new ApiError(400, `Insufficient stock for ${item.productName}`);
      }
    }
  }

  async reserveInventory(items, orderId) {
    for (const item of items) {
      await inventoryService.reserveStock(
        item.product,
        item.variant?.sku,
        item.quantity,
        orderId
      );
    }
  }

  async updateOrderStatus(orderId, newStatus, note, updatedBy) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const oldStatus = order.status;
    await order.updateStatus(newStatus, note, updatedBy);

    // Publish status update event
    eventEmitter.publish(ORDER_EVENTS.ORDER_UPDATED, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      oldStatus,
      newStatus,
      customerId: order.customer,
      timestamp: new Date().toISOString(),
    });

    // Handle specific status changes
    if (newStatus === "delivered") {
      eventEmitter.publish(ORDER_EVENTS.ORDER_DELIVERED, {
        orderId: order._id,
        customerId: order.customer,
        items: order.items,
        timestamp: new Date().toISOString(),
      });
    } else if (newStatus === "cancelled") {
      // Release reserved inventory
      await this.releaseInventory(order.items, orderId);

      eventEmitter.publish(ORDER_EVENTS.ORDER_CANCELLED, {
        orderId: order._id,
        customerId: order.customer,
        timestamp: new Date().toISOString(),
      });
    }

    return order;
  }

  async releaseInventory(items, orderId) {
    for (const item of items) {
      await inventoryService.releaseStock(
        item.product,
        item.variant?.sku,
        item.quantity,
        orderId
      );
    }
  }

  async getOrdersByCustomer(customerId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customer: customerId })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ customer: customerId });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetails(orderId, userId, role) {
    let query = { _id: orderId };

    // Non-admin users can only see their own orders
    if (role !== "admin") {
      query.customer = userId;
    }

    const order = await Order.findOne(query)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images")
      .populate("items.seller", "firstName lastName");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findOne({ _id: orderId, customer: userId });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (!order.canBeCancelled()) {
      throw new ApiError(400, "Order cannot be cancelled");
    }

    order.cancellationReason = reason;
    await order.updateStatus(
      "cancelled",
      `Cancelled by customer: ${reason}`,
      userId
    );

    return order;
  }
}

module.exports = new OrderService();
