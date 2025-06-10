const express = require("express");
const router = express.Router();
const {
  updateUser,
  findUserById,
  getApiCallCount,
  addNewStory,
  deleteStory,
  getStoriesForUser,
  setStoryFavoriteStatus,
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

/**
 * @swagger
 * /story:
 *   post:
 *     summary: Add a new story for the authenticated user
 *     description: Creates a story with optional tags.
 *     tags:
 *       - Story
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My Story"
 *               content:
 *                 type: string
 *                 example: "This is the story content."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["adventure", "fun"]
 *     responses:
 *       201:
 *         description: Story created successfully.
 *       400:
 *         description: Missing or invalid fields.
 *       500:
 *         description: Failed to create story.
 */
router.post(
  "/createStory",
  authenticate,
  incrementRequestCount,
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: messages.unauthorizedAccess || "Unauthorized access." });
    }

    const userId = req.user.id;
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: messages.missingFields || "Title and content are required." });
    }

    addNewStory(userId, title, content, tags || [], (err, result) => {
      if (err) {
        return res.status(500).json({ message: messages.storyCreationFailed || "Failed to create story." });
      }
      res.status(201).json({ message: messages.storyCreated || "Story created successfully.", story: result.story, tags: result.tags });
    });
  }
);

/**
 * @swagger
 * /story/{id}:
 *   delete:
 *     summary: Delete a story by ID
 *     description: Deletes a story and its tag associations.
 *     tags:
 *       - Story
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
 *         description: Story deleted successfully.
 *       400:
 *         description: Story not found.
 *       500:
 *         description: Failed to delete story.
 */
router.delete(
  "/deleteStory/:id",
  authenticate,
  incrementRequestCount,
  (req, res) => {
    const storyId = req.params.id;

    deleteStory(storyId, (err, result) => {
      if (err) {
        return res.status(500).json({ message: messages.storyDeletionFailed || "Failed to delete story." });
      }
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: messages.storyNotFound || "Story not found." });
      }
      res.status(200).json({ message: messages.storyDeleted || "Story deleted successfully." });
    });
  }
);

/**
 * @swagger
 * /stories:
 *   get:
 *     summary: Get all stories for the authenticated user
 *     description: Returns all stories created by the user, including tags.
 *     tags:
 *       - Story
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of stories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized.
 */
router.get(
  "/getStories",
  authenticate,
  incrementRequestCount,
  (req, res) => {
    const userId = req.user.id;

    getStoriesForUser(userId, (err, stories) => {
      if (err) {
        return res.status(500).json({ message: messages.failedToFetchStories || "Failed to fetch stories." });
      }
      res.status(200).json(stories);
    });
  }
);

/**
 * @swagger
 * /story/favorite/{id}:
 *   put:
 *     summary: Mark or unmark a story as favorite
 *     description: Updates the favorite status of a story.
 *     tags:
 *       - Story
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
 *               isFavorite:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Favorite status updated.
 *       400:
 *         description: Story not found or invalid request.
 *       500:
 *         description: Failed to update favorite status.
 */
router.put(
  "/favorite/:id",
  authenticate,
  incrementRequestCount,
  (req, res) => {
    const storyId = req.params.id;
    const { isFavorite } = req.body;

    if (typeof isFavorite !== "boolean") {
      return res.status(400).json({ message: messages.invalidFavoriteStatus || "isFavorite must be a boolean." });
    }

    setStoryFavoriteStatus(storyId, isFavorite, (err, result) => {
      if (err) {
        return res.status(500).json({ message: messages.failedToUpdateFavorite || "Failed to update favorite status." });
      }
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: messages.storyNotFound || "Story not found." });
      }
      res.status(200).json({ message: messages.favoriteStatusUpdated || "Favorite status updated." });
    });
  }
);

module.exports = router;
