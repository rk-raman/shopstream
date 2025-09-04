const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const RedisStore = require("rate-limit-redis");
const redis = require("redis");
const ApiError = require("../utils/apiError");

// Create Redis client if available
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      console.log("Redis Client Error", err);
    });

    redisClient.connect();
  }
} catch (error) {
  console.log("Redis connection failed, using memory store for rate limiting");
}

// Custom key generator for rate limiting
const generateKey = (req) => {
  // Use user ID if authenticated, otherwise use IP
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === "admin";
  },
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: (req) => `login:${req.body.email || req.ip}`,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit to 3 password reset requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: (req) => `password-reset:${req.body.email || req.ip}`,
  handler: rateLimitHandler,
});

// Email verification rate limiter
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit to 3 email verification requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit to 10 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Wishlist operations rate limiter
const wishlistLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit to 20 wishlist operations per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Search rate limiter
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit to 30 searches per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
});

// Speed limiter for high-frequency endpoints
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 100, // add 100ms delay after delayAfter is reached
  maxDelayMs: 20000, // max delay of 20 seconds
  keyGenerator: generateKey,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
});

// IP-based strict limiter for suspicious activity
const suspiciousActivityLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only 1 request per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: (req) => `suspicious:${req.ip}`,
  handler: rateLimitHandler,
});

// Admin operations rate limiter (more lenient)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for admin operations
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  skip: (req) => {
    // Only apply to non-admin users
    return req.user && req.user.role !== "admin";
  },
});

// Dynamic rate limiter based on user role
const createDynamicLimiter = (
  customerMax,
  sellerMax,
  adminMax,
  windowMs = 15 * 60 * 1000
) => {
  return rateLimit({
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
    store: redisClient
      ? new RedisStore({
          sendCommand: (...args) => redisClient.sendCommand(args),
        })
      : undefined,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
  });
};

// Middleware to reset rate limit on successful login
const resetRateLimitOnLogin = (req, res, next) => {
  if (redisClient && req.body.email) {
    const key = `login:${req.body.email}`;
    redisClient.del(key).catch((err) => {
      console.log("Error resetting rate limit:", err);
    });
  }
  next();
};

// Middleware to track failed attempts
const trackFailedAttempts = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // If response indicates failure, don't reset rate limit
    if (res.statusCode >= 400 && redisClient && req.body.email) {
      const key = `failed:${req.body.email}`;
      redisClient
        .incr(key)
        .then(() => {
          redisClient.expire(key, 3600); // Expire in 1 hour
        })
        .catch((err) => {
          console.log("Error tracking failed attempts:", err);
        });
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
