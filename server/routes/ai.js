const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { generateAiText } = require("../utils/ai");
const { decrementApiCalls } = require("../db/queries");
const { ROUTES } = require("./route");
const { incrementRequestCount } = require("../middleware/auth");
const messages = require('../lang/messages/en/user.js');

/**
 * @swagger
 * /generate:
 *   post:
 *     summary: Generate AI text
 *     description: Generates text based on user input using AI.
 *     tags:
 *       - AI
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Tell me a fun fact about space."
 *     responses:
 *       200:
 *         description: Returns generated text.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generatedText:
 *                   type: string
 *                   example: "The Sun is 400 times larger than the Moon, but also 400 times farther away!"
 *       400:
 *         description: Prompt is required.
 *       500:
 *         description: Server error.
 */
router.post(
  ROUTES.AI.GENERATE,
  authenticate,
  incrementRequestCount,
  async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: messages.promptRequired });
    }

    try {
      const generatedText = await generateAiText(prompt);
      decrementApiCalls(req.user.id, async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: messages.apiCountDecrementFailure });
        }
        res.json({ generatedText });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
