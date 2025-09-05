const { v4: uuidv4 } = require("uuid");

/**
 * Middleware to generate unique request ID for tracking
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};

module.exports = requestIdMiddleware;
