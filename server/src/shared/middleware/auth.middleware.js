const jwt = require("jsonwebtoken");
const User = require("../../modules/user/models/User.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

// Middleware to authenticate JWT token
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    if (!user.isActive) {
      throw new ApiError(401, "Account is deactivated");
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new ApiError(401, "Account is temporarily locked");
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    } else {
      throw error;
    }
  }
});

// Middleware to check if user is authenticated (optional)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    } catch (error) {
      // Ignore errors for optional auth
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
});

// Middleware to authorize user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }

    next();
  };
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceIdParam = "id") => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user._id.toString();

    // Admin can access any resource
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user owns the resource
    if (resourceId !== userId) {
      throw new ApiError(403, "Access denied");
    }

    next();
  });
};

// Middleware to verify email
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email address");
  }
  next();
};

// Middleware to verify phone
const requirePhoneVerification = (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    throw new ApiError(403, "Please verify your phone number");
  }
  next();
};

// Middleware to update last active time
const updateLastActive = asyncHandler(async (req, res, next) => {
  if (req.user) {
    // Update last active time without waiting
    User.findByIdAndUpdate(req.user._id, {
      lastActiveAt: new Date(),
      "deviceInfo.lastIP": req.ip,
      "deviceInfo.lastUserAgent": req.get("User-Agent"),
    }).exec();
  }
  next();
});

// Middleware to check account status
const checkAccountStatus = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Check if account is locked
  if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
    const lockTimeRemaining = Math.ceil(
      (user.accountLockedUntil - Date.now()) / (1000 * 60)
    );
    throw new ApiError(
      423,
      `Account is locked for ${lockTimeRemaining} more minutes`
    );
  }

  // If lock time has expired, reset it
  if (user.accountLockedUntil && user.accountLockedUntil <= Date.now()) {
    await User.findByIdAndUpdate(user._id, {
      $unset: { accountLockedUntil: 1 },
      loginAttempts: 0,
    });
  }

  next();
});

// Middleware for admin only routes
const adminOnly = authorize("admin");

// Middleware for seller and admin routes
const sellerOrAdmin = authorize("seller", "admin");

// Middleware for customer routes (authenticated users)
const customerOnly = authorize("customer", "seller", "admin");

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
  requireEmailVerification,
  requirePhoneVerification,
  updateLastActive,
  checkAccountStatus,
  adminOnly,
  sellerOrAdmin,
  customerOnly,
};
