const Order = require("../models/Order.model");
const ApiError = require("../../../shared/utils/apiError");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { ORDER_EVENTS } = require("../../../shared/events/eventTypes");

class TrackingService {
  async getOrderTracking(orderId, userId, userRole) {
    let query = { _id: orderId };

    // Non-admin users can only see their own orders
    if (userRole !== "admin") {
      query.customer = userId;
    }

    const order = await Order.findOne(query)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images")
      .select(
        "orderNumber status statusHistory shipping customer items createdAt"
      );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.shipping.trackingNumber,
      carrier: order.shipping.carrier,
      estimatedDelivery: order.shipping.estimatedDelivery,
      actualDelivery: order.shipping.actualDelivery,
      statusHistory: order.statusHistory,
      customer: order.customer,
      items: order.items,
      createdAt: order.createdAt,
    };
  }

  async getTrackingByNumber(trackingNumber) {
    const order = await Order.findOne({
      "shipping.trackingNumber": trackingNumber,
    })
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images")
      .select(
        "orderNumber status statusHistory shipping customer items createdAt"
      );

    if (!order) {
      throw new ApiError(404, "Tracking number not found");
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.shipping.trackingNumber,
      carrier: order.shipping.carrier,
      estimatedDelivery: order.shipping.estimatedDelivery,
      actualDelivery: order.shipping.actualDelivery,
      statusHistory: order.statusHistory,
      customer: order.customer,
      items: order.items,
      createdAt: order.createdAt,
    };
  }

  async updateOrderTracking(orderId, trackingData, updatedBy) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Update shipping information
    if (trackingData.trackingNumber) {
      order.shipping.trackingNumber = trackingData.trackingNumber;
    }
    if (trackingData.carrier) {
      order.shipping.carrier = trackingData.carrier;
    }
    if (trackingData.estimatedDelivery) {
      order.shipping.estimatedDelivery = new Date(
        trackingData.estimatedDelivery
      );
    }
    if (trackingData.method) {
      order.shipping.method = trackingData.method;
    }

    // Update order status if provided
    if (trackingData.status && trackingData.status !== order.status) {
      await order.updateStatus(
        trackingData.status,
        trackingData.note || "Tracking updated",
        updatedBy
      );
    } else {
      await order.save();
    }

    // Publish tracking update event
    eventEmitter.publish(ORDER_EVENTS.ORDER_TRACKING_UPDATED, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      trackingNumber: order.shipping.trackingNumber,
      carrier: order.shipping.carrier,
      status: order.status,
      customerId: order.customer,
      timestamp: new Date().toISOString(),
    });

    return this.getOrderTracking(orderId, null, "admin");
  }

  async addTrackingEvent(orderId, eventData) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Add to status history
    order.statusHistory.push({
      status: eventData.status,
      note: `${eventData.location}: ${eventData.description}`,
      timestamp: eventData.timestamp,
      updatedBy: eventData.addedBy,
    });

    // Update current status if it's a status change
    if (eventData.status !== order.status) {
      order.status = eventData.status;
    }

    await order.save();

    // Publish tracking event
    eventEmitter.publish(ORDER_EVENTS.ORDER_TRACKING_EVENT, {
      orderId: order._id,
      orderNumber: order.orderNumber,
      event: eventData,
      customerId: order.customer,
      timestamp: new Date().toISOString(),
    });

    return this.getOrderTracking(orderId, null, "admin");
  }

  async getTrackingHistory(orderId, userId, userRole) {
    let query = { _id: orderId };

    // Non-admin users can only see their own orders
    if (userRole !== "admin") {
      query.customer = userId;
    }

    const order = await Order.findOne(query)
      .select("orderNumber statusHistory shipping")
      .populate("statusHistory.updatedBy", "firstName lastName");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return {
      orderNumber: order.orderNumber,
      trackingNumber: order.shipping.trackingNumber,
      history: order.statusHistory.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      ),
    };
  }

  async bulkUpdateTracking(updates, updatedBy) {
    const results = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };

    for (const update of updates) {
      try {
        await this.updateOrderTracking(
          update.orderId,
          update.trackingData,
          updatedBy
        );
        results.successCount++;
      } catch (error) {
        results.failureCount++;
        results.errors.push({
          orderId: update.orderId,
          error: error.message,
        });
      }
    }

    return results;
  }

  async generateTrackingReport(filters, format) {
    const { startDate, endDate, status, carrier, sellerId } = filters;

    let query = {};

    if (status) query.status = status;
    if (carrier) query["shipping.carrier"] = carrier;
    if (sellerId) query["items.seller"] = sellerId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name")
      .select(
        "orderNumber status shipping customer items createdAt statusHistory"
      )
      .sort({ createdAt: -1 });

    const reportData = orders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      status: order.status,
      trackingNumber: order.shipping.trackingNumber || "N/A",
      carrier: order.shipping.carrier || "N/A",
      estimatedDelivery: order.shipping.estimatedDelivery || "N/A",
      actualDelivery: order.shipping.actualDelivery || "N/A",
      createdAt: order.createdAt,
      lastUpdate:
        order.statusHistory.length > 0
          ? order.statusHistory[order.statusHistory.length - 1].timestamp
          : order.createdAt,
    }));

    if (format === "csv") {
      const csv = this.convertToCSV(reportData);
      return {
        data: csv,
        contentType: "text/csv",
        filename: `tracking_report_${Date.now()}.csv`,
      };
    } else if (format === "excel") {
      // For Excel format, you would typically use a library like xlsx
      // For now, return CSV with Excel content type
      const csv = this.convertToCSV(reportData);
      return {
        data: csv,
        contentType: "application/vnd.ms-excel",
        filename: `tracking_report_${Date.now()}.xls`,
      };
    }

    // Default to JSON
    return reportData;
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

  // Utility method to get delivery status summary
  async getDeliveryStatusSummary(sellerId = null) {
    let matchStage = {};
    if (sellerId) matchStage["items.seller"] = sellerId;

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgDeliveryTime: {
            $avg: {
              $cond: [
                { $and: ["$shipping.actualDelivery", "$createdAt"] },
                {
                  $divide: [
                    { $subtract: ["$shipping.actualDelivery", "$createdAt"] },
                    1000 * 60 * 60 * 24, // Convert to days
                  ],
                },
                null,
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ];

    const summary = await Order.aggregate(pipeline);
    return summary;
  }

  // Method to track delivery performance
  async getDeliveryPerformance(sellerId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let matchStage = {
      createdAt: { $gte: startDate },
    };

    if (sellerId) matchStage["items.seller"] = sellerId;

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          avgDeliveryTime: {
            $avg: {
              $cond: [
                { $and: ["$shipping.actualDelivery", "$createdAt"] },
                {
                  $divide: [
                    { $subtract: ["$shipping.actualDelivery", "$createdAt"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
                null,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const performance = await Order.aggregate(pipeline);
    return performance;
  }
}

module.exports = new TrackingService();
