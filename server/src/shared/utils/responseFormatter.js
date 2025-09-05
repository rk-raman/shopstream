const ERROR_CODES = require("../constants/errorCodes");

class ResponseFormatter {
  /**
   * Success response format
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code
   * @param {Object} meta - Metadata (pagination, etc.)
   */
  static success(
    res,
    data = null,
    message = "Success",
    statusCode = 200,
    meta = null
  ) {
    const response = {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null,
    };

    // Remove null values
    Object.keys(response).forEach((key) => {
      if (response[key] === null) {
        delete response[key];
      }
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Error response format
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code
   * @param {String} errorCode - Internal error code
   * @param {Object} errors - Validation errors or details
   */
  static error(
    res,
    message = "Internal Server Error",
    statusCode = 500,
    errorCode = null,
    errors = null
  ) {
    const response = {
      success: false,
      message,
      errorCode,
      errors,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null,
    };

    // Remove null values
    Object.keys(response).forEach((key) => {
      if (response[key] === null) {
        delete response[key];
      }
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Paginated response format
   * @param {Object} res - Express response object
   * @param {Object} paginatedData - Paginated data from mongoose-paginate-v2
   * @param {String} message - Success message
   */
  static paginated(
    res,
    paginatedData,
    message = "Data retrieved successfully"
  ) {
    const { docs, ...pagination } = paginatedData;

    return this.success(res, docs, message, 200, {
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalResults: pagination.totalDocs,
        resultsPerPage: pagination.limit,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        nextPage: pagination.nextPage,
        prevPage: pagination.prevPage,
      },
    });
  }

  /**
   * Created response format
   * @param {Object} res - Express response object
   * @param {Object} data - Created resource data
   * @param {String} message - Success message
   */
  static created(res, data, message = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }

  /**
   * No content response format
   * @param {Object} res - Express response object
   * @param {String} message - Success message
   */
  static noContent(res, message = "Operation completed successfully") {
    return this.success(res, null, message, 204);
  }

  /**
   * Validation error response format
   * @param {Object} res - Express response object
   * @param {Object} errors - Validation errors
   */
  static validationError(res, errors) {
    return this.error(
      res,
      "Validation failed",
      400,
      ERROR_CODES.VALIDATION_ERROR,
      errors
    );
  }

  /**
   * Not found response format
   * @param {Object} res - Express response object
   * @param {String} resource - Resource name
   */
  static notFound(res, resource = "Resource") {
    return this.error(res, `${resource} not found`, 404, "NOT_FOUND");
  }

  /**
   * Unauthorized response format
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res, message = "Unauthorized access") {
    return this.error(res, message, 401, ERROR_CODES.UNAUTHORIZED);
  }

  /**
   * Forbidden response format
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static forbidden(res, message = "Access forbidden") {
    return this.error(res, message, 403, ERROR_CODES.FORBIDDEN);
  }

  /**
   * Conflict response format
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static conflict(res, message = "Resource conflict") {
    return this.error(res, message, 409, ERROR_CODES.CONFLICT);
  }

  /**
   * Too many requests response format
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static tooManyRequests(res, message = "Too many requests") {
    return this.error(res, message, 429, ERROR_CODES.TOO_MANY_REQUESTS);
  }

  /**
   * Internal server error response format
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static internalError(res, message = "Internal server error") {
    return this.error(res, message, 500, ERROR_CODES.INTERNAL_ERROR);
  }
}

module.exports = ResponseFormatter;
