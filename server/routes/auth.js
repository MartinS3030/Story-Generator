const express = require("express");
const router = express.Router();
const {
  registerUser,
  findUserByEmail,
  getApiCallCount,
} = require("../db/queries");
const {
  authenticate,
  incrementRequestCount,
} = require("../middleware/auth");
const {
  hashPassword,
  verifyPassword,
  generateToken,
} = require("../utils/helpers");
const messages = require('../lang/messages/en/user.js');
const { ROUTES } = require("./route");
require("dotenv").config();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with a hashed password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully."
 *       500:
 *         description: Registration failed due to a server error.
 */
router.post(ROUTES.AUTH.REGISTER, incrementRequestCount, async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await hashPassword(password);

  registerUser(username, email, hashedPassword, (err, result) => {
    if (err) {
      return res.status(500).json({ message: messages.registrationFailure });
    }
    res.status(201).json({ message: messages.registrationSuccess });
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns an authentication token in a cookie.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api_calls:
 *                   type: integer
 *                   example: 100
 *                 isAdmin:
 *                   type: boolean
 *                   example: true
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *       400:
 *         description: User not found.
 *       403:
 *         description: Invalid credentials.
 */
router.post(ROUTES.AUTH.LOGIN, incrementRequestCount, (req, res) => {
  const { email, password } = req.body;

  findUserByEmail(email, async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: messages.userNotFound });
    }

    const user = results[0];
    const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) {
      return res.status(403).json({ message: messages.wrongPassword });
    }

    getApiCallCount(user.id, (apiErr, apiResults) => {
      if (apiErr) {
        return res.status(400).json({ message: messages.userNotFound });
      }

      // the user object is passed to the generateToken function
      // is_admin is added to the token payload to show that the user is an admin
      const token = generateToken(user);

      res.cookie("authToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      // Respond with API call count from getApiCallCount
      res.json({
        api_calls: apiResults,
        isAdmin: user.is_admin,
        username: user.username,
      });
    });
  });
});

/**
 * @swagger
 * /auth/checkuser:
 *   get:
 *     summary: Check authentication status
 *     description: Checks if the user is authenticated and returns user data.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAdmin:
 *                   type: boolean
 *                   example: false
 *                 apiCalls:
 *                   type: integer
 *                   example: 5
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *       401:
 *         description: Unauthorized.
 */
router.get(
  ROUTES.AUTH.CHECKUSER,
  authenticate,
  incrementRequestCount,
  (req, res) => {
    if (req.user) {
      return res.json({
        isAdmin: req.user.isAdmin,
        apiCalls: req.user.apiCalls,
        id: req.user.id,
        username: req.user.username
      });
    } else {
      return res.status(401).json({ message: messages.unauthorizedAccess });
    }
  }
);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out a user
 *     description: Clears the authentication cookie.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully."
 */
router.post(
  ROUTES.AUTH.LOGOUT,
  incrementRequestCount,
  (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });
  
  res.status(200).json({ message: messages.logoutSuccess });
});

module.exports = router;
