const ResponseFormatter = require("../utils/responseFormatter");

/**
 * Middleware to attach response methods to res object
 */
const responseHandlerMiddleware = (req, res, next) => {
  // Attach success methods
  res.success = (data, message, statusCode, meta) =>
    ResponseFormatter.success(res, data, message, statusCode, meta);

  res.created = (data, message) =>
    ResponseFormatter.created(res, data, message);

  res.noContent = (message) => ResponseFormatter.noContent(res, message);

  res.paginated = (data, message) =>
    ResponseFormatter.paginated(res, data, message);

  // Attach error methods
  res.error = (message, statusCode, errorCode, errors) =>
    ResponseFormatter.error(res, message, statusCode, errorCode, errors);

  res.validationError = (errors) =>
    ResponseFormatter.validationError(res, errors);

  res.notFound = (resource) => ResponseFormatter.notFound(res, resource);

  res.unauthorized = (message) => ResponseFormatter.unauthorized(res, message);

  res.forbidden = (message) => ResponseFormatter.forbidden(res, message);

  res.conflict = (message) => ResponseFormatter.conflict(res, message);

  res.tooManyRequests = (message) =>
    ResponseFormatter.tooManyRequests(res, message);

  res.internalError = (message) =>
    ResponseFormatter.internalError(res, message);

  next();
};

module.exports = responseHandlerMiddleware;
