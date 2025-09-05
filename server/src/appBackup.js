const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

// Import middleware
const logger = require("./shared/middleware/logger.middleware");
const {
  errorHandler,
  notFound,
} = require("./shared/middleware/error.middleware");

// Import routes
const routes = require("./routes");
const {
  apiLimiter,
  speedLimiter,
} = require("./shared/middleware/rateLimiter.middleware");

const app = express();
// Apply to all requests
app.use(apiLimiter);
app.use(speedLimiter);

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Custom logging
app.use(logger);

// API routes
app.use("/api", routes);

// Serve static files (for future file uploads)
app.use("/uploads", express.static("uploads"));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce Backend Server",
    data: {
      status: "running",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      api: "/api",
    },
  });
});

// 404 handler (must be before error handler)
app.use("*", notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
