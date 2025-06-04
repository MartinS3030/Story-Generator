const jwt = require("jsonwebtoken");
require("dotenv").config();
const { incrementCountInDB } = require("../db/queries");
const messages = require('../lang/messages/en/user.js');

/**
 * Middleware to authenticate users using JWT.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
function authenticate(req, res, next) {
  // Extract token from cookies instead of headers
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: messages.unauthorizedAccess});
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: messages.invalidToken});
  }
}

/**
 * Middleware to check if the user is an admin.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
function checkAdmin(req, res, next) {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: messages.adminOnlyAccess });
  }
}

/**
 * Middleware to track API request counts.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
function incrementRequestCount(req, res, next) {
  const route = req.originalUrl;
  const method = req.method;

  incrementCountInDB(route, method, (err, results) => {
    if (err) {
      console.error(messages.incrementRequestCountFailure, err);
      return res.status(500).json({ message: messages.requestTrackingFailure});
    }
    next();
  });
}

module.exports = { authenticate, checkAdmin, incrementRequestCount };
