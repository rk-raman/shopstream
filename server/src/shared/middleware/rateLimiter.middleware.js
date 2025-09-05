const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const RedisStore = require("rate-limit-redis");
const ApiError = require("../utils/apiError");
const { getRedisClient } = require("../../config/redis"); // centralized redis client

// Helper to get Redis store or fallback
const getRedisStore = () => {
  try {
    const client = getRedisClient();
    return new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    });
  } catch (err) {
    console.log("⚠️ Redis not available for rate limiter, using memory store");
    return undefined; // fallback to in-memory store
  }
};

// Custom key generator for rate limiting
const generateKey = (req) => {
  if (req.user) {
    return `${req.user._id}:${req.route?.path || req.path}`;
  }
  return `${req.ip}:${req.route?.path || req.path}`;
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req, res, next) => {
  const error = new ApiError(429, "Too many requests, please try again later");
  next(error);
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  skip: (req) => req.user?.role === "admin",
});

// Auth endpoints limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
});

// Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: (req) => `login:${req.body.email || req.ip}`,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: (req) => `password-reset:${req.body.email || req.ip}`,
  handler: rateLimitHandler,
});

// Email verification limiter
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Wishlist limiter
const wishlistLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Search limiter
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Speed limiter
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 100,
  maxDelayMs: 20000,
  keyGenerator: generateKey,
  store: getRedisStore(),
});

// Suspicious activity limiter
const suspiciousActivityLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: (req) => `suspicious:${req.ip}`,
  handler: rateLimitHandler,
});

// Admin limiter
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore(),
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  skip: (req) => (req.user?.role === "admin" ? false : true),
});

// Dynamic limiter
const createDynamicLimiter = (
  customerMax,
  sellerMax,
  adminMax,
  windowMs = 15 * 60 * 1000
) =>
  rateLimit({
    windowMs,
    max: (req) => {
      if (!req.user) return customerMax;
      switch (req.user.role) {
        case "admin":
          return adminMax;
        case "seller":
          return sellerMax;
        case "customer":
        default:
          return customerMax;
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: getRedisStore(),
    keyGenerator: generateKey,
    handler: rateLimitHandler,
  });

// Reset rate limit on successful login
const resetRateLimitOnLogin = async (req, res, next) => {
  try {
    const client = getRedisClient();
    if (req.body.email) await client.del(`login:${req.body.email}`);
  } catch (err) {
    console.log("Error resetting rate limit:", err);
  }
  next();
};

// Track failed attempts
const trackFailedAttempts = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (res.statusCode >= 400 && req.body.email) {
      try {
        const client = getRedisClient();
        client.incr(`failed:${req.body.email}`);
        client.expire(`failed:${req.body.email}`, 3600);
      } catch (err) {
        console.log("Error tracking failed attempts:", err);
      }
    }
    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  uploadLimiter,
  wishlistLimiter,
  searchLimiter,
  speedLimiter,
  suspiciousActivityLimiter,
  adminLimiter,
  createDynamicLimiter,
  resetRateLimitOnLogin,
  trackFailedAttempts,
};
