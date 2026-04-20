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

    // Non-admin users can only see orders they're involved in
    if (role === "seller") {
      // Sellers can see orders that contain their items
      query["items.seller"] = userId;
    } else if (role !== "admin") {
      // Customers can only see their own orders
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

  async getAllOrders(filters, options) {
    const {
      search,
      status,
      paymentStatus,
      customerId,
      sellerId,
      startDate,
      endDate,
    } = filters;

    const { page, limit, sortBy, sortOrder } = options;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.firstName": { $regex: search, $options: "i" } },
        { "customer.lastName": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (paymentStatus) query["payment.status"] = paymentStatus;
    if (customerId) query.customer = customerId;
    if (sellerId) query["items.seller"] = sellerId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images")
      .populate("items.seller", "firstName lastName")
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

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

  async getOrdersBySeller(sellerId, options) {
    const { page, limit, status, sortBy, sortOrder } = options;

    let query = { "items.seller": sellerId };
    if (status) query.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images")
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

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

  async processPayment(orderId, paymentData) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Update payment information
    order.payment.status = "paid";
    order.payment.transactionId = paymentData.transactionId;
    order.payment.paidAt = new Date();

    // Update order status if payment successful
    if (order.status === "pending") {
      await order.updateStatus("confirmed", "Payment confirmed", null);
    }

    await order.save();

    // Publish payment event
    eventEmitter.publish(ORDER_EVENTS.PAYMENT_SUCCESSFUL, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerId: order.customer,
      amount: order.totalAmount,
      transactionId: paymentData.transactionId,
      timestamp: new Date().toISOString(),
    });

    return order;
  }

  async initiateRefund(orderId, amount, reason, initiatedBy) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.payment.status !== "paid") {
      throw new ApiError(400, "Cannot refund unpaid order");
    }

    // Update payment information
    order.payment.refundAmount = amount;
    order.payment.refundReason = reason;
    order.payment.status =
      amount >= order.totalAmount ? "refunded" : "partial_refund";

    await order.updateStatus(
      "refunded",
      `Refund initiated: ${reason}`,
      initiatedBy
    );

    // Publish refund event
    eventEmitter.publish(ORDER_EVENTS.PAYMENT_REFUNDED, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerId: order.customer,
      refundAmount: amount,
      reason,
      timestamp: new Date().toISOString(),
    });

    return order;
  }

  async requestReturn(orderId, reason, items, userId) {
    const order = await Order.findOne({ _id: orderId, customer: userId });
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (!order.canBeReturned()) {
      throw new ApiError(400, "Order cannot be returned");
    }

    order.returnReason = reason;
    order.returnRequestedAt = new Date();

    await order.updateStatus("returned", `Return requested: ${reason}`, userId);

    return order;
  }

  async processReturnRequest(orderId, action, note, processedBy) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (action === "approve") {
      order.returnApprovedAt = new Date();
      await order.updateStatus(
        "returned",
        `Return approved: ${note}`,
        processedBy
      );
    } else if (action === "reject") {
      await order.updateStatus(
        "delivered",
        `Return rejected: ${note}`,
        processedBy
      );
    }

    return order;
  }

  async getOrderStatistics(filters) {
    const { startDate, endDate, sellerId, groupBy } = filters;

    let matchStage = {};

    if (sellerId)
      matchStage["items.seller"] = new mongoose.Types.ObjectId(sellerId);

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Group by date format based on groupBy parameter
    let dateFormat;
    switch (groupBy) {
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "week":
        dateFormat = "%Y-%U";
        break;
      case "month":
        dateFormat = "%Y-%m";
        break;
      default:
        dateFormat = "%Y-%m-%d";
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            status: "$status",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ];

    const stats = await Order.aggregate(pipeline);

    // Get overall statistics
    const overallStats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          statusBreakdown: {
            $push: {
              status: "$status",
              amount: "$totalAmount",
            },
          },
        },
      },
    ]);

    return {
      timeSeriesData: stats,
      overallStats: overallStats[0] || {},
    };
  }

  async bulkUpdateOrders(orderIds, updateData, updatedBy) {
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        ...updateData,
        $push: {
          statusHistory: {
            status: updateData.status,
            note: "Bulk update",
            updatedBy,
            timestamp: new Date(),
          },
        },
      }
    );

    return result;
  }

  async exportOrders(filters, format) {
    const { startDate, endDate, status, sellerId } = filters;

    let query = {};
    if (status) query.status = status;
    if (sellerId) query["items.seller"] = sellerId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    // Convert to export format
    const exportData = orders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.payment.method,
      paymentStatus: order.payment.status,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    }));

    if (format === "csv") {
      const csv = this.convertToCSV(exportData);
      return {
        data: csv,
        contentType: "text/csv",
        filename: `orders_${Date.now()}.csv`,
      };
    }

    // Default to JSON
    return {
      data: JSON.stringify(exportData, null, 2),
      contentType: "application/json",
      filename: `orders_${Date.now()}.json`,
    };
  }

  convertToCSV(data) {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
      ),
    ].join("\n");

    return csvContent;
  }
}

module.exports = new OrderService();
