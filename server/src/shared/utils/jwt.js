const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ApiError = require("./apiError");

/**
 * Generate JWT access token
 * @param {object} payload - Token payload
 * @param {string} secret - JWT secret (optional, uses env variable)
 * @param {object} options - JWT options
 * @returns {string} - Generated JWT token
 */
const generateAccessToken = (
  payload,
  secret = process.env.JWT_ACCESS_SECRET,
  options = {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  }
) => {
  try {
    if (!secret) {
      throw new Error("JWT secret is required");
    }

    // Add issued at time and token ID
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString("hex"),
    };

    return jwt.sign(tokenPayload, secret, options);
  } catch (error) {
    throw new ApiError(500, `Error generating access token: ${error.message}`);
  }
};

/**
 * Generate JWT refresh token
 * @param {object} payload - Token payload
 * @param {string} secret - JWT secret (optional, uses env variable)
 * @param {object} options - JWT options
 * @returns {string} - Generated JWT refresh token
 */
const generateRefreshToken = (
  payload,
  secret = process.env.JWT_REFRESH_SECRET,
  options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  }
) => {
  try {
    if (!secret) {
      throw new Error("JWT refresh secret is required");
    }

    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString("hex"),
      type: "refresh",
    };

    return jwt.sign(tokenPayload, secret, options);
  } catch (error) {
    throw new ApiError(500, `Error generating refresh token: ${error.message}`);
  }
};

/**
 * Generate both access and refresh tokens
 * @param {object} payload - Token payload
 * @returns {object} - Object containing both tokens
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret
 * @param {object} options - Verification options
 * @returns {object} - Decoded token payload
 */
const verifyToken = (
  token,
  secret,
  options = {
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  }
) => {
  try {
    if (!token) {
      throw new ApiError(401, "Token is required");
    }

    if (!secret) {
      throw new ApiError(500, "JWT secret is required");
    }

    return jwt.verify(token, secret, options);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    } else if (error.name === "NotBeforeError") {
      throw new ApiError(401, "Token not active");
    } else {
      throw new ApiError(401, `Token verification failed: ${error.message}`);
    }
  }
};

/**
 * Verify access token
 * @param {string} token - Access token
 * @returns {object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
  return verifyToken(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return verifyToken(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {object} - Decoded token (header, payload, signature)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new ApiError(400, `Error decoding token: ${error.message}`);
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date} - Token expiration date
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new ApiError(400, "Token does not have expiration");
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    throw new ApiError(400, `Error getting token expiration: ${error.message}`);
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

/**
 * Get token remaining time in seconds
 * @param {string} token - JWT token
 * @returns {number} - Remaining time in seconds (0 if expired)
 */
const getTokenRemainingTime = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
    return Math.max(0, remainingTime);
  } catch (error) {
    return 0;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string} - Extracted token
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    throw new ApiError(401, "Authorization header is required");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new ApiError(
      401,
      "Authorization header format must be Bearer [token]"
    );
  }

  return parts[1];
};

/**
 * Create password reset token
 * @param {object} payload - Token payload
 * @returns {string} - Password reset token
 */
const generatePasswordResetToken = (payload) => {
  return generateAccessToken(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "10m", // Password reset tokens expire in 10 minutes
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  });
};

/**
 * Create email verification token
 * @param {object} payload - Token payload
 * @returns {string} - Email verification token
 */
const generateEmailVerificationToken = (payload) => {
  return generateAccessToken(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "24h", // Email verification tokens expire in 24 hours
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  });
};

/**
 * Generate API key token (long-lived)
 * @param {object} payload - Token payload
 * @returns {string} - API key token
 */
const generateApiKeyToken = (payload) => {
  return generateAccessToken(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30d", // API keys expire in 30 days
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  });
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {object} - New token pair
 */
const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Create new tokens with same user info
    const newPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    return generateTokenPair(newPayload);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
};

/**
 * Create session token for temporary sessions
 * @param {object} payload - Token payload
 * @param {string} duration - Session duration
 * @returns {string} - Session token
 */
const generateSessionToken = (payload, duration = "1h") => {
  return generateAccessToken(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: duration,
    issuer: process.env.JWT_ISSUER || "your-app",
    audience: process.env.JWT_AUDIENCE || "your-app-users",
  });
};

/**
 * Blacklist token (for logout)
 * Note: This requires a blacklist storage mechanism (Redis, database, etc.)
 * @param {string} token - Token to blacklist
 * @param {object} storage - Storage mechanism for blacklist
 * @returns {Promise<void>}
 */
const blacklistToken = async (token, storage) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.payload.jti) {
      throw new Error("Invalid token structure");
    }

    const tokenId = decoded.payload.jti;
    const expiration = decoded.payload.exp;

    // Store token ID in blacklist with expiration
    await storage.set(`blacklist:${tokenId}`, true, expiration);
  } catch (error) {
    throw new ApiError(500, `Error blacklisting token: ${error.message}`);
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 * @param {object} storage - Storage mechanism for blacklist
 * @returns {Promise<boolean>} - True if token is blacklisted
 */
const isTokenBlacklisted = async (token, storage) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.payload.jti) {
      return true; // Consider invalid tokens as blacklisted
    }

    const tokenId = decoded.payload.jti;
    return await storage.exists(`blacklist:${tokenId}`);
  } catch (error) {
    return true; // Consider problematic tokens as blacklisted
  }
};

/**
 * Generate secure random token (for non-JWT purposes)
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Random hex token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  getTokenRemainingTime,
  extractTokenFromHeader,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateApiKeyToken,
  refreshAccessToken,
  generateSessionToken,
  blacklistToken,
  isTokenBlacklisted,
  generateSecureToken,
};
