const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

// Import configurations
const { connectDB } = require("./config/database");
const { connectRedis } = require("./config/redis");

const { initElasticsearch } = require("./config/elasticsearch");

// Import middleware
// Import middleware
const logger = require("./shared/middleware/logger.middleware");
const {
  errorHandler,
  notFound,
} = require("./shared/middleware/error.middleware");

// Import routes
const userRoutes = require("./modules/user/routes/user.routes");
const productRoutes = require("./modules/product/routes/product.routes");
const cartRoutes = require("./modules/cart/routes/cart.routes");
const paymentRoutes = require("./modules/payment/routes/payment.routes");
const uploadRoutes = require("./modules/upload/routes/upload.routes");

// Import event system
const eventSystem = require("./shared/events/eventEmitter");
const eventSystemManager = require("./shared/events/eventSystemManager");
const responseHandlerMiddleware = require("./shared/middleware/response.middleware");
const requestIdMiddleware = require("./shared/middleware/requestId.middleware");

const app = express();
app.use(responseHandlerMiddleware);
app.use(requestIdMiddleware);

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing & sanitization
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
app.use(logger);

// Initialize event system (legacy - for backward compatibility)
eventSystem.init();

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Get event system health
    const eventSystemHealth = await eventSystem.getHealth();
    const eventSystemManagerHealth = await eventSystemManager.getHealth();

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        eventSystem: eventSystemHealth,
        eventSystemManager: eventSystemManagerHealth,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message,
    });
  }
});

// API routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/uploads", uploadRoutes);

// Serve static files
app.use("/uploads", express.static("uploads"));

// 404 handler (must be before error handler)
app.use("*", notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Global error handler
//app.use(errorMiddleware.errorHandler);

// Initialize databases and services
const initializeServices = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();
    // await initElasticsearch();

    // Initialize new event-driven architecture
    await eventSystemManager.initialize();

    console.log("All services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};

module.exports = { app, initializeServices };
