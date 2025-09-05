/**
 * User Roles and Permissions Constants
 * Centralized location for all user roles and their associated permissions
 */

const ROLES = {
  // User role definitions
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
  GUEST: "guest",
};

const PERMISSIONS = {
  // User management permissions
  CREATE_USER: "create_user",
  READ_USER: "read_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",

  // Content management permissions
  CREATE_CONTENT: "create_content",
  READ_CONTENT: "read_content",
  UPDATE_CONTENT: "update_content",
  DELETE_CONTENT: "delete_content",
  PUBLISH_CONTENT: "publish_content",

  // System permissions
  MANAGE_SETTINGS: "manage_settings",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_ROLES: "manage_roles",
  ACCESS_ADMIN_PANEL: "access_admin_panel",

  // File permissions
  UPLOAD_FILES: "upload_files",
  DELETE_FILES: "delete_files",

  // Comment/Review permissions
  CREATE_COMMENT: "create_comment",
  MODERATE_COMMENTS: "moderate_comments",
  DELETE_ANY_COMMENT: "delete_any_comment",
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(PERMISSIONS),
  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.DELETE_FILES,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.MODERATE_COMMENTS,
    PERMISSIONS.DELETE_ANY_COMMENT,
  ],

  [ROLES.MODERATOR]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.MODERATE_COMMENTS,
    PERMISSIONS.DELETE_ANY_COMMENT,
  ],

  [ROLES.USER]: [
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.UPDATE_CONTENT, // Only their own content
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.CREATE_COMMENT,
  ],

  [ROLES.GUEST]: [PERMISSIONS.READ_CONTENT],
};

// Helper functions for role management
const ROLE_HELPERS = {
  /**
   * Check if a role has a specific permission
   * @param {string} role - The role to check
   * @param {string} permission - The permission to verify
   * @returns {boolean} - Whether the role has the permission
   */
  hasPermission(role, permission) {
    return (
      ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].includes(permission)
    );
  },

  /**
   * Get all permissions for a role
   * @param {string} role - The role to get permissions for
   * @returns {Array} - Array of permissions
   */
  getPermissions(role) {
    return ROLE_PERMISSIONS[role] || [];
  },

  /**
   * Check if a role is valid
   * @param {string} role - The role to validate
   * @returns {boolean} - Whether the role is valid
   */
  isValidRole(role) {
    return Object.values(ROLES).includes(role);
  },

  /**
   * Get role hierarchy (higher number = more permissions)
   * @param {string} role - The role to get hierarchy for
   * @returns {number} - Hierarchy level
   */
  getRoleHierarchy(role) {
    const hierarchy = {
      [ROLES.GUEST]: 1,
      [ROLES.USER]: 2,
      [ROLES.MODERATOR]: 3,
      [ROLES.ADMIN]: 4,
      [ROLES.SUPER_ADMIN]: 5,
    };
    return hierarchy[role] || 0;
  },

  /**
   * Check if role A has higher or equal privileges than role B
   * @param {string} roleA - First role
   * @param {string} roleB - Second role
   * @returns {boolean} - Whether roleA >= roleB in hierarchy
   */
  hasEqualOrHigherPrivileges(roleA, roleB) {
    return this.getRoleHierarchy(roleA) >= this.getRoleHierarchy(roleB);
  },
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_HELPERS,
};
