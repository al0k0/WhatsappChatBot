// Load environment variables (.env file)
require("dotenv").config();

const axios = require("axios");

// API key from environment
const GROQ_KEY = process.env.GROQ_API_KEY;

// Function to send prompt to AI and get response
async function askAI(prompt) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // return AI reply text
    return res.data.choices[0].message.content.trim();

  } catch (err) {
    // return null if error occurs
    return null;
  }
}

module.exports = askAI;
