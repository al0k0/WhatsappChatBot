const askAI = require("./aiReply");

async function detectIntent(text) {
  const prompt = `
Classify the intent of this message.

Message: "${text}"

Reply ONLY ONE WORD from below:

ADMISSION → wants to enroll, apply, join, fees
NEGATIVE → not interested, stop, busy, reject
POSITIVE → interested
THANKS → thanks or appreciation
GREETING → hi, hello, hey
CONFUSED → doesn't understand
OTHER → anything else
`;

  try {
    const res = await askAI(prompt);

    return res.trim().toUpperCase();

  } catch {
    return "OTHER";
  }
}

module.exports = detectIntent;