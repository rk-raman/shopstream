const ApiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, create one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, "Validation Error", errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = new ApiError(409, message);
  }

  // MongoDB CastError
  if (err.name === "CastError") {
    const message = "Invalid ID format";
    error = new ApiError(400, message);
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    ...(error.errors.length > 0 && { errors: error.errors }),
  };

  res.status(error.statusCode).json(response);
};

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
