const User = require("../../modules/user/models/User.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken, extractTokenFromHeader } = require("../utils/jwt");

// Middleware to authenticate JWT token
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from header
  if (req.headers.authorization) {
    try {
      token = extractTokenFromHeader(req.headers.authorization);
    } catch (err) {
      throw new ApiError(401, err.message);
    }
  }

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  // console.log("🚀 [AUTH] Authenticate middleware:", {
  //   token,
  // });
  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    // console.log("🚀 [AUTH] Authenticate middleware:", {
    //   decoded,
    // });

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) throw new ApiError(401, "User no longer exists");
    if (!user.isActive) throw new ApiError(401, "Account is deactivated");
    if (user.isLocked) throw new ApiError(401, "Account is temporarily locked");

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    throw error; // errors already normalized in jwt.utils
  }
});

// Middleware to check if user is authenticated (optional)
const optionalAuth = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      const decoded = verifyAccessToken(token);

      const user = await User.findById(decoded.userId).select("-password");
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    } catch (err) {
      console.log("Optional auth failed:", err.message);
    }
  }

  next();
});

// Middleware to authorize user roles
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) throw new ApiError(401, "Authentication required");
    // console.log("🚀 [AUTH] Authorize middleware:", req.user.role);
    // console.log("🚀 [AUTH] Authorize middleware - allowed roles:", roles);

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }
    next();
  };

// Middleware to check if user owns the resource
const checkOwnership = (resourceIdParam = "id") =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw new ApiError(401, "Authentication required");

    const resourceId = req.params[resourceIdParam];
    const userId = req.user._id.toString();

    if (req.user.role === "admin") return next();

    if (resourceId !== userId) {
      throw new ApiError(403, "Access denied");
    }

    next();
  });

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

  if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
    const lockTimeRemaining = Math.ceil(
      (user.accountLockedUntil - Date.now()) / (1000 * 60)
    );
    throw new ApiError(
      423,
      `Account is locked for ${lockTimeRemaining} more minutes`
    );
  }

  if (user.accountLockedUntil && user.accountLockedUntil <= Date.now()) {
    await User.findByIdAndUpdate(user._id, {
      $unset: { accountLockedUntil: 1 },
      loginAttempts: 0,
    });
  }

  next();
});

// Predefined middlewares
const adminOnly = authorize("admin");
const sellerOrAdmin = authorize("seller", "admin");
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
