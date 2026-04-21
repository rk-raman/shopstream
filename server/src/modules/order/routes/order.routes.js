const express = require("express");
const router = express.Router();

// Controllers
const orderController = require("../controllers/order.controller");
const trackingController = require("../controllers/tracking.controller");

// Middleware
const {
  authenticate,
  authorize,
  customerOnly,
} = require("../../../shared/middleware/auth.middleware");

// Validators
const {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCancelOrder,
  validateProcessPayment,
  validateInitiateRefund,
  validateRequestReturn,
  validateProcessReturn,
  validateUpdateTracking,
  validateAddTrackingEvent,
  validateBulkUpdateOrders,
  validateBulkUpdateTracking,
  validateOrderQuery,
  validateOrderStatsQuery,
  validateExportOrdersQuery,
  validateTrackingReportQuery,
  validateOrderIdParam,
  validateTrackingNumberParam,
  validateSellerIdParam,
} = require("../validators/order.validators");

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// Get tracking by tracking number (public access)
router.get(
  "/tracking/:trackingNumber",
  validateTrackingNumberParam,
  trackingController.getTrackingByNumber
);

// ============================================================================
// AUTHENTICATED ROUTES (Require authentication)
// ============================================================================

// Create new order
router.post(
  "/",
  authenticate,
  customerOnly,
  validateCreateOrder,
  orderController.createOrder
);

// Get user's orders (customers can see their own orders)
router.get(
  "/my-orders",
  authenticate,
  customerOnly,
  orderController.getMyOrders
);

// Get order by ID
router.get(
  "/:orderId",
  authenticate,
  validateOrderIdParam,
  orderController.getOrderById
);

// Cancel order (customer can cancel their own orders)
router.patch(
  "/:orderId/cancel",
  authenticate,
  customerOnly,
  validateCancelOrder,
  orderController.cancelOrder
);

// Request return (customer can request return for their orders)
router.post(
  "/:orderId/return",
  authenticate,
  customerOnly,
  validateRequestReturn,
  orderController.requestReturn
);

// Download invoice PDF (customer, seller, admin)
router.get(
  "/:orderId/invoice",
  authenticate,
  orderController.downloadInvoice
);

// Get order tracking
router.get(
  "/:orderId/tracking",
  authenticate,
  validateOrderIdParam,
  trackingController.getTrackingByOrderId
);

// Get order tracking history
router.get(
  "/:orderId/tracking/history",
  authenticate,
  validateOrderIdParam,
  trackingController.getTrackingHistory
);

// ============================================================================
// SELLER ROUTES (Sellers can manage their orders)
// ============================================================================

// Get orders by seller (sellers can see their own orders)
router.get(
  "/seller/my-orders",
  authenticate,
  authorize("seller", "admin"),
  validateOrderQuery,
  orderController.getOrdersBySeller
);

// Update order status (sellers can update status of their orders)
router.patch(
  "/:orderId/status",
  authenticate,
  authorize("seller", "admin"),
  validateUpdateOrderStatus,
  orderController.updateOrderStatus
);

// Update tracking information (sellers can update tracking)
router.patch(
  "/:orderId/tracking",
  authenticate,
  authorize("seller", "admin"),
  validateUpdateTracking,
  trackingController.updateTracking
);

// Add tracking event (sellers can add tracking events)
router.post(
  "/:orderId/tracking/events",
  authenticate,
  authorize("seller", "admin"),
  validateAddTrackingEvent,
  trackingController.addTrackingEvent
);

// Process return request (sellers can approve/reject returns)
router.patch(
  "/:orderId/return/process",
  authenticate,
  authorize("seller", "admin"),
  validateProcessReturn,
  orderController.processReturnRequest
);

// Get order statistics (sellers can see their stats)
router.get(
  "/analytics/stats",
  authenticate,
  authorize("seller", "admin"),
  validateOrderStatsQuery,
  orderController.getOrderStats
);

