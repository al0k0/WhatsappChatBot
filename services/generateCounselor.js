const askAI = require("./aiReply");

async function generateCounselorHelp() {
  const prompt = `
Write a WhatsApp message offering counselor help.

Rules:
- friendly
- supportive
- one sentence
`;

  try {
    const msg = await askAI(prompt);
    return msg.trim();
  } catch {
    return "I can connect you with a counselor if you want guidance.";
  }
}

module.exports = generateCounselorHelp;