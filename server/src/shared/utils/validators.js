const mongoose = require("mongoose");

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {object} - Validation result
 */
const validateEmail = (email) => {
  const result = {
    isValid: false,
    message: "",
    suggestions: [],
  };

  if (!email) {
    result.message = "Email is required";
    return result;
  }

  if (typeof email !== "string") {
    result.message = "Email must be a string";
    return result;
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    result.message = "Invalid email format";
    return result;
  }

  // More comprehensive email validation
  const parts = email.split("@");
  if (parts.length !== 2) {
    result.message = "Invalid email format";
    return result;
  }

  const [localPart, domain] = parts;

  // Validate local part
  if (localPart.length === 0 || localPart.length > 64) {
    result.message = "Email local part must be 1-64 characters";
    return result;
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    result.message = "Email local part cannot start or end with a dot";
    return result;
  }

  if (localPart.includes("..")) {
    result.message = "Email local part cannot contain consecutive dots";
    return result;
  }

  // Validate domain
  if (domain.length === 0 || domain.length > 255) {
    result.message = "Email domain must be 1-255 characters";
    return result;
  }

  if (domain.startsWith(".") || domain.endsWith(".")) {
    result.message = "Email domain cannot start or end with a dot";
    return result;
  }

  if (domain.includes("..")) {
    result.message = "Email domain cannot contain consecutive dots";
    return result;
  }

  // Check for common domain typos
  const commonDomainTypos = {
    "gmail.co": "gmail.com",
    "gmail.om": "gmail.com",
    "gmial.com": "gmail.com",
    "yahoo.co": "yahoo.com",
    "yahoo.om": "yahoo.com",
    "hotmail.co": "hotmail.com",
    "hotmail.om": "hotmail.com",
    "outlook.co": "outlook.com",
  };

  if (commonDomainTypos[domain]) {
    result.suggestions.push(
      `Did you mean ${localPart}@${commonDomainTypos[domain]}?`
    );
  }

  result.isValid = true;
  return result;
};

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with strength score
 */
const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    strength: "weak",
    message: "",
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSpecialChars: false,
      noCommonPatterns: false,
    },
    suggestions: [],
  };

  if (!password) {
    result.message = "Password is required";
    return result;
  }

  if (typeof password !== "string") {
    result.message = "Password must be a string";
    return result;
  }

  // Check minimum length
  if (password.length >= 8) {
    result.requirements.minLength = true;
    result.score += 1;
  } else {
    result.suggestions.push("Use at least 8 characters");
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    result.requirements.hasUppercase = true;
    result.score += 1;
  } else {
    result.suggestions.push("Include at least one uppercase letter");
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    result.requirements.hasLowercase = true;
    result.score += 1;
  } else {
    result.suggestions.push("Include at least one lowercase letter");
  }

  // Check for numbers
  if (/\d/.test(password)) {
    result.requirements.hasNumbers = true;
    result.score += 1;
  } else {
    result.suggestions.push("Include at least one number");
  }

  // Check for special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.requirements.hasSpecialChars = true;
    result.score += 1;
  } else {
    result.suggestions.push("Include at least one special character");
  }

  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|abc|qwe/i, // Sequential patterns
    /password|admin|user|login/i, // Common words
    /^[0-9]+$/, // Only numbers
    /^[a-zA-Z]+$/, // Only letters
  ];

  const hasWeakPattern = weakPatterns.some((pattern) => pattern.test(password));
  if (!hasWeakPattern) {
    result.requirements.noCommonPatterns = true;
    result.score += 1;
  } else {
    result.suggestions.push("Avoid common patterns and dictionary words");
  }

  // Bonus points for length
  if (password.length >= 12) result.score += 1;
  if (password.length >= 16) result.score += 1;

  // Determine strength
  if (result.score >= 7) result.strength = "very strong";
  else if (result.score >= 5) result.strength = "strong";
  else if (result.score >= 3) result.strength = "medium";
  else result.strength = "weak";

  result.isValid = result.score >= 5;
  result.message = result.isValid
    ? "Password is strong"
    : "Password is too weak";

  return result;
};

