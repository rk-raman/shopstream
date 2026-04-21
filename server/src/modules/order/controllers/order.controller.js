const orderService = require("../services/order.service");
const trackingService = require("../services/tracking.service");
const invoiceService = require("../services/invoice.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Create new order
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orderData = req.body;

  const order = await orderService.createOrder(userId, orderData);
  return res.created({ order }, "Order created successfully");
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const order = await orderService.getOrderDetails(orderId, userId, userRole);
  return res.success({ order }, "Order retrieved successfully");
});

// Get user's orders
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    sortBy,
    sortOrder,
  };

  const result = await orderService.getOrdersByCustomer(
    userId,
    options.page,
    options.limit
  );
  return res.success(result, "Orders retrieved successfully");
});

// Update order status (Admin/Seller only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;
  const updatedBy = req.user._id;

  const order = await orderService.updateOrderStatus(
    orderId,
    status,
    note,
    updatedBy
  );
  return res.success({ order }, "Order status updated successfully");
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const order = await orderService.cancelOrder(orderId, userId, reason);
  return res.success({ order }, "Order cancelled successfully");
});

// Get all orders (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    paymentStatus,
    customerId,
    sellerId,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filters = {
    search,
    status,
    paymentStatus,
    customerId,
    sellerId,
    startDate,
    endDate,
  };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  };

  const result = await orderService.getAllOrders(filters, options);
  return res.success(result, "Orders retrieved successfully");
});

// Get orders by seller
const getOrdersBySeller = asyncHandler(async (req, res) => {
  const sellerId =
    req.user.role === "admin" ? req.params.sellerId : req.user._id;
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    sortBy,
    sortOrder,
  };

  const result = await orderService.getOrdersBySeller(sellerId, options);
  return res.success(result, "Seller orders retrieved successfully");
});

// Process payment
const processPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { paymentData } = req.body;

  const order = await orderService.processPayment(orderId, paymentData);
  return res.success({ order }, "Payment processed successfully");
});

// Initiate refund
const initiateRefund = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { amount, reason } = req.body;
  const initiatedBy = req.user._id;

  const order = await orderService.initiateRefund(
    orderId,
    amount,
    reason,
    initiatedBy
  );
  return res.success({ order }, "Refund initiated successfully");
});

// Request return
const requestReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason, items } = req.body;
  const userId = req.user._id;

  const order = await orderService.requestReturn(
    orderId,
    reason,
    items,
    userId
  );
  return res.success({ order }, "Return request submitted successfully");
});

// Approve/Reject return (Admin/Seller only)
const processReturnRequest = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { action, note } = req.body; // action: 'approve' or 'reject'
  const processedBy = req.user._id;

  const order = await orderService.processReturnRequest(
    orderId,
    action,
    note,
    processedBy
  );
  return res.success({ order }, `Return request ${action}d successfully`);
});

// Get order statistics
const getOrderStats = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    sellerId,
    groupBy = "day", // day, week, month
  } = req.query;

  // If not admin, only show stats for their own orders
  const actualSellerId = req.user.role === "admin" ? sellerId : req.user._id;

  const stats = await orderService.getOrderStatistics({
    startDate,
    endDate,
    sellerId: actualSellerId,
    groupBy,
  });

  return res.success({ stats }, "Order statistics retrieved successfully");
});

// Get order tracking information
const getOrderTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  const tracking = await trackingService.getOrderTracking(
    orderId,
    userId,
    userRole
  );
  return res.success({ tracking }, "Order tracking retrieved successfully");
});

// Update tracking information (Admin/Seller only)
const updateOrderTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const trackingData = req.body;
  const updatedBy = req.user._id;

  const tracking = await trackingService.updateOrderTracking(
    orderId,
    trackingData,
    updatedBy
  );
  return res.success({ tracking }, "Order tracking updated successfully");
});

// Bulk update orders (Admin only)
const bulkUpdateOrders = asyncHandler(async (req, res) => {
  const { orderIds, updateData } = req.body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    throw new ApiError(400, "Order IDs array is required");
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Update data is required");
  }

  const result = await orderService.bulkUpdateOrders(
    orderIds,
    updateData,
    req.user._id
  );
  return res.success(
    { modifiedCount: result.modifiedCount },
    `${result.modifiedCount} orders updated successfully`
  );
});

// Export order data (Admin/Seller)
const exportOrders = asyncHandler(async (req, res) => {
  const {
    format = "csv", // csv, excel, pdf
    startDate,
    endDate,
    status,
    sellerId,
  } = req.query;

  const filters = {
    startDate,
    endDate,
    status,
    sellerId: req.user.role === "admin" ? sellerId : req.user._id,
  };

  const exportData = await orderService.exportOrders(filters, format);

  res.setHeader("Content-Type", exportData.contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${exportData.filename}"`
  );

  return res.send(exportData.data);
});

// Get seller's customers (aggregated from orders)
const getSellerCustomers = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const {
    page = 1,
    limit = 20,
    search,
    sortBy = "lastOrderDate",
    sortOrder = "desc",
  } = req.query;

  const result = await orderService.getSellerCustomers(sellerId, {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    sortBy,
    sortOrder,
  });

  return res.success(result, "Customers retrieved successfully");
});

// Get single customer details for seller
const getSellerCustomerDetails = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const { customerId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await orderService.getSellerCustomerDetails(sellerId, customerId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return res.success(result, "Customer details retrieved successfully");
});

// Download invoice PDF
const downloadInvoice = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id.toString();
  const role = req.user.role;

  const pdfStream = await invoiceService.generateInvoice(orderId, userId, role);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="invoice-${orderId}.pdf"`
  );

  pdfStream.pipe(res);
});

module.exports = {
  // Basic order operations
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrdersBySeller,

  // Payment operations
  processPayment,
  initiateRefund,

  // Return operations
  requestReturn,
  processReturnRequest,

  // Analytics and reporting
  getOrderStats,
  exportOrders,

  // Tracking operations
  getOrderTracking,
  updateOrderTracking,

  // Bulk operations
  bulkUpdateOrders,

  // Seller customers
  getSellerCustomers,
  getSellerCustomerDetails,

  // Invoice
  downloadInvoice,
};
