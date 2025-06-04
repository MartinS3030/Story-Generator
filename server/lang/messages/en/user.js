module.exports = {
  // Generic Messages
  unauthorizedAccess: "Unauthorized", //auth, user
  adminOnlyAccess: "Access denied: Admins only.", //auth middleware
  registrationFailure: "User registration failed.", //auth
  registrationSuccess: "User registered successfully.", //auth
  
  // Authentication-related Messages
  wrongPassword: "Invalid credentials.", //auth
  logoutSuccess: "Logged out successfully", //auth
  invalidToken: "Invalid token", //auth middleware
  
  // User-related Messages
  userNotFound: "User not found.", //auth, user
  userUpdateSuccess: "User updated successfully.", //user
  userUpdateFailure: "User update failed.", //user
  
  // AI-related Messages
  apiCountDecrementFailure: "Error decrementing API calls.", //ai
  promptRequired: "Prompt is required.", //ai
  generateError: "Error generating text.", //ai

  // Database-related Messages
  dbConnectionError: "Error connecting to MySQL.", // connection
  dbConnectionSuccess: "Connected to MySQL database.", // connection
  userTableCreationFailure: "Failed to create users table.", // connection
  apiUsageTableCreationFailure: "Failed to create API usage table.", // connection
  apiUsageUserNotFound: "User not found; created new entry.", //queries
  incrementRequestCountFailure: "Error incrementing request count.", // auth middleware
  requestTrackingFailure: "Error tracking request count.", // auth middleware
  
  // Admin-related Messages
  userFetchError: "Error fetching data.", //admin
  userDeletionSuccess: "User deleted successfully.", //admin
  userDeletionFailure: "Error deleting user.", //admin
  resourceFetchError: "Error fetching resources.", //admin
};