/**
 * Phone number validation (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {object} - Validation result
 */
const validatePhone = (phone) => {
  const result = {
    isValid: false,
    message: "",
    formatted: "",
  };

  if (!phone) {
    result.message = "Phone number is required";
    return result;
  }

  if (typeof phone !== "string") {
    result.message = "Phone number must be a string";
    return result;
  }

  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Check if it's a valid Indian mobile number
  const indianMobileRegex = /^[6-9]\d{9}$/;

  if (indianMobileRegex.test(cleanPhone)) {
    result.isValid = true;
    result.formatted = `+91${cleanPhone}`;
    result.message = "Valid phone number";
  } else if (cleanPhone.length === 10) {
    result.message = "Phone number must start with 6, 7, 8, or 9";
  } else if (cleanPhone.length < 10) {
    result.message = "Phone number is too short";
  } else if (cleanPhone.length > 10) {
    result.message = "Phone number is too long";
  } else {
    result.message = "Invalid phone number format";
  }

  return result;
};

/**
 * Name validation
 * @param {string} name - Name to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
const validateName = (name, options = {}) => {
  const {
    minLength = 2,
    maxLength = 50,
    allowNumbers = false,
    allowSpecialChars = false,
  } = options;

  const result = {
    isValid: false,
    message: "",
    sanitized: "",
  };

  if (!name) {
    result.message = "Name is required";
    return result;
  }

  if (typeof name !== "string") {
    result.message = "Name must be a string";
    return result;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < minLength) {
    result.message = `Name must be at least ${minLength} characters`;
    return result;
  }

  if (trimmedName.length > maxLength) {
    result.message = `Name cannot exceed ${maxLength} characters`;
    return result;
  }

  // Check for numbers
  if (!allowNumbers && /\d/.test(trimmedName)) {
    result.message = "Name cannot contain numbers";
    return result;
  }

  // Check for special characters
  if (!allowSpecialChars && /[^a-zA-Z\s'-]/.test(trimmedName)) {
    result.message =
      "Name can only contain letters, spaces, hyphens, and apostrophes";
    return result;
  }

  // Check for excessive spaces
  if (/\s{2,}/.test(trimmedName)) {
    result.message = "Name cannot contain multiple consecutive spaces";
    return result;
  }

  result.isValid = true;
  result.sanitized = trimmedName.replace(/\s+/g, " ");
  result.message = "Valid name";

  return result;
};

/**
 * MongoDB ObjectId validation
 * @param {string} id - ID to validate
 * @returns {object} - Validation result
 */
const validateObjectId = (id) => {
  const result = {
    isValid: false,
    message: "",
  };

  if (!id) {
    result.message = "ID is required";
    return result;
  }

  if (typeof id !== "string") {
    result.message = "ID must be a string";
    return result;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    result.message = "Invalid ID format";
    return result;
  }

  result.isValid = true;
  result.message = "Valid ID";
  return result;
};

