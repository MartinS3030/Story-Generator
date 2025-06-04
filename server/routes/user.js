const express = require("express");
const router = express.Router();
const {
  updateUser,
  findUserById,
  getApiCallCount,
} = require("../db/queries");
const {
  authenticate,
  incrementRequestCount,
} = require("../middleware/auth");
const {
  generateToken,
} = require("../utils/helpers");
const messages = require('../lang/messages/en/user.js');
const { ROUTES } = require("./route");
require("dotenv").config();

/**
 * @swagger
 * /update/{id}:
 *   put:
 *     summary: Update a user's username
 *     description: Updates a user's username.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "new_username"
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400:
 *         description: User not found.
 *       500:
 *         description: User update failed.
 */
router.put(
  `${ROUTES.USER.UPDATE}/:id`,
  authenticate,
  incrementRequestCount,
  async (req, res) => {
    const id = req.params.id; // Get ID from the URL parameter
    const { username } = req.body;

    updateUser(id, username, (err, result) => {
      if (err) {
        return res.status(500).json({ message: messages.userUpdateFailure });
      }

      // regenerate the cookie with the updated username
      findUserById(id, async (err, results) => {
        if (err || results.length === 0) {
          return res.status(400).json({ message: messages.userNotFound });
        }
    
        const user = results[0];
        const token = generateToken(user);

        res.cookie("authToken", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          secure: true,
          sameSite: "none",
          path: "/",
        });

        res.status(200).json({ message: messages.userUpdateSuccess });
      });
    });
  }
);


/**
 * @swagger
 * /getapicalls:
 *   get:
 *     summary: Get user's API call count
 *     description: Returns the current API call count for the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's remaining API calls.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiCalls:
 *                   type: integer
 *                   example: 8
 *       400:
 *         description: User not found.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  ROUTES.USER.GETAPICALLS,
  authenticate,
  incrementRequestCount,
  (req, res) => {
    if (req.user) {
      const userId = req.user.id;

      getApiCallCount(userId, (err, results) => {
        if (err) {
          return res.status(400).json({ message: messages.userNotFound });
        }
        res.json({ apiCalls: results.api_calls });
      });
    } else {
      return res.status(401).json({ message: messages.unauthorizedAccess });
    }
  }
);

module.exports = router;
