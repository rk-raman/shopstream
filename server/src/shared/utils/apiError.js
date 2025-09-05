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
    errorCode = "BAD_REQUEST",
    errors = null
  ) {
    return new ApiError(400, message, errorCode, errors);
  }

  static unauthorized(message = "Unauthorized", errorCode = "UNAUTHORIZED") {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = "Forbidden", errorCode = "FORBIDDEN") {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = "Not Found", errorCode = "NOT_FOUND") {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message = "Conflict", errorCode = "CONFLICT") {
    return new ApiError(409, message, errorCode);
  }

  static validationError(message = "Validation Error", errors = null) {
    return new ApiError(400, message, "VALIDATION_ERROR", errors);
  }

  static tooManyRequests(
    message = "Too Many Requests",
    errorCode = "RATE_LIMIT_EXCEEDED"
  ) {
    return new ApiError(429, message, errorCode);
  }

  static internal(
    message = "Internal Server Error",
    errorCode = "INTERNAL_ERROR"
  ) {
    return new ApiError(500, message, errorCode);
  }
}

module.exports = ApiError;
