const ERROR_CODES = require("../constants/errorCodes");

class ApiError extends Error {
  constructor(
    statusCode,
    message,
    errorCode = null,
    errors = null,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  // Static factory methods for common errors
  static badRequest(
    message = "Bad Request",
    errorCode = ERROR_CODES.BAD_REQUEST,
    errors = null
  ) {
    return new ApiError(400, message, errorCode, errors);
  }

  static unauthorized(
    message = "Unauthorized",
    errorCode = ERROR_CODES.UNAUTHORIZED
  ) {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = "Forbidden", errorCode = ERROR_CODES.FORBIDDEN) {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = "Not Found", errorCode = ERROR_CODES.NOT_FOUND) {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message = "Conflict", errorCode = ERROR_CODES.CONFLICT) {
    return new ApiError(409, message, errorCode);
  }

  static validationError(message = "Validation Error", errors = null) {
    return new ApiError(400, message, ERROR_CODES.VALIDATION_ERROR, errors);
  }

  static tooManyRequests(
    message = "Too Many Requests",
    errorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED
  ) {
    return new ApiError(429, message, errorCode);
  }

  static internal(
    message = "Internal Server Error",
    errorCode = ERROR_CODES.INTERNAL_ERROR
  ) {
    return new ApiError(500, message, errorCode);
  }
}

module.exports = ApiError;