/**
 * URL validation
 * @param {string} url - URL to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
const validateUrl = (url, options = {}) => {
  const {
    requireProtocol = true,
    allowedProtocols = ["http:", "https:"],
    requireDomain = true,
  } = options;

  const result = {
    isValid: false,
    message: "",
    parsed: null,
  };

  if (!url) {
    result.message = "URL is required";
    return result;
  }

  if (typeof url !== "string") {
    result.message = "URL must be a string";
    return result;
  }

  try {
    const parsedUrl = new URL(url);
    result.parsed = parsedUrl;

    if (requireProtocol && !allowedProtocols.includes(parsedUrl.protocol)) {
      result.message = `Protocol must be one of: ${allowedProtocols.join(
        ", "
      )}`;
      return result;
    }

    if (requireDomain && !parsedUrl.hostname) {
      result.message = "URL must have a valid domain";
      return result;
    }

    result.isValid = true;
    result.message = "Valid URL";
  } catch (error) {
    result.message = "Invalid URL format";
  }

  return result;
};

/**
 * Date validation
 * @param {string|Date} date - Date to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
const validateDate = (date, options = {}) => {
  const { minDate, maxDate, allowFuture = true, allowPast = true } = options;

  const result = {
    isValid: false,
    message: "",
    parsed: null,
  };

  if (!date) {
    result.message = "Date is required";
    return result;
  }

  let parsedDate;
  try {
    parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      result.message = "Invalid date format";
      return result;
    }
  } catch (error) {
    result.message = "Invalid date format";
    return result;
  }

  result.parsed = parsedDate;

  const now = new Date();

  if (!allowFuture && parsedDate > now) {
    result.message = "Date cannot be in the future";
    return result;
  }

  if (!allowPast && parsedDate < now) {
    result.message = "Date cannot be in the past";
    return result;
  }

  if (minDate && parsedDate < new Date(minDate)) {
    result.message = `Date must be after ${new Date(minDate).toDateString()}`;
    return result;
  }

  if (maxDate && parsedDate > new Date(maxDate)) {
    result.message = `Date must be before ${new Date(maxDate).toDateString()}`;
    return result;
  }

  result.isValid = true;
  result.message = "Valid date";
  return result;
};

/**
 * Age validation
 * @param {string|Date} dateOfBirth - Date of birth
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
const validateAge = (dateOfBirth, options = {}) => {
  const { minAge = 0, maxAge = 120 } = options;

  const result = {
    isValid: false,
    message: "",
    age: 0,
  };

  if (!dateOfBirth) {
    result.message = "Date of birth is required";
    return result;
  }

  const dateValidation = validateDate(dateOfBirth, { allowFuture: false });
  if (!dateValidation.isValid) {
    result.message = dateValidation.message;
    return result;
  }

  const birthDate = dateValidation.parsed;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  result.age = age;

  if (age < minAge) {
    result.message = `Age must be at least ${minAge} years`;
    return result;
  }

  if (age > maxAge) {
    result.message = `Age cannot exceed ${maxAge} years`;
    return result;
  }

  result.isValid = true;
  result.message = "Valid age";
  return result;
};

/**
 * Address validation
 * @param {object} address - Address object to validate
 * @returns {object} - Validation result
 */
const validateAddress = (address) => {
  const result = {
    isValid: false,
    message: "",
    errors: {},
    sanitized: {},
  };

  if (!address || typeof address !== "object") {
    result.message = "Address must be an object";
    return result;
  }

  const {
    fullName,
    addressLine1,
    city,
    state,
    pincode,
    phone,
    type = "home",
  } = address;

  // Validate full name
  const nameValidation = validateName(fullName);
  if (!nameValidation.isValid) {
    result.errors.fullName = nameValidation.message;
  } else {
    result.sanitized.fullName = nameValidation.sanitized;
  }

  // Validate address line 1
  if (!addressLine1 || addressLine1.trim().length < 5) {
    result.errors.addressLine1 = "Address line 1 must be at least 5 characters";
  } else if (addressLine1.length > 200) {
    result.errors.addressLine1 = "Address line 1 cannot exceed 200 characters";
  } else {
    result.sanitized.addressLine1 = addressLine1.trim();
  }

  // Validate city
  const cityValidation = validateName(city, { minLength: 2, maxLength: 50 });
  if (!cityValidation.isValid) {
    result.errors.city = cityValidation.message;
  } else {
    result.sanitized.city = cityValidation.sanitized;
  }

  // Validate state
  const stateValidation = validateName(state, { minLength: 2, maxLength: 50 });
  if (!stateValidation.isValid) {
    result.errors.state = stateValidation.message;
  } else {
    result.sanitized.state = stateValidation.sanitized;
  }

  // Validate pincode (Indian format)
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  if (!pincode || !pincodeRegex.test(pincode)) {
    result.errors.pincode = "Please enter a valid 6-digit pincode";
  } else {
    result.sanitized.pincode = pincode;
  }

  // Validate phone
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.isValid) {
    result.errors.phone = phoneValidation.message;
  } else {
    result.sanitized.phone = phoneValidation.formatted;
  }

  // Validate type
  const validTypes = ["home", "work", "other"];
  if (!validTypes.includes(type)) {
    result.errors.type = "Address type must be home, work, or other";
  } else {
    result.sanitized.type = type;
  }

  // Check if there are any errors
  const hasErrors = Object.keys(result.errors).length > 0;
  result.isValid = !hasErrors;
  result.message = hasErrors ? "Address validation failed" : "Valid address";

  return result;
};