// Export orders (sellers can export their orders)
router.get(
  "/export/data",
  authenticate,
  authorize("seller", "admin"),
  validateExportOrdersQuery,
  orderController.exportOrders
);

// Seller customers (aggregated from orders)
router.get(
  "/seller/customers",
  authenticate,
  authorize("seller", "admin"),
  orderController.getSellerCustomers
);

router.get(
  "/seller/customers/:customerId",
  authenticate,
  authorize("seller", "admin"),
  orderController.getSellerCustomerDetails
);

// ============================================================================
// ADMIN ROUTES (Admin-only access)
// ============================================================================

// Get all orders (admin only)
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  validateOrderQuery,
  orderController.getAllOrders
);

// Get orders by specific seller (admin only)
router.get(
  "/admin/seller/:sellerId",
  authenticate,
  authorize("admin"),
  validateSellerIdParam,
  validateOrderQuery,
  orderController.getOrdersBySeller
);

// Process payment (admin only)
router.post(
  "/:orderId/payment/process",
  authenticate,
  authorize("admin"),
  validateProcessPayment,
  orderController.processPayment
);

// Initiate refund (admin only)
router.post(
  "/:orderId/refund",
  authenticate,
  authorize("admin"),
  validateInitiateRefund,
  orderController.initiateRefund
);

// Bulk update orders (admin only)
router.patch(
  "/admin/bulk-update",
  authenticate,
  authorize("admin"),
  validateBulkUpdateOrders,
  orderController.bulkUpdateOrders
);

// Bulk update tracking (admin only)
router.patch(
  "/admin/bulk-update-tracking",
  authenticate,
  authorize("admin"),
  validateBulkUpdateTracking,
  trackingController.bulkUpdateTracking
);

// Generate tracking report (admin only)
router.get(
  "/admin/tracking/report",
  authenticate,
  authorize("admin"),
  validateTrackingReportQuery,
  trackingController.generateTrackingReport
);

// ============================================================================
// ROUTE DOCUMENTATION
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - items
 *         - shippingAddress
 *         - paymentMethod
 *       properties:
 *         orderNumber:
 *           type: string
 *           description: Unique order identifier
 *         customer:
 *           type: string
 *           description: Customer ID
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, returned, refunded]
 *         totalAmount:
 *           type: number
 *           description: Total order amount
 *         shippingAddress:
 *           $ref: '#/components/schemas/Address'
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 *         shipping:
 *           $ref: '#/components/schemas/Shipping'
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *         productName:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *         seller:
 *           type: string
 *           description: Seller ID
 *
 *     Address:
 *       type: object
 *       required:
 *         - fullName
 *         - addressLine1
 *         - city
 *         - state
 *         - pincode
 *         - phone
 *       properties:
 *         fullName:
 *           type: string
 *         addressLine1:
 *           type: string
 *         addressLine2:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         pincode:
 *           type: string
 *         country:
 *           type: string
 *           default: India
 *         phone:
 *           type: string
 *
 *     Payment:
 *       type: object
 *       properties:
 *         method:
 *           type: string
 *           enum: [cod, card, upi, wallet, netbanking]
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded, partial_refund]
 *         transactionId:
 *           type: string
 *         paidAt:
 *           type: string
 *           format: date-time
 *
 *     Shipping:
 *       type: object
 *       properties:
 *         method:
 *           type: string
 *           enum: [standard, express, same_day]
 *         trackingNumber:
 *           type: string
 *         carrier:
 *           type: string
 *         estimatedDelivery:
 *           type: string
 *           format: date-time
 *         actualDelivery:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 $ref: '#/components/schemas/Address'
 *               billingAddress:
 *                 $ref: '#/components/schemas/Address'
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, card, upi, wallet, netbanking]
 *               coupon:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *               notes:
 *                 type: string
 *               specialInstructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

module.exports = router;
