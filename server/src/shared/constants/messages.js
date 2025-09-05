/**
 * Application Messages Constants
 * Centralized location for all user-facing and system messages
 */

const MESSAGES = {
  // Success messages
  SUCCESS: {
    OPERATION_SUCCESSFUL: "Operation completed successfully",
    USER_CREATED: "User created successfully",
    USER_UPDATED: "User updated successfully",
    USER_DELETED: "User deleted successfully",
    LOGIN_SUCCESSFUL: "Login successful",
    LOGOUT_SUCCESSFUL: "Logout successful",
    PASSWORD_UPDATED: "Password updated successfully",
    EMAIL_VERIFIED: "Email verified successfully",
    DATA_RETRIEVED: "Data retrieved successfully",
    FILE_UPLOADED: "File uploaded successfully",
    SETTINGS_SAVED: "Settings saved successfully",
  },

  // Error messages
  ERROR: {
    INTERNAL_SERVER_ERROR: "An internal server error occurred",
    BAD_REQUEST: "Invalid request parameters",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource already exists",
    VALIDATION_FAILED: "Validation failed",

    // Authentication errors
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Token has expired",
    INVALID_TOKEN: "Invalid token provided",
    ACCESS_DENIED: "Access denied",

    // User-related errors
    USER_NOT_FOUND: "User not found",
    USER_ALREADY_EXISTS: "User with this email already exists",
    WEAK_PASSWORD: "Password is too weak",
    PASSWORD_MISMATCH: "Passwords do not match",
    EMAIL_NOT_VERIFIED: "Email address not verified",

    // Data errors
    INVALID_INPUT: "Invalid input provided",
    REQUIRED_FIELD_MISSING: "Required field is missing",
    INVALID_EMAIL_FORMAT: "Invalid email format",
    INVALID_PHONE_FORMAT: "Invalid phone number format",

    // File errors
    FILE_TOO_LARGE: "File size exceeds maximum limit",
    INVALID_FILE_TYPE: "Invalid file type",
    FILE_UPLOAD_FAILED: "File upload failed",

    // Database errors
    DATABASE_CONNECTION_FAILED: "Database connection failed",
    QUERY_FAILED: "Database query failed",

    // Rate limiting
    TOO_MANY_REQUESTS: "Too many requests, please try again later",
  },

  // Validation messages
  VALIDATION: {
    REQUIRED: "This field is required",
    MIN_LENGTH: "Minimum length is {min} characters",
    MAX_LENGTH: "Maximum length is {max} characters",
    INVALID_FORMAT: "Invalid format",
    MUST_BE_NUMBER: "Must be a valid number",
    MUST_BE_EMAIL: "Must be a valid email address",
    MUST_BE_PHONE: "Must be a valid phone number",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
    PASSWORD_REQUIREMENTS:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  },

  // Info messages
  INFO: {
    PROCESSING: "Processing your request...",
    LOADING: "Loading...",
    NO_DATA_FOUND: "No data found",
    CONFIRMATION_EMAIL_SENT: "Confirmation email has been sent",
    PASSWORD_RESET_EMAIL_SENT: "Password reset email has been sent",
    CHANGES_SAVED: "Changes have been saved",
    OPERATION_PENDING: "Operation is pending",
  },
};

module.exports = MESSAGES;
