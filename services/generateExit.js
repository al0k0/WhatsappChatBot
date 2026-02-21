const askAI = require("./aiReply");

async function generateExit() {
  const prompt = `
Write a polite WhatsApp exit message.

User not interested.

Rules:
- respectful
- friendly
- short
`;

  try {
    const msg = await askAI(prompt);
    return msg.trim();
  } catch {
    return "No problem 🙂 Message anytime if you need help.";
  }
}

module.exports = generateExit;