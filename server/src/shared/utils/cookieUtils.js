// shared/utils/cookieUtils.js

/**
 * Cookie configuration constants
 */
const COOKIE_CONFIG = {
  REFRESH_TOKEN: {
    name: "refreshToken",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
};

/**
 * Set refresh token cookie
 * @param {Object} res - Express response object
 * @param {string} refreshToken - The refresh token to set
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const config = COOKIE_CONFIG.REFRESH_TOKEN;
  res.cookie(config.name, refreshToken, {
    httpOnly: config.httpOnly,
    secure: config.secure,
    sameSite: config.sameSite,
    maxAge: config.maxAge,
  });
};

/**
 * Clear refresh token cookie
 * @param {Object} res - Express response object
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN.name);
};

/**
 * Get refresh token from cookies
 * @param {Object} req - Express request object
 * @returns {string|undefined} The refresh token or undefined if not found
 */
const getRefreshTokenFromCookies = (req) => {
  return req.cookies[COOKIE_CONFIG.REFRESH_TOKEN.name];
};

module.exports = {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookies,
  COOKIE_CONFIG,
};
