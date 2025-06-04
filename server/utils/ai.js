const messages = require('../lang/messages/en/user.js');
const OpenAI = require("openai").default;
require('dotenv').config()


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calls OpenAI API to generate text based on the provided prompt.
 * @param {string} prompt - The prompt to send to OpenAI.
 * @returns {Promise<string>} - The generated text from OpenAI.
 */
async function generateAiText(prompt) {
    if (!prompt) throw new Error(messages.promptRequired);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            store: false,
            messages: [
                {
                    "role": "user",
                    "content": prompt
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error(messages.generateError, error.message);
        throw new Error(messages.generateError);
    }
}

module.exports = { generateAiText }