/**
 * File validation
 * @param {object} file - File object to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
    allowedExtensions = [],
    minSize = 0,
  } = options;

  const result = {
    isValid: false,
    message: "",
    fileInfo: null,
  };

  if (!file) {
    result.message = "File is required";
    return result;
  }

  if (typeof file !== "object") {
    result.message = "Invalid file object";
    return result;
  }

  const { size, mimetype, originalname } = file;

  result.fileInfo = {
    size,
    mimetype,
    originalname,
    extension: originalname ? originalname.split(".").pop().toLowerCase() : "",
  };

  // Check file size
  if (size < minSize) {
    result.message = `File size must be at least ${minSize} bytes`;
    return result;
  }

  if (size > maxSize) {
    result.message = `File size cannot exceed ${maxSize} bytes`;
    return result;
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(mimetype)) {
    result.message = `File type ${mimetype} is not allowed. Allowed types: ${allowedTypes.join(
      ", "
    )}`;
    return result;
  }

  // Check file extension
  if (
    allowedExtensions.length > 0 &&
    !allowedExtensions.includes(result.fileInfo.extension)
  ) {
    result.message = `File extension ${
      result.fileInfo.extension
    } is not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`;
    return result;
  }

  result.isValid = true;
  result.message = "Valid file";
  return result;
};

/**
 * Credit card number validation (Luhn algorithm)
 * @param {string} cardNumber - Credit card number
 * @returns {object} - Validation result
 */
const validateCreditCard = (cardNumber) => {
  const result = {
    isValid: false,
    message: "",
    type: "",
    formatted: "",
  };

  if (!cardNumber) {
    result.message = "Card number is required";
    return result;
  }

  // Remove all non-numeric characters
  const cleanNumber = cardNumber.replace(/\D/g, "");

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    result.message = "Card number must be 13-19 digits";
    return result;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    result.message = "Invalid card number";
    return result;
  }

  // Determine card type
  const firstDigit = cleanNumber.charAt(0);
  const firstTwoDigits = cleanNumber.substring(0, 2);
  const firstFourDigits = cleanNumber.substring(0, 4);

  if (firstDigit === "4") {
    result.type = "Visa";
  } else if (
    ["51", "52", "53", "54", "55"].includes(firstTwoDigits) ||
    (parseInt(firstFourDigits) >= 2221 && parseInt(firstFourDigits) <= 2720)
  ) {
    result.type = "Mastercard";
  } else if (["34", "37"].includes(firstTwoDigits)) {
    result.type = "American Express";
  } else if (firstFourDigits === "6011" || firstTwoDigits === "65") {
    result.type = "Discover";
  } else {
    result.type = "Unknown";
  }

  // Format card number
  result.formatted = cleanNumber.replace(/(.{4})/g, "$1 ").trim();

  result.isValid = true;
  result.message = "Valid card number";
  return result;
};

/**
 * JSON validation
 * @param {string} jsonString - JSON string to validate
 * @returns {object} - Validation result
 */
const validateJSON = (jsonString) => {
  const result = {
    isValid: false,
    message: "",
    parsed: null,
  };

  if (!jsonString) {
    result.message = "JSON string is required";
    return result;
  }

  if (typeof jsonString !== "string") {
    result.message = "Input must be a string";
    return result;
  }

  try {
    result.parsed = JSON.parse(jsonString);
    result.isValid = true;
    result.message = "Valid JSON";
  } catch (error) {
    result.message = `Invalid JSON: ${error.message}`;
  }

  return result;
};

/**
 * Batch validation for multiple fields
 * @param {object} data - Data object to validate
 * @param {object} rules - Validation rules
 * @returns {object} - Validation result
 */
