const trackingService = require("../services/tracking.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Get tracking information by order ID
const getTrackingByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const tracking = await trackingService.getOrderTracking(
    orderId,
    userId,
    userRole
  );
  return res.success(
    { tracking },
    "Tracking information retrieved successfully"
  );
});

// Get tracking information by tracking number
const getTrackingByNumber = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;

  const tracking = await trackingService.getTrackingByNumber(trackingNumber);
  return res.success(
    { tracking },
    "Tracking information retrieved successfully"
  );
});

// Update tracking information (Admin/Seller only)
const updateTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const trackingData = req.body;
  const updatedBy = req.user._id;

  const tracking = await trackingService.updateOrderTracking(
    orderId,
    trackingData,
    updatedBy
  );
  return res.success({ tracking }, "Tracking information updated successfully");
});

// Add tracking event (Admin/Seller only)
const addTrackingEvent = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, location, description, timestamp } = req.body;
  const addedBy = req.user._id;

  const eventData = {
    status,
    location,
    description,
    timestamp: timestamp || new Date(),
    addedBy,
  };

  const tracking = await trackingService.addTrackingEvent(orderId, eventData);
  return res.success({ tracking }, "Tracking event added successfully");
});

// Get tracking history
const getTrackingHistory = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const history = await trackingService.getTrackingHistory(
    orderId,
    userId,
    userRole
  );
  return res.success({ history }, "Tracking history retrieved successfully");
});

// Bulk update tracking (Admin only)
const bulkUpdateTracking = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of {orderId, trackingData}
  const updatedBy = req.user._id;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, "Updates array is required");
  }

  const results = await trackingService.bulkUpdateTracking(updates, updatedBy);
  return res.success(
    { results },
    `${results.successCount} tracking records updated successfully`
  );
});

// Generate tracking report (Admin/Seller)
const generateTrackingReport = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    status,
    carrier,
    sellerId,
    format = "json", // json, csv, excel
  } = req.query;

  const filters = {
    startDate,
    endDate,
    status,
    carrier,
    sellerId: req.user.role === "admin" ? sellerId : req.user._id,
  };

  const report = await trackingService.generateTrackingReport(filters, format);

  if (format === "json") {
    return res.success({ report }, "Tracking report generated successfully");
  } else {
    res.setHeader("Content-Type", report.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.filename}"`
    );
    return res.send(report.data);
  }
});

module.exports = {
  getTrackingByOrderId,
  getTrackingByNumber,
  updateTracking,
  addTrackingEvent,
  getTrackingHistory,
  bulkUpdateTracking,
  generateTrackingReport,
};
