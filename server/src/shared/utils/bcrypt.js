const bcrypt = require("bcryptjs");

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Error comparing password: ${error.message}`);
  }
};

/**
 * Generate a random salt
 * @param {number} rounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} - Generated salt
 */
const generateSalt = async (rounds = 12) => {
  try {
    return await bcrypt.genSalt(rounds);
  } catch (error) {
    throw new Error(`Error generating salt: ${error.message}`);
  }
};

/**
 * Hash a password with a specific salt
 * @param {string} password - Plain text password
 * @param {string} salt - Salt to use for hashing
 * @returns {Promise<string>} - Hashed password
 */
const hashPasswordWithSalt = async (password, salt) => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Error hashing password with salt: ${error.message}`);
  }
};

/**
 * Get the salt rounds from a hashed password
 * @param {string} hashedPassword - Hashed password
 * @returns {number} - Number of salt rounds used
 */
const getSaltRounds = (hashedPassword) => {
  try {
    return bcrypt.getRounds(hashedPassword);
  } catch (error) {
    throw new Error(`Error getting salt rounds: ${error.message}`);
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with score and feedback
 */
const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: [],
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSpecialChars: false,
    },
  };

  if (!password) {
    result.feedback.push("Password is required");
    return result;
  }

  // Check minimum length
  if (password.length >= 8) {
    result.requirements.minLength = true;
    result.score += 1;
  } else {
    result.feedback.push("Password must be at least 8 characters long");
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    result.requirements.hasUppercase = true;
    result.score += 1;
  } else {
    result.feedback.push("Password must contain at least one uppercase letter");
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    result.requirements.hasLowercase = true;
    result.score += 1;
  } else {
    result.feedback.push("Password must contain at least one lowercase letter");
  }

  // Check for numbers
  if (/\d/.test(password)) {
    result.requirements.hasNumbers = true;
    result.score += 1;
  } else {
    result.feedback.push("Password must contain at least one number");
  }

  // Check for special characters
  if (/[@$!%*?&]/.test(password)) {
    result.requirements.hasSpecialChars = true;
    result.score += 1;
  } else {
    result.feedback.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  // Additional security checks
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|abc|qwe/i, // Sequential patterns
    /password|admin|user/i, // Common words
  ];

  commonPatterns.forEach((pattern) => {
    if (pattern.test(password)) {
      result.score -= 1;
      result.feedback.push(
        "Avoid common patterns, repeated characters, or dictionary words"
      );
    }
  });

  // Bonus points for length
  if (password.length >= 12) {
    result.score += 1;
  }
  if (password.length >= 16) {
    result.score += 1;
  }

  // Normalize score (0-5 scale)
  result.score = Math.max(0, Math.min(5, result.score));
  result.isValid = result.score >= 5;

  return result;
};

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @param {object} options - Password generation options
 * @returns {string} - Generated password
 */
const generateSecurePassword = (
  length = 12,
  options = {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecialChars: true,
    excludeSimilar: true, // Exclude similar looking characters
  }
) => {
  let charset = "";

  if (options.includeLowercase) {
    charset += options.excludeSimilar
      ? "abcdefghjkmnpqrstuvwxyz"
      : "abcdefghijklmnopqrstuvwxyz";
  }

  if (options.includeUppercase) {
    charset += options.excludeSimilar
      ? "ABCDEFGHJKMNPQRSTUVWXYZ"
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (options.includeNumbers) {
    charset += options.excludeSimilar ? "23456789" : "0123456789";
  }

  if (options.includeSpecialChars) {
    charset += "@$!%*?&";
  }

  if (!charset) {
    throw new Error("At least one character type must be included");
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
};

/**
 * Time-safe password comparison to prevent timing attacks
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const timeSafeCompare = async (plainPassword, hashedPassword) => {
  try {
    // Use bcrypt's built-in time-safe comparison
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    // Always hash something to maintain consistent timing
    await bcrypt.hash("dummy", 10);
    throw new Error(`Error in time-safe comparison: ${error.message}`);
  }
};

/**
 * Check if a password needs to be rehashed (due to changed salt rounds)
 * @param {string} hashedPassword - Currently hashed password
 * @param {number} desiredRounds - Desired salt rounds
 * @returns {boolean} - True if password needs rehashing
 */
const needsRehash = (hashedPassword, desiredRounds = 12) => {
  try {
    const currentRounds = bcrypt.getRounds(hashedPassword);
    return currentRounds !== desiredRounds;
  } catch (error) {
    // If we can't determine rounds, assume it needs rehashing
    return true;
  }
};

/**
 * Rehash a password if needed
 * @param {string} plainPassword - Plain text password
 * @param {string} currentHash - Current hashed password
 * @param {number} desiredRounds - Desired salt rounds
 * @returns {Promise<string|null>} - New hash if rehashing was needed, null otherwise
 */
const rehashIfNeeded = async (
  plainPassword,
  currentHash,
  desiredRounds = 12
) => {
  try {
    if (needsRehash(currentHash, desiredRounds)) {
      return await hashPassword(plainPassword, desiredRounds);
    }
    return null;
  } catch (error) {
    throw new Error(`Error in rehashing: ${error.message}`);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateSalt,
  hashPasswordWithSalt,
  getSaltRounds,
  validatePasswordStrength,
  generateSecurePassword,
  timeSafeCompare,
  needsRehash,
  rehashIfNeeded,
};
