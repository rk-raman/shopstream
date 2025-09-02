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
const errorMiddleware = require("./shared/middleware/error.middleware");
const loggerMiddleware = require("./shared/middleware/logger.middleware");

// Import routes
const routes = require("./routes");

// Import event system
const eventSystem = require("./shared/events/eventEmitter");

const app = express();

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
app.use(loggerMiddleware);

// Initialize event system
eventSystem.init();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api", routes);

// Serve static files
app.use("/uploads", express.static("uploads"));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(errorMiddleware.errorHandler);

// Initialize databases and services
const initializeServices = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();
    await initElasticsearch();

    console.log("All services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};

module.exports = { app, initializeServices };