const validateBatch = (data, rules) => {
  const result = {
    isValid: true,
    errors: {},
    validData: {},
  };

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    let fieldValid = true;
    let fieldErrors = [];

    // Required validation
    if (
      fieldRules.required &&
      (value === undefined || value === null || value === "")
    ) {
      fieldErrors.push(`${field} is required`);
      fieldValid = false;
    }

    // Skip other validations if field is not required and empty
    if (
      !fieldRules.required &&
      (value === undefined || value === null || value === "")
    ) {
      continue;
    }

    // Type validation
    if (fieldRules.type && typeof value !== fieldRules.type) {
      fieldErrors.push(`${field} must be of type ${fieldRules.type}`);
      fieldValid = false;
    }

    // Length validation
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      fieldErrors.push(
        `${field} must be at least ${fieldRules.minLength} characters`
      );
      fieldValid = false;
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      fieldErrors.push(
        `${field} cannot exceed ${fieldRules.maxLength} characters`
      );
      fieldValid = false;
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      fieldErrors.push(
        fieldRules.patternMessage || `${field} format is invalid`
      );
      fieldValid = false;
    }

    // Custom validation
    if (fieldRules.custom && typeof fieldRules.custom === "function") {
      const customResult = fieldRules.custom(value);
      if (!customResult.isValid) {
        fieldErrors.push(customResult.message);
        fieldValid = false;
      }
    }

    // Email validation
    if (fieldRules.email) {
      const emailResult = validateEmail(value);
      if (!emailResult.isValid) {
        fieldErrors.push(emailResult.message);
        fieldValid = false;
      }
    }

    // Phone validation
    if (fieldRules.phone) {
      const phoneResult = validatePhone(value);
      if (!phoneResult.isValid) {
        fieldErrors.push(phoneResult.message);
        fieldValid = false;
      }
    }

    // ObjectId validation
    if (fieldRules.objectId) {
      const idResult = validateObjectId(value);
      if (!idResult.isValid) {
        fieldErrors.push(idResult.message);
        fieldValid = false;
      }
    }

    if (fieldErrors.length > 0) {
      result.errors[field] = fieldErrors;
      result.isValid = false;
    } else if (fieldValid) {
      result.validData[field] = value;
    }
  }

  return result;
};

/**
 * Password confirmation validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - Validation result
 */
const validatePasswordConfirmation = (password, confirmPassword) => {
  const result = {
    isValid: false,
    message: "",
  };

  if (!password || !confirmPassword) {
    result.message = "Both password and confirmation are required";
    return result;
  }

  if (password !== confirmPassword) {
    result.message = "Passwords do not match";
    return result;
  }

  result.isValid = true;
  result.message = "Passwords match";
  return result;
};

/**
 * Array validation
 * @param {Array} array - Array to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
const validateArray = (array, options = {}) => {
  const {
    minLength = 0,
    maxLength = Infinity,
    itemType,
    uniqueItems = false,
    allowEmpty = true,
  } = options;

  const result = {
    isValid: false,
    message: "",
    sanitized: [],
  };

  if (!Array.isArray(array)) {
    result.message = "Value must be an array";
    return result;
  }

  if (!allowEmpty && array.length === 0) {
    result.message = "Array cannot be empty";
    return result;
  }

  if (array.length < minLength) {
    result.message = `Array must have at least ${minLength} items`;
    return result;
  }

  if (array.length > maxLength) {
    result.message = `Array cannot have more than ${maxLength} items`;
    return result;
  }

  // Check item types
  if (itemType) {
    for (let i = 0; i < array.length; i++) {
      if (typeof array[i] !== itemType) {
        result.message = `All items must be of type ${itemType}`;
        return result;
      }
    }
  }

  // Check for unique items
  if (uniqueItems) {
    const uniqueSet = new Set(array);
    if (uniqueSet.size !== array.length) {
      result.message = "All items must be unique";
      return result;
    }
  }

  result.isValid = true;
  result.sanitized = [...array];
  result.message = "Valid array";
  return result;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateObjectId,
  validateUrl,
  validateDate,
  validateAge,
  validateAddress,
  validateFile,
  validateCreditCard,
  validateJSON,
  validateBatch,
  validatePasswordConfirmation,
  validateArray,
};
