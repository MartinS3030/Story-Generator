const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} The hashed password.
 */
const hashPassword = (password) => bcrypt.hash(password, 10);

/**
 * Verifies a password against a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hash - The hashed password.
 * @returns {Promise<boolean>} Whether the password matches the hash.
 */
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object.
 * @param {number} user.id - The user's ID.
 * @param {string} user.username - The username.
 * @param {boolean} user.is_admin - Whether the user is an admin.
 * @param {number} user.api_calls - Number of API calls remaining.
 * @returns {string} The generated JWT token.
 */
const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, isAdmin: user.is_admin, apiCalls: user.api_calls }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

module.exports = { hashPassword, verifyPassword, generateToken };
