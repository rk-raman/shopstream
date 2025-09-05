const ResponseFormatter = require("../utils/responseFormatter");
const ApiError = require("../utils/apiError");
const ERROR_CODES = require("../constants/errorCodes");

const errorHandler = (error, req, res, next) => {
  let { statusCode, message, errorCode, errors } = error;

  // Log error details
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    requestId: res.locals.requestId,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if (error.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = "Validation failed";
    errors = {};

    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorCode = ERROR_CODES.DUPLICATE_ENTRY;
    message = "Resource already exists";

    const field = Object.keys(error.keyValue)[0];
    errors = { [field]: `${field} already exists` };
  } else if (error.name === "CastError") {
    // MongoDB invalid ObjectId
    statusCode = 400;
    errorCode = ERROR_CODES.INVALID_ID;
    message = "Invalid resource ID";
  } else if (error.name === "JsonWebTokenError") {
    // JWT error
    statusCode = 401;
    errorCode = ERROR_CODES.INVALID_TOKEN;
    message = "Invalid authentication token";
  } else if (error.name === "TokenExpiredError") {
    // JWT expired
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
    message = "Authentication token has expired";
  } else if (error.name === "MulterError") {
    // File upload error
    statusCode = 400;
    errorCode = ERROR_CODES.FILE_UPLOAD_ERROR;
    message = error.message;
  }

  // Default to 500 if not an operational error
  if (!(error instanceof ApiError) && !statusCode) {
    statusCode = 500;
    errorCode = ERROR_CODES.INTERNAL_ERROR;
    message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error";
  }

  // Send error response
  return ResponseFormatter.error(res, message, statusCode, errorCode, errors);
};

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
