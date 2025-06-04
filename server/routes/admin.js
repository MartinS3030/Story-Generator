const express = require("express");
const router = express.Router();
const {
  fetchAllUsers,
  deleteUser,
  getAllResources,
  getApiCallCount,
} = require("../db/queries");
const {
  authenticate,
  checkAdmin,
  incrementRequestCount,
} = require("../middleware/auth");
const messages = require('../lang/messages/en/user.js');
const { ROUTES } = require("./route");
require("dotenv").config();

/**
 * @swagger
 * /admin/data:
 *   get:
 *     summary: Get all users
 *     description: Returns all registered users. Requires admin privileges.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: "admin_user"
 *                       email:
 *                         type: string
 *                         example: "admin@example.com"
 *                       isAdmin:
 *                         type: boolean
 *                         example: true
 *                       api_calls:
 *                         type: integer
 *                         example: 20
 *       500:
 *         description: Error fetching data.
 */
router.get(
  ROUTES.ADMIN.USERSDATA,
  authenticate,
  checkAdmin,
  incrementRequestCount,
  (req, res) => {
    fetchAllUsers((err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: messages.userFetchError, error: err.message });
      }

      // Fetch API call count for each user
      const usersWithApiCalls = [];

      const fetchApiCallsForUsers = () => {
        let usersProcessed = 0;
        
        results.forEach((user, index) => {
          getApiCallCount(user.id, (apiErr, apiResults) => {
            if (apiErr) {
              // Handle the case if there's an error fetching API call count for a user
              return res
                .status(500)
                .json({ message: messages.apiCallFetchError, error: apiErr.message });
            }

            // Add API call count to user
            usersWithApiCalls.push({
              ...user,
              api_calls: apiResults.api_calls, // The API call count
            });

            usersProcessed += 1;

            // Once all users are processed, send the response
            if (usersProcessed === results.length) {
              res.json({
                users: usersWithApiCalls,
                isAdmin: req.user.isAdmin,
              });
            }
          });
        });
      };

      // Start fetching API calls for users
      fetchApiCallsForUsers();
    });
  }
);

/**
 * @swagger
 * /admin/delete/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID. Requires admin privileges.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       500:
 *         description: Error deleting user.
 */
router.delete(
  `${ROUTES.ADMIN.DELETEUSER}/:id`,
  authenticate,
  checkAdmin,
  incrementRequestCount,
  (req, res) => {
    const { id } = req.params;

    deleteUser(id, (err, result) => {
      if (err) {
        return res.status(500).json({ message: messages.userDeletionFailure, error: err.message });
      }
      res.json({ message: messages.userDeletionSuccess });
    });
  }
);

/**
 * @swagger
 * /admin/getresource:
 *   get:
 *     summary: Get all API resource usage
 *     description: Fetches all system API usage data, including the number of requests per endpoint. Requires admin privileges.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of API resource usage.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   method:
 *                     type: string
 *                     example: "POST"
 *                   endpoint:
 *                     type: string
 *                     example: "/api/v1/login"
 *                   requests:
 *                     type: integer
 *                     example: 34
 *       500:
 *         description: Error fetching resources.
 */
router.get(
  ROUTES.ADMIN.GETRESOURCE,
  authenticate,
  checkAdmin,
  incrementRequestCount,
  (req, res) => {
    getAllResources((err, results) => {
      if (err) {
        return res.status(500).json({ message: messages.resourceFetchError, error: err.message });
      }
      res.json({ resources: results });
    });
  }
);

module.exports = router;
